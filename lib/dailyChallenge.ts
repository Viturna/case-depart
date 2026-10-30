// Grille du jour du mode classé : seedée par la date, identique pour tous,
// recalculable à l'identique côté serveur pour vérifier une soumission
// sans jamais faire confiance au client (ni pour la solution, ni pour le temps).

export type Level = 'echauffement' | 'sprint' | 'marathon';

const CLUES: Record<Level, number> = { echauffement: 40, sprint: 32, marathon: 26 };

// mulberry32 — même algorithme que automation/src/prng.js, porté en TS.
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function canPlace(g: number[], i: number, n: number): boolean {
  const r = Math.floor(i / 9), c = i % 9;
  const br = r - (r % 3), bc = c - (c % 3);
  for (let k = 0; k < 9; k++) {
    if (g[r * 9 + k] === n || g[k * 9 + c] === n) return false;
    if (g[(br + Math.floor(k / 3)) * 9 + bc + (k % 3)] === n) return false;
  }
  return true;
}

function count(g: number[], limit: number): number {
  const i = g.indexOf(0);
  if (i === -1) return 1;
  let total = 0;
  for (let n = 1; n <= 9 && total < limit; n++) {
    if (canPlace(g, i, n)) {
      g[i] = n;
      total += count(g, limit - total);
      g[i] = 0;
    }
  }
  return total;
}

function fill(g: number[], rng: () => number): boolean {
  const i = g.indexOf(0);
  if (i === -1) return true;
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
    if (canPlace(g, i, n)) {
      g[i] = n;
      if (fill(g, rng)) return true;
      g[i] = 0;
    }
  }
  return false;
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Génère déterministiquement la grille du jour : même date + niveau => même grille partout. */
export function generateDaily(date: string, level: Level): { puzzle: number[]; solution: number[] } {
  const rng = mulberry32(seedFromString(`${date}-${level}`));
  const solution = Array(81).fill(0);
  fill(solution, rng);
  const puzzle = [...solution];
  let filled = 81;
  for (const i of shuffle(Array.from({ length: 81 }, (_, k) => k), rng)) {
    if (filled <= CLUES[level]) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (count([...puzzle], 2) !== 1) puzzle[i] = keep;
    else filled--;
  }
  return { puzzle, solution };
}
