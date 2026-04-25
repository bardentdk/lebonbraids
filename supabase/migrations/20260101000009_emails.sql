-- =============================================
-- TEMPLATES EMAILS
-- =============================================
create type public.email_template_type as enum (
  'booking_confirmation',
  'booking_reminder',
  'booking_cancellation',
  'order_confirmation',
  'order_shipped',
  'invoice',
  'welcome',
  'password_reset',
  'marketing',
  'custom'
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  type email_template_type not null,
  name text not null,
  subject text not null,
  html_content text not null,
  text_content text,
  variables jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.handle_updated_at();

-- =============================================
-- LOGS EMAILS
-- =============================================
create type public.email_status as enum (
  'pending', 'sent', 'delivered', 'opened', 'bounced', 'failed'
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  template_key text,
  to_email text not null,
  from_email text not null,
  subject text not null,
  status email_status not null default 'pending',

  resend_id text,
  error_message text,

  booking_id uuid references public.bookings(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  client_id uuid references public.profiles(id) on delete set null,

  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create index email_logs_to_email_idx on public.email_logs(to_email);
create index email_logs_status_idx on public.email_logs(status);
create index email_logs_created_at_idx on public.email_logs(created_at desc);

-- =============================================
-- RLS
-- =============================================
alter table public.email_templates enable row level security;
alter table public.email_logs enable row level security;

create policy "Admins manage email templates"
  on public.email_templates for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Staff view email logs"
  on public.email_logs for select
  using (public.is_staff());

create policy "System can create email logs"
  on public.email_logs for insert
  with check (true);