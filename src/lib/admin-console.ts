import {
  appBaseUrlForBrowser,
  appBaseUrlForServer,
  joinAppUrl,
} from "@/lib/cross-app-url";

export function adminConsoleBaseUrl() {
  return appBaseUrlForServer("admin");
}

export function browserAdminConsoleBaseUrl() {
  return appBaseUrlForBrowser("admin");
}

export function adminConsoleUrl(path = "", baseUrl = adminConsoleBaseUrl()) {
  return joinAppUrl(baseUrl, path);
}
