import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'smbx_token';
const DEV_USER_KEY = 'smbx_dev_mock_user';
const DEV_AUTH_CHANGE_EVENT = 'smbx-dev-auth-change';
const viteEnv = (import.meta as unknown as {
  env?: { DEV?: boolean; VITE_DEV_AUTH_BYPASS?: string };
}).env;

export const DEV_AUTH_BYPASS =
  viteEnv?.DEV === true && viteEnv.VITE_DEV_AUTH_BYPASS !== 'false';

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  google_id: string | null;
  league: string | null;
  role: string;
  is_advisor?: boolean | null;
  plan?: string | null;
  trial_ends_at?: string | null;
  free_deliverable_used?: boolean | null;
  created_at: string;
  updated_at: string;
}

const DEV_MOCK_USER: User = {
  id: -1,
  email: 'paul.preview@smbx.ai',
  display_name: 'Paul Baker',
  google_id: null,
  league: null,
  role: 'superadmin',
  is_advisor: true,
  plan: 'enterprise',
  trial_ends_at: null,
  free_deliverable_used: false,
  created_at: '2026-05-08T00:00:00.000Z',
  updated_at: '2026-05-08T00:00:00.000Z',
};

function readDevUser(): User | null {
  if (!DEV_AUTH_BYPASS || typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(DEV_USER_KEY) === '1' ? DEV_MOCK_USER : null;
  } catch {
    return null;
  }
}

function writeDevUser(enabled: boolean) {
  if (!DEV_AUTH_BYPASS || typeof window === 'undefined') return;
  try {
    if (enabled) localStorage.setItem(DEV_USER_KEY, '1');
    else localStorage.removeItem(DEV_USER_KEY);
    window.dispatchEvent(new CustomEvent(DEV_AUTH_CHANGE_EVENT));
  } catch { /* noop */ }
}

function getToken(): string | null {
  if (DEV_AUTH_BYPASS) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => readDevUser());
  const [loading, setLoading] = useState(!DEV_AUTH_BYPASS);

  const fetchCurrentUser = useCallback(async () => {
    if (DEV_AUTH_BYPASS) {
      setUser(readDevUser());
      setLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        clearToken();
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!DEV_AUTH_BYPASS) return;
    const syncDevUser = () => setUser(readDevUser());
    window.addEventListener(DEV_AUTH_CHANGE_EVENT, syncDevUser);
    window.addEventListener('storage', syncDevUser);
    return () => {
      window.removeEventListener(DEV_AUTH_CHANGE_EVENT, syncDevUser);
      window.removeEventListener('storage', syncDevUser);
    };
  }, []);

  const devSignIn = useCallback(() => {
    writeDevUser(true);
    setUser(DEV_MOCK_USER);
    setLoading(false);
    return DEV_MOCK_USER;
  }, []);

  const login = async (email: string, password: string) => {
    if (DEV_AUTH_BYPASS) {
      return devSignIn();
    }
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (displayName: string, email: string, password: string) => {
    if (DEV_AUTH_BYPASS) {
      return devSignIn();
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (credential: string) => {
    if (DEV_AUTH_BYPASS) {
      return devSignIn();
    }
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Google login failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const migrateSession = async (sessionId: string) => {
    const token = getToken();
    if (!token || !sessionId) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      const res = await fetch(`/api/chat/anonymous/${sessionId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.conversationId as number;
      }
    } catch { /* ignore */ }
    return null;
  };

  const logout = async () => {
    // Clear the marketing→app threshold flags so logout actually returns to the
    // logged-out marketing site (otherwise `smbx_app_entered` keeps you in the app).
    try {
      sessionStorage.removeItem('smbx_app_entered');
      sessionStorage.removeItem('smbx_preview_marketing');
    } catch { /* sessionStorage unavailable */ }
    if (DEV_AUTH_BYPASS) {
      writeDevUser(false);
      setUser(null);
      return;
    }
    clearToken();
    setUser(null);
  };

  return { user, loading, login, register, loginWithGoogle, migrateSession, logout, devSignIn };
}
