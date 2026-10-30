'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
import styles from '@/components/AuthForm.module.css';
import { updatePasswordAfterResetAction } from '../actions';

export default function ReinitialiserPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError('');
    const result = await updatePasswordAfterResetAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className={`container ${styles.intro}`} aria-labelledby="reinit-titre">
          <Tag>Mon compte</Tag>
          <Split as="h1" id="reinit-titre" trigger="load" className={`title ${styles.h1}`} lines={['Nouveau mot de passe']} />
        </section>

        <section className={`container ${styles.wrap}`}>
          <div className={styles.card}>
            {error && <p className={styles.error}>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">Nouveau mot de passe</label>
                <input
                  className={styles.input}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmation">Confirme le mot de passe</label>
                <input
                  className={styles.input}
                  id="confirmation"
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" disabled={pending} fullWidth>
                {pending ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
