"use client";

import { BadgeCheck, CalendarClock, CreditCard, ShieldCheck } from "lucide-react";

import { useLocale } from "@/providers/locale-provider";

export function UpcomingFeature({
  feature,
}: {
  feature: "payments" | "verification";
}) {
  const { t } = useLocale();
  const Icon = feature === "payments" ? CreditCard : BadgeCheck;

  return (
    <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,.13),transparent_38%),linear-gradient(135deg,#f8fbff,#fff)] p-6 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-black uppercase tracking-[.12em] text-brand-800">
          <CalendarClock className="size-4" aria-hidden="true" />
          {t("common.upcoming")}
        </span>
        <span className="mt-6 grid size-14 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/15">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
          {t(`upcoming.${feature}.title`)}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          {t(`upcoming.${feature}.body`)}
        </p>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <p>{t(`upcoming.${feature}.safety`)}</p>
        </div>
      </div>
    </section>
  );
}
