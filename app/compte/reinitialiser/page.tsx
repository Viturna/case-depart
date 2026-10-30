'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
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
      <main className="container" style={{ padding: '64px 0 96px' }}>
        <div className={styles.wrap}>
          <h1 className="title">Nouveau mot de passe</h1>

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
      </main>
      <Footer />
    </>
  );
}
