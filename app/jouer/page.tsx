import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Tag from '@/components/Tag';
import Split from '@/components/Split';
import Button from '@/components/Button';
import SudokuGame from '@/components/SudokuGame';
import RankedGame from '@/components/RankedGame';
import styles from './page.module.css';

export const metadata = {
  title: 'Jouer en ligne — Case Départ',
  description: 'Une grille de sudoku à jouer dans le navigateur, trois niveaux et un chrono. Le Pass Podium ajoute le classement.',
};

const regles = [
  'Chaque ligne, colonne et bloc 3×3 contient les chiffres de 1 à 9, une seule fois.',
  'Clique une case, puis un chiffre. Au clavier : flèches pour bouger, 1–9 pour écrire, Retour pour effacer.',
  'Une erreur s’affiche en rouge souligné. Elle compte, mais tu peux la corriger.',
  'Ton meilleur temps par niveau reste en mémoire sur cet appareil.',
];

// Comparatif façon carte : la colonne de droite aligne ce que chaque formule inclut
const comparatif = [
  { label: 'Grille du jour, 3 niveaux', gratuit: true, podium: true },
  { label: 'Chrono et record perso', gratuit: true, podium: true },
  { label: 'Défi classé quotidien (Sprint)', gratuit: true, podium: true },
  { label: 'Classement entre complices', gratuit: true, podium: true },
  { label: 'Grilles illimitées', gratuit: false, podium: true },
  { label: 'Grilles des carnets en version en ligne', gratuit: false, podium: true },
];

export default function JouerPage() {
  return (
    <>
      <Header />

      <main>
        <section className={`container ${styles.intro}`} aria-labelledby="jouer-titre">
          <Tag>Jouer en ligne</Tag>
          <Split as="h1" id="jouer-titre" trigger="load" className={`title ${styles.h1}`} lines={['La grille du jour']} />
          <p className={styles.introText}>
            Pas d’imprimante sous la main ? Une grille, un chrono, et c’est parti. Choisis ton allure.
          </p>
        </section>

        <section className={`container ${styles.play}`} aria-label="Grille de sudoku">
          <SudokuGame />
          <aside className={styles.rules}>
            <Tag>Comment jouer</Tag>
            <ol className={styles.rulesList}>
              {regles.map((r, i) => (
                <li key={i}>
                  <span className="label muted tabular">{String(i + 1).padStart(2, '0')}</span>
                  <p>{r}</p>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        <section id="classement" className={`container ${styles.classement}`} aria-labelledby="classement-titre">
          <Tag>Défi du jour</Tag>
          <Split as="h2" id="classement-titre" className={`title ${styles.h2}`} lines={['Le chrono ne ment jamais']} />
          <p className={styles.introText}>
            Même grille Sprint pour tout le monde, chaque jour. Connecte-toi, résous-la, ton temps (chronométré par le serveur, pas par ton navigateur) t’inscrit au classement.
          </p>
          <RankedGame />
        </section>

        <section id="podium" className={styles.podium} aria-labelledby="podium-titre">
          <div className={`container ${styles.podiumInner}`}>
            <div className={styles.podiumIntro}>
              <Tag>Pass Podium</Tag>
              <Split as="h2" id="podium-titre" className={`title ${styles.h2}`} lines={['Encore plus de course']} />
              <p>
                Le classement quotidien est gratuit. Le Pass Podium ajoutera les grilles illimitées et les grilles des carnets jouables en ligne.
              </p>
              <Button href="mailto:contact@viturna.fr?subject=Pass%20Podium" size="lg" variant="dark">Me prévenir au lancement</Button>
            </div>

            <table className={styles.compare}>
              <caption className="sr-only">Ce qu’inclut chaque formule</caption>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Fonction</span></th>
                  <th scope="col" className="label">Gratuit</th>
                  <th scope="col" className="label">Podium</th>
                </tr>
              </thead>
              <tbody>
                {comparatif.map((c) => (
                  <tr key={c.label}>
                    <th scope="row">{c.label}</th>
                    <td>{c.gratuit ? <span aria-label="Inclus">●</span> : <span aria-label="Non inclus" className={styles.no}>—</span>}</td>
                    <td><span aria-label="Inclus">●</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
