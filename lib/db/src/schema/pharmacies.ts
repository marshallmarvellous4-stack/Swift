import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pharmaciesTable = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  openingHours: text("opening_hours"),
  isVerified: boolean("is_verified").default(false).notNull(),
  image: text("image"),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insertPharmacySchema = createInsertSchema(pharmaciesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectPharmacySchema = createSelectSchema(pharmaciesTable);

export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmaciesTable.$inferSelect;
