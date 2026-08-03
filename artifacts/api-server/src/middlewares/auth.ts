import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

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

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

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
