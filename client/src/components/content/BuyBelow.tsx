import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  DSCRCalculator,
  AnimatedTimeline,
  StatBar,
  BeforeAfterSlider,
  MagneticButton,
  GlowingOrb,
  FloatingParticles,
  TiltCard,
} from './animations';

interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — Memo: Any deal, any source [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <GlowingOrb size={260} top="-80px" right="-60px" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>ANY DEAL &middot; ANY SOURCE</span>
              <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
                The most expensive mistake is three months on the wrong deal.
              </h2>
              <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
                <p className="m-0">Every day spent evaluating the wrong deal is a day you&apos;re not closing the right one. And in a market where good businesses sell in weeks, speed to conviction is everything.</p>
                <p className="m-0">Bring it to Yulia. Paste a BizBuySell listing. Describe something your broker sent you. Tell her about a business you heard is for sale.</p>
                <p className="m-0">Within minutes: financial validation against federal benchmarks, SBA financing modeled at live rates, competitive landscape mapped for that metro, risks flagged &mdash; and a clear answer. Pursue or pass.</p>
                <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Every listing site in the world just became your top-of-funnel. smbX.ai is where you analyze them.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 2 — Canvas: Five dimensions ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>DEAL EVALUATION &middot; FIVE DIMENSIONS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              Five dimensions. One answer.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.65 }}>Yulia gets you to conviction &mdash; fast.</p>
          </ScrollReveal>

          <StaggerContainer className="space-y-4">
            {[
              { icon: '\uD83D\uDCB0', title: 'Financials', body: 'Seller claims $600K SDE. Census data says that implies 50% margins \u2014 realistic? Yulia checks against federal benchmarks, not guesswork.' },
              { icon: '\uD83C\uDFE6', title: 'Financing', body: '$1.8M asking, 10% down, live SBA rate: monthly P&I is $14,200. DSCR is 1.87 \u2014 above the 1.25 threshold. Bankable.' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'Market', body: '847 competitors in the metro. PE firms rolling up the sector. BLS wages growing 4%. Good market \u2014 or buying at the top?' },
              { icon: '\u26A0\uFE0F', title: 'Risks', body: 'Customer concentration. Owner dependency. Declining revenue. Yulia flags them before the seller\u2019s broker does.' },
              { icon: '\u2705', title: 'Verdict', body: 'Pursue \u2014 with these conditions. Or pass \u2014 for these reasons. A real answer with real reasoning.' },
            ].map(c => (
              <StaggerItem key={c.title}>
                <TiltCard style={{ background: '#F7F6F4', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>
                    <span style={{ marginRight: 8 }}>{c.icon}</span>{c.title}
                  </h3>
                  <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Interactive DSCR Calculator ═══ */}
      <section className="px-6" style={{ paddingTop: '100px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl">
              <DSCRCalculator />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 3 — Canvas: Free starting point [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>FREE STARTING POINT</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              Before you pay anything, you get this.
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { icon: '\uD83D\uDCCB', title: 'Investment Thesis Document', body: 'Your acquisition blueprint \u2014 criteria, capital stack template, SBA eligibility, market landscape. What search funds build in-house with full-time analysts.' },
                { icon: '\uD83D\uDCCA', title: 'Capital Stack Template', body: '\u201CHere\u2019s how a $1.8M acquisition gets funded.\u201D SBA loan, equity, seller note, monthly debt service.' },
              ].map(item => (
                <ScrollReveal key={item.title} delay={0.1}>
                  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>{item.icon} {item.title}</h3>
                    <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{item.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#D4714E', marginTop: 24, lineHeight: 1.65 }} className="md:text-center">
              Both free. Both generated from your first conversation.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 4 — Before/After: Buyer tax benefits ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TAX STRUCTURE &middot; BUYER PERSPECTIVE</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              The deal structure determines your true cost of ownership.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              Asset sales and stock sales aren&apos;t just different for the seller. The structure directly affects your tax deductions &mdash; and your real return on investment.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <BeforeAfterSlider
              beforeLabel="STOCK SALE"
              afterLabel="ASSET SALE (BUYER-FAVORABLE)"
              beforeContent={
                <div style={{ background: '#F7F6F4', padding: '32px', minHeight: 280 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5 }}>
                    <div className="flex justify-between"><span>Basis step-up</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>No</span></div>
                    <div className="flex justify-between"><span>Goodwill amortization</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>None</span></div>
                    <div className="flex justify-between"><span>Equipment depreciation</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>Seller&apos;s schedule</span></div>
                    <div className="flex justify-between"><span>NPV of tax shields</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~$0</span></div>
                    <div className="flex justify-between"><span>Inherited liabilities</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>ALL</span></div>
                  </div>
                </div>
              }
              afterContent={
                <div style={{ background: '#D4714E', padding: '32px', minHeight: 280 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    <div className="flex justify-between"><span>Basis step-up</span><span style={{ color: '#fff', fontWeight: 600 }}>Yes</span></div>
                    <div className="flex justify-between"><span>Goodwill amortization</span><span style={{ color: '#fff', fontWeight: 600 }}>~$97K/yr</span></div>
                    <div className="flex justify-between"><span>Equipment depreciation</span><span style={{ color: '#fff', fontWeight: 600 }}>Fresh</span></div>
                    <div className="flex justify-between"><span>NPV of tax shields</span><span style={{ color: '#fff', fontWeight: 600 }}>~$304,000</span></div>
                    <div className="flex justify-between"><span>Inherited liabilities</span><span style={{ color: '#fff', fontWeight: 600 }}>Only agreed</span></div>
                  </div>
                </div>
              }
            />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginTop: 24, lineHeight: 1.65 }}>
              On a $2M deal, the asset sale tax shield is worth ~$304K to the buyer in present value. That&apos;s why buyers push for asset sales &mdash; and why sellers resist (they pay more tax). Yulia models both sides so you negotiate from the real numbers.
            </p>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 8, fontStyle: 'italic' }}>
              Your CPA should confirm the deduction schedule for your specific situation.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 5 — Canvas: Legal due diligence [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <FloatingParticles count={4} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>LEGAL DUE DILIGENCE</span>
              <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
                What to verify before you sign.
              </h2>
              <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
                The APA protects you only if the reps and warranties are right. Yulia builds a due diligence checklist calibrated to the deal&apos;s industry, size, and structure.
              </p>

              <StaggerContainer className="space-y-4">
                {[
                  { icon: '\uD83D\uDCC4', title: 'Reps & warranty review', body: 'The seller\u2019s factual statements about the business. Yulia identifies which reps are standard, which are missing, and which need broader language. Key focus: financial accuracy, no undisclosed liabilities, tax compliance, IP ownership, and material contracts.' },
                  { icon: '\u26A0\uFE0F', title: 'Red flag scoring', body: 'Every DD finding gets scored: minor (proceed), major (negotiate price adjustment), or deal-breaker (walk away). Yulia calculates the dollar impact of each issue and recommends price adjustments.' },
                  { icon: '\uD83C\uDFE2', title: 'Lease and location', body: 'Is the lease assignable? How much term remains? What will the landlord demand? If the business depends on the location, this is a potential deal-killer \u2014 Yulia flags it early.' },
                  { icon: '\uD83C\uDFE5', title: 'Licenses and permits', body: 'Healthcare, childcare, construction, food service, pest control \u2014 many require new applications from you. Some take 3\u20136 months. Yulia checks the industry and builds the regulatory transfer timeline.' },
                  { icon: '\uD83D\uDC65', title: 'Employee transition', body: 'In an asset sale, employees are terminated by the seller and rehired by you. You choose who to hire. But prior liabilities (WARN Act, benefits, PTO) need to be clearly allocated. In a stock sale, all employees \u2014 and all their baggage \u2014 come with the entity.' },
                  { icon: '\uD83D\uDCCB', title: 'Working capital mechanism', body: 'Fixed price? Peg with true-up? Locked box? The working capital adjustment is where deals get renegotiated after the LOI. Yulia calculates the trailing 12-month average, flags seasonal patterns, and models the range of true-up outcomes.' },
                ].map(c => (
                  <StaggerItem key={c.title}>
                    <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>
                        <span style={{ marginRight: 8 }}>{c.icon}</span>{c.title}
                      </h3>
                      <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 16, fontStyle: 'italic' }}>
                Your M&amp;A attorney drafts the actual APA. Yulia ensures you know what to expect, what to negotiate, and what to walk away from.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 6 — Animated Buyer Journey Timeline ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>BUYER JOURNEY &middot; GUIDED PROCESS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              From thesis to close &mdash; and 180 days beyond.
            </h2>
          </ScrollReveal>

          <AnimatedTimeline>
            <div className="space-y-10">
              {[
                { phase: 'Phase 1 \u2014 Define Your Thesis', body: 'What industry? Geography? Deal size? Yulia maps the market landscape.' },
                { phase: 'Phase 2 \u2014 Evaluate & Build Conviction', body: 'Financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data.' },
                { phase: 'Phase 3 \u2014 Negotiate & Win', body: 'First offer strategy. Seller financing leverage. Purchase price allocation negotiation. Your walk-away number. Real tactics.' },
                { phase: 'Phase 4 \u2014 Due Diligence & Close', body: 'Organized deal room. DD checklist by industry. Red flag scoring. Price adjustment calculations. Working capital true-up modeling. Everyone in one workspace.' },
                { phase: 'Phase 5 \u2014 Post-Acquisition \u00B7 180 Days', body: 'Day 1\u201330: Stabilize. Retain. Preserve. Day 30\u201390: Optimize. Quick wins. Day 90\u2013180: Grow. Execute the thesis. A customized plan for YOUR business.' },
              ].map((p, i) => (
                <ScrollReveal key={p.phase} delay={i * 0.1}>
                  <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                    <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4714E', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                    </div>
                    <div className="pb-2">
                      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>{p.phase}</span>
                      <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '10px 0 0', lineHeight: 1.65 }}>{p.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </AnimatedTimeline>
        </div>
      </section>

      {/* ═══ Block 7 — Canvas: Buyer types ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>BUYER TYPES</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              First deal or fiftieth. Yulia adapts.
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'First-Time SBA Buyer', body: 'No jargon. Your pace. Tax and legal explained in plain English.' },
              { title: 'Search Fund', body: 'Thesis to close. Pipeline velocity. LOI-to-APA coaching.' },
              { title: 'PE Platform', body: 'Screen at deal-team speed. Arbitrage modeling. Covenant analysis.' },
              { title: 'Strategic', body: 'Synergies, structure, max value. Integration planning from Day 1.' },
            ].map(b => (
              <StaggerItem key={b.title}>
                <TiltCard style={{ background: '#F7F6F4', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px', height: '100%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{b.title}</h3>
                  <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{b.body}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 8 — Memo: The payoff ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
              You own a business. And you know exactly what to do with it.
            </h2>
            <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              <p className="m-0">Not &ldquo;I hope this works out.&rdquo; Not &ldquo;I think I paid the right price.&rdquo; Not &ldquo;Now what?&rdquo;</p>
              <p className="m-0">You have a plan. Specific to this business, this market, this thesis. Built from months of intelligence that Yulia gathered during the acquisition &mdash; carried forward into ownership.</p>
              <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s the difference between buying a business and building wealth.</p>
            </div>
          </ScrollReveal>

          {/* Block 9 — Next Step */}
          <ScrollReveal delay={0.2}>
            <div className="mt-10">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia what you&apos;re looking for &rarr; free acquisition thesis</p>
              <MagneticButton
                onClick={() => onChipClick("I'm looking to buy a business")}
                style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Message Yulia &rarr;
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
