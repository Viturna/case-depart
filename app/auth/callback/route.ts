import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Point d'arrivée des liens envoyés par e-mail (confirmation de compte,
 * réinitialisation de mot de passe). Échange le code contre une session
 * puis redirige vers la page demandée (jamais une URL externe).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/compte';
  const safeNext = next.startsWith('/') ? next : '/compte';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/compte/connexion?erreur=lien_invalide`);
}
