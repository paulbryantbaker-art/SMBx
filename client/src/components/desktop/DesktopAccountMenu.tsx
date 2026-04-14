/**
 * DesktopAccountMenu — top-right account/identity surface for desktop.
 *
 * Mirrors the mobile AccountSheet but renders as a popover anchored to the
 * top-right of the viewport. Three states: loading skeleton, signed-in
 * avatar (click → menu), signed-out "Sign in" pill (click → /login).
 *
 * Why this lives here, not in the sidebar: users expect identity in the
 * top-right corner — banking apps, SaaS, even Apple's own services do this.
 * The sidebar is for navigation and tools, not "who am I".
 */

import { useEffect, useRef, useState } from 'react';

interface MenuUser {
  display_name?: string | null;
  email?: string | null;
  plan?: string | null;
}

interface Props {
  loading: boolean;
  user: MenuUser | null;
  dark: boolean;
  onSignIn: () => void;
  onToggleDark: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSignOut: () => void;
}

export default function DesktopAccountMenu({
  loading, user, dark,
  onSignIn, onToggleDark, onOpenSettings, onOpenHelp, onSignOut,
}: Props) {
  const [open, setOpen] = useState(false);
  const [signOutArmed, setSignOutArmed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const armTimerRef = useRef<number | null>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Reset two-tap signout state when menu closes
  useEffect(() => {
    if (!open) {
      setSignOutArmed(false);
      if (armTimerRef.current) { window.clearTimeout(armTimerRef.current); armTimerRef.current = null; }
    }
    return () => { if (armTimerRef.current) window.clearTimeout(armTimerRef.current); };
  }, [open]);

  const handleSignOutClick = () => {
    if (!signOutArmed) {
      setSignOutArmed(true);
      armTimerRef.current = window.setTimeout(() => setSignOutArmed(false), 4000);
      return;
    }
    setOpen(false);
    onSignOut();
  };

  const initial = user?.display_name?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || '?';
  const planLabel = user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free';

  // ─── Anchored top-right of viewport ───
  const anchorStyle: React.CSSProperties = {
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 60,
  };

  if (loading) {
    return (
      <div aria-hidden style={anchorStyle}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,16,18,0.06)',
            animation: 'desktopAuthPulse 1.4s ease-in-out infinite',
          }}
        />
        <style>{`@keyframes desktopAuthPulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }`}</style>
      </div>
    );
  }

  // ─── Signed out ───
  if (!user) {
    return (
      <div style={anchorStyle}>
        <button
          onClick={onSignIn}
          type="button"
          className="desktop-account-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px 8px 12px',
            borderRadius: 999,
            border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid #E5E1D9',
            background: dark ? '#1A1C1E' : '#FFFFFF',
            color: dark ? '#F0F0F3' : '#1A1C1E',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: dark
              ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)'
              : '0 1px 2px rgba(60,55,45,0.06), 0 4px 12px rgba(60,55,45,0.06)',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17, color: dark ? '#E8709A' : '#D44A78' }}>login</span>
          Sign in
        </button>
        <style>{`
          .desktop-account-pill:hover { transform: translateY(-1px); }
          .desktop-account-pill:active { transform: translateY(0); }
        `}</style>
      </div>
    );
  }

  // ─── Signed in: avatar + popover ───
  const headingC = dark ? '#F0F0F3' : '#1A1C1E';
  const mutedC = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const borderC = dark ? 'rgba(255,255,255,0.08)' : '#E5E1D9';
  const rowHover = dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)';
  const dangerC = '#D44A4A';
  const dangerArmedBg = dark ? 'rgba(212,74,74,0.14)' : 'rgba(212,74,74,0.08)';

  return (
    <div ref={wrapperRef} style={anchorStyle}>
      <button
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Account"
        className="desktop-account-avatar"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid #E5E1D9',
          background: 'linear-gradient(135deg, #D44A78 0%, #C99A3E 100%)',
          color: '#FFFFFF',
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          boxShadow: dark
            ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)'
            : '0 1px 2px rgba(60,55,45,0.06), 0 4px 12px rgba(60,55,45,0.06)',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
        }}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 280,
            background: dark ? '#151617' : '#FFFFFF',
            border: `1px solid ${borderC}`,
            borderRadius: 14,
            boxShadow: dark
              ? '0 1px 2px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35)'
              : '0 1px 2px rgba(60,55,45,0.06), 0 12px 32px rgba(60,55,45,0.10)',
            overflow: 'hidden',
            animation: 'desktopAccountIn 140ms ease',
          }}
        >
          {/* Profile header */}
          <div style={{ padding: '14px 14px 12px', borderBottom: `1px solid ${borderC}` }}>
            <div style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: headingC,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.display_name || user.email || 'You'}
            </div>
            {user.email && user.display_name && (
              <div style={{
                marginTop: 2,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12,
                color: mutedC,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </div>
            )}
            <div style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 8px',
              borderRadius: 999,
              background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.06)',
              color: dark ? '#E8709A' : '#D44A78',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              {planLabel} plan
            </div>
          </div>

          {/* Rows */}
          <div style={{ padding: 6 }}>
            <MenuRow
              icon={dark ? 'light_mode' : 'dark_mode'}
              label={dark ? 'Light mode' : 'Dark mode'}
              onClick={() => { onToggleDark(); /* keep open so user can compare */ }}
              hover={rowHover}
              text={headingC}
            />
            <MenuRow
              icon="settings"
              label="Settings"
              onClick={() => { setOpen(false); onOpenSettings(); }}
              hover={rowHover}
              text={headingC}
            />
            <MenuRow
              icon="help_outline"
              label="Help & glossary"
              onClick={() => { setOpen(false); onOpenHelp(); }}
              hover={rowHover}
              text={headingC}
            />
          </div>

          {/* Sign out */}
          <div style={{ padding: 6, borderTop: `1px solid ${borderC}` }}>
            <button
              onClick={handleSignOutClick}
              type="button"
              role="menuitem"
              className="desktop-account-row"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: signOutArmed ? dangerArmedBg : 'transparent',
                color: dangerC,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: signOutArmed ? 700 : 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: dangerC }}>logout</span>
              {signOutArmed ? 'Tap again to sign out' : 'Sign out'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .desktop-account-avatar:hover { transform: translateY(-1px); }
        .desktop-account-avatar:active { transform: translateY(0); }
        .desktop-account-row:hover { background: ${rowHover} !important; }
        @keyframes desktopAccountIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MenuRow({
  icon, label, onClick, hover, text,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  hover: string;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      role="menuitem"
      className="desktop-account-row"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        border: 'none',
        background: 'transparent',
        color: text,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hover; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18, opacity: 0.78 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
