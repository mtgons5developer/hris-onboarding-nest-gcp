# Cloudflare Pages — HRIS portals

Deployed by `.github/workflows/deploy-pages.yml`. Wrangler project names must match Pages projects in the dashboard (`hris-admin`, `hris-onboarding`, `hris-landing`).

```bash
# after npm run build -w @hris/web-admin
npx wrangler pages deploy apps/web-admin/dist --project-name=hris-admin
npx wrangler pages deploy apps/web-onboarding/dist --project-name=hris-onboarding
npx wrangler pages deploy apps/web-landing/dist --project-name=hris-landing
```

Custom domains are attached in the Cloudflare dashboard, not in git:

- `getlakbay.com` (and optional `www.getlakbay.com`) → project `hris-landing`
- `admin.getlakbay.com` → project `hris-admin`
- `onboarding.getlakbay.com` → project `hris-onboarding`

Vite bakes `VITE_*` at **build** time. Set `VITE_API_BASE_URL=https://api.getlakbay.com` **and** the Cognito Hosted UI vars (`VITE_OIDC_CLIENT_ID`, `VITE_OIDC_AUTHORIZE_URL`, `VITE_OIDC_TOKEN_URL`, `VITE_OIDC_LOGOUT_URL`) on **both** Pages projects (Production) **and** in GitHub Actions (`deploy-pages.yml` already bakes them). Then **Redeploy / re-run the workflow** — a Pages “retry deploy” of an old `dist` does not pick up new env. The name is `VITE_API_BASE_URL`, not `VITE_API_URL`.

Account ID and a least-privilege API token: see `docs/PRODUCTION_CLOUDFLARE.md`.

## Cloudflare Tunnel (lab API origin)

Nest does **not** run on Pages. For the lab, expose the Nest process already running on this machine (`http://localhost:3000`, Compose Postgres on `:5432`) as `https://api.getlakbay.com` via **Cloudflare Tunnel**. Fly / a VPS can replace this later.

Do not put a tunnel token, credentials JSON, or the Cloudflare Agent Token in git.

### 1. Install `cloudflared` and log in

macOS: `brew install cloudflared`. Then:

```bash
cloudflared tunnel login
```

That opens the dashboard; pick the `getlakbay.com` zone.

### 2. Create the tunnel

```bash
cloudflared tunnel create hris-api
```

Note the **tunnel ID** (UUID). Credentials are written under `~/.cloudflared/<TUNNEL_ID>.json` — leave them there.

### 3. Local config

```bash
cp infra/cloudflare/tunnel.yml.example infra/cloudflare/tunnel.yml
```

Replace `TUNNEL_ID` and `YOU` in `tunnel.yml`. Ingress already points `api.getlakbay.com` at `http://localhost:3000`. `tunnel.yml` is gitignored.

### 4. DNS CNAME (dashboard)

Cloudflare dashboard → **getlakbay.com** → **DNS** → **Add record**:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `api` | `<TUNNEL_ID>.cfargotunnel.com` | **Proxied** (orange cloud) |

Or: `cloudflared tunnel route dns hris-api api.getlakbay.com`

### 5. Run the tunnel (Nest must already be up)

```bash
npm run db:up          # Compose Postgres
npm run dev:api        # http://localhost:3000/health
cloudflared tunnel --config infra/cloudflare/tunnel.yml run
```

Keep that process running while you demo.

**Auth:** local `AUTH_DEV_BYPASS=true` still unlocks Harper on **localhost Vite**. Nest ignores `dev:` tokens when `Host` is `api.getlakbay.com`. Public Pages: **Sign in with Cognito**. Restart Nest after pulling the guard.

### Optional: `cloudflared` in Compose (token, no file in git)

If you created a **remotely managed** tunnel (dashboard **Zero Trust** → **Networks** → **Tunnels** → token):

```bash
export CLOUDFLARE_TUNNEL_TOKEN=...   # never commit
docker compose -f docker-compose.yml -f docker-compose.tunnel.yml up -d
```

Set the tunnel’s public hostname service to `http://host.docker.internal:3000` (Nest is on the host, not in the container). Prefer the CLI on this machine if you already run `npm run dev:api` locally.

### Verify

```bash
curl -sS https://api.getlakbay.com/health
curl -sS -o /dev/null -w '%{http_code}\n' https://api.getlakbay.com/api/docs
```

Then open https://admin.getlakbay.com and **Sign in with Cognito** (`hr@lab.local` / `LabPass123!`). Needs a Pages rebuild with `VITE_OIDC_*` and Nest JWKS env on the tunnel machine.
