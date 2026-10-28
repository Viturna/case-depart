'use client';

import React, { useState } from 'react';
import styles from './CartDrawer.module.css';
import { useCart } from '@/context/CartContext';
import Button from './Button';

export default function CartDrawer() {
  const { items, removeItem, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [email, setEmail] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsOrdered(true);
    }
  };

  const handleFinish = () => {
    clearCart();
    setIsOrdered(false);
    setIsCartOpen(false);
    setEmail('');
  };

  return (
    <>
      <div
        className={styles.drawerOverlay}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      <aside className={styles.drawer} aria-label="Panier d'achat">
        <div className={styles.header}>
          <h2 className={styles.title}>PANIER [{items.length}]</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
          >
            [FERMER ✕]
          </button>
        </div>

        <div className={styles.body}>
          {isOrdered ? (
            <div className={styles.checkoutSuccess} role="alert">
              <h3 className="h" style={{ fontSize: '22px' }}>PAIEMENT SIMULÉ VALIDÉ !</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>
                Merci pour ta commande ! Un e-mail contenant tes liens de téléchargement directs en PDF (A4 &amp; A5 livret) a été simulé et expédié à :
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '14px', wordBreak: 'break-all' }}>
                {email}
              </div>
              <p className="m" style={{ fontSize: '11px', marginTop: '8px' }}>
                Mode démo actif : aucun prélèvement bancaire réel.
              </p>
              <Button size="md" variant="primary" onClick={handleFinish}>
                FERMER LE PANIER
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className={styles.emptyText}>
              Ton panier est vide. Choisis un carnet pour prendre le départ !
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemName}>{item.nom}</span>
                  <span className={styles.itemPrice}>{item.prixAffiche}</span>
                </div>
                <div className={styles.itemMeta}>
                  <span>Format : {item.format}</span>
                  {item.isGift && <span> · Version à offrir ({item.recipientName || 'Prénom'})</span>}
                </div>
                <button
                  type="button"
                  className={styles.itemRemoveBtn}
                  onClick={() => removeItem(item.id)}
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>

        {!isOrdered && items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>TOTAL À PAYER</span>
              <span className={styles.totalValue}>{cartTotal.toFixed(2).replace('.', ',')} €</span>
            </div>

            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Ton e-mail pour recevoir les PDF"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  height: '48px',
                  border: 'var(--border-1)',
                  backgroundColor: 'var(--sable)',
                  color: 'var(--sapin)',
                  padding: '0 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  outline: 'none',
                  borderRadius: 0,
                }}
              />
              <Button type="submit" size="md" variant="primary" fullWidth>
                COMMANDER ET TÉLÉCHARGER →
              </Button>
            </form>

            <span className={styles.checkoutNotice}>
              Téléchargement immédiat · Paiement et e-mail simulés
            </span>
          </div>
        )}
      </aside>
    </>
  );
}

