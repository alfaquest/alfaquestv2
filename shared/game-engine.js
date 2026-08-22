import {
  DEFAULT_CATEGORY_ID,
  isCategoryCompatible,
  requireCategory,
  resolveCategory
} from './categories.js';

export const ALPHABET = Object.freeze('abcdefghijklmnopqrstuvwxyz'.split(''));
export const IGNORED_STARTS = resolveCategory(DEFAULT_CATEGORY_ID).ignoredStarts;
export const STARTING_ALPHABET = resolveCategory(DEFAULT_CATEGORY_ID).startingLetters;

export const GAME_MODES = Object.freeze({
  classic: Object.freeze({
    id: 'classic',
    sequencing: 'derived',
    completion: 'starting-letters',
    requireNewLetter: false
  }),
  fill: Object.freeze({
    id: 'fill',
    sequencing: 'derived',
    completion: 'all-letters',
    requireNewLetter: false
  }),
  easy: Object.freeze({
    id: 'easy',
    sequencing: 'none',
    completion: 'all-letters',
    requireNewLetter: true
  }),
  sequence: Object.freeze({
    id: 'sequence',
    sequencing: 'alphabetical',
    completion: 'sequence',
    requireNewLetter: false
  }),
  strict: Object.freeze({
    id: 'strict',
    sequencing: 'alphabetical',
    completion: 'all-letters',
    requireNewLetter: true
  }),
  allletters: Object.freeze({
    id: 'allletters',
    sequencing: 'none',
    completion: 'all-letters',
    requireNewLetter: false
  })
});

export const LETTER_SCORES = Object.freeze({
  a: 100, b: 300, c: 300, d: 200, e: 100, f: 500, g: 300,
  h: 300, i: 100, j: 500, k: 400, l: 200, m: 200, n: 100,
  o: 100, p: 300, q: 500, r: 100, s: 200, t: 200, u: 200,
  v: 400, w: 400, x: 500, y: 400, z: 400
});

export function resolveMode(mode) {
  const id = typeof mode === 'string' ? mode : mode?.id;
  return GAME_MODES[id] ?? GAME_MODES.fill;
}

export function extractLetters(value) {
  const letters = new Set();
  for (const character of String(value ?? '').toLowerCase()) {
    if (character >= 'a' && character <= 'z') letters.add(character);
  }
  return [...letters];
}

export function getNewUnavailableLetters(
  value,
  usedLetters = [],
  category = DEFAULT_CATEGORY_ID
) {
  const activeCategory = resolveCategory(category);
  const used = new Set(usedLetters);
  const unavailable = new Set(activeCategory.unavailableLetters);
  return extractLetters(activeCategory.normalize(value)).filter(
    (letter) => unavailable.has(letter) && !used.has(letter)
  );
}

export function scoreUnavailableLetterBonus(
  value,
  usedLetters = [],
  category = DEFAULT_CATEGORY_ID
) {
  return getNewUnavailableLetters(value, usedLetters, category).reduce(
    (total, letter) => total + (LETTER_SCORES[letter] ?? 0),
    0
  );
}

export function getDerivedRequiredStart(submitted = [], category = DEFAULT_CATEGORY_ID) {
  const activeCategory = resolveCategory(category);
  if (submitted.length === 0) return activeCategory.startingLetters[0] ?? null;

  const available = new Set(activeCategory.startingLetters);
  let required = activeCategory.startingLetters[0] ?? null;

  for (let index = 0; index < submitted.length; index += 1) {
    const word = activeCategory.normalize(submitted[index]);
    const start = word.charAt(0);

    if (!word) throw gameError('INVALID_ENTRY', `Invalid ${activeCategory.singular} at move ${index + 1}.`);
    if (start !== required) {
      throw gameError('WRONG_START', `${capitalize(activeCategory.singular)} must begin with ${required.toUpperCase()}.`);
    }
    if (!available.has(start)) {
      throw gameError('START_REUSED', `Starting letter ${start.toUpperCase()} has already been used.`);
    }

    available.delete(start);
    required = [...word].find((letter) => available.has(letter)) ?? null;

    if (!required && available.size > 0) {
      throw gameError('DEAD_END', `No unused starting letter remains in that ${activeCategory.singular}.`);
    }
  }

  return required;
}

