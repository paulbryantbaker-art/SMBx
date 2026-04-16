/**
 * MobileChatDrawer — Apple Maps / Google Maps pattern for mobile chat.
 *
 * Three snap points:
 *   - 0.15 (peek)   — just the input pill + drag handle. Background fully
 *                     interactive. Default state.
 *   - 0.6  (active) — messages list + input. Half-screen reveal. Used
 *                     when input is focused or a conversation is opened.
 *   - 1.0  (full)   — chat takeover for reading. Swipe down dismisses
 *                     back through 0.6 → 0.15.
 *
 * Background is MobileNotionHome — stays mounted always. The drawer is
 * non-modal (modal=false) so taps land on the home behind it at 0.15,
 * and partially behind it at 0.6.
 *
 * Apple Glass material on the drawer's top edge / handle so it reads
 * as a translucent surface lifted off the page.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Drawer } from 'vaul';

export type ChatDrawerSnap = 0.15 | 0.6 | 1;

interface Props {
  dark: boolean;
  /** When true, drawer is rendered. When false, drawer unmounts entirely
      (use for logged-out states where chat lives elsewhere). */
  open?: boolean;
  /** Externally-controlled snap point. Pass null to let the drawer manage
      its own snap state. Useful for "tap a deal → expand to 0.6". */
  snap?: ChatDrawerSnap | null;
  /** Notify parent when the snap changes via user gesture. */
  onSnapChange?: (snap: ChatDrawerSnap) => void;
  /** The chat input pill (always visible). */
  pill: ReactNode;
  /** Messages list — rendered above the pill at snap >= 0.6. */
  messages: ReactNode;
  /** Optional header strip (deal name, conversation title) at the top of
      the drawer above messages. Rendered at snap >= 0.6. */
  header?: ReactNode;
}

export default function MobileChatDrawer({
  dark,
  open = true,
  snap = null,
  onSnapChange,
  pill,
  messages,
  header,
}: Props) {
  const SNAPS: ChatDrawerSnap[] = [0.15, 0.6, 1];
  const [internalSnap, setInternalSnap] = useState<ChatDrawerSnap>(0.15);
  const activeSnap: ChatDrawerSnap = snap ?? internalSnap;

  // Sync external snap changes
  useEffect(() => {
    if (snap != null) setInternalSnap(snap);
  }, [snap]);

  // Show messages + header content only when expanded enough to read
  const showExpandedContent = activeSnap >= 0.6;

  const drawerBg = dark ? 'rgba(20,22,24,0.92)' : 'rgba(255,255,255,0.96)';
  const headingC = dark ? '#F0F0F3' : '#0f1012';
  const handleC = dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.16)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';

  // Vaul controlled snap state — number | string
  const [vaulSnap, setVaulSnap] = useState<number | string | null>(activeSnap);
  useEffect(() => { setVaulSnap(activeSnap); }, [activeSnap]);
  const handleSnapChange = (next: number | string | null) => {
    setVaulSnap(next);
    if (typeof next === 'number') {
      const closest = SNAPS.reduce((best, s) =>
        Math.abs(s - next) < Math.abs(best - next) ? s : best, SNAPS[0]);
      setInternalSnap(closest);
      onSnapChange?.(closest);
    }
  };

  // Track focus on chat input → auto-expand to 0.6 if currently at 0.15.
  // Drawer body listens for focus events bubbling up from inputs/textareas.
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = drawerBodyRef.current;
    if (!el) return;
    const onFocus = (ev: FocusEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;
      if (activeSnap < 0.6) {
        setVaulSnap(0.6);
        setInternalSnap(0.6);
        onSnapChange?.(0.6);
      }
    };
    el.addEventListener('focusin', onFocus);
    return () => el.removeEventListener('focusin', onFocus);
  }, [activeSnap, onSnapChange]);

  if (!open) return null;

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAPS}
      activeSnapPoint={vaulSnap}
      setActiveSnapPoint={handleSnapChange}
      fadeFromIndex={SNAPS.length - 1}
    >
      <Drawer.Portal>
        <Drawer.Content
          className="mobile-chat-drawer"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: drawerBg,
            backdropFilter: 'blur(22px) saturate(180%)',
            WebkitBackdropFilter: 'blur(22px) saturate(180%)',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderTop: `1px solid ${border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            outline: 'none',
            boxShadow: dark
              ? '0 -16px 40px -16px rgba(0,0,0,0.55)'
              : '0 -16px 40px -16px rgba(15,16,18,0.18)',
          }}
        >
          <Drawer.Title className="sr-only">Chat with Yulia</Drawer.Title>
          <Drawer.Description className="sr-only">
            Swipe up to read more, swipe down to return to your home.
          </Drawer.Description>

          {/* Drag handle — Apple Maps-style grab affordance */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px', flexShrink: 0 }}>
            <div
              aria-hidden
              style={{
                width: 36, height: 5, borderRadius: 999,
                background: handleC,
                transition: 'background 0.2s ease',
              }}
            />
          </div>

          <div ref={drawerBodyRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Header strip — deal/conversation context. Only at >= 0.6. */}
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

            {/* Messages — fills remaining space when expanded; hidden at 0.15 */}
            {showExpandedContent && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {messages}
              </div>
            )}

            {/* Pill — ALWAYS visible, sits at the bottom of the drawer */}
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
