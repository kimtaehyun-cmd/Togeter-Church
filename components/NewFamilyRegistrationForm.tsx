'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, Send, X } from 'lucide-react';

type NewFamilyRegistrationPayload = {
  website?: string;
  name: string;
  birthDate: string;
  phone1: string;
  phone2: string;
  phone3: string;
  address: string;
  detailAddress: string;
  preferredDepartment: string;
  registrationType: string;
  firstVisitDate: string;
  inviterName: string;
  inviterPhone1: string;
  inviterPhone2: string;
  inviterPhone3: string;
  prayerRequest: string;
  agreedToContact: boolean;
};

type NewFamilyRegistrationFormState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  errors?: Record<string, string>;
};

type ToastState =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-2 text-xs font-medium" style={{ color: '#C2410C' }}>
      {message}
    </p>
  );
}

function ToastBanner({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  if (!toast) return null;

  const success = toast.type === 'success';

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-24 z-[80] w-[min(92vw,24rem)]"
    >
      <div
        className="pointer-events-auto flex items-start gap-3 rounded-3xl border px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur"
        style={{
          borderColor: success ? '#C9E6D2' : '#F4C7A1',
          backgroundColor: success ? 'rgba(243,251,246,0.98)' : 'rgba(255,247,241,0.99)',
        }}
      >
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: success ? '#DDF5E5' : '#FDE4CF',
            color: success ? '#166534' : '#9A3412',
          }}
        >
          {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: success ? '#166534' : '#9A3412' }}>
            {success ? '신청이 접수되었습니다.' : '입력 내용을 확인해 주세요.'}
          </p>
          <p
            className="mt-1 text-sm leading-6"
            style={{ color: success ? '#166534' : '#9A3412' }}
          >
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 rounded-full p-1 transition-colors duration-200"
          aria-label="토스트 닫기"
          style={{ color: success ? '#166534' : '#9A3412' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(139,94,52,0.22)] transition-all duration-150 hover:brightness-105 active:translate-y-px active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100"
      style={{ backgroundColor: '#8B5E34' }}
    >
      {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
      {pending ? '신청 접수 중...' : '새가족 등록 신청하기'}
    </button>
  );
}

const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019'];

