import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm, ChangePasswordForm, DeleteAccountForm, SignOutButton } from './CompteForms';
import styles from '@/components/AuthForm.module.css';

export const metadata = { title: 'Mon compte — Case Départ' };

export default async function ComptePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Le middleware protège déjà cette route ; user est garanti ici.
  const { data: profile } = await supabase
    .from('profiles')
    .select('nom')
    .eq('id', user!.id)
    .single();

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '64px 0 96px' }}>
        <div className={styles.wrap}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px' }}>
            <h1 className="title">Mon compte</h1>
            <SignOutButton />
          </div>

          <p className={styles.hint} style={{ marginTop: '12px' }}>{user!.email}</p>

          <h2 style={{ marginTop: '40px' }} className="title">Profil</h2>
          <ProfileForm nom={profile?.nom || ''} />

          <h2 style={{ marginTop: '40px' }} className="title">Mot de passe</h2>
          <ChangePasswordForm />

          <DeleteAccountForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
