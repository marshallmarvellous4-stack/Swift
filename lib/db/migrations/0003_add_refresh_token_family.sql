-- Add family_id to group refresh tokens in the same rotation chain.
-- Existing tokens get a unique family per row (each becomes its own family root).
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "family_id" text;
UPDATE "refresh_tokens" SET "family_id" = gen_random_uuid()::text WHERE "family_id" IS NULL;
ALTER TABLE "refresh_tokens" ALTER COLUMN "family_id" SET NOT NULL;
