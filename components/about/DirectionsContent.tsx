import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';

import AboutPageFrame from './AboutPageFrame';
import { getChurchProfile } from '@/lib/data';
import { siteAssets } from '@/lib/site';

export default function DirectionsContent() {
  const churchProfile = getChurchProfile();

  return (
    <AboutPageFrame
      eyebrow="오시는 길"
      title={`${churchProfile.churchName} 위치 안내`}
      description="서울시 도봉구 도당로 118 상가동 2층에 위치해 있습니다."
      align="center"
    >
      <section className="mx-auto max-w-[1400px] px-4 py-18 md:py-20">
        <div
          className="rounded-[2rem] border bg-white p-6 md:p-8"
          style={{ borderColor: '#EEE4D7' }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
            <MapPin size={16} />
            주소 및 길찾기
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div
              className="group relative overflow-hidden rounded-2xl border bg-[#F8F9FA] transition-all duration-500 hover:border-[#8B5E34] hover:shadow-xl"
              style={{ borderColor: '#EEE4D7', height: '420px' }}
            >
              <a
                href={churchProfile.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-full w-full"
              >
                <Image
                  src={siteAssets.mapPhoto}
                  alt="함께가는교회 지도 위치"
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Premium Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                  <div className="flex flex-col items-center gap-3 transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                      <ArrowUpRight size={24} style={{ color: '#8B5E34' }} />
                    </div>
                    <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-[#8B5E34] backdrop-blur-md">
                      네이버 지도로 크게 보기
                    </span>
                  </div>
                </div>

                {/* Church Marker Mockup */}
                <div className="absolute left-[20%] top-[58%] -translate-x-1/2 -translate-y-1/2">
                   <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-[#8B5E34]/20 animate-ping" />
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#8B5E34] shadow-lg">
                        <MapPin size={16} color="white" />
                      </div>
                      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#1E1B4B] shadow-md border border-[#EEE4D7]">
                        함께가는교회
                      </div>
                   </div>
                </div>
              </a>
            </div>

            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#EEE4D7' }}>
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: '#8B5E34' }}
                />
                <div>
                  <p className="mb-1 font-semibold" style={{ color: '#1E1B4B' }}>
                    주소
                  </p>
                  <p className="text-sm leading-7" style={{ color: '#64748B' }}>
                    {churchProfile.address}
                  </p>
                </div>
              </div>

              <div
                className="mt-6 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2"
                style={{ borderColor: '#EEE4D7' }}
              >
                <div>
                  <p className="mb-2 text-xs font-semibold" style={{ color: '#8B5E34' }}>
                    대중교통
                  </p>
                  <p className="text-sm leading-7" style={{ color: '#64748B' }}>
                    인근 지하철역과 버스정류장에서 도보로 이동하실 수 있습니다.
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold" style={{ color: '#8B5E34' }}>
                    차량 이용
                  </p>
                  <p className="text-sm leading-7" style={{ color: '#64748B' }}>
                    내비게이션에 도당로 118을 검색하시면 편하게 찾아오실 수 있습니다.
                  </p>
                </div>
              </div>

              <a
                href={churchProfile.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                style={{ backgroundColor: '#8B5E34', color: '#FFFFFF' }}
              >
                지도에서 길찾기
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </AboutPageFrame>
  );
}
