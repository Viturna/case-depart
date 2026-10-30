import React from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import GridPattern from './GridPattern';
import { getTheme } from '@/lib/themes';
import { REAL_COVERS } from '@/lib/realCovers';
import type { ProductItem } from './Card';

// Carte produit VENDE : visuel teinté du thème, nom + prix, thème en gris.
export default function ProductCard({ product, href }: { product: ProductItem; href?: string }) {
  const theme = getTheme(product.theme);
  const soon = product.disponibilite === 'bientot';
  const realCover = REAL_COVERS[product.slug];

  return (
    <article className={`${styles.card} ${soon ? styles.soon : ''}`}>
      <Link href={href ?? `/carnets/${product.slug}`} className={styles.link}>
        <div className={styles.visual} style={realCover ? undefined : { background: theme.bg, color: theme.ink }}>
          {realCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={realCover}
              alt={'Couverture du ' + product.nom}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <GridPattern className={styles.grid} />
          )}
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          {!realCover && <span className={styles.cover}>{theme.label}</span>}
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
