import { MarketplaceShell } from "@/components/layout/marketplace-shell";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function Page() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            Marketlift · K&amp;C
          </p>
          <h1 className="mt-2 text-4xl font-black">Terms of use</h1>
          <p className="mt-2 text-sm text-slate-400">
            Product-facing draft for the Marketlift frontend. Final legal text
            should be reviewed before launch.
          </p>
          <div className="mt-8">
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Using Marketlift</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Marketlift provides a classifieds marketplace where people can
                discover listings and contact sellers. Buyers and sellers
                arrange product payment and delivery independently.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Accounts and listings</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Users must provide accurate account information and sellers are
                responsible for the accuracy, legality and availability of their
                listings.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Marketplace services</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Seller plans, boosts and other Marketlift service fees may be
                paid through supported payment providers. These payments are for
                Marketlift services only.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Moderation</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Marketlift may review, reject, remove or restrict listings and
                accounts that violate marketplace rules or create safety risks.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Limitation</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Marketlift does not hold seller funds or act as escrow in V1 and
                does not guarantee individual transactions.
              </p>
            </section>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
