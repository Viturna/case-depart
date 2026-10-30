'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './SudokuGame.module.css';
import rankedStyles from './RankedGame.module.css';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardEntry {
  nom: string;
  seconds: number;
  errors: number;
  isYou: boolean;
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function RankedGame() {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [puzzle, setPuzzle] = useState<number[] | null>(null);
  const [values, setValues] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [bestSeconds, setBestSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<{ seconds: number; rank: number; isNewBest: boolean } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const loadLeaderboard = useCallback(() => {
    fetch('/api/classement/leaderboard')
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(Boolean(user));
      setAuthChecked(true);
    });
    loadLeaderboard();
  }, [loadLeaderboard]);

  const loadGrille = useCallback(() => {
    setResult(null);
    setSubmitError('');
    fetch('/api/classement/grille')
      .then((r) => r.json())
      .then((data) => {
        if (data.puzzle) {
          setPuzzle(data.puzzle);
          setValues(data.puzzle);
          setBestSeconds(data.bestSeconds ?? null);
          setSeconds(0);
          setSelected(null);
        }
      });
  }, []);

  useEffect(() => {
    if (loggedIn) loadGrille();
  }, [loggedIn, loadGrille]);

  // Chrono d'affichage seulement : le temps officiel est calculé par le serveur.
  useEffect(() => {
    if (!puzzle || result) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [puzzle, result]);

  const full = values.length === 81 && values.every((v) => v !== 0);

  useEffect(() => {
    if (!full || result || submitting) return;
    setSubmitting(true);
    fetch('/api/classement/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid: values, errors: 0 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setSubmitError(data.error);
        } else {
          setResult({ seconds: data.seconds, rank: data.rank, isNewBest: data.isNewBest });
          loadLeaderboard();
        }
      })
      .finally(() => setSubmitting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  const play = (n: number) => {
    if (selected === null || !puzzle || puzzle[selected] !== 0 || result) return;
    setValues((v) => v.map((x, i) => (i === selected ? n : x)));
    setSubmitError('');
  };

  const move = (to: number) => {
    setSelected(to);
    cellRefs.current[to]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const r = Math.floor(i / 9), c = i % 9;
    if (/^[1-9]$/.test(e.key)) { play(Number(e.key)); e.preventDefault(); }
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { play(0); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { move(((r + 8) % 9) * 9 + c); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { move(((r + 1) % 9) * 9 + c); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { move(r * 9 + ((c + 8) % 9)); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move(r * 9 + ((c + 1) % 9)); e.preventDefault(); }
  };

  const sel = selected;
  const selValue = sel !== null ? values[sel] : 0;
  const remaining = (n: number) => 9 - values.filter((v) => v === n).length;

  if (!authChecked) return null;

  if (!loggedIn) {
    return (
      <div className={rankedStyles.gate}>
        <p>Connecte-toi pour jouer la grille du jour et apparaître au classement.</p>
        <Link href="/compte/connexion?next=/jouer" className={rankedStyles.gateLink}>Se connecter →</Link>
      </div>
    );
  }

  return (
    <div className={rankedStyles.wrap}>
      <div className={styles.game}>
        <div className={styles.bar}>
          <div className={styles.stats}>
            <p className="label muted">Niveau <span>Sprint</span></p>
            <p className="label muted">Meilleur temps du jour <span className="tabular">{bestSeconds !== null ? fmt(bestSeconds) : '—'}</span></p>
          </div>
        </div>

        <div className={styles.board}>
          <div className={styles.clockRow}>
            <p className={`title tabular ${styles.clock}`} aria-label={`Chrono : ${fmt(seconds)}`}>{fmt(seconds)}</p>
          </div>

          <div className={styles.gridWrap}>
            <div className={styles.grid} role="group" aria-label="Grille de sudoku classée">
              {puzzle && values.map((v, i) => {
                const given = puzzle[i] !== 0;
                const cls = [
                  styles.cell,
                  given ? styles.given : '',
                  v !== 0 && v === selValue ? styles.same : '',
                  i === sel ? styles.selected : '',
                ].join(' ');
                return (
                  <button
                    key={i}
                    ref={(el) => { cellRefs.current[i] = el; }}
                    type="button"
                    className={cls}
                    tabIndex={i === (sel ?? 0) ? 0 : -1}
                    aria-label={`Ligne ${Math.floor(i / 9) + 1}, colonne ${(i % 9) + 1}, ${v || 'vide'}${given ? ', donnée' : ''}`}
                    onClick={() => setSelected(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    disabled={Boolean(result)}
                  >
                    {v || ''}
                  </button>
                );
              })}
            </div>

            {result && (
              <div className={styles.finish} role="status">
                <p className="label">Soumis au classement</p>
                <p className={`title tabular ${styles.finishTime}`}>{fmt(result.seconds)}</p>
                <p>
                  {result.isNewBest ? 'Nouveau record du jour. ' : 'Pas mieux que ton essai précédent, mais soumis quand même. '}
                  Classé {result.rank}{result.rank === 1 ? 'er' : 'e'} aujourd’hui.
                </p>
                <button type="button" className={styles.again} onClick={loadGrille}>Retenter</button>
              </div>
            )}
          </div>

          {submitError && <p className={rankedStyles.error}>{submitError}</p>}

          {!result && (
            <div className={styles.pad} aria-label="Pavé de chiffres">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} type="button" className={styles.key} onClick={() => play(n)} disabled={remaining(n) === 0} aria-label={`Placer ${n}`}>
                  {n}
                  <span className={styles.left} aria-hidden="true">{remaining(n)}</span>
                </button>
              ))}
              <button type="button" className={`${styles.key} ${styles.erase}`} onClick={() => play(0)}>Effacer</button>
            </div>
          )}
        </div>
      </div>

      <aside className={rankedStyles.leaderboard}>
        <p className="label muted">Classement du jour</p>
        {leaderboard.length === 0 ? (
          <p className={rankedStyles.empty}>Personne n’a encore terminé la grille du jour. Sois le premier.</p>
        ) : (
          <ol className={rankedStyles.list}>
            {leaderboard.map((e, i) => (
              <li key={i} className={e.isYou ? rankedStyles.you : ''}>
                <span className="tabular">{i + 1}</span>
                <span>{e.nom}</span>
                <span className="tabular">{fmt(e.seconds)}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
