// Runtime environment configuration.
//
// authUrl/identityUrl are fixed same-origin path prefixes, the same in
// every environment: in stage/production Traefik routes them to the right
// backend based on the Host header of the request (labels live in each
// backend repo); locally, vite.config.js's server.proxy forwards them
// unchanged to a single VITE_DEV_BACKEND_URL fronted by that same Traefik
// (see .env.example) — the frontend code never needs to know which
// environment it's in.
//
// b-mori has no backend API of its own yet, so apiUrl has no prefix
// assigned — it stays undefined until one exists; callers that need it
// should check for it explicitly.
//
// loadConfig() should be called once eagerly in main.jsx so it resolves in
// parallel with app boot, and the resulting promise is cached — every
// caller awaits the same in-flight request.

const AUTH_PATH_PREFIX = '/auth-service';
const IDENTITY_PATH_PREFIX = '/identity/api/v1';

export interface RuntimeConfig {
  authUrl: string;
  apiUrl?: string;
  identityUrl?: string;
}

let configPromise: Promise<RuntimeConfig> | null = null;

export function loadConfig(): Promise<RuntimeConfig> {
  if (!configPromise) {
    configPromise = Promise.resolve({
      authUrl: AUTH_PATH_PREFIX,
      apiUrl: undefined,
      identityUrl: IDENTITY_PATH_PREFIX,
    });
  }
  return configPromise;
}
