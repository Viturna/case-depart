import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Politique de confidentialité — Case Départ' };

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Header />
      <main>
        <section className="container" style={{ maxWidth: '680px', padding: '160px 0 80px', margin: '0 auto' }}>
          <h1 className="title" style={{ marginBottom: '24px' }}>Politique de confidentialité</h1>
          <p style={{ marginBottom: '24px', opacity: 0.7 }}>Dernière mise à jour : 1 novembre 2026</p>

          <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Qui sommes-nous</h2>
          <p>
            Case Départ (Viturna) édite ce site et l&apos;application mobile associée. Pour toute question
            relative à vos données personnelles, contactez-nous à{' '}
            <a href="mailto:contact@viturna.fr">contact@viturna.fr</a>.
          </p>

          <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Données que nous collectons</h2>
          <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px', lineHeight: 1.8 }}>
            <li>Adresse e-mail et mot de passe (chiffré) lors de la création d&apos;un compte.</li>
            <li>Historique de vos commandes et de vos parties de jeu (scores, progression).</li>
            <li>Informations de paiement traitées directement par Stripe — nous ne stockons jamais vos coordonnées bancaires.</li>
          </ul>

          <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Hébergement et sous-traitants</h2>
          <p>
            Vos données de compte et de jeu sont hébergées par <strong>Supabase</strong>. Les paiements
            sont traités par <strong>Stripe</strong>. Aucune donnée n&apos;est transmise à des fins
            publicitaires et nous n&apos;utilisons aucun outil de tracking tiers.
          </p>

          <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Vos droits</h2>
          <p>
            Conformément au RGPD, vous pouvez à tout moment accéder à vos données, les corriger ou
            demander la suppression de votre compte depuis la page{' '}
            <a href="/compte">Mon compte</a>, ou en nous écrivant à{' '}
            <a href="mailto:contact@viturna.fr">contact@viturna.fr</a>.
          </p>

          <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Conservation des données</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas de suppression de
            compte, vos données personnelles sont effacées sous 30 jours, hors obligations légales
            de conservation (factures).
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
