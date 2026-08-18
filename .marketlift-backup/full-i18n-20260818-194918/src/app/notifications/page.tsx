"use client";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { Button } from "@/components/ui/button";
import { socialService } from "@/services/social.service";
export default function NotificationsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => socialService.getNotifications(),
  });
  const all = useMutation({
    mutationFn: () => socialService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Notifications</h1>
            <p className="text-sm text-slate-500">
              Messages, listings, payments and account updates.
            </p>
          </div>
          <Button variant="outline" onClick={() => all.mutate()}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          {q.data?.map((n) => (
            <Link
              href={n.href || "#"}
              key={n.id}
              onClick={() => socialService.markRead(n.id)}
              className={`flex gap-4 border-b p-5 last:border-0 ${!n.read ? "bg-brand-50/50" : ""}`}
            >
              <div className="rounded-xl bg-white p-2 shadow-sm">
                <Bell className="size-5 text-brand-700" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between gap-4">
                  <p className="font-semibold">{n.title}</p>
                  <span className="text-xs text-slate-400">{n.createdAt}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{n.body}</p>
              </div>
              {!n.read && (
                <span className="mt-2 size-2 rounded-full bg-brand-600" />
              )}
            </Link>
          ))}
        </div>
      </main>
    </MarketplaceShell>
  );
}
