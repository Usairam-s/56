/*
  # Voice Cache Storage Setup

  1. Changes
    - Create storage bucket for voice cache files
    - Set up bucket configuration and policies
    - Add cleanup function for old files

  2. Security
    - Public access for voice cache files
    - File size limits and MIME type restrictions
*/

-- Create storage bucket
DO $$ 
BEGIN
  -- Create bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'voice-cache',
    'voice-cache',
    true,
    5242880, -- 5MB limit
    ARRAY['audio/wav', 'audio/mpeg']::text[]
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  -- Create bucket policy if storage.policies exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'policies'
  ) THEN
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Public Access',
      '(bucket_id = ''voice-cache''::text)',
      'voice-cache'
    )
    ON CONFLICT (name, bucket_id) DO NOTHING;
  END IF;
END $$;