import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALPHABET,
  STARTING_ALPHABET,
  createGameState,
  getDerivedRequiredStart,
  getNewUnavailableLetters,
  isComplete,
  replayGame,
  scoreUnavailableLetterBonus,
  scoreWord,
  submitCountry,
  submitEntry
} from '../../shared/game-engine.js';
import {
  categoriesForMode,
  requireCategory,
  resolveCategory
} from '../../shared/categories.js';
import {
  displayCountry,
  isCountry,
  normalizeCountry
} from '../../shared/countries.js';

test('normalizes supported aliases to canonical countries', () => {
  assert.equal(normalizeCountry(' USA '), 'united states');
  assert.equal(displayCountry('usa'), 'United States');
  assert.equal(isCountry('Antigua & Barbuda'), true);
});

test('resolves curated categories and exposes mode-compatible metadata', () => {
  const category = resolveCategory('countries');
  assert.equal(category.label, 'Countries of the World');
  assert.equal(category.singular, 'country');
  assert.equal(category.startingLetters.includes('w'), false);
  assert.deepEqual(category.unavailableLetters, ['w', 'x']);
  assert.deepEqual(categoriesForMode('classic').map((item) => item.id), ['countries']);
  assert.throws(
    () => requireCategory('unknown'),
    (error) => error.code === 'INVALID_CATEGORY'
  );
});

test('stores category identity and validates generic entries', () => {
  const state = createGameState('classic', 'countries');
  assert.equal(state.category, 'countries');
  const next = submitEntry(state, 'Albania');
  assert.deepEqual(next.submitted, ['albania']);
  assert.equal(next.required, 'l');
});

test('derives the next required starting letter deterministically', () => {
  assert.equal(getDerivedRequiredStart([]), 'a');
  assert.equal(getDerivedRequiredStart(['Albania']), 'l');
  assert.equal(getDerivedRequiredStart(['Albania', 'Latvia']), 't');
  assert.equal(getDerivedRequiredStart(['Albania', 'Latvia', 'Tonga']), 'o');
});

test('replays a valid Classic sequence', () => {
  const state = replayGame('classic', ['Albania', 'Latvia', 'Tonga', 'Oman']);
  assert.deepEqual(state.submitted, ['albania', 'latvia', 'tonga', 'oman']);
  assert.equal(state.required, 'm');
  assert.equal(state.usedStarts.includes('w'), true);
  assert.equal(state.usedStarts.includes('x'), true);
});

test('rejects a country with the wrong required starting letter', () => {
  const state = submitCountry(createGameState('classic'), 'Albania');
  assert.throws(
    () => submitCountry(state, 'Canada'),
    (error) => error.code === 'WRONG_START'
  );
});

test('Easy mode accepts any unused country and collects letters', () => {
  const state = submitCountry(createGameState('easy'), 'United States of America');
  assert.equal(state.submitted[0], 'united states');
  assert.equal(state.usedLetters.includes('u'), true);
});

test('Strict mode enforces alphabetical starts while collecting all new letters', () => {
  const state = submitCountry(createGameState('strict'), 'Afghanistan');
  assert.equal(state.required, 'b');
  assert.equal(state.usedLetters.includes('f'), true);
  assert.equal(state.usedLetters.includes('t'), true);
});

test('uses the shared scoring table', () => {
  assert.equal(scoreWord('Albania', 1), 300);
  assert.equal(scoreWord('Qatar', 2), 1200);
  assert.equal(scoreWord('', -1), 0);
});

test('awards category-derived unavailable-letter bonuses only once', () => {
  assert.deepEqual(getNewUnavailableLetters('Mexico'), ['x']);
  assert.equal(scoreUnavailableLetterBonus('Mexico'), 500);
  assert.equal(scoreUnavailableLetterBonus('Mexico', ['x']), 0);
  assert.equal(scoreUnavailableLetterBonus('New Zealand'), 400);

  const state = replayGame(
    'classic',
    ['Albania', 'Latvia', 'Tonga', 'Oman', 'Mexico']
  );
  assert.deepEqual(state.lastUnavailableLetters, ['x']);
  assert.equal(state.lastUnavailableBonus, 500);
  assert.equal(state.usedLetters.includes('x'), true);
  assert.equal(state.collectedUnavailableLetters.includes('x'), true);
});

test('uses mode-specific completion rules', () => {
  assert.equal(isComplete({
    ...createGameState('classic'),
    usedStarts: [...STARTING_ALPHABET, 'w', 'x']
  }), true);

  for (const mode of ['fill', 'easy', 'strict', 'allletters']) {
    assert.equal(isComplete({
      ...createGameState(mode),
      usedLetters: [...ALPHABET]
    }), true);
  }
});

test('rejects duplicate countries', () => {
  const state = submitCountry(createGameState('easy'), 'Canada');
  assert.throws(
    () => submitCountry(state, 'Canada'),
    (error) => error.code === 'COUNTRY_REUSED'
  );
});
