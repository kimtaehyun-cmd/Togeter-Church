import fs from 'fs';
import path from 'path';
import { workAsyncStorage } from 'next/dist/server/app-render/work-async-storage.external.js';

const dataDir = path.join(process.cwd(), 'data');

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

export interface NewFamilyRegistration {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  detailAddress: string;
  preferredDepartment: '성인교구' | '청년부' | '학생부';
  registrationType: '새가족 등록' | '교적 등록' | '정착 상담';
  firstVisitDate: string;
  inviterName: string;
  inviterPhone: string;
  prayerRequest: string;
  agreedToContact: boolean;
  status: 'new';
  createdAt: string;
}

function readJsonFile<T>(filename: string, fallback: T): T {
  const filePath = path.join(dataDir, filename);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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

function shouldIncludeHiddenTogetherPostsByDefault() {
  const route = workAsyncStorage.getStore()?.route;
  return typeof route === 'string' && route.startsWith('/admin');
}

export function getTogetherPosts(options?: TogetherPostsOptions): TogetherPost[] {
  const posts = readJsonFile<TogetherPost[]>('together.json', []);
  const includeHidden = options?.includeHidden ?? shouldIncludeHiddenTogetherPostsByDefault();

  return includeHidden ? posts : posts.filter(post => !post.hidden);
}

export function saveTogetherPosts(data: TogetherPost[]): void {
  writeJsonFile('together.json', data);
}

export function getNewFamilyRegistrations(): NewFamilyRegistration[] {
  return readJsonFile<NewFamilyRegistration[]>('new-family-registrations.json', []);
}

export function saveNewFamilyRegistrations(data: NewFamilyRegistration[]): void {
  writeJsonFile('new-family-registrations.json', data);
}
