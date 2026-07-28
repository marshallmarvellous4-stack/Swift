import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, hospitalsTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /api/hospitals  — public
router.get("/hospitals", async (_req, res): Promise<void> => {
  const hospitals = await db
    .select()
    .from(hospitalsTable)
    .orderBy(hospitalsTable.name);
  res.json(hospitals);
});

// GET /api/hospitals/:id  — public
router.get("/hospitals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid hospital id" });
    return;
  }

  const [hospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, id));

  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }

  res.json(hospital);
});

// POST /api/hospitals  — admin only
router.post("/hospitals", requireRole("admin"), async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!body.name || !body.location) {
    res.status(400).json({ error: "name and location are required" });
    return;
  }

  const [hospital] = await db
    .insert(hospitalsTable)
    .values({
      name: body.name as string,
      location: body.location as string,
      type: (body.type as string) ?? null,
      services: (body.services as string) ?? null,
      openingHours: (body.openingHours as string) ?? null,
      image: (body.image as string) ?? null,
      contact: (body.contact as string) ?? null,
    })
    .returning();

  res.status(201).json(hospital);
});

// PUT /api/hospitals/:id  — admin only
router.put("/hospitals/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid hospital id" });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const [hospital] = await db
    .update(hospitalsTable)
    .set({
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.location !== undefined && { location: body.location as string }),
      ...(body.type !== undefined && { type: body.type as string }),
      ...(body.services !== undefined && { services: body.services as string }),
      ...(body.openingHours !== undefined && { openingHours: body.openingHours as string }),
      ...(body.image !== undefined && { image: body.image as string }),
      ...(body.contact !== undefined && { contact: body.contact as string }),
    })
    .where(eq(hospitalsTable.id, id))
    .returning();

  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }

  res.json(hospital);
});

// DELETE /api/hospitals/:id  — admin only
router.delete("/hospitals/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid hospital id" });
    return;
  }

  const [hospital] = await db
    .delete(hospitalsTable)
    .where(eq(hospitalsTable.id, id))
    .returning();

  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
