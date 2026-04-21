import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  Clock3,
  ImageIcon,
  LayoutDashboard,
  MapPinned,
  Video,
  Users,
  Image,
} from 'lucide-react';

import AdminShell from '@/app/admin/_components/AdminShell';
import {
  getAnnouncements,
  getChurchProfile,
  getSermons,
  getSliderItems,
  getTogetherPosts,
  getWorshipSchedule,
  getNewFamilyRegistrations,
} from '@/lib/data';

export default function AdminPage() {
  const announcements = getAnnouncements();
  const sermons = getSermons();
  const sliderItems = getSliderItems();
  const churchProfile = getChurchProfile();
  const worshipSchedule = getWorshipSchedule();
  const togetherPosts = getTogetherPosts();
  const registrations = getNewFamilyRegistrations();

  const stats = [
    {
      label: '공지사항',
      count: announcements.length,
      helper: `${announcements.filter(item => item.pinned).length}개 상단 고정`,
      icon: Bell,
      href: '/admin/announcements',
      bg: '#F3E8FF',
      color: '#7C3AED',
    },
    {
      label: '설교 영상',
      count: sermons.length,
      helper: '카테고리별 최신 영상 관리',
      icon: Video,
      href: '/admin/sermons',
      bg: '#EDE9FE',
      color: '#5B21B6',
    },
    {
      label: '메인 슬라이더',
      count: sliderItems.length,
      helper: `${sliderItems.filter(item => item.active).length}개 노출 중`,
      icon: ImageIcon,
      href: '/admin/slider',
      bg: '#E0F2FE',
      color: '#0369A1',
    },
    {
      label: '교회 소개',
      count: 1,
      helper: `${churchProfile.pastorName} ${churchProfile.pastorRole}`,
      icon: MapPinned,
      href: '/admin/church',
      bg: '#DCFCE7',
      color: '#15803D',
    },
    {
      label: '예배 시간표',
      count: worshipSchedule.length,
      helper: `${worshipSchedule.reduce((total, section) => total + section.services.length, 0)}개 예배 항목`,
      icon: Clock3,
      href: '/admin/worship',
      bg: '#FFE4E6',
      color: '#BE123C',
    },
    {
      label: '함께함 갤러리',
      count: togetherPosts.length,
      helper: '함께가는교회 일상 공유',
      icon: Image,
      href: '/admin/together',
      bg: '#FDF2F8',
      color: '#DB2777',
    },
    {
      label: '새가족 등록',
      count: registrations.length,
      helper: `${registrations.filter(r => r.status === 'new').length}건 미확인`,
      icon: Users,
      href: '/admin/new-family',
      bg: '#F0F9FF',
      color: '#0284C7',
    },
  ];

  return (
    <AdminShell
      title="함께가는교회 관리자"
      description="공지, 설교, 메인 슬라이더, 교회 소개, 예배 시간표, 함께함 갤러리와 새가족 등록까지 한 곳에서 관리할 수 있도록 정리했습니다."
      backHref="/"
      backLabel="홈으로"
      actions={
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: '#FFFFFF' }}
        >
          사이트 미리보기
        </Link>
      }
    >
      <div className="mb-10 flex items-center gap-2">
        <LayoutDashboard size={18} style={{ color: '#7C3AED' }} />
        <h2 className="text-base font-bold" style={{ color: '#1E1B4B' }}>
          전체 현황
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map(stat => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.href}
              href={stat.href}
              className="rounded-[1.75rem] border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: '#E2E8F0' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#475569' }}>
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-bold" style={{ color: '#1E1B4B' }}>
                    {stat.count}
                  </p>
                  <p className="mt-2 text-xs leading-5" style={{ color: '#94A3B8' }}>
                    {stat.helper}
                  </p>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  <Icon size={22} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-base font-bold" style={{ color: '#1E1B4B' }}>
          빠른 이동
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              href: '/admin/announcements',
              label: '공지사항 관리',
              description: '작성, 수정, 삭제, 상단 고정을 한 번에 관리합니다.',
              icon: Bell,
              color: '#7C3AED',
            },
            {
              href: '/admin/sermons',
              label: '설교 영상 관리',
              description: '카테고리, 설교자, 날짜, 유튜브 링크까지 수정할 수 있습니다.',
              icon: Video,
              color: '#5B21B6',
            },
            {
              href: '/admin/slider',
              label: '메인 슬라이더 관리',
              description: '문구, 버튼, 정렬 순서, 노출 여부를 조정합니다.',
              icon: ImageIcon,
              color: '#0369A1',
            },
            {
              href: '/admin/church',
              label: '교회 소개 관리',
              description: '인사말, 표어, 주소, 연락처, 지도 링크를 수정합니다.',
              icon: MapPinned,
              color: '#15803D',
            },
            {
              href: '/admin/worship',
              label: '예배 시간표 관리',
              description: '예배 섹션과 시간표 항목을 직접 수정할 수 있습니다.',
              icon: Clock3,
              color: '#BE123C',
            },
            {
              href: '/admin/together',
              label: '함께함 관리',
              description: '갤러리 게시글을 삭제하거나 숨김 처리할 수 있습니다.',
              icon: Image,
              color: '#DB2777',
            },
            {
              href: '/admin/new-family',
              label: '새가족 등록 관리',
              description: '온라인으로 접수된 새가족 신청 정보를 확인합니다.',
              icon: Users,
              color: '#0284C7',
            },
          ].map(item => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-[1.5rem] border bg-white p-5 transition-all duration-200 hover:shadow-md"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: '#F8F7FF', color: item.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-5" style={{ color: '#94A3B8' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#94A3B8' }} />
              </Link>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
