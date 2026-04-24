import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const DATA_FILE_LOCK_TIMEOUT_MS = 3000;
const DATA_FILE_LOCK_STALE_MS = 30000;
const DATA_FILE_LOCK_RETRY_MS = 20;
const TOGETHER_VIEW_FLUSH_DELAY_MS = 1500;
const TOGETHER_VIEW_FLUSH_BATCH_SIZE = 24;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  pinned: boolean;
}

export const SERMON_CATEGORIES = ['주일설교', '오후예배설교', '새벽기도설교'] as const;

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  category: (typeof SERMON_CATEGORIES)[number];
  youtubeId: string;
  description: string;
  thumbnail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'member';
  createdAt: string;
  togetherUploadStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  togetherUploadRequestedAt?: string;
  togetherUploadReviewedAt?: string;
  togetherUploadReviewedBy?: string;
}

export interface AdminActivityLogEntry {
  id: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  summary: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface SliderItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  imagePath: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  order: number;
  active: boolean;
}

export interface ChurchProfile {
  churchName: string;
  pastorName: string;
  pastorRole: string;
  greetingLabel: string;
  greetingTitle: string;
  greetingBody: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
}

export interface WorshipService {
  id: string;
  name: string;
  time: string;
  location: string;
  note: string;
}

export interface WorshipScheduleSection {
  id: string;
  day: string;
  description: string;
  services: WorshipService[];
}

export const NEW_FAMILY_PREFERRED_DEPARTMENTS = ['장년부', '청년부', '학생부'] as const;
export const NEW_FAMILY_REGISTRATION_TYPES = ['새가족 등록', '교적 등록', '정착 상담'] as const;

export interface NewFamilyRegistration {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  detailAddress: string;
  preferredDepartment: (typeof NEW_FAMILY_PREFERRED_DEPARTMENTS)[number];
  registrationType: (typeof NEW_FAMILY_REGISTRATION_TYPES)[number];
  firstVisitDate: string;
  inviterName: string;
  inviterPhone: string;
  prayerRequest: string;
  agreedToContact: boolean;
  status: 'new';
  createdAt: string;
}

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getDataFilePath(filename: string) {
  const filePath = path.resolve(dataDir, filename);

  if (filePath !== dataDir && !filePath.startsWith(`${dataDir}${path.sep}`)) {
    throw new Error('Invalid data file path.');
  }

  return filePath;
}

function getDataLockFilePath(filename: string) {
  return `${getDataFilePath(filename)}.lock`;
}

function withJsonFileLock<T>(filename: string, task: () => T): T {
  ensureDataDir();

  const lockFilePath = getDataLockFilePath(filename);
  const startedAt = Date.now();
  let lockFileDescriptor: number | null = null;

  while (lockFileDescriptor === null) {
    try {
      lockFileDescriptor = fs.openSync(lockFilePath, 'wx');
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'EEXIST'
      ) {
        try {
          const lockStats = fs.statSync(lockFilePath);

          if (Date.now() - lockStats.mtimeMs > DATA_FILE_LOCK_STALE_MS) {
            fs.rmSync(lockFilePath, { force: true });
            continue;
          }
        } catch {
          continue;
        }

        if (Date.now() - startedAt > DATA_FILE_LOCK_TIMEOUT_MS) {
          throw new Error('Data file is busy. Please try again.');
        }

        sleepSync(DATA_FILE_LOCK_RETRY_MS);
        continue;
      }

      throw error;
    }
  }

  try {
    return task();
  } finally {
    fs.closeSync(lockFileDescriptor);
    fs.rmSync(lockFilePath, { force: true });
  }
}

function readJsonFileUnlocked<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = getDataFilePath(filename);

  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function writeJsonFileUnlocked<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = getDataFilePath(filename);
  const tempFilePath = `${filePath}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2)}.tmp`;

  fs.writeFileSync(tempFilePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  fs.renameSync(tempFilePath, filePath);
}

