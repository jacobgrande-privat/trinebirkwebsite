/*
  # Create events table for calendar/arrangements

  ## Overview
  This migration creates a table to store events/arrangements that can be displayed
  on the website and managed through the backoffice.

  ## New Tables
  - `events`
    - `id` (uuid, primary key) - Unique event identifier
    - `title` (text, not null) - Event title
    - `description` (text) - Event description/details
    - `location` (text) - Event location/venue
    - `start_time` (timestamptz, not null) - Event start date and time
    - `end_time` (timestamptz) - Event end date and time (optional)
    - `is_published` (boolean, default true) - Whether event is visible on website
    - `created_by` (uuid) - User who created the event
    - `created_at` (timestamptz) - When event was created
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `events` table
  - Authenticated users can view all events
  - Authenticated users can create events
  - Authenticated users can update events
  - Authenticated users can delete events
  - Anonymous users can view published events (for public website)

  ## Indexes
  - Index on start_time for efficient date queries
  - Index on is_published for filtering published events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  is_published boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can view published events
CREATE POLICY "Anyone can view published events"
  ON events
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Policy: Authenticated users can view all events
CREATE POLICY "Authenticated users can view all events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update events
CREATE POLICY "Authenticated users can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete events
CREATE POLICY "Authenticated users can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
