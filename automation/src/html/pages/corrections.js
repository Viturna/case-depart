/**
 * Pages de corrections — Case Départ
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
    globalThis.CaseDepartPageCorrections = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, G) {
  'use strict';

  function chunk(array, size) {
    var chunks = [];
    for (var i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Construit les pages de corrections.
   *
   * @param {object} carnet
   * @param {object} options
   * @param {number} startPageNumber
   * @param {number} perPage 8 en A4, 6 en A5
   * @returns {string[]}
   */
  function pages(carnet, options, startPageNumber, perPage) {
    var chunks = chunk(carnet.corrections || [], perPage || 8);
    var total = chunks.length;

    return chunks.map(function (gridChunk, index) {
      var content =
        '<div class="corrections-page">' +
        '<div class="eyebrow mono">TOUTES LES SOLUTIONS</div>' +
        '<div class="corrections-head">' +
        '<h2 class="corrections-title h">Corrections</h2>' +
        '<div class="corrections-meta mono">' +
        (index + 1) +
        ' / ' +
        total +
        '</div>' +
        '</div>' +
        '<p class="corrections-lead">Vérifie, coche, passe à la suite. Personne ne te jugera sur le nombre de gommes utilisées.</p>' +
        '<div class="mini-grids">' +
        gridChunk.map(G.correctionBlock).join('') +
        '</div>' +
        '</div>';

      return H.pageShell(carnet, options, {
        number: startPageNumber + index,
        section: 'CORRECTIONS · ' + (index + 1) + '/' + total,
        meta: 'SOLUTIONS',
        content: content,
        className: 'page-corrections'
      });
    });
  }

  return { pages: pages };
});
