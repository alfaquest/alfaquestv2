# alfaword.games

Vanilla JavaScript country-word games deployed on Cloudflare Pages, backed by a
Cloudflare Worker and one Durable Object per optional server-side game session.

## Supported games

- Alfaquest Classic: derived-letter sequencing across 24 starting letters.
- Alfaquest Fill: Classic sequencing while collecting the full alphabet.
- Alfaquest Easy: collect the alphabet without sequencing.
- Alfaquest Strict: alphabetical sequencing with full collection.

Earlier unlinked Sequence, Allletters, Express, and Netlify prototypes have
been retired from the production repository.

## Architecture

- `index.html` and the game pages are static Cloudflare Pages assets.
- `allletters-game.js` is the shared vanilla browser controller.
- `shared/` contains canonical countries and pure game rules used by both the
  browser and Worker.
- `worker.js` exposes `/api/v1/sessions` and compatibility endpoints.
- `Session` Durable Objects persist isolated game state and expire after 30 days.

## Local development

Requires Node.js 22 and Wrangler 4.

```sh
npm ci
npm run build
npm run dev
```

Serve `dist/` on port 8000 in a second terminal:

```sh
npm run serve
```

The static pages use `http://127.0.0.1:8787` for the local Worker.

## Verification

```sh
npm run test:unit
npm run test:worker
npm run test:games
npm run check
```

`npm run check` runs unit and Worker tests, builds the Pages output, checks
generated Worker binding types, and performs a Wrangler deployment dry run.

## Deployment

Production deployment is handled by
`.github/workflows/deploy-cloudflare.yml` after all checks pass.

Manual commands:

```sh
npm run cf:publish-worker:staging
npm run cf:dry-run
npm run cf:publish-worker
npm run build
npm run cf:pages-publish
```

Required GitHub secrets:

- `CF_API_TOKEN`
- `CF_ACCOUNT_ID`

Use `wrangler tail alfaquest-worker` for production logs. Use
`wrangler versions list` and `wrangler rollback` to inspect or restore a Worker
version.
