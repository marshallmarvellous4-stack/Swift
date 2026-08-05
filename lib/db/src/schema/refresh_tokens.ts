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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  /**
   * Groups all tokens in the same rotation chain.  Generated once on first
   * login and inherited by every successor token.  When a revoked token from
   * this family is presented we know a theft/replay happened and we invalidate
   * every token that shares this family_id.
   */
  familyId: text("family_id").notNull(),
});

export type RefreshToken = typeof refreshTokensTable.$inferSelect;
