'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, CheckCircle2, Clock3, ShieldCheck, TriangleAlert } from 'lucide-react';
import { verificationService } from '@/services/verification.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';

export function VerificationClient() {
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const query = useQuery({ queryKey: ['seller-verification'], queryFn: verificationService.getStatus });
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await verificationService.submit({ cpf, fullName: name, birthDate });
      await queryClient.invalidateQueries({ queryKey: ['seller-verification'] });
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  }

  if (query.isLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />;

  if (query.data?.status === 'verified') {
    return <StatusCard icon={<BadgeCheck className="size-9" />} title={t('verification.verified')} text={t('verification.verifiedBody', { cpf: query.data.cpfMasked })} tone="success" />;
  }

  if (query.data?.status === 'rejected' && step !== 1) {
    return (
      <div className="space-y-4">
        <StatusCard icon={<TriangleAlert className="size-9" />} title={t('verification.rejected')} text={t('verification.rejectedBody')} tone="danger" />
        <Button onClick={() => setStep(1)}>{t('common.tryAgain')}</Button>
      </div>
    );
  }

  if (query.data && query.data.status === 'pending') {
    return <StatusCard icon={<Clock3 className="size-9" />} title={t('verification.pending')} text={t('verification.pendingBody')} tone="pending" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex gap-2">{[1, 2, 3].map((number) => <div key={number} className={`h-2 flex-1 rounded-full ${number <= step ? 'bg-brand-600' : 'bg-slate-100'}`} />)}</div>

        {step === 1 && (
          <div>
            <ShieldCheck className="size-10 text-brand-600" />
            <h2 className="mt-4 text-2xl font-black">{t('verification.title')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{t('verification.body')}</p>
            <label className="mt-6 block max-w-md"><span className="mb-1.5 block text-sm font-bold">{t('verification.cpf')}</span><Input value={cpf} onChange={(event) => setCpf(event.target.value)} placeholder="000.000.000-00" inputMode="numeric" /></label>
            <p className="mt-2 text-xs text-slate-400">{t('verification.cpfPrivate')}</p>
            <Button className="mt-6" disabled={cpf.replace(/\D/g, '').length < 11} onClick={() => setStep(2)}>{t('common.continue')}</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-black">{t('verification.confirm')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('verification.confirmBody')}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label><span className="mb-1.5 block text-sm font-bold">{t('verification.fullName')}</span><Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
              <label><span className="mb-1.5 block text-sm font-bold">{t('verification.birthDate')}</span><Input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></label>
            </div>
            <div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => setStep(1)}>{t('common.back')}</Button><Button disabled={!name.trim() || !birthDate} onClick={submit} loading={submitting} loadingText={t('verification.submitting')}>{t('verification.submit')}</Button></div>
          </div>
        )}

        {step === 3 && <StatusCard icon={<Clock3 className="size-9" />} title={t('verification.pending')} text={t('verification.pendingBody')} tone="pending" />}
      </section>

      <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm">
        <h3 className="font-black">{t('verification.why')}</h3>
        <ul className="mt-4 space-y-4 text-sm text-slate-600">
          {[t('verification.reason1'), t('verification.reason2'), t('verification.reason3')].map((reason) => <li key={reason} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />{reason}</li>)}
        </ul>
        <div className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{t('verification.disclaimer')}</div>
      </aside>
    </div>
  );
}

function StatusCard({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: 'success' | 'danger' | 'pending' }) {
  const className = tone === 'success' ? 'bg-brand-50 text-brand-700' : tone === 'danger' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800';
  return <div className={`rounded-3xl p-8 text-center ${className}`}><div className="mx-auto grid size-16 place-items-center rounded-full bg-white/70">{icon}</div><h2 className="mt-4 text-2xl font-black">{title}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 opacity-90">{text}</p></div>;
}
