/**
 * Shared editorial primitives for the smbx · The Edition canvases.
 *
 *   Eyebrow            — mono kicker (terra dot optional)
 *   EditorialHeadline  — Sora 800 + <em> rendered as Instrument Serif italic
 *   SpineLine          — Roman numeral page-break with terra italic phrase
 *   HairlineRule       — single-pixel rule (warm variant available)
 *   useEditionScroll   — IntersectionObserver-based reveal hook
 *
 * All are scoped to the `.smbx-edition` wrapper and lift CD's tokens
 * directly. Ported from `new claude design/source/variant-a.jsx` and
 * the README handoff (file map at top of repo `CLAUDE.md`).
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/* ───────────────────────────── Eyebrow ───────────────────────────── */

interface EyebrowProps {
  children: ReactNode;
  terra?: boolean;
  withDot?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function Eyebrow({ children, terra = false, withDot = false, style, className }: EyebrowProps) {
  return (
    <div
      className={`eyebrow${className ? ' ' + className : ''}`}
      style={{
        color: terra ? 'var(--terra)' : 'var(--ink-tertiary)',
        fontWeight: terra ? 600 : 500,
        ...style,
      }}
    >
      {withDot ? <span style={{ marginRight: 6 }}>●</span> : null}
      {children}
    </div>
  );
}

/* ────────────────────────── EditorialHeadline ────────────────────────
   Renders a Sora 800 headline with any <em> wrapped in Instrument
   Serif italic. Terra word/phrase optional. Supports manual <br/>
   inside the children for multi-line composition. */

interface EditorialHeadlineProps {
  children: ReactNode;
  size?: 'cover' | 'page' | 'section' | 'tight';
  color?: string;
  style?: CSSProperties;
  as?: 'h1' | 'h2' | 'h3';
}

const HEADLINE_SIZES: Record<NonNullable<EditorialHeadlineProps['size']>, CSSProperties> = {
  cover:   { fontSize: 'clamp(80px, 10vw, 168px)', lineHeight: 0.88, letterSpacing: '-0.044em' },
  page:    { fontSize: 'clamp(64px, 8.4vw, 144px)', lineHeight: 0.92, letterSpacing: '-0.042em' },
  section: { fontSize: 'clamp(48px, 5.6vw, 80px)',  lineHeight: 0.98, letterSpacing: '-0.034em' },
  tight:   { fontSize: 'clamp(36px, 4.4vw, 56px)',  lineHeight: 1.04, letterSpacing: '-0.028em' },
};

export function EditorialHeadline({
  children, size = 'page', color = 'var(--ink-primary)', style, as = 'h2',
}: EditorialHeadlineProps) {
  const Tag = as;
  return (
    <Tag
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        margin: 0,
        textWrap: 'balance',
        maxWidth: 1500,
        color,
        ...HEADLINE_SIZES[size],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/** Helper: render a fragment of editorial italic inside Sora text. */
export function Italic({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-editorial)',
        fontStyle: 'italic',
        fontWeight: 400,
        color,
      }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────── SpineLine ─────────────────────────────
   Big Roman numeral + sentence broken across display + italic serif.
   `dark` variant flips to canvas-night with terra-on-dark. */

interface SpineLineProps {
  n: string;          // 'I', 'II', 'III'
  first: string;      // first half (Sora)
  rest: string;       // second half (Instrument Serif italic)
  dark?: boolean;
}

export function SpineLine({ n, first, rest, dark = false }: SpineLineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // The spine numeral scales as the section moves through the viewport.
  // useSectionProgress writes --spine-progress on the section element; CSS
  // in index.css reads it and computes a scale curve peaking at 1.18 when
  // the section is centered. Cinematic title-card feel.
  useSectionProgress(sectionRef, sectionRef, '--spine-progress');
  return (
    <section
      ref={sectionRef}
      data-spine
      style={{
        padding: '88px clamp(36px, 4.5vw, 72px)',
        background: dark ? 'var(--canvas-night)' : 'var(--canvas-warm)',
        color: dark ? 'var(--ink-inverse)' : 'var(--ink-primary)',
        borderTop: dark ? 'none' : '1.5px solid var(--ink-primary)',
        borderBottom: dark ? 'none' : '1.5px solid var(--ink-primary)',
      }}
      data-edition-fade
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, marginBottom: 32 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            fontWeight: 600,
            color: dark ? 'rgba(244,238,227,0.55)' : 'var(--ink-tertiary)',
          }}
        >
          ROMAN {n}
        </span>
        <span style={{ flex: 1, height: 1, background: dark ? 'rgba(244,238,227,0.18)' : 'var(--rule)' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: dark ? 'rgba(244,238,227,0.5)' : 'var(--ink-tertiary)',
          }}
        >
          A POSITION
        </span>
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(64px, 8vw, 132px)',
          lineHeight: 0.92,
          letterSpacing: '-0.044em',
          margin: 0,
          textWrap: 'balance',
        }}
      >
        {first}{' '}
        <Italic color={dark ? 'var(--ink-inverse)' : 'var(--ink-primary)'}>{rest}</Italic>
      </h2>
    </section>
  );
}

