/**
 * YuliaWalkthrough — scripted narration tied to scroll position.
 *
 * Renders inside the AppShell chat panel for logged-out users on the
 * three Edition canvases. Watches IntersectionObserver on
 * `[data-walkthrough-section="<key>"]` markers in the canvas and types
 * Yulia's lines into the panel as the user scrolls past each section.
 *
 *   - Each segment plays once. Scrolling backward doesn't replay.
 *   - User typing into the composer pauses the walkthrough indefinitely
 *     and hands off to real chat.
 *   - Reduced-motion: lines appear instantly without typewriter effect.
 *
 * Integration contract with AppShell:
 *   - AppShell mounts <YuliaWalkthrough script={...} ... /> in the chat
 *     rail when viewState is 'landing' AND the user is logged out.
 *   - The walkthrough renders its own conversation thread; AppShell can
 *     pass a `userInputDetected` flag that pauses playback on first key.
 *   - When the user does engage with chat, AppShell hides this and
 *     mounts the real chat thread.
 */

import { createPortal } from 'react-dom';
import {
  useCallback, useEffect, useMemo, useRef, useState,
  type CSSProperties, type ReactNode,
} from 'react';
import {
  type WalkthroughScript,
  type WalkthroughLine,
} from './walkthroughScripts';

interface Props {
  script: WalkthroughScript;
  /** When true, pause the walkthrough indefinitely (user typed into composer). */
  paused?: boolean;
  /** Click handler when user taps a Yulia message — surfaces composer focus. */
  onEngage?: () => void;
  /** Optional className for the wrapping panel (lets AppShell control sizing). */
  className?: string;
  style?: CSSProperties;
}

type ChatEntry = {
  id: number;
  role: 'yulia';
  fullText: string;
  typed: string;
  done: boolean;
};

