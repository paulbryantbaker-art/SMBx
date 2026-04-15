/**
 * Login — Google-only sign-in.
 *
 * The email/password form was removed because it had reliability issues
 * on mobile that took too long to chase. Google auth works in every
 * environment we support, so we're funnelling all sign-ins through it.
 *
 * Props `onLogin` and `onNavigateForgot` are kept optional so the caller
 * (App.tsx) does not need to change — they're unused in this rendering.
 * If we ever re-introduce email/password, wire the form back in; the
 * backend handlers are untouched.
 */

import Logo from '../../components/public/Logo';

interface LoginProps {
  /** @deprecated email/password form removed — kept for API compatibility. */
  onLogin?: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => void;
  onNavigateSignup: () => void;
  /** @deprecated no password form → no forgot flow. Kept for API compatibility. */
  onNavigateForgot?: () => void;
  googleError?: string;
}

export default function Login({ onGoogleLogin, onNavigateSignup, googleError }: LoginProps) {
  return (
    <div className="flex justify-center items-center min-h-dvh px-5 bg-[#F9F9FC]">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center mb-7">
          <Logo linked={false} height={32} />
          <p className="text-sm text-[#6e6a63] mt-2 m-0">Sign in to your account</p>
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

        {googleError && (
          <div className="bg-[#FEF2F2] text-[#B91C1C] px-3.5 py-2.5 rounded-xl text-sm mt-3">{googleError}</div>
        )}

        <p className="text-center text-[13px] text-[#6e6a63] mt-6 mb-0 leading-relaxed">
          Your Google account is all you need. No password to remember, no separate sign-up — we create your smbx.ai account on first sign-in.
        </p>

        <p className="text-center text-sm text-[#6e6a63] mt-6 m-0">
          New to smbx.ai?{' '}
          <button
            type="button"
            onClick={onNavigateSignup}
            className="bg-transparent border-none text-[#D44A78] font-semibold cursor-pointer text-sm p-0"
          >
            Get started
          </button>
        </p>
      </div>
    </div>
  );
}
