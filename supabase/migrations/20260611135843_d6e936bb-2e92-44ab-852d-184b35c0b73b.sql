
-- For PUBLIC storage buckets, public URLs are served via the public CDN endpoint which
-- bypasses RLS. The broad SELECT policies are only needed for listing, which is what the
-- linter flags. Drop them so files remain accessible by URL but cannot be enumerated.
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Talent media is publicly accessible" ON storage.objects;
