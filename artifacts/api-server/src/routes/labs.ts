import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, labsTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /api/labs  — public
router.get("/labs", async (_req, res): Promise<void> => {
  const labs = await db.select().from(labsTable).orderBy(labsTable.name);
  res.json(labs);
});

// GET /api/labs/:id  — public
router.get("/labs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lab id" });
    return;
  }

  const [lab] = await db
    .select()
    .from(labsTable)
    .where(eq(labsTable.id, id));

  if (!lab) {
    res.status(404).json({ error: "Lab not found" });
    return;
  }

  res.json(lab);
});

// POST /api/labs  — admin only
router.post("/labs", requireRole("admin"), async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!body.name || !body.location) {
    res.status(400).json({ error: "name and location are required" });
    return;
  }

  const [lab] = await db
    .insert(labsTable)
    .values({
      name: body.name as string,
      location: body.location as string,
      availableTests: (body.availableTests as string) ?? null,
      openingHours: (body.openingHours as string) ?? null,
      priceRange: (body.priceRange as string) ?? null,
      image: (body.image as string) ?? null,
      contact: (body.contact as string) ?? null,
    })
    .returning();

  res.status(201).json(lab);
});

// PUT /api/labs/:id  — admin only
router.put("/labs/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lab id" });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const [lab] = await db
    .update(labsTable)
    .set({
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.location !== undefined && { location: body.location as string }),
      ...(body.availableTests !== undefined && { availableTests: body.availableTests as string }),
      ...(body.openingHours !== undefined && { openingHours: body.openingHours as string }),
      ...(body.priceRange !== undefined && { priceRange: body.priceRange as string }),
      ...(body.image !== undefined && { image: body.image as string }),
      ...(body.contact !== undefined && { contact: body.contact as string }),
    })
    .where(eq(labsTable.id, id))
    .returning();

  if (!lab) {
    res.status(404).json({ error: "Lab not found" });
    return;
  }

  res.json(lab);
});

// DELETE /api/labs/:id  — admin only
router.delete("/labs/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lab id" });
    return;
  }

  const [lab] = await db
    .delete(labsTable)
    .where(eq(labsTable.id, id))
    .returning();

  if (!lab) {
    res.status(404).json({ error: "Lab not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
