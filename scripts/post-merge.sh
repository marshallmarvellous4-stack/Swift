#!/bin/bash
set -e

# Install any new dependencies added by the merged task
pnpm install --frozen-lockfile

# Apply pending Drizzle migrations (tracked in __drizzle_migrations).
# Using `migrate` instead of `push-force` so every schema change is recorded
# and the server's own runMigrations() on startup never re-runs them.
pnpm --filter @workspace/db run migrate
