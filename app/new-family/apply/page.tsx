import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ClipboardPenLine, ShieldCheck } from 'lucide-react';

import NewFamilyRegistrationForm from '@/components/NewFamilyRegistrationForm';
import PageHero from '@/components/PageHero';
import { newFamilyNotices, siteAssets } from '@/lib/site';

const applyFlow = [
  { step: '01', title: '절차 확인', state: 'done' },
  { step: '02', title: '신청서 작성', state: 'current' },
  { step: '03', title: '접수 완료', state: 'upcoming' },
] as const;

export default function NewFamilyApplyPage() {
  return (
    <main className="flex-1">
      <PageHero
        eyebrow="New Family Apply"
        title="새가족 신청서 작성"
        description="등록 절차를 확인한 뒤 이어지는 신청 페이지입니다. 아래 양식에 기본 정보를 입력해 주시면 확인 후 교회에서 안내 연락을 드립니다."
        image={siteAssets.sanctuaryPhoto}
      >
        <div className="flex flex-wrap justify-center gap-2">
          {applyFlow.map(item => (
            <span
              key={item.step}
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: item.state === 'current' ? '#8B5E34' : 'rgba(255,255,255,0.82)',
                color: item.state === 'current' ? '#FFFFFF' : '#8B5E34',
              }}
            >
              {item.step} {item.title}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="max-w-[1400px] mx-auto px-4 py-18 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border bg-white p-6 md:p-8" style={{ borderColor: '#EEE4D7' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <CheckCircle2 size={16} />
                현재 단계
              </div>
              <div className="mt-5 space-y-4">
                {applyFlow.map(item => {
                  const isCurrent = item.state === 'current';
                  const isDone = item.state === 'done';

                  return (
                    <div
                      key={item.step}
                      className="rounded-[1.5rem] border p-4"
                      style={{
                        borderColor: isCurrent ? '#D9C7B1' : '#EEE4D7',
                        backgroundColor: isCurrent ? '#FFF8F1' : '#FFFCF8',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold"
                          style={{
                            backgroundColor: isCurrent || isDone ? '#8B5E34' : '#F5EBDD',
                            color: isCurrent || isDone ? '#FFFFFF' : '#8B5E34',
                          }}
                        >
                          {item.step}
                        </span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
                            {isDone ? '이전 단계 완료' : isCurrent ? '지금 작성 중인 단계' : '신청서를 제출하면 완료됩니다'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/new-family"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#8B5E34' }}
              >
                <ArrowLeft size={16} />
                등록 절차 페이지로 돌아가기
              </Link>
            </div>

            <div
              className="rounded-[2rem] border p-6 md:p-8"
              style={{ borderColor: '#E9D7C3', backgroundColor: '#FFF8F1' }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <ShieldCheck size={16} />
                작성 전 확인
              </div>
              <ul className="mt-4 space-y-3">
                {newFamilyNotices.slice(0, 3).map(item => (
                  <li key={item} className="flex gap-3 text-sm leading-7" style={{ color: '#5F6570' }}>
                    <span className="mt-1 text-xs font-bold" style={{ color: '#8B5E34' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border bg-white p-6 md:p-8" style={{ borderColor: '#EEE4D7' }}>
            <div className="flex flex-col gap-4 border-b pb-6" style={{ borderColor: '#F1E6DA' }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#8B5E34' }}>
                <ClipboardPenLine size={16} />
                신청 양식
              </div>
              <div>
                <h2 className="text-2xl font-bold md:text-3xl" style={{ color: '#1E1B4B' }}>
                  인적사항과 연락처를 입력해 주세요
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: '#5F6570' }}>
                  신청서를 제출하면 교회에서 내용을 확인한 뒤 예배 안내와 첫 방문 관련 연락을 드립니다.
                  공개 신청 페이지이기 때문에 주민등록번호는 받지 않고, 필요한 기본 정보만 입력하도록 구성했습니다.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <NewFamilyRegistrationForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
