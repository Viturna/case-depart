'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Bandeau from '@/components/Bandeau';
import Button from '@/components/Button';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
import ProductCard from '@/components/ProductCard';
import type { ProductItem } from '@/components/Card';
import { getTheme, THEMES } from '@/lib/themes';
import productsData from '@/data/products.json';
import styles from './page.module.css';

type Format = 'pdf' | 'en-ligne';
type Item = ProductItem & { formatType: Format; href?: string };

// Le jeu en ligne apparaît dans le catalogue sous le filtre « En ligne ».
const ONLINE: Item = {
  slug: 'jouer',
  href: '/jouer',
  nom: 'Grille du jour en ligne',
  theme: 'multi',
  themeLabel: 'Multi-thèmes',
  niveau: 'all',
  niveauLabel: '› ›› ›››',
  format: 'Navigateur',
  prix: 0,
  prixAffiche: 'Gratuit',
  description: '',
  disponibilite: 'dispo',
  badge: 'EN LIGNE',
  grilles: '1 grille par jour',
  formatType: 'en-ligne',
};

// Disponibles d'abord, du plus complet au plus léger ; les « bientôt » à la fin.
const items: Item[] = [
  ...(productsData as ProductItem[]).map((p) => ({ ...p, formatType: 'pdf' as Format })),
  ONLINE,
].sort((a, b) => Number(a.disponibilite === 'bientot') - Number(b.disponibilite === 'bientot') || b.prix - a.prix);

// Thèmes de lancement d'abord (ordre de lib/themes), puis les autres présents dans les données
const themeOptions = ['all', ...Array.from(new Set([...Object.keys(THEMES), ...items.map((p) => p.theme)]))]
  .filter((t) => t === 'all' || items.some((p) => p.theme === t));

const levelOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Échauffement ›', value: 'echauffement' },
  { label: 'Sprint ››', value: 'sprint' },
  { label: 'Marathon ›››', value: 'marathon' },
];

const formatOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'PDF à imprimer', value: 'pdf' },
  { label: 'En ligne', value: 'en-ligne' },
];

const quiz = [
  { letter: 'A', text: 'Je découvre. Sois gentil pour démarrer.', level: 'echauffement', verdict: 'Échauffement ›', desc: 'Des déductions directes pour prendre le rythme sans te prendre la tête.' },
  { letter: 'B', text: 'J’en fais de temps en temps, dans le train ou le dimanche.', level: 'sprint', verdict: 'Sprint ››', desc: 'Tu connais la piste. Le crayon chauffe, la gomme commence à travailler.' },
  { letter: 'C', text: 'Je finis celles du journal. Au stylo bille.', level: 'marathon', verdict: 'Marathon ›››', desc: 'Aucun respect pour la gomme. Des grilles sans concession, et le podium en ligne.' },
];

function Chips({ label, options, value, onChange }: {
  label: string;
  options: { label: string; value: string; swatch?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className={styles.group}>
      <legend className={`label muted ${styles.legend}`}>{label}</legend>
      <div className={styles.chips}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={styles.chip}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.swatch && <span className={styles.swatch} style={{ background: o.swatch }} aria-hidden="true" />}
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function CataloguePage() {
  const [theme, setTheme] = useState('all');
  const [level, setLevel] = useState('all');
  const [format, setFormat] = useState('all');
  const [answer, setAnswer] = useState<number | null>(null);

  // Lien depuis l'accueil : /carnets?niveau=sprint
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get('niveau');
    if (n && levelOptions.some((o) => o.value === n)) setLevel(n);
  }, []);

  const results = useMemo(
    () => items.filter((p) =>
      (theme === 'all' || p.theme === theme) &&
      (level === 'all' || p.niveau === level || p.niveau === 'all') &&
      (format === 'all' || p.formatType === format)
    ),
    [theme, level, format]
  );

  const reset = () => { setTheme('all'); setLevel('all'); setFormat('all'); };
  const isFiltered = theme !== 'all' || level !== 'all' || format !== 'all';

  const pickLevel = (l: string) => {
    setLevel(l);
    document.getElementById('resultats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Header />

      <main>
        <section className={`container ${styles.intro}`} aria-labelledby="catalogue-titre">
          <Tag>Catalogue</Tag>
          <Split as="h1" id="catalogue-titre" trigger="load" className={`title ${styles.h1}`} lines={['Tous les carnets']} />
          <div className={styles.introFoot}>
            <p className={styles.introText}>
              Un thème par fête, trois allures, des corrections pour les jours sans. À imprimer en PDF ou à jouer en ligne.
            </p>
            <p className="label muted tabular">{items.length} références</p>
          </div>
        </section>

        <Bandeau />

        <div className={styles.filters} role="search" aria-label="Filtrer les carnets">
          <div className={`container ${styles.filtersInner}`}>
            <Chips
              label="Thème"
              value={theme}
              onChange={setTheme}
              options={themeOptions.map((t) =>
                t === 'all' ? { label: 'Tous', value: t } : { label: getTheme(t).label, value: t, swatch: getTheme(t).bg }
              )}
            />
            <Chips label="Niveau" value={level} onChange={setLevel} options={levelOptions} />
            <Chips label="Format" value={format} onChange={setFormat} options={formatOptions} />
          </div>
        </div>

        <section id="resultats" className={`container ${styles.results}`} aria-label="Résultats">
          <div className={styles.resultsHead}>
            <p className="label tabular" aria-live="polite">
              {results.length} carnet{results.length > 1 ? 's' : ''}
            </p>
            {isFiltered && (
              <button type="button" className={`label ${styles.reset}`} onClick={reset}>Effacer les filtres ×</button>
            )}
          </div>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <p className={`title ${styles.emptyTitle}`}>Faux départ.</p>
              <p className="muted">Aucun carnet ne coche toutes ces cases. Lâche un filtre, on t’attend sur la ligne.</p>
              <Button onClick={reset}>Effacer les filtres</Button>
            </div>
          ) : (
            <div className={styles.grid}>
              {results.map((p, i) => (
                <div key={p.slug} className={styles.cell} style={{ '--i': i } as React.CSSProperties}>
                  <ProductCard product={p} href={p.href} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.quiz} aria-labelledby="quiz-titre">
          <div className={`container ${styles.quizInner}`}>
            <div className={styles.quizIntro}>
              <Tag>Trouve ton allure</Tag>
              <Split as="h2" id="quiz-titre" className={`title ${styles.h2}`} lines={['Tu cours à quelle vitesse ?']} />
              <p className="muted">Une question, une réponse honnête. On te dit par où attaquer.</p>
            </div>
            <div>
              <ul className={styles.quizList}>
                {quiz.map((q, i) => (
                  <li key={q.letter}>
                    <button type="button" className={styles.quizOption} aria-pressed={answer === i} onClick={() => setAnswer(i)}>
                      <span className={`title ${styles.quizLetter}`}>{q.letter}</span>
                      <span>{q.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div aria-live="polite">
                {answer !== null && (
                  <div className={styles.verdict}>
                    <p className="label">Allure conseillée</p>
                    <p className={`title ${styles.verdictTitle}`}>{quiz[answer].verdict}</p>
                    <p>{quiz[answer].desc}</p>
                    <Button size="sm" onClick={() => pickLevel(quiz[answer].level)}>Voir les carnets à cette allure</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
