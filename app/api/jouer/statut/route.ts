import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPodiumStatus } from '@/lib/podium';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }
  const status = await getPodiumStatus(user.id);
  return NextResponse.json(status);
}
