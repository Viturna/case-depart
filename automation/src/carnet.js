/**
 * Construction des données d'un carnet — Case Départ
 *
 * Transforme un thème + un type de carnet en structure complète :
 *   - grilles générées et étiquetées ;
 *   - sections dans l'ordre de lecture ;
 *   - case étoilée et chiffre clé du tirage ;
 *   - données de couverture, d'introduction et de corrections.
 *
 * Aucune dépendance npm. Utilisable dans un nœud Code n8n.
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

  var sudoku =
    loadModule('./sudoku.js', 'CaseDepartSudoku');
  var prng =
    loadModule('./prng.js', 'CaseDepartPrng');
  var api = factory(sudoku, prng);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CaseDepartCarnet = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Sudoku, Prng) {
  'use strict';

  if (!Sudoku || typeof Sudoku.generateCarnetGrids !== 'function') {
    throw new Error('CaseDepartCarnet : le module sudoku.js est introuvable.');
  }
  if (!Prng || typeof Prng.createRng !== 'function') {
    throw new Error('CaseDepartCarnet : le module prng.js est introuvable.');
  }

  var PALETTE = ['#EFDEC2', '#315A54', '#9F1014', '#FEC2DC'];
  var LEVEL_ORDER = ['echauffement', 'sprint', 'marathon'];
  var LEVEL_PREFIX = {
    echauffement: 'E',
    sprint: 'S',
    marathon: 'M'
  };
  var LEVEL_LABEL = {
    echauffement: 'Échauffement',
    sprint: 'Sprint',
    marathon: 'Marathon'
  };
  var LEVEL_ARROWS = {
    echauffement: '›',
    sprint: '››',
    marathon: '›››'
  };
  var TYPES = ['thematique', 'starter', 'etape', 'tour-annee'];

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function normalizeSlug(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function cloneTheme(theme) {
    return JSON.parse(JSON.stringify(theme));
  }

  function validateTheme(theme) {
    assert(theme && typeof theme === 'object', 'Thème invalide.');
    assert(theme.slug, 'Le thème doit avoir un slug.');
    assert(theme.nom, 'Le thème doit avoir un nom.');
    assert(theme.titre, 'Le thème doit avoir un titre.');
    assert(theme.couleurs, 'Le thème doit avoir des couleurs.');
    assert(
      Array.isArray(theme.tirage && theme.tirage.textes) &&
        theme.tirage.textes.length === 9,
      'Le thème "' + theme.slug + '" doit fournir exactement 9 textes de tirage.'
    );

    Object.keys(theme.couleurs).forEach(function (key) {
      assert(
        PALETTE.indexOf(theme.couleurs[key]) !== -1,
        'Couleur hors palette pour le thème "' + theme.slug + '" : ' + theme.couleurs[key]
      );
    });
  }

  function getTheme(catalog, slug) {
    assert(catalog && typeof catalog === 'object', 'Catalogue de thèmes invalide.');
    var theme = catalog[slug];
    assert(theme, 'Thème inconnu : ' + slug);
    return cloneTheme(theme);
  }

  function buildGridLabel(level, position, prefix) {
    return (prefix || '') + LEVEL_PREFIX[level] + pad2(position);
  }

  /**
   * Génère les grilles d'un groupe en garantissant l'absence de doublon
   * avec les grilles déjà utilisées dans le carnet.
   */
  function generateThemeGrids(seedPrefix, counts, finalGrid, usedPuzzles) {
    var attempt = 0;
    while (attempt < 20) {
      var prefix = attempt === 0 ? seedPrefix : seedPrefix + '-bis' + attempt;
      var grids = Sudoku.generateCarnetGrids({
        carnet: prefix,
        counts: counts,
        finalGrid: !!finalGrid
      });

      var clash = grids.some(function (grid) {
        return !!usedPuzzles[grid.puzzle];
      });

      if (!clash) {
        grids.forEach(function (grid) {
          usedPuzzles[grid.puzzle] = true;
        });
        return grids;
      }
      attempt++;
    }

    throw new Error('Impossible de générer un carnet sans doublon pour "' + seedPrefix + '".');
  }

  /**
   * Choisit une case vide de la grille et calcule le chiffre clé à partir de
   * la solution. La case est ensuite marquée d'une étoile par le gabarit.
   */
  function attachStar(grid, seed, label) {
    var rng = Prng.createRng(seed + '-etoile');
    var emptyCells = [];
    for (var i = 0; i < 81; i++) {
      if (grid.puzzle.charAt(i) === '0') {
        emptyCells.push(i);
      }
    }

    assert(emptyCells.length > 0, 'La grille ' + label + ' ne contient aucune case vide.');
    var cell = emptyCells[rng.int(0, emptyCells.length - 1)];
    var digit = Number(grid.solution.charAt(cell));
    assert(digit >= 1 && digit <= 9, 'Chiffre clé invalide pour ' + label + '.');

    grid.starCell = cell;
    return {
      gridLabel: label,
      cell: cell,
      digit: digit
    };
  }

  function decorateGrids(grids, theme, options) {
    var byLevel = {
      echauffement: 0,
      sprint: 0,
      marathon: 0
    };

    return grids.map(function (grid) {
      byLevel[grid.level] += 1;
      var labelPrefix = options && options.labelPrefix ? options.labelPrefix : '';
      var label = buildGridLabel(grid.level, byLevel[grid.level], labelPrefix);
      var decorated = {
        seed: grid.seed,
        level: grid.level,
        levelLabel: LEVEL_LABEL[grid.level],
        levelArrows: LEVEL_ARROWS[grid.level],
        position: byLevel[grid.level],
        label: label,
        puzzle: grid.puzzle,
        solution: grid.solution,
        clues: grid.clues,
        techniques: grid.techniques.slice(),
        attempts: grid.attempts,
        themeSlug: theme.slug
      };
      return decorated;
    });
  }

  function splitFinal(grids) {
    var finalGrid = null;
    var regular = [];
    grids.forEach(function (grid) {
      if (grid.seed.indexOf('-final-') !== -1) {
        finalGrid = grid;
      } else {
        regular.push(grid);
      }
    });
    return { regular: regular, finalGrid: finalGrid };
  }

  function sectionGrids(level, grids) {
    return {
      kind: 'grids',
      level: level,
      title: LEVEL_LABEL[level],
      arrows: LEVEL_ARROWS[level],
      grids: grids
    };
  }

  function sectionColoriage(theme, number) {
    return {
      kind: 'coloriage',
      number: number,
      theme: theme,
      title: theme.coloriage.titre,
      consigne: theme.coloriage.consigne,
      illustration: theme.illustrations.coloriage
    };
  }

  function sectionTirage(theme, number, starred) {
    return {
      kind: 'tirage',
      number: number,
      theme: theme,
      title: theme.tirage.titre,
      consigne: theme.tirage.consigne,
      textes: theme.tirage.textes.slice(),
      starred: starred
    };
  }

  /**
   * Construit les données complètes d'un carnet.
   *
   * @param {{
   *   theme: object,
   *   type?: 'thematique'|'starter'|'etape'|'tour-annee',
   *   level?: 'echauffement'|'sprint'|'marathon',
   *   slug?: string,
   *   edition?: string,
   *   version?: string,
   *   gift?: {recipientName: string, message?: string},
   *   buyerEmail?: string,
   *   ravitaillement?: 'coloriage'|'tirage'
   * }} options
   * @returns {object}
   */
  function buildCarnet(options) {
    options = options || {};
    var theme = options.theme;
    validateTheme(theme);

    var type = options.type || 'thematique';
    assert(TYPES.indexOf(type) !== -1, 'Type de carnet inconnu : ' + type);
    var edition = options.edition || theme.sousTitre || 'Édition 2026';
    var version = options.version || '1.0.0';
    var slug = options.slug || normalizeSlug(theme.slug + '-' + edition);
    var counts = options.counts || null;
    var usedPuzzles = {};
    var grids = [];
    var finalGrid = null;
    var sections = [];
    var starred = null;

    if (type === 'thematique') {
      var generated = generateThemeGrids(
        slug,
        counts || { echauffement: 10, sprint: 10, marathon: 10 },
        true,
        usedPuzzles
      );
      var split = splitFinal(generated);
      var decorated = decorateGrids(split.regular, theme);
      grids = decorated;
      finalGrid = split.finalGrid
        ? decorateGrids([split.finalGrid], theme, { labelPrefix: 'F' })[0]
        : null;
      if (finalGrid) {
        finalGrid.label = 'FIN';
        finalGrid.position = 1;
      }

      var echauffement = decorated.filter(function (grid) {
        return grid.level === 'echauffement';
      });
      var sprint = decorated.filter(function (grid) {
        return grid.level === 'sprint';
      });
      var marathon = decorated.filter(function (grid) {
        return grid.level === 'marathon';
      });

      sections.push(sectionGrids('echauffement', echauffement));
      sections.push(sectionColoriage(theme, 1));
      sections.push(sectionGrids('sprint', sprint));

      if (sprint.length > 0) {
        starred = attachStar(sprint[sprint.length - 1], slug + '-tirage', sprint[sprint.length - 1].label);
      }
      sections.push(sectionTirage(theme, 2, starred));
      sections.push(sectionGrids('marathon', marathon));
    } else if (type === 'starter') {
      var starter = generateThemeGrids(
        slug,
        counts || { echauffement: 1, sprint: 1, marathon: 1 },
        false,
        usedPuzzles
      );
      grids = decorateGrids(starter, theme);
      sections.push({
        kind: 'grids',
        level: 'mixte',
        title: 'Trois grilles pour prendre le départ',
        arrows: '› ›› ›››',
        grids: grids
      });
      sections.push(sectionColoriage(theme, 1));
    } else if (type === 'etape') {
      var level = options.level;
      assert(LEVEL_ORDER.indexOf(level) !== -1, 'Niveau obligatoire pour un carnet L\'Étape.');
      var etapeCounts = {};
      etapeCounts[level] = (counts && counts[level]) || 10;

      var etapeGrids = generateThemeGrids(slug, etapeCounts, false, usedPuzzles);
      grids = decorateGrids(etapeGrids, theme);
      sections.push(sectionGrids(level, grids));

      var ravitaillement = options.ravitaillement || 'coloriage';
      if (ravitaillement === 'tirage') {
        starred = attachStar(grids[grids.length - 1], slug + '-tirage', grids[grids.length - 1].label);
        sections.push(sectionTirage(theme, 1, starred));
      } else {
        sections.push(sectionColoriage(theme, 1));
      }
    } else if (type === 'tour-annee') {
      var catalog = options.catalog;
      assert(catalog && typeof catalog === 'object', 'Le catalogue de thèmes est requis pour un Tour de l\'année.');
      var themeSlugs = Object.keys(catalog).filter(function (key) {
        return key !== 'multi-theme';
      });
      assert(themeSlugs.length >= 1, 'Aucun thème disponible pour le Tour de l\'année.');

      themeSlugs.forEach(function (themeSlug, index) {
        var currentTheme = getTheme(catalog, themeSlug);
        var themeGrids = generateThemeGrids(
          slug + '-t' + (index + 1) + '-' + themeSlug,
          { echauffement: 2, sprint: 2, marathon: 2 },
          false,
          usedPuzzles
        );
        var decoratedThemeGrids = decorateGrids(themeGrids, currentTheme, {
          labelPrefix: 'T' + (index + 1) + '-'
        });
        grids = grids.concat(decoratedThemeGrids);

        sections.push({
          kind: 'theme',
          theme: currentTheme,
          index: index + 1,
          grids: decoratedThemeGrids
        });

        var tourRavito = index % 2 === 0 ? 'coloriage' : 'tirage';
        if (tourRavito === 'tirage') {
          var lastGrid = decoratedThemeGrids[decoratedThemeGrids.length - 1];
          var tourStarred = attachStar(lastGrid, slug + '-tirage-t' + (index + 1), lastGrid.label);
          sections.push(
            sectionTirage(currentTheme, index + 1, tourStarred)
          );
          if (!starred) {
            starred = tourStarred;
          }
        } else {
          sections.push(sectionColoriage(currentTheme, index + 1));
        }
      });
    }

    var carnet = {
      slug: slug,
      type: type,
      version: version,
      theme: theme,
      title: theme.titre,
      subtitle: theme.sousTitre || edition,
      edition: edition,
      intro: theme.intro,
      coverPhrase: theme.phraseCouverture,
      mentionRavitaillements: theme.mentionRavitaillements,
      citation: theme.citation,
      grids: grids,
      finalGrid: finalGrid,
      starred: starred,
      sections: sections,
      corrections: finalGrid ? grids.concat([finalGrid]) : grids.slice(),
      gift: options.gift || null,
      buyerEmail: options.buyerEmail || null
    };

    return carnet;
  }

  return {
    PALETTE: PALETTE,
    LEVEL_ORDER: LEVEL_ORDER,
    LEVEL_LABEL: LEVEL_LABEL,
    LEVEL_ARROWS: LEVEL_ARROWS,
    TYPES: TYPES,
    getTheme: getTheme,
    validateTheme: validateTheme,
    buildCarnet: buildCarnet,
    normalizeSlug: normalizeSlug,
    attachStar: attachStar
  };
});
