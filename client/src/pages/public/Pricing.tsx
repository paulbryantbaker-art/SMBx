import { useState } from 'react';
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

/* ═══ DATA ═══ */

const CHECKLIST = [
  'Unlimited Yulia conversations',
  'All 4 journeys: Sell, Buy, Raise, Integrate',
  'Business valuation with full methodology',
  'Living CIM \u2014 updates as your financials improve',
  'SBA financing model (automatic for eligible deals)',
  'LOI drafting with negotiation intelligence',
  'Due diligence checklist, stage-appropriate',
  'Quality of Earnings analysis',
  'Financial model with acquisition returns',
  'Tax structure intelligence (stock vs. asset, \u00A7453, C-Corp)',
  'Deal data room with auto-filing and versioning',
  '180-day PMI plan on deal close',
  'Bizestimate \u2014 living valuation range, always free',
  'Multi-party deal room (attorney, CPA, lender access)',
];

const FAQS = [
  {
    q: 'Is the Bizestimate really free?',
    a: 'Yes. Always. It\u2019s how you know what your business is worth before you spend anything.',
  },
  {
    q: 'What happened to per-deliverable pricing?',
    a: 'Gone. Every deliverable Yulia can generate is included in your $49/month. You get the valuation, the CIM, the LOI, the SBA model \u2014 all of it.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ChatGPT knows about deals. Yulia knows your deal. She remembers your financials, your stage, what you\u2019ve discussed, and what comes next. She runs a 22-gate structured process \u2014 not a chat window. And she generates documents you can hand to a bank or attorney, not text you have to format yourself.',
  },
  {
    q: 'What if I\u2019m working with a broker or advisor?',
    a: 'Even better. Walk into every advisor conversation with your valuation done, your add-backs identified, your CIM drafted. Your advisor focuses on what advisors do best. Yulia handles the prep work.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts. No cancellation fees. Your deal data is yours \u2014 export anytime.',
  },
];

/* ═══ FAQ ACCORDION ═══ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="price-faq-item">
      <button className="price-faq-q" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span>{q}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="price-faq-a">{a}</div>}
    </div>
  );
}

/* ═══ COMPONENT ═══ */

