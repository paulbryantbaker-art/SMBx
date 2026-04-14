/**
 * DealActionsSheet — quick-actions bottom sheet for a long-pressed deal
 * card. Pin / Mute / Share / Archive — visual scaffolding for now;
 * action wiring follows when the backend supports each operation.
 */

import { Drawer } from 'vaul';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  dealName?: string | null;
  onPin?: () => void;
  onMute?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
}

export function DealActionsSheet({ open, onOpenChange, dark, dealName, onPin, onMute, onShare, onArchive }: Props) {
  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const rowBd = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const dangerC = '#D44A4A';

  const actions = [
    { key: 'pin', icon: 'push_pin', label: 'Pin to top', handler: onPin },
    { key: 'share', icon: 'ios_share', label: 'Share deal link', handler: onShare },
    { key: 'mute', icon: 'notifications_off', label: 'Mute notifications', handler: onMute },
  ].filter(a => !!a.handler);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            maxHeight: '50dvh',
            background: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            outline: 'none',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{
              width: 40, height: 5, borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,16,18,0.16)',
            }} />
          </div>

          {dealName && (
            <Drawer.Title asChild>
              <h3 style={{
                margin: '8px 0 4px',
                padding: '0 18px',
                fontFamily: 'Sora, system-ui',
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: headingC,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {dealName}
              </h3>
            </Drawer.Title>
          )}

          <div style={{
            padding: '12px 14px calc(20px + env(safe-area-inset-bottom))',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {actions.map((a) => (
              <button
                key={a.key}
                onClick={() => { onOpenChange(false); a.handler?.(); }}
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: rowBg,
                  border: `1px solid ${rowBd}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  color: headingC,
                  fontFamily: 'Inter, system-ui',
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#D44A78' }}>
                  {a.icon}
                </span>
                {a.label}
              </button>
            ))}

            {onArchive && (
              <button
                onClick={() => { onOpenChange(false); onArchive(); }}
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: rowBg,
                  border: `1px solid ${rowBd}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  color: dangerC,
                  fontFamily: 'Inter, system-ui',
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: 'left',
                  marginTop: 4,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: dangerC }}>
                  archive
                </span>
                Archive deal
              </button>
            )}

            {actions.length === 0 && !onArchive && (
              <div style={{
                textAlign: 'center',
                padding: '20px 12px',
                fontFamily: 'Inter, system-ui',
                fontSize: 13,
                color: mutedC,
              }}>
                No quick actions yet — coming soon.
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default DealActionsSheet;
