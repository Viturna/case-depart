import React, { Suspense } from 'react';
import Link from 'next/link';
import Bandeau from '@/components/Bandeau';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import Tabs from '@/components/Tabs';
import Accordion from '@/components/Accordion';
import GridPattern from '@/components/GridPattern';
import ProductCard from '@/components/ProductCard';
import Split from '@/components/Split';
import ScrollText from '@/components/ScrollText';
import OrderSuccessBanner from '@/components/OrderSuccessBanner';
import type { ProductItem } from '@/components/Card';
import productsData from '@/data/products.json';
import styles from './page.module.css';

const products = productsData as ProductItem[];
const bySlug = (s: string) => products.find((p) => p.slug === s)!;

const featured = ['carnet-noel', 'carnet-halloween', 'tour-de-l-annee', 'carnet-saint-valentin', 'carnet-paques', 'la-collection'].map(bySlug);

const niveaux = [
  { slug: 'echauffement', nom: 'Échauffement', allure: '›', texte: 'Pour se dérouiller les neurones avec un café. Personne ne juge.' },
  { slug: 'sprint', nom: 'Sprint', allure: '››', texte: 'Ça accélère. Tu commences à parler aux chiffres, c’est normal.' },
  { slug: 'marathon', nom: 'Marathon', allure: '›››', texte: 'Le 9 se cache. Prévois une gomme et une soirée entière.' },
];

const etapes = [
  { titre: 'Choisis ton thème', texte: 'Halloween, Noël, Pâques… ou tous à la fois, on ne te demandera pas de choisir ton préféré.' },
  { titre: 'Reçois ton PDF', texte: 'Il arrive par e-mail juste après le paiement. Pas de facteur, pas d’attente.' },
  { titre: 'Imprime', texte: 'En A4 à plat ou en A5 livret. Le noir et blanc suffit, ton encre te dit merci.' },
  { titre: 'Remplis, souffle, recommence', texte: 'Entre les niveaux, des pauses ravitaillement : coloriage ou tirage astro.' },
];

const gamme: { label: string; slugs: string[]; note: string }[] = [
  { label: 'Gratuit', slugs: ['le-starter'], note: '3 grilles et un coloriage contre ton e-mail. On appelle ça une mise en jambe.' },
  { label: 'Petit pack', slugs: ['etape-noel'], note: '10 grilles d’un seul niveau, pour tester sans s’engager.' },
  { label: 'Produit phare', slugs: ['carnet-noel', 'carnet-halloween', 'carnet-saint-valentin', 'carnet-paques', 'tour-de-l-annee'], note: '30 grilles sur 3 niveaux, corrections et ravitaillements inclus.' },
  { label: 'Bundle', slugs: ['la-collection'], note: 'Tous les carnets, d’un coup. Pour celles et ceux qui ne font rien à moitié.' },
];

const avis = [
  { texte: 'J’ai commencé par l’Échauffement. Trois semaines plus tard, je fais le Marathon au petit-déj.', auteur: 'Une lectrice, 34 ans', note: 5 },
  { texte: 'On m’a placé en dernier dans chaque grille. Je ne regrette rien.', auteur: 'Le 9', note: 5 },
  { texte: 'Le carnet d’Halloween m’a fait plus peur que mon relevé bancaire.', auteur: 'Un lecteur, 41 ans', note: 4 },
];

const faq = [
  { question: 'Comment je reçois mon carnet ?', answer: 'Par e-mail, en PDF, juste après le paiement. Tu l’imprimes chez toi en A4 ou en A5 livret.' },
  { question: 'Il me faut une imprimante couleur ?', answer: 'Non. Les grilles sont pensées pour le noir et blanc. Seules la couverture et les ravitaillements profitent de la couleur.' },
  { question: 'Le jeu en ligne, c’est quoi ?', answer: 'Des grilles à jouer dans le navigateur, avec chrono et classement. Le Pass Podium ajoute l’accès illimité et le défi du lundi.' },
  { question: 'Je peux l’offrir ?', answer: 'Oui. La version à offrir ajoute le prénom de la personne sur la couverture et une carte cadeau à imprimer.' },
];

