import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
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
 */
export async function createRefreshToken(userId: number): Promise<string> {
  const plain = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(plain);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await db.insert(refreshTokensTable).values({ userId, tokenHash, expiresAt });
  return plain;
}

/**
 * Verify a refresh token and rotate it: revoke the presented token and issue
 * a fresh one.  Returns the new plain-text refresh token and the userId on
 * success, or null when the token is invalid/expired/revoked.
 */
export async function rotateRefreshToken(
  plain: string,
): Promise<{ userId: number; newRefreshToken: string } | null> {
  const tokenHash = hashToken(plain);
  const now = new Date();

  const [row] = await db
    .select()
    .from(refreshTokensTable)
    .where(
      and(
        eq(refreshTokensTable.tokenHash, tokenHash),
        gt(refreshTokensTable.expiresAt, now),
        isNull(refreshTokensTable.revokedAt),
      ),
    );

  if (!row) return null;

  // Revoke the old token and issue a new one atomically
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

    await tx
      .insert(refreshTokensTable)
      .values({ userId: row.userId, tokenHash: newHash, expiresAt });
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
