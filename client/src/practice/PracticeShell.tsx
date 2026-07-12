/**
 * Practice-site chrome: sticky nav + footer (Paul's copy additions,
 * 2026-07-11). Nav: How it works · Industries · Track record · Who it's for,
 * with Confidential consultation + Build your market map. Footer carries the firm /
 * buyers / where-we-work columns, the compliance disclosure block (every
 * page, anchor #disclosures), and a quiet team sign-in. `home` pages anchor
 * within the page; subpages anchor back to the landing (`/#how` …).
 */
import { useEffect, type ReactNode } from 'react';
import { Link } from 'wouter';
import './practice.css';
import { bookHref, bookTarget } from './leads';
import { SEGMENTS } from './segmentData';
import { trackEvent } from '../lib/analytics';

export default function PracticeShell({ home = false, children }: { home?: boolean; children: ReactNode }) {
  const anchor = (hash: string) => (home ? hash : `/${hash}`);

  // index.css scroll-locks html/body at ≥901px for the app workspace shells
  // (`html, body { height: 100%; overflow: hidden; }`) — without this release
  // the practice site cannot scroll on desktop at all. Height must be
  // released along with overflow: leaving height:100% makes BODY the scroll
  // container (a 100vh-tall document), which breaks native fragment jumps,
  // full-page capture, and print. Same pattern the retired MarketingShell
  // used; smooth behavior covers the anchor links.
  useEffect(() => {
    const html = document.documentElement.style;
    const body = document.body.style;
    const prev = {
      htmlOverflow: html.overflow, bodyOverflow: body.overflow,
      htmlHeight: html.height, bodyHeight: body.height,
      behavior: html.scrollBehavior,
    };
    html.overflow = 'auto';
    body.overflow = 'auto';
    html.height = 'auto';
    body.height = 'auto';
    html.scrollBehavior = 'smooth';
    return () => {
      html.overflow = prev.htmlOverflow;
      body.overflow = prev.bodyOverflow;
      html.height = prev.htmlHeight;
      body.height = prev.bodyHeight;
      html.scrollBehavior = prev.behavior;
    };
  }, []);

  const consult = home ? bookHref() : '/#book';
  const consultTarget = home ? bookTarget() : undefined;

  return (
    <div className="pd">
      <header className="pd-navwrap">
        <div className="pd-nav">
          <a href="/" aria-label="smbX.ai home">
            <img src="/logo-coral-x.png" alt="smbX.ai" className="pd-nav-logo" />
          </a>
          <nav className="pd-nav-links" aria-label="Site">
            <a href={anchor('#how')}>How it works</a>
            <a href={anchor('#industries')}>Industries</a>
            <Link href="/track-record">Track record</Link>
            <a href={anchor('#who')}>Who it's for</a>
          </nav>
          <div className="pd-nav-ctas">
            <a
              className="pd-pill pd-nav-book"
              href={consult}
              target={consultTarget}
              rel={consultTarget ? 'noreferrer' : undefined}
              onClick={() => trackEvent('practice_booking_clicked', { placement: 'nav' })}
            >
              Confidential consultation
            </a>
            <a className="pd-pill-primary" href={anchor('#yulia')} onClick={() => trackEvent('practice_cta_clicked', { placement: 'nav-yulia' })}>Build your market map</a>
          </div>
        </div>
      </header>

      {children}

      <footer className="pd-footer">
        <div className="pd-footer-inner">
          <div>
            <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 40, margin: '-5px 0 0 -8px' }} />
            <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--pd-tert)', maxWidth: 340 }}>
              Buy-side corporate development for acquirers in the lower middle market. A senior
              operator and a full team's output, exclusively on your side of the table.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(32px, 4.5vw, 72px)', flexWrap: 'wrap' }}>
            <div className="pd-footer-col">
              <div className="h">FIRM</div>
              <a href={anchor('#how')}>How it works</a>
              <a href={anchor('#industries')}>Industries</a>
              <Link href="/track-record">Track record</Link>
              <Link href="/about">About</Link>
              <a href={consult} target={consultTarget} rel={consultTarget ? 'noreferrer' : undefined}>Confidential consultation</a>
              <a href="/login">Sign in</a>
            </div>
            <div className="pd-footer-col">
              <div className="h">BUYERS</div>
              {SEGMENTS.map(s => (
                <Link key={s.slug} href={`/buyers/${s.slug}`}>{s.footerLabel}</Link>
              ))}
            </div>
            <div className="pd-footer-col" style={{ maxWidth: 200 }}>
              <div className="h">WHERE WE WORK</div>
              <div style={{ color: 'var(--pd-body)', fontSize: 14.5, lineHeight: 1.6 }}>
                Nationwide, from Dallas–Fort Worth, Texas.
              </div>
            </div>
          </div>
        </div>
        <div id="disclosures" className="pd-disclosure">
          smbX advises buyers only. We work exclusively on acquisitions of privately held companies
          with under $250M in annual revenue, and we do not represent sellers or act for both sides
          of a transaction. smbX is not a registered broker-dealer or investment adviser, does not
          offer securities, does not take custody of client funds, and does not provide legal, tax,
          or accounting advice — we coordinate the licensed specialists your deal requires. Nothing
          here is an offer to buy or sell any security.
        </div>
        <div className="pd-footer-legal">
          © 2026 smbX. Buy-side only, by design.
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="/legal/terms" style={{ color: 'var(--pd-tert)' }}>Terms</a>
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="/legal/privacy" style={{ color: 'var(--pd-tert)' }}>Privacy</a>
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="#disclosures" style={{ color: 'var(--pd-tert)' }}>Disclosures</a>
        </div>
      </footer>
    </div>
  );
}
