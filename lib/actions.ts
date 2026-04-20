'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { aboutSections } from '@/components/about/aboutSections';
import { communitySections } from '@/components/community/community';
import { requireAdmin, requireUser } from '@/lib/auth';
import {
  type Announcement,
  type ChurchProfile,
  type Post,
  type Sermon,
  type SliderItem,
  type WorshipScheduleSection,
  type WorshipService,
  SERMON_CATEGORIES,
  getAnnouncements,
  getChurchProfile,
  getPosts,
  getSermons,
  getSliderItems,
  getTogetherPosts,
  getWorshipSchedule,
  getNewFamilyRegistrations,
  saveAnnouncements,
  saveChurchProfile,
  savePosts,
  saveSermons,
  saveSliderItems,
  saveTogetherPosts,
  saveWorshipSchedule,
  saveNewFamilyRegistrations,
  type TogetherPost,
} from '@/lib/data';
import fs from 'fs/promises';
import path from 'path';

const PUBLIC_PATHS = [
  '/',
  '/news',
  '/sermons',
  '/worship',
  '/new-family',
  ...aboutSections.map(section => section.href),
  ...communitySections.map(section => section.href),
];

const ADMIN_PATHS = [
  '/admin',
  '/admin/announcements',
  '/admin/sermons',
  '/admin/slider',
  '/admin/church',
  '/admin/posts',
  '/admin/worship',
  '/admin/together',
  '/admin/new-family',
];

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

function normalizePostCategory(value: FormDataEntryValue | null): string {
  const category = normalizeText(value);
  const matchedSection = communitySections.find(section => section.category === category);
  return matchedSection?.category ?? category;
}

function getCommunityRedirectPath(category: string): string {
  return communitySections.find(section => section.category === category)?.href ?? '/community';
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

export async function createPost(formData: FormData) {
  const user = await requireUser('/community/write');
  const title = normalizeText(formData.get('title'));
  const content = normalizeTextarea(formData.get('content'));
  const category = normalizePostCategory(formData.get('category'));

  if (!title || !content || !category) {
    redirect('/community/write');
  }

  const posts = getPosts({ includeHidden: true });
  const nextPost: Post = {
    id: createId('post'),
    title,
    author: user.name,
    content,
    category,
    date: new Date().toISOString().slice(0, 10),
    likes: 0,
    comments: 0,
    hidden: false,
  };

  savePosts([nextPost, ...posts]);
  revalidatePublicSite();
  revalidateAdmin(['/admin/posts']);
  redirect(getCommunityRedirectPath(category));
}

export async function deletePost(id: string) {
  await requireAdmin('/admin/posts');
  savePosts(getPosts({ includeHidden: true }).filter(item => item.id !== id));
  revalidatePublicSite();
  revalidateAdmin(['/admin/posts']);
}

export async function togglePostVisibility(id: string) {
  await requireAdmin('/admin/posts');
  savePosts(
    getPosts({ includeHidden: true }).map(item =>
      item.id === id ? { ...item, hidden: !item.hidden } : item,
    ),
  );

  revalidatePublicSite();
  revalidateAdmin(['/admin/posts']);
}

export async function createTogetherPost(formData: FormData) {
  const user = await requireUser('/together/upload');
  const title = normalizeText(formData.get('title'));
  const content = normalizeTextarea(formData.get('content'));
  const authorInput = normalizeText(formData.get('author'));
  
  const files = formData.getAll('images') as File[];
  const imageUrls: string[] = [];

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  for (const file of files) {
    if (file.size === 0 || !file.name) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    imageUrls.push(`/uploads/${fileName}`);
  }

  if (!title || !content || imageUrls.length === 0) {
    throw new Error('제목, 내용, 그리고 최소 한 장의 사진을 등록해주세요.');
  }

  const posts = getTogetherPosts();
  const newPost: TogetherPost = {
    id: (posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id))) + 1 : 1).toString(),
    title,
    content,
    author: authorInput || user.name || '성도',
    date: new Date().toISOString().slice(0, 10),
    thumbnail: imageUrls[0],
    images: imageUrls,
    views: 0,
    hidden: false,
  };

  posts.unshift(newPost);
  saveTogetherPosts(posts);

  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
  redirect('/together');
}

export async function deleteTogetherPost(id: string) {
  await requireAdmin('/admin/together');
  const posts = getTogetherPosts();
  saveTogetherPosts(posts.filter(p => p.id !== id));
  revalidatePublicSite();
  revalidateAdmin(['/admin/together']);
}

export async function toggleTogetherVisibility(id: string) {
  await requireAdmin('/admin/together');
  const posts = getTogetherPosts();
  saveTogetherPosts(
    posts.map(p => p.id === id ? { ...p, hidden: !p.hidden } : p)
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
