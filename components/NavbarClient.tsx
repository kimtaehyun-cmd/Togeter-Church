'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { aboutSections } from '@/components/about/aboutSections';
import { siteAssets } from '@/lib/site';
import type { PublicUser } from '@/lib/user-permissions';

type NavbarClientProps = {
  currentUser: PublicUser | null;
  logoutAction: () => Promise<void>;
};

const secondaryNavItems = [
  { href: '/new-family', label: '새가족등록' },
  { href: '/sermons', label: '예배' },
  { href: '/news', label: '교회소식' },
  { href: '/together', label: '함께함' },
];

export default function NavbarClient({ currentUser, logoutAction }: NavbarClientProps) {
  const pathname = usePathname();

  return (
    <NavbarClientContent
      key={pathname}
      pathname={pathname}
      currentUser={currentUser}
      logoutAction={logoutAction}
    />
  );
}

type NavbarClientContentProps = NavbarClientProps & {
  pathname: string;
};

function NavbarClientContent({
  currentUser,
  logoutAction,
  pathname,
}: NavbarClientContentProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = pathname === '/';

  const transparentMode = !isScrolled;
  const homeOverlayMode = transparentMode && isHomePage;

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const currentScrollY = window.scrollY;

        setIsScrolled(previous => {
          const next = currentScrollY > 50;
          return previous === next ? previous : next;
        });

        if (!isHomePage) {
          const diff = currentScrollY - lastScrollY.current;
          const nextVisible = !(diff > 10 && currentScrollY > 150);

          if (diff < 0 || currentScrollY < 20 || !nextVisible) {
            setIsVisible(previous => (previous === nextVisible ? previous : nextVisible));
          }
        } else {
          setIsVisible(previous => (previous ? previous : true));
        }

        lastScrollY.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isHomePage]);

  const textColor = transparentMode
    ? (isHomePage ? 'text-white' : 'text-[#475569]')
    : 'text-[#475569]';

  const brandColor = transparentMode
    ? (isHomePage ? 'text-white' : 'text-[#1E1B4B]')
    : 'text-[#1E1B4B]';

  const bgColor = transparentMode
    ? 'bg-transparent border-transparent'
    : 'bg-white/92 shadow-sm backdrop-blur-md border-[#EEE4D7] shadow-md';

  const visibilityClass = !isHomePage && !isVisible && !isMobileMenuOpen
    ? 'opacity-0 invisible'
    : 'opacity-100 visible';

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-700 ease-in-out ${bgColor} ${visibilityClass}`}
      style={{ height: '7rem' }}
    >
      <nav className="mx-auto flex h-full max-w-[1400px] items-center gap-4 px-6 md:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-4">
          <div
            className={`relative h-16 w-16 overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
              transparentMode ? 'border-white/20' : 'border-[#EEE4D7]'
            }`}
          >
            <Image
              src={siteAssets.togetherLogo}
              alt="함께가는교회 로고"
              fill
              sizes="64px"
              className="object-contain p-2"
            />
          </div>
          <span
            className={`text-3xl font-bold transition-colors duration-300 ${brandColor}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            함께가는교회
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center md:flex">
          <ul className="ml-8 flex min-w-0 items-center gap-1">
            <li className="relative group">
              <div className="relative">
                <button
                  className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-lg font-semibold transition-colors duration-200 ${textColor}`}
                >
                  <span>교회소개</span>
                  <ChevronDown size={18} className="transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div
                  className="invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-200 group-hover:visible group-hover:opacity-100"
                  style={{ borderColor: '#EEE4D7' }}
                >
                  {aboutSections.map(section => (
                    <Link
                      key={section.href}
                      href={section.href}
                      className="block rounded-xl px-4 py-3 text-base font-semibold transition-colors duration-200 hover:bg-[#F8F4EE]"
                      style={{ color: '#475569' }}
                    >
                      {section.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
            {secondaryNavItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-lg font-semibold transition-colors duration-200 ${textColor}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {currentUser ? (
              <>
                {currentUser.role === 'admin' ? (
                  <Link
                    href="/admin"
                  className="rounded-xl border px-5 py-2.5 text-base font-bold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                      borderColor: homeOverlayMode ? 'rgba(255,255,255,0.4)' : '#D9C7B1',
                      color: homeOverlayMode ? 'white' : '#8B5E34',
                      backgroundColor: homeOverlayMode ? 'rgba(255,255,255,0.1)' : '#FFF8F1',
                    }}
                  >
                    관리자
                  </Link>
                ) : null}
                <span
                  className="max-w-32 truncate rounded-xl px-5 py-2.5 text-base font-bold"
                  style={{
                    color: homeOverlayMode ? 'white' : '#6B7280',
                    backgroundColor: homeOverlayMode ? 'rgba(255,255,255,0.15)' : '#F8F4EE',
                  }}
                  title={currentUser.name}
                >
                  {currentUser.name}
                </span>
                <button
                  onClick={() => logoutAction()}
                  className="cursor-pointer rounded-xl px-6 py-2.5 text-base font-bold text-white transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: '#8B5E34' }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border px-5 py-2.5 text-base font-bold transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    borderColor: homeOverlayMode ? 'rgba(255,255,255,0.4)' : '#E7D8C8',
                    color: homeOverlayMode ? 'white' : '#6B7280',
                    backgroundColor: homeOverlayMode ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                  }}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl px-6 py-2.5 text-base font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-90 shadow-md"
                  style={{ backgroundColor: '#8B5E34' }}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          className="relative ml-auto p-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X size={32} className={isMobileMenuOpen ? 'text-[#475569]' : textColor} />
          ) : (
            <Menu size={32} className={textColor} />
          )}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed bottom-0 left-0 right-0 top-28 z-40 overflow-y-auto bg-white px-6 pb-12 shadow-xl animate-in slide-in-from-top duration-300"
          >
            <ul className="flex flex-col gap-2 pt-6">
              <li className="rounded-xl">
                <details className="group">
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-4 text-left text-lg font-bold text-[#475569] [&::-webkit-details-marker]:hidden"
                  >
                    <span>교회소개</span>
                    <ChevronDown
                      size={20}
                      className="transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <div className="space-y-1 px-4 pb-4">
                    {aboutSections.map(section => (
                      <Link
                        key={section.href}
                        href={section.href}
                        className="block rounded-lg px-4 py-3 text-base font-semibold text-[#475569] hover:bg-[#F8F4EE]"
                      >
                        {section.label}
                      </Link>
                    ))}
                  </div>
                </details>
              </li>
              {secondaryNavItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-4 py-4 text-lg font-bold text-[#475569] hover:bg-[#F8F4EE]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3 border-t border-[#EEE4D7] pt-8">
              {currentUser ? (
                <>
                  <div className="rounded-2xl bg-[#F8F4EE] px-6 py-4 text-center text-lg font-bold text-[#6B7280]">
                    {currentUser.name}
                  </div>
                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block rounded-2xl border border-[#D9C7B1] bg-[#FFF8F1] px-6 py-4 text-center text-lg font-bold text-[#8B5E34]"
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={() => logoutAction()}
                    className="w-full rounded-2xl bg-[#8B5E34] px-6 py-4 text-center text-lg font-bold text-white shadow-md"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="rounded-2xl border border-[#E7D8C8] bg-white px-6 py-4 text-center text-lg font-bold text-[#6B7280]"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-2xl bg-[#8B5E34] px-6 py-4 text-center text-lg font-bold text-white shadow-md"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
