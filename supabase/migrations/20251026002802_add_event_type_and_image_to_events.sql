/*
  # Add Event Type and Image to Events Table

  ## Changes
  - Add `event_type` column to events table with options: public, visit, debate, meeting
  - Add `image_url` column for event images
  - Add `content` column for rich HTML content

  ## Columns Added
  - `event_type` (text) - Type of event: 'public', 'visit', 'debate', 'meeting'
  - `image_url` (text) - URL to event image
  - `content` (text) - Rich HTML content for event details

  ## Notes
  - Default event_type is 'public' for existing events
  - All columns are optional to maintain compatibility
*/

-- Add event_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events ADD COLUMN event_type text DEFAULT 'public';
  END IF;
END $$;

-- Add image_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE events ADD COLUMN image_url text DEFAULT '';
  END IF;
END $$;

-- Add content column for rich HTML content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'content'
  ) THEN
    ALTER TABLE events ADD COLUMN content text DEFAULT '';
  END IF;
END $$;

-- Create index on event_type for filtering
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
