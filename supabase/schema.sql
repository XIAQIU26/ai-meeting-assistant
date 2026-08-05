-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles table for user display names
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

-- Projects table
create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  research_topic text,
  type text default '其他',
  stage text default '选题论证',
  created_at timestamptz default now()
);

-- Meetings table (tasks stored as jsonb array)
create table if not exists public.meetings (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  topic text,
  presentation text default '',
  advisor_feedback text default '',
  suggestions text[] default '{}',
  tasks jsonb default '[]',
  next_meeting_date text default '',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.meetings enable row level security;

-- RLS Policies: users can only access their own data

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Meetings
create policy "Users can view own meetings"
  on public.meetings for select
  using (auth.uid() = user_id);

create policy "Users can insert own meetings"
  on public.meetings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meetings"
  on public.meetings for update
  using (auth.uid() = user_id);

create policy "Users can delete own meetings"
  on public.meetings for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
