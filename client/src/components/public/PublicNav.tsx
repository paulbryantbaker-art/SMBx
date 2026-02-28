import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import Logo from './Logo';
import Button from './Button';
import { useChatContext } from '../../context/ChatContext';

const NAV_LINKS = [
  { href: '/sell', label: 'Sell' },
  { href: '/buy', label: 'Buy' },
  { href: '/raise', label: 'Raise Capital' },
  { href: '/pricing', label: 'Pricing' },
];

interface Props {
  chatMode?: boolean;
}

export default function PublicNav({ chatMode }: Props) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { sourcePage } = useChatContext();

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location]);

  // Chat mode — minimal centered logo pill
  if (chatMode) {
    return (
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-auto">
        <div className="pill-nav rounded-full px-6 py-3 flex items-center justify-center">
          <Logo />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="pill-nav rounded-full px-5 py-2.5 flex items-center justify-between">
        <Logo />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[13px] font-medium no-underline transition-colors ${
                location === l.href
                  ? 'text-[#1A1A18]'
                  : 'text-[#7A766E] hover:text-[#1A1A18]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[13px] font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors"
          >
            Sign in
          </Link>
          <Button variant="nav" href="/signup">Get Started</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-[#1A1A18] bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden mt-2 rounded-3xl bg-white shadow-xl border border-[#E8E4DC] px-5 py-5 space-y-4">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-[15px] font-medium text-[#4A4843] no-underline"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block text-[15px] font-medium text-[#4A4843] no-underline"
          >
            Sign in
          </Link>
          <Button variant="primary" href="/signup" fullWidth className="mt-2">
            Get Started &rarr;
          </Button>
        </div>
      )}
    </nav>
  );
}
