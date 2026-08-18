import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";

import "./globals.css";
import "./marketlift-accessibility.css";

import { AccessController } from "@/components/auth/access-controller";
import { PwaRegister } from "@/components/pwa-register";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/auth-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { QueryProvider } from "@/providers/query-provider";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Marketlift — Buy & Sell in Brazil",
    template: "%s | Marketlift",
  },
  description: "Discover great local deals and trusted sellers across Brazil.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://marketlift.com.br"),
  applicationName: "Marketlift",
  appleWebApp: {
    capable: true,
    title: "Marketlift",
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/brand/marketlift-mark.png",
    apple: "/brand/marketlift-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#188847",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      className={cn("font-sans", figtree.variable)}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <LocaleProvider>
          <QueryProvider>
            <AuthProvider>
              <PwaRegister />
              <AccessController>{children}</AccessController>
            </AuthProvider>
          </QueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
