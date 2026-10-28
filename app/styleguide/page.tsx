'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Bandeau from '@/components/Bandeau';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import LevelBadge from '@/components/LevelBadge';
import SudokuMotif from '@/components/SudokuMotif';
import Cover from '@/components/Cover';
import Card, { ProductItem } from '@/components/Card';
import Accordion from '@/components/Accordion';
import productsData from '@/data/products.json';
import styles from './page.module.css';

const sampleFaq = [
  {
    question: 'Comment fonctionnent les carnets PDF à imprimer ?',
    answer: 'Dès la validation de ta commande, tu reçois un lien de téléchargement direct avec deux fichiers optimisés : un format A4 (feuille par feuille) et un format A5 livret (à plier en deux au centre). Imprimables en noir et blanc sans perte de lisibilité.',
  },
  {
    question: 'Quelle est la différence entre les 3 allures ?',
    answer: 'Échauffement › permet de délier les crayons avec des techniques simples (candidat unique). Sprint ›› demande des alignements et paires nues. Marathon ››› teste ton endurance mentale avec des chaînes de déduction avancées sans devinette.',
  },
  {
    question: 'Le mode de jeu en ligne est-il inclus avec chaque carnet ?',
    answer: 'Oui ! Chaque carnet physique ou numérique contient un code d’accès pour rejouer les grilles sur le chronomètre officiel de Case Départ et enregistrer ton temps au classement.',
  },
];

