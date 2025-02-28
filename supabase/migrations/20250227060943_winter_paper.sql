/*
  # Voice Cache System Migration

  1. Tables
    - voice_cache: Stores cached voice audio data
    - Includes audio data, metadata, and access tracking

  2. Indexes
    - Hash index for fast lookups
    - Voice ID index for analytics
    - Last accessed index for cleanup
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Public insert voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Public update voice cache" ON voice_cache;
END $$;

-- Create voice cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS voice_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text NOT NULL,
  text text NOT NULL,
  audio_data bytea NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  hash text UNIQUE NOT NULL,
  access_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE voice_cache ENABLE ROW LEVEL SECURITY;

-- Create new policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_cache' 
    AND policyname = 'Public read voice cache'
  ) THEN
    CREATE POLICY "Public read voice cache"
      ON voice_cache
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_cache' 
    AND policyname = 'Public insert voice cache'
  ) THEN
    CREATE POLICY "Public insert voice cache"
      ON voice_cache
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_cache' 
    AND policyname = 'Public update voice cache'
  ) THEN
    CREATE POLICY "Public update voice cache"
      ON voice_cache
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS voice_cache_hash_idx ON voice_cache(hash);
CREATE INDEX IF NOT EXISTS voice_cache_voice_id_idx ON voice_cache(voice_id);
CREATE INDEX IF NOT EXISTS voice_cache_last_accessed_idx ON voice_cache(last_accessed);

-- Function to update last_accessed timestamp
CREATE OR REPLACE FUNCTION update_voice_cache_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = now();
  NEW.access_count = COALESCE(NEW.access_count, 0) + 1;
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