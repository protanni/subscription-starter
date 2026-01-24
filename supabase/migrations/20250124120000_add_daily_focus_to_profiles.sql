-- Daily focus for Today page (mobile). "Today" = daily_focus_updated_at same local date.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_focus_text text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_focus_updated_at timestamptz;
