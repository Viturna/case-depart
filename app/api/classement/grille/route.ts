import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startDailyAttempt } from '@/lib/classement';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }

  const { puzzle, bestSeconds } = await startDailyAttempt(user.id);
  return NextResponse.json({ puzzle, bestSeconds });
}
