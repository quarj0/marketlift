"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/providers/locale-provider";
import { useAuth } from "@/providers/auth-provider";
import { supportService } from "@/services/support.service";

const emptyDraft = { subject: "", category: "account", message: "" };
export default function ReportProblem() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { t, locale } = useLocale();
  const pt = locale === "pt-BR";
  const [draft, setDraft] = useState(emptyDraft);
  const [draftReady, setDraftReady] = useState(false);
  const key = `marketlift-support-draft:${user?.id || "guest"}`;
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      try {
        const guest = "marketlift-support-draft:guest";
        const value = JSON.parse(
          sessionStorage.getItem(key) ||
            (user ? sessionStorage.getItem(guest) : null) ||
            "null",
        );
        if (
          value &&
          typeof value.subject === "string" &&
          typeof value.message === "string"
        ) {
          setDraft({
            subject: value.subject,
            message: value.message,
            category: value.category || "account",
          });
          sessionStorage.setItem(key, JSON.stringify(value));
          if (user) sessionStorage.removeItem(guest);
        }
      } catch {
        /* The form remains usable without browser storage. */
      } finally {
        setDraftReady(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [key, user, hydrated]);
  function update(next: typeof draft) {
    setDraft(next);
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Optional draft persistence. */
    }
  }
  const create = useMutation({
    mutationFn: supportService.create,
    onSuccess: () => {
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* Optional storage. */
      }
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      router.push("/login?returnTo=%2Fhelp%2Freport");
      return;
    }
    create.mutate({
      ...draft,
      subject: draft.subject.trim(),
      message: draft.message.trim(),
    });
  }
  return (
    <MarketplaceShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black">
            {create.isSuccess ? t("help.report.received") : t("help.report")}
          </h1>
          {create.data ? (
            <div className="mt-5 space-y-4" role="status">
              <p>
                {pt
                  ? "Seu chamado foi salvo."
                  : "Your support request was saved."}{" "}
                <strong>{create.data.reference}</strong>
              </p>
              <Button asChild>
                <Link href={`/account/support/${create.data.id}`}>
                  {pt ? "Acompanhar chamado" : "View your ticket"}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-5">
              <p className="text-sm text-slate-600">
                {user
                  ? pt
                    ? "A resposta ficará disponível nos seus chamados."
                    : "Replies will appear in your support tickets."
                  : pt
                    ? "Escreva sua solicitação. Entre na sua conta para enviá-la; seu rascunho será preservado neste navegador."
                    : "Write your request, then sign in to send it. Your draft stays in this browser."}
              </p>
              <label className="block">
                <span className="mb-2 block font-bold">
                  {pt ? "Categoria do problema" : "Problem category"}
                </span>
                <select
                  disabled={!hydrated || !draftReady || create.isPending}
                  className="h-11 w-full rounded-xl border bg-white px-3"
                  value={draft.category}
                  onChange={(e) =>
                    update({ ...draft, category: e.target.value })
                  }
                >
                  {[
                    "account",
                    "listing",
                    "safety",
                    "technical",
                    "other",
                  ].map((k) => (
                    <option key={k} value={k}>
                      {t(`help.report.topic.${k === "listing" ? "moderation" : k}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-bold">
                  {pt ? "Assunto" : "Subject"}
                </span>
                <Input
                  disabled={!hydrated || !draftReady || create.isPending}
                  required
                  minLength={3}
                  maxLength={180}
                  value={draft.subject}
                  onChange={(e) =>
                    update({ ...draft, subject: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-bold">
                  {t("help.report.details")}
                </span>
                <textarea
                  disabled={!hydrated || !draftReady || create.isPending}
                  required
                  minLength={2}
                  maxLength={5000}
                  className="min-h-40 w-full rounded-xl border p-3 focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={draft.message}
                  onChange={(e) =>
                    update({ ...draft, message: e.target.value })
                  }
                />
              </label>
              {create.isError && (
                <p role="alert" className="text-sm text-red-700">
                  {create.error.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={!hydrated || !draftReady}
                loading={create.isPending}
              >
                {user
                  ? t("help.report.submit")
                  : pt
                    ? "Entrar e enviar"
                    : "Sign in to send"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </MarketplaceShell>
  );
}
