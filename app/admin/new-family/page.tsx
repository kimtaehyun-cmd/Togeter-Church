import { 
  Calendar, 
  Trash2, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import { deleteNewFamilyRegistration } from '@/lib/actions';
import { getNewFamilyRegistrations } from '@/lib/data';

export default function AdminNewFamilyPage() {
  const registrations = getNewFamilyRegistrations().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <AdminShell
      title="새가족 등록 관리"
      description="온라인으로 접수된 새가족 신청 및 정착 상담 정보를 확인하고 관리합니다."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#0284C7' }}>전체 신청건수</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>{registrations.length}</p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#8B5E34' }}>최근 7일 신청</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
            {registrations.filter(r => {
              const date = new Date(r.createdAt);
              const now = new Date();
              return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length}
          </p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#10B981' }}>연락 동의 완료</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>{registrations.filter(r => r.agreedToContact).length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {registrations.map(reg => (
          <article
            key={reg.id}
            className="group overflow-hidden rounded-[2rem] border bg-white shadow-sm transition-all hover:shadow-md"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Header/Status Area */}
              <div className="bg-[#FBFAF8] p-6 lg:w-64 border-b lg:border-b-0 lg:border-r" style={{ borderColor: '#F1F5F9' }}>
                <div className="mb-4 flex items-center justify-between lg:block">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                    NEW
                  </span>
                  <p className="mt-3 text-xs font-semibold text-[#94A3B8] lg:block">접수일: {new Date(reg.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                
                <h2 className="text-2xl font-bold text-[#1E1B4B]">{reg.name}</h2>
                <p className="mt-1 text-sm font-medium text-[#8B5E34]">{reg.birthDate}</p>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#475569] border" style={{ borderColor: '#EEE4D7' }}>
                    {reg.registrationType}
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#475569] border" style={{ borderColor: '#EEE4D7' }}>
                    {reg.preferredDepartment}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="flex-1 p-6 md:p-8">
                <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        <Phone size={14} /> 연락처 정보
                      </h3>
                      <p className="text-lg font-semibold text-[#1E1B4B]">{reg.phone}</p>
                      {reg.agreedToContact && (
                        <p className="mt-1 text-xs font-medium text-emerald-600">✓ 안내 연락 동의함</p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        <MapPin size={14} /> 거주 주소
                      </h3>
                      <p className="text-sm font-medium leading-relaxed text-[#475569]">
                        {reg.address}<br />
                        {reg.detailAddress}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        <Calendar size={14} /> 첫 방문 정보
                      </h3>
                      <p className="text-sm font-semibold text-[#1E1B4B]">방문일: {reg.firstVisitDate || '미입력'}</p>
                      <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-[#64748B]">
                        <Users size={14} />
                        <span>인도자: <strong>{reg.inviterName || '없음'}</strong> {reg.inviterPhone && `(${reg.inviterPhone})`}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        <Heart size={14} /> 기도 제목 및 남기실 말
                      </h3>
                      <p className="text-sm leading-relaxed text-[#475569] italic whitespace-pre-wrap">
                        {reg.prayerRequest || '내용이 없습니다.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-end border-t pt-6" style={{ borderColor: '#F1F5F9' }}>
                  <form action={deleteNewFamilyRegistration.bind(null, reg.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      기록 삭제
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </article>
        ))}

        {registrations.length === 0 && (
          <div className="rounded-[2.5rem] border border-dashed py-24 text-center" style={{ borderColor: '#E2E8F0' }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F7FF]" style={{ color: '#0284C7' }}>
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#1E1B4B]">접수된 신청 내역이 없습니다.</h3>
            <p className="mt-2 text-sm text-[#94A3B8]">온라인 신청서가 작성되면 이곳에 실시간으로 표시됩니다.</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
