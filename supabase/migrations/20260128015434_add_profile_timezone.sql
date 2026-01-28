-- Add timezone to user profiles
alter table public.profiles
add column if not exists timezone text;

-- Backfill existing users
update public.profiles
set timezone = 'UTC'
where timezone is null or timezone = '';

-- Default for new users
alter table public.profiles
alter column timezone set default 'UTC';

-- Enforce not null
alter table public.profiles
alter column timezone set not null;
