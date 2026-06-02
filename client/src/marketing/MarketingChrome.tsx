import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { enterApp } from './useEnterApp';

/* Yulia glyph — the half-filled circle mark used across the marketing site. */
export function YuliaGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3a9 9 0 010 18z" fill="currentColor" />
    </svg>
  );
}

export function BrandMark() {
  return <span className="brand-mark" aria-hidden="true" />;
}

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: '/buy', label: 'Buy' },
  { href: '/sell', label: 'Sell' },
  { href: '/raise', label: 'Raise' },
  { href: '/integrate', label: 'Integrate' },
  { href: '/standard', label: 'Standard' },
  { href: '/pricing', label: 'Pricing' },
];

export function MarketingNav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes (link tap navigates).
  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="smbX.ai — home">
            <img src="/GreenLogoBlkBorder.png" alt="smbX.ai" draggable={false} style={{ height: 26, width: 'auto', display: 'block' }} />
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={location.startsWith(link.href) ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="nav-right">
            <a className="nav-signin" onClick={() => { window.location.assign('/login'); }}>Sign in</a>
            <button className="btn btn-accent" onClick={() => enterApp()}>Ask Yulia</button>
            <button
              className="nav-burger"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu (CD design): page links + Ask Yulia. CSS shows it ≤900px. */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mm">
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
        ))}
        <Link href="/connectors" onClick={() => setMenuOpen(false)}>Connectors</Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <a className="mm-link" onClick={() => { setMenuOpen(false); window.location.assign('/login'); }} style={{ cursor: 'pointer' }}>Sign in</a>
        <button className="btn btn-accent btn-lg mm-cta" style={{ width: '100%' }} onClick={() => enterApp()}>
          Ask Yulia
        </button>
      </div>
    </>
  );
}

export function MarketingFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="fcols">
          <div>
            <div className="brand"><BrandMark /><span>smb<b>X</b></span></div>
            <p className="ftag">
              M&amp;A diligence software, accessed through Yulia. Computed, not advised.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><Link href="/buy">Buy</Link></li>
              <li><Link href="/sell">Sell</Link></li>
              <li><Link href="/raise">Raise</Link></li>
              <li><Link href="/integrate">Integrate</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/connectors">Connectors</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h5>The Standard</h5>
            <ul>
              <li><Link href="/standard">Methodology</Link></li>
              <li><Link href="/standard">Authorities</Link></li>
              <li><Link href="/standard">Versioning</Link></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><Link href="/legal/terms">Terms</Link></li>
              <li><Link href="/legal/privacy">Privacy</Link></li>
              <li><Link href="/about">What smbX Is / Isn't</Link></li>
            </ul>
          </div>
        </div>
        <div className="fbar">
          <p>
            smbX is software for M&amp;A diligence. It is not a broker-dealer, investment
            adviser, business broker, law firm, accounting firm, or appraiser. Every
            artifact is software-generated and is not a substitute for a licensed
            professional. © 2026 smbX.
          </p>
          <span className="fmono">DEFINITIVE.v1.0 · methodology V19</span>
        </div>
      </div>
    </footer>
  );
}
