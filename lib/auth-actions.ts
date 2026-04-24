'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { logAdminActivity } from '@/lib/admin-activity';
import {
  createSession,
  destroySession,
  getCurrentUser,
  hasAdminUser,
  hashPassword,
  requireAdmin,
  requireUser,
  resolvePostLoginPath,
  verifyPassword,
} from '@/lib/auth';
import { type User, getUsers, saveUsers } from '@/lib/data';
import { checkMemoryRateLimit, getClientIpAddress } from '@/lib/request-rate-limit';
import { canUploadTogether, hasPendingTogetherUploadRequest } from '@/lib/user-permissions';

export type AuthFormState = {
  status: 'idle' | 'error';
  message?: string;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
};

export type AdminSetupFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: {
    setupKey?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
};

export type AdminPasswordFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: {
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
};

export type AdminManagementFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  };
};

export type TogetherUploadAccessFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const ADMIN_SETUP_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_SETUP_RATE_LIMIT_MAX_REQUESTS = 6;
const ADMIN_SETUP_RATE_LIMIT_BLOCK_MS = 30 * 60 * 1000;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 8;
const LOGIN_RATE_LIMIT_BLOCK_MS = 30 * 60 * 1000;
const SIGNUP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_RATE_LIMIT_MAX_REQUESTS = 5;
const SIGNUP_RATE_LIMIT_BLOCK_MS = 60 * 60 * 1000;

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

async function getAdminSetupRateLimitError(): Promise<AdminSetupFormState | null> {
  const requestHeaders = await headers();
  const clientIp = getClientIpAddress(requestHeaders);
  const userAgent = requestHeaders.get('user-agent')?.trim() ?? 'unknown-user-agent';
  const rateLimitKey = clientIp
    ? `admin-setup:${clientIp}`
    : `admin-setup:ua:${userAgent}`;
  const rateLimitResult = checkMemoryRateLimit({
    key: rateLimitKey,
    limit: ADMIN_SETUP_RATE_LIMIT_MAX_REQUESTS,
    windowMs: ADMIN_SETUP_RATE_LIMIT_WINDOW_MS,
    blockDurationMs: ADMIN_SETUP_RATE_LIMIT_BLOCK_MS,
  });

  if (rateLimitResult.ok) {
    return null;
  }

  return {
    status: 'error',
    message: '초기 관리자 설정 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    errors: {
      form: `잠시 후 다시 시도해 주세요. 약 ${rateLimitResult.retryAfterSeconds}초 뒤에 다시 시도할 수 있습니다.`,
    },
  };
}

async function getLoginRateLimitError(email: string): Promise<AuthFormState | null> {
  const requestHeaders = await headers();
  const clientIp = getClientIpAddress(requestHeaders);
  const userAgent = requestHeaders.get('user-agent')?.trim().slice(0, 160) ?? 'unknown-user-agent';
  const clientKey = clientIp ? `ip:${clientIp}` : `ua:${userAgent}`;
  const rateLimitResult = checkMemoryRateLimit({
    key: `login:${clientKey}:${email}`,
    limit: LOGIN_RATE_LIMIT_MAX_REQUESTS,
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
    blockDurationMs: LOGIN_RATE_LIMIT_BLOCK_MS,
  });

  if (rateLimitResult.ok) {
    return null;
  }

  return {
    status: 'error',
    message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    errors: {
      form: '잠시 후 다시 시도해 주세요.',
    },
  };
}

async function getSignupRateLimitError(email: string): Promise<AuthFormState | null> {
  const requestHeaders = await headers();
  const clientIp = getClientIpAddress(requestHeaders);
  const userAgent = requestHeaders.get('user-agent')?.trim().slice(0, 160) ?? 'unknown-user-agent';
  const clientKey = clientIp ? `ip:${clientIp}` : `ua:${userAgent}`;
  const rateLimitResult = checkMemoryRateLimit({
    key: `signup:${clientKey}:${email}`,
    limit: SIGNUP_RATE_LIMIT_MAX_REQUESTS,
    windowMs: SIGNUP_RATE_LIMIT_WINDOW_MS,
    blockDurationMs: SIGNUP_RATE_LIMIT_BLOCK_MS,
  });

  if (rateLimitResult.ok) {
    return null;
  }

  return {
    status: 'error',
    message: '회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    errors: {
      form: '잠시 후 다시 시도해 주세요.',
    },
  };
}

