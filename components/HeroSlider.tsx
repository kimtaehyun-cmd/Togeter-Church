import HeroSliderClient, { type HeroSlide } from '@/components/HeroSliderClient';
import { getChurchProfile, getSliderItems } from '@/lib/data';
import { normalizeSafeHref } from '@/lib/safe-url';
import { DEFAULT_SLIDER_IMAGE, resolveSlideImage } from '@/lib/slider-images';
import { siteAssets } from '@/lib/site';

export default function HeroSlider() {
  const churchProfile = getChurchProfile();
  const sliderItems = getSliderItems();
  const activeSlides = sliderItems.filter(item => item.active);
  const sourceSlides = activeSlides;

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
            primaryHref: normalizeSafeHref(item.primaryHref, '/about/church-guide'),
            secondaryLabel: item.secondaryLabel,
            secondaryHref: normalizeSafeHref(item.secondaryHref, '/about/directions'),
          };
        })
      : [
          {
            id: 'fallback-slide',
            image: DEFAULT_SLIDER_IMAGE.image,
            imagePosition: DEFAULT_SLIDER_IMAGE.imagePosition,
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
