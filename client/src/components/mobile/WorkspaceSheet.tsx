/**
 * WorkspaceSheet — Vaul modal sheet for workspace switching.
 *
 * Replaces the previous behavior where the workspace pill opened the
 * AccountSheet (redundant with the top-right avatar). User's words:
 * "this should be a workspace switcher".
 *
 * Pattern mirrors AccountSheet exactly (Vaul modal Drawer + Overlay
 * + Content + drag handle). Same look-and-feel as AccountSheet and
 * StarterSheet so the mobile sheet vocabulary stays consistent.
 *
 * Content:
 *   - Active workspace (with checkmark)
 *   - Other workspaces (none yet — backend has no multi-workspace model)
 *   - "Add workspace" affordance (disabled placeholder for now)
 *   - "Open account & settings" footer → calls onOpenAccount which the
 *     parent wires to the existing AccountSheet
 */

import { Drawer } from 'vaul';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  user: {
    display_name?: string | null;
    email?: string | null;
  } | null;
  /** Called when user taps the "Account & settings" footer row — opens
      AccountSheet (the existing toggles + sign-out destination). */
  onOpenAccount: () => void;
}

export function WorkspaceSheet({
  open, onOpenChange, dark, user, onOpenAccount,
}: Props) {
  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const rowBd = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const accent = dark ? PINK_DARK : PINK;

  const initial = (user?.display_name || user?.email || 'Y').trim().charAt(0).toUpperCase();
  const displayName = user?.display_name || user?.email?.split('@')[0] || 'You';
  const workspaceLabel = `${displayName.split(' ')[0]}'s workspace`;
  const email = user?.email || '';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '70dvh',
            background: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            outline: 'none',
            boxShadow: dark
              ? '0 -24px 60px -12px rgba(0,0,0,0.7)'
              : '0 -24px 60px -12px rgba(15,16,18,0.25)',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{
              width: 40, height: 5, borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.22)' : 'rgba(15,16,18,0.18)',
            }} />
          </div>

          <Drawer.Title
            style={{
              position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
              overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
            }}
          >Switch workspace</Drawer.Title>

          {/* Header label */}
          <div style={{ padding: '8px 20px 4px' }}>
            <span style={{
              fontFamily: 'Inter, system-ui',
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: mutedC,
            }}>Workspaces</span>
          </div>

          <div style={{ padding: '4px 16px 24px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            {/* Active workspace row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                marginBottom: 6,
                borderRadius: 14,
                background: rowBg,
                border: `1px solid ${rowBd}`,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accent}, ${dark ? '#AE6D9A' : '#E8709A'})`,
                  color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Sora', system-ui, sans-serif",
                  fontSize: 14, fontWeight: 800,
                  flexShrink: 0,
                }}
              >{initial}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 15, fontWeight: 700,
                  color: headingC,
                  letterSpacing: '-0.005em',
                  lineHeight: 1.3,
                }}>{workspaceLabel}</div>
                {email && (
                  <div style={{
                    fontFamily: 'Inter, system-ui',
                    fontSize: 12, fontWeight: 400,
                    color: mutedC,
                    lineHeight: 1.4,
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{email}</div>
                )}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Active">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Add workspace — disabled placeholder. Multi-workspace
                isn't in the backend yet (CLAUDE.md confirms single-user
                multi-deal model). When backend lands, wire onClick. */}
            <button
              type="button"
              disabled
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                marginBottom: 12,
                borderRadius: 14,
                background: 'transparent',
                border: `1px dashed ${borderC}`,
                cursor: 'not-allowed',
                opacity: 0.55,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `1px dashed ${mutedC}`,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: mutedC,
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 14, fontWeight: 600,
                  color: headingC,
                  lineHeight: 1.3,
                }}>Add workspace</div>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 12, color: mutedC, marginTop: 2,
                }}>Multi-workspace coming soon</div>
              </div>
            </button>

            {/* Divider */}
            <div style={{ height: 1, background: borderC, margin: '8px 4px' }} />

            {/* Account & settings — opens existing AccountSheet */}
            <button
              type="button"
              onClick={() => { onOpenChange(false); requestAnimationFrame(onOpenAccount); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                marginTop: 4,
                borderRadius: 14,
                background: rowBg,
                border: `1px solid ${rowBd}`,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
              className="active:scale-[0.98]"
            >
              <span
                aria-hidden
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.04)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: headingC,
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 15, fontWeight: 700,
                  color: headingC,
                  letterSpacing: '-0.005em',
                  lineHeight: 1.3,
                }}>Account & settings</div>
                <div style={{
                  fontFamily: 'Inter, system-ui',
                  fontSize: 12, color: mutedC, marginTop: 2,
                }}>Profile, theme, subscription, sign out</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mutedC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default WorkspaceSheet;
