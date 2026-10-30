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
