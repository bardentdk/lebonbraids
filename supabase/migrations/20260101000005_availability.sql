-- =============================================
-- HORAIRES D'OUVERTURE (récurrent hebdomadaire)
-- =============================================
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  is_closed boolean default false,
  break_start time,
  break_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(day_of_week)
);

create trigger business_hours_updated_at
  before update on public.business_hours
  for each row execute function public.handle_updated_at();

-- =============================================
-- CONGÉS / JOURS FÉRIÉS / ABSENCES
-- =============================================
create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  reason text,
  is_all_day boolean default true,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index time_off_dates_idx on public.time_off(start_date, end_date);

-- =============================================
-- CRÉNEAUX BLOQUÉS
-- =============================================
create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index blocked_slots_range_idx on public.blocked_slots(start_at, end_at);

-- =============================================
-- RLS
-- =============================================
alter table public.business_hours enable row level security;
alter table public.time_off enable row level security;
alter table public.blocked_slots enable row level security;

create policy "Public can view business hours"
  on public.business_hours for select using (true);

create policy "Public can view time off"
  on public.time_off for select using (true);

create policy "Public can view blocked slots"
  on public.blocked_slots for select using (true);

create policy "Admins manage business hours"
  on public.business_hours for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage time off"
  on public.time_off for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Staff manage blocked slots"
  on public.blocked_slots for all
  using (public.is_staff()) with check (public.is_staff());