'use server';

import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { aboutSections } from '@/components/about/aboutSections';
import { requireAdmin, requireUser } from '@/lib/auth';
import {
  type Announcement,
  type ChurchProfile,
  type Sermon,
  type SliderItem,
  type WorshipScheduleSection,
  type WorshipService,
  SERMON_CATEGORIES,
  getAnnouncements,
  getChurchProfile,
  getSermons,
  getSliderItems,
  getTogetherPosts,
  getWorshipSchedule,
  getNewFamilyRegistrations,
  saveAnnouncements,
  saveChurchProfile,
  saveSermons,
  saveSliderItems,
  saveTogetherPosts,
  saveWorshipSchedule,
  saveNewFamilyRegistrations,
  type TogetherPost,
} from '@/lib/data';

const PUBLIC_PATHS = [
  '/',
  '/news',
  '/sermons',
  '/worship',
  '/new-family',
  ...aboutSections.map(section => section.href),
];

const ADMIN_PATHS = [
  '/admin',
  '/admin/announcements',
  '/admin/sermons',
  '/admin/slider',
  '/admin/church',
  '/admin/worship',
  '/admin/together',
  '/admin/new-family',
];

const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const TOGETHER_UPLOADS_DIR = path.join(PUBLIC_UPLOADS_DIR, 'together');
const TOGETHER_MAX_IMAGE_COUNT = 10;
const TOGETHER_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES = 30 * 1024 * 1024;

type TogetherPreparedImage = {
  buffer: Buffer;
  extension: 'jpg' | 'png' | 'webp' | 'gif';
};

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

function normalizeTextarea(value: FormDataEntryValue | null): string {
  return String(value ?? '').replace(/\r\n/g, '\n').trim();
}

function toBoolean(value: FormDataEntryValue | null): boolean {
  return value === 'true' || value === 'on';
}

function toNumber(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDateString(value: FormDataEntryValue | null): string {
  const normalized = normalizeText(value);
  return normalized || new Date().toISOString().slice(0, 10);
}

function toAnnouncementList(items: Announcement[]): Announcement[] {
  return [...items].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return right.date.localeCompare(left.date);
  });
}

function normalizeYoutubeId(value: FormDataEntryValue | null): string {
  const input = normalizeText(value);

  if (!input) {
    return '';
  }

  if (!input.includes('http')) {
    return input;
  }

  try {
    const url = new URL(input);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }

    if (url.searchParams.get('v')) {
      return url.searchParams.get('v') ?? '';
    }

    const parts = url.pathname.split('/');
    return parts[parts.length - 1] ?? '';
  } catch {
    return input;
  }
}

function normalizeSermonCategory(value: FormDataEntryValue | null): Sermon['category'] {
  const category = normalizeText(value) as Sermon['category'];
  return SERMON_CATEGORIES.includes(category) ? category : SERMON_CATEGORIES[0];
}

function revalidateMany(paths: string[]) {
  for (const path of new Set(paths)) {
    revalidatePath(path);
  }
}

function revalidatePublicSite() {
  revalidateMany(PUBLIC_PATHS);
}

function revalidateAdmin(paths: string[] = []) {
  revalidateMany([...ADMIN_PATHS, ...paths]);
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)}${units[unitIndex]}`;
}

function ensurePathInsideDirectory(rootDir: string, targetPath: string) {
  const normalizedRoot = path.resolve(rootDir);
  const normalizedTarget = path.resolve(targetPath);

  if (
    normalizedTarget !== normalizedRoot &&
    !normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`)
  ) {
    throw new Error('안전하지 않은 파일 경로가 감지되었습니다.');
  }

  return normalizedTarget;
}