export default function Pricing() {
  const [, navigate] = useLocation();

  const talkToYulia = () => navigate('/');

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', background: T.bg, minHeight: '100dvh' }}>
      <style>{`
        .price-section {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px;
        }
        @media (max-width: 768px) { .price-section { padding: 56px 20px; } }

        .price-divider {
          max-width: 960px; margin: 0 auto;
          border: none; border-top: 1px solid ${T.border};
        }

        .price-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 20px; line-height: 1.2;
        }
        @media (max-width: 768px) { .price-heading { font-size: 24px; } }

        .price-body {
          font-size: 16px; line-height: 1.7; color: ${T.sub};
          margin: 0 0 16px; max-width: 640px;
        }
        @media (max-width: 768px) { .price-body { font-size: 15px; } }

        /* ── Topbar ── */
        .price-topbar {
          height: 56px; padding: 0 20px;
          padding-top: env(safe-area-inset-top, 0px);
          display: flex; align-items: center; gap: 16px;
          background: ${T.bg};
          border-bottom: 1px solid rgba(26,26,24,0.06);
          position: sticky; top: 0; z-index: 50;
        }

        .price-topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
        }
        .price-topbar-logo a {
          text-decoration: none; display: flex; align-items: center;
        }

        .price-topbar-link {
          font-size: 14px; font-weight: 500; color: ${T.muted};
          text-decoration: none; transition: color 0.15s;
          padding: 6px 10px; border-radius: 8px;
        }
        .price-topbar-link:hover { color: ${T.text}; background: rgba(26,26,24,0.03); }
        .price-topbar-link.active { color: ${T.terra}; font-weight: 600; }

        .price-topbar-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: background 0.15s;
        }
        .price-topbar-btn:hover { background: rgba(26,26,24,0.04); }

        /* ── Hero ── */
        .price-hero {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px 60px; text-align: center;
        }
        @media (max-width: 768px) { .price-hero { padding: 48px 20px 40px; } }

        .price-hero h1 {
          font-size: 40px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 16px; line-height: 1.15;
        }
        @media (max-width: 768px) { .price-hero h1 { font-size: 30px; } }

        .price-hero-sub {
          font-size: 18px; line-height: 1.6; color: ${T.sub};
          margin: 0 auto; max-width: 600px;
        }
        @media (max-width: 768px) { .price-hero-sub { font-size: 16px; } }

        /* ── Pricing card ── */
        .price-card {
          max-width: 560px; margin: 0 auto;
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 48px 40px;
          box-shadow: 0 4px 24px rgba(26,26,24,0.10);
        }
        @media (max-width: 768px) { .price-card { padding: 36px 24px; border-radius: 16px; } }

        .price-amount {
          font-size: 56px; font-weight: 800; letter-spacing: -0.04em;
          color: ${T.text}; margin: 0; line-height: 1;
        }
        .price-amount-period {
          font-size: 20px; font-weight: 500; color: ${T.muted};
        }
        @media (max-width: 768px) { .price-amount { font-size: 44px; } }

        .price-card-sub {
          font-size: 16px; color: ${T.sub}; margin: 8px 0 32px;
        }

        .price-checklist {
          list-style: none; padding: 0; margin: 0 0 32px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .price-checklist li {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 15px; line-height: 1.5; color: ${T.sub};
        }
        .price-check {
          flex-shrink: 0; margin-top: 2px;
          color: ${T.terra}; font-weight: 700; font-size: 16px;
        }

        .price-card-trial {
          font-size: 13px; color: ${T.muted}; margin: 16px 0 0;
          text-align: center;
        }

        /* ── Comparison callout ── */
        .price-comparison {
          max-width: 720px; margin: 0 auto;
        }

        /* ── Team callout ── */
        .price-team {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(26,26,24,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(26,26,24,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .price-team { padding: 28px 20px; border-radius: 16px; } }

        /* ── FAQ ── */
        .price-faq-list {
          max-width: 720px;
          display: flex; flex-direction: column; gap: 0;
        }

        .price-faq-item {
          border-bottom: 1px solid ${T.border};
        }
        .price-faq-item:first-child {
          border-top: 1px solid ${T.border};
        }

        .price-faq-q {
          width: 100%; display: flex; justify-content: space-between;
          align-items: center; gap: 16px;
          padding: 20px 0; border: none; background: transparent;
          cursor: pointer; text-align: left;
          font-size: 16px; font-weight: 600; color: ${T.text};
          font-family: 'Inter', system-ui, sans-serif;
          transition: color 0.15s;
        }
        .price-faq-q:hover { color: ${T.terra}; }
        @media (max-width: 768px) { .price-faq-q { font-size: 15px; } }

        .price-faq-a {
          font-size: 15px; line-height: 1.7; color: ${T.sub};
          padding: 0 0 20px; max-width: 640px;
        }
        @media (max-width: 768px) { .price-faq-a { font-size: 14px; } }

        /* ── CTA & buttons ── */
        .price-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s; text-decoration: none;
          width: 100%; justify-content: center;
        }
        .price-btn-primary:hover { background: ${T.terraHover}; }

        /* ── Final CTA ── */
        .price-final-cta {
          text-align: center; max-width: 600px;
          margin: 0 auto; padding: 80px 32px;
        }
        @media (max-width: 768px) { .price-final-cta { padding: 56px 20px; } }

        .price-cta-heading {
          font-size: 28px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 12px; line-height: 1.2;
        }
        @media (max-width: 768px) { .price-cta-heading { font-size: 24px; } }

        .price-cta-sub {
          font-size: 16px; color: ${T.muted}; margin: 0 0 28px;
        }
        .price-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(212,113,78,0.3);
          transition: all 0.15s;
        }
        .price-cta-btn:hover { background: ${T.terraHover}; }

        /* ── Footer ── */
        .price-footer {
          border-top: 1px solid ${T.border};
          padding: 40px 32px;
          max-width: 960px; margin: 0 auto; width: 100%;
        }
        @media (max-width: 768px) { .price-footer { padding: 32px 20px; } }

        .price-footer-logo {
          font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .price-footer-links {
          display: flex; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 12px;
        }
        .price-footer-links a {
          font-size: 13px; color: ${T.muted}; text-decoration: none;
          transition: color 0.15s;
        }
        .price-footer-links a:hover { color: ${T.text}; }

        .price-footer-copy {
          font-size: 12px; color: ${T.faint}; margin: 0;
        }
      `}</style>

      {/* ═══ TOPBAR ═══ */}
      <header className="price-topbar">
        <div className="price-topbar-logo">
          <a href="/">
            <span style={{ color: T.text }}>smb</span>
            <span style={{ color: T.terra }}>X</span>
            <span style={{ color: T.text }}>.ai</span>
          </a>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="hidden md:flex items-center gap-1">
          <a href="/sell" className="price-topbar-link">Sell</a>
          <a href="/buy" className="price-topbar-link">Buy</a>
          <a href="/advisors" className="price-topbar-link">Advisors</a>
          <a href="/pricing" className="price-topbar-link active">Pricing</a>
        </nav>
        <button className="price-topbar-btn" onClick={() => navigate('/login')} aria-label="Sign in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="price-hero">
        <h1>Simple pricing for serious dealmakers.</h1>
        <p className="price-hero-sub">
          One price. Every deliverable. Every journey. No meter running.
        </p>
      </section>

      {/* ═══ PRICING CARD ═══ */}
      <section className="price-section" style={{ paddingTop: 0 }}>
        <div className="price-card">
          <p className="price-amount">
            $49 <span className="price-amount-period">/ month</span>
          </p>
          <p className="price-card-sub">Everything included.</p>

          <ul className="price-checklist">
            {CHECKLIST.map((item, i) => (
              <li key={i}>
                <span className="price-check">{'\u2713'}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button className="price-btn-primary" onClick={talkToYulia}>
            Start for free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </button>
          <p className="price-card-trial">7-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* ═══ COMPARISON CALLOUT ═══ */}
      <hr className="price-divider" />
      <section className="price-section">
        <div className="price-comparison">
          <h2 className="price-heading">ChatGPT will tell you what a CIM is. Yulia will write yours.</h2>
          <p className="price-body">
            General AI can explain M&amp;A concepts. Yulia runs the process &mdash; with your numbers, at your stage, with your specific deal in memory. The methodology, the deliverables, the sequence. $49/month is what that&apos;s worth.
          </p>
        </div>
      </section>

      {/* ═══ TEAM CALLOUT ═══ */}
      <hr className="price-divider" />
      <section className="price-section">
        <div className="price-team">
          <h2 className="price-heading" style={{ marginBottom: 16 }}>Working with a team?</h2>
          <p className="price-body" style={{ marginBottom: 0 }}>
            $49/month per person. An advisory firm with 5 advisors pays $245/month total. No per-firm licensing. No seat minimums.
          </p>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <hr className="price-divider" />
      <section className="price-section">
        <h2 className="price-heading">Common questions</h2>
        <div className="price-faq-list">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <div className="price-final-cta">
        <h2 className="price-cta-heading">Start free. Go deeper when you&apos;re ready.</h2>
        <p className="price-cta-sub">7-day free trial. No credit card required.</p>
        <button className="price-cta-btn" onClick={talkToYulia}>
          Talk to Yulia
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="price-footer">
        <div className="price-footer-logo">
          <span style={{ color: T.text }}>smb</span>
          <span style={{ color: T.terra }}>X</span>
          <span style={{ color: T.text }}>.ai</span>
        </div>
        <div className="price-footer-links">
          <a href="/legal/privacy">Privacy</a>
          <a href="/legal/terms">Terms</a>
        </div>
        <p className="price-footer-copy">&copy; 2026 SMBX.ai &mdash; Deal intelligence for every dealmaker.</p>
      </footer>
    </div>
  );
}
