'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './SudokuGame.module.css';
import { generate, type Level } from '@/lib/sudoku';

const LEVELS: { value: Level; label: string }[] = [
  { value: 'echauffement', label: 'Échauffement ›' },
  { value: 'sprint', label: 'Sprint ››' },
  { value: 'marathon', label: 'Marathon ›››' },
];

const BEST_KEY = 'cd-best';

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function readBest(): Partial<Record<Level, number>> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { return {}; }
}

export default function SudokuGame() {
  const [level, setLevel] = useState<Level>('echauffement');
  const [puzzle, setPuzzle] = useState<number[] | null>(null);
  const [solution, setSolution] = useState<number[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [best, setBest] = useState<Partial<Record<Level, number>>>({});
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const done = puzzle !== null && values.length === 81 && values.every((v, i) => v === solution[i]);

  // Génération côté client seulement (aléatoire = pas de rendu serveur identique)
  const newGame = useCallback((l: Level) => {
    const g = generate(l);
    setPuzzle(g.puzzle);
    setSolution(g.solution);
    setValues(g.puzzle);
    setSelected(null);
    setErrors(0);
    setSeconds(0);
    setPaused(false);
  }, []);

  useEffect(() => { newGame(level); setBest(readBest()); }, [level, newGame]);

  // Chrono
  useEffect(() => {
    if (!puzzle || paused || done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [puzzle, paused, done]);

  // Record perso à l'arrivée
  useEffect(() => {
    if (!done) return;
    const b = readBest();
    if (!b[level] || seconds < b[level]!) {
      b[level] = seconds;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch {}
      setBest(b);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = (n: number) => {
    if (selected === null || !puzzle || puzzle[selected] !== 0 || paused || done) return;
    if (n !== 0 && n !== solution[selected] && values[selected] !== n) setErrors((e) => e + 1);
    setValues((v) => v.map((x, i) => (i === selected ? n : x)));
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
  const related = (i: number) => {
    if (sel === null) return false;
    const r = Math.floor(i / 9), c = i % 9, sr = Math.floor(sel / 9), sc = sel % 9;
    return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  };
  const selValue = sel !== null ? values[sel] : 0;
  const remaining = (n: number) => 9 - values.filter((v, i) => v === n && v === solution[i]).length;

  return (
    <div className={styles.game}>
      <div className={styles.bar}>
        <div className={styles.levels} role="group" aria-label="Niveau">
          {LEVELS.map((l) => (
            <button key={l.value} type="button" className={styles.level} aria-pressed={level === l.value} onClick={() => setLevel(l.value)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className={styles.stats}>
          <p className="label muted">Erreurs <span className="tabular">{errors}</span></p>
          <p className="label muted">Record <span className="tabular">{best[level] !== undefined ? fmt(best[level]!) : '—'}</span></p>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.clockRow}>
          <p className={`title tabular ${styles.clock}`} aria-label={`Chrono : ${fmt(seconds)}`}>{fmt(seconds)}</p>
          <button type="button" className={`label ${styles.pause}`} onClick={() => setPaused(!paused)} disabled={done || !puzzle}>
            {paused ? 'Reprendre' : 'Pause'}
          </button>
        </div>

        <div className={styles.gridWrap}>
          <div className={`${styles.grid} ${paused ? styles.hidden : ''}`} role="group" aria-label="Grille de sudoku">
            {puzzle && values.map((v, i) => {
              const given = puzzle[i] !== 0;
              const wrong = !given && v !== 0 && v !== solution[i];
              const cls = [
                styles.cell,
                given ? styles.given : '',
                wrong ? styles.wrong : '',
                related(i) ? styles.related : '',
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
                  aria-label={`Ligne ${Math.floor(i / 9) + 1}, colonne ${(i % 9) + 1}, ${v || 'vide'}${given ? ', donnée' : ''}${wrong ? ', erreur' : ''}`}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  {v || ''}
                </button>
              );
            })}
          </div>
          {paused && <p className={`title ${styles.overlay}`}>Pause café</p>}
          {done && (
            <div className={styles.finish} role="status">
              <p className="label">Ligne d’arrivée</p>
              <p className={`title tabular ${styles.finishTime}`}>{fmt(seconds)}</p>
              <p>{errors === 0 ? 'Sans une seule erreur. Respect.' : `${errors} erreur${errors > 1 ? 's' : ''} en route. Ça arrive aux meilleurs.`}</p>
              <button type="button" className={styles.again} onClick={() => newGame(level)}>Nouvelle grille</button>
            </div>
          )}
        </div>

        <div className={styles.pad} aria-label="Pavé de chiffres">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} type="button" className={styles.key} onClick={() => play(n)} disabled={remaining(n) === 0} aria-label={`Placer ${n}`}>
              {n}
              <span className={styles.left} aria-hidden="true">{remaining(n)}</span>
            </button>
          ))}
          <button type="button" className={`${styles.key} ${styles.erase}`} onClick={() => play(0)}>Effacer</button>
        </div>

        <button type="button" className={`label ${styles.newGrid}`} onClick={() => newGame(level)}>Nouvelle grille ↻</button>
      </div>
    </div>
  );
}
