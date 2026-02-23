import { useEffect } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { useAuth } from './hooks/useAuth';
import { ChatProvider } from './contexts/ChatContext';

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
  const { user, loading, login, register, logout } = useAuth();
  const [, navigate] = useLocation();

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
            onLogin={async (email, password) => {
              await login(email, password);
              navigate('/chat');
            }}
            onGoogleLogin={() => {}}
            onNavigateSignup={() => navigate('/signup')}
          />
        )}
      </Route>

      <Route path="/signup">
        {user ? (
          <Redirect to="/chat" />
        ) : (
          <Signup
            onRegister={async (name, email, password) => {
              await register(name, email, password);
              navigate('/chat');
            }}
            onGoogleLogin={() => {}}
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