/* ─────────────────────────── HairlineRule ─────────────────────────── */

export function HairlineRule({ warm = false, style }: { warm?: boolean; style?: CSSProperties }) {
  return <hr className={warm ? 'hairline-warm' : 'hairline'} style={style} />;
}

/* ─────────────────────────── Scroll hook ───────────────────────────
   Single IntersectionObserver per consumer. Watches every
   `[data-edition-fade]` and `[data-strike]` element under the root
   and adds `.is-visible` on first intersection — once-per-element.
   Honors prefers-reduced-motion at the CSS layer. */

export function useEditionScroll(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const targets = root.querySelectorAll<HTMLElement>('[data-edition-fade], [data-strike]');
    const reveal = (el: HTMLElement) => el.classList.add('is-visible');

    // Above-the-fold elements should NOT animate in — show them at rest.
    // Tightened to 0.8× viewport (from 1.0×) so cards that sit at the
    // very bottom of the fold don't flicker — they get observed instead.
    const aboveFold = window.innerHeight * 0.8;
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < aboveFold) reveal(el);
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    targets.forEach((t) => {
      if (!t.classList.contains('is-visible')) io.observe(t);
    });

    return () => io.disconnect();
  }, [rootRef]);
}

/* ─────────────────────────── prefers-reduced-motion ─────────────────────────── */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─────────────────────────── useInViewOnce ───────────────────────────
   Returns true once the element first intersects the viewport. Used to
   trigger one-shot animations (typewriter, count-up, arc-draw). */

export function useInViewOnce<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.15,
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, inView, rootMargin, threshold]);

  return inView;
}

/* ─────────────────────────── useTypewriter ───────────────────────────
   Glyph-by-glyph reveal of `text`. `start=false` keeps the empty state
   so callers can gate on viewport entry. `speed` is ms per character.
   Returns the currently-typed substring + a `done` flag. Honors
   prefers-reduced-motion (skips straight to full text). */

export function useTypewriter(
  text: string,
  speed = 24,
  start = true,
): { typed: string; done: boolean } {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) {
      setTyped('');
      setDone(false);
      return;
    }
    if (prefersReducedMotion()) {
      setTyped(text);
      setDone(true);
      return;
    }
    setTyped('');
    setDone(false);
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      window.setTimeout(tick, speed);
    };
    const id = window.setTimeout(tick, speed);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [text, speed, start]);

  return { typed, done };
}

/* ─────────────────────────── useChatTypewriter ──────────────────────
   Sequentially types out a script of [role, text] pairs with a per-role
   speed and a between-line gap. Returns the index of the line currently
   typing, the typed text for that line, and which lines are fully done.
   Skips to fully-rendered when reduced motion is on. */

