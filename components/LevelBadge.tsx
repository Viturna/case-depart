import React from 'react';
import styles from './LevelBadge.module.css';

export type LevelType = 'echauffement' | 'sprint' | 'marathon' | 'all';

interface LevelBadgeProps {
  level: LevelType;
  onDark?: boolean;
  className?: string;
}

const levelLabels: Record<LevelType, { label: string; arrows: string }> = {
  echauffement: { label: 'Échauffement', arrows: '›' },
  sprint: { label: 'Sprint', arrows: '››' },
  marathon: { label: 'Marathon', arrows: '›››' },
  all: { label: 'Tous niveaux', arrows: '› ›› ›››' },
};

export default function LevelBadge({
  level,
  onDark = false,
  className = '',
}: LevelBadgeProps) {
  const { label, arrows } = levelLabels[level] || levelLabels.all;

  return (
    <span className={`${styles.levelBadge} ${onDark ? styles.onDark : ''} ${className}`}>
      <span>{label}</span>
      <span className={styles.arrows} aria-hidden="true">{arrows}</span>
    </span>
  );
}

