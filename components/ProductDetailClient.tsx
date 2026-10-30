'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
import Accordion from '@/components/Accordion';
import GridPattern from '@/components/GridPattern';
import ProductCard from '@/components/ProductCard';
import type { ProductItem } from '@/components/Card';
import { getTheme } from '@/lib/themes';
import { useCart } from '@/context/CartContext';
import styles from '@/app/carnets/[slug]/page.module.css';

interface ProductDetailClientProps {
  product: ProductItem;
  allProducts: ProductItem[];
}

const GIFT_EXTRA = 2;

const pages = [
  { id: 'couv', label: 'Couverture', legende: 'La couverture, imprimable en A4 et en A5.' },
  { id: 'grille', label: 'Grille', legende: 'Page 14 : une grille Sprint, avec sa case chrono.' },
  { id: 'ravito', label: 'Ravitaillement', legende: 'Page 24 : la pause coloriage ou tirage astro.' },
  { id: 'corrections', label: 'Corrections', legende: 'En fin de carnet : toutes les solutions, pour les jours sans.' },
] as const;

type PageId = (typeof pages)[number]['id'];

const parcours = [
  { titre: 'Ligne de départ', p: 'P. 01–02', desc: 'Règles du jeu et case temps total.' },
  { titre: 'Échauffement ›', p: 'P. 03–12', desc: '10 grilles faciles pour se mettre en jambes.' },
  { titre: 'Ravitaillement n°1', p: 'P. 13', desc: 'Coloriage grand format.' },
  { titre: 'Sprint ››', p: 'P. 14–23', desc: '10 grilles moyennes, le chrono chauffe.' },
  { titre: 'Ravitaillement n°2', p: 'P. 24', desc: 'Tirage astro « Ton année à venir ».' },
  { titre: 'Marathon ›››', p: 'P. 25–34', desc: '10 grilles difficiles, endurance pure.' },
  { titre: 'Ligne d’arrivée', p: 'P. 35', desc: 'La grille finale qui boucle le carnet.' },
  { titre: 'Corrections', p: 'P. 37–46', desc: 'Toutes les solutions.' },
];

const avantages = [
  { titre: 'Imprime chez toi', texte: 'PDF reçu tout de suite, en A4 ou en A5 livret.', icon: 'print' },
  { titre: 'Noir et blanc OK', texte: 'Grilles pensées pour ménager ton encre.', icon: 'ink' },
  { titre: 'Trois allures', texte: 'De l’Échauffement au Marathon, sans sauter d’étape.', icon: 'levels' },
  { titre: 'En ligne aussi', texte: 'Rejoue les grilles au chrono sur le site.', icon: 'clock' },
] as const;

const faq = [
  { question: 'Je reçois quoi exactement ?', answer: 'Un lien de téléchargement avec deux PDF : la version A4 pleine page et la version A5 livret à plier.' },
  { question: 'Comment marche la version à offrir ?', answer: 'Pour 2 € de plus, le prénom de la personne apparaît sur la couverture, avec une carte cadeau à imprimer.' },
  { question: 'Ça s’imprime bien en noir et blanc ?', answer: 'Oui. Grilles et chiffres sont tracés en contraste franc, lisibles sur n’importe quelle imprimante de bureau.' },
  { question: 'Je débute, c’est pour moi ?', answer: 'Oui. Le carnet commence par les règles et 10 grilles d’Échauffement avant d’accélérer.' },
];

