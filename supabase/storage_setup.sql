-- ============================================================
-- Pesha's Bake Shop - Supabase Storage Bucket Setup
-- Run this in your Supabase SQL Editor ONCE to create the
-- storage buckets needed for image uploads.
-- ============================================================

-- 1. Create the 'media' bucket for images (thumbnails, category covers, product photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,  -- 10 MB limit per image
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- 2. Set RLS policies so anyone can READ public files (no auth needed to view)
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- 3. Allow authenticated/anon uploads (admin uploads from the browser client)
DROP POLICY IF EXISTS "Allow upload to media" ON storage.objects;
CREATE POLICY "Allow upload to media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media');

-- 4. Allow replace/update of existing files
DROP POLICY IF EXISTS "Allow update media" ON storage.objects;
CREATE POLICY "Allow update media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media');
