import { Calendar, Eye, EyeOff, Heart, MessageCircle, MessageSquare, Trash2 } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { deletePost, togglePostVisibility } from '@/lib/actions';
import { getPosts } from '@/lib/data';

export default function AdminPostsPage() {
  const posts = getPosts({ includeHidden: true });
  const hiddenCount = posts.filter(post => post.hidden).length;

  return (
    <AdminShell
      title="커뮤니티 관리"
      description="게시글은 삭제하거나 숨김 처리할 수 있습니다. 숨김 처리된 글은 공개 페이지와 홈 미리보기에서 자동으로 제외됩니다."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#8B5E34' }}>
            전체 글
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
            {posts.length}
          </p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#8B5E34' }}>
            공개 중
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
            {posts.length - hiddenCount}
          </p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#8B5E34' }}>
            숨김 처리
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
            {hiddenCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <article
            key={post.id}
            className="rounded-[1.75rem] border bg-white p-5"
            style={{
              borderColor: post.hidden ? '#FECACA' : '#E2E8F0',
              backgroundColor: post.hidden ? '#FFFBFB' : '#FFFFFF',
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}
                  >
                    {post.category}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: post.hidden ? '#FEE2E2' : '#ECFDF3',
                      color: post.hidden ? '#B91C1C' : '#15803D',
                    }}
                  >
                    {post.hidden ? <EyeOff size={11} /> : <Eye size={11} />}
                    {post.hidden ? '숨김' : '공개'}
                  </span>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>
                    {post.author}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                    <Calendar size={10} />
                    {post.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-7" style={{ color: '#64748B' }}>
                  {post.content}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
                  <span className="inline-flex items-center gap-1">
                    <Heart size={12} />
                    {post.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={12} />
                    {post.comments}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} />
                    홈/커뮤니티 노출 대상
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <form action={togglePostVisibility.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderColor: post.hidden ? '#BBF7D0' : '#FDE68A',
                      backgroundColor: post.hidden ? '#F0FDF4' : '#FFFBEB',
                      color: post.hidden ? '#15803D' : '#A16207',
                    }}
                  >
                    {post.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                    {post.hidden ? '다시 공개' : '숨김 처리'}
                  </button>
                </form>
                <form action={deletePost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{ borderColor: '#FECACA', color: '#B91C1C', backgroundColor: '#FEF2F2' }}
                  >
                    <Trash2 size={15} />
                    삭제
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: '#E2E8F0' }}>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              등록된 게시글이 없습니다.
            </p>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
