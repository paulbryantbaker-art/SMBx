/**
 * Practice-site chrome: sticky nav + footer (Paul's copy additions,
 * 2026-07-11). Nav: How it works · Industries · Track record · Who it's for,
 * with Confidential consultation + Build your market map. Footer carries the firm /
 * buyers / where-we-work columns, the compliance disclosure block (every
 * page, anchor #disclosures), and a quiet team sign-in. `home` pages anchor
 * within the page; subpages anchor back to the landing (`/#how` …).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import './practice.css';
import { bookHref, bookTarget } from './leads';
import { SEGMENTS } from './segmentData';
import { trackEvent } from '../lib/analytics';

/** Page locator — a breadcrumb in the site's coral label voice so a visitor
 *  landing on a subpage immediately knows where they are (Paul, 2026-07-14:
 *  "there needs to be some kind of page title on every page… so the user does
 *  not get lost"). `parent` is the section/home the page lives under (a link
 *  back); `here` is the current page. Sits at the top of the centered hero. */
export function PageCrumb({ parent, here }: { parent?: { label: string; href: string }; here: string }) {
  return (
    <nav className="pd-crumb" aria-label="Breadcrumb">
      {parent && (
        <>
          <a href={parent.href}>{parent.label}</a>
          <span className="sep" aria-hidden="true">/</span>
        </>
      )}
      <span className="here" aria-current="page">{here}</span>
    </nav>
  );
}

/** Persistent ask on the long home scroll: appears once the visitor is past
 *  the hero card, retires while the engine (#yulia) or the final CTA (#book)
 *  is on screen. Sticky CTAs carry a measured +11–25% lift on long pages. */
function StickyCta() {
  const [past, setPast] = useState(false);
  const [vis, setVis] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 1.1);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const targets = ['yulia', 'book']
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      entries => setVis(v => {
        const next = { ...v };
        for (const e of entries) next[(e.target as HTMLElement).id] = e.isIntersecting;
        return next;
      }),
      { threshold: 0.05 },
    );
    targets.forEach(el => io.observe(el));
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
  }, []);

  const on = past && !vis.yulia && !vis.book;
  return (
    <a
      className={`pd-pill-primary pd-sticky${on ? ' on' : ''}`}
      href="#yulia"
      onClick={() => trackEvent('practice_cta_clicked', { placement: 'sticky' })}
      aria-hidden={!on}
      tabIndex={on ? 0 : -1}
    >
      Build your market map →
    </a>
  );
}

export default function PracticeShell({ home = false, children }: { home?: boolean; children: ReactNode }) {
  const anchor = (hash: string) => (home ? hash : `/${hash}`);

  // Highlight the nav item for the section the current page lives under, so the
  // top bar also answers "where am I" (segment pages sit under Who it's for).
  const [loc] = useLocation();
  const onSegment = loc.startsWith('/buyers/');
  const onTrackRecord = loc === '/track-record';

  // Condense the sticky nav once the user scrolls off the top — it stays
  // visible (no scroll-back-to-top) but shrinks to reclaim ~40% of its height
  // (Paul, 2026-07-14: "creatively minimize it but keep it still visible").
  const [navMin, setNavMin] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavMin(window.scrollY > 64);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal: elements marked data-rv rise in once when they enter the
  // viewport. Reduced-motion users get everything visible via the CSS guard;
  // the observer still runs harmlessly.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-rv]'));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('rv-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -7% 0px', threshold: 0.06 },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // index.css scroll-locks html/body at ≥901px for the app workspace shells
  // (`html, body { height: 100%; overflow: hidden; }`) — without this release
  // the practice site cannot scroll on desktop at all. Two things must be
  // released carefully:
  //  • height → auto on both (leaving height:100% makes BODY a 100vh scroll
  //    container, breaking native fragment jumps, full-page capture, print).
  //  • BODY overflow must be `visible`, NOT `auto`. `overflow:auto` on body
  //    makes body a scroll container too, so `position:sticky` descendants
  //    (the nav, the sidebar cards) stick to the TOP OF BODY — which itself
  //    scrolls up inside html — instead of the viewport, and the sticky nav
  //    scrolls off screen (Paul, 2026-07-14: "it does not stay sticky").
  //    html carries the scroll (`overflow:auto`); body just flows.
  useEffect(() => {
    const html = document.documentElement.style;
    const body = document.body.style;
    const prev = {
      htmlOverflow: html.overflow, bodyOverflow: body.overflow,
      htmlHeight: html.height, bodyHeight: body.height,
      behavior: html.scrollBehavior,
    };
    html.overflow = 'auto';
    body.overflow = 'visible';
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
      {/* Full-page ambient coral wash — the Slack gradient, Safari-safe (an
          absolute negative-z layer inside the relative .pd, never a fixed
          colored div). Must stay the first child and outside any overflow
          wrapper so it spans the whole scroll. */}
      <div className="pd-ambient" aria-hidden="true" />
      <header className={`pd-navwrap${navMin ? ' min' : ''}`}>
        <div className="pd-nav">
          <a href="/" aria-label="smbX.ai home">
            <img src="/logo-coral-x.png" alt="smbX.ai" className="pd-nav-logo" />
          </a>
          <nav className="pd-nav-links" aria-label="Site">
            <a href={anchor('#how')}>How it works</a>
            <a href={anchor('#industries')}>Industries</a>
            <Link href="/track-record" className={onTrackRecord ? 'pd-navon' : undefined} aria-current={onTrackRecord ? 'page' : undefined}>Track record</Link>
            <a href={anchor('#who')} className={onSegment ? 'pd-navon' : undefined} aria-current={onSegment ? 'page' : undefined}>Who it's for</a>
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

      {home && <StickyCta />}

      <footer className="pd-footer">
        <div className="pd-footer-inner">
          <div>
            <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 40, margin: '-5px 0 0 -8px' }} />
            <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: 'var(--pd-tert)', maxWidth: 340 }}>
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
              <div style={{ color: 'var(--pd-body)', fontSize: 15, lineHeight: 1.6 }}>
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
