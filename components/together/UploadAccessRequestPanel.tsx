'use client';

import { useActionState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

import {
  requestTogetherUploadAccess,
  type TogetherUploadAccessFormState,
} from '@/lib/auth-actions';

type UploadAccessRequestPanelProps = {
  initialPending: boolean;
};

const initialState: TogetherUploadAccessFormState = {
  status: 'idle',
};

export default function UploadAccessRequestPanel({
  initialPending,
}: UploadAccessRequestPanelProps) {
  const [state, action, isPending] = useActionState(requestTogetherUploadAccess, initialState);
  const requestIsPending = initialPending || state.status === 'success';
  const message =
    state.message ??
    (initialPending
      ? '이미 관리자에게 글 등록 권한을 요청했습니다.'
      : '관리자 승인 후 함께함 글을 등록할 수 있습니다.');
  const success = state.status === 'success' || initialPending;

  return (
    <div
      className="rounded-[2rem] border bg-white p-7 shadow-sm md:p-8"
      style={{ borderColor: '#EEE4D7' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: success ? '#DCFCE7' : '#FEF3C7', color: success ? '#15803D' : '#92400E' }}
        >
          {success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1E1B4B]">글 등록 권한이 필요합니다</h2>
          <p className="mt-3 text-sm leading-7 text-[#64748B]">{message}</p>
        </div>
      </div>

      {!requestIsPending ? (
        <form action={action} className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E1B4B] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={15} />
            {isPending ? '요청 중...' : '관리자에게 권한 요청하기'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
