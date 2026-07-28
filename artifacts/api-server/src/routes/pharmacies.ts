import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, pharmaciesTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /api/pharmacies  — public
router.get("/pharmacies", async (_req, res): Promise<void> => {
  const pharmacies = await db
    .select()
    .from(pharmaciesTable)
    .orderBy(pharmaciesTable.name);
  res.json(pharmacies);
});

// GET /api/pharmacies/:id  — public
router.get("/pharmacies/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid pharmacy id" });
    return;
  }

  const [pharmacy] = await db
    .select()
    .from(pharmaciesTable)
    .where(eq(pharmaciesTable.id, id));

  if (!pharmacy) {
    res.status(404).json({ error: "Pharmacy not found" });
    return;
  }

  res.json(pharmacy);
});

// POST /api/pharmacies  — admin only
router.post("/pharmacies", requireRole("admin"), async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!body.name || !body.location) {
    res.status(400).json({ error: "name and location are required" });
    return;
  }

  const [pharmacy] = await db
    .insert(pharmaciesTable)
    .values({
      name: body.name as string,
      location: body.location as string,
      openingHours: (body.openingHours as string) ?? null,
      isVerified: Boolean(body.isVerified) ?? false,
      image: (body.image as string) ?? null,
      contact: (body.contact as string) ?? null,
    })
    .returning();

  res.status(201).json(pharmacy);
});

// PUT /api/pharmacies/:id  — admin only
router.put("/pharmacies/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid pharmacy id" });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const [pharmacy] = await db
    .update(pharmaciesTable)
    .set({
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.location !== undefined && { location: body.location as string }),
      ...(body.openingHours !== undefined && { openingHours: body.openingHours as string }),
      ...(body.isVerified !== undefined && { isVerified: Boolean(body.isVerified) }),
      ...(body.image !== undefined && { image: body.image as string }),
      ...(body.contact !== undefined && { contact: body.contact as string }),
    })
    .where(eq(pharmaciesTable.id, id))
    .returning();

  if (!pharmacy) {
    res.status(404).json({ error: "Pharmacy not found" });
    return;
  }

  res.json(pharmacy);
});

// DELETE /api/pharmacies/:id  — admin only
router.delete("/pharmacies/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid pharmacy id" });
    return;
  }

  const [pharmacy] = await db
    .delete(pharmaciesTable)
    .where(eq(pharmaciesTable.id, id))
    .returning();

  if (!pharmacy) {
    res.status(404).json({ error: "Pharmacy not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
