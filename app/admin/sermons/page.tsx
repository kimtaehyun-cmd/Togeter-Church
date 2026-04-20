import { Play, PlusCircle, Save, Trash2, Video } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { createSermon, deleteSermon, updateSermon } from '@/lib/actions';
import { getSermons, SERMON_CATEGORIES } from '@/lib/data';

export default function AdminSermonsPage() {
  const sermons = getSermons();

  return (
    <AdminShell
      title="설교 영상 관리"
      description="카테고리 선택, 설교 제목, 설교자, 날짜, 유튜브 링크를 등록하고 수정할 수 있습니다."
    >
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-5 flex items-center gap-2">
            <PlusCircle size={18} style={{ color: '#7C3AED' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              새 설교 등록
            </h2>
          </div>
          <form action={createSermon} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  카테고리
                </label>
                <select
                  name="category"
                  required
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                >
                  {SERMON_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  설교자
                </label>
                <input
                  name="preacher"
                  type="text"
                  required
                  placeholder="황현상 담임목사"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                설교 제목
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="설교 제목을 입력해 주세요"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  날짜
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  유튜브 링크 또는 영상 ID
                </label>
                <input
                  name="youtubeId"
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                설교 요약
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="간단한 설교 설명이나 요약을 적어 주세요"
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <input type="hidden" name="thumbnail" value="" />
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
          <div className="mb-4 flex items-center gap-2">
            <Video size={18} style={{ color: '#7C3AED' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              등록된 설교 {sermons.length}개
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {sermons.map(sermon => (
              <details
                key={sermon.id}
                className="group rounded-[1.5rem] border bg-white p-5"
                style={{ borderColor: '#E2E8F0' }}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}
                    >
                      <Play size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}
                        >
                          {sermon.category}
                        </span>
                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                          {sermon.date}
                        </span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                        {sermon.title}
                      </p>
                      <p className="mt-1 text-xs leading-6" style={{ color: '#64748B' }}>
                        {sermon.preacher}
                        {sermon.youtubeId ? ` · ${sermon.youtubeId}` : ' · 링크 없음'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                    수정
                  </span>
                </summary>

                <div className="mt-5 border-t pt-5" style={{ borderColor: '#F1F5F9' }}>
                  <form action={updateSermon.bind(null, sermon.id)} className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          카테고리
                        </label>
                        <select
                          name="category"
                          defaultValue={sermon.category}
                          required
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        >
                          {SERMON_CATEGORIES.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          설교자
                        </label>
                        <input
                          name="preacher"
                          type="text"
                          defaultValue={sermon.preacher}
                          required
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        설교 제목
                      </label>
                      <input
                        name="title"
                        type="text"
                        defaultValue={sermon.title}
                        required
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          날짜
                        </label>
                        <input
                          name="date"
                          type="date"
                          defaultValue={sermon.date}
                          required
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          유튜브 링크 또는 ID
                        </label>
                        <input
                          name="youtubeId"
                          type="text"
                          defaultValue={sermon.youtubeId}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        설교 요약
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        defaultValue={sermon.description}
                        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <input type="hidden" name="thumbnail" value={sermon.thumbnail} />
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
                    <form action={deleteSermon.bind(null, sermon.id)}>
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

            {sermons.length === 0 ? (
              <div className="rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: '#E2E8F0' }}>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  등록된 설교 영상이 없습니다.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
