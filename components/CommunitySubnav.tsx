'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { communitySections, isCommunitySectionPath } from '@/components/community/community';

export default function CommunitySubnav() {
  const pathname = usePathname();

  return (
    <div
      className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-md"
      style={{ borderColor: '#EEE4D7' }}
    >
      <div className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {communitySections.map(section => {
          const active = isCommunitySectionPath(pathname, section.href);

          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? 'page' : undefined}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E34] focus-visible:ring-offset-2"
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
