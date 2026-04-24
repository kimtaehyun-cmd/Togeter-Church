import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnnouncements } from '@/lib/data';

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcements = getAnnouncements();
  const announcement = announcements.find((a) => a.id === id);

  if (!announcement) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#FDFBF9] pt-32">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E34] transition-colors hover:text-[#6E4A2F]"
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </Link>

          <header className="mt-8 border-b border-[#EEE4D7] pb-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}>
                {announcement.category}
              </span>
              {announcement.pinned && (
                <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#A16207' }}>
                  중요 공지
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[#1E1B4B] md:text-5xl">
              {announcement.title}
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-[#64748B]">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#94A3B8]" />
                <span>{announcement.date}</span>
              </div>
            </div>
          </header>

          <article className="mt-12">
            <div className="prose prose-lg max-w-none text-[#475569] leading-relaxed">
              <p className="whitespace-pre-wrap min-h-[300px]">{announcement.content}</p>
            </div>
          </article>

          <div className="mt-20 border-t border-[#EEE4D7] pt-12 text-center">
            <p className="text-[#94A3B8]">성도님들의 가정에 주님의 평강이 가득하시길 기도합니다.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
