'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Bandeau from '@/components/Bandeau';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Card, { ProductItem } from '@/components/Card';
import Cover from '@/components/Cover';
import productsData from '@/data/products.json';
import styles from './page.module.css';

const themeOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Noël', value: 'noel' },
  { label: 'Halloween', value: 'halloween' },
  { label: 'Saint-Valentin', value: 'saint-valentin' },
  { label: 'Pâques', value: 'paques' },
  { label: 'Fête de la musique', value: 'fete-musique' },
  { label: 'Multi-thème', value: 'multi' },
];

const levelOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Échauffement ›', value: 'echauffement' },
  { label: 'Sprint ››', value: 'sprint' },
  { label: 'Marathon ›››', value: 'marathon' },
];

const quizQuestions = [
  {
    letter: 'A',
    text: 'Je découvre les sudokus, sois gentil pour démarrer.',
    levelTitle: 'ALLURE CONSEILLÉE : ÉCHAUFFEMENT ›',
    levelDesc: 'Tu démarres en douceur. Des déductions directes et des règles claires pour prendre le rythme sans te prendre la tête.',
    recommendedSlug: 'etape-noel',
  },
  {
    letter: 'B',
    text: 'J’en fais de temps en temps dans le train ou le dimanche matin.',
    levelTitle: 'ALLURE CONSEILLÉE : SPRINT ››',
    levelDesc: 'Tu connais déjà la piste. Passe à l’allure Sprint : le crayon chauffe et la gomme commence à travailler.',
    recommendedSlug: 'carnet-noel',
  },
  {
    letter: 'C',
    text: 'Je finis toutes les grilles du journal. Directement au stylo bille.',
    levelTitle: 'ALLURE CONSEILLÉE : MARATHON ›››',
    levelDesc: 'Aucun respect pour la gomme. Le Marathon t’attend avec des grilles sans concession et des chronos à faire trembler le podium.',
    recommendedSlug: 'carnet-noel',
  },
];

