import { AccountOverview } from '@/components/account/account-overview';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { T } from '@/components/i18n/t';
import { MarketplaceShell } from '@/components/layout/marketplace-shell';

export default function AccountPage() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <div className="mb-5 sm:mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700"><T id="account.page.eyebrow" /></p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl"><T id="account.page.title" /></h1>
          <p className="mt-1 text-slate-500"><T id="account.page.body" /></p>
        </div>
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <AccountSidebar />
          <AccountOverview />
        </div>
      </main>
    </MarketplaceShell>
  );
}
