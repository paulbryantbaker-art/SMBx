import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  InteractiveCalculator,
  AnimatedTimeline,
  StatBar,
  BeforeAfterSlider,
  MagneticButton,
  PulseBadge,
  GlowingOrb,
  FloatingParticles,
  TiltCard,
} from './animations';

interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — Memo: Starting point [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <GlowingOrb size={260} top="-80px" right="-60px" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>STARTING POINT</span>
              <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
                It starts with one question.
              </h2>
              <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
                <p className="m-0">Every business owner has a moment. It might come at 2am, or in a conversation with a spouse, or when a competitor gets acquired for a number that makes their jaw drop.</p>
                <p className="m-0">The moment is: &ldquo;What is my business actually worth?&rdquo;</p>
                <p className="m-0">And then &mdash; silence. The broker wants the listing. The CPA knows the taxes, not the market. Google returns articles from 2019. Nobody gives you a real number without an agenda.</p>
                <p className="m-0">Yulia does. Tell her your industry, location, and revenue. She&apos;ll give you a valuation range built on live federal data &mdash; Census business counts, BLS wage benchmarks, SBA lending patterns, and real transaction multiples for your sector and geography.</p>
                <p className="m-0">Your Bizestimate updates every quarter. Share the link with your partner, your CPA, your attorney &mdash; anyone who needs to see the number.</p>
                <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Most business owners have never seen a real number for what their company is worth. You can have one in 90 seconds.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Stat bar ═══ */}
      <section className="px-6" style={{ paddingTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <StatBar stats={[
            { label: 'Seconds to Bizestimate', value: 90, suffix: 's' },
            { label: 'Federal data sources', value: 5 },
            { label: 'Updated quarterly', value: 4, suffix: '×/yr' },
          ]} />
        </div>
      </section>

      {/* ═══ Block 2 — Interactive Add-back Calculator ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>ADD-BACK ANALYSIS &middot; EXAMPLE</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              The $400,000 most owners leave on the table.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              Your tax returns are optimized to minimize what you owe. That&apos;s smart &mdash; until you try to sell. Yulia scans your financials and flags every personal expense running through the business.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="max-w-2xl">
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
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 3 — Canvas: Exit options ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>EXIT OPTIONS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              &ldquo;Selling&rdquo; doesn&apos;t mean one thing.
            </h2>
          </ScrollReveal>

          <StaggerContainer className="space-y-4">
            {[
              { icon: '\uD83D\uDD11', title: 'Sell Everything', body: 'Full exit. Hand over the keys. Yulia handles valuation, CIM, buyer targeting, deal structure, negotiation, close.' },
              { icon: '\uD83E\uDD1D', title: 'Buy Out a Partner', body: 'One of you wants out. A number both sides trust, financing that works, a buyout agreement that protects everyone.' },
              { icon: '\uD83D\uDCB0', title: 'Raise Capital', body: 'Grow without selling. Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor-ready materials.' },
              { icon: '\uD83D\uDC65', title: 'Employee Buyout (ESOP)', body: 'Transition to employee ownership \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
              { icon: '\uD83D\uDCCA', title: 'Partial Sale', body: 'Sell majority to PE. Bring on a strategic partner. Take chips off the table while keeping upside.' },
            ].map(c => (
              <StaggerItem key={c.title}>
                <TiltCard style={{ background: '#F7F6F4', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>
                    <span style={{ marginRight: 8 }}>{c.icon}</span>{c.title}
                  </h3>
                  <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal delay={0.2}>
            <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 24, lineHeight: 1.65 }}>
              Whatever your exit looks like, the process starts the same way: understanding exactly what you have and what it&apos;s worth.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 4 — Animated Seller Journey Timeline [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>SELLER JOURNEY &middot; GUIDED PROCESS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              A premium exit is a process. Yulia manages it.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.65 }}>
              Every month of preparation can move your sale price 5&ndash;15%.
            </p>

            <AnimatedTimeline>
              <div className="space-y-10">
                {[
                  { phase: 'Phase 1 \u2014 Understand', timing: 'Month 1\u20132', badge: 'FREE', body: 'See your business through a buyer\u2019s eyes. Yulia normalizes your financials, identifies add-backs, runs a preliminary valuation, benchmarks margins, and flags risks that would surface in due diligence. You receive: Bizestimate + Value Readiness Report + Preliminary SDE/EBITDA \u2014 all free.' },
                  { phase: 'Phase 2 \u2014 Optimize', timing: 'Month 3\u201312', body: 'A $50K improvement in EBITDA at 5\u00D7 adds $250,000 to your sale price. Yulia builds a prioritized plan: revenue concentration, management depth, margins, and clean books. Every recommendation is quantified.' },
                  { phase: 'Phase 3 \u2014 Prepare', timing: 'Month 6\u201318', body: 'CIM. Financial exhibits. Teaser profile. Data room. Buyer targeting. Everything a qualified buyer needs \u2014 generated by Yulia from the intelligence she\u2019s already built.' },
                  { phase: 'Phase 4 \u2014 Negotiate & Close', timing: 'Month 12\u201324', body: 'LOI evaluation. Deal structure modeling. Earnout analysis. Working capital adjustments. Competitive process management. Real negotiation tactics \u2014 anchoring, concessions, competitive tension, earnout protection, structure as leverage.' },
                ].map((p, i) => (
                  <ScrollReveal key={p.phase} delay={i * 0.1}>
                    <div className="flex gap-4" style={{ paddingLeft: 12 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ marginLeft: -8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4714E', marginTop: 6, boxShadow: '0 0 0 4px rgba(212,113,78,0.15)' }} />
                      </div>
                      <div className="pb-2">
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>
                          {p.phase} &middot; {p.timing}
                          {p.badge && <PulseBadge style={{ marginLeft: 8 }}>{p.badge}</PulseBadge>}
                        </span>
                        <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '10px 0 0', lineHeight: 1.65 }}>{p.body}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </AnimatedTimeline>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 5 — Before/After: Tax structure comparison ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TAX STRUCTURE ANALYSIS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              Asset sale vs. stock sale: what you actually keep.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              The deal structure you choose can swing your net proceeds by $100K+. Yulia models both scenarios side-by-side so you negotiate from an informed position.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.45)', display: 'block', marginBottom: 16 }}>SAME $2M DEAL &mdash; TWO STRUCTURES, TWO OUTCOMES</span>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <BeforeAfterSlider
              beforeLabel="ASSET SALE"
              afterLabel="STOCK SALE"
              beforeContent={
                <div style={{ background: '#F7F6F4', padding: '32px', minHeight: 260 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5, fontVariantNumeric: 'tabular-nums' }}>
                    <div className="flex justify-between"><span>Purchase price</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>$2,000,000</span></div>
                    <div className="flex justify-between"><span>Federal + NIIT tax</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~$518K</span></div>
                    <div className="flex justify-between"><span>State tax (CA example)</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~$266K</span></div>
                    <div style={{ borderTop: '1px solid rgba(26,26,24,0.08)', paddingTop: 12, marginTop: 8 }} className="flex justify-between">
                      <span style={{ fontWeight: 600, color: '#1A1A18' }}>Net proceeds</span>
                      <span style={{ fontWeight: 700, color: '#1A1A18', fontSize: '17px' }}>~$1,166,000</span>
                    </div>
                  </div>
                </div>
              }
              afterContent={
                <div style={{ background: '#D4714E', padding: '32px', minHeight: 260 }}>
                  <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontVariantNumeric: 'tabular-nums' }}>
                    <div className="flex justify-between"><span>Purchase price</span><span style={{ color: '#fff', fontWeight: 600 }}>$2,000,000</span></div>
                    <div className="flex justify-between"><span>Federal + NIIT tax</span><span style={{ color: '#fff', fontWeight: 600 }}>~$452K</span></div>
                    <div className="flex justify-between"><span>State tax (CA example)</span><span style={{ color: '#fff', fontWeight: 600 }}>~$253K</span></div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12, marginTop: 8 }} className="flex justify-between">
                      <span style={{ fontWeight: 600, color: '#fff' }}>Net proceeds</span>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '17px' }}>~$1,245,000</span>
                    </div>
                  </div>
                </div>
              }
            />
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginTop: 24, lineHeight: 1.65 }}>
              The stock sale puts $79,000 more in this seller&apos;s pocket. But the buyer may push for an asset sale &mdash; they get a stepped-up basis worth ~$304K in tax shields. Yulia models the gap so both sides negotiate from real numbers, not assumptions.
            </p>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 8, fontStyle: 'italic' }}>
              Your CPA should confirm these numbers for your specific situation.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 6 — Canvas: Entity type flags [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <FloatingParticles count={4} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>ENTITY TYPE &middot; WHAT YULIA CHECKS</span>
              <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
                Your entity type changes everything about the tax outcome.
              </h2>

              <StaggerContainer className="space-y-4">
                {[
                  { icon: '\u26A0\uFE0F', title: 'C-Corporation \u2014 double taxation trap', body: 'Asset sales trigger TWO levels of tax: corporate level (21%) THEN shareholder level (up to 23.8%). Can cost $200K+ more than an S-Corp on the same deal. Yulia flags this immediately and explores alternatives: stock sale, \u00A7338(h)(10) election, or QSBS exclusion.' },
                  { icon: '\u2705', title: 'S-Corporation', body: 'Pass-through \u2014 no entity-level tax. But if you converted from a C-Corp in the last 5 years, built-in gains tax may apply. Yulia checks.' },
                  { icon: '\uD83D\uDCCB', title: 'LLC / Partnership', body: 'Watch for \u00A7751 \u201Chot assets\u201D \u2014 inventory and receivables get taxed as ordinary income even in what looks like a capital gains transaction. A \u00A7754 election can give buyers a basis step-up inside a partnership interest sale.' },
                  { icon: '\uD83D\uDCCE', title: 'Sole Proprietorship', body: 'Asset sale only. Straightforward, but allocation matters \u2014 non-compete income may trigger self-employment tax.' },
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
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 7 — Canvas: Pre-sale tax planning ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PRE-SALE TAX PLANNING</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              What you do before the sale matters as much as the sale itself.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              If your timeline allows, these strategies can significantly improve your after-tax outcome:
            </p>
          </ScrollReveal>

          <StaggerContainer className="space-y-0" staggerDelay={0.06}>
            {[
              'Entity conversion (C\u2192S-Corp) \u2014 eliminates double taxation, but requires a 5-year waiting period for built-in gains tax to expire',
              'Installment sale structuring \u2014 seller financing spreads gain recognition over the payment period, potentially keeping you in lower brackets each year',
              'QSBS screening (C-Corps only) \u2014 IRC \u00A71202 can exclude up to $10M in federal capital gains. Requires original issuance stock, 5+ year holding period, and <$50M gross assets',
              'Purchase price allocation strategy \u2014 maximize goodwill (capital gains) and minimize ordinary income items before negotiation',
              'Opportunity Zone reinvestment \u2014 within 180 days of close, reinvesting in a qualified OZ fund can defer and reduce capital gains',
              'Harvest losses in the year of sale \u2014 sell losing investments to offset deal gains dollar-for-dollar',
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div style={{ padding: '16px 0', borderTop: i > 0 ? '1px solid rgba(26,26,24,0.06)' : undefined }}>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal delay={0.3}>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 16, fontStyle: 'italic' }}>
              Yulia models these scenarios with real numbers for your deal. Your CPA confirms the specifics.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 8 — Canvas: Negotiation intelligence ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>NEGOTIATION INTELLIGENCE</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              You do this once. The buyer&apos;s attorney does it fifty times.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.65 }}>Yulia levels the field:</p>
          </ScrollReveal>

          <StaggerContainer className="space-y-0" staggerDelay={0.06}>
            {[
              'Anchoring \u2014 how to frame your price so it sticks',
              'Concessions \u2014 trade what costs you least for what matters most to the buyer',
              'Competitive tension \u2014 create it, even with few buyers',
              'Earnout protection \u2014 flag terms designed to fail (and the tax trap: earnout payments tied to your continued employment get recharacterized as ordinary income)',
              'Structure as leverage \u2014 sometimes the structure IS the negotiation',
              'Purchase price allocation \u2014 the negotiation most sellers don\u2019t know about, worth tens of thousands in tax outcomes',
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div style={{ padding: '16px 0', borderTop: i > 0 ? '1px solid rgba(26,26,24,0.06)' : undefined }}>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ Block 9 — Canvas: Legal preparation [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>LEGAL PREPARATION</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              What&apos;s coming in the APA &mdash; and how to be ready for it.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              The Asset Purchase Agreement is 15&ndash;60 pages of terms that determine your risk after closing. Yulia explains every section in plain English before you see the actual document.
            </p>

            <StaggerContainer className="space-y-4">
              {[
                { icon: '\uD83D\uDCC4', title: 'Reps & warranties', body: 'Your factual statements about the business. If one turns out false, the buyer can claw back money through indemnification. Yulia identifies which reps matter most for your industry and flags the language traps \u2014 like the difference between \u201Cto Seller\u2019s knowledge\u201D and \u201Cto Seller\u2019s knowledge after reasonable inquiry.\u201D' },
                { icon: '\uD83D\uDD12', title: 'Indemnification & escrow', body: 'Typically 5\u201315% of the purchase price is held in escrow for 12\u201318 months after closing to cover claims. That\u2019s cash you don\u2019t receive at close. Yulia models the escrow impact on your actual take-home and recommends negotiation targets for basket, cap, and escrow duration.' },
                { icon: '\uD83D\uDCCB', title: 'Non-compete terms', body: 'Standard 2\u20135 years, but enforceability varies dramatically by state. California generally doesn\u2019t enforce non-competes \u2014 except for the sale of a business. Texas and Florida enforce broadly. Yulia checks your state and flags what\u2019s reasonable.' },
                { icon: '\uD83C\uDFE2', title: 'Lease assignment', body: 'If the business depends on a location, the landlord must approve the transfer. They\u2019ll likely want higher rent, a personal guarantee from the buyer, or both. Yulia flags this early \u2014 it\u2019s a hidden deal-killer if handled too late.' },
                { icon: '\uD83C\uDFE5', title: 'Regulatory & license transfers', body: 'Healthcare, childcare, construction, pest control, food service \u2014 many industries require new license applications from the buyer. Some take 3\u20136 months. Yulia checks your industry and builds the timeline.' },
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
              Your M&amp;A attorney will draft the actual documents. Yulia prepares you for what to expect and what to negotiate.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 10 — Memo: For advisors ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>FOR ADVISORS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
              Working with a broker? Even better.
            </h2>
            <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              <p className="m-0">Bring your smbX.ai analysis to your first meeting. They get: normalized financials, defensible valuation, market intelligence, draft CIM, tax structure comparison, and a term sheet framework &mdash; before the engagement letter.</p>
              <p className="m-0">Your broker focuses on relationships and negotiations. Yulia handles the data. Together, it&apos;s the best of both worlds &mdash; the human judgment of a seasoned advisor backed by institutional-grade intelligence.</p>
              <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>The professionals you hire will thank you for it.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 11 — Memo: The payoff ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
              The wire hits your account. And you know.
            </h2>
            <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              <p className="m-0">Not &ldquo;I hope I got a fair deal.&rdquo; Not &ldquo;I wonder if I left money on the table.&rdquo; Not &ldquo;I wish I&apos;d started this sooner.&rdquo;</p>
              <p className="m-0">You know your number was real. You know your add-backs were captured. You know your CIM was institutional quality. You know the tax structure was modeled. You know the negotiation was prepared, not improvised.</p>
              <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s what Yulia delivers: the confidence that comes from knowing &mdash; at every stage &mdash; that you made the right moves.</p>
            </div>
          </ScrollReveal>

          {/* Block 12 — Next Step */}
          <ScrollReveal delay={0.2}>
            <div className="mt-10">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your business &rarr; free valuation range in 90 seconds</p>
              <MagneticButton
                onClick={() => onChipClick("I want to sell my business")}
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
