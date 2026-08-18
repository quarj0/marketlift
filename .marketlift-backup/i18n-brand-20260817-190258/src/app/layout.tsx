import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Figtree } from "next/font/google";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { AccessController } from "@/components/auth/access-controller";
import { PwaRegister } from "@/components/pwa-register";
import { cn } from "@/lib/utils";

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
    icon: "/brand/marketlift-logo.png",
    apple: "/brand/marketlift-logo.png",
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
      lang="pt-Br"
      className={cn("font-sans", figtree.variable)}
      data-scroll-behavior="smooth"
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <QueryProvider>
          <AuthProvider>
            <PwaRegister />

            <AccessController>{children}</AccessController>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