export async function createInitialAdmin(
  _: AdminSetupFormState,
  formData: FormData,
): Promise<AdminSetupFormState> {
  if (hasAdminUser()) {
    return {
      status: 'error',
      message: '초기 관리자 설정은 이미 완료되었습니다. 관리자 로그인 후 이용해 주세요.',
      errors: {
        form: '초기 관리자 설정은 이미 완료되었습니다.',
      },
    };
  }

  const setupKey = getString(formData, 'setupKey');
  const name = getString(formData, 'name');
  const email = getString(formData, 'email').toLowerCase();
  const password = getString(formData, 'password');
  const confirmPassword = getString(formData, 'confirmPassword');
  const nextPath = getString(formData, 'next');
  const configuredSetupKey = process.env.ADMIN_SETUP_KEY?.trim() ?? '';

  const errors: NonNullable<AdminSetupFormState['errors']> = {};

  if (!configuredSetupKey) {
    return {
      status: 'error',
      message:
        '서버에 ADMIN_SETUP_KEY가 설정되어 있지 않습니다. 환경 변수를 먼저 설정한 뒤 다시 시도해 주세요.',
      errors: {
        form: 'ADMIN_SETUP_KEY가 설정되어 있지 않습니다.',
      },
    };
  }

  const rateLimitError = await getAdminSetupRateLimitError();

  if (rateLimitError) {
    return rateLimitError;
  }

  if (setupKey !== configuredSetupKey) {
    errors.setupKey = '설정 키가 올바르지 않습니다.';
  }

  if (name.length < 2) {
    errors.name = '이름은 2자 이상 입력해 주세요.';
  }

  if (!validateEmail(email)) {
    errors.email = '올바른 이메일 주소를 입력해 주세요.';
  }

  if (!validatePassword(password)) {
    errors.password = '비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = '비밀번호 확인이 일치하지 않습니다.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: '입력한 내용을 다시 확인해 주세요.',
      errors,
    };
  }

  const users = getUsers();
  const existingIndex = users.findIndex(user => user.email === email);
  const existingUser = existingIndex >= 0 ? users[existingIndex] : null;
  const user: User = {
    id: existingUser?.id ?? Date.now().toString(),
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'admin',
    createdAt: existingUser?.createdAt ?? new Date().toISOString(),
    togetherUploadStatus: 'approved',
  };

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...existingUser,
      ...user,
    };
    saveUsers([...users]);
  } else {
    saveUsers([user, ...users]);
  }

  logAdminActivity({
    actor: user,
    action: existingIndex >= 0 ? 'admin.bootstrap.promote' : 'admin.bootstrap.create',
    summary:
      existingIndex >= 0
        ? `${user.email} 계정을 첫 관리자로 승격했습니다.`
        : `${user.email} 계정으로 첫 관리자 계정을 생성했습니다.`,
    targetType: 'user',
    targetId: user.id,
  });

  await createSession(user);
  redirect(resolvePostLoginPath(user, nextPath || '/admin'));
}

export async function changeAdminPassword(
  _: AdminPasswordFormState,
  formData: FormData,
): Promise<AdminPasswordFormState> {
  const admin = await requireAdmin('/admin/access');
  const currentPassword = getString(formData, 'currentPassword');
  const password = getString(formData, 'password');
  const confirmPassword = getString(formData, 'confirmPassword');

  const errors: NonNullable<AdminPasswordFormState['errors']> = {};

  if (!currentPassword) {
    errors.currentPassword = '현재 비밀번호를 입력해 주세요.';
  } else if (!verifyPassword(currentPassword, admin.passwordHash)) {
    errors.currentPassword = '현재 비밀번호가 올바르지 않습니다.';
  }

  if (!validatePassword(password)) {
    errors.password = '비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = '비밀번호 확인이 일치하지 않습니다.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: '비밀번호를 다시 확인해 주세요.',
      errors,
    };
  }

  saveUsers(
    getUsers().map(user =>
      user.id === admin.id
        ? {
            ...user,
            passwordHash: hashPassword(password),
          }
        : user,
    ),
  );

  logAdminActivity({
    actor: admin,
    action: 'admin.password.change',
    summary: '본인 관리자 계정의 비밀번호를 변경했습니다.',
    targetType: 'user',
    targetId: admin.id,
  });

  revalidatePath('/admin/access');

  return {
    status: 'success',
    message: '관리자 비밀번호가 변경되었습니다.',
  };
}