function Stars({ n }: { n: number }) {
  return (
    <span className={styles.stars} aria-label={`Note : ${n} sur 5`}>
      {'★'.repeat(n)}<span className="muted">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <OrderSuccessBanner />
      </Suspense>
      <Header />

      <main>
        {/* Hero typographique sur grille */}
        <section className={styles.hero} aria-labelledby="hero-titre">
          <GridPattern className={styles.heroGrid} />
          <div className={`container ${styles.heroInner}`}>
            <p className="label">Sudokus thématiques · PDF &amp; en ligne</p>
            <Split
              as="h1"
              id="hero-titre"
              trigger="load"
              className={`title ${styles.heroTitle}`}
              lines={['Remplis', 'les cases,', 'vide ta tête.']}
              highlight="vide"
            />
            <div className={styles.heroFoot}>
              <p className={styles.heroText}>
                Des carnets à imprimer et des grilles à jouer en ligne, un thème par saison. Le sudoku prend un nouveau départ.
              </p>
              <div className={styles.heroCta}>
                <Button href="/carnets" size="lg">Voir les carnets</Button>
                <Button href="/jouer" size="lg" variant="secondary">Jouer en ligne</Button>
              </div>
            </div>
            <dl className={styles.meta}>
              <div><dt className="label muted">Thèmes</dt><dd className="tabular">05</dd></div>
              <div><dt className="label muted">Niveaux</dt><dd className="tabular">03</dd></div>
              <div><dt className="label muted">Grilles</dt><dd className="tabular">180+</dd></div>
              <div><dt className="label muted">Format</dt><dd>PDF · En ligne</dd></div>
            </dl>
          </div>
        </section>

        <Bandeau />

        {/* Manifeste : s'allume mot à mot au scroll */}
        <section className={`container ${styles.section}`} aria-label="Manifeste">
          <ScrollText text="Le sudoku, c’était le truc du dimanche chez mamie. On l’a habillé pour chaque fête de l’année, découpé en trois allures et branché sur un chrono. Mamie n’a qu’à bien se tenir." />
        </section>

        {/* À la une */}
        <section className={`container ${styles.section}`} aria-labelledby="une-titre">
          <div className={styles.head}>
            <Tag>À la une</Tag>
            <Split as="h2" id="une-titre" className={`title ${styles.h2}`} lines={['Les carnets de la saison']} />
            <Link href="/carnets" className={`label ${styles.more}`}>Tout voir →</Link>
          </div>
          <div className={styles.products}>
            {featured.map((p) => (
              <div key={p.slug} data-reveal>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Les 3 niveaux */}
        <section id="niveaux" className={`container ${styles.section}`} aria-labelledby="niveaux-titre">
          <div className={styles.head}>
            <Tag>Les 3 niveaux</Tag>
            <Split as="h2" id="niveaux-titre" className={`title ${styles.h2}`} lines={['Choisis ton allure']} />
          </div>
          <ol className={styles.niveaux}>
            {niveaux.map((n) => (
              <li key={n.slug} className={styles.niveau} data-reveal>
                <span className={`title ${styles.allure}`} aria-hidden="true">{n.allure}</span>
                <h3 className={`title ${styles.h3}`}>{n.nom}</h3>
                <p className="muted">{n.texte}</p>
                <Link href={`/carnets?niveau=${n.slug}`} className={`label ${styles.more}`}>Voir les grilles {n.nom} →</Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Comment ça marche */}
        <section className={styles.how} aria-labelledby="how-titre">
          <div className={`container ${styles.section}`}>
            <div className={styles.head}>
              <Tag>Comment ça marche</Tag>
              <Split as="h2" id="how-titre" className={`title ${styles.h2}`} lines={['Quatre étapes, zéro prise de tête']} />
            </div>
            <ol className={styles.steps}>
              {etapes.map((e, i) => (
                <li key={e.titre} className={styles.step} data-reveal>
                  <span className={`title tabular ${styles.stepNum}`}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={styles.stepTitle}>{e.titre}</h3>
                  <p className={styles.stepText}>{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Gamme façon menu */}
        <section className={`container ${styles.section}`} aria-labelledby="gamme-titre">
          <div className={styles.head}>
            <Tag>La gamme</Tag>
            <Split as="h2" id="gamme-titre" className={`title ${styles.h2}`} lines={['À la carte']} />
          </div>
          <div className={styles.menu}>
            <Tabs
              label="Gamme de carnets"
              tabs={gamme.map((g) => ({
                label: g.label,
                content: (
                  <>
                    <p className={`muted ${styles.menuNote}`}>{g.note}</p>
                    <ul className={styles.menuList}>
                      {g.slugs.map(bySlug).map((p) => (
                        <li key={p.slug}>
                          <Link href={`/carnets/${p.slug}`} className={styles.menuRow}>
                            <span className={styles.menuName}>{p.nom}</span>
                            <span className={`muted ${styles.menuSpec}`}>{p.grilles} · {p.format}</span>
                            <span className={`tabular ${styles.menuPrice}`}>
                              {p.disponibilite === 'bientot' ? 'Bientôt' : p.prix === 0 ? 'Offert' : p.prixAffiche}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ),
              }))}
            />
          </div>
        </section>

        {/* Avis */}
        <section className={`container ${styles.section}`} aria-labelledby="avis-titre">
          <div className={styles.head}>
            <Tag>Ils en parlent</Tag>
            <Split as="h2" id="avis-titre" className={`title ${styles.h2}`} lines={['Avis (presque) objectifs']} />
            <p className="label muted">Avis fictifs, en attendant les vrais</p>
          </div>
          <div className={styles.avis}>
            {avis.map((a) => (
              <figure key={a.auteur} className={styles.quote} data-reveal>
                <Stars n={a.note} />
                <blockquote className={styles.quoteText}>« {a.texte} »</blockquote>
                <figcaption className="label muted">{a.auteur}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Teaser Pass Podium */}
        <section className={styles.podium} aria-labelledby="podium-titre">
          <div className={`container ${styles.podiumInner}`}>
            <div>
              <Tag>Pass Podium</Tag>
              <Split as="h2" id="podium-titre" className={`title ${styles.podiumTitle}`} lines={['Le chrono ne ment jamais']} />
              <p className={styles.podiumText}>
                Grilles illimitées en ligne, défi chronométré chaque lundi et classement entre complices. Le podium remet les compteurs à zéro chaque semaine.
              </p>
              <Button href="/jouer#podium" size="lg" variant="dark">Prendre le départ</Button>
            </div>
            <p className={`title tabular ${styles.chrono}`} aria-label="Exemple de chrono : 4 minutes 32">04:32</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={`container ${styles.section}`} aria-labelledby="faq-titre">
          <div className={styles.head}>
            <Tag>FAQ</Tag>
            <Split as="h2" id="faq-titre" className={`title ${styles.h2}`} lines={['Questions fréquentes']} />
          </div>
          <Accordion items={faq} />
        </section>
      </main>

      <Footer />
    </>
  );
}
