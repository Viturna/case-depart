/**
 * Pages de grilles et rendu SVG d'une grille de sudoku — Case Départ
 */

(function (root, factory) {
  /**
   * Chargement sûr : en local via require, dans n8n via globalThis.
   * n8n expose require() mais ne sait pas résoudre les chemins relatifs.
   */
  function loadModule(localPath, globalName) {
    var value = null;
    if (typeof require === 'function') {
      try {
        value = require(localPath);
      } catch (error) {
        value = null;
      }
    }
    if (!value && typeof globalThis !== 'undefined') {
      value = globalThis[globalName];
    }
    return value;
  }

  var H =
    loadModule('../helpers.js', 'CaseDepartHtmlHelpers');
  var I =
    loadModule('./illustrations.js', 'CaseDepartIllustrations');
  var api = factory(H, I);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartPageGrilles = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, I) {
  'use strict';

  function digitsOf(value) {
    return String(value).split('').map(Number);
  }

  /**
   * Rend une grille 9×9 en SVG monochrome (sapin sur sable).
   *
   * @param {string|number[]} input puzzle ou solution (81 chiffres)
   * @param {{className?:string, starCell?:number|null, size?:number}} [options]
   * @returns {string}
   */
  function renderGrid(input, options) {
    options = options || {};
    var board = typeof input === 'string' ? digitsOf(input) : input.slice();
    var size = options.size || 450;
    var cell = size / 9;
    var outer = size * 0.011;
    var box = size * 0.0065;
    var thin = size * 0.0028;
    var className = options.className || 'sudoku-grid';

    var parts = [];
    parts.push(
      '<svg class="' +
        className +
        '" viewBox="0 0 ' +
        size +
        ' ' +
        size +
        '" role="img" aria-label="Grille de sudoku" xmlns="http://www.w3.org/2000/svg">'
    );
    parts.push('<rect x="0" y="0" width="' + size + '" height="' + size + '" fill="none"/>');

    for (var i = 0; i <= 9; i++) {
      var position = (i * cell).toFixed(2);
      var width = i === 0 || i === 9 ? outer : i % 3 === 0 ? box : thin;
      var stroke = '<line x1="' + position + '" y1="0" x2="' + position + '" y2="' + size + '"';
      stroke += ' stroke="#041735" stroke-width="' + width.toFixed(2) + '"/>';
      parts.push(stroke);

      stroke = '<line x1="0" y1="' + position + '" x2="' + size + '" y2="' + position + '"';
      stroke += ' stroke="#041735" stroke-width="' + width.toFixed(2) + '"/>';
      parts.push(stroke);
    }

    var fontSize = (cell * 0.56).toFixed(2);
    parts.push(
      '<g font-family="\'IBM Plex Mono\', monospace" font-weight="600" font-size="' +
        fontSize +
        '" fill="#041735" text-anchor="middle" dominant-baseline="central">'
    );

    for (var index = 0; index < 81; index++) {
      var value = board[index];
      if (!value) {
        continue;
      }
      var row = Math.floor(index / 9);
      var col = index % 9;
      var x = (col + 0.5) * cell;
      var y = (row + 0.5) * cell;
      parts.push('<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '">' + value + '</text>');
    }
    parts.push('</g>');

    if (
      options.starCell != null &&
      options.starCell >= 0 &&
      options.starCell < 81
    ) {
      var starRow = Math.floor(options.starCell / 9);
      var starCol = options.starCell % 9;
      var cx = (starCol + 0.79) * cell;
      var cy = (starRow + 0.21) * cell;
      var outerRadius = cell * 0.15;
      var innerRadius = cell * 0.065;
      parts.push(
        '<polygon points="' +
          I.starPath(cx, cy, outerRadius, innerRadius) +
          '" fill="#041735"/>'
      );
    }

    parts.push('</svg>');
    return parts.join('');
  }

  function gridNote(grid) {
    if (grid.starCell != null) {
      return (
        '<div class="grid-note mono">CASE ÉTOILÉE : TON CHIFFRE CLÉ POUR LE RAVITAILLEMENT N°2.</div>'
      );
    }
    return '<div class="grid-note mono">Pas de chrono. Juste toi et les cases.</div>';
  }

  /**
   * Page d'une grille à résoudre.
   */
  function page(carnet, options, section, grid, pageNumber) {
    var config = H.levelConfig(grid.level);
    var isStarred = grid.starCell != null;
    var content =
      '<div class="grid-page">' +
      '<div class="grid-title h">' +
      H.escapeHtml(config.label) +
      ' <span class="arrows">' +
      H.escapeHtml(config.arrows) +
      '</span></div>' +
      '<div class="grid-meta mono">GRILLE ' +
      H.escapeHtml(grid.label) +
      ' · ' +
      H.escapeHtml(config.clues) +
      (isStarred ? ' · CASE ÉTOILÉE' : '') +
      '</div>' +
      '<div class="grid-wrap">' +
      renderGrid(grid.puzzle, { starCell: grid.starCell }) +
      '</div>' +
      gridNote(grid) +
      '<div class="grid-counters">' +
      '<div class="counter-box"><span class="mono">Temps</span><span class="counter-line">__ : __</span></div>' +
      '<div class="counter-box"><span class="mono">Erreurs</span><span class="counter-line">____</span></div>' +
      '<div class="counter-box"><span class="mono">Niveau</span><span class="counter-line">' +
      H.escapeHtml(config.arrows) +
      '</span></div>' +
      '</div>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: section.title + ' · ' + grid.label,
      meta: section.grids ? section.grids.length + ' GRILLES' : '',
      content: content,
      className: 'page-grid'
    });
  }

  /**
   * Mini-grille de correction.
   */
  function correctionBlock(grid) {
    return (
      '<div class="correction-block">' +
      '<div class="correction-head"><span class="mono">' +
      H.escapeHtml(grid.label) +
      '</span><span class="mono">' +
      H.escapeHtml(grid.levelLabel) +
      '</span></div>' +
      renderGrid(grid.solution, { className: 'sudoku-grid mini-grid' }) +
      '</div>'
    );
  }

  return {
    renderGrid: renderGrid,
    page: page,
    correctionBlock: correctionBlock
  };
});
