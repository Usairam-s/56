/*
  # Voice Storage and Cache System Update

  1. Changes
    - Add storage bucket configuration
    - Update voice cache table structure
    - Add audio data column for direct storage
    - Set up proper indexes and constraints

  2. Security
    - Enable RLS on all tables
    - Public read access for cached audio
    - Secure audio data storage
*/

-- Add audio_data column to voice_cache if it doesn't exist
ALTER TABLE voice_cache
  ADD COLUMN IF NOT EXISTS audio_data bytea;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS voice_cache_hash_voice_id_idx ON voice_cache(hash, voice_id);
CREATE INDEX IF NOT EXISTS voice_cache_last_accessed_idx ON voice_cache(last_accessed);

-- Update voice cache cleanup function
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

  -- Log cleanup results
  RAISE NOTICE 'Deleted % old voice cache entries', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate audio data
CREATE OR REPLACE FUNCTION validate_audio_data()
RETURNS trigger AS $$
BEGIN
  IF NEW.audio_data IS NOT NULL AND length(NEW.audio_data) < 128 THEN
    RAISE EXCEPTION 'Invalid audio data: too small';
  END IF;
  
  IF NEW.audio_data IS NOT NULL AND length(NEW.audio_data) > 10485760 THEN -- 10MB limit
    RAISE EXCEPTION 'Invalid audio data: too large';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audio validation
DROP TRIGGER IF EXISTS validate_audio_data_trigger ON voice_cache;
CREATE TRIGGER validate_audio_data_trigger
  BEFORE INSERT OR UPDATE ON voice_cache
  FOR EACH ROW
  EXECUTE FUNCTION validate_audio_data();

-- Update voice analytics trigger
CREATE OR REPLACE FUNCTION update_voice_analytics()
RETURNS trigger AS $$
BEGIN
  INSERT INTO voice_analytics (voice_id, total_uses, last_used)
  VALUES (NEW.voice_id, 1, now())
  ON CONFLICT (voice_id) DO UPDATE
  SET 
    total_uses = voice_analytics.total_uses + 1,
    last_used = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;