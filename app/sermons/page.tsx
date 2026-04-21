import Image from 'next/image';
import { Calendar, Play, User } from 'lucide-react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { getSermons, Sermon } from '@/lib/data';
import { sermonCategories } from '@/lib/site';

const CATEGORY_META: Record<
  Sermon['category'],
  { label: string; description: string; accent: string; background: string }
> = {
  주일설교: {
    label: '주일 메인 설교',
    description: '하나님의 말씀을 다시 들을 수 있습니다.',
    accent: '#8B5E34',
    background: '#F5EBDD',
  },
  오후예배설교: {
    label: '오후예배 설교',
    description: '주일 오후 은혜로운 말씀을 전해드립니다.',
    accent: '#7A694D',
    background: '#EFE6D8',
  },
  새벽기도설교: {
    label: '새벽기도 설교',
    description: '새벽을 깨우는 말씀의 은혜를 나눕니다.',
    accent: '#A16207',
    background: '#FEF3C7',
  },
};

function getDateValue(date: string) {
  const value = new Date(date.replace(/\./g, '-')).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function SermonCard({ sermon }: { sermon: Sermon }) {
  const meta = CATEGORY_META[sermon.category];

  return (
    <div
      className="overflow-hidden rounded-[1.75rem] border bg-white transition-all duration-200 hover:shadow-md"
      style={{ borderColor: '#EEE4D7', boxShadow: '0 18px 40px rgba(57, 43, 31, 0.04)' }}
    >
      <div className="relative aspect-video" style={{ backgroundColor: '#F6EFE5' }}>
        {sermon.youtubeId ? (
          <a
            href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 group"
          >
            <Image
              src={`https://img.youtube.com/vi/${sermon.youtubeId}/hqdefault.jpg`}
              alt={sermon.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: meta.accent }}
              >
                <Play size={24} color="white" fill="white" />
              </div>
            </div>
          </a>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play size={32} style={{ color: '#B98954' }} />
          </div>
        )}
      </div>

      <div className="p-5">
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: meta.background, color: meta.accent }}
        >
          {meta.label}
        </span>
        <h3 className="mt-4 mb-3 line-clamp-2 font-bold" style={{ color: '#1E1B4B' }}>{sermon.title}</h3>
        <p className="mb-4 line-clamp-2 text-xs" style={{ color: '#64748B' }}>{sermon.description}</p>
        <div className="flex items-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
          <span className="flex items-center gap-1"><User size={12} /> {sermon.preacher}</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {sermon.date}</span>
        </div>
        {sermon.youtubeId && (
          <a
            href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors duration-200"
            style={{ backgroundColor: meta.background, color: meta.accent }}
          >
            <Play size={14} />
            영상 보기
          </a>
        )}
      </div>
    </div>
  );
}

export default function SermonsPage() {
  const allSermons = getSermons();
  const groupedSermons = sermonCategories.map(category => {
    const sermons = allSermons
      .filter(sermon => sermon.category === category)
      .sort((a, b) => getDateValue(b.date) - getDateValue(a.date));

    return {
      category,
      meta: CATEGORY_META[category],
      latest: sermons[0],
      sermons,
    };
  });

  return (
    <>
      <Navbar />
    <main className="flex-1 pt-32 md:pt-40">

        <div className="max-w-[1400px] mx-auto px-4 py-18 md:py-20">
          <section
            className="mb-10 rounded-[2rem] border p-6 md:p-8"
            style={{ borderColor: '#E9D7C3', backgroundColor: '#FFF8F1' }}
          >
            <span
              className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              Sermon Archive
            </span>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl" style={{ color: '#1E1B4B' }}>
              최근 설교와 지난 설교를 함께 확인하세요
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 md:text-base" style={{ color: '#5F6570' }}>
              카테고리별 최신 설교를 먼저 보고, 아래 아카이브에서 이전 설교도 바로 열어보실 수 있도록 정리했습니다.
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            {groupedSermons.map(({ category, latest, meta, sermons }) => {

              return (
                <section key={category}>
                  <div className="mb-4 rounded-2xl border bg-white p-5" style={{ borderColor: '#EEE4D7' }}>
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: meta.background, color: meta.accent }}
                    >
                      {meta.label}
                    </span>
                    <h2 className="mt-3 text-xl font-bold" style={{ color: '#1E1B4B' }}>
                      {category}
                    </h2>
                    <p className="mt-2 text-sm leading-6" style={{ color: '#64748B' }}>
                      {meta.description}
                    </p>
                    <p className="mt-3 text-xs font-medium" style={{ color: meta.accent }}>
                      전체 {sermons.length}편
                    </p>
                  </div>

                  {latest ? (
                    <SermonCard sermon={latest} />
                  ) : (
                    <div className="rounded-2xl border border-dashed py-12 text-center" style={{ borderColor: '#E2E8F0' }}>
                      <p className="text-sm" style={{ color: '#94A3B8' }}>아직 등록된 설교가 없습니다.</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <section className="mt-16 rounded-[2rem] border bg-white p-6 md:p-8" style={{ borderColor: '#EEE4D7' }}>
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1E1B4B' }}>
                  설교 아카이브
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: '#64748B' }}>
                  최신 설교를 포함해 등록된 모든 설교를 날짜순으로 살펴보실 수 있습니다.
                </p>
              </div>
              <p className="text-sm font-medium" style={{ color: '#8B5E34' }}>
                총 {allSermons.length}편
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {groupedSermons.map(({ category, sermons, meta }) => (
                <section
                  key={`${category}-archive`}
                  className="rounded-[1.75rem] border p-5"
                  style={{ borderColor: '#EEE4D7', backgroundColor: '#FFFCF8' }}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold" style={{ color: '#1E1B4B' }}>
                        {category}
                      </h3>
                      <p className="mt-1 text-xs" style={{ color: '#64748B' }}>
                        {meta.description}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: meta.background, color: meta.accent }}
                    >
                      {sermons.length}편
                    </span>
                  </div>

                  {sermons.length > 0 ? (
                    <div className="space-y-3">
                      {sermons.map((sermon, index) => (
                        <article
                          key={sermon.id}
                          className="rounded-2xl border bg-white p-4"
                          style={{ borderColor: '#EEE4D7' }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                {index === 0 ? (
                                  <span
                                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                    style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                                  >
                                    최신
                                  </span>
                                ) : null}
                                <span className="text-xs" style={{ color: '#94A3B8' }}>
                                  {sermon.date}
                                </span>
                              </div>
                              <h4 className="mt-2 text-sm font-semibold leading-6" style={{ color: '#1E1B4B' }}>
                                {sermon.title}
                              </h4>
                              <p className="mt-1 text-xs leading-5" style={{ color: '#64748B' }}>
                                {sermon.preacher}
                              </p>
                            </div>
                            {sermon.youtubeId ? (
                              <a
                                href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors duration-200"
                                style={{ backgroundColor: meta.background, color: meta.accent }}
                              >
                                <Play size={12} />
                                영상 보기
                              </a>
                            ) : (
                              <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                                영상 준비 중
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed py-10 text-center" style={{ borderColor: '#E2E8F0' }}>
                      <p className="text-sm" style={{ color: '#94A3B8' }}>
                        아직 등록된 설교가 없습니다.
                      </p>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
