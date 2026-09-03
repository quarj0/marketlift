"use client";

import { Input } from "@/components/ui/input";

const FALLBACK_DIAL_CODES: Record<string, string> = {
  BR: "+55",
  GH: "+233",
  NG: "+234",
  KE: "+254",
  ZA: "+27",
  CI: "+225",
};

function normalizeDialCode(countryCode?: string, dialCode?: string) {
  const configured = dialCode?.trim();
  if (configured) return configured.startsWith("+") ? configured : `+${configured}`;
  return FALLBACK_DIAL_CODES[(countryCode || "").trim().toUpperCase()] || "+";
}

function localDigits(value: string, dialCode: string) {
  const compact = value.replace(/[^\d+]/g, "");
  const dialDigits = dialCode.replace(/\D/g, "");

  if (compact.startsWith(`+${dialDigits}`)) {
    return compact.slice(dialDigits.length + 1).replace(/\D/g, "");
  }

  const digits = compact.replace(/\D/g, "");
  if (dialDigits && digits.startsWith(dialDigits)) {
    return digits.slice(dialDigits.length);
  }

  return digits;
}

export function PhoneInput({
  value,
  onChange,
  countryCode,
  dialCode,
  id,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  dialCode?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const prefix = normalizeDialCode(countryCode, dialCode);
  const local = localDigits(value || "", prefix);

  return (
    <div
      className={`flex h-11 overflow-hidden rounded-xl border bg-white transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 ${
        invalid ? "border-rose-400" : "border-slate-200"
      }`}
    >
      <span className="inline-flex min-w-16 shrink-0 items-center justify-center border-r bg-slate-50 px-3 text-sm font-bold text-slate-700">
        {prefix}
      </span>
      <Input
        id={id}
        value={local}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        aria-invalid={invalid}
        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
        placeholder="Phone number"
        onChange={(event) => {
          const nextLocal = event.target.value.replace(/\D/g, "");
          onChange(nextLocal ? `${prefix}${nextLocal}` : "");
        }}
      />
    </div>
  );
}
