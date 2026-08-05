import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, randomUUID } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, usersTable, refreshTokensTable } from "@workspace/db";

export interface JwtPayload {
  userId: number;
  email: string;
  role: "user" | "doctor" | "admin";
}

// Extend Express Request to carry the decoded token
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

/** Short-lived access token (15 minutes) */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
}

// ─── Refresh token helpers ────────────────────────────────────────────────────

const REFRESH_TOKEN_BYTES = 48; // 384 bits of entropy → 96-char hex string
const REFRESH_TOKEN_TTL_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a cryptographically secure refresh token, persist its hash to the
 * DB, and return the plain-text value to hand back to the client.
 *
 * Pass `familyId` when rotating (so the new token stays in the same family).
 * Omit it for new logins — a fresh family UUID will be generated.
 */
export async function createRefreshToken(
  userId: number,
  familyId?: string,
): Promise<string> {
  const plain = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(plain);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  const family = familyId ?? randomUUID();
  await db
    .insert(refreshTokensTable)
    .values({ userId, tokenHash, expiresAt, familyId: family });
  return plain;
}

/**
 * Verify a refresh token and rotate it — concurrency-safe.
 *
 * Returns:
 *   - `{ userId, newRefreshToken }` on success (token was valid, now rotated)
 *   - `{ reuseDetected: true }` when the token is already revoked — the canonical
 *     signal of a stolen/replayed token; the entire token family is immediately
 *     invalidated so both the real owner and any attacker must re-authenticate
 *   - `null` when the token is simply unknown or expired (no theft implied)
 *
 * Concurrency safety: the revocation uses an atomic conditional UPDATE
 * (`WHERE id = ? AND revoked_at IS NULL`) as the single serialisation point.
 * Only one concurrent request can win; any loser sees 0 rows updated and is
 * treated as a reuse event even if it presented a legitimately-issued token.
 * This is intentional — simultaneous refreshes of the same token are
 * indistinguishable from a replay attack.
 */
export async function rotateRefreshToken(plain: string): Promise<
  | { userId: number; newRefreshToken: string }
  | { reuseDetected: true }
  | null
> {
  const tokenHash = hashToken(plain);
  const now = new Date();

  // Fetch the row by hash regardless of revocation status so we can tell
  // "token doesn't exist" (return null) from "token is revoked" (reuse signal).
  const [row] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.tokenHash, tokenHash));

  // Unknown or expired token — nothing suspicious, just invalid.
  if (!row || row.expiresAt <= now) return null;

  return db.transaction(async (tx) => {
    // ── Atomic conditional revoke ────────────────────────────────────────────
    // Only succeeds if revoked_at IS NULL.  Two concurrent requests on the
    // same token will both enter here, but only one can UPDATE the row; the
    // other sees 0 rows and falls through to the reuse-detection branch.
    const [revoked] = await tx
      .update(refreshTokensTable)
      .set({ revokedAt: now })
      .where(
        and(
          eq(refreshTokensTable.id, row.id),
          isNull(refreshTokensTable.revokedAt),
        ),
      )
      .returning();

    if (!revoked) {
      // We lost the race (or the token was already revoked before we arrived).
      // Treat it as a potential theft: invalidate every remaining active token
      // in the family so neither the real user nor any attacker can refresh.
      await tx
        .update(refreshTokensTable)
        .set({ revokedAt: now })
        .where(
          and(
            eq(refreshTokensTable.familyId, row.familyId),
            isNull(refreshTokensTable.revokedAt),
          ),
        );
      return { reuseDetected: true as const };
    }

    // ── Issue successor token ─────────────────────────────────────────────────
    const newPlain = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const newHash = hashToken(newPlain);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await tx.insert(refreshTokensTable).values({
      userId: revoked.userId,
      tokenHash: newHash,
      expiresAt,
      familyId: revoked.familyId, // propagate family through the chain
    });

    return { userId: revoked.userId, newRefreshToken: newPlain };
  });
}

/**
 * Revoke a specific refresh token (called on logout).
 * No-ops silently if the token is not found or already revoked.
 */
export async function revokeRefreshToken(plain: string): Promise<void> {
  const tokenHash = hashToken(plain);
  await db
    .update(refreshTokensTable)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokensTable.tokenHash, tokenHash),
        isNull(refreshTokensTable.revokedAt),
      ),
    );
}

// ─── Express middlewares ──────────────────────────────────────────────────────

/** Require a valid JWT. Attaches req.user on success. */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, getJwtSecret()) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Require that the authenticated user has a verified email.
 * Must be used AFTER requireAuth (or another middleware that sets req.user).
 *
 * Exempt routes (verify-email, resend-otp, /auth/me) should NOT use this
 * middleware — they are the mechanism to become verified.
 */
export async function requireVerified(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const [user] = await db
    .select({ isVerified: usersTable.isVerified })
    .from(usersTable)
    .where(eq(usersTable.id, req.user.userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({
      error: "Email not verified. Please verify your email address to continue.",
      code: "EMAIL_NOT_VERIFIED",
    });
    return;
  }

  next();
}

/** Require one of the given roles (implies requireAuth). */
export function requireRole(...roles: Array<"user" | "doctor" | "admin">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }
      next();
    });
  };
}
