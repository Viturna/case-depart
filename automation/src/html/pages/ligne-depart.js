/**
 * Page « Ligne de départ » : règles, niveaux, temps total — Case Départ
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
    globalThis.CaseDepartPageLigneDepart = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (H, I) {
  'use strict';

  function ruleBlock(number, title, text) {
    return (
      '<div class="rule-block">' +
      '<div class="rule-number mono">' +
      number +
      '</div>' +
      '<h3 class="rule-title h">' +
      H.escapeHtml(title) +
      '</h3>' +
      '<p class="rule-text">' +
      H.escapeHtml(text) +
      '</p>' +
      '</div>'
    );
  }

  function levelRow(level) {
    var config = H.levelConfig(level);
    var taglines = {
      echauffement: 'Tu t\'étires. Les cases se remplissent presque toutes seules.',
      sprint: 'Le crayon chauffe. Il faut regarder un peu plus loin.',
      marathon: 'Pas de raccourci. Juste toi, 81 cases et ce qu\'il reste de ta dignité.'
    };
    return (
      '<div class="level-row">' +
      '<div class="level-name h">' +
      H.escapeHtml(config.label) +
      ' <span class="arrows">' +
      H.escapeHtml(config.arrows) +
      '</span></div>' +
      '<div class="level-clues mono">' +
      H.escapeHtml(config.clues) +
      '</div>' +
      '<div class="level-tagline">' +
      H.escapeHtml(taglines[level]) +
      '</div>' +
      '</div>'
    );
  }

  function page(carnet, options, pageNumber) {
    var content =
      '<div class="rules-page">' +
      '<div class="rules-heading">' +
      '<div class="eyebrow mono">MODE D\'EMPLOI</div>' +
      '<h2 class="rules-title h">Ligne<br>de départ</h2>' +
      '</div>' +
      '<p class="rules-lead">' +
      H.escapeHtml(carnet.intro) +
      '</p>' +
      '<div class="rules-grid">' +
      ruleBlock(
        '01',
        'Une grille, neuf chiffres',
        'Chaque ligne, chaque colonne et chaque bloc 3×3 contient les chiffres 1 à 9, une seule fois. Rien de plus. Rien de moins.'
      ) +
      ruleBlock(
        '02',
        'Trois niveaux',
        'Échauffement, Sprint, Marathon. Les indices diminuent, la difficulté monte. Tu peux t\'arrêter entre deux niveaux, pas au milieu d\'une grille.'
      ) +
      ruleBlock(
        '03',
        'Deux ravitaillements',
        'Un coloriage après l\'Échauffement, un tirage après le Sprint. Le chrono s\'arrête. La grille attend.'
      ) +
      ruleBlock(
        '04',
        'Une case étoilée',
        'Dans la dernière grille Sprint, une case porte une étoile. Le chiffre que tu y écris devient ton chiffre clé pour le tirage. Note-le avant de tourner la page.'
      ) +
      '</div>' +
      '<div class="level-table">' +
      '<div class="level-table-head mono"><span>Niveau</span><span>Indices</span><span>Ce qui t\'attend</span></div>' +
      levelRow('echauffement') +
      levelRow('sprint') +
      levelRow('marathon') +
      '</div>' +
      '<div class="departure-time">' +
      '<div class="mono">TEMPS TOTAL</div>' +
      '<div class="time-write">__ : __ : __</div>' +
      '<div class="mono time-hint">HEURES · MINUTES · SECONDES</div>' +
      '</div>' +
      '<p class="rules-foot mono">' +
      H.escapeHtml(carnet.mentionRavitaillements) +
      '</p>' +
      '</div>';

    return H.pageShell(carnet, options, {
      number: pageNumber,
      section: '02 / LIGNE DE DÉPART',
      meta: 'RÈGLES · NIVEAUX · TEMPS',
      content: content,
      className: 'page-rules'
    });
  }

  return { page: page };
});
