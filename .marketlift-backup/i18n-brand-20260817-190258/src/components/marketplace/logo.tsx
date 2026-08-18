import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MarketliftLogo({
  size = 'default',
  inverse = false,
  className,
}: {
  size?: 'compact' | 'default' | 'large';
  inverse?: boolean;
  className?: string;
}) {
  const dimensions = size === 'large'
    ? 'h-24 w-36 sm:h-28 sm:w-44'
    : size === 'compact'
      ? 'h-11 w-[66px] sm:h-12 sm:w-[72px]'
      : 'h-14 w-[84px]';

  return (
    <Link
      href="/"
      aria-label="Marketlift home"
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-xl bg-[#06183a] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        dimensions,
        inverse ? 'ring-1 ring-white/10' : 'shadow-sm',
        className,
      )}
    >
      <Image
        src="/brand/marketlift-logo.png"
        alt="Marketlift — Buy, Sell, Grow"
        fill
        priority
        sizes={size === 'large' ? '176px' : size === 'compact' ? '72px' : '84px'}
        className="object-contain"
      />
    </Link>
  );
}
