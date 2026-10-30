'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
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
      <main>
        <section className={`container ${styles.intro}`} aria-labelledby="oubli-titre">
          <Tag>Mon compte</Tag>
          <Split as="h1" id="oubli-titre" trigger="load" className={`title ${styles.h1}`} lines={['Mot de passe oublié']} />
        </section>

        <section className={`container ${styles.wrap}`}>
          <div className={styles.card}>
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
        </section>
      </main>
      <Footer />
    </>
  );
}
