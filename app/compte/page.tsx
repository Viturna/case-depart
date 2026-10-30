import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
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
      <main>
        <section className={`container ${styles.intro}`} aria-labelledby="compte-titre">
          <Tag>Mon compte</Tag>
          <div className={styles.accountHead}>
            <Split as="h1" id="compte-titre" trigger="load" className={`title ${styles.h1}`} lines={['Bonjour']} />
            <SignOutButton />
          </div>
          <p className={styles.email}>{user!.email}</p>
        </section>

        <section className={`container ${styles.wrap}`} style={{ maxWidth: '560px' }}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profil</h2>
            <div className={styles.card}>
              <ProfileForm nom={profile?.nom || ''} />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Mot de passe</h2>
            <div className={styles.card}>
              <ChangePasswordForm />
            </div>
          </div>

          <DeleteAccountForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
