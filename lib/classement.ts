import { createAdminClient } from '@/lib/supabase/admin';
import { generateDaily, todayUTC, type Level } from '@/lib/dailyChallenge';

const LEVEL: Level = 'sprint';
const MODE = 'gratuit';

export interface DailyGrilleResult {
  puzzle: number[];
  bestSeconds: number | null;
}

/** Démarre/relance une tentative (rafraîchit started_at) et renvoie la grille du jour. */
export async function startDailyAttempt(userId: string): Promise<DailyGrilleResult> {
  const admin = createAdminClient();
  const date = todayUTC();
  const { puzzle } = generateDaily(date, LEVEL);

  await admin
    .from('classement_attempts')
    .upsert(
      { user_id: userId, date, level: LEVEL, mode: MODE, started_at: new Date().toISOString() },
      { onConflict: 'user_id,date,level,mode' }
    );

  const { data: existing } = await admin
    .from('classement_scores')
    .select('seconds')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('level', LEVEL)
    .eq('mode', MODE)
    .maybeSingle();

  return { puzzle, bestSeconds: existing?.seconds ?? null };
}

export interface SubmitResult {
  ok: boolean;
  error?: string;
  seconds?: number;
  bestSeconds?: number;
  isNewBest?: boolean;
  rank?: number;
}

/** Vérifie la grille soumise contre la solution recalculée, et le temps contre started_at serveur. */
export async function submitDailyScore(userId: string, grid: number[], errors: number): Promise<SubmitResult> {
  if (!Array.isArray(grid) || grid.length !== 81) {
    return { ok: false, error: 'Grille invalide.' };
  }

  const admin = createAdminClient();
  const date = todayUTC();
  const { solution } = generateDaily(date, LEVEL);

  const correct = grid.every((v, i) => v === solution[i]);
  if (!correct) {
    return { ok: false, error: "Cette grille n'est pas correcte." };
  }

  const { data: attempt } = await admin
    .from('classement_attempts')
    .select('started_at')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('level', LEVEL)
    .eq('mode', MODE)
    .maybeSingle();

  if (!attempt) {
    return { ok: false, error: "Aucune tentative en cours, recharge la grille du jour." };
  }

  const seconds = Math.max(1, Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000));

  const { data: existing } = await admin
    .from('classement_scores')
    .select('seconds')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('level', LEVEL)
    .eq('mode', MODE)
    .maybeSingle();

  const isNewBest = !existing || seconds < existing.seconds;
  const bestSeconds = isNewBest ? seconds : existing!.seconds;

  if (isNewBest) {
    await admin.from('classement_scores').upsert(
      {
        user_id: userId,
        date,
        level: LEVEL,
        mode: MODE,
        seconds,
        errors,
      },
      { onConflict: 'user_id,date,level,mode' }
    );
  }

  const { count } = await admin
    .from('classement_scores')
    .select('id', { count: 'exact', head: true })
    .eq('date', date)
    .eq('level', LEVEL)
    .eq('mode', MODE)
    .lt('seconds', bestSeconds);

  return { ok: true, seconds, bestSeconds, isNewBest, rank: (count ?? 0) + 1 };
}

export interface LeaderboardEntry {
  nom: string;
  seconds: number;
  errors: number;
  isYou: boolean;
}

export async function getDailyLeaderboard(currentUserId: string | null, limit = 50): Promise<LeaderboardEntry[]> {
  const admin = createAdminClient();
  const date = todayUTC();

  const { data: scores } = await admin
    .from('classement_scores')
    .select('user_id, seconds, errors')
    .eq('date', date)
    .eq('level', LEVEL)
    .eq('mode', MODE)
    .order('seconds', { ascending: true })
    .limit(limit);

  if (!scores || scores.length === 0) return [];

  const userIds = scores.map((s) => s.user_id);
  const { data: profiles } = await admin.from('profiles').select('id, nom').in('id', userIds);
  const nomById = new Map((profiles || []).map((p) => [p.id, p.nom]));

  return scores.map((s) => ({
    nom: nomById.get(s.user_id) || 'Un complice',
    seconds: s.seconds,
    errors: s.errors,
    isYou: s.user_id === currentUserId,
  }));
}
