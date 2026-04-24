import { NextResponse } from 'next/server';

import {
  NEW_FAMILY_PREFERRED_DEPARTMENTS,
  NEW_FAMILY_REGISTRATION_TYPES,
  type NewFamilyRegistration,
  getNewFamilyRegistrations,
  saveNewFamilyRegistrations,
} from '@/lib/data';
import { checkMemoryRateLimit, getClientIpAddress } from '@/lib/request-rate-limit';

const NEW_FAMILY_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const NEW_FAMILY_RATE_LIMIT_MAX_REQUESTS = 5;
const NEW_FAMILY_RATE_LIMIT_BLOCK_MS = 30 * 60 * 1000;

type NewFamilyRegistrationPayload = {
  website?: string;
  name?: string;
  birthDate?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  address?: string;
  detailAddress?: string;
  preferredDepartment?: string;
  registrationType?: string;
  firstVisitDate?: string;
  inviterName?: string;
  inviterPhone1?: string;
  inviterPhone2?: string;
  inviterPhone3?: string;
  prayerRequest?: string;
  agreedToContact?: boolean;
};

function normalize(value: unknown): string {
  return String(value ?? '').trim();
}

function joinPhoneParts(...parts: string[]): string {
  return parts.filter(Boolean).join('-');
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function getTodayDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isBirthDateAllowed(value: string) {
  if (!isValidDateInput(value)) {
    return false;
  }

  return value <= getTodayDateInput();
}

function isValidPhonePart(value: string, minLength: number, maxLength = minLength) {
  return new RegExp(`^\\d{${minLength},${maxLength}}$`).test(value);
}

export async function POST(request: Request) {
  const clientIp = getClientIpAddress(request.headers);
  const userAgent = request.headers.get('user-agent')?.trim() ?? 'unknown-user-agent';
  const rateLimitKey = clientIp
    ? `new-family:${clientIp}`
    : `new-family:ua:${userAgent}`;
  const rateLimitResult = checkMemoryRateLimit({
    key: rateLimitKey,
    limit: NEW_FAMILY_RATE_LIMIT_MAX_REQUESTS,
    windowMs: NEW_FAMILY_RATE_LIMIT_WINDOW_MS,
    blockDurationMs: NEW_FAMILY_RATE_LIMIT_BLOCK_MS,
  });

  if (!rateLimitResult.ok) {
    return NextResponse.json(
      {
        status: 'error',
        message: '짧은 시간 안에 너무 많은 신청이 접수되었습니다. 잠시 후 다시 시도해 주세요.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfterSeconds),
        },
      },
    );
  }

  try {
    const payload = (await request.json()) as NewFamilyRegistrationPayload;

    if (normalize(payload.website)) {
      return NextResponse.json({
        status: 'success',
        message: '신청이 정상적으로 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.',
      });
    }

    const name = normalize(payload.name);
    const birthDate = normalize(payload.birthDate);
    const phone1 = normalize(payload.phone1);
    const phone2 = normalize(payload.phone2);
    const phone3 = normalize(payload.phone3);
    const phone = joinPhoneParts(phone1, phone2, phone3);
    const address = normalize(payload.address);
    const detailAddress = normalize(payload.detailAddress);
    const preferredDepartment =
      normalize(payload.preferredDepartment) as NewFamilyRegistration['preferredDepartment'];
    const registrationType =
      normalize(payload.registrationType) as NewFamilyRegistration['registrationType'];
    const firstVisitDate = normalize(payload.firstVisitDate);
    const inviterName = normalize(payload.inviterName);
    const inviterPhone = joinPhoneParts(
      normalize(payload.inviterPhone1),
      normalize(payload.inviterPhone2),
      normalize(payload.inviterPhone3),
    );
    const prayerRequest = normalize(payload.prayerRequest);
    const agreedToContact = Boolean(payload.agreedToContact);
    const inviterPhoneParts = [
      normalize(payload.inviterPhone1),
      normalize(payload.inviterPhone2),
      normalize(payload.inviterPhone3),
    ];
    const hasInviterPhoneInput = Boolean(inviterPhoneParts[1] || inviterPhoneParts[2]);

    const errors: Record<string, string> = {};

    if (!name) errors.name = '이름을 입력해 주세요.';
    if (!birthDate) {
      errors.birthDate = '생년월일을 입력해 주세요.';
    } else if (!isBirthDateAllowed(birthDate)) {
      errors.birthDate = '올바른 생년월일을 입력해 주세요.';
    }

    if (!phone1 || !phone2 || !phone3) {
      errors.phone = '연락처를 모두 입력해 주세요.';
    } else if (
      !['010', '011', '016', '017', '018', '019'].includes(phone1) ||
      !isValidPhonePart(phone2, 3, 4) ||
      !isValidPhonePart(phone3, 4)
    ) {
      errors.phone = '연락처 형식을 다시 확인해 주세요.';
    }

    if (!address) errors.address = '주소를 입력해 주세요.';
    if (!preferredDepartment) {
      errors.preferredDepartment = '희망 부서를 선택해 주세요.';
    } else if (!NEW_FAMILY_PREFERRED_DEPARTMENTS.includes(preferredDepartment)) {
      errors.preferredDepartment = '희망 부서를 다시 선택해 주세요.';
    }

    if (!registrationType) {
      errors.registrationType = '신청 유형을 선택해 주세요.';
    } else if (!NEW_FAMILY_REGISTRATION_TYPES.includes(registrationType)) {
      errors.registrationType = '신청 유형을 다시 선택해 주세요.';
    }

    if (!firstVisitDate) {
      errors.firstVisitDate = '방문 예정일 또는 최근 방문일을 입력해 주세요.';
    } else if (!isValidDateInput(firstVisitDate)) {
      errors.firstVisitDate = '방문일 형식을 다시 확인해 주세요.';
    }

    if (!agreedToContact) errors.agreedToContact = '개인정보 사용 동의가 필요합니다.';

    if (!inviterName && hasInviterPhoneInput) {
      errors.inviterName = '인도자 연락처를 입력하려면 인도자 이름도 함께 입력해 주세요.';
    } else if (
      hasInviterPhoneInput &&
      (!['010', '011', '016', '017', '018', '019'].includes(inviterPhoneParts[0] ?? '') ||
        !isValidPhonePart(inviterPhoneParts[1] ?? '', 3, 4) ||
        !isValidPhonePart(inviterPhoneParts[2] ?? '', 4))
    ) {
      errors.inviterPhone = '인도자 연락처 형식을 다시 확인해 주세요.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: '입력하신 내용을 다시 확인해 주세요.',
          errors,
        },
        { status: 400 },
      );
    }

    const registrations = getNewFamilyRegistrations();
    const newItem: NewFamilyRegistration = {
      id: Date.now().toString(),
      name,
      birthDate,
      phone,
      address,
      detailAddress,
      preferredDepartment,
      registrationType,
      firstVisitDate,
      inviterName,
      inviterPhone: inviterName && hasInviterPhoneInput ? inviterPhone : '',
      prayerRequest,
      agreedToContact,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    saveNewFamilyRegistrations([newItem, ...registrations]);

    return NextResponse.json({
      status: 'success',
      message: '새가족 등록 신청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.',
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        message: '신청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
}
