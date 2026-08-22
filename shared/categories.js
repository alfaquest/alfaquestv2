import {
  COUNTRY_DISPLAY,
  COUNTRY_NAMES,
  COUNTRY_SET,
  displayCountry,
  normalizeCountry
} from './countries.js';

const ALPHABET = Object.freeze('abcdefghijklmnopqrstuvwxyz'.split(''));
const COUNTRY_MODES = Object.freeze([
  'classic',
  'fill',
  'easy',
  'sequence',
  'strict',
  'allletters'
]);

export const DEFAULT_CATEGORY_ID = 'countries';

function createCategory(definition) {
  const availableStarts = new Set(
    definition.entries
      .map((entry) => definition.normalize(entry).charAt(0))
      .filter((letter) => ALPHABET.includes(letter))
  );
  const startingLetters = Object.freeze(
    ALPHABET.filter((letter) => availableStarts.has(letter))
  );
  const unavailableLetters = Object.freeze(
    ALPHABET.filter((letter) => !availableStarts.has(letter))
  );
  return Object.freeze({
    ...definition,
    startingLetters,
    unavailableLetters,
    ignoredStarts: unavailableLetters
  });
}

export const CATEGORIES = Object.freeze({
  countries: createCategory({
    id: 'countries',
    label: 'Countries of the World',
    shortLabel: 'Countries',
    singular: 'country',
    plural: 'countries',
    placeholder: 'Type a country name...',
    entries: COUNTRY_NAMES,
    entrySet: COUNTRY_SET,
    displayMap: COUNTRY_DISPLAY,
    normalize: normalizeCountry,
    display: displayCountry,
    collectibleLetters: ALPHABET,
    supportedModes: COUNTRY_MODES
  })
});

export function resolveCategory(category = DEFAULT_CATEGORY_ID) {
  const id = typeof category === 'string' ? category : category?.id;
  return CATEGORIES[id] ?? CATEGORIES[DEFAULT_CATEGORY_ID];
}

export function requireCategory(category) {
  const id = typeof category === 'string' ? category : category?.id;
  const resolved = CATEGORIES[id];
  if (!resolved) {
    const error = new Error(`Unknown category: ${String(id || '')}.`);
    error.code = 'INVALID_CATEGORY';
    throw error;
  }
  return resolved;
}

export function isCategoryCompatible(category, mode) {
  return resolveCategory(category).supportedModes.includes(String(mode ?? ''));
}

export function categoriesForMode(mode) {
  return Object.values(CATEGORIES).filter((category) =>
    category.supportedModes.includes(String(mode ?? ''))
  );
}
