"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { supportService } from "@/services/support.service";
export default function SupportDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { locale } = useLocale();
  const pt = locale === "pt-BR";
  const client = useQueryClient();
  const [body, setBody] = useState("");
  const query = useInfiniteQuery({
    queryKey: ["support-ticket", ticketId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => supportService.get(ticketId, pageParam),
    getNextPageParam: (last, pages) =>
      last?.messagesHasMore ? pages.length * 50 : undefined,
  });
  const ticket = query.data?.pages[0];
  const reply = useMutation({
    mutationFn: () => supportService.reply(ticketId, body.trim()),
    onSuccess: async () => {
      setBody("");
      await client.invalidateQueries({
        queryKey: ["support-ticket", ticketId],
      });
      await client.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
  const messages = [
    ...new Map(
      (
        query.data?.pages
          .slice()
          .reverse()
          .flatMap((p) => p?.messages || []) || []
      ).map((m) => [m.id, m]),
    ).values(),
  ];
  function submit(e: FormEvent) {
    e.preventDefault();
    reply.mutate();
  }
  return (
    <MarketplaceShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <Link
          href="/account/support"
          className="inline-flex min-h-11 items-center font-bold text-brand-700"
        >
          ← {pt ? "Meus chamados" : "My tickets"}
        </Link>
        {query.isPending && (
          <p role="status">{pt ? "Carregando…" : "Loading…"}</p>
        )}
        {query.isError && (
          <div role="alert">
            <p>{query.error.message}</p>
            <Button onClick={() => query.refetch()}>
              {pt ? "Tentar novamente" : "Retry"}
            </Button>
          </div>
        )}
        {query.isSuccess && !ticket && (
          <h1>{pt ? "Chamado não encontrado" : "Ticket not found"}</h1>
        )}
        {ticket && (
          <>
            <h1 className="my-5 wrap-break-word text-2xl font-black">
              {ticket.subject}
            </h1>
            <p className="text-sm text-slate-600">
              {ticket.reference} · {ticket.status}
            </p>
            {query.hasNextPage && (
              <Button
                className="mt-5"
                loading={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                {pt ? "Mensagens anteriores" : "Older messages"}
              </Button>
            )}
            <ol className="my-6 space-y-4">
              {messages.map((m) => (
                <li className="rounded-xl border bg-white p-5" key={m.id}>
                  <p className="text-sm font-bold">
                    {m.senderName} ·{" "}
                    {new Date(m.createdAt).toLocaleString(locale)}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap wrap-break-word">
                    {m.body}
                  </p>
                  {m.attachmentUrl && (
                    <a
                      className="inline-flex min-h-11 items-center text-brand-700 underline"
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {pt ? "Abrir anexo" : "Open attachment"}
                    </a>
                  )}
                </li>
              ))}
            </ol>
            {ticket.status !== "closed" && (
              <form onSubmit={submit} className="space-y-4">
                <label className="block font-bold">
                  {pt ? "Sua resposta" : "Your reply"}
                  <textarea
                    required
                    minLength={2}
                    maxLength={5000}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="mt-2 min-h-32 w-full rounded-xl border p-3 focus-visible:ring-2 focus-visible:ring-brand-500"
                  />
                </label>
                {reply.isError && <p role="alert">{reply.error.message}</p>}
                <Button type="submit" loading={reply.isPending}>
                  {pt ? "Enviar resposta" : "Send reply"}
                </Button>
              </form>
            )}
          </>
        )}
      </main>
    </MarketplaceShell>
  );
}
