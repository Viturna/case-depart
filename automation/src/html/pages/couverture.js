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
  var Covers =
    loadModule('../cover-illustrations.js', 'CaseDepartCoverIllustrations');
  var api = factory(H, I, Covers);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartPageCouverture = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, I, Covers) {
  'use strict';

  function countRavitaillements(carnet) {
    return carnet.sections.filter(function (section) {
      return section.kind === 'coloriage' || section.kind === 'tirage';
    }).length;
  }

  // 9×9 cases vides, juste le motif décoratif (pas de vraie grille sur la couverture).
  function emptyGridSpans() {
    var out = '';
    for (var i = 0; i < 81; i++) out += '<span></span>';
    return out;
  }

  /** Couverture calquée sur case-depart-template-halloween.html / -noel.html. */
  function pageV2(carnet) {
    var theme = carnet.theme;
    var cc = theme.coverColors;
    var gridCount = carnet.grids.length + (carnet.finalGrid ? 1 : 0);
    var illustration = (Covers && Covers[cc.illustration]) || '';
    var style =
      '--fond-couverture:' + cc.fondCouverture + ';' +
      '--titre:' + cc.titre + ';' +
      '--encre-couv:' + cc.encreCouv + ';' +
      '--illustration:url("' + illustration + '")';

    return (
      '<section class="page couverture" style="' + H.escapeHtml(style) + '">' +
      '<p class="edition">CASE DÉPART - ' + H.escapeHtml(carnet.edition.toUpperCase()) + '</p>' +
      '<div class="grille">' + emptyGridSpans() + '</div>' +
      '<h1 class="titre">' + H.escapeHtml(theme.nom.toUpperCase()) + '</h1>' +
      '<p class="nombre">' + gridCount + ' grilles</p>' +
      '</section>'
    );
  }

  function page(carnet) {
    var theme = carnet.theme;
    if (theme.coverColors) {
      return pageV2(carnet);
    }
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
