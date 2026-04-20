import { ImageIcon, PlusCircle, Save, Trash2 } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { createSliderItem, deleteSliderItem, updateSliderItem } from '@/lib/actions';
import { getSliderItems } from '@/lib/data';

export default function AdminSliderPage() {
  const sliderItems = getSliderItems();

  return (
    <AdminShell
      title="메인 슬라이더 관리"
      description="메인 비주얼 문구, 버튼 텍스트, 연결 링크, 이미지 경로, 노출 순서를 직접 수정할 수 있습니다."
    >
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-5 flex items-center gap-2">
            <PlusCircle size={18} style={{ color: '#0369A1' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              새 슬라이드 추가
            </h2>
          </div>
          <form action={createSliderItem} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  상단 라벨
                </label>
                <input
                  name="eyebrow"
                  type="text"
                  defaultValue="Welcome"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  강조 색상
                </label>
                <input
                  name="accent"
                  type="text"
                  defaultValue="#F6EBDC"
                  placeholder="#F6EBDC"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                제목
              </label>
              <textarea
                name="title"
                rows={3}
                required
                placeholder="줄바꿈이 필요하면 Enter로 입력해 주세요"
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                설명
              </label>
              <textarea
                name="description"
                rows={4}
                required
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                이미지 경로
              </label>
              <input
                name="imagePath"
                type="text"
                defaultValue="/image/church-background.png"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  첫 번째 버튼
                </label>
                <input
                  name="primaryLabel"
                  type="text"
                  placeholder="예배 안내 보기"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  첫 번째 링크
                </label>
                <input
                  name="primaryHref"
                  type="text"
                  defaultValue="/worship"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  두 번째 버튼
                </label>
                <input
                  name="secondaryLabel"
                  type="text"
                  placeholder="교회 소개"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  두 번째 링크
                </label>
                <input
                  name="secondaryHref"
                  type="text"
                  defaultValue="/about"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  노출 순서
                </label>
                <input
                  name="order"
                  type="number"
                  min="1"
                  defaultValue={sliderItems.length + 1}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <label className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
                <input type="checkbox" name="active" value="true" defaultChecked className="h-4 w-4 accent-sky-600" />
                바로 노출하기
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 self-end rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#0369A1' }}
            >
              <PlusCircle size={16} />
              추가하기
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon size={18} style={{ color: '#0369A1' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              슬라이드 목록 {sliderItems.length}개
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {sliderItems.map(item => (
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
                        style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}
                      >
                        순서 {item.order}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: item.active ? '#ECFDF3' : '#F1F5F9',
                          color: item.active ? '#15803D' : '#64748B',
                        }}
                      >
                        {item.active ? '노출 중' : '비노출'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold whitespace-pre-line" style={{ color: '#1E1B4B' }}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-6" style={{ color: '#64748B' }}>
                      {item.primaryLabel} → {item.primaryHref}
                    </p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                    수정
                  </span>
                </summary>

                <div className="mt-5 border-t pt-5" style={{ borderColor: '#F1F5F9' }}>
                  <form action={updateSliderItem.bind(null, item.id)} className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          상단 라벨
                        </label>
                        <input
                          name="eyebrow"
                          type="text"
                          defaultValue={item.eyebrow}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          강조 색상
                        </label>
                        <input
                          name="accent"
                          type="text"
                          defaultValue={item.accent}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        제목
                      </label>
                      <textarea
                        name="title"
                        rows={3}
                        defaultValue={item.title}
                        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        설명
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        defaultValue={item.description}
                        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        이미지 경로
                      </label>
                      <input
                        name="imagePath"
                        type="text"
                        defaultValue={item.imagePath}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          첫 번째 버튼
                        </label>
                        <input
                          name="primaryLabel"
                          type="text"
                          defaultValue={item.primaryLabel}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          첫 번째 링크
                        </label>
                        <input
                          name="primaryHref"
                          type="text"
                          defaultValue={item.primaryHref}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          두 번째 버튼
                        </label>
                        <input
                          name="secondaryLabel"
                          type="text"
                          defaultValue={item.secondaryLabel}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          두 번째 링크
                        </label>
                        <input
                          name="secondaryHref"
                          type="text"
                          defaultValue={item.secondaryHref}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                          노출 순서
                        </label>
                        <input
                          name="order"
                          type="number"
                          min="1"
                          defaultValue={item.order}
                          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                        />
                      </div>
                      <label className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
                        <input
                          type="checkbox"
                          name="active"
                          value="true"
                          defaultChecked={item.active}
                          className="h-4 w-4 accent-sky-600"
                        />
                        노출 유지
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#0369A1' }}
                      >
                        <Save size={15} />
                        저장
                      </button>
                    </div>
                  </form>
                  <div className="mt-3 flex justify-end">
                    <form action={deleteSliderItem.bind(null, item.id)}>
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
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
