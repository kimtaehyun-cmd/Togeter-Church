type MemoryRateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
  blockDurationMs?: number;
};

type MemoryCooldownInput = {
  key: string;
  cooldownMs: number;
};

type MemoryRateLimitState = {
  timestamps: number[];
  blockedUntil: number;
};

export type MemoryRateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const MAX_TRACKED_RATE_LIMIT_KEYS = 2048;
const memoryRateLimitStore = new Map<string, MemoryRateLimitState>();
const memoryCooldownStore = new Map<string, number>();

function shouldTrustProxyHeaders() {
  return (
    process.env.TRUST_PROXY_HEADERS === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.CF_PAGES === '1'
  );
}

function pruneExpiredRateLimitEntries(now: number, windowMs: number) {
  for (const [key, state] of memoryRateLimitStore.entries()) {
    const recentTimestamps = state.timestamps.filter(timestamp => now - timestamp < windowMs);
    const stillBlocked = state.blockedUntil > now;

    if (recentTimestamps.length === 0 && !stillBlocked) {
      memoryRateLimitStore.delete(key);
      continue;
    }

    if (recentTimestamps.length !== state.timestamps.length) {
      memoryRateLimitStore.set(key, {
        ...state,
        timestamps: recentTimestamps,
      });
    }
  }
}

function pruneExpiredCooldownEntries(now: number) {
  for (const [key, expiresAt] of memoryCooldownStore.entries()) {
    if (expiresAt <= now) {
      memoryCooldownStore.delete(key);
    }
  }
}

export function getClientIpAddress(headers: Pick<Headers, 'get'>) {
  if (!shouldTrustProxyHeaders()) {
    return '';
  }

  const cloudflareIp = headers.get('cf-connecting-ip')?.trim();

  if (cloudflareIp) {
    return cloudflareIp;
  }

  const realIp = headers.get('x-real-ip')?.trim();

  if (realIp) {
    return realIp;
  }

  const forwardedFor = headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? '';
  }

  return '';
}

export function checkMemoryRateLimit({
  key,
  limit,
  windowMs,
  blockDurationMs = windowMs,
}: MemoryRateLimitInput): MemoryRateLimitResult {
  const now = Date.now();

  if (memoryRateLimitStore.size >= MAX_TRACKED_RATE_LIMIT_KEYS) {
    pruneExpiredRateLimitEntries(now, windowMs);
  }

  const currentState = memoryRateLimitStore.get(key) ?? {
    timestamps: [],
    blockedUntil: 0,
  };
  const recentTimestamps = currentState.timestamps.filter(timestamp => now - timestamp < windowMs);

  if (currentState.blockedUntil > now) {
    return {
      ok: false,
      limit,
      remaining: 0,
      resetAt: currentState.blockedUntil,
      retryAfterSeconds: Math.max(1, Math.ceil((currentState.blockedUntil - now) / 1000)),
    };
  }

  if (recentTimestamps.length >= limit) {
    const blockedUntil = now + blockDurationMs;
    memoryRateLimitStore.set(key, {
      timestamps: recentTimestamps,
      blockedUntil,
    });

    return {
      ok: false,
      limit,
      remaining: 0,
      resetAt: blockedUntil,
      retryAfterSeconds: Math.max(1, Math.ceil(blockDurationMs / 1000)),
    };
  }

  const nextTimestamps = [...recentTimestamps, now];
  const resetAt = nextTimestamps[0] + windowMs;

  memoryRateLimitStore.set(key, {
    timestamps: nextTimestamps,
    blockedUntil: 0,
  });

  return {
    ok: true,
    limit,
    remaining: Math.max(0, limit - nextTimestamps.length),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

export function checkMemoryCooldown({
  key,
  cooldownMs,
}: MemoryCooldownInput): MemoryRateLimitResult {
  const now = Date.now();

  if (memoryCooldownStore.size >= MAX_TRACKED_RATE_LIMIT_KEYS) {
    pruneExpiredCooldownEntries(now);
  }

  const existingExpiresAt = memoryCooldownStore.get(key) ?? 0;

  if (existingExpiresAt > now) {
    return {
      ok: false,
      limit: 1,
      remaining: 0,
      resetAt: existingExpiresAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existingExpiresAt - now) / 1000)),
    };
  }

  const expiresAt = now + cooldownMs;
  memoryCooldownStore.set(key, expiresAt);

  return {
    ok: true,
    limit: 1,
    remaining: 0,
    resetAt: expiresAt,
    retryAfterSeconds: Math.max(1, Math.ceil(cooldownMs / 1000)),
  };
}