export default function NewFamilyRegistrationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function closeToast() {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToast(null);
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3800);
  }

  function clearFieldError(name: string) {
    setFieldErrors(current => {
      const next = { ...current };

      delete next[name];

      if (name === 'Phone1' || name === 'Phone2' || name === 'Phone3') {
        delete next.phone;
      }

      return next;
    });
  }

  async function handleSubmit() {
    const form = formRef.current;
    if (!form || isSubmitting) return;

    setIsSubmitting(true);
    closeToast();

    try {
      const formData = new FormData(form);
      const payload: NewFamilyRegistrationPayload = {
        website: String(formData.get('website') ?? ''),
        name: String(formData.get('name') ?? ''),
        birthDate: String(formData.get('birthDate') ?? ''),
        phone1: String(formData.get('Phone1') ?? ''),
        phone2: String(formData.get('Phone2') ?? ''),
        phone3: String(formData.get('Phone3') ?? ''),
        address: String(formData.get('address') ?? ''),
        detailAddress: String(formData.get('detailAddress') ?? ''),
        preferredDepartment: String(formData.get('preferredDepartment') ?? ''),
        registrationType: String(formData.get('registrationType') ?? ''),
        firstVisitDate: String(formData.get('firstVisitDate') ?? ''),
        inviterName: String(formData.get('inviterName') ?? ''),
        inviterPhone1: String(formData.get('inviterPhone1') ?? ''),
        inviterPhone2: String(formData.get('inviterPhone2') ?? ''),
        inviterPhone3: String(formData.get('inviterPhone3') ?? ''),
        prayerRequest: String(formData.get('prayerRequest') ?? ''),
        agreedToContact: formData.get('agreedToContact') === 'on',
      };

      const response = await fetch('/api/new-family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as NewFamilyRegistrationFormState;

      if (result.status === 'success') {
        form.reset();
        setFieldErrors({});
        showToast('success', result.message || '새가족 등록 신청이 완료되었습니다.');
        return;
      }

      setFieldErrors(result.errors ?? {});
      showToast('error', result.message || '입력하신 내용을 다시 확인해 주세요.');
    } catch {
      showToast('error', '신청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={event => {
          event.preventDefault();
          void handleSubmit();
        }}
        onChangeCapture={event => {
          const target = event.target;
          if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLSelectElement ||
            target instanceof HTMLTextAreaElement
          ) {
            clearFieldError(target.name);
          }
        }}
        className="space-y-7"
      >
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="name" className="block text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                성명
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="이름을 입력해 주세요."
                className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              />
              <FieldError message={fieldErrors.name} />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="birthDate"
                className="block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                생년월일
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              />
              <FieldError message={fieldErrors.birthDate} />
            </div>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-semibold" style={{ color: '#1E1B4B' }}>
              연락처
            </label>
            <div className="mt-2 grid gap-2 sm:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1fr)]">
              <select
                name="Phone1"
                defaultValue="010"
                className="min-w-0 rounded-2xl border px-3 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              >
                {PHONE_PREFIXES.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                name="Phone2"
                type="tel"
                inputMode="numeric"
                maxLength={4}
                required
                placeholder="1234"
                className="min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              />
              <input
                name="Phone3"
                type="tel"
                inputMode="numeric"
                maxLength={4}
                required
                placeholder="5678"
                className="min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              />
            </div>
            <FieldError message={fieldErrors.phone} />
          </div>

          <div className="min-w-0">
            <label htmlFor="address" className="block text-sm font-semibold" style={{ color: '#1E1B4B' }}>
              주소
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              autoComplete="street-address"
              placeholder="도로명 주소를 입력해 주세요."
              className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
              style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
            />
            <input
              name="detailAddress"
              type="text"
              autoComplete="address-line2"
              placeholder="상세 주소 (선택)"
              className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
              style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
            />
            <FieldError message={fieldErrors.address} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="preferredDepartment"
                className="block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                희망 부서
              </label>
              <select
                id="preferredDepartment"
                name="preferredDepartment"
                required
                defaultValue=""
                className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              >
                <option value="" disabled>
                  선택해 주세요.
                </option>
                <option value="장년부">장년부</option>
                <option value="청년부">청년부</option>
                <option value="학생부">학생부</option>
              </select>
              <FieldError message={fieldErrors.preferredDepartment} />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="registrationType"
                className="block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                신청 유형
              </label>
              <select
                id="registrationType"
                name="registrationType"
                required
                defaultValue=""
                className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              >
                <option value="" disabled>
                  선택해 주세요.
                </option>
                <option value="새가족 등록">새가족 등록</option>
                <option value="교적 등록">교적 등록</option>
                <option value="정착 상담">정착 상담</option>
              </select>
              <FieldError message={fieldErrors.registrationType} />
            </div>
          </div>

          <div className="min-w-0">
            <label
              htmlFor="firstVisitDate"
              className="block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              첫 방문 예정일 또는 최근 방문일
            </label>
            <input
              id="firstVisitDate"
              name="firstVisitDate"
              type="date"
              required
              className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
              style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
            />
            <FieldError message={fieldErrors.firstVisitDate} />
          </div>
        </div>

        <div className="border-t pt-7" style={{ borderColor: '#F1E6DA' }}>
          <p className="text-sm font-semibold" style={{ color: '#1E1B4B' }}>
            인도자 정보
          </p>
          <p className="mt-1 text-xs leading-5" style={{ color: '#6B7280' }}>
            인도자가 있으면 입력해 주세요. 없으면 비워두셔도 됩니다.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div className="min-w-0">
              <label
                htmlFor="inviterName"
                className="block text-sm font-semibold"
                style={{ color: '#1E1B4B' }}
              >
                인도자 이름
              </label>
              <input
                id="inviterName"
                name="inviterName"
                type="text"
                placeholder="없으면 비워두셔도 됩니다."
                className="mt-2 w-full min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
              />
            </div>

            <div className="min-w-0">
              <label className="block text-sm font-semibold" style={{ color: '#1E1B4B' }}>
                인도자 연락처
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)]">
                <select
                  name="inviterPhone1"
                  defaultValue="010"
                  className="min-w-0 rounded-2xl border px-3 py-3 text-sm outline-none transition-colors duration-200"
                  style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
                >
                  {PHONE_PREFIXES.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  name="inviterPhone2"
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  className="min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                  style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
                />
                <input
                  name="inviterPhone3"
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="5678"
                  className="min-w-0 rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
                  style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 min-w-0">
            <label
              htmlFor="prayerRequest"
              className="block text-sm font-semibold"
              style={{ color: '#1E1B4B' }}
            >
              기도제목 또는 남기고 싶은 말
            </label>
            <textarea
              id="prayerRequest"
              name="prayerRequest"
              rows={5}
              placeholder="교회에 바라는 점, 기도제목, 상담 요청 사항을 자유롭게 적어 주세요."
              className="mt-2 w-full min-w-0 resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200"
              style={{ borderColor: '#E9D7C3', backgroundColor: '#FFFCF8', color: '#1E1B4B' }}
            />
          </div>
        </div>

        <section>
          <label
            className="flex items-start gap-3 rounded-2xl border px-4 py-4"
            style={{ borderColor: '#E9D7C3', backgroundColor: '#FFF8F1' }}
          >
            <input
              type="checkbox"
              name="agreedToContact"
              className="mt-1 h-4 w-4 accent-[#8B5E34]"
            />
            <span className="text-sm leading-6" style={{ color: '#5F6570' }}>
              새가족 안내와 교회 연락을 위해 입력한 개인정보를 사용하는 것에 동의합니다.
            </span>
          </label>
          <FieldError message={fieldErrors.agreedToContact} />
        </section>

        <SubmitButton pending={isSubmitting} />
      </form>

      <ToastBanner toast={toast} onClose={closeToast} />
    </>
  );
}
