// ── API Client ─────────────────────────────────────────
// Thin wrapper over `fetch` with interceptors for auth tokens,
// base URL, and standard error handling.
// Swap BASE_URL to a real server and everything routes through here.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// ── Token management ───────────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ── Error class ────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// ── Core request function ──────────────────────────────
type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip the default JSON parse (e.g. for 204 No Content) */
  raw?: boolean;
};

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, raw, headers: customHeaders, ...rest } = options;

  // ── Build headers with auth interceptor ──────────────
  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // ── Make the request ─────────────────────────────────
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── Response interceptor ─────────────────────────────
  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      errBody = await res.text();
    }
    throw new ApiError(res.status, `API ${res.status}: ${res.statusText}`, errBody);
  }

  if (raw || res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Convenience methods ────────────────────────────────
export const apiClient = {
  get<T = unknown>(endpoint: string, opts?: RequestOptions) {
    return request<T>(endpoint, { ...opts, method: "GET" });
  },
  post<T = unknown>(endpoint: string, body?: unknown, opts?: RequestOptions) {
    return request<T>(endpoint, { ...opts, method: "POST", body });
  },
  put<T = unknown>(endpoint: string, body?: unknown, opts?: RequestOptions) {
    return request<T>(endpoint, { ...opts, method: "PUT", body });
  },
  patch<T = unknown>(endpoint: string, body?: unknown, opts?: RequestOptions) {
    return request<T>(endpoint, { ...opts, method: "PATCH", body });
  },
  delete<T = unknown>(endpoint: string, opts?: RequestOptions) {
    return request<T>(endpoint, { ...opts, method: "DELETE", raw: true });
  },
};

export default apiClient;
