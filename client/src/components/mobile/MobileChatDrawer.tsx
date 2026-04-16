/**
 * MobileChatDrawer — Vaul-backed Apple Maps + iMessage drawer.
 *
 * The previous hand-rolled implementations broke too many subtle iOS
 * behaviors (overscroll-from-content drag, keyboard reposition, body
 * scroll lock, drag-from-anywhere). Vaul (Vercel's drawer, used by
 * shadcn/ui) is the gold-standard React drawer; it handles all of those
 * correctly. The remaining work is wiring it into our snap point shape:
 *
 *   - 0.15 (peek)   — pill + drag handle. Background interactive.
 *   - 0.60 (active) — messages + input. Half-screen reveal.
 *   - 1.00 (full)   — chat takeover for reading.
 *
 * Vaul props chosen:
 *   open={true}          — always mounted; the drawer never closes.
 *   dismissible={false}  — user can drag down to peek but not off-screen.
 *   modal={false}        — background remains interactive at peek.
 *   repositionInputs     — Vaul reframes inputs above the soft keyboard.
 *   snapToSequentialPoint — snaps step-by-step (prevents wild flings).
 *   handleOnly={false}   — drag from anywhere on the chrome; messages
 *                          container's overscroll-from-top is what dismisses.
 *
 * For the body-scroll-lock concern (background scrolling under the user's
 * thumb at the 0.6/1.0 snap), we set noBodyStyles and apply our own
 * iOS-safe lock via position:fixed on the body — preserves scroll
 * position, prevents the "jump to top" iOS quirk that overflow:hidden
 * triggers. We tie the lock to activeSnap >= 0.6.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { Drawer } from 'vaul';

export type ChatDrawerSnap = 0.15 | 0.6 | 1;
const SNAP_POINTS: ChatDrawerSnap[] = [0.15, 0.6, 1];

interface Props {
  dark: boolean;
  /** Externally-controlled snap. */
  snap: ChatDrawerSnap;
  onSnapChange: (snap: ChatDrawerSnap) => void;
  pill: ReactNode;
  messages: ReactNode;
  /** Optional small greeting line shown when messages are empty. Sits
      above the input pill, not as a giant hero. */
  greeting?: ReactNode;
  /** True when the message list is empty (controls greeting visibility). */
  isEmpty?: boolean;
  header?: ReactNode;
}

export default function MobileChatDrawer({
  dark, snap, onSnapChange, pill, messages, greeting, isEmpty, header,
}: Props) {
  // ─── iOS-safe body scroll lock ───
  // When the drawer is at 0.6 or 1.0, prevent the background (Notion home)
  // from scrolling under the user's thumb. position:fixed on the body
  // preserves scroll position WITHOUT the iOS overflow:hidden bug that
  // jumps the page to top on lock release. Drawer's own scroll containers
  // are unaffected because they're inside fixed-position descendants.
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

  const drawerBg = dark ? 'rgba(20,22,24,0.94)' : 'rgba(255,255,255,0.97)';
  const handleC = dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const headingC = dark ? '#F0F0F3' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';

  const showExpandedContent = snap >= 0.6;

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS as unknown as number[]}
      activeSnapPoint={snap}
      setActiveSnapPoint={(s) => {
        if (typeof s === 'number' && (s === 0.15 || s === 0.6 || s === 1)) {
          onSnapChange(s as ChatDrawerSnap);
        }
      }}
      snapToSequentialPoint
      repositionInputs
      noBodyStyles
      handleOnly={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
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
            boxShadow: dark
              ? '0 -16px 40px -16px rgba(0,0,0,0.55)'
              : '0 -16px 40px -16px rgba(15,16,18,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            // Pad the top with safe-area when at full snap so the drag
            // handle clears the iOS status bar / Dynamic Island. At
            // smaller snaps the safe-area is below the drawer top edge.
            paddingTop: snap === 1 ? 'env(safe-area-inset-top, 0px)' : 0,
          }}
        >
          {/* Drag handle — Vaul styles this and wires the pointer events. */}
          <div
            style={{
              flexShrink: 0,
              padding: '10px 0 8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'grab',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <Drawer.Handle
              style={{
                width: 40,
                height: 5,
                borderRadius: 999,
                background: handleC,
                margin: 0,
              }}
            />
          </div>

          {/* Visually-hidden title for a11y — Vaul + Radix Dialog requires
              a Title for accessible labelling, even on a non-modal sheet. */}
          <Drawer.Title
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            Chat with Yulia
          </Drawer.Title>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
                data-vaul-no-drag={isEmpty ? undefined : ''}
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  // Vaul: mark scrollable region with [data-vaul-no-drag]
                  // when there's content so internal scrolling wins; when
                  // empty, drag can take over.
                }}
              >
                {messages}
                {/* Drawer-context greeting — small, at the bottom of the
                    empty conversation. NOT a giant hero (that page-feel
                    was what the user said to nuke). */}
                {isEmpty && greeting && (
                  <div
                    style={{
                      padding: '12px 18px 6px',
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
              </div>
            )}

            <div
              className="chat-pill-mobile-container"
              data-vaul-no-drag=""
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
