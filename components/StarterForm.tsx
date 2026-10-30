'use client';

import React, { useState } from 'react';
import styles from './StarterForm.module.css';
import Button from './Button';

export default function StarterForm() {
  const [email, setEmail] = useState('');
  const [consentement, setConsentement] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !consentement) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consentement }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setLoading(false);
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError('Une erreur est survenue, réessaie.');
    }
    setLoading(false);
  };

  return (
    <section id="offert" className={styles.starterSection} aria-label="Le Starter offert">
      <div style={{ flex: '1 1 100%' }} className="section-tag">
        <span>09 / Le Starter</span>
        <span>0,00 €</span>
      </div>

      <div className={styles.leftCol}>
        <h2 className={styles.title}>
          Ton premier carnet, <span className={styles.highlight}>offert</span>
        </h2>
        <p className={styles.description}>
          3 grilles (une par niveau), 1 coloriage ravitaillement et les corrections, au thème du moment. Contre ton e-mail, c’est tout.
        </p>
      </div>

      <div className={styles.formCol}>
        {isSubmitted ? (
          <div className={styles.successBox} role="alert">
            <h3 className={styles.successTitle}>C’EST PARTI !</h3>
            <p className={styles.successText}>
              Vérifie ta boîte mail ({email}), ton lien de téléchargement PDF arrive à toute allure. À tes crayons !
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label htmlFor="starter-email" className={styles.label}>
              Ton e-mail
            </label>
            <input
              id="starter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.fr"
              required
              className={styles.inputField}
            />
            <label style={{ display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={consentement}
                onChange={(e) => setConsentement(e.target.checked)}
                required
                style={{ marginTop: '3px' }}
              />
              J’accepte de recevoir le Starter et des e-mails sur les prochains carnets. Désinscription en un clic.
            </label>
            {error && <p style={{ color: 'var(--brique)', fontSize: '13px' }}>{error}</p>}
            <Button type="submit" size="lg" variant="primary" disabled={loading}>
              {loading ? 'ENVOI…' : 'JE LE VEUX →'}
            </Button>
            <p className={styles.notice}>
              Pas de spam. Juste ton carnet et un mot pour le prochain thème.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