export default function StyleguidePage() {
  const featuredProduct = productsData.find((p) => p.slug === 'carnet-noel') as ProductItem;
  const bundleProduct = productsData.find((p) => p.slug === 'la-collection') as ProductItem;
  const bientotProduct = productsData.find((p) => p.slug === 'carnet-saint-valentin') as ProductItem;

  return (
    <div className={styles.styleguideContainer}>
      <Bandeau />
      <Header cartCount={1} />

      <main className="site-container">
        {/* Intro */}
        <section className={styles.introBlock}>
          <p className={styles.subTitle}>PHASE 1 — SYSTÈME DE DESIGN & COMPOSANTS</p>
          <h1 className={styles.mainTitle}>RÉFÉRENTIEL CASE DÉPART</h1>
          <p className={styles.introText}>
            Vérification de l’ensemble des tokens, de la typographie, des formes à rayon 0, des filets 1px
            et des composants réutilisables selon la direction artistique <strong>DESIGN.md</strong> (Minimalisme industriel).
          </p>
        </section>

        {/* 00 / PALETTE STRICTE */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>00 / Palette stricte</span>
            <span>4 couleurs · Aucune autre</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.colorsGrid}>
              {/* Sable */}
              <div className={styles.colorCard} style={{ backgroundColor: 'var(--sable)', color: 'var(--sapin)' }}>
                <span className={styles.colorHex}>#EFDEC2</span>
                <div className={styles.colorMeta}>
                  <span className={styles.colorToken}>--sable</span>
                  <span className={styles.colorUsage}>Fond principal, texte sur sapin/brique</span>
                </div>
              </div>

              {/* Sapin */}
              <div className={styles.colorCard} style={{ backgroundColor: 'var(--sapin)', color: 'var(--sable)' }}>
                <span className={styles.colorHex}>#315A54</span>
                <div className={styles.colorMeta}>
                  <span className={styles.colorToken}>--sapin</span>
                  <span className={styles.colorUsage}>Texte, filets, header, footer, dark sections</span>
                </div>
              </div>

              {/* Brique */}
              <div className={styles.colorCard} style={{ backgroundColor: 'var(--brique)', color: 'var(--sable)' }}>
                <span className={styles.colorHex}>#9F1014</span>
                <div className={styles.colorMeta}>
                  <span className={styles.colorToken}>--brique</span>
                  <span className={styles.colorUsage}>Achat, prix promo, alerte (jamais sur sapin)</span>
                </div>
              </div>

              {/* Rose */}
              <div className={styles.colorCard} style={{ backgroundColor: 'var(--rose)', color: 'var(--sapin)' }}>
                <span className={styles.colorHex}>#FEC2DC</span>
                <div className={styles.colorMeta}>
                  <span className={styles.colorToken}>--rose</span>
                  <span className={styles.colorUsage}>Badges, 1 surlignage max/section, survols</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 01 / TYPOGRAPHIE */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>01 / Typographie & Échelle</span>
            <span>Archivo 900 · Inter 400 · IBM Plex Mono 500/600</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.typoList}>
              <div className={styles.typoRow}>
                <span className={styles.typoMeta}>Hero H1 (clamp 52-112px)</span>
                <h1 className="h" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
                  LE SUDOKU PREND UN NOUVEAU DÉPART
                </h1>
              </div>

              <div className={styles.typoRow}>
                <span className={styles.typoMeta}>Section H2 (clamp 40-80px)</span>
                <h2 className="h" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                  01 / CHOISIS TON ALLURE
                </h2>
              </div>

              <div className={styles.typoRow}>
                <span className={styles.typoMeta}>Chrono Géant (Mono 600)</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '0.05em' }}>
                  08:42.15
                </div>
              </div>

              <div className={styles.typoRow}>
                <span className={styles.typoMeta}>Texte Courant (Inter 400)</span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.55 }}>
                  Tu t’étires, tu prends un crayon bien taillé, tu ouvres la grille et tu souris.
                  Ici, chaque case est un virage et chaque chiffre posé te rapproche de la ligne d’arrivée.
                </p>
              </div>

              <div className={styles.typoRow}>
                <span className={styles.typoMeta}>Étiquette Mono 500 (12px)</span>
                <p className="m">
                  REF: CD-NOEL-2026 · GRILLES 30+1 · COUVERTURE TECHNIQUE N°02
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 02 / BOUTONS */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>02 / Boutons & Actions</span>
            <span>Rayon 0 · Survol Rose · 3 Tailles</span>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.subTitle}>Variante Primaire (Achat & Ajout Panier)</p>
            <div className={styles.buttonGroup}>
              <Button size="sm" variant="primary">JE LE VEUX (SM 44px)</Button>
              <Button size="md" variant="primary">PRENDRE LE DÉPART (MD 52px)</Button>
              <Button size="lg" variant="primary">JE PRENDS TOUT (LG 56px) →</Button>
            </div>

            <p className={styles.subTitle}>Variante Secondaire (Navigation / Neutre)</p>
            <div className={styles.buttonGroup}>
              <Button size="sm" variant="secondary">ME PRÉVENIR</Button>
              <Button size="md" variant="secondary">VOIR LES DÉTAILS</Button>
              <Button size="lg" variant="secondary">FEUILLETER LE CARNET</Button>
            </div>

            <div className={styles.darkBox}>
              <p className={styles.subTitle} style={{ color: 'var(--sable)' }}>Variante Sur Fond Sombre (--sapin)</p>
              <div className={styles.buttonGroup} style={{ marginBottom: 0 }}>
                <Button size="md" variant="primary">REJOINDRE LA COURSE</Button>
                <Button size="md" variant="dark">EN SAVOIR PLUS</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 03 / BADGES & NIVEAUX */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>03 / Badges & Allures</span>
            <span>Badges ronds 50% · Niveaux mono</span>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.subTitle}>Badges ronds (Seule exception au rayon 0)</p>
            <div className={styles.badgeRow}>
              <Badge size="sm" rotation={-5}>NOUVEAU</Badge>
              <Badge size="md" rotation={4}>PRODUIT PHARE</Badge>
              <Badge size="lg" rotation={-3}>ÉCONOMISE 14,50 €</Badge>
              <Badge size="md" rotation={6}>DÉFI DU LUNDI</Badge>
            </div>

            <div style={{ marginTop: '40px' }}>
              <p className={styles.subTitle}>Indicateurs de niveau (Course)</p>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', padding: '16px 0' }}>
                <LevelBadge level="echauffement" />
                <LevelBadge level="sprint" />
                <LevelBadge level="marathon" />
                <LevelBadge level="all" />
              </div>
            </div>
          </div>
        </section>

        {/* 04 / MOTIF SIGNATURE */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>04 / Motif signature : Grille 3×3</span>
            <span>Logo · Filets fins · Case Départ pleine</span>
          </div>
          <div className={styles.sectionBody}>
            <div style={{ display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p className={styles.subTitle}>Logo 34px</p>
                <SudokuMotif size={34} variant="logo" />
              </div>
              <div>
                <p className={styles.subTitle}>Icône 48px</p>
                <SudokuMotif size={48} variant="icon" />
              </div>
              <div>
                <p className={styles.subTitle}>Cover motif 80px</p>
                <SudokuMotif size={80} variant="cover" />
              </div>
              <div style={{ backgroundColor: 'var(--sapin)', padding: '24px' }}>
                <p className={styles.subTitle} style={{ color: 'var(--sable)' }}>Variante Sable sur Sapin</p>
                <SudokuMotif size={80} variant="cover" themeColor="sable" />
              </div>
            </div>
          </div>
        </section>

        {/* 05 / COUVERTURES & CARTES */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>05 / Composants Cartes & Couvertures</span>
            <span>Survol zone infos en rose · Ratio 4:5</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.cardsGrid}>
              {featuredProduct && (
                <Card product={featuredProduct} coverVariant="sable" coverNumber="N°02" />
              )}
              {bundleProduct && (
                <Card product={bundleProduct} coverVariant="sapin" coverNumber="INTÉGRAL" />
              )}
              {bientotProduct && (
                <Card product={bientotProduct} coverVariant="sable" coverNumber="N°03" />
              )}
            </div>
          </div>
        </section>

        {/* 06 / SPÉCIFICATIONS & TABLEAU */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>06 / Spécifications & Tableaux</span>
            <span>1 surlignage rose par section max</span>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.subTitle}>Bloc de spécifications techniques</p>
            <div className={styles.specsGrid}>
              <div className={styles.specCell}>
                <span className={styles.specLabel}>PAGES TOTALES</span>
                <span className={styles.specValue}>≈ 48 PAGES</span>
              </div>
              <div className={styles.specCell}>
                <span className={styles.specLabel}>GRILLES JOUABLES</span>
                <span className={styles.specValue}>30 + 1 FINALE</span>
              </div>
              <div className={styles.specCell}>
                <span className={styles.specLabel}>FORMAT LIVRÉ</span>
                <span className={styles.specValue}>A4 + A5 LIVRET</span>
              </div>
              <div className={styles.specCell}>
                <span className={styles.specLabel}>IMPRESSION</span>
                <span className={styles.specValue}>100% N&amp;B OPTIMISÉ</span>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <p className={styles.subTitle}>Tableau technique d’un carnet (1 seule ligne en rose)</p>
              <table className={styles.techTable}>
                <thead>
                  <tr>
                    <th>SECTION</th>
                    <th>CONTENU</th>
                    <th>OBJECTIF</th>
                    <th>ALLURE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>P. 01 — 04</td>
                    <td>Ligne de départ &amp; Règles</td>
                    <td>Prise en main et étirements</td>
                    <td>DÉPART</td>
                  </tr>
                  <tr>
                    <td>P. 05 — 16</td>
                    <td>10 Grilles Échauffement</td>
                    <td>Mise en rythme sans pression</td>
                    <td>ÉCHAUFFEMENT ›</td>
                  </tr>
                  {/* Une seule ligne surlignée en rose selon design.md */}
                  <tr className={styles.highlightRow}>
                    <td>P. 17 — 18</td>
                    <td>Ravitaillement n°1 : Coloriage hivernal</td>
                    <td>Faire reposer les yeux et le crayon</td>
                    <td>PAUSE</td>
                  </tr>
                  <tr>
                    <td>P. 19 — 30</td>
                    <td>10 Grilles Sprint</td>
                    <td>Le chrono s’accélère</td>
                    <td>SPRINT ››</td>
                  </tr>
                  <tr>
                    <td>P. 31 — 44</td>
                    <td>10 Grilles Marathon + Ligne d’arrivée</td>
                    <td>Endurance pure &amp; classement</td>
                    <td>MARATHON ›››</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 07 / ACCORDÉON FAQ */}
        <section className={styles.section}>
          <div className="section-tag">
            <span>07 / Accordéon FAQ</span>
            <span>Q.01 Mono · Question Archivo 20px · Ouvert en Rose</span>
          </div>
          <div className={styles.sectionBody}>
            <Accordion items={sampleFaq} defaultOpenIndex={0} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

