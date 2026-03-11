-- ============================================================
-- Row Level Security (RLS) Policies for Econopedia101
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. POSTS — public read, admin-only write
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (status = 'published' OR status IS NULL);

CREATE POLICY "Authenticated admins can do everything with posts"
  ON posts FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND auth.email() IN (SELECT email FROM admin_allowlist)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.email() IN (SELECT email FROM admin_allowlist)
  );

-- 2. ADMIN_ALLOWLIST — no public access at all
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read the allowlist"
  ON admin_allowlist FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND auth.email() IN (SELECT email FROM admin_allowlist)
  );

-- 3. COMMENTS — public read, authenticated write (own rows only)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- 4. LIKES — public read, authenticated toggle
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- 5. STORAGE — article-images bucket
-- Restrict uploads to authenticated admin users only
INSERT INTO storage.policies (name, bucket_id, definition, check_expression, operation)
SELECT 'Admin upload images', 'article-images',
  'auth.uid() IS NOT NULL AND auth.email() IN (SELECT email FROM public.admin_allowlist)',
  'auth.uid() IS NOT NULL AND auth.email() IN (SELECT email FROM public.admin_allowlist)',
  'INSERT'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies WHERE name = 'Admin upload images' AND bucket_id = 'article-images'
);

-- Allow public read access to article images
INSERT INTO storage.policies (name, bucket_id, definition, operation)
SELECT 'Public read images', 'article-images', 'true', 'SELECT'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies WHERE name = 'Public read images' AND bucket_id = 'article-images'
);
