import { publicCategories } from "@/lib/public-data";
import { flattenCategories } from "@/lib/category-tree";
import { siteBase, xmlEscape, xmlResponse } from "@/lib/sitemap-data";
import { connection } from "next/server";
export async function GET() {
  await connection();
  try {
    const data = await publicCategories();
    if (!data) throw new Error("Categories unavailable");
    const categories = flattenCategories(data);
    const paths = ["", "/search", "/safety", "/about", "/help", "/privacy", "/terms", ...categories.map(({ category }) => `/category/${encodeURIComponent(category.id)}`)];
    return xmlResponse(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${xmlEscape(siteBase + path)}</loc></url>`).join("")}</urlset>`);
  } catch { return new Response("Sitemap temporarily unavailable", { status: 503 }); }
}
