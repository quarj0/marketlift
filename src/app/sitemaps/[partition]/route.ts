import { siteBase, sitemapData, xmlEscape, xmlResponse } from "@/lib/sitemap-data";
export async function GET(_request: Request, { params }: { params: Promise<{ partition: string }> }) {
  const { partition } = await params;
  if (!/^[a-f0-9]{3}\.xml$/.test(partition)) return new Response("Not found", { status: 404 });
  try {
    const data = await sitemapData(partition.slice(0, 3));
    return xmlResponse(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(data.listings ?? []).map((row) => `<url><loc>${xmlEscape(`${siteBase}/listing/${encodeURIComponent(row.slug)}`)}</loc><lastmod>${xmlEscape(row.updated_at)}</lastmod></url>`).join("")}</urlset>`);
  } catch { return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "60" } }); }
}
