// Runtime environment configuration.
//
// authUrl/apiUrl resolve from /config.json (pure data, fetched at boot —
// see docker-entrypoint.sh, which regenerates that file from AUTH_URL /
// API_URL when the container starts in stage/production) and fall back to
// VITE_* env vars for local development (see .env.example).
//
// loadConfig() should be called once eagerly in main.jsx so the fetch runs
// in parallel with app boot, and the resulting promise is cached — every
// caller awaits the same in-flight request.

export interface RuntimeConfig {
  authUrl: string;
  // b-mori has no backend API of its own yet (only the shared Bonafide auth
  // service) — optional like identityUrl until one exists. Callers that need
  // it should check for it explicitly rather than assuming it's set.
  apiUrl?: string;
  // Catalog service (paises/regiones/ciudades). Unlike authUrl this is
  // optional — callers fall back to local static geo data when it's unset or
  // unreachable, same demo-fallback pattern as the rest of the app.
  identityUrl?: string;
}

interface ConfigJson {
  AUTH_URL?: string;
  API_URL?: string;
  IDENTITY_API_URL?: string;
}

let configPromise: Promise<RuntimeConfig> | null = null;

async function fetchConfigJson(): Promise<ConfigJson> {
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (!res.ok) return {};
    return (await res.json()) as ConfigJson;
  } catch {
    return {};
  }
}

export function loadConfig(): Promise<RuntimeConfig> {
  if (!configPromise) {
    configPromise = fetchConfigJson().then((runtime) => {
      const authUrl = runtime.AUTH_URL || import.meta.env.VITE_AUTH_URL;
      const apiUrl = runtime.API_URL || import.meta.env.VITE_API_URL;
      const identityUrl = runtime.IDENTITY_API_URL || import.meta.env.VITE_IDENTITY_API_URL;

      if (!authUrl) {
        throw new Error(
          'Missing config: set AUTH_URL (runtime, via /config.json) or VITE_AUTH_URL (local dev, .env).'
        );
      }

      // Strip trailing slashes so callers can safely concatenate with
      // path strings that start with "/" without producing double slashes.
      return {
        authUrl: authUrl.replace(/\/+$/, ''),
        apiUrl: apiUrl ? apiUrl.replace(/\/+$/, '') : undefined,
        identityUrl: identityUrl ? identityUrl.replace(/\/+$/, '') : undefined,
      };
    });
  }
  return configPromise;
}
