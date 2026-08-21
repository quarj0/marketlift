// Seller pages depend on authenticated, session-specific data.
export const instant = false;

export default function SellingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
