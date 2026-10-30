import { createAdminClient } from '@/lib/supabase/admin';

export const FREE_DAILY_LIMIT = 3;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface PodiumStatus {
  unlocked: boolean;
  playsToday: number;
  limit: number;
}

export async function getPodiumStatus(userId: string): Promise<PodiumStatus> {
  const admin = createAdminClient();

  const { data: profile } = await admin.from('profiles').select('pass_podium').eq('id', userId).single();
  if (profile?.pass_podium) {
    return { unlocked: true, playsToday: 0, limit: FREE_DAILY_LIMIT };
  }

  const { data: row } = await admin
    .from('parties_libres')
    .select('count')
    .eq('user_id', userId)
    .eq('date', todayUTC())
    .maybeSingle();

  return { unlocked: false, playsToday: row?.count ?? 0, limit: FREE_DAILY_LIMIT };
}

export interface StartGameResult {
  allowed: boolean;
  playsToday: number;
  limit: number;
  unlocked: boolean;
}

/** Incrémente le compteur du jour si la limite n'est pas atteinte (ou si débloqué). */
export async function tryStartFreeGame(userId: string): Promise<StartGameResult> {
  const admin = createAdminClient();
  const date = todayUTC();

  const { data: profile } = await admin.from('profiles').select('pass_podium').eq('id', userId).single();
  if (profile?.pass_podium) {
    return { allowed: true, playsToday: 0, limit: FREE_DAILY_LIMIT, unlocked: true };
  }

  const { data: existing } = await admin
    .from('parties_libres')
    .select('count')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  const current = existing?.count ?? 0;
  if (current >= FREE_DAILY_LIMIT) {
    return { allowed: false, playsToday: current, limit: FREE_DAILY_LIMIT, unlocked: false };
  }

  const next = current + 1;
  await admin.from('parties_libres').upsert({ user_id: userId, date, count: next }, { onConflict: 'user_id,date' });

  return { allowed: true, playsToday: next, limit: FREE_DAILY_LIMIT, unlocked: false };
}

/** Débloque le Pass Podium (idempotent). */
export async function grantPodium(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('profiles')
    .update({ pass_podium: true, pass_podium_depuis: new Date().toISOString() })
    .eq('id', userId);
}