export function getAlphabeticalRequiredStart(usedLetters = [], category = DEFAULT_CATEGORY_ID) {
  const activeCategory = resolveCategory(category);
  const used = new Set(usedLetters);
  return activeCategory.startingLetters.find((letter) => !used.has(letter)) ?? null;
}

export function getSequentialCollectedLetters(word, usedLetters = [], category = DEFAULT_CATEGORY_ID) {
  const activeCategory = resolveCategory(category);
  const used = new Set(usedLetters);
  const required = getAlphabeticalRequiredStart(used, activeCategory);
  const normalized = activeCategory.normalize(word);
  if (!required || normalized.charAt(0) !== required) return [];

  const lettersInWord = new Set(extractLetters(normalized));
  const collected = [];
  const startIndex = activeCategory.startingLetters.indexOf(required);

  for (let index = startIndex; index < activeCategory.startingLetters.length; index += 1) {
    const letter = activeCategory.startingLetters[index];
    if (used.has(letter)) continue;
    if (!lettersInWord.has(letter)) break;
    collected.push(letter);
    used.add(letter);
  }

  for (const letter of activeCategory.ignoredStarts) {
    if (lettersInWord.has(letter) && !used.has(letter)) collected.push(letter);
  }

  return collected;
}

export function createGameState(mode = 'fill', category = DEFAULT_CATEGORY_ID) {
  const activeMode = resolveMode(mode);
  const activeCategory = requireCategory(category);
  if (!isCategoryCompatible(activeCategory, activeMode.id)) {
    throw gameError(
      'CATEGORY_MODE_UNSUPPORTED',
      `${activeCategory.label} does not support ${activeMode.id} mode.`
    );
  }
  return {
    mode: activeMode.id,
    category: activeCategory.id,
    submitted: [],
    usedLetters: [],
    usedStarts: [...activeCategory.ignoredStarts],
    unavailableLetters: [...activeCategory.unavailableLetters],
    collectedUnavailableLetters: [],
    lastUnavailableLetters: [],
    lastUnavailableBonus: 0,
    required: activeMode.sequencing === 'none'
      ? null
      : (activeCategory.startingLetters[0] ?? null),
    complete: false
  };
}

export function submitEntry(state, value) {
  const current = sanitizeState(state);
  const mode = resolveMode(current.mode);
  const category = requireCategory(current.category);
  const entry = category.normalize(value);

  if (!category.entrySet.has(entry)) {
    const code = category.id === 'countries' ? 'INVALID_COUNTRY' : 'INVALID_ENTRY';
    throw gameError(code, `Enter ${articleFor(category.singular)} ${category.singular} from the supported ${category.shortLabel.toLowerCase()} list.`);
  }
  if (current.submitted.includes(entry)) {
    const code = category.id === 'countries' ? 'COUNTRY_REUSED' : 'ENTRY_REUSED';
    throw gameError(code, `That ${category.singular} has already been submitted.`);
  }

  const start = entry.charAt(0);
  const required = requiredStart(current);
  if (required && start !== required) {
    throw gameError('WRONG_START', `${capitalize(category.singular)} must begin with ${required.toUpperCase()}.`);
  }
  if (mode.sequencing === 'derived' && current.usedStarts.includes(start)) {
    throw gameError('START_REUSED', `Starting letter ${start.toUpperCase()} has already been used.`);
  }

  let newlyCollected;
  if (mode.id === 'sequence') {
    newlyCollected = getSequentialCollectedLetters(entry, current.usedLetters, category);
  } else {
    newlyCollected = extractLetters(entry).filter(
      (letter) => !current.usedLetters.includes(letter)
    );
  }

  if (mode.requireNewLetter && newlyCollected.length === 0) {
    throw gameError('NO_NEW_LETTER', 'That country does not add a new required letter.');
  }

  const newUnavailableLetters = newlyCollected.filter(
    (letter) => category.unavailableLetters.includes(letter)
  );
  const unavailableBonus = newUnavailableLetters.reduce(
    (total, letter) => total + (LETTER_SCORES[letter] ?? 0),
    0
  );
  const next = {
    ...current,
    submitted: [...current.submitted, entry],
    usedLetters: [...new Set([...current.usedLetters, ...newlyCollected])].sort(),
    usedStarts: [...new Set([...current.usedStarts, start])].sort(),
    collectedUnavailableLetters: [
      ...new Set([...current.collectedUnavailableLetters, ...newUnavailableLetters])
    ].sort(),
    lastUnavailableLetters: newUnavailableLetters,
    lastUnavailableBonus: unavailableBonus
  };
  next.required = requiredStart(next);
  next.complete = isComplete(next);

  if (
    mode.sequencing === 'derived' &&
    !next.complete &&
    next.required === null
  ) {
    throw gameError('DEAD_END', `No unused starting letter remains in that ${category.singular}.`);
  }

  return next;
}

