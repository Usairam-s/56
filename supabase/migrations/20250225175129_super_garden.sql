/*
  # Voice Cache System

  1. New Tables
    - `voice_cache`
      - `id` (uuid, primary key)
      - `voice_id` (text)
      - `text` (text)
      - `audio_data` (bytea)
      - `created_at` (timestamp)
      - `last_accessed` (timestamp)
      - `hash` (text, unique)

  2. Security
    - Enable RLS on `voice_cache` table
    - Add policy for authenticated users to read/write cache entries
*/

-- Create voice cache table
CREATE TABLE IF NOT EXISTS voice_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text NOT NULL,
  text text NOT NULL,
  audio_data bytea NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  hash text UNIQUE NOT NULL
);

-- Enable RLS
ALTER TABLE voice_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read voice cache"
  ON voice_cache
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert voice cache"
  ON voice_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS voice_cache_hash_idx ON voice_cache(hash);

-- Function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION update_voice_cache_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_accessed on SELECT
CREATE TRIGGER update_voice_cache_last_accessed
  BEFORE UPDATE ON voice_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_cache_last_accessed();

-- Function to clean old cache entries
CREATE OR REPLACE FUNCTION clean_old_voice_cache()
RETURNS void AS $$
BEGIN
  -- Delete entries older than 30 days that haven't been accessed in 7 days
  DELETE FROM voice_cache
  WHERE created_at < now() - interval '30 days'
    AND last_accessed < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;