'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';

export function PasswordField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`pr-12 ${props.className ?? ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-0 top-0 grid size-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label={visible ? t('auth.password.hide') : t('auth.password.show')}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
