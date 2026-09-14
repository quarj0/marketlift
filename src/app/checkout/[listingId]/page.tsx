import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { CheckoutClient } from "@/components/commerce/checkout-client";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-12">
        <CheckoutClient listingId={listingId} />
      </main>
    </MarketplaceShell>
  );
}
