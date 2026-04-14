/**
 * ConfirmSheet — small Vaul sheet for confirming a destructive action.
 *
 * Used app-wide via the global confirm() helper in lib/confirm.ts, so any
 * component can request a confirmation without building its own modal.
 */

import { Drawer } from 'vaul';

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
