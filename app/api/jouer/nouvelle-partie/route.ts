import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tryStartFreeGame } from '@/lib/podium';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const result = await tryStartFreeGame(user.id);
  return NextResponse.json(result);
}
