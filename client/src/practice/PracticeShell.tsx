/**
 * Practice-site chrome — v3 (Claude Design handoff, 2026-07-16). Sticky nav:
 * Why us · How it works · Industries (→ /industries) · Who it's for, with
 * Confidential consultation (→ #cta) + Build your market map (→ #yulia).
 * Footer is the flat warm-charcoal band (#2B2A27 — deliberately NOT a third
 * textured bleed band; the CSS remaps the text vars and inverts the logo).
 * `footerCompact` renders the Industries page's shortened FIRM-only footer.
 * The legal row keeps Terms/Privacy/Disclosures as real links plus a quiet
 * team Sign in — a sanctioned deviation from the prototype (the team needs a
 * door; see practiceSite/IMPLEMENTATION_PLAN.md §4).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import './practice.css';
import { trackEvent } from '../lib/analytics';

/** Page locator — a breadcrumb in the site's coral label voice, used by the
 *  surviving inner pages (segments, about, track record). The v3 landing and
 *  Industries pages don't carry one. */
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

/** Persistent ask on the long home scroll: slides in past ~0.9 viewport
 *  heights (v3 threshold), retires while the engine (#yulia) or the booking
 *  CTA (#cta) is on screen. */
function StickyCta() {
  const [past, setPast] = useState(false);
  const [vis, setVis] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const targets = ['yulia', 'cta']
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

  const on = past && !vis.yulia && !vis.cta;
  return (
    <a
      className={`pd-pill-primary pd-sticky${on ? ' on' : ''}`}
      href="#yulia"
      onClick={() => trackEvent('practice_cta_clicked', { placement: 'sticky' })}
      aria-hidden={!on}
      tabIndex={on ? 0 : -1}
    >
      Build your market map
    </a>
  );
}

export default function PracticeShell({
  home = false,
  footerCompact = false,
  children,
}: {
  home?: boolean;
  footerCompact?: boolean;
  children: ReactNode;
}) {
  const anchor = (hash: string) => (home ? hash : `/${hash}`);

  // Highlight the nav item for where the current page lives (Industries page;
  // segment pages still sit under Who it's for).
  const [loc] = useLocation();
  const onSegment = loc.startsWith('/buyers/');
  const onIndustries = loc === '/industries';

  // Condense the sticky nav once the user scrolls off the top (v3: > 40px).
  const [navMin, setNavMin] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavMin(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal (v3 logic from the design bundle): elements already at or
  // above the viewport reveal immediately (a deep-link or restored scroll must
  // never leave opacity-0 holes), the rest reveal via the observer — and a
  // MutationObserver re-scans, because re-rendered/replaced nodes lose rv-in
  // and were never re-observed. Reduced-motion users get everything visible
  // via the CSS guard.
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('rv-in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll('[data-rv]:not(.rv-in)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('rv-in');
      else io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
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

  return (
    <div className="pd">
      {/* Full-page ambient coral wash — Safari-safe (an absolute negative-z
          layer inside the relative .pd, never a fixed colored div). Must stay
          the first child so it spans the whole scroll. */}
      <div className="pd-ambient" aria-hidden="true" />
      <header className={`pd-navwrap${navMin ? ' min' : ''}`}>
        <div className="pd-nav">
          <a href="/" aria-label="smbX.ai home">
            <img src="/logo-coral-x.png" alt="smbX.ai" className="pd-nav-logo" />
          </a>
          <nav className="pd-nav-links" aria-label="Site">
            <a href={anchor('#why')}>Why us</a>
            <a href={anchor('#how')}>How it works</a>
            <Link href="/industries" className={onIndustries ? 'pd-navon' : undefined} aria-current={onIndustries ? 'page' : undefined}>Industries</Link>
            <a href={anchor('#who')} className={onSegment ? 'pd-navon' : undefined} aria-current={onSegment ? 'page' : undefined}>Who it's for</a>
          </nav>
          <div className="pd-nav-ctas">
            <a
              className="pd-pill pd-nav-book"
              href={anchor('#cta')}
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
        <div className="pd-footer-inner" data-rv>
          <div>
            <img src="/logo-coral-x.png" alt="smbX.ai" style={{ height: 40, margin: '-5px 0 0 -8px' }} />
            <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: 'var(--pd-tert)', maxWidth: 340 }}>
              {footerCompact
                ? 'Buy-side corporate development for acquirers in the lower middle market.'
                : "Buy-side corporate development for acquirers in the lower middle market. A senior operator and a full team's output, exclusively on your side of the table."}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {footerCompact ? (
              <div className="pd-footer-col">
                <div className="h">FIRM</div>
                <a href="/#how">How it works</a>
                <a href="/#sample">Sample read</a>
                <a href="/#cta">Confidential consultation</a>
              </div>
            ) : (
              <>
                <div className="pd-footer-col">
                  <div className="h">FIRM</div>
                  <a href={anchor('#why')}>Why us</a>
                  <a href={anchor('#how')}>How it works</a>
                  <a href={anchor('#sample')}>Sample read</a>
                  <a href={anchor('#proof')}>Track record</a>
                  <a href={anchor('#cta')}>Confidential consultation</a>
                </div>
                <div className="pd-footer-col">
                  <div className="h">BUYERS</div>
                  <a href={anchor('#who')}>Family offices</a>
                  <a href={anchor('#who')}>Independent sponsors</a>
                  <a href={anchor('#who')}>Search funds</a>
                  <a href={anchor('#who')}>Operators &amp; strategics</a>
                  <a href={anchor('#who')}>PE firms</a>
                </div>
                <div className="pd-footer-col" style={{ maxWidth: 200 }}>
                  <div className="h">WHERE WE WORK</div>
                  <div style={{ color: 'var(--pd-body)', fontSize: 15, lineHeight: 1.6 }}>
                    Nationwide, from Dallas–Fort Worth, Texas.
                  </div>
                </div>
              </>
            )}
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
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="/login" style={{ color: 'var(--pd-tert)' }}>Sign in</a>
        </div>
      </footer>
    </div>
  );
}
