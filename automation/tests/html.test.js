/**
 * Tests du gabarit HTML — Case Départ
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { getTheme, buildCarnet, PALETTE } = require('../src/carnet.js');
const { buildHtml } = require('../src/html/template.js');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'config', 'themes.json'), 'utf8')
);
// Fixture au style classique (sans coverColors) : saint-valentin n'a pas encore
// de template dédié. noel/halloween ont leur propre bloc de tests plus bas.
const theme = getTheme(catalog, 'saint-valentin');

const carnet = buildCarnet({
  theme: theme,
  type: 'thematique',
  slug: 'test-html',
  buyerEmail: null
});

const htmlA4 = buildHtml(carnet, { format: 'A4' });
const htmlA5 = buildHtml(carnet, { format: 'A5' });
const htmlLivret = buildHtml(carnet, { format: 'A5-livret' });

function countPages(html) {
  return (html.match(/<section class="page/g) || []).length;
}

test('HTML — document autonome et complet', () => {
  assert.match(htmlA4, /^<!doctype html>/i);
  assert.match(htmlA4, /<html lang="fr">/);
  assert.match(htmlA4, /<style>/);
  assert.ok(htmlA4.includes('data:font/woff2;base64,'), 'polices en base64 attendues');
  assert.ok(!/<link\b/i.test(htmlA4), 'aucune feuille de style externe');
  assert.ok(!/<img\b/i.test(htmlA4), 'aucune image externe');
  assert.ok(!/(src|href)="https?:/i.test(htmlA4), 'aucune ressource http(s)');
  assert.ok(!/url\(https?:/i.test(htmlA4), 'aucune URL http(s) dans le CSS');
});

test('HTML — palette stricte, aucun dégradé, ombre ou flou', () => {
  const colors = (htmlA4.match(/#[0-9a-fA-F]{6}\b/g) || []).map((value) =>
    value.toUpperCase()
  );
  for (const color of colors) {
    assert.ok(PALETTE.includes(color), `couleur hors palette : ${color}`);
  }

  assert.ok(!/gradient/i.test(htmlA4), 'aucun dégradé');
  assert.ok(!/box-shadow/i.test(htmlA4), 'aucune ombre');
  assert.ok(!/filter\s*:\s*blur/i.test(htmlA4), 'aucun flou');

  // 15mm : coin arrondi de la grille v2 (case-depart-template-*.html), présent
  // dans le CSS partagé même pour un carnet au style classique comme ici.
  const radii = htmlA4.match(/border-radius\s*:\s*[^;}]+/g) || [];
  radii.forEach((radius) => {
    assert.match(radius, /border-radius\s*:\s*(50%|15mm)/, `rayon non autorisé : ${radius}`);
  });
});

test('HTML — pages d\'un carnet thématique complet', () => {
  assert.equal(countPages(htmlA4), 41);
  assert.equal(countPages(htmlA5), 43);
  assert.match(htmlA4, /@page\{size:A4;margin:0\}/);
  assert.match(htmlA5, /@page\{size:A5;margin:0\}/);
});

test('HTML — une grille SVG par grille + une par correction', () => {
  const grids = (htmlA4.match(/<svg class="sudoku-grid/g) || []).length;
  assert.ok(grids >= 60, `grilles SVG attendues, trouvées : ${grids}`);
});

test('HTML — le chiffre clé et la case étoilée sont imprimés', () => {
  assert.ok(carnet.starred, 'chiffre clé attendu');
  assert.ok(htmlA4.includes('TON CHIFFRE CLÉ'));
  assert.ok(htmlA4.includes('CASE ÉTOILÉE'));
  assert.ok(htmlA4.includes('<span class="key-digit h">' + carnet.starred.digit + '</span>'));
  assert.ok(htmlA4.includes('GRILLE ' + carnet.starred.gridLabel));
});

test('HTML — version à offrir : couverture et carte cadeau', () => {
  const giftCarnet = buildCarnet({
    theme: theme,
    type: 'starter',
    slug: 'test-html-gift',
    gift: { recipientName: 'Camille', message: 'Bonne grille, et pas de triche.' }
  });
  const html = buildHtml(giftCarnet, {
    format: 'A4',
    buyerEmail: 'acheteur@exemple.fr'
  });

  assert.ok(html.includes('POUR CAMILLE'), 'mention cadeau sur la couverture');
  assert.ok(html.includes('Camille'), 'nom du destinataire');
  assert.ok(html.includes('Bonne grille, et pas de triche.'));
  assert.ok(html.includes('acheteur@exemple.fr'), 'e-mail acheteur en pied de page');
  assert.ok(html.includes('page-gift'));
  assert.equal(countPages(html), 8);
});

test('HTML — l\'e-mail acheteur est absent par défaut', () => {
  assert.ok(!htmlA4.includes('acheteur@exemple.fr'));
  assert.ok(
    !htmlA4.includes('<span class="mono buyer-email">'),
    'pas de pied de page acheteur en mode vitrine'
  );
});

test('HTML — corrections désactivables', () => {
  const html = buildHtml(carnet, { format: 'A4', includeCorrections: false });
  assert.equal(countPages(htmlA4) - countPages(html), 6);
  assert.ok(!html.includes('CORRECTIONS'));
});

test('HTML — livret A5 : pages complétées à un multiple de 4 et imposées', () => {
  assert.equal(countPages(htmlLivret) % 4, 0);
  assert.equal(countPages(htmlLivret), 44);
  const sheets = (htmlLivret.match(/<div class="sheet">/g) || []).length;
  const slots = (htmlLivret.match(/<div class="slot">/g) || []).length;
  assert.equal(sheets, 22);
  assert.equal(slots, 44);
  assert.match(htmlLivret, /@page\{size:A4 landscape;margin:0\}/);

  // Première face : dernière page (notes) à gauche, couverture à droite.
  const firstSheet = htmlLivret.split('<div class="sheet">')[1];
  assert.ok(firstSheet.indexOf('data-page="44"') < firstSheet.indexOf('page-cover'));
});

test('HTML — formats inconnus refusés', () => {
  assert.throws(() => buildHtml(carnet, { format: 'A3' }), /Format inconnu/);
});

test('HTML — couverture et grilles v2 (calquées sur case-depart-template-*.html)', () => {
  for (const slug of ['noel', 'halloween']) {
    const vTheme = getTheme(catalog, slug);
    assert.ok(vTheme.coverColors, `${slug} doit avoir coverColors`);

    const vCarnet = buildCarnet({ theme: vTheme, type: 'thematique', slug: 'test-v2-' + slug, buyerEmail: null });
    const html = buildHtml(vCarnet, { format: 'A4' });

    // Couverture : classes et couleurs du template, illustration en data URI JPEG.
    assert.ok(html.includes('<section class="page couverture"'), 'couverture v2 attendue');
    assert.ok(html.includes(vTheme.coverColors.titre), 'couleur du titre du thème');
    assert.ok(html.includes('data:image/jpeg;base64,'), 'illustration embarquée');
    assert.ok(html.includes('<h1 class="titre">' + vTheme.nom.toUpperCase() + '</h1>'));

    // Grille : classes du template, pas de SVG, 81 cases, numérotation séquentielle propre au thème.
    assert.ok(html.includes('<section class="page page-grille"'), 'page de grille v2 attendue');
    assert.ok(!/<svg class="sudoku-grid" viewBox/.test(html.split('page-grille')[1] || ''), 'pas de rendu SVG sur les pages de grille v2');
    assert.ok(html.includes('GRILLE 1</span>'), 'première grille numérotée 1');
    assert.ok(html.includes(vTheme.coverColors.encreGrille), 'couleur d\'encre du thème sur les pages de grille');

    const firstGridPage = html.split('<section class="page page-grille"')[1];
    const spanCount = (firstGridPage.match(/<span/g) || []).length;
    assert.ok(spanCount >= 81, `81 cases attendues sur la première grille, trouvé ${spanCount}`);
  }
});
