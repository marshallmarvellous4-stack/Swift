import {
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const availabilityEnum = pgEnum("availability_status", [
  "online",
  "offline",
  "busy",
]);

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // optional link to a user account
  name: text("name").notNull(),
  email: text("email"),
  specialty: text("specialty").notNull(),
  experience: integer("experience"), // years
  location: text("location"),
  availability: availabilityEnum("availability").default("offline").notNull(),
  image: text("image"),
  bio: text("bio"),
  consultationFee: integer("consultation_fee"), // in Naira
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  languages: text("languages"), // comma-separated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectDoctorSchema = createSelectSchema(doctorsTable);

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;
