'use server';

import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { aboutSections } from '@/components/about/aboutSections';
import { logAdminActivity } from '@/lib/admin-activity';
import { requireAdmin, requireUser } from '@/lib/auth';
import { normalizeSafeHref, normalizeSafeMapUrl } from '@/lib/safe-url';
import { getAllowedSliderImagePath } from '@/lib/slider-images';
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
import {
  TOGETHER_MAX_IMAGE_COUNT,
  TOGETHER_MAX_IMAGE_SIZE_BYTES,
  TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES,
  formatUploadFileSize,
} from '@/lib/together-upload-policy';
import {
  ensurePathInsideDirectory,
  getUploadsRootDir,
  resolvePublicUploadPath,
  toPublicUploadUrl,
} from '@/lib/upload-storage';
import { canUploadTogether } from '@/lib/user-permissions';

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
  '/admin/access',
  '/admin/announcements',
  '/admin/sermons',
  '/admin/slider',
  '/admin/church',
  '/admin/worship',
  '/admin/together',
  '/admin/new-family',
];

const PUBLIC_UPLOADS_DIR = getUploadsRootDir();
const TOGETHER_UPLOADS_DIR = path.join(PUBLIC_UPLOADS_DIR, 'together');
const TOGETHER_IMAGE_SIGNATURE_MAX_BYTES = 12;

type TogetherImageExtension = 'jpg' | 'png' | 'webp' | 'gif';

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

function detectTogetherImageExtension(buffer: Buffer): TogetherImageExtension | null {
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

function validateTogetherImageSelection(files: File[]) {
  if (files.length === 0) {
    throw new Error('최소 한 장의 사진을 등록해주세요.');
  }

  if (files.length > TOGETHER_MAX_IMAGE_COUNT) {
    throw new Error(`사진은 최대 ${TOGETHER_MAX_IMAGE_COUNT}장까지 업로드할 수 있습니다.`);
  }

  let totalSize = 0;

  for (const file of files) {
    if (file.size <= 0) {
      throw new Error('비어 있는 파일은 업로드할 수 없습니다.');
    }

    if (file.size > TOGETHER_MAX_IMAGE_SIZE_BYTES) {
      throw new Error(
        `각 사진은 ${formatUploadFileSize(TOGETHER_MAX_IMAGE_SIZE_BYTES)} 이하만 업로드할 수 있습니다.`,
      );
    }

    totalSize += file.size;

    if (totalSize > TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES) {
      throw new Error(
        `전체 사진 용량은 ${formatUploadFileSize(TOGETHER_MAX_TOTAL_IMAGE_SIZE_BYTES)}를 넘을 수 없습니다.`,
      );
    }
  }
}

function getTogetherPostUploadDir(postId: string) {
  return ensurePathInsideDirectory(TOGETHER_UPLOADS_DIR, path.join(TOGETHER_UPLOADS_DIR, postId));
}

function buildTogetherImageFileName(index: number, extension: TogetherImageExtension) {
  return `${String(index + 1).padStart(2, '0')}-${randomUUID()}.${extension}`;
}

function buildTogetherTempFilePath(uploadDir: string, index: number) {
  return ensurePathInsideDirectory(
    uploadDir,
    path.join(uploadDir, `.${String(index + 1).padStart(2, '0')}-${randomUUID()}.tmp`),
  );
}

async function streamTogetherImageToTempFile(file: File, tempFilePath: string) {
  const reader = file.stream().getReader();
  const fileHandle = await fs.open(tempFilePath, 'w');
  let bytesWritten = 0;
  let signatureBytes = Buffer.alloc(0);
  let extension: TogetherImageExtension | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = Buffer.from(value);
      bytesWritten += chunk.length;

      if (bytesWritten > TOGETHER_MAX_IMAGE_SIZE_BYTES) {
        throw new Error(
          `각 사진은 ${formatUploadFileSize(TOGETHER_MAX_IMAGE_SIZE_BYTES)} 이하만 업로드할 수 있습니다.`,
        );
      }

      if (signatureBytes.length < TOGETHER_IMAGE_SIGNATURE_MAX_BYTES) {
        const remainingBytes = TOGETHER_IMAGE_SIGNATURE_MAX_BYTES - signatureBytes.length;
        const nextSignatureChunk = chunk.subarray(0, remainingBytes);
        signatureBytes = Buffer.concat([signatureBytes, nextSignatureChunk]);
        extension ??= detectTogetherImageExtension(signatureBytes);

        if (!extension && signatureBytes.length >= TOGETHER_IMAGE_SIGNATURE_MAX_BYTES) {
          throw new Error('JPG, PNG, WEBP, GIF 형식의 이미지 파일만 업로드할 수 있습니다.');
        }
      }

      await fileHandle.write(chunk);
    }

    if (bytesWritten <= 0) {
      throw new Error('비어 있는 파일은 업로드할 수 없습니다.');
    }

    extension ??= detectTogetherImageExtension(signatureBytes);

    if (!extension) {
      throw new Error('JPG, PNG, WEBP, GIF 형식의 이미지 파일만 업로드할 수 있습니다.');
    }

    return extension;
  } finally {
    await fileHandle.close();
    reader.releaseLock();
  }
}

