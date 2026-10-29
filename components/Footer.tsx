import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import Split from './Split';

const cols = [
  {
    title: 'Carnets',
    links: [
      { label: 'Tous les carnets', href: '/carnets' },
      { label: 'Carnet de Noël', href: '/carnets/carnet-noel' },
      { label: "Carnet d'Halloween", href: '/carnets/carnet-halloween' },
      { label: 'La Collection', href: '/carnets/la-collection' },
    ],
  },
  {
    title: 'Jouer',
    links: [
      { label: 'Grille du jour', href: '/jouer' },
      { label: 'Pass Podium', href: '/jouer#podium' },
      { label: 'Les 3 niveaux', href: '/#niveaux' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'Questions fréquentes', href: '/#faq' },
      { label: 'Styleguide', href: '/styleguide' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.col}>
          <p className="label muted">Infos pratiques</p>
          <p>PDF envoyé par e-mail juste après le paiement.</p>
          <p>Impression A4 ou A5 livret, noir et blanc OK.</p>
          <p>
            Une question ? <a className={styles.mail} href="mailto:contact@viturna.fr">contact@viturna.fr</a>
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} className={styles.col} aria-label={c.title}>
            <p className="label muted">{c.title}</p>
            <ul className={styles.list}>
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container">
        <div className={styles.fit} aria-hidden="true">
          <Split className={styles.wordmark} lines={['Case Départ']} />
        </div>
        <div className={`label ${styles.bottom}`}>
          <span>© 2026 Case Départ</span>
          <span>Échauffement · Sprint · Marathon</span>
        </div>
      </div>
    </footer>
  );
}
