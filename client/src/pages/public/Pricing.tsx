import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ScrollReveal, StaggerContainer, StaggerItem, ScrollProgressBar } from '../../components/content/animations';

/* ═══ DESIGN TOKENS ═══ */

const T = {
  bg: '#FAFAFA',
  terra: '#C96B4F',
  terraHover: '#BE6342',
  terraSoft: '#FFF0EB',
  text: '#0D0D0D',
  sub: '#44403C',
  muted: '#6E6A63',
  faint: '#A9A49C',
  border: 'rgba(0,0,0,0.08)',
};

/* ═══ DATA ═══ */

const FREE_ITEMS = [
  { title: 'Unlimited conversation with Yulia', desc: 'Ask anything about your deal, your market, or the M&A process. Yulia\u2019s advisory conversation has no limits.' },
  { title: 'Business classification', desc: 'Yulia identifies your league, deal size range, and the appropriate analytical framework for your specific situation.' },
  { title: 'Preliminary valuation range', desc: 'An initial estimate based on industry multiples, your financial profile, and current market conditions. Sourced and methodical.' },
  { title: 'Market overview', desc: 'Industry dynamics, competitive landscape, and regional context for your deal.' },
  { title: 'Add-back identification', desc: 'Common adjustments that increase your business\u2019s actual earnings \u2014 the value most owners don\u2019t know they have.' },
  { title: 'SBA pre-qualification check', desc: 'Whether your deal qualifies for SBA financing and what that means for your buyer pool.' },
];

const SELL_DELIVERABLES = [
  { title: 'Business Valuation Report', price: '350', desc: 'Multi-methodology valuation with defensible logic, comparable transaction data, and specific recommendations for maximizing your sale price. Built to withstand buyer scrutiny.' },
  { title: 'Market Intelligence Report', price: '200', desc: 'Comprehensive analysis of your industry, competitive landscape, buyer activity, and market conditions \u2014 localized to your metro. The foundation of a well-positioned listing.' },
  { title: 'Confidential Information Memorandum (CIM)', price: '700', desc: 'A professional deal book presenting your business to potential buyers \u2014 financial summary, growth narrative, market position, and investment thesis.' },
  { title: 'LOI Draft', price: '125', desc: 'Letter of Intent preparation with recommended terms, negotiation strategy, and deal structure optimization through close.' },
];

