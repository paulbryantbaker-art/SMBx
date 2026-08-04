import { useState, useEffect, useCallback, useRef, lazy, Suspense, type ReactNode } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { DEV_AUTH_BYPASS, useAuth, authHeaders } from './hooks/useAuth';
import { ChatProvider } from './context/ChatContext';
import { isSuperAdminUser } from './lib/superAdmin';
import { trackEvent } from './lib/analytics';

// ─── Scroll memory for back/forward ──────────────────────────
// Module scope, registered before wouter loads: the router flushes its state
// update synchronously inside the popstate dispatch, so a listener added later
// (e.g. in a component effect) runs AFTER the route effect has already read
// its flags. restoringNav gates save() — on back/forward the browser fires its
// own (clamped) restore scroll on the NEW pathname before our effect runs,
// which would otherwise overwrite the very position we're about to restore.
const scrollMemory = new Map<string, number>();
let lastPopTs = 0;
let restoringNav = false;
window.addEventListener('popstate', () => { lastPopTs = performance.now(); restoringNav = true; });
window.addEventListener('scroll', () => {
  if (!restoringNav) scrollMemory.set(window.location.pathname, window.scrollY);
}, { passive: true });

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
// 2026-07-11 pivot (THE LINE v2): the public product is retired. The logged-out
// surface is the practice site (corpdevservices bundle): landing + five
// buyer-segment pages, converting into Yulia intake + booked calls. The old
// product-marketing pages (marketing/pages/, marketing/legacy/) stay in the
// tree unrouted as a repurposing pool.
const PracticeLanding = lazy(() => import('./practice/Landing'));
const PracticeIndustries = lazy(() => import('./practice/Industries'));
const PracticeSegment = lazy(() => import('./practice/SegmentPage'));
const PracticeAbout = lazy(() => import('./practice/About'));
const PracticeTrackRecord = lazy(() => import('./practice/TrackRecord'));
// Published research (2026-07-29). The report body and the downloadable PDF
// both render from one markdown file in scripts/studio/reports/.
const PracticeReports = lazy(() => import('./practice/ReportsIndex'));
const PracticeReport = lazy(() => import('./practice/ReportPage'));
// Free owner evaluation (2026-08-04, SELLER_EVALUATION_PLAN.md) — the seller
// lead-magnet funnel. Always public like /research: the report goes by email
// and identity is the smbx_owner funnel JWT, never a users row.
const PracticeOwners = lazy(() => import('./practice/OwnersPage'));
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
  // primary path is the rendered button (see `googleReady`). One Tap is
  // SILENTLY suppressed by Google after repeated dismissals (g_state cooldown
  // cookie on our origin) — without the notification callback the click
  // appears to do nothing at all, which reads as "sign-in is broken".
  const handleGoogleLogin = useCallback(() => {
    if (!ensureGoogleInit()) {
      setGoogleError('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleError('');
    (window as any).google.accounts.id.prompt((n: any) => {
      try {
        if (n && (n.isNotDisplayed?.() || n.isSkippedMoment?.())) {
          setGoogleError('Your browser blocked the quick Google prompt (it cools down after being dismissed a few times). Wait a moment for the Google button to appear, or clear cookies for this site and try again.');
        }
      } catch { /* notification shape varies across GIS versions */ }
    });
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
      // Keep polling for up to 60s: the old 5s cap permanently stranded slow
      // GSI loads on the fallback button, whose One Tap prompt is silently
      // cooldown-suppressed — net effect: sign-in clicks did nothing.
      let tries = 0;
      const tick = () => {
        if (cancelled) return;
        if (ensureGoogleInit()) setGoogleReady(true);
        else if (tries++ < 300) setTimeout(tick, 200);
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

  // On a pathname change: no hash → scroll to top (so a link deep in one page,
  // like the landing's "Who it's for" selector, doesn't drop you into the
  // middle of the next page). With a hash → scroll to that section. On a
  // cross-page jump (e.g. /#who or /#industries clicked from a buyer page) the
  // target isn't in the DOM yet — the destination page is still mounting and
  // lazy-loading — so the browser's native anchor scroll misses and you land
  // at the top (needing a second click). Retry until it renders, then scroll.
  // Back/forward must restore the reader's old position — but the browser's
  // native restore fires once against the still-mounting (short) lazy page and
  // clamps, stranding the reader near the top. So we remember scroll per path
  // ourselves and restore once the page has grown back to size.
  const firstRoute = useRef(true);
  useEffect(() => {
    const pop = lastPopTs > 0 && performance.now() - lastPopTs < 800;
    lastPopTs = 0;
    const first = firstRoute.current;
    firstRoute.current = false;
    if (!pop) restoringNav = false;
    const hash = window.location.hash;
    if (!hash) {
      if (pop) {
        // In-app back/forward: restore the remembered position once the lazy
        // page is tall enough to hold it (up to ~4s), else settle for max.
        const saved = scrollMemory.get(window.location.pathname);
        if (saved == null || saved === 0) { restoringNav = false; window.scrollTo(0, 0); return; }
        let tries = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];
        const attempt = () => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          if (max >= saved || tries >= 80) {
            window.scrollTo(0, Math.max(0, Math.min(saved, max)));
            restoringNav = false;
            return;
          }
          tries++; timers.push(setTimeout(attempt, 50));
        };
        attempt();
        return () => timers.forEach(clearTimeout);
      }
      if (first) {
        // First run = full page load. Only a fresh link/typed navigation gets
        // forced to top; reload and history traversal restore natively.
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (nav && nav.type !== 'navigate') return;
      }
      // Land at the true top, then re-assert while the lazy page mounts and the
      // layout settles (scroll anchoring against late images/fonts can strand
      // the page a nudge below zero). Same settle windows as the hash path,
      // with a longer tail for slow mounts.
      window.scrollTo(0, 0);
      const timers = [120, 350, 800, 1500, 2400].map(d => setTimeout(() => window.scrollTo(0, 0), d));
      return () => timers.forEach(clearTimeout);
    }
    let cancelled = false;
    let tries = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const scrollToTarget = () => {
      let el: Element | null = null;
      try { el = document.querySelector(hash); } catch { return false; } // not a valid selector
      if (!el) return false;
      el.scrollIntoView({ block: 'start' }); // scroll-margin-top on the section clears the sticky nav
      return true;
    };
    const jump = () => {
      if (cancelled) return;
      if (scrollToTarget()) {
        // Rendered and scrolled — but late content (webfont swap, scroll-reveal,
        // the hero showcase image) can still shift the target after this first
        // scroll, leaving the section slightly off. Re-align a few times as the
        // layout settles, then stop so we never fight the user's own scrolling.
        [120, 350, 800].forEach(d => timers.push(setTimeout(() => { if (!cancelled) scrollToTarget(); }, d)));
        return;
      }
      if (tries++ < 60) timers.push(setTimeout(jump, 50)); // up to ~3s for the lazy page to render
    };
    jump();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [location]);

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

        {/* Practice site (Surface 1, logged-out — corpdevservices bundle).
            Landing + five buyer-segment pages; every retired product-marketing
            URL redirects home; an authed user gets the app shell per the
            two-surface rule. */}
        <Route path="/buyers/:slug">
          {(params) => marketingOrApp(<PracticeSegment slug={params.slug} />)}
        </Route>
        {/* Published research — ALWAYS public, deliberately outside the
            two-surface rule. These are the pages a LinkedIn post points at, so
            they must render the same for a logged-in practitioner checking the
            link as for a cold visitor (same exemption the token-gated share
            surfaces above carry). */}
        <Route path="/research">
          <Suspense fallback={<PageLoader />}><PracticeReports /></Suspense>
        </Route>
        <Route path="/research/:slug">
          {(params) => <Suspense fallback={<PageLoader />}><PracticeReport slug={params.slug} /></Suspense>}
        </Route>
        {/* The old path, kept for links already posted. The server answers a
            301 before the SPA ever loads, so these only fire on an in-app
            navigation — a stale bookmark opened from another tab, say. */}
        <Route path="/reports"><Redirect to="/research" /></Route>
        <Route path="/reports/:slug">
          {(params) => <Redirect to={`/research/${params.slug}`} />}
        </Route>
        {/* Free owner evaluation — ALWAYS public for the same reason as
            /research: it's the page ads and posts point at, and its identity
            is the owner funnel cookie, not the app session. A logged-in
            practitioner checking the link sees what an owner sees. */}
        <Route path="/owners">
          <Suspense fallback={<PageLoader />}><PracticeOwners /></Suspense>
        </Route>
        <Route path="/about">{marketingOrApp(<PracticeAbout />)}</Route>
        <Route path="/industries">{marketingOrApp(<PracticeIndustries />)}</Route>
        <Route path="/track-record">{marketingOrApp(<PracticeTrackRecord />)}</Route>
        <Route path="/buy"><Redirect to="/" /></Route>
        <Route path="/sell"><Redirect to="/" /></Route>
        <Route path="/advise"><Redirect to="/" /></Route>
        <Route path="/brokers"><Redirect to="/" /></Route>
        <Route path="/how-it-works"><Redirect to="/" /></Route>
        <Route path="/raise"><Redirect to="/" /></Route>
        <Route path="/integrate"><Redirect to="/" /></Route>
        <Route path="/pricing"><Redirect to="/" /></Route>
        <Route path="/connectors"><Redirect to="/" /></Route>
        <Route path="/standard/working-capital-peg"><Redirect to="/" /></Route>
        <Route path="/standard"><Redirect to="/" /></Route>
        <Route path="/">{marketingOrApp(<PracticeLanding />)}</Route>

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
