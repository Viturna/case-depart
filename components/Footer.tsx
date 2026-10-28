import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* 4 Colonnes séparées par des filets sable */}
        <div className={styles.columnsGrid}>
          <div className={styles.col}>
            <span className={styles.colTitle}>01 / LES CARNETS</span>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/carnets/carnet-noel">Carnet de Noël (Nouveau)</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/carnets/carnet-halloween">Carnet Halloween</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/carnets/tour-de-l-annee">Tour de l’année (Multi)</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/carnets/la-collection">La Collection intégrale</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/carnets">Tous les carnets PDF</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <span className={styles.colTitle}>02 / COMPÉTITION</span>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/jouer">Grille du jour en ligne</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/pass-podium">Pass Podium (Abonnement)</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/jouer#classement">Classement officiel</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/jouer#chrono">Le chrono de course</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <span className={styles.colTitle}>03 / LIGNE DE DÉPART</span>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/#niveaux">Échauffement › (Facile)</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/#niveaux">Sprint ›› (Moyen)</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/#niveaux">Marathon ››› (Difficile)</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/#ravitaillement">Les pauses Ravitaillement</Link>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <span className={styles.colTitle}>04 / ATELIER</span>
            <p className={styles.textSmall}>
              Des sudokus pensés pour le crayon, l’impression nette et la compétition en ligne.
            </p>
            <p className={styles.textSmall}>
              Contact complice : atelier@casedepart.fr
            </p>
          </div>
        </div>

        {/* Mot CASE DÉPART en géant */}
        <div className={styles.megaWordmark}>
          <p className={styles.megaTitle}>CASE DÉPART</p>
        </div>

        {/* Ligne mono inférieure */}
        <div className={styles.bottomBar}>
          <div>© 2026 CASE DÉPART · TOUS DROITS RÉSERVÉS</div>
          <div className={styles.bottomMotto}>
            <span>ÉCHAUFFEMENT</span>
            <span>·</span>
            <span>SPRINT</span>
            <span>·</span>
            <span>MARATHON</span>
            <span>·</span>
            <span>FIN DE GRILLE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

