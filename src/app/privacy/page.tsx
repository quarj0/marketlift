import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Marketlift Company LTDA handles personal data under its marketplace privacy policy.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <MarketplaceShell>
      <LegalDocument kind="privacy" />
    </MarketplaceShell>
  );
}
