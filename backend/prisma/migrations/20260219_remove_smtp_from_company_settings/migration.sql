-- Migration: remove SMTP fields from company_settings
-- These fields are replaced by UserMailAccount (per-user encrypted SMTP config)

ALTER TABLE "company_settings"
  DROP COLUMN IF EXISTS "smtpHost",
  DROP COLUMN IF EXISTS "smtpPort",
  DROP COLUMN IF EXISTS "smtpUser",
  DROP COLUMN IF EXISTS "smtpPassword",
  DROP COLUMN IF EXISTS "smtpFrom",
  DROP COLUMN IF EXISTS "smtpFromName",
  DROP COLUMN IF EXISTS "smtpSsl",
  DROP COLUMN IF EXISTS "smtpEncryption";
