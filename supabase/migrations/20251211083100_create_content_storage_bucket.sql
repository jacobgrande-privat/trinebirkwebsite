/*
  # Create Content Storage Bucket

  1. New Storage Bucket
    - `content` bucket for storing content.json file
    
  2. Security
    - Public read access for everyone
    - Write access only for authenticated backoffice users
*/

-- Create content bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can read content"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'content');

-- Allow authenticated users to upload/update content
CREATE POLICY "Authenticated users can upload content"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content');

CREATE POLICY "Authenticated users can update content"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content')
  WITH CHECK (bucket_id = 'content');

CREATE POLICY "Authenticated users can delete content"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'content');