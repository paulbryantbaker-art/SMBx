/**
 * MobileComingSoon — logged-out mobile placeholder.
 *
 * Mobile marketing is deferred until the App Store metaphor (deals-as-apps)
 * is mocked. For now, logged-out mobile visitors see a single screen
 * pointing them at desktop. Logged-in mobile users still hit
 * AppShellInner via the normal flow.
 */

import { useState } from 'react';

interface Props {
  dark: boolean;
}

export default function MobileComingSoon({ dark }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Cowork DL — warm cream surface + clay accent. */
  const bg = dark ? '#1a1918' : '#faf9f5';
  const textPrimary = dark ? '#f5f4ed' : '#1a1918';
  const textMuted = dark ? 'rgba(245,244,237,0.62)' : '#5e5d59';
  const textSubtle = dark ? 'rgba(245,244,237,0.38)' : '#87867f';
  const cardBg = dark ? '#1f1e1d' : '#ffffff';
  const border = dark ? 'rgba(245,244,237,0.08)' : '#e8e6dc';
  const accentFill = '#D4714E';   /* Clay */
  const accentText = '#ffffff';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email');
      return;
    }
    try {
      await fetch('/api/waitlist/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, surface: 'mobile' }),
      }).catch(() => { /* non-blocking — the UI still confirms */ });
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 24px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 48px)',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            fontFamily: "'Figtree', system-ui, sans-serif",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: textPrimary,
            marginBottom: 40,
          }}
        >
          smbx.ai
        </div>

        <div
          style={{
            fontFamily: "'Figtree', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: textSubtle,
            marginBottom: 20,
          }}
        >
          Desktop Beta
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 44,
            fontWeight: 400,
            lineHeight: 1.04,
            letterSpacing: '-0.015em',
            color: textPrimary,
            margin: 0,
            marginBottom: 18,
            textWrap: 'balance',
          }}
        >
          Mobile is coming.<br />
          <span style={{ color: textMuted, fontStyle: 'italic' }}>Desktop is ready.</span>
        </h1>

        <p
          style={{
            fontFamily: "'Figtree', system-ui, sans-serif",
            fontSize: 15,
            lineHeight: 1.55,
            color: textMuted,
            margin: 0,
            marginBottom: 32,
            letterSpacing: '-0.005em',
          }}
        >
          We&rsquo;re building the mobile experience to feel like the App Store &mdash; where every deal you&rsquo;re running is its own app. Until then, open smbx on a desktop to talk to Yulia.
        </p>

        {submitted ? (
          <div
            style={{
              padding: '18px 20px',
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 14,
              fontFamily: "'Figtree', system-ui, sans-serif",
              fontSize: 14,
              lineHeight: 1.55,
              color: textPrimary,
              letterSpacing: '-0.005em',
            }}
          >
            We&rsquo;ll ping you when mobile ships. Until then, <span style={{ fontWeight: 600 }}>smbx.ai</span> is the URL on a laptop.
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label
              htmlFor="mobile-waitlist-email"
              style={{
                fontFamily: "'Figtree', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: textSubtle,
                letterSpacing: '-0.005em',
              }}
            >
              Get notified when mobile ships
            </label>
            <input
              id="mobile-waitlist-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              placeholder="you@company.com"
              aria-invalid={!!error}
              style={{
                padding: '14px 16px',
                background: cardBg,
                border: `1px solid ${error ? (dark ? '#ec9d78' : '#B85A3A') : border}`,
                borderRadius: 12,
                fontFamily: "'Figtree', system-ui, sans-serif",
                fontSize: 16,
                color: textPrimary,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'border-color 0.15s ease',
              }}
            />
            {error && (
              <div
                style={{
                  fontFamily: "'Figtree', system-ui, sans-serif",
                  fontSize: 12,
                  color: dark ? '#ec9d78' : '#B85A3A',
                  letterSpacing: '-0.005em',
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                padding: '14px 20px',
                background: accentFill,
                color: accentText,
                border: 'none',
                borderRadius: 12,
                fontFamily: "'Figtree', system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '-0.005em',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Notify me
            </button>
          </form>
        )}
      </div>

      <div
        style={{
          fontFamily: "'Figtree', system-ui, sans-serif",
          fontSize: 11,
          color: textSubtle,
          textAlign: 'center',
          letterSpacing: '-0.005em',
          marginTop: 40,
        }}
      >
        smbX is software. Yulia is a tool. You keep the judgment.
      </div>
    </div>
  );
}
