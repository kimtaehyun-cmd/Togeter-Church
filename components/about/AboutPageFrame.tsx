import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

import PageHero from '@/components/PageHero';

type AboutPageFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: StaticImageData;
  children: ReactNode;
  align?: 'left' | 'center';
};

export default function AboutPageFrame({
  eyebrow,
  title,
  description,
  image,
  children,
  align = 'center',
}: AboutPageFrameProps) {
  return (
    <main className="flex-1 pt-32 md:pt-40">
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        image={image}
        align={align}
      />
      {children}
    </main>
  );
}
