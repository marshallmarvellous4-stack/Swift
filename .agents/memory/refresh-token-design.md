---
name: Refresh token design
description: How the refresh token system is implemented across API server and mobile app
---

# Refresh token design

Access tokens are short-lived (15 min JWTs). Refresh tokens are 96-char hex strings (48 random bytes) valid for 30 days. Only the SHA-256 hash is stored in `refresh_tokens` DB table.

**Why:** Short access token TTL limits blast radius of a leaked token. Storing only the hash means a DB breach doesn't expose usable tokens.

**How to apply:**
- `signToken` in `artifacts/api-server/src/middlewares/auth.ts` issues 15-min JWTs.
- `createRefreshToken` / `rotateRefreshToken` / `revokeRefreshToken` handle the DB operations.
- `rotateRefreshToken` atomically revokes the old token and creates a new one in a transaction (single-use rotation).
- `apiFetch` in `artifacts/swiftcare/utils/api.ts` auto-retries on 401 via `attemptTokenRefresh`, then calls `onSessionExpired` if refresh fails.
- Both tokens stored in SecureStore (native) / AsyncStorage (web) under `swiftcare_jwt` and `swiftcare_refresh_token`.
- Drizzle-kit generate has a path bug when run from the package directory; create migration SQL files manually and update `lib/db/migrations/meta/_journal.json`.
