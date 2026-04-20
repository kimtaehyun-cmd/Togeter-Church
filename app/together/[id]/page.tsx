import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getTogetherPosts } from '@/lib/data';

export default async function TogetherDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const posts = getTogetherPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#FDFBF9] pt-32">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
          <Link
            href="/together"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E34] transition-colors hover:text-[#6E4A2F]"
          >
            <ArrowLeft size={16} />
            목록으로 돌아가기
          </Link>

          <header className="mt-8 border-b border-[#EEE4D7] pb-10">
            <h1 className="text-3xl font-bold leading-tight text-[#1E1B4B] md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-[#64748B]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEE4D7] text-[#8B5E34]">
                  <User size={16} />
                </div>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#94A3B8]" />
                <span>{post.date}</span>
              </div>
            </div>
          </header>

          <article className="mt-12">
            <div className="prose prose-lg max-w-none text-[#475569] leading-relaxed">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="mt-12 space-y-8">
              {post.images.map((img, index) => (
                <div key={index} className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-[#EEE4D7] shadow-sm">
                  <Image
                    src={img}
                    alt={`${post.title} - 이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </article>

          <div className="mt-20 border-t border-[#EEE4D7] pt-12 text-center">
            <p className="text-[#94A3B8]">함께해주셔서 감사합니다. 하나님의 은혜로운 하루 되세요.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
