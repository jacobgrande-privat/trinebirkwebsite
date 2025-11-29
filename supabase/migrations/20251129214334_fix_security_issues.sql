/*
  # Fix Security Issues

  1. Performance Improvements
    - Add missing index on events.created_by foreign key to improve query performance
    - Remove unused indexes that provide no value

  2. Notes
    - Leaked password protection must be enabled through Supabase Dashboard
    - Navigate to Authentication > Policies > Password Protection
*/

-- Add missing index for events.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_dynamic_pages_created_by;
DROP INDEX IF EXISTS idx_email_settings_updated_by;