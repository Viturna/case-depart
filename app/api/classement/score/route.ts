import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitDailyScore } from '@/lib/classement';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }

  const { grid, errors } = (await req.json()) as { grid?: number[]; errors?: number };
  const result = await submitDailyScore(user.id, grid || [], Number(errors) || 0);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
