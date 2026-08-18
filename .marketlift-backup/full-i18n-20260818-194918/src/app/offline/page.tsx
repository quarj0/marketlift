import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketliftLogo } from "@/components/marketplace/logo";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center">
          <MarketliftLogo />
        </div>
        <WifiOff className="mx-auto mt-10 size-14 text-slate-300" />
        <h1 className="mt-5 text-2xl font-extrabold">You’re offline</h1>
        <p className="mt-2 text-slate-500">
          Marketlift needs a connection to load fresh listings, messages, and
          account updates.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Try homepage</Link>
        </Button>
      </div>
    </main>
  );
}
