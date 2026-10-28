'use client';

import React, { useState } from 'react';
import Bandeau from '@/components/Bandeau';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Cover from '@/components/Cover';
import Card, { ProductItem } from '@/components/Card';
import Accordion from '@/components/Accordion';
import SudokuMotif from '@/components/SudokuMotif';
import { useCart } from '@/context/CartContext';
import styles from '@/app/carnets/[slug]/page.module.css';

interface ProductDetailClientProps {
  product: ProductItem;
  allProducts: ProductItem[];
}

const etapesData = [
  { n: '01', p: 'P. 01 — 02', titre: 'Ligne de départ', desc: 'Règles du jeu, rappel des trois allures et case temps total.' },
  { n: '02', p: 'P. 03 — 12', titre: 'Échauffement', desc: '10 grilles faciles. Candidat unique et alignements simples.' },
  { n: '03', p: 'P. 13', titre: 'Ravitaillement n°1', desc: 'Coloriage grand format pour reposer le cerveau et les yeux.' },
  { n: '04', p: 'P. 14 — 23', titre: 'Sprint', desc: '10 grilles moyennes. Les paires nues et le chrono chauffent.' },
  { n: '05', p: 'P. 24', titre: 'Ravitaillement n°2', desc: 'Tirage « Ton année à venir », une prédiction par mois selon ton chrono.', isHighlight: true },
  { n: '06', p: 'P. 25 — 34', titre: 'Marathon', desc: '10 grilles difficiles. Pas de raccourci, endurance pure.' },
  { n: '07', p: 'P. 35', titre: 'Ligne d’arrivée', desc: 'La grille finale spéciale qui boucle le carnet.' },
  { n: '08', p: 'P. 36', titre: 'Récapitulatif des scores', desc: 'Tableau pour noter tous tes chronos et comparer tes perfs.' },
  { n: '09', p: 'P. 37 — 46', titre: 'Corrections', desc: 'Toutes les solutions complètes en fin de volume.' },
];

const productFaq = [
  {
    question: 'Je reçois quoi exactement après l’achat ?',
    answer: 'Tu reçois un lien de téléchargement direct contenant 2 fichiers PDF haute définition : la version A4 (pleine page) et la version A5 livret (à plier en deux), ainsi que ton code d’accès pour la course en ligne.',
  },
  {
    question: 'Comment fonctionne l’option « Version à offrir » (+2 €) ?',
    answer: 'La version à offrir intègre automatiquement le prénom du destinataire sur la couverture du carnet et génère une carte cadeau numérique avec un message personnalisé.',
  },
  {
    question: 'Les grilles sont-elles imprimables en noir et blanc ?',
    answer: 'Oui, à 100%. Tout le tracé des grilles et les chiffres ont été conçus en contrastes stricts pour une impression économique et parfaitement lisible sur n’importe quelle imprimante de bureau.',
  },
  {
    question: 'Le carnet est-il accessible aux débutants ?',
    answer: 'Absolument. Il démarre par les règles et 10 grilles d’Échauffement accessibles avant d’augmenter progressivement l’allure vers le Sprint et le Marathon.',
  },
];

