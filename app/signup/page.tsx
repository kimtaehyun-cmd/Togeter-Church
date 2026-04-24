import { Suspense } from 'react';

import { redirectIfAuthenticated } from '@/lib/auth';
import AuthForm from '@/components/auth/AuthForm';

type SignupPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function AuthFormFallback() {
  return (
    <div
      className="w-full max-w-md rounded-[2rem] border bg-white p-7 md:p-8"
      style={{ borderColor: '#EEE4D7' }}
    >
      <p className="text-sm" style={{ color: '#64748B' }}>
        회원가입 화면을 준비하고 있습니다...
      </p>
    </div>
  );
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams;
  await redirectIfAuthenticated(getSingleQueryValue(resolvedSearchParams.next));

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(180deg, #FFFDF9 0%, #F7F1E8 100%)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1400px] items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
          <section>
            <span
              className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              Join Us
            </span>
            <h1
              className="mt-5 text-4xl font-bold md:text-5xl"
              style={{ color: '#1E1B4B', lineHeight: 1.1 }}
            >
              함께가는교회
              <br />
              계정을 만들어 보세요
            </h1>
            <p
              className="mt-5 max-w-2xl text-sm leading-8 md:text-base"
              style={{ color: '#5F6570' }}
            >
              계정을 만들면 교회 소식 확인, 함께함 갤러리 이용, 새가족 등록 등
              홈페이지 주요 기능을 더 편하게 이용할 수 있습니다.
            </p>
          </section>

          <div className="flex justify-center lg:justify-end">
            <Suspense fallback={<AuthFormFallback />}>
              <AuthForm mode="signup" />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
