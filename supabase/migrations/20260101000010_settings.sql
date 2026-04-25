-- =============================================
-- PARAMÈTRES SITE (key-value)
-- =============================================
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  category text,
  is_public boolean default false,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create index site_settings_category_idx on public.site_settings(category);
create index site_settings_public_idx on public.site_settings(is_public);

-- =============================================
-- THÈMES (personnalisation couleurs)
-- =============================================
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default false,
  is_default boolean not null default false,

  config jsonb not null default '{}'::jsonb,

  preview_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index themes_one_active_idx on public.themes(is_active) where is_active = true;

create trigger themes_updated_at
  before update on public.themes
  for each row execute function public.handle_updated_at();

-- =============================================
-- TRIGGER : un seul thème actif à la fois
-- =============================================
create or replace function public.ensure_single_active_theme()
returns trigger
language plpgsql
as $$
begin
  if new.is_active = true then
    update public.themes
    set is_active = false
    where id != new.id and is_active = true;
  end if;
  return new;
end;
$$;

create trigger themes_single_active
  before insert or update on public.themes
  for each row execute function public.ensure_single_active_theme();

-- =============================================
-- RLS
-- =============================================
alter table public.site_settings enable row level security;
alter table public.themes enable row level security;

create policy "Public settings are visible"
  on public.site_settings for select
  using (is_public = true or public.is_staff());

create policy "Admins manage settings"
  on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Active theme is public"
  on public.themes for select
  using (is_active = true or public.is_staff());

create policy "Admins manage themes"
  on public.themes for all
  using (public.is_admin()) with check (public.is_admin());