async function saveTogetherImages(postId: string, files: File[]) {
  const uploadDir = getTogetherPostUploadDir(postId);
  const imageUrls: string[] = [];

  validateTogetherImageSelection(files);
  await fs.mkdir(uploadDir, { recursive: true });

  try {
    for (const [index, file] of files.entries()) {
      const tempFilePath = buildTogetherTempFilePath(uploadDir, index);
      let finalFilePath: string | null = null;

      try {
        const extension = await streamTogetherImageToTempFile(file, tempFilePath);
        const fileName = buildTogetherImageFileName(index, extension);
        finalFilePath = ensurePathInsideDirectory(uploadDir, path.join(uploadDir, fileName));
        await fs.rename(tempFilePath, finalFilePath);
      } catch (error) {
        await fs.rm(tempFilePath, { force: true });
        throw error;
      }

      if (!finalFilePath) {
        throw new Error('업로드 파일 경로를 생성할 수 없습니다.');
      }

      imageUrls.push(toPublicUploadUrl(finalFilePath));
    }
  } catch (error) {
    await fs.rm(uploadDir, { recursive: true, force: true });
    throw error;
  }

  return imageUrls;
}

function resolveLocalUploadPath(uploadUrl: string) {
  return resolvePublicUploadPath(uploadUrl);
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
  const admin = await requireAdmin('/admin/announcements');
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
  logAdminActivity({
    actor: admin,
    action: 'announcement.create',
    summary: `공지사항 "${newItem.title}"을 등록했습니다.`,
    targetType: 'announcement',
    targetId: newItem.id,
  });
  revalidatePublicSite();
  revalidateAdmin(['/admin/announcements']);
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const admin = await requireAdmin('/admin/announcements');
  const announcements = getAnnouncements();
  const currentAnnouncement = announcements.find(item => item.id === id);

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

  if (currentAnnouncement) {
    logAdminActivity({
      actor: admin,
      action: 'announcement.update',
      summary: `공지사항 "${currentAnnouncement.title}"을 수정했습니다.`,
      targetType: 'announcement',
      targetId: currentAnnouncement.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/announcements']);
}

export async function deleteAnnouncement(id: string) {
  const admin = await requireAdmin('/admin/announcements');
  const announcements = getAnnouncements();
  const target = announcements.find(item => item.id === id);
  saveAnnouncements(announcements.filter(item => item.id !== id));

  if (target) {
    logAdminActivity({
      actor: admin,
      action: 'announcement.delete',
      summary: `공지사항 "${target.title}"을 삭제했습니다.`,
      targetType: 'announcement',
      targetId: target.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/announcements']);
}

export async function createSermon(formData: FormData) {
  const admin = await requireAdmin('/admin/sermons');
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
  logAdminActivity({
    actor: admin,
    action: 'sermon.create',
    summary: `설교 "${sermon.title}"을 등록했습니다.`,
    targetType: 'sermon',
    targetId: sermon.id,
  });

  revalidatePublicSite();
  revalidateAdmin(['/admin/sermons']);
}

export async function updateSermon(id: string, formData: FormData) {
  const admin = await requireAdmin('/admin/sermons');
  const sermons = getSermons();
  const currentSermon = sermons.find(item => item.id === id);

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

  if (currentSermon) {
    logAdminActivity({
      actor: admin,
      action: 'sermon.update',
      summary: `설교 "${currentSermon.title}"을 수정했습니다.`,
      targetType: 'sermon',
      targetId: currentSermon.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/sermons']);
}

export async function deleteSermon(id: string) {
  const admin = await requireAdmin('/admin/sermons');
  const sermons = getSermons();
  const target = sermons.find(item => item.id === id);
  saveSermons(sermons.filter(item => item.id !== id));

  if (target) {
    logAdminActivity({
      actor: admin,
      action: 'sermon.delete',
      summary: `설교 "${target.title}"을 삭제했습니다.`,
      targetType: 'sermon',
      targetId: target.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/sermons']);
}

export async function createSliderItem(formData: FormData) {
  const admin = await requireAdmin('/admin/slider');
  const sliderItems = getSliderItems();

  const nextItem: SliderItem = {
    id: createId('slide'),
    eyebrow: normalizeText(formData.get('eyebrow')) || 'Main',
    title: normalizeTextarea(formData.get('title')),
    description: normalizeTextarea(formData.get('description')),
    accent: normalizeText(formData.get('accent')) || '#F6EBDC',
    imagePath: getAllowedSliderImagePath(normalizeText(formData.get('imagePath'))),
    primaryLabel: normalizeText(formData.get('primaryLabel')) || '자세히 보기',
    primaryHref: normalizeSafeHref(formData.get('primaryHref'), '/about/church-guide'),
    secondaryLabel: normalizeText(formData.get('secondaryLabel')) || '오시는 길',
    secondaryHref: normalizeSafeHref(formData.get('secondaryHref'), '/about/directions'),
    order: toNumber(formData.get('order'), sliderItems.length + 1),
    active: toBoolean(formData.get('active')),
  };

  if (!nextItem.title || !nextItem.description) {
    return;
  }

  saveSliderItems([...sliderItems, nextItem]);
  logAdminActivity({
    actor: admin,
    action: 'slider.create',
    summary: `메인 슬라이드 "${nextItem.title}"을 추가했습니다.`,
    targetType: 'slider',
    targetId: nextItem.id,
  });
  revalidatePublicSite();
  revalidateAdmin(['/admin/slider']);
}

export async function updateSliderItem(id: string, formData: FormData) {
  const admin = await requireAdmin('/admin/slider');
  const currentItem = getSliderItems().find(item => item.id === id);
  saveSliderItems(
    getSliderItems().map(item =>
      item.id === id
        ? {
            ...item,
            eyebrow: normalizeText(formData.get('eyebrow')) || item.eyebrow,
            title: normalizeTextarea(formData.get('title')) || item.title,
            description: normalizeTextarea(formData.get('description')) || item.description,
            accent: normalizeText(formData.get('accent')) || item.accent,
            imagePath: getAllowedSliderImagePath(
              normalizeText(formData.get('imagePath')) || item.imagePath,
            ),
            primaryLabel: normalizeText(formData.get('primaryLabel')) || item.primaryLabel,
            primaryHref: normalizeSafeHref(formData.get('primaryHref'), item.primaryHref),
            secondaryLabel:
              normalizeText(formData.get('secondaryLabel')) || item.secondaryLabel,
            secondaryHref: normalizeSafeHref(formData.get('secondaryHref'), item.secondaryHref),
            order: toNumber(formData.get('order'), item.order),
            active: toBoolean(formData.get('active')),
          }
        : item,
    ),
  );

  if (currentItem) {
    logAdminActivity({
      actor: admin,
      action: 'slider.update',
      summary: `메인 슬라이드 "${currentItem.title}"을 수정했습니다.`,
      targetType: 'slider',
      targetId: currentItem.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/slider']);
}

export async function deleteSliderItem(id: string) {
  const admin = await requireAdmin('/admin/slider');
  const sliderItems = getSliderItems();
  const target = sliderItems.find(item => item.id === id);
  saveSliderItems(sliderItems.filter(item => item.id !== id));

  if (target) {
    logAdminActivity({
      actor: admin,
      action: 'slider.delete',
      summary: `메인 슬라이드 "${target.title}"을 삭제했습니다.`,
      targetType: 'slider',
      targetId: target.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/slider']);
}

export async function updateChurchProfile(formData: FormData) {
  const admin = await requireAdmin('/admin/church');
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
    mapEmbedUrl: normalizeSafeMapUrl(formData.get('mapEmbedUrl'), current.mapEmbedUrl),
    mapDirectionsUrl: normalizeSafeMapUrl(
      formData.get('mapDirectionsUrl'),
      current.mapDirectionsUrl,
    ),
  };

  saveChurchProfile(nextProfile);
  logAdminActivity({
    actor: admin,
    action: 'church.update',
    summary: '교회 소개 정보를 수정했습니다.',
    targetType: 'church-profile',
    targetId: nextProfile.churchName,
  });
  revalidatePublicSite();
  revalidateAdmin(['/admin/church']);
}

export async function updateWorshipSchedule(formData: FormData) {
  const admin = await requireAdmin('/admin/worship');
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
  logAdminActivity({
    actor: admin,
    action: 'worship.bulk-update',
    summary: '예배 시간표 전체 구성을 수정했습니다.',
    targetType: 'worship-schedule',
    targetId: 'bulk',
  });
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
  const admin = await requireAdmin('/admin/worship');
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
  logAdminActivity({
    actor: admin,
    action: 'worship.section.create',
    summary: `예배 섹션 "${nextSection.day}"을 추가했습니다.`,
    targetType: 'worship-section',
    targetId: nextSection.id,
  });
  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

export async function updateWorshipSection(id: string, formData: FormData) {
  const admin = await requireAdmin('/admin/worship');
  const schedule = getWorshipSchedule();
  const currentSection = schedule.find(section => section.id === id);

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

  if (currentSection) {
    logAdminActivity({
      actor: admin,
      action: 'worship.section.update',
      summary: `예배 섹션 "${currentSection.day}"을 수정했습니다.`,
      targetType: 'worship-section',
      targetId: currentSection.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

export async function deleteWorshipSection(id: string) {
  const admin = await requireAdmin('/admin/worship');
  const schedule = getWorshipSchedule();
  const target = schedule.find(section => section.id === id);
  saveWorshipSchedule(schedule.filter(section => section.id !== id));

  if (target) {
    logAdminActivity({
      actor: admin,
      action: 'worship.section.delete',
      summary: `예배 섹션 "${target.day}"을 삭제했습니다.`,
      targetType: 'worship-section',
      targetId: target.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/worship']);
}

export async function createTogetherPost(formData: FormData) {
  const user = await requireUser('/together/upload');

  if (!canUploadTogether(user)) {
    throw new Error('함께함 글 등록 권한이 없습니다. 관리자에게 권한을 요청해 주세요.');
  }

  const title = normalizeText(formData.get('title'));
  const content = normalizeTextarea(formData.get('content'));
  const authorInput = normalizeText(formData.get('author'));

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요.');
  }

  const files = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File);
  const postId = createId('together');
  const imageUrls = await saveTogetherImages(postId, files);
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
  const admin = await requireAdmin('/admin/together');
  const posts = getTogetherPosts({ includeHidden: true });
  const targetPost = posts.find(post => post.id === id);

  if (!targetPost) {
    revalidatePublicSite();
    revalidateAdmin(['/admin/together']);
    redirect('/admin/together?status=warning&message=%EC%9D%B4%EB%AF%B8%20%EC%82%AD%EC%A0%9C%EB%90%98%EC%97%88%EA%B1%B0%EB%82%98%20%EC%A1%B4%EC%9E%AC%ED%95%98%EC%A7%80%20%EC%95%8A%EB%8A%94%20%EA%B2%8C%EC%8B%9C%EA%B8%80%EC%9E%85%EB%8B%88%EB%8B%A4.');
  }

  saveTogetherPosts(posts.filter(post => post.id !== id));
  logAdminActivity({
    actor: admin,
    action: 'together.delete',
    summary: `함께함 게시글 "${targetPost.title}"을 삭제했습니다.`,
    targetType: 'together-post',
    targetId: targetPost.id,
  });

  try {
    await cleanupTogetherPostFiles(targetPost);
  } catch (error) {
    console.error('Failed to clean together post files', {
      postId: targetPost.id,
      error,
    });

    revalidatePublicSite();
    revalidateAdmin(['/admin/together']);
    redirect(
      `/admin/together?status=warning&message=${encodeURIComponent(
        `"${targetPost.title}" 게시글은 삭제했지만 일부 파일 정리에 실패했습니다. 서버 업로드 폴더를 확인해 주세요.`,
      )}`,
    );
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
  redirect(
    `/admin/together?status=success&message=${encodeURIComponent(
      `"${targetPost.title}" 게시글을 삭제했습니다.`,
    )}`,
  );
}

export async function toggleTogetherVisibility(id: string) {
  const admin = await requireAdmin('/admin/together');
  const posts = getTogetherPosts({ includeHidden: true });
  const targetPost = posts.find(post => post.id === id);
  const nextHidden = targetPost ? !targetPost.hidden : false;
  saveTogetherPosts(
    posts.map(post => (post.id === id ? { ...post, hidden: !post.hidden } : post)),
  );

  if (targetPost) {
    logAdminActivity({
      actor: admin,
      action: 'together.visibility.toggle',
      summary: `함께함 게시글 "${targetPost.title}"을 ${nextHidden ? '숨김' : '공개'} 처리했습니다.`,
      targetType: 'together-post',
      targetId: targetPost.id,
    });
  }

  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
}

export async function deleteNewFamilyRegistration(id: string) {
  const admin = await requireAdmin('/admin/new-family');
  const registrations = getNewFamilyRegistrations();
  const target = registrations.find(registration => registration.id === id);
  saveNewFamilyRegistrations(registrations.filter(r => r.id !== id));

  if (target) {
    logAdminActivity({
      actor: admin,
      action: 'new-family.delete',
      summary: `새가족 등록 "${target.name}" 기록을 삭제했습니다.`,
      targetType: 'new-family-registration',
      targetId: target.id,
    });
  }

  revalidateAdmin(['/admin/new-family']);
}
