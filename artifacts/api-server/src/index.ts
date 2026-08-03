import { fileURLToPath } from "url";
import path from "path";
import app from "./app";
import { runMigrations } from "@workspace/db";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  // Resolve migrations folder relative to this file.
  // In the bundled dist/ output the build script copies lib/db/migrations/
  // alongside index.mjs as dist/migrations/, so this path resolves correctly
  // both in development (tsx runs src/index.ts) and in production (node dist/).
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = path.join(__dirname, "./migrations");

  await runMigrations(migrationsFolder);
  logger.info("Database migrations applied");

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
