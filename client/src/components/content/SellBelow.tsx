import {
  RevealSection,
  InteractiveCalculator,
  AnimatedTimeline,
  BeforeAfterSlider,
  MagneticButton,
  PulseBadge,
  ScrollReveal,
  DealPreview,
  DataCard,
  SideBySideCard,
  ExpandableCard,
} from './animations';

interface SellBelowProps {
  onChipClick: (text: string) => void;
}

const sectionStyle = { maxWidth: 580, margin: '0 auto' } as const;
const labelStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#C96B4F' };
const h2Style = { fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 };
const bodyStyle = { fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65, margin: 0 };
const cardStyle = { background: '#FFFFFF', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '28px 32px' };

export default function SellBelow({ onChipClick }: SellBelowProps) {
  return (
    <div className="px-6">
      {/* ═══ 1. THE NUMBER — Bizestimate ═══ */}
      <section style={{ paddingTop: 120 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE NUMBER</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Every owner asks the same first question.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>&ldquo;What is my business actually worth?&rdquo;</p>
              <p>The broker wants the listing. The CPA knows the taxes, not the market. Google returns articles from 2019. Nobody gives you a real number without an agenda.</p>
              <p>Yulia does. Tell her your industry, location, and revenue. She&apos;ll give you a valuation range built on live federal data &mdash; Census business counts, BLS wage benchmarks, SBA lending patterns, and real transaction multiples.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>Your Bizestimate is free. It updates quarterly. You can have one in 90 seconds.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <DealPreview
              title="BIZESTIMATE \u2014 EXAMPLE"
              metrics={[
                { label: 'Adjusted SDE', value: '$444K' },
                { label: 'Multiple range', value: '2.8\u20133.5\u00D7' },
                { label: 'Value range', value: '$1.24M\u2013$1.55M' },
                { label: 'Data sources', value: '5 federal' },
              ]}
              cta="Generated in 90 seconds from industry, location, and revenue"
            />
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. THE HIDDEN MONEY — Add-backs ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE HIDDEN MONEY</span>
            <h2 style={h2Style} className="md:text-[48px]">
              The $400,000 most owners leave on the table.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              Your tax returns are optimized to minimize what you owe. That&apos;s smart &mdash; until you try to sell. Yulia scans your financials and flags every personal expense running through the business. Included in your plan.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <InteractiveCalculator
              baseSDE={320000}
              multiple={3.2}
              items={[
                { label: 'Personal vehicles', amount: 48000, enabled: true },
                { label: 'Family cell phones', amount: 18000, enabled: true },
                { label: 'One-time legal fee', amount: 12000, enabled: true },
                { label: 'Above-market rent to own LLC', amount: 31000, enabled: true },
                { label: 'Personal travel', amount: 15000, enabled: true },
              ]}
            />
            <p style={{ fontSize: '13px', color: 'rgba(26,26,24,0.4)', marginTop: 12, fontStyle: 'italic', textAlign: 'center' }}>
              Toggle add-backs on/off to see the impact on your valuation
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 3. THE TAX BLINDSPOT — Structure ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE TAX BLINDSPOT</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Asset sale vs. stock sale: what you actually keep.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 20 }}>
              The deal structure can swing your net proceeds by $100K+. Yulia models both scenarios side-by-side so you negotiate from an informed position.
            </p>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <SideBySideCard
              leftLabel="ASSET SALE"
              rightLabel="STOCK SALE"
              leftItems={[
                { label: 'Purchase price', value: '$2,000,000' },
                { label: 'Federal + NIIT', value: '~$518K' },
                { label: 'State tax (CA)', value: '~$266K' },
                { label: 'Net proceeds', value: '~$1,166,000' },
              ]}
              rightItems={[
                { label: 'Purchase price', value: '$2,000,000' },
                { label: 'Federal + NIIT', value: '~$452K' },
                { label: 'State tax (CA)', value: '~$253K' },
                { label: 'Net proceeds', value: '~$1,245,000' },
              ]}
            />
          </RevealSection>

          <RevealSection style={{ marginTop: 24 }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A18', lineHeight: 1.65 }}>
              The stock sale puts $79,000 more in this seller&apos;s pocket. But the buyer gets a stepped-up basis worth ~$304K in tax shields on an asset sale. Yulia models the gap for both sides.
            </p>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 8, fontStyle: 'italic' }}>
              Your CPA should confirm for your specific situation.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 4. YOUR OPTIONS — Six exit types ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>YOUR OPTIONS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              &ldquo;Selling&rdquo; doesn&apos;t mean one thing.
            </h2>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { title: 'Full Sale', preview: 'Hand over the keys. Maximum liquidity.', detail: 'Yulia handles valuation, CIM, buyer targeting, deal structure, negotiation guidance, and closing preparation. The complete exit process.' },
              { title: 'Partner Buyout', preview: 'One of you wants out.', detail: 'A number both sides trust, financing that works, a buyout agreement that protects everyone. Yulia models fair value and structures the separation.' },
              { title: 'Partial Sale to PE', preview: 'Take chips off the table.', detail: 'Sell majority and keep upside. Yulia models the equity rollover, earnout structure, and post-transaction economics.' },
              { title: 'ESOP Conversion', preview: 'Employee ownership with tax advantages.', detail: 'Transition to employee ownership with potential Section 1042 tax deferral. Yulia screens eligibility and models the structure.' },
              { title: 'Raise Capital Instead', preview: 'Grow without selling.', detail: 'Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor-ready materials.' },
              { title: 'Management Buyout', preview: 'Your team takes over.', detail: 'Internal succession with seller financing. Yulia structures the deal so the business cash flow funds the acquisition.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <ExpandableCard title={item.title} preview={item.preview}>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.detail}</p>
                </ExpandableCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. THE LIVING CIM ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE LIVING CIM</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Your CIM updates when your financials do.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>A traditional CIM is a snapshot &mdash; frozen the day it was written. By the time buyers see it, the numbers are already stale.</p>
              <p>Yulia generates your CIM from live data. When your Q3 numbers come in, the CIM reflects them. When market multiples shift, the valuation updates. Version-controlled. Always ready to distribute.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>25+ pages of institutional-quality presentation, built from your actual financials. Included in your plan.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 6. THE PROCESS — 4-phase journey ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>THE PROCESS</span>
            <h2 style={h2Style} className="md:text-[48px]">
              A premium exit is a process. Yulia manages it.
            </h2>
            <p style={{ ...bodyStyle, marginTop: 16 }}>
              Every month of preparation can move your sale price 5&ndash;15%.
            </p>
          </RevealSection>

          <div style={{ marginTop: 40 }}>
            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  { phase: 'Phase 1 \u2014 Understand', timing: 'Month 1\u20132', badge: 'FREE', body: 'Bizestimate + Value Readiness Report + Preliminary SDE/EBITDA. See your business through a buyer\u2019s eyes.' },
                  { phase: 'Phase 2 \u2014 Optimize', timing: 'Month 3\u201312', body: 'A $50K improvement in EBITDA at 5\u00D7 adds $250K to your sale price. Yulia builds a prioritized plan: revenue concentration, management depth, margins, and clean books.' },
                  { phase: 'Phase 3 \u2014 Prepare', timing: 'Month 6\u201318', body: 'CIM. Financial exhibits. Teaser profile. Data room. Buyer targeting. Everything a qualified buyer needs \u2014 generated from the intelligence Yulia has already built.' },
                  { phase: 'Phase 4 \u2014 Negotiate & Close', timing: 'Month 12\u201324', body: 'LOI evaluation. Deal structure modeling. Earnout analysis. Working capital adjustments. Real negotiation tactics \u2014 anchoring, concessions, competitive tension.' },
                ].map((p, i) => (
                  <ScrollReveal key={p.phase} delay={i * 0.1}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C96B4F', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                      </div>
                      <div className="pb-2">
                        <span style={labelStyle}>
                          {p.phase} &middot; {p.timing}
                          {p.badge && <PulseBadge style={{ marginLeft: 8 }}>{p.badge}</PulseBadge>}
                        </span>
                        <p style={{ ...bodyStyle, marginTop: 10 }}>{p.body}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </AnimatedTimeline>
          </div>
        </div>
      </section>

      {/* ═══ 7. LEGAL PREPARATION ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>LEGAL PREPARATION</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Three deal-killers. Know them before they find you.
            </h2>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { title: 'Reps & Warranties', preview: 'Your factual statements about the business.', detail: 'If one turns out false, the buyer can claw back money through indemnification. Yulia identifies which reps matter most for your industry and flags the language traps \u2014 like the difference between \u201Cto Seller\u2019s knowledge\u201D and \u201Cto Seller\u2019s knowledge after reasonable inquiry.\u201D' },
              { title: 'Indemnification & Escrow', preview: '5\u201315% of purchase price held 12\u201318 months after closing.', detail: 'That\u2019s cash you don\u2019t receive at close. Yulia models the escrow impact on your actual take-home and recommends negotiation targets for basket, cap, and escrow duration.' },
              { title: 'Non-Compete & Lease Assignment', preview: 'Enforceability varies by state. Lease is a hidden deal-killer.', detail: 'California generally doesn\u2019t enforce non-competes \u2014 except for business sales. If the business depends on a location, the landlord must approve the transfer. Yulia flags these early.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <ExpandableCard title={item.title} preview={item.preview}>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.detail}</p>
                </ExpandableCard>
              </RevealSection>
            ))}
          </div>

          <RevealSection style={{ marginTop: 16 }}>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', fontStyle: 'italic' }}>
              Your M&amp;A attorney drafts the documents. Yulia prepares you for what to expect and what to negotiate.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 8. BROKER PARTNERSHIP ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>BROKER PARTNERSHIP</span>
            <h2 style={h2Style} className="md:text-[48px]">
              Working with a broker? Even better.
            </h2>
          </RevealSection>

          <RevealSection style={{ marginTop: 32 }}>
            <div className="space-y-6" style={bodyStyle}>
              <p>Bring your smbX.ai analysis to your first meeting. They get: normalized financials, defensible valuation, market intelligence, draft CIM, tax structure comparison, and a term sheet framework &mdash; before the engagement letter.</p>
              <p>Your broker focuses on relationships and negotiations. Yulia handles the data.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>The professionals you hire will thank you for it.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 9. BUILT FOR YOUR DEAL ═══ */}
      <section style={{ paddingTop: 140 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <span style={labelStyle}>BUILT FOR YOUR DEAL</span>
            <h2 style={h2Style} className="md:text-[48px]">
              First sale or fifth. Yulia adapts.
            </h2>
          </RevealSection>

          <div className="space-y-3" style={{ marginTop: 40 }}>
            {[
              { title: 'Owner-Operated ($300K\u2013$2M SDE)', preview: 'Step-by-step. SDE-based. Plain English.', detail: 'SDE-based analysis because that\u2019s what SBA lenders and individual buyers use. Clear language without jargon \u2014 because this is probably your first time selling.' },
              { title: 'Established Business ($2M\u2013$10M EBITDA)', preview: 'Institutional quality. EBITDA metrics. PE buyer mapping.', detail: 'A CIM that reads like it was written by a boutique advisory firm. Competitive process design. PE buyer mapping \u2014 which platforms are actively acquiring in your sector.' },
              { title: 'Institutional ($10M+ EBITDA)', preview: 'Board-level deliverables. DCF modeling.', detail: 'DCF modeling with sensitivity analysis. Arbitrage spread calculations. Covenant analysis for leveraged structures. The analytical depth PE buyers and strategic acquirers expect.' },
            ].map(item => (
              <RevealSection key={item.title}>
                <ExpandableCard title={item.title} preview={item.preview}>
                  <p style={{ ...bodyStyle, fontSize: '15px' }}>{item.detail}</p>
                </ExpandableCard>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 10. THE PAYOFF + CTA ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={sectionStyle}>
          <RevealSection>
            <p style={{ fontSize: 36, fontWeight: 300, color: '#1A1A18', lineHeight: 1.25, margin: 0, textAlign: 'center', padding: '48px 0' }}>The wire hits your account. And you know.</p>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6" style={bodyStyle}>
              <p>Not &ldquo;I hope I got a fair deal.&rdquo; Not &ldquo;I wonder if I left money on the table.&rdquo;</p>
              <p>You know your number was real. You know your add-backs were captured. You know the tax structure was modeled. You know the negotiation was prepared, not improvised.</p>
              <p style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s what Yulia delivers: the confidence that comes from knowing you made the right moves.</p>
            </div>
          </RevealSection>

          <RevealSection style={{ marginTop: 40 }}>
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your business &rarr; free Bizestimate in 90 seconds</p>
            <MagneticButton
              onClick={() => onChipClick("I want to sell my business")}
              style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Message Yulia &rarr;
            </MagneticButton>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
