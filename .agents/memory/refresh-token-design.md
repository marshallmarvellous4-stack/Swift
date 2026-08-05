---
name: Refresh token design
description: How refresh tokens work — rotation, family tracking, concurrency-safe reuse detection.
---

# Refresh token design

Access tokens are short-lived (15 min JWTs). Refresh tokens are 96-char hex strings valid for 30 days; only the SHA-256 hash is stored in the DB.

**Why:** Short TTL limits blast radius of a leaked access token. Hash storage means a DB breach doesn't expose usable refresh tokens.

## Single-use rotation with token families

Every token belongs to a family (UUID stored in `family_id`). On login/register a new UUID is generated; every rotation passes the same `familyId` to the successor token.

## Concurrency-safe reuse detection

`rotateRefreshToken` uses an atomic conditional UPDATE as its serialisation point:

1. SELECT the row by hash (to distinguish "not found" from "revoked")
2. If not found or expired → return `null` (no reuse implied)
3. Inside a transaction: `UPDATE ... SET revoked_at = now WHERE id = ? AND revoked_at IS NULL RETURNING *`
4. If 0 rows returned → we lost the race (or token was already revoked) → invalidate the entire family → return `{ reuseDetected: true }`
5. If 1 row returned → we won → insert successor with the same `familyId` → return `{ userId, newRefreshToken }`

**Why the atomic UPDATE matters:** Reading active status before the transaction is a TOCTOU gap — two concurrent requests can both observe `revokedAt IS NULL` and both enter the rotation path, issuing two live successors with no reuse signal. The conditional UPDATE eliminates the race: exactly one request can revoke any given row.

## Error propagation

- `/auth/refresh` returns HTTP 401 + `code: "TOKEN_REUSE_DETECTED"` when `reuseDetected` is in the result
- `attemptTokenRefresh()` on the mobile client throws `TokenReuseError` when it sees that code
- `AuthContext.tsx` sets `suspiciousActivity: boolean` state on `TokenReuseError`; the UI should surface a warning to the user (tracked as a follow-up task)
