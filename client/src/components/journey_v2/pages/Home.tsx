/**
 * Glass Grok v2 · Home.tsx — the root landing page (/)
 *
 * New hero per SITE_COPY.md (April 2026): "The AI deal team."
 * Canvas holds 4 big journey launch cards + trust bar. No walkthrough
 * — the walkthroughs live on /sell, /buy, /raise, /integrate. This
 * page is the front door, not the pitch.
 */
import { useEffect, useState } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

/* Rotating placeholder hints — cycle every 4s inside JourneyChat's
   composer. Implemented via prop until the chat composer gains a
   proper rotating-hint feature. */
const PLACEHOLDERS = [
  'Screen a deal in 90 seconds…',
  'Find the add-backs hiding in your financials…',
  'Draft a CIM from a conversation…',
  'Model an SBA structure under SOP 50 10 8…',
  'Build your LP update in 20 minutes…',
  "What's this business actually worth…",
] as const;

const CHIPS = [
  'Sell my business',
  'Buy a business',
  'Raise capital',
  'Just acquired',
] as const;

const CHIP_TO_TAB: Record<string, DealTab> = {
  'Sell my business': 'sell',
  'Buy a business': 'buy',
  'Raise capital': 'raise',
  'Just acquired': 'integrate',
};

type LaunchCard = {
  tab: DealTab;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

const LAUNCH: readonly LaunchCard[] = [
  { tab: 'sell',      eyebrow: '01 · SELL',      title: 'Know what you have before anyone else does.',      body: 'Valuation. Add-backs. CIM. Competitive process. From first conversation to wire transfer.',        cta: 'Walk through a sell-side deal →' },
  { tab: 'buy',       eyebrow: '02 · BUY',       title: 'Screen ten deals in the time it takes to screen one.', body: '90-second Rundown. SBA SOP 50 10 8 structuring. Personal-guarantee stress test. Before you sign.', cta: 'Walk through a buy-side deal →' },
  { tab: 'raise',     eyebrow: '03 · RAISE',     title: "You don't have to sell 100% to get liquidity.",     body: 'Minority equity. ESOP. Mezzanine. Recap. Six structures modeled against your numbers.',           cta: 'Compare capital structures →' },
  { tab: 'integrate', eyebrow: '04 · INTEGRATE', title: 'Day 1 after the wire. Do you have a plan?',          body: '180-day PMI plan auto-generated from your DD. Retention, quick wins, thesis tracking.',             cta: 'See the Day-1 plan →' },
];

export default function Home({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const [hintIdx, setHintIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setHintIdx((i) => (i + 1) % PLACEHOLDERS.length), 4000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      chat={{
        title: 'Yulia',
        status: 'Ready to think',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. Tell me what you're working on and I'll show you the shortest path to the answer. Or pick a journey on the right.",
        reply: 'I can take it from here. To work the real deal, tell me <strong>industry</strong>, <strong>revenue</strong>, and <strong>reported EBITDA</strong> — or paste a listing URL.',
        chips: CHIPS,
        placeholder: PLACEHOLDERS[hintIdx],
        onSend: (text) => {
          const dest = CHIP_TO_TAB[text as keyof typeof CHIP_TO_TAB];
          if (dest) {
            onNavigate(dest);
            return;
          }
          onSend(text);
        },
      }}
    >
      {/* Hero */}
      <div style={{ padding: '24px 0 8px', animation: 'home-hero-in 700ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          color: 'var(--v4-mute)',
          textTransform: 'uppercase',
          marginBottom: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22A755',
            animation: 'home-live-dot 1.8s ease-in-out infinite',
          }} />
          smbX · The AI investment bank
        </div>
        <h1 style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
          margin: 0,
          color: 'var(--v4-ink)',
          background: 'linear-gradient(180deg, #0A0A0B 0%, #3A3A3E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          The AI deal team.
        </h1>
        <p style={{
          maxWidth: 680,
          marginTop: 22,
          fontSize: 17,
          lineHeight: 1.55,
          color: '#3A3A3E',
        }}>
          Valuations. CIMs. Deal scoring. Financial models. Due diligence. LOIs. Everything an investment bank delivers — without the retainer.
        </p>
        <style>{`
          @keyframes home-hero-in {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes home-live-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
          }
          @keyframes home-card-in {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* 4 journey launchers — staggered fade-in, hover lift */}
      <div style={{
        marginTop: 40,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
      }}>
        {LAUNCH.map((c, i) => (
          <button
            key={c.tab}
            type="button"
            onClick={() => onNavigate(c.tab)}
            style={{
              textAlign: 'left',
              background: '#fff',
              border: '0.5px solid rgba(0,0,0,0.08)',
              borderRadius: 16,
              padding: '28px 26px 24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              font: 'inherit',
              transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms, border-color 180ms',
              animation: `home-card-in 520ms cubic-bezier(0.22, 1, 0.36, 1) ${120 + i * 80}ms both`,
              minHeight: 180,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0A0A0B';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Big faded number in corner */}
            <div style={{
              position: 'absolute',
              right: -6,
              bottom: -18,
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              fontSize: 110,
              letterSpacing: '-0.05em',
              color: 'rgba(10,10,11,0.04)',
              lineHeight: 0.9,
              pointerEvents: 'none',
            }}>{c.eyebrow.split(' · ')[0]}</div>
            <div style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 10.5,
              letterSpacing: '0.14em',
              color: 'var(--v4-mute)',
              textTransform: 'uppercase',
              position: 'relative',
            }}>{c.eyebrow}</div>
            <div style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: 'var(--v4-ink)',
              position: 'relative',
            }}>{c.title}</div>
            <div style={{
              fontSize: 13,
              lineHeight: 1.55,
              color: '#3A3A3E',
              position: 'relative',
            }}>{c.body}</div>
            <div style={{
              marginTop: 'auto',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: 12.5,
              color: '#D44A78',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              position: 'relative',
            }}>{c.cta}</div>
          </button>
        ))}
      </div>

      {/* Trust bar */}
      <div style={{
        marginTop: 44,
        paddingTop: 22,
        borderTop: '0.5px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 9.5,
          letterSpacing: '0.16em',
          color: 'var(--v4-mute)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>Data sources</div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 22px',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 12.5,
          color: 'var(--v4-ink-2)',
        }}>
          {['U.S. Census', 'BLS', 'FRED', 'SEC EDGAR', 'SBA', 'IRS SOI'].map((s, i, arr) => (
            <span key={s} style={{ display: 'inline-flex', gap: '6px 22px' }}>
              {s}{i < arr.length - 1 && <span style={{ color: 'var(--v4-card-line)' }}>·</span>}
            </span>
          ))}
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 11.5,
          color: '#6B6B70',
          maxWidth: 560,
          lineHeight: 1.5,
        }}>
          Every number Yulia quotes traces back to public federal data. Cited, auditable, defensible.
        </div>
      </div>
    </JourneyShell>
  );
}
