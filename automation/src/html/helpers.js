/**
 * Helpers HTML partagés — Case Départ
 */

(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartHtmlHelpers = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function mono(value) {
    return '<span class="mono">' + escapeHtml(value) + '</span>';
  }

  function pageNumberLabel(number) {
    return number < 10 ? '0' + number : String(number);
  }

  /**
   * Enveloppe une page dans le cadre commun (bandeau, filet, pied).
   *
   * @param {object} carnet
   * @param {object} options
   * @param {{number:number, section?:string, meta?:string, content:string, className?:string}} config
   * @returns {string}
   */
  function pageShell(carnet, options, config) {
    options = options || {};
    var section = config.section ? escapeHtml(config.section) : '';
    var meta = config.meta ? escapeHtml(config.meta) : '';
    var buyer = options.buyerEmail
      ? '<span class="mono buyer-email">' + escapeHtml(options.buyerEmail) + '</span>'
      : '';

    return (
      '<section class="page ' +
      (config.className || '') +
      '" data-page="' +
      config.number +
      '">' +
      '<div class="page-inner">' +
      '<div class="page-head mono"><span class="page-head-left">' +
      section +
      '</span><span class="page-head-right">' +
      meta +
      '</span></div>' +
      '<div class="hairline"></div>' +
      '<div class="page-content">' +
      config.content +
      '</div>' +
      '<div class="page-foot">' +
      '<span class="mono foot-brand">' +
      escapeHtml(carnet.title) +
      ' — ' +
      escapeHtml(carnet.edition) +
      '</span>' +
      buyer +
      '<span class="mono foot-number">' +
      pageNumberLabel(config.number) +
      '</span>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function sectionMeta(carnet, extra) {
    var parts = [];
    if (carnet && carnet.slug) {
      parts.push(String(carnet.slug).toUpperCase());
    }
    if (extra) {
      parts.push(extra);
    }
    return parts.join(' · ');
  }

  function levelConfig(level) {
    var map = {
      echauffement: { label: 'Échauffement', arrows: '›', clues: '38–45 indices' },
      sprint: { label: 'Sprint', arrows: '››', clues: '30–36 indices' },
      marathon: { label: 'Marathon', arrows: '›››', clues: '24–29 indices' }
    };
    return map[level] || { label: level, arrows: '', clues: '' };
  }

  return {
    escapeHtml: escapeHtml,
    mono: mono,
    pageNumberLabel: pageNumberLabel,
    pageShell: pageShell,
    sectionMeta: sectionMeta,
    levelConfig: levelConfig
  };
});
