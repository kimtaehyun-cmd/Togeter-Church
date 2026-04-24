'use client';

import Link from 'next/link';
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

import { createInitialAdmin, type AdminSetupFormState } from '@/lib/auth-actions';

type AdminSetupFormProps = {
  nextPath: string;
  setupKeyConfigured: boolean;
};

const initialState: AdminSetupFormState = {
  status: 'idle',
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #3B2F80 100%)',
        boxShadow: '0 16px 32px rgba(30, 27, 75, 0.24)',
      }}
    >
      <ShieldCheck size={16} />
      {pending ? '설정 중...' : '초기 관리자 계정 만들기'}
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

export default function AdminSetupForm({
  nextPath,
  setupKeyConfigured,
}: AdminSetupFormProps) {
  const [state, formAction] = useActionState(createInitialAdmin, initialState);

  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-[2rem] border bg-white p-7 shadow-[0_24px_60px_rgba(57,43,31,0.12)] md:p-8"
      style={{ borderColor: '#EEE4D7' }}
    >
      <div
        className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(59, 47, 128, 0.14)' }}
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
                background: 'linear-gradient(135deg, #E8E6FF 0%, #F3F1FF 100%)',
                color: '#1E1B4B',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ backgroundColor: '#F5F3FF', color: '#3B2F80' }}
              >
                <Sparkles size={12} />
                Initial Admin Setup
              </span>
            </div>
          </div>

          <h1
            className="text-2xl font-bold md:text-[1.9rem]"
            style={{ color: '#1E1B4B', lineHeight: 1.15 }}
          >
            첫 관리자 계정을 설정합니다
          </h1>
          <p className="mt-3 text-sm leading-7" style={{ color: '#64748B' }}>
            이 페이지는 초기 관리자 계정을 1회만 생성하기 위한 설정 페이지입니다.
            설정 키를 알고 있는 운영자만 계정을 만들 수 있습니다.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={nextPath} />

          <div>
            <label
              htmlFor="setupKey"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              설정 키
            </label>
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
            >
              <LockKeyhole size={18} style={{ color: '#3B2F80' }} />
              <input
                id="setupKey"
                name="setupKey"
                type="password"
                required
                placeholder="ADMIN_SETUP_KEY"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={state.errors?.setupKey} />
          </div>

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
                placeholder="관리자 이름"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={state.errors?.name} />
          </div>

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
                placeholder="admin@example.com"
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
                placeholder="영문+숫자 포함 8자 이상"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={state.errors?.password} />
          </div>

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
            {setupKeyConfigured
              ? '초기 설정이 완료되면 이 페이지는 자동으로 비활성화됩니다.'
              : '서버에 ADMIN_SETUP_KEY가 설정되어 있어야 초기 관리자 설정을 진행할 수 있습니다.'}
          </div>

          <SubmitButton disabled={!setupKeyConfigured} />
        </form>
      </div>
    </div>
  );
}
