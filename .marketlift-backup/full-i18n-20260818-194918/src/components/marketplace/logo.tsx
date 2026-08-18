import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MarketliftLogoProps {
  size?: "compact" | "default" | "large" | "mark";
  className?: string;
  priority?: boolean;
  /**
   * Use the light wordmark variant on dark backgrounds.
   * The green/teal brand accents remain intact.
   */
  inverse?: boolean;
}

const imageDimensions = {
  mark: {
    width: 56,
    height: 56,
  },
  compact: {
    width: 260,
    height: 60,
  },
  default: {
    width: 260,
    height: 60,
  },
  large: {
    width: 320,
    height: 74,
  },
} as const;

export function MarketliftLogo({
  size = "default",
  className,
  priority = false,
  inverse = false,
}: MarketliftLogoProps) {
  const markOnly = size === "mark";
  const dimensions = imageDimensions[size];

  const src = markOnly
    ? "/brand/marketlift-mark.png"
    : inverse
      ? "/brand/marketlift-logo-inverse.png"
      : "/brand/marketlift-logo.png";

  return (
    <Link
      href="/"
      aria-label="Marketlift home"
      className={cn(
        "inline-flex shrink-0 items-center",
        className,
      )}
    >
      <Image
        src={src}
        alt="Marketlift"
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className={cn(
          "w-auto object-contain",
          size === "mark" && "h-10",
          size === "compact" && "h-9 sm:h-10",
          size === "default" && "h-11",
          size === "large" && "h-14 sm:h-16",
        )}
      />
    </Link>
  );
}
