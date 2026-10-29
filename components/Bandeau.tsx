import React from 'react';
import styles from './Bandeau.module.css';

const defaultItems = ['Halloween', 'Noël', 'Saint-Valentin', 'Pâques', 'Día de los Muertos'];

// Marquee en boucle : la liste est doublée pour un défilement sans couture.
export default function Bandeau({ items = defaultItems }: { items?: string[] }) {
  const group = (hidden: boolean) => (
    <ul className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t} className={styles.item}>{t}<span className={styles.dot} aria-hidden="true">·</span></li>
      ))}
    </ul>
  );
  return (
    <div className={styles.marquee} role="region" aria-label="Thèmes des carnets">
      <div className={styles.track}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