export function submitCountry(state, value) {
  return submitEntry({ ...state, category: state?.category ?? DEFAULT_CATEGORY_ID }, value);
}

export function requiredStart(state) {
  const current = sanitizeState(state);
  const mode = resolveMode(current.mode);
  const category = resolveCategory(current.category);
  if (mode.sequencing === 'none') return null;
  if (mode.sequencing === 'alphabetical') {
    return getAlphabeticalRequiredStart(current.usedLetters, category);
  }
  return getDerivedRequiredStart(current.submitted, category);
}

export function isComplete(state) {
  const current = sanitizeState(state);
  const mode = resolveMode(current.mode);
  const category = resolveCategory(current.category);
  if (mode.completion === 'starting-letters') {
    return category.startingLetters.every((letter) => current.usedStarts.includes(letter));
  }
  return category.collectibleLetters.every((letter) => current.usedLetters.includes(letter));
}

export function scoreWord(word, moveNumber, multiplier = 2, category = DEFAULT_CATEGORY_ID) {
  const start = resolveCategory(category).normalize(word).charAt(0);
  const firstLetterScore = (LETTER_SCORES[start] ?? 0) * multiplier;
  const positionBonus = Math.max(0, Number(moveNumber) || 0) * 100;
  return firstLetterScore + positionBonus;
}

export function replayGame(mode, submitted = [], category = DEFAULT_CATEGORY_ID) {
  return submitted.reduce(
    (state, entry) => submitEntry(state, entry),
    createGameState(mode, category)
  );
}

function sanitizeState(state = {}) {
  const category = resolveCategory(state.category);
  return {
    mode: resolveMode(state.mode).id,
    category: category.id,
    submitted: Array.isArray(state.submitted)
      ? state.submitted.map(category.normalize)
      : [],
    usedLetters: Array.isArray(state.usedLetters) ? [...state.usedLetters] : [],
    usedStarts: Array.isArray(state.usedStarts)
      ? [...state.usedStarts]
      : [...category.ignoredStarts],
    unavailableLetters: [...category.unavailableLetters],
    collectedUnavailableLetters: Array.isArray(state.collectedUnavailableLetters)
      ? [...state.collectedUnavailableLetters]
      : [],
    lastUnavailableLetters: Array.isArray(state.lastUnavailableLetters)
      ? [...state.lastUnavailableLetters]
      : [],
    lastUnavailableBonus: Math.max(0, Number(state.lastUnavailableBonus) || 0),
    required: state.required ?? null,
    complete: Boolean(state.complete)
  };
}

function capitalize(value) {
  const text = String(value ?? '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function articleFor(value) {
  return /^[aeiou]/i.test(String(value ?? '')) ? 'an' : 'a';
}

function gameError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
