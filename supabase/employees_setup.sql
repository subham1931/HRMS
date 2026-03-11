-- Run this script in Supabase SQL Editor.
-- Employees table for HR web module (create/read/update employee records).

create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  full_name text not null,
  first_name text not null default '',
  last_name text not null default '',
  department text not null default '',
  designation text not null default '',
  employment_type text not null default '',
  work_model text not null default '',
  employment_status text not null default 'Active',
  mobile text not null default '',
  personal_email text not null default '',
  office_email text not null default '',
  username text not null default '',
  password text not null default '',
  dob date,
  joining_date date,
  gender text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  zip_code text not null default '',
  office_location text not null default '',
  salary_text text not null default '',
  bank_name text not null default '',
  bank_account text not null default '',
  profile_image_url text not null default '',
  documents jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.employees add column if not exists password text not null default '';
alter table public.employees drop column if exists generated_password;
alter table public.employees drop column if exists marital_status;
alter table public.employees drop column if exists nationality;

create index if not exists employees_department_idx on public.employees(department);
create index if not exists employees_status_idx on public.employees(employment_status);
create index if not exists employees_code_idx on public.employees(employee_code);

create or replace function public.set_employees_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_employees_updated_at on public.employees;
create trigger trg_set_employees_updated_at
before update on public.employees
for each row execute function public.set_employees_updated_at();

alter table public.employees enable row level security;

drop policy if exists "HR admins can read employees" on public.employees;
create policy "HR admins can read employees"
  on public.employees
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

drop policy if exists "Employees can read own row" on public.employees;
create policy "Employees can read own row"
  on public.employees
  for select
  to authenticated
  using (lower(office_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Public mobile login can read employees" on public.employees;
create policy "Public mobile login can read employees"
  on public.employees
  for select
  to anon
  using (coalesce(lower(employment_status), 'active') = 'active');

drop policy if exists "HR admins can insert employees" on public.employees;
create policy "HR admins can insert employees"
  on public.employees
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

drop policy if exists "HR admins can update employees" on public.employees;
create policy "HR admins can update employees"
  on public.employees
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
