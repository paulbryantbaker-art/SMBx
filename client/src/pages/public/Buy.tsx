import { useLocation } from 'wouter';
import StatCallout from '../../components/content/StatCallout';
import { Icons } from '../../components/content/icons';

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

const BUY_CHIPS = [
  { label: 'Find acquisition targets in my industry', message: 'Help me find acquisition targets in my industry. I\u2019m looking at potential businesses to buy.' },
  { label: 'Analyze a business I\u2019m considering', message: 'I\u2019m looking at a specific business to buy. Help me analyze whether it\u2019s a good deal.' },
  { label: 'Can I finance this with an SBA loan?', message: 'Can I finance this acquisition with an SBA loan? Help me understand what\u2019s feasible.' },
  { label: 'What should I offer?', message: 'I\u2019m preparing an offer for a business. Help me understand what the right price and structure looks like.' },
];

const JOURNEY_STAGES = [
  { title: 'Screen the market', desc: 'Industry landscape, competitive density, and where the opportunities are in your target sector and geography.', free: true },
  { title: 'Evaluate the target', desc: 'Financial analysis, valuation benchmarking, and red-flag identification for the specific business you\u2019re considering.', free: true },
  { title: 'Model the deal', desc: 'SBA financing feasibility, debt service coverage, cash-on-cash returns, and multiple deal structures compared side-by-side.' },
  { title: 'Build conviction', desc: 'Market intelligence report, competitive positioning, and forward signals that confirm (or challenge) your investment thesis.' },
  { title: 'Close with confidence', desc: 'LOI preparation, negotiation intelligence, and diligence framework tailored to your deal.' },
];

