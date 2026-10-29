/**
 * Illustrations SVG réutilisables — Case Départ
 *
 * Chaque illustration est une fonction (theme) -> markup SVG.
 * Le registre permet d'ajouter un thème sans toucher au gabarit :
 *   illustrations: { couverture: 'mon-id', coloriage: 'mon-id' }
 */

(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartIllustrations = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SABLE = '#EFDEC2';
  var SAPIN = '#315A54';
  var BRIQUE = '#9F1014';
  var ROSE = '#FEC2DC';

  function starPath(cx, cy, outer, inner) {
    var points = [];
    for (var i = 0; i < 10; i++) {
      var radius = i % 2 === 0 ? outer : inner;
      var angle = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push(
        (cx + Math.cos(angle) * radius).toFixed(2) +
          ',' +
          (cy + Math.sin(angle) * radius).toFixed(2)
      );
    }
    return points.join(' ');
  }

  function noelCover() {
    return (
      '<svg class="art art-cover" viewBox="0 0 400 430" role="img" aria-label="Sapin géométrique de Noël">' +
      '<g fill="none" stroke="' +
      SAPIN +
      '" stroke-width="1.5">' +
      '<rect x="18" y="18" width="364" height="394"/>' +
      '<path d="M136 18V412M264 18V412M18 136H382M18 274H382"/>' +
      '</g>' +
      '<rect x="136" y="18" width="128" height="118" fill="' +
      ROSE +
      '" opacity="1"/>' +
      '<g fill="' +
      SAPIN +
      '">' +
      '<polygon points="200,54 286,170 114,170"/>' +
      '<polygon points="200,128 314,262 86,262"/>' +
      '<polygon points="200,210 350,376 50,376"/>' +
      '<rect x="184" y="366" width="32" height="34"/>' +
      '</g>' +
      '<polygon points="' +
      starPath(200, 44, 26, 11) +
      '" fill="' +
      ROSE +
      '" stroke="' +
      SAPIN +
      '" stroke-width="2"/>' +
      '<g>' +
      '<circle cx="166" cy="232" r="10" fill="' +
      SABLE +
      '"/>' +
      '<rect x="230" y="218" width="20" height="20" fill="' +
      BRIQUE +
      '"/>' +
      '<circle cx="200" cy="304" r="12" fill="' +
      ROSE +
      '"/>' +
      '<rect x="134" y="330" width="22" height="22" fill="' +
      SABLE +
      '"/>' +
      '<circle cx="278" cy="332" r="9" fill="' +
      BRIQUE +
      '"/>' +
      '<rect x="242" y="292" width="18" height="18" fill="' +
      SABLE +
      '"/>' +
      '</g>' +
      '<g fill="none" stroke="' +
      SABLE +
      '" stroke-width="2">' +
      '<path d="M120 170H280M96 262H304M64 376H336"/>' +
      '<path d="M200 72V366"/>' +
      '</g>' +
      '</svg>'
    );
  }

  function noelColoring() {
    return (
      '<svg class="art art-coloring" viewBox="0 0 400 430" role="img" aria-label="Sapin à colorier">' +
      '<g fill="none" stroke="' +
      SAPIN +
      '" stroke-width="4" stroke-linejoin="round">' +
      '<rect x="16" y="16" width="368" height="398"/>' +
      '<path d="M133 16V414M267 16V414M16 133H384M16 281H384"/>' +
      '<polygon points="200,48 290,172 110,172"/>' +
      '<polygon points="200,126 320,268 80,268"/>' +
      '<polygon points="200,214 356,384 44,384"/>' +
      '<rect x="180" y="372" width="40" height="38"/>' +
      '<polygon points="' +
      starPath(200, 42, 24, 10) +
      '"/>' +
      '<circle cx="162" cy="238" r="12"/>' +
      '<circle cx="238" cy="236" r="12"/>' +
      '<circle cx="200" cy="312" r="15"/>' +
      '<circle cx="286" cy="338" r="10"/>' +
      '<circle cx="130" cy="340" r="10"/>' +
      '<rect x="190" y="286" width="20" height="20"/>' +
      '<path d="M100 172H300M72 268H328M36 384H364"/>' +
      '<path d="M200 60V372"/>' +
      '<path d="M146 104L254 104M124 172L276 172M100 214L300 214"/>' +
      '</g>' +
      '</svg>'
    );
  }

  function genericCover() {
    return (
      '<svg class="art art-cover" viewBox="0 0 400 430" role="img" aria-label="Grille 3 par 3">' +
      '<g fill="none" stroke="' +
      SAPIN +
      '" stroke-width="2">' +
      '<rect x="20" y="20" width="360" height="390"/>' +
      '<rect x="60" y="60" width="280" height="280"/>' +
      '<path d="M153 60V340M247 60V340M60 153H340M60 247H340"/>' +
      '</g>' +
      '<rect x="60" y="60" width="93" height="93" fill="' +
      ROSE +
      '"/>' +
      '<rect x="153" y="247" width="94" height="93" fill="' +
      SAPIN +
      '"/>' +
      '<g fill="' +
      SAPIN +
      '" font-family="IBM Plex Mono, monospace" font-size="42" font-weight="600" text-anchor="middle">' +
      '<text x="200" y="137">5</text>' +
      '<text x="293" y="137">.</text>' +
      '<text x="200" y="230">.</text>' +
      '<text x="293" y="230">8</text>' +
      '<text x="200" y="323">.</text>' +
      '</g>' +
      '<g fill="none" stroke="' +
      SAPIN +
      '" stroke-width="1">' +
      '<path d="M40 380H360"/>' +
      '<path d="M60 400H340"/>' +
      '</g>' +
      '</svg>'
    );
  }

  function genericColoring() {
    return (
      '<svg class="art art-coloring" viewBox="0 0 400 430" role="img" aria-label="Grille à colorier">' +
      '<g fill="none" stroke="' +
      SAPIN +
      '" stroke-width="4">' +
      '<rect x="16" y="16" width="368" height="398"/>' +
      '<rect x="52" y="52" width="296" height="296"/>' +
      '<path d="M151 52V348M249 52V348M52 151H348M52 249H348"/>' +
      '<circle cx="101" cy="101" r="20"/>' +
      '<circle cx="299" cy="299" r="20"/>' +
      '<rect x="176" y="176" width="48" height="48"/>' +
      '<path d="M52 382H348M52 400H348"/>' +
      '</g>' +
      '</svg>'
    );
  }

  var registry = {
    'noel-sapin': {
      cover: noelCover,
      coloring: noelColoring
    },
    'grille-generique': {
      cover: genericCover,
      coloring: genericColoring
    }
  };

  function getArtwork(id) {
    return registry[id] || registry['grille-generique'];
  }

  function cover(theme) {
    var artwork = getArtwork(theme && theme.illustrations && theme.illustrations.couverture);
    return artwork.cover(theme);
  }

  function coloring(theme) {
    var artwork = getArtwork(theme && theme.illustrations && theme.illustrations.coloriage);
    return artwork.coloring(theme);
  }

  function register(id, artwork) {
    if (!id || !artwork || typeof artwork.cover !== 'function' || typeof artwork.coloring !== 'function') {
      throw new Error('Illustration invalide : cover et coloring sont requis.');
    }
    registry[id] = artwork;
  }

  return {
    registry: registry,
    register: register,
    getArtwork: getArtwork,
    cover: cover,
    coloring: coloring,
    starPath: starPath
  };
});
