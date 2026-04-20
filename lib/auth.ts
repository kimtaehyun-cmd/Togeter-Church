import 'server-only';

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { type User, getUsers } from '@/lib/data';

const SESSION_COOKIE_NAME = 'church_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_SECRET = process.env.SESSION_SECRET || 'church-dev-session-secret-change-me';

type SessionPayload = {
  userId: string;
  role: User['role'];
  email: string;
  exp: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf-8');
}

function sign(value: string) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function safeRedirectPath(pathname: string | null | undefined, fallback: string) {
  if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return fallback;
  }

  return pathname;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, 'hex');

  if (derived.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(derived, stored);
}

export async function createSession(user: User) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const [encodedPayload, signature] = raw.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

    if (!payload.userId || !payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return getUsers().find(user => user.id === session.userId) ?? null;
});

export async function requireUser(nextPath?: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeRedirectPath(nextPath, '/'))}`);
  }

  return user;
}

export async function requireAdmin(nextPath = '/admin') {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.role !== 'admin') {
    redirect('/');
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  redirect(user.role === 'admin' ? '/admin' : '/');
}

export function resolvePostLoginPath(user: User, nextPath?: string | null) {
  const safePath = safeRedirectPath(nextPath, user.role === 'admin' ? '/admin' : '/');

  if (safePath.startsWith('/admin') && user.role !== 'admin') {
    return '/';
  }

  return safePath;
}
