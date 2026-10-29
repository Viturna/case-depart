-- ============================================================
-- Case Départ — schéma Supabase
-- À exécuter dans Supabase → SQL Editor (rôle postgres).
-- Idempotent : peut être relancé sans casser les données existantes.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Types
-- ------------------------------------------------------------
do $$
begin
  create type public.carnet_type as enum ('thematique', 'tour-annee', 'etape', 'starter');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.carnet_statut as enum ('brouillon', 'a_valider', 'pret');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.commande_statut as enum ('recue', 'livree', 'erreur');
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- Carnets
-- ------------------------------------------------------------
create table if not exists public.carnets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titre text not null,
  theme text not null,
  type public.carnet_type not null,
  statut public.carnet_statut not null default 'brouillon',
  formats_disponibles text[] not null default '{}',
  pdf_paths jsonb not null default '{}'::jsonb,
  version text not null default '1.0.0',
  edition text,
  valide_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carnets_formats_valides
    check (formats_disponibles <@ array['A4', 'A5', 'A5-livret']::text[])
);

comment on table public.carnets is
  'Un carnet produit : identité, statut de validation et chemins des PDF dans le bucket privé pdfs.';
comment on column public.carnets.pdf_paths is
  'Objet JSON : { "A4": "carnets/slug/version/slug-A4.pdf", "A5-livret": "..." }.';

-- ------------------------------------------------------------
-- Grilles
-- Source unique : les mêmes grilles serviront au jeu en ligne.
-- La colonne solution ne doit JAMAIS être exposée publiquement.
-- ------------------------------------------------------------
create table if not exists public.grilles (
  id uuid primary key default gen_random_uuid(),
  carnet_id uuid not null references public.carnets(id) on delete cascade,
  niveau text not null,
  position integer not null check (position >= 1),
  label text,
  seed text not null,
  puzzle char(81) not null,
  solution char(81) not null,
  clues integer not null check (clues between 0 and 81),
  techniques jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint grilles_niveau_valide
    check (niveau in ('echauffement', 'sprint', 'marathon', 'finale')),
  constraint grilles_puzzle_format check (puzzle ~ '^[0-9]{81}$'),
  constraint grilles_solution_format check (solution ~ '^[1-9]{81}$'),
  constraint grilles_position_unique unique (carnet_id, niveau, position)
);

comment on table public.grilles is
  'Grilles d''un carnet, avec solution. Accès réservé au service_role : les solutions ne sont jamais publiques.';

-- ------------------------------------------------------------
-- Commandes
-- stripe_session_id unique = clé d'idempotence du workflow B.
-- ------------------------------------------------------------
create table if not exists public.commandes (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  email text not null,
  carnet_slug text not null,
  format text not null,
  gift boolean not null default false,
  recipient_name text,
  gift_message text,
  buyer_email text,
  montant_cents integer,
  statut public.commande_statut not null default 'recue',
  pdf_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  livree_le timestamptz,
  constraint commandes_format_valide
    check (format in ('A4', 'A5', 'A5-livret'))
);

comment on table public.commandes is
  'Commandes Stripe. stripe_session_id garantit l''idempotence : un rejeu ne renvoie jamais un second e-mail.';

-- ------------------------------------------------------------
-- Leads Starter
-- ------------------------------------------------------------
create table if not exists public.leads_starter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consentement boolean not null default false,
  theme text,
  source text,
  created_at timestamptz not null default now()
);

comment on table public.leads_starter is
  'Contacts du Starter gratuit. Le consentement explicite est obligatoire avant tout envoi marketing.';

-- ------------------------------------------------------------
-- Index
-- ------------------------------------------------------------
create index if not exists carnets_statut_type_idx
  on public.carnets (statut, type);
create index if not exists grilles_carnet_idx
  on public.grilles (carnet_id);
create index if not exists commandes_email_idx
  on public.commandes (email);
create index if not exists commandes_statut_idx
  on public.commandes (statut);
create index if not exists leads_starter_created_idx
  on public.leads_starter (created_at desc);

-- ------------------------------------------------------------
-- updated_at automatique
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists carnets_touch_updated_at on public.carnets;
create trigger carnets_touch_updated_at
  before update on public.carnets
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- RLS : tout est privé. Seul le service_role (n8n) passe.
-- ------------------------------------------------------------
alter table public.carnets enable row level security;
alter table public.grilles enable row level security;
alter table public.commandes enable row level security;
alter table public.leads_starter enable row level security;

revoke all on public.carnets from anon, authenticated;
revoke all on public.grilles from anon, authenticated;
revoke all on public.commandes from anon, authenticated;
revoke all on public.leads_starter from anon, authenticated;

grant all on public.carnets to service_role;
grant all on public.grilles to service_role;
grant all on public.commandes to service_role;
grant all on public.leads_starter to service_role;

-- Vue publique future pour le jeu en ligne : jamais de colonne solution.
-- create or replace view public.grilles_publiques as
--   select g.id, g.carnet_id, g.niveau, g.position, g.label, g.puzzle, g.clues
--   from public.grilles g
--   join public.carnets c on c.id = g.carnet_id
--   where c.statut = 'pret';
-- grant select on public.grilles_publiques to anon, authenticated;

-- ------------------------------------------------------------
-- Bucket privé pdfs
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

-- Aucune policy storage publique : les PDF sont servis par des URLs signées
-- générées avec la clé service_role, à durée limitée.
