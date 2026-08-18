'use client';

import { useLocale } from '@/providers/locale-provider';

export function T({
  id,
  values,
}: {
  id: string;
  values?: Record<string, string | number>;
}) {
  const { t } = useLocale();
  return <>{t(id, values)}</>;
}

export function LocalizedValue({ value }: { value: string }) {
  const { tr } = useLocale();
  return <>{tr(value)}</>;
}

function parseLocalizedDate(value: string | Date) {
  if (value instanceof Date) return value;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}

export function LocalizedDate({
  value,
  dateStyle = 'medium',
}: {
  value: string | Date;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
}) {
  const { locale } = useLocale();
  const date = parseLocalizedDate(value);

  if (Number.isNaN(date.getTime())) {
    return <>{String(value)}</>;
  }

  return (
    <>
      {new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
        dateStyle,
      }).format(date)}
    </>
  );
}
