'use client';

import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export type HeroSlide = {
  id: string;
  image: StaticImageData;
  imagePosition?: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

type HeroSliderClientProps = {
  slides: HeroSlide[];
  churchName: string;
  address: string;
  logoImage: StaticImageData;
};

export default function HeroSliderClient({
  slides,
  churchName,
  address,
  logoImage,
}: HeroSliderClientProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || slides.length === 0) {
        return;
      }

      setTransitioning(true);
      window.setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 180);
    },
    [slides.length, transitioning],
  );

  const prev = useCallback(() => {
    if (slides.length <= 1) {
      return;
    }

    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo, slides.length]);

  const next = useCallback(() => {
    if (slides.length <= 1) {
      return;
    }

    goTo((current + 1) % slides.length);
  }, [current, goTo, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(next, 5500);
    return () => window.clearInterval(timer);
  }, [next, slides.length]);

  const slide = slides[current] ?? slides[0];

  if (!slide) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'clamp(700px, 92vh, 1000px)' }}
    >
      <Image
        src={slide.image}
        alt={`${churchName} 예배 공간`}
        fill
        preload
        sizes="100vw"
        className="object-cover transition-transform duration-700"
        style={{ objectPosition: slide.imagePosition || 'center 25%', transform: transitioning ? 'scale(1.03)' : 'scale(1)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(92deg, rgba(34,24,16,0.72) 0%, rgba(34,24,16,0.48) 38%, rgba(34,24,16,0.16) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1400px] px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div
              className="max-w-3xl transition-opacity duration-300"
              style={{ opacity: transitioning ? 0.3 : 1 }}
            >
              <span
                className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: slide.accent }}
              >
                {slide.eyebrow}
              </span>
              <h1
                className="mt-5 whitespace-pre-line text-4xl font-bold text-white md:text-6xl"
                style={{ lineHeight: 1.08, textShadow: '0 10px 30px rgba(0,0,0,0.22)' }}
              >
                {slide.title}
              </h1>
              <p
                className="mt-5 max-w-2xl text-sm leading-7 md:text-base"
                style={{ color: '#F7ECDC' }}
              >
                {slide.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={slide.primaryHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ color: '#6E4A2F' }}
                >
                  <ArrowRight size={15} />
                  {slide.primaryLabel}
                </Link>
                <Link
                  href={slide.secondaryHref}
                  className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#FFFFFF' }}
                >
                  {slide.secondaryLabel}
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#F6EBDC' }}
                >
                  <MapPin size={13} />
                  {address}
                </span>
              </div>
            </div>

            <div
              className="hidden rounded-[1.75rem] border bg-white/92 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm lg:block"
              style={{
                borderColor: 'rgba(255,255,255,0.26)',
                transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
                opacity: transitioning ? 0.35 : 1,
                transition: 'all 300ms ease',
              }}
            >
              <div
                className="relative h-20 w-20 overflow-hidden rounded-3xl border bg-white"
                style={{ borderColor: '#EEE4D7' }}
              >
                <Image
                  src={logoImage}
                  alt={`${churchName} 로고`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>
              <p className="mt-5 text-lg font-bold" style={{ color: '#1E1B4B' }}>
                {churchName}
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: '#5F6570' }}>
                모든 세대가 함께 어우러져 하나님을 예배하고, 
                서로의 삶을 축복하며 함께 자라가는 따뜻한 공동체입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
            aria-label="다음 슬라이드"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => goTo(index)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: index === current ? '28px' : '8px',
                  height: '8px',
                  backgroundColor:
                    index === current ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                }}
                aria-label={`슬라이드 ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
