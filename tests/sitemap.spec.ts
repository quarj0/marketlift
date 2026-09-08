import { test, expect } from "@playwright/test";

test("sitemaps fail explicitly when inventory is unavailable", async ({ request }) => {
  // The browser-test API target is deliberately offline for server-side fetches.
  for (const path of ["/sitemap.xml", "/sitemaps/static.xml", "/sitemaps/abc.xml"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(503);
    expect(await response.text()).toContain("Sitemap temporarily unavailable");
  }
  expect((await request.get("/sitemaps/invalid.xml")).status()).toBe(404);
});
