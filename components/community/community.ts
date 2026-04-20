export type CommunitySectionSlug = 'all' | 'share' | 'prayer' | 'youth' | 'notice' | 'other';

export type CommunitySection = {
  slug: CommunitySectionSlug;
  href: string;
  label: string;
  title: string;
  description: string;
  category: string | null;
};

export const communityCategories = ['나눔', '기도', '청년부', '공지', '기타'] as const;

export const communitySections: CommunitySection[] = [
  {
    slug: 'all',
    href: '/community',
    label: '전체',
    title: '전체 커뮤니티',
    description: '커뮤니티의 모든 글을 한 번에 볼 수 있습니다.',
    category: null,
  },
  {
    slug: 'share',
    href: '/community/share',
    label: '나눔',
    title: '나눔 페이지',
    description: '간증, 나눔, 감사, 은혜의 이야기를 함께 나눌 수 있습니다.',
    category: '나눔',
  },
  {
    slug: 'prayer',
    href: '/community/prayer',
    label: '기도',
    title: '기도 페이지',
    description: '기도제목과 중보 요청을 함께 올리고 나눌 수 있습니다.',
    category: '기도',
  },
  {
    slug: 'youth',
    href: '/community/youth',
    label: '청년부',
    title: '청년부 페이지',
    description: '청년부 공지와 소식을 한눈에 확인할 수 있습니다.',
    category: '청년부',
  },
  {
    slug: 'notice',
    href: '/community/notice',
    label: '공지',
    title: '공지 페이지',
    description: '커뮤니티 전체 공지와 안내를 확인할 수 있습니다.',
    category: '공지',
  },
  {
    slug: 'other',
    href: '/community/other',
    label: '기타',
    title: '기타 페이지',
    description: '분류되지 않은 여러 소식을 편하게 올릴 수 있습니다.',
    category: '기타',
  },
] as const;

export const communitySectionHrefBySlug = Object.fromEntries(
  communitySections.map(section => [section.slug, section.href]),
) as Record<CommunitySectionSlug, string>;

export function getCommunitySection(slug: CommunitySectionSlug) {
  return communitySections.find(section => section.slug === slug);
}

export function isCommunitySectionPath(pathname: string, href: string) {
  if (href === '/community') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
