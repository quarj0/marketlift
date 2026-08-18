import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MarketliftLogoProps {
  size?: "compact" | "default" | "large" | "mark";
  className?: string;
  priority?: boolean;
  inverse?: boolean;
}

const dimensions = {
  compact: { width: 188, height: 34 },
  default: { width: 226, height: 40 },
  large: { width: 226, height: 160 },
  mark: { width: 48, height: 48 },
} as const;

export function MarketliftLogo({
  size = "default",
  className,
  priority = false,
}: MarketliftLogoProps) {
  const source =
    size === "mark"
      ? "/brand/marketlift-mark.png"
      : size === "large"
        ? "/brand/marketlift-logo-full.png"
        : "/brand/marketlift-logo.png";

  const imageSize = dimensions[size];

  return (
    <Link
      href="/"
      aria-label="Marketlift"
      className={cn(
        "inline-flex shrink-0 items-center overflow-hidden rounded-xl bg-[#02122f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02122f]",
        size === "large" && "rounded-2xl",
        className,
      )}
    >
      <Image
        src={source}
        alt="Marketlift"
        width={imageSize.width}
        height={imageSize.height}
        priority={priority}
        className={cn(
          "w-auto object-contain",
          size === "mark" && "size-11",
          size === "compact" && "h-8 sm:h-9",
          size === "default" && "h-9 sm:h-10",
          size === "large" && "h-28 sm:h-32",
        )}
      />
    </Link>
  );
}
