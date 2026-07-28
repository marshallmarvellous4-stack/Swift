import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signToken, requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { fullName, email, password, sex, stateOfOrigin, mobileNumber } =
    req.body as Record<string, string>;

  if (!fullName || !email || !password) {
    res
      .status(400)
      .json({ error: "fullName, email and password are required" });
    return;
  }

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
      sex: sex ?? null,
      stateOfOrigin: stateOfOrigin ?? null,
      mobileNumber: mobileNumber ?? null,
    })
    .returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.status(201).json({
    token,
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

// POST /api/auth/login
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

  res.json({
    token,
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

// GET /api/auth/me  — returns current user from token
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

export default router;
