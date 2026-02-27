import { useState, useCallback } from 'react';

interface InlineSignupCardProps {
  sessionId: string | null;
  onDismiss?: () => void;
  canDismiss?: boolean;
}

export default function InlineSignupCard({ sessionId, onDismiss, canDismiss = true }: InlineSignupCardProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Register or login
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'signup'
        ? { displayName: name, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (mode === 'signup' ? 'Registration failed' : 'Login failed'));
      }

      const { token, user } = await res.json();

      // Store token
      localStorage.setItem('smbx_token', token);

      // Convert anonymous session
      let conversationId: number | null = null;
      if (sessionId) {
        try {
          const convertRes = await fetch(`/api/chat/anonymous/${sessionId}/convert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId: user.id }),
          });
          if (convertRes.ok) {
            const data = await convertRes.json();
            conversationId = data.conversationId;
          }
        } catch {
          // Session convert failed — still redirect to chat
        }
        // Clear anonymous session
        try { sessionStorage.removeItem('smbx_anon_session'); } catch {}
      }

      // Show success briefly, then navigate
      setSuccess(true);
      setTimeout(() => {
        window.location.href = conversationId ? `/chat/${conversationId}` : '/chat';
      }, 600);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mode, name, email, password, sessionId]);

  const handleGoogleSignup = useCallback(() => {
    const clientId = (window as any).__GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const google = (window as any).google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          });
          if (!res.ok) throw new Error('Google sign in failed');

          const { token, user } = await res.json();
          localStorage.setItem('smbx_token', token);

          let conversationId: number | null = null;
          if (sessionId) {
            try {
              const convertRes = await fetch(`/api/chat/anonymous/${sessionId}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: user.id }),
              });
              if (convertRes.ok) {
                const data = await convertRes.json();
                conversationId = data.conversationId;
              }
            } catch {}
            try { sessionStorage.removeItem('smbx_anon_session'); } catch {}
          }

          setSuccess(true);
          setTimeout(() => {
            window.location.href = conversationId ? `/chat/${conversationId}` : '/chat';
          }, 600);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      },
    });
    google.accounts.id.prompt();
  }, [sessionId]);

  if (success) {
    return (
      <div className="self-center w-full max-w-[95%] bg-white rounded-2xl px-6 py-8 text-center" style={{ boxShadow: '0 2px 8px rgba(26,26,24,.07), 0 1px 2px rgba(26,26,24,.04)', borderLeft: '3px solid #D4714E' }}>
        <div className="w-10 h-10 rounded-full bg-[#D4714E] text-white flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="text-lg font-semibold text-[#1A1A18] m-0">You're all set</p>
        <p className="text-sm text-[#6E6A63] m-0 mt-1">Taking you to your workspace...</p>
      </div>
    );
  }

  return (
    <div className="self-center w-full max-w-[95%] bg-white rounded-2xl px-6 py-6" style={{ boxShadow: '0 2px 8px rgba(26,26,24,.07), 0 1px 2px rgba(26,26,24,.04)', borderLeft: '3px solid #D4714E' }}>
      {canDismiss && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-[#A9A49C] hover:text-[#1A1A18] bg-transparent border-none cursor-pointer p-1"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      )}

      <h3 className="text-lg font-semibold text-[#1A1A18] m-0 mb-1" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        Save your progress and continue with Yulia
      </h3>
      <p className="text-[15px] text-[#3D3B37] m-0 mb-5 leading-relaxed">
        Create a free account to unlock unlimited conversations, your deal workspace, and deliverables.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#DDD9D1] text-base text-[#1A1A18] outline-none transition-colors focus:border-[#D4714E]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", boxShadow: 'inset 0 0 0 0 transparent' }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#DDD9D1] text-base text-[#1A1A18] outline-none transition-colors focus:border-[#D4714E]"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border border-[#DDD9D1] text-base text-[#1A1A18] outline-none transition-colors focus:border-[#D4714E]"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        />

        {error && (
          <p className="text-sm text-red-600 m-0">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl border-none bg-[#D4714E] text-white text-base font-semibold cursor-pointer hover:bg-[#BE6342] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", height: '48px' }}
        >
          {loading ? 'Please wait...' : 'Continue'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#DDD9D1]" />
        <span className="text-[13px] text-[#A9A49C]">or</span>
        <div className="flex-1 h-px bg-[#DDD9D1]" />
      </div>

      {/* Google SSO */}
      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-[#DDD9D1] bg-white text-[#1A1A18] text-base font-medium cursor-pointer hover:bg-[#F3F0EA] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        style={{ fontFamily: "'Inter', system-ui, sans-serif", height: '48px' }}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Continue with Google
      </button>

      {/* Toggle mode */}
      <p className="text-[14px] text-[#6E6A63] text-center m-0 mt-4">
        {mode === 'signup' ? (
          <>Already have an account? <button onClick={() => { setMode('login'); setError(null); }} className="text-[#D4714E] font-semibold bg-transparent border-none cursor-pointer underline" style={{ fontFamily: 'inherit', fontSize: 'inherit' }} type="button">Sign in</button></>
        ) : (
          <>New here? <button onClick={() => { setMode('signup'); setError(null); }} className="text-[#D4714E] font-semibold bg-transparent border-none cursor-pointer underline" style={{ fontFamily: 'inherit', fontSize: 'inherit' }} type="button">Create account</button></>
        )}
      </p>
    </div>
  );
}
