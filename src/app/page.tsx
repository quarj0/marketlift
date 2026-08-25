import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HomepageContent } from "@/components/marketplace/homepage-content";

export const metadata: Metadata = {
  title: "Marketlift | Buy and sell locally",
  description:
    "Discover cars, phones, homes, electronics and everyday items from local sellers.",
};

export default function HomePage() {
  return (
    <MarketplaceShell>
      <HomepageContent />
    </MarketplaceShell>
  );
}
