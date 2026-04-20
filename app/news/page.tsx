import { Bell, Megaphone, Pin, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PageHero from '@/components/PageHero';
import { getAnnouncements } from '@/lib/data';
import { siteAssets } from '@/lib/site';

export default function NewsPage() {
  const announcements = getAnnouncements();
  const pinned = announcements.filter(a => a.pinned);
  const regular = announcements.filter(a => !a.pinned);
  const categories = [...new Set(announcements.map(item => item.category))].slice(0, 4);

  return (
    <>
      <Navbar />
    <main className="flex-1 pt-32 md:pt-40">

        <div className="max-w-[1400px] mx-auto px-4 py-18 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#EEE4D7' }}>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                  <Bell size={16} />
                  공지 요약
                </div>
                <h2 className="mt-4 text-2xl font-bold" style={{ color: '#1E1B4B' }}>
                  한눈에 보는 교회 소식
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: '#5F6570' }}>
                  예배 일정 변경, 행사 안내, 부서 소식 등 운영에 필요한 공지를 빠르게 찾을 수 있도록 구성했습니다.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFF8F1' }}>
                    <p className="text-xs font-semibold" style={{ color: '#8B5E34' }}>전체</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: '#1E1B4B' }}>{announcements.length}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFF8F1' }}>
                    <p className="text-xs font-semibold" style={{ color: '#8B5E34' }}>중요 공지</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: '#1E1B4B' }}>{pinned.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#EEE4D7' }}>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                  <Megaphone size={16} />
                  자주 보이는 카테고리
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map(category => (
                    <span
                      key={category}
                      className="rounded-full px-3 py-1.5 text-xs font-medium"
                      style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <div className="max-w-3xl">
              {pinned.length > 0 && (
                <div className="mb-10">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                    <Pin size={14} /> 중요 공지
                  </h2>
                  <div className="flex flex-col gap-3">
                    {pinned.map(a => (
                      <Link 
                        key={a.id} 
                        href={`/news/${a.id}`}
                        className="group rounded-2xl border p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1" 
                        style={{ backgroundColor: '#FFF9F3', borderColor: '#E9D7C3' }}
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <h3 className="font-bold text-[#1E1B4B] group-hover:text-[#8B5E34] transition-colors">{a.title}</h3>
                          <span className="flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#A16207' }}>
                            <Pin size={10} /> 중요
                          </span>
                        </div>
                        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#475569]">{a.content}</p>
                        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1"><Tag size={11} /> {a.category}</span>
                          <span className="flex items-center gap-1"><Calendar size={11} /> {a.date}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {pinned.length > 0 && (
                  <h2 className="mb-4 text-sm font-semibold" style={{ color: '#64748B' }}>전체 공지</h2>
                )}
                <div className="flex flex-col gap-3">
                  {[...pinned, ...regular].map((a, idx) => (
                    <Link
                      key={a.id}
                      href={`/news/${a.id}`}
                      className="block rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-md"
                      style={{ borderColor: '#EEE4D7', boxShadow: '0 14px 34px rgba(57, 43, 31, 0.04)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span className="w-6 flex-shrink-0 text-xs font-bold mt-1" style={{ color: '#94A3B8' }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {a.pinned && (
                                <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#A16207' }}>
                                  중요
                                </span>
                              )}
                              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}>
                                {a.category}
                              </span>
                            </div>
                            <h3 className="line-clamp-1 text-base font-bold text-[#1E1B4B] transition-colors group-hover:text-[#8B5E34]">
                              {a.title}
                            </h3>
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs text-[#94A3B8] mt-1">{a.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {announcements.length === 0 && (
                  <div className="rounded-2xl border border-dashed py-20 text-center" style={{ borderColor: '#E2E8F0' }}>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>등록된 공지사항이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
