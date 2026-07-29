/**
 * AuthContext — real API-backed authentication.
 *
 * - JWT token is stored in AsyncStorage and restored on app boot.
 * - On boot, /auth/me is called to re-hydrate the user object; if the token
 *   is expired or invalid it is silently cleared.
 * - login / register return { success, error } so screens can display the
 *   exact message from the API (e.g. "An account with this email already exists").
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ApiError,
  apiFetch,
  clearStoredToken,
  getStoredToken,
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
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ApiAuthResponse {
  token: string;
  user: User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored token on every app launch
  useEffect(() => {
    void restoreSession();
  }, []);

  async function restoreSession(): Promise<void> {
    try {
      const stored = await getStoredToken();
      if (!stored) return;

      // Verify the token is still valid by calling /auth/me
      const userData = await apiFetch<User>("/auth/me", { token: stored });
      setUser(userData);
      setToken(stored);
    } catch {
      // Token expired, revoked, or network error — clear it silently.
      // The user will see the guest view and can log in again.
      await clearStoredToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    try {
      const { token: newToken, user: userData } =
        await apiFetch<ApiAuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

      await storeToken(newToken);
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
      const { token: newToken, user: userData } =
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

  async function logout(): Promise<void> {
    await clearStoredToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
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
