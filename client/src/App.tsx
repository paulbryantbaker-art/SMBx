import { Route, Switch, Redirect, useLocation } from 'wouter';
import { useAuth } from './hooks/useAuth';
import Home from './pages/public/Home';
import Sell from './pages/public/Sell';
import Buy from './pages/public/Buy';
import Raise from './pages/public/Raise';
import Pricing from './pages/public/Pricing';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Chat from './pages/Chat';

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-cream">
        <p className="text-text-tertiary font-[Georgia,ui-serif,serif] text-base m-0">Loading...</p>
      </div>
    );
  }

  return (
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
        <Home />
      </Route>
      <Route path="/pricing">
        <Pricing />
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
  );
}
