import { loadConfig } from '../config';

export class AuthApiError extends Error {
  constructor(message, status, reason) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.reason = reason; // 'network' | 'client' | 'server'
  }
}

const REQUEST_TIMEOUT_MS = 20000;

async function postJson(path, body) {
  const { authUrl } = await loadConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${authUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err.name === 'AbortError';
    throw new AuthApiError(
      timedOut ? 'El servidor tardó demasiado en responder.' : 'No se pudo conectar con el servidor.',
      0,
      'network'
    );
  } finally {
    clearTimeout(timer);
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload || payload.success !== true) {
    throw new AuthApiError(
      payload?.message || 'No se pudo completar la solicitud.',
      res.status,
      res.status >= 500 ? 'server' : 'client'
    );
  }
  return payload.data;
}

export function requestOtp(email) {
  return postJson('/auth/request-otp', { email });
}

export function verifyOtp(email, code) {
  return postJson('/auth/verify-otp', { email, code });
}

export function refreshSession(refreshToken) {
  return postJson('/auth/refresh', { refreshToken });
}

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
