/*
  # Voice Cache Schema Update

  1. Changes
    - Drop and recreate policies for public access
    - Add optimized indexes
    - Improve cleanup function with logging

  2. Security
    - Enable RLS
    - Allow public read/write access
    - Add audit logging for cleanup operations

  3. Performance
    - Add indexes for hash, voice_id, and last_accessed
    - Optimize cleanup function
*/

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  table_name text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Anyone can insert voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Anyone can update voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Authenticated users can insert voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Authenticated users can update voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Public read voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Public insert voice cache" ON voice_cache;
  DROP POLICY IF EXISTS "Public update voice cache" ON voice_cache;
END $$;

-- Create new public access policies
CREATE POLICY "Public read voice cache"
  ON voice_cache
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert voice cache"
  ON voice_cache
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update voice cache"
  ON voice_cache
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop and recreate indexes for better performance
DROP INDEX IF EXISTS voice_cache_hash_idx;
DROP INDEX IF EXISTS voice_cache_voice_id_idx;
DROP INDEX IF EXISTS voice_cache_last_accessed_idx;

CREATE INDEX voice_cache_hash_idx ON voice_cache(hash);
CREATE INDEX voice_cache_voice_id_idx ON voice_cache(voice_id);
CREATE INDEX voice_cache_last_accessed_idx ON voice_cache(last_accessed);

-- Improve cleanup function with logging
CREATE OR REPLACE FUNCTION clean_old_voice_cache()
RETURNS void AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM voice_cache
    WHERE created_at < now() - interval '30 days'
      AND last_accessed < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  -- Log cleanup results
  INSERT INTO audit_log (
    action,
    table_name,
    details
  ) VALUES (
    'cleanup',
    'voice_cache',
    format('Deleted %s old voice cache entries', deleted_count)
  );
END;
$$ LANGUAGE plpgsql;