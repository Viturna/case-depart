'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './ThemesCarousel.module.css';
import Cover from './Cover';

interface ThemeItem {
  nom: string;
  num: string;
  fen: string;
  tirage: string;
  statut: string;
  statutBrique?: boolean;
  nouveau?: boolean;
  slug: string;
}

const themesList: ThemeItem[] = [
  {
    nom: 'Noël',
    num: '02',
    fen: 'Mi-nov. → 24 déc.',
    tirage: 'Ton année à venir (12 prédictions)',
    statut: 'Disponible',
    statutBrique: false,
    nouveau: true,
    slug: 'carnet-noel',
  },
  {
    nom: 'Halloween',
    num: '01',
    fen: 'Fin sept. → 31 oct.',
    tirage: 'Ton destin de la nuit',
    statut: 'Derniers jours',
    statutBrique: true,
    nouveau: false,
    slug: 'carnet-halloween',
  },
  {
    nom: 'Saint-Valentin',
    num: '03',
    fen: 'Mi-janv. → 14 fév.',
    tirage: 'Compatibilité & duo',
    statut: 'Bientôt',
    statutBrique: false,
    nouveau: false,
    slug: 'carnet-saint-valentin',
  },
  {
    nom: 'Pâques',
    num: '04',
    fen: 'Mars → avril',
    tirage: 'Chasse au destin',
    statut: 'Bientôt',
    statutBrique: false,
    nouveau: false,
    slug: 'carnet-paques',
  },
  {
    nom: 'Fête de la musique',
    num: '05',
    fen: 'Fin mai → 21 juin',
    tirage: 'Quel instrument es-tu ?',
    statut: 'Bientôt',
    statutBrique: false,
    nouveau: false,
    slug: 'carnet-fete-musique',
  },
];

export default function ThemesCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const maxIndex = themesList.length - visibleCount;

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleThemes = themesList.slice(startIndex, startIndex + visibleCount);
  const rangeDisplay = `${startIndex + 1}–${startIndex + visibleCount} / ${themesList.length}`;

  return (
    <section className={styles.themesSection} aria-label="Les thèmes de carnets">
      <div className="section-tag">
        <span>02 / Les thèmes</span>
        <span>Un carnet par saison</span>
      </div>

      <div className={styles.headerRow}>
        <h2 className={styles.title}>Les thèmes</h2>
        <div className={styles.navControls}>
          <span className={styles.rangeText}>{rangeDisplay}</span>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={handlePrev}
            disabled={startIndex === 0}
            aria-label="Thèmes précédents"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={handleNext}
            disabled={startIndex >= maxIndex}
            aria-label="Thèmes suivants"
          >
            →
          </button>
        </div>
      </div>

      <div className={styles.carouselGrid}>
        {visibleThemes.map((theme) => (
          <Link
            key={theme.num}
            href={`/carnets/${theme.slug}`}
            className={styles.themeCard}
          >
            <div className={styles.themeMetaRow}>
              <span>Thème {theme.num}</span>
              <span>{theme.fen}</span>
            </div>

            <div className={styles.coverContainer}>
              <div style={{ width: '100%', maxWidth: '240px' }}>
                <Cover
                  themeTitle={theme.nom}
                  number={`N°${theme.num}`}
                  subtitle="Carnet thématique"
                  variant="sable"
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 className={styles.themeTitle}>{theme.nom}</h3>
                {theme.nouveau && <span className={styles.badgeNew}>NOUVEAU</span>}
              </div>
              <p className={styles.tirageText}>
                <strong>Tirage :</strong> {theme.tirage}
              </p>
            </div>

            <div className={styles.statusRow}>
              <span style={{ color: theme.statutBrique ? 'var(--brique)' : 'var(--sapin)' }}>
                {theme.statut}
              </span>
              <span>VOIR LE CARNET →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