const BUY_DELIVERABLES = [
  { title: 'Deal Screening Memo', price: '150', desc: 'Rapid target evaluation \u2014 financial scoring, thesis fit analysis, red flag identification, and pursue/pass recommendation.' },
  { title: 'Financial Model', price: '300', desc: 'Deep financial modeling \u2014 DSCR, ROI projections, risk-adjusted returns, and SBA financing scenarios for a specific acquisition target.' },
  { title: 'QoE Lite', price: '500', desc: 'Pre-diligence quality of earnings analysis, red flag identification, and data room preparation guidance before you engage outside professionals.' },
  { title: 'Working Capital Analysis', price: '150', desc: 'Working capital peg calculation, seasonal adjustment modeling, and closing adjustment framework.' },
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

/* ═══ FAQ ACCORDION ═══ */

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

/* ═══ COMPONENT ═══ */

export default function Pricing() {
  const [, navigate] = useLocation();

  const talkToYulia = () => navigate('/');

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', background: T.bg, minHeight: '100dvh' }}>
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

        /* ── Topbar ── */
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

        /* ── Hero ── */
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

        /* ── Free cards ── */
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

        /* ── Premium deliverables ── */
        .price-journey-label {
          font-size: 13px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: ${T.terra};
          margin: 0 0 16px; padding-bottom: 8px;
          border-bottom: 2px solid ${T.terraSoft};
        }

        .price-deliverables {
          display: flex; flex-direction: column; gap: 16px;
          margin-bottom: 40px;
        }
        .price-deliverables:last-child { margin-bottom: 0; }

        .price-deliverable {
          background: #FFFFFF; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          display: flex; flex-direction: column; gap: 8px;
        }
        .price-deliverable-header {
          display: flex; justify-content: space-between; align-items: baseline;
          flex-wrap: wrap; gap: 8px;
        }
        .price-deliverable h3 {
          font-size: 16px; font-weight: 700; color: ${T.text};
          margin: 0; letter-spacing: -0.01em;
        }
        .price-deliverable-price {
          font-size: 15px; font-weight: 700; color: ${T.terra};
          white-space: nowrap;
        }
        .price-deliverable p {
          font-size: 14px; line-height: 1.65; color: ${T.sub}; margin: 0;
        }

        /* ── Wallet ── */
        .price-wallet {
          background: #FFFFFF; border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.08);
          padding: 36px 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          max-width: 720px;
        }
        @media (max-width: 768px) { .price-wallet { padding: 28px 20px; border-radius: 16px; } }

        /* ── Advisor teaser ── */
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
      <section className="price-hero hero-entrance">
        <h1>If you could Google it, it should be free.</h1>
        <p className="price-hero-sub">
          The conversation with Yulia is always free. Foundational analysis &mdash; classification, preliminary valuation, market overview &mdash; is free because the underlying data comes from authoritative public sources.
        </p>
        <p className="price-hero-sub" style={{ marginBottom: 32 }}>
          What you invest in is personalized intelligence: contextualized to your deal, localized to your market, and built to help you make decisions with confidence.
        </p>
        <div className="price-callout">
          Free: what the data says. Premium: what the data means for your deal.
        </div>
      </section>

      {/* ═══ SECTION 1: WHAT'S FREE ═══ */}
      <hr className="price-divider" />
      <ScrollReveal>
        <section className="price-section">
          <h2 className="price-heading">Start here. It&apos;s on us.</h2>
          <p className="price-body" style={{ marginBottom: 28 }}>
            Every deal starts with a conversation &mdash; and the first analysis is always free. No credit card. No signup wall. Just tell Yulia about your deal.
          </p>
          <p className="price-body" style={{ fontSize: 13, color: T.faint, marginBottom: 28 }}>
            Prices shown are base rates. Prices scale with deal complexity (league multiplier).
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

      {/* ═══ SECTION 2: PREMIUM INTELLIGENCE ═══ */}
      <hr className="price-divider" />
      <ScrollReveal>
      <section className="price-section">
        <h2 className="price-heading">Go deeper when your deal is ready.</h2>
        <p className="price-body" style={{ marginBottom: 32 }}>
          Premium deliverables are generated when you need them &mdash; no subscriptions, no retainers. Your investment grows with your deal, one step at a time.
        </p>

        {/* Sell journey */}
        <div className="price-journey-label">Sell Journey</div>
        <div className="price-deliverables">
          {SELL_DELIVERABLES.map((d, i) => (
            <div key={i} className="price-deliverable">
              <div className="price-deliverable-header">
                <h3>{d.title}</h3>
                <span className="price-deliverable-price">${d.price}</span>
              </div>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>

        {/* Buy journey */}
        <div className="price-journey-label">Buy Journey</div>
        <div className="price-deliverables">
          {BUY_DELIVERABLES.map((d, i) => (
            <div key={i} className="price-deliverable">
              <div className="price-deliverable-header">
                <h3>{d.title}</h3>
                <span className="price-deliverable-price">${d.price}</span>
              </div>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ═══ SECTION 3: WALLET ═══ */}
      <hr className="price-divider" />
      <ScrollReveal>
      <section className="price-section">
        <div className="price-wallet">
          <h2 className="price-heading" style={{ marginBottom: 16 }}>Pay as you go. No subscriptions. No surprises.</h2>
          <p className="price-body" style={{ marginBottom: 16 }}>
            smbX.ai uses a wallet system. Add funds when you&apos;re ready for a premium deliverable &mdash; Yulia will let you know exactly what it costs before you commit. No recurring charges, no contracts, no hidden fees.
          </p>
          <p className="price-body" style={{ marginBottom: 24 }}>
            Your wallet balance carries forward across deals. If you&apos;re an advisor running multiple engagements, your funds work across all of them.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: T.text }}>Block</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: T.text }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: T.text }}>Bonus</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: T.text }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Exploratory', price: '$50', bonus: '\u2014', total: '$50' },
                  { name: 'Early Commit', price: '$100', bonus: '+$5', total: '$105' },
                  { name: 'Active Deal', price: '$250', bonus: '+$15', total: '$265' },
                  { name: 'Serious', price: '$500', bonus: '+$40', total: '$540' },
                  { name: 'Full Journey', price: '$1,000', bonus: '+$100', total: '$1,100' },
                  { name: 'Advisor', price: '$2,500', bonus: '+$300', total: '$2,800' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: T.text }}>{row.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: T.sub }}>{row.price}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: T.terra, fontWeight: 600 }}>{row.bonus}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: T.text }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ═══ SECTION 4: ADVISOR PRICING ═══ */}
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

      {/* ═══ SECTION 5: FAQ ═══ */}
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

      {/* ═══ SECTION 6: FINAL CTA ═══ */}
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
