import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';

type Page = 'login' | 'signup';

export default function App() {
  const { user, loading, login, register, logout, loginWithGoogle } = useAuth();
  const [page, setPage] = useState<Page>('login');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
        <div style={{ color: '#9B9B95', fontFamily: 'ui-serif, Georgia, serif', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F5F5F0', gap: 16, padding: 16 }}>
        <h1 style={{ fontFamily: 'ui-serif, Georgia, serif', color: '#DA7756', margin: 0, fontSize: '1.75rem' }}>smbx.ai</h1>
        <p style={{ fontFamily: 'ui-serif, Georgia, serif', color: '#1A1A18', margin: 0, fontSize: '1.125rem' }}>
          Welcome, {user.displayName || user.email}
        </p>
        <button
          onClick={logout}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            backgroundColor: 'transparent',
            color: '#6B6B65',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 999,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (page === 'signup') {
    return (
      <Signup
        onRegister={async (name, email, password) => { await register(name, email, password); }}
        onGoogleLogin={loginWithGoogle}
        onNavigateLogin={() => setPage('login')}
      />
    );
  }

  return (
    <Login
      onLogin={async (email, password) => { await login(email, password); }}
      onGoogleLogin={loginWithGoogle}
      onNavigateSignup={() => setPage('signup')}
    />
  );
}
