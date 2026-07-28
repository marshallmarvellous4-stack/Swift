import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, chatMessagesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /api/chat  — returns the current user's message history
router.get("/chat", requireAuth, async (req, res): Promise<void> => {
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, req.user!.userId))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(100);

  res.json(messages.reverse()); // chronological order
});

// POST /api/chat  — save a message (user or assistant turn)
router.post("/chat", requireAuth, async (req, res): Promise<void> => {
  const { message, sender } = req.body as Record<string, string>;

  if (!message || !sender) {
    res.status(400).json({ error: "message and sender are required" });
    return;
  }

  if (sender !== "user" && sender !== "assistant") {
    res.status(400).json({ error: "sender must be 'user' or 'assistant'" });
    return;
  }

  const [saved] = await db
    .insert(chatMessagesTable)
    .values({
      userId: req.user!.userId,
      message,
      sender,
    })
    .returning();

  res.status(201).json(saved);
});

// DELETE /api/chat  — clear the current user's entire chat history
router.delete("/chat", requireAuth, async (req, res): Promise<void> => {
  await db
    .delete(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, req.user!.userId));

  res.sendStatus(204);
});

export default router;
