import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { MessagesClient } from "@/components/messaging/messages-client";

export const instant = false;

export default function MessagesPage() {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MessagesClient />
      </main>
    </MarketplaceShell>
  );
}
