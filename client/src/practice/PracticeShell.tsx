/**
 * Practice-site chrome — v3 (Claude Design handoff, 2026-07-16). Sticky nav:
 * Why us · How it works · Industries (→ /industries) · Research (→ /reports,
 * added 2026-07-29 — Paul: "I don't see a reports link"; the published
 * assessments are the practice's proof, so they belong in the chrome, not
 * only in the footer) · Who it's for, with
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
import { useSiteMeta } from './useSiteMeta';

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

/* THE STICKY CTA IS GONE (2026-08-01, Paul: "ok let's rethink it").
   It was a fixed pill, bottom-right, armed past 0.9 viewport heights, asking
   "Build your market map". Retired on the numbers rather than on taste: the
   landing already carries NINE in-page conversion points on a phone — Book a
   call, Build your market map, Confidential consultation, Bring us your idea,
   Run yours, two more at the close, Pick a time — and the LARGEST gap between
   any two of them is 4.1 screens on a 21.3-screen page. The persistent ask it
   existed to provide already existed.

   It was also costing three things for that duplication: it overlapped body
   text wherever it sat, it is a fixed COLOURED element at the viewport edge —
   which CLAUDE.md rule 5 bans because Safari samples that strip to tint its
   toolbar, and which correlated exactly with the grey bottom bar Paul
   photographed — and it was one more thing on a surface whose whole current
   direction is calm.

   The scroll-away nav is the better home for a persistent ask anyway: it
   returns the instant you pull up, and it lives in the chrome rather than on
   top of the reading. If a floating ask is ever wanted again, it is in git
   history at 86fb98f — but read the numbers above first. */

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

  // Keep the tab, the history entry and the canonical describing the page you
  // are actually on after an in-app navigation. First load is the server's job.
  useSiteMeta();

  // Highlight the nav item for where the current page lives (Industries page;
  // segment pages still sit under Who it's for).
  const [loc] = useLocation();
  const onSegment = loc.startsWith('/buyers/');
  const onIndustries = loc === '/industries';
  // /reports still reaches the SPA on an in-app navigation before the
  // client redirect fires, so the nav stays lit for both spellings.
  const onReports = loc.startsWith('/research') || loc.startsWith('/reports');

  // The bar HIDES on the way down and comes back on the way up (Paul,
  // 2026-07-31: "on scroll down let's just scroll the header up out of the way
  // completely and let the content bleed full page, and then immediately on
  // scroll up we bring the full header back").
  //
  // It slides out rather than shrinking. The condensed state that used to live
  // here is gone with it: condensing existed to reclaim height from a bar that
  // was permanently on screen, and a bar that is simply absent while you read
  // has no height to reclaim. Two size transitions firing on every direction
  // flip would also read as fidget.
  //
  // The 4px dead zone is load-bearing, not a nicety: iOS rubber-banding and
  // momentum emit a stream of sub-pixel scroll events, including sign flips at
  // the end of a fling, so a naive `y > last` would flap the header several
  // times a second at the bottom of a long report.
  //
  // `navSolid` FILLS the bar, and it shares the 80px threshold on purpose so
  // there is only ever one flip (Paul: "shouldn't the nav bar just be
  // transparent, and the hero colour fade up and match, so it doesn't matter
  // that the nav bar covers it part of the time?").
  //
  // Exactly right, and it splits cleanly along the threshold that already
  // exists. AT THE TOP there is nothing behind the bar, so it can be
  // transparent and simply show the page's own wash — one source of the
  // gradient, matched by construction rather than by a duplicate kept in sync.
  // ONCE SCROLLED it is an overlay with body text passing under it, so it must
  // be opaque — and it no longer needs to match anything, because covering the
  // page is the job at that point.
  //
  // That deletes the copy of the wash the bar used to carry. Two of the seams
  // in this sequence came from that copy drifting from the original; the fix
  // for a duplicate that keeps going stale is not a better sync rule, it is
  // not having the duplicate.
  const [navAway, setNavAway] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const apply = (y: number, dir: number) => {
      // Never hide while the bar is still its own height from the top — it
      // would vanish before you had scrolled past it, which reads as a glitch
      // rather than as getting out of the way.
      if (y <= 80) { setNavAway(false); setNavSolid(false); return; }
      setNavSolid(true);
      // dir === 0 is the mount case (restored scroll position, anchor load).
      // Treated as "up", so a deep link never lands on a missing header.
      setNavAway(dir > 0);
    };
    apply(last, 0);
    const onScroll = () => {
      const y = window.scrollY;
      const d = y - last;
      if (Math.abs(d) < 4) return;
      last = y;
      apply(y, d);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu (Paul, 2026-07-16: "there is no nav hamburger on mobile").
  // Closes on route change, Esc, scrim, or any link tap; the page behind is
  // scroll-held while it's open (restored to the shell's 'auto').
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [loc]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    const html = document.documentElement.style;
    const prev = html.overflow;
    html.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.overflow = prev || 'auto';
    };
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);

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
      {/* The settle — one viewport-tall bloom that drifts to rest and fades to
          nothing shortly after load. It ends fully transparent, so it adds no
          colour to the resting page; see `.pd-settle`. */}
      <div className="pd-settle" aria-hidden="true" />
      {/* `menuOpen` forces the fill: the mobile menu can be opened at scroll 0,
          and a transparent bar above an opaque slide-down panel reads as a
          rendering fault rather than a design. */}
      <header className={`pd-navwrap${navSolid || menuOpen ? ' solid' : ''}${navAway && !menuOpen ? ' away' : ''}`}>
        <div className="pd-nav">
          {/* SPA Link, not a plain anchor: a full reload from down-page races
              the browser's scroll restoration against the still-mounting page
              and strands the user a screen below the top. Same-path clicks
              (already home) never re-fire the router, so handle them here. */}
          <Link
            href="/"
            aria-label="smbX.ai home"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                if (window.location.hash) history.replaceState(null, '', '/');
                window.scrollTo(0, 0);
                // Re-assert through the settle window — late images/fonts can
                // nudge the page a few px off zero as the layout settles.
                [120, 350, 800, 1500, 2400].forEach(d => setTimeout(() => window.scrollTo(0, 0), d));
              }
            }}
          >
            <img src="/logo-green-x.png" alt="smbX.ai" className="pd-nav-logo" width={1584} height={396} />
          </Link>
          <nav className="pd-nav-links" aria-label="Site">
            <a href={anchor('#why')}>Why us</a>
            <a href={anchor('#how')}>How it works</a>
            <Link href="/industries" className={onIndustries ? 'pd-navon' : undefined} aria-current={onIndustries ? 'page' : undefined}>Industries</Link>
            <Link href="/research" className={onReports ? 'pd-navon' : undefined} aria-current={onReports ? 'page' : undefined}>Research</Link>
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
            <button
              type="button"
              className="pd-nav-burger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path className="b1" d="M4 6.5h16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                <path className="b2" d="M4 12h16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                <path className="b3" d="M4 17.5h16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu + scrim (CSS-hidden ≥761px). */}
      <div className={`pd-mmenu-scrim${menuOpen ? ' on' : ''}`} onClick={closeMenu} aria-hidden="true" />
      <nav className={`pd-mmenu${menuOpen ? ' open' : ''}`} aria-label="Site menu" aria-hidden={!menuOpen}>
        <a href={anchor('#why')} onClick={closeMenu}>Why us <span className="arr" aria-hidden>→</span></a>
        <a href={anchor('#how')} onClick={closeMenu}>How it works <span className="arr" aria-hidden>→</span></a>
        <Link href="/industries" onClick={closeMenu}>Industries <span className="arr" aria-hidden>→</span></Link>
        <Link href="/research" onClick={closeMenu}>Research <span className="arr" aria-hidden>→</span></Link>
        <a href={anchor('#who')} onClick={closeMenu}>Who it's for <span className="arr" aria-hidden>→</span></a>
        {/* The primary action lives here now that the phone bar has dropped
            its pill. Styled as a button rather than a seventh 21px link — it
            is the only thing in this menu that is not navigation, and as a row
            it would have been buried in the list it needs to lead. */}
        <a
          className="pd-mmenu-cta"
          href={anchor('#yulia')}
          onClick={() => { closeMenu(); trackEvent('practice_cta_clicked', { placement: 'mobile-menu' }); }}
        >
          Build your market map
        </a>
        <a className="quiet" href={anchor('#cta')} onClick={() => { closeMenu(); trackEvent('practice_booking_clicked', { placement: 'mobile-menu' }); }}>Confidential consultation</a>
      </nav>

      {children}


      <footer className="pd-footer">
        <div className="pd-footer-inner" data-rv>
          <div>
            <img src="/logo-green-x.png" alt="smbX.ai" width={1584} height={396} loading="lazy" style={{ height: 40, width: 'auto', margin: '-5px 0 0 -8px' }} />
            <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: 'var(--pd-tert)', maxWidth: 340 }}>
              {footerCompact
                ? 'Buy-side corporate development for acquirers in the lower middle market.'
                : "Buy-side corporate development for acquirers in the lower middle market. A senior operator and a full team's output, exclusively on your side of the table."}
            </div>
            <div className="pd-footer-founder">
              <img src="/founder-portrait.jpg" alt="Paul Baker" loading="lazy" />
              <div>
                <div className="fname">Paul Baker</div>
                <div className="frole">Founder · two decades on the buy side</div>
                <a className="fmeet" href="/about">Meet Paul →</a>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {footerCompact ? (
              <div className="pd-footer-col">
                <div className="h">FIRM</div>
                <a href="/#how">How it works</a>
                <a href="/#sample">Sample read</a>
                <a href="/research">Research</a>
                <a href="/#cta">Confidential consultation</a>
                <a href="/login">Team sign in</a>
              </div>
            ) : (
              <>
                <div className="pd-footer-col">
                  <div className="h">FIRM</div>
                  <a href={anchor('#why')}>Why us</a>
                  <a href={anchor('#how')}>How it works</a>
                  <a href={anchor('#sample')}>Sample read</a>
                  <a href="/research">Research</a>
                  <a href={anchor('#proof')}>Track record</a>
                  <a href={anchor('#cta')}>Confidential consultation</a>
                  <a href="/login">Team sign in</a>
                </div>
                <div className="pd-footer-col">
                  {/* Each name goes to ITS OWN page (2026-08-02). All five used
                      to point at #who — five different labels, one destination,
                      and none of them selected the buyer they named: clicking
                      "PE firms" scrolled you to the who-index showing whichever
                      panel happened to be active. The five segment pages exist,
                      are routed at /buyers/:slug and are richer than the panel;
                      they were simply never linked from here. */}
                  <div className="h">BUYERS</div>
                  <a href="/buyers/family-offices">Family offices</a>
                  <a href="/buyers/independent-sponsors">Independent sponsors</a>
                  <a href="/buyers/searchers">Search funds</a>
                  <a href="/buyers/operators">Operators &amp; strategics</a>
                  <a href="/buyers/pe-firms">PE firms</a>
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
