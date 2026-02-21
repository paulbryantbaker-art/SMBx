import { useState, type FormEvent } from 'react';
import Logo from '../../components/public/Logo';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => void;
  onNavigateSignup: () => void;
}

export default function Login({ onLogin, onGoogleLogin, onNavigateSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.brand}><Logo className="text-3xl" /></h1>
        <p style={styles.subtitle}>Your AI M&A advisor</p>

        <button type="button" onClick={onGoogleLogin} style={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 10, flexShrink: 0 }}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or continue with email</span>
          <div style={styles.dividerLine} />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Email</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} />

          <label style={styles.label}>Password</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={styles.input} />

          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <button type="button" onClick={onNavigateSignup} style={styles.link}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '16px',
    backgroundColor: '#F5F5F0',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)',
  },
  brand: {
    fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
    fontSize: '1.75rem',
    color: '#DA7756',
    textAlign: 'center' as const,
    margin: 0,
    fontWeight: 600,
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#6B6B65',
    fontSize: '1rem',
    margin: '6px 0 28px',
    fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 10,
    fontSize: '1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    color: '#1A1A18',
    cursor: 'pointer',
    transition: 'background-color 0.1s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  dividerText: {
    fontSize: '0.875rem',
    color: '#9B9B95',
    whiteSpace: 'nowrap' as const,
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1A1A18',
    marginBottom: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '1rem',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 10,
    outline: 'none',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    color: '#1A1A18',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#DA7756',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 999,
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    marginTop: 4,
  },
  error: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: '0.875rem',
    marginBottom: 16,
  },
  footer: {
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    color: '#6B6B65',
    marginTop: 24,
    marginBottom: 0,
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#DA7756',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.875rem',
    padding: 0,
    textDecoration: 'underline',
  },
};
