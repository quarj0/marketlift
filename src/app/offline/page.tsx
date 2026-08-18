import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { T } from '@/components/i18n/t';
import { MarketliftLogo } from '@/components/marketplace/logo';

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center"><MarketliftLogo /></div>
        <WifiOff className="mx-auto mt-10 size-14 text-slate-300" />
        <h1 className="mt-5 text-2xl font-extrabold"><T id="offline.title" /></h1>
        <p className="mt-2 text-slate-500"><T id="offline.body" /></p>
        <Button asChild className="mt-6"><Link href="/"><T id="offline.home" /></Link></Button>
      </div>
    </main>
  );
}