const TRUST_SOURCES = ['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'IRS Statistics of Income', 'SBA Lending Data'];

export default function Buy() {
  const [, navigate] = useLocation();

  const startBuy = () => navigate('/?buy=1');

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', background: T.bg, minHeight: '100dvh' }}>
      <style>{`
        .buy-section {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px;
        }
        @media (max-width: 768px) { .buy-section { padding: 56px 20px; } }

        .buy-divider {
          max-width: 960px; margin: 0 auto;
          border: none; border-top: 1px solid ${T.border};
        }

        .buy-overline {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: ${T.terra}; margin: 0 0 12px;
        }

        .buy-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.2;
        }
        @media (max-width: 768px) { .buy-heading { font-size: 24px; } }

        .buy-body {
          font-size: 16px; line-height: 1.7; color: ${T.sub};
          margin: 0 0 16px; max-width: 640px;
        }
        @media (max-width: 768px) { .buy-body { font-size: 15px; } }

        /* ── Topbar ── */
        .buy-topbar {
          height: 56px; padding: 0 20px;
          padding-top: env(safe-area-inset-top, 0px);
          display: flex; align-items: center; gap: 16px;
          background: ${T.bg};
          border-bottom: 1px solid rgba(26,26,24,0.06);
          position: sticky; top: 0; z-index: 50;
        }

        .buy-topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
        }
        .buy-topbar-logo a {
          text-decoration: none; display: flex; align-items: center;
        }

        .buy-topbar-link {
          font-size: 14px; font-weight: 500; color: ${T.muted};
          text-decoration: none; transition: color 0.15s;
          padding: 6px 10px; border-radius: 8px;
        }
        .buy-topbar-link:hover { color: ${T.text}; background: rgba(26,26,24,0.03); }
        .buy-topbar-link.active { color: ${T.terra}; font-weight: 600; }

        .buy-topbar-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: background 0.15s;
        }
        .buy-topbar-btn:hover { background: rgba(26,26,24,0.04); }

        /* ── Hero ── */
        .buy-hero {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px 60px;
        }
        @media (max-width: 768px) { .buy-hero { padding: 48px 20px 40px; } }

        .buy-hero h1 {
          font-size: 40px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.15;
          max-width: 600px;
        }
        @media (max-width: 768px) { .buy-hero h1 { font-size: 30px; } }

        .buy-hero-sub {
          font-size: 18px; line-height: 1.6; color: ${T.sub};
          margin: 0 0 32px; max-width: 600px;
        }
        @media (max-width: 768px) { .buy-hero-sub { font-size: 16px; } }

        .buy-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s; text-decoration: none;
        }
        .buy-btn-primary:hover { background: ${T.terraHover}; }

        /* ── Chips ── */
        .buy-chips {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px; margin-top: 28px; max-width: 620px;
        }
        @media (max-width: 480px) { .buy-chips { grid-template-columns: 1fr; gap: 8px; } }

        .buy-chip {
          padding: 14px 16px; border-radius: 14px;
          border: 1px solid rgba(26,26,24,0.07);
          background: #FFFFFF; cursor: pointer;
          font-size: 14px; font-weight: 500; color: ${T.sub};
          font-family: 'Inter', system-ui, sans-serif;
          text-align: left; transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(26,26,24,0.03);
        }
        .buy-chip:hover {
          border-color: rgba(212,113,78,0.25);
          box-shadow: 0 2px 8px rgba(26,26,24,0.06);
          color: ${T.text};
        }
        .buy-chip:active { transform: scale(0.98); }

        /* ── Trust bar ── */
        .buy-trust {
          margin-top: 24px;
          font-size: 12px; color: ${T.faint}; font-weight: 400;
        }

        /* ── Analyze cards ── */
        .buy-analyze {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) { .buy-analyze { grid-template-columns: 1fr; } }

        .buy-analyze-card {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 28px; box-shadow: 0 2px 8px rgba(26,26,24,0.07);
        }
        .buy-analyze-card h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0 0 12px; letter-spacing: -0.01em;
        }
        .buy-analyze-card p {
          font-size: 14px; line-height: 1.65; color: ${T.sub}; margin: 0;
        }

        /* ── Journey timeline ── */
        .buy-timeline {
          display: flex; flex-direction: column; gap: 0;
          max-width: 640px;
        }

        .buy-timeline-item {
          display: flex; gap: 20px; position: relative;
          padding-bottom: 32px;
        }
        .buy-timeline-item:last-child { padding-bottom: 0; }

        .buy-timeline-marker {
          display: flex; flex-direction: column; align-items: center;
          flex-shrink: 0; width: 40px;
        }

        .buy-timeline-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: ${T.terra}; flex-shrink: 0;
          box-shadow: 0 0 0 4px ${T.terraSoft};
        }

        .buy-timeline-line {
          flex: 1; width: 2px; background: ${T.border};
          margin-top: 4px;
        }
        .buy-timeline-item:last-child .buy-timeline-line { display: none; }

        .buy-timeline-content {
          flex: 1; min-width: 0; padding-top: 0;
        }
        .buy-timeline-content h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: -3px 0 6px; display: flex; align-items: center; gap: 10px;
        }
        .buy-timeline-content p {
          font-size: 14px; line-height: 1.6; color: ${T.sub}; margin: 0;
        }

        .buy-free-badge {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: ${T.terra};
          background: ${T.terraSoft}; padding: 2px 8px;
          border-radius: 6px; flex-shrink: 0;
        }

        /* ── Stat callouts row ── */
        .buy-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-top: 28px;
        }
        @media (max-width: 640px) { .buy-stats { grid-template-columns: 1fr; } }

        /* ── Icon in card heading ── */
        .buy-card-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: ${T.terraSoft}; color: ${T.terra};
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }

        /* ── PE/Search fund highlight ── */
        .buy-highlight {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(26,26,24,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .buy-highlight { padding: 28px 20px; border-radius: 16px; } }

        /* ── Final CTA ── */
        .buy-final-cta {
          text-align: center; max-width: 600px;
          margin: 0 auto; padding: 80px 32px;
        }
        @media (max-width: 768px) { .buy-final-cta { padding: 56px 20px; } }

        .buy-cta-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 12px; line-height: 1.2;
        }
        @media (max-width: 768px) { .buy-cta-heading { font-size: 24px; } }

        .buy-cta-sub {
          font-size: 16px; color: ${T.muted}; margin: 0 0 28px;
        }

        /* ── Footer ── */
        .buy-footer {
          border-top: 1px solid ${T.border};
          padding: 40px 32px;
          max-width: 960px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) { .buy-footer { padding: 32px 20px; } }

        .buy-footer-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .buy-footer-links {
          display: flex; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 12px;
        }
        .buy-footer-links a {
          font-size: 13px; color: ${T.muted}; text-decoration: none;
          transition: color 0.15s;
        }
        .buy-footer-links a:hover { color: ${T.text}; }

        .buy-footer-copy {
          font-size: 12px; color: ${T.faint}; margin: 0;
        }
      `}</style>

      {/* ═══ TOPBAR ═══ */}
      <header className="buy-topbar">
        <div className="buy-topbar-logo">
          <a href="/">
            <span style={{ color: T.text }}>smb</span>
            <span style={{ color: T.terra }}>x</span>
            <span style={{ color: T.text }}>.ai</span>
          </a>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="hidden md:flex items-center gap-1">
          <a href="/sell" className="buy-topbar-link">Sell</a>
          <a href="/buy" className="buy-topbar-link active">Buy</a>
          <a href="/advisors" className="buy-topbar-link">Advisors</a>
          <a href="/pricing" className="buy-topbar-link">Pricing</a>
        </nav>
        <button className="buy-topbar-btn" onClick={() => navigate('/login')} aria-label="Sign in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="buy-hero">
        <h1>Find the right deal. Know it&apos;s the right deal.</h1>
        <p className="buy-hero-sub">
          Whether you&apos;re a first-time buyer or a seasoned acquirer, the hardest part isn&apos;t finding a business &mdash; it&apos;s knowing whether the numbers work. SMBX gives you the market intelligence, financial modeling, and deal analysis to buy with conviction.
        </p>
        <button className="buy-btn-primary" onClick={startBuy}>
          Start evaluating opportunities
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>

        <div className="buy-chips">
          {BUY_CHIPS.map((c, i) => (
            <button key={i} className="buy-chip" onClick={() => navigate('/?buy=1')}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="buy-trust">
          Powered by {TRUST_SOURCES.join(' \u00B7 ')}
        </div>
      </section>

      {/* ═══ SECTION 1: WHAT YULIA ANALYZES ═══ */}
      <hr className="buy-divider" />
      <section className="buy-section">
        <p className="buy-overline">What Yulia analyzes for buyers</p>
        <h2 className="buy-heading">The intelligence behind your offer.</h2>
        <div className="buy-analyze">
          <div className="buy-analyze-card">
            <div className="buy-card-icon">{Icons.Search()}</div>
            <h3>Market intelligence</h3>
            <p>
              Industry landscape, competitive density, growth trends, and consolidation activity in your target sector and geography. Know exactly what you&apos;re buying into before you write a check.
            </p>
          </div>
          <div className="buy-analyze-card">
            <div className="buy-card-icon">{Icons.Calculator()}</div>
            <h3>Financial modeling</h3>
            <p>
              SBA financing feasibility, debt service coverage ratios, cash-on-cash return projections, and multiple deal structures modeled side-by-side. See which structures work &mdash; and which don&apos;t &mdash; before you negotiate.
            </p>
          </div>
          <div className="buy-analyze-card">
            <div className="buy-card-icon">{Icons.Target()}</div>
            <h3>Target evaluation</h3>
            <p>
              Valuation benchmarking against comparable transactions, financial normalization, add-back verification, and red-flag identification. The analysis that tells you whether the asking price is justified.
            </p>
          </div>
          <div className="buy-analyze-card">
            <div className="buy-card-icon">{Icons.Layers()}</div>
            <h3>Deal structuring</h3>
            <p>
              Earnout modeling, seller financing scenarios, equity roll structures, and negotiation intelligence. Understand the levers that get a deal done &mdash; and what to push for.
            </p>
          </div>
        </div>
        <div className="buy-stats">
          <StatCallout value="1.25x DSCR" label="SBA minimum requirement" desc="Debt service coverage ratio for loan qualification" />
          <StatCallout value="10% min equity" label="Buyer injection required" desc="Typical minimum down payment for SBA acquisition" />
          <StatCallout value="$5M max" label="SBA 7(a) loan limit" desc="Maximum SBA financing for business acquisitions" />
        </div>
      </section>

      {/* ═══ SECTION 2: THE BUY JOURNEY ═══ */}
      <hr className="buy-divider" />
      <section className="buy-section">
        <h2 className="buy-heading">Your buying journey with SMBX</h2>
        <p className="buy-body" style={{ marginBottom: 32 }}>
          From market screening to close, Yulia gives you the intelligence to move with confidence. The first two steps are free &mdash; no account required.
        </p>
        <div className="buy-timeline">
          {JOURNEY_STAGES.map((stage, i) => (
            <div key={i} className="buy-timeline-item">
              <div className="buy-timeline-marker">
                <div className="buy-timeline-dot" />
                <div className="buy-timeline-line" />
              </div>
              <div className="buy-timeline-content">
                <h3>
                  {stage.title}
                  {stage.free && <span className="buy-free-badge">Free</span>}
                </h3>
                <p>{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 3: PE / SEARCH FUNDS ═══ */}
      <hr className="buy-divider" />
      <section className="buy-section">
        <div className="buy-highlight">
          <h2 className="buy-heading" style={{ marginBottom: 16 }}>For search funds &amp; PE professionals</h2>
          <p className="buy-body" style={{ marginBottom: 16 }}>
            Screen industries at portfolio speed. Model acquisitions across deal sizes. Build conviction on targets before committing diligence resources. SMBX gives institutional buyers the analytical infrastructure to evaluate more opportunities &mdash; faster and with better data.
          </p>
          <p className="buy-body" style={{ marginBottom: 0 }}>
            Whether you&apos;re a solo searcher evaluating your first acquisition or a platform running a buy-and-build strategy, the intelligence scales with your thesis.
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <div className="buy-final-cta">
        <h2 className="buy-cta-heading">Your next acquisition starts with a conversation.</h2>
        <p className="buy-cta-sub">No retainer. No commitment. Just intelligence.</p>
        <button className="buy-btn-primary" onClick={startBuy}>
          Talk to Yulia about buying
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="buy-footer">
        <div className="buy-footer-logo">
          <span style={{ color: T.text }}>smb</span>
          <span style={{ color: T.terra }}>x</span>
          <span style={{ color: T.text }}>.ai</span>
        </div>
        <div className="buy-footer-links">
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/terms">Terms</a>
        </div>
        <p className="buy-footer-copy">&copy; 2026 SMBX.ai &mdash; Deal intelligence for every dealmaker.</p>
      </footer>
    </div>
  );
}
