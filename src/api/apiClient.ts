// ── API Client ─────────────────────────────────────────
// Thin wrapper over `fetch` with interceptors for auth tokens,
// base URL, CSRF protection, and standard error handling.
// Swap VITE_API_BASE_URL in .env to point at a real server.

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";

// ── Security: HTTPS enforcement in production ──────────
// Prevents accidental plaintext API calls in deployed environments.
if (
    import.meta.env.PROD &&
    API_BASE_URL &&
    !API_BASE_URL.startsWith("https://")
) {
    throw new Error(
        `[Security] API_BASE_URL must use HTTPS in production. Got: "${API_BASE_URL}"`
    );
}

// ── Token management ───────────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

// ── Global 401 listener ────────────────────────────────
// Register a callback (e.g. auth context logout) that fires
// whenever a 401 Unauthorized is received from the API.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Call once at app init (e.g. in AuthProvider) to wire up
 *  automatic logout on 401. */
export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
    onUnauthorized = handler;
}

export function clearUnauthorizedHandler() {
    onUnauthorized = null;
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

    // ── Build headers with auth, CSRF & security interceptors ──
    const headers = new Headers(customHeaders);

    // Always enforce strict JSON content type for requests with a body.
    // This prevents MIME-confusion attacks where a server might interpret
    // a request body as a different content type (e.g. multipart/form-data).
    if (body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    // Tell the server to reject MIME-sniffing on responses.
    // (Primarily a server-side header, but we signal intent here;
    //  the real enforcement is via the CSP meta tag + server config.)
    headers.set("Accept", "application/json");
    headers.set("X-Content-Type-Options", "nosniff");

    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // ── CSRF Protection ──────────────────────────────────
    // Read the CSRF token set by the server as a cookie / meta-tag.
    // The backend must validate this on every state-changing request.
    const csrfToken =
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
        ?? "";
    if (csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
    }

    // ── Make the request ─────────────────────────────────
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...rest,
        headers,
        credentials: "include", // send cookies for session / CSRF
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // ── Response interceptor ─────────────────────────────
    if (!res.ok) {
        // ── 401 Unauthorized → trigger global logout ─────
        if (res.status === 401) {
            // Clear the token so no subsequent requests go out
            accessToken = null;
            // Notify the auth layer (logout, redirect, etc.)
            onUnauthorized?.();
        }

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
