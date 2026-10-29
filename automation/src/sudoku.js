/**
 * Générateur / solveur / notation de difficulté — Case Départ
 *
 * JavaScript pur, sans dépendance npm, utilisable dans un nœud Code n8n.
 * Même graine = même grille, toujours.
 *
 * API publique (globalThis.CaseDepartSudoku en n8n, module.exports en Node) :
 *   - generateComplete(seedOrRng)  : grille complète (tableau de 81 entiers)
 *   - countSolutions(grid, limit)  : nombre de solutions (plafonné)
 *   - solveBacktracking(grid)      : première solution ou null
 *   - logicalSolve(grid, options)  : résolution par techniques humaines
 *   - ratePuzzle(grid)             : niveau réel, techniques, étapes
 *   - generateGrid(seed, level)    : grille conforme au niveau demandé
 *   - generateCarnetGrids(options) : jeu de grilles sans doublon
 *   - displayGrid(grid)            : rendu texte lisible
 */

(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartSudoku = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Accès au PRNG (module séparé en Node, global en n8n)
  // ---------------------------------------------------------------------------

  var Prng = null;
  if (typeof require === 'function') {
    try {
      Prng = require('./prng.js');
    } catch (error) {
      Prng = null;
    }
  }
  if (!Prng && typeof globalThis !== 'undefined') {
    Prng = globalThis.CaseDepartPrng;
  }

  if (!Prng || typeof Prng.createRng !== 'function') {
    throw new Error(
      'CaseDepartSudoku : le module PRNG est introuvable. Chargez prng.js avant sudoku.js.'
    );
  }

  var SIZE = 9;
  var CELL_COUNT = 81;
  var ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var FULL_MASK = (1 << SIZE) - 1;

  // ---------------------------------------------------------------------------
  // Techniques et niveaux
  // ---------------------------------------------------------------------------

  var TECHNIQUES = {
    NAKED_SINGLE: 'naked-single',
    HIDDEN_SINGLE: 'hidden-single',
    NAKED_PAIR: 'naked-pair',
    HIDDEN_PAIR: 'hidden-pair',
    POINTING: 'pointing',
    CLAIMING: 'claiming',
    NAKED_TRIPLE: 'naked-triple',
    X_WING: 'x-wing'
  };

  // Ordre de difficulté croissante. Sert aussi à déterminer la technique max.
  var TECHNIQUE_ORDER = [
    TECHNIQUES.NAKED_SINGLE,
    TECHNIQUES.HIDDEN_SINGLE,
    TECHNIQUES.NAKED_PAIR,
    TECHNIQUES.HIDDEN_PAIR,
    TECHNIQUES.POINTING,
    TECHNIQUES.CLAIMING,
    TECHNIQUES.NAKED_TRIPLE,
    TECHNIQUES.X_WING
  ];

  var BARE_SINGLES = [TECHNIQUES.NAKED_SINGLE];
  var SINGLES = [TECHNIQUES.NAKED_SINGLE, TECHNIQUES.HIDDEN_SINGLE];
  var ADVANCED = [
    TECHNIQUES.NAKED_PAIR,
    TECHNIQUES.HIDDEN_PAIR,
    TECHNIQUES.POINTING,
    TECHNIQUES.CLAIMING,
    TECHNIQUES.NAKED_TRIPLE,
    TECHNIQUES.X_WING
  ];

  var LEVELS = {
    echauffement: {
      key: 'echauffement',
      label: 'Échauffement',
      minClues: 38,
      maxClues: 45,
      description: 'Résoluble uniquement par singletons nus.'
    },
    sprint: {
      key: 'sprint',
      label: 'Sprint',
      minClues: 30,
      maxClues: 36,
      description: 'Nécessite les singletons cachés, sans technique avancée.'
    },
    marathon: {
      key: 'marathon',
      label: 'Marathon',
      minClues: 24,
      maxClues: 29,
      description: 'Nécessite au moins une technique au-delà des singletons.'
    }
  };

  var LEVEL_ORDER = ['echauffement', 'sprint', 'marathon'];

  // ---------------------------------------------------------------------------
  // Index de cases, unités, pairs
  // ---------------------------------------------------------------------------

  function rowOf(index) {
    return (index / SIZE) | 0;
  }

  function colOf(index) {
    return index % SIZE;
  }

  function boxOf(index) {
    return ((rowOf(index) / 3) | 0) * 3 + ((colOf(index) / 3) | 0);
  }

  var ROWS = [];
  var COLS = [];
  var BOXES = [];
  var UNITS = [];
  var PEERS = [];

  (function buildTopology() {
    var r, c, i;

    for (r = 0; r < SIZE; r++) {
      ROWS[r] = [];
      for (c = 0; c < SIZE; c++) {
        ROWS[r].push(r * SIZE + c);
      }
    }

    for (c = 0; c < SIZE; c++) {
      COLS[c] = [];
      for (r = 0; r < SIZE; r++) {
        COLS[c].push(r * SIZE + c);
      }
    }

    for (var b = 0; b < SIZE; b++) {
      BOXES[b] = [];
      var startRow = ((b / 3) | 0) * 3;
      var startCol = (b % 3) * 3;
      for (r = 0; r < 3; r++) {
        for (c = 0; c < 3; c++) {
          BOXES[b].push((startRow + r) * SIZE + startCol + c);
        }
      }
    }

    UNITS = ROWS.concat(COLS).concat(BOXES);

    for (i = 0; i < CELL_COUNT; i++) {
      var peers = {};
      var addPeer = function (index) {
        if (index !== i) {
          peers[index] = true;
        }
      };
      ROWS[rowOf(i)].forEach(addPeer);
      COLS[colOf(i)].forEach(addPeer);
      BOXES[boxOf(i)].forEach(addPeer);
      PEERS[i] = Object.keys(peers).map(Number);
      PEERS[i].sort(function (a, b) {
        return a - b;
      });
    }
  })();

  // ---------------------------------------------------------------------------
  // Utilitaires de grille
  // ---------------------------------------------------------------------------

  /** Convertit une grille (chaîne de 81 caractères ou tableau) en tableau. */
  function toBoard(input) {
    if (typeof input === 'string') {
      if (!/^[0-9]{81}$/.test(input)) {
        throw new Error('Grille invalide : il faut exactement 81 chiffres (0 = vide).');
      }
      return input.split('').map(Number);
    }
    if (Array.isArray(input) || input instanceof Int8Array) {
      if (input.length !== CELL_COUNT) {
        throw new Error('Grille invalide : il faut exactement 81 cases.');
      }
      return Array.prototype.slice.call(input).map(Number);
    }
    throw new Error('Grille invalide : chaîne de 81 chiffres ou tableau attendu.');
  }

  function boardToString(board) {
    return board.join('');
  }

  function clueCount(board) {
    var count = 0;
    for (var i = 0; i < CELL_COUNT; i++) {
      if (board[i] !== 0) {
        count++;
      }
    }
    return count;
  }

  function bitCount(mask) {
    var count = 0;
    while (mask) {
      mask &= mask - 1;
      count++;
    }
    return count;
  }

  function maskToDigits(mask) {
    var digits = [];
    var value = 1;
    while (mask) {
      if (mask & 1) {
        digits.push(value);
      }
      mask >>>= 1;
      value++;
    }
    return digits;
  }

  /** Vérifie qu'une grille complète est valide (9 lignes/colonnes/blocs). */
  function isValidComplete(board) {
    for (var u = 0; u < UNITS.length; u++) {
      var seen = 0;
      for (var k = 0; k < SIZE; k++) {
        var value = board[UNITS[u][k]];
        if (value < 1 || value > 9) {
          return false;
        }
        var bit = 1 << (value - 1);
        if (seen & bit) {
          return false;
        }
        seen |= bit;
      }
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Génération d'une grille complète (backtracking randomisé)
  // ---------------------------------------------------------------------------

  function normalizeRng(seedOrRng) {
    if (seedOrRng && typeof seedOrRng.next === 'function') {
      return seedOrRng;
    }
    return Prng.createRng(seedOrRng == null ? 'case-depart' : seedOrRng);
  }

  /**
   * Génère une grille complète valide et déterministe.
   * @param {string|number|object} seedOrRng chaîne de graine ou générateur
   * @returns {number[]} 81 entiers de 1 à 9
   */
  function generateComplete(seedOrRng) {
    var rng = normalizeRng(seedOrRng);
    var board = new Array(CELL_COUNT).fill(0);
    var rowMasks = new Array(SIZE).fill(0);
    var colMasks = new Array(SIZE).fill(0);
    var boxMasks = new Array(SIZE).fill(0);

    function fill(position) {
      if (position === CELL_COUNT) {
        return true;
      }
      var row = rowOf(position);
      var col = colOf(position);
      var box = boxOf(position);
      var mask = FULL_MASK & ~(rowMasks[row] | colMasks[col] | boxMasks[box]);
      var digits = rng.shuffle(maskToDigits(mask));

      for (var d = 0; d < digits.length; d++) {
        var value = digits[d];
        var bit = 1 << (value - 1);

        board[position] = value;
        rowMasks[row] |= bit;
        colMasks[col] |= bit;
        boxMasks[box] |= bit;

        if (fill(position + 1)) {
          return true;
        }

        board[position] = 0;
        rowMasks[row] &= ~bit;
        colMasks[col] &= ~bit;
        boxMasks[box] &= ~bit;
      }
      return false;
    }

    if (!fill(0)) {
      throw new Error('Impossible de générer une grille complète.');
    }
    return board;
  }

  // ---------------------------------------------------------------------------
  // Résolution exacte : comptage de solutions / backtracking
  // ---------------------------------------------------------------------------

  function buildMasks(board) {
    var rowMasks = new Array(SIZE).fill(0);
    var colMasks = new Array(SIZE).fill(0);
    var boxMasks = new Array(SIZE).fill(0);

    for (var i = 0; i < CELL_COUNT; i++) {
      var value = board[i];
      if (value === 0) {
        continue;
      }
      if (value < 1 || value > 9) {
        return null;
      }
      var bit = 1 << (value - 1);
      var row = rowOf(i);
      var col = colOf(i);
      var box = boxOf(i);
      if (rowMasks[row] & bit || colMasks[col] & bit || boxMasks[box] & bit) {
        return null;
      }
      rowMasks[row] |= bit;
      colMasks[col] |= bit;
      boxMasks[box] |= bit;
    }

    return { rowMasks: rowMasks, colMasks: colMasks, boxMasks: boxMasks };
  }

  function chooseBestCell(board, masks) {
    var bestCell = -1;
    var bestMask = 0;
    var bestCount = SIZE + 1;

    for (var i = 0; i < CELL_COUNT; i++) {
      if (board[i] !== 0) {
        continue;
      }
      var mask =
        FULL_MASK &
        ~(masks.rowMasks[rowOf(i)] | masks.colMasks[colOf(i)] | masks.boxMasks[boxOf(i)]);
      var count = bitCount(mask);
      if (count === 0) {
        return { cell: -1, mask: 0, dead: true };
      }
      if (count < bestCount) {
        bestCell = i;
        bestMask = mask;
        bestCount = count;
        if (count === 1) {
          break;
        }
      }
    }

    return { cell: bestCell, mask: bestMask, dead: false };
  }

  /**
   * Compte les solutions d'une grille, sans dépasser `limit`.
   * @param {string|number[]} input
   * @param {number} [limit=2]
   * @returns {number}
   */
  function countSolutions(input, limit) {
    limit = limit == null ? 2 : limit;
    if (limit < 1) {
      throw new Error('limit doit être >= 1.');
    }

    var board = toBoard(input);
    var masks = buildMasks(board);
    if (!masks) {
      return 0;
    }

    var found = 0;

    function search() {
      if (found >= limit) {
        return;
      }

      var choice = chooseBestCell(board, masks);
      if (choice.dead) {
        return;
      }
      if (choice.cell === -1) {
        found++;
        return;
      }

      var cell = choice.cell;
      var row = rowOf(cell);
      var col = colOf(cell);
      var box = boxOf(cell);
      var mask = choice.mask;

      while (mask) {
        var bit = mask & -mask;
        mask ^= bit;
        var value = 1;
        var probe = bit;
        while (probe > 1) {
          probe >>>= 1;
          value++;
        }

        board[cell] = value;
        masks.rowMasks[row] |= bit;
        masks.colMasks[col] |= bit;
        masks.boxMasks[box] |= bit;

        search();

        board[cell] = 0;
        masks.rowMasks[row] &= ~bit;
        masks.colMasks[col] &= ~bit;
        masks.boxMasks[box] &= ~bit;

        if (found >= limit) {
          return;
        }
      }
    }

    search();
    return found;
  }

  /**
   * Résout une grille par backtracking et retourne la première solution.
   * @param {string|number[]} input
   * @returns {number[]|null}
   */
  function solveBacktracking(input) {
    var board = toBoard(input);
    var masks = buildMasks(board);
    if (!masks) {
      return null;
    }

    function search() {
      var choice = chooseBestCell(board, masks);
      if (choice.dead) {
        return false;
      }
      if (choice.cell === -1) {
        return true;
      }

      var cell = choice.cell;
      var row = rowOf(cell);
      var col = colOf(cell);
      var box = boxOf(cell);
      var mask = choice.mask;

      while (mask) {
        var bit = mask & -mask;
        mask ^= bit;
        var value = 1;
        var probe = bit;
        while (probe > 1) {
          probe >>>= 1;
          value++;
        }

        board[cell] = value;
        masks.rowMasks[row] |= bit;
        masks.colMasks[col] |= bit;
        masks.boxMasks[box] |= bit;

        if (search()) {
          return true;
        }

        board[cell] = 0;
        masks.rowMasks[row] &= ~bit;
        masks.colMasks[col] &= ~bit;
        masks.boxMasks[box] &= ~bit;
      }

      return false;
    }

    return search() ? board : null;
  }

  // ---------------------------------------------------------------------------
  // Solveur logique (techniques humaines)
  // ---------------------------------------------------------------------------

  function createCandidateSets(board) {
    var candidates = new Array(CELL_COUNT);

    for (var i = 0; i < CELL_COUNT; i++) {
      if (board[i] !== 0) {
        candidates[i] = null;
        continue;
      }
      var forbidden = 0;
      var peers = PEERS[i];
      for (var p = 0; p < peers.length; p++) {
        var value = board[peers[p]];
        if (value !== 0) {
          forbidden |= 1 << (value - 1);
        }
      }
      var mask = FULL_MASK & ~forbidden;
      candidates[i] = maskToDigits(mask);
    }

    return candidates;
  }

  function maxTechniqueOf(techniques) {
    var max = null;
    for (var i = 0; i < techniques.length; i++) {
      if (TECHNIQUE_ORDER.indexOf(techniques[i]) > TECHNIQUE_ORDER.indexOf(max)) {
        max = techniques[i];
      }
    }
    return max;
  }

  /**
   * Solveur logique.
   * @param {string|number[]} input
   * @param {{allowed?: string[]}} [options]
   * @returns {{
   *   solved: boolean,
   *   requiresBacktracking: boolean,
   *   techniques: string[],
   *   maxTechnique: string|null,
   *   steps: number,
   *   grid: number[]
   * }}
   */
  function logicalSolve(input, options) {
    options = options || {};
    var allowed = options.allowed || TECHNIQUE_ORDER;
    var allowedSet = {};
    for (var a = 0; a < allowed.length; a++) {
      allowedSet[allowed[a]] = true;
    }

    var board = toBoard(input);
    var candidates = createCandidateSets(board);
    var techniques = [];
    var steps = 0;
    var contradiction = false;

    for (var c = 0; c < CELL_COUNT; c++) {
      if (candidates[c] && candidates[c].length === 0) {
        contradiction = true;
      }
    }

    function isAllowed(technique) {
      return !!allowedSet[technique];
    }

    function record(technique) {
      if (techniques.indexOf(technique) === -1) {
        techniques.push(technique);
      }
    }

    function isSolved() {
      for (var i = 0; i < CELL_COUNT; i++) {
        if (board[i] === 0) {
          return false;
        }
      }
      return true;
    }

    function place(cell, value, technique) {
      if (board[cell] !== 0) {
        return;
      }
      board[cell] = value;
      candidates[cell] = null;
      steps++;
      record(technique);

      var peers = PEERS[cell];
      for (var p = 0; p < peers.length; p++) {
        var peer = peers[p];
        if (!candidates[peer]) {
          continue;
        }
        var index = candidates[peer].indexOf(value);
        if (index !== -1) {
          candidates[peer].splice(index, 1);
          if (candidates[peer].length === 0) {
            contradiction = true;
          }
        }
      }
    }

    function removeCandidate(cell, digit) {
      if (board[cell] !== 0 || !candidates[cell]) {
        return false;
      }
      var index = candidates[cell].indexOf(digit);
      if (index === -1) {
        return false;
      }
      candidates[cell].splice(index, 1);
      if (candidates[cell].length === 0) {
        contradiction = true;
      }
      return true;
    }

    function emptyCellsIn(unit) {
      var cells = [];
      for (var u = 0; u < unit.length; u++) {
        if (board[unit[u]] === 0) {
          cells.push(unit[u]);
        }
      }
      return cells;
    }

    // 1. Singleton nu
    function applyNakedSingle() {
      for (var i = 0; i < CELL_COUNT; i++) {
        if (board[i] === 0 && candidates[i] && candidates[i].length === 1) {
          place(i, candidates[i][0], TECHNIQUES.NAKED_SINGLE);
          return true;
        }
      }
      return false;
    }

    // 2. Singleton caché
    function applyHiddenSingle() {
      for (var u = 0; u < UNITS.length; u++) {
        var unit = UNITS[u];
        for (var d = 0; d < ALL_DIGITS.length; d++) {
          var digit = ALL_DIGITS[d];
          var position = -1;
          var count = 0;
          for (var k = 0; k < unit.length; k++) {
            var cell = unit[k];
            if (board[cell] === 0 && candidates[cell].indexOf(digit) !== -1) {
              position = cell;
              count++;
              if (count > 1) {
                break;
              }
            }
          }
          if (count === 1) {
            place(position, digit, TECHNIQUES.HIDDEN_SINGLE);
            return true;
          }
        }
      }
      return false;
    }

    // 3. Paire nue
    function applyNakedPair() {
      for (var u = 0; u < UNITS.length; u++) {
        var unit = UNITS[u];
        var empty = emptyCellsIn(unit);
        var pairCells = [];
        for (var e = 0; e < empty.length; e++) {
          if (candidates[empty[e]].length === 2) {
            pairCells.push(empty[e]);
          }
        }

        for (var i = 0; i < pairCells.length; i++) {
          for (var j = i + 1; j < pairCells.length; j++) {
            var a = candidates[pairCells[i]];
            var b = candidates[pairCells[j]];
            if (a[0] !== b[0] || a[1] !== b[1]) {
              continue;
            }

            var changed = false;
            for (var k = 0; k < empty.length; k++) {
              var cell = empty[k];
              if (cell === pairCells[i] || cell === pairCells[j]) {
                continue;
              }
              for (var d = 0; d < a.length; d++) {
                if (removeCandidate(cell, a[d])) {
                  changed = true;
                }
              }
            }
            if (changed) {
              steps++;
              record(TECHNIQUES.NAKED_PAIR);
              return true;
            }
          }
        }
      }
      return false;
    }

    // 4. Paire cachée
    function applyHiddenPair() {
      for (var u = 0; u < UNITS.length; u++) {
        var unit = UNITS[u];
        var positionsByDigit = [];
        var d, k;

        for (d = 0; d < ALL_DIGITS.length; d++) {
          var digit = ALL_DIGITS[d];
          var positions = [];
          for (k = 0; k < unit.length; k++) {
            var cell = unit[k];
            if (board[cell] === 0 && candidates[cell].indexOf(digit) !== -1) {
              positions.push(cell);
            }
          }
          positionsByDigit.push({ digit: digit, positions: positions });
        }

        for (var i = 0; i < positionsByDigit.length; i++) {
          var first = positionsByDigit[i];
          if (first.positions.length !== 2) {
            continue;
          }
          for (var j = i + 1; j < positionsByDigit.length; j++) {
            var second = positionsByDigit[j];
            if (second.positions.length !== 2) {
              continue;
            }
            if (
              first.positions[0] !== second.positions[0] ||
              first.positions[1] !== second.positions[1]
            ) {
              continue;
            }

            var changed = false;
            for (k = 0; k < 2; k++) {
              var target = first.positions[k];
              var keep = [first.digit, second.digit];
              for (var c = 0; c < candidates[target].length; c++) {
                var candidate = candidates[target][c];
                if (keep.indexOf(candidate) === -1) {
                  candidates[target].splice(c, 1);
                  c--;
                  changed = true;
                }
              }
              if (candidates[target].length === 0) {
                contradiction = true;
              }
            }

            if (changed) {
              steps++;
              record(TECHNIQUES.HIDDEN_PAIR);
              return true;
            }
          }
        }
      }
      return false;
    }

    // 5. Pointing (verrouillage bloc -> ligne/colonne)
    function applyPointing() {
      var changed = false;

      for (var b = 0; b < BOXES.length; b++) {
        var box = BOXES[b];
        for (var d = 0; d < ALL_DIGITS.length; d++) {
          var digit = ALL_DIGITS[d];
          var positions = [];
          for (var k = 0; k < box.length; k++) {
            var cell = box[k];
            if (board[cell] === 0 && candidates[cell].indexOf(digit) !== -1) {
              positions.push(cell);
            }
          }
          if (positions.length < 2 || positions.length > 3) {
            continue;
          }

          var sameRow = true;
          var sameCol = true;
          for (var p = 1; p < positions.length; p++) {
            if (rowOf(positions[p]) !== rowOf(positions[0])) {
              sameRow = false;
            }
            if (colOf(positions[p]) !== colOf(positions[0])) {
              sameCol = false;
            }
          }

          if (sameRow) {
            var row = rowOf(positions[0]);
            for (var c = 0; c < SIZE; c++) {
              var target = row * SIZE + c;
              if (box.indexOf(target) !== -1) {
                continue;
              }
              if (removeCandidate(target, digit)) {
                changed = true;
              }
            }
          }

          if (sameCol) {
            var col = colOf(positions[0]);
            for (var r = 0; r < SIZE; r++) {
              var target2 = r * SIZE + col;
              if (box.indexOf(target2) !== -1) {
                continue;
              }
              if (removeCandidate(target2, digit)) {
                changed = true;
              }
            }
          }
        }
      }

      if (changed) {
        steps++;
        record(TECHNIQUES.POINTING);
      }
      return changed;
    }

    // 6. Claiming (verrouillage ligne/colonne -> bloc)
    function applyClaiming() {
      var changed = false;
      var lines = ROWS.concat(COLS);

      for (var u = 0; u < lines.length; u++) {
        var line = lines[u];
        for (var d = 0; d < ALL_DIGITS.length; d++) {
          var digit = ALL_DIGITS[d];
          var positions = [];
          for (var k = 0; k < line.length; k++) {
            var cell = line[k];
            if (board[cell] === 0 && candidates[cell].indexOf(digit) !== -1) {
              positions.push(cell);
            }
          }
          if (positions.length < 2 || positions.length > 3) {
            continue;
          }

          var box = boxOf(positions[0]);
          var sameBox = true;
          for (var p = 1; p < positions.length; p++) {
            if (boxOf(positions[p]) !== box) {
              sameBox = false;
              break;
            }
          }
          if (!sameBox) {
            continue;
          }

          for (var b = 0; b < BOXES[box].length; b++) {
            var target = BOXES[box][b];
            if (line.indexOf(target) !== -1) {
              continue;
            }
            if (removeCandidate(target, digit)) {
              changed = true;
            }
          }
        }
      }

      if (changed) {
        steps++;
        record(TECHNIQUES.CLAIMING);
      }
      return changed;
    }

    // 7. Triplet nu
    function applyNakedTriple() {
      for (var u = 0; u < UNITS.length; u++) {
        var unit = UNITS[u];
        var empty = emptyCellsIn(unit);
        var candidatesCells = [];
        for (var e = 0; e < empty.length; e++) {
          var length = candidates[empty[e]].length;
          if (length === 2 || length === 3) {
            candidatesCells.push(empty[e]);
          }
        }

        for (var i = 0; i < candidatesCells.length; i++) {
          for (var j = i + 1; j < candidatesCells.length; j++) {
            for (var k = j + 1; k < candidatesCells.length; k++) {
              var triple = [
                candidatesCells[i],
                candidatesCells[j],
                candidatesCells[k]
              ];
              var union = {};
              for (var t = 0; t < triple.length; t++) {
                var list = candidates[triple[t]];
                for (var d = 0; d < list.length; d++) {
                  union[list[d]] = true;
                }
              }
              var unionDigits = Object.keys(union).map(Number);
              if (unionDigits.length !== 3) {
                continue;
              }

              var changed = false;
              for (var c = 0; c < empty.length; c++) {
                var cell = empty[c];
                if (triple.indexOf(cell) !== -1) {
                  continue;
                }
                for (var q = 0; q < unionDigits.length; q++) {
                  if (removeCandidate(cell, unionDigits[q])) {
                    changed = true;
                  }
                }
              }
              if (changed) {
                steps++;
                record(TECHNIQUES.NAKED_TRIPLE);
                return true;
              }
            }
          }
        }
      }
      return false;
    }

    // 8. X-Wing
    function applyXWing() {
      var d;

      // Version lignes.
      for (d = 0; d < ALL_DIGITS.length; d++) {
        var digit = ALL_DIGITS[d];
        var byRow = [];
        for (var r = 0; r < SIZE; r++) {
          var cols = [];
          for (var c = 0; c < SIZE; c++) {
            var cell = r * SIZE + c;
            if (board[cell] === 0 && candidates[cell].indexOf(digit) !== -1) {
              cols.push(c);
            }
          }
          if (cols.length === 2) {
            byRow.push({ line: r, cross: cols });
          }
        }

        for (var i = 0; i < byRow.length; i++) {
          for (var j = i + 1; j < byRow.length; j++) {
            if (
              byRow[i].cross[0] !== byRow[j].cross[0] ||
              byRow[i].cross[1] !== byRow[j].cross[1]
            ) {
              continue;
            }
            var changed = false;
            for (var r2 = 0; r2 < SIZE; r2++) {
              if (r2 === byRow[i].line || r2 === byRow[j].line) {
                continue;
              }
              for (var k = 0; k < 2; k++) {
                if (removeCandidate(r2 * SIZE + byRow[i].cross[k], digit)) {
                  changed = true;
                }
              }
            }
            if (changed) {
              steps++;
              record(TECHNIQUES.X_WING);
              return true;
            }
          }
        }
      }

      // Version colonnes.
      for (d = 0; d < ALL_DIGITS.length; d++) {
        var digit2 = ALL_DIGITS[d];
        var byCol = [];
        for (var c2 = 0; c2 < SIZE; c2++) {
          var rows = [];
          for (var r3 = 0; r3 < SIZE; r3++) {
            var cell2 = r3 * SIZE + c2;
            if (board[cell2] === 0 && candidates[cell2].indexOf(digit2) !== -1) {
              rows.push(r3);
            }
          }
          if (rows.length === 2) {
            byCol.push({ line: c2, cross: rows });
          }
        }

        for (var a = 0; a < byCol.length; a++) {
          for (var b2 = a + 1; b2 < byCol.length; b2++) {
            if (
              byCol[a].cross[0] !== byCol[b2].cross[0] ||
              byCol[a].cross[1] !== byCol[b2].cross[1]
            ) {
              continue;
            }
            var changed2 = false;
            for (var c3 = 0; c3 < SIZE; c3++) {
              if (c3 === byCol[a].line || c3 === byCol[b2].line) {
                continue;
              }
              for (var k2 = 0; k2 < 2; k2++) {
                if (removeCandidate(byCol[a].cross[k2] * SIZE + c3, digit2)) {
                  changed2 = true;
                }
              }
            }
            if (changed2) {
              steps++;
              record(TECHNIQUES.X_WING);
              return true;
            }
          }
        }
      }

      return false;
    }

    var appliers = [
      { technique: TECHNIQUES.NAKED_SINGLE, apply: applyNakedSingle },
      { technique: TECHNIQUES.HIDDEN_SINGLE, apply: applyHiddenSingle },
      { technique: TECHNIQUES.NAKED_PAIR, apply: applyNakedPair },
      { technique: TECHNIQUES.HIDDEN_PAIR, apply: applyHiddenPair },
      { technique: TECHNIQUES.POINTING, apply: applyPointing },
      { technique: TECHNIQUES.CLAIMING, apply: applyClaiming },
      { technique: TECHNIQUES.NAKED_TRIPLE, apply: applyNakedTriple },
      { technique: TECHNIQUES.X_WING, apply: applyXWing }
    ];

    for (var iteration = 0; iteration < 5000; iteration++) {
      if (isSolved() || contradiction) {
        break;
      }

      var progressed = false;
      for (var a2 = 0; a2 < appliers.length; a2++) {
        if (!isAllowed(appliers[a2].technique)) {
          continue;
        }
        if (appliers[a2].apply()) {
          progressed = true;
          break;
        }
      }
      if (!progressed) {
        break;
      }
    }

    var solved = isSolved() && !contradiction;

    return {
      solved: solved,
      requiresBacktracking: !solved,
      techniques: techniques.slice(),
      maxTechnique: maxTechniqueOf(techniques),
      steps: steps,
      grid: board
    };
  }

  /**
   * Évalue une grille avec le solveur logique complet.
   * @param {string|number[]} input
   * @returns {{
   *   solved: boolean,
   *   requiresBacktracking: boolean,
   *   techniques: string[],
   *   maxTechnique: string|null,
   *   steps: number,
   *   clues: number,
   *   level: string|null,
   *   grid: number[]
   * }}
   */
  function ratePuzzle(input) {
    var board = toBoard(input);
    var result = logicalSolve(board);
    var used = result.techniques;
    var level = null;

    if (!result.solved) {
      level = null;
    } else {
      var hasAdvanced = false;
      var hasHidden = false;
      for (var i = 0; i < used.length; i++) {
        if (ADVANCED.indexOf(used[i]) !== -1) {
          hasAdvanced = true;
        }
        if (used[i] === TECHNIQUES.HIDDEN_SINGLE) {
          hasHidden = true;
        }
      }

      if (hasAdvanced) {
        level = 'marathon';
      } else if (hasHidden) {
        level = 'sprint';
      } else {
        level = 'echauffement';
      }
    }

    result.clues = clueCount(board);
    result.level = level;
    result.grid = result.grid;
    return result;
  }

  // ---------------------------------------------------------------------------
  // Retrait de cases
  // ---------------------------------------------------------------------------

  function shuffledCells(rng) {
    var cells = [];
    for (var i = 0; i < CELL_COUNT; i++) {
      cells.push(i);
    }
    return rng.shuffle(cells);
  }

  function carveWithUniqueness(solution, rng, targetClues) {
    var puzzle = solution.slice();
    var clues = CELL_COUNT;
    var order = shuffledCells(rng);

    for (var k = 0; k < order.length && clues > targetClues; k++) {
      var cell = order[k];
      var value = puzzle[cell];
      puzzle[cell] = 0;
      if (countSolutions(puzzle, 2) === 1) {
        clues--;
      } else {
        puzzle[cell] = value;
      }
    }

    return { puzzle: puzzle, clues: clues };
  }

  function carveWithSolvability(solution, rng, targetClues, allowed) {
    var puzzle = solution.slice();
    var clues = CELL_COUNT;
    var order = shuffledCells(rng);

    for (var k = 0; k < order.length && clues > targetClues; k++) {
      var cell = order[k];
      var value = puzzle[cell];
      puzzle[cell] = 0;
      var result = logicalSolve(puzzle, { allowed: allowed });
      if (result.solved) {
        clues--;
      } else {
        puzzle[cell] = value;
      }
    }

    return { puzzle: puzzle, clues: clues };
  }

  function hasAny(techniques, list) {
    for (var i = 0; i < techniques.length; i++) {
      if (list.indexOf(techniques[i]) !== -1) {
        return true;
      }
    }
    return false;
  }

  function matchesLevel(level, puzzle, rating) {
    var config = LEVELS[level];
    var clues = clueCount(puzzle);

    if (!rating.solved || rating.requiresBacktracking) {
      return false;
    }
    if (clues < config.minClues || clues > config.maxClues) {
      return false;
    }

    if (level === 'echauffement') {
      // Aucune technique au-delà du singleton nu.
      return !hasAny(rating.techniques, SINGLES.slice(1)) &&
        !hasAny(rating.techniques, ADVANCED);
    }

    if (level === 'sprint') {
      // Les singletons cachés sont nécessaires, aucune technique avancée.
      return (
        rating.techniques.indexOf(TECHNIQUES.HIDDEN_SINGLE) !== -1 &&
        !hasAny(rating.techniques, ADVANCED)
      );
    }

    if (level === 'marathon') {
      // Au moins une technique au-delà des singletons.
      return hasAny(rating.techniques, ADVANCED);
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // Génération d'une grille de niveau
  // ---------------------------------------------------------------------------

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  /**
   * Génère une grille conforme au niveau demandé.
   *
   * Si la grille ne correspond pas au niveau, une nouvelle tentative est faite
   * avec la graine `{seed}-retry1`, `-retry2`, etc. La graine finale réellement
   * utilisée est retournée dans `seed`.
   *
   * @param {string} seed graine publique, ex. "noel-2026-sprint-03"
   * @param {'echauffement'|'sprint'|'marathon'} level
   * @param {{maxAttempts?: number, startAttempt?: number}} [options]
   * @returns {{
   *   seed: string,
   *   level: string,
   *   puzzle: string,
   *   solution: string,
   *   clues: number,
   *   techniques: string[],
   *   attempts: number
   * }}
   */
  function generateGrid(seed, level, options) {
    options = options || {};
    if (!LEVELS[level]) {
      throw new Error(
        'Niveau inconnu : ' + level + '. Valeurs possibles : ' + LEVEL_ORDER.join(', ') + '.'
      );
    }
    if (typeof seed !== 'string' || seed.length === 0) {
      throw new Error('La graine doit être une chaîne non vide.');
    }

    var config = LEVELS[level];
    var maxAttempts = options.maxAttempts || 60;
    var startAttempt = options.startAttempt || 0;

    for (var attempt = startAttempt; attempt < maxAttempts; attempt++) {
      var attemptSeed = attempt === 0 ? seed : seed + '-retry' + attempt;
      var rng = Prng.createRng(attemptSeed);
      var solution = generateComplete(rng);
      var targetClues = rng.int(config.minClues, config.maxClues);
      var carved;

      if (level === 'echauffement') {
        carved = carveWithSolvability(solution, rng, targetClues, BARE_SINGLES);
      } else if (level === 'sprint') {
        carved = carveWithSolvability(solution, rng, targetClues, SINGLES);
      } else {
        carved = carveWithUniqueness(solution, rng, targetClues);
      }

      var puzzle = carved.puzzle;

      // Garanties minimales : solution unique et cohérente avec la solution.
      if (countSolutions(puzzle, 2) !== 1) {
        continue;
      }
      var solved = solveBacktracking(puzzle);
      if (!solved || boardToString(solved) !== boardToString(solution)) {
        continue;
      }

      var rating = ratePuzzle(puzzle);
      if (!matchesLevel(level, puzzle, rating)) {
        continue;
      }

      return {
        seed: attemptSeed,
        level: level,
        puzzle: boardToString(puzzle),
        solution: boardToString(solution),
        clues: carved.clues,
        techniques: rating.techniques.slice(),
        attempts: attempt + 1
      };
    }

    throw new Error(
      'Impossible de générer une grille ' +
        level +
        ' pour la graine "' +
        seed +
        '" après ' +
        maxAttempts +
        ' tentatives.'
    );
  }

  // ---------------------------------------------------------------------------
  // Jeu de grilles d'un carnet
  // ---------------------------------------------------------------------------

  function generateUniqueGrid(seed, level, usedPuzzles) {
    var startAttempt = 0;

    for (var guard = 0; guard < 25; guard++) {
      var grid = generateGrid(seed, level, { startAttempt: startAttempt });
      if (!usedPuzzles[grid.puzzle]) {
        usedPuzzles[grid.puzzle] = true;
        return grid;
      }
      // Doublon (probabilité infime) : on reprend la chaîne de retries
      // là où elle s'est arrêtée.
      startAttempt = grid.attempts;
    }

    throw new Error('Impossible d\'éviter un doublon pour la graine "' + seed + '".');
  }

  /**
   * Génère les grilles d'un carnet, sans aucun doublon.
   *
   * @param {{
   *   carnet: string,
   *   counts?: {echauffement?: number, sprint?: number, marathon?: number},
   *   finalGrid?: boolean
   * }} options
   * @returns {Array<object>}
   */
  function generateCarnetGrids(options) {
    options = options || {};
    if (typeof options.carnet !== 'string' || options.carnet.length === 0) {
      throw new Error('generateCarnetGrids : "carnet" est obligatoire.');
    }

    var counts = options.counts || {
      echauffement: 10,
      sprint: 10,
      marathon: 10
    };
    var grids = [];
    var usedPuzzles = {};

    for (var l = 0; l < LEVEL_ORDER.length; l++) {
      var level = LEVEL_ORDER[l];
      var count = counts[level] || 0;
      for (var index = 1; index <= count; index++) {
        var seed = options.carnet + '-' + level + '-' + pad2(index);
        grids.push(generateUniqueGrid(seed, level, usedPuzzles));
      }
    }

    if (options.finalGrid) {
      grids.push(
        generateUniqueGrid(options.carnet + '-final-01', 'marathon', usedPuzzles)
      );
    }

    return grids;
  }

  // ---------------------------------------------------------------------------
  // Affichage texte
  // ---------------------------------------------------------------------------

  /**
   * Rend une grille lisible en console.
   * @param {string|number[]} input
   * @returns {string}
   */
  function displayGrid(input) {
    var board = toBoard(input);
    var lines = [];
    var separator = '+-------+-------+-------+';

    for (var r = 0; r < SIZE; r++) {
      if (r % 3 === 0) {
        lines.push(separator);
      }
      var line = '|';
      for (var c = 0; c < SIZE; c++) {
        if (c % 3 === 0 && c !== 0) {
          line += '|';
        }
        var value = board[r * SIZE + c];
        line += ' ' + (value === 0 ? '.' : String(value));
      }
      line += ' |';
      lines.push(line);
    }
    lines.push(separator);

    return lines.join('\n');
  }

  return {
    SIZE: SIZE,
    CELL_COUNT: CELL_COUNT,
    LEVELS: LEVELS,
    LEVEL_ORDER: LEVEL_ORDER,
    TECHNIQUES: TECHNIQUES,
    TECHNIQUE_ORDER: TECHNIQUE_ORDER,
    createRng: Prng.createRng,
    generateComplete: generateComplete,
    countSolutions: countSolutions,
    solveBacktracking: solveBacktracking,
    logicalSolve: logicalSolve,
    ratePuzzle: ratePuzzle,
    generateGrid: generateGrid,
    generateCarnetGrids: generateCarnetGrids,
    generateGridSet: generateCarnetGrids,
    displayGrid: displayGrid,
    boardToString: boardToString,
    clueCount: clueCount,
    toBoard: toBoard
  };
});
