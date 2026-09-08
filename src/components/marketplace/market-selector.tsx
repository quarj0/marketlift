'use client';

import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMarket } from '@/providers/market-provider';
import { cn } from '@/lib/utils';

export function MarketSelector({ inverse = false, compact = false, className }: { inverse?: boolean; compact?: boolean; className?: string }) {
  const { market, enabledMarkets, setMarket } = useMarket();
  if (enabledMarkets.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Marketplace country: ${market.countryName}`}
          className={cn(
            'h-11 gap-1.5 px-2.5 font-bold',
            inverse && 'border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white',
            className,
          )}
        >
          <Globe2 className="size-4" />
          <span>{market.code}</span>
          {!compact && <span className="hidden max-w-28 truncate xl:inline">{market.countryName}</span>}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Marketplace country</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {enabledMarkets.map((item) => (
          <button
            type="button"
            key={item.code}
            onClick={() => setMarket(item.code)}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black">{item.code}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{item.countryName}</span>
              <span className="block text-[11px] text-slate-500">{item.currency} · {item.currencySymbol}</span>
            </span>
            {item.code === market.code && <Check className="size-4 text-brand-700" />}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
