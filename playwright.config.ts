import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "**/*.spec.ts", fullyParallel: false, workers: 1,
  timeout: 45_000, expect: { timeout: 10_000 }, retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3101", trace: "retain-on-failure" },
  webServer: { command: `node_modules/.bin/next ${process.env.E2E_PRODUCTION === "1" ? "start" : "dev --webpack"} --hostname 127.0.0.1 --port 3101`, url: "http://127.0.0.1:3101/login", reuseExistingServer: false, timeout: 120_000,
    env: { NEXT_PUBLIC_MARKETLIFT_API_URL: "http://127.0.0.1:8123", NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3101" },
  },
});
