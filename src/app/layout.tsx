import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import "./globals.css";

import { AccessController } from "@/components/auth/access-controller";
import { PwaRegister } from "@/components/pwa-register";
import { SkipLink } from "@/components/i18n/skip-link";
import { AuthProvider } from "@/providers/auth-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { MarketProvider } from "@/providers/market-provider";
import { MarketplaceLocationProvider } from "@/providers/marketplace-location-provider";
import { QueryProvider } from "@/providers/query-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";

const siteDescription =
  "Discover local deals, trusted sellers and marketplace listings across supported countries.";

export const metadata: Metadata = {
  title: {
    default: "Marketlift — Buy & Sell Locally",
    template: "%s | Marketlift",
  },
  description: siteDescription,
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "Marketlift",
  creator: "Marketlift",
  publisher: "Marketlift",
  category: "marketplace",
  appleWebApp: {
    capable: true,
    title: "Marketlift",
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Marketlift",
    title: "Marketlift — Buy & Sell Locally",
    description: siteDescription,
    images: [
      {
        url: "/seo/marketlift-social-card.png",
        width: 1732,
        height: 908,
        alt: "Marketlift — Buy, sell and grow locally",
      },
      {
        url: "/seo/marketlift-social-square.png",
        width: 1254,
        height: 1254,
        alt: "Marketlift — Buy, sell and grow locally",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketlift — Buy & Sell Locally",
    description: siteDescription,
    images: [
      {
        url: "/seo/marketlift-social-card.png",
        width: 1732,
        height: 908,
        alt: "Marketlift — Buy, sell and grow locally",
      },
    ],
  },
  icons: {
    icon: "/brand/marketlift-mark.png",
    apple: "/brand/marketlift-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#02122f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};


function AppPrerenderFallback() {
  return (
    <div
      className="min-h-screen bg-slate-50"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading Marketlift</span>

      <div className="border-b bg-ink-950">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-36 animate-pulse rounded-xl bg-white/10" />
          <div className="hidden h-10 flex-1 animate-pulse rounded-xl bg-white/10 lg:block" />
          <div className="h-10 w-20 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-10 w-2/3 max-w-xl animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-4 h-5 w-1/2 max-w-md animate-pulse rounded-lg bg-slate-100" />

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border bg-white"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="font-sans"
    >
      <body>
        <Suspense fallback={<AppPrerenderFallback />}>
          <QueryProvider>
            <MarketProvider>
              <LocaleProvider>
                <SkipLink />
                <MarketplaceLocationProvider>
                  <AuthProvider>
                    <RealtimeProvider>
                      <PwaRegister />
                      <AccessController>{children}</AccessController>
                    </RealtimeProvider>
                  </AuthProvider>
                </MarketplaceLocationProvider>
              </LocaleProvider>
            </MarketProvider>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
