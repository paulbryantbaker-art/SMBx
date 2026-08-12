/**
 * Practice-site chrome — CARTA RESTYLE (2026-08-07, the Claude Design handoff
 * at design_handoff_smbx_carta_restyle/; supersedes the v3/Aurora chrome).
 * Transcribed 1:1 from the reference pages, which all share this shell:
 * sticky 76px nav (logo · Why us · How it works · Industries · Research ·
 * Who it's for hover-dropdown · Free Valuation · Confidential consultation
 * outline CTA · Build your market map ink CTA) that gains its hairline +
 * shadow past 24px of scroll and never hides, and the dark mega footer
 * (brand + founder chip · FIRM · BUYERS · WHERE WE WORK · disclosures ·
 * legal row). Layout values live INLINE per the transcription doctrine;
 * carta.css carries only what inline styles cannot (hover, media, keyframes).
 *
 * Real-machinery mappings (the prototype's stand-in hrefs → live routes):
 * Industries/Research/Track record → their routes; the dropdown's five buyer
 * names → /buyers/<slug> (each name goes to ITS OWN page — the 2026-08-02
 * lesson: five labels, one destination reads as broken); Team sign in →
 * /login. The burger + slide-down menu (≤760px) stay from the previous
 * chrome — the bundle ships no mobile ("no mobile yet", Paul 2026-08-07),
 * and a phone with no nav is a regression, not a transcription.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import './practice.css';
import './carta.css';
import { trackEvent } from '../lib/analytics';
import { useSiteMeta } from './useSiteMeta';
import { BUYERS } from './lanes';

const MONO = "'IBM Plex Mono', monospace";

/** The signature frame device — four ink squares riding a card's corners
 *  (8px, or 7px on small cards — both at −4px offsets, per every small-handle
 *  site in the references). Parent must be relative. */
export function Handles({ color = '#16181A', small = false }: { color?: string; small?: boolean }) {
  const s = small ? 7 : 8;
  const o = -4;
  const base = { position: 'absolute' as const, width: s, height: s, background: color };
  return (
    <>
      <span aria-hidden="true" style={{ ...base, top: o, left: o }} />
      <span aria-hidden="true" style={{ ...base, top: o, right: o }} />
      <span aria-hidden="true" style={{ ...base, bottom: o, left: o }} />
      <span aria-hidden="true" style={{ ...base, bottom: o, right: o }} />
    </>
  );
}

/** Section kicker — the 8px green square + mono label pair every section
 *  opens with. `dark` swaps the label to the dark-band muted tone. */
export function Kicker({ children, dark = false, center = false }: { children: ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : undefined, gap: 8 }}>
      <span style={{ width: 8, height: 8, background: '#0A7A58', flex: 'none' }} />
      <span style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '0.16em', color: dark ? '#ABB2AB' : '#7C8187' }}>{children}</span>
    </div>
  );
}

/* PageCrumb DELETED 2026-08-07 — every page renders the Carta mono
   breadcrumb inline (the About grammar); the old .pd-crumb rules went with
   it so nothing revives the pre-Carta treatment by following a comment. */

/** Walk the scroll to a landing anchor as the freshly-mounted page settles
 *  (2026-08-05, Paul: "build market map does not take me to the chat bar all
 *  the way when the menu bar button is clicked from elsewhere in the site").
 *  Off the landing those links were plain `/#hash` anchors — a full reload
 *  whose one browser scroll fires while images/fonts are still expanding the
 *  layout, stranding the reader short of the target. This seeks the element
 *  once it mounts, re-asserts through the settle window, and stands down the
 *  moment the reader scrolls on their own. */
