---
name: API auth connection
description: How the SwiftCare mobile app connects to the backend API for auth
---

## Rule
`EXPO_PUBLIC_DOMAIN` (= `$REPLIT_DEV_DOMAIN`) is injected in the Expo dev workflow. The mobile app derives the API base URL as `https://${EXPO_PUBLIC_DOMAIN}/api`.

**Why:** The API server artifact is mounted at path `/api`; the Expo app is on a separate `expo-domain` router. Both share the same dev domain but different subpaths.

**How to apply:** Any new API call in the mobile app should use `apiFetch()` from `utils/api.ts`, which reads `API_BASE` and attaches the stored JWT automatically.

## Token lifecycle
- Stored in AsyncStorage under key `swiftcare_jwt`
- On boot: `getStoredToken()` → `POST /auth/me` to re-hydrate; invalid token cleared silently
- JWT expiry: 7 days (set in `artifacts/api-server/src/middlewares/auth.ts`)

## User type (mobile, `AuthContext.tsx`)
- `id: number` (serial PK — NOT string)
- `sex / stateOfOrigin / mobileNumber: string | null`
- `isVerified: boolean`
- `createdAt?: string` (only present from `/auth/me`, not login/register)

## Return shape for login / register
Both return `AuthResult = { success: true } | { success: false; error: string }` so screens can show the exact API error message.

## Security note
`/auth/register` accepts `role: "user" | "doctor"` only. Sending `"admin"` falls back to `"user"` in the route handler — admin accounts cannot be self-registered.
