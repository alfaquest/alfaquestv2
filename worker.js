import { DurableObject } from 'cloudflare:workers';
import {
  ALPHABET,
  createGameState,
  extractLetters,
  replayGame,
  scoreWord,
  submitCountry
} from './shared/game-engine.js';

const JSON_HEADERS = Object.freeze({ 'Content-Type': 'application/json; charset=utf-8' });
const MAX_BODY_BYTES = 8 * 1024;
const MAX_COUNTRY_LENGTH = 120;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class Session extends DurableObject {
  async initialize(mode = 'fill') {
    const existing = await this.ctx.storage.get('game');
    if (existing) return existing;

    const game = withMetadata(createGameState(mode));
    await this.persist(game);
    return game;
  }

  async submit(country) {
    const current = await this.initialize();
    const next = submitCountry(current, country);
    const submissionScores = [
      ...(current.submissionScores ?? []),
      scoreWord(country, next.submitted.length)
    ];
    const game = withMetadata({ ...next, submissionScores });
    await this.persist(game);
    return game;
  }

  async status() {
    return this.initialize();
  }

  async reset(mode) {
    const current = await this.ctx.storage.get('game');
    const game = withMetadata(createGameState(mode ?? current?.mode ?? 'fill'));
    await this.persist(game);
    return game;
  }

  async alarm() {
    await this.ctx.storage.deleteAll();
  }

  async persist(game) {
    await this.ctx.storage.put('game', game);
    await this.ctx.storage.setAlarm(Date.now() + SESSION_TTL_MS);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigin = resolveAllowedOrigin(origin, env.ALLOWED_ORIGINS);

    if (origin && !allowedOrigin) {
      return json({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin is not allowed.' } }, 403);
    }

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), allowedOrigin);
    }

    try {
      const response = await routeRequest(request, url, env);
      return withCors(response, allowedOrigin);
    } catch (error) {
      const status = statusForError(error);
      console.error(JSON.stringify({
        event: 'request_failed',
        path: url.pathname,
        code: error?.code ?? 'INTERNAL_ERROR',
        message: error?.message ?? 'Unknown error'
      }));
      return withCors(
        json({
          error: {
            code: error?.code ?? 'INTERNAL_ERROR',
            message: status === 500 ? 'Unexpected server error.' : error.message
          }
        }, status),
        allowedOrigin
      );
    }
  }
};

async function routeRequest(request, url, env) {
  if (request.method === 'GET' && url.pathname === '/health') {
    return json({ ok: true, environment: env.ENVIRONMENT ?? 'production' });
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/sessions') {
    const body = await readJson(request);
    const session = sanitizeSessionName(body.name) || crypto.randomUUID();
    const game = await sessionStub(env, session).initialize(body.mode);
    return json({ session, game }, 201);
  }

  const versioned = matchSessionPath(url.pathname, '/api/v1/sessions/');
  if (versioned) {
    const stub = sessionStub(env, versioned.session);

    if (request.method === 'GET' && versioned.action === '') {
      return json({ session: versioned.session, game: await stub.status() });
    }

    if (request.method === 'POST' && versioned.action === 'submissions') {
      const body = await readJson(request);
      const country = boundedCountry(body.country);
      return json({ session: versioned.session, game: await stub.submit(country) });
    }

    if (request.method === 'POST' && versioned.action === 'reset') {
      const body = await readJson(request, true);
      return json({
        session: versioned.session,
        game: await stub.reset(body.mode)
      });
    }
  }

  const compatibility = await routeCompatibility(request, url, env);
  if (compatibility) return compatibility;

  return json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } }, 404);
}

