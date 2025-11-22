/*
  # Add Gmail SMTP support to email settings

  1. Changes to `email_settings` table
    - Add `provider` column to choose between 'sendgrid' or 'gmail'
    - Add Gmail SMTP configuration fields:
      - `gmail_smtp_host` - SMTP server hostname
      - `gmail_smtp_port` - SMTP server port
      - `gmail_smtp_username` - Gmail email address
      - `gmail_smtp_password` - Gmail app password
      - `gmail_smtp_secure` - Use TLS/SSL
  
  2. Notes
    - Only one provider can be active at a time
    - Provider field determines which configuration is used
    - All existing data is preserved
*/

-- Add new columns to email_settings table
DO $$
BEGIN
  -- Add provider column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'provider'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN provider text DEFAULT 'sendgrid';
  END IF;

  -- Add Gmail SMTP configuration fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_host'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN gmail_smtp_host text DEFAULT 'smtp.gmail.com';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_port'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN gmail_smtp_port integer DEFAULT 587;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_username'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN gmail_smtp_username text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_password'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN gmail_smtp_password text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_settings' AND column_name = 'gmail_smtp_secure'
  ) THEN
    ALTER TABLE email_settings ADD COLUMN gmail_smtp_secure boolean DEFAULT true;
  END IF;
END $$;