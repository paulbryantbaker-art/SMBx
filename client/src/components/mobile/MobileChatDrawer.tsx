/**
 * MobileChatDrawer — Apple Maps / Google Maps pattern, framer-motion impl.
 *
 * Three snap points (fractions of viewport height):
 *   - 0.15 (peek)   — pill + drag handle. Background fully interactive.
 *   - 0.60 (active) — messages + input. Half-screen reveal.
 *   - 1.00 (full)   — chat takeover for reading.
 *
 * Always mounted. Drag to resnap. Tap-through at 0.15 lets the user
 * keep using the home behind. Apple Glass material on the chrome.
 *
 * Why not Vaul: Vaul's snap-point Drawer is built for modal sheets that
 * open/close. A persistent always-mounted snap drawer with non-modal
 * background interaction is not its primary use case and doesn't render
 * reliably with `modal={false}`. Direct framer-motion drag is the right
 * tool here.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, animate, type PanInfo } from 'framer-motion';

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

export default function MobileChatDrawer({
  dark, snap, onSnapChange, pill, messages, header,
}: Props) {
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  const [internalSnap, setInternalSnap] = useState<ChatDrawerSnap>(0.15);
  const activeSnap: ChatDrawerSnap = snap ?? internalSnap;

  // Track viewport height for fractional snap math. Includes iOS keyboard
  // resize via interactive-widget=resizes-content + visualViewport events.
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  // Drawer height in px = activeSnap * vh. We animate the height (not
  // translate) so the bottom edge stays at viewport bottom and content
  // inside resizes naturally.
  const heightMV = useMotionValue(activeSnap * vh);
  const animatingRef = useRef(false);

  // Sync external snap → height
  useEffect(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const controls = animate(heightMV, activeSnap * vh, {
      type: 'spring',
      stiffness: 380,
      damping: 36,
      onComplete: () => { animatingRef.current = false; },
    });
    return () => controls.stop();
  }, [activeSnap, vh, heightMV]);

  // External snap prop sync
  useEffect(() => {
    if (snap != null) setInternalSnap(snap);
  }, [snap]);

  // Drag handler — y is delta from where drag started; positive = down (shrink)
  const dragStartHeightRef = useRef(0);
  const onDragStart = () => {
    dragStartHeightRef.current = heightMV.get();
  };
  const onDrag = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const next = Math.max(40, Math.min(vh, dragStartHeightRef.current - info.offset.y));
    heightMV.set(next);
  };
  const onDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    // Project where momentum would land
    const projected = heightMV.get() - info.velocity.y * 0.12;
    const fraction = Math.max(0, Math.min(1, projected / vh));
    const next = nearestSnap(fraction);
    setInternalSnap(next);
    onSnapChange?.(next);
    animate(heightMV, next * vh, { type: 'spring', stiffness: 380, damping: 36 });
  };

  // Auto-expand to 0.6 when an input/textarea inside the drawer is focused
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
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, [activeSnap, onSnapChange]);

  // Lock background scroll when the drawer is expanded past peek. At 0.15
  // the background is fully interactive (Apple Maps pattern). At >= 0.6
  // the drawer is the active surface; the visible portion of the home
  // shouldn't scroll under your thumb when you're trying to scroll
  // through messages.
  useEffect(() => {
    const lock = activeSnap >= 0.6;
    if (!lock) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [activeSnap]);

  const showExpandedContent = activeSnap >= 0.6;
  const drawerBg = dark ? 'rgba(20,22,24,0.92)' : 'rgba(255,255,255,0.96)';
  const handleC = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingC = dark ? '#F0F0F3' : '#0f1012';

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
        touchAction: 'none',
      }}
    >
      {/* Drag handle — Apple Maps-style. Whole top strip is the drag target. */}
      <motion.div
        onPointerDown={(e) => (e.currentTarget as any).setPointerCapture?.(e.pointerId)}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        style={{
          flexShrink: 0,
          padding: '8px 0 6px',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 36, height: 5, borderRadius: 999,
            background: handleC,
          }}
        />
      </motion.div>

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
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
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
