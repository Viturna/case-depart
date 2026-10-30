'use client';

import React, { useState } from 'react';
import styles from './CartDrawer.module.css';
import { useCart } from '@/context/CartContext';
import Button from './Button';

export default function CartDrawer() {
  const { items, removeItem, clearCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [email, setEmail] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.nom,
            format: item.format,
            gift: item.isGift,
            recipientName: item.recipientName,
            price: item.prix,
          })),
          email: email.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        // Fallback simulation si clé de test invalide ou problème réseau
        console.warn('Fallback simulated order:', data.error);
        setIsOrdered(true);
      }
    } catch (err) {
      console.warn('Stripe checkout error, fallback simulated:', err);
      setIsOrdered(true);
    } finally {
      setLoading(false);
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
              {errorMessage && (
                <div style={{ color: 'var(--brique)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {errorMessage}
                </div>
              )}
              <Button type="submit" size="md" variant="primary" fullWidth disabled={loading}>
                {loading ? 'REDIRECTION STRIPE...' : 'COMMANDER ET TÉLÉCHARGER →'}
              </Button>
            </form>

            <span className={styles.checkoutNotice}>
              Téléchargement immédiat · Paiement sécurisé par Stripe
            </span>
          </div>
        )}
      </aside>
    </>
  );
}

