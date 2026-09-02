export type GraphQLErrorExtensions = {
  code?: string;
  status?: number;
  details?: unknown;
  [key: string]: unknown;
};

type GraphQLErrorPayload = {
  message: string;
  extensions?: GraphQLErrorExtensions;
};

export class MarketliftApiError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, extensions?: GraphQLErrorExtensions) {
    super(message);
    this.name = "MarketliftApiError";
    this.code =
      typeof extensions?.code === "string" ? extensions.code : undefined;
    this.status =
      typeof extensions?.status === "number" ? extensions.status : undefined;
    this.details = extensions?.details;
  }
}

const configuredApiBase = process.env.NEXT_PUBLIC_MARKETLIFT_API_URL?.trim();

function resolveApiBaseUrl() {
  const defaultApiBase =
    process.env.NODE_ENV === "production"
      ? "https://api.marketlift.com.br"
      : "http://localhost:8000";
  const raw = (configuredApiBase || defaultApiBase).replace(/\/+$/, "");
  if (typeof window === "undefined") return raw;

  try {
    const url = new URL(raw);
    const browserHost = window.location.hostname;
    const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);

    // Cookie/session auth is site-sensitive. During local development keep the
    // API on the same loopback hostname as the browser (localhost vs 127.0.0.1).
    if (loopbackHosts.has(url.hostname) && loopbackHosts.has(browserHost)) {
      url.hostname = browserHost;
      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    // Let fetch surface an invalid explicitly configured URL normally.
  }

  return raw;
}

export const API_BASE_URL = resolveApiBaseUrl();

export function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${encodeURIComponent(name)}=`));
  return match ? decodeURIComponent(match.slice(match.indexOf("=") + 1)) : "";
}

let csrfPromise: Promise<string> | null = null;

export async function ensureCsrfToken() {
  const existing = getCookie("csrftoken");
  if (existing) return existing;
  if (!csrfPromise) {
    csrfPromise = fetch(resolveApiUrl("/api/v1/auth/csrf/"), {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new MarketliftApiError(
            "Unable to initialize a secure session.",
            { status: response.status },
          );
        const body = (await response.json()) as { csrfToken?: string };
        return getCookie("csrftoken") || body.csrfToken || "";
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown; csrf?: boolean } = {},
): Promise<T> {
  const { json, csrf = false, headers, ...rest } = init;
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Accept", "application/json");
  if (json !== undefined) nextHeaders.set("Content-Type", "application/json");
  if (
    csrf ||
    (rest.method && rest.method !== "GET" && rest.method !== "HEAD")
  ) {
    const token = await ensureCsrfToken();
    if (token) nextHeaders.set("X-CSRFToken", token);
  }

  const response = await fetch(resolveApiUrl(path), {
    ...rest,
    credentials: "include",
    cache: rest.cache ?? "no-store",
    headers: nextHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const message =
      typeof body === "object" && body && "detail" in body
        ? String((body as { detail?: unknown }).detail || "Request failed.")
        : `Request failed with status ${response.status}.`;
    throw new MarketliftApiError(message, {
      status: response.status,
      details: body,
    });
  }
  return body as T;
}

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  let csrf = "";
  let serverCookie = "";

  
  let serverOrigin = "";
if (typeof document === "undefined") {
    const configuredOrigin =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_MARKETPLACE_URL?.trim();
    const fallbackOrigin =
      process.env.NODE_ENV === "production"
        ? "https://marketlift.com.br"
        : "http://localhost:3001";

    try {
      const parsed = new URL(configuredOrigin || fallbackOrigin);
      const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(
        parsed.hostname,
      );
      serverOrigin =
        process.env.NODE_ENV === "production" && isLoopback
          ? "https://marketlift.com.br"
          : parsed.origin;
    } catch {
      serverOrigin = fallbackOrigin;
    }

    const csrfResponse = await fetch(resolveApiUrl("/api/v1/auth/csrf/"), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!csrfResponse.ok)
      throw new MarketliftApiError(
        "Unable to initialize a secure API request.",
        { status: csrfResponse.status },
      );
    const body = (await csrfResponse.json()) as { csrfToken?: string };
    csrf = body.csrfToken || "";
    const setCookie = csrfResponse.headers.get("set-cookie") || "";
    const cookieMatch = setCookie.match(/csrftoken=([^;]+)/i);
    if (cookieMatch) serverCookie = `csrftoken=${cookieMatch[1]}`;
  } else {
    csrf = await ensureCsrfToken();
  }

  const response = await fetch(resolveApiUrl("/graphql/"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
      ...(serverCookie ? { Cookie: serverCookie } : {}),
      ...(serverOrigin
        ? {
            Origin: serverOrigin,
            Referer: `${serverOrigin}/`,
          }
        : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: GraphQLErrorPayload[];
  };

  if (!response.ok) {
    throw new MarketliftApiError("GraphQL request failed.", {
      status: response.status,
      details: payload,
    });
  }
  if (payload.errors?.length) {
    const first = payload.errors[0];
    throw new MarketliftApiError(first.message, first.extensions);
  }
  if (!payload.data) throw new MarketliftApiError("The API returned no data.");
  return payload.data;
}
