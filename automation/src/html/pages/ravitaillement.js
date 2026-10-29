/**
 * Pages « Ravitaillement » : coloriage et tirage — Case Départ
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
    globalThis.CaseDepartPageRavitaillement = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, I) {
  'use strict';

  function paletteRow() {
    var colors = [
      { hex: '#EFDEC2', label: 'SABLE' },
      { hex: '#315A54', label: 'SAPIN' },
      { hex: '#9F1014', label: 'BRIQUE' },
      { hex: '#FEC2DC', label: 'ROSE' }
    ];

    return (
      '<div class="palette-row">' +
      colors
        .map(function (color) {
          return (
            '<div class="palette-swatch">' +
            '<div class="swatch" style="background:' +
            color.hex +
            '"></div>' +
            '<span class="mono">' +
            color.label +
            '</span>' +
            '</div>'
          );
        })
        .join('') +
      '<div class="palette-note mono">4 COULEURS<br>PAS UNE DE PLUS</div>' +
      '</div>'
    );
  }

  function coloringPage(carnet, options, section, pageNumber) {
    var artwork = I.getArtwork(section.illustration);
    var content =
      '<div class="ravito-page ravito-coloring">' +
      '<div class="eyebrow mono">RAVITAILLEMENT N°' +
      section.number +
      ' · COLORIAGE</div>' +
      '<h2 class="ravito-title h">' +
      H.escapeHtml(section.title) +
      '</h2>' +
      '<p class="ravito-consigne">' +
      H.escapeHtml(section.consigne) +
      '</p>' +
      '<div class="ravito-art">' +
      artwork.coloring(section.theme || carnet.theme) +
      '</div>' +
      paletteRow() +
      '<p class="ravito-foot mono">LE CHRONO EST EN PAUSE. PROFITES-EN.</p>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: 'RAVITAILLEMENT N°' + section.number,
      meta: 'COLORIAGE',
      content: content,
      className: 'page-ravito'
    });
  }

  function tiragePage(carnet, options, section, pageNumber) {
    var starred = section.starred;
    var keyDigit = starred ? starred.digit : null;
    var keyGrid = starred ? starred.gridLabel : '';

    var rows = section.textes
      .map(function (text, index) {
        var digit = index + 1;
        var isKey = keyDigit === digit;
        return (
          '<div class="tirage-row' +
          (isKey ? ' is-key' : '') +
          '">' +
          '<span class="tirage-digit mono">' +
          (digit < 10 ? '0' + digit : String(digit)) +
          '</span>' +
          '<p class="tirage-text">' +
          H.escapeHtml(text) +
          '</p>' +
          (isKey ? '<span class="tirage-flag mono">TON RÉSULTAT</span>' : '') +
          '</div>'
        );
      })
      .join('');

    var content =
      '<div class="ravito-page ravito-tirage">' +
      '<div class="eyebrow mono">RAVITAILLEMENT N°' +
      section.number +
      ' · TIRAGE</div>' +
      '<h2 class="ravito-title h">' +
      H.escapeHtml(section.title) +
      '</h2>' +
      '<p class="ravito-consigne">' +
      H.escapeHtml(section.consigne) +
      '</p>' +
      '<div class="key-box">' +
      '<div class="key-left"><span class="mono">TON CHIFFRE CLÉ</span><span class="key-digit h">' +
      (keyDigit == null ? '—' : keyDigit) +
      '</span></div>' +
      '<div class="key-right"><span class="mono">CASE ÉTOILÉE · GRILLE ' +
      H.escapeHtml(keyGrid) +
      '</span><p>Le chiffre que tu as écrit dans la case marquée d\'une étoile. Si tu ne l\'as pas encore trouvé, va voir la grille ' +
      H.escapeHtml(keyGrid) +
      '.</p></div>' +
      '</div>' +
      '<div class="tirage-list">' +
      rows +
      '</div>' +
      '<p class="ravito-foot mono">UN SEUL PRÉSAGE COMPTE. LES AUTRES SONT LÀ POUR TE FAIRE DOUTER.</p>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: 'RAVITAILLEMENT N°' + section.number,
      meta: 'TIRAGE',
      content: content,
      className: 'page-ravito'
    });
  }

  return {
    coloringPage: coloringPage,
    tiragePage: tiragePage,
    paletteRow: paletteRow
  };
});
