-- Run this script in Supabase SQL Editor.
-- Leave types setup table for HR setup module.

create extension if not exists pgcrypto;

create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  annual_limit_days integer not null default 0,
  earned_per_month_days numeric(5,2) not null default 0,
  is_paid boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_types_annual_limit_non_negative check (annual_limit_days >= 0),
  constraint leave_types_earned_per_month_non_negative check (earned_per_month_days >= 0)
);

alter table public.leave_types
  add column if not exists earned_per_month_days numeric(5,2) not null default 0;

create unique index if not exists leave_types_name_unique_idx
  on public.leave_types (lower(name));

create or replace function public.set_leave_types_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_leave_types_updated_at on public.leave_types;
create trigger trg_set_leave_types_updated_at
before update on public.leave_types
for each row execute function public.set_leave_types_updated_at();

alter table public.leave_types enable row level security;

drop policy if exists "HR admins can read leave types" on public.leave_types;
create policy "HR admins can read leave types"
  on public.leave_types
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
        and a.is_active = true
    )
  );

drop policy if exists "HR admins can insert leave types" on public.leave_types;
create policy "HR admins can insert leave types"
  on public.leave_types
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
        and a.is_active = true
    )
  );

drop policy if exists "HR admins can update leave types" on public.leave_types;
create policy "HR admins can update leave types"
  on public.leave_types
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
        and a.is_active = true
    )
  )
  with check (
    exists (
      select 1
      from public.admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
        and a.is_active = true
    )
  );

insert into public.leave_types (name, annual_limit_days, earned_per_month_days, is_paid, is_active)
values
  ('Annual Leave', 12, 0, true, true),
  ('Sick Leave', 10, 0, true, true),
  ('Casual Leave', 8, 0, true, true),
  ('Earned Leave', 0, 1.5, true, true),
  ('Other Leave', 0, 0, false, true)
on conflict (name) do nothing;
