import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Read how Marketlift Company LTDA uses necessary cookies and browser storage.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <MarketplaceShell>
      <LegalDocument kind="cookies" />
    </MarketplaceShell>
  );
}
