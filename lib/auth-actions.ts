'use server';

import { redirect } from 'next/navigation';

import { createSession, destroySession, hashPassword, resolvePostLoginPath, verifyPassword } from '@/lib/auth';
import { type User, getUsers, saveUsers } from '@/lib/data';

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

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
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

  const role: User['role'] = 'member';
  const user: User = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
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
  redirect(resolvePostLoginPath(user, nextPath));
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
