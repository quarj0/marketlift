import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MarketliftLogoProps {
  size?: "default" | "compact" | "mark";
  className?: string;
  priority?: boolean;
}

export function MarketliftLogo({
  size = "default",
  className,
  priority = false,
}: MarketliftLogoProps) {
  const markOnly = size === "mark";

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
        src={
          markOnly
            ? "/brand/marketlift-mark.png"
            : "/brand/marketlift-logo.png"
        }
        alt="Marketlift"
        width={markOnly ? 56 : 260}
        height={markOnly ? 56 : 60}
        priority={priority}
        className={cn(
          "w-auto object-contain",
          markOnly
            ? "h-10"
            : size === "compact"
              ? "h-9 sm:h-10"
              : "h-11",
        )}
      />
    </Link>
  );
}
