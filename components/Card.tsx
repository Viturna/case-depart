import React from 'react';
import Link from 'next/link';
import styles from './Card.module.css';
import Cover from './Cover';
import Button from './Button';
import Badge from './Badge';
import LevelBadge, { LevelType } from './LevelBadge';

export interface ProductItem {
  slug: string;
  nom: string;
  theme: string;
  themeLabel: string;
  niveau: string;
  niveauLabel: string;
  format: string;
  prix: number;
  prixAffiche: string;
  prixBarre?: string;
  description: string;
  disponibilite: 'dispo' | 'bientot';
  dateDispo?: string;
  badge?: string;
  isFeatured?: boolean;
  grilles?: string;
  pages?: string;
  fenetre?: string;
  spec?: string;
}

interface CardProps {
  product: ProductItem;
  coverVariant?: 'sable' | 'sapin';
  coverNumber?: string;
}

export default function Card({
  product,
  coverVariant = 'sable',
  coverNumber = 'N°01',
}: CardProps) {
  const isBientot = product.disponibilite === 'bientot';
  const levelType = (product.niveau === 'echauffement' || product.niveau === 'sprint' || product.niveau === 'marathon')
    ? product.niveau as LevelType
    : 'all';

  return (
    <article className={styles.card}>
      <div className={`${styles.visualArea} ${coverVariant === 'sapin' ? styles.visualAreaDark : ''}`}>
        {product.badge && (
          <div className={styles.badgeWrapper}>
            <Badge size="sm" rotation={-3}>
              {product.badge}
            </Badge>
          </div>
        )}
        <div style={{ width: '100%', maxWidth: '200px' }}>
          <Cover
            themeTitle={product.themeLabel}
            number={coverNumber}
            variant={coverVariant}
            subtitle={product.grilles || '30 GRILLES'}
          />
        </div>
      </div>

      <div className={styles.infoArea}>
        <div className={styles.metaRow}>
          <span>{product.format}</span>
          <LevelBadge level={levelType} />
        </div>

        <h3 className={styles.title}>
          <Link href={`/carnets/${product.slug}`} style={{ color: 'inherit' }}>
            {product.nom}
          </Link>
        </h3>

        <p className={styles.description}>{product.description}</p>

        <div className={styles.footerRow}>
          <div className={styles.priceCol}>
            {product.prixBarre && (
              <span className={styles.priceOld}>{product.prixBarre}</span>
            )}
            {isBientot ? (
              <span className={styles.bientotText}>{product.dateDispo || 'BIENTÔT'}</span>
            ) : (
              <span className={styles.price}>{product.prixAffiche}</span>
            )}
          </div>

          <div>
            {isBientot ? (
              <Button size="sm" variant="secondary">
                ME PRÉVENIR
              </Button>
            ) : (
              <Button size="sm" variant="primary" href={`/carnets/${product.slug}`}>
                JE LE VEUX
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

