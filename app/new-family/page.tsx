import Link from 'next/link';
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

import PageHero from '@/components/PageHero';
import { getChurchProfile } from '@/lib/data';
import { newFamilyNotices, newFamilySteps, siteAssets } from '@/lib/site';

const flowSteps = [
  { step: 'STEP 1', title: '등록 절차 확인', description: '새가족 등록이 어떻게 진행되는지 먼저 안내를 확인합니다.' },
  { step: 'STEP 2', title: '등록하기 버튼 클릭', description: '안내를 읽은 뒤 신청서 작성 페이지로 이동합니다.' },
  { step: 'STEP 3', title: '신청서 작성 및 제출', description: '기본 인적사항과 연락처를 입력하면 접수가 완료됩니다.' },
] as const;

export default function NewFamilyPage() {
  const churchProfile = getChurchProfile();

  return (
    <main className="flex-1 pt-32 md:pt-40">

      <section className="max-w-[1400px] mx-auto px-4 py-18 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border bg-white p-6 md:p-8" style={{ borderColor: '#EEE4D7' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <HeartHandshake size={16} />
                등록 절차
              </div>
              <h2 className="mt-4 text-2xl font-bold md:text-3xl" style={{ color: '#1E1B4B' }}>
                처음 방문하는 분들도
                <br />
                순서대로 따라오면 쉽게 신청할 수 있습니다
              </h2>
              <p className="mt-3 text-sm leading-7" style={{ color: '#5F6570' }}>
                새가족등록은 온라인 신청서를 통해 간편하게 진행하실 수 있습니다. 제출해 주신 정보는 소중히 관리되며, 
                등록 후에는 공동체의 일원으로서 풍성한 은혜를 나누는 과정에 동참하시게 됩니다.
              </p>

              <div className="mt-6 space-y-4">
                {newFamilySteps.map(item => (
                  <div
                    key={item.step}
                    className="rounded-[1.5rem] border p-4"
                    style={{ borderColor: '#EEE4D7', backgroundColor: '#FFFCF8' }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
                        style={{ backgroundColor: '#F5EBDD', color: '#8B5E34' }}
                      >
                        {item.step}
                      </span>
                      <div>
                        <p className="text-base font-semibold" style={{ color: '#1E1B4B' }}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6" style={{ color: '#6B7280' }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[2rem] border p-6 md:p-8"
              style={{ borderColor: '#E9D7C3', backgroundColor: '#FFF8F1' }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <ShieldCheck size={16} />
                신청 전 안내
              </div>
              <ul className="mt-4 space-y-3">
                {newFamilyNotices.map(item => (
                  <li key={item} className="flex gap-3 text-sm leading-7" style={{ color: '#5F6570' }}>
                    <span className="mt-1 text-xs font-bold" style={{ color: '#8B5E34' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border bg-white p-6 md:p-8" style={{ borderColor: '#EEE4D7' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <Sparkles size={16} />
                진행 순서
              </div>
              <div className="mt-5 space-y-4">
                {flowSteps.map((item, index) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                        style={{ backgroundColor: '#8B5E34', color: '#FFFFFF' }}
                      >
                        {index + 1}
                      </span>
                      {index !== flowSteps.length - 1 ? (
                        <span className="mt-2 h-10 w-px" style={{ backgroundColor: '#E9D7C3' }} />
                      ) : null}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: '#B98954' }}>
                        {item.step}
                      </p>
                      <p className="mt-1 text-base font-semibold" style={{ color: '#1E1B4B' }}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6" style={{ color: '#6B7280' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/new-family/apply"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition-colors duration-200"
                style={{ backgroundColor: '#8B5E34' }}
              >
                등록하기
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-[2rem] border bg-white p-6" style={{ borderColor: '#EEE4D7' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <CheckCircle2 size={16} />
                방문 안내
              </div>
              <p className="mt-4 text-sm leading-7" style={{ color: '#5F6570' }}>
                주일 2부 예배는 오전 11시에 시작합니다. 처음 오시는 분들도 편하게 안내받을 수 있도록 현장에서 도와드립니다.
              </p>
              <p className="mt-4 text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                주소
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: '#5F6570' }}>
                {churchProfile.address}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
