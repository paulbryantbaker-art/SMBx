/**
 * Signup — Google-only sign-up (the marketing chat funnel lands new prospects here).
 *
 * See Login.tsx for context. Email/password removed because it had
 * reliability issues on mobile. Google auth handles the account
 * creation on first sign-in; this page just guides the user there.
 * A "Local dev" shortcut (Sign in as Paul) makes the onboarding flow
 * testable without Google OAuth on localhost.
 */

import { useState } from 'react';
import Logo from '../../components/public/Logo';

interface SignupProps {
  /** @deprecated email/password form removed — kept for API compatibility. */
  onRegister?: (displayName: string, email: string, password: string) => Promise<void>;
  /** Dev-only quick login used by the "Local dev" shortcut. */
  onLogin?: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => void;
  onNavigateLogin: () => void;
}

const isDev = import.meta.env.DEV;
const DEV_EMAIL = 'pbaker@smbx.ai';
const DEV_PASSWORD = 'test123';

export default function Signup({ onLogin, onGoogleLogin, onNavigateLogin }: SignupProps) {
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState('');

  const handleDevLogin = async () => {
    if (!onLogin) return;
    setDevLoading(true);
    setDevError('');
    try {
      await onLogin(DEV_EMAIL, DEV_PASSWORD);
    } catch (err: any) {
      setDevError(err.message || 'Dev login failed');
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-dvh px-5 bg-[#faf9f5]">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center mb-7">
          <Logo linked={false} height={32} />
          <p className="text-sm text-[#5e5d59] mt-2 m-0">Create your account</p>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white border border-[rgba(15,16,18,0.08)] rounded-xl text-[15px] text-[#0f1012] font-medium cursor-pointer transition-colors hover:border-[#0f1012]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {isDev && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-[rgba(15,16,18,0.08)] flex-1" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#8f8b84] font-semibold">Local dev</span>
              <div className="h-px bg-[rgba(15,16,18,0.08)] flex-1" />
            </div>

            <button
              type="button"
              onClick={handleDevLogin}
              disabled={devLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#0f1012] border border-[#0f1012] rounded-xl text-[15px] text-white font-semibold cursor-pointer transition-colors hover:bg-[#2E5C8A] disabled:opacity-60 disabled:cursor-wait"
            >
              {devLoading ? 'Signing in...' : 'Sign in as Paul'}
            </button>

            <p className="text-center text-[12px] text-[#5e5d59] mt-3 mb-0">{DEV_EMAIL}</p>
            {devError && (
              <div className="bg-[#FEF2F2] text-[#B91C1C] px-3.5 py-2.5 rounded-xl text-sm mt-3">{devError}</div>
            )}
          </>
        )}

        <p className="text-center text-[13px] text-[#5e5d59] mt-6 mb-0 leading-relaxed">
          One click. Your Google account creates your smbx.ai account — no forms, no password to manage, no verification email.
        </p>

        <p className="text-center text-sm text-[#5e5d59] mt-6 m-0">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="bg-transparent border-none text-[#D4714E] font-semibold cursor-pointer text-sm p-0"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
