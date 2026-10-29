/**
 * Tests de l'imposition du livret A5 — Case Départ
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const imposition = require('../src/html/imposition.js');

test('imposition — 8 pages', () => {
  assert.deepEqual(imposition.impositionOrder(8), [
    [8, 1],
    [2, 7],
    [6, 3],
    [4, 5]
  ]);
});

test('imposition — 12 pages', () => {
  assert.deepEqual(imposition.impositionOrder(12), [
    [12, 1],
    [2, 11],
    [10, 3],
    [4, 9],
    [8, 5],
    [6, 7]
  ]);
});

test('imposition — 48 pages, toutes les pages une seule fois', () => {
  const order = imposition.impositionOrder(48);
  assert.equal(order.length, 24);

  const flat = order.flat();
  assert.equal(flat.length, 48);
  assert.equal(new Set(flat).size, 48);
  assert.deepEqual(
    flat.slice().sort((a, b) => a - b),
    Array.from({ length: 48 }, (_, i) => i + 1)
  );
  assert.deepEqual(order[0], [48, 1]);
  assert.deepEqual(order[1], [2, 47]);
  assert.deepEqual(order[2], [46, 3]);
});

test('imposition — feuilles recto/verso', () => {
  const sheets = imposition.bookletSheets(8);
  assert.deepEqual(sheets, [
    { front: [8, 1], back: [2, 7] },
    { front: [6, 3], back: [4, 5] }
  ]);
});

test('imposition — complète le nombre de pages à un multiple de 4', () => {
  assert.equal(imposition.padToMultipleOf4(8), 8);
  assert.equal(imposition.padToMultipleOf4(9), 12);
  assert.equal(imposition.padToMultipleOf4(41), 44);
  assert.equal(imposition.padToMultipleOf4(43), 44);
  assert.equal(imposition.padToMultipleOf4(48), 48);
});

test('imposition — refuse un nombre de pages invalide', () => {
  assert.throws(() => imposition.impositionOrder(10));
  assert.throws(() => imposition.impositionOrder(0));
  assert.throws(() => imposition.padToMultipleOf4(-2));
});
