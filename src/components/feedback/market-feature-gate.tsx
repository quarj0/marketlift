"use client";

import type { ReactNode } from "react";
import { useMarket } from "@/providers/market-provider";
import { useAuth } from "@/providers/auth-provider";
import { UpcomingFeature } from "@/components/feedback/upcoming-feature";

export function MarketFeatureGate({
  feature,
  children,
}: {
  feature: "payments" | "verification";
  children: ReactNode;
}) {
  const { user } = useAuth();
  const {
    paymentsEnabledForMarket,
    identityVerificationEnabledForMarket,
    loading,
  } = useMarket();
  if (loading)
    return (
      <div
        className="h-72 animate-pulse rounded-3xl bg-slate-100"
        aria-label="Loading feature availability"
      />
    );
  const enabled =
    feature === "payments"
      ? paymentsEnabledForMarket(user?.countryCode)
      : identityVerificationEnabledForMarket(user?.countryCode);
  return enabled ? <>{children}</> : <UpcomingFeature feature={feature} />;
}
