import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';

import { logout } from '@/lib/auth-actions';
import { getCurrentUser } from '@/lib/auth';

type AdminShellProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default async function AdminShell({
  title,
  description,
  backHref = '/admin',
  backLabel = '관리자 홈',
  actions,
  children,
}: AdminShellProps) {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7FF' }}>
      <header className="border-b bg-white" style={{ borderColor: '#E2E8F0' }}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
              style={{ color: '#64748B' }}
            >
              <ArrowLeft size={16} />
              {backLabel}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="hidden rounded-full px-3 py-1.5 text-xs font-medium md:block" style={{ backgroundColor: '#F8F7FF', color: '#475569' }}>
                {currentUser.name} · {currentUser.role === 'admin' ? '관리자' : '회원'}
              </div>
            ) : null}
            <Link href="/" className="text-sm transition-colors duration-200" style={{ color: '#64748B' }}>
              사이트로 돌아가기
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: '#FFFFFF' }}
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border bg-white p-6 md:flex-row md:items-end md:justify-between" style={{ borderColor: '#E2E8F0' }}>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}
              >
                <Settings size={18} />
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#F8F7FF', color: '#7C3AED' }}>
                Admin
              </span>
            </div>
            <h1 className="text-2xl font-bold md:text-3xl" style={{ color: '#1E1B4B' }}>
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: '#64748B' }}>
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {children}
      </div>
    </div>
  );
}
