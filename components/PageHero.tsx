import type { ReactNode } from 'react';
import Image, { type StaticImageData } from 'next/image';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: StaticImageData;
  children?: ReactNode;
  align?: 'left' | 'center';
};

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
  align = 'center',
}: PageHeroProps) {
  const centered = align === 'center';

  return (
    <section
      className="relative isolate overflow-hidden border-b"
      style={{
        borderColor: '#E9E1D5',
        background:
          'linear-gradient(180deg, rgba(251,248,244,1) 0%, rgba(247,240,231,1) 100%)',
      }}
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-25"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(251,248,244,0.96) 0%, rgba(247,240,231,0.86) 60%, rgba(255,255,255,0.82) 100%)',
        }}
      />
      <div
        className="absolute -left-12 top-14 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(196, 144, 91, 0.18)' }}
      />
      <div
        className="absolute right-0 top-8 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(164, 132, 109, 0.16)' }}
      />
      <div className="relative max-w-[1400px] mx-auto px-4 pt-20 pb-16 md:pt-24 md:pb-20">
        <div className={centered ? 'max-w-3xl mx-auto text-center' : 'max-w-3xl'}>
          <span
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ backgroundColor: '#F2E7D9', color: '#8B5E34' }}
          >
            {eyebrow}
          </span>
          <h1
            className="mt-5 text-3xl font-bold md:text-5xl"
            style={{ color: '#1E1B4B', lineHeight: 1.15 }}
          >
            {title}
          </h1>
          <p
            className={`mt-4 text-sm leading-7 md:text-base ${centered ? 'mx-auto' : ''}`}
            style={{ color: '#5F6570', maxWidth: '42rem' }}
          >
            {description}
          </p>
          {children ? <div className="mt-7">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
