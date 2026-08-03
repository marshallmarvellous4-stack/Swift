import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

/**
 * Run all pending Drizzle migrations.
 * @param migrationsFolder Absolute path to the migrations directory.
 *   Callers are responsible for resolving this path correctly for their
 *   deployment layout (dev vs bundled).
 */
export async function runMigrations(migrationsFolder: string): Promise<void> {
  await migrate(db, { migrationsFolder });
}

export * from "./schema";
