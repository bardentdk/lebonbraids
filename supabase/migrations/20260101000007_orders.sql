-- =============================================
-- STATUTS COMMANDES
-- =============================================
create type public.order_status as enum (
  'pending',
  'processing',
  'ready',
  'completed',
  'cancelled',
  'refunded'
);

create type public.delivery_method as enum (
  'pickup',
  'shipping'
);

-- =============================================
-- COMMANDES
-- =============================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default public.generate_reference('OR'),

  client_id uuid references public.profiles(id) on delete set null,
  client_first_name text not null,
  client_last_name text not null,
  client_email text not null,
  client_phone text not null,

  delivery_method delivery_method not null default 'pickup',
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_postal_code text,
  shipping_country text,
  shipping_cost numeric(10, 2) default 0,

  subtotal numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,

  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',

  notes text,
  internal_notes text,

  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_client_idx on public.orders(client_id);
create index orders_status_idx on public.orders(status);
create index orders_reference_idx on public.orders(reference);
create index orders_created_at_idx on public.orders(created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- =============================================
-- LIGNES DE COMMANDE
-- =============================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,

  product_name text not null,
  product_sku text,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(10, 2) not null,

  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

-- =============================================
-- TRIGGER : décrémente le stock à la commande payée
-- =============================================
create or replace function public.decrement_stock_on_order()
returns trigger
language plpgsql
as $$
declare
  item record;
  prod record;
begin
  if (new.payment_status = 'paid' and (old.payment_status is null or old.payment_status != 'paid')) then
    for item in select * from public.order_items where order_id = new.id loop
      if item.product_id is not null then
        select * into prod from public.products where id = item.product_id;

        if prod.track_stock then
          update public.products
          set
            stock_quantity = stock_quantity - item.quantity,
            total_sold = total_sold + item.quantity,
            total_revenue = total_revenue + item.subtotal
          where id = item.product_id;

          insert into public.stock_movements (
            product_id, type, quantity, previous_stock, new_stock, reason, reference_type, reference_id
          ) values (
            item.product_id, 'out', -item.quantity, prod.stock_quantity,
            prod.stock_quantity - item.quantity,
            'Commande ' || new.reference, 'order', new.id
          );
        end if;
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create trigger orders_decrement_stock
  after update on public.orders
  for each row execute function public.decrement_stock_on_order();

-- =============================================
-- RLS
-- =============================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Clients view own orders"
  on public.orders for select
  using (auth.uid() = client_id or public.is_staff());

create policy "Anyone can create order"
  on public.orders for insert
  with check (true);

create policy "Staff manage orders"
  on public.orders for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Clients view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id
      and (client_id = auth.uid() or public.is_staff())
    )
  );

create policy "Anyone can add order items"
  on public.order_items for insert
  with check (true);

create policy "Staff manage order items"
  on public.order_items for all
  using (public.is_staff()) with check (public.is_staff());