/**
 * PRNG seedé — Case Départ
 *
 * Implémentation autonome (aucune dépendance npm, aucun module Node) :
 *   - xmur3 : transforme une chaîne de caractères en graine 32 bits ;
 *   - mulberry32 : générateur pseudo-aléatoire rapide et déterministe.
 *
 * Le fichier fonctionne :
 *   - dans Node (CommonJS) : require('./prng.js') ;
 *   - dans un nœud Code n8n : le code peut être concaténé, l'API est exposée
 *     sur globalThis.CaseDepartPrng.
 *
 * Une même chaîne de graine produit toujours exactement la même séquence.
 */

(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartPrng = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Hash de chaîne inspiré de xmur3.
   * @param {string} str
   * @returns {function(): number} générateur de graines 32 bits
   */
  function xmur3(str) {
    var h = 1779033703 ^ String(str).length;
    for (var i = 0; i < String(str).length; i++) {
      h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  /**
   * Générateur mulberry32.
   * @param {number} a graine 32 bits
   * @returns {function(): number} nombre flottant dans [0, 1)
   */
  function mulberry32(a) {
    var state = a >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Crée un générateur déterministe à partir d'une chaîne (ou d'un nombre).
   * @param {string|number} seed
   * @returns {{
   *   next: function(): number,
   *   int: function(number, number): number,
   *   pick: function(Array): *,
   *   shuffle: function(Array): Array,
   *   seed: string
   * }}
   */
  function createRng(seed) {
    var seedString = String(seed);
    var seedFn = xmur3(seedString);
    var next = mulberry32(seedFn());

    return {
      seed: seedString,
      next: next,
      /** Entier uniforme entre min et max inclus. */
      int: function (min, max) {
        if (max < min) {
          throw new Error('int(min, max) : max doit être >= min.');
        }
        return min + Math.floor(next() * (max - min + 1));
      },
      /** Élément aléatoire d'un tableau non vide. */
      pick: function (array) {
        if (!array || array.length === 0) {
          throw new Error('pick() : tableau vide.');
        }
        return array[Math.floor(next() * array.length)];
      },
      /** Mélange de Fisher-Yates en place (retourne le tableau). */
      shuffle: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(next() * (i + 1));
          var tmp = array[i];
          array[i] = array[j];
          array[j] = tmp;
        }
        return array;
      }
    };
  }

  return {
    xmur3: xmur3,
    mulberry32: mulberry32,
    hashString: function (str) {
      return xmur3(str)();
    },
    createRng: createRng
  };
});
