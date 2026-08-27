# Getlakbay landing page

Marketing site for **getlakbay.com** — hero, product tiles, feature grid, and separate CTAs to the HR Admin and Employee Onboarding portals.

## Local dev

```bash
npm install          # from repo root (adds workspace)
npm run dev:landing  # http://localhost:5175
```

## Build

```bash
npm run build:landing
npm run preview -w @hris/web-landing   # optional static preview
```

Output: `apps/web-landing/dist`

## Cloudflare Pages

Third Pages project: **`hris-landing`**

| Host | Pages project |
|------|---------------|
| `getlakbay.com` | `hris-landing` |
| `www.getlakbay.com` | `hris-landing` (optional redirect or alias) |
| `admin.getlakbay.com` | `hris-admin` (unchanged) |
| `onboarding.getlakbay.com` | `hris-onboarding` (unchanged) |

### Dashboard setup

1. **Workers & Pages → Create → Pages → Connect to Git** (or upload) — project name **`hris-landing`**.
2. Build settings (if using Git integration):
   - Root directory: `apps/web-landing`
   - Build command: `npm run build -w @hris/web-landing` (run `npm ci` from repo root first)
   - Output directory: `dist`
3. **Custom domains** on `hris-landing`:
   - `getlakbay.com` (apex)
   - `www.getlakbay.com` (optional; add a redirect rule apex → www or vice versa in **Rules**)
4. **DNS** (Cloudflare zone `getlakbay.com`):
   - Apex `@` — Pages handles this when you attach `getlakbay.com` to the project (CF auto-adds records).
   - Or manually: `@` CNAME → `hris-landing.pages.dev` (flattened at apex) — **Proxied**.
   - `www` CNAME → `hris-landing.pages.dev` — **Proxied**.

Existing subdomains stay as-is:

```
admin        CNAME  hris-admin.pages.dev
onboarding   CNAME  hris-onboarding.pages.dev
api          CNAME  <tunnel-id>.cfargotunnel.com
```

### Manual / CI deploy

```bash
npm run build:landing
npx wrangler pages deploy apps/web-landing/dist --project-name=hris-landing
```

GitHub Actions: `.github/workflows/deploy-pages.yml` deploys all three portals on `web-v*` tags or `workflow_dispatch`.

No `VITE_*` env vars are required for the landing page (static links only).

## Assets

Hero and section images use [Unsplash](https://unsplash.com) URLs (free to use with attribution-friendly license). No third-party CDN assets from other HR vendors.
