-- =============================================
-- MOYENS DE PAIEMENT
-- =============================================
create type public.payment_method as enum (
  'cash',
  'card',
  'bank_transfer',
  'stripe',
  'paypal',
  'other'
);

-- =============================================
-- PAIEMENTS
-- =============================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default public.generate_reference('PAY'),

  booking_id uuid references public.bookings(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,

  client_id uuid references public.profiles(id),

  amount numeric(10, 2) not null,
  method payment_method not null,
  is_deposit boolean default false,

  status text not null default 'succeeded' check (
    status in ('pending', 'succeeded', 'failed', 'refunded', 'partial_refund')
  ),

  external_transaction_id text,
  stripe_payment_intent_id text,

  notes text,
  received_at timestamptz default now(),
  refunded_at timestamptz,
  refunded_amount numeric(10, 2) default 0,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (booking_id is not null and order_id is null)
    or (booking_id is null and order_id is not null)
  )
);

create index payments_booking_idx on public.payments(booking_id);
create index payments_order_idx on public.payments(order_id);
create index payments_client_idx on public.payments(client_id);
create index payments_received_at_idx on public.payments(received_at desc);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

-- =============================================
-- FACTURES
-- =============================================
create type public.invoice_status as enum (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default public.generate_reference('FA'),

  booking_id uuid references public.bookings(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,

  client_id uuid references public.profiles(id),
  client_first_name text not null,
  client_last_name text not null,
  client_email text not null,
  client_phone text,
  client_address text,
  client_city text,
  client_postal_code text,
  client_country text,

  issuer_name text not null,
  issuer_address text,
  issuer_siret text,
  issuer_email text,
  issuer_phone text,
  issuer_logo_url text,

  items jsonb not null default '[]'::jsonb,

  subtotal numeric(10, 2) not null default 0,
  tax_rate numeric(5, 2) default 0,
  tax_amount numeric(10, 2) default 0,
  discount_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null default 0,

  issued_at date not null default current_date,
  due_at date,
  paid_at timestamptz,

  status invoice_status not null default 'draft',

  pdf_url text,
  pdf_generated_at timestamptz,

  notes text,
  legal_mentions text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (booking_id is not null and order_id is null)
    or (booking_id is null and order_id is not null)
    or (booking_id is null and order_id is null)
  )
);

create index invoices_client_idx on public.invoices(client_id);
create index invoices_booking_idx on public.invoices(booking_id);
create index invoices_order_idx on public.invoices(order_id);
create index invoices_status_idx on public.invoices(status);
create index invoices_issued_at_idx on public.invoices(issued_at desc);

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();

-- =============================================
-- RLS
-- =============================================
alter table public.payments enable row level security;
alter table public.invoices enable row level security;

create policy "Clients view own payments"
  on public.payments for select
  using (auth.uid() = client_id or public.is_staff());

create policy "Staff manage payments"
  on public.payments for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Clients view own invoices"
  on public.invoices for select
  using (auth.uid() = client_id or public.is_staff());

create policy "Staff manage invoices"
  on public.invoices for all
  using (public.is_staff()) with check (public.is_staff());