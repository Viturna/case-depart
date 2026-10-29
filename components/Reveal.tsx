'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STAGGER_MS = 90;

// Ajoute .is-visible aux éléments [data-reveal] et [data-split="view"] quand ils
// entrent à l'écran. Ceux qui entrent ensemble apparaissent en cascade.
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Navigation interne : le preloader est déjà passé, on révèle le titre de la nouvelle page.
    if (document.documentElement.dataset.loaded) {
      document.querySelectorAll('[data-split="load"]').forEach((el) => el.classList.add('is-visible'));
    }
    const els = document.querySelectorAll('[data-reveal]:not(.is-visible), [data-split="view"]:not(.is-visible)');
    const io = new IntersectionObserver(
      (entries) => entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        const el = e.target as HTMLElement;
        if (el.hasAttribute('data-reveal')) el.style.transitionDelay = `${i * STAGGER_MS}ms`;
        el.classList.add('is-visible');
        io.unobserve(el);
      }),
      { rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
