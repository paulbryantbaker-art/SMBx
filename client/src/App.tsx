import { useEffect, useCallback } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { useAuth } from './hooks/useAuth';
import { ChatProvider } from './context/ChatContext';

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

import Home from './pages/public/Home';
import Sell from './pages/public/Sell';
import Buy from './pages/public/Buy';
import Raise from './pages/public/Raise';
import Integrate from './pages/public/Integrate';
import Pricing from './pages/public/Pricing';
import HowItWorks from './pages/public/HowItWorks';
import Enterprise from './pages/public/Enterprise';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Chat from './pages/Chat';

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
          // Migrate anonymous session if present
          const anonId = sessionStorage.getItem('smbx_anon_session');
          if (anonId) {
            await migrateSession(anonId);
            sessionStorage.removeItem('smbx_anon_session');
          }
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
    navigate('/chat');
  }, [login, migrateSession, navigate]);

  const handleRegisterSuccess = useCallback(async (name: string, email: string, password: string) => {
    await register(name, email, password);
    const anonId = sessionStorage.getItem('smbx_anon_session');
    if (anonId) {
      await migrateSession(anonId);
      sessionStorage.removeItem('smbx_anon_session');
    }
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
      <Route path="/sell">
        <Sell />
      </Route>
      <Route path="/buy">
        <Buy />
      </Route>
      <Route path="/raise">
        <Raise />
      </Route>
      <Route path="/integrate">
        <Integrate />
      </Route>
      <Route path="/pricing">
        <Pricing />
      </Route>
      <Route path="/how-it-works">
        <HowItWorks />
      </Route>
      <Route path="/enterprise">
        <Enterprise />
      </Route>

      <Route path="/legal/privacy">
        <Privacy />
      </Route>
      <Route path="/legal/terms">
        <Terms />
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
        {user ? (
          <Chat user={user} onLogout={() => { logout(); navigate('/'); }} />
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
