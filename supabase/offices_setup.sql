-- Run this script in Supabase SQL Editor.
-- Offices master table for HR module.

create extension if not exists pgcrypto;

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists offices_name_unique_idx
  on public.offices (lower(name));

create or replace function public.set_offices_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_offices_updated_at on public.offices;
create trigger trg_set_offices_updated_at
before update on public.offices
for each row execute function public.set_offices_updated_at();

alter table public.offices enable row level security;

drop policy if exists "HR admins can read offices" on public.offices;
create policy "HR admins can read offices"
  on public.offices
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

drop policy if exists "HR admins can insert offices" on public.offices;
create policy "HR admins can insert offices"
  on public.offices
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

drop policy if exists "HR admins can update offices" on public.offices;
create policy "HR admins can update offices"
  on public.offices
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
