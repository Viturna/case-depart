import React from 'react';
import styles from './Tag.module.css';

// Étiquette de section entre crochets : [ À la une ]
export default function Tag({ children, as: As = 'p' }: { children: React.ReactNode; as?: 'p' | 'span' | 'h2' }) {
  return <As className={styles.tag}>[ {children} ]</As>;
}
