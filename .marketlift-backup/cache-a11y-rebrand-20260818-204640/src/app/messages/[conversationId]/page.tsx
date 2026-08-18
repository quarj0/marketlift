import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { MessagesClient } from "@/components/messaging/messages-client";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MessagesClient initialId={conversationId} />
      </main>
    </MarketplaceShell>
  );
}
