/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_DEV_BYPASS: string;
  readonly VITE_OIDC_CLIENT_ID: string;
  readonly VITE_OIDC_AUTHORIZE_URL: string;
  readonly VITE_OIDC_TOKEN_URL: string;
  readonly VITE_OIDC_LOGOUT_URL: string;
  readonly VITE_OIDC_ISSUER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
