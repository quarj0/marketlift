import type { ReactNode } from "react";

import { MarketplaceFooter } from "@/components/layout/marketplace-footer";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { MobileNav } from "@/components/layout/mobile-nav";

export function MarketplaceShell({
  children,
  footer = true,
}: {
  children: ReactNode;
  footer?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <MarketplaceHeader />

      <div id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </div>

      {footer && <MarketplaceFooter />}
      <MobileNav />
    </div>
  );
}
