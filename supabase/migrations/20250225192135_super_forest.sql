/*
  # Update voice cache schema

  1. Changes
    - Add audio_url column to voice_cache table
    - Add access_count column to voice_cache table
    - Create voice_analytics table
    - Add foreign key relationships
    - Update indexes for better performance

  2. Security
    - Enable RLS on new table
    - Add policies for public access
*/

-- Add new columns to voice_cache
ALTER TABLE voice_cache 
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0;

-- Create voice_analytics table
CREATE TABLE IF NOT EXISTS voice_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text NOT NULL UNIQUE,
  total_uses integer DEFAULT 0,
  last_used timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on voice_analytics
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_analytics
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

-- Create indexes
CREATE INDEX IF NOT EXISTS voice_analytics_voice_id_idx ON voice_analytics(voice_id);
CREATE INDEX IF NOT EXISTS voice_analytics_last_used_idx ON voice_analytics(last_used);
CREATE INDEX IF NOT EXISTS voice_cache_audio_url_idx ON voice_cache(audio_url);
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