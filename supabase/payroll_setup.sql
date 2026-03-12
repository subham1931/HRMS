-- Run this script in Supabase SQL Editor.
-- Payroll records managed by HR web app.

create extension if not exists pgcrypto;

create table if not exists public.payroll_records (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null references public.employees(employee_code) on delete cascade,
  payroll_month date not null,
  ctc_amount numeric(12,2) not null default 0,
  monthly_salary_amount numeric(12,2) not null default 0,
  deduction_amount numeric(12,2) not null default 0,
  payment_status text not null default 'Pending',
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payroll_records_status_check
    check (payment_status in ('Pending', 'Completed')),
  constraint payroll_records_unique_month
    unique (employee_code, payroll_month)
);

create index if not exists payroll_records_month_idx
  on public.payroll_records(payroll_month);
create index if not exists payroll_records_employee_idx
  on public.payroll_records(employee_code);

create or replace function public.set_payroll_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_payroll_records_updated_at on public.payroll_records;
create trigger trg_set_payroll_records_updated_at
before update on public.payroll_records
for each row execute function public.set_payroll_records_updated_at();

alter table public.payroll_records enable row level security;

drop policy if exists "HR admins can read payroll records" on public.payroll_records;
create policy "HR admins can read payroll records"
  on public.payroll_records
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

drop policy if exists "HR admins can manage payroll records" on public.payroll_records;
create policy "HR admins can manage payroll records"
  on public.payroll_records
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
