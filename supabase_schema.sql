
-- 1. Create a table for profiles (IF NOT EXISTS)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  name text,
  elo integer default 1500,
  avatar_url text
);

-- 2. Enable RLS (Safe to re-run on Postgres, but good to be sure)
alter table public.profiles enable row level security;

-- 3. Create policies (Drop first to avoid duplication error)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- 4. Create table for games
create table if not exists public.games (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) not null,
  white text not null,
  black text not null,
  result text,
  input_pgn text not null,
  average_cpl integer,
  analysis_json jsonb,
  dominant_error text
);

-- 5. Enable RLS for games
alter table public.games enable row level security;

-- 6. Create policies for games
drop policy if exists "Users can see their own games." on games;
create policy "Users can see their own games." on games for select using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own games." on games;
create policy "Users can insert their own games." on games for insert with check ( auth.uid() = user_id );

-- 7. Trigger (Replace existing)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, elo)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 1500)
  on conflict (id) do nothing; -- Safe if profile exists
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition (Check if exists first to avoid error, or drop and recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
