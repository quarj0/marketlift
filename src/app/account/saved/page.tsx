"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Heart, Trash2 } from "lucide-react";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { socialService } from "@/services/social.service";
import { savedSearchService } from "@/services/saved-search.service";

export default function SavedPage() {
  const { t, locale } = useLocale();
  const queryClient = useQueryClient();
  const portuguese = locale === "pt-BR";

  const alerts = useQuery({
    queryKey: ["saved-searches"],
    queryFn: savedSearchService.getAll,
  });
  const toggleAlert = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      savedSearchService.setAlerts(id, enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] }),
  });
  const removeAlert = useMutation({
    mutationFn: savedSearchService.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] }),
  });

  const query = useQuery({
    queryKey: ["saved-listings"],
    queryFn: () => socialService.getSaved(),
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <section>
            <h1 className="text-2xl font-extrabold">
              {t("account.saved.title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("account.saved.body")}
            </p>

            <div className="mt-7 rounded-2xl border bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <BellRing className="size-5" />
                </span>
                <div>
                  <h2 className="font-black">
                    {portuguese ? "Alertas de busca" : "Search alerts"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {portuguese
                      ? "Receba um aviso quando novos anúncios corresponderem às buscas que você salvou."
                      : "Get notified when new listings match searches you saved."}
                  </p>
                </div>
              </div>

              {alerts.isLoading ? (
                <div className="mt-5 h-20 animate-pulse rounded-xl bg-slate-100" />
              ) : alerts.data?.length ? (
                <div className="mt-5 divide-y rounded-xl border">
                  {alerts.data.map((alert) => {
                    const q = String(alert.criteria?.q || "").trim();
                    const label =
                      alert.name ||
                      q ||
                      (portuguese ? "Busca salva" : "Saved search");
                    return (
                      <div
                        key={alert.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <a
                            href={savedSearchService.toSearchHref(
                              alert.criteria,
                            )}
                            className="block truncate text-sm font-black text-slate-900 hover:text-brand-700 hover:underline"
                          >
                            {label}
                          </a>
                          <p className="mt-1 text-xs text-slate-500">
                            {alert.alertsEnabled
                              ? portuguese
                                ? "Notificações ativas"
                                : "Notifications on"
                              : portuguese
                                ? "Notificações pausadas"
                                : "Notifications paused"}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={toggleAlert.isPending}
                            onClick={() =>
                              toggleAlert.mutate({
                                id: alert.id,
                                enabled: !alert.alertsEnabled,
                              })
                            }
                          >
                            {alert.alertsEnabled
                              ? portuguese
                                ? "Pausar"
                                : "Pause"
                              : portuguese
                                ? "Ativar"
                                : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={removeAlert.isPending}
                            aria-label={
                              portuguese ? "Excluir alerta" : "Delete alert"
                            }
                            onClick={() => removeAlert.mutate(alert.id)}
                          >
                            <Trash2 className="size-4 text-rose-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  {portuguese
                    ? "Nenhum alerta salvo ainda. Quando uma busca não tiver resultados, você poderá pedir para ser avisado."
                    : "No search alerts yet. When a search has no results, you’ll be able to ask Marketlift to notify you."}
                </p>
              )}
            </div>

            {query.isLoading ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-80 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : query.data?.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {query.data.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed p-12 text-center">
                <Heart className="mx-auto size-10 text-slate-300" />
                <h2 className="mt-4 font-bold">{t("account.saved.empty")}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("account.saved.emptyBody")}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
