import { Activity, ShieldCheck } from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import AdminAccessPanel from '@/components/admin/AdminAccessPanel';
import { requireAdmin } from '@/lib/auth';
import { getAdminActivityLogs, getUsers } from '@/lib/data';
import { toPublicUser } from '@/lib/user-permissions';

export default async function AdminAccessPage() {
  const currentUser = await requireAdmin('/admin/access');
  const admins = getUsers()
    .filter(user => user.role === 'admin')
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(toPublicUser);
  const logs = getAdminActivityLogs().slice(0, 24);

  return (
    <AdminShell
      title="관리자 접근 관리"
      description="관리자 계정 추가와 비밀번호 변경, 최근 운영 로그를 한 화면에서 확인할 수 있도록 정리했습니다."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#4338CA' }}>
            관리자 계정 수
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
            {admins.length}
          </p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#0369A1' }}>
            최근 로그
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: '#1E1B4B' }}>
            {logs.length}
          </p>
        </div>
        <div className="rounded-[1.5rem] border bg-white p-5" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold" style={{ color: '#047857' }}>
            현재 로그인
          </p>
          <p className="mt-2 text-lg font-bold" style={{ color: '#1E1B4B' }}>
            {currentUser.name}
          </p>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            {currentUser.email}
          </p>
        </div>
      </div>

      <AdminAccessPanel admins={admins} currentUserId={currentUser.id} />

      <section
        className="mt-6 rounded-[1.75rem] border bg-white p-6"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#F8FAFC', color: '#0F172A' }}
          >
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
              최근 관리자 활동 로그
            </h2>
            <p className="text-sm" style={{ color: '#64748B' }}>
              로그인, 관리자 계정 변경, 주요 운영 액션을 최근 순서대로 보여줍니다.
            </p>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map(log => (
              <article
                key={log.id}
                className="rounded-2xl border px-4 py-4"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FCFCFF' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}
                      >
                        {log.targetType || 'system'}
                      </span>
                      <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                        {log.summary}
                      </p>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
                      {log.actorName} · {log.actorEmail}
                    </p>
                  </div>
                  <time className="text-xs" style={{ color: '#94A3B8' }}>
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl border border-dashed px-6 py-12 text-center"
            style={{ borderColor: '#CBD5E1' }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-bold" style={{ color: '#1E1B4B' }}>
              아직 기록된 관리자 로그가 없습니다.
            </h3>
            <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
              관리자 로그인이나 주요 관리 작업이 발생하면 이곳에 표시됩니다.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
