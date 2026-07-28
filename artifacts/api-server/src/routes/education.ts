import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, educationPostsTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /api/education  — public
router.get("/education", async (_req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(educationPostsTable)
    .orderBy(educationPostsTable.createdAt);
  res.json(posts);
});

// GET /api/education/:id  — public
router.get("/education/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const [post] = await db
    .select()
    .from(educationPostsTable)
    .where(eq(educationPostsTable.id, id));

  if (!post) {
    res.status(404).json({ error: "Education post not found" });
    return;
  }

  res.json(post);
});

// POST /api/education  — admin only
router.post("/education", requireRole("admin"), async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  if (!body.title || !body.category || !body.content) {
    res.status(400).json({ error: "title, category and content are required" });
    return;
  }

  const [post] = await db
    .insert(educationPostsTable)
    .values({
      title: body.title as string,
      category: body.category as string,
      content: body.content as string,
      image: (body.image as string) ?? null,
      videoUrl: (body.videoUrl as string) ?? null,
    })
    .returning();

  res.status(201).json(post);
});

// PUT /api/education/:id  — admin only
router.put("/education/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const body = req.body as Record<string, unknown>;

  const [post] = await db
    .update(educationPostsTable)
    .set({
      ...(body.title !== undefined && { title: body.title as string }),
      ...(body.category !== undefined && { category: body.category as string }),
      ...(body.content !== undefined && { content: body.content as string }),
      ...(body.image !== undefined && { image: body.image as string }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl as string }),
    })
    .where(eq(educationPostsTable.id, id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Education post not found" });
    return;
  }

  res.json(post);
});

// DELETE /api/education/:id  — admin only
router.delete("/education/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }

  const [post] = await db
    .delete(educationPostsTable)
    .where(eq(educationPostsTable.id, id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Education post not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
