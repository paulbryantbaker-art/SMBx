/**
 * MobileChatDrawer — Apple Maps + iMessage hybrid (web).
 *
 * Snap points (fractions of visualViewport height):
 *   - 0.15 (peek)   — pill + drag handle. Background fully interactive.
 *   - 0.60 (active) — messages + input. Half-screen reveal.
 *   - 1.00 (full)   — chat takeover for reading.
 *
 * What this fixes vs. the previous build (user feedback IMG_3371 / 3372):
 *   1. visualViewport.height — drawer shrinks WITH the keyboard, never extends
 *      under it. The previous innerHeight tracking gave a stale layout viewport.
 *   2. Drop body scroll lock — relied on overscroll-behavior:contain instead.
 *      The lock blocked the messages container from scrolling on iOS.
 *   3. Overscroll-from-top — pulling DOWN on the messages list when it's
 *      already scrolled to the top drags the drawer down, exactly like
 *      iMessage's interactive keyboard dismiss.
 *   4. Drag handle reachable at snap=1.0 — top padding picks up
 *      env(safe-area-inset-top) so the pill clears the status bar / notch.
 *   5. Scroll-to-bottom on focus — when the input gains focus we scroll the
 *      messages container to its bottom, preventing iOS's "jump to make input
 *      visible" from yanking older messages off-screen.
 *   6. Drop animatingRef — the previous re-entrancy guard left the height MV
 *      stale when visualViewport changed mid-animation (keyboard open/close).
 *
 * Why not Vaul: Vaul's snap-point Drawer is built for modal sheets that
 * open/close. A persistent always-mounted snap drawer with non-modal
 * background interaction is not its primary use case. Direct framer-motion
 * + manual pointer events lets us coordinate the overscroll-from-top dance
 * with the messages container's native scroll.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export type ChatDrawerSnap = 0.15 | 0.6 | 1;
const SNAPS: ChatDrawerSnap[] = [0.15, 0.6, 1];

interface Props {
  dark: boolean;
  /** Externally-controlled snap. Pass null for self-managed. */
  snap?: ChatDrawerSnap | null;
  onSnapChange?: (snap: ChatDrawerSnap) => void;
  pill: ReactNode;
  messages: ReactNode;
  header?: ReactNode;
}

function nearestSnap(fraction: number): ChatDrawerSnap {
  return SNAPS.reduce((best, s) =>
    Math.abs(s - fraction) < Math.abs(best - fraction) ? s : best, SNAPS[0]);
}

function getViewportHeight(): number {
  if (typeof window === 'undefined') return 800;
  // visualViewport.height shrinks with the keyboard; innerHeight does not.
  // Always prefer visualViewport so the drawer never extends under the
  // soft keyboard (the iMessage rule).
  return window.visualViewport?.height ?? window.innerHeight;
}

