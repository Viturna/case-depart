'use client';

import React, { useEffect, useState } from 'react';
import Button from './Button';
import { createClient } from '@/lib/supabase/client';

export default function PodiumBuyButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setLoggedIn(Boolean(user)));
  }, []);

  if (loggedIn === null) return null;

  // shortcut: Apple/Google exigent leur propre paiement in-app pour du contenu digital.
  // On masque l'achat dans l'app native et on renvoie vers le site web.
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
    return <p>Débloque le Pass Podium sur <a href="https://case-depart.viturna.fr/jouer#podium">case-depart.viturna.fr</a>.</p>;
  }

  if (!loggedIn) {
    return <Button href="/compte/connexion?next=/jouer%23classement" size="lg" variant="dark">Se connecter pour débloquer</Button>;
  }

  const buy = async () => {
    setBuying(true);
    const res = await fetch('/api/podium/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setBuying(false);
  };

  return (
    <Button size="lg" variant="dark" onClick={buy} disabled={buying}>
      {buying ? 'Redirection…' : 'Débloquer le Pass Podium — 4,99 €'}
    </Button>
  );
}
