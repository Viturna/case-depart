import React from 'react';
import styles from './CoversWall.module.css';
import Cover from './Cover';

const wallCovers = [
  { nom: 'Halloween', num: '01', sub: 'Carnet complet', rot: -3 },
  { nom: 'Noël', num: '02', sub: 'Carnet complet', rot: 2 },
  { nom: 'Saint-Valentin', num: '03', sub: 'Bientôt', rot: -1 },
  { nom: 'Pâques', num: '04', sub: 'Bientôt', rot: 3 },
  { nom: 'Fête de la musique', num: '05', sub: 'Bientôt', rot: -2 },
  { nom: 'Tour de l’année', num: '06', sub: 'Multi-thème', rot: 1 },
];

export default function CoversWall() {
  // Doubled list for seamless infinite loop
  const displayCovers = [...wallCovers, ...wallCovers];

  return (
    <section className={styles.coversWallSection} aria-label="Mur des couvertures de carnets">
      <div className="section-tag section-tag-dark">
        <span>08 / Le mur</span>
        <span>Tous les carnets</span>
      </div>

      <div className={styles.wallContainer}>
        <div className={styles.marqueeTrack}>
          {displayCovers.map((item, index) => (
            <div
              key={`wall-${item.num}-${index}`}
              className={styles.coverItem}
              style={{
                transform: `rotate(${item.rot}deg)`,
              }}
            >
              <Cover
                themeTitle={item.nom}
                number={`N°${item.num}`}
                subtitle={item.sub}
                variant="sable"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

