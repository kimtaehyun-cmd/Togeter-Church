import { NextResponse } from 'next/server';

import { getTogetherPosts, incrementTogetherPostViews } from '@/lib/data';
import { checkMemoryCooldown, getClientIpAddress } from '@/lib/request-rate-limit';

type TogetherViewRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const BOT_USER_AGENT_PATTERN =
  /(bot|crawl|crawler|spider|slurp|preview|facebookexternalhit|kakaotalk|headless|phantom)/i;
const VIEW_COUNT_COOLDOWN_MS = 12 * 60 * 60 * 1000;

function getViewClientKey(headers: Headers) {
  const clientIp = getClientIpAddress(headers);
  const userAgent = headers.get('user-agent')?.trim().slice(0, 160) ?? 'unknown-user-agent';

  return clientIp ? `ip:${clientIp}:ua:${userAgent}` : `ua:${userAgent}`;
}

export async function POST(request: Request, { params }: TogetherViewRouteContext) {
  const { id } = await params;
  const userAgent = request.headers.get('user-agent') ?? '';

  if (BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return NextResponse.json({ status: 'ignored' }, { status: 202 });
  }

  const currentPost = getTogetherPosts({ includeHidden: true }).find(post => post.id === id);

  if (!currentPost || currentPost.hidden) {
    return NextResponse.json(
      {
        status: 'not_found',
        message: '게시글을 찾을 수 없습니다.',
      },
      { status: 404 },
    );
  }

  const cooldownResult = checkMemoryCooldown({
    key: `together-view:${id}:${getViewClientKey(request.headers)}`,
    cooldownMs: VIEW_COUNT_COOLDOWN_MS,
  });

  if (!cooldownResult.ok) {
    return NextResponse.json(
      {
        status: 'ignored',
        views: currentPost.views,
      },
      {
        status: 202,
        headers: {
          'Retry-After': String(cooldownResult.retryAfterSeconds),
        },
      },
    );
  }

  const views = incrementTogetherPostViews(id);

  if (views === null) {
    return NextResponse.json(
      {
        status: 'not_found',
        message: '게시글을 찾을 수 없습니다.',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: 'success',
    views,
  });
}
