import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDailyLeaderboard } from '@/lib/classement';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const leaderboard = await getDailyLeaderboard(user?.id || null);
  return NextResponse.json({ leaderboard });
}
