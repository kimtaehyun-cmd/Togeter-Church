import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import Image from 'next/image';

import AdminShell from '@/app/admin/_components/AdminShell';
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton';
import { deleteTogetherPost, toggleTogetherVisibility } from '@/lib/actions';
import { approveTogetherUploadAccess, rejectTogetherUploadAccess } from '@/lib/auth-actions';
import { requireAdmin } from '@/lib/auth';
import { getTogetherPosts, getUsers } from '@/lib/data';
import { getTogetherUploadStatus } from '@/lib/user-permissions';

type AdminTogetherPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    message?: string | string[];
  }>;
};

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function AdminTogetherPage({ searchParams }: AdminTogetherPageProps) {
  await requireAdmin('/admin/together');
  const resolvedSearchParams = await searchParams;
  const posts = getTogetherPosts({ includeHidden: true });
  const uploadAccessRequests = getUsers()
    .filter(user => user.role !== 'admin' && getTogetherUploadStatus(user) === 'pending')
    .sort((left, right) =>
      (right.togetherUploadRequestedAt ?? '').localeCompare(left.togetherUploadRequestedAt ?? ''),
    );
  const hiddenCount = posts.filter(post => post.hidden).length;
  const feedbackStatus = getSingleQueryValue(resolvedSearchParams.status);
  const feedbackMessage = getSingleQueryValue(resolvedSearchParams.message);
  const hasFeedback = Boolean(
    feedbackMessage && ['success', 'warning', 'error'].includes(feedbackStatus),
  );
  const feedbackSuccess = feedbackStatus === 'success';

  return (
    <AdminShell
      title="함께함 관리"
      description="교회 일상 갤러리 게시물을 관리합니다. 숨김 처리된 게시물은 갤러리 페이지에서 보이지 않습니다."
    >
      {hasFeedback ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-[1.5rem] border px-5 py-4"
          style={{
            borderColor: feedbackSuccess ? '#BBF7D0' : '#FDE68A',
            backgroundColor: feedbackSuccess ? '#F0FDF4' : '#FFFBEB',
            color: feedbackSuccess ? '#166534' : '#92400E',
          }}
        >
          {feedbackSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <p className="text-sm font-semibold leading-6">{feedbackMessage}</p>
        </div>
      ) : null}

      {uploadAccessRequests.length > 0 ? (
        <section
          className="mb-6 rounded-[1.75rem] border bg-white p-6"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
                글 등록 권한 요청
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                승인된 회원만 함께함 갤러리에 사진과 글을 등록할 수 있습니다.
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}
            >
              {uploadAccessRequests.length}건 대기
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {uploadAccessRequests.map(user => (
              <article
                key={user.id}
                className="rounded-2xl border p-4"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FCFCFF' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#1E1B4B' }}>
                      {user.name}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                      {user.email}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: '#94A3B8' }}>
                      요청일{' '}
                      {user.togetherUploadRequestedAt
                        ? new Date(user.togetherUploadRequestedAt).toLocaleString('ko-KR')
                        : '기록 없음'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={approveTogetherUploadAccess.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        <UserCheck size={14} />
                        승인
                      </button>
                    </form>
                    <form action={rejectTogetherUploadAccess.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        <UserX size={14} />
                        거절
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

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
                  <ConfirmSubmitButton
                    confirmMessage={`"${post.title}" 게시글과 업로드된 이미지를 삭제할까요? 복구할 수 없습니다.`}
                    className="flex items-center justify-center rounded-xl border p-2 text-red-500 hover:bg-red-50 transition-all"
                    style={{ borderColor: '#FECACA' }}
                  >
                    <Trash2 size={16} />
                  </ConfirmSubmitButton>
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
