import { NextResponse } from 'next/server';

import {
  type NewFamilyRegistration,
  getNewFamilyRegistrations,
  saveNewFamilyRegistrations,
} from '@/lib/data';

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

export async function POST(request: Request) {
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

    const errors: Record<string, string> = {};

    if (!name) errors.name = '이름을 입력해 주세요.';
    if (!birthDate) errors.birthDate = '생년월일을 입력해 주세요.';
    if (!phone1 || !phone2 || !phone3) errors.phone = '연락처를 모두 입력해 주세요.';
    if (!address) errors.address = '주소를 입력해 주세요.';
    if (!preferredDepartment) errors.preferredDepartment = '희망 부서를 선택해 주세요.';
    if (!registrationType) errors.registrationType = '신청 유형을 선택해 주세요.';
    if (!firstVisitDate) errors.firstVisitDate = '방문 예정일 또는 최근 방문일을 입력해 주세요.';
    if (!agreedToContact) errors.agreedToContact = '개인정보 사용 동의가 필요합니다.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({
        status: 'error',
        message: '입력하신 내용을 다시 확인해 주세요.',
        errors,
      });
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
      inviterPhone,
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