// Icônes au trait, 1.5px, couleur du texte
function Icon({ name }: { name: (typeof avantages)[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' as const };
  return (
    <svg className={styles.icon} viewBox="0 0 32 32" aria-hidden="true">
      {name === 'print' && (<><rect x="8" y="4" width="16" height="8" {...common} /><rect x="4" y="12" width="24" height="10" {...common} /><rect x="8" y="18" width="16" height="10" {...common} /></>)}
      {name === 'ink' && (<><path d="M16 4 L24 17 A8 8 0 1 1 8 17 Z" {...common} /><path d="M12 19 A4 4 0 0 0 16 23" {...common} /></>)}
      {name === 'levels' && (<><path d="M5 10 L11 16 L5 22" {...common} /><path d="M13 10 L19 16 L13 22" {...common} /><path d="M21 10 L27 16 L21 22" {...common} /></>)}
      {name === 'clock' && (<><circle cx="16" cy="18" r="10" {...common} /><path d="M16 12 V18 L20 20" {...common} /><path d="M13 4 H19" {...common} /></>)}
    </svg>
  );
}

// Vraies pages extraites du PDF final (pas des mockups) — seulement pour les
// thèmes qui en ont (automation/case-depart-template-*.html).
const REAL_PAGES: Record<string, Record<PageId, string>> = {
  'carnet-noel': {
    couv: '/covers/noel.jpg',
    grille: '/covers/noel-grille.jpg',
    ravito: '/covers/noel-ravito.jpg',
    corrections: '/covers/noel-corrections.jpg',
  },
  'carnet-halloween': {
    couv: '/covers/halloween.jpg',
    grille: '/covers/halloween-grille.jpg',
    ravito: '/covers/halloween-ravito.jpg',
    corrections: '/covers/halloween-corrections.jpg',
  },
};

// Aperçu d'une page du carnet
function PageMock({ id, product }: { id: PageId; product: ProductItem }) {
  const theme = getTheme(product.theme);
  const realPage = REAL_PAGES[product.slug]?.[id];
  if (realPage) {
    return (
      <div className={`${styles.sheet} ${id === 'couv' ? styles.cover : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={realPage} alt={pages.find((p) => p.id === id)!.label + ' du ' + product.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  if (id === 'couv') {
    return (
      <div className={`${styles.sheet} ${styles.cover}`} style={{ background: theme.bg, color: theme.ink }}>
        <GridPattern className={styles.coverGrid} />
        <span className="label">Case Départ</span>
        <span className={`title ${styles.coverTitle}`}>{theme.label}</span>
        <span className={`label ${styles.coverMeta}`}>{product.grilles}</span>
      </div>
    );
  }
  return (
    <div className={styles.sheet}>
      <div className={`label ${styles.sheetHead}`} style={{ borderColor: theme.bg }}>
        <span>{theme.label}</span>
        <span>{id === 'grille' ? 'Sprint ››' : id === 'ravito' ? 'Ravitaillement' : 'Corrections'}</span>
      </div>
      {id === 'grille' && (<><GridPattern className={styles.sheetGrid} /><span className="label muted">Chrono : __ : __</span></>)}
      {id === 'ravito' && (
        <div className={styles.ravito} style={{ color: theme.bg }} aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => <span key={i} />)}
        </div>
      )}
      {id === 'corrections' && (
        <div className={styles.miniGrids}>
          {Array.from({ length: 4 }, (_, i) => <GridPattern key={i} className={styles.miniGrid} />)}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [page, setPage] = useState<PageId>('couv');
  const [format, setFormat] = useState<'A4' | 'A5 livret'>('A4');
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  const theme = getTheme(product.theme);
  const soon = product.disponibilite === 'bientot';
  const free = product.prix === 0;
  const price = isGift ? product.prix + GIFT_EXTRA : product.prix;
  const priceLabel = free && !isGift ? 'Gratuit' : price.toFixed(2).replace('.', ',') + ' €';
  const specs = ['PDF', product.grilles, product.format, product.pages, 'Corrections incluses'].filter(Boolean);
  const current = pages.find((p) => p.id === page)!;

  const handleAddToCart = () => {
    addItem({
      slug: product.slug,
      nom: product.nom,
      format,
      isGift,
      recipientName: isGift ? recipientName : undefined,
      prix: price,
      prixAffiche: priceLabel,
      theme: product.theme,
    });
  };

  // Même thème d'abord, puis le reste ; jamais le produit affiché
  const related = allProducts
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => Number(b.theme === product.theme) - Number(a.theme === product.theme))
    .slice(0, 3);

  const collection = allProducts.find((p) => p.slug === 'la-collection');

  return (
    <>
      <Header />

      <main>
        <nav className={`container label ${styles.crumbs}`} aria-label="Fil d'Ariane">
          <Link href="/carnets">Carnets</Link>
          <span aria-hidden="true">/</span>
          <span className="muted">{theme.label}</span>
        </nav>

        {/* Achat : visuel à gauche, infos à droite */}
        <section className={`container ${styles.buy}`} aria-labelledby="produit-titre">
          <div className={styles.gallery}>
            <div className={styles.stage}>
              <PageMock id={page} product={product} />
            </div>
            <div className={styles.thumbs} role="group" aria-label="Pages du carnet">
              {pages.map((p) => (
                <button key={p.id} type="button" className={styles.thumb} aria-pressed={page === p.id} onClick={() => setPage(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            <p className={`muted ${styles.legend}`} aria-live="polite">{current.legende}</p>
          </div>

          <div className={styles.info}>
            <Tag>{theme.label}</Tag>
            <Split as="h1" id="produit-titre" trigger="load" className={`title ${styles.h1}`} lines={[product.nom]} />
            <p className={styles.desc}>{product.description}</p>

            <p className={`title tabular ${styles.price}`}>
              {soon ? 'Bientôt' : priceLabel}
              {product.prixBarre && !soon && <s className={`muted ${styles.priceOld}`}>{product.prixBarre}</s>}
            </p>

            {!soon && (
              <>
                <fieldset className={styles.field}>
                  <legend className="label muted">Format d’impression</legend>
                  <div className={styles.options}>
                    {(['A4', 'A5 livret'] as const).map((f) => (
                      <button key={f} type="button" className={styles.option} aria-pressed={format === f} onClick={() => setFormat(f)}>
                        <strong>{f}</strong>
                        <span className="muted">{f === 'A4' ? 'Pleine page, à plat' : 'Recto-verso, à plier'}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {!free && (
                  <div className={styles.field}>
                    <label className={styles.check}>
                      <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
                      Version à offrir (+2,00 €)
                    </label>
                    {isGift && (
                      <>
                        <label htmlFor="gift-name" className="sr-only">Prénom de la personne</label>
                        <input
                          id="gift-name"
                          type="text"
                          placeholder="Prénom de la personne"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className={styles.input}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {soon ? (
              <Button size="lg" fullWidth disabled>Bientôt disponible</Button>
            ) : (
              <Button size="lg" fullWidth onClick={handleAddToCart}>
                {free ? 'Je le veux, c’est gratuit' : `Ajouter au panier · ${priceLabel}`}
              </Button>
            )}

            <p className={`label ${styles.specs}`}>{specs.join(' · ')}</p>
          </div>
        </section>

        {/* Avantages */}
        <section className={styles.perks} aria-label="Les avantages du carnet">
          <ul className={`container ${styles.perksList}`}>
            {avantages.map((a) => (
              <li key={a.titre} className={styles.perk} data-reveal>
                <Icon name={a.icon} />
                <h2 className={styles.perkTitle}>{a.titre}</h2>
                <p className={`muted ${styles.perkText}`}>{a.texte}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Aperçu des pages + parcours */}
        <section className={`container ${styles.section}`} aria-labelledby="apercu-titre">
          <div className={styles.head}>
            <Tag>Aperçu</Tag>
            <Split as="h2" id="apercu-titre" className={`title ${styles.h2}`} lines={['Ce qu’il y a dedans']} />
          </div>
          <div className={styles.previews}>
            {pages.map((p) => (
              <figure key={p.id} className={styles.preview} data-reveal>
                <PageMock id={p.id} product={product} />
                <figcaption className="label muted">{p.label}</figcaption>
              </figure>
            ))}
          </div>
          <ol className={styles.parcours}>
            {parcours.map((e, i) => (
              <li key={e.titre} className={styles.etape}>
                <span className="label muted tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.etapeTitre}>{e.titre}</span>
                <span className={`muted ${styles.etapeDesc}`}>{e.desc}</span>
                <span className={`label tabular ${styles.etapePage}`}>{e.p}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className={`container ${styles.section} ${styles.faq}`} aria-labelledby="faq-titre">
          <div className={styles.head}>
            <Tag>FAQ</Tag>
            <Split as="h2" id="faq-titre" className={`title ${styles.h2}`} lines={['Avant de partir']} />
          </div>
          <Accordion items={faq} defaultOpenIndex={0} />
        </section>

        {/* La Collection, sauf sur sa propre fiche */}
        {collection && product.slug !== collection.slug && (
          <section className={styles.upsell} aria-labelledby="upsell-titre">
            <div className={`container ${styles.upsellInner}`}>
              <div>
                <Tag>Passe la seconde</Tag>
                <Split as="h2" id="upsell-titre" className={`title ${styles.h2}`} lines={['Toute la saison d’un coup']} />
                <p className={styles.upsellText}>{collection.description}</p>
              </div>
              <div className={styles.upsellBuy}>
                <p className={`title tabular ${styles.price}`}>
                  {collection.prixAffiche}
                  {collection.prixBarre && <s className={styles.priceOld}>{collection.prixBarre}</s>}
                </p>
                <Button href={`/carnets/${collection.slug}`} size="lg" variant="dark">Voir La Collection</Button>
              </div>
            </div>
          </section>
        )}

        {/* Carnets similaires */}
        <section className={`container ${styles.section}`} aria-labelledby="similaires-titre">
          <div className={styles.head}>
            <Tag>Dans la même course</Tag>
            <Split as="h2" id="similaires-titre" className={`title ${styles.h2}`} lines={['Carnets similaires']} />
          </div>
          <div className={styles.related}>
            {related.map((p) => (
              <div key={p.slug} data-reveal>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
