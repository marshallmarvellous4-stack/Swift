---
name: Refresh token design
description: How the refresh token system is implemented across API server and mobile app
---

# Refresh token design

Access tokens are short-lived (15 min JWTs). Refresh tokens are 96-char hex strings (48 random bytes) valid for 30 days. Only the SHA-256 hash is stored in `refresh_tokens` DB table.

**Why:** Short access token TTL limits blast radius of a leaked token. Storing only the hash means a DB breach doesn't expose usable tokens.

## Token family / theft detection (Task #6)

Every token belongs to a `family` (UUID). When a login creates the first token the family is generated; every rotation passes the same family to the successor. If a **revoked** token is ever presented again (`rotateRefreshToken` sees it already has `revokedAt` set), the server immediately revokes every active token sharing that family and returns `{ stolen: true, userId }`. The `/auth/refresh` endpoint turns this into HTTP 401 with `code: "TOKEN_REUSE_DETECTED"`.

**Why:** Single-use rotation alone doesn't detect theft — an attacker who rotates first keeps a valid chain while the real user gets 401. Family invalidation breaks the attacker's chain the moment the real user retries.

**How to apply:**
- `signToken` in `artifacts/api-server/src/middlewares/auth.ts` issues 15-min JWTs.
- `createRefreshToken(userId, familyId?)` — omit `familyId` on new logins (auto-generates UUID); pass it on rotation.
- `rotateRefreshToken(plain)` — returns `{ userId, newRefreshToken }` | `{ stolen: true, userId }` | `null`.
- `/auth/refresh` route checks `"stolen" in result` and returns 401 + `TOKEN_REUSE_DETECTED` code.
- `attemptTokenRefresh()` in mobile app returns a `RefreshResult` discriminated union (`ok: true/false` + `code`).
- `apiFetch` shows "session invalidated for security reasons" vs plain "session expired" based on `code`.
- Both tokens stored in SecureStore (native) / AsyncStorage (web) under `swiftcare_jwt` and `swiftcare_refresh_token`.
- Drizzle-kit generate has a path bug when run from the package directory; create migration SQL files manually and update `lib/db/migrations/meta/_journal.json`.
- `post-merge.sh` now runs `pnpm --filter @workspace/db run migrate` (not push-force) so all schema changes are tracked in `__drizzle_migrations`.
