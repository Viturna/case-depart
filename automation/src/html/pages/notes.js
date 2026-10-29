/**
 * Page « Notes » utilisée pour compléter le livret à un multiple de 4.
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
    globalThis.CaseDepartPageNotes = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H) {
  'use strict';

  function page(carnet, options, pageNumber) {
    var lines = '';
    for (var i = 0; i < 16; i++) {
      lines += '<div class="note-line"></div>';
    }

    var content =
      '<div class="notes-page">' +
      '<div class="eyebrow mono">PAGE LIBRE</div>' +
      '<h2 class="notes-title h">Notes</h2>' +
      '<p class="notes-lead">Pour les chiffres qui ne rentrent pas, les comptes, ou les messages à laisser à la prochaine personne qui ouvrira ce carnet.</p>' +
      '<div class="notes-lines">' +
      lines +
      '</div>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: 'NOTES',
      meta: 'PAGE LIBRE',
      content: content,
      className: 'page-notes'
    });
  }

  return { page: page };
});
