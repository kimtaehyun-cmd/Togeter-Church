import { Clock3, PlusCircle, Save, Trash2 } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { createWorshipSection, deleteWorshipSection, updateWorshipSection } from '@/lib/actions';
import { getWorshipSchedule } from '@/lib/data';

function toServiceTextareaValue(
  services: Array<{ name: string; time: string; location: string; note: string }>,
) {
  return services.map(service => [service.name, service.time, service.location, service.note].join(' | ')).join('\n');
}

export default function AdminWorshipPage() {
  const schedule = getWorshipSchedule();

  return (
    <AdminShell
      title="예배 시간표 관리"
      description="예배 구분, 설명, 시간표를 직접 수정할 수 있습니다. 시간표는 한 줄에 `이름 | 시간 | 장소 | 비고` 형식으로 입력하면 됩니다."
    >
      <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-5 flex items-center gap-2">
            <PlusCircle size={18} style={{ color: '#BE123C' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              예배 섹션 추가
            </h2>
          </div>
          <form action={createWorshipSection} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                섹션 이름
              </label>
              <input
                name="day"
                type="text"
                placeholder="주일 예배"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                설명
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="해당 예배 섹션에 대한 간단한 설명"
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                예배 항목
              </label>
              <textarea
                name="services"
                rows={7}
                placeholder={'1부 예배 | 오전 9:30 | 본당 | 장년 중심\n2부 예배 | 오전 11:00 | 본당 | 처음 방문 추천'}
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-7 outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
              <p className="mt-2 text-xs leading-5" style={{ color: '#94A3B8' }}>
                한 줄에 하나씩 입력해 주세요. `이름 | 시간 | 장소 | 비고` 순서입니다.
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 self-end rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#BE123C' }}
            >
              <PlusCircle size={16} />
              추가하기
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock3 size={18} style={{ color: '#BE123C' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              예배 섹션 {schedule.length}개
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {schedule.map(section => (
              <details
                key={section.id}
                className="group rounded-[1.5rem] border bg-white p-5"
                style={{ borderColor: '#E2E8F0' }}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: '#FFE4E6', color: '#BE123C' }}
                      >
                        예배 {section.services.length}개
                      </span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                      {section.day}
                    </p>
                    <p className="mt-1 text-xs leading-6" style={{ color: '#64748B' }}>
                      {section.description}
                    </p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                    수정
                  </span>
                </summary>

                <div className="mt-5 border-t pt-5" style={{ borderColor: '#F1F5F9' }}>
                  <form action={updateWorshipSection.bind(null, section.id)} className="flex flex-col gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        섹션 이름
                      </label>
                      <input
                        name="day"
                        type="text"
                        defaultValue={section.day}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        설명
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={section.description}
                        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                        예배 항목
                      </label>
                      <textarea
                        name="services"
                        rows={Math.max(5, section.services.length + 2)}
                        defaultValue={toServiceTextareaValue(section.services)}
                        className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-7 outline-none"
                        style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#BE123C' }}
                      >
                        <Save size={15} />
                        저장
                      </button>
                    </div>
                  </form>
                  <div className="mt-3 flex justify-end">
                    <form action={deleteWorshipSection.bind(null, section.id)}>
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
