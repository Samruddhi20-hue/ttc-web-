-- TeamSpace database schema
-- IMPORTANT: The policies below allow public anonymous access for a no-login prototype.
-- Anyone who obtains the project URL and anon key can read/change the calendar data.
-- For private team use, replace these policies with authenticated access or add a server-side
-- access gate. Never put the Supabase service_role key in frontend JavaScript.

create extension if not exists pgcrypto;

create table if not exists public.team_members (
  id text primary key,
  name text not null,
  color text not null default '#6c63df',
  created_at timestamptz not null default now()
);

create table if not exists public.leaves (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.team_members(id) on update cascade on delete restrict,
  title text not null check (char_length(title) between 1 and 140),
  start_date date not null,
  end_date date not null,
  leave_type text not null default 'full_day' check (leave_type in ('full_day','half_day','sick','casual','annual','other')),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  constraint leaves_date_order check (end_date >= start_date)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.team_members(id) on update cascade on delete restrict,
  title text not null check (char_length(title) between 1 and 140),
  due_date date not null,
  status text not null default 'open' check (status in ('open','in_progress','done')),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists leaves_dates_idx on public.leaves (start_date, end_date);
create index if not exists leaves_member_idx on public.leaves (member_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_member_idx on public.tasks (member_id);

insert into public.team_members (id, name, color) values
 ('member-1', 'Sam', '#6c63df'),
 ('member-2', 'Khushi', '#1d9b83'),
 ('member-3', 'Rajat Sir', '#e39a36'),
 ('member-4', 'Shivam Sir', '#3987d7'),
 ('member-5', 'Saurabh Sir', '#d9577b'),
 ('member-6', 'Dipali', '#8a63d2'),
 ('member-7', 'Ajay', '#0f9bb5'),
 ('member-8', 'GP', '#7c8d35')
on conflict (id) do update set name = excluded.name, color = excluded.color;

alter table public.team_members enable row level security;
alter table public.leaves enable row level security;
alter table public.tasks enable row level security;

-- Prototype-only no-login policies. Public read/write is intentionally broad.
drop policy if exists "Public can read team members" on public.team_members;
create policy "Public can read team members" on public.team_members for select to anon, authenticated using (true);
drop policy if exists "Public can manage team members" on public.team_members;
create policy "Public can manage team members" on public.team_members for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public can read leaves" on public.leaves;
create policy "Public can read leaves" on public.leaves for select to anon, authenticated using (true);
drop policy if exists "Public can add leaves" on public.leaves;
create policy "Public can add leaves" on public.leaves for insert to anon, authenticated with check (true);
drop policy if exists "Public can edit leaves" on public.leaves;
create policy "Public can edit leaves" on public.leaves for update to anon, authenticated using (true) with check (true);
drop policy if exists "Public can delete leaves" on public.leaves;
create policy "Public can delete leaves" on public.leaves for delete to anon, authenticated using (true);

drop policy if exists "Public can read tasks" on public.tasks;
create policy "Public can read tasks" on public.tasks for select to anon, authenticated using (true);
drop policy if exists "Public can add tasks" on public.tasks;
create policy "Public can add tasks" on public.tasks for insert to anon, authenticated with check (true);
drop policy if exists "Public can edit tasks" on public.tasks;
create policy "Public can edit tasks" on public.tasks for update to anon, authenticated using (true) with check (true);
drop policy if exists "Public can delete tasks" on public.tasks;
create policy "Public can delete tasks" on public.tasks for delete to anon, authenticated using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.team_members to anon, authenticated;
grant select, insert, update, delete on public.leaves to anon, authenticated;
grant select, insert, update, delete on public.tasks to anon, authenticated;
