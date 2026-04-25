-- =============================================
-- STATUTS
-- =============================================
create type public.booking_status as enum (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

create type public.payment_status as enum (
  'unpaid',
  'deposit_paid',
  'paid',
  'refunded',
  'partial_refund'
);

-- =============================================
-- RÉSERVATIONS
-- =============================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default public.generate_reference('BK'),

  client_id uuid references public.profiles(id) on delete set null,
  client_first_name text not null,
  client_last_name text not null,
  client_email text not null,
  client_phone text not null,

  start_at timestamptz not null,
  end_at timestamptz not null,
  duration_minutes int not null,

  subtotal numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  deposit_required numeric(10, 2) default 0,
  deposit_paid numeric(10, 2) default 0,

  status booking_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',

  notes text,
  internal_notes text,

  cancelled_at timestamptz,
  cancellation_reason text,
  cancelled_by uuid references public.profiles(id),

  reminder_sent_at timestamptz,
  confirmation_sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (end_at > start_at)
);

create index bookings_client_idx on public.bookings(client_id);
create index bookings_status_idx on public.bookings(status);
create index bookings_start_at_idx on public.bookings(start_at);
create index bookings_reference_idx on public.bookings(reference);
create index bookings_range_idx on public.bookings(start_at, end_at);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- =============================================
-- PRESTATIONS DANS UNE RÉSA
-- =============================================
create table public.booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,

  service_name text not null,
  service_price numeric(10, 2) not null,
  service_duration_minutes int not null,
  quantity int not null default 1,

  created_at timestamptz not null default now()
);

create index booking_services_booking_idx on public.booking_services(booking_id);
create index booking_services_service_idx on public.booking_services(service_id);

-- =============================================
-- TRIGGER : mise à jour stats client
-- =============================================
create or replace function public.update_client_booking_stats()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.status != new.status)) then
    if new.client_id is not null then
      update public.profiles
      set
        total_bookings = (
          select count(*) from public.bookings
          where client_id = new.client_id and status = 'completed'
        ),
        total_spent = (
          select coalesce(sum(total_amount), 0) from public.bookings
          where client_id = new.client_id and status = 'completed'
        ),
        last_booking_at = (
          select max(start_at) from public.bookings
          where client_id = new.client_id and status = 'completed'
        )
      where id = new.client_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger bookings_update_client_stats
  after insert or update on public.bookings
  for each row execute function public.update_client_booking_stats();

-- =============================================
-- TRIGGER : incrémente total_bookings du service
-- =============================================
create or replace function public.update_service_booking_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and new.service_id is not null then
    update public.services
    set total_bookings = total_bookings + new.quantity
    where id = new.service_id;
  end if;
  return new;
end;
$$;

create trigger booking_services_count
  after insert on public.booking_services
  for each row execute function public.update_service_booking_count();

-- =============================================
-- RLS
-- =============================================
alter table public.bookings enable row level security;
alter table public.booking_services enable row level security;

create policy "Clients view own bookings"
  on public.bookings for select
  using (auth.uid() = client_id or public.is_staff());

create policy "Anyone can create booking"
  on public.bookings for insert
  with check (true);

create policy "Clients can cancel own bookings"
  on public.bookings for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Staff manage all bookings"
  on public.bookings for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Clients view own booking services"
  on public.booking_services for select
  using (
    exists (
      select 1 from public.bookings
      where id = booking_id
      and (client_id = auth.uid() or public.is_staff())
    )
  );

create policy "Anyone can add booking services during booking"
  on public.booking_services for insert
  with check (true);

create policy "Staff manage booking services"
  on public.booking_services for all
  using (public.is_staff()) with check (public.is_staff());