import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, doctorsTable } from "@workspace/db";
import { requireRole, requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /api/doctors  — public
router.get("/doctors", async (_req, res): Promise<void> => {
  const doctors = await db
    .select()
    .from(doctorsTable)
    .orderBy(doctorsTable.name);
  res.json(doctors);
});

// GET /api/doctors/:id  — public
router.get("/doctors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid doctor id" });
    return;
  }

  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, id));

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

// POST /api/doctors  — admin only
router.post("/doctors", requireRole("admin"), async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!body.name || !body.specialty) {
    res.status(400).json({ error: "name and specialty are required" });
    return;
  }

  const [doctor] = await db
    .insert(doctorsTable)
    .values({
      name: body.name as string,
      specialty: body.specialty as string,
      email: (body.email as string) ?? null,
      experience: body.experience ? Number(body.experience) : null,
      location: (body.location as string) ?? null,
      availability: (body.availability as "online" | "offline" | "busy") ?? "offline",
      image: (body.image as string) ?? null,
      bio: (body.bio as string) ?? null,
      consultationFee: body.consultationFee ? Number(body.consultationFee) : null,
      rating: body.rating ? Number(body.rating) : 0,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 0,
      languages: (body.languages as string) ?? null,
      userId: body.userId ? Number(body.userId) : null,
    })
    .returning();

  res.status(201).json(doctor);
});

// PUT /api/doctors/:id  — admin only
router.put("/doctors/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid doctor id" });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const [doctor] = await db
    .update(doctorsTable)
    .set({
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.specialty !== undefined && { specialty: body.specialty as string }),
      ...(body.email !== undefined && { email: body.email as string }),
      ...(body.experience !== undefined && { experience: Number(body.experience) }),
      ...(body.location !== undefined && { location: body.location as string }),
      ...(body.availability !== undefined && { availability: body.availability as "online" | "offline" | "busy" }),
      ...(body.image !== undefined && { image: body.image as string }),
      ...(body.bio !== undefined && { bio: body.bio as string }),
      ...(body.consultationFee !== undefined && { consultationFee: Number(body.consultationFee) }),
      ...(body.rating !== undefined && { rating: Number(body.rating) }),
      ...(body.reviewCount !== undefined && { reviewCount: Number(body.reviewCount) }),
      ...(body.languages !== undefined && { languages: body.languages as string }),
    })
    .where(eq(doctorsTable.id, id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json(doctor);
});

// DELETE /api/doctors/:id  — admin only
router.delete("/doctors/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid doctor id" });
    return;
  }

  const [doctor] = await db
    .delete(doctorsTable)
    .where(eq(doctorsTable.id, id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
