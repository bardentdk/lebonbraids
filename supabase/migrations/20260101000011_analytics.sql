-- =============================================
-- VUE : Revenus par mois
-- =============================================
create or replace view public.vw_monthly_revenue as
select
  date_trunc('month', received_at) as month,
  sum(amount) as total_revenue,
  count(*) as transactions_count,
  sum(case when booking_id is not null then amount else 0 end) as bookings_revenue,
  sum(case when order_id is not null then amount else 0 end) as orders_revenue
from public.payments
where status = 'succeeded'
group by 1
order by 1 desc;

-- =============================================
-- VUE : Top prestations
-- =============================================
create or replace view public.vw_top_services as
select
  s.id,
  s.name,
  s.slug,
  s.price,
  count(bs.id) as total_bookings,
  coalesce(sum(bs.service_price * bs.quantity), 0) as total_revenue
from public.services s
left join public.booking_services bs on bs.service_id = s.id
left join public.bookings b on b.id = bs.booking_id and b.status = 'completed'
group by s.id
order by total_bookings desc;

-- =============================================
-- VUE : Top produits
-- =============================================
create or replace view public.vw_top_products as
select
  p.id,
  p.name,
  p.slug,
  p.price,
  p.stock_quantity,
  coalesce(sum(oi.quantity), 0) as total_sold,
  coalesce(sum(oi.subtotal), 0) as total_revenue
from public.products p
left join public.order_items oi on oi.product_id = p.id
left join public.orders o on o.id = oi.order_id and o.status in ('completed', 'ready')
group by p.id
order by total_sold desc;

-- =============================================
-- VUE : Clients récurrents
-- =============================================
create or replace view public.vw_loyal_clients as
select
  p.id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.total_bookings,
  p.total_spent,
  p.last_booking_at,
  (
    select count(*) from public.bookings
    where client_id = p.id and created_at > now() - interval '90 days'
  ) as bookings_last_90_days
from public.profiles p
where p.role = 'client'
  and p.total_bookings > 0
order by p.total_spent desc;

-- =============================================
-- FONCTION : KPIs dashboard
-- =============================================
create or replace function public.get_dashboard_kpis(period_days int default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  period_start timestamptz := now() - (period_days || ' days')::interval;
  prev_period_start timestamptz := now() - (period_days * 2 || ' days')::interval;
begin
  if not public.is_staff() then
    raise exception 'Unauthorized';
  end if;

  select jsonb_build_object(
    'revenue', (
      select coalesce(sum(amount), 0)
      from payments
      where status = 'succeeded' and received_at >= period_start
    ),
    'revenue_previous', (
      select coalesce(sum(amount), 0)
      from payments
      where status = 'succeeded'
      and received_at >= prev_period_start and received_at < period_start
    ),
    'bookings_count', (
      select count(*) from bookings where created_at >= period_start
    ),
    'bookings_completed', (
      select count(*) from bookings
      where status = 'completed' and start_at >= period_start
    ),
    'orders_count', (
      select count(*) from orders where created_at >= period_start
    ),
    'new_clients', (
      select count(*) from profiles
      where role = 'client' and created_at >= period_start
    ),
    'upcoming_bookings', (
      select count(*) from bookings
      where status in ('pending', 'confirmed')
      and start_at > now()
    ),
    'low_stock_products', (
      select count(*) from products
      where track_stock = true
      and stock_quantity <= stock_alert_threshold
      and is_active = true
    )
  ) into result;

  return result;
end;
$$;