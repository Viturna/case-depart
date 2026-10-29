/**
 * Tests des données du carnet — Case Départ
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { getTheme, buildCarnet, PALETTE } = require('../src/carnet.js');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'config', 'themes.json'), 'utf8')
);
const noel = getTheme(catalog, 'noel');

function allGrids(carnet) {
  return carnet.finalGrid ? carnet.grids.concat([carnet.finalGrid]) : carnet.grids.slice();
}

test('thèmes — chaque couleur appartient à la palette', () => {
  for (const slug of Object.keys(catalog)) {
    const theme = catalog[slug];
    assert.equal(theme.tirage.textes.length, 9, `${slug} : 9 textes de tirage attendus`);
    for (const value of Object.values(theme.couleurs)) {
      assert.ok(PALETTE.includes(value), `${slug} : couleur hors palette ${value}`);
    }
  }
});

test('carnet thématique — structure, niveaux et grille finale', () => {
  const carnet = buildCarnet({
    theme: noel,
    type: 'thematique',
    slug: 'test-noel',
    counts: { echauffement: 2, sprint: 2, marathon: 2 }
  });

  assert.equal(carnet.type, 'thematique');
  assert.equal(carnet.grids.length, 6);
  assert.ok(carnet.finalGrid);
  assert.equal(carnet.finalGrid.label, 'FIN');
  assert.equal(carnet.sections.length, 5);
  assert.deepEqual(
    carnet.sections.map((section) => section.kind),
    ['grids', 'coloriage', 'grids', 'tirage', 'grids']
  );
  assert.equal(carnet.corrections.length, 7);

  const labels = allGrids(carnet).map((grid) => grid.label);
  assert.deepEqual(labels, ['E01', 'E02', 'S01', 'S02', 'M01', 'M02', 'FIN']);

  const seeds = new Set(allGrids(carnet).map((grid) => grid.seed));
  assert.equal(seeds.size, 7);

  const puzzles = new Set(allGrids(carnet).map((grid) => grid.puzzle));
  assert.equal(puzzles.size, 7);

  for (const grid of allGrids(carnet)) {
    assert.match(grid.puzzle, /^[0-9]{81}$/);
    assert.match(grid.solution, /^[1-9]{81}$/);
    const config = { echauffement: [38, 45], sprint: [30, 36], marathon: [24, 29] }[
      grid.level
    ];
    assert.ok(grid.clues >= config[0] && grid.clues <= config[1], grid.seed);
  }
});

test('carnet thématique — le chiffre clé correspond à la case étoilée', () => {
  const carnet = buildCarnet({
    theme: noel,
    type: 'thematique',
    slug: 'test-etoile',
    counts: { echauffement: 1, sprint: 1, marathon: 1 }
  });

  const sprintSection = carnet.sections.find(
    (section) => section.kind === 'grids' && section.level === 'sprint'
  );
  const lastSprint = sprintSection.grids[sprintSection.grids.length - 1];

  assert.ok(carnet.starred);
  assert.equal(carnet.starred.gridLabel, lastSprint.label);
  assert.equal(carnet.starred.cell, lastSprint.starCell);
  assert.equal(
    carnet.starred.digit,
    Number(lastSprint.solution.charAt(lastSprint.starCell)),
    'le chiffre clé doit venir de la solution'
  );
  assert.ok(lastSprint.puzzle.charAt(lastSprint.starCell) === '0', 'la case étoilée doit être vide');
});

test('carnet Starter — 3 grilles, 1 coloriage, pas de finale', () => {
  const carnet = buildCarnet({
    theme: noel,
    type: 'starter',
    slug: 'test-starter'
  });

  assert.equal(carnet.grids.length, 3);
  assert.equal(carnet.finalGrid, null);
  assert.deepEqual(
    carnet.grids.map((grid) => grid.level),
    ['echauffement', 'sprint', 'marathon']
  );
  assert.deepEqual(
    carnet.sections.map((section) => section.kind),
    ['grids', 'coloriage']
  );
  assert.equal(carnet.corrections.length, 3);
});

test('carnet L\'Étape — 10 grilles d\'un seul niveau + 1 Ravitaillement', () => {
  const carnet = buildCarnet({
    theme: noel,
    type: 'etape',
    level: 'sprint',
    slug: 'test-etape'
  });

  assert.equal(carnet.grids.length, 10);
  assert.equal(carnet.finalGrid, null);
  assert.ok(carnet.grids.every((grid) => grid.level === 'sprint'));
  assert.deepEqual(
    carnet.sections.map((section) => section.kind),
    ['grids', 'coloriage']
  );
  assert.deepEqual(
    carnet.grids.map((grid) => grid.label),
    Array.from({ length: 10 }, (_, i) => `S${String(i + 1).padStart(2, '0')}`)
  );
});

test('carnet L\'Étape — Ravitaillement tirage et case étoilée', () => {
  const carnet = buildCarnet({
    theme: noel,
    type: 'etape',
    level: 'marathon',
    slug: 'test-etape-tirage',
    ravitaillement: 'tirage'
  });

  assert.deepEqual(
    carnet.sections.map((section) => section.kind),
    ['grids', 'tirage']
  );
  const lastGrid = carnet.grids[carnet.grids.length - 1];
  assert.equal(carnet.starred.gridLabel, lastGrid.label);
  assert.equal(carnet.starred.digit, Number(lastGrid.solution.charAt(lastGrid.starCell)));
});

test('carnet Tour de l\'année — 6 grilles × 5 thèmes + 1 Ravitaillement par thème', () => {
  const carnet = buildCarnet({
    theme: getTheme(catalog, 'multi-theme'),
    catalog,
    type: 'tour-annee',
    slug: 'test-tour'
  });

  assert.equal(carnet.grids.length, 30);
  assert.equal(carnet.finalGrid, null);

  const themeSections = carnet.sections.filter((section) => section.kind === 'theme');
  assert.equal(themeSections.length, 5);
  themeSections.forEach((section) => {
    assert.equal(section.grids.length, 6);
  });

  const ravitoSections = carnet.sections.filter(
    (section) => section.kind === 'coloriage' || section.kind === 'tirage'
  );
  assert.equal(ravitoSections.length, 5);

  const labels = new Set(carnet.grids.map((grid) => grid.label));
  assert.equal(labels.size, 30);
});

test('carnet — la version à offrir est conservée dans les données', () => {
  const carnet = buildCarnet({
    theme: noel,
    type: 'starter',
    slug: 'test-cadeau',
    gift: { recipientName: 'Camille', message: 'Bonne grille.' },
    buyerEmail: 'acheteur@exemple.fr'
  });

  assert.deepEqual(carnet.gift, { recipientName: 'Camille', message: 'Bonne grille.' });
  assert.equal(carnet.buyerEmail, 'acheteur@exemple.fr');
});
