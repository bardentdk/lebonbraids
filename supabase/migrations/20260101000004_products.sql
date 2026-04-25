-- =============================================
-- CATÉGORIES PRODUITS
-- =============================================
create table public.product_categories (
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

create index product_categories_slug_idx on public.product_categories(slug);

create trigger product_categories_updated_at
  before update on public.product_categories
  for each row execute function public.handle_updated_at();

-- =============================================
-- PRODUITS
-- =============================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,

  sku text unique,
  barcode text,
  name text not null,
  slug text not null unique,

  short_description text,
  description text,
  ingredients text,
  usage_instructions text,

  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2),
  cost_price numeric(10, 2),

  stock_quantity int not null default 0 check (stock_quantity >= 0),
  stock_alert_threshold int default 5,
  track_stock boolean default true,
  allow_backorder boolean default false,

  weight_grams int,

  cover_image_url text,
  gallery_urls text[] default '{}',

  meta_title text,
  meta_description text,
  tags text[] default '{}',
  is_featured boolean default false,
  is_new boolean default true,

  is_active boolean not null default true,
  sort_order int default 0,

  total_sold int default 0,
  total_revenue numeric(12, 2) default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index products_category_idx on public.products(category_id);
create index products_slug_idx on public.products(slug);
create index products_sku_idx on public.products(sku);
create index products_active_idx on public.products(is_active);
create index products_featured_idx on public.products(is_featured);
create index products_stock_idx on public.products(stock_quantity) where track_stock = true;
create index products_search_idx on public.products using gin (
  to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, ''))
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- =============================================
-- MOUVEMENTS DE STOCK (historique)
-- =============================================
create type public.stock_movement_type as enum (
  'in',
  'out',
  'adjustment',
  'loss'
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type stock_movement_type not null,
  quantity int not null,
  previous_stock int not null,
  new_stock int not null,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index stock_movements_product_idx on public.stock_movements(product_id);
create index stock_movements_created_at_idx on public.stock_movements(created_at desc);

-- =============================================
-- TRIGGER : enregistrement auto des mouvements
-- =============================================
create or replace function public.log_stock_change()
returns trigger
language plpgsql
as $$
begin
  if old.stock_quantity != new.stock_quantity then
    insert into public.stock_movements (
      product_id, type, quantity, previous_stock, new_stock, reason
    ) values (
      new.id,
      case
        when new.stock_quantity > old.stock_quantity then 'in'
        else 'out'
      end,
      new.stock_quantity - old.stock_quantity,
      old.stock_quantity,
      new.stock_quantity,
      'Changement automatique'
    );
  end if;
  return new;
end;
$$;

-- =============================================
-- RLS
-- =============================================
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;

create policy "Public can view active product categories"
  on public.product_categories for select
  using (is_active = true or public.is_staff());

create policy "Public can view active products"
  on public.products for select
  using ((is_active = true and deleted_at is null) or public.is_staff());

create policy "Admins manage product categories"
  on public.product_categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Staff can view stock movements"
  on public.stock_movements for select
  using (public.is_staff());

create policy "Admins manage stock movements"
  on public.stock_movements for all
  using (public.is_admin()) with check (public.is_admin());