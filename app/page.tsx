import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bell, ChevronRight, Clock } from 'lucide-react';

import FadeIn from '@/components/FadeIn';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import Navbar from '@/components/Navbar';
import {
  getAnnouncements,
  getWorshipSchedule,
} from '@/lib/data';
import {
  coreValues,
  worshipHighlights as defaultWorshipHighlights,
} from '@/lib/site';

export default function HomePage() {
  const announcements = getAnnouncements().slice(0, 3);
  const schedule = getWorshipSchedule();
  const worshipHighlights =
    schedule
      .flatMap(section =>
        section.services.map(service => ({
          label: service.name,
          time: service.time,
          note: service.note || section.day,
        })),
      )
      .slice(0, 4) || [];
  const visibleWorshipHighlights =
    worshipHighlights.length > 0 ? worshipHighlights : defaultWorshipHighlights;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-0">
        <HeroSlider />

        <section className="border-b" style={{ backgroundColor: '#FFFDFC', borderColor: '#EEE4D7' }}>
          <div className="max-w-[1400px] mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {visibleWorshipHighlights.map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl border p-4"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#EEE4D7' }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                    >
                      <Clock size={18} />
                    </div>
                    <p className="text-lg font-bold" style={{ color: '#8B5E34' }}>
                      {item.label}
                    </p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#1E1B4B' }}>
                    {item.time}
                  </p>
                  <p className="mt-1 text-sm leading-5" style={{ color: '#6B7280' }}>
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 제목 섹션 */}
        <section className="pt-12 md:pt-16 pb-8 md:pb-10" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-[1400px] mx-auto px-4">
            <FadeIn>
              <div className="border-l-4 pl-4" style={{ borderColor: '#8B5E34' }}>
                <span className="mb-1 block text-xs font-semibold tracking-widest uppercase" style={{ color: '#A67C52' }}>
                  Core Values
                </span>
                <h2 className="text-2xl font-bold md:text-3xl" style={{ color: '#1E1B4B' }}>
                  함께가는교회의 핵심가치
                </h2>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 3가지 핵심가치 행 */}
        {coreValues.map((value, index) => {
          // 약간씩 다른 배경색 배열 (가독성 향상)
          const rowBgs = ['#FFFDFC', '#F9F6F0', '#F4EFE6'];
          return (
            <section
              key={value.title}
              className="py-12 md:py-16"
              style={{ backgroundColor: rowBgs[index % rowBgs.length] }}
            >
              <div className="max-w-[1400px] mx-auto px-4">
                <FadeIn delay={150}>
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    {/* 텍스트 영역 (좌측) */}
                    <div className="lg:w-5/12">
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold mb-4"
                        style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                      >
                        0{index + 1}
                      </span>
                      <h3 className="text-xl font-bold md:text-2xl" style={{ color: '#1E1B4B' }}>
                        {value.title}
                      </h3>
                      <p className="mt-4 mb-6 text-sm leading-relaxed md:text-base" style={{ color: '#5F6570' }}>
                        {value.description}
                      </p>
                      <Link
                        href={value.actionHref}
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:opacity-80"
                        style={{ color: '#8B5E34' }}
                      >
                        {value.actionLabel}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                    {/* 이미지 영역 (우측) */}
                    <div className="lg:w-5/12">
                      <Link
                        href={value.actionHref}
                        className="group relative block aspect-[21/9] w-full max-w-md overflow-hidden rounded-2xl shadow-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-md ml-auto"
                        style={{ borderColor: '#EEE4D7', borderWidth: '1px' }}
                      >
                        <Image
                          src={value.image!}
                          alt={value.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{ objectPosition: value.imagePosition || 'center center' }}
                        />
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </section>
          );
        })}

        <section className="max-w-[1400px] mx-auto px-4 py-18 md:py-20">
          <FadeIn>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell size={20} style={{ color: '#8B5E34' }} />
                <h2 className="text-xl font-bold" style={{ color: '#1E1B4B' }}>교회 소식</h2>
              </div>
              <Link href="/news" className="flex items-center gap-1 text-sm font-medium transition-colors duration-200" style={{ color: '#8B5E34' }}>
                전체 보기 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {announcements.map(a => (
                <Link
                  key={a.id}
                  href={`/news/${a.id}`}
                  className="block rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-md"
                  style={{ borderColor: '#EEE4D7', boxShadow: '0 14px 34px rgba(57, 43, 31, 0.04)' }}
                >
                  <div className="mb-3 flex gap-2">
                    <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}>
                      {a.category}
                    </span>
                    {a.pinned && (
                      <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: '#FEF3C7', color: '#A16207' }}>
                        중요
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold" style={{ color: '#1E1B4B' }}>{a.title}</h3>
                  <time className="text-xs" style={{ color: '#94A3B8' }}>{a.date}</time>
                </Link>
              ))}
            </div>
          </FadeIn>
        </section>

      </main>
      <Footer />
    </>
  );
}