function readJsonFile<T>(filename: string, fallback: T): T {
  const filePath = getDataFilePath(filename);

  if (fs.existsSync(filePath)) {
    return readJsonFileUnlocked(filename, fallback);
  }

  return withJsonFileLock(filename, () => {
    if (!fs.existsSync(filePath)) {
      writeJsonFileUnlocked(filename, fallback);
      return fallback;
    }

    return readJsonFileUnlocked(filename, fallback);
  });
}

function writeJsonFile<T>(filename: string, data: T): void {
  withJsonFileLock(filename, () => {
    writeJsonFileUnlocked(filename, data);
  });
}

export function getAnnouncements(): Announcement[] {
  return readJsonFile<Announcement[]>('announcements.json', []);
}

export function saveAnnouncements(data: Announcement[]): void {
  writeJsonFile('announcements.json', data);
}

export function getSermons(): Sermon[] {
  return readJsonFile<Sermon[]>('sermons.json', []);
}

export function saveSermons(data: Sermon[]): void {
  writeJsonFile('sermons.json', data);
}

export function getUsers(): User[] {
  return readJsonFile<User[]>('users.json', []);
}

export function saveUsers(data: User[]): void {
  writeJsonFile('users.json', data);
}

export function getAdminActivityLogs(): AdminActivityLogEntry[] {
  return readJsonFile<AdminActivityLogEntry[]>('admin-activity-log.json', []);
}

export function saveAdminActivityLogs(data: AdminActivityLogEntry[]): void {
  writeJsonFile('admin-activity-log.json', data);
}

export function getSliderItems(): SliderItem[] {
  return readJsonFile<SliderItem[]>('slider.json', []).sort((a, b) => a.order - b.order);
}

export function saveSliderItems(data: SliderItem[]): void {
  writeJsonFile('slider.json', data);
}

export function getChurchProfile(): ChurchProfile {
  return readJsonFile<ChurchProfile>('church-profile.json', {
    churchName: '함께가는교회',
    pastorName: '황현상',
    pastorRole: '담임목사',
    greetingLabel: '목사 인사말',
    greetingTitle: '밝고 편안한 분위기 속에서 함께 예배하는 교회',
    greetingBody:
      '함께가는교회에 오신 것을 진심으로 환영합니다.\n\n우리 교회는 모든 세대가 함께 예배하고, 서로 사랑하며 일상 속에서 복음을 살아내는 공동체를 꿈꿉니다.\n\n처음 교회를 찾는 분들도 부담 없이 머물 수 있는 따뜻한 공동체가 되도록 늘 준비하겠습니다.',
    slogan: '사랑으로 하나 되어, 일상 속에서 살아가는 교회',
    address: '서울시 도봉구 도당로118 거성학마을아파트상가 2층',
    phone: '02-000-0000',
    email: 'church@example.com',
    mapEmbedUrl:
      'https://www.google.com/maps?q=%EC%84%9C%EC%9A%B8%EC%8B%9C%20%EB%8F%84%EB%B4%89%EA%B5%AC%20%EB%8F%84%EB%8B%B9%EB%A1%9C%20118%20%EA%B1%B0%EC%84%B1%ED%95%99%EB%A7%88%EC%9D%84%EC%95%84%ED%8C%8C%ED%8A%B8%EC%83%81%EA%B0%80%202%EC%B8%B5&output=embed',
    mapDirectionsUrl:
      'https://www.google.com/maps?q=%EC%84%9C%EC%9A%B8%EC%8B%9C%20%EB%8F%84%EB%B4%89%EA%B5%AC%20%EB%8F%84%EB%8B%B9%EB%A1%9C%20118%20%EA%B1%B0%EC%84%B1%ED%95%99%EB%A7%88%EC%9D%84%EC%95%84%ED%8C%8C%ED%8A%B8%EC%83%81%EA%B0%80%202%EC%B8%B5',
  });
}

export function saveChurchProfile(data: ChurchProfile): void {
  writeJsonFile('church-profile.json', data);
}

