-- =============================================
-- PROFILES : étend auth.users de Supabase
-- =============================================

create type public.user_role as enum ('admin', 'staff', 'client');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',

  -- Identité
  first_name text,
  last_name text,
  email text not null unique,
  phone text,
  avatar_url text,

  -- Adresse
  address_line1 text,
  address_line2 text,
  city text,
  postal_code text,
  country text default 'France',

  -- Préférences
  marketing_consent boolean default false,
  sms_consent boolean default false,
  language text default 'fr',

  -- Stats client (dénormalisées, mises à jour par trigger)
  total_bookings int default 0,
  total_spent numeric(10, 2) default 0,
  last_booking_at timestamptz,

  -- Notes internes admin
  internal_notes text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index profiles_role_idx on public.profiles(role);
create index profiles_email_idx on public.profiles(email);
create index profiles_phone_idx on public.profiles(phone);
create index profiles_created_at_idx on public.profiles(created_at desc);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- =============================================
-- TRIGGER : création auto du profil à l'inscription
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- HELPERS : vérifier les rôles
-- =============================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- =============================================
-- RLS
-- =============================================
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin());