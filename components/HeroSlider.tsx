import HeroSliderClient, { type HeroSlide } from '@/components/HeroSliderClient';
import { getChurchProfile, getSliderItems } from '@/lib/data';
import { siteAssets } from '@/lib/site';
import type { StaticImageData } from 'next/image';

type SlideImageConfig = {
  image: StaticImageData;
  imagePosition?: string;
};

const defaultSlideImage: SlideImageConfig = {
  image: siteAssets.sanctuaryPhoto,
  imagePosition: 'center 34%',
};

const imageRegistry: Record<string, SlideImageConfig> = {
  'church-background.png': defaultSlideImage,
  'main_3.png': {
    image: siteAssets.heroSlide2Photo,
    imagePosition: 'center 84%',
  },
  'main_4.png': {
    image: siteAssets.heroSlide3Photo,
    imagePosition: 'center 52%',
  },
  'sub_1.png': {
    image: siteAssets.communityPhoto,
    imagePosition: 'center 46%',
  },
  'sub_2.png': {
    image: siteAssets.coreValue1Photo,
    imagePosition: 'center 32%',
  },
  'sub_3.png': {
    image: siteAssets.coreValue2Photo,
    imagePosition: 'center 50%',
  },
  'sub_4.png': {
    image: siteAssets.coreValue3Photo,
    imagePosition: 'center 48%',
  },
  'logo.png': {
    image: siteAssets.togetherLogo,
    imagePosition: 'center center',
  },
  'map.png': {
    image: siteAssets.mapPhoto,
    imagePosition: 'center center',
  },
};

function normalizeImagePath(imagePath: string) {
  const normalizedPath = imagePath.trim().replace(/\\/g, '/');

  if (!normalizedPath) {
    return '';
  }

  return normalizedPath.split('/').filter(Boolean).pop() ?? normalizedPath;
}

function resolveSlideImage(imagePath: string): SlideImageConfig {
  const normalizedPath = normalizeImagePath(imagePath);
  return imageRegistry[normalizedPath] ?? defaultSlideImage;
}

export default function HeroSlider() {
  const churchProfile = getChurchProfile();
  const sliderItems = getSliderItems();
  const activeSlides = sliderItems.filter(item => item.active);
  const sourceSlides = activeSlides.length > 0 ? activeSlides : sliderItems;

  const slides: HeroSlide[] =
    sourceSlides.length > 0
      ? sourceSlides.map(item => {
          const resolvedImage = resolveSlideImage(item.imagePath);

          return {
            id: item.id,
            image: resolvedImage.image,
            imagePosition: resolvedImage.imagePosition,
            eyebrow: item.eyebrow,
            title: item.title,
            description: item.description,
            accent: item.accent,
            primaryLabel: item.primaryLabel,
            primaryHref: item.primaryHref,
            secondaryLabel: item.secondaryLabel,
            secondaryHref: item.secondaryHref,
          };
        })
      : [
          {
            id: 'fallback-slide',
            image: siteAssets.sanctuaryPhoto,
            eyebrow: 'Welcome',
            title: `${churchProfile.churchName}에 오신 것을 환영합니다`,
            description:
              '밝고 편안한 예배 공간에서 처음 방문하는 분도 자연스럽게 머물 수 있도록 준비하고 있습니다.',
            accent: '#F6EBDC',
            primaryLabel: '교회안내 보기',
            primaryHref: '/about/church-guide',
            secondaryLabel: '오시는 길',
            secondaryHref: '/about/directions',
          },
        ];

  return (
    <HeroSliderClient
      slides={slides}
      churchName={churchProfile.churchName}
      address={churchProfile.address}
      logoImage={siteAssets.togetherLogo}
    />
  );
}
