/*
  # Remove contact messages table

  1. Changes
    - Drop contact_messages table
    - Contact form will only send emails, not store messages in database
*/

DROP TABLE IF EXISTS contact_messages CASCADE;