export default function CataloguePage() {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSort, setSelectedSort] = useState('saison');
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

  const allProducts = productsData as ProductItem[];

  // Filtered products (excluding bundle from main grid if bundle is shown separately)
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => p.slug !== 'la-collection');

    if (selectedTheme !== 'all') {
      result = result.filter((p) => p.theme === selectedTheme);
    }

    if (selectedLevel !== 'all') {
      result = result.filter(
        (p) => p.niveau === selectedLevel || p.niveau === 'all'
      );
    }

    if (selectedSort === 'prix-asc') {
      result = [...result].sort((a, b) => a.prix - b.prix);
    } else if (selectedSort === 'prix-desc') {
      result = [...result].sort((a, b) => b.prix - a.prix);
    }

    return result;
  }, [allProducts, selectedTheme, selectedLevel, selectedSort]);

  const collectionProduct = allProducts.find((p) => p.slug === 'la-collection')!;

  const handleResetFilters = () => {
    setSelectedTheme('all');
    setSelectedLevel('all');
    setSelectedSort('saison');
  };

  return (
    <div className={styles.catalogueContainer}>
      <Bandeau />
      <Header />

      <main className="site-container">
        {/* EN-TÊTE ILLUSTRÉ */}
        <section className={styles.headerSection} aria-label="En-tête catalogue">
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumbRow}>
              <span>Accueil / Carnets</span>
              <span>Catalogue 2026</span>
            </div>

            <div className={styles.titleArea}>
              <h1 className={styles.catalogueH1}>Les carnets</h1>
              <p className={styles.headerDesc}>
                Un thème, trois allures, des grilles à imprimer chez toi. Et un chrono en ligne pour mesurer ton temps contre la communauté.
              </p>
            </div>

            <div className="m">
              {allProducts.length - 1} CARNETS DISPONIBLES OU EN PRÉPARATION
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.mockupFan}>
              <div style={{ position: 'absolute', left: 0, top: '20px', width: '180px', transform: 'rotate(-8deg)', zIndex: 1 }}>
                <Cover themeTitle="Halloween" number="01" subtitle="30 grilles" variant="sable" />
              </div>
              <div style={{ position: 'absolute', left: '60px', top: '10px', width: '180px', transform: 'rotate(2deg)', zIndex: 2 }}>
                <Cover themeTitle="Noël" number="02" subtitle="30 grilles" variant="sable" />
              </div>
              <div style={{ position: 'absolute', left: '110px', top: '30px', width: '180px', transform: 'rotate(10deg)', zIndex: 3 }}>
                <Cover themeTitle="Multi" number="06" subtitle="Tour année" variant="sable" />
              </div>
            </div>
          </div>
        </section>

        {/* FILTRES STICKY */}
        <div className={styles.filterBar} role="search" aria-label="Filtres de recherche">
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Thème :</span>
            {themeOptions.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.chip} ${selectedTheme === t.value ? styles.chipActive : ''}`}
                onClick={() => setSelectedTheme(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Niveau :</span>
              {levelOptions.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  className={`${styles.chip} ${selectedLevel === n.value ? styles.chipActive : ''}`}
                  onClick={() => setSelectedLevel(n.value)}
                >
                  {n.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="sort-select" className={styles.filterLabel}>
                Tri :
              </label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="saison">Saison en cours</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRILLE DES PRODUITS */}
        <section className={styles.productsSection} aria-label="Liste des carnets">
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>FAUX DÉPART.</h2>
              <p className={styles.emptyDesc}>
                Aucun carnet ne correspond à ces critères. Change tes filtres pour retrouver la ligne de course !
              </p>
              <Button size="md" variant="primary" onClick={handleResetFilters}>
                RÉINITIALISER LES FILTRES
              </Button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <div key={product.slug} className={styles.productCell}>
                  <Card
                    product={product}
                    coverVariant={product.slug === 'carnet-noel' ? 'sable' : 'sable'}
                    coverNumber={product.theme === 'noel' ? '02' : product.theme === 'halloween' ? '01' : '0X'}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 01 / BANNIÈRE BUNDLE LA COLLECTION */}
        <section className={styles.bundleSection} aria-label="La Collection intégrale">
          <div style={{ flex: '1 1 100%' }} className="section-tag section-tag-dark">
            <span>01 / Bundle 6 carnets</span>
            <span>La Collection intégrale</span>
          </div>

          <div className={styles.bundleVisual}>
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 3 }}>
              <Badge size="md" rotation={-4}>
                ÉCONOMISE<br />14,50 €
              </Badge>
            </div>
            <div style={{ width: '100%', maxWidth: '240px' }}>
              <Cover
                themeTitle="La Collection"
                number="INTÉGRAL"
                subtitle="180 grilles"
                variant="sable"
              />
            </div>
          </div>

          <div className={styles.bundleInfo}>
            <span className="m" style={{ color: 'var(--sable)' }}>PACK INTÉGRAL 6 CARNETS</span>
            <h2 className="h" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}>
              LA COLLECTION COMPLÈTE
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, color: 'var(--sable)', margin: 0, maxWidth: '520px' }}>
              Les 5 carnets thématiques + le carnet Tour de l’année. 180 grilles exclusives, tous les ravitaillements et l’accès anticipé à chaque sortie.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span className={styles.bundlePriceOld}>{collectionProduct.prixBarre}</span>
              <span className={styles.bundlePriceNew}>{collectionProduct.prixAffiche}</span>
            </div>
            <div>
              <Button size="lg" variant="primary" href={`/carnets/${collectionProduct.slug}`}>
                JE PRENDS TOUT →
              </Button>
            </div>
          </div>
        </section>

        {/* 02 / MINI-QUIZ « TROUVE TON NIVEAU » */}
        <section className={styles.quizSection} aria-label="Mini-quiz d'orientation">
          <div className="section-tag">
            <span>02 / Mini-quiz</span>
            <span>10 secondes chrono</span>
          </div>

          <div className={styles.quizWrap}>
            <div className={styles.quizLeft}>
              <h2 className="h" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}>
                Trouve ton niveau
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
                Une question, une réponse honnête. On te dit par où attaquer la course pour ne ni t’ennuyer ni jeter ton carnet par la fenêtre.
              </p>
            </div>

            <div className={styles.quizRight}>
              {quizQuestions.map((q, idx) => (
                <button
                  key={q.letter}
                  type="button"
                  className={`${styles.quizOption} ${selectedQuiz === idx ? styles.quizOptionSelected : ''}`}
                  onClick={() => setSelectedQuiz(idx)}
                >
                  <span className={styles.quizLetter}>{q.letter}.</span>
                  <span className={styles.quizText}>{q.text}</span>
                </button>
              ))}

              {selectedQuiz !== null && (
                <div className={styles.quizResultBox} role="region" aria-live="polite">
                  <h3 className={styles.quizResultTitle}>
                    {quizQuestions[selectedQuiz].levelTitle}
                  </h3>
                  <p className={styles.quizResultDesc}>
                    {quizQuestions[selectedQuiz].levelDesc}
                  </p>
                  <div>
                    <Button
                      size="sm"
                      variant="primary"
                      href={`/carnets/${quizQuestions[selectedQuiz].recommendedSlug}`}
                    >
                      DÉCOUVRIR LE CARNET CONSEILLÉ →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

