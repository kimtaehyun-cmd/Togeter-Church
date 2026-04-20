'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { aboutSections } from './aboutSections';

export default function AboutSubnav() {
  const pathname = usePathname();

  return (
    <div
      className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-md"
      style={{ borderColor: '#EEE4D7' }}
    >
      <div className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 py-3">
        {aboutSections.map(section => {
          const active =
            pathname === section.href ||
            (section.href === '/about/church-guide' && pathname === '/about');

          return (
            <Link
              key={section.href}
              href={section.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200"
              style={{
                color: active ? '#FFFFFF' : '#8B5E34',
                backgroundColor: active ? '#8B5E34' : '#F5EBDD',
              }}
            >
              {section.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
