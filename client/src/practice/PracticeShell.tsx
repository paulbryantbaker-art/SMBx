/**
 * Practice-site chrome: sticky nav + footer (corpdevservices bundle).
 * `home` pages anchor within the page; segment pages anchor back to the
 * landing (`/#how` …). The footer carries the five segment links and a quiet
 * team sign-in — the practice app lives behind /login.
 */
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import './practice.css';
import { bookHref, bookTarget } from './leads';
import { SEGMENTS } from './segmentData';

export default function PracticeShell({ home = false, children }: { home?: boolean; children: ReactNode }) {
  const anchor = (hash: string) => (home ? hash : `/${hash}`);
  return (
    <div className="pd">
      <header className="pd-navwrap">
        <div className="pd-nav">
          <a href="/" aria-label="smbX.ai home">
            <img src="/logo-coral-x.png" alt="smbX.ai" className="pd-nav-logo" />
          </a>
          <nav className="pd-nav-links" aria-label="Site">
            <a href={anchor('#how')}>How it works</a>
            <a href={anchor('#who')}>Who it's for</a>
            <a href={anchor('#why')}>Why smbX</a>
          </nav>
          <div className="pd-nav-ctas">
            <a className="pd-pill pd-nav-book" href={home ? bookHref() : '/#book'} target={home ? bookTarget() : undefined} rel={home && bookTarget() ? 'noreferrer' : undefined}>
              Book a call
            </a>
            <a className="pd-pill-primary" href={anchor('#yulia')}>Talk to Yulia</a>
          </div>
        </div>
      </header>

      {children}

      <footer className="pd-footer">
        <div className="pd-footer-inner">
          <div>
            <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 40, margin: '-5px 0 0 -8px' }} />
            <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--pd-tert)', maxWidth: 340 }}>
              Buy-side-only corporate development. One senior operator, one AI engine, one buyer per target.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(40px, 5.5vw, 80px)' }}>
            <div className="pd-footer-col">
              <div className="h">FIRM</div>
              <a href={anchor('#how')}>How it works</a>
              <a href={anchor('#why')}>Why smbX</a>
              <a href={home ? bookHref() : '/#book'} target={home ? bookTarget() : undefined} rel={home && bookTarget() ? 'noreferrer' : undefined}>Book a call</a>
              <a href="/login">Sign in</a>
            </div>
            <div className="pd-footer-col">
              <div className="h">BUYERS</div>
              {SEGMENTS.map(s => (
                <Link key={s.slug} href={`/buyers/${s.slug}`}>{s.footerLabel}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="pd-footer-legal">
          © 2026 smbX. Buy-side only, by design.
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="/legal/terms" style={{ color: 'var(--pd-tert)' }}>Terms</a>
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="/legal/privacy" style={{ color: 'var(--pd-tert)' }}>Privacy</a>
        </div>
      </footer>
    </div>
  );
}
