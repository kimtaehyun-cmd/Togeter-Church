import { redirect } from 'next/navigation';

import AdminSetupForm from '@/components/admin/AdminSetupForm';
import { getCurrentUser, hasAdminUser, resolvePostLoginPath } from '@/lib/auth';

type AdminSetupPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function AdminSetupPage({ searchParams }: AdminSetupPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSingleQueryValue(resolvedSearchParams.next) || '/admin';
  const currentUser = await getCurrentUser();

  if (hasAdminUser()) {
    if (currentUser?.role === 'admin') {
      redirect(resolvePostLoginPath(currentUser, nextPath));
    }

    if (currentUser) {
      redirect('/');
    }

    redirect(`/login?next=${encodeURIComponent(nextPath || '/admin')}`);
  }

  const setupKeyConfigured = Boolean(process.env.ADMIN_SETUP_KEY?.trim());

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(180deg, #FFFDF9 0%, #F3F0FF 100%)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1400px] items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
          <section>
            <span
              className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ backgroundColor: '#F1EBFF', color: '#3B2F80' }}
            >
              One-time Setup
            </span>
            <h1
              className="mt-5 text-4xl font-bold md:text-5xl"
              style={{ color: '#1E1B4B', lineHeight: 1.1 }}
            >
              관리자 초기 설정을
              <br />
              먼저 완료해 주세요
            </h1>
            <p
              className="mt-5 max-w-2xl text-sm leading-8 md:text-base"
              style={{ color: '#5F6570' }}
            >
              아직 관리자 계정이 생성되지 않아 운영 화면을 열 수 없습니다. 운영자가
              서버에 설정한 `ADMIN_SETUP_KEY`를 입력하면 첫 관리자 계정을 1회성으로
              만들 수 있습니다.
            </p>
          </section>

          <div className="flex justify-center lg:justify-end">
            <AdminSetupForm nextPath={nextPath} setupKeyConfigured={setupKeyConfigured} />
          </div>
        </div>
      </div>
    </main>
  );
}
