import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions governing the Marketlift marketplace operated by Marketlift Company LTDA.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <MarketplaceShell>
      <LegalDocument kind="terms" />
    </MarketplaceShell>
  );
}
