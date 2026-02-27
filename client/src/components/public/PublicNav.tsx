import { useState } from 'react';
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

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/sell': 'Sell',
  '/buy': 'Buy',
  '/raise': 'Raise Capital',
  '/integrate': 'Integrate',
  '/how-it-works': 'How It Works',
  '/enterprise': 'Enterprise',
  '/pricing': 'Pricing',
};

interface Props {
  chatMode?: boolean;
}

export default function PublicNav({ chatMode }: Props) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { resetToPublic, sourcePage } = useChatContext();

  // Simplified nav during chat mode
  if (chatMode) {
    const pageName = PAGE_NAMES[sourcePage] || 'site';

    return (
      <nav className="shrink-0 bg-[#FAF8F4] border-b border-[#E0DCD4]">
        <div className="flex items-center justify-center px-4 py-3 md:px-10 md:py-4">
          <Logo />
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#FAF8F4]">
      <div className="max-w-site mx-auto flex items-center justify-between px-10 py-5 max-md:px-5 max-md:py-4">
        <Logo />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium no-underline transition-colors ${
                location === l.href
                  ? 'text-[#1A1A18]'
                  : 'text-[#7A766E] hover:text-[#1A1A18]'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-sm font-medium text-[#7A766E] hover:text-[#1A1A18] no-underline transition-colors"
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E0DCD4] bg-white px-5 py-5 space-y-4">
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
