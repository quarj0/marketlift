import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HomepageContent } from "@/components/marketplace/homepage-content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
