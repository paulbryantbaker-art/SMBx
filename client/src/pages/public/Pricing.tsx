import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ScrollReveal, StaggerContainer, StaggerItem, ScrollProgressBar } from '../../components/content/animations';

/* === DESIGN TOKENS === */

const T = {
  bg: '#FAFAFA',
  terra: '#BA3C60',
  terraHover: '#BE6342',
  terraSoft: '#FFF0EB',
  text: '#0D0D0D',
  sub: '#44403C',
  muted: '#6E6A63',
  faint: '#A9A49C',
  border: 'rgba(0,0,0,0.08)',
};

/* === DATA === */

const FREE_ITEMS = [
  { title: 'Unlimited conversation with Yulia', desc: 'Ask anything about your deal, your market, or the M&A process. Yulia\u2019s advisory conversation has no limits.' },
  { title: 'Business classification', desc: 'Yulia identifies your league, deal size range, and the appropriate analytical framework for your specific situation.' },
  { title: 'Preliminary valuation range', desc: 'An initial estimate based on industry multiples, your financial profile, and current market conditions. Sourced and methodical.' },
  { title: 'Market overview', desc: 'Industry dynamics, competitive landscape, and regional context for your deal.' },
  { title: 'Add-back identification', desc: 'Common adjustments that increase your business\u2019s actual earnings \u2014 the value most owners don\u2019t know they have.' },
  { title: 'SBA pre-qualification check', desc: 'Whether your deal qualifies for SBA financing and what that means for your buyer pool.' },
];

const PLATFORM_FEES = [
  { league: 'L1', size: 'Under $500K', fee: '$999', metric: 'SDE' },
  { league: 'L2', size: '$500K \u2013 $2M', fee: '$1,500', metric: 'SDE' },
  { league: 'L3', size: '$2M \u2013 $5M', fee: '$5,000', metric: 'EBITDA' },
  { league: 'L4', size: '$5M \u2013 $10M', fee: '$15,000', metric: 'EBITDA' },
  { league: 'L5', size: '$10M \u2013 $50M', fee: '$25,000', metric: 'EBITDA' },
  { league: 'L6', size: '$50M+', fee: '$50,000', metric: 'EBITDA' },
];

const INCLUDED_DELIVERABLES = [
  'Business Valuation Report',
  'Confidential Information Memorandum (CIM)',
  'Market Intelligence Report',
  'Financial Model & Sensitivity Analysis',
  'Deal Screening Memo',
  'LOI / Term Sheet Draft',
  'Due Diligence Package',
  'Working Capital Analysis',
  'Capital Structure Analysis',
  'Closing Checklist & Funds Flow',
];

const FAQS = [
  {
    q: 'Is the free analysis really free?',
    a: 'Yes. The conversation and foundational analysis are genuinely free \u2014 no credit card, no trial period, no bait-and-switch. We built it this way because the underlying data comes from public sources. What you pay for is the personalized synthesis \u2014 intelligence tailored to your specific deal, market, and situation.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ChatGPT is a general-purpose language model. smbX.ai is a purpose-built deal intelligence platform. Yulia follows a structured seven-layer methodology, synthesizes data from authoritative government sources (Census, BLS, FRED, SEC EDGAR), and delivers traceable analysis calibrated to your specific deal. The difference is the difference between a search engine and a research department.',
  },
  {
    q: 'What\u2019s included in the one-time fee?',
    a: 'Everything from valuation through closing. Once you pay the platform fee for your deal, every deliverable \u2014 valuation reports, CIMs, financial models, due diligence packages, LOI drafts, closing checklists \u2014 is included at no additional cost. One fee, one deal, everything through close.',
  },
  {
    q: 'What if I\u2019m working with a broker or advisor?',
    a: 'Great \u2014 they should be using smbX.ai too. Our intelligence complements advisory relationships. Share your analysis with your advisor to accelerate the engagement, or invite them directly into the platform. Many brokers use smbX.ai to package deals and generate client-ready deliverables.',
  },
  {
    q: 'Can I use smbX.ai deliverables with my clients?',
    a: 'Yes. All deliverables can be white-labeled with your firm\u2019s branding. The analysis is yours to use however it serves your practice and your clients.',
  },
  {
    q: 'What if I just want to explore?',
    a: 'That\u2019s exactly how most people start. Tell Yulia about a deal \u2014 real or hypothetical \u2014 and see what the intelligence looks like. You\u2019ll know within five minutes whether this is useful for you.',
  },
];

