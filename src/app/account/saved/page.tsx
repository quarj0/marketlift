"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";

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
  const removeSaved = useMutation({
    mutationFn: (id: string) => socialService.unsaveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-listings"] });
      queryClient.invalidateQueries({ queryKey: ["saved-listing-ids"] });
    },
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
                  <div key={listing.id} className="space-y-2">
                    <ListingCard listing={listing} />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={removeSaved.isPending}
                      onClick={() => removeSaved.mutate(listing.id)}
                    >
                      <Heart className="size-4 fill-rose-500 text-rose-500" />
                      {portuguese ? "Remover dos salvos" : "Remove from saved"}
                    </Button>
                  </div>
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

            {alerts.data?.length ? (
              <section className="mt-8 border-t pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {portuguese ? "Alertas de busca" : "Search alerts"}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {portuguese
                        ? "Buscas salvas que podem avisar você quando houver novos anúncios."
                        : "Saved searches that can notify you when new listings appear."}
                    </p>
                  </div>
                </div>

                <div className="mt-3 divide-y border-y">
                  {alerts.data.map((alert) => {
                    const q = String(alert.criteria?.q || "").trim();
                    const label =
                      alert.name ||
                      q ||
                      (portuguese ? "Busca salva" : "Saved search");
                    return (
                      <div
                        key={alert.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <a
                            href={savedSearchService.toSearchHref(
                              alert.criteria,
                            )}
                            className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-700 hover:underline"
                          >
                            {label}
                          </a>
                          <p className="mt-0.5 text-xs text-slate-500">
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
              </section>
            ) : null}
          </section>
        </div>
      </main>
    </MarketplaceShell>
  );
}
