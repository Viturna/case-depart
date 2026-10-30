'use client';

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="click"]';
const LERP = 0.38;
const IRIS_MAX_OFFSET = 2.2; // px de déplacement max de l'iris dans son globe

// Curseur personnalisé : un œil qui suit la souris, l'iris regarde dans la
// direction du mouvement, cligne de temps en temps, et s'ouvre en grand
// avec une bulle « Click » au-dessus de tout élément interactif.
export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.documentElement.classList.add('custom-cursor');

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;
    let visible = false;
    let blinkTimer: ReturnType<typeof setTimeout>;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        pos.x = target.x;
        pos.y = target.y;
        visible = true;
        rootRef.current?.style.setProperty('opacity', '1');
      }
    };

    const onOver = (e: MouseEvent) => {
      const interactive = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR);
      rootRef.current?.classList.toggle(styles.active, Boolean(interactive));
    };

    const onLeaveWindow = () => {
      visible = false;
      rootRef.current?.style.setProperty('opacity', '0');
    };

    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        rootRef.current?.classList.add(styles.blink);
        setTimeout(() => rootRef.current?.classList.remove(styles.blink), 110);
        scheduleBlink();
      }, 5000 + Math.random() * 7000);
    };

    const loop = () => {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      pos.x += dx * LERP;
      pos.y += dy * LERP;

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      if (irisRef.current) {
        // L'iris regarde dans la direction du mouvement, pas juste vers la cible :
        // plus naturel qu'un simple vecteur souris → curseur figé à l'arrêt.
        const speed = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 40);
        const angle = Math.atan2(dy, dx);
        const ox = Math.cos(angle) * IRIS_MAX_OFFSET * speed;
        const oy = Math.sin(angle) * IRIS_MAX_OFFSET * speed;
        irisRef.current.setAttribute('transform', `translate(${ox.toFixed(2)}, ${oy.toFixed(2)})`);
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeaveWindow);
    raf = requestAnimationFrame(loop);
    scheduleBlink();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeaveWindow);
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
      document.documentElement.classList.remove('custom-cursor');
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.cursor} style={{ opacity: 0 }} aria-hidden="true">
      <svg className={styles.eye} viewBox="0 0 40 26">
        <path className={styles.socket} d="M2 13 Q20 0 38 13 Q20 26 2 13 Z" />
        <g ref={irisRef}>
          <circle className={styles.iris} cx="20" cy="13" r="7" />
          <circle className={styles.pupil} cx="20" cy="13" r="2.4" />
        </g>
      </svg>
      <span className={styles.label}>Click</span>
    </div>
  );
}