export async function createOrPromoteAdmin(
  _: AdminManagementFormState,
  formData: FormData,
): Promise<AdminManagementFormState> {
  const actor = await requireAdmin('/admin/access');
  const name = getString(formData, 'name');
  const email = getString(formData, 'email').toLowerCase();
  const password = getString(formData, 'password');
  const confirmPassword = getString(formData, 'confirmPassword');

  const errors: NonNullable<AdminManagementFormState['errors']> = {};

  if (!validateEmail(email)) {
    errors.email = '올바른 이메일 주소를 입력해 주세요.';
  }

  const users = getUsers();
  const existingUser = users.find(user => user.email === email);
  const hasNewPasswordInput = Boolean(password || confirmPassword);

  if (existingUser?.role === 'admin') {
    errors.email = '이미 관리자 권한이 있는 계정입니다.';
  }

  if (!existingUser && name.length < 2) {
    errors.name = '새 관리자 계정을 만들 때는 이름을 2자 이상 입력해 주세요.';
  }

  if (!existingUser && !password) {
    errors.password = '새 관리자 계정을 만들 때는 초기 비밀번호가 필요합니다.';
  }

  if (hasNewPasswordInput && !validatePassword(password)) {
    errors.password = '비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.';
  }

  if (hasNewPasswordInput && password !== confirmPassword) {
    errors.confirmPassword = '비밀번호 확인이 일치하지 않습니다.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: '입력한 내용을 다시 확인해 주세요.',
      errors,
    };
  }

  if (existingUser) {
    saveUsers(
      users.map(user =>
        user.id === existingUser.id
          ? {
              ...user,
            name: name || user.name,
            role: 'admin',
            passwordHash: hasNewPasswordInput ? hashPassword(password) : user.passwordHash,
            togetherUploadStatus: 'approved',
            togetherUploadReviewedAt: new Date().toISOString(),
            togetherUploadReviewedBy: actor.id,
          }
          : user,
      ),
    );

    logAdminActivity({
      actor,
      action: 'admin.user.promote',
      summary: `${existingUser.email} 계정을 관리자로 승격했습니다.`,
      targetType: 'user',
      targetId: existingUser.id,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/access');

    return {
      status: 'success',
      message: `${existingUser.email} 계정에 관리자 권한을 부여했습니다.`,
    };
  }

  const nextUser: User = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'admin',
    createdAt: new Date().toISOString(),
    togetherUploadStatus: 'approved',
  };

  saveUsers([nextUser, ...users]);

  logAdminActivity({
    actor,
    action: 'admin.user.create',
    summary: `${nextUser.email} 관리자 계정을 새로 만들었습니다.`,
    targetType: 'user',
    targetId: nextUser.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/access');

  return {
    status: 'success',
    message: `${nextUser.email} 관리자 계정을 생성했습니다.`,
  };
}

export async function signup(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = getString(formData, 'name');
  const email = getString(formData, 'email').toLowerCase();
  const password = getString(formData, 'password');
  const confirmPassword = getString(formData, 'confirmPassword');
  const nextPath = getString(formData, 'next');

  const errors: NonNullable<AuthFormState['errors']> = {};

  if (name.length < 2) {
    errors.name = '이름은 2자 이상 입력해 주세요.';
  }

  if (!validateEmail(email)) {
    errors.email = '올바른 이메일 주소를 입력해 주세요.';
  }

  if (!validatePassword(password)) {
    errors.password = '비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = '비밀번호 확인이 일치하지 않습니다.';
  }

  const users = getUsers();

  if (users.some(user => user.email === email)) {
    errors.email = '이미 가입된 이메일입니다.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: '입력한 내용을 다시 확인해 주세요.',
      errors,
    };
  }

  const rateLimitError = await getSignupRateLimitError(email);

  if (rateLimitError) {
    return rateLimitError;
  }

  const role: User['role'] = 'member';
  const user: User = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
    togetherUploadStatus: 'none',
  };

  saveUsers([user, ...users]);
  await createSession(user);

  redirect(resolvePostLoginPath(user, nextPath));
}

