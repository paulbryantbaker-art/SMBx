import { useState, useEffect, useCallback, useRef, lazy, Suspense, type ReactNode } from 'react';
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
const MarketingHome = lazy(() => import('./marketing/pages/Home'));
const MarketingBuy = lazy(() => import('./marketing/pages/Buy'));
const MarketingSell = lazy(() => import('./marketing/pages/Sell'));
const MarketingRaise = lazy(() => import('./marketing/pages/Raise'));
const MarketingIntegrate = lazy(() => import('./marketing/pages/Integrate'));
const MarketingPricing = lazy(() => import('./marketing/pages/Pricing'));
const MarketingStandard = lazy(() => import('./marketing/pages/Standard'));
const MarketingStandardModel = lazy(() => import('./marketing/pages/StandardModel'));
const MarketingConnectors = lazy(() => import('./marketing/pages/Connectors'));
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

  // Dev/preview escape hatch: `?marketing` forces the logged-out marketing view
  // for the session (DEV_AUTH_BYPASS otherwise supplies a synthetic user, so the
  // marketing branch is unreachable in dev). `?app` exits preview back to the app.
  const [previewMarketing] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('app')) sessionStorage.removeItem('smbx_preview_marketing');
      else if (params.has('marketing')) {
        sessionStorage.setItem('smbx_preview_marketing', '1');
        sessionStorage.removeItem('smbx_app_entered');
      }
      return sessionStorage.getItem('smbx_preview_marketing') === '1';
    } catch { return false; }
  });

  const [googleError, setGoogleError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const googleInitRef = useRef(false);

  // Shared credential handler — runs whether the credential comes from the
  // rendered Google button (reliable) or the One Tap prompt (fallback).
  const handleGoogleCredential = useCallback(async (response: any) => {
    try {
      await loginWithGoogle(response.credential);
      const anonId = sessionStorage.getItem('smbx_anon_session');
      if (anonId) {
        await migrateSession(anonId);
        sessionStorage.removeItem('smbx_anon_session');
      }
      await migrateSessionConversations();
      try { localStorage.setItem('smbx_auth_fresh', String(Date.now())); } catch { /* noop */ }
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Google login error:', err.message);
      setGoogleError(err.message || 'Google sign-in failed. Please try again.');
    }
  }, [loginWithGoogle, migrateSession, navigate]);

  // Initialize Google Identity Services once (idempotent). Returns false until
  // both the GSI script and the client id are available.
  const ensureGoogleInit = useCallback(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID;
    const google = (window as any).google;
    if (!clientId || !google?.accounts?.id) return false;
    if (!googleInitRef.current) {
      google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential });
      googleInitRef.current = true;
    }
    return true;
  }, [handleGoogleCredential]);

  // Fallback trigger (One Tap) for surfaces that still call onGoogleLogin. The
  // primary path is now the rendered button (see `googleReady`).
  const handleGoogleLogin = useCallback(() => {
    if (!ensureGoogleInit()) {
      setGoogleError('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleError('');
    (window as any).google.accounts.id.prompt();
  }, [ensureGoogleInit]);

  const handleLoginSuccess = useCallback(async (email: string, password: string) => {
    await login(email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
    await migrateSessionConversations();
    navigate('/', { replace: true });
  }, [login, migrateSession, navigate]);

  const handleRegisterSuccess = useCallback(async (name: string, email: string, password: string) => {
    await register(name, email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
    await migrateSessionConversations();
    navigate('/', { replace: true });
  }, [register, migrateSession, navigate]);

  // Load public config, then initialize Google Identity Services so the rendered
  // sign-in button can mount. The GSI script is async, so poll briefly until ready.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/config').then(r => r.json()).then(cfg => {
      if (cancelled || !cfg.googleClientId) return;
      (window as any).__GOOGLE_CLIENT_ID = cfg.googleClientId;
      let tries = 0;
      const tick = () => {
        if (cancelled) return;
        if (ensureGoogleInit()) setGoogleReady(true);
        else if (tries++ < 50) setTimeout(tick, 100);
      };
      tick();
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [ensureGoogleInit]);

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

  // Surface decision for a marketing path: render the marketing page when the
  // Two-surface rule: logged-out ALWAYS sees marketing (no anonymous app); the
  // app shell renders only for an authenticated user. `previewMarketing` lets a
  // signed-in user peek at the logged-out site.
  const marketingOrApp = (page: ReactNode): ReactNode =>
    previewMarketing || !user
      ? <Suspense fallback={<PageLoader />}>{page}</Suspense>
      : <Suspense fallback={<PageLoader />}><V6App /></Suspense>;

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
          {/* Redirect only when actually signed in — NOT on DEV_AUTH_BYPASS, or a
              logged-out dev user can never reach the page (and its "Sign in as Paul"). */}
          {user ? <Redirect to="/" /> : (
            <Login
              onLogin={handleLoginSuccess}
              onGoogleLogin={handleGoogleLogin}
              googleReady={googleReady}
              googleError={googleError}
              onNavigateSignup={() => navigate('/signup')}
              onNavigateForgot={() => navigate('/forgot-password')}
            />
          )}
        </Route>
        <Route path="/signup">
          {/* Reachable when logged out (incl. dev) so the marketing chat funnel
              lands new prospects on onboarding, not a redirect. */}
          {user ? <Redirect to="/" /> : (
            <Signup
              onRegister={handleRegisterSuccess}
              onLogin={handleLoginSuccess}
              onGoogleLogin={handleGoogleLogin}
              googleReady={googleReady}
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

        {/* Marketing site (Surface 1, logged-out). Each page renders the
            marketing surface when logged out + not-yet-entered; otherwise the
            app shell. Submitting a chat / "Ask Yulia" sets the entered-app flag
            and hard-reloads → the app renders. The model page must precede
            /standard so the more specific path matches first. */}
        <Route path="/buy">{marketingOrApp(<MarketingBuy />)}</Route>
        <Route path="/sell">{marketingOrApp(<MarketingSell />)}</Route>
        <Route path="/raise">{marketingOrApp(<MarketingRaise />)}</Route>
        <Route path="/integrate">{marketingOrApp(<MarketingIntegrate />)}</Route>
        <Route path="/pricing">{marketingOrApp(<MarketingPricing />)}</Route>
        <Route path="/connectors">{marketingOrApp(<MarketingConnectors />)}</Route>
        <Route path="/standard/working-capital-peg">{marketingOrApp(<MarketingStandardModel />)}</Route>
        <Route path="/standard">{marketingOrApp(<MarketingStandard />)}</Route>
        <Route path="/">{marketingOrApp(<MarketingHome />)}</Route>

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
