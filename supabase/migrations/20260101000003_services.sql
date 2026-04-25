-- =============================================
-- CATÉGORIES DE PRESTATIONS
-- =============================================
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  cover_image_url text,
  sort_order int default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_categories_slug_idx on public.service_categories(slug);
create index service_categories_active_idx on public.service_categories(is_active);

create trigger service_categories_updated_at
  before update on public.service_categories
  for each row execute function public.handle_updated_at();

-- =============================================
-- PRESTATIONS
-- =============================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories(id) on delete set null,

  name text not null,
  slug text not null unique,
  short_description text,
  description text,

  price numeric(10, 2) not null check (price >= 0),
  deposit_amount numeric(10, 2) default 0 check (deposit_amount >= 0),

  duration_minutes int not null check (duration_minutes > 0),
  preparation_minutes int default 0,
  cleanup_minutes int default 0,

  cover_image_url text,
  gallery_urls text[] default '{}',

  meta_title text,
  meta_description text,
  is_featured boolean default false,

  max_bookings_per_day int,
  advance_booking_days int default 60,
  min_notice_hours int default 24,

  is_active boolean not null default true,
  sort_order int default 0,

  total_bookings int default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index services_category_idx on public.services(category_id);
create index services_slug_idx on public.services(slug);
create index services_active_idx on public.services(is_active);
create index services_featured_idx on public.services(is_featured);
create index services_search_idx on public.services using gin (
  to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, ''))
);

create trigger services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

-- =============================================
-- RLS
-- =============================================
alter table public.service_categories enable row level security;
alter table public.services enable row level security;

create policy "Public can view active categories"
  on public.service_categories for select
  using (is_active = true or public.is_staff());

create policy "Public can view active services"
  on public.services for select
  using (
    (is_active = true and deleted_at is null) or public.is_staff()
  );

create policy "Admins manage categories"
  on public.service_categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage services"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());