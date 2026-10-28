'use client';

import React from 'react';
import Link from 'next/link';
import styles from './HeroParallax.module.css';
import Button from './Button';
import Cover from './Cover';
import Badge from './Badge';
import { useParallax } from '@/hooks/useParallax';

export default function HeroParallax() {
  const { scrollY, reducedMotion } = useParallax();

  // Multi-layer parallax translations
  const gridOffset = reducedMotion ? 0 : scrollY * 0.04;
  const halloweenOffset = reducedMotion ? 0 : scrollY * -0.14;
  const noelOffset = reducedMotion ? 0 : scrollY * -0.07;
  const badgeOffset = reducedMotion ? 0 : scrollY * -0.22;

  return (
    <section className={styles.heroSection} aria-label="Ligne de départ">
      {/* Colonne gauche éditoriale */}
      <div className={styles.leftCol}>
        <div className={styles.metaRow}>
          <span>00 / Ligne de départ</span>
          <span>Réf. CD-2026</span>
        </div>

        <div className={styles.titleArea}>
          <h1 className={styles.heroH1}>
            Le sudoku prend un <span className={styles.highlight}>nouveau</span> départ
          </h1>
          <p className={styles.description}>
            Des carnets de sudoku modernes, en PDF à imprimer. Et un chrono en ligne pour voir qui passe la ligne d’arrivée en premier.
          </p>
        </div>

        <div className={styles.ctaRow}>
          <Button size="md" variant="primary" href="/carnets">
            VOIR LES CARNETS →
          </Button>
          <Button size="md" variant="secondary" href="/jouer">
            JOUER EN LIGNE
          </Button>
        </div>
      </div>

      {/* Colonne droite visuelle avec parallax en 4 calques */}
      <div className={styles.rightCol}>
        {/* Calque 0 : Fond grille 3x3 */}
        <div
          className={styles.gridBackdrop}
          aria-hidden="true"
          style={{ transform: `translateY(${gridOffset}px)` }}
        >
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
          <div className={styles.gridCell}></div>
        </div>

        {/* Calque 1 : Carnet d'Halloween (-5 deg) */}
        <div
          className={styles.layerHalloween}
          style={{
            transform: `translateY(${halloweenOffset}px) rotate(-5deg)`,
          }}
        >
          <Link href="/carnets/carnet-halloween">
            <Cover
              themeTitle="Halloween"
              number="01"
              subtitle="30 grilles · A4"
              variant="sable"
              numbers={[3, '', 7, '', 5, '', 9, '', 2]}
            />
          </Link>
        </div>

        {/* Calque 2 : Carnet de Noël (+3 deg) */}
        <div
          className={styles.layerNoel}
          style={{
            transform: `translateY(${noelOffset}px) rotate(3deg)`,
          }}
        >
          <Link href="/carnets/carnet-noel">
            <Cover
              themeTitle="Noël"
              number="02"
              subtitle="30 grilles · A4 / A5"
              variant="sable"
              numbers={['', 4, '', 2, '', 8, '', 1, '']}
            />
          </Link>
        </div>

        {/* Calque 3 : Badge rond rose flottant (+10 deg) */}
        <div
          className={styles.layerBadge}
          style={{
            transform: `translateY(${badgeOffset}px) rotate(10deg)`,
          }}
        >
          <Badge size="lg" rotation={10}>
            NOUVEAU<br />CARNET<br />NOËL
          </Badge>
        </div>

        {/* Calque 4 : Légende technique */}
        <span className={styles.legendTechnical}>
          FIG. 01 — CARNETS EN SITUATION
        </span>
      </div>
    </section>
  );
}

