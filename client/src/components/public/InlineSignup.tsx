import { useState, type FormEvent } from 'react';
import YuliaAvatar from './YuliaAvatar';

interface Props {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onNavigateLogin: () => void;
  className?: string;
}

export default function InlineSignup({ onRegister, onNavigateLogin, className = '' }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onRegister(name, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <YuliaAvatar size={28} className="mt-0.5" />
      <div className="max-w-[380px] bg-white border border-[#E0DCD4] rounded-2xl rounded-bl-md p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[15px] font-sans text-[#1A1A18] leading-relaxed m-0 mb-4">
          Create your free account to continue. I&apos;ll keep everything from our conversation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-[#FEF2F2] text-[#B91C1C] px-3 py-2 rounded-lg text-sm">{error}</div>
          )}

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 text-[14px] border border-[#E0DCD4] rounded-lg outline-none bg-white text-[#1A1A18] focus:border-[#D4714E] font-sans"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 text-[14px] border border-[#E0DCD4] rounded-lg outline-none bg-white text-[#1A1A18] focus:border-[#D4714E] font-sans"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 text-[14px] border border-[#E0DCD4] rounded-lg outline-none bg-white text-[#1A1A18] focus:border-[#D4714E] font-sans"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#D4714E] text-white border-none rounded-full text-[14px] font-semibold cursor-pointer hover:bg-[#BE6342] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating account\u2026' : 'Create free account'}
          </button>
        </form>

        <p className="text-xs text-[#9B9891] text-center mt-3 m-0">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="bg-transparent border-none text-[#D4714E] font-semibold cursor-pointer text-xs p-0"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
