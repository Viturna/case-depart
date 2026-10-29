/**
 * Tests du PRNG seedé — Case Départ
 * Exécution : node --test tests/
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const prng = require('../src/prng.js');

test('PRNG — même graine = même séquence', () => {
  const first = prng.createRng('noel-2026-sprint-03');
  const second = prng.createRng('noel-2026-sprint-03');

  const firstValues = [];
  const secondValues = [];
  for (let i = 0; i < 100; i++) {
    firstValues.push(first.next());
    secondValues.push(second.next());
  }

  assert.deepEqual(firstValues, secondValues);
});

test('PRNG — graines différentes = séquences différentes', () => {
  const a = prng.createRng('carnet-a');
  const b = prng.createRng('carnet-b');

  const valuesA = [];
  const valuesB = [];
  for (let i = 0; i < 20; i++) {
    valuesA.push(a.next());
    valuesB.push(b.next());
  }

  assert.notDeepEqual(valuesA, valuesB);
});

test('PRNG — next() reste dans [0, 1[', () => {
  const rng = prng.createRng('bornes');
  for (let i = 0; i < 5000; i++) {
    const value = rng.next();
    assert.ok(value >= 0 && value < 1, `valeur hors bornes : ${value}`);
  }
});

test('PRNG — int() reste dans les bornes et est déterministe', () => {
  const a = prng.createRng('int');
  const b = prng.createRng('int');

  for (let i = 0; i < 1000; i++) {
    const valueA = a.int(3, 9);
    const valueB = b.int(3, 9);
    assert.equal(valueA, valueB);
    assert.ok(Number.isInteger(valueA));
    assert.ok(valueA >= 3 && valueA <= 9);
  }
});

test('PRNG — shuffle() est déterministe et conserve les éléments', () => {
  const a = prng.createRng('shuffle');
  const b = prng.createRng('shuffle');
  const source = Array.from({ length: 20 }, (_, i) => i);

  const shuffledA = a.shuffle(source.slice());
  const shuffledB = b.shuffle(source.slice());

  assert.deepEqual(shuffledA, shuffledB);
  assert.deepEqual(shuffledA.slice().sort((x, y) => x - y), source);
  assert.notDeepEqual(shuffledA, source, 'un mélange de 20 éléments ne devrait pas rester identique');
});

test('PRNG — xmur3 produit un entier 32 bits', () => {
  const value = prng.hashString('case-depart');
  assert.ok(Number.isInteger(value));
  assert.ok(value >= 0 && value <= 0xffffffff);
  assert.equal(prng.hashString('case-depart'), value);
});
