import { useState, type FormEvent } from 'react';
import Logo from '../../components/public/Logo';

interface ResetPasswordProps {
  token: string;
  onNavigateLogin: () => void;
}

export default function ResetPassword({ token, onNavigateLogin }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      // Store JWT and redirect
      if (data.token) {
        localStorage.setItem('smbx_token', data.token);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-dvh px-5 bg-[#F8F6F2]">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center mb-7">
          <Logo linked={false} height={32} />
          <p className="text-sm text-[#7A766E] mt-2 m-0">
            {success ? 'Password reset successful' : 'Set a new password'}
          </p>
        </div>

        {success ? (
          <div>
            <p className="text-sm text-[#3D3B37] text-center leading-relaxed mb-6">
              Your password has been updated. You're now signed in.
            </p>
            <button
              type="button"
              onClick={() => window.location.href = '/chat'}
              className="w-full py-3 bg-[#D44A78] text-white border-none rounded-full text-[15px] font-semibold cursor-pointer hover:bg-[#B03860] transition-colors"
            >
              Go to SMBx
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="bg-[#FEF2F2] text-[#B91C1C] px-3.5 py-2.5 rounded-xl text-sm mb-4">{error}</div>
            )}

            <label className="block text-sm font-medium text-[#0D0D0D] mb-1.5">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 text-[15px] border border-[#FAFAFA] rounded-xl outline-none mb-4 bg-white text-[#0D0D0D] focus:border-[#D44A78]"
              required
              minLength={8}
            />

            <label className="block text-sm font-medium text-[#0D0D0D] mb-1.5">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-3.5 py-2.5 text-[15px] border border-[#FAFAFA] rounded-xl outline-none mb-4 bg-white text-[#0D0D0D] focus:border-[#D44A78]"
              required
              minLength={8}
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#D44A78] text-white border-none rounded-full text-[15px] font-semibold cursor-pointer mt-1 hover:bg-[#B03860] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#7A766E] mt-6 m-0">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="bg-transparent border-none text-[#D44A78] font-semibold cursor-pointer text-sm p-0"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
