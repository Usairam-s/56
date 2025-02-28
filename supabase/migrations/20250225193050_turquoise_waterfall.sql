/*
  # Voice Analytics and Cache Updates

  1. New Tables
    - voice_analytics for tracking voice usage
    - New columns for voice_cache table

  2. Changes
    - Add analytics tracking
    - Improve cache management
    - Add performance indexes

  3. Security
    - Enable RLS
    - Public access policies
*/

-- Create voice_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS voice_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text NOT NULL UNIQUE,
  total_uses integer DEFAULT 0,
  last_used timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on voice_analytics
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read voice analytics" ON voice_analytics;
  DROP POLICY IF EXISTS "Public insert voice analytics" ON voice_analytics;
  DROP POLICY IF EXISTS "Public update voice analytics" ON voice_analytics;
END $$;

-- Create new policies for voice_analytics
CREATE POLICY "Public read voice analytics"
  ON voice_analytics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert voice analytics"
  ON voice_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update voice analytics"
  ON voice_analytics
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add new columns to voice_cache
ALTER TABLE voice_cache 
  ADD COLUMN IF NOT EXISTS audio_data bytea,
  ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS voice_analytics_voice_id_idx ON voice_analytics(voice_id);
CREATE INDEX IF NOT EXISTS voice_analytics_last_used_idx ON voice_analytics(last_used);
CREATE INDEX IF NOT EXISTS voice_cache_access_count_idx ON voice_cache(access_count);

-- Create function to update voice analytics
CREATE OR REPLACE FUNCTION update_voice_analytics()
RETURNS TRIGGER AS $$
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

-- Create trigger for voice analytics
DROP TRIGGER IF EXISTS voice_cache_analytics_trigger ON voice_cache;
CREATE TRIGGER voice_cache_analytics_trigger
  AFTER INSERT OR UPDATE ON voice_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_analytics();

-- Create function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_voice_cache()
RETURNS void AS $$
BEGIN
  -- Delete old voice cache entries
  DELETE FROM voice_cache
  WHERE created_at < now() - interval '30 days'
    AND last_accessed < now() - interval '7 days';
    
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
    'Cleaned up old voice cache and analytics entries'
  );
END;
$$ LANGUAGE plpgsql;