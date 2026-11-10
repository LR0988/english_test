-- Wonder World 2 (Liam English Learning) Supabase Schema & RLS
-- Follows Supabase Postgres Best Practices (explicit TO authenticated, cached (select auth.uid()), indexed user_id)

create table if not exists public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default 'Liam (黃尚霖)',
  avatar_emoji text not null default '🦁',
  total_xp integer not null default 0 check (total_xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_study_date date,
  speech_rate numeric(3,2) not null default 0.90,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;

create policy learner_profiles_select on public.learner_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy learner_profiles_insert on public.learner_profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy learner_profiles_update on public.learner_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.word_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word_key text not null,
  unit_id text not null,
  familiarity smallint not null default 0 check (familiarity between 0 and 3),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  needs_review boolean not null default false,
  last_practiced_at timestamptz not null default now(),
  unique (user_id, word_key)
);

create index if not exists word_progress_user_unit_idx on public.word_progress (user_id, unit_id);
create index if not exists word_progress_review_idx on public.word_progress (user_id) where needs_review = true;

alter table public.word_progress enable row level security;

create policy word_progress_select on public.word_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy word_progress_insert on public.word_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy word_progress_update on public.word_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy word_progress_delete on public.word_progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.checklist_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  category text not null check (category in ('checklist', 'word_hunt', 'story_read', 'magic_e')),
  completed boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (user_id, item_key)
);

create index if not exists checklist_progress_user_cat_idx on public.checklist_progress (user_id, category);

alter table public.checklist_progress enable row level security;

create policy checklist_progress_select on public.checklist_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy checklist_progress_insert on public.checklist_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy checklist_progress_update on public.checklist_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy checklist_progress_delete on public.checklist_progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id text not null,
  mode text not null,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  stars_earned smallint not null default 0 check (stars_earned between 0 and 3),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_created_idx on public.quiz_attempts (user_id, created_at desc);

alter table public.quiz_attempts enable row level security;

create policy quiz_attempts_select on public.quiz_attempts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy quiz_attempts_insert on public.quiz_attempts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.learner_profiles to authenticated;
grant select, insert, update, delete on public.word_progress to authenticated;
grant select, insert, update, delete on public.checklist_progress to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant usage, select on all sequences in schema public to authenticated;