async function routeCompatibility(request, url, env) {
  if (request.method === 'POST' && url.pathname === '/session/create') {
    const body = await readJson(request, true);
    const session = sanitizeSessionName(body.name) || crypto.randomUUID();
    const game = await sessionStub(env, session).initialize(body.mode);
    return json({ session, ...legacyGame(game) });
  }

  const legacy = matchSessionPath(url.pathname, '/session/');
  if (legacy) {
    const stub = sessionStub(env, legacy.session);
    if (request.method === 'GET' && legacy.action === '') {
      return json(legacyGame(await stub.status()));
    }
    if (request.method === 'POST' && legacy.action === 'submit') {
      const body = await readJson(request);
      return json(legacyGame(await stub.submit(boundedCountry(body.text))));
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/next') {
    const body = await readJson(request);
    const words = boundedWords(body.words);
    const game = replayGame('classic', words);
    return json({ next: game.required?.toUpperCase() ?? null, used: game.usedStarts });
  }

  if (request.method === 'POST' && url.pathname === '/api/letters') {
    const body = await readJson(request);
    const words = boundedWords(body.words, 100);
    const used = [...new Set(words.flatMap(extractLetters))].sort();
    const remaining = ALPHABET.filter((letter) => !used.includes(letter));
    return json({ used, remaining, success: remaining.length === 0, count: used.length });
  }

  return null;
}

function sessionStub(env, session) {
  if (!env.SESSIONS) {
    const error = new Error('Session storage binding is unavailable.');
    error.code = 'SESSION_BINDING_MISSING';
    throw error;
  }
  return env.SESSIONS.getByName(session);
}

function matchSessionPath(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const parts = pathname.slice(prefix.length).split('/').filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return null;
  return {
    session: sanitizeSessionName(decodeURIComponent(parts[0])),
    action: parts[1] ?? ''
  };
}

async function readJson(request, optional = false) {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    throw apiError('BODY_TOO_LARGE', 'Request body is too large.');
  }

  const text = await request.text();
  if (!text && optional) return {};
  if (text.length > MAX_BODY_BYTES) {
    throw apiError('BODY_TOO_LARGE', 'Request body is too large.');
  }

  try {
    return JSON.parse(text || '{}');
  } catch {
    throw apiError('INVALID_JSON', 'Request body must be valid JSON.');
  }
}

function boundedCountry(value) {
  const country = String(value ?? '').trim();
  if (!country) throw apiError('COUNTRY_REQUIRED', 'Country is required.');
  if (country.length > MAX_COUNTRY_LENGTH) {
    throw apiError('COUNTRY_TOO_LONG', 'Country is too long.');
  }
  return country;
}

function boundedWords(value, maximum = 24) {
  if (!Array.isArray(value) || value.length === 0) {
    throw apiError('WORDS_REQUIRED', 'At least one country is required.');
  }
  if (value.length > maximum) {
    throw apiError('TOO_MANY_WORDS', `No more than ${maximum} countries are allowed.`);
  }
  return value.map(boundedCountry);
}

function sanitizeSessionName(value) {
  if (value === undefined || value === null || value === '') return '';
  const session = String(value).trim();
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(session)) {
    throw apiError(
      'INVALID_SESSION',
      'Session must contain only letters, numbers, underscores, or hyphens.'
    );
  }
  return session;
}

function resolveAllowedOrigin(origin, configuredOrigins = '') {
  if (!origin) return null;
  const allowed = String(configuredOrigins)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin) ? origin : null;
}

function withCors(response, origin) {
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.append('Vary', 'Origin');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

function withMetadata(game) {
  return {
    ...game,
    submissionScores: game.submissionScores ?? [],
    updatedAt: new Date().toISOString()
  };
}

function legacyGame(game) {
  return {
    used: game.usedLetters,
    remaining: ALPHABET.filter((letter) => !game.usedLetters.includes(letter)),
    success: game.complete,
    count: game.usedLetters.length,
    texts: game.submitted,
    required: game.required,
    mode: game.mode
  };
}

function apiError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function statusForError(error) {
  if (error?.code === 'INVALID_COUNTRY' || error?.code === 'WRONG_START') return 422;
  if (error?.code === 'INTERNAL_ERROR' || error?.code === 'SESSION_BINDING_MISSING') return 500;
  return 400;
}
