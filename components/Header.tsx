'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import SudokuMotif from './SudokuMotif';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount: propCartCount }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  const count = propCartCount !== undefined ? propCartCount : cartCount;

  const navLinks = [
    { label: 'Carnets', href: '/carnets' },
    { label: 'Carnet Noël', href: '/carnets/carnet-noel' },
    { label: 'Jeu en ligne', href: '/jouer' },
    { label: 'Pass Podium', href: '/pass-podium' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Case Départ — Accueil">
          <SudokuMotif size={32} themeColor="sable" variant="logo" fillTopLeft />
          <span>CASE DÉPART</span>
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.rightGroup}>
          <Link href="/styleguide" className={styles.accountLink} title="Design System & Styleguide">
            STYLEGUIDE
          </Link>
          <button
            type="button"
            className={styles.cartLink}
            onClick={() => setIsCartOpen(true)}
            aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}
          >
            <span>PANIER</span>
            <span className={styles.cartBadge}>[{count}]</span>
          </button>
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Menu mobile"
          >
            {mobileOpen ? 'FERMER' : 'MENU'}
          </button>
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {mobileOpen && (
        <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/styleguide"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            STYLEGUIDE
          </Link>
        </div>
      )}
    </header>
  );
}
