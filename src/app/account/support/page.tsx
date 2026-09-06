"use client";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { supportService } from "@/services/support.service";
export default function SupportPage() {
  const { locale } = useLocale();
  const pt = locale === "pt-BR";
  const query = useInfiniteQuery({
    queryKey: ["support-tickets"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => supportService.list(pageParam),
    getNextPageParam: (last, pages) =>
      last.length === 25 ? pages.length * 25 : undefined,
  });
  return (
    <MarketplaceShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          <AccountSidebar />
          <section className="min-w-0">
            <h1 className="text-2xl font-black">
              {pt ? "Meus chamados" : "My support tickets"}
            </h1>
            <Button asChild className="my-5">
              <Link href="/help/report">
                {pt ? "Novo chamado" : "New support request"}
              </Link>
            </Button>
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
            {query.data?.pages.flat().map((ticket) => (
              <Link
                className="mb-3 block rounded-xl border bg-white p-5 focus-visible:ring-2 focus-visible:ring-brand-500"
                key={ticket.id}
                href={`/account/support/${ticket.id}`}
              >
                <strong className="wrap-break-word">{ticket.subject}</strong>
                <p className="mt-2 text-sm text-slate-600">
                  {ticket.reference} · {ticket.status} ·{" "}
                  {new Date(ticket.updatedAt).toLocaleDateString(locale)}
                </p>
              </Link>
            ))}
            {query.isSuccess && !query.data.pages[0].length && (
              <p>
                {pt
                  ? "Você ainda não tem chamados."
                  : "You have no support tickets yet."}
              </p>
            )}
            {query.hasNextPage && (
              <Button
                loading={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                {pt ? "Carregar mais" : "Load more"}
              </Button>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
