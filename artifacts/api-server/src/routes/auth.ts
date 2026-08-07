import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { and, desc, eq, gt, lt, sql } from "drizzle-orm";
import { db, usersTable, emailOtpsTable } from "@workspace/db";
import {
  signToken,
  requireAuth,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../middlewares/auth.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../lib/email.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// Max failed verification attempts before an OTP is invalidated
const MAX_OTP_ATTEMPTS = 5;
// Minimum seconds between resend requests (server-side)
const RESEND_COOLDOWN_SECONDS = 60;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cryptographically secure 6-digit OTP */
function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

router.post("/auth/register", async (req, res): Promise<void> => {
  const { fullName, email, password, sex, stateOfOrigin, mobileNumber, role } =
    req.body as Record<string, string>;

  if (!fullName || !email || !password) {
    res.status(400).json({ error: "fullName, email and password are required" });
    return;
  }

  const safeRole: "user" | "doctor" = role === "doctor" ? "doctor" : "user";

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: safeRole,
      sex: sex ?? null,
      stateOfOrigin: stateOfOrigin ?? null,
      mobileNumber: mobileNumber ?? null,
    })
    .returning();

  // No OTP is sent at registration time. The verify-email screen prompts the
  // user to request a code via POST /api/auth/resend-otp, which handles
  // generation, cooldown, and delivery independently.

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = await createRefreshToken(user.id);

  res.status(201).json({
    token,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      sex: user.sex,
      stateOfOrigin: user.stateOfOrigin,
      mobileNumber: user.mobileNumber,
      isVerified: user.isVerified,
    },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as Record<string, string>;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = await createRefreshToken(user.id);

  res.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      sex: user.sex,
      stateOfOrigin: user.stateOfOrigin,
      mobileNumber: user.mobileNumber,
      isVerified: user.isVerified,
    },
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

router.post("/auth/refresh", async (req, res): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken || typeof refreshToken !== "string") {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }

  const result = await rotateRefreshToken(refreshToken);

  if (!result) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  // Token reuse detected — the presented token was already revoked, which means
  // it may have been stolen.  All tokens in the family have been invalidated;
  // return a distinct error code so the client can show a security warning.
  if ("reuseDetected" in result) {
    logger.warn("Refresh token reuse detected — entire family revoked");
    res.status(401).json({
      error: "Suspicious activity detected. Please sign in again.",
      code: "TOKEN_REUSE_DETECTED",
    });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, result.userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const newToken = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json({
    token: newToken,
    refreshToken: result.newRefreshToken,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post("/auth/logout", async (req, res): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (refreshToken && typeof refreshToken === "string") {
    await revokeRefreshToken(refreshToken);
  }

  res.json({ message: "Logged out" });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    sex: user.sex,
    stateOfOrigin: user.stateOfOrigin,
    mobileNumber: user.mobileNumber,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  });
});

// ─── POST /api/auth/verify-email ──────────────────────────────────────────────

router.post("/auth/verify-email", requireAuth, async (req, res): Promise<void> => {
  const { otp } = req.body as { otp?: string };

  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    res.status(400).json({ error: "A 6-digit verification code is required" });
    return;
  }

  const userId = req.user!.userId;

  const [currentUser] = await db
    .select({ isVerified: usersTable.isVerified })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (currentUser?.isVerified) {
    res.json({ message: "Email is already verified" });
    return;
  }

  const now = new Date();

  // Select the single newest active OTP for this user. Pinning to a specific
  // ID ensures that even if concurrent resends created stale rows, we always
  // evaluate the user's most recent code — and our atomic UPDATE targets only
  // that row, giving a firm 5-attempt ceiling regardless of concurrency.
  const [latestRef] = await db
    .select({ id: emailOtpsTable.id, storedOtp: emailOtpsTable.otp })
    .from(emailOtpsTable)
    .where(
      and(
        eq(emailOtpsTable.userId, userId),
        eq(emailOtpsTable.used, false),
        gt(emailOtpsTable.expiresAt, now),
      ),
    )
    .orderBy(desc(emailOtpsTable.createdAt))
    .limit(1);

  if (!latestRef) {
    res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    return;
  }

  // Atomically increment the attempt counter on the specific OTP row.
  // PostgreSQL serializes concurrent UPDATEs on the same row: the second
  // request will see the row already at the incremented count, so the
  // `attempts < MAX` predicate enforces the cap correctly even under load.
  const [updated] = await db
    .update(emailOtpsTable)
    .set({ attempts: sql`${emailOtpsTable.attempts} + 1` })
    .where(
      and(
        eq(emailOtpsTable.id, latestRef.id),
        lt(emailOtpsTable.attempts, MAX_OTP_ATTEMPTS),
      ),
    )
    .returning();

  if (!updated) {
    // Attempt cap already reached (concurrent requests filled it)
    res.status(429).json({
      error: "Too many incorrect attempts. Please request a new verification code.",
    });
    return;
  }

  // Wrong code
  if (latestRef.storedOtp !== otp) {
    const remaining = MAX_OTP_ATTEMPTS - updated.attempts;
    if (remaining <= 0) {
      await db
        .update(emailOtpsTable)
        .set({ used: true })
        .where(eq(emailOtpsTable.id, updated.id));
      res.status(429).json({
        error: "Too many incorrect attempts. Please request a new verification code.",
      });
    } else {
      res.status(400).json({
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      });
    }
    return;
  }

  // Correct OTP — mark used and set user as verified atomically
  await db.transaction(async (tx) => {
    await tx
      .update(emailOtpsTable)
      .set({ used: true })
      .where(eq(emailOtpsTable.id, updated.id));

    await tx
      .update(usersTable)
      .set({ isVerified: true })
      .where(eq(usersTable.id, userId));
  });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  res.json({
    message: "Email verified successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      sex: user.sex,
      stateOfOrigin: user.stateOfOrigin,
      mobileNumber: user.mobileNumber,
      isVerified: user.isVerified,
    },
  });
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────

router.post("/auth/resend-otp", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  // Run the cooldown check, invalidation, and new OTP creation inside a
  // transaction guarded by a PostgreSQL advisory lock keyed on the userId.
  // This serializes concurrent resend requests for the same user, preventing
  // two calls from both passing the cooldown check and creating duplicate OTPs.
  let waitSeconds = 0;
  let alreadyVerified = false;
  let sendError = false;

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${userId})`);

      const [user] = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!user) throw Object.assign(new Error("not_found"), { code: "not_found" });
      if (user.isVerified) { alreadyVerified = true; return; }

      // Cooldown: any OTP (used or unused) created within the window blocks resend
      const cutoff = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);
      const [recent] = await tx
        .select({ createdAt: emailOtpsTable.createdAt })
        .from(emailOtpsTable)
        .where(and(eq(emailOtpsTable.userId, userId), gt(emailOtpsTable.createdAt, cutoff)))
        .orderBy(desc(emailOtpsTable.createdAt))
        .limit(1);

      if (recent) {
        waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - (Date.now() - recent.createdAt.getTime()) / 1000);
        return;
      }

      // Invalidate all previous active OTPs, then create exactly one new one
      await tx
        .update(emailOtpsTable)
        .set({ used: true })
        .where(and(eq(emailOtpsTable.userId, userId), eq(emailOtpsTable.used, false)));

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await tx.insert(emailOtpsTable).values({ userId, otp, expiresAt });

      try {
        await sendOtpEmail({ to: user.email, otp, fullName: user.fullName });
      } catch (err) {
        logger.error({ err }, "Failed to send OTP email on resend");
        sendError = true;
        throw err; // roll back the insert
      }
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "not_found") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (!sendError) throw err;
    res.status(500).json({ error: "Failed to send verification email. Please try again." });
    return;
  }

  if (alreadyVerified) {
    res.status(400).json({ error: "Email is already verified" });
    return;
  }

  if (waitSeconds > 0) {
    res.status(429).json({
      error: `Please wait ${waitSeconds} second${waitSeconds === 1 ? "" : "s"} before requesting a new code.`,
    });
    return;
  }

  res.json({ message: "Verification code sent" });
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email is required" });
    return;
  }

  // Always respond with 200 to prevent email enumeration
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()));

  if (!user) {
    res.json({ message: "If an account exists for that email, a reset code has been sent." });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${user.id})`);

      // Cooldown: block rapid repeat requests (same window as resend-otp)
      const cutoff = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);
      const [recent] = await tx
        .select({ createdAt: emailOtpsTable.createdAt })
        .from(emailOtpsTable)
        .where(
          and(
            eq(emailOtpsTable.userId, user.id),
            eq(emailOtpsTable.purpose, "reset_password"),
            gt(emailOtpsTable.createdAt, cutoff),
          ),
        )
        .orderBy(desc(emailOtpsTable.createdAt))
        .limit(1);

      if (recent) {
        // Silently succeed — don't leak timing info
        return;
      }

      // Invalidate any previous active reset OTPs
      await tx
        .update(emailOtpsTable)
        .set({ used: true })
        .where(
          and(
            eq(emailOtpsTable.userId, user.id),
            eq(emailOtpsTable.purpose, "reset_password"),
            eq(emailOtpsTable.used, false),
          ),
        );

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await tx.insert(emailOtpsTable).values({
        userId: user.id,
        otp,
        expiresAt,
        purpose: "reset_password",
      });

      await sendPasswordResetEmail({ to: user.email, otp, fullName: user.fullName });
    });
  } catch (err) {
    logger.error({ err }, "Failed to create/send password reset OTP");
    // Still return 200 to avoid enumeration
  }

  res.json({ message: "If an account exists for that email, a reset code has been sent." });
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { email, otp, newPassword } = req.body as {
    email?: string;
    otp?: string;
    newPassword?: string;
  };

  if (!email || !otp || !newPassword) {
    res.status(400).json({ error: "email, otp, and newPassword are required" });
    return;
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    res.status(400).json({ error: "A 6-digit reset code is required" });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()));

  if (!user) {
    res.status(400).json({ error: "Invalid or expired reset code. Please request a new one." });
    return;
  }

  const now = new Date();

  const [latestRef] = await db
    .select({ id: emailOtpsTable.id, storedOtp: emailOtpsTable.otp })
    .from(emailOtpsTable)
    .where(
      and(
        eq(emailOtpsTable.userId, user.id),
        eq(emailOtpsTable.purpose, "reset_password"),
        eq(emailOtpsTable.used, false),
        gt(emailOtpsTable.expiresAt, now),
      ),
    )
    .orderBy(desc(emailOtpsTable.createdAt))
    .limit(1);

  if (!latestRef) {
    res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    return;
  }

  // Atomically increment attempts, enforcing the cap
  const [updated] = await db
    .update(emailOtpsTable)
    .set({ attempts: sql`${emailOtpsTable.attempts} + 1` })
    .where(
      and(
        eq(emailOtpsTable.id, latestRef.id),
        lt(emailOtpsTable.attempts, MAX_OTP_ATTEMPTS),
      ),
    )
    .returning();

  if (!updated) {
    res.status(429).json({
      error: "Too many incorrect attempts. Please request a new reset code.",
    });
    return;
  }

  if (latestRef.storedOtp !== otp) {
    const remaining = MAX_OTP_ATTEMPTS - updated.attempts;
    if (remaining <= 0) {
      await db
        .update(emailOtpsTable)
        .set({ used: true })
        .where(eq(emailOtpsTable.id, updated.id));
      res.status(429).json({
        error: "Too many incorrect attempts. Please request a new reset code.",
      });
    } else {
      res.status(400).json({
        error: `Incorrect reset code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      });
    }
    return;
  }

  // Correct code — update password and mark OTP used atomically
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.transaction(async (tx) => {
    await tx
      .update(emailOtpsTable)
      .set({ used: true })
      .where(eq(emailOtpsTable.id, updated.id));

    await tx
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, user.id));
  });

  res.json({ message: "Password reset successfully. You can now sign in." });
});

export default router;
