-- Run this in Supabase SQL Editor to add photo support
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS image_url text;
