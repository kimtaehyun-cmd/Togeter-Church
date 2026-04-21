import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Info } from 'lucide-react';

import AboutPageFrame from './AboutPageFrame';
import { getWorshipSchedule } from '@/lib/data';
import { firstVisitPoints, siteAssets } from '@/lib/site';

export default function WorshipTimesContent() {
  const worshipSchedule = getWorshipSchedule();
  const sundaySection = worshipSchedule.find(section => section.day.includes('주일')) ?? worshipSchedule[0];
  const recommendedService = sundaySection?.services.find(service => service.name.includes('2부')) ?? sundaySection?.services[0];
  const recommendedServiceLabel = recommendedService
    ? `${recommendedService.name} · ${recommendedService.time}`
    : '아래 시간표에서 최신 예배 시간을 확인해 주세요';
  const recommendedServiceDescription = recommendedService
    ? `${recommendedService.time}에 시작하는 ${recommendedService.name}는 처음 방문하시는 분들도 여유 있게 참여하실 수 있도록 준비되어 있습니다.`
    : '주일과 주중 예배 시간을 아래 시간표에서 확인하실 수 있습니다.';

  return (
    <AboutPageFrame
      eyebrow="예배시간"
      title="예배 시간표를 한눈에 확인하세요"
      description="주일예배, 오후예배, 새벽기도를 포함한 함께가는교회의 예배 시간을 보기 쉽게 정리했습니다."
      image={siteAssets.sanctuaryPhoto}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-18 md:py-20">
        <div
          className="mb-10 flex items-start gap-3 rounded-2xl border p-5"
          style={{ backgroundColor: '#FFF8F1', borderColor: '#E9D7C3' }}
        >
          <Info size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#8B5E34' }} />
          <p className="text-sm leading-7" style={{ color: '#6E4A2F' }}>
            예배 시간은 교회 사정에 따라 변경될 수 있습니다. 방문 전 교회 소식과 예배 안내를
            함께 확인해 주세요.
          </p>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <div className="rounded-[2rem] border bg-white p-8" style={{ borderColor: '#EEE4D7' }}>
            <span
              className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              First Visit
            </span>
            <h2 className="mt-5 text-2xl font-bold md:text-3xl" style={{ color: '#1E1B4B' }}>
              처음 방문하신다면
              <br />
              가장 편하게 참여할 수 있는 예배를 확인해 보세요
            </h2>
            <p className="mt-4 text-sm leading-7 md:text-base" style={{ color: '#5F6570' }}>
              {recommendedServiceDescription} 안내가 필요하시면 예배 전후로 편하게 도움을 받으실 수 있습니다.
            </p>
            <div
              className="mt-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              {recommendedServiceLabel}
            </div>
            <div className="mt-6 space-y-3">
              {firstVisitPoints.map(point => (
                <div
                  key={point.title}
                  className="rounded-2xl border px-4 py-4"
                  style={{ backgroundColor: '#FFFCF8', borderColor: '#EEE4D7' }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                    {point.title}
                  </p>
                  <p className="mt-1 text-xs leading-5" style={{ color: '#6B7280' }}>
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-[2rem] border bg-white"
            style={{ borderColor: '#EEE4D7', boxShadow: '0 20px 48px rgba(44,31,20,0.08)' }}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={siteAssets.sanctuaryPhoto}
                alt="예배 공간 사진"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <div className="mt-16 flex flex-col gap-8">
          {worshipSchedule.map(group => (
            <section
              key={group.id}
              className="rounded-[2rem] border bg-white p-6 md:p-8"
              style={{ borderColor: '#EEE4D7' }}
            >
              <div className="mb-5 flex items-center gap-2">
                <Calendar size={18} style={{ color: '#8B5E34' }} />
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#1E1B4B' }}>
                    {group.day}
                  </h2>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {group.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {group.services.map(service => {
                  const isRecommended = recommendedService?.id === service.id;
                  const serviceTags = [service.location, service.note].filter(Boolean);

                  return (
                    <div
                      key={service.id}
                      className="rounded-2xl border p-5 transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: isRecommended ? '#D9B88F' : '#EEE4D7',
                        backgroundColor: isRecommended ? '#FFF8F1' : '#FFFCF8',
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: '#F5EBDD' }}
                        >
                          <Clock size={18} style={{ color: '#8B5E34' }} />
                        </div>
                        {isRecommended ? (
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{ backgroundColor: '#8B5E34', color: '#FFFFFF' }}
                          >
                            처음 방문 추천
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mb-1 font-bold" style={{ color: '#1E1B4B' }}>
                        {service.name}
                      </h3>
                      <p className="mb-2 text-2xl font-bold" style={{ color: '#8B5E34' }}>
                        {service.time}
                      </p>
                      {serviceTags.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {serviceTags.map(tag => (
                            <span
                              key={tag}
                              className="rounded-full px-2 py-0.5 text-xs"
                              style={{ backgroundColor: '#F5EBDD', color: '#6E4A2F' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                          상세 장소와 추가 안내는 현장에서 도와드립니다.
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div
          className="mt-14 rounded-[2rem] p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #8B5E34, #6E4A2F)', color: 'white' }}
        >
          <h3 className="mb-3 text-xl font-bold">오시는 길도 함께 확인해보세요</h3>
          <p className="mb-5 text-sm leading-7" style={{ color: '#F5EBDD' }}>
            처음 방문하실 때는 예배 시간과 위치를 함께 확인하시면 훨씬 편하게 찾아오실 수
            있습니다.
          </p>
          <Link
            href="/about/directions"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold transition-colors duration-200"
            style={{ color: '#8B5E34' }}
          >
            오시는 길 보기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AboutPageFrame>
  );
}
