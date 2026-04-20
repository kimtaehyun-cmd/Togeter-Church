'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RegisterButtonProps {
  isLoggedIn: boolean;
}

export default function RegisterButton({ isLoggedIn }: RegisterButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      const confirmed = window.confirm('로그인 후 이용 가능합니다. 로그인 페이지로 이동하시겠습니까?');
      if (confirmed) {
        router.push('/login?next=/together/upload');
      }
    } else {
      router.push('/together/upload');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-2xl bg-[#8B5E34] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:opacity-90 cursor-pointer"
    >
      <Plus size={20} />
      <span>사진 등록하기</span>
    </button>
  );
}
