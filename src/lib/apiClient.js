import axios from 'axios';
import { loadConfig } from '../config';
import { useAuthStore, ensureValidAccessToken, ensureValidAdminAccessToken, logout } from '../stores/authStore';

export class ApiError extends Error {
  constructor(message, status, reason) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.reason = reason; // 'network' | 'client' | 'server'
  }
}

// Same generous budget as authApi.js — shared backend infra, same latency
// characteristics.
const REQUEST_TIMEOUT_MS = 20000;

// Business API for whichever role is currently signed in. Client and admin
// sessions carry different tokens/refresh flows (see authStore.js) but both
// call the same `apiUrl` backend, so one axios instance dispatches to the
// right token getter per request rather than duplicating this client per role.
export const apiClient = axios.create({ timeout: REQUEST_TIMEOUT_MS });

apiClient.interceptors.request.use(async (config) => {
  const { apiUrl } = await loadConfig();
  if (apiUrl) config.baseURL = apiUrl;

  const { isAdmin, session, adminSession } = useAuthStore.getState();
  const token = isAdmin
    ? adminSession && (await ensureValidAdminAccessToken())
    : session && (await ensureValidAccessToken());
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (axios.isCancel(error)) throw error;

    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED';
      throw new ApiError(
        timedOut ? 'El servidor tardó demasiado en responder.' : 'No se pudo conectar con el servidor.',
        0,
        'network'
      );
    }

    const { status, data } = error.response;
    // A 401 here means the proactive refresh in the request interceptor
    // didn't save us — the session is no longer valid server-side. Nothing
    // left to retry, so sign out same as an expired refresh token.
    if (status === 401) void logout();

    throw new ApiError(data?.message || 'No se pudo completar la solicitud.', status, status >= 500 ? 'server' : 'client');
  }
);
