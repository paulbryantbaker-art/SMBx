import { useState, type FormEvent } from 'react';
import Logo from '../../components/public/Logo';

interface ForgotPasswordProps {
  onNavigateLogin: () => void;
}

export default function ForgotPassword({ onNavigateLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-dvh px-5 bg-[#FAFAFA]">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="text-center mb-7">
          <Logo linked={false} />
          <p className="text-sm text-[#7A766E] mt-2 m-0">
            {submitted ? 'Check your email' : 'Reset your password'}
          </p>
        </div>

        {submitted ? (
          <div>
            <p className="text-sm text-[#3D3B37] text-center leading-relaxed mb-6">
              If an account exists for <strong>{email}</strong>, we sent a password reset link.
              Check your inbox and spam folder.
            </p>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full py-3 bg-[#BA3C60] text-white border-none rounded-full text-[15px] font-semibold cursor-pointer hover:bg-[#BE6342] transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="bg-[#FEF2F2] text-[#B91C1C] px-3.5 py-2.5 rounded-xl text-sm mb-4">{error}</div>
            )}

            <label className="block text-sm font-medium text-[#0D0D0D] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-[15px] border border-[#FAFAFA] rounded-xl outline-none mb-4 bg-white text-[#0D0D0D] focus:border-[#BA3C60]"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#BA3C60] text-white border-none rounded-full text-[15px] font-semibold cursor-pointer mt-1 hover:bg-[#BE6342] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#7A766E] mt-6 m-0">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="bg-transparent border-none text-[#BA3C60] font-semibold cursor-pointer text-sm p-0"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
