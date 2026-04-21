import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getTogetherPosts } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import RegisterButton from '@/components/together/RegisterButton';

type TogetherPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function compactText(value: string) {
  return value.toLowerCase().replace(/\s+/g, '');
}

function getDateValue(date: string) {
  const value = new Date(date.replace(/\./g, '-')).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export default async function TogetherPage({ searchParams }: TogetherPageProps) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = getSingleQueryValue(resolvedSearchParams.q).trim();
  const normalizedQuery = normalizeText(searchQuery);
  const compactQuery = compactText(searchQuery);
  const posts = getTogetherPosts()
    .filter(post => !post.hidden)
    .sort((a, b) => getDateValue(b.date) - getDateValue(a.date));
  const user = await getCurrentUser();
  const filteredPosts = posts.filter(post => {
    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [post.title, post.content, post.author, post.date].join(' ');
    return (
      normalizeText(searchableText).includes(normalizedQuery) ||
      compactText(searchableText).includes(compactQuery)
    );
  });

  return (
    <>
      <Navbar />
    <main className="flex-1 pt-32 md:pt-40">

        <div className="mx-auto max-w-[1400px] px-4 py-16 md:py-24">
          {/* Header Section from User Reference */}
          <div className="mb-16 flex flex-col items-center justify-between gap-6 border-b border-[#EEE4D7] pb-12 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-bold text-[#1E1B4B]" style={{ fontFamily: 'Outfit, sans-serif' }}>우리사진</h2>
              <p className="mt-4 text-lg text-[#64748B]">함께 울고 함께 웃는 우리의 모습을 볼 수 있습니다</p>
              <p className="mt-3 text-sm text-[#8B5E34]">
                {searchQuery ? `"${searchQuery}" 검색 결과 ${filteredPosts.length}건` : `전체 ${posts.length}건`}
              </p>
            </div>
            <form action="/together" method="get" className="flex w-full items-center gap-3 md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input
                  type="text"
                  name="q"
                  placeholder="검색어를 입력하세요"
                  defaultValue={searchQuery}
                  className="w-full rounded-2xl border border-[#EEE4D7] bg-[#FDFBF9] py-3.5 pl-12 pr-4 text-sm focus:border-[#8B5E34] focus:outline-none focus:ring-1 focus:ring-[#8B5E34]"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              </div>
              <button
                type="submit"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[#1E1B4B] text-white transition-transform hover:scale-105"
              >
                <Search size={20} />
              </button>
              {searchQuery ? (
                <Link
                  href="/together"
                  className="inline-flex h-[46px] items-center justify-center rounded-2xl border border-[#EEE4D7] px-4 text-sm font-semibold text-[#64748B] transition-colors hover:border-[#8B5E34] hover:text-[#8B5E34]"
                >
                  초기화
                </Link>
              ) : null}
            </form>
          </div>

          {/* Gallery Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/together/${post.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-[2rem] border bg-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2" style={{ borderColor: '#EEE4D7' }}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="p-6">
                      <h3 className="line-clamp-2 min-h-[3rem] text-lg font-bold leading-tight text-[#1E1B4B] transition-colors group-hover:text-[#8B5E34]">
                        {post.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between text-sm text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye size={14} />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="rounded-[2rem] border border-dashed px-6 py-16 text-center"
              style={{ borderColor: '#D8C7B4', backgroundColor: '#FFFCF8' }}
            >
              <p className="text-lg font-semibold text-[#1E1B4B]">검색 결과가 없습니다</p>
              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                제목, 내용, 작성자 기준으로 검색합니다. 다른 검색어로 다시 시도해 보세요.
              </p>
              <Link
                href="/together"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#1E1B4B] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                전체 사진 보기
              </Link>
            </div>
          )}

          {/* Registration Button */}
          <div className="mt-20 flex justify-center">
            <RegisterButton isLoggedIn={!!user} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
