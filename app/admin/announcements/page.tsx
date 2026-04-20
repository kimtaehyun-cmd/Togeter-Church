import { Bell, Pin, PlusCircle, Save, Trash2 } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { createAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/lib/actions';
import { getAnnouncements } from '@/lib/data';

export default function AdminAnnouncementsPage() {
  const announcements = getAnnouncements();

  return (
    <AdminShell
      title="공지사항 관리"
      description="공지 작성은 물론, 기존 공지 수정과 상단 고정 여부까지 바로 관리할 수 있습니다."
    >
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-5 flex items-center gap-2">
            <PlusCircle size={18} style={{ color: '#7C3AED' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              새 공지 작성
            </h2>
          </div>
          <form action={createAnnouncement} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                카테고리
              </label>
              <input
                name="category"
                type="text"
                required
                placeholder="예배, 청년부, 행사"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-violet-400"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                제목
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="공지 제목을 입력해 주세요"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-violet-400"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                내용
              </label>
              <textarea
                name="content"
                required
                rows={6}
                placeholder="공지 내용을 입력해 주세요"
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-violet-400"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
              <input type="checkbox" name="pinned" value="true" className="h-4 w-4 accent-violet-600" />
              상단 고정 공지로 등록하기
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 self-end rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#7C3AED' }}
            >
              <PlusCircle size={16} />
              등록하기
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} style={{ color: '#7C3AED' }} />
              <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
                등록된 공지 {announcements.length}개
              </h2>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#A16207' }}>
              고정 {announcements.filter(item => item.pinned).length}개
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {announcements.map(item => (
              <details
                key={item.id}
                className="group rounded-[1.5rem] border bg-white p-5"
                style={{ borderColor: '#E2E8F0' }}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}
                      >
                        {item.category}
                      </span>
                      {item.pinned ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: '#FEF3C7', color: '#A16207' }}
                        >
                          <Pin size={10} />
                          상단 고정
                        </span>
                      ) : null}
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {item.date}
                      </span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-6" style={{ color: '#64748B' }}>
                      {item.content}
                    </p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                    수정
                  </span>
                </summary>

                <div className="mt-5 border-t pt-5" style={{ borderColor: '#F1F5F9' }}>
                  <form action={updateAnnouncement.bind(null, item.id)} className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          카테고리
                        </label>
                        <input
                          name="category"
                          type="text"
                          defaultValue={item.category}
                          required
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                      <label className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
                        <input
                          type="checkbox"
                          name="pinned"
                          value="true"
                          defaultChecked={item.pinned}
                          className="h-4 w-4 accent-violet-600"
                        />
                        상단 고정 유지
                      </label>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        제목
                      </label>
                      <input
                        name="title"
                        type="text"
                        defaultValue={item.title}
                        required
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        내용
                      </label>
                      <textarea
                        name="content"
                        rows={5}
                        defaultValue={item.content}
                        required
                        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#7C3AED' }}
                      >
                        <Save size={15} />
                        저장
                      </button>
                    </div>
                  </form>
                  <div className="mt-3 flex justify-end">
                    <form action={deleteAnnouncement.bind(null, item.id)}>
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
              </details>
            ))}

            {announcements.length === 0 ? (
              <div className="rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  등록된 공지사항이 없습니다.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
