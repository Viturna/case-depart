import React from 'react';
import Link from 'next/link';
import Bandeau from '@/components/Bandeau';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Card, { ProductItem } from '@/components/Card';
import Accordion from '@/components/Accordion';
import HeroParallax from '@/components/HeroParallax';
import ThemesCarousel from '@/components/ThemesCarousel';
import CoversWall from '@/components/CoversWall';
import StarterForm from '@/components/StarterForm';
import Cover from '@/components/Cover';
import productsData from '@/data/products.json';
import styles from './page.module.css';

const faqHome = [
  {
    question: 'Comment je reçois mon carnet ?',
    answer: 'Par e-mail, en PDF, juste après le paiement. Tu l’imprimes chez toi, en A4 ou en A5 livret sans attendre le facteur.',
  },
  {
    question: 'A4 ou A5, je choisis quoi ?',
    answer: 'A4 pour jouer à plat, confortablement au coin d’une table. A5 livret : tu imprimes en recto-verso, tu plies au milieu, tu l’emportes partout dans ta poche.',
  },
  {
    question: 'Il me faut une imprimante couleur ?',
    answer: 'Non. Les 30 grilles sont optimisées pour le noir et blanc afin de ménager ton encre. Seules la couverture et les pauses Ravitaillement profitent de la couleur.',
  },
  {
    question: 'Le jeu en ligne, c’est quoi ?',
    answer: 'Les mêmes grilles que ton carnet avec chrono officiel, détection d’erreurs et classement mondial. Le Pass Podium ajoute un accès illimité et le grand défi chronométré du lundi.',
  },
  {
    question: 'Je peux l’offrir ?',
    answer: 'Oui ! La version à offrir (2 € de plus) ajoute le prénom de ton destinataire sur la couverture du carnet et génère une carte cadeau numérique prête à imprimer ou envoyer.',
  },
];

