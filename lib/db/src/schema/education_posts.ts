import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const educationPostsTable = pgTable("education_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // e.g. 'Nutrition', 'Mental Health'
  content: text("content").notNull(),
  image: text("image"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insertEducationPostSchema = createInsertSchema(
  educationPostsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export const selectEducationPostSchema =
  createSelectSchema(educationPostsTable);

export type InsertEducationPost = z.infer<typeof insertEducationPostSchema>;
export type EducationPost = typeof educationPostsTable.$inferSelect;
