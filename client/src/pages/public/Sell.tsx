import { useLocation } from 'wouter';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  bg: '#FAF9F7',
  terra: '#D4714E',
  terraHover: '#BE6342',
  terraSoft: '#FFF0EB',
  text: '#1A1A18',
  sub: '#44403C',
  muted: '#6E6A63',
  faint: '#A9A49C',
  border: '#DDD9D1',
};

const SELL_CHIPS = [
  { label: 'What\u2019s my business actually worth?', message: 'What\u2019s my business actually worth? I want to understand what it might be worth in today\u2019s market.' },
  { label: 'Find the add-backs I\u2019m missing', message: 'Find the add-backs I\u2019m missing. I want to make sure my financials reflect the true earnings of my business.' },
  { label: 'Walk me through a 12-month exit plan', message: 'Walk me through a 12-month exit plan. I want to understand the full process from start to close.' },
  { label: 'What would a buyer pay for my [industry] company?', message: 'What would a buyer pay for my company? I want to understand what it might be worth in today\u2019s market.' },
];

const JOURNEY_STAGES = [
  { title: 'Understand your number', desc: 'Preliminary valuation range based on your financials, industry multiples, and regional market data.' },
  { title: 'Know your market', desc: 'Competitive landscape, buyer demand, and how businesses like yours are trading in your metro.' },
  { title: 'Prepare your story', desc: 'Financial normalization, add-back identification, and the narrative that maximizes your sale price.' },
  { title: 'Find your buyer', desc: 'Buyer qualification, SBA pre-screening, and matching to the right type of acquirer for your business.' },
  { title: 'Close with confidence', desc: 'Deal structuring, negotiation intelligence, and diligence preparation to get from LOI to close.' },
];