// Typing speed — slightly slower than the Live Demo card (which uses 18ms)
// so the reader has time to catch up while reading the page.
const YULIA_SPEED_MS = 22;
const DEFAULT_PAUSE_AFTER = 1500;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function YuliaWalkthrough({ script, paused = false, onEngage, className, style }: Props) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const playedSegmentsRef = useRef<Set<string>>(new Set());
  const [activeSegmentKey, setActiveSegmentKey] = useState<string | null>(null);
  const idCounterRef = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);

  const reduce = useMemo(() => prefersReducedMotion(), []);

  // Helper: append a line to the thread and type it out.
  const typeLine = useCallback(
    (line: WalkthroughLine, segmentKey: string) =>
      new Promise<void>((resolve) => {
        idCounterRef.current += 1;
        const id = idCounterRef.current;
        const fullText = line.text;
        const entry: ChatEntry = {
          id, role: 'yulia', fullText,
          typed: reduce ? fullText : '',
          done: reduce,
        };
        setEntries((prev) => [...prev, entry]);

        if (reduce) {
          window.setTimeout(resolve, 600);
          return;
        }

        let charIdx = 0;
        let cancelled = false;
        const tick = () => {
          if (cancelled) return;
          // Bail if the script changed (paused or different segment took over)
          if (paused) return;
          charIdx += 1;
          setEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, typed: fullText.slice(0, charIdx) } : e))
          );
          if (charIdx >= fullText.length) {
            setEntries((prev) =>
              prev.map((e) => (e.id === id ? { ...e, done: true } : e))
            );
            window.setTimeout(resolve, line.pauseAfter ?? DEFAULT_PAUSE_AFTER);
            return;
          }
          window.setTimeout(tick, YULIA_SPEED_MS);
        };
        window.setTimeout(tick, YULIA_SPEED_MS);

        // Cancel on unmount via the segmentKey check — orchestrator can clear.
        return () => { cancelled = true; };
      }),
    [paused, reduce],
  );

  // Helper: play through a list of lines sequentially.
  const playSegment = useCallback(
    async (key: string, lines: WalkthroughLine[]) => {
      if (paused) return;
      if (playedSegmentsRef.current.has(key)) return;
      playedSegmentsRef.current.add(key);
      setActiveSegmentKey(key);
      for (const line of lines) {
        if (paused) break;
        await typeLine(line, key);
      }
      setActiveSegmentKey((curr) => (curr === key ? null : curr));
    },
    [paused, typeLine],
  );

  // 1. Opener — plays once on script change, before any scroll trigger.
  const scriptIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (scriptIdRef.current === script.id) return;
    scriptIdRef.current = script.id;

    // Reset state for new script
    playedSegmentsRef.current.clear();
    setEntries([]);
    setActiveSegmentKey(null);
    idCounterRef.current = 0;

    if (script.opener && script.opener.length > 0) {
      playSegment('__opener__', script.opener);
    }
  }, [script.id, script.opener, playSegment]);

  // 2. Scroll trigger — IntersectionObserver on data-walkthrough-section.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (typeof document === 'undefined') return;

    const segmentByKey = new Map(script.segments.map((s) => [s.key, s]));

    const io = new IntersectionObserver(
      (entriesIo) => {
        for (const entry of entriesIo) {
          if (!entry.isIntersecting) continue;
          const key = (entry.target as HTMLElement).dataset.walkthroughSection;
          if (!key) continue;
          const segment = segmentByKey.get(key);
          if (!segment) continue;
          playSegment(key, segment.lines);
        }
      },
      { rootMargin: '0px 0px -30% 0px', threshold: 0.1 },
    );

    // Find all section markers currently in the document.
    const targets = document.querySelectorAll<HTMLElement>('[data-walkthrough-section]');
    targets.forEach((t) => io.observe(t));

    // Re-run query on DOM mutations (route swap, persona change).
    const mo = new MutationObserver(() => {
      const fresh = document.querySelectorAll<HTMLElement>('[data-walkthrough-section]');
      fresh.forEach((t) => {
        if (!t.dataset.walkthroughObserved) {
          io.observe(t);
          t.dataset.walkthroughObserved = '1';
        }
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [script.id, script.segments, playSegment]);

  // 3. Auto-scroll the thread as new entries arrive.
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div
      className={`smbx-walkthrough ${className ?? ''}`.trim()}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // Inherits --canvas-warm + tokens via DOM cascade from parent
        // .smbx-edition. Don't add the class itself — that would trigger
        // the canvas-elevation rules and push this rail's content out
        // of its own visible area.
        background: 'transparent',
        ...style,
      }}
      onClick={onEngage}
      role="log"
      aria-live="polite"
      aria-label="Yulia is narrating"
    >
      {/* Topbar — small editorial header */}
      <header
        style={{
          flexShrink: 0,
          padding: '14px 18px 12px',
          borderBottom: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 16, letterSpacing: '-0.02em',
              color: 'var(--ink-primary)',
            }}
          >
            smbx<span style={{ color: 'var(--terra)' }}>.</span>
          </span>
          <span
            style={{
              fontFamily: 'var(--font-editorial)', fontStyle: 'italic',
              fontSize: 13, color: 'var(--ink-tertiary)',
            }}
          >
            with Yulia
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--terra)',
              boxShadow: activeSegmentKey ? '0 0 0 4px rgba(212,113,78,0.18)' : 'none',
              transition: 'box-shadow 200ms ease',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--ink-tertiary)',
            }}
          >
            {paused ? 'paused' : activeSegmentKey ? 'narrating' : 'live'}
          </span>
        </div>
      </header>

      {/* Thread */}
      <div
        ref={threadRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '20px 18px 12px',
          display: 'flex', flexDirection: 'column', gap: 14,
          scrollBehavior: 'smooth',
        }}
      >
        {entries.length === 0 ? (
          <EmptyHint />
        ) : (
          entries.map((entry) => <YuliaMessage key={entry.id} entry={entry} />)
        )}
      </div>

      {/* Composer hint — clicking surfaces real chat. */}
      <footer
        style={{
          flexShrink: 0,
          padding: '12px 18px 16px',
          borderTop: '1px solid var(--rule)',
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEngage?.(); }}
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid var(--rule)',
            borderRadius: 9999,
            padding: '6px 6px 6px 18px',
            minHeight: 48,
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(26,24,20,0.04), 0 8px 24px rgba(26,24,20,0.05)',
            textAlign: 'left',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--ink-quaternary)',
          }}
        >
          <span style={{ flex: 1 }}>Take over — paste a teaser, drop a P&amp;L…</span>
          <span
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--terra)', color: '#fff',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(212,113,78,0.30)',
            }}
          >↑</span>
        </button>
        <div
          style={{
            marginTop: 8, textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
          }}
        >
          Free to try · No card
        </div>
      </footer>
    </div>
  );
}

function EmptyHint() {
  return (
    <div
      style={{
        margin: 'auto', textAlign: 'center', maxWidth: 280,
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-editorial)', fontStyle: 'italic',
          fontSize: 18, color: 'var(--ink-secondary)', lineHeight: 1.4,
          marginBottom: 12,
        }}
      >
        Scroll the page —
        <br />
        I’ll narrate as you go.
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--ink-tertiary)',
        }}
      >
        Or tap below to take over.
      </div>
    </div>
  );
}

/* ─────────────────────────── Rail wrapper ──────────────────────────
   Mounts the walkthrough as a fixed-position left rail on the canvas.
   Hidden on mobile (the canvas owns the full screen there). On desktop,
   takes 30vw clamped between 360 and 480px. Overlays the existing
   AppShell chat panel until the chat-well restyle merges them. */