function settleToAnchor(hash: string) {
  const evs = ['wheel', 'touchstart', 'keydown'] as const;
  let stop = false;
  const cancel = () => { stop = true; evs.forEach(ev => window.removeEventListener(ev, cancel)); };
  evs.forEach(ev => window.addEventListener(ev, cancel, { passive: true }));
  // #yulia lives in the hero fold, and "take me to the chat" means the TOP of
  // the landing — H1, engine card — not the zone's edge parked under the
  // sticky nav. Every other anchor scrolls to itself.
  const yulia = hash === '#yulia';
  const el = () => (yulia ? document.body : document.getElementById(hash.slice(1)));
  const go = () => { if (yulia) window.scrollTo(0, 0); else document.getElementById(hash.slice(1))?.scrollIntoView(); };
  let tries = 0;
  const seek = () => {
    if (stop) return;
    if (el()) go(); else if (tries++ < 240) requestAnimationFrame(seek);
  };
  requestAnimationFrame(seek);
  [300, 700, 1300, 2200].forEach(d => setTimeout(() => { if (!stop) go(); }, d));
  setTimeout(cancel, 2300);
  // A #yulia ask ENGAGES the chat: YuliaIntake's listener opens the sheet on
  // phones and hands focus to the visible input on desktop.
  if (yulia) {
    setTimeout(() => { if (!stop) window.dispatchEvent(new Event('smbx:open-intake')); }, 500);
  }
}

/** The Who-it's-for hover dropdown (desktop): five buyer links + the owners
 *  promo card, transcribed from the reference nav. */
