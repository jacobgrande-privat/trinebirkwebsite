/*
  # Fix login by allowing anonymous reads during authentication
  
  ## Changes
  - Add policy to allow anonymous users to read backoffice_users table
  - This is needed because the login function checks if user exists before authentication
  
  ## Security
  - Only SELECT is allowed for anonymous users
  - Table only contains non-sensitive data (id, email, name)
  - Auth credentials are still protected by Supabase Auth
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can read backoffice users" ON backoffice_users;

-- Allow anonymous and authenticated users to read backoffice users
CREATE POLICY "Allow read access for login"
  ON backoffice_users
  FOR SELECT
  TO anon, authenticated
  USING (true);
