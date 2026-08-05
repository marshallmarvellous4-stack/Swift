import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  /** SHA-256 hash of the opaque token value — never store the raw token */
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  /** Set when the token is explicitly revoked (logout or theft detection) */
  revokedAt: timestamp("revoked_at"),
  /**
   * Rotation-family ID (UUID).  Every token issued from the same login shares
   * the same family.  If a revoked family member is ever presented again we
   * know the token was stolen and we revoke the entire family immediately.
   */
  family: text("family"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokensTable.$inferSelect;
