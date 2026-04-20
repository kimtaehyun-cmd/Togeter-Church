import { Calendar, Eye, EyeOff, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';

import AdminShell from '@/app/admin/_components/AdminShell';
import { deleteTogetherPost, toggleTogetherVisibility } from '@/lib/actions';
import { getTogetherPosts } from '@/lib/data';

export default function AdminTogetherPage() {
  const posts = getTogetherPosts();
  const hiddenCount = posts.filter(post => post.hidden).length;

  return (
    <AdminShell
      title="함께함 관리"
      description="교회 일상 갤러리 게시물을 관리합니다. 숨김 처리된 게시물은 갤러리 페이지에서 보이지 않습니다."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#DB2777' }}>전체 게시물</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>{posts.length}</p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#059669' }}>공개 중</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>{posts.length - hiddenCount}</p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#E11D48' }}>숨김 처리</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>{hiddenCount}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map(post => (
          <article
            key={post.id}
            className="flex flex-col overflow-hidden rounded-[2rem] border bg-white shadow-sm transition-all"
            style={{ 
              borderColor: post.hidden ? '#FECACA' : '#E2E8F0',
              opacity: post.hidden ? 0.8 : 1
            }}
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              <Image 
                src={post.thumbnail} 
                alt={post.title} 
                fill 
                className="object-cover" 
              />
              {post.hidden && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-red-600">
                    <EyeOff size={12} /> 숨김 상태
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
                <span className="font-semibold text-[#8B5E34]">{post.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
              </div>
              
              <h2 className="mb-2 line-clamp-1 text-lg font-bold" style={{ color: '#1E1B4B' }}>
                {post.title}
              </h2>
              
              <p className="mb-6 line-clamp-2 text-sm leading-relaxed" style={{ color: '#64748B' }}>
                {post.content}
              </p>
              
              <div className="mt-auto flex items-center gap-2 border-t pt-4" style={{ borderColor: '#F1F5F9' }}>
                <form action={toggleTogetherVisibility.bind(null, post.id)} className="flex-1">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold transition-all"
                    style={{ 
                      borderColor: post.hidden ? '#BBF7D0' : '#E2E8F0',
                      backgroundColor: post.hidden ? '#F0FDF4' : '#FFFFFF',
                      color: post.hidden ? '#15803D' : '#475569'
                    }}
                  >
                    {post.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    {post.hidden ? '공개하기' : '숨기기'}
                  </button>
                </form>
                
                <form action={deleteTogetherPost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-xl border p-2 text-red-500 hover:bg-red-50 transition-all"
                    style={{ borderColor: '#FECACA' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full rounded-[2rem] border border-dashed py-20 text-center" style={{ borderColor: '#E2E8F0' }}>
            <ImageIcon size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm" style={{ color: '#94A3B8' }}>등록된 갤러리 게시물이 없습니다.</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
