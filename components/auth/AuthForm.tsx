'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { type AuthFormState, login, signup } from '@/lib/auth-actions';

type AuthFormProps = {
  mode: 'login' | 'signup';
};

const initialState: AuthFormState = {
  status: 'idle',
};

function SubmitButton({ mode }: { mode: AuthFormProps['mode'] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background: 'linear-gradient(135deg, #8B5E34 0%, #B98954 100%)',
        boxShadow: '0 16px 32px rgba(139, 94, 52, 0.22)',
      }}
    >
      {mode === 'login' ? <LockKeyhole size={16} /> : <ShieldCheck size={16} />}
      {pending ? '처리 중...' : mode === 'login' ? '로그인하기' : '계정 만들기'}
      {!pending ? <ArrowRight size={15} /> : null}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs font-medium" style={{ color: '#B91C1C' }}>
      {message}
    </p>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === 'login' ? login : signup;
  const [state, formAction] = useActionState(action, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '';
  const isLogin = mode === 'login';

  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-[2rem] border bg-white p-7 shadow-[0_24px_60px_rgba(57,43,31,0.12)] md:p-8"
      style={{ borderColor: '#EEE4D7' }}
    >
      <div
        className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(185, 137, 84, 0.18)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(139, 94, 52, 0.1)' }}
      />

      <div className="relative z-10">
        <div className="mb-6">
          <div className="mb-4 flex justify-end">
            <Link
              href="/"
              className="inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200"
              style={{
                borderColor: '#E7D8C8',
                color: '#8B5E34',
                backgroundColor: '#FFF8F1',
              }}
            >
              메인으로 이동
            </Link>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #F5EBDD 0%, #FAF3EA 100%)',
                color: '#8B5E34',
              }}
            >
              {isLogin ? <LockKeyhole size={20} /> : <UserRound size={20} />}
            </div>
            <div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ backgroundColor: '#FFF8F1', color: '#8B5E34' }}
              >
                <Sparkles size={12} />
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </span>
            </div>
          </div>

          <h1
            className="text-2xl font-bold md:text-[1.9rem]"
            style={{ color: '#1E1B4B', lineHeight: 1.15 }}
          >
            {isLogin ? '로그인을 시작해요' : '함께가는교회 계정을 만들어요'}
          </h1>
          <p className="mt-3 text-sm leading-7" style={{ color: '#64748B' }}>
            {isLogin
              ? '로그인 후 교회 소식, 커뮤니티, 새가족 등록 등 필요한 메뉴를 더 편하게 이용할 수 있습니다.'
              : '계정을 만들면 교회 홈페이지의 주요 메뉴를 더 편하게 이용할 수 있습니다.'}
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          {!isLogin ? (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                이름
              </label>
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
              >
                <UserRound size={18} style={{ color: '#8B5E34' }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="이름을 입력해 주세요"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: '#1E1B4B' }}
                />
              </div>
              <FieldError message={state.errors?.name} />
            </div>
          ) : null}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              이메일
            </label>
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
            >
              <Mail size={18} style={{ color: '#8B5E34' }} />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={state.errors?.email} />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              비밀번호
            </label>
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
            >
              <KeyRound size={18} style={{ color: '#8B5E34' }} />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder={isLogin ? '비밀번호를 입력해 주세요' : '영문+숫자 포함 8자 이상'}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={state.errors?.password} />
          </div>

          {!isLogin ? (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                비밀번호 확인
              </label>
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
              >
                <ShieldCheck size={18} style={{ color: '#8B5E34' }} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="비밀번호를 한 번 더 입력해 주세요"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: '#1E1B4B' }}
                />
              </div>
              <FieldError message={state.errors?.confirmPassword} />
            </div>
          ) : null}

          {state.message ? (
            <div
              className="rounded-2xl border px-4 py-3 text-sm leading-6"
              style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2', color: '#B91C1C' }}
            >
              {state.message}
            </div>
          ) : null}

          <div
            className="rounded-2xl border px-4 py-3 text-xs leading-6"
            style={{ borderColor: '#EEE4D7', backgroundColor: '#FFF8F1', color: '#6B7280' }}
          >
            {isLogin
              ? '로그인 상태는 안전하게 유지되며, 이용 가능한 메뉴는 계정 상태에 따라 달라질 수 있습니다.'
              : '비밀번호는 안전하게 저장되며 로그인은 보안 쿠키 세션으로 유지됩니다.'}
          </div>

          <SubmitButton mode={mode} />
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: '#64748B' }}>
          {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <Link
            href={
              isLogin
                ? `/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`
                : `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`
            }
            className="font-semibold"
            style={{ color: '#8B5E34' }}
          >
            {isLogin ? '회원가입' : '로그인'}
          </Link>
        </div>
      </div>
    </div>
  );
}
