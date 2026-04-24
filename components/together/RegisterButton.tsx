'use client';

import { useActionState, useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  requestTogetherUploadAccess,
  type TogetherUploadAccessFormState,
} from '@/lib/auth-actions';

interface RegisterButtonProps {
  isLoggedIn: boolean;
  canUpload: boolean;
  hasPendingRequest: boolean;
}

const initialState: TogetherUploadAccessFormState = {
  status: 'idle',
};

export default function RegisterButton({
  isLoggedIn,
  canUpload,
  hasPendingRequest,
}: RegisterButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [requestState, requestAction, isRequestPending] = useActionState(
    requestTogetherUploadAccess,
    initialState,
  );

  const visibleMessage = requestState.message ?? message;

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setMessage('로그인 후 이용할 수 있습니다.');
      return;
    }

    if (canUpload) {
      router.push('/together/upload');
      return;
    }

    setMessage(
      hasPendingRequest
        ? '이미 관리자에게 글 등록 권한을 요청했습니다.'
        : '함께함 글 등록 권한이 없습니다. 관리자에게 권한을 요청해 주세요.',
    );
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 rounded-2xl bg-[#8B5E34] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:opacity-90 cursor-pointer"
      >
        <Plus size={20} />
        <span>사진 등록하기</span>
      </button>

      {visibleMessage ? (
        <div
          role="status"
          className="w-full rounded-2xl border px-4 py-3 text-sm shadow-sm"
          style={{
            borderColor: requestState.status === 'success' ? '#BBF7D0' : '#FDE68A',
            backgroundColor: requestState.status === 'success' ? '#F0FDF4' : '#FFFBEB',
            color: requestState.status === 'success' ? '#166534' : '#92400E',
          }}
        >
          <div className="flex items-start gap-2">
            {requestState.status === 'success' ? (
              <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            ) : (
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-6">{visibleMessage}</p>
              {!isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => router.push('/login?next=/together/upload')}
                  className="mt-2 rounded-xl bg-[#1E1B4B] px-3 py-2 text-xs font-bold text-white"
                >
                  로그인하러 가기
                </button>
              ) : !canUpload && !hasPendingRequest && requestState.status !== 'success' ? (
                <form action={requestAction} className="mt-2">
                  <button
                    type="submit"
                    disabled={isRequestPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1E1B4B] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={13} />
                    {isRequestPending ? '요청 중...' : '관리자에게 요청하기'}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
