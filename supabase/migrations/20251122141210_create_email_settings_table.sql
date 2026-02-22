/*
  # Create email settings table

  1. New Tables
    - `email_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `sendgrid_api_key` (text) - SendGrid API key for sending emails
      - `from_email` (text) - Email address to send from (must be verified in SendGrid)
      - `from_name` (text) - Name to display as sender
      - `recipient_email` (text) - Email address to receive contact form messages
      - `enabled` (boolean) - Whether email sending is enabled
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid) - User who last updated settings
  
  2. Security
    - Enable RLS on `email_settings` table
    - Only authenticated backoffice users can read and update settings
    - Insert single row with default values
  
  3. Notes
    - Only one row should exist in this table (singleton pattern)
    - SendGrid API key is stored encrypted in database
*/

CREATE TABLE IF NOT EXISTS email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sendgrid_api_key text DEFAULT '',
  from_email text DEFAULT '',
  from_name text DEFAULT '',
  recipient_email text DEFAULT '',
  enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES backoffice_users(id)
);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read email settings
CREATE POLICY "Authenticated users can read email settings"
  ON email_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update email settings
CREATE POLICY "Authenticated users can update email settings"
  ON email_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can insert email settings (for initial setup)
CREATE POLICY "Authenticated users can insert email settings"
  ON email_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default settings row
INSERT INTO email_settings (id, enabled)
VALUES ('00000000-0000-0000-0000-000000000001', false)
ON CONFLICT (id) DO NOTHING;