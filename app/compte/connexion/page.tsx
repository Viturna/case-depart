'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
import OAuthButtons from '../OAuthButtons';
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
      <main>
        <section className={`container ${styles.intro}`} aria-labelledby="connexion-titre">
          <Tag>Mon compte</Tag>
          <Split as="h1" id="connexion-titre" trigger="load" className={`title ${styles.h1}`} lines={['Se connecter']} />
        </section>

        <section className={`container ${styles.wrap}`}>
          <div className={styles.card}>
            <OAuthButtons next={next} />
            <div className={styles.divider}>ou par e-mail</div>

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
        </section>
      </main>
      <Footer />
    </>
  );
}
