import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

const ORIGIN = 'https://alfaword.games';

describe('session API', () => {
  it('creates an isolated Classic session and validates submissions', async () => {
    const createResponse = await SELF.fetch('https://worker.test/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN
      },
      body: JSON.stringify({ name: 'vitest-classic', mode: 'classic', category: 'countries' })
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);

    const submitResponse = await SELF.fetch(
      'https://worker.test/api/v1/sessions/vitest-classic/submissions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: ORIGIN
        },
        body: JSON.stringify({ entry: 'Albania' })
      }
    );

    expect(submitResponse.status).toBe(200);
    const payload = await submitResponse.json();
    expect(payload.game.submitted).toEqual(['albania']);
    expect(payload.game.required).toBe('l');
    expect(payload.game.category).toBe('countries');

    let bonusPayload;
    for (const entry of ['Latvia', 'Tonga', 'Oman', 'Mexico']) {
      const response = await SELF.fetch(
        'https://worker.test/api/v1/sessions/vitest-classic/submissions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
          body: JSON.stringify({ entry })
        }
      );
      expect(response.status).toBe(200);
      bonusPayload = await response.json();
    }
    expect(bonusPayload.game.unavailableLetters).toEqual(['w', 'x']);
    expect(bonusPayload.game.unavailableBonusLetters.at(-1)).toEqual(['x']);
    expect(bonusPayload.game.unavailableBonuses.at(-1)).toBe(500);
    expect(bonusPayload.game.submissionScores.at(-1)).toBe(1400);

    const resetResponse = await SELF.fetch(
      'https://worker.test/api/v1/sessions/vitest-classic/reset',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: ORIGIN
        },
        body: '{}'
      }
    );
    expect(resetResponse.status).toBe(200);
    expect((await resetResponse.json()).game.submitted).toEqual([]);
  });

  it('accepts the legacy country payload and defaults its category', async () => {
    await SELF.fetch('https://worker.test/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ name: 'vitest-legacy-category', mode: 'easy' })
    });
    const response = await SELF.fetch(
      'https://worker.test/api/v1/sessions/vitest-legacy-category/submissions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({ country: 'Canada' })
      }
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.game.category).toBe('countries');
    expect(payload.game.submitted).toEqual(['canada']);
  });

  it('rejects unknown categories when a session is created', async () => {
    const response = await SELF.fetch('https://worker.test/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ name: 'vitest-invalid-category', mode: 'classic', category: 'unknown' })
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_CATEGORY');
  });

  it('rejects disallowed origins', async () => {
    const response = await SELF.fetch('https://worker.test/health', {
      headers: { Origin: 'https://attacker.example' }
    });
    expect(response.status).toBe(403);
  });

  it('keeps the legacy stateless next-letter endpoint compatible', async () => {
    const response = await SELF.fetch('https://worker.test/api/next', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN
      },
      body: JSON.stringify({ words: ['Albania', 'Latvia'] })
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ next: 'T' });
  });
});
