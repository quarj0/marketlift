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
          <h1 className="mt-2 text-4xl font-black">Privacy policy</h1>
          <p className="mt-2 text-sm text-slate-400">
            Product-facing draft for the Marketlift frontend. Final legal text
            should be reviewed before launch.
          </p>
          <div className="mt-8">
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Information we collect</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Account details, listing content, marketplace activity and
                device/security information may be processed to operate and
                protect Marketlift.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Seller verification</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                CPF and identity-verification information is used privately for
                seller verification. CPF must never be displayed publicly.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">How data is used</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Data supports authentication, marketplace discovery, messaging,
                moderation, fraud prevention, notifications and service
                payments.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Sharing with providers</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Marketlift may use specialist providers for payments, identity
                verification, infrastructure and communication. Integrations
                should receive only the information needed for their purpose.
              </p>
            </section>
            <section className="border-t py-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-black">Your controls</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Account settings provide controls for profile information,
                notifications and selected privacy preferences.
              </p>
            </section>
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
