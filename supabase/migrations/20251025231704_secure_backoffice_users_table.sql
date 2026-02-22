/*
  # Secure backoffice_users table
  
  ## Changes
  - Remove anonymous read access
  - Only authenticated users can read backoffice_users
  - Login now goes through secure edge function
  
  ## Security
  - Admin list is now hidden from public
  - Edge function uses service role to check credentials server-side
  - No exposure of who has admin access
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Allow read access for login" ON backoffice_users;

-- Only authenticated users can read (for user management within backoffice)
CREATE POLICY "Only authenticated can read backoffice users"
  ON backoffice_users
  FOR SELECT
  TO authenticated
  USING (true);
