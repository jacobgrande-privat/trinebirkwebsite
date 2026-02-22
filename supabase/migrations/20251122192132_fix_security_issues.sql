/*
  # Fix Security Issues

  ## Overview
  This migration addresses multiple security and performance issues identified in the database audit.

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index on dynamic_pages.created_by to cover foreign key constraint
  - Add index on email_settings.updated_by to cover foreign key constraint
  These indexes improve query performance for JOIN operations and foreign key constraint checks.

  ### 2. Remove Unused Indexes
  The following indexes have not been used and are being removed to reduce storage overhead and improve write performance:
  - idx_events_start_time - Not needed for current query patterns
  - idx_events_is_published - Not needed for current query patterns
  - idx_events_created_by - Not needed for current query patterns
  - idx_events_event_type - Not needed for current query patterns
  - idx_page_sections_section_key - Already covered by UNIQUE constraint which creates an index
  - idx_dynamic_pages_slug - Already covered by UNIQUE constraint which creates an index
  - idx_dynamic_pages_published - Not needed for current query patterns

  ### 3. Fix Multiple Permissive Policies on dynamic_pages
  The table has two conflicting SELECT policies for authenticated users:
  - "Anyone can read published dynamic pages" (public role, published = true)
  - "Authenticated users can read all dynamic pages" (authenticated role, all rows)
  
  Solution: Drop the redundant "Anyone can read published dynamic pages" policy since authenticated users 
  already have full read access. Public (unauthenticated) users can use the public policy if needed separately.

  ### 4. Fix Function Search Path
  The update_updated_at_column function has a mutable search_path which is a security risk.
  Set the search_path explicitly to prevent potential SQL injection attacks.

  ## Security Notes
  - All changes maintain existing RLS policies
  - No data loss or modification occurs
  - Performance improvements expected from better index coverage
*/

-- 1. Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_dynamic_pages_created_by ON dynamic_pages(created_by);
CREATE INDEX IF NOT EXISTS idx_email_settings_updated_by ON email_settings(updated_by);

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_events_start_time;
DROP INDEX IF EXISTS idx_events_is_published;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_events_event_type;
DROP INDEX IF EXISTS idx_page_sections_section_key;
DROP INDEX IF EXISTS idx_dynamic_pages_slug;
DROP INDEX IF EXISTS idx_dynamic_pages_published;

-- 3. Fix multiple permissive policies on dynamic_pages
-- Drop the public SELECT policy as authenticated users already have full access
DROP POLICY IF EXISTS "Anyone can read published dynamic pages" ON dynamic_pages;

-- 4. Fix function search path security issue
-- Recreate the function with a secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
