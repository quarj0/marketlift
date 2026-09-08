import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function remotePattern(origin?: string): RemotePattern | null {
  const value = origin?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const defaultApiOrigin =
  process.env.NODE_ENV === "production"
    ? "https://api.marketlift.com.br"
    : "http://localhost:8000";
const defaultMediaOrigin =
  process.env.NODE_ENV === "production"
    ? "https://assets.marketlift.com.br"
    : undefined;
const imageOrigins = [
  remotePattern("https://assets.marketlift.com.br"),
  remotePattern(process.env.NEXT_PUBLIC_MARKETLIFT_API_URL || defaultApiOrigin),
  remotePattern(
    process.env.NEXT_PUBLIC_MARKETLIFT_MEDIA_ORIGIN || defaultMediaOrigin,
  ),
].filter((pattern): pattern is RemotePattern => pattern !== null);

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/reset--password",
        destination: "/reset-password",
        permanent: false,
      },
    ];
  },
  images: { remotePatterns: imageOrigins },
};

export default nextConfig;
