/**
 * Thin API client for the SwiftCare backend.
 *
 * Base URL is derived from EXPO_PUBLIC_DOMAIN, which is injected as
 *   EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN
 * in the Expo dev workflow, pointing to the shared /api path served by
 * the api-server artifact.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Base URL ─────────────────────────────────────────────────────────────────

const domain = process.env.EXPO_PUBLIC_DOMAIN;
export const API_BASE = domain
  ? `https://${domain}/api`
  : "http://localhost:8080/api";   // fallback for local CLI usage

// ─── Token storage (AsyncStorage) ────────────────────────────────────────────

const TOKEN_KEY = "swiftcare_jwt";

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function storeToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Typed fetch wrapper ──────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch a JSON endpoint on the API server.
 * Pass `token` to attach an Authorization: Bearer header.
 * Throws ApiError on non-2xx responses.
 */
export async function apiFetch<T>(
  path: string,
  options: Omit<RequestInit, "headers"> & {
    token?: string | null;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  } catch (networkErr) {
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again.",
      0,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      (data as { error?: string }).error ?? `Server error (${response.status})`;
    throw new ApiError(msg, response.status);
  }

  return data as T;
}
