-- Run this script in Supabase SQL Editor.
-- It creates an admins table used to authorize who can access this HRMS panel.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  full_name text not null default 'Admin User',
  role text not null default 'HR',
  phone text not null default '',
  address text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admins add column if not exists role text not null default 'HR';
alter table public.admins add column if not exists phone text not null default '';
alter table public.admins add column if not exists address text not null default '';
update public.admins set role = 'HR' where role is null or trim(role) = '';
update public.admins set phone = '' where phone is null;
update public.admins set address = '' where address is null;

create unique index if not exists admins_email_unique_idx
  on public.admins (email);

alter table public.admins enable row level security;

drop policy if exists "Admins can read own row" on public.admins;
create policy "Admins can read own row"
  on public.admins
  for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Service role full access on admins" on public.admins;
create policy "Service role full access on admins"
  on public.admins
  for all
  to service_role
  using (true)
  with check (true);

-- Seed one admin identity row. The auth user is created by script below.
insert into public.admins (email, full_name, role, phone, address, is_active)
values ('admin@hrms.test', 'Test Admin', 'HR', '+91 98765 43210', 'Bangalore, India', true)
on conflict (email) do update
set full_name = excluded.full_name,
    role = excluded.role,
    phone = excluded.phone,
    address = excluded.address,
    is_active = excluded.is_active;
