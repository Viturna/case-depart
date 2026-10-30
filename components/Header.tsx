'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { n: '01', label: 'Accueil', href: '/' },
  { n: '02', label: 'Carnets', href: '/carnets' },
  { n: '03', label: 'Jouer', href: '/jouer' },
  { n: '04', label: 'Pass Podium', href: '/jouer#podium' },
];

export default function Header({ cartCount: propCartCount }: { cartCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const count = propCartCount ?? cartCount;

  // Les ancres (Pass Podium) ne marquent pas la page active
  const isActive = (href: string) => (href === '/' ? pathname === '/' : !href.includes('#') && pathname.startsWith(href));

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Case Départ, accueil">
          Case Départ
        </Link>

        <nav id="nav-principale" className={`${styles.nav} ${open ? styles.navOpen : ''}`} aria-label="Navigation principale">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.link}
              aria-current={isActive(l.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <span className={styles.num}>{l.n}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <Link href="/compte" className={styles.cart} aria-label="Mon compte">
            Compte
          </Link>
          <button
            type="button"
            className={styles.cart}
            onClick={() => setIsCartOpen(true)}
            aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
          >
            Panier <span className="tabular">({count})</span>
          </button>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="nav-principale"
          >
            {open ? 'Fermer' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}
