import React from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import GridPattern from './GridPattern';
import { getTheme } from '@/lib/themes';
import type { ProductItem } from './Card';

// Carte produit VENDE : visuel teinté du thème, nom + prix, thème en gris.
export default function ProductCard({ product, href }: { product: ProductItem; href?: string }) {
  const theme = getTheme(product.theme);
  const soon = product.disponibilite === 'bientot';

  return (
    <article className={`${styles.card} ${soon ? styles.soon : ''}`}>
      <Link href={href ?? `/carnets/${product.slug}`} className={styles.link}>
        <div className={styles.visual} style={{ background: theme.bg, color: theme.ink }}>
          <GridPattern className={styles.grid} />
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <span className={styles.cover}>{theme.label}</span>
        </div>
        <div className={styles.row}>
          <h3 className={styles.name}>{product.nom}</h3>
          <span className={`tabular ${styles.price}`}>{soon ? 'Bientôt disponible' : product.prix === 0 ? 'Gratuit' : product.prixAffiche}</span>
        </div>
        <p className={`muted ${styles.meta}`}>{theme.label} · {product.grilles}</p>
      </Link>
    </article>
  );
}
