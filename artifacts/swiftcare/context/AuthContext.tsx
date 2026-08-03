/**
 * AuthContext — real API-backed authentication with refresh token support.
 *
 * - Short-lived access JWT (15 min) is stored in secure storage.
 * - Long-lived refresh token (30 days) is stored in secure storage alongside it.
 * - On boot, /auth/me is called to re-hydrate the user object; if the access
 *   token is expired the client attempts a silent refresh before giving up.
 * - apiFetch automatically handles 401 → refresh → retry for every request.
 * - Logout calls POST /auth/logout to revoke the refresh token server-side,
 *   then clears all local state.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ApiError,
  apiFetch,
  attemptTokenRefresh,
  clearAllTokens,
  clearStoredRefreshToken,
  getStoredRefreshToken,
  getStoredToken,
  storeRefreshToken,
  storeToken,
} from "@/utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  fullName: string;
  email: string;
  sex: string | null;
  stateOfOrigin: string | null;
  mobileNumber: string | null;
  role: "user" | "doctor" | "admin";
  isVerified: boolean;
  createdAt?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  sex: string;
  stateOfOrigin: string;
  mobileNumber: string;
  role: "user" | "doctor";
}

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  verifyEmail: (otp: string) => Promise<AuthResult>;
  resendOtp: () => Promise<AuthResult>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ApiAuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface ApiVerifyResponse {
  message: string;
  user: User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored tokens on every app launch
  useEffect(() => {
    void restoreSession();
  }, []);

  async function restoreSession(): Promise<void> {
    try {
      const stored = await getStoredToken();

      if (stored) {
        // Try with the existing access token first (happy path)
        try {
          const userData = await apiFetch<User>("/auth/me", {
            token: stored,
            skipRefresh: true, // we handle refresh ourselves below
          });
          setUser(userData);
          setToken(stored);
          return;
        } catch (err) {
          if (!(err instanceof ApiError) || err.status !== 401) throw err;
          // Access token expired — fall through to refresh
        }
      }

      // Attempt a silent refresh using the stored refresh token
      const newToken = await attemptTokenRefresh();
      if (!newToken) return; // no refresh token or it's expired — stay logged out

      const userData = await apiFetch<User>("/auth/me", {
        token: newToken,
        skipRefresh: true,
      });
      setUser(userData);
      setToken(newToken);
    } catch {
      // Unrecoverable — clear everything and stay logged out
      await clearAllTokens();
    } finally {
      setIsLoading(false);
    }
  }

  /** Force sign-out when a token refresh fails mid-session */
  function handleSessionExpired(): void {
    void (async () => {
      await clearAllTokens();
      setToken(null);
      setUser(null);
    })();
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    try {
      const { token: newToken, refreshToken, user: userData } =
        await apiFetch<ApiAuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

      await storeToken(newToken);
      await storeRefreshToken(refreshToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Login failed. Please try again.";
      return { success: false, error: message };
    }
  }

  async function register(data: RegisterData): Promise<AuthResult> {
    try {
      const { token: newToken, refreshToken, user: userData } =
        await apiFetch<ApiAuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            fullName: data.fullName,
            email: data.email.trim().toLowerCase(),
            password: data.password,
            sex: data.sex,
            stateOfOrigin: data.stateOfOrigin,
            mobileNumber: data.mobileNumber,
            role: data.role,
          }),
        });

      await storeToken(newToken);
      await storeRefreshToken(refreshToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again.";
      return { success: false, error: message };
    }
  }

  async function verifyEmail(otp: string): Promise<AuthResult> {
    try {
      const { user: updatedUser } = await apiFetch<ApiVerifyResponse>(
        "/auth/verify-email",
        {
          method: "POST",
          token,
          body: JSON.stringify({ otp }),
          onSessionExpired: handleSessionExpired,
        },
      );
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Verification failed. Please try again.";
      return { success: false, error: message };
    }
  }

  async function resendOtp(): Promise<AuthResult> {
    try {
      await apiFetch("/auth/resend-otp", {
        method: "POST",
        token,
        onSessionExpired: handleSessionExpired,
      });
      return { success: true };
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not send code. Please try again.";
      return { success: false, error: message };
    }
  }

  async function logout(): Promise<void> {
    // Revoke the refresh token server-side so it cannot be reused
    const storedRefresh = await getStoredRefreshToken();
    if (storedRefresh) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: storedRefresh }),
          skipRefresh: true, // no point refreshing during logout
        });
      } catch {
        // Best-effort — local state is cleared regardless
      }
      await clearStoredRefreshToken();
    }

    await clearAllTokens();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, verifyEmail, resendOtp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
