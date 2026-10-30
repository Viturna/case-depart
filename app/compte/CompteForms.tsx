'use client';

import React, { useState } from 'react';
import styles from '@/components/AuthForm.module.css';
import Button from '@/components/Button';
import { updateProfileAction, changePasswordAction, deleteAccountAction, signOutAction } from './actions';

export function ProfileForm({ nom }: { nom: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await updateProfileAction(new FormData(e.currentTarget));
    if (result?.error) setMessage({ type: 'error', text: result.error });
    if (result?.success) setMessage({ type: 'success', text: result.success });
    setPending(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {message && <p className={message.type === 'error' ? styles.error : styles.success}>{message.text}</p>}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="nom">Nom</label>
        <input className={styles.input} id="nom" name="nom" type="text" defaultValue={nom} autoComplete="name" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Enregistrement…' : 'Enregistrer le profil'}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await changePasswordAction(new FormData(e.currentTarget));
    if (result?.error) setMessage({ type: 'error', text: result.error });
    if (result?.success) {
      setMessage({ type: 'success', text: result.success });
      formRef.current?.reset();
    }
    setPending(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} ref={formRef}>
      {message && <p className={message.type === 'error' ? styles.error : styles.success}>{message.text}</p>}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="currentPassword">Mot de passe actuel</label>
        <input className={styles.input} id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="newPassword">Nouveau mot de passe</label>
        <input className={styles.input} id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmation">Confirme le nouveau mot de passe</label>
        <input className={styles.input} id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Modification…' : 'Modifier le mot de passe'}
      </Button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError('');
    const result = await deleteAccountAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <div className={styles.dangerZone}>
      <p className={styles.dangerTitle}>Supprimer mon compte</p>
      <p className={styles.hint}>Action définitive et irréversible. Tes commandes passées restent conservées.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Mot de passe</label>
          <input className={styles.input} id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmation">Tape SUPPRIMER pour confirmer</label>
          <input className={styles.input} id="confirmation" name="confirmation" type="text" required />
        </div>
        <Button type="submit" variant="dark" disabled={pending}>
          {pending ? 'Suppression…' : 'Supprimer définitivement mon compte'}
        </Button>
      </form>
    </div>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary" size="sm">Se déconnecter</Button>
    </form>
  );
}
