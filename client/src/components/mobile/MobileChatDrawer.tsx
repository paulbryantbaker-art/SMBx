/**
 * MobileChatDrawer — Apple Maps + iMessage drawer (hand-rolled, simplified).
 *
 * Vaul looked promising but its persistent non-modal snap-point + dismissible=false
 * mode has rendering issues we couldn't reliably work around (CSS not exported,
 * snap-points-overlay quirks). For this exact use case — a permanently mounted
 * 3-snap drawer that lives over a Notion home — a focused hand-rolled drawer is
 * more robust than fighting a general-purpose library.
 *
 * Snap points (fractions of visualViewport height):
 *   - 0.15 (peek)   — drag handle + input pill. Background interactive.
 *   - 0.60 (active) — messages + input. Half-screen reveal.
 *   - 1.00 (full)   — chat takeover.
 *
 * What this fixes vs. the previous hand-rolled build:
 *
 *   1. visualViewport.height (NOT innerHeight). The drawer shrinks WITH the
 *      iOS soft keyboard, never extends under it.
 *
 *   2. iOS-safe body scroll lock. When at snap >= 0.6, body becomes
 *      position:fixed with top:-scrollY. Preserves scroll position on
 *      release, no overflow:hidden iOS jump-to-top, AND children with
 *      position:fixed (the drawer itself) stay correctly placed.
 *
 *   3. Drag from the full chrome (handle + header), not just the pill.
 *      Bigger hit area + reachable at full snap (safe-area-inset-top
 *      padding ensures the handle clears the iOS status bar).
 *
 *   4. Overscroll-from-top → drawer drag. Pulling DOWN on the messages
 *      list when it's already scrolled to the top drags the drawer down
 *      (the iMessage interactive-keyboard-dismiss pattern). Below the
 *      mid snap, also blurs the input so the keyboard follows.
 *
 *   5. Scroll-to-bottom on input focus. iOS auto-scrolls focused inputs
 *      into view; double-rAF then forcibly snap to scrollHeight so the
 *      latest message stays in view.
 *
 *   6. Empty-state greeting slot. Caller passes `greeting` + `isEmpty`;
 *      we render a small one-liner inside the messages container, NOT a
 *      page-feel hero.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export type ChatDrawerSnap = 0.15 | 0.6 | 1;
const SNAPS: ChatDrawerSnap[] = [0.15, 0.6, 1];

interface Props {
  dark: boolean;
  /** Externally-controlled snap. */
  snap: ChatDrawerSnap;
  onSnapChange: (snap: ChatDrawerSnap) => void;
  pill: ReactNode;
  messages: ReactNode;
  /** Optional one-liner greeting shown when messages are empty. Sits at
      the top of the (otherwise empty) messages area. NOT a giant hero. */
  greeting?: ReactNode;
  isEmpty?: boolean;
  header?: ReactNode;
}

function nearestSnap(fraction: number): ChatDrawerSnap {
  return SNAPS.reduce((best, s) =>
    Math.abs(s - fraction) < Math.abs(best - fraction) ? s : best, SNAPS[0]);
}

function getViewportHeight(): number {
  if (typeof window === 'undefined') return 800;
  return window.visualViewport?.height ?? window.innerHeight;
}

function blurFocusedInput() {
  if (typeof document === 'undefined') return;
  const el = document.activeElement as HTMLElement | null;
  if (!el) return;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') el.blur();
}

