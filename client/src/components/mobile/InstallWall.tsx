/**
 * InstallWall — full-screen gate shown to logged-in mobile users who
 * haven't installed smbx.ai as a PWA.
 *
 * The policy (see architecture_pwa_only.md in memory):
 *   - Logged-out users browse marketing, journeys, and anon chat freely
 *     in Safari — no wall.
 *   - Once a user has an account AND is on mobile Safari, they hit this
 *     wall. The real app lives in the installed PWA.
 *
 * Why PWA-only for logged-in use:
 *   - Push notifications for deal flow (iOS 16.4+ supports this via Web
 *     Push — only inside installed PWAs)
 *   - Home-screen icon + badge count → feels like a real tool
 *   - Free from Safari's left-edge swipe, URL bar jitter, tab eviction
 *   - One gesture vocabulary instead of two
 *
 * Deep-link capture: the URL the user was trying to reach is stored in
 * localStorage. When they open the installed PWA for the first time,
 * AppShell reads the stored target and navigates there. See the
 * usePwaDeepLink hook wired in AppShell.
 */

import { useEffect, useState } from 'react';

const DEEP_LINK_KEY = 'pwa_install_target';
const AUTH_FRESH_KEY = 'smbx_auth_fresh';
const AUTH_FRESH_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const PWA_DEEP_LINK_KEY = DEEP_LINK_KEY;

interface Props {
  dark: boolean;
  /** User's display name, used in the copy. */
  userName?: string | null;
}

export default function InstallWall({ dark, userName }: Props) {
  // Capture the intended destination so the PWA can restore it on launch.
  useEffect(() => {
    try {
      const target = window.location.pathname + window.location.search + window.location.hash;
      if (target && target !== '/') {
        localStorage.setItem(DEEP_LINK_KEY, target);
      }
    } catch { /* noop */ }
  }, []);

  // Detect a "fresh auth" window — user just signed up/logged in. Changes
  // the headline + sub to read as a celebration + clear next step rather
  // than a neutral "welcome back." Flag is set by the Google OAuth
  // callback in App.tsx and expires after 5 minutes.
  const [isFreshAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_FRESH_KEY);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      if (!Number.isFinite(ts)) return false;
      const fresh = Date.now() - ts < AUTH_FRESH_TTL_MS;
      // Clear so it only shows once
      if (fresh) localStorage.removeItem(AUTH_FRESH_KEY);
      return fresh;
    } catch { return false; }
  });

  const pageBg = dark ? '#0f1012' : '#F9F9FC';
  const cardBg = dark ? 'rgba(26,28,30,0.82)' : 'rgba(255,255,255,0.88)';
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,16,18,0.08)';
  const heading = dark ? '#F9F9FC' : '#0f1012';
  const body = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const muted = dark ? 'rgba(218,218,220,0.55)' : '#6e6a63';
  const accent = dark ? '#E8709A' : '#D44A78';

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Install smbx.ai to continue"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: pageBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <img
        src={dark ? '/X-white.png' : '/X.png'}
        alt="smbx.ai"
        draggable={false}
        style={{
          height: 72,
          marginBottom: 28,
          objectFit: 'contain',
          animation: 'installWallLogo 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      />

      {/* Headline — celebratory on fresh auth, neutral on return visits */}
      {isFreshAuth && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 10,
          }}
        >
          <span aria-hidden style={{ marginRight: 6 }}>✓</span>
          Account created
        </p>
      )}
      <h1
        style={{
          margin: 0,
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: 'clamp(28px, 7vw, 34px)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          color: heading,
          textAlign: 'center',
          maxWidth: 320,
          marginBottom: 12,
        }}
      >
        {isFreshAuth
          ? (userName ? `You're in, ${userName.split(' ')[0]}.` : "You're in.")
          : (userName ? `Welcome back, ${userName.split(' ')[0]}.` : 'One more step.')}
      </h1>

      {/* Subhead */}
      <p
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.5,
          color: body,
          textAlign: 'center',
          maxWidth: 320,
          marginBottom: 28,
        }}
      >
        {isFreshAuth
          ? 'One more step — install smbx.ai to start your first deal. Takes about 10 seconds.'
          : 'smbx.ai runs as an installed app on your phone — for notifications on deal movement, faster loading, and no browser chrome in your way.'}
      </p>

      {/* Instructions card — Apple Glass material */}
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: cardBg,
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 20,
          boxShadow: dark
            ? '0 20px 40px -20px rgba(0,0,0,0.6)'
            : '0 20px 40px -20px rgba(15,16,18,0.18)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 14,
          }}
        >
          Install in 3 taps
        </p>

        <Step num={1} body={
          <>Tap the <ShareIcon color={accent} /> <strong style={{ color: heading }}>Share</strong> button at the bottom of Safari.</>
        } color={heading} muted={muted} />

        <Step num={2} body={
          <>Scroll down and tap <strong style={{ color: heading }}>Add to Home Screen</strong>.</>
        } color={heading} muted={muted} />

        <Step num={3} body={
          <>Tap <strong style={{ color: heading }}>Add</strong> in the top-right, then open smbx.ai from your home screen.</>
        } color={heading} muted={muted} last />
      </div>

      {/* Footer — soft reassurance */}
      <p
        style={{
          margin: '20px 0 0',
          fontSize: 12,
          color: muted,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        Your session is saved. When you open the installed app, you'll land
        right where you left off.
      </p>

      <style>{`
        @keyframes installWallLogo {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function Step({ num, body, color, muted, last }: {
  num: number;
  body: React.ReactNode;
  color: string;
  muted: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        paddingBottom: last ? 0 : 14,
        marginBottom: last ? 0 : 14,
        borderBottom: last ? 'none' : `1px solid ${muted}20`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 22, height: 22, borderRadius: 11,
          background: `${muted}22`,
          color: muted,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 800,
          marginTop: 1,
        }}
      >
        {num}
      </span>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color, flex: 1 }}>
        {body}
      </p>
    </div>
  );
}

function ShareIcon({ color }: { color: string }) {
  // iOS Safari share glyph — up arrow out of a rectangle
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ verticalAlign: '-2px', display: 'inline-block', margin: '0 2px' }}
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}
