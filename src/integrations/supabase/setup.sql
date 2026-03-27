-- Run this script in your Supabase SQL Editor to set up user syncing

-- 1. Create a table for public user profiles
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  credits integer default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Set up Row Level Security (RLS)
alter table public.users enable row level security;

drop policy if exists "Users can view their own profile." on public.users;
create policy "Users can view their own profile."
  on public.users for select
  using ( auth.uid() = id );

drop policy if exists "Users can update their own profile." on public.users;
create policy "Users can update their own profile."
  on public.users for update
  using ( auth.uid() = id );

-- 3. Create a trigger that automatically inserts a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, credits)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    5
  );
  return new;
end;
$$;

-- Drop the trigger if it already exists to avoid errors on multiple runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
