/**
 * Tests du générateur de sudoku — Case Départ
 * Exécution : node --test tests/
 *
 * Couverture :
 *   - déterminisme par graine ;
 *   - 30 grilles générées par niveau ;
 *   - solution unique et cohérente ;
 *   - plages d'indices et techniques respectées ;
 *   - aucune grille en double ;
 *   - performance d'un carnet de 30 grilles (temps affiché).
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const sudoku = require('../src/sudoku.js');

const LEVELS = sudoku.LEVEL_ORDER;
const GRIDS_PER_LEVEL = 30;
const CARNET = 'tests-2026';

function pad2(value) {
  return value < 10 ? '0' + value : String(value);
}

function unitIsComplete(board, unit) {
  const seen = new Set();
  for (const cell of unit) {
    const value = board[cell];
    if (value < 1 || value > 9) {
      return false;
    }
    seen.add(value);
  }
  return seen.size === 9;
}

function buildUnits() {
  const units = [];

  for (let r = 0; r < 9; r++) {
    units.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  }
  for (let c = 0; c < 9; c++) {
    units.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  }
  for (let b = 0; b < 9; b++) {
    const startRow = Math.floor(b / 3) * 3;
    const startCol = (b % 3) * 3;
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push((startRow + r) * 9 + startCol + c);
      }
    }
    units.push(cells);
  }

  return units;
}

const UNITS = buildUnits();
const ADVANCED = [
  'naked-pair',
  'hidden-pair',
  'pointing',
  'claiming',
  'naked-triple',
  'x-wing'
];

// ---------------------------------------------------------------------------
// Génération mesurée : 30 grilles par niveau
// ---------------------------------------------------------------------------

const GENERATED = {};
const LEVEL_TIMES = {};
const generationStart = process.hrtime.bigint();

for (const level of LEVELS) {
  GENERATED[level] = [];
  const start = process.hrtime.bigint();

  for (let index = 1; index <= GRIDS_PER_LEVEL; index++) {
    const seed = `${CARNET}-${level}-${pad2(index)}`;
    GENERATED[level].push(sudoku.generateGrid(seed, level));
  }

  LEVEL_TIMES[level] = Number(process.hrtime.bigint() - start) / 1e6;
}

const TOTAL_GENERATION_MS =
  Number(process.hrtime.bigint() - generationStart) / 1e6;

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

test('performance — 30 grilles par niveau générées rapidement', () => {
  for (const level of LEVELS) {
    console.log(
      `  ${level.padEnd(13)} : ${LEVEL_TIMES[level].toFixed(1)} ms pour ${GRIDS_PER_LEVEL} grilles`
    );
  }
  console.log(
    `  TOTAL          : ${TOTAL_GENERATION_MS.toFixed(1)} ms pour ${GRIDS_PER_LEVEL * LEVELS.length} grilles`
  );

  assert.ok(
    TOTAL_GENERATION_MS < 15000,
    `génération trop lente : ${TOTAL_GENERATION_MS.toFixed(0)} ms`
  );
});

// ---------------------------------------------------------------------------
// Niveaux et techniques
// ---------------------------------------------------------------------------

for (const level of LEVELS) {
  test(`niveau ${level} — 30 grilles conformes`, () => {
    const grids = GENERATED[level];
    const config = sudoku.LEVELS[level];

    assert.equal(grids.length, GRIDS_PER_LEVEL);

    for (const grid of grids) {
      assert.equal(grid.level, level);
      assert.match(grid.puzzle, /^[0-9]{81}$/);
      assert.match(grid.solution, /^[1-9]{81}$/);
      assert.ok(
        grid.clues >= config.minClues && grid.clues <= config.maxClues,
        `${grid.seed} : ${grid.clues} indices hors de [${config.minClues}, ${config.maxClues}]`
      );
      assert.equal(
        grid.puzzle.split('').filter((value) => value !== '0').length,
        grid.clues,
        `${grid.seed} : nombre d'indices annoncé incohérent`
      );

      // La graine finale suit le format public ou une chaîne de retries.
      const escaped = `${CARNET}-${level}-${pad2(grids.indexOf(grid) + 1)}`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      assert.match(grid.seed, new RegExp(`^${escaped}(-retry\\d+)?$`));
      if (grid.seed !== escaped) {
        assert.ok(grid.attempts > 1, 'une graine retry doit correspondre à plusieurs tentatives');
      }

      // La solution est une grille complète valide.
      const solutionBoard = sudoku.toBoard(grid.solution);
      for (const unit of UNITS) {
        assert.ok(unitIsComplete(solutionBoard, unit), `${grid.seed} : solution invalide`);
      }

      // Le puzzle est cohérent avec la solution.
      const puzzleBoard = sudoku.toBoard(grid.puzzle);
      for (let i = 0; i < 81; i++) {
        if (puzzleBoard[i] !== 0) {
          assert.equal(
            puzzleBoard[i],
            solutionBoard[i],
            `${grid.seed} : case ${i} incohérente avec la solution`
          );
        }
      }

      // Solution unique.
      assert.equal(
        sudoku.countSolutions(grid.puzzle, 2),
        1,
        `${grid.seed} : solution non unique`
      );

      const solved = sudoku.solveBacktracking(grid.puzzle);
      assert.ok(solved, `${grid.seed} : aucune solution`);
      assert.equal(
        sudoku.boardToString(solved),
        grid.solution,
        `${grid.seed} : la solution retournée diffère de la solution attendue`
      );

      // Techniques cohérentes avec le niveau.
      const rating = sudoku.ratePuzzle(grid.puzzle);
      assert.ok(rating.solved, `${grid.seed} : non résoluble logiquement`);
      assert.equal(rating.level, level, `${grid.seed} : niveau réel ${rating.level}`);

      if (level === 'echauffement') {
        assert.deepEqual(
          grid.techniques.filter((t) => t !== 'naked-single'),
          [],
          `${grid.seed} : techniques non autorisées ${grid.techniques.join(', ')}`
        );
      } else if (level === 'sprint') {
        assert.ok(
          grid.techniques.includes('hidden-single'),
          `${grid.seed} : hidden-single manquant`
        );
        assert.deepEqual(
          grid.techniques.filter(
            (t) => t !== 'naked-single' && t !== 'hidden-single'
          ),
          [],
          `${grid.seed} : technique avancée interdite ${grid.techniques.join(', ')}`
        );
      } else {
        assert.ok(
          grid.techniques.some((t) => ADVANCED.includes(t)),
          `${grid.seed} : aucune technique avancée`
        );
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Déterminisme
// ---------------------------------------------------------------------------

test('déterminisme — même graine publique = grille identique', () => {
  for (const level of LEVELS) {
    const seed = `${CARNET}-determinisme-${level}`;
    const first = sudoku.generateGrid(seed, level);
    const second = sudoku.generateGrid(seed, level);

    assert.deepEqual(second, first);
  }
});

test('déterminisme — une graine différente change la grille', () => {
  const first = sudoku.generateGrid('graine-a', 'echauffement');
  const second = sudoku.generateGrid('graine-b', 'echauffement');

  assert.notEqual(first.puzzle, second.puzzle);
});

// ---------------------------------------------------------------------------
// Doublons
// ---------------------------------------------------------------------------

test('aucune grille en double dans le jeu de 90 grilles', () => {
  const puzzles = new Set();
  for (const level of LEVELS) {
    for (const grid of GENERATED[level]) {
      assert.ok(!puzzles.has(grid.puzzle), `grille en double : ${grid.seed}`);
      puzzles.add(grid.puzzle);
    }
  }
  assert.equal(puzzles.size, GRIDS_PER_LEVEL * LEVELS.length);
});

test('carnet de 30 grilles — aucun doublon et grille finale optionnelle', () => {
  const grids = sudoku.generateCarnetGrids({
    carnet: 'carnet-test',
    counts: { echauffement: 10, sprint: 10, marathon: 10 },
    finalGrid: true
  });

  assert.equal(grids.length, 31);

  const puzzles = new Set(grids.map((grid) => grid.puzzle));
  assert.equal(puzzles.size, grids.length);

  const finalGrid = grids[grids.length - 1];
  assert.equal(finalGrid.level, 'marathon');
  assert.match(finalGrid.seed, /^carnet-test-final-01(-retry\d+)?$/);
});

// ---------------------------------------------------------------------------
// Utilitaires publics
// ---------------------------------------------------------------------------

test('countSolutions — grille vide plafonnée à la limite', () => {
  const empty = '0'.repeat(81);
  assert.equal(sudoku.countSolutions(empty, 2), 2);
});

test('displayGrid — rendu lisible avec séparateurs de blocs', () => {
  const grid = sudoku.generateGrid('affichage-01', 'echauffement');
  const display = sudoku.displayGrid(grid.puzzle);

  assert.equal(display.split('\n').length, 13);
  assert.ok(display.includes('+-------+-------+-------+'));
  assert.equal((display.match(/[0-9.]/g) || []).length, 81);
});

test('ratePuzzle — une grille complète ne nécessite aucune technique', () => {
  const solution = sudoku.boardToString(
    sudoku.generateComplete('grille-complete')
  );
  const rating = sudoku.ratePuzzle(solution);

  assert.equal(rating.solved, true);
  assert.deepEqual(rating.techniques, []);
  assert.equal(rating.level, 'echauffement');
});
