import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labsTable = pgTable("labs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  availableTests: text("available_tests"), // comma-separated
  openingHours: text("opening_hours"),
  priceRange: text("price_range"), // e.g. "₦1,500 – ₦25,000"
  image: text("image"),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insertLabSchema = createInsertSchema(labsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectLabSchema = createSelectSchema(labsTable);

export type InsertLab = z.infer<typeof insertLabSchema>;
export type Lab = typeof labsTable.$inferSelect;