function isJpeg(buffer: Buffer) {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function isPng(buffer: Buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

function isGif(buffer: Buffer) {
  if (buffer.length < 6) {
    return false;
  }

  const signature = buffer.subarray(0, 6).toString('ascii');
  return signature === 'GIF87a' || signature === 'GIF89a';
}

function isWebp(buffer: Buffer) {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}

function detectTogetherImageExtension(buffer: Buffer): TogetherPreparedImage['extension'] | null {
  if (isJpeg(buffer)) {
    return 'jpg';
  }

  if (isPng(buffer)) {
    return 'png';
  }

  if (isWebp(buffer)) {
    return 'webp';
  }

  if (isGif(buffer)) {
    return 'gif';
  }

  return null;
}

async function prepareTogetherImages(files: File[]): Promise<TogetherPreparedImage[]> {
  if (files.length === 0) {
    throw new Error('최소 한 장의 사진을 등록해주세요.');
  }

  if (files.length > TOGETHER_MAX_IMAGE_COUNT) {
    throw new Error(`사진은 최대 ${TOGETHER_MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`);
  }

  let totalSize = 0;
  const preparedImages: TogetherPreparedImage[] = [];

  for (const file of files) {
    if (file.size <= 0) {
      throw new Error('비어 있는 파일은 업로드할 수 없습니다.');
    }

    if (file.size > TOGETHER_MAX_IMAGE_SIZE_BYTES) {
      throw new Error(
        `각 사진은 ${formatFileSize(TOGETHER_MAX_IMAGE_SIZE_BYTES)} 이하만 업로드할 수 있습니다.`,
      );
    }

    totalSize += file.size;

    if (totalSize > TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES) {
      throw new Error(
        `전체 사진 용량은 ${formatFileSize(TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES)}를 넘을 수 없습니다.`,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = detectTogetherImageExtension(buffer);

    if (!extension) {
      throw new Error('JPG, PNG, WEBP, GIF 형식의 이미지 파일만 업로드할 수 있습니다.');
    }

    preparedImages.push({ buffer, extension });
  }

  return preparedImages;
}

function getTogetherPostUploadDir(postId: string) {
  return ensurePathInsideDirectory(TOGETHER_UPLOADS_DIR, path.join(TOGETHER_UPLOADS_DIR, postId));
}

function buildTogetherImageFileName(index: number, extension: TogetherPreparedImage['extension']) {
  return `${String(index + 1).padStart(2, '0')}-${randomUUID()}.${extension}`;
}

function toPublicUploadUrl(filePath: string) {
  const publicDir = path.join(process.cwd(), 'public');
  const normalizedFilePath = ensurePathInsideDirectory(publicDir, filePath);
  const relativePath = path.relative(publicDir, normalizedFilePath);

  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('공개 업로드 경로를 생성할 수 없습니다.');
  }

  return `/${relativePath.split(path.sep).join('/')}`;
}

async function saveTogetherImages(postId: string, images: TogetherPreparedImage[]) {
  const uploadDir = getTogetherPostUploadDir(postId);
  const imageUrls: string[] = [];

  await fs.mkdir(uploadDir, { recursive: true });

  try {
    for (const [index, image] of images.entries()) {
      const fileName = buildTogetherImageFileName(index, image.extension);
      const filePath = ensurePathInsideDirectory(uploadDir, path.join(uploadDir, fileName));

      await fs.writeFile(filePath, image.buffer);
      imageUrls.push(toPublicUploadUrl(filePath));
    }
  } catch (error) {
    await fs.rm(uploadDir, { recursive: true, force: true });
    throw error;
  }

  return imageUrls;
}

function resolveLocalUploadPath(uploadUrl: string) {
  if (!uploadUrl.startsWith('/uploads/')) {
    return null;
  }

  const pathname = uploadUrl.split('?')[0];
  const relativeSegments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  const targetPath = path.join(process.cwd(), 'public', ...relativeSegments);

  return ensurePathInsideDirectory(PUBLIC_UPLOADS_DIR, targetPath);
}

async function cleanupTogetherPostFiles(post: TogetherPost) {
  const dedicatedUploadDir = getTogetherPostUploadDir(post.id);
  await fs.rm(dedicatedUploadDir, { recursive: true, force: true });

  const localUploadPaths = new Set(
    [post.thumbnail, ...post.images]
      .map(resolveLocalUploadPath)
      .filter((filePath): filePath is string => Boolean(filePath))
      .filter(filePath => !filePath.startsWith(`${dedicatedUploadDir}${path.sep}`)),
  );

  for (const filePath of localUploadPaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      if (code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin('/admin/announcements');
  const title = normalizeText(formData.get('title'));
  const category = normalizeText(formData.get('category'));
  const content = normalizeTextarea(formData.get('content'));

  if (!title || !category || !content) {
    return;
  }

  const announcements = getAnnouncements();
  const newItem: Announcement = {
    id: createId('announcement'),
    title,
    category,
    content,
    date: new Date().toISOString().slice(0, 10),
    pinned: toBoolean(formData.get('pinned')),
  };

  saveAnnouncements(toAnnouncementList([newItem, ...announcements]));
  revalidatePublicSite();
  revalidateAdmin(['/admin/announcements']);
}

export async function updateAnnouncement(id: string, formData: FormData) {
  await requireAdmin('/admin/announcements');
  const announcements = getAnnouncements();

  saveAnnouncements(
    toAnnouncementList(
      announcements.map(item =>
        item.id === id
          ? {
              ...item,
              title: normalizeText(formData.get('title')) || item.title,
              category: normalizeText(formData.get('category')) || item.category,
              content: normalizeTextarea(formData.get('content')) || item.content,
              pinned: toBoolean(formData.get('pinned')),
            }
          : item,
      ),
    ),
  );

  revalidatePublicSite();
  revalidateAdmin(['/admin/announcements']);
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin('/admin/announcements');
  saveAnnouncements(getAnnouncements().filter(item => item.id !== id));
  revalidatePublicSite();
  revalidateAdmin(['/admin/announcements']);
}

export async function createSermon(formData: FormData) {
  await requireAdmin('/admin/sermons');
  const title = normalizeText(formData.get('title'));
  const preacher = normalizeText(formData.get('preacher'));
  const description = normalizeTextarea(formData.get('description'));

  if (!title || !preacher) {
    return;
  }

  const sermons = getSermons();
  const sermon: Sermon = {
    id: createId('sermon'),
    title,
    preacher,
    description,
    date: toDateString(formData.get('date')),
    category: normalizeSermonCategory(formData.get('category')),
    youtubeId: normalizeYoutubeId(formData.get('youtubeId')),
    thumbnail: normalizeText(formData.get('thumbnail')),
  };

  saveSermons(
    [sermon, ...sermons].sort((left, right) => right.date.localeCompare(left.date)),
  );

  revalidatePublicSite();
  revalidateAdmin(['/admin/sermons']);
}

export async function updateSermon(id: string, formData: FormData) {
  await requireAdmin('/admin/sermons');
  const sermons = getSermons();

  saveSermons(
    sermons
      .map(item =>
        item.id === id
          ? {
              ...item,
              title: normalizeText(formData.get('title')) || item.title,
              preacher: normalizeText(formData.get('preacher')) || item.preacher,
              description: normalizeTextarea(formData.get('description')) || item.description,
              date: toDateString(formData.get('date')),
              category: normalizeSermonCategory(formData.get('category')),
              youtubeId: normalizeYoutubeId(formData.get('youtubeId')),
              thumbnail: normalizeText(formData.get('thumbnail')) || item.thumbnail,
            }
          : item,
      )
      .sort((left, right) => right.date.localeCompare(left.date)),
  );

  revalidatePublicSite();
  revalidateAdmin(['/admin/sermons']);
}

export async function deleteSermon(id: string) {
  await requireAdmin('/admin/sermons');
  saveSermons(getSermons().filter(item => item.id !== id));
  revalidatePublicSite();
  revalidateAdmin(['/admin/sermons']);
}

export async function createSliderItem(formData: FormData) {
  await requireAdmin('/admin/slider');
  const sliderItems = getSliderItems();

  const nextItem: SliderItem = {
    id: createId('slide'),
    eyebrow: normalizeText(formData.get('eyebrow')) || 'Main',
    title: normalizeTextarea(formData.get('title')),
    description: normalizeTextarea(formData.get('description')),
    accent: normalizeText(formData.get('accent')) || '#F6EBDC',
    imagePath: normalizeText(formData.get('imagePath')) || '/image/church-background.png',
    primaryLabel: normalizeText(formData.get('primaryLabel')) || '자세히 보기',
    primaryHref: normalizeText(formData.get('primaryHref')) || '/about/church-guide',
    secondaryLabel: normalizeText(formData.get('secondaryLabel')) || '오시는 길',
    secondaryHref: normalizeText(formData.get('secondaryHref')) || '/about/directions',
    order: toNumber(formData.get('order'), sliderItems.length + 1),
    active: toBoolean(formData.get('active')),
  };

  if (!nextItem.title || !nextItem.description) {
    return;
  }

  saveSliderItems([...sliderItems, nextItem]);
  revalidatePublicSite();
  revalidateAdmin(['/admin/slider']);
}

export async function updateSliderItem(id: string, formData: FormData) {
  await requireAdmin('/admin/slider');
  saveSliderItems(
    getSliderItems().map(item =>
      item.id === id
        ? {
            ...item,
            eyebrow: normalizeText(formData.get('eyebrow')) || item.eyebrow,
            title: normalizeTextarea(formData.get('title')) || item.title,
            description: normalizeTextarea(formData.get('description')) || item.description,
            accent: normalizeText(formData.get('accent')) || item.accent,
            imagePath: normalizeText(formData.get('imagePath')) || item.imagePath,
            primaryLabel: normalizeText(formData.get('primaryLabel')) || item.primaryLabel,
            primaryHref: normalizeText(formData.get('primaryHref')) || item.primaryHref,
            secondaryLabel:
              normalizeText(formData.get('secondaryLabel')) || item.secondaryLabel,
            secondaryHref: normalizeText(formData.get('secondaryHref')) || item.secondaryHref,
            order: toNumber(formData.get('order'), item.order),
            active: toBoolean(formData.get('active')),
          }
        : item,
    ),
  );

  revalidatePublicSite();
  revalidateAdmin(['/admin/slider']);
}

export async function deleteSliderItem(id: string) {
  await requireAdmin('/admin/slider');
  saveSliderItems(getSliderItems().filter(item => item.id !== id));
  revalidatePublicSite();
  revalidateAdmin(['/admin/slider']);
}

export async function updateChurchProfile(formData: FormData) {
  await requireAdmin('/admin/church');
  const current = getChurchProfile();
  const nextProfile: ChurchProfile = {
    churchName: normalizeText(formData.get('churchName')) || current.churchName,
    pastorName: normalizeText(formData.get('pastorName')) || current.pastorName,
    pastorRole: normalizeText(formData.get('pastorRole')) || current.pastorRole,
    greetingLabel: normalizeText(formData.get('greetingLabel')) || current.greetingLabel,
    greetingTitle: normalizeTextarea(formData.get('greetingTitle')) || current.greetingTitle,
    greetingBody: normalizeTextarea(formData.get('greetingBody')) || current.greetingBody,
    slogan: normalizeTextarea(formData.get('slogan')) || current.slogan,
    address: normalizeTextarea(formData.get('address')) || current.address,
    phone: normalizeText(formData.get('phone')) || current.phone,
    email: normalizeText(formData.get('email')) || current.email,
    mapEmbedUrl: normalizeTextarea(formData.get('mapEmbedUrl')) || current.mapEmbedUrl,
    mapDirectionsUrl:
      normalizeTextarea(formData.get('mapDirectionsUrl')) || current.mapDirectionsUrl,
  };

  saveChurchProfile(nextProfile);
  revalidatePublicSite();
  revalidateAdmin(['/admin/church']);
}

export async function updateWorshipSchedule(formData: FormData) {
  await requireAdmin('/admin/worship');
  const sectionIds = formData.getAll('sectionId').map(value => normalizeText(value));
  const sectionDays = formData.getAll('sectionDay').map(value => normalizeText(value));
  const sectionDescriptions = formData
    .getAll('sectionDescription')
    .map(value => normalizeTextarea(value));
  const serviceSectionIds = formData
    .getAll('serviceSectionId')
    .map(value => normalizeText(value));
  const serviceIds = formData.getAll('serviceId').map(value => normalizeText(value));
  const serviceNames = formData.getAll('serviceName').map(value => normalizeText(value));
  const serviceTimes = formData.getAll('serviceTime').map(value => normalizeText(value));
  const serviceLocations = formData
    .getAll('serviceLocation')
    .map(value => normalizeText(value));
  const serviceNotes = formData.getAll('serviceNote').map(value => normalizeText(value));

  const sections: WorshipScheduleSection[] = sectionIds
    .map((id, index) => ({
      id: id || createId(`worship-section-${index + 1}`),
      day: sectionDays[index] ?? '',
      description: sectionDescriptions[index] ?? '',
      services: [],
    }))
    .filter(section => section.day || section.description);

  const servicesBySection = new Map<string, WorshipService[]>(
    sections.map(section => [section.id, []]),
  );

  serviceIds.forEach((id, index) => {
    const sectionId = serviceSectionIds[index];
    const name = serviceNames[index];
    const time = serviceTimes[index];
    const location = serviceLocations[index];
    const note = serviceNotes[index];

    if (!sectionId || !name || !time) {
      return;
    }

    const nextService: WorshipService = {
      id: id || createId(`worship-service-${index + 1}`),
      name,
      time,
      location,
      note,
    };

    const bucket = servicesBySection.get(sectionId);
    if (bucket) {
      bucket.push(nextService);
    }
  });

  const nextSchedule = sections.map(section => ({
    ...section,
    services: servicesBySection.get(section.id) ?? [],
  }));

  saveWorshipSchedule(nextSchedule);
  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

function parseServicesTextarea(value: FormDataEntryValue | null): WorshipService[] {
  return normalizeTextarea(value)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name = '', time = '', location = '', note = ''] = line
        .split('|')
        .map(part => part.trim());

      return {
        id: createId(`worship-service-${index + 1}`),
        name,
        time,
        location,
        note,
      };
    })
    .filter(service => service.name && service.time);
}

export async function createWorshipSection(formData: FormData) {
  await requireAdmin('/admin/worship');
  const day = normalizeText(formData.get('day'));
  const description = normalizeTextarea(formData.get('description'));
  const services = parseServicesTextarea(formData.get('services'));

  if (!day) {
    return;
  }

  const schedule = getWorshipSchedule();
  const nextSection: WorshipScheduleSection = {
    id: createId('worship-section'),
    day,
    description,
    services,
  };

  saveWorshipSchedule([...schedule, nextSection]);
  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

export async function updateWorshipSection(id: string, formData: FormData) {
  await requireAdmin('/admin/worship');
  const schedule = getWorshipSchedule();

  saveWorshipSchedule(
    schedule.map(section =>
      section.id === id
        ? {
            ...section,
            day: normalizeText(formData.get('day')) || section.day,
            description:
              normalizeTextarea(formData.get('description')) || section.description,
            services: parseServicesTextarea(formData.get('services')),
          }
        : section,
    ),
  );

  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

export async function deleteWorshipSection(id: string) {
  await requireAdmin('/admin/worship');
  saveWorshipSchedule(getWorshipSchedule().filter(section => section.id !== id));
  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

export async function createTogetherPost(formData: FormData) {
  const user = await requireUser('/together/upload');
  const title = normalizeText(formData.get('title'));
  const content = normalizeTextarea(formData.get('content'));
  const authorInput = normalizeText(formData.get('author'));

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요.');
  }

  const files = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File);
  const preparedImages = await prepareTogetherImages(files);
  const postId = createId('together');
  const imageUrls = await saveTogetherImages(postId, preparedImages);
  const posts = getTogetherPosts({ includeHidden: true });
  const newPost: TogetherPost = {
    id: postId,
    title,
    content,
    author: authorInput || user.name || '성도',
    date: new Date().toISOString().slice(0, 10),
    thumbnail: imageUrls[0],
    images: imageUrls,
    views: 0,
    hidden: false,
  };

  try {
    saveTogetherPosts([newPost, ...posts]);
  } catch (error) {
    await fs.rm(getTogetherPostUploadDir(postId), { recursive: true, force: true });
    throw error;
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
  redirect('/together');
}

export async function deleteTogetherPost(id: string) {
  await requireAdmin('/admin/together');
  const posts = getTogetherPosts({ includeHidden: true });
  const targetPost = posts.find(post => post.id === id);

  if (!targetPost) {
    revalidatePublicSite();
    revalidateAdmin(['/admin/together']);
    return;
  }

  saveTogetherPosts(posts.filter(post => post.id !== id));

  try {
    await cleanupTogetherPostFiles(targetPost);
  } catch (error) {
    console.error('Failed to clean together post files', {
      postId: targetPost.id,
      error,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
}

export async function toggleTogetherVisibility(id: string) {
  await requireAdmin('/admin/together');
  const posts = getTogetherPosts({ includeHidden: true });
  saveTogetherPosts(
    posts.map(post => (post.id === id ? { ...post, hidden: !post.hidden } : post)),
  );
  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
}

export async function deleteNewFamilyRegistration(id: string) {
  await requireAdmin('/admin/new-family');
  const registrations = getNewFamilyRegistrations();
  saveNewFamilyRegistrations(registrations.filter(r => r.id !== id));
  revalidateAdmin(['/admin/new-family']);
}
