import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  refreshSession as apiRefreshSession,
  refreshAdminSession as apiRefreshAdminSession,
  logoutAdmin as apiLogoutAdmin,
} from '../lib/authApi';

// Admin sessions carry their own token, issued by the separate `/auth/admin/*`
// flow — kept fully apart from the client `session` rather than reusing the
// same shape, since the two are never interchangeable (different backend
// accounts, different refresh/logout endpoints).
export const useAuthStore = create()(
  persist(
    (set) => ({
      authorized: false,
      isAdmin: false,
      session: null,
      adminSession: null,
      setAuthorized: (authorized) =>
        set(
          authorized
            ? { authorized }
            : { authorized: false, isAdmin: false, session: null, adminSession: null }
        ),
      setSession: ({ accessToken, refreshToken, expiresIn, user }) =>
        set({
          authorized: true,
          isAdmin: false,
          session: { accessToken, refreshToken, expiresAt: Date.now() + expiresIn * 1000, user },
          adminSession: null,
        }),
      setAdminSession: ({ accessToken, refreshToken, expiresIn, admin }) =>
        set({
          authorized: true,
          isAdmin: true,
          adminSession: { accessToken, refreshToken, expiresAt: Date.now() + expiresIn * 1000, admin },
          session: null,
        }),
      // Same shape as a fresh login response, but from a token refresh —
      // unlike setSession/setAdminSession, must not reset the rest of the
      // session already in progress.
      updateTokens: ({ accessToken, refreshToken, expiresIn, user }) =>
        set({
          session: { accessToken, refreshToken, expiresAt: Date.now() + expiresIn * 1000, user },
        }),
      updateAdminTokens: ({ accessToken, refreshToken, expiresIn, admin }) =>
        set({
          adminSession: { accessToken, refreshToken, expiresAt: Date.now() + expiresIn * 1000, admin },
        }),
    }),
    {
      name: 'b-mori-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Access tokens expire (3600s in practice) and nothing was refreshing them —
// every authenticated call would just start failing with a 401 an hour after
// login. Called before every authenticated request: refreshes proactively
// (via the refresh token) when at/near expiry, de-duped so concurrent callers
// share one in-flight refresh. Throws and logs the session out if the refresh
// token itself is no longer valid — there's no further fallback at that point.
const REFRESH_BUFFER_MS = 30_000;
let refreshPromise = null;

export async function ensureValidAccessToken() {
  const { session } = useAuthStore.getState();
  if (!session) throw new Error('No active session');
  if (session.expiresAt - Date.now() > REFRESH_BUFFER_MS) return session.accessToken;

  if (!refreshPromise) {
    refreshPromise = apiRefreshSession(session.refreshToken)
      .then((result) => {
        useAuthStore.getState().updateTokens(result);
        return result.accessToken;
      })
      .catch((err) => {
        // Refresh token expired/revoked — no way to recover the session.
        useAuthStore.getState().setAuthorized(false);
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Same proactive-refresh/de-dup logic as ensureValidAccessToken, but against
// the separate admin session and its own `/auth/admin/refresh` endpoint.
let adminRefreshPromise = null;

export async function ensureValidAdminAccessToken() {
  const { adminSession } = useAuthStore.getState();
  if (!adminSession) throw new Error('No active admin session');
  if (adminSession.expiresAt - Date.now() > REFRESH_BUFFER_MS) return adminSession.accessToken;

  if (!adminRefreshPromise) {
    adminRefreshPromise = apiRefreshAdminSession(adminSession.refreshToken)
      .then((result) => {
        useAuthStore.getState().updateAdminTokens(result);
        return result.accessToken;
      })
      .catch((err) => {
        useAuthStore.getState().setAuthorized(false);
        throw err;
      })
      .finally(() => {
        adminRefreshPromise = null;
      });
  }
  return adminRefreshPromise;
}

// Signs out of whichever session (client or admin) is currently active.
// Only the admin flow has a documented server-side logout/revoke endpoint —
// the client refresh token is just discarded locally.
//
// Clears local state *before* revoking server-side: the admin auth service's
// TLS handshake alone can take several seconds, and `authorized`/`isAdmin`
// staying true for that whole window would keep redirecting an admin who
// just clicked "log out" back into the admin area instead of the login
// screen. The revoke call is best-effort either way.
export async function logout() {
  const { adminSession } = useAuthStore.getState();
  useAuthStore.getState().setAuthorized(false);
  if (adminSession) {
    try {
      await apiLogoutAdmin(adminSession.refreshToken);
    } catch {
      // Best-effort — local session is already cleared regardless.
    }
  }
}
