-- รันครั้งเดียวใน Supabase: SQL Editor → New query → วาง → Run
-- ข้อมูลแต่ละแถวเป็นของครูเจ้าของ (user_id) และมองเห็นได้เฉพาะเจ้าของเท่านั้น (Row Level Security)

create table if not exists public.subjects (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  n int not null,
  k int not null,
  labels text not null,
  id_len int not null default 5,
  key jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.results (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  subject_name text not null,
  student_id text not null default '',
  student_name text not null default '',
  score int not null,
  total int not null,
  answers jsonb not null,
  labels text not null default 'thai',
  taken_at timestamptz not null,
  deleted_at timestamptz
);

-- ถ้าเคยรันเวอร์ชันก่อนหน้าแล้ว ให้เพิ่มคอลัมน์ด้วย:
alter table public.subjects add column if not exists deleted_at timestamptz;
alter table public.results add column if not exists deleted_at timestamptz;

create index if not exists results_user_idx on public.results (user_id, subject_id, taken_at desc);

alter table public.subjects enable row level security;
alter table public.results enable row level security;

drop policy if exists "own subjects" on public.subjects;
create policy "own subjects" on public.subjects for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own results" on public.results;
create policy "own results" on public.results for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
