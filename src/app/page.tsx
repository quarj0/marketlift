import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HomepageContent } from "@/components/marketplace/homepage-content";

export const metadata: Metadata = {
  title: "Marketlift | Buy and sell locally across Brazil",
  description:
    "Discover cars, phones, homes, electronics and everyday items from sellers across Brazil.",
};

export default function HomePage() {
  return (
    <MarketplaceShell>
      <HomepageContent />
    </MarketplaceShell>
  );
}
