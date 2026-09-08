import type { Metadata } from "next";

import { T } from "@/components/i18n/t";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";

export const metadata: Metadata = {
  title: "About Marketlift Brazil",
  description:
    "Learn about Marketlift, the Brazilian online marketplace for local classified listings across vehicles, property, electronics, fashion and more.",
  alternates: { canonical: "/about" },
};

const sections = [
  ["about.marketplaceTitle", "about.marketplaceBody"],
  ["about.howTitle", "about.howBody"],
  ["about.identityTitle", "about.identityBody"],
] as const;

export default function AboutPage() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-700">
            Marketlift · Brazil
          </p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">
            <T id="about.title" />
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            <T id="about.introduction" />
          </p>

          <div className="mt-8">
            {sections.map(([title, body]) => (
              <section
                key={title}
                className="border-t py-6 first:border-0 first:pt-0"
              >
                <h2 className="text-xl font-black text-slate-950">
                  <T id={title} />
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  <T id={body} />
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </MarketplaceShell>
  );
}
