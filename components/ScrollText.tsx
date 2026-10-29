'use client';

import { useEffect, useRef } from 'react';
import styles from './ScrollText.module.css';

// Texte qui s'allume mot à mot au fil du scroll (0,2 → 1 d'opacité).
export default function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !document.documentElement.classList.contains('js-anim')) return;
    const words = Array.from(el.querySelectorAll('span'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle(styles.lit, i < lit));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <p ref={ref} className={styles.text}>
      {text.split(' ').map((w, i) => <span key={i}>{w} </span>)}
    </p>
  );
}
