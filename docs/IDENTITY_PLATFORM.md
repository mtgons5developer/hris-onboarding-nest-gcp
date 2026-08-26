# Identity Platform / SAML / OIDC — Phase 4 spike (not implemented)

Enterprise HRIS often uses Keycloak or Azure Entra ID. This lab stands in with
**Firebase Authentication** (same Google Cloud Identity Platform surface).

## What is wired today

- Nest `FirebaseAuthGuard` verifies Firebase ID tokens (or `dev:` bypass locally).
- Roles live as custom claims (`hr_admin` | `manager` | `employee` | `system_admin`) plus a DB mirror on `users.role`.
- React portals use the JS SDK only when `VITE_FIREBASE_*` is set; otherwise seeded Bearer tokens.

## SAML / OIDC federation (document-only)

To approximate Entra/Keycloak SSO later:

1. Upgrade the Firebase project to Identity Platform.
2. Add an SAML or OIDC provider (IdP metadata / client id+secret).
3. Keep custom claims as the authorization source of truth.
4. Do **not** introduce a second user directory — map IdP `sub` → `users.firebase_uid`.

Out of scope until a real IdP tenant exists: realm isolation, SCIM, and session SLO.
