#!/bin/bash
set -e

# Install any new dependencies added by the merged task
pnpm install --frozen-lockfile

# Push schema changes to the database (idempotent, safe to re-run)
pnpm --filter @workspace/db run push-force