const TRUST_SOURCES = ['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'IRS Statistics of Income', 'SBA Lending Data'];

export default function Sell() {
  const [, navigate] = useLocation();

  const startSell = () => navigate('/?sell=1');

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', background: T.bg, minHeight: '100dvh' }}>
      <style>{`
        .sell-section {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px;
        }
        @media (max-width: 768px) { .sell-section { padding: 56px 20px; } }

        .sell-divider {
          max-width: 960px; margin: 0 auto;
          border: none; border-top: 1px solid ${T.border};
        }

        .sell-overline {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: ${T.terra}; margin: 0 0 12px;
        }

        .sell-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.2;
        }
        @media (max-width: 768px) { .sell-heading { font-size: 24px; } }

        .sell-body {
          font-size: 16px; line-height: 1.7; color: ${T.sub};
          margin: 0 0 16px; max-width: 640px;
        }
        @media (max-width: 768px) { .sell-body { font-size: 15px; } }

        /* ── Topbar ── */
        .sell-topbar {
          height: 56px; padding: 0 20px;
          padding-top: env(safe-area-inset-top, 0px);
          display: flex; align-items: center; gap: 16px;
          background: ${T.bg};
          border-bottom: 1px solid rgba(26,26,24,0.06);
          position: sticky; top: 0; z-index: 50;
        }

        .sell-topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
        }
        .sell-topbar-logo a {
          text-decoration: none; display: flex; align-items: center;
        }

        .sell-topbar-link {
          font-size: 14px; font-weight: 500; color: ${T.muted};
          text-decoration: none; transition: color 0.15s;
          padding: 6px 10px; border-radius: 8px;
        }
        .sell-topbar-link:hover { color: ${T.text}; background: rgba(26,26,24,0.03); }
        .sell-topbar-link.active { color: ${T.terra}; font-weight: 600; }

        .sell-topbar-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: background 0.15s;
        }
        .sell-topbar-btn:hover { background: rgba(26,26,24,0.04); }

        /* ── Hero ── */
        .sell-hero {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px 60px;
        }
        @media (max-width: 768px) { .sell-hero { padding: 48px 20px 40px; } }

        .sell-hero h1 {
          font-size: 40px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.15;
          max-width: 600px;
        }
        @media (max-width: 768px) { .sell-hero h1 { font-size: 30px; } }

        .sell-hero-sub {
          font-size: 18px; line-height: 1.6; color: ${T.sub};
          margin: 0 0 32px; max-width: 600px;
        }
        @media (max-width: 768px) { .sell-hero-sub { font-size: 16px; } }

        .sell-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s; text-decoration: none;
        }
        .sell-btn-primary:hover { background: ${T.terraHover}; }

        /* ── Chips ── */
        .sell-chips {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px; margin-top: 28px; max-width: 620px;
        }
        @media (max-width: 480px) { .sell-chips { grid-template-columns: 1fr; gap: 8px; } }

        .sell-chip {
          padding: 14px 16px; border-radius: 14px;
          border: 1px solid rgba(26,26,24,0.07);
          background: #FFFFFF; cursor: pointer;
          font-size: 14px; font-weight: 500; color: ${T.sub};
          font-family: 'Inter', system-ui, sans-serif;
          text-align: left; transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(26,26,24,0.03);
        }
        .sell-chip:hover {
          border-color: rgba(212,113,78,0.25);
          box-shadow: 0 2px 8px rgba(26,26,24,0.06);
          color: ${T.text};
        }
        .sell-chip:active { transform: scale(0.98); }

        /* ── Trust bar ── */
        .sell-trust {
          margin-top: 24px;
          font-size: 12px; color: ${T.faint}; font-weight: 400;
        }

        /* ── Analyze cards ── */
        .sell-analyze {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) { .sell-analyze { grid-template-columns: 1fr; } }

        .sell-analyze-card {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 28px; box-shadow: 0 2px 8px rgba(26,26,24,0.07);
        }
        .sell-analyze-card h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0 0 12px; letter-spacing: -0.01em;
        }
        .sell-analyze-card p {
          font-size: 14px; line-height: 1.65; color: ${T.sub}; margin: 0;
        }

        /* ── Journey timeline ── */
        .sell-timeline {
          display: flex; flex-direction: column; gap: 0;
          max-width: 640px;
        }

        .sell-timeline-item {
          display: flex; gap: 20px; position: relative;
          padding-bottom: 32px;
        }
        .sell-timeline-item:last-child { padding-bottom: 0; }

        .sell-timeline-marker {
          display: flex; flex-direction: column; align-items: center;
          flex-shrink: 0; width: 40px;
        }

        .sell-timeline-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: ${T.terra}; flex-shrink: 0;
          box-shadow: 0 0 0 4px ${T.terraSoft};
        }

        .sell-timeline-line {
          flex: 1; width: 2px; background: ${T.border};
          margin-top: 4px;
        }
        .sell-timeline-item:last-child .sell-timeline-line { display: none; }

        .sell-timeline-content {
          flex: 1; min-width: 0; padding-top: 0;
        }
        .sell-timeline-content h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: -3px 0 6px; display: flex; align-items: center; gap: 10px;
        }
        .sell-timeline-content p {
          font-size: 14px; line-height: 1.6; color: ${T.sub}; margin: 0;
        }

        .sell-free-badge {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: ${T.terra};
          background: ${T.terraSoft}; padding: 2px 8px;
          border-radius: 6px; flex-shrink: 0;
        }

        /* ── Advisor complement ── */
        .sell-highlight {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(26,26,24,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .sell-highlight { padding: 28px 20px; border-radius: 16px; } }

        /* ── Final CTA ── */
        .sell-final-cta {
          text-align: center; max-width: 600px;
          margin: 0 auto; padding: 80px 32px;
        }
        @media (max-width: 768px) { .sell-final-cta { padding: 56px 20px; } }

        .sell-cta-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 12px; line-height: 1.2;
        }
        @media (max-width: 768px) { .sell-cta-heading { font-size: 24px; } }

        .sell-cta-sub {
          font-size: 16px; color: ${T.muted}; margin: 0 0 28px;
        }

        /* ── Footer ── */
        .sell-footer {
          border-top: 1px solid ${T.border};
          padding: 40px 32px;
          max-width: 960px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) { .sell-footer { padding: 32px 20px; } }

        .sell-footer-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .sell-footer-links {
          display: flex; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 12px;
        }
        .sell-footer-links a {
          font-size: 13px; color: ${T.muted}; text-decoration: none;
          transition: color 0.15s;
        }
        .sell-footer-links a:hover { color: ${T.text}; }

        .sell-footer-copy {
          font-size: 12px; color: ${T.faint}; margin: 0;
        }
      `}</style>

      {/* ═══ TOPBAR ═══ */}
      <header className="sell-topbar">
        <div className="sell-topbar-logo">
          <a href="/">
            <span style={{ color: T.text }}>smb</span>
            <span style={{ color: T.terra }}>X</span>
            <span style={{ color: T.text }}>.ai</span>
          </a>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="hidden md:flex items-center gap-1">
          <a href="/sell" className="sell-topbar-link active">Sell</a>
          <a href="/buy" className="sell-topbar-link">Buy</a>
          <a href="/advisors" className="sell-topbar-link">Advisors</a>
          <a href="/pricing" className="sell-topbar-link">Pricing</a>
        </nav>
        <button className="sell-topbar-btn" onClick={() => navigate('/login')} aria-label="Sign in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="sell-hero">
        <h1>Your exit. Professionally managed.</h1>
        <p className="sell-hero-sub">
          From first valuation to signed closing docs &mdash; Yulia runs the complete sell-side process. $49/month.
        </p>
        <button className="sell-btn-primary" onClick={startSell}>
          Start with your valuation
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>

        <div className="sell-chips">
          {SELL_CHIPS.map((c, i) => (
            <button key={i} className="sell-chip" onClick={() => navigate('/?sell=1')}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="sell-trust">
          Powered by {TRUST_SOURCES.join(' \u00B7 ')}
        </div>
      </section>

      {/* ═══ SECTION 1: FEATURE CALLOUTS ═══ */}
      <hr className="sell-divider" />
      <section className="sell-section">
        <p className="sell-overline">What Yulia does for sellers</p>
        <h2 className="sell-heading">The intelligence behind your asking price.</h2>
        <div className="sell-analyze">
          <div className="sell-analyze-card">
            <h3>The add-back discovery</h3>
            <p>
              Yulia works through every owner expense, one-time item, and non-cash charge. Most sellers find $50K&ndash;$400K in hidden value before the first buyer conversation.
            </p>
          </div>
          <div className="sell-analyze-card">
            <h3>The Living CIM</h3>
            <p>
              Your Confidential Information Memorandum updates automatically as your financials improve. Buyers get tiered access &mdash; blind profile, teaser, or full. Every view is tracked.
            </p>
          </div>
          <div className="sell-analyze-card">
            <h3>Tax structure intelligence</h3>
            <p>
              Stock vs. asset sale. &sect;453 installment math. C-Corp double-tax exposure. Yulia surfaces the tax implications before you sign anything &mdash; not after.
            </p>
          </div>
          <div className="sell-analyze-card">
            <h3>Negotiation intelligence</h3>
            <p>
              Working capital peg traps. Earnout trigger language. Reps and warranties exposure. Yulia flags the terms that move your net proceeds before you accept the LOI.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: THE SELL JOURNEY ═══ */}
      <hr className="sell-divider" />
      <section className="sell-section">
        <h2 className="sell-heading">Your selling journey with smbX.ai</h2>
        <p className="sell-body" style={{ marginBottom: 32 }}>
          From first question to close, Yulia walks with you through every stage. Everything included at $49/month.
        </p>
        <div className="sell-timeline">
          {JOURNEY_STAGES.map((stage, i) => (
            <div key={i} className="sell-timeline-item">
              <div className="sell-timeline-marker">
                <div className="sell-timeline-dot" />
                <div className="sell-timeline-line" />
              </div>
              <div className="sell-timeline-content">
                <h3>{stage.title}</h3>
                <p>{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 3: ADVISOR COMPLEMENT ═══ */}
      <hr className="sell-divider" />
      <section className="sell-section">
        <div className="sell-highlight">
          <h2 className="sell-heading" style={{ marginBottom: 16 }}>Working with an advisor? Even better.</h2>
          <p className="sell-body" style={{ marginBottom: 16 }}>
            smbX.ai doesn&apos;t replace your broker or M&amp;A advisor. It makes them faster. Many sellers use smbX.ai to get informed before hiring an advisor &mdash; so the first meeting is a strategic conversation, not an education session.
          </p>
          <p className="sell-body" style={{ marginBottom: 0 }}>
            Your advisor can also use smbX.ai directly to generate market intelligence, build financial analyses, and package deliverables under their brand. Ask them about it &mdash; or <a href="/advisors" style={{ color: T.terra, fontWeight: 600 }}>share our advisor page</a>.
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <div className="sell-final-cta">
        <h2 className="sell-cta-heading">Your business has a number. Let&apos;s find it.</h2>
        <p className="sell-cta-sub">$49/month. Everything included. No per-deliverable charges.</p>
        <button className="sell-btn-primary" onClick={startSell}>
          Talk to Yulia about selling
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="sell-footer">
        <div className="sell-footer-logo">
          <span style={{ color: T.text }}>smb</span>
          <span style={{ color: T.terra }}>X</span>
          <span style={{ color: T.text }}>.ai</span>
        </div>
        <div className="sell-footer-links">
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/terms">Terms</a>
        </div>
        <p className="sell-footer-copy">&copy; 2026 SMBX.ai &mdash; Deal intelligence for every dealmaker.</p>
      </footer>
    </div>
  );
}
