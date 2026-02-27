import { useEffect, useCallback, lazy, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { useAuth, authHeaders } from './hooks/useAuth';
import { ChatProvider } from './context/ChatContext';

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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex justify-center items-center min-h-dvh bg-[#FAF8F4]">
      <p className="text-[#7A766E] font-sans text-base m-0">Loading...</p>
    </div>
  );
}

import Home from './pages/public/Home';
import Pricing from './pages/public/Pricing';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Chat from './pages/Chat';

// Lazy-load secondary pages to keep initial bundle lean
const SharedDocument = lazy(() => import('./pages/public/SharedDocument'));
const Sell = lazy(() => import('./pages/public/Sell'));
const Buy = lazy(() => import('./pages/public/Buy'));
const Raise = lazy(() => import('./pages/public/Raise'));
const Integrate = lazy(() => import('./pages/public/Integrate'));
const HowItWorks = lazy(() => import('./pages/public/HowItWorks'));
const Enterprise = lazy(() => import('./pages/public/Enterprise'));

export default function App() {
  const { user, loading, login, register, loginWithGoogle, migrateSession, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleGoogleLogin = useCallback(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Google Client ID not configured');
      return;
    }
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      console.warn('Google Identity Services not loaded');
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          await loginWithGoogle(response.credential);
          // Migrate anonymous sessions
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

  // Load public config (Google Client ID, etc.)
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(cfg => {
      if (cfg.googleClientId) (window as any).__GOOGLE_CLIENT_ID = cfg.googleClientId;
    }).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-[#FAF8F4]">
        <p className="text-[#7A766E] font-sans text-base m-0">Loading...</p>
      </div>
    );
  }

  return (
    <ChatProvider>
    <ScrollToTop />
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/pricing">
        <Pricing />
      </Route>

      <Route path="/legal/privacy">
        <Privacy />
      </Route>
      <Route path="/legal/terms">
        <Terms />
      </Route>
      <Route path="/shared/:token">
        {(params) => (
          <Suspense fallback={<PageLoader />}>
            <SharedDocument token={params.token} />
          </Suspense>
        )}
      </Route>

      <Route path="/sell">
        <Suspense fallback={<PageLoader />}><Sell /></Suspense>
      </Route>
      <Route path="/buy">
        <Suspense fallback={<PageLoader />}><Buy /></Suspense>
      </Route>
      <Route path="/raise">
        <Suspense fallback={<PageLoader />}><Raise /></Suspense>
      </Route>
      <Route path="/integrate">
        <Suspense fallback={<PageLoader />}><Integrate /></Suspense>
      </Route>
      <Route path="/how-it-works">
        <Suspense fallback={<PageLoader />}><HowItWorks /></Suspense>
      </Route>
      <Route path="/enterprise">
        <Suspense fallback={<PageLoader />}><Enterprise /></Suspense>
      </Route>

      <Route path="/login">
        {user ? (
          <Redirect to="/chat" />
        ) : (
          <Login
            onLogin={handleLoginSuccess}
            onGoogleLogin={handleGoogleLogin}
            onNavigateSignup={() => navigate('/signup')}
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

      <Route path="/chat/:id?">
        {(params) => user ? (
          <Chat user={user} onLogout={() => { logout(); navigate('/'); }} initialConversationId={params.id ? parseInt(params.id, 10) : undefined} />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
    </ChatProvider>
  );
}