export function useChatTypewriter(
  lines: ReadonlyArray<readonly ['user' | 'yulia', string]>,
  start: boolean,
  opts: { userSpeed?: number; yuliaSpeed?: number; gap?: number } = {},
): { activeIndex: number; activeTyped: string; activeDone: boolean } {
  const { userSpeed = 24, yuliaSpeed = 18, gap = 600 } = opts;
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTyped, setActiveTyped] = useState('');
  const [activeDone, setActiveDone] = useState(false);

  useEffect(() => {
    if (!start) {
      setActiveIndex(0);
      setActiveTyped('');
      setActiveDone(false);
      return;
    }
    if (prefersReducedMotion()) {
      setActiveIndex(lines.length - 1);
      setActiveTyped(lines.length ? lines[lines.length - 1][1] : '');
      setActiveDone(true);
      return;
    }

    let cancelled = false;
    let lineIdx = 0;
    let charIdx = 0;
    const timeouts: number[] = [];

    const startLine = () => {
      if (cancelled || lineIdx >= lines.length) return;
      const [role, text] = lines[lineIdx];
      const speed = role === 'user' ? userSpeed : yuliaSpeed;
      charIdx = 0;
      setActiveIndex(lineIdx);
      setActiveTyped('');
      setActiveDone(false);
      const tick = () => {
        if (cancelled) return;
        charIdx += 1;
        setActiveTyped(text.slice(0, charIdx));
        if (charIdx >= text.length) {
          setActiveDone(true);
          lineIdx += 1;
          if (lineIdx < lines.length) {
            timeouts.push(window.setTimeout(startLine, gap));
          }
          return;
        }
        timeouts.push(window.setTimeout(tick, speed));
      };
      timeouts.push(window.setTimeout(tick, speed));
    };

    startLine();

    return () => {
      cancelled = true;
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [lines, start, userSpeed, yuliaSpeed, gap]);

  return { activeIndex, activeTyped, activeDone };
}

/* ─────────────────────────── useCountUp ───────────────────────────
   Animates a numeric value from 0 → final over `duration` ms using
   ease-out-quint. `template` is the original string (e.g. "$80–250K",
   "+71%", "1,250", "37%", "19 mo"). The hook detects the leading
   numeric portion and animates it; the suffix/range is preserved.

   For ranges like "$80–250K" or "$150–300K", both the lower and upper
   bound are animated together. Duration applies to the whole reveal. */

const RANGE_TEMPLATE = /^([+\-$]*)([\d.,]+)(\s*[–—\-]\s*)([\d.,]+)(.*)$/;
const SINGLE_TEMPLATE = /^([+\-$]*)([\d.,]+)(.*)$/;

interface ParsedTemplate {
  prefix: string;
  values: number[];
  separator?: string;
  suffix: string;
  decimals: number;
  hasComma: boolean;
}

function parseTemplate(s: string): ParsedTemplate | null {
  const range = s.match(RANGE_TEMPLATE);
  if (range) {
    const [, prefix, lo, sep, hi, suffix] = range;
    return {
      prefix,
      values: [parseFloat(lo.replace(/,/g, '')), parseFloat(hi.replace(/,/g, ''))],
      separator: sep,
      suffix,
      decimals: (lo.split('.')[1] || '').length,
      hasComma: lo.includes(',') || hi.includes(','),
    };
  }
  const single = s.match(SINGLE_TEMPLATE);
  if (single) {
    const [, prefix, n, suffix] = single;
    return {
      prefix,
      values: [parseFloat(n.replace(/,/g, ''))],
      suffix,
      decimals: (n.split('.')[1] || '').length,
      hasComma: n.includes(','),
    };
  }
  return null;
}

function formatNum(n: number, decimals: number, hasComma: boolean): string {
  if (decimals > 0) {
    return n.toFixed(decimals);
  }
  const rounded = Math.round(n);
  return hasComma ? rounded.toLocaleString('en-US') : String(rounded);
}

export function useCountUp(template: string, start: boolean, duration = 1200): string {
  const [value, setValue] = useState<string>(() => {
    const parsed = parseTemplate(template);
    if (!parsed) return template;
    // Initial paint = "0" version of the template
    const zeros = parsed.values.map(() => 0);
    return parsed.prefix
      + zeros.map((z) => formatNum(z, parsed.decimals, parsed.hasComma)).join(parsed.separator ?? '')
      + parsed.suffix;
  });

  useEffect(() => {
    if (!start) return;
    const parsed = parseTemplate(template);
    if (!parsed) {
      setValue(template);
      return;
    }
    if (prefersReducedMotion()) {
      setValue(template);
      return;
    }

    const startTs = performance.now();
    let raf = 0;
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

    const step = (now: number) => {
      const t = Math.min(1, (now - startTs) / duration);
      const eased = easeOutQuint(t);
      const out = parsed.prefix
        + parsed.values
            .map((target) => formatNum(target * eased, parsed.decimals, parsed.hasComma))
            .join(parsed.separator ?? '')
        + parsed.suffix;
      setValue(out);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [template, start, duration]);

  return value;
}

/* ─────────────────────────── useGlassOnScroll ──────────────────────
   Watches scrollY and returns an opacity 0.78 → 0.92 + a hairline-shadow
   intensity that rises as the user passes the top of `triggerRef`. Used
   on the sticky persona tab bar so it crossfades to a denser glass once
   you've scrolled past the page header. */

export function useGlassOnScroll(triggerRef: React.RefObject<HTMLElement | null>) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const compute = () => {
      const el = triggerRef.current;
      if (!el) return;
      // Past-trigger when the trigger element's bottom is above the viewport top.
      const rect = el.getBoundingClientRect();
      setPast(rect.bottom < 8);
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [triggerRef]);

  return past;
}

/* ─────────────────────────── useArcDraw ───────────────────────────
   Triggers the connecting-line draw + sequential marker pop on /journey
   "The Arc". Returns a number 0..n indicating how many milestones have
   been "passed" by the line. Caller gates animation on viewport entry. */

export function useArcDraw(count: number, start: boolean, duration = 1200): number {
  const [reached, setReached] = useState(0);

  useEffect(() => {
    if (!start) {
      setReached(0);
      return;
    }
    if (prefersReducedMotion()) {
      setReached(count);
      return;
    }
    if (count <= 0) return;
    const startTs = performance.now();
    let raf = 0;
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
    const step = (now: number) => {
      const t = Math.min(1, (now - startTs) / duration);
      const eased = easeOutQuint(t);
      setReached(Math.floor(eased * count + 0.0001 + 1)); // pop marker just after line passes
      if (t < 1) raf = requestAnimationFrame(step);
      else setReached(count);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [count, start, duration]);

  return reached;
}

/* ─────────────────────────── BlinkingCursor ─────────────────────── */

export function BlinkingCursor({ color = 'var(--terra)' }: { color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 2,
        height: '1.05em',
        background: color,
        marginLeft: 2,
        verticalAlign: 'text-bottom',
        animation: 'smbx-type-cursor 1s steps(2) infinite',
      }}
    />
  );
}

/* ─────────────────────────── useStableRef ──────────────────────────
   Ref that exposes a stable `current` to consumers that want to read
   the latest value inside a long-running effect. Needed by the chat
   typewriter cleanup so cancellation reads fresh state. */

export function useStableRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/* ─────────────────────────── useSectionProgress ─────────────────────
   Single rAF loop per consumer. Watches a section element and writes a
   CSS custom property on a target element representing how far the
   section has scrolled through the viewport.

   Progress mapping:
     section bottom hits viewport bottom = 0.0  (section just entered)
     section center crosses viewport center = 0.5
     section top hits viewport top = 1.0       (section just leaving)

   Off-screen sections write nothing — main thread is free.

   Falls back to 0 (static) if scroll-driven is disabled. Cheap: one
   bounding rect per frame. */

export function useSectionProgress(
  sectionRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  cssVar: string,
  options: { onLock?: (locked: boolean) => void } = {},
) {
  const onLockRef = useRef(options.onLock);
  onLockRef.current = options.onLock;

  useEffect(() => {
    const section = sectionRef.current;
    const target = targetRef.current;
    if (!section || !target) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let active = true;
    let lastLocked = false;

    const tick = () => {
      if (!active) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when the section's top is at viewport bottom,
      // 1 when the section's bottom is at viewport top.
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      target.style.setProperty(cssVar, p.toFixed(4));

      // Locked = fully scrolled past (rect.bottom <= 0).
      const locked = rect.bottom <= 0;
      if (locked !== lastLocked) {
        lastLocked = locked;
        onLockRef.current?.(locked);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, targetRef, cssVar]);
}

/* ─────────────────────────── useHeroProgress ────────────────────────
   Specialized version for the cover hero: maps scroll within the hero
   section to 0..1 (0 at top, 1 when scrolled out). Also tracks whether
   the hero has been fully passed, used to swap the headline into a
   fixed corner folio mark. Returns the locked state for callers that
   need to render a sibling folio. */

export function useHeroProgress(
  heroRef: React.RefObject<HTMLElement | null>,
  headlineRef: React.RefObject<HTMLElement | null>,
): boolean {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const headline = headlineRef.current;
    if (!hero || !headline) return;
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let active = true;
    let lastLocked = false;

    const tick = () => {
      if (!active) return;
      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress within the hero: 0 at start, 1 when hero is one viewport
      // scrolled past (so the shrink animation completes well before the
      // hero leaves the screen).
      const scrolled = -rect.top;
      const range = Math.max(rect.height * 0.5, vh * 0.5);
      const p = reduce ? 0 : Math.max(0, Math.min(1, scrolled / range));
      headline.style.setProperty('--hero-progress', p.toFixed(4));

      // Lock the headline into folio position once it fully shrinks.
      const shouldLock = !reduce && rect.bottom < vh * 0.2;
      if (shouldLock !== lastLocked) {
        lastLocked = shouldLock;
        if (shouldLock) headline.setAttribute('data-folio-locked', '');
        else headline.removeAttribute('data-folio-locked');
        setLocked(shouldLock);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [heroRef, headlineRef]);

  return locked;
}

/* ─────────────────────────── useRecastProgress ──────────────────────
   Specialized version for the SDE recast card. Maps scroll over the
   recast feature section to a 0..1 reveal progress. Sets `data-fully-
   revealed` on the card once progress >= 1 so the valuation pulse
   animation fires. */

export function useRecastProgress(
  sectionRef: React.RefObject<HTMLElement | null>,
  cardRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      card.style.setProperty('--recast-progress', '1');
      card.setAttribute('data-fully-revealed', '');
      return;
    }

    let raf = 0;
    let active = true;
    let lastFully = false;

    const tick = () => {
      if (!active) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Reveal completes by the time the section center crosses the
      // viewport's lower-third — feels right because the user is reading
      // along, not waiting for a deferred animation.
      const passed = vh - rect.top;
      const total = rect.height * 0.6 + vh * 0.4;
      const p = Math.max(0, Math.min(1, passed / total));
      card.style.setProperty('--recast-progress', p.toFixed(4));

      const fully = p >= 0.98;
      if (fully !== lastFully) {
        lastFully = fully;
        if (fully) card.setAttribute('data-fully-revealed', '');
        else card.removeAttribute('data-fully-revealed');
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, cardRef]);
}

/* ─────────────────────────── runViewTransition ──────────────────────
   Wraps document.startViewTransition() with a graceful fallback for
   browsers that don't support it. The callback runs the state update
   that triggers the DOM swap; the browser captures before/after and
   crossfades them automatically. Customizations come from CSS rules
   on ::view-transition-old/new(<name>) selectors. */

type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
};

export function runViewTransition(callback: () => void): void {
  if (typeof document === 'undefined') {
    callback();
    return;
  }
  const doc = document as DocumentWithVT;
  if (typeof doc.startViewTransition !== 'function') {
    callback();
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    callback();
    return;
  }
  doc.startViewTransition(callback);
}
