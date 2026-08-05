import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, randomUUID } from "crypto";
import { and, eq, gt, isNull, isNotNull } from "drizzle-orm";
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
    .values({ userId, tokenHash, expiresAt, family });
  return plain;
}

/**
 * Verify a refresh token and rotate it.
 *
 * Returns:
 *   - `{ userId, newRefreshToken }` on success (token was valid, now rotated)
 *   - `{ stolen: true, userId }` when a **revoked** token is presented again —
 *     this is the canonical signal of a stolen token being replayed; the
 *     function immediately revokes every active token in the entire family so
 *     the real owner is forced to re-authenticate
 *   - `null` when the token is simply unknown or expired (no theft implied)
 */
export async function rotateRefreshToken(plain: string): Promise<
  | { userId: number; newRefreshToken: string }
  | { stolen: true; userId: number }
  | null
> {
  const tokenHash = hashToken(plain);
  const now = new Date();

  // Fetch the row regardless of revocation status so we can detect reuse.
  const [row] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.tokenHash, tokenHash));

  // Token not in DB at all, or already expired — nothing suspicious, just invalid.
  if (!row || row.expiresAt <= now) return null;

  // ── Theft detection ───────────────────────────────────────────────────────
  // A revoked token being presented again means someone (likely an attacker)
  // already rotated it.  Immediately invalidate every active token in the
  // family so both the real owner and the attacker are locked out.
  if (row.revokedAt !== null) {
    if (row.family) {
      await db
        .update(refreshTokensTable)
        .set({ revokedAt: now })
        .where(
          and(
            eq(refreshTokensTable.family, row.family),
            isNull(refreshTokensTable.revokedAt),
          ),
        );
    } else {
      // Legacy token without a family — revoke all active tokens for the user.
      await db
        .update(refreshTokensTable)
        .set({ revokedAt: now })
        .where(
          and(
            eq(refreshTokensTable.userId, row.userId),
            isNull(refreshTokensTable.revokedAt),
          ),
        );
    }
    return { stolen: true, userId: row.userId };
  }

  // ── Normal rotation ───────────────────────────────────────────────────────
  const newPlain = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const newHash = hashToken(newPlain);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.transaction(async (tx) => {
    await tx
      .update(refreshTokensTable)
      .set({ revokedAt: now })
      .where(eq(refreshTokensTable.id, row.id));

    await tx.insert(refreshTokensTable).values({
      userId: row.userId,
      tokenHash: newHash,
      expiresAt,
      family: row.family ?? undefined, // propagate family through the chain
    });
  });

  return { userId: row.userId, newRefreshToken: newPlain };
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