export default function MobileChatDrawer({
  dark, snap, onSnapChange, pill, messages, header,
}: Props) {
  const [vh, setVh] = useState(getViewportHeight);
  const [internalSnap, setInternalSnap] = useState<ChatDrawerSnap>(0.15);
  const activeSnap: ChatDrawerSnap = snap ?? internalSnap;

  // Track viewport height for fractional snap math AND keyboard handling.
  // visualViewport.resize fires on iOS keyboard show/hide; innerHeight does
  // not. Listen on both for desktop-browser fallback.
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

  // Drawer height in px. We animate height (not translate) so the bottom
  // edge stays anchored at the viewport bottom and content inside resizes
  // naturally as snap or vh changes.
  const heightMV = useMotionValue(activeSnap * vh);

  // Sync external snap → internal state. Has to come BEFORE the height
  // animation effect so activeSnap reflects the new value on the same tick.
  useEffect(() => {
    if (snap != null) setInternalSnap(snap);
  }, [snap]);

  // Sync (snap, vh) → drawer height. NO re-entrancy guard — every change
  // (including mid-flight vh changes from the keyboard) cancels the previous
  // animation and starts a fresh one. The cleanup function does the cancel.
  useEffect(() => {
    const controls = animate(heightMV, activeSnap * vh, {
      type: 'spring',
      stiffness: 380,
      damping: 36,
    });
    return () => controls.stop();
  }, [activeSnap, vh, heightMV]);

  // ─── Drag handle — the primary control ───
  // Manual pointer events. Tracks pointer Y, samples velocity, projects to
  // the nearest snap on release. Avoids framer-motion's drag system which
  // fights height-based animation.
  const dragStateRef = useRef<{
    startY: number;
    startH: number;
    lastY: number;
    lastT: number;
    velY: number;
    pointerId: number;
  } | null>(null);

  const beginDrag = (clientY: number, pointerId: number) => {
    dragStateRef.current = {
      startY: clientY,
      startH: heightMV.get(),
      lastY: clientY,
      lastT: performance.now(),
      velY: 0,
      pointerId,
    };
  };

  const updateDrag = (clientY: number, pointerId: number) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastT);
    s.velY = (clientY - s.lastY) / dt; // px/ms
    s.lastY = clientY;
    s.lastT = now;
    const delta = clientY - s.startY; // positive = drag down (shrink)
    const next = Math.max(40, Math.min(vh, s.startH - delta));
    heightMV.set(next);
  };

  const endDrag = (pointerId: number) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== pointerId) return;
    // Project current position forward by ~180ms of velocity. Same trick
    // iOS uses for sheet snapping — prevents "stuck between snaps" feel.
    const projected = heightMV.get() - s.velY * 1000 * 0.18;
    const fraction = Math.max(0, Math.min(1, projected / vh));
    const next = nearestSnap(fraction);
    setInternalSnap(next);
    onSnapChange?.(next);
    animate(heightMV, next * vh, { type: 'spring', stiffness: 380, damping: 36 });
    // If the user dismissed the drawer (snap < 0.6), drop keyboard focus too.
    if (next < 0.6) blurFocusedInput();
    dragStateRef.current = null;
  };

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    beginDrag(e.clientY, e.pointerId);
  };
  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateDrag(e.clientY, e.pointerId);
  };
  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    endDrag(e.pointerId);
  };

  // ─── Overscroll-from-top: messages → drawer drag ───
  // When the user pulls DOWN on the messages list while it's already
  // scrolled to the top, intercept the gesture and drag the drawer down
  // instead of bouncing the scroll. This is how iMessage's interactive
  // keyboard dismiss feels — except we go further and dismiss the drawer.
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const overscrollRef = useRef<{
    pointerId: number;
    startY: number;
    startH: number;
    armed: boolean;  // true once we've taken over the gesture
  } | null>(null);

  const onMessagesPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only intercept touch — leave mouse/wheel scrolling alone.
    if (e.pointerType !== 'touch') return;
    const el = messagesScrollRef.current;
    if (!el) return;
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
    // Arm the drag only if user is pulling DOWN AND list is at the top.
    // Otherwise, native scroll wins.
    if (!s.armed) {
      if (deltaY > 6 && el.scrollTop <= 0) {
        s.armed = true;
        // Dismiss keyboard the moment the gesture is recognized — feels
        // immediate, mirrors iMessage.
        blurFocusedInput();
      } else if (deltaY < -2) {
        // Upward scroll — release the gesture to native scroll.
        overscrollRef.current = null;
        return;
      } else {
        return;
      }
    }
    e.preventDefault();
    const next = Math.max(40, Math.min(vh, s.startH - deltaY));
    heightMV.set(next);
  };

  const onMessagesPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = overscrollRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    if (s.armed) {
      const fraction = Math.max(0, Math.min(1, heightMV.get() / vh));
      const next = nearestSnap(fraction);
      setInternalSnap(next);
      onSnapChange?.(next);
      animate(heightMV, next * vh, { type: 'spring', stiffness: 380, damping: 36 });
    }
    overscrollRef.current = null;
  };

  // ─── Auto-expand on input focus + scroll messages to bottom ───
  // iOS auto-scrolls the page to bring focused inputs into view. With our
  // drawer at snap=0.15 and the input inside, that scroll yanks messages
  // off-screen. Fix: force the messages container back to its bottom on
  // focus so the latest message stays visible (iMessage behavior).
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = drawerBodyRef.current;
    if (!el) return;
    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
      if (activeSnap < 0.6) {
        setInternalSnap(0.6);
        onSnapChange?.(0.6);
      }
      // After the keyboard animation settles, snap messages to bottom.
      // requestAnimationFrame x 2 = "next paint after the next paint" =
      // gives iOS time to apply its own auto-scroll, then we override.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const list = messagesScrollRef.current;
          if (list) list.scrollTop = list.scrollHeight;
        });
      });
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, [activeSnap, onSnapChange]);

  // ─── No body scroll lock ───
  // Previously we set document.body.style.overflow = 'hidden' when the drawer
  // expanded. That blocked the messages container from scrolling on iOS in
  // some cases. We rely on overscroll-behavior:contain on the messages
  // container instead — scroll chaining to the body is prevented at the
  // CSS layer, so the background can't scroll under the user's thumb.

  const showExpandedContent = activeSnap >= 0.6;
  const drawerBg = dark ? 'rgba(20,22,24,0.92)' : 'rgba(255,255,255,0.96)';
  const handleC = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingC = dark ? '#F0F0F3' : '#0f1012';

  // At full snap, push the drag handle below the iOS status bar / notch so
  // it stays grabbable. At lower snaps the handle is well below the
  // safe-area, so the safe-area padding is unnecessary.
  const handlePadTop = activeSnap === 1
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
        // touchAction REMOVED from the outer container — children handle
        // their own touch behavior.
      }}
    >
      {/* Drag handle — manual pointer events. Hit area is the full-width
          top strip so users can grab anywhere along the top edge, not just
          the small visible pill. Top padding picks up safe-area at full
          snap so the handle clears the status bar. */}
      <div
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
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
            style={{
              flexShrink: 0,
              padding: '4px 16px 8px',
              borderBottom: `1px solid ${border}`,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: headingC,
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
              // overscroll-behavior:contain prevents scroll chain to body —
              // background can't scroll under the user's thumb without the
              // body lock that broke scrolling on iOS.
              overscrollBehavior: 'contain',
              // pan-y allows native vertical scrolling; the overscroll-from-top
              // handler intercepts only when the list is already at top and
              // the user is pulling further down.
              touchAction: 'pan-y',
            }}
          >
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

/** Drop keyboard focus from any focused text input/textarea. Used when
    the drawer dismisses via swipe-down — keyboard should follow. */
function blurFocusedInput() {
  if (typeof document === 'undefined') return;
  const el = document.activeElement as HTMLElement | null;
  if (!el) return;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    el.blur();
  }
}