export function getWorshipSchedule(): WorshipScheduleSection[] {
  return readJsonFile<WorshipScheduleSection[]>('worship-schedule.json', []);
}

export function saveWorshipSchedule(data: WorshipScheduleSection[]): void {
  writeJsonFile('worship-schedule.json', data);
}

export interface TogetherPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  thumbnail: string;
  images: string[];
  views: number;
  hidden?: boolean;
}

export interface TogetherPostsOptions {
  includeHidden?: boolean;
}

let cachedTogetherPosts: TogetherPost[] | null = null;
let togetherViewsDirty = false;
let pendingTogetherViewCount = 0;
let togetherViewFlushTimer: ReturnType<typeof setTimeout> | null = null;

function cloneTogetherPost(post: TogetherPost): TogetherPost {
  return {
    ...post,
    images: [...post.images],
  };
}

function cloneTogetherPosts(posts: TogetherPost[]): TogetherPost[] {
  return posts.map(cloneTogetherPost);
}

function getTogetherPostsStore() {
  if (!cachedTogetherPosts) {
    cachedTogetherPosts = readJsonFile<TogetherPost[]>('together.json', []).map(cloneTogetherPost);
  }

  return cachedTogetherPosts;
}

function clearTogetherViewFlushTimer() {
  if (!togetherViewFlushTimer) {
    return;
  }

  clearTimeout(togetherViewFlushTimer);
  togetherViewFlushTimer = null;
}

function flushTogetherPostViews() {
  if (!togetherViewsDirty) {
    return;
  }

  writeJsonFile('together.json', getTogetherPostsStore());
  togetherViewsDirty = false;
  pendingTogetherViewCount = 0;
}

function scheduleTogetherPostViewFlush() {
  clearTogetherViewFlushTimer();
  togetherViewFlushTimer = setTimeout(() => {
    togetherViewFlushTimer = null;
    flushTogetherPostViews();
  }, TOGETHER_VIEW_FLUSH_DELAY_MS);
  togetherViewFlushTimer.unref?.();
}

export function getTogetherPosts(options?: TogetherPostsOptions): TogetherPost[] {
  const posts = getTogetherPostsStore();
  const includeHidden = options?.includeHidden ?? false;

  return cloneTogetherPosts(includeHidden ? posts : posts.filter(post => !post.hidden));
}

export function saveTogetherPosts(data: TogetherPost[]): void {
  const latestViewsById = new Map(
    getTogetherPostsStore().map(post => [post.id, post.views ?? 0] as const),
  );
  const mergedData = data.map(post => ({
    ...cloneTogetherPost(post),
    views: latestViewsById.get(post.id) ?? post.views ?? 0,
  }));

  clearTogetherViewFlushTimer();
  cachedTogetherPosts = mergedData;
  togetherViewsDirty = false;
  pendingTogetherViewCount = 0;
  writeJsonFile('together.json', mergedData);
}

export function incrementTogetherPostViews(id: string): number | null {
  const posts = getTogetherPostsStore();
  const targetIndex = posts.findIndex(post => post.id === id);

  if (targetIndex < 0 || posts[targetIndex]?.hidden) {
    return null;
  }

  const nextViews = (posts[targetIndex]?.views ?? 0) + 1;
  posts[targetIndex] = {
    ...cloneTogetherPost(posts[targetIndex]),
    views: nextViews,
  };
  togetherViewsDirty = true;
  pendingTogetherViewCount += 1;

  if (pendingTogetherViewCount >= TOGETHER_VIEW_FLUSH_BATCH_SIZE) {
    clearTogetherViewFlushTimer();
    flushTogetherPostViews();
  } else {
    scheduleTogetherPostViewFlush();
  }

  return nextViews;
}

export function getNewFamilyRegistrations(): NewFamilyRegistration[] {
  return readJsonFile<NewFamilyRegistration[]>('new-family-registrations.json', []);
}

export function saveNewFamilyRegistrations(data: NewFamilyRegistration[]): void {
  writeJsonFile('new-family-registrations.json', data);
}
