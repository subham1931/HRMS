-- Run this script in Supabase SQL Editor.
-- Holidays managed by HR and consumed by web + mobile apps.

create extension if not exists pgcrypto;

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  holiday_name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists holidays_date_idx
  on public.holidays(holiday_date);

create or replace function public.set_holidays_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_holidays_updated_at on public.holidays;
create trigger trg_set_holidays_updated_at
before update on public.holidays
for each row execute function public.set_holidays_updated_at();

alter table public.holidays enable row level security;

drop policy if exists "HR admins can read holidays" on public.holidays;
create policy "HR admins can read holidays"
  on public.holidays
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

drop policy if exists "HR admins can insert holidays" on public.holidays;
create policy "HR admins can insert holidays"
  on public.holidays
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

drop policy if exists "HR admins can update holidays" on public.holidays;
create policy "HR admins can update holidays"
  on public.holidays
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

drop policy if exists "HR admins can delete holidays" on public.holidays;
create policy "HR admins can delete holidays"
  on public.holidays
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
        and a.is_active = true
    )
  );

drop policy if exists "Public mobile holidays read" on public.holidays;
create policy "Public mobile holidays read"
  on public.holidays
  for select
  to anon
  using (true);

insert into public.holidays (holiday_date, holiday_name)
select make_date(extract(year from now())::int, v.month_num, v.day_num), v.holiday_name
from (
  values
    (1, 1, 'New Year Day'),
    (1, 26, 'Republic Day'),
    (1, 30, 'Martyrs'' Day'),
    (2, 14, 'Valentine''s Day'),
    (2, 19, 'Chhatrapati Shivaji Maharaj Jayanti'),
    (2, 26, 'Maha Shivaratri'),
    (3, 8, 'International Women''s Day'),
    (3, 14, 'Holi'),
    (3, 23, 'Shaheed Diwas'),
    (3, 31, 'Eid al-Fitr'),
    (4, 6, 'Ram Navami'),
    (4, 10, 'Mahavir Jayanti'),
    (4, 14, 'Ambedkar Jayanti'),
    (4, 18, 'Good Friday'),
    (5, 1, 'Labor Day'),
    (5, 12, 'Buddha Purnima'),
    (6, 7, 'Eid al-Adha'),
    (6, 21, 'International Yoga Day'),
    (7, 6, 'Muharram'),
    (8, 9, 'Raksha Bandhan'),
    (8, 15, 'Independence Day'),
    (8, 27, 'Ganesh Chaturthi'),
    (9, 5, 'Milad-un-Nabi'),
    (9, 16, 'Onam'),
    (10, 1, 'Maha Navami'),
    (10, 2, 'Gandhi Jayanti'),
    (10, 3, 'Dussehra'),
    (10, 20, 'Diwali'),
    (10, 21, 'Govardhan Puja'),
    (10, 22, 'Bhai Dooj'),
    (11, 1, 'Kannada Rajyotsava'),
    (11, 5, 'Guru Nanak Jayanti'),
    (11, 14, 'Children''s Day'),
    (11, 24, 'Guru Tegh Bahadur Martyrdom Day'),
    (12, 18, 'International Migrants Day'),
    (12, 25, 'Christmas Day'),
    (12, 31, 'New Year''s Eve')
) as v(month_num, day_num, holiday_name)
on conflict (holiday_date) do update
set holiday_name = excluded.holiday_name;
