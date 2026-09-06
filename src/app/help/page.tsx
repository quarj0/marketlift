"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  MessageCircle,
  Search,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/providers/locale-provider";

const topics: Array<{ icon: LucideIcon; title: string; description: string; href: string }> =
  [
    {
      icon: UserRound,
      title: "help.topic.account",
      href: "/account/settings",
      description: "help.topic.accountBody",
    },
    {
      icon: Store,
      title: "help.topic.selling",
      href: "/selling/listings/new",
      description: "help.topic.sellingBody",
    },
    {
      icon: MessageCircle,
      title: "help.topic.messages",
      href: "/messages",
      description: "help.topic.messagesBody",
    },
    {
      icon: ShieldCheck,
      title: "help.topic.safety",
      href: "/safety",
      description: "help.topic.safetyBody",
    },
    {
      icon: BookOpen,
      title: "help.topic.rules",
      href: "/terms",
      description: "help.topic.rulesBody",
    },
  ];

export default function Help() {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState("");
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const visible = topics.filter((topic) =>
    normalize(t(topic.title) + " " + t(topic.description)).includes(
      normalize(search.trim()),
    ),
  );
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            {t("help.eyebrow")}
          </p>
          <h1 className="mt-2 text-4xl font-black">{t("help.title")}</h1>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-11"
              placeholder={t("help.search")}
              aria-label={t("help.search")}
            />
          </div>
        </div>
        <p className="mt-5 text-center text-sm text-slate-600" role="status">
          {visible.length === 0
            ? locale === "pt-BR"
              ? "Nenhuma resposta encontrada. Entre em contato abaixo."
              : "No answers found. Contact support below."
            : `${visible.length} ${locale === "pt-BR" ? "tópicos" : "topics"}`}
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ icon: Icon, title, description, href }) => (
            <article
              key={title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <Icon className="size-6 text-brand-600" />
              <h2 className="mt-3 font-black">{t(title)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {t(description)}
              </p>
              <Link href={href} className="mt-4 inline-flex min-h-11 items-center font-bold text-brand-700 underline">{locale === "pt-BR" ? "Abrir" : "Open"}</Link>
            </article>
          ))}
        </div>
        <section className="mt-10 rounded-3xl bg-slate-950 p-7 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">{t("help.still")}</h2>
            <p className="mt-1 text-sm text-slate-300">{t("help.stillBody")}</p>
          </div>
          <Link
            href="/help/report"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 sm:mt-0"
          >
            {t("help.report")}
          </Link>
        </section>
      </main>
    </MarketplaceShell>
  );
}
