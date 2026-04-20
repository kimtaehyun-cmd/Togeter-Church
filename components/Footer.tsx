import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

import { getChurchProfile } from '@/lib/data';
import { siteAssets } from '@/lib/site';

export default function Footer() {
  const churchProfile = getChurchProfile();

  return (
    <footer className="mt-auto" style={{ backgroundColor: '#6B4226', color: '#F5EDE3' }}>
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div
                className="relative h-10 w-10 overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: '#E8D3BE' }}
              >
                <Image
                  src={siteAssets.togetherLogo}
                  alt={`${churchProfile.churchName} 로고`}
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                />
              </div>
              <div>
                <p
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {churchProfile.churchName}
                </p>
                <p className="text-xs font-medium" style={{ color: '#F5DEB3' }}>
                  Together Church
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#F5DEB3' }}>
              함께 예배하고, 함께 성장하고, 함께 걸어가는 공동체
              <br />
              처음 방문하는 분도 편안하게 머물 수 있는 교회를 지향합니다.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">바로가기</h3>
            <ul className="flex flex-col gap-2">
              {[
                { href: '/about/church-guide', label: '교회안내' },
                { href: '/about/worship-times', label: '예배시간' },
                { href: '/about/directions', label: '오시는 길' },
                { href: '/new-family', label: '새가족등록' },
                { href: '/sermons', label: '설교 다시보기' },
                { href: '/community', label: '커뮤니티' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#F5DEB3' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">오시는 길</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm" style={{ color: '#F5DEB3' }}>
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>{churchProfile.address}</span>
              </li>
              <li className="flex items-center gap-2 text-sm" style={{ color: '#F5DEB3' }}>
                <Phone size={16} />
                <span>{churchProfile.phone}</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-6 flex flex-col items-center justify-between gap-2 border-t pt-6 text-center sm:flex-row sm:text-left"
          style={{ borderColor: '#4A2D14' }}
        >
          <p className="text-xs" style={{ color: '#D4A574' }}>
            (c) 2026 {churchProfile.churchName}. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#D4A574' }}>
            {churchProfile.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
