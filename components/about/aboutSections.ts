export const aboutSections = [
  {
    slug: 'church-guide',
    href: '/about/church-guide',
    label: '교회안내',
    title: '교회안내',
    description: '교회 소개, 인사말, 핵심 가치, 첫 방문 안내를 한 번에 확인할 수 있습니다.',
  },
  {
    slug: 'worship-times',
    href: '/about/worship-times',
    label: '예배시간',
    title: '예배시간',
    description: '주일예배, 오후예배, 새벽기도 등 예배 시간을 한눈에 볼 수 있습니다.',
  },
  {
    slug: 'directions',
    href: '/about/directions',
    label: '오시는길',
    title: '오시는길',
    description: '서울시 도봉구 도당로118 거성학마을아파트상가 2층 위치를 안내합니다.',
  },
] as const;

export type AboutSection = (typeof aboutSections)[number];