export default function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState(0);
  const [format, setFormat] = useState<'A4' | 'A5 livret'>('A4');
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  const currentPrice = isGift ? product.prix + 2.0 : product.prix;
  const currentPriceFormatted = currentPrice.toFixed(2).replace('.', ',') + ' €';

  const galleryTabs = [
    { court: 'Couv.', label: 'Couverture', num: '01', legende: 'Couverture du carnet, imprimable A4 & A5' },
    { court: 'Départ', label: 'Ligne de départ', num: '02', legende: 'Page 02 : Les règles et ta case temps total' },
    { court: 'Grille', label: 'Grille Sprint', num: '14', legende: 'Page 14 : Une grille de niveau Sprint en situation' },
    { court: 'Ravito', label: 'Ravitaillement', num: '24', legende: 'Page 24 : Tirage thématique & horoscope du carnet' },
    { court: 'Arrivée', label: 'Ligne d’arrivée', num: '35', legende: 'Page 35 : La grille finale spéciale et récap des scores' },
  ];

  const handleAddToCart = () => {
    addItem({
      slug: product.slug,
      nom: product.nom,
      format: format,
      isGift: isGift,
      recipientName: isGift ? recipientName : undefined,
      prix: currentPrice,
      prixAffiche: currentPriceFormatted,
      theme: product.theme,
    });
  };

  const relatedProducts = allProducts
    .filter((p) => p.slug !== product.slug && p.slug !== 'la-collection')
    .slice(0, 4);

  return (
    <div className={styles.ficheContainer}>
      <Bandeau />
      <Header />

      <main className="site-container">
        {/* SECTION 1 — BLOC PRINCIPAL ACHAT & GALERIE */}
        <section className={styles.mainBuySection} aria-label="Présentation et achat du carnet">
          {/* Galerie interactive */}
          <div className={styles.galleryCol}>
            <div className={styles.tabsBar} role="tablist">
              {galleryTabs.map((tab, idx) => (
                <button
                  key={tab.court}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === idx}
                  className={`${styles.tabBtn} ${activeTab === idx ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(idx)}
                >
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>P. {tab.num}</span>
                  <span>{tab.court}</span>
                </button>
              ))}
            </div>

            <div className={styles.visualDisplay}>
              {activeTab === 0 ? (
                <div style={{ width: '100%', maxWidth: '280px' }}>
                  <Cover
                    themeTitle={product.themeLabel}
                    number={product.theme === 'noel' ? '02' : '01'}
                    subtitle={product.grilles || '30 GRILLES'}
                    variant="sable"
                  />
                </div>
              ) : activeTab === 1 ? (
                /* Vue Ligne de départ */
                <div className={styles.pageSheet}>
                  <div className={styles.pageHeader}>
                    <span>CASE DÉPART</span>
                    <span>P. 02</span>
                  </div>
                  <div className={styles.pageBody}>
                    <h3 className="h" style={{ fontSize: '20px' }}>LIGNE DE DÉPART</h3>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6 }}>
                      › Échauffement — 10 grilles p. 03<br />
                      ›› Sprint — 10 grilles p. 14<br />
                      ››› Marathon — 10 grilles p. 25<br />
                      Ravitaillements : p. 13 et p. 24<br />
                      Ligne d’arrivée : p. 35
                    </p>
                    <div style={{ border: 'var(--border-1)', padding: '8px', textAlign: 'center', marginTop: 'auto' }}>
                      <span className="m" style={{ fontSize: '10px' }}>TEMPS TOTAL : __ : __ : __</span>
                    </div>
                  </div>
                  <div className={styles.pageFooter}>
                    <span>RÈGLES ET ALLURES</span>
                    <span>A4 / A5</span>
                  </div>
                </div>
              ) : activeTab === 2 ? (
                /* Vue Grille Sprint */
                <div className={styles.pageSheet}>
                  <div className={styles.pageHeader}>
                    <span>SPRINT · GRILLE 11</span>
                    <span>P. 14</span>
                  </div>
                  <div className={styles.pageBody} style={{ alignItems: 'center' }}>
                    <SudokuMotif size={160} variant="cover" numbers={[5, 3, '', 6, '', '', '', 9, 8]} />
                  </div>
                  <div className={styles.pageFooter}>
                    <span>TEMPS DE COURSE : ____</span>
                    <span>NIV. SPRINT ››</span>
                  </div>
                </div>
              ) : activeTab === 3 ? (
                /* Vue Ravitaillement n°2 (Tirage) */
                <div className={styles.pageSheet} style={{ backgroundColor: 'var(--rose)' }}>
                  <div className={styles.pageHeader}>
                    <span>RAVITAILLEMENT N°2</span>
                    <span>P. 24</span>
                  </div>
                  <div className={styles.pageBody}>
                    <h3 className="h" style={{ fontSize: '18px' }}>TON ANNÉE À VENIR</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', lineHeight: 1.5 }}>
                      Selon ton chiffre trouvé dans la grille précédente :<br />
                      • Janvier : [Prédiction de saison]<br />
                      • Février : [Prudence sur les alignements]<br />
                      • Mars : [Le crayon s’accélère]
                    </p>
                  </div>
                  <div className={styles.pageFooter}>
                    <span>TIRAGE THÉMATIQUE</span>
                    <span>PAUSE</span>
                  </div>
                </div>
              ) : (
                /* Vue Ligne d'arrivée */
                <div className={styles.pageSheet}>
                  <div className={styles.pageHeader}>
                    <span>LIGNE D’ARRIVÉE</span>
                    <span>P. 35</span>
                  </div>
                  <div className={styles.pageBody} style={{ alignItems: 'center' }}>
                    <h3 className="h" style={{ fontSize: '18px' }}>LA GRILLE FINALE</h3>
                    <SudokuMotif size={150} variant="icon" numbers={[8, '', '', '', '', '', '', '', 9]} />
                  </div>
                  <div className={styles.pageFooter}>
                    <span>RÉCAP DES SCORES P. 36</span>
                    <span>FIN DE GRILLE</span>
                  </div>
                </div>
              )}

              <span className={styles.captionLegend}>
                FIG. 0{activeTab + 1} — {galleryTabs[activeTab].legende}
              </span>
            </div>
          </div>

          {/* Colonne droite d'achat */}
          <div className={styles.infoCol}>
            <div className={styles.breadcrumbRow}>
              <span>Accueil / Carnets / {product.themeLabel}</span>
              <span>RÉF. CD-{product.theme.toUpperCase()}</span>
            </div>

            <h1 className={styles.productH1}>{product.nom}</h1>

            <p className={styles.productDesc}>{product.description}</p>

            {/* Choix du format */}
            <div className={styles.formatGroup}>
              <span className={styles.groupLabel}>1. CHOISIS TON FORMAT D’IMPRESSION</span>
              <div className={styles.formatBtns}>
                <button
                  type="button"
                  className={`${styles.formatCard} ${format === 'A4' ? styles.formatCardActive : ''}`}
                  onClick={() => setFormat('A4')}
                >
                  <div className={styles.formatName}>A4 STANDARD</div>
                  <div className={styles.formatSub}>Pleine page, pour jouer à plat</div>
                </button>
                <button
                  type="button"
                  className={`${styles.formatCard} ${format === 'A5 livret' ? styles.formatCardActive : ''}`}
                  onClick={() => setFormat('A5 livret')}
                >
                  <div className={styles.formatName}>A5 LIVRET</div>
                  <div className={styles.formatSub}>Recto-verso, à plier au centre</div>
                </button>
              </div>
            </div>

            {/* Option Version à offrir */}
            <div className={styles.giftOptionBox}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--sapin)' }}
                />
                <span>VERSION À OFFRIR (+2,00 €)</span>
              </label>
              {isGift && (
                <input
                  type="text"
                  placeholder="Prénom du destinataire"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={styles.giftInput}
                  required
                />
              )}
            </div>

            {/* Prix et bouton d'ajout au panier */}
            <div className={styles.priceBuyRow}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="m">PRIX DU PACK IMMÉDIAT</span>
                <span className={styles.priceDisplay}>{currentPriceFormatted}</span>
              </div>

              <Button size="lg" variant="primary" fullWidth onClick={handleAddToCart}>
                AJOUTER AU PANIER — {currentPriceFormatted}
              </Button>
            </div>

            {/* Spécifications techniques */}
            <div className={styles.specsTable}>
              <div className={styles.specItem}>
                <span className={styles.specK}>PAGES</span>
                <span className={styles.specV}>≈ 48 PAGES</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specK}>GRILLES</span>
                <span className={styles.specV}>30 + 1 ARRIVÉE</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specK}>IMPRESSION</span>
                <span className={styles.specV}>100% NOIR &amp; BLANC</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specK}>LIVRAISON</span>
                <span className={styles.specV}>TÉLÉCHARGEMENT DIRECT</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — 01 / LE PARCOURS DU CARNET (9 ÉTAPES) */}
        <section className={styles.timelineSection} aria-label="Le parcours du carnet">
          <div className="section-tag">
            <span>01 / Le parcours du carnet</span>
            <span>9 étapes techniques</span>
          </div>

          <div className={styles.timelineGrid}>
            {etapesData.map((e) => (
              <div
                key={e.n}
                className={`${styles.timelineStep} ${e.isHighlight ? styles.timelineStepHighlight : ''}`}
              >
                <div className={styles.stepHeader}>
                  <span>ÉTAPE {e.n}</span>
                  <span>{e.p}</span>
                </div>
                <h3 className={styles.stepTitle}>{e.titre}</h3>
                <p className={styles.stepDesc}>{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — 02 / FEUILLETAGE (APERÇU DES PAGES) */}
        <section className={styles.feuilletageSection} aria-label="Feuilletage du carnet">
          <div className="section-tag section-tag-dark">
            <span>02 / Feuilletage</span>
            <span>Aperçu des pages intérieures</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div style={{ border: 'var(--border-sable-1)', padding: '24px', backgroundColor: 'var(--sapin)' }}>
              <span className="m" style={{ color: 'var(--sable)' }}>P. 02 — LIGNE DE DÉPART</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--sable)' }}>
                Remplis chaque ligne, colonne et bloc 3×3 sans jamais répéter le même chiffre. Note ton heure de départ.
              </p>
            </div>
            <div style={{ border: 'var(--border-sable-1)', padding: '24px', backgroundColor: 'var(--sapin)' }}>
              <span className="m" style={{ color: 'var(--sable)' }}>P. 14 — GRILLE SPRINT</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--sable)' }}>
                Chaque case compte. Des alignements plus serrés pour tester ta vivacité de calcul avant la pause.
              </p>
            </div>
            <div style={{ border: 'var(--border-sable-1)', padding: '24px', backgroundColor: 'var(--sapin)' }}>
              <span className="m" style={{ color: 'var(--sable)' }}>P. 24 — RAVITAILLEMENT N°2</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--sable)' }}>
                Une pause salutaire pour recharger tes crayons. Découvre ce que les chiffres te réservent pour l’année.
              </p>
            </div>
            <div style={{ border: 'var(--border-sable-1)', padding: '24px', backgroundColor: 'var(--sapin)' }}>
              <span className="m" style={{ color: 'var(--sable)' }}>P. 35 — LIGNE D’ARRIVÉE</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--sable)' }}>
                La grille d’arrivée couronne ton parcours. Rentre ton temps sur l’arène officielle de Case Départ.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 — 03 / MODE EN LIGNE INCLUS */}
        <section className={styles.onlineSection} aria-label="Mode en ligne inclus">
          <div style={{ flex: '1 1 100%' }} className="section-tag">
            <span>03 / Mode en ligne inclus</span>
            <span>Chrono + classement {product.themeLabel}</span>
          </div>

          <div className={styles.onlineLeft}>
            <span className="m">SUR PAPIER OU CONTRE LA MONTRE</span>
            <h2 className="h" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
              Ton carnet débloque aussi la piste officielle
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
              Chaque achat de carnet comprend un accès exclusif au jeu chronométré en ligne.
              Tu peux rejouer les grilles sur écran avec validation d’erreurs et comparer ton temps à l’ensemble des joueurs.
            </p>
            <div>
              <Button size="md" variant="secondary" href="/jouer">
                TESTER LA GRILLE DU JOUR →
              </Button>
            </div>
          </div>

          <div className={styles.onlineRight}>
            <span className="m" style={{ color: 'var(--sable)' }}>TEMPS RECORD EN LIGNE</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'clamp(44px, 6vw, 72px)', color: 'var(--sable)' }}>
              08:42<span style={{ fontSize: '0.4em' }}>.15</span>
            </div>
            <p className="m" style={{ color: 'var(--sable)', opacity: 0.8, margin: 0 }}>
              RECORD HOMOLOGUÉ SUR LA GRILLE N°07 · SPRINT {product.themeLabel.toUpperCase()}
            </p>
          </div>
        </section>

        {/* SECTION 5 — 04 / AVIS CLIENTS VÉRIFIÉS */}
        <section className={styles.avisSection} aria-label="Avis clients vérifiés">
          <div className="section-tag" style={{ borderTop: 'var(--border-1)', margin: '-56px -48px 48px -48px' }}>
            <span>04 / Avis</span>
            <span>Retours vérifiés</span>
          </div>

          <div className={styles.avisBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="m">NOTE MOYENNE : 4.9 / 5</span>
              <span className="m" style={{ color: 'var(--brique)' }}>■ ■ ■ ■ ■</span>
            </div>
            <blockquote className="h" style={{ fontSize: '24px', margin: 0 }}>
              [Avis client vérifié à intégrer après le lancement.]
            </blockquote>
            <p className="m" style={{ margin: 0 }}>
              Tant que les avis ne sont pas certifiés par nos premiers coureurs, aucun faux témoignage n’est inventé ici.
            </p>
          </div>
        </section>

        {/* SECTION 6 — 05 / PASSE LA SECONDE (UPSELL LA COLLECTION) */}
        <section className={styles.upsellSection} aria-label="La Collection complète">
          <div style={{ flex: '1 1 100%' }} className="section-tag section-tag-dark">
            <span>05 / Passe la seconde</span>
            <span>Et si tu prenais toute la saison ?</span>
          </div>

          <div className={styles.upsellLeft}>
            <span className="m" style={{ color: 'var(--sable)' }}>LA COLLECTION COMPLÈTE</span>
            <h2 className="h" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
              5 carnets thématiques + Tour de l’année
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, color: 'var(--sable)', margin: 0 }}>
              Passe de 30 grilles à 180 grilles. Économise 14,50 € et reçois tous les futurs thèmes dès leur parution.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span className={styles.bundlePriceOld}>49,40 €</span>
              <span className={styles.bundlePriceNew} style={{ color: 'var(--sable)' }}>34,90 €</span>
            </div>
            <div>
              <Button size="lg" variant="primary" href="/carnets/la-collection">
                DÉCOUVRIR LA COLLECTION →
              </Button>
            </div>
          </div>

          <div className={styles.upsellRight}>
            <div style={{ width: '100%', maxWidth: '240px' }}>
              <Cover
                themeTitle="Collection"
                number="PACK"
                subtitle="180 grilles"
                variant="sable"
              />
            </div>
          </div>
        </section>

        {/* SECTION 7 — 06 / DANS LA MÊME COURSE (PRODUITS ASSOCIÉS) */}
        <section className={styles.associesSection} aria-label="Produits associés">
          <div className="section-tag">
            <span>06 / Dans la même course</span>
            <span>4 carnets</span>
          </div>

          <div className={styles.associesGrid}>
            {relatedProducts.map((p) => (
              <div key={p.slug} className={styles.associeCol}>
                <Card product={p} coverVariant="sable" />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8 — 07 / QUESTIONS FRÉQUENTES */}
        <section style={{ display: 'flex', flexWrap: 'wrap', borderBottom: 'var(--border-1)', backgroundColor: 'var(--sable)' }} aria-label="Questions fréquentes">
          <div style={{ flex: '1 1 100%' }} className="section-tag">
            <span>07 / Questions</span>
            <span>Carnet {product.themeLabel}</span>
          </div>

          <div style={{ flex: '1 1 380px', padding: '64px 48px', borderRight: 'var(--border-1)' }}>
            <h2 className="h" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}>
              Avant de partir
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.6, marginTop: '20px' }}>
              Toutes les réponses pour bien préparer ta course et imprimer ton carnet sans accroc.
            </p>
          </div>

          <div style={{ flex: '1.6 1 600px' }}>
            <Accordion items={productFaq} defaultOpenIndex={0} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

