/**
 * Page « Ligne d'arrivée » : grille finale et récapitulatif — Case Départ
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
  var G =
    loadModule('./grilles.js', 'CaseDepartPageGrilles');
  var api = factory(H, G);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartPageArrivee = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, G) {
  'use strict';

  function scoreRow(label, count, extraClass) {
    return (
      '<tr class="' +
      (extraClass || '') +
      '">' +
      '<td><span class="mono">' +
      H.escapeHtml(label) +
      '</span><span class="score-count">' +
      count +
      ' grille' +
      (count > 1 ? 's' : '') +
      '</span></td>' +
      '<td class="score-blank">__ : __</td>' +
      '<td class="score-blank">____</td>' +
      '<td class="score-done">□</td>' +
      '</tr>'
    );
  }

  function page(carnet, options, pageNumber) {
    var counts = { echauffement: 0, sprint: 0, marathon: 0 };
    carnet.grids.forEach(function (grid) {
      if (counts[grid.level] != null) {
        counts[grid.level]++;
      }
    });

    var content =
      '<div class="arrival-page">' +
      '<div class="eyebrow mono">DERNIÈRE LIGNE DROITE</div>' +
      '<h2 class="arrival-title h">Ligne<br>d\'arrivée</h2>' +
      '<p class="arrival-lead">Tu as traversé les trois niveaux. Il reste une grille. Elle ne compte pas double, mais elle compte.</p>' +
      '<div class="arrival-layout">' +
      '<div class="arrival-grid">' +
      '<div class="arrival-grid-head mono"><span>GRILLE FINALE</span><span>' +
      (carnet.finalGrid ? H.escapeHtml(carnet.finalGrid.clues + ' INDICES') : '') +
      '</span></div>' +
      (carnet.finalGrid
        ? G.renderGrid(carnet.finalGrid.puzzle, {
            className: 'sudoku-grid arrival-grid-svg',
            starCell: null
          })
        : '') +
      '<div class="arrival-grid-foot mono">MARATHON · SANS FILET</div>' +
      '</div>' +
      '<div class="arrival-scores">' +
      '<div class="score-head mono"><span>RÉCAPITULATIF</span><span>À REMPLIR</span></div>' +
      '<table class="score-table">' +
      '<thead><tr><th class="mono">ÉTAPE</th><th class="mono">TEMPS</th><th class="mono">ERREURS</th><th class="mono">OK</th></tr></thead>' +
      '<tbody>' +
      scoreRow('Échauffement', counts.echauffement) +
      scoreRow('Sprint', counts.sprint) +
      scoreRow('Marathon', counts.marathon) +
      scoreRow('Finale', 1, 'score-final') +
      '</tbody>' +
      '</table>' +
      '<div class="score-total">' +
      '<span class="mono">TEMPS TOTAL</span>' +
      '<span class="score-total-line">__ : __ : __</span>' +
      '</div>' +
      '<div class="score-sign mono">SIGNATURE DU COUREUR<br><span class="sign-line"></span></div>' +
      '</div>' +
      '</div>' +
      '<blockquote class="arrival-quote">' +
      '<p>« ' +
      H.escapeHtml(carnet.citation ? carnet.citation.texte : '') +
      ' »</p>' +
      '<cite class="mono">' +
      H.escapeHtml(carnet.citation ? carnet.citation.auteur : '') +
      ' · CITATION 100 % FICTIVE</cite>' +
      '</blockquote>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: 'LIGNE D\'ARRIVÉE',
      meta: 'GRILLE FINALE · SCORE',
      content: content,
      className: 'page-arrival'
    });
  }

  return { page: page };
});
