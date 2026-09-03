import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MarketliftLogoProps {
  size?: "compact" | "default" | "large" | "mark";
  className?: string;
  priority?: boolean;
  inverse?: boolean;
}

const logoSources = {
  compact: {
    src: "/brand/marketlift-logo.png",
    width: 1105,
    height: 195,
  },
  default: {
    src: "/brand/marketlift-logo.png",
    width: 1105,
    height: 195,
  },
  large: {
    src: "/brand/marketlift-logo-full.png",
    width: 1130,
    height: 795,
  },
  mark: {
    src: "/brand/marketlift-mark.png",
    width: 512,
    height: 512,
  },
} as const;

export function MarketliftLogo({
  size = "default",
  className,
  priority = false,
}: MarketliftLogoProps) {
  const source = logoSources[size];

  return (
    <Link
      href="/"
      aria-label="Marketlift"
      className={cn(
        "inline-flex shrink-0 items-center overflow-hidden rounded-xl bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        size === "compact" && "gap-1",
        size === "large" && "rounded-2xl",
        className,
      )}
    >
      {size === "compact" ? (
        <>
          <Image
            src={logoSources.mark.src}
            alt=""
            width={logoSources.mark.width}
            height={logoSources.mark.height}
            priority={priority}
            className="block size-9 shrink-0 object-contain"
          />
          <Image
            src={logoSources.compact.src}
            alt=""
            width={logoSources.compact.width}
            height={logoSources.compact.height}
            priority={priority}
            className="block h-auto w-38 object-contain sm:w-42"
          />
        </>
      ) : (
        <Image
          src={source.src}
          alt="Marketlift"
          width={source.width}
          height={source.height}
          priority={priority}
          className={cn(
            "block h-auto object-contain",
            size === "mark" && "w-11",
            size === "default" && "w-51 sm:w-56.5",
            size === "large" && "w-56.5 sm:w-[256px]",
          )}
        />
      )}
    </Link>
  );
}
