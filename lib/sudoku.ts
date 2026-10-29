// Générateur de sudoku 9×9 à solution unique. Une grille = tableau de 81 chiffres, 0 = case vide.

export type Level = 'echauffement' | 'sprint' | 'marathon';

// Nombre de cases données au départ par niveau
const CLUES: Record<Level, number> = { echauffement: 40, sprint: 32, marathon: 26 };

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function canPlace(g: number[], i: number, n: number): boolean {
  const r = Math.floor(i / 9), c = i % 9;
  const br = r - (r % 3), bc = c - (c % 3);
  for (let k = 0; k < 9; k++) {
    if (g[r * 9 + k] === n || g[k * 9 + c] === n) return false;
    if (g[(br + Math.floor(k / 3)) * 9 + bc + (k % 3)] === n) return false;
  }
  return true;
}

// Compte les solutions, s'arrête à `limit`.
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

function fill(g: number[]): boolean {
  const i = g.indexOf(0);
  if (i === -1) return true;
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(g, i, n)) {
      g[i] = n;
      if (fill(g)) return true;
      g[i] = 0;
    }
  }
  return false;
}

export function generate(level: Level): { puzzle: number[]; solution: number[] } {
  const solution = Array(81).fill(0);
  fill(solution);
  const puzzle = [...solution];
  let filled = 81;
  // Retire des cases tant que la solution reste unique
  for (const i of shuffle(Array.from({ length: 81 }, (_, k) => k))) {
    if (filled <= CLUES[level]) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (count([...puzzle], 2) !== 1) puzzle[i] = keep;
    else filled--;
  }
  return { puzzle, solution };
}