export async function login(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = getString(formData, 'email').toLowerCase();
  const password = getString(formData, 'password');
  const nextPath = getString(formData, 'next');

  const errors: NonNullable<AuthFormState['errors']> = {};

  if (!validateEmail(email)) {
    errors.email = '올바른 이메일 주소를 입력해 주세요.';
  }

  if (!password) {
    errors.password = '비밀번호를 입력해 주세요.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: '입력한 내용을 다시 확인해 주세요.',
      errors,
    };
  }

  const rateLimitError = await getLoginRateLimitError(email);

  if (rateLimitError) {
    return rateLimitError;
  }

  const user = getUsers().find(item => item.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return {
      status: 'error',
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      errors: {
        form: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
    };
  }

  await createSession(user);

  if (user.role === 'admin') {
    logAdminActivity({
      actor: user,
      action: 'admin.auth.login',
      summary: '관리자 화면에 로그인했습니다.',
      targetType: 'session',
      targetId: user.id,
    });
  }

  redirect(resolvePostLoginPath(user, nextPath));
}

export async function requestTogetherUploadAccess(
  previousState: TogetherUploadAccessFormState,
  formData: FormData,
): Promise<TogetherUploadAccessFormState> {
  void previousState;
  void formData;

  const user = await requireUser('/together');

  if (canUploadTogether(user)) {
    return {
      status: 'success',
      message: '이미 함께함 글 등록 권한이 있습니다.',
    };
  }

  if (hasPendingTogetherUploadRequest(user)) {
    return {
      status: 'success',
      message: '이미 관리자에게 권한 요청이 접수되어 있습니다.',
    };
  }

  const users = getUsers();
  const requestedAt = new Date().toISOString();
  const targetUser = users.find(item => item.id === user.id);

  if (!targetUser) {
    return {
      status: 'error',
      message: '사용자 정보를 찾을 수 없습니다. 다시 로그인한 뒤 시도해 주세요.',
    };
  }

  saveUsers(
    users.map(item =>
      item.id === user.id
        ? {
            ...item,
            togetherUploadStatus: 'pending',
            togetherUploadRequestedAt: requestedAt,
            togetherUploadReviewedAt: undefined,
            togetherUploadReviewedBy: undefined,
          }
        : item,
    ),
  );

  logAdminActivity({
    actor: targetUser,
    action: 'together.access.request',
    summary: `${targetUser.email} 계정이 함께함 글 등록 권한을 요청했습니다.`,
    targetType: 'user',
    targetId: targetUser.id,
  });

  revalidatePath('/together');
  revalidatePath('/together/upload');
  revalidatePath('/admin');
  revalidatePath('/admin/together');

  return {
    status: 'success',
    message: '관리자에게 함께함 글 등록 권한을 요청했습니다.',
  };
}

export async function approveTogetherUploadAccess(userId: string) {
  const admin = await requireAdmin('/admin/together');
  const users = getUsers();
  const targetUser = users.find(user => user.id === userId);

  if (!targetUser || targetUser.role === 'admin') {
    revalidatePath('/admin/together');
    return;
  }

  const reviewedAt = new Date().toISOString();

  saveUsers(
    users.map(user =>
      user.id === userId
        ? {
            ...user,
            togetherUploadStatus: 'approved',
            togetherUploadReviewedAt: reviewedAt,
            togetherUploadReviewedBy: admin.id,
          }
        : user,
    ),
  );

  logAdminActivity({
    actor: admin,
    action: 'together.access.approve',
    summary: `${targetUser.email} 계정의 함께함 글 등록 권한을 승인했습니다.`,
    targetType: 'user',
    targetId: targetUser.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/together');
}

export async function rejectTogetherUploadAccess(userId: string) {
  const admin = await requireAdmin('/admin/together');
  const users = getUsers();
  const targetUser = users.find(user => user.id === userId);

  if (!targetUser || targetUser.role === 'admin') {
    revalidatePath('/admin/together');
    return;
  }

  const reviewedAt = new Date().toISOString();

  saveUsers(
    users.map(user =>
      user.id === userId
        ? {
            ...user,
            togetherUploadStatus: 'rejected',
            togetherUploadReviewedAt: reviewedAt,
            togetherUploadReviewedBy: admin.id,
          }
        : user,
    ),
  );

  logAdminActivity({
    actor: admin,
    action: 'together.access.reject',
    summary: `${targetUser.email} 계정의 함께함 글 등록 권한 요청을 거절했습니다.`,
    targetType: 'user',
    targetId: targetUser.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/together');
}

export async function logout() {
  const currentUser = await getCurrentUser();

  if (currentUser?.role === 'admin') {
    logAdminActivity({
      actor: currentUser,
      action: 'admin.auth.logout',
      summary: '관리자 화면에서 로그아웃했습니다.',
      targetType: 'session',
      targetId: currentUser.id,
    });
  }

  await destroySession();
  redirect('/login');
}
