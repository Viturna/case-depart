/**
 * Page « Carte cadeau » — Case Départ
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
  var api = factory(H);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartPageCarteCadeau = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H) {
  'use strict';

  function motif() {
    return (
      '<svg class="gift-motif" viewBox="0 0 240 240" role="img" aria-label="Grille 3 par 3">' +
      '<g fill="none" stroke="#041735" stroke-width="2">' +
      '<rect x="1" y="1" width="238" height="238"/>' +
      '<path d="M80 1V239M160 1V239M1 80H239M1 160H239"/>' +
      '</g>' +
      '<rect x="1" y="1" width="79" height="79" fill="#E8D48A"/>' +
      '<rect x="161" y="161" width="78" height="78" fill="#041735"/>' +
      '<g fill="#041735" font-family="IBM Plex Mono, monospace" font-size="34" font-weight="600" text-anchor="middle">' +
      '<text x="120" y="120" dominant-baseline="central">5</text>' +
      '<text x="200" y="120" dominant-baseline="central">9</text>' +
      '<text x="120" y="200" dominant-baseline="central">.</text>' +
      '</g>' +
      '</svg>'
    );
  }

  function page(carnet, options, pageNumber) {
    var gift = carnet.gift || {};
    var recipient = gift.recipientName || 'Toi';
    var message =
      gift.message ||
      'Bonne grille. Prends ton temps, personne ne compte. Enfin, si : le chrono.';

    var content =
      '<div class="gift-page">' +
      '<div class="eyebrow mono">CARTE CADEAU · NE PAS OUVRIR AVANT LE DÉPART</div>' +
      '<h2 class="gift-title h">Pour<br><span class="highlight">' +
      H.escapeHtml(recipient) +
      '</span></h2>' +
      '<div class="gift-body">' +
      '<div class="gift-message">' +
      '<p>' +
      H.escapeHtml(message) +
      '</p>' +
      '<p class="gift-signature mono">— CASE DÉPART</p>' +
      '</div>' +
      '<div class="gift-art">' +
      motif() +
      '</div>' +
      '</div>' +
      '<div class="gift-strip mono">' +
      '<span>UN CARNET</span><span>·</span><span>DES GRILLES</span><span>·</span><span>UN CHRONO</span>' +
      '</div>' +
      '<p class="gift-foot mono">' +
      H.escapeHtml(carnet.title) +
      ' — ' +
      H.escapeHtml(carnet.edition) +
      ' · PDF À IMPRIMER</p>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: 'CARTE CADEAU',
      meta: 'POUR ' + String(recipient).toUpperCase(),
      content: content,
      className: 'page-gift'
    });
  }

  return { page: page };
});
