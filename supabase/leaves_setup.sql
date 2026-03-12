-- Run this script in Supabase SQL Editor.
-- Leave request workflow for employee app (apply) and HR app (approve/reject).

create extension if not exists pgcrypto;

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null references public.employees(employee_code) on delete cascade,
  leave_title text not null default '',
  leave_type text not null default 'Casual Leave',
  start_date date not null,
  end_date date not null,
  is_half_day boolean not null default false,
  reason text not null default '',
  attachment_url text not null default '',
  status text not null default 'Pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text not null default '',
  source text not null default 'mobile-app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_requests_status_check
    check (status in ('Pending', 'Approved', 'Rejected', 'Canceled')),
  constraint leave_requests_date_check
    check (end_date >= start_date)
);

create index if not exists leave_requests_employee_idx
  on public.leave_requests(employee_code);
create index if not exists leave_requests_status_idx
  on public.leave_requests(status);
create index if not exists leave_requests_start_idx
  on public.leave_requests(start_date);

create or replace function public.set_leave_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_leave_requests_updated_at on public.leave_requests;
create trigger trg_set_leave_requests_updated_at
before update on public.leave_requests
for each row execute function public.set_leave_requests_updated_at();

alter table public.leave_requests enable row level security;

drop policy if exists "HR admins can read leave requests" on public.leave_requests;
create policy "HR admins can read leave requests"
  on public.leave_requests
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

drop policy if exists "HR admins can manage leave requests" on public.leave_requests;
create policy "HR admins can manage leave requests"
  on public.leave_requests
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

drop policy if exists "Public mobile leave read" on public.leave_requests;
create policy "Public mobile leave read"
  on public.leave_requests
  for select
  to anon
  using (
    exists (
      select 1
      from public.employees e
      where e.employee_code = leave_requests.employee_code
        and lower(e.employment_status) = 'active'
    )
  );

drop policy if exists "Public mobile leave create pending" on public.leave_requests;
create policy "Public mobile leave create pending"
  on public.leave_requests
  for insert
  to anon
  with check (
    status = 'Pending'
    and exists (
      select 1
      from public.employees e
      where e.employee_code = leave_requests.employee_code
        and lower(e.employment_status) = 'active'
    )
  );

drop policy if exists "Public mobile leave cancel pending" on public.leave_requests;
create policy "Public mobile leave cancel pending"
  on public.leave_requests
  for update
  to anon
  using (
    status = 'Pending'
    and exists (
      select 1
      from public.employees e
      where e.employee_code = leave_requests.employee_code
        and lower(e.employment_status) = 'active'
    )
  )
  with check (
    status in ('Pending', 'Canceled')
    and exists (
      select 1
      from public.employees e
      where e.employee_code = leave_requests.employee_code
        and lower(e.employment_status) = 'active'
    )
  );
