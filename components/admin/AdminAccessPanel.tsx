'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { BadgeCheck, KeyRound, Mail, ShieldCheck, UserPlus2, UserRound } from 'lucide-react';

import {
  changeAdminPassword,
  createOrPromoteAdmin,
  type AdminManagementFormState,
  type AdminPasswordFormState,
} from '@/lib/auth-actions';
import type { PublicUser } from '@/lib/user-permissions';

type AdminAccessPanelProps = {
  admins: PublicUser[];
  currentUserId: string;
};

const initialPasswordState: AdminPasswordFormState = {
  status: 'idle',
};

const initialManagementState: AdminManagementFormState = {
  status: 'idle',
};

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

function ActionMessage({
  state,
}: {
  state: AdminPasswordFormState | AdminManagementFormState;
}) {
  if (!state.message || state.status === 'idle') {
    return null;
  }

  const success = state.status === 'success';

  return (
    <div
      className="rounded-2xl border px-4 py-3 text-sm leading-6"
      style={{
        borderColor: success ? '#BBF7D0' : '#FECACA',
        backgroundColor: success ? '#F0FDF4' : '#FEF2F2',
        color: success ? '#166534' : '#B91C1C',
      }}
    >
      {state.message}
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #3B2F80 100%)',
        boxShadow: '0 16px 28px rgba(30, 27, 75, 0.18)',
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function AdminAccessPanel({
  admins,
  currentUserId,
}: AdminAccessPanelProps) {
  const [passwordState, passwordAction] = useActionState(
    changeAdminPassword,
    initialPasswordState,
  );
  const [managementState, managementAction] = useActionState(
    createOrPromoteAdmin,
    initialManagementState,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section
          className="rounded-[1.75rem] border bg-white p-6"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
                현재 관리자 계정
              </h2>
              <p className="text-sm" style={{ color: '#64748B' }}>
                운영 권한이 있는 계정만 이 화면에 표시됩니다.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {admins.map(admin => (
              <div
                key={admin.id}
                className="rounded-2xl border px-4 py-4"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FBFAFF' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                        {admin.name}
                      </p>
                      {admin.id === currentUserId ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ backgroundColor: '#EDE9FE', color: '#5B21B6' }}
                        >
                          현재 로그인
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                      {admin.email}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: '#ECFDF5', color: '#047857' }}
                  >
                    <BadgeCheck size={13} />
                    관리자
                  </span>
                </div>
                <p className="mt-3 text-xs" style={{ color: '#94A3B8' }}>
                  생성일 {new Date(admin.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-[1.75rem] border bg-white p-6"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
                내 비밀번호 변경
              </h2>
              <p className="text-sm" style={{ color: '#64748B' }}>
                현재 로그인한 관리자 계정의 비밀번호를 바로 바꿀 수 있습니다.
              </p>
            </div>
          </div>

          <form action={passwordAction} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                현재 비밀번호
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC', color: '#1E1B4B' }}
              />
              <FieldError message={passwordState.errors?.currentPassword} />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                새 비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC', color: '#1E1B4B' }}
              />
              <FieldError message={passwordState.errors?.password} />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                새 비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC', color: '#1E1B4B' }}
              />
              <FieldError message={passwordState.errors?.confirmPassword} />
            </div>

            <ActionMessage state={passwordState} />

            <SubmitButton label="비밀번호 변경" pendingLabel="변경 중..." />
          </form>
        </section>
      </div>

      <section
        className="rounded-[1.75rem] border bg-white p-6"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#EEF6FF', color: '#0369A1' }}
          >
            <UserPlus2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
              관리자 계정 추가 또는 승격
            </h2>
            <p className="text-sm" style={{ color: '#64748B' }}>
              기존 회원 이메일을 입력하면 관리자 권한을 부여하고, 없는 이메일이면 새 관리자 계정을 만듭니다.
            </p>
          </div>
        </div>

        <form action={managementAction} className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="admin-name"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              이름
            </label>
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
            >
              <UserRound size={18} style={{ color: '#8B5E34' }} />
              <input
                id="admin-name"
                name="name"
                type="text"
                placeholder="새 계정일 때 필수"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={managementState.errors?.name} />
          </div>

          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              이메일
            </label>
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC' }}
            >
              <Mail size={18} style={{ color: '#8B5E34' }} />
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={managementState.errors?.email} />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              초기 비밀번호
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              placeholder="새 계정일 때 필수, 승격 시 선택"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC', color: '#1E1B4B' }}
            />
            <FieldError message={managementState.errors?.password} />
          </div>

          <div>
            <label
              htmlFor="admin-confirm-password"
              className="mb-1.5 block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              비밀번호 확인
            </label>
            <input
              id="admin-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력해 주세요"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FCFCFC', color: '#1E1B4B' }}
            />
            <FieldError message={managementState.errors?.confirmPassword} />
          </div>

          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border px-4 py-3 text-xs leading-6"
              style={{ borderColor: '#DBEAFE', backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
            >
              이미 가입된 일반 회원 이메일이면 관리자 권한만 추가됩니다. 비밀번호를 함께 입력하면
              관리자 승격과 동시에 비밀번호도 새로 설정할 수 있습니다.
            </div>
          </div>

          <div className="lg:col-span-2">
            <ActionMessage state={managementState} />
          </div>

          <div className="lg:col-span-2">
            <SubmitButton label="관리자 계정 반영" pendingLabel="처리 중..." />
          </div>
        </form>
      </section>
    </div>
  );
}
