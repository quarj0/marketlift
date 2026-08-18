import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MarketliftLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  compact?: boolean;
}

export function MarketliftLogo({
  className,
  imageClassName,
  priority = false,
  compact = false,
}: MarketliftLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Marketlift home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src={
          compact ? "/brand/marketlift-mark.png" : "/brand/marketlift-logo.png"
        }
        alt="Marketlift"
        width={compact ? 48 : 180}
        height={48}
        priority={priority}
        className={cn(
          compact ? "size-10 object-contain" : "h-9 w-auto object-contain",
          imageClassName,
        )}
      />
    </Link>
  );
}
