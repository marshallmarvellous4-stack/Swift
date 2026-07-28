import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type"), // e.g. 'General', 'Teaching', 'Specialist', 'Private'
  services: text("services"), // comma-separated list
  openingHours: text("opening_hours"),
  image: text("image"),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insertHospitalSchema = createInsertSchema(hospitalsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectHospitalSchema = createSelectSchema(hospitalsTable);

export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitalsTable.$inferSelect;
