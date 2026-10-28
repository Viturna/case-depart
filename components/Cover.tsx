import React from 'react';
import styles from './Cover.module.css';
import SudokuMotif from './SudokuMotif';

interface CoverProps {
  number?: string;
  themeTitle: string;
  subtitle?: string;
  variant?: 'sable' | 'sapin';
  rotation?: number;
  className?: string;
  numbers?: (number | string | null)[];
}

export default function Cover({
  number = 'N°01',
  themeTitle,
  subtitle = '30 GRILLES + 1 ARRIVÉE',
  variant = 'sable',
  rotation = 0,
  className = '',
  numbers,
}: CoverProps) {
  const isSapin = variant === 'sapin';

  return (
    <div
      className={`${styles.coverContainer} ${className}`}
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      <div className={`${styles.cover} ${isSapin ? styles.variantSapin : styles.variantSable}`}>
        <div className={styles.topBar}>
          <span>CASE DÉPART</span>
          <span>{number}</span>
        </div>

        <div className={styles.centerArea}>
          <div className={styles.motifWrapper}>
            <SudokuMotif
              size="100%"
              variant="cover"
              themeColor={isSapin ? 'sable' : 'sapin'}
              numbers={numbers}
            />
          </div>
          <h4 className={styles.title}>{themeTitle}</h4>
        </div>

        <div className={styles.bottomBar}>
          <span>PDF IMPRIMABLE</span>
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
  );
}

