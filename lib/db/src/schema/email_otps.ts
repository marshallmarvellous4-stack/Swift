import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const emailOtpsTable = pgTable("email_otps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  /** Number of failed verification attempts against this OTP */
  attempts: integer("attempts").default(0).notNull(),
  /** Purpose of the OTP: 'verify_email' or 'reset_password' */
  purpose: text("purpose").default("verify_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailOtp = typeof emailOtpsTable.$inferSelect;
