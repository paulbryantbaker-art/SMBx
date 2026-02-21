import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const NAV_LINKS = [
  { href: '/sell', label: 'Sell' },
  { href: '/buy', label: 'Buy' },
  { href: '/raise', label: 'Raise' },
  { href: '/pricing', label: 'Pricing' },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold text-terra no-underline"
          style={{ fontFamily: 'ui-serif, Georgia, serif' }}
        >
          smbx.ai
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm no-underline transition-colors ${
                location === l.href
                  ? 'text-terra font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary no-underline transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-terra text-white px-4 py-1.5 rounded-lg hover:bg-terra-hover no-underline transition-colors"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-text-primary bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="md:hidden border-t border-border bg-white px-6 py-4 space-y-3">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-text-secondary hover:text-text-primary no-underline"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block text-sm text-text-secondary hover:text-text-primary no-underline"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="block text-sm bg-terra text-white px-4 py-2 rounded-lg text-center no-underline"
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
