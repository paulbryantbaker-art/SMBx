/**
 * AccountSheet — Vaul sheet containing account actions that used to live
 * in the hamburger menu (removed from mobile). Accessed via a small
 * top-right avatar button on mobile.
 *
 * Card-style action rows: profile summary at top, then toggles and
 * navigation rows, sign-out at the bottom. Matches the Wallet-home
 * aesthetic — everything is a tap-able card, no menu bar needed.
 */

import { Drawer } from 'vaul';
import { useEffect, useRef, useState } from 'react';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  user: {
    display_name?: string | null;
    email?: string | null;
    plan?: string | null;
  } | null;
  onToggleDark: () => void;
  onSignOut: () => void;
  /** Optional hooks for future destinations */
  onOpenSettings?: () => void;
  onOpenSubscription?: () => void;
  onOpenSupport?: () => void;
}

export function AccountSheet({
  open,
  onOpenChange,
  dark,
  user,
  onToggleDark,
  onSignOut,
  onOpenSettings,
  onOpenSubscription,
  onOpenSupport,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setScrolled(false);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  const bg = dark ? '#151617' : '#fefefe';
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.08)';
  const rowBg = dark ? '#1f2123' : '#ffffff';
  const rowBd = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)';
  const pinkC = dark ? PINK_DARK : PINK;
  const dangerC = '#D44A4A';

  const initials = (user?.display_name || user?.email || 'Y').trim().charAt(0).toUpperCase();
  const displayName = user?.display_name || user?.email?.split('@')[0] || 'You';
  const email = user?.email || '';
  const plan = (user?.plan || 'free').toLowerCase();
  const planLabel = plan === 'free' ? 'Free' : plan === 'starter' ? 'Starter' : plan === 'professional' ? 'Professional' : plan === 'enterprise' ? 'Enterprise' : 'Free';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 90 }} />
        <Drawer.Content
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '82dvh',
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

          {/* Profile header */}
          <div style={{
            padding: '12px 18px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: scrolled ? `1px solid ${borderC}` : '1px solid transparent',
            transition: 'border-color 200ms',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(135deg, ${pinkC}, ${PINK_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              fontFamily: 'Sora, system-ui',
              fontSize: 24,
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(212,74,120,0.28)',
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Drawer.Title asChild>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Sora, system-ui',
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  color: headingC,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </h2>
              </Drawer.Title>
              {email && (
                <p style={{
                  margin: '2px 0 0',
                  fontFamily: 'Inter, system-ui',
                  fontSize: 13,
                  fontWeight: 500,
                  color: mutedC,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {email}
                </p>
              )}
            </div>
          </div>

          {/* Action rows */}
          <div
            ref={scrollRef}
            onScroll={(e) => setScrolled((e.currentTarget as HTMLDivElement).scrollTop > 8)}
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '14px 14px calc(14px + env(safe-area-inset-bottom))',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Plan card */}
            <Row
              icon="workspace_premium"
              label={`${planLabel} plan`}
              sublabel={plan === 'free' ? 'Upgrade for unlimited analyses' : 'Manage your subscription'}
              onClick={onOpenSubscription}
              accent={pinkC}
              bg={rowBg}
              border={rowBd}
              heading={headingC}
              muted={mutedC}
              chevron
            />

            {/* Dark mode toggle */}
            <ToggleRow
              icon={dark ? 'dark_mode' : 'light_mode'}
              label="Dark mode"
              active={dark}
              onToggle={onToggleDark}
              accent={pinkC}
              bg={rowBg}
              border={rowBd}
              heading={headingC}
            />

            {onOpenSettings && (
              <Row
                icon="tune"
                label="Settings"
                onClick={onOpenSettings}
                accent={pinkC}
                bg={rowBg}
                border={rowBd}
                heading={headingC}
                muted={mutedC}
                chevron
              />
            )}

            {onOpenSupport && (
              <Row
                icon="help_outline"
                label="Help & support"
                onClick={onOpenSupport}
                accent={pinkC}
                bg={rowBg}
                border={rowBd}
                heading={headingC}
                muted={mutedC}
                chevron
              />
            )}

            {/* Sign out — destructive, visual break above */}
            <div style={{ height: 6 }} />
            <button
              onClick={() => { onOpenChange(false); onSignOut(); }}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
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
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: dangerC }}>
                logout
              </span>
              Sign out
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ═══ ROW HELPERS ═══ */

function Row({
  icon, label, sublabel, onClick, chevron,
  accent, bg, border, heading, muted,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  chevron?: boolean;
  accent: string;
  bg: string;
  border: string;
  heading: string;
  muted: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      disabled={!onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        cursor: onClick ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
        opacity: onClick ? 1 : 0.7,
        textAlign: 'left',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: accent, flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Inter, system-ui', fontSize: 15, fontWeight: 600, color: heading,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            marginTop: 2, fontFamily: 'Inter, system-ui', fontSize: 12, fontWeight: 500, color: muted,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {sublabel}
          </div>
        )}
      </div>
      {chevron && onClick && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      )}
    </button>
  );
}

function ToggleRow({
  icon, label, active, onToggle,
  accent, bg, border, heading,
}: {
  icon: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  accent: string;
  bg: string;
  border: string;
  heading: string;
}) {
  return (
    <button
      onClick={onToggle}
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: accent, flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{
        flex: 1,
        fontFamily: 'Inter, system-ui', fontSize: 15, fontWeight: 600, color: heading,
      }}>
        {label}
      </div>
      {/* iOS-style switch */}
      <div
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          background: active ? accent : 'rgba(120,120,128,0.32)',
          position: 'relative',
          transition: 'background 220ms',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: active ? 20 : 2,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15), 0 2px 1px rgba(0,0,0,0.08)',
            transition: 'left 220ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        />
      </div>
    </button>
  );
}

export default AccountSheet;
