# Identity notes

Superseded by [AWS_AND_IAM.md](./AWS_AND_IAM.md) (ADR-009).

Nest verifies OIDC JWTs (`jose` JWKS). Public Pages use **Amazon Cognito Hosted UI** (authorization code + PKCE). Local IdP remains **Keycloak** plus localhost-only `AUTH_DEV_BYPASS`. Firebase Auth is no longer in the runtime path.

Frontends are **React Vite** (`apps/web-admin`, `apps/web-onboarding`). Flutter is deferred and is not required for this Hosted UI cut.