interface RailProps {
  script: WalkthroughScript;
  onEngage?: () => void;
}

export function YuliaWalkthroughRail({ script, onEngage }: RailProps) {
  /* The rail is portaled to document.body. AppShell wraps its main
     column in a div with `transform: translateY(...)` for keyboard
     lift on desktop — that creates a new containing block for any
     fixed-position descendant, so `position: fixed; left: 0` would
     land at the column edge rather than the viewport edge. Portaling
     to <body> sidesteps the transformed ancestor entirely. The same
     `.smbx-edition` (the active canvas) provides token inheritance
     for the AppShell-wide CSS rules, and tokens used inside the rail
     are sourced from the global stylesheet (`.smbx-edition-rail-tokens`
     re-declares them at the body scope). */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{`
        /* Tokens needed by the rail when it lives outside .smbx-edition. */
        .smbx-walkthrough-rail {
          --canvas-warm: #F4EEE3;
          --canvas-cream: #FAF6EE;
          --canvas-paper: #FFFFFF;
          --ink-primary: #1A1814;
          --ink-secondary: #3D3D3A;
          --ink-tertiary: #87867F;
          --ink-quaternary: #B5AE9F;
          --ink-inverse: #F4EEE3;
          --rule: #E8E6DC;
          --terra: #D4714E;
          --terra-on-dark: #E58761;
          --canvas-night: #16130E;
          --font-display: 'Sora', system-ui, sans-serif;
          --font-editorial: 'Instrument Serif', 'Times New Roman', Georgia, serif;
          --font-body: 'Inter', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
          font-family: var(--font-body);
          color: var(--ink-primary);
        }
        /* Mobile + small desktop: hide. The canvas owns the full screen. */
        .smbx-walkthrough-rail { display: none; }
        @media (min-width: 1024px) {
          .smbx-walkthrough-rail {
            display: block;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: clamp(360px, 30vw, 480px);
            z-index: 4;
            background: transparent;
          }
          /* Canvas lifts forward: hairline + warm shadow + rounded top-left
             corner. Single background color across the viewport — depth
             comes from the shadow, not a separate fill. The :not() guard
             keeps the rule from matching anything that briefly carries
             both classes. */
          body:has(.smbx-walkthrough-rail) .smbx-edition {
            margin-left: clamp(360px, 30vw, 480px);
            border-top-left-radius: 28px;
            border-top: 1px solid var(--rule, #E8E6DC);
            border-left: 1px solid var(--rule, #E8E6DC);
            box-shadow:
              -16px 0 48px -16px rgba(26, 24, 20, 0.12),
              0 -16px 48px -16px rgba(26, 24, 20, 0.12);
            min-height: 100vh;
            position: relative;
            isolation: isolate;
          }
          /* Folio mark + locked hero headline anchor to the canvas plane,
             not the page-relative top-left, so they stay above the canvas
             content but to the right of the rail. */
          body:has(.smbx-walkthrough-rail) .smbx-edition [data-folio-mark],
          body:has(.smbx-walkthrough-rail) .smbx-edition [data-hero-headline][data-folio-locked] {
            left: calc(clamp(360px, 30vw, 480px) + clamp(36px, 4.5vw, 72px));
          }
          /* Hide the AppShell topbar's own brand mark when the rail is
             active — the rail header carries the smbx wordmark already.
             AppShell topbar's tab strip remains visible on the canvas. */
        }
      `}</style>
      {mounted && createPortal(
        <aside className="smbx-walkthrough-rail" aria-label="Yulia walkthrough">
          <YuliaWalkthrough script={script} onEngage={onEngage} />
        </aside>,
        document.body
      )}
    </>
  );
}

function YuliaMessage({ entry }: { entry: ChatEntry }): ReactNode {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div
        style={{
          flexShrink: 0,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--canvas-night, #16130E)',
          color: 'var(--terra-on-dark, #E58761)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-editorial)', fontStyle: 'italic',
          fontSize: 13, fontWeight: 500,
          marginTop: 2,
        }}
      >
        Y
      </div>
      <div
        style={{
          flex: 1,
          background: '#FFFFFF',
          border: '1px solid var(--rule)',
          borderRadius: '4px 14px 14px 14px',
          padding: '10px 14px',
          fontFamily: 'var(--font-editorial)',
          fontSize: 15,
          lineHeight: 1.5,
          color: 'var(--ink-primary)',
          boxShadow: '0 1px 2px rgba(26,24,20,0.04)',
        }}
      >
        {entry.typed}
        {!entry.done && (
          <span
            style={{
              display: 'inline-block',
              width: 1.5, height: '1em',
              background: 'var(--terra)',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'smbx-type-cursor 1s steps(2) infinite',
            }}
          />
        )}
      </div>
    </div>
  );
}
