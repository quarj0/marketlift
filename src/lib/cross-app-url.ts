export type MarketliftApp = "marketplace" | "admin";

const productionOrigins: Record<MarketliftApp, string> = {
  marketplace: "https://marketlift.br",
  admin: "https://dash.marketlift.br",
};

const localPorts: Record<MarketliftApp, string> = {
  marketplace: "3001",
  admin: "3000",
};

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function configuredOrigin(app: MarketliftApp) {
  const value =
    app === "marketplace"
      ? process.env.NEXT_PUBLIC_MARKETPLACE_URL
      : process.env.NEXT_PUBLIC_ADMIN_URL;
  return value?.trim() ? stripTrailingSlash(value.trim()) : null;
}

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function peerLocalOrigin(app: MarketliftApp, location: Location) {
  const currentPort = location.port;
  let targetPort = localPorts[app];

  // When the two Next.js apps are started without explicit ports, the first
  // consumes 3000 and the second consumes 3001. Always route to the peer port.
  if (currentPort === "3000") targetPort = "3001";
  else if (currentPort === "3001") targetPort = "3000";

  return `${location.protocol}//${location.hostname}:${targetPort}`;
}

export function appBaseUrlForServer(app: MarketliftApp) {
  return configuredOrigin(app) ?? productionOrigins[app];
}

export function appBaseUrlForBrowser(app: MarketliftApp) {
  if (typeof window === "undefined") return appBaseUrlForServer(app);

  const configured = configuredOrigin(app);

  if (process.env.NODE_ENV === "development") {
    // Local development should follow the actual browser host and whichever
    // of ports 3000/3001 is occupied by the other frontend. This avoids a
    // "View public" link accidentally pointing back to the admin itself.
    if (configured) {
      try {
        const configuredUrl = new URL(configured);
        const looksLocal =
          isLocalHostname(configuredUrl.hostname) ||
          configuredUrl.hostname === window.location.hostname;

        // A non-local explicit override (for example a staging domain) still wins.
        if (!looksLocal) return stripTrailingSlash(configuredUrl.origin + configuredUrl.pathname);
      } catch {
        // Invalid overrides fall through to the safe local peer origin.
      }
    }

    return peerLocalOrigin(app, window.location);
  }

  return configured ?? productionOrigins[app];
}

export function joinAppUrl(baseUrl: string, path = "") {
  const base = stripTrailingSlash(baseUrl);
  if (!path) return base;
  return `${base}/${path.replace(/^\/+/, "")}`;
}
