import Image from 'next/image';
import { Calendar, Play, User, Video } from 'lucide-react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PageHero from '@/components/PageHero';
import { getSermons, Sermon } from '@/lib/data';
import { sermonCategories, siteAssets } from '@/lib/site';

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

  return (
    <>
      <Navbar />
    <main className="flex-1 pt-32 md:pt-40">

        <div className="max-w-[1400px] mx-auto px-4 py-18 md:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {sermonCategories.map(category => {
              const filtered = allSermons
                .filter(s => s.category === category)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const latest = filtered[0];
              const meta = CATEGORY_META[category];

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
        </div>
      </main>
      <Footer />
    </>
  );
}
