Overview

This repository contains a Node/Express server. Cloudflare Workers cannot run Express directly, so this project includes a stateless Cloudflare Worker example (`worker.js`) that implements the core game API in a Worker-friendly way.

Strategy

- The Worker endpoint `/api/next` accepts a POST with JSON body: `{ "words": ["argentina","belgium", ...] }` representing the sequence of submitted words so far.
- The Worker is stateless; the client must send the sequence for each request. This avoids needing Durable Objects for per-session state.
- The Worker returns `{ "next": "B", "used": ["a","b",...] }` or an error with appropriate HTTP status.

Local testing and deployment (use Wrangler)

Miniflare v3 no longer exposes a standalone CLI. Use `wrangler dev` which embeds Miniflare functionality.

1. Install Wrangler (local dev):

```bash
npm install -D @cloudflare/wrangler
```

2. Run the Worker locally from the project root using the dedicated Worker config:

```bash
npm exec --yes wrangler -- dev --config wrangler.worker.toml
```

3. Test with curl (default dev host/port):

```bash
curl -X POST http://127.0.0.1:8787/api/next -H "Content-Type: application/json" -d '{"words":["afghanistan"]}'
```

Alternative: run a single worker file directly:

```bash
npm exec --yes wrangler -- dev worker.js
```

Deploy to Cloudflare

1. Install Wrangler globally (optional):

```bash
npm install -g @cloudflare/wrangler
```

2. Authenticate and configure your account (one-time):

```bash
npm exec --yes wrangler -- login
```

3. Publish the worker:

```bash
npm exec --yes wrangler -- deploy --config wrangler.worker.toml
```

4. Publish the Pages site to production:

```bash
npm exec --yes wrangler -- pages deploy . --project-name=alfaquest-pages --branch "npx.cmd wrangler pages project create alfaquest-pages --production-branch main"
```

This project's Pages production branch is currently misconfigured in Cloudflare, so production deploys must target that exact branch string until the dashboard setting is corrected to `main`.

Notes & next steps

- If you need session persistence (server-side per-user state across requests), use Cloudflare Durable Objects or a KV store. Durable Objects allow per-session state but require a different design.
- If you want exact backwards compatibility with the original `/api/word1`, `/api/word2`, ... endpoints (server-managed state across multiple requests), I can implement a Durable Object example or add stateless compatibility endpoints that accept the full word sequence from the client.