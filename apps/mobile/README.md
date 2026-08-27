# HRIS Onboarding — Flutter (lab)

New-hire checklist on iOS/Android. **Same Nest API** as the React portals (`apps/web-onboarding`). Web stays Vite on Cloudflare Pages; this app is not deployed to Pages.

**Talk track:** React web + Flutter mobile, same Nest API, Cognito Hosted UI.

| | |
|---|---|
| API | `http://localhost:3000` (iOS sim) · `http://10.0.2.2:3000` (Android emulator) · `https://api.getlakbay.com` (tunnel) |
| Auth (demo) | `Authorization: Bearer dev:employee` when Nest `AUTH_DEV_BYPASS=true` (Luis Reyes) |
| Auth (Cognito) | Public client `hris-mobile` (`4ij7jqehds0m6s1ubss1aj7710`), auth code + PKCE, redirect `hris://auth` |
| Roles | `employee` → checklist · `hr_admin` / `manager` / `system_admin` → admin console (from `/api/v1/me`) |

Not an npm workspace. Do not add this folder to root `package.json` `workspaces`.

## Run

Needs the [Flutter SDK](https://docs.flutter.dev/get-started/install) (`brew install --cask flutter` if it is missing). API + seed from the repo root first:

```bash
# repo root
npm run db:up && npm run prisma:migrate && npm run prisma:seed
npm run dev:api          # AUTH_DEV_BYPASS=true in apps/api/.env
```

```bash
cd apps/mobile
flutter pub get

# iOS Simulator — Hosted UI lab defaults are compiled in (see Cognito section)
flutter run -d ios --dart-define=API_BASE_URL=http://localhost:3000

# Android emulator (localhost on the emulator is the emulator itself)
flutter run -d android --dart-define=API_BASE_URL=http://10.0.2.2:3000

# Lab public API (Cloudflare Tunnel)
flutter run --dart-define=API_BASE_URL=https://api.getlakbay.com
```

On the Welcome screen you can also flip **Local lab** vs **Production** without rebuilding.

Physical Android/iOS device: **required** LAN IP (not `localhost`, not `10.0.2.2`):

```bash
ipconfig getifaddr en1   # e.g. 192.168.0.4
flutter run -d <device-id> --dart-define=API_BASE_URL=http://192.168.0.4:3000
```

`--dart-define=API_BASE_URL` overrides a saved **Local lab** preference (`10.0.2.2` is emulator-only). If the wrong URL sticks, uninstall the app once. Or use **Production** + tunnel.

`flutter analyze` from this directory. Widget + header tests: `flutter test`.

## What the app calls (curl equivalent)

After **Continue as employee** the client sends the same header the React onboarding portal uses:

```bash
curl -sS -H "Authorization: Bearer dev:employee" http://localhost:3000/api/v1/me
# Android emulator host: http://10.0.2.2:3000/api/v1/me
# Tunnel:                https://api.getlakbay.com/api/v1/me
```

Then `GET /api/v1/onboarding/cases`, `PATCH /api/v1/onboarding/tasks/:id`, `POST /api/v1/documents` + `PUT` upload, `POST /api/v1/onboarding/cases/:id/submit`.

## Role routing (one app)

After login, **`GET /api/v1/me`** decides the home screen — the client never hardcodes role for authorization; Nest `JwtAuthGuard` + `RolesGuard` enforce access on every API call.

| Role from `/me` | Home screen |
|---|---|
| `employee` | Checklist (Luis onboarding) |
| `hr_admin`, `manager`, `system_admin` | Admin console (cases list → case detail) |

**Security:** Mobile routing is UX only. A 403 from the API signs the user out with an access-denied message. Dev tokens (`dev:employee`, `dev:hr_admin`, `dev:manager`) work only when **Local lab** API is selected — not on `https://api.getlakbay.com`. Use **Sign in as different account** (checklist/admin) to clear token + OIDC PKCE cache and return to Welcome while keeping your Local/Production API choice.

### Demo (same app, three personas)

1. **Luis (employee)** — Local lab → **Continue as employee (Luis)** or Cognito `luis.reyes@lab.local` → checklist, submit for HR.
2. **Harper (HR admin)** — Local lab → **Continue as HR (Harper)** or Cognito `hr@lab.local` → cases list → open Luis → **Approve & activate**.
3. **Maya (manager)** — Local lab → **Continue as Manager (Maya)** or Cognito `maya.santos@lab.local` → scoped **My reports** → **Mark done** on `MANAGER_INTRO`.

**Interview one-liner:** *The Flutter app routes by Cognito group for UX, but every action is authorized server-side — tampering with the client cannot grant HR powers.*

## Screens

Welcome → role-based home:

- **Employee:** checklist **PROFILE / HANDBOOK / ID_DOC / TAX_STUB** → upload ID → Submit for HR review.
- **Admin:** cases list → case detail (Access ready strip, Approve & activate for HR, Mark done on manager tasks).

## Cognito Hosted UI

**Sign in with Cognito** opens Hosted UI. Lab authorize/token URLs and the `hris-mobile` client id are compiled in (`lib/config.dart`); dart-defines override them. **Continue as employee** still sends `Bearer dev:employee` when Nest `AUTH_DEV_BYPASS=true`.

| | |
|---|---|
| Client | `hris-mobile` · `4ij7jqehds0m6s1ubss1aj7710` (public, no secret, auth code + PKCE) |
| Callbacks | `hris://auth` (default) · `com.mtgons5.hris.onboarding://callback` |
| Hosted domain | `https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com` |
| Lab login | `luis.reyes@lab.local` / `LabPass123!` (employee) · `hr@lab.local` (HR) · `maya.santos@lab.local` (manager) |

iOS URL types and Android intent filters match those callbacks. Do not reuse the SPA client `604evnknhtitgpltjdo90ghm7l` for mobile redirects.

### Exact iOS command

```bash
cd apps/mobile
flutter pub get
flutter run -d ios \
  --dart-define=API_BASE_URL=http://localhost:3000 \
  --dart-define=OIDC_CLIENT_ID=4ij7jqehds0m6s1ubss1aj7710 \
  --dart-define=OIDC_AUTHORIZE_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize \
  --dart-define=OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token \
  --dart-define=OIDC_REDIRECT_URI=hris://auth
```

Android emulator: same defines with `--dart-define=API_BASE_URL=http://10.0.2.2:3000`. Tunnel: `API_BASE_URL=https://api.getlakbay.com`.

Leave the app running while Safari/Chrome finishes login so `hris://auth` returns to the same process.

**Physical device OIDC:** If Sign in fails with `OIDC state mismatch` after rebuilding, uninstall the app once to clear a cached `hris://auth` deep link from a prior attempt. In AWS Cognito, ensure the **hris-mobile** client (`4ij7jqehds0m6s1ubss1aj7710`) has a **managed login style** assigned — without it Cognito may redirect with `error=login_pages_unavailable` and the Hosted UI form never appears. The authorize URL must not include `identity_provider=COGNITO` (use the default Hosted UI flow).

### Nest `.env` (so the Cognito JWT is accepted)

Copy into `apps/api/.env` (and restart `npm run dev:api`). JWKS verify is already in `JwtAuthGuard`; this only points it at the lab pool and **both** app clients:

```
AUTH_DEV_BYPASS=true
OIDC_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG
OIDC_JWKS_URI=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG/.well-known/jwks.json
OIDC_AUDIENCE=604evnknhtitgpltjdo90ghm7l,4ij7jqehds0m6s1ubss1aj7710
OIDC_CLIENT_ID=604evnknhtitgpltjdo90ghm7l
OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
```

`AUTH_DEV_BYPASS=true` keeps **Continue as employee** working. Cognito groups `hr_admin` / `manager` / `employee` / `system_admin` map to `UserRole`.

Local Keycloak stand-in (overrides the compiled Cognito defaults):

```bash
--dart-define=OIDC_AUTHORIZE_URL=http://localhost:8082/realms/hris/protocol/openid-connect/auth \
--dart-define=OIDC_TOKEN_URL=http://localhost:8082/realms/hris/protocol/openid-connect/token \
--dart-define=OIDC_CLIENT_ID=hris-mobile \
--dart-define=OIDC_REDIRECT_URI=hris://auth
```

Android emulator cannot open `localhost:8082` for Keycloak; use the LAN IP or skip OIDC and use the dev token.

Release builds should not rely on `AUTH_DEV_BYPASS`.
