import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
import { createClient } from '@/lib/supabase/server';
import { getOrdersForEmail } from '@/lib/carnetDelivery';
import { ProfileForm, ChangePasswordForm, DeleteAccountForm, SignOutButton } from './CompteForms';
import styles from '@/components/AuthForm.module.css';

export const metadata = { title: 'Mon compte — Case Départ' };

function formatPrice(cents: number | null) {
  if (cents == null) return '—';
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUT_LABEL: Record<string, string> = {
  livree: 'Livrée',
  recue: 'En préparation',
  erreur: 'Erreur',
};

export default async function ComptePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Le middleware protège déjà cette route ; user est garanti ici.
  const { data: profile } = await supabase
    .from('profiles')
    .select('nom')
    .eq('id', user!.id)
    .single();

  const orders = await getOrdersForEmail(user!.email!);

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
            <h2 className={styles.sectionTitle}>Mes commandes</h2>
            {orders.length === 0 ? (
              <p className={styles.hint}>Aucune commande pour l&apos;instant. <a href="/carnets">Voir les carnets</a>.</p>
            ) : (
              <ul className={styles.orderList}>
                {orders.map((order) => (
                  <li key={order.id} className={styles.orderItem}>
                    <div>
                      <p className={styles.orderTitle}>
                        {order.carnetLabel} — {order.format}
                        {order.gift ? ' · Cadeau' : ''}
                      </p>
                      <p className={styles.hint}>
                        {formatDate(order.createdAt)} · {formatPrice(order.montantCents)} · {STATUT_LABEL[order.statut] || order.statut}
                      </p>
                    </div>
                    {order.downloadUrl ? (
                      <a className={styles.orderDownload} href={order.downloadUrl}>Télécharger</a>
                    ) : (
                      <span className={styles.hint}>Pas encore livrée</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

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
