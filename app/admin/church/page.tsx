import { MapPinned, Save } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { updateChurchProfile } from '@/lib/actions';
import { getChurchProfile } from '@/lib/data';

export default function AdminChurchPage() {
  const profile = getChurchProfile();

  return (
    <AdminShell
      title="교회 소개 관리"
      description="교회 이름, 담임목사 정보, 인사말, 표어, 주소, 연락처, 지도 링크를 한 번에 수정할 수 있습니다."
    >
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-4 flex items-center gap-2">
            <MapPinned size={18} style={{ color: '#15803D' }} />
            <h2 className="font-bold" style={{ color: '#1E1B4B' }}>
              현재 요약
            </h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
              <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
                교회 이름
              </p>
              <p className="mt-2 font-semibold" style={{ color: '#1E1B4B' }}>
                {profile.churchName}
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
              <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
                담임목사
              </p>
              <p className="mt-2 font-semibold" style={{ color: '#1E1B4B' }}>
                {profile.pastorName} {profile.pastorRole}
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
              <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
                표어
              </p>
              <p className="mt-2 leading-7" style={{ color: '#475569' }}>
                {profile.slogan}
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#F8FAFC' }}>
              <p className="text-xs font-semibold" style={{ color: '#15803D' }}>
                주소/연락처
              </p>
              <p className="mt-2 leading-7" style={{ color: '#475569' }}>
                {profile.address}
              </p>
              <p className="mt-1" style={{ color: '#475569' }}>
                {profile.phone}
              </p>
              <p className="mt-1" style={{ color: '#475569' }}>
                {profile.email}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
          <form action={updateChurchProfile} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  교회 이름
                </label>
                <input
                  name="churchName"
                  type="text"
                  defaultValue={profile.churchName}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  표어
                </label>
                <input
                  name="slogan"
                  type="text"
                  defaultValue={profile.slogan}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  담임목사 이름
                </label>
                <input
                  name="pastorName"
                  type="text"
                  defaultValue={profile.pastorName}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  직함
                </label>
                <input
                  name="pastorRole"
                  type="text"
                  defaultValue={profile.pastorRole}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  인사말 라벨
                </label>
                <input
                  name="greetingLabel"
                  type="text"
                  defaultValue={profile.greetingLabel}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  인사말 제목
                </label>
                <input
                  name="greetingTitle"
                  type="text"
                  defaultValue={profile.greetingTitle}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                인사말 본문
              </label>
              <textarea
                name="greetingBody"
                rows={10}
                defaultValue={profile.greetingBody}
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-7 outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  주소
                </label>
                <input
                  name="address"
                  type="text"
                  defaultValue={profile.address}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  전화번호
                </label>
                <input
                  name="phone"
                  type="text"
                  defaultValue={profile.phone}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  이메일
                </label>
                <input
                  name="email"
                  type="text"
                  defaultValue={profile.email}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                  지도 열기 링크
                </label>
                <input
                  name="mapDirectionsUrl"
                  type="text"
                  defaultValue={profile.mapDirectionsUrl}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#475569' }}>
                지도 임베드 URL
              </label>
              <textarea
                name="mapEmbedUrl"
                rows={3}
                defaultValue={profile.mapEmbedUrl}
                className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-7 outline-none"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', color: '#1E1B4B' }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: '#15803D' }}
              >
                <Save size={15} />
                저장하기
              </button>
            </div>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
