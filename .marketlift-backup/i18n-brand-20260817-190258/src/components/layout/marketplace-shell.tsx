import type { ReactNode } from 'react';
import { MarketplaceHeader } from '@/components/layout/marketplace-header';
import { MarketplaceFooter } from '@/components/layout/marketplace-footer';
import { MobileNav } from '@/components/layout/mobile-nav';

export function MarketplaceShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-0">
      <MarketplaceHeader />
      <div id="main-content" tabIndex={-1}>{children}</div>
      {footer && <MarketplaceFooter />}
      <MobileNav />
    </div>
  );
}
