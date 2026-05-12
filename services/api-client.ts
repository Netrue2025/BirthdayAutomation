const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window === "undefined" ? "http://localhost:4000" : window.location.origin);

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const url = new URL(path, API_BASE_URL);

  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers
  });
  const contentType = response.headers.get("Content-Type") || "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T>)
    : ({
        success: false,
        data: undefined as T,
        error: {
          code: "INVALID_RESPONSE",
          message: `API returned ${response.status} ${response.statusText || "response"} instead of JSON`
        }
      } satisfies ApiEnvelope<T>);

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || `API request failed: ${response.status}`);
  }

  return payload;
}

export { API_BASE_URL };
