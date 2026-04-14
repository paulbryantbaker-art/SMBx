/**
 * SignInSheet — Vaul sheet for logged-out users. Mirrors the logged-in
 * AccountSheet aesthetic (card-style rows) so the top-right icon feels
 * consistent regardless of auth state.
 */

import { Drawer } from 'vaul';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  /** Navigate the app to the sign-in flow (currently the /login page). */
  onSignIn: () => void;
  /** Optional — open the sign-up flow; falls back to onSignIn if unset. */
  onSignUp?: () => void;
}

export function SignInSheet({ open, onOpenChange, dark, onSignIn, onSignUp }: Props) {
  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const rowBd = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const pinkC = dark ? PINK_DARK : PINK;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            maxHeight: '70dvh',
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

          {/* Header */}
          <div style={{
            padding: '12px 18px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: `1px solid ${borderC}`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(135deg, ${pinkC}, ${PINK_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'Sora, system-ui', fontSize: 26, fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(212,74,120,0.28)',
            }}>
              X
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Drawer.Title asChild>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Sora, system-ui',
                  fontSize: 18, fontWeight: 800,
                  letterSpacing: '-0.01em',
                  color: headingC,
                }}>
                  Sign in to smbx.ai
                </h2>
              </Drawer.Title>
              <p style={{
                margin: '2px 0 0',
                fontFamily: 'Inter, system-ui',
                fontSize: 13, fontWeight: 500,
                color: mutedC,
              }}>
                Track your deals, pick up where you left off
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: '14px 14px calc(20px + env(safe-area-inset-bottom))',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <button
              onClick={() => { onOpenChange(false); onSignIn(); }}
              type="button"
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                border: 'none',
                background: pinkC,
                color: '#fff',
                fontFamily: 'Inter, system-ui',
                fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 6px 18px rgba(212,74,120,0.28)',
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => { onOpenChange(false); (onSignUp || onSignIn)(); }}
              type="button"
              style={{
                padding: '13px 16px',
                borderRadius: 14,
                border: `1px solid ${rowBd}`,
                background: rowBg,
                color: headingC,
                fontFamily: 'Inter, system-ui',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Create an account
            </button>
            <p style={{
              marginTop: 4,
              textAlign: 'center',
              fontFamily: 'Inter, system-ui',
              fontSize: 12,
              color: mutedC,
              fontWeight: 500,
            }}>
              Browsing works fine without an account — Yulia's free to chat.
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default SignInSheet;
