import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UploadForm from '@/components/together/UploadForm';

export default async function TogetherUploadPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/together/upload');
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#FDFBF9] pt-28">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
          <Link
            href="/together"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E34] transition-colors hover:text-[#6E4A2F]"
          >
            <ArrowLeft size={16} />
            갤러리로 돌아가기
          </Link>

          <div className="mt-8 mb-12">
            <h1 className="text-3xl font-bold text-[#1E1B4B] md:text-5xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
              소중한 추억 등록하기
            </h1>
            <p className="mt-4 text-lg text-[#64748B]">함께 울고 함께 웃는 우리의 소중한 순간들을 기록해주세요.</p>
          </div>

          <div className="rounded-[2.5rem] border bg-white p-8 md:p-12 shadow-sm" style={{ borderColor: '#EEE4D7' }}>
            <UploadForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
