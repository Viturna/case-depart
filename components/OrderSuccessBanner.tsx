'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OrderSuccessBanner() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');

  const [confirmed, setConfirmed] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (success && sessionId) {
      fetch(`/api/confirm-order?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paid) {
            setConfirmed(true);
            if (data.customerEmail) {
              setEmailSentTo(data.customerEmail);
            }
          }
        })
        .catch((err) => console.error('Erreur confirmation commande:', err));
    }
  }, [success, sessionId]);

  if (!success) return null;

  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'var(--rose)',
        borderBottom: 'var(--border-1)',
        padding: '16px 24px',
        color: 'var(--sapin)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
          ■ COMMANDE VALIDÉE & PAIEMENT REÇU !
        </div>
        <p style={{ margin: 0, fontSize: '15px', fontFamily: 'var(--font-body)' }}>
          {emailSentTo ? (
            <>
              Un e-mail de confirmation avec tes liens de téléchargement PDF a été envoyé à <strong>{emailSentTo}</strong>.
            </>
          ) : (
            'Tes carnets de Sudoku sont prêts et ton e-mail de confirmation a été expédié !'
          )}
        </p>
      </div>
    </div>
  );
}

