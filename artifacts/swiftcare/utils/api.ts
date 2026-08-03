/**
 * Thin API client for the SwiftCare backend.
 *
 * Base URL is derived from EXPO_PUBLIC_DOMAIN, which is injected as
 *   EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN
 * in the Expo dev workflow, pointing to the shared /api path served by
 * the api-server artifact.
 *
 * Token storage uses expo-secure-store (OS keychain / Android Keystore) on
 * native for maximum security, with an AsyncStorage fallback on web where
 * SecureStore is unavailable.
 *
 * Refresh token flow:
 * - Short-lived access tokens (15 min) are stored under TOKEN_KEY.
 * - Long-lived refresh tokens (30 days) are stored under REFRESH_TOKEN_KEY.
 * - On a 401 response, apiFetch automatically calls /auth/refresh to get a
 *   new access token (and rotated refresh token), then retries the original
 *   request exactly once.  If the refresh itself fails the user is signed out.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ─── Base URL ─────────────────────────────────────────────────────────────────

const domain = process.env.EXPO_PUBLIC_DOMAIN;
export const API_BASE = domain
  ? `https://${domain}/api`
  : "http://localhost:8080/api"; // fallback for local CLI usage

// ─── Token storage ────────────────────────────────────────────────────────────
// On iOS / Android: expo-secure-store (hardware-backed keychain / keystore)
// On web: AsyncStorage (SecureStore is not available in browsers)

const TOKEN_KEY = "swiftcare_jwt";
const REFRESH_TOKEN_KEY = "swiftcare_refresh_token";

async function secureGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// Access token
export async function getStoredToken(): Promise<string | null> {
  return secureGet(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await secureSet(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await secureDelete(TOKEN_KEY);
}

// Refresh token
export async function getStoredRefreshToken(): Promise<string | null> {
  return secureGet(REFRESH_TOKEN_KEY);
}

export async function storeRefreshToken(token: string): Promise<void> {
  await secureSet(REFRESH_TOKEN_KEY, token);
}

export async function clearStoredRefreshToken(): Promise<void> {
  await secureDelete(REFRESH_TOKEN_KEY);
}

/** Clear both access and refresh tokens (used on logout / forced sign-out). */
export async function clearAllTokens(): Promise<void> {
  await Promise.all([clearStoredToken(), clearStoredRefreshToken()]);
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
 * Called by apiFetch when a 401 is received.  Attempts to refresh the access
 * token using the stored refresh token.  Returns the new access token on
 * success, or null when the session cannot be recovered (caller should sign
 * the user out).
 */
export async function attemptTokenRefresh(): Promise<string | null> {
  const storedRefresh = await getStoredRefreshToken();
  if (!storedRefresh) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });

    if (!response.ok) {
      // Refresh token is invalid/expired — wipe both tokens
      await clearAllTokens();
      return null;
    }

    const data = (await response.json()) as {
      token: string;
      refreshToken: string;
    };

    await storeToken(data.token);
    await storeRefreshToken(data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

/**
 * Fetch a JSON endpoint on the API server.
 * Pass `token` to attach an Authorization: Bearer header.
 * Throws ApiError on non-2xx responses.
 *
 * When a request with a token receives a 401, the client will automatically
 * attempt one token refresh and retry.  If the refresh fails, an ApiError
 * with status 401 is thrown and `onSessionExpired` (if provided) is called so
 * the caller can sign the user out.
 */
export async function apiFetch<T>(
  path: string,
  options: Omit<RequestInit, "headers"> & {
    token?: string | null;
    headers?: Record<string, string>;
    /** Set to true to skip the automatic 401 → refresh → retry logic */
    skipRefresh?: boolean;
    /** Called when a token refresh fails and the user must be signed out */
    onSessionExpired?: () => void;
  } = {},
): Promise<T> {
  const { token, headers: extraHeaders, skipRefresh, onSessionExpired, ...rest } = options;

  const buildHeaders = (tk: string | null | undefined): Record<string, string> => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };
    if (tk) h["Authorization"] = `Bearer ${tk}`;
    return h;
  };

  const doFetch = async (tk: string | null | undefined): Promise<Response> => {
    try {
      return await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers: buildHeaders(tk),
      });
    } catch {
      throw new ApiError(
        "Cannot reach the server. Check your connection and try again.",
        0,
      );
    }
  };

  let response = await doFetch(token);

  // Auto-refresh: only when the caller supplied a token and refresh is allowed
  if (response.status === 401 && token && !skipRefresh) {
    const newToken = await attemptTokenRefresh();
    if (newToken) {
      // Retry the original request with the fresh access token
      response = await doFetch(newToken);
    } else {
      // Could not refresh — session is gone
      onSessionExpired?.();
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      (data as { error?: string }).error ?? `Server error (${response.status})`;
    throw new ApiError(msg, response.status);
  }

  return data as T;
}