export default function MobileChatDrawer({
  dark, snap, onSnapChange, pill, messages, greeting, isEmpty, header,
}: Props) {
  const [vh, setVh] = useState(getViewportHeight);

  // Track viewport height — visualViewport.resize fires on iOS keyboard
  // show/hide; window resize is the desktop fallback.
  useEffect(() => {
    const update = () => setVh(getViewportHeight());
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  // Drawer height = snap fraction × current viewport.
  // Minimum peek must fit handle + pill, else the input clips. Iterate
  // a sane minimum (110px) so on tall iPhones the pill is always reachable.
  const heightFor = (s: ChatDrawerSnap) => Math.max(110, s * vh);

  const heightMV = useMotionValue(heightFor(snap));

  // Snap or vh changed → re-animate height. NO re-entrancy guard — every
  // change cancels the previous animation (cleanup) and starts fresh.
  useEffect(() => {
    const controls = animate(heightMV, heightFor(snap), {
      type: 'spring',
      stiffness: 380,
      damping: 36,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, vh]);

  // ─── iOS-safe body scroll lock ───
  // Lock when the drawer is at 0.6 or 1.0. position:fixed on body
  // preserves scroll position, doesn't trigger the iOS overflow:hidden
  // jump-to-top bug, and doesn't conflict with our drawer (which is
  // position:fixed bottom:0 — its own positioning is independent).
  const lockedScrollYRef = useRef<number | null>(null);
  useEffect(() => {
    const shouldLock = snap >= 0.6;
    if (shouldLock && lockedScrollYRef.current === null) {
      const y = window.scrollY;
      lockedScrollYRef.current = y;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else if (!shouldLock && lockedScrollYRef.current !== null) {
      const y = lockedScrollYRef.current;
      lockedScrollYRef.current = null;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, y);
    }
  }, [snap]);

  // ─── Drag from chrome (handle OR header) ───
  // The whole top of the drawer is draggable, not just a tiny pill.
  // Manual pointer events with velocity-based snap projection.
  const dragStateRef = useRef<{
    startY: number; startH: number;
    lastY: number; lastT: number; velY: number;
    pointerId: number;
  } | null>(null);

  const onChromePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      startY: e.clientY,
      startH: heightMV.get(),
      lastY: e.clientY,
      lastT: performance.now(),
      velY: 0,
      pointerId: e.pointerId,
    };
  };

  const onChromePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastT);
    s.velY = (e.clientY - s.lastY) / dt;
    s.lastY = e.clientY;
    s.lastT = now;
    const delta = e.clientY - s.startY; // positive = drag down (shrink)
    const next = Math.max(110, Math.min(vh, s.startH - delta));
    heightMV.set(next);
  };

  const onChromePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    const projected = heightMV.get() - s.velY * 1000 * 0.18;
    const fraction = Math.max(0, Math.min(1, projected / vh));
    const next = nearestSnap(fraction);
    onSnapChange(next);
    if (next < 0.6) blurFocusedInput();
    dragStateRef.current = null;
  };

  // ─── Overscroll-from-top: drag drawer when messages scrolled to top ───
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const overscrollRef = useRef<{
    pointerId: number; startY: number; startH: number; armed: boolean;
  } | null>(null);

  const onMessagesPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;
    overscrollRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startH: heightMV.get(),
      armed: false,
    };
  };

  const onMessagesPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = overscrollRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const el = messagesScrollRef.current;
    if (!el) return;
    const deltaY = e.clientY - s.startY;
    if (!s.armed) {
      if (deltaY > 8 && el.scrollTop <= 0) {
        s.armed = true;
        blurFocusedInput();
      } else if (deltaY < -2) {
        overscrollRef.current = null;
        return;
      } else {
        return;
      }
    }
    e.preventDefault();
    const next = Math.max(110, Math.min(vh, s.startH - deltaY));
    heightMV.set(next);
  };

  const onMessagesPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = overscrollRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    if (s.armed) {
      const fraction = Math.max(0, Math.min(1, heightMV.get() / vh));
      const next = nearestSnap(fraction);
      onSnapChange(next);
    }
    overscrollRef.current = null;
  };

  // ─── Auto-expand on input focus + scroll messages to bottom ───
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = drawerBodyRef.current;
    if (!el) return;
    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
      if (snap < 0.6) onSnapChange(0.6);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const list = messagesScrollRef.current;
          if (list) list.scrollTop = list.scrollHeight;
        });
      });
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, [snap, onSnapChange]);

  const showExpandedContent = snap >= 0.6;
  const drawerBg = dark ? 'rgba(20,22,24,0.94)' : 'rgba(255,255,255,0.97)';
  const handleC = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingC = dark ? '#F0F0F3' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';

  // Top padding picks up safe-area when expanded so the handle clears the
  // iOS status bar / Dynamic Island. At peek the drawer is well below the
  // safe area, so the padding is unnecessary.
  const handlePadTop = snap === 1
    ? 'calc(env(safe-area-inset-top, 0px) + 10px)'
    : '10px';

  return (
    <motion.div
      role="region"
      aria-label="Chat with Yulia"
      className="mobile-chat-drawer"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: heightMV,
        zIndex: 40,
        background: drawerBg,
        backdropFilter: 'blur(22px) saturate(180%)',
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderTop: `1px solid ${border}`,
        boxShadow: dark
          ? '0 -16px 40px -16px rgba(0,0,0,0.55)'
          : '0 -16px 40px -16px rgba(15,16,18,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Drag chrome — handle pill + (when expanded) header.
          The whole strip captures pointer events so the user can grab
          anywhere along the top, not just the small visible pill. */}
      <div
        onPointerDown={onChromePointerDown}
        onPointerMove={onChromePointerMove}
        onPointerUp={onChromePointerUp}
        onPointerCancel={onChromePointerUp}
        aria-label="Drag to resize drawer"
        role="separator"
        aria-orientation="horizontal"
        style={{
          flexShrink: 0,
          paddingTop: handlePadTop,
          paddingBottom: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 40, height: 5, borderRadius: 999,
            background: handleC,
          }}
        />
      </div>

      <div ref={drawerBodyRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {showExpandedContent && header && (
          <div
            // Header is also draggable — the user might naturally try to
            // grab the title strip to dismiss the drawer.
            onPointerDown={onChromePointerDown}
            onPointerMove={onChromePointerMove}
            onPointerUp={onChromePointerUp}
            onPointerCancel={onChromePointerUp}
            style={{
              flexShrink: 0,
              padding: '4px 16px 8px',
              borderBottom: `1px solid ${border}`,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: headingC,
              touchAction: 'none',
            }}
          >
            {header}
          </div>
        )}

        {showExpandedContent && (
          <div
            ref={messagesScrollRef}
            onPointerDown={onMessagesPointerDown}
            onPointerMove={onMessagesPointerMove}
            onPointerUp={onMessagesPointerUp}
            onPointerCancel={onMessagesPointerUp}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
          >
            {/* Empty-state greeting — small, above the messages, not a
                full-screen hero. Disappears as soon as messages arrive. */}
            {isEmpty && greeting && (
              <div
                style={{
                  padding: '14px 18px 8px',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  color: mutedC,
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {greeting}
              </div>
            )}
            {messages}
          </div>
        )}

        <div
          className="chat-pill-mobile-container"
          style={{
            flexShrink: 0,
            padding: showExpandedContent ? '8px 12px 0' : '0 12px 6px',
          }}
        >
          {pill}
        </div>
      </div>
    </motion.div>
  );
}
