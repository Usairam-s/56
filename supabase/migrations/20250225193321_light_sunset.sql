/*
  # Fix Voice Cache Issues

  1. Changes
    - Remove foreign key constraint
    - Add missing indexes
    - Update voice cache structure
    - Fix analytics tracking

  2. Security
    - Maintain RLS policies
    - Public access for cache entries
*/

-- Drop any existing foreign key constraints
DO $$ 
BEGIN
  ALTER TABLE IF EXISTS voice_cache
    DROP CONSTRAINT IF EXISTS fk_voice_analytics;
END $$;

-- Ensure voice_cache has correct columns
ALTER TABLE voice_cache
  ADD COLUMN IF NOT EXISTS audio_data bytea,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create or replace indexes for better performance
DROP INDEX IF EXISTS voice_cache_hash_idx;
DROP INDEX IF EXISTS voice_cache_voice_id_idx;
DROP INDEX IF EXISTS voice_cache_last_accessed_idx;
DROP INDEX IF EXISTS voice_cache_access_count_idx;

CREATE INDEX voice_cache_hash_idx ON voice_cache(hash);
CREATE INDEX voice_cache_voice_id_idx ON voice_cache(voice_id);
CREATE INDEX voice_cache_last_accessed_idx ON voice_cache(last_accessed);
CREATE INDEX voice_cache_access_count_idx ON voice_cache(access_count);

-- Update voice analytics function
CREATE OR REPLACE FUNCTION update_voice_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics without foreign key constraint
  INSERT INTO voice_analytics (voice_id, total_uses, last_used)
  VALUES (NEW.voice_id, 1, now())
  ON CONFLICT (voice_id) DO UPDATE
  SET 
    total_uses = voice_analytics.total_uses + 1,
    last_used = now();
  
  -- Update access count
  NEW.access_count = COALESCE(NEW.access_count, 0) + 1;
  NEW.last_accessed = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS voice_cache_analytics_trigger ON voice_cache;
CREATE TRIGGER voice_cache_analytics_trigger
  BEFORE INSERT OR UPDATE ON voice_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_analytics();

-- Update cleanup function
CREATE OR REPLACE FUNCTION cleanup_voice_cache()
RETURNS void AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete old voice cache entries
  WITH deleted AS (
    DELETE FROM voice_cache
    WHERE created_at < now() - interval '30 days'
      AND last_accessed < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  -- Delete old analytics entries
  DELETE FROM voice_analytics
  WHERE last_used < now() - interval '30 days';

  -- Log cleanup
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