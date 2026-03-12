-- Run this script in Supabase SQL Editor.
-- HR calendar events (meetings/tasks) for dashboard calendar.

create extension if not exists pgcrypto;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  event_title text not null,
  event_type text not null default 'meeting',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_type_check check (event_type in ('meeting', 'task'))
);

create index if not exists calendar_events_date_idx on public.calendar_events(event_date);

create or replace function public.set_calendar_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_calendar_events_updated_at on public.calendar_events;
create trigger trg_set_calendar_events_updated_at
before update on public.calendar_events
for each row execute function public.set_calendar_events_updated_at();

alter table public.calendar_events enable row level security;

drop policy if exists "HR admins can read calendar events" on public.calendar_events;
create policy "HR admins can read calendar events"
  on public.calendar_events
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

drop policy if exists "HR admins can manage calendar events" on public.calendar_events;
create policy "HR admins can manage calendar events"
  on public.calendar_events
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
