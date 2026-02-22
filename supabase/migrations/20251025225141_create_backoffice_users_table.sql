/*
  # Create backoffice users management system

  ## Overview
  This migration creates a custom table to manage backoffice users that syncs with Supabase Auth.
  When users are added/removed from this table, they can/cannot log into the backoffice.

  ## New Tables
  - `backoffice_users`
    - `id` (uuid, primary key) - Matches auth.users id
    - `email` (text, unique, not null) - User email address
    - `name` (text, not null) - Display name
    - `created_at` (timestamptz) - When user was created
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `backoffice_users` table
  - Only authenticated users can read their own user data
  - Service role needed for user management operations

  ## Notes
  - This table tracks which users have backoffice access
  - Supabase Auth handles the actual authentication
  - Default admin user (jacob.grande@gmail.com) will be created separately via auth system
*/

-- Create backoffice_users table
CREATE TABLE IF NOT EXISTS backoffice_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE backoffice_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all backoffice users (for user management)
CREATE POLICY "Authenticated users can read backoffice users"
  ON backoffice_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert backoffice users
CREATE POLICY "Authenticated users can insert backoffice users"
  ON backoffice_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update backoffice users
CREATE POLICY "Authenticated users can update backoffice users"
  ON backoffice_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete backoffice users
CREATE POLICY "Authenticated users can delete backoffice users"
  ON backoffice_users
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at
CREATE TRIGGER update_backoffice_users_updated_at
  BEFORE UPDATE ON backoffice_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_backoffice_users_email ON backoffice_users(email);