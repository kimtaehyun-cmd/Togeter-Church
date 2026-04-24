import sanctuaryPhoto from '@/image/church-background.webp';
import heroSlide2Photo from '@/image/main_3.webp';
import heroSlide3Photo from '@/image/main_4.webp';
import communityPhoto from '@/image/sub_1.webp';
import coreValue1Photo from '@/image/sub_2.webp';
import coreValue2Photo from '@/image/sub_3.webp';
import coreValue3Photo from '@/image/sub_4.webp';
import togetherLogo from '@/image/logo.webp';
import mapPhoto from '@/image/map.webp';

export const siteAssets = {
  sanctuaryPhoto,
  heroSlide2Photo,
  heroSlide3Photo,
  communityPhoto,
  coreValue1Photo,
  coreValue2Photo,
  coreValue3Photo,
  togetherLogo,
  mapPhoto,
};

export const siteInfo = {
  name: '함께가는교회',
  tagline: '함께가는교회',
  address: '서울시 도봉구 도당로 118 거성학마을아파트상가 2층',
  phone: '02-6952-1312',
  email: '',
  mapEmbedUrl:
    'https://www.google.com/maps?q=%EC%84%9C%EC%9A%B8%EC%8B%9C%20%EB%8F%84%EB%B4%89%EA%B5%AC%20%EB%8F%84%EB%8B%B9%EB%A1%9C%20118%20%EA%B1%B0%EC%84%B1%ED%95%99%EB%A7%88%EC%9D%84%EC%95%84%ED%8C%8C%ED%8A%B8%EC%83%81%EA%B0%80%202%EC%B8%B5&output=embed',
  mapDirectionsUrl:
    'https://www.google.com/maps?q=%EC%84%9C%EC%9A%B8%EC%8B%9C%20%EB%8F%84%EB%B4%89%EA%B5%AC%20%EB%8F%84%EB%8B%B9%EB%A1%9C%20118%20%EA%B1%B0%EC%84%B1%ED%95%99%EB%A7%88%EC%9D%84%EC%95%84%ED%8C%8C%ED%8A%B8%EC%83%81%EA%B0%80%202%EC%B8%B5',
};

export const worshipHighlights = [
  { label: '주일 1부', time: '11:00', note: '' },
  { label: '주일 2부', time: '오후 1:30', note: '' },
  { label: '새벽 기도회', time: '06:00', note: '' },
  { label: '수요 예배', time: '오후 7:30', note: '' },
];

export const worshipSchedule = [
  {
    day: '주일 예배',
    description: '모든 세대가 함께 드리는 메인 예배 시간입니다.',
    services: [
      { name: '주일 1부', time: '11:00', location: '', note: '' },
      { name: '주일 2부', time: '오후 1:30', location: '', note: '' },
    ],
  },
  {
    day: '주중 예배',
    description: '평일에도 말씀과 기도로 삶을 다시 세웁니다.',
    services: [
      { name: '새벽 기도회', time: '06:00', location: '', note: '' },
      { name: '수요 예배', time: '오후 7:30', location: '', note: '' },
      { name: '금요 기도회', time: '오후 8:00', location: '', note: '' },
    ],
  },
];

export const coreValues = [
  {
    title: '사랑',
    description: '하나님의 사랑을 받고, 그 사랑을 일상 속 관계와 섬김으로 이어갑니다.',
    image: siteAssets.coreValue1Photo,
    imagePosition: 'center 30%',
    actionLabel: '교회소개 보기',
    actionHref: '/about',
  },
  {
    title: '공동체',
    description: '청년과 학생, 장년이 자연스럽게 연결되는 따뜻한 공동체를 지향합니다.',
    image: siteAssets.coreValue2Photo,
    imagePosition: 'center 50%',
    actionLabel: '새가족 등록',
    actionHref: '/new-family',
  },
  {
    title: '성장',
    description: '말씀과 기도를 통해 각자의 자리에서 건강하게 자라가도록 돕습니다.',
    image: siteAssets.coreValue3Photo,
    imagePosition: 'center 45%',
    actionLabel: '예배시간 확인',
    actionHref: '/about/worship-times',
  },
];

export const firstVisitPoints = [
  {
    title: '처음 와도 편안하게',
    description: '낯설지 않도록 예배 전후에 자연스럽게 안내를 도와드립니다.',
  },
  {
    title: '밝고 단정한 공간',
    description: '복잡하지 않고 깔끔한 예배 공간에서 차분하게 머물 수 있습니다.',
  },
  {
    title: '청년과 학생에게도 가까운 분위기',
    description: '세련되지만 과하지 않은 분위기로 누구나 편하게 어울릴 수 있습니다.',
  },
];

export const sermonCategories = ['주일설교', '오후예배설교', '새벽기도설교'] as const;

export const newFamilySteps = [
  {
    step: '01',
    title: '온라인 신청',
    description: '새가족 등록 신청서를 작성해 주시면 담당자가 확인할 수 있도록 접수됩니다.',
  },
  {
    step: '02',
    title: '연락 및 안내',
    description: '입력해 주신 연락처를 통해 예배 시간과 교회 방문 안내를 도와드립니다.',
  },
  {
    step: '03',
    title: '예배와 정착',
    description: '첫 방문 이후 희망 부서와 교구, 새가족 안내 흐름에 맞춰 연결해 드립니다.',
  },
  {
    step: '04',
    title: '교적 등록',
    description: '지속적인 출석과 상담 이후 교회 공동체 안에서 정식 등록을 이어가게 됩니다.',
  },
];

export const newFamilyNotices = [
  '공개 온라인 신청서 특성상 주민등록번호는 받지 않고 생년월일과 연락처 기준으로 접수합니다.',
  '신청서를 제출하시면 담당자가 내용을 확인한 뒤 순차적으로 연락드립니다.',
  '인도자 없이 오신 경우에는 인도자 정보 없이 제출하셔도 됩니다.',
  '작성해 주신 정보는 새가족 안내와 교회 연락을 위한 목적으로만 사용합니다.',
];
