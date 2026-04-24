import type { StaticImageData } from 'next/image';

import { siteAssets } from '@/lib/site';

export type SlideImageConfig = {
  path: string;
  label: string;
  description: string;
  image: StaticImageData;
  imagePosition?: string;
};

export const SLIDER_IMAGE_OPTIONS: SlideImageConfig[] = [
  {
    path: '/image/church-background.webp',
    label: '메인 예배당',
    description: '기본 메인 배경 이미지',
    image: siteAssets.sanctuaryPhoto,
    imagePosition: 'center 34%',
  },
  {
    path: '/image/main_3.webp',
    label: '예배 현장',
    description: '메인 비주얼 2번 이미지',
    image: siteAssets.heroSlide2Photo,
    imagePosition: 'center 84%',
  },
  {
    path: '/image/main_4.webp',
    label: '교회 공간',
    description: '메인 비주얼 3번 이미지',
    image: siteAssets.heroSlide3Photo,
    imagePosition: 'center 52%',
  },
  {
    path: '/image/sub_1.webp',
    label: '공동체 모임',
    description: '교제와 모임 이미지',
    image: siteAssets.communityPhoto,
    imagePosition: 'center 46%',
  },
  {
    path: '/image/sub_2.webp',
    label: '핵심가치 사랑',
    description: '핵심가치 1번 이미지',
    image: siteAssets.coreValue1Photo,
    imagePosition: 'center 32%',
  },
  {
    path: '/image/sub_3.webp',
    label: '핵심가치 공동체',
    description: '핵심가치 2번 이미지',
    image: siteAssets.coreValue2Photo,
    imagePosition: 'center 50%',
  },
  {
    path: '/image/sub_4.webp',
    label: '핵심가치 성장',
    description: '핵심가치 3번 이미지',
    image: siteAssets.coreValue3Photo,
    imagePosition: 'center 48%',
  },
  {
    path: '/image/logo.webp',
    label: '교회 로고',
    description: '로고 중심 슬라이드',
    image: siteAssets.togetherLogo,
    imagePosition: 'center center',
  },
  {
    path: '/image/map.webp',
    label: '오시는 길 이미지',
    description: '지도/위치 이미지',
    image: siteAssets.mapPhoto,
    imagePosition: 'center center',
  },
];

export const DEFAULT_SLIDER_IMAGE = SLIDER_IMAGE_OPTIONS[0];

function normalizeImagePath(imagePath: string) {
  const normalizedPath = imagePath.trim().replace(/\\/g, '/');

  if (!normalizedPath) {
    return '';
  }

  const fileName = normalizedPath.split('/').filter(Boolean).pop();
  return fileName ? fileName.toLowerCase().replace(/\.(png|jpe?g|webp|gif)$/i, '') : normalizedPath.toLowerCase();
}

export function resolveSlideImage(imagePath: string): SlideImageConfig {
  const normalizedPath = normalizeImagePath(imagePath);
  return (
    SLIDER_IMAGE_OPTIONS.find(option => normalizeImagePath(option.path) === normalizedPath) ??
    DEFAULT_SLIDER_IMAGE
  );
}

export function getAllowedSliderImagePath(imagePath: string): string {
  return resolveSlideImage(imagePath).path;
}
