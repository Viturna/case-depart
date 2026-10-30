'use client';

import React, { useEffect, useRef } from 'react';
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

// Rayon d'influence de la souris sur les lettres du mot-clé, en pixels.
const WAVE_RADIUS = 160;
// Vitesse à laquelle chaque lettre rattrape son intensité cible : une
// boucle continue + ce ressort donnent une vague fluide qui traîne derrière
// le curseur, plutôt qu'un calcul instantané collé au rythme de mousemove.
const SPRING = 0.16;

export default function Footer() {
  const fitRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const waves = useRef(new WeakMap<HTMLElement, number>());

  useEffect(() => {
    let raf: number;
    const loop = () => {
      const chars = fitRef.current?.querySelectorAll<HTMLElement>('.split-char');
      chars?.forEach((char) => {
        const rect = char.getBoundingClientRect();
        const dx = mouse.current.x - (rect.left + rect.width / 2);
        const dy = mouse.current.y - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, 1 - dist / WAVE_RADIUS);
        const target = t * t * (3 - 2 * t); // smoothstep : courbe plus naturelle qu'un dégradé linéaire
        const current = waves.current.get(char) ?? 0;
        const next = current + (target - current) * SPRING;
        waves.current.set(char, next);
        char.style.setProperty('--wave', String(next));
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleLeave = () => {
    mouse.current = { x: -9999, y: -9999 };
  };

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
        <div ref={fitRef} className={styles.fit} aria-hidden="true" onMouseMove={handleMove} onMouseLeave={handleLeave}>
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
