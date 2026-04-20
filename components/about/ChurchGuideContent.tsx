import Image from 'next/image';
import { CheckCircle2, Heart, Sparkles, Users } from 'lucide-react';

import AboutPageFrame from './AboutPageFrame';
import { getChurchProfile } from '@/lib/data';
import { coreValues, firstVisitPoints, siteAssets } from '@/lib/site';

export default function ChurchGuideContent() {
  const churchProfile = getChurchProfile();
  const greetingParagraphs = churchProfile.greetingBody
    .split('\n')
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  return (
    <AboutPageFrame
      eyebrow="교회안내"
      title={`${churchProfile.churchName}를 소개합니다`}
      description="함께가는교회는 하나님의 사랑 안에서 모든 세대가 하나 되어 건강한 신앙의 공동체를 이루어 가고 있습니다."
      image={siteAssets.sanctuaryPhoto}
    >
      <section className="mx-auto max-w-[1400px] px-4 py-18 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="relative">
            <div
              className="absolute -left-3 top-8 h-20 w-20 rounded-full blur-2xl"
              style={{ backgroundColor: 'rgba(196, 144, 91, 0.18)' }}
            />
            <div
              className="relative overflow-hidden rounded-[2rem] border bg-white shadow-[0_20px_48px_rgba(44,31,20,0.08)]"
              style={{ borderColor: '#EEE4D7' }}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={siteAssets.sanctuaryPhoto}
                  alt={`${churchProfile.churchName} 예배 공간`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div
              className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border bg-white/94 p-4 backdrop-blur-sm"
              style={{ borderColor: '#EEE4D7' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="relative h-14 w-14 overflow-hidden rounded-2xl border bg-white"
                  style={{ borderColor: '#EEE4D7' }}
                >
                  <Image
                    src={siteAssets.togetherLogo}
                    alt={`${churchProfile.churchName} 로고`}
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                    {churchProfile.churchName}
                  </p>
                  <p className="mt-1 text-xs leading-5" style={{ color: '#5F6570' }}>
                    밝고 편안한 예배 분위기 속에서 함께 배우고 함께 자라가는 공동체입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-[2rem] border bg-white p-8 md:p-10"
            style={{ borderColor: '#EEE4D7' }}
          >
            <span
              className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              {churchProfile.greetingLabel}
            </span>
            <div className="mt-6 flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #8B5E34, #B98954)' }}
              >
                {churchProfile.pastorName.slice(0, 1)}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1E1B4B' }}>
                  {churchProfile.pastorName} {churchProfile.pastorRole}
                </h2>
                <p className="text-sm" style={{ color: '#8B5E34' }}>
                  {churchProfile.churchName}
                </p>
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold" style={{ color: '#1E1B4B' }}>
              {churchProfile.greetingTitle}
            </h3>
            <div className="mt-4 space-y-4 text-base leading-relaxed" style={{ color: '#475569' }}>
              {greetingParagraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 md:py-20" style={{ backgroundColor: '#FBF8F4' }}>
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="mb-12 text-center">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
              style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
            >
              핵심 가치
            </span>
            <h2 className="mt-4 text-2xl font-bold md:text-3xl" style={{ color: '#1E1B4B' }}>
              함께가는교회가 지향하는 방향
            </h2>
          </div>

          <div className="mb-10 rounded-2xl p-6 text-center" style={{ backgroundColor: '#F6EBDC' }}>
            <p className="text-lg font-bold md:text-xl" style={{ color: '#6E4A2F' }}>
              표어: {churchProfile.slogan}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[Heart, Users, Sparkles].map((Icon, index) => {
              const value = coreValues[index];

              return (
                <div
                  key={value.title}
                  className="rounded-2xl border bg-white p-7"
                  style={{
                    borderColor: '#EEE4D7',
                    boxShadow: '0 18px 40px rgba(57, 43, 31, 0.04)',
                  }}
                >
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold" style={{ color: '#1E1B4B' }}>
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </AboutPageFrame>
  );
}
