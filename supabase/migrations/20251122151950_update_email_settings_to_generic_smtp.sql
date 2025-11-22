/*
  # Update email settings to support generic SMTP

  1. Changes
    - Remove provider column (no more SendGrid/Gmail distinction)
    - Remove sendgrid_api_key, gmail_smtp_* columns
    - Add generic SMTP fields:
      - smtp_host (e.g., smtp.simply.com)
      - smtp_port (e.g., 587)
      - smtp_username (e.g., email address)
      - smtp_password (encrypted)
      - smtp_secure (boolean, true for SSL, false for STARTTLS)
    
  2. Security
    - Maintains RLS policies
    - Keeps data encrypted
*/

-- Add new generic SMTP columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'smtp_host'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN smtp_host text DEFAULT 'smtp.simply.com';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'smtp_port'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN smtp_port integer DEFAULT 587;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'smtp_username'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN smtp_username text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'smtp_password'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN smtp_password text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'smtp_secure'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN smtp_secure boolean DEFAULT false;
  END IF;
END $$;

-- Remove old provider-specific columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'provider'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN provider;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'sendgrid_api_key'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN sendgrid_api_key;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_host'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN gmail_smtp_host;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_port'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN gmail_smtp_port;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_username'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN gmail_smtp_username;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_password'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN gmail_smtp_password;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_secure'
  ) THEN
    ALTER TABLE email_settings DROP COLUMN gmail_smtp_secure;
  END IF;
END $$;