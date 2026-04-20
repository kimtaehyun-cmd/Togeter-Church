import HeroSliderClient, { type HeroSlide } from '@/components/HeroSliderClient';
import { getChurchProfile, getSliderItems } from '@/lib/data';
import { siteAssets } from '@/lib/site';
import type { StaticImageData } from 'next/image';

const imageMap: Record<string, StaticImageData> = {
  '/image/main_3.png': siteAssets.heroSlide2Photo,
  '/image/main_4.png': siteAssets.heroSlide3Photo,
};

function resolveSlideImage(imagePath: string): StaticImageData {
  return imageMap[imagePath] ?? siteAssets.sanctuaryPhoto;
}

export default function HeroSlider() {
  const churchProfile = getChurchProfile();
  const sliderItems = getSliderItems();
  const activeSlides = sliderItems.filter(item => item.active);
  const sourceSlides = activeSlides.length > 0 ? activeSlides : sliderItems;

  const slides: HeroSlide[] =
    sourceSlides.length > 0
      ? sourceSlides.map(item => ({
          id: item.id,
          image: resolveSlideImage(item.imagePath),
          imagePosition: item.imagePath === '/image/main_3.png' ? 'center 100%' : undefined,
          eyebrow: item.eyebrow,
          title: item.title,
          description: item.description,
          accent: item.accent,
          primaryLabel: item.primaryLabel,
          primaryHref: item.primaryHref,
          secondaryLabel: item.secondaryLabel,
          secondaryHref: item.secondaryHref,
        }))
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
