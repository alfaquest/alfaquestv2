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
      body: JSON.stringify({ name: 'vitest-classic', mode: 'classic' })
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
        body: JSON.stringify({ country: 'Albania' })
      }
    );

    expect(submitResponse.status).toBe(200);
    const payload = await submitResponse.json();
    expect(payload.game.submitted).toEqual(['albania']);
    expect(payload.game.required).toBe('l');

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
