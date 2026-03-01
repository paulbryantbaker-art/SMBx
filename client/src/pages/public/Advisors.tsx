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

const TRUST_SOURCES = ['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'IRS Statistics of Income', 'SBA Lending Data'];

export default function Advisors() {
  const [, navigate] = useLocation();

  const talkToYulia = () => navigate('/?advisor=1');
  const scrollDown = () => {
    document.getElementById('advisor-use-cases')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', background: T.bg, minHeight: '100dvh' }}>
      <style>{`
        .adv-section {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px;
        }
        @media (max-width: 768px) { .adv-section { padding: 56px 20px; } }

        .adv-divider {
          max-width: 960px; margin: 0 auto;
          border: none; border-top: 1px solid ${T.border};
        }

        .adv-overline {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: ${T.terra}; margin: 0 0 12px;
        }

        .adv-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.2;
        }
        @media (max-width: 768px) { .adv-heading { font-size: 24px; } }

        .adv-body {
          font-size: 16px; line-height: 1.7; color: ${T.sub};
          margin: 0 0 16px; max-width: 640px;
        }
        @media (max-width: 768px) { .adv-body { font-size: 15px; } }

        /* ── Topbar ── */
        .adv-topbar {
          height: 56px; padding: 0 20px;
          padding-top: env(safe-area-inset-top, 0px);
          display: flex; align-items: center; gap: 16px;
          background: ${T.bg};
          border-bottom: 1px solid rgba(26,26,24,0.06);
          position: sticky; top: 0; z-index: 50;
        }

        .adv-topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
        }
        .adv-topbar-logo a {
          text-decoration: none; display: flex; align-items: center;
        }

        .adv-topbar-link {
          font-size: 14px; font-weight: 500; color: ${T.muted};
          text-decoration: none; transition: color 0.15s;
          padding: 6px 10px; border-radius: 8px;
        }
        .adv-topbar-link:hover { color: ${T.text}; background: rgba(26,26,24,0.03); }
        .adv-topbar-link.active { color: ${T.terra}; font-weight: 600; }

        .adv-topbar-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: background 0.15s;
        }
        .adv-topbar-btn:hover { background: rgba(26,26,24,0.04); }

        /* ── Hero ── */
        .adv-hero {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px 60px;
        }
        @media (max-width: 768px) { .adv-hero { padding: 48px 20px 40px; } }

        .adv-hero h1 {
          font-size: 40px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.15;
          max-width: 600px;
        }
        @media (max-width: 768px) { .adv-hero h1 { font-size: 30px; } }

        .adv-hero-sub {
          font-size: 18px; line-height: 1.6; color: ${T.sub};
          margin: 0 0 32px; max-width: 600px;
        }
        @media (max-width: 768px) { .adv-hero-sub { font-size: 16px; } }

        .adv-hero-ctas {
          display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
        }

        .adv-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s; text-decoration: none;
        }
        .adv-btn-primary:hover { background: ${T.terraHover}; }

        .adv-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 14px 24px; border-radius: 12px;
          background: transparent; color: ${T.sub};
          font-size: 15px; font-weight: 500; border: 1px solid ${T.border};
          cursor: pointer; font-family: inherit;
          transition: all 0.15s; text-decoration: none;
        }
        .adv-btn-secondary:hover { border-color: ${T.muted}; color: ${T.text}; }

        /* ── Use case cards ── */
        .adv-cards {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) { .adv-cards { grid-template-columns: 1fr; } }

        .adv-card {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 28px; box-shadow: 0 2px 8px rgba(26,26,24,0.07);
        }
        .adv-card h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0 0 12px; letter-spacing: -0.01em;
        }
        .adv-card p {
          font-size: 14px; line-height: 1.65; color: ${T.sub}; margin: 0;
        }

        /* ── Preview ── */
        .adv-preview {
          max-width: 720px; margin: 0 auto;
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          box-shadow: 0 2px 12px rgba(26,26,24,0.08);
          padding: 28px 24px;
        }
        @media (max-width: 768px) { .adv-preview { padding: 20px 16px; border-radius: 16px; } }

        .adv-preview-user {
          display: flex; justify-content: flex-end; margin-bottom: 20px;
        }
        .adv-preview-user-bubble {
          max-width: 85%; padding: 12px 18px;
          background: ${T.terraSoft}; color: ${T.text};
          border: 1px solid rgba(212,113,78,0.18);
          border-radius: 18px 18px 4px 18px;
          font-size: 14px; line-height: 1.55;
        }
        .adv-preview-ai {
          display: flex; gap: 12px; align-items: flex-start;
        }
        .adv-preview-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: ${T.terra}; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
        }
        .adv-preview-body { flex: 1; min-width: 0; }
        .adv-preview-name {
          font-size: 13px; font-weight: 600; color: ${T.sub}; margin-bottom: 6px;
        }
        .adv-preview-text {
          font-size: 14px; line-height: 1.7; color: ${T.text};
        }
        .adv-preview-text p { margin: 0 0 12px; }
        .adv-preview-text p:last-child { margin-bottom: 0; }
        .adv-preview-text strong { font-weight: 600; }

        .adv-preview-note {
          margin-top: 20px; padding-top: 16px;
          border-top: 1px solid rgba(26,26,24,0.06);
          font-size: 13px; line-height: 1.6; color: ${T.muted};
          font-style: italic;
        }

        /* ── Steps ── */
        .adv-steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; counter-reset: step;
        }
        @media (max-width: 768px) { .adv-steps { grid-template-columns: 1fr; gap: 20px; } }

        .adv-step { counter-increment: step; }
        .adv-step::before {
          content: counter(step);
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 10px;
          background: ${T.terraSoft}; color: ${T.terra};
          font-size: 14px; font-weight: 700; margin-bottom: 14px;
        }
        .adv-step h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0 0 8px;
        }
        .adv-step p {
          font-size: 14px; line-height: 1.6; color: ${T.sub}; margin: 0;
        }

        /* ── Trust bar ── */
        .adv-trust-bar {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 6px 16px; margin-top: 24px;
          font-size: 13px; color: ${T.muted};
        }

        /* ── Final CTA ── */
        .adv-final-cta {
          text-align: center; max-width: 600px;
          margin: 0 auto; padding: 80px 32px;
        }
        @media (max-width: 768px) { .adv-final-cta { padding: 56px 20px; } }

        .adv-cta-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 12px; line-height: 1.2;
        }
        @media (max-width: 768px) { .adv-cta-heading { font-size: 24px; } }

        .adv-cta-sub {
          font-size: 16px; color: ${T.muted}; margin: 0 0 28px;
        }

        /* ── White-label highlight ── */
        .adv-highlight {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(26,26,24,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .adv-highlight { padding: 28px 20px; border-radius: 16px; } }

        /* ── Footer ── */
        .adv-footer {
          border-top: 1px solid ${T.border};
          padding: 40px 32px;
          max-width: 960px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) { .adv-footer { padding: 32px 20px; } }

        .adv-footer-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .adv-footer-links {
          display: flex; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 12px;
        }
        .adv-footer-links a {
          font-size: 13px; color: ${T.muted}; text-decoration: none;
          transition: color 0.15s;
        }
        .adv-footer-links a:hover { color: ${T.text}; }

        .adv-footer-copy {
          font-size: 12px; color: ${T.faint}; margin: 0;
        }
      `}</style>

      {/* ═══ TOPBAR ═══ */}
      <header className="adv-topbar">
        <div className="adv-topbar-logo">
          <a href="/">
            <span style={{ color: T.text }}>smb</span>
            <span style={{ color: T.terra }}>x</span>
            <span style={{ color: T.text }}>.ai</span>
          </a>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="hidden md:flex items-center gap-1">
          <a href="/sell" className="adv-topbar-link">Sell</a>
          <a href="/buy" className="adv-topbar-link">Buy</a>
          <a href="/advisors" className="adv-topbar-link active">Advisors</a>
          <a href="/pricing" className="adv-topbar-link">Pricing</a>
        </nav>
        <button className="adv-topbar-btn" onClick={() => navigate('/login')} aria-label="Sign in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="adv-hero">
        <h1>Your expertise closes deals. Now close more of them.</h1>
        <p className="adv-hero-sub">
          SMBX gives M&amp;A advisors, business brokers, and deal professionals the intelligence infrastructure to serve more clients, package better deals, and move through engagements faster.
        </p>
        <div className="adv-hero-ctas">
          <button className="adv-btn-primary" onClick={talkToYulia}>
            Start a conversation with Yulia
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="adv-btn-secondary" onClick={scrollDown}>
            See how it works
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M19 12l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ═══ SECTION 1: THE ADVISOR'S PROBLEM ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section">
        <p className="adv-overline">The reality of running a practice</p>
        <h2 className="adv-heading">Great advisors are limited by the same thing: hours in the day.</h2>
        <p className="adv-body">
          You know how to close deals. That&apos;s not the bottleneck. The bottleneck is everything that happens before the close &mdash; the hours spent assembling market comps, building financial models, writing CIMs, vetting buyer qualification, and pulling together the intelligence that makes a deal presentable.
        </p>
        <p className="adv-body">
          Every hour spent on data assembly is an hour not spent on what actually moves the needle: client relationships, negotiations, and strategic counsel.
        </p>
        <p className="adv-body">
          SMBX handles the intelligence work so you can focus on the advisory work.
        </p>
      </section>

      {/* ═══ SECTION 2: USE CASE CARDS ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section" id="advisor-use-cases">
        <h2 className="adv-heading">Intelligence on demand for every engagement.</h2>
        <div className="adv-cards">
          <div className="adv-card">
            <h3>Package a new listing</h3>
            <p>
              A new seller engagement used to mean days of manual research before you could have an informed conversation about price. With SMBX, tell Yulia about the business and get instant market intelligence &mdash; industry multiples, competitive landscape, regional economics, preliminary valuation range, and add-back identification. All sourced. All defensible.
            </p>
          </div>
          <div className="adv-card">
            <h3>Qualify buyers in minutes</h3>
            <p>
              Yulia can pre-screen buyer financials against SBA lending requirements, model debt service coverage ratios, and assess financing feasibility before you schedule a single call. Know which buyers can actually close &mdash; and which structures work for the deal at hand.
            </p>
          </div>
          <div className="adv-card">
            <h3>Win the pitch</h3>
            <p>
              When you&apos;re competing for a listing, the advisor who shows up with localized market intelligence, industry-specific benchmarks, and a clear methodology wins the engagement. Yulia gives you that preparation in the time it takes to describe the opportunity.
            </p>
          </div>
          <div className="adv-card">
            <h3>Make smaller deals profitable</h3>
            <p>
              There are deals in the $500K&ndash;$2M range that your expertise could close &mdash; but they don&apos;t justify 40 hours of manual prep. SMBX changes the economics. The intelligence infrastructure that makes a $10M engagement great makes a $1M engagement viable.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: WHITE-LABEL ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section">
        <div className="adv-highlight">
          <h2 className="adv-heading" style={{ marginBottom: 16 }}>Present SMBX intelligence under your brand.</h2>
          <p className="adv-body" style={{ marginBottom: 16 }}>
            Every deliverable Yulia generates &mdash; valuations, market intelligence reports, CIMs, financial analyses &mdash; can be white-labeled with your firm&apos;s identity. Your client sees a polished, professional document from their advisor. You get institutional-quality analysis without the institutional overhead.
          </p>
          <p className="adv-body" style={{ marginBottom: 0 }}>
            Your expertise. Your client relationship. Your brand. Backed by intelligence that would take days to assemble manually.
          </p>
        </div>
      </section>

      {/* ═══ SECTION 4: METHODOLOGY ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section">
        <h2 className="adv-heading">Intelligence you can stake your reputation on.</h2>
        <p className="adv-body">
          Advisors don&apos;t need more opinions. They need defensible data. SMBX is built on the same sovereign data sources that inform institutional research desks &mdash; Census Bureau demographics, BLS industry data, Federal Reserve economic indicators, SEC filings, and SBA lending records.
        </p>
        <p className="adv-body">
          Yulia&apos;s Seven Layers of Intelligence methodology evaluates every deal across industry structure, regional economics, financial normalization, buyer landscape, deal architecture, risk assessment, and forward signals. When you present an SMBX analysis to a client, every number has a source and every conclusion has a methodology behind it.
        </p>
        <p className="adv-body">
          That&apos;s the difference between intelligence you&apos;ll put your name on and a printout from a chatbot.
        </p>
        <div className="adv-trust-bar">
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Built on:</span>
          {TRUST_SOURCES.map((src, i, arr) => (
            <span key={src}>
              {src}{i < arr.length - 1 ? ' \u00B7' : ''}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 5: CONVERSATION PREVIEW ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section">
        <h2 className="adv-heading" style={{ textAlign: 'center', marginBottom: 32 }}>
          See how a broker uses Yulia to prepare a new listing.
        </h2>
        <div className="adv-preview">
          <div className="adv-preview-user">
            <div className="adv-preview-user-bubble">
              I just signed an engagement for a commercial cleaning company in Atlanta. They&apos;re doing about $1.8M revenue, $320K SDE. Owner wants to know what he can expect.
            </div>
          </div>
          <div className="adv-preview-ai">
            <div className="adv-preview-avatar">Y</div>
            <div className="adv-preview-body">
              <div className="adv-preview-name">Yulia</div>
              <div className="adv-preview-text">
                <p>Good engagement &mdash; let me pull the market intelligence for commercial cleaning in the Atlanta MSA.</p>
                <p>At $320K SDE, this is solidly in the Main Street range. Current SDE multiples for commercial cleaning businesses with recurring contracts are running 2.8x&ndash;3.5x in metro Atlanta, which puts your preliminary range at <strong>$896K&ndash;$1.12M.</strong></p>
                <p>A few things to sharpen the pricing conversation with your client:</p>
                <p><strong>Recurring revenue matters here.</strong> If this business has multi-year commercial contracts (vs. one-time jobs), that pushes toward the top of the range. Buyers and SBA lenders both weight contract quality heavily in this sector.</p>
                <p><strong>SBA bankability looks strong.</strong> At $1M enterprise value with $320K SDE, the debt service coverage ratio would be approximately 1.7x on a standard SBA 7(a) at current rates &mdash; well above the 1.25x minimum. That means a broader buyer pool.</p>
                <p><strong>The Atlanta market is active.</strong> I&apos;m seeing moderate fragmentation &mdash; 1,200+ commercial cleaning operations in the MSA &mdash; but strategic buyers are consolidating. Three PE-backed platforms are acquiring in the Southeast.</p>
                <p>Want me to generate a Market Intelligence Report you can share with your client? I can have it ready in about five minutes.</p>
              </div>
            </div>
          </div>
          <div className="adv-preview-note">
            That&apos;s the first five minutes of a new engagement. Localized market data. Defensible valuation range. Buyer landscape intelligence. SBA pre-qualification. Ready to share with your client or use as the foundation for your own analysis.
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: GETTING STARTED ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section">
        <h2 className="adv-heading">Start using SMBX in your next engagement.</h2>
        <div className="adv-steps">
          <div className="adv-step">
            <h3>Tell Yulia about the deal.</h3>
            <p>Describe the business, the engagement, what you need. She&apos;ll ask smart follow-ups.</p>
          </div>
          <div className="adv-step">
            <h3>Get intelligence you can use immediately.</h3>
            <p>Market data, valuation analysis, buyer qualification, SBA modeling &mdash; sourced and ready.</p>
          </div>
          <div className="adv-step">
            <h3>Generate client-ready deliverables.</h3>
            <p>White-label reports, financial analyses, and market intelligence packaged under your brand.</p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7: PARTNERSHIP ═══ */}
      <hr className="adv-divider" />
      <section className="adv-section">
        <h2 className="adv-heading">Built with advisors. Growing with advisors.</h2>
        <p className="adv-body">
          SMBX is building the intelligence infrastructure that M&amp;A professionals have needed for years. Our methodology is informed by real transaction experience, and we&apos;re actively developing our advisor program &mdash; including partnership tiers, volume pricing, and co-branded capabilities.
        </p>
        <p className="adv-body">
          If you&apos;re a broker, M&amp;A advisor, or deal professional who wants to shape how this platform evolves, we want to hear from you.
        </p>
        <a href="mailto:advisors@smbx.ai" className="adv-btn-secondary" style={{ display: 'inline-flex', marginTop: 8 }}>
          Talk to our team about advisor partnerships
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </a>
      </section>

      {/* ═══ SECTION 8: FINAL CTA ═══ */}
      <div className="adv-final-cta">
        <h2 className="adv-cta-heading">Your next listing starts with a conversation.</h2>
        <p className="adv-cta-sub">Same intelligence. Your brand. Every engagement.</p>
        <button className="adv-btn-primary" onClick={talkToYulia}>
          Talk to Yulia
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="adv-footer">
        <div className="adv-footer-logo">
          <span style={{ color: T.text }}>smb</span>
          <span style={{ color: T.terra }}>x</span>
          <span style={{ color: T.text }}>.ai</span>
        </div>
        <div className="adv-footer-links">
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/terms">Terms</a>
        </div>
        <p className="adv-footer-copy">&copy; 2026 SMBX.ai &mdash; Deal intelligence for every dealmaker.</p>
      </footer>
    </div>
  );
}
