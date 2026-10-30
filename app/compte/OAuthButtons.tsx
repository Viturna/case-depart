'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '@/components/AuthForm.module.css';

export default function OAuthButtons({ next }: { next?: string }) {
  const [pending, setPending] = useState<'google' | 'apple' | null>(null);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setPending(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/compte')}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) {
      setPending(null);
    }
    // En cas de succès, le navigateur est redirigé vers le fournisseur.
  };

  return (
    <div className={styles.oauthGroup}>
      <button type="button" className={styles.oauthButton} onClick={() => handleOAuth('google')} disabled={pending !== null}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.08-1.81 2.72v2.26h2.92c1.71-1.57 2.69-3.89 2.69-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.87-3.04.87-2.34 0-4.33-1.58-5.04-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z" />
          <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.28-1.72V4.95H.96A8.97 8.97 0 000 9c0 1.45.35 2.82.96 4.05l3-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" />
        </svg>
        {pending === 'google' ? 'Redirection…' : 'Continuer avec Google'}
      </button>
      <button type="button" className={styles.oauthButton} onClick={() => handleOAuth('apple')} disabled={pending !== null}>
        <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" fill="currentColor">
          <path d="M13.2 9.56c-.02-2.02 1.65-2.98 1.72-3.03-.94-1.37-2.4-1.56-2.92-1.58-1.26-.13-2.46.74-3.1.74-.65 0-1.66-.72-2.72-.7-1.4.02-2.7.82-3.41 2.06-1.46 2.52-.37 6.27 1.03 8.32.68.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.67 2.67-.67 1.24 0 1.6.67 2.68.65 1.1-.02 1.82-1 2.5-1.99.78-1.14 1.1-2.25 1.12-2.3-.02-.01-2.14-.82-2.14-3.56zM10.9 3.4c.55-.68.93-1.62.83-2.56-.8.03-1.77.54-2.34 1.21-.5.6-.95 1.57-.83 2.49.9.07 1.8-.46 2.34-1.14z" />
        </svg>
        {pending === 'apple' ? 'Redirection…' : 'Continuer avec Apple'}
      </button>
    </div>
  );
}
