import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { DEV_AUTH_BYPASS, useAuth, authHeaders } from './hooks/useAuth';
import { ChatProvider } from './context/ChatContext';
import { isSuperAdminUser } from './lib/superAdmin';
import { trackEvent } from './lib/analytics';

/** Transfer anonymous conversations to the newly-authenticated user */
async function migrateSessionConversations() {
  const sessionId = localStorage.getItem('smbx_session_id');
  if (!sessionId) return;
  try {
    await fetch('/api/chat/conversations/migrate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ sessionId }),
    });
    localStorage.removeItem('smbx_session_id');
    localStorage.removeItem('smbx_public_conv');
  } catch {
    // non-critical
  }
}

function PageLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: 'var(--ink-3)' }}>
      Loading…
    </div>
  );
}

function VerifyEmail({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) { setStatus('error'); setMsg('No verification token found.'); return; }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async r => {
      if (r.ok) {
        setStatus('success');
        setTimeout(() => {
          window.close();
          setTimeout(onDone, 500);
        }, 4000);
      }
      else { const d = await r.json().catch(() => ({})); setStatus('error'); setMsg(d.error || 'Verification failed.'); }
    }).catch(() => { setStatus('error'); setMsg('Network error.'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--surface)', borderRadius: 12, padding: 40, border: '1px solid var(--line)', textAlign: 'center' }}>
        {status === 'verifying' && <p style={{ color: 'var(--ink-3)' }}>Verifying your email…</p>}
        {status === 'success' && (
          <>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0, marginBottom: 8 }}>You're verified.</p>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>Your email has been confirmed. You can close this tab.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0, marginBottom: 8 }}>Verification failed</p>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>{msg}</p>
          </>
        )}
      </div>
    </div>
  );
}

import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

