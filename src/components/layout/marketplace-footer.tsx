"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { MarketliftLogo } from "@/components/marketplace/logo";
import { useLocale } from "@/providers/locale-provider";

export function MarketplaceFooter() {
  const { t } = useLocale();

  const groups = [
    {
      title: t("footer.marketplace"),
      links: [
        [t("footer.browseListings"), "/search"],
        [t("category.vehicles"), "/search?category=vehicles"],
        [t("category.properties"), "/search?category=properties"],
        [t("category.phones"), "/search?category=phones"],
        [t("footer.sellOnMarketlift"), "/selling/start"],
      ],
    },
    {
      title: t("footer.account"),
      links: [
        [t("nav.login"), "/login"],
        [t("footer.createAccount"), "/register"],
        [t("nav.saved"), "/account/saved"],
        [t("nav.messages"), "/messages"],
        [t("nav.selling"), "/selling/start"],
      ],
    },
    {
      title: t("footer.safetySupport"),
      links: [
        [t("footer.safetyTips"), "/safety"],
        [t("footer.helpCenter"), "/help"],
        [t("footer.reportProblem"), "/help/report"],
        [t("footer.terms"), "/terms"],
        [t("footer.privacy"), "/privacy"],
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-ink-950 pb-20 text-white lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8 lg:py-14">
        <div>
          <MarketliftLogo />

          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
            {t("footer.description")}
          </p>

          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-cyan-300"
              aria-hidden="true"
            />
            <span>{t("footer.noEscrow")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-extrabold text-white">
                {group.title}
              </h2>

              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={`${label}-${href}`}>
                    <Link
                      href={href}
                      className="inline-flex min-h-8 items-center text-sm text-slate-300 transition hover:text-cyan-300 focus-visible:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{t("footer.rights")}</p>
          <p>{t("footer.region")}</p>
        </div>
      </div>
    </footer>
  );
}
