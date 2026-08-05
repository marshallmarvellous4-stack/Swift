ALTER TABLE "email_otps" ADD COLUMN IF NOT EXISTS "purpose" text NOT NULL DEFAULT 'verify_email';
