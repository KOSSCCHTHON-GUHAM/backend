-- Supabase SQL Editor에서 한 번 실행하는 GUHAM 최소 스키마입니다.
create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('board-images', 'board-images', true)
on conflict (id) do update set public = excluded.public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 10),
  avatar_url text,
  give_fields text[] not null default '{}',
  interests text[] not null default '{}',
  regions text[] not null default '{}',
  custom_give_text text,
  custom_interest_text text,
  normalized_give_tags text[] not null default '{}',
  normalized_interest_tags text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  recruit_count integer not null check (recruit_count > 0),
  current_count integer not null default 0,
  status text not null default 'RECRUITING' check (status in ('RECRUITING', 'COMPLETED')),
  content text not null,
  give_tags text[] not null default '{}',
  need_tags text[] not null default '{}',
  activity_region text not null,
  activity_method text not null,
  activity_hours text not null,
  related_links text[] not null default '{}',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_room_participants (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  last_read_message_id uuid,
  primary key (room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  client_message_id text not null,
  content text not null,
  message_type text not null check (message_type in ('TEXT', 'LINK')),
  created_at timestamptz not null default now(),
  unique (sender_id, client_message_id)
);

alter table public.chat_room_participants
  add constraint chat_room_participants_last_read_fkey
  foreign key (last_read_message_id) references public.chat_messages(id) on delete set null;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;

-- 2026년 이후 새 프로젝트는 public 테이블이 Data API에 자동 노출되지 않을 수 있어
-- 백엔드 service_role과 앱에서 필요한 최소 권한을 명시합니다.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.boards to anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles, public.boards, public.chat_rooms,
  public.chat_room_participants, public.chat_messages, public.notifications to service_role;

create policy "profiles are readable by signed-in users" on public.profiles
  for select to authenticated using (true);
create policy "users update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "boards are readable" on public.boards
  for select to anon, authenticated using (true);
create policy "users insert own boards" on public.boards
  for insert to authenticated with check ((select auth.uid()) = author_id);
create policy "users update own boards" on public.boards
  for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "users delete own boards" on public.boards
  for delete to authenticated using ((select auth.uid()) = author_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nickname', '사용자'))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
