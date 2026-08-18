"use client";

import { useState } from "react";
import { CheckCircle2, CircleOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { socialService } from "@/services/social.service";

export function ListingAvailabilityReport({ listingId }: { listingId: string }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const [authOpen, setAuthOpen] = useState(false);
  const [reported, setReported] = useState(false);

  const reportMutation = useMutation({
    mutationFn: () =>
      socialService.report({
        targetType: "listing",
        targetId: listingId,
        reporter: user?.id ?? "current-user",
        reason: "incorrect_info",
        description:
          "Buyer reported that the seller said this item is no longer available.",
      }),
    onSuccess: () => setReported(true),
  });

  function reportUnavailable() {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    if (!reported && !reportMutation.isPending) {
      reportMutation.mutate();
    }
  }

  return (
    <>
      <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
            {reported ? (
              <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <CircleOff className="size-5" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-950">
              {reported
                ? t("listing.availability.reportedTitle")
                : t("listing.availability.title")}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {reported
                ? t("listing.availability.reportedBody")
                : t("listing.availability.body")}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              disabled={reported || reportMutation.isPending}
              loading={reportMutation.isPending}
              loadingText={t("listing.availability.reporting")}
              onClick={reportUnavailable}
            >
              {reported ? (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              ) : (
                <CircleOff className="size-4" aria-hidden="true" />
              )}
              {reported
                ? t("listing.availability.reported")
                : t("listing.availability.action")}
            </Button>

            {!reported && (
              <p className="mt-2 text-[11px] leading-4 text-slate-400">
                {t("listing.availability.note")}
              </p>
            )}

            {reportMutation.isError && (
              <p className="mt-2 text-xs font-medium text-rose-600" role="alert">
                {t("listing.availability.error")}
              </p>
            )}
          </div>
        </div>
      </div>

      <AuthRequiredDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        action="report this item as unavailable"
      />
    </>
  );
}
