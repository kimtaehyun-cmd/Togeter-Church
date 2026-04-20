import Link from 'next/link';
import { AlertCircle, Calendar, Heart, MessageCircle, PenSquare } from 'lucide-react';

import PageHero from '@/components/PageHero';
import {
  getCommunitySection,
  type CommunitySectionSlug,
} from '@/components/community/community';
import { getCurrentUser } from '@/lib/auth';
import { getPosts } from '@/lib/data';
import { siteAssets } from '@/lib/site';

type CommunitySectionPageProps = {
  slug: CommunitySectionSlug;
  notice?: string | null;
};

export default async function CommunitySectionPage({
  slug,
  notice,
}: CommunitySectionPageProps) {
  const section = getCommunitySection(slug);

  if (!section) {
    return null;
  }

  const currentUser = await getCurrentUser();
  const allPosts = getPosts();
  const posts = section.category
    ? allPosts.filter(post => post.category === section.category)
    : allPosts;
  const writeHref = currentUser ? '/community/write' : `${section.href}?notice=login-required`;

  return (
    <main className="flex-1">
      <PageHero
        eyebrow="Community"
        title={section.title}
        description={section.description}
        image={siteAssets.sanctuaryPhoto}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-18 md:py-20">
        <div
          className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border bg-white p-6 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: '#EEE4D7' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: '#8B5E34' }}>
              현재 페이지
            </p>
            <h2 className="mt-1 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
              {section.label}
            </h2>
            <p className="mt-2 text-sm leading-7" style={{ color: '#5F6570' }}>
              {section.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              게시글 {posts.length}
            </span>
            <Link
              href={writeHref}
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-colors duration-200"
              style={{ backgroundColor: '#8B5E34' }}
            >
              <PenSquare size={15} />
              글쓰기
            </Link>
          </div>
        </div>

        {!currentUser && notice === 'login-required' ? (
          <div
            className="mb-6 flex flex-col gap-3 rounded-[1.5rem] border px-5 py-4 md:flex-row md:items-center md:justify-between"
            style={{ borderColor: '#F2D3BF', backgroundColor: '#FFF8F1' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
              >
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#8B5E34' }}>
                  로그인을 해야 글쓰기가 가능합니다.
                </p>
                <p className="mt-1 text-sm leading-6" style={{ color: '#6B7280' }}>
                  로그인 후 다시 오시면 글쓰기 페이지로 바로 이동할 수 있습니다.
                </p>
              </div>
            </div>
            <Link
              href={`/login?next=${encodeURIComponent('/community/write')}`}
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors duration-200"
              style={{
                borderColor: '#D9C7B1',
                color: '#8B5E34',
                backgroundColor: '#FFFFFF',
              }}
            >
              로그인하러 가기
            </Link>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <article
              key={post.id}
              className="rounded-[1.75rem] border bg-white p-5 transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: '#EEE4D7',
                boxShadow: '0 18px 40px rgba(57, 43, 31, 0.04)',
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-bold" style={{ color: '#1E1B4B' }}>
                  {post.title}
                </h3>
                <span
                  className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs"
                  style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                >
                  {post.category}
                </span>
              </div>
              <p
                className="mb-4 line-clamp-3 text-sm leading-relaxed"
                style={{ color: '#475569' }}
              >
                {post.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#B98954' }}
                  >
                    {post.author[0]}
                  </div>
                  <div>
                    <span className="text-xs font-medium" style={{ color: '#1E1B4B' }}>
                      {post.author}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: '#94A3B8' }}
                    >
                      <Calendar size={10} /> {post.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
                  <span className="flex items-center gap-1">
                    <Heart size={13} /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} /> {post.comments}
                  </span>
                </div>
              </div>
            </article>
          ))}

          {posts.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed py-20 text-center"
              style={{ borderColor: '#E2E8F0' }}
            >
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                이 페이지에는 아직 게시글이 없습니다.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
