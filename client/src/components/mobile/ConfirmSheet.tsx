/**
 * ConfirmSheet — small Vaul sheet for confirming a destructive action.
 *
 * Used app-wide via the global confirm() helper in lib/confirm.ts, so any
 * component can request a confirmation without building its own modal.
 */

import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import * as Dialog from '@radix-ui/react-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  title: string;
  body?: string;
  /** Defaults to "Confirm" */
  confirmLabel?: string;
  /** Defaults to "Cancel" */
  cancelLabel?: string;
  /** When true, confirm button uses destructive (red) styling */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmSheet({
  open, onOpenChange, dark,
  title, body,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = false,
  onConfirm, onCancel,
}: Props) {
  // Viewport breakpoint — bottom sheet on mobile, centered modal on desktop.
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const pinkC = dark ? '#E8709A' : '#D44A78';
  const dangerC = '#D44A4A';
  const confirmBg = destructive ? dangerC : pinkC;

  const handleConfirm = () => { onOpenChange(false); onConfirm(); };
  const handleCancel = () => { onOpenChange(false); onCancel?.(); };

  // Desktop path: centered modal via Radix Dialog. Same visual language —
  // rounded card, destructive vs pink button, title + body.
  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,16,18,0.45)',
            zIndex: 220,
            animation: 'confirmOverlayIn 120ms ease',
          }} />
          <Dialog.Content
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(440px, calc(100vw - 32px))',
              background: bg,
              border: `1px solid ${borderC}`,
              borderRadius: 16,
              boxShadow: dark
                ? '0 1px 2px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5)'
                : '0 1px 2px rgba(60,55,45,0.08), 0 24px 48px rgba(60,55,45,0.18)',
              zIndex: 230,
              outline: 'none',
              animation: 'confirmContentIn 160ms ease',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '22px 24px 18px' }}>
              <Dialog.Title asChild>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Sora, system-ui',
                  fontSize: 18, fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: headingC, lineHeight: 1.25,
                }}>
                  {title}
                </h2>
              </Dialog.Title>
              {body && (
                <Dialog.Description asChild>
                  <p style={{
                    margin: '8px 0 0',
                    fontFamily: 'Inter, system-ui',
                    fontSize: 13.5, lineHeight: 1.5,
                    color: bodyC,
                  }}>
                    {body}
                  </p>
                </Dialog.Description>
              )}
            </div>
            <div style={{
              padding: '12px 14px 14px',
              display: 'flex',
              gap: 10,
              borderTop: `1px solid ${borderC}`,
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleCancel}
                type="button"
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  border: `1px solid ${borderC}`,
                  background: rowBg,
                  color: headingC,
                  fontFamily: 'Inter, system-ui',
                  fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                type="button"
                autoFocus
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: confirmBg,
                  color: '#fff',
                  fontFamily: 'Inter, system-ui',
                  fontSize: 13.5, fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: destructive
                    ? '0 6px 18px rgba(212,74,74,0.28)'
                    : '0 6px 18px rgba(212,74,120,0.28)',
                }}
              >
                {confirmLabel}
              </button>
            </div>
            <style>{`
              @keyframes confirmOverlayIn { from { opacity: 0 } to { opacity: 1 } }
              @keyframes confirmContentIn { from { opacity: 0; transform: translate(-50%, calc(-50% + 4px)) scale(0.98); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
            `}</style>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 110 }} />
        <Drawer.Content
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            maxHeight: '50dvh',
            background: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 120,
            outline: 'none',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.16)' }} />
          </div>

          {/* Title + body */}
          <div style={{ padding: '12px 22px 18px' }}>
            <Drawer.Title asChild>
              <h2 style={{
                margin: 0,
                fontFamily: 'Sora, system-ui',
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: headingC,
                lineHeight: 1.25,
              }}>
                {title}
              </h2>
            </Drawer.Title>
            {body && (
              <p style={{
                margin: '8px 0 0',
                fontFamily: 'Inter, system-ui',
                fontSize: 14,
                lineHeight: 1.5,
                color: bodyC,
              }}>
                {body}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{
            padding: '8px 14px calc(20px + env(safe-area-inset-bottom))',
            display: 'flex',
            gap: 10,
            borderTop: `1px solid ${borderC}`,
          }}>
            <button
              onClick={handleCancel}
              type="button"
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: 14,
                border: `1px solid ${borderC}`,
                background: rowBg,
                color: headingC,
                fontFamily: 'Inter, system-ui',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              type="button"
              autoFocus
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: 14,
                border: 'none',
                background: confirmBg,
                color: '#fff',
                fontFamily: 'Inter, system-ui',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: destructive
                  ? '0 6px 18px rgba(212,74,74,0.28)'
                  : '0 6px 18px rgba(212,74,120,0.28)',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default ConfirmSheet;
