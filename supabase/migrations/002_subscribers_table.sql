-- ============================================================
-- Subscribers table for newsletter
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed BOOLEAN DEFAULT false
);

-- Index for fast lookups on active subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_active
  ON subscribers (email) WHERE unsubscribed = false;

-- RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Only admins can read the subscriber list
CREATE POLICY "Admins can read subscribers"
  ON subscribers FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND auth.email() IN (SELECT email FROM admin_allowlist)
  );

-- The API endpoint inserts via anon key, so allow public insert
-- (but only the email column — defaults handle the rest)
CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);

-- No public update/delete — admin only
CREATE POLICY "Admins can manage subscribers"
  ON subscribers FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND auth.email() IN (SELECT email FROM admin_allowlist)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.email() IN (SELECT email FROM admin_allowlist)
  );
