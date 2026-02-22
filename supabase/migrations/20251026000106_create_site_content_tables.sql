/*
  # Create Site Content Tables

  ## Overview
  This migration creates tables for storing all website content persistently in Supabase.
  Previously all content was stored in browser localStorage which gets deleted when clearing browser data.

  ## New Tables

  ### 1. `site_config`
  Stores general site configuration (contact info, social media, SEO settings)
  - `id` (uuid, primary key) - Single row table (only one config)
  - `site_name` (text) - Site name
  - `contact_email` (text) - Contact email address
  - `phone_number` (text) - Phone number
  - `address` (text) - Physical address
  - `facebook_url` (text) - Facebook link
  - `twitter_url` (text) - Twitter link
  - `instagram_url` (text) - Instagram link
  - `seo_title` (text) - Default SEO title
  - `seo_description` (text) - Default SEO description
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `page_sections`
  Stores content for main page sections (hero, about, values, goals, contact, calendar, footer)
  - `id` (uuid, primary key)
  - `section_key` (text, unique) - Section identifier (e.g., 'hero', 'about', 'values')
  - `content` (jsonb) - Section content as JSON
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `dynamic_pages`
  Stores additional pages that can be created (already partially exists as 'pages' concept)
  - `id` (uuid, primary key)
  - `slug` (text, unique) - URL slug
  - `title` (text) - Page title
  - `content` (text) - HTML content
  - `meta_description` (text) - SEO meta description
  - `published` (boolean) - Whether page is published
  - `created_by` (uuid) - Reference to backoffice user
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Public can read published content
  - Only authenticated backoffice users can modify content

  ## Important Notes
  1. `site_config` is a single-row table - only one configuration exists
  2. `page_sections` uses JSONB for flexible content structure
  3. All tables are protected with Row Level Security
*/

-- Create site_config table
CREATE TABLE IF NOT EXISTS site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT '',
  contact_email text DEFAULT '',
  phone_number text DEFAULT '',
  address text DEFAULT '',
  facebook_url text DEFAULT '',
  twitter_url text DEFAULT '',
  instagram_url text DEFAULT '',
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site config"
  ON site_config
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update site config"
  ON site_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site config"
  ON site_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page sections"
  ON page_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update page sections"
  ON page_sections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert page sections"
  ON page_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create dynamic_pages table
CREATE TABLE IF NOT EXISTS dynamic_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  meta_description text DEFAULT '',
  published boolean DEFAULT false,
  created_by uuid REFERENCES backoffice_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dynamic_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published dynamic pages"
  ON dynamic_pages
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authenticated users can read all dynamic pages"
  ON dynamic_pages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dynamic pages"
  ON dynamic_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dynamic pages"
  ON dynamic_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dynamic pages"
  ON dynamic_pages
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_sections_section_key ON page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_dynamic_pages_slug ON dynamic_pages(slug);
CREATE INDEX IF NOT EXISTS idx_dynamic_pages_published ON dynamic_pages(published);
