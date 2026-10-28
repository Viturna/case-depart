import React from 'react';
import styles from './Bandeau.module.css';

interface BandeauProps {
  items?: string[];
}

const defaultItems = [
  'NOUVEAU CARNET DE NOËL DISPONIBLE',
  '30 GRILLES + 1 ARRIVÉE',
  'TÉLÉCHARGEMENT IMMÉDIAT EN PDF',
  'FORMATS A4 ET A5 LIVRET INCLUS',
  'LE STARTER EST 100% OFFERT',
  'CHRONO ET CLASSEMENTS EN LIGNE',
  'IMPRESSION NOIR & BLANC OPTIMISÉE',
];

export default function Bandeau({ items = defaultItems }: BandeauProps) {
  return (
    <div className={styles.bandeau} role="region" aria-label="Annonces et actualités">
      <div className={styles.track}>
        {/* Doubled for seamless loop */}
        <div className={styles.itemGroup}>
          {items.map((text, idx) => (
            <React.Fragment key={`b1-${idx}`}>
              <span className={styles.item}>{text}</span>
              <span className={styles.separator} aria-hidden="true">/</span>
            </React.Fragment>
          ))}
        </div>
        <div className={styles.itemGroup} aria-hidden="true">
          {items.map((text, idx) => (
            <React.Fragment key={`b2-${idx}`}>
              <span className={styles.item}>{text}</span>
              <span className={styles.separator}>/</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

