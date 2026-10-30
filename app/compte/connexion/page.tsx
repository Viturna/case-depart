'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import styles from '@/components/AuthForm.module.css';
import { signInAction } from '../actions';

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/compte';
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError('');
    const result = await signInAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
    // Sinon, l'action redirige côté serveur.
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '64px 0 96px' }}>
        <div className={styles.wrap}>
          <h1 className="title">Se connecter</h1>

          {error && <p className={styles.error}>{error}</p>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <input type="hidden" name="next" value={next} />
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">E-mail</label>
              <input className={styles.input} id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Mot de passe</label>
              <input
                className={styles.input}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" disabled={pending} fullWidth>
              {pending ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <div className={styles.links}>
            <Link href="/compte/mot-de-passe-oublie">Mot de passe oublié ?</Link>
            <Link href="/compte/inscription">Créer un compte</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
