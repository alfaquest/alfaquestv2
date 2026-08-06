# Deploying Alfaquest to Cloudflare (Pages + Worker)

This document explains how to publish the static UI to Cloudflare Pages and the API (`worker.js`) as a Cloudflare Worker with a Durable Object binding.

Prerequisites
- Node.js + npm installed
- GitHub repo (push this repository to GitHub)
- A Cloudflare account
- A Cloudflare API Token with `Account:Workers Scripts` and (for Pages) `Pages:Read/Write` permissions

1) Install Wrangler (local)

```bash
npm install -D @cloudflare/wrangler
# or globally: npm install -g @cloudflare/wrangler
```

2) Configure Wrangler files
- `wrangler.pages.toml` is used for the static Pages deploy.
- `wrangler.worker.toml` is used for the Worker deploy.
- Optionally change the Worker `name` in `wrangler.worker.toml` if you want a different Workers.dev hostname.

3) Publish the Worker (Durable Object)

```bash
npm exec --yes wrangler -- login
npm exec --yes wrangler -- deploy --config wrangler.worker.toml
```

This publishes the Worker. If you want the Worker mounted on your Pages domain, set a route in the Cloudflare dashboard or call the worker URL directly.

4) Publish static site to Pages (quick)

Option A — use Cloudflare Pages dashboard
- In Cloudflare dashboard → Pages → Create a project → Connect your GitHub repo and set build/output (for this repo use no build, output: `/`).

Option B — use Wrangler Pages publish

```bash
npm exec --yes wrangler -- pages deploy . --project-name=alfaquest-pages --branch "npx.cmd wrangler pages project create alfaquest-pages --production-branch main"
```

This Pages project currently has a misconfigured production branch in Cloudflare, so production deploys must target that exact branch string until the dashboard setting is corrected to `main`.

Notes
- If you mount the Worker on the same domain under `/session/*`, client calls to `/session/...` will work unchanged.
- If you use a different host, be sure your Worker responses include CORS headers or call via relative path when hosted on the same domain.

CI (GitHub Actions)
- You can add a GitHub Action that runs `wrangler deploy --config wrangler.worker.toml` and `wrangler pages deploy --project-name=alfaquest-pages --branch "npx.cmd wrangler pages project create alfaquest-pages --production-branch main"`. Put your Cloudflare API token and account ID into repository secrets (`CF_API_TOKEN`, `CF_ACCOUNT_ID`). See the supplied workflow file.

If you want, I can:
- Add a GitHub Actions workflow (I included a template),
- Fill `wrangler.toml` with values if you provide `account_id` and worker name, or
- Mount the Worker path to `/session/*` in the dashboard for you.
