import { siteBase, sitemapData, xmlEscape, xmlResponse } from "@/lib/sitemap-data";
import { connection } from "next/server";
export async function GET() {
  await connection();
  try {
    const data = await sitemapData();
    const paths = ["/sitemaps/static.xml", ...(data.partitions ?? []).map((part) => `/sitemaps/${part.bucket}.xml`)];
    return xmlResponse(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<sitemap><loc>${xmlEscape(siteBase + path)}</loc></sitemap>`).join("")}</sitemapindex>`);
  } catch { return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "60" } }); }
}