// Lazy-load secondary pages
const V6App = lazy(() => import('./components/v6/V6App'));
const SharedDocument = lazy(() => import('./pages/public/SharedDocument'));
const SharedDocumentView = lazy(() => import('./pages/SharedDocumentView'));
const AcceptInvite = lazy(() => import('./pages/public/AcceptInvite'));
const DayPassView = lazy(() => import('./pages/public/DayPassView'));
const ValueLensPage = lazy(() => import('./pages/public/ValueLensPage'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

export default function App() {
  const { user, loading, login, register, loginWithGoogle, migrateSession } = useAuth();
  const [location, navigate] = useLocation();

  const [googleError, setGoogleError] = useState('');
  const googleInitRef = useRef(false);

  const handleGoogleLogin = useCallback(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGoogleError('Google Sign-In is not configured yet. Please try again in a moment or contact support if the issue persists.');
      return;
    }
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      setGoogleError('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleError('');

    if (!googleInitRef.current) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            await loginWithGoogle(response.credential);
            const anonId = sessionStorage.getItem('smbx_anon_session');
            if (anonId) {
              await migrateSession(anonId);
              sessionStorage.removeItem('smbx_anon_session');
            }
            await migrateSessionConversations();
            try { localStorage.setItem('smbx_auth_fresh', String(Date.now())); } catch { /* noop */ }
            navigate('/');
          } catch (err: any) {
            console.error('Google login error:', err.message);
            setGoogleError(err.message || 'Google sign-in failed. Please try email/password.');
          }
        },
      });
      googleInitRef.current = true;
    }
    google.accounts.id.prompt((notification: any) => {
      if (notification?.isNotDisplayed() || notification?.isSkippedMoment()) {
        setGoogleError('Google sign-in is temporarily unavailable. Please use email/password, or try again in a few minutes.');
      }
    });
  }, [loginWithGoogle, migrateSession, navigate]);

  const handleLoginSuccess = useCallback(async (email: string, password: string) => {
    await login(email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
    await migrateSessionConversations();
    navigate('/');
  }, [login, migrateSession, navigate]);

  const handleRegisterSuccess = useCallback(async (name: string, email: string, password: string) => {
    await register(name, email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
    await migrateSessionConversations();
    navigate('/');
  }, [register, migrateSession, navigate]);

  // Load public config
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(cfg => {
      if (cfg.googleClientId) (window as any).__GOOGLE_CLIENT_ID = cfg.googleClientId;
    }).catch(() => {});
  }, []);

  // Page view tracking
  const prevPath = useRef(location);
  useEffect(() => {
    if (location !== prevPath.current) {
      prevPath.current = location;
      trackEvent('page_view', { path: location, referrer: document.referrer });
    }
  }, [location]);
  useEffect(() => {
    trackEvent('page_view', { path: location, referrer: document.referrer });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoader />;

  return (
    <ChatProvider>
      <Switch>
        {/* Legal */}
        <Route path="/legal/privacy"><Privacy /></Route>
        <Route path="/legal/terms"><Terms /></Route>

        {/* Shareable views (public, token-gated) */}
        <Route path="/shared/doc/:token">
          {(params) => <Suspense fallback={<PageLoader />}><SharedDocumentView token={params.token} /></Suspense>}
        </Route>
        <Route path="/shared/:token">
          {(params) => <Suspense fallback={<PageLoader />}><SharedDocument token={params.token} /></Suspense>}
        </Route>
        <Route path="/invite/:token">
          {(params) => <Suspense fallback={<PageLoader />}><AcceptInvite token={params.token} /></Suspense>}
        </Route>
        <Route path="/day-pass/:token">
          {(params) => <Suspense fallback={<PageLoader />}><DayPassView token={params.token} /></Suspense>}
        </Route>
        <Route path="/valuelens/:token">
          {(params) => <Suspense fallback={<PageLoader />}><ValueLensPage token={params.token} /></Suspense>}
        </Route>
        <Route path="/biz/:token">
          {(params) => <Suspense fallback={<PageLoader />}><ValueLensPage token={params.token} /></Suspense>}
        </Route>

        {/* Auth */}
        <Route path="/login">
          {DEV_AUTH_BYPASS || user ? <Redirect to="/" /> : (
            <Login
              onLogin={handleLoginSuccess}
              onGoogleLogin={handleGoogleLogin}
              googleError={googleError}
              onNavigateSignup={() => navigate('/signup')}
              onNavigateForgot={() => navigate('/forgot-password')}
            />
          )}
        </Route>
        <Route path="/signup">
          {DEV_AUTH_BYPASS || user ? <Redirect to="/" /> : (
            <Signup
              onRegister={handleRegisterSuccess}
              onGoogleLogin={handleGoogleLogin}
              onNavigateLogin={() => navigate('/login')}
            />
          )}
        </Route>
        <Route path="/verify-email">
          <VerifyEmail onDone={() => navigate(user ? '/' : '/login')} />
        </Route>
        <Route path="/forgot-password">
          {DEV_AUTH_BYPASS || user ? <Redirect to="/" /> : (
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword onNavigateLogin={() => navigate('/login')} />
            </Suspense>
          )}
        </Route>
        <Route path="/reset-password/:token">
          {(params) => (
            DEV_AUTH_BYPASS
              ? <Redirect to="/" />
              : (
                <Suspense fallback={<PageLoader />}>
                  <ResetPassword token={params.token} onNavigateLogin={() => navigate('/login')} />
                </Suspense>
              )
          )}
        </Route>

        {/* Admin */}
        <Route path="/admin">
          {isSuperAdminUser(user) ? (
            <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
          ) : (
            <Redirect to={user ? '/' : '/login'} />
          )}
        </Route>

        {/* Catch-all → V6 Files Workspace (canonical 2026-05-01).
            Replaced V3App. All retired routes fall through here. */}
        <Route>
          <Suspense fallback={<PageLoader />}>
            <V6App />
          </Suspense>
        </Route>
      </Switch>
    </ChatProvider>
  );
}
