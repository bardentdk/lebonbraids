-- =============================================
-- EXTENSIONS & UTILITAIRES DE BASE
-- =============================================

-- Recherche full-text en français
create extension if not exists "unaccent" with schema "extensions";
-- Fuzzy search
create extension if not exists "pg_trgm" with schema "extensions";

-- =============================================
-- GRANTS DE BASE pour les rôles Supabase
-- (sinon les RLS policies ne sont jamais évaluées
--  car PostgreSQL bloque l'accès dès le SELECT brut)
-- =============================================
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;

-- =============================================
-- TRIGGER : updated_at automatique
-- =============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================
-- FONCTION : slug automatique
-- =============================================
create or replace function public.slugify(v text)
returns text
language plpgsql
immutable
as $$
begin
  return lower(
    regexp_replace(
      regexp_replace(
        extensions.unaccent(trim(v)),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
end;
$$;

-- =============================================
-- TABLE : compteur de références
-- =============================================
create table if not exists public.reference_counters (
  prefix text not null,
  year text not null,
  counter int not null default 0,
  primary key (prefix, year)
);

-- =============================================
-- FONCTION : génère un numéro (BK-2026-0001, etc.)
-- =============================================
create or replace function public.generate_reference(prefix text)
returns text
language plpgsql
as $$
declare
  ref text;
  current_year text := to_char(now(), 'YYYY');
  next_counter int;
begin
  insert into public.reference_counters (prefix, year, counter)
  values (prefix, current_year, 1)
  on conflict (prefix, year)
  do update set counter = reference_counters.counter + 1
  returning counter into next_counter;

  ref := prefix || '-' || current_year || '-' || lpad(next_counter::text, 4, '0');
  return ref;
end;
$$;