import {
  RevealSection,
  ScrollReveal,
} from './animations';

interface SellBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 880, margin: '0 auto', padding: '0 32px' } as const;

const EXIT_TYPES = [
  { title: 'Strategic Buyer', desc: 'Competitors or partners looking for synergy and scale. Often highest multiple.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
  { title: 'Financial Buyer', desc: 'PE firms or Search Funds focused on cash flow and operational stability.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg> },
  { title: 'ESOP', desc: 'Sell to your employees. Significant tax advantages and legacy preservation.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { title: 'Management Buyout', desc: 'The internal transition. Reward the team that built the business with you.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
  { title: 'IPO / Direct Listing', desc: 'For high-growth scale-ups. Access public markets for maximum liquidity.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg> },
  { title: 'Family Succession', desc: 'Passing the torch. Focus on continuity, values, and generational wealth.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
];

const PROCESS_STEPS = [
  { num: '1', title: 'Understand', desc: 'We deep dive into your books, your culture, and your personal goals to build a defensible valuation and narrative.' },
  { num: '2', title: 'Optimize', desc: 'Fixing leakage, restating financials, and documenting workflows to make the business "buyer-ready."' },
  { num: '3', title: 'Prepare', desc: 'Drafting the CIM (Confidential Information Memorandum) and setting up the virtual data room for due diligence.' },
  { num: '4', title: 'Negotiate & Close', desc: 'Vetting buyers, managing the bidding war, and ensuring the final contract protects your legacy.' },
];

const ADDBACKS = [
  { category: 'Owner Compensation', reported: '$120,000', adjusted: '$250,000', added: '+$130,000' },
  { category: 'One-time Equipment', reported: '$85,000', adjusted: '$0', added: '+$85,000' },
  { category: 'Discretionary Travel/Auto', reported: '$42,000', adjusted: '$0', added: '+$42,000' },
];

export default function SellBelow({ onChipClick }: SellBelowProps) {
  return (
    <div>
      {/* ═══ HERO — Mixed typography ═══ */}
      <section style={{ padding: '64px 32px 48px', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <RevealSection>
          <h1 style={{ margin: '0 0 20px', lineHeight: 1.1 }}>
            <span style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontSize: '48px', fontWeight: 400, fontStyle: 'italic', color: '#0D0D0D', letterSpacing: '-0.02em', display: 'block' }}>
              75% of business owners
            </span>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '40px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#0D0D0D', display: 'block', marginTop: 4 }}>
              regret selling within a year.
            </span>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 32px' }}>
            We combine institutional-grade data with human empathy to ensure you exit on your terms, for your price, with zero regrets.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => onChipClick("I want to understand what my business is worth. Can you walk me through a valuation?")}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'inherit', fontSize: '15px', fontWeight: 600, background: '#0D0D0D', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 28px' }}
              type="button"
            >
              Start Valuation
            </button>
            <button
              onClick={() => onChipClick("I'm an advisor and want to see how smbX.ai can help with my sell-side practice.")}
              className="cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-all"
              style={{ fontFamily: 'inherit', fontSize: '15px', fontWeight: 600, background: 'transparent', color: '#0D0D0D', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '10px', padding: '14px 28px' }}
              type="button"
            >
              Talk to an Advisor
            </button>
          </div>
        </RevealSection>
      </section>

      {/* ═══ BIZESTIMATE SECTION ═══ */}
      <section style={{ padding: '64px 0', ...sectionStyle }}>
        <RevealSection>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D', margin: '0 0 6px', lineHeight: 1.2 }}>
            What your business is actually worth
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.4)', margin: '0 0 28px' }}>
            Real-time market data matched against your trailing 12-month performance.
          </p>
        </RevealSection>

        <ScrollReveal>
          <div style={{ background: '#F8F8F6', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '32px', overflow: 'hidden' }}>
            {/* Stats row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.35)', margin: '0 0 8px' }}>Bizestimate Range</p>
                <p style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D', margin: 0, lineHeight: 1 }}>
                  $4.2M — $4.8M
                </p>
              </div>
              <div className="flex gap-8">
                {[
                  { label: 'Revenue', value: '$2.1M' },
                  { label: 'SDE', value: '$840K' },
                  { label: 'Multiple', value: '5.4x' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.35)', margin: '0 0 4px' }}>{stat.label}</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#0D0D0D', margin: 0 }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline bars */}
            <div className="flex items-end gap-3 justify-center" style={{ height: 160, paddingTop: 20 }}>
              {[80, 96, 112, 136, 160, 120, 104].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 80,
                    height: h,
                    borderRadius: '6px 6px 0 0',
                    background: i === 4 ? '#0D0D0D' : '#E8E8E4',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {i === 4 && (
                    <span style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 600, background: '#0D0D0D', color: '#fff', padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ ADD-BACKS TABLE ═══ */}
      <section style={{ padding: '48px 0', ...sectionStyle }}>
        <RevealSection>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D', margin: '0 0 6px', lineHeight: 1.2 }}>
            The $400,000 hiding in your tax returns
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.4)', margin: '0 0 28px' }}>
            Most accountants minimize taxes. We maximize value. Here is how we restate your earnings.
          </p>
        </RevealSection>

        <ScrollReveal>
          <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header row */}
            <div className="flex" style={{ background: '#F8F8F6', padding: '14px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <span style={{ flex: 2, fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>Category</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>Reported Profit</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>Adjusted SDE</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.45)', textAlign: 'right' }}>Added Value</span>
            </div>
            {/* Data rows */}
            {ADDBACKS.map((row, i) => (
              <div key={i} className="flex" style={{ padding: '16px 24px', borderBottom: i < ADDBACKS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: '#fff' }}>
                <span style={{ flex: 2, fontSize: '15px', fontWeight: 500, color: '#0D0D0D' }}>{row.category}</span>
                <span style={{ flex: 1, fontSize: '15px', color: 'rgba(0,0,0,0.5)' }}>{row.reported}</span>
                <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: '#0D0D0D' }}>{row.adjusted}</span>
                <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: '#4CAF50', textAlign: 'right' }}>{row.added}</span>
              </div>
            ))}
            {/* Total row */}
            <div className="flex" style={{ padding: '18px 24px', borderTop: '2px solid rgba(0,0,0,0.08)', background: '#FAFAFA' }}>
              <span style={{ flex: 2, fontSize: '16px', fontWeight: 700, color: '#0D0D0D' }}>Total Value Enhancement</span>
              <span style={{ flex: 1 }} />
              <span style={{ flex: 1 }} />
              <span style={{ flex: 1, fontSize: '20px', fontWeight: 700, color: '#0D0D0D', textAlign: 'right' }}>$257,000</span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ SIX WAYS OUT ═══ */}
      <section style={{ padding: '64px 0', ...sectionStyle }}>
        <RevealSection>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D', margin: '0 0 6px', lineHeight: 1.2 }}>
            Six ways out
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.4)', margin: '0 0 28px' }}>
            The right exit depends on your legacy goals and liquidity needs.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXIT_TYPES.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.05}>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', padding: '24px', height: '100%' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F4F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'rgba(0,0,0,0.5)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ THE COMPLETE PROCESS ═══ */}
      <section style={{ padding: '64px 0', ...sectionStyle }}>
        <RevealSection>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D', margin: '0 0 6px', lineHeight: 1.2 }}>
            The complete process
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.4)', margin: '0 0 40px' }}>
            A rigorous, disciplined approach to your life&apos;s work.
          </p>
        </RevealSection>

        <div className="flex flex-col gap-0">
          {PROCESS_STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.08}>
              <div className="flex items-start gap-6 md:gap-10" style={{ padding: '28px 0', borderTop: i === 0 ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '64px', fontWeight: 200, color: 'rgba(0,0,0,0.08)', lineHeight: 1, fontFamily: "'Inter', system-ui, sans-serif", flexShrink: 0, width: 60, textAlign: 'center' }}>
                  {step.num}
                </span>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D', margin: '0 0 8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, margin: 0, maxWidth: 500 }}>{step.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ READY TO CHAT CTA ═══ */}
      <section style={{ padding: '64px 0 48px', maxWidth: 640, margin: '0 auto', paddingLeft: 32, paddingRight: 32 }}>
        <RevealSection>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0D0D0D', margin: '0 0 24px', lineHeight: 1.15 }}>
            Ready to chat?
          </h2>
          <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '20px', background: '#fff' }}>
            <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.35)', margin: '0 0 16px' }}>
              Tell us about your business or ask a question...
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => onChipClick("I want to sell my business. Help me understand what it's worth and how to prepare.")}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#0D0D0D', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px' }}
                type="button"
              >
                Send Message
              </button>
            </div>
          </div>
        </RevealSection>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex gap-1">
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', display: 'inline-block' }} />
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', display: 'inline-block' }} />
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)' }}>
            Our deal team is online and ready to review your data.
          </span>
        </div>
      </section>
    </div>
  );
}