export default function HomePage() {
  const products = productsData as ProductItem[];
  const starter = products.find((p) => p.slug === 'le-starter')!;
  const etape = products.find((p) => p.slug === 'etape-noel')!;
  const carnetNoel = products.find((p) => p.slug === 'carnet-noel')!;
  const tourAnnee = products.find((p) => p.slug === 'tour-de-l-annee')!;
  const collection = products.find((p) => p.slug === 'la-collection')!;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Bandeau défilant haut 40px */}
      <Bandeau />

      {/* Header sticky 64px */}
      <Header cartCount={0} />

      <main className="site-container" style={{ flexGrow: 1 }}>
        {/* 00 / HERO AVEC PARALLAX MULTI-CALQUES */}
        <HeroParallax />

        {/* 00 BIS / BANDE DE SPÉCIFICATIONS RAPIDES */}
        <section className={styles.specsSection} aria-label="Spécifications clés">
          <div className={styles.specCell}>
            <span className="m">Grilles / carnet</span>
            <span className={styles.specNumber}>30+1</span>
          </div>
          <div className={styles.specCell}>
            <span className="m">Niveaux</span>
            <span className={styles.specNumber}>3</span>
          </div>
          <div className={styles.specCell}>
            <span className="m">Formats</span>
            <span className={styles.specNumber}>A4 / A5</span>
          </div>
          <div className={styles.specCell}>
            <span className="m">Chrono en ligne</span>
            <span className={styles.specNumber}>00:00</span>
          </div>
        </section>

        {/* 01 / CHOISIS TON NIVEAU */}
        <section id="niveaux" className={styles.niveauxSection} aria-label="Les trois allures">
          <div className="section-tag">
            <span>01 / Choisis ton niveau</span>
            <span>3 allures</span>
          </div>

          <div className={styles.sectionHeaderSimple}>
            <h2 className={styles.sectionH2}>Choisis ton allure</h2>
          </div>

          <div className={styles.alluresGrid}>
            {/* Niveau 1 : Échauffement */}
            <div className={styles.allureCard}>
              <div className="m" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Niv. 01 — Facile</span>
                <span>›</span>
              </div>
              <div className={styles.levelBars} aria-hidden="true">
                <div className={styles.levelBarFilled}></div>
                <div className={styles.levelBarOutline}></div>
                <div className={styles.levelBarOutline}></div>
              </div>
              <h3 className={styles.allureTitle}>Échauffement</h3>
              <p className={styles.allureDesc}>
                Tu t’étires, tu remplis, tu souris. Idéal avec un café, avant que la journée ne démarre. Candidat unique et déductions directes.
              </p>
              <div className={styles.allureFooter}>
                10 grilles par carnet
              </div>
            </div>

            {/* Niveau 2 : Sprint */}
            <div className={styles.allureCard}>
              <div className="m" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Niv. 02 — Moyen</span>
                <span>››</span>
              </div>
              <div className={styles.levelBars} aria-hidden="true">
                <div className={styles.levelBarFilled}></div>
                <div className={styles.levelBarFilled}></div>
                <div className={styles.levelBarOutline}></div>
              </div>
              <h3 className={styles.allureTitle}>Sprint</h3>
              <p className={styles.allureDesc}>
                Ça monte. Le crayon <span style={{ backgroundColor: 'var(--rose)', padding: '0 0.1em' }}>chauffe</span>. Garde la gomme à portée de main, les paires nues et alignements entrent en jeu.
              </p>
              <div className={styles.allureFooter}>
                10 grilles par carnet
              </div>
            </div>

            {/* Niveau 3 : Marathon */}
            <div className={styles.allureCard}>
              <div className="m" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Niv. 03 — Difficile</span>
                <span>›››</span>
              </div>
              <div className={styles.levelBars} aria-hidden="true">
                <div className={styles.levelBarFilled}></div>
                <div className={styles.levelBarFilled}></div>
                <div className={styles.levelBarFilled}></div>
              </div>
              <h3 className={styles.allureTitle}>Marathon</h3>
              <p className={styles.allureDesc}>
                Pas de raccourci. Juste toi, 81 cases et ce qu’il reste de ta dignité. Chaînes de déduction complexes, sans jamais deviner.
              </p>
              <div className={styles.allureFooter}>
                10 grilles + la spéciale d’arrivée
              </div>
            </div>
          </div>
        </section>

        {/* 02 / LES THÈMES (CARROUSEL AVEC 3 VISIBLES) */}
        <ThemesCarousel />

        {/* 03 / NOS CARNETS */}
        <section className={styles.carnetsSection} aria-label="Nos carnets de sudoku">
          <div className="section-tag">
            <span>03 / Nos carnets</span>
            <span>Du gratuit au bundle</span>
          </div>

          <div className={styles.carnetsHeader}>
            <h2 className={styles.sectionH2}>Nos carnets</h2>
            <Button size="md" variant="secondary" href="/carnets">
              TOUT LE CATALOGUE →
            </Button>
          </div>

          <div className={styles.carnetsGrid}>
            <div className={styles.carnetCol}>
              <Card product={starter} coverVariant="sable" coverNumber="00" />
            </div>
            <div className={styles.carnetCol}>
              <Card product={etape} coverVariant="sable" coverNumber="03" />
            </div>
            <div className={styles.carnetCol}>
              <Card product={carnetNoel} coverVariant="sable" coverNumber="02" />
            </div>
            <div className={styles.carnetCol}>
              <Card product={tourAnnee} coverVariant="sable" coverNumber="06" />
            </div>
          </div>

          {/* BANNÈRE BUNDLE : LA COLLECTION INTÉGRALE */}
          <div className={styles.bundleBanner}>
            <div className={styles.bundleVisual}>
              <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 3 }}>
                <Badge size="md" rotation={-4}>
                  ÉCONOMISE<br />14,50 €
                </Badge>
              </div>
              <div style={{ width: '100%', maxWidth: '220px' }}>
                <Cover
                  themeTitle="La Collection"
                  number="INTÉGRAL"
                  subtitle="180 grilles · 6 carnets"
                  variant="sable"
                />
              </div>
            </div>

            <div className={styles.bundleInfo}>
              <div className="m">LE GRAND PACK COMPLET</div>
              <h3 className="h" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                LA COLLECTION INTÉGRALE
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, margin: 0, maxWidth: '520px' }}>
                Les 5 carnets thématiques (Noël, Halloween, Saint-Valentin, Pâques, Fête de la musique) + le carnet multi-thème Tour de l’année.
                Soit 180 grilles exclusives et un accès prioritaire à toutes les sorties.
              </p>
              <div className={styles.bundlePriceRow}>
                <span className={styles.bundlePriceOld}>{collection.prixBarre}</span>
                <span className={styles.bundlePriceNew}>{collection.prixAffiche}</span>
                <span className="m" style={{ color: 'var(--sapin)' }}>TÉLÉCHARGEMENT DIRECT</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                <Button size="lg" variant="primary" href={`/carnets/${collection.slug}`}>
                  JE PRENDS TOUT →
                </Button>
                <Button size="lg" variant="secondary" href={`/carnets/${collection.slug}`}>
                  DÉTAILS DU PACK
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 04 / DANS UN CARNET, IL Y A… (ANATOMIE D'UN CARNET) */}
        <section id="ravitaillement" className={styles.anatomieSection} aria-label="Anatomie d'un carnet">
          <div style={{ flex: '1 1 100%' }} className="section-tag">
            <span>04 / Dans un carnet, il y a…</span>
            <span>≈ 46 pages A4</span>
          </div>

          <div className={styles.anatomieLeft}>
            <h2 className={styles.sectionH2} style={{ fontSize: 'clamp(36px, 4.4vw, 64px)' }}>
              Dans un carnet, il y a…
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, margin: 0, maxWidth: '420px' }}>
              Un parcours, pas une simple pile de grilles. Tu pars de la ligne de départ, tu passes par deux ravitaillements de récupération, et tu franchis la ligne d’arrivée.
            </p>
            <p className="m" style={{ margin: 0 }}>
              Grilles 100% optimisées pour l’impression noir et blanc. Ton encre te dit merci.
            </p>
          </div>

          <div className={styles.anatomieRight}>
            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 01 — 04</span>
              <h4 className={styles.timelineTitle}>Ligne de départ</h4>
              <p className={styles.timelineDesc}>Règles de jeu, explication des allures et tableau des temps à battre.</p>
            </div>

            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 05 — 16</span>
              <h4 className={styles.timelineTitle}>Échauffement</h4>
              <p className={styles.timelineDesc}>10 grilles faciles pour mettre le cerveau sur de bons rails.</p>
            </div>

            {/* Une seule ligne surlignée en rose selon DESIGN.md */}
            <div className={`${styles.timelineRow} ${styles.timelineRowHighlight}`}>
              <span className={styles.timelinePages}>P. 17 — 18</span>
              <h4 className={styles.timelineTitle}>Ravitaillement n°1</h4>
              <p className={styles.timelineDesc}>Coloriage thématique grand format pour reposer tes yeux.</p>
            </div>

            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 19 — 30</span>
              <h4 className={styles.timelineTitle}>Sprint</h4>
              <p className={styles.timelineDesc}>10 grilles d’allure moyenne. Le chrono commence à compter.</p>
            </div>

            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 31 — 32</span>
              <h4 className={styles.timelineTitle}>Ravitaillement n°2</h4>
              <p className={styles.timelineDesc}>Page tirage façon horoscope selon ton chiffre clé trouvé en Sprint.</p>
            </div>

            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 33 — 44</span>
              <h4 className={styles.timelineTitle}>Marathon</h4>
              <p className={styles.timelineDesc}>10 grilles difficiles sans filet pour tester ton endurance pure.</p>
            </div>

            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 45</span>
              <h4 className={styles.timelineTitle}>Ligne d’arrivée</h4>
              <p className={styles.timelineDesc}>La grille finale spéciale + le grand récapitulatif de tes chronos.</p>
            </div>

            <div className={styles.timelineRow}>
              <span className={styles.timelinePages}>P. 46 — 48</span>
              <h4 className={styles.timelineTitle}>Corrections</h4>
              <p className={styles.timelineDesc}>Toutes les grilles résolues en petit format pour vérifier tes coups.</p>
            </div>
          </div>
        </section>

        {/* 05 / LE MODE COMPÉTITION (SECTION SOMBRE SAPIN) */}
        <section className={styles.competitionSection} aria-label="Le mode compétition en ligne">
          <div className="section-tag section-tag-dark">
            <span>05 / Le mode compétition</span>
            <span>En ligne</span>
          </div>

          <div className={styles.compWrap}>
            <div className={styles.compLeft}>
              <span className="m" style={{ color: 'var(--sable)' }}>TEMPS DE PASSAGE OFFICIEL</span>
              <div className={styles.chronoDisplay}>
                12:47<span className={styles.chronoDecimals}>.3</span>
              </div>

              <div className={styles.compSpecsGrid}>
                <div className={styles.compSpecCell}>
                  <div className="m" style={{ fontSize: '10px' }}>THÈME</div>
                  <div className="m" style={{ fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>Noël</div>
                </div>
                <div className={styles.compSpecCell}>
                  <div className="m" style={{ fontSize: '10px' }}>NIVEAU</div>
                  <div className="m" style={{ fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>Sprint ››</div>
                </div>
                <div className={styles.compSpecCell}>
                  <div className="m" style={{ fontSize: '10px' }}>GRILLE</div>
                  <div className="m" style={{ fontSize: '14px', marginTop: '6px', fontWeight: 600 }}>07 / 10</div>
                </div>
              </div>

              <div>
                <h3 className="h" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', marginBottom: '16px' }}>
                  Le carnet pour jouer. L’écran pour se mesurer.
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, color: 'var(--sable)', margin: 0 }}>
                  Même grille, même chrono pour tout le monde. Tu joues avec ton crayon ou directement en ligne, et tu enregistres ton temps sur le podium de la semaine.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Button size="lg" variant="primary" href="/jouer">
                  LANCER UNE PARTIE →
                </Button>
                <Button size="lg" variant="dark" href="/pass-podium">
                  DÉCOUVRIR LE PASS PODIUM
                </Button>
              </div>
            </div>

            <div className={styles.compRight}>
              <span className="m" style={{ color: 'var(--sable)' }}>LE PODIUM DE LA SEMAINE</span>
              <div className={styles.leaderboardTable}>
                <div className={styles.leaderboardRow}>
                  <span>01. LUCAS_M (PARIS)</span>
                  <span style={{ fontWeight: 600 }}>08:42</span>
                </div>
                <div className={styles.leaderboardRow}>
                  <span>02. SARAH_B (LYON)</span>
                  <span style={{ fontWeight: 600 }}>09:15</span>
                </div>
                {/* Ligne surlignée en rose */}
                <div className={`${styles.leaderboardRow} ${styles.leaderboardHighlight}`}>
                  <span>03. TOI (EN COURSE)</span>
                  <span>12:47</span>
                </div>
                <div className={styles.leaderboardRow}>
                  <span>04. PIERRE_D (NANTES)</span>
                  <span>13:02</span>
                </div>
                <div className={styles.leaderboardRow}>
                  <span>05. CLAIRE_V (BORDEAUX)</span>
                  <span>14:20</span>
                </div>
              </div>

              <p className="m" style={{ color: 'var(--sable)', opacity: 0.8, fontSize: '11px', margin: 0 }}>
                CLASSEMENT EN TEMPS RÉEL · TOUS LES LUNDIS LE PODIUM REMET LES COMPTEURS À ZÉRO.
              </p>
            </div>
          </div>
        </section>

        {/* 06 / ILS EN PARLENT (FAUSSES CITATIONS FICTIVES) */}
        <section className={styles.citationsSection} aria-label="Fausses citations">
          <div className="section-tag">
            <span>06 / Ils en parlent</span>
            <span>Citations 100 % fictives</span>
          </div>

          <div className={styles.citationsGrid}>
            <figure className={styles.quoteCard}>
              <blockquote className={styles.quoteText}>
                « On m’a placé en dernier. Je ne regrette rien. »
              </blockquote>
              <figcaption className={styles.quoteAuthor}>
                — Le 9, case I9
              </figcaption>
            </figure>

            {/* Une seule carte surlignée en rose selon DESIGN.md */}
            <figure className={`${styles.quoteCard} ${styles.quoteCardHighlight}`}>
              <blockquote className={styles.quoteText}>
                « Depuis le Marathon, je fais des heures sup. »
              </blockquote>
              <figcaption className={styles.quoteAuthor}>
                — La gomme, épuisée
              </figcaption>
            </figure>

            <figure className={styles.quoteCard}>
              <blockquote className={styles.quoteText}>
                « Je ne m’arrête jamais. Eux non plus. »
              </blockquote>
              <figcaption className={styles.quoteAuthor}>
                — Le chrono, impassible
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 07 / POURQUOI CASE DÉPART (4 AVANTAGES AVEC SVG INLINE) */}
        <section className={styles.avantagesSection} aria-label="Pourquoi Case Départ">
          <div className="section-tag">
            <span>07 / Pourquoi Case Départ</span>
            <span>4 raisons</span>
          </div>

          <div className={styles.avantagesGrid}>
            {/* Avantage A */}
            <div className={styles.avantageCard}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--sapin)" strokeWidth="1.5" aria-hidden="true">
                <rect x="8" y="4" width="24" height="10"></rect>
                <rect x="3" y="14" width="34" height="14"></rect>
                <rect x="10" y="24" width="20" height="12"></rect>
                <line x1="14" y1="29" x2="26" y2="29"></line>
                <line x1="14" y1="32" x2="22" y2="32"></line>
              </svg>
              <div className="m">A.</div>
              <h3 className={styles.avantageTitle}>À imprimer chez toi</h3>
              <p className={styles.avantageDesc}>
                Tu paies, tu télécharges, tu imprimes. Trois étapes, zéro attente et le plaisir immédiat du papier.
              </p>
            </div>

            {/* Avantage B */}
            <div className={styles.avantageCard}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--sapin)" strokeWidth="1.5" aria-hidden="true">
                <rect x="4" y="4" width="32" height="32"></rect>
                <line x1="14.7" y1="4" x2="14.7" y2="36"></line>
                <line x1="25.3" y1="4" x2="25.3" y2="36"></line>
                <line x1="4" y1="14.7" x2="36" y2="14.7"></line>
                <line x1="4" y1="25.3" x2="36" y2="25.3"></line>
              </svg>
              <div className="m">B.</div>
              <h3 className={styles.avantageTitle}>Noir et blanc OK</h3>
              <p className={styles.avantageDesc}>
                Les grilles restent parfaitement contrastées et lisibles en noir et blanc pour économiser tes cartouches.
              </p>
            </div>

            {/* Avantage C */}
            <div className={styles.avantageCard}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--sapin)" strokeWidth="1.5" aria-hidden="true">
                <rect x="4" y="4" width="32" height="32"></rect>
                <polyline points="11,21 17,27 29,13"></polyline>
              </svg>
              <div className="m">C.</div>
              <h3 className={styles.avantageTitle}>A4 ou A5 livret</h3>
              <p className={styles.avantageDesc}>
                Les deux fichiers sont fournis d’office. Imprime en grandes feuilles A4 ou plie au centre pour un format poche.
              </p>
            </div>

            {/* Avantage D */}
            <div className={styles.avantageCard}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--sapin)" strokeWidth="1.5" aria-hidden="true">
                <rect x="5" y="15" width="30" height="21"></rect>
                <rect x="3" y="10" width="34" height="6"></rect>
                <line x1="20" y1="10" x2="20" y2="36"></line>
                <path d="M20 10 C 14 2, 8 8, 20 10 C 32 8, 26 2, 20 10"></path>
              </svg>
              <div className="m">D.</div>
              <h3 className={styles.avantageTitle}>Le chrono en ligne</h3>
              <p className={styles.avantageDesc}>
                Un code unique dans chaque carnet pour mesurer ton temps, valider tes chiffres et monter sur le podium.
              </p>
            </div>
          </div>
        </section>

        {/* 08 / LE MUR (DÉFILEMENT DE COUVERTURES) */}
        <CoversWall />

        {/* 09 / LE STARTER OFFERT (FORMULAIRE E-MAIL) */}
        <StarterForm />

        {/* 10 / ACCORDÉON FAQ */}
        <section className={styles.faqSection} aria-label="Foire aux questions">
          <div style={{ flex: '1 1 100%' }} className="section-tag">
            <span>10 / Questions</span>
            <span>FAQ</span>
          </div>

          <div className={styles.faqLeft}>
            <h2 className={styles.sectionH2}>Des questions ?</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, marginTop: '24px', maxWidth: '320px' }}>
              Tout ce que tu as toujours voulu savoir sur nos sudokus avant de prendre le départ.
            </p>
          </div>

          <div className={styles.faqRight}>
            <Accordion items={faqHome} defaultOpenIndex={0} />
          </div>
        </section>
      </main>

      {/* Footer sapin 4 colonnes + mega wordmark */}
      <Footer />
    </div>
  );
}
