import axios from 'axios';
import { loadConfig } from '../config';

export class AuthApiError extends Error {
  constructor(message, status, reason) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.reason = reason; // 'network' | 'client' | 'server'
  }
}

// The auth service's TLS handshake alone has been observed taking several
// seconds on the shared Bonafide infra, so this needs to be generous rather
// than tight.
const REQUEST_TIMEOUT_MS = 20000;

// Kept separate from lib/apiClient.js: this hits authUrl (not apiUrl) and
// never carries a Bearer token — it *is* the pre-auth flow the other client's
// token interceptor depends on.
const authClient = axios.create({ timeout: REQUEST_TIMEOUT_MS });

authClient.interceptors.request.use(async (config) => {
  const { authUrl } = await loadConfig();
  config.baseURL = authUrl;
  return config;
});

authClient.interceptors.response.use(
  (res) => {
    // The auth service can 200 with a `{ success: false }` body, so a 2xx
    // status alone doesn't mean the request actually succeeded.
    const payload = res.data && typeof res.data === 'object' ? res.data : null;
    if (!payload || payload.success !== true) {
      throw new AuthApiError(
        payload?.message || 'No se pudo completar la solicitud.',
        res.status,
        res.status >= 500 ? 'server' : 'client'
      );
    }
    return payload.data;
  },
  (error) => {
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED';
      throw new AuthApiError(
        timedOut ? 'El servidor tardó demasiado en responder.' : 'No se pudo conectar con el servidor.',
        0,
        'network'
      );
    }

    const { status, data } = error.response;
    throw new AuthApiError(data?.message || 'No se pudo completar la solicitud.', status, status >= 500 ? 'server' : 'client');
  }
);

function postJson(path, body) {
  return authClient.post(path, body);
}

// Client (PYME / Contratante) OTP login — resolves against the shared
// Bonafide banking-client directory, same service every Bonafide portal uses.
export function requestOtp(email) {
  return postJson('/auth/request-otp', { email });
}

export function verifyOtp(email, code) {
  return postJson('/auth/verify-otp', { email, code });
}

export function refreshSession(refreshToken) {
  return postJson('/auth/refresh', { refreshToken });
}

// Admin auth is a fully separate flow from client auth — its own OTP
// endpoints (`/auth/admin/...`) and its own token, issued only for accounts
// that carry an admin role. There is no shared login path: verifying here
// either succeeds for a real admin account or fails outright.
export function requestAdminOtp(email) {
  return postJson('/auth/admin/request-otp', { email });
}

export function verifyAdminOtp(email, code) {
  return postJson('/auth/admin/verify-otp', { email, code });
}

export function refreshAdminSession(refreshToken) {
  return postJson('/auth/admin/refresh', { refreshToken });
}

export function logoutAdmin(refreshToken) {
  return postJson('/auth/admin/logout', { refreshToken });
}
