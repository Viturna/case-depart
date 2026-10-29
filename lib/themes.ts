// Thèmes : libellé + variables CSS (fond, encre) définies dans styles/tokens.css
export const THEMES: Record<string, { label: string; bg: string; ink: string }> = {
  halloween: { label: 'Halloween', bg: 'var(--theme-halloween)', ink: 'var(--theme-halloween-ink)' },
  muertos: { label: 'Día de los Muertos', bg: 'var(--theme-muertos)', ink: 'var(--theme-muertos-ink)' },
  noel: { label: 'Noël', bg: 'var(--theme-noel)', ink: 'var(--theme-noel-ink)' },
  'saint-valentin': { label: 'Saint-Valentin', bg: 'var(--theme-valentin)', ink: 'var(--theme-valentin-ink)' },
  paques: { label: 'Pâques', bg: 'var(--theme-paques)', ink: 'var(--theme-paques-ink)' },
};

const MULTI = { label: 'Multi-thèmes', bg: 'var(--theme-multi)', ink: 'var(--theme-multi-ink)' };

// Thèmes hors lancement : pas de couleur dédiée, teinte neutre
const EXTRA: Record<string, string> = { 'fete-musique': 'Fête de la musique' };

export function getTheme(slug: string) {
  return THEMES[slug] ?? (EXTRA[slug] ? { ...MULTI, label: EXTRA[slug] } : MULTI);
}
