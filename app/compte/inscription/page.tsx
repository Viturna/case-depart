'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import styles from '@/components/AuthForm.module.css';
import { signUpAction } from '../actions';

export default function InscriptionPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError('');
    setSuccess('');
    const result = await signUpAction(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    if (result?.success) setSuccess(result.success);
    setPending(false);
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '64px 0 96px' }}>
        <div className={styles.wrap}>
          <h1 className="title">Créer un compte</h1>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          {!success && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="nom">Nom</label>
                <input className={styles.input} id="nom" name="nom" type="text" autoComplete="name" />
              </div>
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
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <span className={styles.hint}>8 caractères minimum.</span>
              </div>
              <Button type="submit" disabled={pending} fullWidth>
                {pending ? 'Création…' : 'Créer mon compte'}
              </Button>
            </form>
          )}

          <div className={styles.links}>
            <Link href="/compte/connexion">Déjà un compte ? Se connecter</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
