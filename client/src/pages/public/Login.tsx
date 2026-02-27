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
    <div className="flex flex-col justify-center items-center min-h-dvh px-5 bg-[#FAF8F4]">
      <a
        href="/"
        className="flex items-center gap-1.5 text-[14px] font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors mb-5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to smbx.ai
      </a>
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="text-center mb-7">
          <Logo linked={false} />
          <p className="text-sm text-[#7A766E] mt-2 m-0">Sign in to your account</p>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white border border-[#E0DCD4] rounded-xl text-[15px] text-[#1A1A18] font-medium cursor-pointer transition-colors hover:border-[#1A1A18]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E0DCD4]" />
          <span className="text-[13px] text-[#7A766E] whitespace-nowrap">or continue with email</span>
          <div className="flex-1 h-px bg-[#E0DCD4]" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="bg-[#FEF2F2] text-[#B91C1C] px-3.5 py-2.5 rounded-xl text-sm mb-4">{error}</div>
          )}

          <label className="block text-sm font-medium text-[#1A1A18] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 text-[15px] border border-[#E0DCD4] rounded-xl outline-none mb-4 bg-white text-[#1A1A18] focus:border-[#D4714E]"
          />

          <label className="block text-sm font-medium text-[#1A1A18] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3.5 py-2.5 text-[15px] border border-[#E0DCD4] rounded-xl outline-none mb-4 bg-white text-[#1A1A18] focus:border-[#D4714E]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#D4714E] text-white border-none rounded-full text-[15px] font-semibold cursor-pointer mt-1 hover:bg-[#BE6342] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-[#7A766E] mt-6 m-0">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onNavigateSignup}
            className="bg-transparent border-none text-[#D4714E] font-semibold cursor-pointer text-sm p-0"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