/* === FAQ ACCORDION === */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div className="price-faq-item">
      <button className="price-faq-q" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span>{q}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        ref={contentRef}
        className={`faq-answer ${open ? 'open' : 'closed'}`}
        style={{ maxHeight: open ? height : 0 }}
      >
        <div className="price-faq-a">{a}</div>
      </div>
    </div>
  );
}

/* === COMPONENT === */

export default function Pricing() {
  const [, navigate] = useLocation();

  const talkToYulia = () => navigate('/');

  return (
    <div style={{ fontFamily: "'Sora', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', background: T.bg, minHeight: '100dvh' }}>
      <ScrollProgressBar />
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

        .price-overline {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: ${T.terra}; margin: 0 0 12px;
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

        /* -- Topbar -- */
        .price-topbar {
          height: 56px; padding: 0 20px;
          padding-top: env(safe-area-inset-top, 0px);
          display: flex; align-items: center; gap: 16px;
          background: ${T.bg};
          border-bottom: 1px solid rgba(0,0,0,0.06);
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
        .price-topbar-link:hover { color: ${T.text}; background: rgba(0,0,0,0.03); }
        .price-topbar-link.active { color: ${T.terra}; font-weight: 600; }

        .price-topbar-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: ${T.muted}; transition: background 0.15s;
        }
        .price-topbar-btn:hover { background: rgba(0,0,0,0.04); }

        /* -- Hero -- */
        .price-hero {
          max-width: 960px; margin: 0 auto; width: 100%;
          padding: 80px 32px 60px;
        }
        @media (max-width: 768px) { .price-hero { padding: 48px 20px 40px; } }

        .price-hero h1 {
          font-size: 40px; font-weight: 700; letter-spacing: -0.03em;
          color: ${T.text}; margin: 0 0 24px; line-height: 1.15;
          max-width: 640px;
        }
        @media (max-width: 768px) { .price-hero h1 { font-size: 30px; } }

        .price-hero-sub {
          font-size: 18px; line-height: 1.6; color: ${T.sub};
          margin: 0 0 28px; max-width: 640px;
        }
        @media (max-width: 768px) { .price-hero-sub { font-size: 16px; } }

        .price-callout {
          display: inline-block;
          background: ${T.terraSoft}; border-left: 3px solid ${T.terra};
          padding: 16px 20px; border-radius: 0 12px 12px 0;
          font-size: 16px; font-weight: 600; color: ${T.text};
          line-height: 1.5; max-width: 600px;
        }
        @media (max-width: 768px) { .price-callout { font-size: 15px; padding: 14px 16px; } }

        /* -- Free cards -- */
        .price-free-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 640px) { .price-free-grid { grid-template-columns: 1fr; } }

        .price-free-card {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .price-free-card h3 {
          font-size: 15px; font-weight: 700; color: ${T.text};
          margin: 0 0 8px; display: flex; align-items: center; gap: 8px;
        }
        .price-free-badge {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: ${T.terra};
          background: ${T.terraSoft}; padding: 2px 7px;
          border-radius: 5px;
        }
        .price-free-card p {
          font-size: 14px; line-height: 1.65; color: ${T.sub}; margin: 0;
        }

        /* -- Platform fee table -- */
        .price-fee-box {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .price-fee-box { padding: 28px 20px; border-radius: 16px; } }

        /* -- Included list -- */
        .price-included-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 8px 24px;
        }
        @media (max-width: 640px) { .price-included-grid { grid-template-columns: 1fr; } }

        .price-included-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; color: ${T.sub}; padding: 6px 0;
        }

        /* -- Advisor teaser -- */
        .price-advisor-box {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .price-advisor-box { padding: 28px 20px; border-radius: 16px; } }

        .price-advisor-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 15px; font-weight: 600; color: ${T.terra};
          text-decoration: none; margin-top: 8px;
          transition: color 0.15s;
        }
        .price-advisor-link:hover { color: ${T.terraHover}; }

        /* -- FAQ -- */
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
          font-family: 'Sora', system-ui, sans-serif;
          transition: color 0.15s;
        }
        .price-faq-q:hover { color: ${T.terra}; }
        @media (max-width: 768px) { .price-faq-q { font-size: 15px; } }

        .price-faq-a {
          font-size: 15px; line-height: 1.7; color: ${T.sub};
          padding: 0 0 20px; max-width: 640px;
        }
        @media (max-width: 768px) { .price-faq-a { font-size: 14px; } }

        /* -- CTA & buttons -- */
        .price-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: ${T.terra}; color: #fff;
          font-size: 15px; font-weight: 600; border: none;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 8px rgba(186,60,96,0.3);
          transition: all 0.15s; text-decoration: none;
        }
        .price-btn-primary:hover { background: ${T.terraHover}; }

        /* -- Final CTA -- */
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

        /* -- Footer -- */
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

      {/* === TOPBAR === */}
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

      {/* === HERO === */}
      <section className="price-hero hero-entrance">
        <h1>If you could Google it, it should be free.</h1>
        <p className="price-hero-sub">
          The conversation with Yulia is always free. Foundational analysis &mdash; classification, preliminary valuation, market overview &mdash; is free because the underlying data comes from authoritative public sources.
        </p>
        <p className="price-hero-sub" style={{ marginBottom: 32 }}>
          When your deal is ready to move, one platform fee unlocks everything through closing. No per-deliverable charges, no subscriptions, no surprises.
        </p>
        <div className="price-callout">
          Free: what the data says. One fee: everything you need to close.
        </div>
      </section>

      {/* === SECTION 1: WHAT'S FREE === */}
      <hr className="price-divider" />
      <ScrollReveal>
        <section className="price-section">
          <h2 className="price-heading">Start here. It&apos;s on us.</h2>
          <p className="price-body" style={{ marginBottom: 28 }}>
            Every deal starts with a conversation &mdash; and the first analysis is always free. No credit card. No signup wall. Just tell Yulia about your deal.
          </p>
          <StaggerContainer className="price-free-grid">
            {FREE_ITEMS.map((item, i) => (
              <StaggerItem key={i}>
                <div className="price-free-card card-hover">
                  <h3>
                    {item.title}
                    <span className="price-free-badge">Free</span>
                  </h3>
                  <p>{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* === SECTION 2: PLATFORM FEE === */}
      <hr className="price-divider" />
      <ScrollReveal>
      <section className="price-section">
        <h2 className="price-heading">One fee. Everything through closing.</h2>
        <p className="price-body" style={{ marginBottom: 32 }}>
          When your deal is ready to move past valuation, a single platform fee unlocks every deliverable through close. No per-document charges. No metering. Your fee is determined by your deal&apos;s size &mdash; your league.
        </p>

        <div className="price-fee-box" style={{ marginBottom: 40 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: T.text }}>League</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: T.text }}>Deal Size</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: T.text }}>Platform Fee</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_FEES.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: T.terra }}>{row.league}</td>
                    <td style={{ padding: '10px 12px', color: T.sub }}>{row.size}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: T.text }}>{row.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Everything included
        </h3>
        <p className="price-body" style={{ marginBottom: 20 }}>
          Once you pay the platform fee, every deliverable for your deal is generated at no additional cost:
        </p>
        <div className="price-included-grid" style={{ marginBottom: 16 }}>
          {INCLUDED_DELIVERABLES.map((item, i) => (
            <div key={i} className="price-included-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.terra} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: T.faint, margin: 0 }}>
          Plus any additional deliverables added to the platform &mdash; included automatically.
        </p>
      </section>
      </ScrollReveal>

      {/* === SECTION 3: ADVISOR PRICING === */}
      <hr className="price-divider" />
      <ScrollReveal>
      <section className="price-section">
        <div className="price-advisor-box">
          <h2 className="price-heading" style={{ marginBottom: 16 }}>Advisor and team pricing</h2>
          <p className="price-body" style={{ marginBottom: 0 }}>
            Running multiple engagements? Working with a team? We&apos;re building advisor-specific pricing that reflects how professionals actually use the platform &mdash; including volume considerations, white-label options, and multi-user access.
          </p>
          <a href="/advisors" className="price-advisor-link">
            Talk to us about advisor pricing
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
      </ScrollReveal>

      {/* === SECTION 4: FAQ === */}
      <hr className="price-divider" />
      <ScrollReveal>
      <section className="price-section">
        <h2 className="price-heading">Common questions</h2>
        <div className="price-faq-list">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* === SECTION 5: FINAL CTA === */}
      <ScrollReveal>
      <div className="price-final-cta">
        <h2 className="price-cta-heading">Start free. Go deeper when you&apos;re ready.</h2>
        <p className="price-cta-sub">No credit card. No signup. Just intelligence.</p>
        <button className="price-btn-primary cta-glow" onClick={talkToYulia}>
          Talk to Yulia
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </ScrollReveal>

      {/* === FOOTER === */}
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
