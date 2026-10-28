'use client';

import { useState, useEffect } from 'react';

export function useParallax() {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    if (mediaQuery.matches) {
      return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    }

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return {
    scrollY: reducedMotion ? 0 : scrollY,
    reducedMotion,
  };
}

