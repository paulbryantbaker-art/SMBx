/**
 * MobileChatDrawer — Apple Maps drawer (canonical iOS PWA pattern).
 *
 * REWRITE NOTES — read memory/architecture_ios_pwa_pill.md before changing:
 *
 *   1. Tailwind `fixed left-0 right-0 bottom-0 z-40` on the outer (NOT
 *      inline-style position:fixed). Tailwind utility wins over inline
 *      style consistency issues we hit before. Same pattern that the
 *      anonymous chat-pill portal uses (AppShell.tsx:2349) — proven.
 *
 *   2. Height in CSS units — `lvh` (largest viewport height). NOT JS
 *      visualViewport tracking. The memory explicitly lists JS viewport
 *      tracking as a failed attempt: "fights the browser's own
 *      layout-viewport management." With viewport meta
 *      `interactive-widget=resizes-content`, position:fixed bottom:0
 *      naturally tracks the keyboard.
 *
 *   3. NO `chat-pill-mobile-container` className inside the drawer — that
 *      class adds `padding-bottom: env(keyboard-inset-height)` which
 *      double-counts keyboard inset when the drawer's bottom is already
 *      keyboard-aware via interactive-widget.
 *
 *   4. NO body scroll lock with position:fixed top:-y. That fought the
 *      drawer's own positioning. Instead, prevent background scroll via
 *      `touchAction: 'none'` on the body when expanded — a CSS-only
 *      lock that doesn't reposition anything.
 *
 *   5. Drag handle + header strip both grab pointer events. When the
 *      drawer is at full snap, paddingTop picks up safe-area-inset-top
 *      so the handle clears the iOS status bar / Dynamic Island.
 *
 *   6. Overscroll-from-top → drawer drag (iMessage interactive keyboard
 *      dismiss): pulling down on a scrolled-to-top message list drags
 *      the drawer down + blurs the input.
 *
 * Snap points:
 *   - 0.15 (peek)   — handle + pill visible. Background interactive.
 *   - 0.60 (active) — messages + input. Half-screen.
 *   - 1.00 (full)   — full takeover.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export type ChatDrawerSnap = 0.15 | 0.6 | 1;
const SNAPS: ChatDrawerSnap[] = [0.15, 0.6, 1];

interface Props {
  dark: boolean;
  snap: ChatDrawerSnap;
  onSnapChange: (snap: ChatDrawerSnap) => void;
  pill: ReactNode;
  messages: ReactNode;
  greeting?: ReactNode;
  isEmpty?: boolean;
  header?: ReactNode;
}

function nearestSnap(fraction: number): ChatDrawerSnap {
  return SNAPS.reduce((best, s) =>
    Math.abs(s - fraction) < Math.abs(best - fraction) ? s : best, SNAPS[0]);
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
  // Drawer height as a CSS percentage of viewport. The motion value drives
  // both the snap target AND the live drag, so the spring animation feels
  // continuous with the gesture. Stored as a fraction (0..1); converted to
  // CSS calc() below so the browser does the lvh math, not us.
  const fractionMV = useMotionValue<number>(snap);

  // Sync external snap → fraction. animate() cancels previous run on cleanup.
  useEffect(() => {
    const controls = animate(fractionMV, snap, {
      type: 'spring',
      stiffness: 380,
      damping: 36,
    });
    return () => controls.stop();
  }, [snap, fractionMV]);

  // ─── CSS-only background scroll lock ───
  // touch-action:none on the body prevents touch-driven scrolling without
  // repositioning the document or affecting the drawer's own positioning.
  // Lifted when drawer is at peek so the user can scroll the Notion home.
  useEffect(() => {
    const shouldLock = snap >= 0.6;
    if (!shouldLock) return;
    const prevTouch = document.body.style.touchAction;
    const prevOverflow = document.body.style.overflow;
    document.body.style.touchAction = 'none';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.touchAction = prevTouch;
      document.body.style.overflow = prevOverflow;
    };
  }, [snap]);

  // ─── Drag from drawer chrome (handle + header) ───
  // Manual pointer events. Tracks Y delta + velocity, projects to nearest
  // snap on release. Operates on fraction (0..1) for CSS-driven height.
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startFrac: number;
    lastY: number;
    lastT: number;
    velY: number;  // px/ms (POSITIVE = down)
    height: number; // viewport height in px sampled at drag start
  } | null>(null);

  const onChromePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startFrac: fractionMV.get(),
      lastY: e.clientY,
      lastT: performance.now(),
      velY: 0,
      // window.innerHeight is the layout viewport — stable, doesn't shift
      // mid-drag from keyboard quirks. Samples once per drag.
      height: window.innerHeight,
    };
  };

  const onChromePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.lastT);
    s.velY = (e.clientY - s.lastY) / dt;
    s.lastY = e.clientY;
    s.lastT = now;
    const deltaY = e.clientY - s.startY; // positive = drag down (shrink)
    const deltaFrac = deltaY / s.height;
    const next = Math.max(0, Math.min(1, s.startFrac - deltaFrac));
    fractionMV.set(next);
  };

  const onChromePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    // Project current fraction forward by 180ms of velocity (in fraction/sec).
    const velFrac = (s.velY * 1000) / s.height; // fraction/sec, positive = shrinking
    const projected = fractionMV.get() - velFrac * 0.18;
    const next = nearestSnap(Math.max(0, Math.min(1, projected)));
    onSnapChange(next);
    if (next < 0.6) blurFocusedInput();
    dragRef.current = null;
  };

  // ─── Overscroll-from-top: messages → drawer drag ───
  const messagesRef = useRef<HTMLDivElement>(null);
  const overscrollRef = useRef<{
    pointerId: number;
    startY: number;
    startFrac: number;
    height: number;
    armed: boolean;
  } | null>(null);

  const onMessagesPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;
    overscrollRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startFrac: fractionMV.get(),
      height: window.innerHeight,
      armed: false,
    };
  };

  const onMessagesPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = overscrollRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const el = messagesRef.current;
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
    const deltaFrac = deltaY / s.height;
    const next = Math.max(0, Math.min(1, s.startFrac - deltaFrac));
    fractionMV.set(next);
  };

  const onMessagesPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = overscrollRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    if (s.armed) {
      const next = nearestSnap(Math.max(0, Math.min(1, fractionMV.get())));
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
          const list = messagesRef.current;
          if (list) list.scrollTop = list.scrollHeight;
        });
      });
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, [snap, onSnapChange]);

  const showExpanded = snap >= 0.6;
  const drawerBg = dark ? 'rgba(20,22,24,0.94)' : 'rgba(255,255,255,0.97)';
  const handleC = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingC = dark ? '#F0F0F3' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';

  // CSS height: max(140px, fraction × 100lvh).
  // - 140px floor guarantees handle + pill always fit at peek.
  // - lvh (largest viewport height) is iOS-stable: doesn't oscillate with
  //   the URL bar like vh, doesn't shrink with the keyboard like dvh.
  // - useTransform reads the motion value each frame and re-renders style.
  const heightStyle = useTransform(fractionMV, (f) => `max(140px, calc(${f} * 100lvh))`);

  // Top padding picks up safe-area when expanded so the handle clears the
  // iOS status bar / Dynamic Island. At peek the drawer is well below it.
  const handlePadTop = snap === 1
    ? 'calc(env(safe-area-inset-top, 0px) + 10px)'
    : '10px';

  return (
    <motion.div
      role="region"
      aria-label="Chat with Yulia"
      className="mobile-chat-drawer fixed left-0 right-0 bottom-0 z-40 flex flex-col"
      style={{
        height: heightStyle,
        background: drawerBg,
        backdropFilter: 'blur(22px) saturate(180%)',
        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderTop: `1px solid ${border}`,
        boxShadow: dark
          ? '0 -16px 40px -16px rgba(0,0,0,0.55)'
          : '0 -16px 40px -16px rgba(15,16,18,0.18)',
        overflow: 'hidden',
        // Keyboard inset so the drawer's bottom edge stays above the
        // soft keyboard. iOS 17+ supports keyboard-inset-height directly.
        paddingBottom: 'env(keyboard-inset-height, 0px)',
      }}
    >
      {/* Drag handle strip — captures pointer events for resize. */}
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
        {showExpanded && header && (
          <div
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

        {showExpanded && (
          <div
            ref={messagesRef}
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

        {/* Pill at bottom of drawer. NO chat-pill-mobile-container class —
            that class adds keyboard-inset padding, which double-counts the
            inset since the drawer's own padding-bottom already accounts
            for the keyboard. */}
        <div
          style={{
            flexShrink: 0,
            padding: showExpanded ? '8px 12px 8px' : '0 12px 8px',
          }}
        >
          {pill}
        </div>
      </div>
    </motion.div>
  );
}