function WhoMenu({ anchor }: { anchor: (hash: string) => string }) {
  const [open, setOpen] = useState(false);
  const buyers = BUYERS;
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a href={anchor('#who')} className="ca-h-green" style={{ color: '#16181A', padding: '6px 0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Who it's for <span style={{ fontSize: 10, color: '#7C8187' }}>▾</span>
      </a>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: -24, paddingTop: 18, zIndex: 70 }}>
          <div style={{ width: 560, background: '#FFFFFF', border: '1px solid #E4DFD3', boxShadow: '0 24px 60px rgba(22,24,26,.10)', display: 'grid', gridTemplateColumns: '1fr 220px' }}>
            <div style={{ padding: '26px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, background: '#0A7A58' }} />
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', color: '#7C8187' }}>BUYERS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 16, fontWeight: 500 }}>
                {buyers.map(({ label, href }) => (
                  <Link key={href} href={href} className="ca-h-green" style={{ color: '#16181A' }} onClick={() => setOpen(false)}>{label}</Link>
                ))}
              </div>
            </div>
            <a href={anchor('#owners')} className="ca-h-bandmenu" style={{ display: 'block', background: '#F3F0E9', padding: '22px 20px', borderLeft: '1px solid #E4DFD3' }} onClick={() => setOpen(false)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0A7A58', color: '#FCFAF6', fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                <span style={{ width: 7, height: 7, background: '#FCFAF6', display: 'inline-block' }} />FREE VALUATION
              </span>
              <span style={{ display: 'block', marginTop: 12, fontSize: 14.5, lineHeight: 1.5, color: '#16181A', fontWeight: 500 }}>
                Get the valuation buyers are working from — free. →
              </span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticeShell({
  home = false,
  footerCompact = false,
  children,
}: {
  home?: boolean;
  /** Accepted for compatibility — the Carta references ship ONE footer, so
   *  every page now carries the full mega footer. */
  footerCompact?: boolean;
  children: ReactNode;
}) {
  void footerCompact;
  const anchor = (hash: string) => (home ? hash : `/${hash}`);

  // Keep the tab, the history entry and the canonical describing the page you
  // are actually on after an in-app navigation. First load is the server's job.
  useSiteMeta();

  const [loc, navigate] = useLocation();

  // Off the landing, every `/#hash` link — nav, mobile menu, footer, and the
  // inner pages' own CTAs — becomes an SPA navigation plus settleToAnchor,
  // instead of a full reload that races the mount (see settleToAnchor above).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="/#"], a[href="#yulia"]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank') return;
      const href = a.getAttribute('href')!;
      if (href.startsWith('/#')) {
        if (home) return; // shouldn't occur on the landing, but never double-handle
        e.preventDefault();
        const hash = href.slice(1);
        navigate(`/${hash}`);
        settleToAnchor(hash);
      } else {
        // "#yulia" ON the landing (desktop — a phone tap was already taken by
        // YuliaIntake's own listener, which preventDefaults): reset to the
        // top, where the chat is, instead of the native anchor jump that
        // parks the bar under the sticky nav.
        e.preventDefault();
        settleToAnchor('#yulia');
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [home, navigate]);

  // THE HASH DOES NOT GET TO STAY IN THE ADDRESS BAR (2026-08-08, Paul: "any
  // time I refresh the page, it scrolls to here for some reason").
  //
  // The reason: his URL was `smbx.ai/#owners`. One click on "Free Valuation"
  // or "Are you a business owner?" writes that hash, and it never leaves —
  // so every later refresh is a fresh hash navigation and the browser jumps
  // to #owners again. Standard platform behaviour, and completely opaque
  // from the reader's side: the tab still looks like the homepage.
  //
  // A first visit to a SHARED `/#owners` link still lands where it should —
  // the jump has already happened by the time this runs. All it removes is
  // the URL's memory of it, so a reload behaves like a fresh visit. 2600ms
  // waits out settleToAnchor's last re-assert at 2200; stripping earlier
  // would leave that timer re-scrolling a page whose hash is gone.
  //
  // replaceState, not navigate(): the PATH is unchanged, so wouter's location
  // stays correct and no re-render is triggered — this only edits what the
  // address bar remembers.
  // A `hashchange` listener as well as the route effect, because wouter's
  // `loc` is the PATH — clicking `#owners` on the page you are already on
  // changes the hash and nothing else, so a route-keyed effect never re-runs
  // and that is the exact case Paul hit.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const strip = () => {
      clearTimeout(t);
      if (!window.location.hash) return;
      t = setTimeout(() => {
        if (!window.location.hash) return;
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }, 2600);
    };
    strip();
    window.addEventListener('hashchange', strip);
    return () => { clearTimeout(t); window.removeEventListener('hashchange', strip); };
  }, [loc]);

  // Nav hairline + shadow once the page has scrolled 24px, AND hide-on-down /
  // show-on-up (2026-08-08, Paul: "lets add back the menu bar hiding on scroll
  // down and unhiding on scroll up"). The Carta references ship a bar that
  // never hides; this is a deliberate departure — the reading pages are long
  // and the bar was eating 76px of every screenful on the way down.
  //
  // Three rules keep it from feeling twitchy or trapping anyone:
  //   · a 6px dead zone, so sub-pixel jitter and momentum wobble don't flip it;
  //   · it never hides in the top 120px — the hero must always show its nav,
  //     and iOS rubber-band scrolling reports negative offsets up there;
  //   · it always returns when the mobile menu opens, when focus lands on
  //     something inside it (keyboard tabbing must never chase a hidden bar
  //     off-screen), and at the very bottom of the page, where overscroll can
  //     otherwise strand it hidden.
  const [navOn, setNavOn] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY;
      setNavOn(y > 24);
      const dy = y - last;
      if (Math.abs(dy) < 6) return;            // dead zone
      last = y;
      const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (y < 120 || atBottom) { setNavHidden(false); return; }
      setNavHidden(dy > 0);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Keyboard focus inside the bar always brings it back — see above.
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest('.ca-nav')) setNavHidden(false);
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // Mobile menu (≤760px). Closes on route change, Esc, scrim, or any link
  // tap; the page behind is scroll-held while it's open.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [loc]);
  /* Route changes start at the TOP of the new page (wouter preserves scroll,
     so a link tapped 3000px down the landing opened the next page 3000px
     down — which read as the link going nowhere). Hash navigations keep the
     browser's own anchor behavior. */
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [loc]);
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

  // Hero entrance: data-hs elements rise in sequence (i × 130ms) on mount —
  // the reference cascade, shared by every page. Children mount before the
  // shell's effects run, so the DOM is complete here.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ease = 'cubic-bezier(.2,.7,.3,1)';
    const hs = Array.from(document.querySelectorAll<HTMLElement>('[data-hs]'));
    hs.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(26px)'; });

    // THE TRANSFORM MUST BE REMOVED, NOT LANDED ON translateY(0) — this is a
    // renders-not-errors trap that cost the phone its intake (found 2026-08-08
    // while building the mobile layer; the defect shipped with the Carta
    // transcription). A transformed element becomes the CONTAINING BLOCK for
    // any `position: fixed` descendant, and an IDENTITY transform counts: the
    // box still exists, so the browser keeps honouring it. The hero's engine
    // card sits inside `[data-hs="1"]`, and the Acquisition Engine's phone
    // doorway opens a fixed bottom sheet — which was therefore being pinned
    // to the 350px card column instead of the viewport, measuring 350px wide
    // in a 390px screen and never reading as a sheet at all. Nothing about it
    // looks wrong in the CSS or in a static screenshot; the sheet has the
    // right rules and the wrong containing block.
    const done = new WeakSet<HTMLElement>();
    const settle = (el: HTMLElement) => {
      if (done.has(el)) return;
      done.add(el);
      el.style.transition = '';
      el.style.transform = '';
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform') return;
      const el = e.target as HTMLElement;
      if (el.hasAttribute('data-hs')) settle(el);
    };
    document.addEventListener('transitionend', onEnd);

    const t = setTimeout(() => hs.forEach(el => {
      const i = parseInt(el.getAttribute('data-hs') || '0', 10) || 0;
      el.style.transition = `opacity .85s ${ease} ${i * 130}ms, transform .85s ${ease} ${i * 130}ms`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }), 80);

    // Belt and braces: transitionend never fires on a tab that was hidden for
    // the whole animation, and a permanently-trapped sheet is a worse failure
    // than a cascade that ends a frame early. The longest run is the last
    // index's delay plus the 850ms duration.
    const sweep = setTimeout(() => hs.forEach(settle), 80 + hs.length * 130 + 900);

    return () => {
      clearTimeout(t);
      clearTimeout(sweep);
      document.removeEventListener('transitionend', onEnd);
    };
  }, [loc]);

  // Parallax drift for the decorative dot fields (data-plx). The base is the
  // element's UNTRANSLATED document-space anchor, cached once per element.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bases = new WeakMap<HTMLElement, number>();
    const onScroll = () => {
      document.querySelectorAll<HTMLElement>('[data-plx]').forEach(el => {
        const f = parseFloat(el.getAttribute('data-plx') || '0') || 0;
        if (!bases.has(el)) {
          const r = el.getBoundingClientRect();
          bases.set(el, r.top + window.scrollY + r.height / 2);
        }
        const mid = bases.get(el)! - window.scrollY - window.innerHeight / 2;
        el.style.translate = `0 ${(mid * f * -1).toFixed(1)}px`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal: elements already at or above the viewport reveal
  // immediately (a deep-link or restored scroll must never leave opacity-0
  // holes), the rest reveal via the observer — and a MutationObserver
  // re-scans, because re-rendered/replaced nodes lose rv-in and were never
  // re-observed. Reduced-motion users get everything visible via the CSS guard.
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          // REVEALS REPLAY (2026-08-09, Paul: "all animation and scroll reveal
          // mechanics should always work every time the page is rescrolled or
          // navigated back to"). The observer used to `unobserve` on first
          // intersect and the class was never removed, so a section animated
          // exactly once per page load — scroll back up and down and it was
          // already there, and a wouter route change that reuses a node kept
          // its `rv-in` too. Keeping the element observed and DROPPING the
          // class once it is fully clear of the viewport re-arms it, so the
          // brick wall and the card cascades play every time they are come
          // back to.
          if (e.isIntersecting) e.target.classList.add('rv-in');
          else if (e.boundingClientRect.top > window.innerHeight) e.target.classList.remove('rv-in');
        }
      },
      // rootMargin, NOT a ratio threshold (2026-08-08). `threshold: 0.12`
      // made the trigger point depend on the element's own height: a short
      // chip row revealed after 12px crossed the fold while a tall band
      // needed ~240px, so identical-looking sections fired at visibly
      // different moments down the page. A bottom inset fires every element
      // when its TOP edge crosses the same line (88% of the viewport),
      // whatever its height — which is what makes the cascade feel authored
      // rather than random.
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );
    // Everything is observed, always — including what is already on screen,
    // which is what lets it re-arm later. Only elements at or above the fold
    // on arrival are marked immediately, so a deep link or a restored scroll
    // never lands on opacity-0 holes.
    const scan = () => document.querySelectorAll<HTMLElement>('[data-rv], [data-rvimg]').forEach(el => {
      io.observe(el);
      if (!el.classList.contains('rv-in') && el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('rv-in');
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
  //    (the nav) stick to the TOP OF BODY — which itself scrolls up inside
  //    html — instead of the viewport, and the sticky nav scrolls off screen.
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

  const navLink = { color: '#16181A', padding: '6px 0' } as const;
  /* The current page's nav link wears the reference's active treatment —
     green with a 2px green underline and aria-current (the Industries and
     Research references both mark themselves this way). */
  const navOnStyle = { color: '#0A7A58', padding: '6px 0', borderBottom: '2px solid #0A7A58' } as const;
  const onIndustries = loc === '/industries';
  const onResearch = loc.startsWith('/research') || loc.startsWith('/reports');
  const onTrackRecord = loc === '/track-record';
  const onAbout = loc === '/about';

  /* #cta resolves to the page's OWN CTA section where one exists (About,
     the Research index, and every report detail page end on a local #cta
     band), and to the landing's otherwise. */
  const hasLocalCta = onAbout || onResearch;
  const ctaHref = home || hasLocalCta ? '#cta' : '/#cta';

  /* The footer varies per page in the references: Industries and Research
     run COMPACT (short brand blurb, no BUYERS column, a six-link FIRM set),
     Track Record drops its own self-link, and the two pages that close on a
     dark band (Research, Track Record) put a #2A2E29 hairline atop the
     footer so the blocks don't run together. */
  const footCompact = onIndustries || onResearch;
  const footSeam = onResearch || onTrackRecord;

  return (
    <div className="pd" style={{ background: '#FCFAF6' }}>
      <header className={`ca-nav${navOn || menuOpen ? ' on' : ''}${navHidden && !menuOpen ? ' up' : ''}`}>
        <div data-nav-inner style={{ maxWidth: 1360, margin: '0 auto', padding: '0 clamp(20px, 4vw, 32px)', height: 76, display: 'flex', alignItems: 'center', gap: 36, minWidth: 0 }}>
          {/* SPA Link, not a plain anchor: a full reload from down-page races
              the browser's scroll restoration against the still-mounting page
              and strands the user a screen below the top. Same-path clicks
              (already home) never re-fire the router, so handle them here. */}
          <Link
            href="/"
            aria-label="smbX.ai home"
            data-nav-logo
            style={{ display: 'flex', alignItems: 'center', flex: 'none' }}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                if (window.location.hash) history.replaceState(null, '', '/');
                window.scrollTo(0, 0);
                [120, 350, 800, 1500, 2400].forEach(d => setTimeout(() => window.scrollTo(0, 0), d));
              }
            }}
          >
            {/* 38px, up from the reference's 30 via 34 (Paul, 2026-08-08:
                "maybe a little small", then "yes bigger logo" after seeing 34
                — his call, over my recommendation of 34, which is recorded
                here rather than argued).
                Vertical centring was measured exact before any of this and is
                unchanged by size — box centred in the 76px bar, the burger's
                centre agreeing to 0.1px — so size was always the real finding.
                38 leaves 19px of clearance top and bottom; the BAR is now the
                constraint, not the artwork, so anything beyond ~42 wants the
                76px nav to grow with it. */}
            <img src="/logo-green-x.png" alt="smbX.ai" width={1584} height={396} style={{ height: 38, width: 'auto', display: 'block' }} />
          </Link>
          <nav data-nav-links aria-label="Site" style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 15.5, fontWeight: 500, whiteSpace: 'nowrap', minWidth: 0 }}>
            <a href={anchor('#why')} className="ca-h-green" style={navLink}>Why us</a>
            <a href={anchor('#how')} className="ca-h-green" style={navLink}>How it works</a>
            <Link href="/industries" className="ca-h-green" style={onIndustries ? navOnStyle : navLink} aria-current={onIndustries ? 'page' : undefined}>Industries</Link>
            <Link href="/research" className="ca-h-green" style={onResearch ? navOnStyle : navLink} aria-current={onResearch ? 'page' : undefined}>Research</Link>
            {/* The hover dropdown belongs to the LANDING nav only — the four
                inner references render a plain link with no caret. On a
                /buyers/* page the link wears the active treatment: it is the
                segment pages' parent in the IA, and a fully dark nav there
                read as "you are nowhere". */}
            {home ? (
              <WhoMenu anchor={anchor} />
            ) : (
              <a href="/#who" className="ca-h-green" style={loc.startsWith('/buyers/') ? navOnStyle : navLink} aria-current={loc.startsWith('/buyers/') ? 'page' : undefined}>Who it's for</a>
            )}
            <a href={anchor('#owners')} className="ca-h-green" style={navLink}>Free Valuation</a>
          </nav>
          <div data-nav-ctas style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, flex: 'none', whiteSpace: 'nowrap' }}>
            <a
              data-nav-quiet
              href={ctaHref}
              className="ca-h-band"
              style={{ fontSize: 15.5, fontWeight: 500, color: '#16181A', padding: '11px 18px', border: '1.5px solid #16181A', borderRadius: 10, background: 'transparent', whiteSpace: 'nowrap' }}
              onClick={() => trackEvent('practice_booking_clicked', { placement: 'nav' })}
            >
              Confidential consultation
            </a>
            <a
              href={anchor('#yulia')}
              className="ca-h-greenbg"
              style={{ fontSize: 15.5, fontWeight: 600, color: '#FCFAF6', background: '#16181A', padding: '12.5px 20px', borderRadius: 10, whiteSpace: 'nowrap' }}
              onClick={() => trackEvent('practice_cta_clicked', { placement: 'nav-yulia' })}
            >
              Build your market map
            </a>
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
        <a href={anchor('#owners')} onClick={closeMenu}>Free Valuation <span className="arr" aria-hidden>→</span></a>
        <a
          className="pd-mmenu-cta"
          href={anchor('#yulia')}
          onClick={() => { closeMenu(); trackEvent('practice_cta_clicked', { placement: 'mobile-menu' }); }}
        >
          Build your market map
        </a>
        <a className="quiet" href={ctaHref} onClick={() => { closeMenu(); trackEvent('practice_booking_clicked', { placement: 'mobile-menu' }); }}>Confidential consultation</a>
      </nav>

      {children}

      {/* ══ MEGA FOOTER — transcribed from the references, which VARY it per
             page: Industries/Research run compact (short blurb, no BUYERS,
             six-link FIRM), Track Record drops its self-link, and the pages
             that close on a dark band carry a hairline seam up top. ══ */}
      <footer className="ca-dark" style={{ background: '#1A1B19', color: '#F4F5F1', padding: 'clamp(56px, 7vw, 88px) clamp(20px, 4vw, 32px) 40px', borderTop: footSeam ? '1px solid #2A2E29' : undefined }}>
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 44 }}>
            <div>
              <img src="/logo-green-x-dark.png" alt="smbX.ai" width={1584} height={396} loading="lazy" style={{ height: 36, width: 'auto', display: 'block' }} />
              <p style={{ margin: '18px 0 0', fontSize: 14.5, lineHeight: 1.65, color: '#ABB2AB', maxWidth: '22em' }}>
                {footCompact
                  ? 'Buy-side corporate development for acquirers in the lower middle market.'
                  : "Buy-side corporate development for acquirers in the lower middle market. A senior operator and a full team's output, exclusively on your side of the table."}
              </p>
              <div style={{ marginTop: 26, display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src="/founder-portrait.jpg" alt="Paul Baker" loading="lazy" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 18%', border: '2px solid #A8F0CE' }} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#F4F5F1' }}>Paul Baker</div>
                  <div style={{ fontSize: 12.5, color: '#ABB2AB' }}>Founder · two decades on the buy side</div>
                  {/* On About the reference sends "Meet Paul" to the page's
                      own CTA — you're already meeting him. */}
                  {onAbout
                    ? <a href="#cta" className="ca-h-tint" style={{ fontSize: 13, color: '#A8F0CE' }}>Meet Paul →</a>
                    : <Link href="/about" className="ca-h-tint" style={{ fontSize: 13, color: '#A8F0CE' }}>Meet Paul →</Link>}
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2A2E29', paddingBottom: 12 }}>
                <span style={{ width: 7, height: 7, background: '#0A7A58' }} />
                <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.16em', color: '#ABB2AB' }}>FIRM</span>
              </div>
              <div className="ca-foot-col" style={{ marginTop: 16 }}>
                {!footCompact && <a href={anchor('#why')}>Why us</a>}
                <a href={anchor('#how')}>How it works</a>
                <a href={anchor('#pricing')}>Pricing</a>
                <a href={anchor('#sample')}>Sample read</a>
                <Link href="/research">Research</Link>
                {!footCompact && !onTrackRecord && <Link href="/track-record">Track record</Link>}
                <a href={ctaHref}>Confidential consultation</a>
                <a href="/login">Team sign in</a>
              </div>
            </div>
            {!footCompact && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2A2E29', paddingBottom: 12 }}>
                <span style={{ width: 7, height: 7, background: '#0A7A58' }} />
                <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.16em', color: '#ABB2AB' }}>BUYERS</span>
              </div>
              {/* Each name goes to ITS OWN page — the segment pages are routed
                  and richer than any landing panel (2026-08-02 law). */}
              <div className="ca-foot-col" style={{ marginTop: 16 }}>
                <Link href="/buyers/family-offices">Family offices</Link>
                <Link href="/buyers/independent-sponsors">Independent sponsors</Link>
                <Link href="/buyers/searchers">Search funds</Link>
                <Link href="/buyers/operators">Operators &amp; strategics</Link>
                <Link href="/buyers/pe-firms">PE firms</Link>
              </div>
            </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2A2E29', paddingBottom: 12 }}>
                <span style={{ width: 7, height: 7, background: '#0A7A58' }} />
                <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.16em', color: '#ABB2AB' }}>WHERE WE WORK</span>
              </div>
              <p style={{ margin: '16px 0 0', fontSize: 14.5, lineHeight: 1.65, color: '#D7DBD2' }}>
                Nationwide, from Dallas–Fort Worth, Texas.
              </p>
            </div>
          </div>
          <div id="disclosures" style={{ marginTop: 64, borderTop: '1px solid #2A2E29', paddingTop: 26, fontSize: 12.5, lineHeight: 1.7, color: '#8A9088', maxWidth: '76em' }}>
            smbx.ai advises buyers only. We work exclusively on acquisitions of privately held
            companies with under $250M in annual revenue, and we do not represent sellers or act
            for both sides of a transaction. smbx.ai is not a registered broker-dealer or
            investment adviser, does not offer securities, does not take custody of client funds,
            and does not provide legal, tax, or accounting advice — we coordinate the licensed
            specialists your deal requires. Nothing here is an offer to buy or sell any security.
          </div>
          <div style={{ marginTop: 22, fontSize: 13, color: '#8A9088', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>© 2026 smbx.ai. Buy-side only, by design.</span><span>·</span>
            <a href="/legal/terms" className="ca-h-mint" style={{ color: '#ABB2AB' }}>Terms</a><span>·</span>
            <a href="/legal/privacy" className="ca-h-mint" style={{ color: '#ABB2AB' }}>Privacy</a><span>·</span>
            <a href="#disclosures" className="ca-h-mint" style={{ color: '#ABB2AB' }}>Disclosures</a><span>·</span>
            <a href="/login" className="ca-h-mint" style={{ color: '#ABB2AB' }}>Sign in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
