import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { grantPodium } from '@/lib/podium';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id requis' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Clé Stripe non configurée' }, { status: 500 });
  }

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const session = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: session.error?.message || 'Erreur Stripe' }, { status: res.status });
  }

  // La session doit appartenir au compte qui consulte (jamais confiance dans un id rejoué par un autre compte).
  if (session.metadata?.kind !== 'podium' || session.metadata?.user_id !== user.id) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 403 });
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ unlocked: false });
  }

  await grantPodium(user.id);
  return NextResponse.json({ unlocked: true });
}
