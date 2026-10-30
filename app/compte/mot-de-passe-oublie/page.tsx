'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import styles from '@/components/AuthForm.module.css';
import { requestPasswordResetAction } from '../actions';

export default function MotDePasseOubliePage() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const result = await requestPasswordResetAction(new FormData(e.currentTarget));
    if (result?.success) setSuccess(result.success);
    setPending(false);
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '64px 0 96px' }}>
        <div className={styles.wrap}>
          <h1 className="title">Mot de passe oublié</h1>

          {success ? (
            <p className={styles.success}>{success}</p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">E-mail</label>
                <input className={styles.input} id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <Button type="submit" disabled={pending} fullWidth>
                {pending ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
              </Button>
            </form>
          )}

          <div className={styles.links}>
            <Link href="/compte/connexion">Retour à la connexion</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
