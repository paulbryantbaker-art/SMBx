import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Chat from './pages/Chat';

type Page = 'login' | 'signup';

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [page, setPage] = useState<Page>('login');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-cream">
        <p className="text-text-tertiary font-[Georgia,ui-serif,serif] text-base m-0">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Chat user={user} onLogout={logout} />;
  }

  if (page === 'signup') {
    return (
      <Signup
        onRegister={async (name, email, password) => { await register(name, email, password); }}
        onGoogleLogin={() => {}}
        onNavigateLogin={() => setPage('login')}
      />
    );
  }

  return (
    <Login
      onLogin={async (email, password) => { await login(email, password); }}
      onGoogleLogin={() => {}}
      onNavigateSignup={() => setPage('signup')}
    />
  );
}
