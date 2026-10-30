-- ============================================================
-- Mode classé — défi quotidien, grille identique pour tous,
-- temps calculé côté serveur (jamais celui envoyé par le client).
-- ============================================================

create table if not exists public.classement_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  level text not null default 'sprint',
  mode text not null default 'gratuit',
  seconds integer not null check (seconds > 0),
  errors integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date, level, mode)
);

comment on table public.classement_scores is
  'Un score = meilleure tentative d''un joueur sur la grille du jour. seconds vient du serveur (started_at de classement_attempts), jamais du client.';

create table if not exists public.classement_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  level text not null default 'sprint',
  mode text not null default 'gratuit',
  started_at timestamptz not null default now(),
  primary key (user_id, date, level, mode)
);

comment on table public.classement_attempts is
  'Horodatage serveur du début de la tentative en cours. Rafraîchi à chaque récupération de la grille du jour.';

alter table public.classement_scores enable row level security;
alter table public.classement_attempts enable row level security;

revoke all on public.classement_scores from anon, authenticated;
revoke all on public.classement_attempts from anon, authenticated;

grant all on public.classement_scores to service_role;
grant all on public.classement_attempts to service_role;

create index if not exists classement_scores_date_level_idx
  on public.classement_scores (date, level, mode, seconds);
