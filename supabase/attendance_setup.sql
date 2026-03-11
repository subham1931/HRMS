-- Run this script in Supabase SQL Editor.
-- Attendance records synced from mobile check-in/check-out.

create extension if not exists pgcrypto;

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null references public.employees(employee_code) on delete cascade,
  attendance_date date not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  status text not null default 'Not Marked',
  work_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_code, attendance_date)
);

create index if not exists attendance_records_date_idx
  on public.attendance_records(attendance_date);
create index if not exists attendance_records_employee_idx
  on public.attendance_records(employee_code);

create or replace function public.set_attendance_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_attendance_records_updated_at on public.attendance_records;
create trigger trg_set_attendance_records_updated_at
before update on public.attendance_records
for each row execute function public.set_attendance_records_updated_at();

alter table public.attendance_records enable row level security;

drop policy if exists "HR admins can read attendance" on public.attendance_records;
create policy "HR admins can read attendance"
  on public.attendance_records
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

drop policy if exists "HR admins can manage attendance" on public.attendance_records;
create policy "HR admins can manage attendance"
  on public.attendance_records
  for all
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

drop policy if exists "Public mobile attendance read" on public.attendance_records;
create policy "Public mobile attendance read"
  on public.attendance_records
  for select
  to anon
  using (
    exists (
      select 1
      from public.employees e
      where e.employee_code = attendance_records.employee_code
        and lower(e.employment_status) = 'active'
    )
  );

drop policy if exists "Public mobile attendance write" on public.attendance_records;
create policy "Public mobile attendance write"
  on public.attendance_records
  for insert
  to anon
  with check (
    exists (
      select 1
      from public.employees e
      where e.employee_code = attendance_records.employee_code
        and lower(e.employment_status) = 'active'
    )
  );

drop policy if exists "Public mobile attendance update" on public.attendance_records;
create policy "Public mobile attendance update"
  on public.attendance_records
  for update
  to anon
  using (
    exists (
      select 1
      from public.employees e
      where e.employee_code = attendance_records.employee_code
        and lower(e.employment_status) = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.employees e
      where e.employee_code = attendance_records.employee_code
        and lower(e.employment_status) = 'active'
    )
  );
