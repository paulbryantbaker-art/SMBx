import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { useAuth, authHeaders } from './hooks/useAuth';
import { ChatProvider } from './context/ChatContext';
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
    <div className="flex justify-center items-center min-h-dvh bg-white">
      <p className="text-[#9CA3AF] font-sans text-base m-0">Loading...</p>
    </div>
  );
}

import AppShell from './pages/public/AppShell';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

// Lazy-load secondary pages
const SharedDocument = lazy(() => import('./pages/public/SharedDocument'));
const SharedDocumentView = lazy(() => import('./pages/SharedDocumentView'));
const AcceptInvite = lazy(() => import('./pages/public/AcceptInvite'));
const Search = lazy(() => import('./pages/Search'));
const DayPassView = lazy(() => import('./pages/public/DayPassView'));
const ValueLensPage = lazy(() => import('./pages/public/ValueLensPage'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

/** Check if a path should be handled by the unified AppShell */
function isShellPath(path: string): boolean {
  const shellExact = ['/', '/sell', '/buy', '/raise', '/integrate', '/how-it-works', '/advisors', '/enterprise', '/pricing', '/pipeline', '/dataroom', '/settings', '/chat'];
  if (shellExact.includes(path)) return true;
  if (path.startsWith('/chat/')) return true;
  return false;
}

export default function App() {
  const { user, loading, login, register, loginWithGoogle, migrateSession, logout } = useAuth();
  const [location, navigate] = useLocation();

  const [googleError, setGoogleError] = useState('');
  const handleGoogleLogin = useCallback(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGoogleError('Google Sign-In is not configured yet. Please use email/password to create an account.');
      return;
    }
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      setGoogleError('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleError('');
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
          navigate('/chat');
        } catch (err: any) {
          console.error('Google login error:', err.message);
        }
      },
    });
    google.accounts.id.prompt();
  }, [loginWithGoogle, migrateSession, navigate]);

  const handleLoginSuccess = useCallback(async (email: string, password: string) => {
    await login(email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
    await migrateSessionConversations();
    navigate('/chat');
  }, [login, migrateSession, navigate]);

  const handleRegisterSuccess = useCallback(async (name: string, email: string, password: string) => {
    await register(name, email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
    await migrateSessionConversations();
    navigate('/chat');
  }, [register, migrateSession, navigate]);

  // Load public config
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(cfg => {
      if (cfg.googleClientId) (window as any).__GOOGLE_CLIENT_ID = cfg.googleClientId;
    }).catch(() => {});
  }, []);

  // Page view tracking — fires on every route change
  const prevPath = useRef(location);
  useEffect(() => {
    if (location !== prevPath.current) {
      prevPath.current = location;
      trackEvent('page_view', { path: location, referrer: document.referrer });
    }
  }, [location]);
  // Also fire on initial load
  useEffect(() => {
    trackEvent('page_view', { path: location, referrer: document.referrer });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-white">
        <p className="text-[#9CA3AF] font-sans text-base m-0">Loading...</p>
      </div>
    );
  }

  return (
    <ChatProvider>
    {/* AppShell handles all main routes as a single persistent instance */}
    {isShellPath(location) && <AppShell />}

    {!isShellPath(location) && (
    <Switch>
      {/* Legal */}
      <Route path="/legal/privacy">
        <Privacy />
      </Route>
      <Route path="/legal/terms">
        <Terms />
      </Route>

      {/* Shared / invite / day-pass */}
      <Route path="/shared/doc/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <SharedDocumentView token={params.token} />
          </Suspense>
        )}
      </Route>
      <Route path="/shared/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <SharedDocument token={params.token} />
          </Suspense>
        )}
      </Route>
      <Route path="/invite/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <AcceptInvite token={params.token} />
          </Suspense>
        )}
      </Route>
      <Route path="/day-pass/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <DayPassView token={params.token} />
          </Suspense>
        )}
      </Route>
      <Route path="/valuelens/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <ValueLensPage token={params.token} />
          </Suspense>
        )}
      </Route>
      <Route path="/biz/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <ValueLensPage token={params.token} />
          </Suspense>
        )}
      </Route>

      {/* Auth */}
      <Route path="/login">
        {user ? (
          <Redirect to="/chat" />
        ) : (
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
        {user ? (
          <Redirect to="/chat" />
        ) : (
          <Signup
            onRegister={handleRegisterSuccess}
            onGoogleLogin={handleGoogleLogin}
            onNavigateLogin={() => navigate('/login')}
          />
        )}
      </Route>
      <Route path="/forgot-password">
        {user ? (
          <Redirect to="/chat" />
        ) : (
          <Suspense fallback={<PageLoader />}>
            <ForgotPassword onNavigateLogin={() => navigate('/login')} />
          </Suspense>
        )}
      </Route>
      <Route path="/reset-password/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <ResetPassword token={params.token} onNavigateLogin={() => navigate('/login')} />
          </Suspense>
        )}
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin">
        {user?.role === 'admin' || user?.email === 'pbaker@smbx.ai' ? (
          <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
        ) : (
          <Redirect to={user ? '/chat' : '/login'} />
        )}
      </Route>

      {/* Search (authenticated) */}
      <Route path="/search">
        {user ? (
          <Suspense fallback={<PageLoader />}><Search /></Suspense>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      {/* Catch-all */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
    )}
    </ChatProvider>
  );
}
