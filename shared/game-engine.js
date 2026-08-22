import {
  COUNTRY_SET,
  normalizeCountry
} from './countries.js';

export const ALPHABET = Object.freeze('abcdefghijklmnopqrstuvwxyz'.split(''));
export const IGNORED_STARTS = Object.freeze(['w', 'x']);
export const STARTING_ALPHABET = Object.freeze(
  ALPHABET.filter((letter) => !IGNORED_STARTS.includes(letter))
);

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

export function getDerivedRequiredStart(submitted = []) {
  if (submitted.length === 0) return 'a';

  const available = new Set(STARTING_ALPHABET);
  let required = 'a';

  for (let index = 0; index < submitted.length; index += 1) {
    const word = normalizeCountry(submitted[index]);
    const start = word.charAt(0);

    if (!word) throw gameError('INVALID_COUNTRY', `Invalid country at move ${index + 1}.`);
    if (start !== required) {
      throw gameError('WRONG_START', `Country must begin with ${required.toUpperCase()}.`);
    }
    if (!available.has(start)) {
      throw gameError('START_REUSED', `Starting letter ${start.toUpperCase()} has already been used.`);
    }

    available.delete(start);
    required = [...word].find((letter) => available.has(letter)) ?? null;

    if (!required && available.size > 0) {
      throw gameError('DEAD_END', 'No unused starting letter remains in that country.');
    }
  }

  return required;
}

export function getAlphabeticalRequiredStart(usedLetters = []) {
  const used = new Set(usedLetters);
  return STARTING_ALPHABET.find((letter) => !used.has(letter)) ?? null;
}

export function getSequentialCollectedLetters(word, usedLetters = []) {
  const used = new Set(usedLetters);
  const required = getAlphabeticalRequiredStart(used);
  const normalized = normalizeCountry(word);
  if (!required || normalized.charAt(0) !== required) return [];

  const lettersInWord = new Set(extractLetters(normalized));
  const collected = [];
  const startIndex = STARTING_ALPHABET.indexOf(required);

  for (let index = startIndex; index < STARTING_ALPHABET.length; index += 1) {
    const letter = STARTING_ALPHABET[index];
    if (used.has(letter)) continue;
    if (!lettersInWord.has(letter)) break;
    collected.push(letter);
    used.add(letter);
  }

  for (const letter of IGNORED_STARTS) {
    if (lettersInWord.has(letter) && !used.has(letter)) collected.push(letter);
  }

  return collected;
}

export function createGameState(mode = 'fill') {
  return {
    mode: resolveMode(mode).id,
    submitted: [],
    usedLetters: [],
    usedStarts: [...IGNORED_STARTS],
    required: resolveMode(mode).sequencing === 'none' ? null : 'a',
    complete: false
  };
}

export function submitCountry(state, value) {
  const current = sanitizeState(state);
  const mode = resolveMode(current.mode);
  const country = normalizeCountry(value);

  if (!COUNTRY_SET.has(country)) {
    throw gameError('INVALID_COUNTRY', 'Enter a country from the supported country list.');
  }
  if (current.submitted.includes(country)) {
    throw gameError('COUNTRY_REUSED', 'That country has already been submitted.');
  }

  const start = country.charAt(0);
  const required = requiredStart(current);
  if (required && start !== required) {
    throw gameError('WRONG_START', `Country must begin with ${required.toUpperCase()}.`);
  }
  if (mode.sequencing === 'derived' && current.usedStarts.includes(start)) {
    throw gameError('START_REUSED', `Starting letter ${start.toUpperCase()} has already been used.`);
  }

  let newlyCollected;
  if (mode.id === 'sequence') {
    newlyCollected = getSequentialCollectedLetters(country, current.usedLetters);
  } else {
    newlyCollected = extractLetters(country).filter(
      (letter) => !current.usedLetters.includes(letter)
    );
  }

  if (mode.requireNewLetter && newlyCollected.length === 0) {
    throw gameError('NO_NEW_LETTER', 'That country does not add a new required letter.');
  }

  const next = {
    ...current,
    submitted: [...current.submitted, country],
    usedLetters: [...new Set([...current.usedLetters, ...newlyCollected])].sort(),
    usedStarts: [...new Set([...current.usedStarts, start])].sort()
  };
  next.required = requiredStart(next);
  next.complete = isComplete(next);

  if (
    mode.sequencing === 'derived' &&
    !next.complete &&
    next.required === null
  ) {
    throw gameError('DEAD_END', 'No unused starting letter remains in that country.');
  }

  return next;
}

export function requiredStart(state) {
  const current = sanitizeState(state);
  const mode = resolveMode(current.mode);
  if (mode.sequencing === 'none') return null;
  if (mode.sequencing === 'alphabetical') {
    return getAlphabeticalRequiredStart(current.usedLetters);
  }
  return getDerivedRequiredStart(current.submitted);
}

export function isComplete(state) {
  const current = sanitizeState(state);
  const mode = resolveMode(current.mode);
  if (mode.completion === 'starting-letters') {
    return STARTING_ALPHABET.every((letter) => current.usedStarts.includes(letter));
  }
  if (mode.completion === 'sequence') {
    return ALPHABET.every((letter) => current.usedLetters.includes(letter));
  }
  return ALPHABET.every((letter) => current.usedLetters.includes(letter));
}

export function scoreWord(word, moveNumber, multiplier = 2) {
  const start = normalizeCountry(word).charAt(0);
  const firstLetterScore = (LETTER_SCORES[start] ?? 0) * multiplier;
  const positionBonus = Math.max(0, Number(moveNumber) || 0) * 100;
  return firstLetterScore + positionBonus;
}

export function replayGame(mode, submitted = []) {
  return submitted.reduce(
    (state, country) => submitCountry(state, country),
    createGameState(mode)
  );
}

function sanitizeState(state = {}) {
  return {
    mode: resolveMode(state.mode).id,
    submitted: Array.isArray(state.submitted)
      ? state.submitted.map(normalizeCountry)
      : [],
    usedLetters: Array.isArray(state.usedLetters) ? [...state.usedLetters] : [],
    usedStarts: Array.isArray(state.usedStarts)
      ? [...state.usedStarts]
      : [...IGNORED_STARTS],
    required: state.required ?? null,
    complete: Boolean(state.complete)
  };
}

function gameError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
