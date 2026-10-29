#!/usr/bin/env node
/**
 * Démonstration Phase 1 — Case Départ
 *
 * Génère une grille par niveau, affiche la seed finale, le nombre d'indices,
 * les techniques nécessaires et le temps de génération, puis mesure la
 * génération d'un carnet complet de 30 grilles.
 *
 * Exécution : npm run demo:sudoku
 */

'use strict';

const sudoku = require('../src/sudoku.js');

const LEVELS = sudoku.LEVEL_ORDER;
const CARNET = 'noel-2026';

function formatMs(startNs) {
  return (Number(process.hrtime.bigint() - startNs) / 1e6).toFixed(1) + ' ms';
}

console.log('');
console.log('CASE DÉPART — Phase 1 : générateur de sudoku');
console.log('=============================================');
console.log('');

for (const level of LEVELS) {
  const config = sudoku.LEVELS[level];
  const seed = `${CARNET}-${level}-01`;
  const start = process.hrtime.bigint();
  const grid = sudoku.generateGrid(seed, level);
  const elapsed = formatMs(start);

  console.log(`${config.label.toUpperCase()} — ${config.minClues} à ${config.maxClues} indices`);
  console.log(`Seed demandée : ${seed}`);
  console.log(`Seed finale   : ${grid.seed} (${grid.attempts} tentative(s))`);
  console.log(`Indices       : ${grid.clues}`);
  console.log(`Techniques    : ${grid.techniques.join(', ')}`);
  console.log(`Temps         : ${elapsed}`);
  console.log('');
  console.log(sudoku.displayGrid(grid.puzzle));
  console.log('');
  console.log(`Solution      : ${grid.solution}`);
  console.log('');
  console.log('---------------------------------------------');
  console.log('');
}

const start = process.hrtime.bigint();
const grids = sudoku.generateCarnetGrids({
  carnet: CARNET,
  counts: { echauffement: 10, sprint: 10, marathon: 10 },
  finalGrid: true
});
const elapsed = formatMs(start);

const clues = grids.map((grid) => grid.clues);
const retries = grids.reduce((total, grid) => total + grid.attempts - 1, 0);
const unique = new Set(grids.map((grid) => grid.puzzle)).size;

console.log(`CARNET COMPLET — ${grids.length} grilles (dont la grille finale)`);
console.log(`Temps total   : ${elapsed}`);
console.log(`Indices       : ${Math.min(...clues)} à ${Math.max(...clues)}`);
console.log(`Retries       : ${retries}`);
console.log(`Doublons      : ${grids.length - unique}`);
console.log('');
