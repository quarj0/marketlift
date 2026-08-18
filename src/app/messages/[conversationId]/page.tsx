import { Suspense } from "react";

import { T } from "@/components/i18n/t";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { MessagesClient } from "@/components/messaging/messages-client";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

async function ConversationContent({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <MessagesClient initialId={conversationId} />;
}

export default function ConversationPage(props: ConversationPageProps) {
  return (
    <MarketplaceShell>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div
              className="h-[min(720px,calc(100dvh-180px))] min-h-96 animate-pulse rounded-2xl border bg-white shadow-sm"
              role="status"
              aria-busy="true"
            >
              <span className="sr-only"><T id="common.loading" /></span>
            </div>
          }
        >
          <ConversationContent {...props} />
        </Suspense>
      </main>
    </MarketplaceShell>
  );
}
