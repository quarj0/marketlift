"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK = "/images/avatar-placeholder.svg";

export function SellerAvatar({
  src,
  alt,
  size = 96,
  className = "size-24 rounded-3xl object-cover",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const normalizedSrc = src?.trim() || FALLBACK;

  return (
    <SellerAvatarImage
      key={normalizedSrc}
      src={normalizedSrc}
      alt={alt}
      size={size}
      className={className}
    />
  );
}

function SellerAvatarImage({
  src,
  alt,
  size,
  className,
}: {
  src: string;
  alt: string;
  size: number;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const currentSrc = failed ? FALLBACK : src;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK) setFailed(true);
      }}
    />
  );
}
