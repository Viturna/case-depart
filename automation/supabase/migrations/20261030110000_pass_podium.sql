-- ============================================================
-- Pass Podium : achat unique qui débloque les parties libres
-- illimitées. Sans lui, limite quotidienne suivie côté serveur
-- (jamais par le client, sinon trivialement contournable).
-- ============================================================

alter table public.profiles
  add column if not exists pass_podium boolean not null default false,
  add column if not exists pass_podium_depuis timestamptz;

create table if not exists public.parties_libres (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  count integer not null default 0,
  primary key (user_id, date)
);

comment on table public.parties_libres is
  'Compteur quotidien de grilles démarrées en partie libre, pour la limite gratuite (Pass Podium la lève).';

alter table public.parties_libres enable row level security;
revoke all on public.parties_libres from anon, authenticated;
grant all on public.parties_libres to service_role;
