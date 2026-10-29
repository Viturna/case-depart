/**
 * Imposition du livret A5 — Case Départ
 *
 * Le carnet A5 est imprimé sur des feuilles A4 paysage, recto-verso, puis plié.
 * L'ordre ci-dessous place les pages pour que la lecture reste continue après
 * pliage et agrafage au centre.
 */

(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartImposition = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function padToMultipleOf4(pageCount) {
    if (!Number.isInteger(pageCount) || pageCount < 1) {
      throw new Error('Le nombre de pages doit être un entier positif.');
    }
    var padded = pageCount;
    while (padded % 4 !== 0) {
      padded++;
    }
    return padded;
  }

  /**
   * Retourne les côtés A4 dans l'ordre d'impression.
   * Chaque côté est une paire [pageDeGauche, pageDeDroite] (numéros 1-based).
   *
   * Exemple 8 pages : [8,1], [2,7], [6,3], [4,5].
   *
   * @param {number} pageCount multiple de 4
   * @returns {Array<[number, number]>}
   */
  function impositionOrder(pageCount) {
    if (!Number.isInteger(pageCount) || pageCount < 4 || pageCount % 4 !== 0) {
      throw new Error('Le nombre de pages doit être un multiple de 4 (minimum 4).');
    }

    var sides = [];
    var halfSheets = pageCount / 4;

    for (var k = 0; k < halfSheets; k++) {
      sides.push([pageCount - 2 * k, 2 * k + 1]);
      sides.push([2 * k + 2, pageCount - 2 * k - 1]);
    }

    return sides;
  }

  /**
   * Regroupe les côtés en feuilles (recto / verso).
   * @param {number} pageCount multiple de 4
   * @returns {Array<{front: [number, number], back: [number, number]}>}
   */
  function bookletSheets(pageCount) {
    var sides = impositionOrder(pageCount);
    var sheets = [];
    for (var i = 0; i < sides.length; i += 2) {
      sheets.push({ front: sides[i], back: sides[i + 1] });
    }
    return sheets;
  }

  return {
    padToMultipleOf4: padToMultipleOf4,
    impositionOrder: impositionOrder,
    bookletSheets: bookletSheets
  };
});
