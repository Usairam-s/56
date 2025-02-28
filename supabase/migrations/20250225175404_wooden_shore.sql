/*
  # Voice Cache Table and Policies

  1. New Tables
    - `voice_cache`
      - `id` (uuid, primary key)
      - `voice_id` (text)
      - `text` (text) 
      - `audio_data` (bytea)
      - `created_at` (timestamptz)
      - `last_accessed` (timestamptz)
      - `hash` (text, unique)

  2. Security
    - Enable RLS on `voice_cache` table
    - Add policies for public read/write access
    - Add index on hash column

  3. Maintenance
    - Add trigger for updating last_accessed
    - Add cleanup function for old entries
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Anyone can insert voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Anyone can update voice cache" ON voice_cache;
END $$;

-- Create policies for public access
CREATE POLICY "Anyone can read voice cache"
  ON voice_cache
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert voice cache"
  ON voice_cache
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update voice cache"
  ON voice_cache
  FOR UPDATE
  TO public
  USING (true)
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_voice_cache_last_accessed ON voice_cache;

-- Create trigger for updating last_accessed
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