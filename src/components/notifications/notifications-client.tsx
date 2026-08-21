"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";

import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { socialService } from "@/services/social.service";

export function NotificationsClient() {
  const { t, tr } = useLocale();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => socialService.getNotifications(),
  });

  const markAll = useMutation({
    mutationFn: () => socialService.markAllRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">
              {t("notifications.title")}
            </h1>
            <p className="text-sm text-slate-500">{t("notifications.body")}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="size-4" />
            {t("notifications.markAll")}
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          {query.data?.length ? (
            query.data.map((notification) => (
              <Link
                href={notification.href || "#"}
                key={notification.id}
                onClick={() => socialService.markRead(notification.id)}
                className={`flex gap-4 border-b p-5 last:border-0 ${!notification.read ? "bg-brand-50/50" : ""}`}
              >
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <Bell className="size-5 text-brand-700" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <p className="font-semibold">{notification.title}</p>
                    <span className="text-xs text-slate-400">
                      {tr(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {notification.body}
                  </p>
                </div>
                {!notification.read && (
                  <span className="mt-2 size-2 rounded-full bg-brand-600" />
                )}
              </Link>
            ))
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              {t("notifications.empty")}
            </div>
          )}
        </div>
      </main>
    </MarketplaceShell>
  );
}
