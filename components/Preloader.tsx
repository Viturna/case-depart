'use client';

import { useEffect, useState } from 'react';
import styles from './Preloader.module.css';

const DURATION = 1100;

// Compteur 000 → 100 au premier chargement de la session, puis le rideau monte
// et le titre [data-split="load"] se révèle.
export default function Preloader() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const revealTitle = () => {
      html.dataset.loaded = '1'; // lu par Reveal pour les pages suivantes
      document.querySelectorAll('[data-split="load"]').forEach((el) => el.classList.add('is-visible'));
    };

    if (!html.classList.contains('js-anim') || html.classList.contains('no-pre')) {
      const t = setTimeout(revealTitle, 80);
      return () => clearTimeout(t);
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setN(Math.round(p * 100));
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      setDone(true);
      revealTitle();
      try { sessionStorage.setItem('cd-pre', '1'); } catch {}
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`${styles.pre} ${done ? styles.done : ''}`} aria-hidden="true">
      <span className="label">Case Départ</span>
      <span className={styles.count}>{String(n).padStart(3, '0')}</span>
    </div>
  );
}
