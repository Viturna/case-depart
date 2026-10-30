import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PODIUM_PRICE_ID = 'price_1UWFEwPbCy5yliSsIbsAS8AU';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Clé Stripe non configurée' }, { status: 500 });
  }

  const origin = req.headers.get('origin') || 'http://localhost:3000';

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('customer_email', user.email);
  params.append('success_url', `${origin}/jouer?podium=success&session_id={CHECKOUT_SESSION_ID}#classement`);
  params.append('cancel_url', `${origin}/jouer?podium=cancel#classement`);
  params.append('line_items[0][price]', PODIUM_PRICE_ID);
  params.append('line_items[0][quantity]', '1');
  params.append('metadata[kind]', 'podium');
  params.append('metadata[user_id]', user.id);

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await stripeRes.json();

  if (!stripeRes.ok) {
    return NextResponse.json({ error: data.error?.message || 'Erreur Stripe' }, { status: stripeRes.status });
  }
  return NextResponse.json({ url: data.url });
}
