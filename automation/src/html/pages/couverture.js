/**
 * Page de couverture — Case Départ
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
    globalThis.CaseDepartPageCouverture = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, I) {
  'use strict';

  function countRavitaillements(carnet) {
    return carnet.sections.filter(function (section) {
      return section.kind === 'coloriage' || section.kind === 'tirage';
    }).length;
  }

  function page(carnet) {
    var theme = carnet.theme;
    var gridCount = carnet.grids.length + (carnet.finalGrid ? 1 : 0);
    var ravitaillements = countRavitaillements(carnet);
    var gift = carnet.gift && carnet.gift.recipientName
      ? '<div class="cover-gift mono">POUR ' + H.escapeHtml(carnet.gift.recipientName.toUpperCase()) + '</div>'
      : '';

    var content =
      '<section class="page page-cover">' +
      '<div class="cover-inner">' +
      '<div class="cover-top mono"><span>CASE DÉPART — N° 01</span><span>' +
      H.escapeHtml(carnet.edition) +
      '</span></div>' +
      '<div class="cover-rule"></div>' +
      '<div class="cover-badge"><span class="mono">' +
      H.escapeHtml(theme.nom.toUpperCase()) +
      '</span><span class="cover-badge-year">' +
      H.escapeHtml(String(theme.annee || '')) +
      '</span></div>' +
      gift +
      '<div class="cover-title h">Carnet<br>de <span class="highlight">' +
      H.escapeHtml(theme.nom) +
      '</span></div>' +
      '<div class="cover-sub mono">' +
      gridCount +
      ' GRILLES · 3 NIVEAUX · ' +
      ravitaillements +
      (ravitaillements > 1 ? ' RAVITAILLEMENTS' : ' RAVITAILLEMENT') +
      '</div>' +
      '<div class="cover-art">' +
      I.cover(theme) +
      '</div>' +
      '<div class="cover-bottom">' +
      '<p class="cover-phrase">' +
      H.escapeHtml(carnet.coverPhrase) +
      '</p>' +
      '<div class="cover-foot mono"><span>SUDOKU · IMPRESSION N&amp;B OK</span><span>CASE DÉPART</span></div>' +
      '</div>' +
      '</div>' +
      '</section>';

    return content;
  }

  return { page: page };
});
