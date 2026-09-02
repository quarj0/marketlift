import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Get help with buying, selling, accounts, messaging and marketplace safety on Marketlift Brazil.",
  alternates: { canonical: "/help" },
};

export default function HelpLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
