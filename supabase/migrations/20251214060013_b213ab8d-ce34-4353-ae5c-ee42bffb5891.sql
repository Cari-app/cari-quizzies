-- Add file size limit (2MB) and allowed MIME types to avatars bucket
UPDATE storage.buckets 
SET 
  file_size_limit = 2097152, -- 2MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'avatars';