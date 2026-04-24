'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  confirmMessage: string;
  className?: string;
  style?: CSSProperties;
  pendingLabel?: string;
};

export default function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
  style,
  pendingLabel = '처리 중...',
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={event => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={className}
      style={style}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
