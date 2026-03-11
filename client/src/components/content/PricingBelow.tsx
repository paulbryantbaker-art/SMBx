import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  MagneticButton,
  PulseBadge,
  FeatureGrid,
  PullQuote,
  FullBleedSection,
} from './animations';

interface PricingBelowProps {
  onChipClick: (text: string) => void;
}

export default function PricingBelow({ onChipClick }: PricingBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — Free forever [FeatureGrid 2-col] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>FREE FOREVER</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              These are free. Not &ldquo;free trial&rdquo; free. Free forever.
            </h2>
            <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
              Before Yulia ever mentions a price, she&apos;s already delivered the foundational analysis for your deal.
            </p>
          </ScrollReveal>

          <FeatureGrid
            columns={2}
            items={[
              { title: '\uD83D\uDCCA Bizestimate', body: 'Your business valuation range \u2014 updated quarterly as market conditions change. Shareable link you can send to anyone who needs to see the number.', badge: 'Free' },
              { title: '\uD83D\uDCCB Value Readiness Report', body: '7-factor score with specific improvement actions and dollar-impact estimates. The kind of analysis that feels like $2\u20135K of consultant work.', badge: 'Free' },
              { title: '\uD83C\uDFAF Investment Thesis Document', body: 'Acquisition blueprint with criteria, SBA eligibility, capital stack template, and market landscape overview.', badge: 'Free' },
              { title: '\uD83D\uDCC8 Preliminary SDE / EBITDA', body: 'The add-back math and adjusted earnings calculation \u2014 the foundation everything else is built on.', badge: 'Free' },
              { title: '\u2696\uFE0F Deal Structure Comparison', body: 'Asset sale vs. stock sale net-proceeds modeling. Entity-type flag. Preliminary tax landscape. The analysis that usually requires a $500/hour CPA conversation.', badge: 'Free' },
            ]}
          />

          <ScrollReveal delay={0.3}>
            <div style={{ background: '#FAFAFA', borderRadius: 20, border: '1px solid rgba(0,0,0,0.04)', padding: '20px 28px', marginTop: 16 }}>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>
                Plus: unlimited conversation with Yulia, deal classification, SBA screening, process guidance, exit option analysis, tax structure modeling, legal preparation, and broker recommendations.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 2 — Tier 1 [FeatureGrid 3-col] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TIER 1 &middot; KNOW YOUR POSITION</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              Go deeper when you&apos;re ready.
            </h2>
          </ScrollReveal>

          <FeatureGrid
            columns={3}
            items={[
              { title: 'Business Valuation Report', price: '$350', body: 'Multi-methodology analysis with comps, multiples, and local market data. Defensible at the closing table.' },
              { title: 'Market Intelligence Report', price: '$200', body: 'Competitive landscape, regional economics, PE activity, industry benchmarks \u2014 localized to your MSA.' },
              { title: 'Deal Screening Memo', price: '$150', body: 'Pursue or pass? Financial validation, risk flags, tax structure check, and a clear recommendation.' },
              { title: 'Target Valuation', price: '$350', body: 'What should you actually pay? Comparable transactions, industry multiples, and the fair value range.' },
              { title: 'SBA Financing Model', price: '$200', body: 'Down payment, monthly payment, DSCR, cash-on-cash \u2014 modeled at live rates. Know if it\u2019s bankable.' },
              { title: 'Reality Check', price: '$150', body: 'Quick-turn sanity check on any aspect of your deal \u2014 pricing, timing, structure, tax implications, risk.' },
            ]}
          />

          <ScrollReveal delay={0.3}>
            <p style={{ fontSize: '13px', color: 'rgba(26,26,24,0.4)', marginTop: 16, fontStyle: 'italic' }}>Prices shown are L1/L2. Larger deals scale proportionally.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Block 3 — Tier 2 [FeatureGrid 3-col] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TIER 2 &middot; DOCUMENTS THAT CLOSE DEALS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              Prepare to transact.
            </h2>
          </ScrollReveal>

          <FeatureGrid
            columns={3}
            items={[
              { title: 'Confidential Information Memo', price: '$700', body: '25+ page presentation of your business to qualified buyers. Professional. Data-backed. The document that starts your deal process.' },
              { title: 'Living CIM (auto-updates)', price: '$900', body: 'Your CIM stays current when financials change. Version-controlled. Always ready to distribute.' },
              { title: 'Full Valuation Suite', price: '$500', body: 'Valuation + Market Intel + SBA Feasibility \u2014 bundled together. Save ~$250 vs. individual purchases.', badge: 'Bundle' },
              { title: 'QoE Lite', price: '$500', body: 'Pre-QoE gap analysis. See what a Quality of Earnings firm will find \u2014 before you pay $15K\u2013$150K for one.' },
              { title: 'Tax Structure Analysis', price: '$350', body: 'Full asset-vs-stock comparison with entity-type modeling, purchase price allocation scenarios, installment sale modeling, and QSBS screening.', badge: 'New' },
              { title: 'Term Sheet Generator', price: '$250', body: 'Comprehensive term sheet covering every APA section \u2014 reps, indemnification, escrow, non-compete, working capital \u2014 ready for your attorney.', badge: 'New' },
            ]}
          />
        </div>
      </section>

      {/* ═══ Block 4 — Progressive reveal [FullBleed tinted] ═══ */}
      <FullBleedSection tinted className="mt-20">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PROGRESSIVE REVEAL</span>
          <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginTop: 12, marginBottom: 20 }} className="md:text-[36px]">
            More analysis unlocks as your deal progresses.
          </h3>
          <div style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Yulia introduces additional tools &mdash; LOI drafts, negotiation strategy, due diligence checklists, deal structure analysis, tax optimization modeling, legal preparation, closing documents &mdash; at exactly the moment you need them.</p>
            <p className="m-0 mt-4" style={{ color: '#1A1A18', fontWeight: 600 }}>
              You won&apos;t see a menu of 24 items when you&apos;re just starting out. You&apos;ll see the next right thing &mdash; priced for the stage of the deal you&apos;re in.
            </p>
            <p className="m-0 mt-4">
              That&apos;s not a limitation. That&apos;s the product. The right intelligence at the right moment reduces decision fatigue and makes every purchase feel like the obvious next step.
            </p>
          </div>
        </ScrollReveal>
      </FullBleedSection>

      {/* ═══ Block 5 — Wallet [FeatureGrid 3-col as cards] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>WALLET</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
              Fund your wallet. Spend as you go.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.6 }}>
              No monthly fees. No seat licenses. No surprise invoices. Every purchase is a specific decision at a specific moment in your deal.
            </p>
          </ScrollReveal>

          <FeatureGrid
            columns={3}
            items={[
              { title: '$50', body: 'Exploratory \u2014 get started with a single deliverable.' },
              { title: '$100', body: 'Early commit \u2014 includes $5 bonus. Total: $105.' },
              { title: '$250', body: 'Active deal \u2014 includes $15 bonus. Total: $265. Most popular.', badge: 'Popular' },
              { title: '$500', body: 'Serious seller/buyer \u2014 includes $40 bonus. Total: $540.' },
              { title: '$1,000', body: 'Full deal journey \u2014 includes $100 bonus. Total: $1,100.' },
              { title: '$2,500', body: 'Advisor with multiple clients \u2014 includes $300 bonus. Total: $2,800.' },
            ]}
          />
        </div>
      </section>

      {/* ═══ Block 6 — Philosophy [FullBleed tinted] ═══ */}
      <FullBleedSection tinted className="mt-20">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHILOSOPHY</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            The right intelligence at the right stage.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">When you&apos;re figuring out whether to sell, you need a valuation range and a clear picture of where you stand. Not a six-figure advisory engagement.</p>
            <p className="m-0">When you&apos;re evaluating a listing, you need a fast, data-backed answer: pursue or pass. Not months of analysis.</p>
            <p className="m-0">When you&apos;re ready to go to market, you need institutional-grade documents &mdash; CIMs, financial models, market analysis &mdash; at a price that makes sense for where you are in the process.</p>
            <p className="m-0">When the deal gets real, you need tax structure modeling and legal preparation &mdash; the analysis that informs the decisions your CPA and attorney will help you execute.</p>
            <p className="m-0">That&apos;s what the wallet model does. You pay for what you need, when you need it. Early-stage analysis is affordable enough to remove guesswork. Deal-stage documents are priced to reflect the work &mdash; and the stakes.</p>
            <p className="m-0">And when your deal is ready for a broker, an attorney, or a CPA &mdash; you walk in prepared. With real numbers. With defensible analysis. With tax scenarios modeled. With term sheets drafted. With documents they can build on.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>The professionals you hire will thank you for it.</p>
          </div>
        </ScrollReveal>
      </FullBleedSection>

      {/* ═══ Block 7 — Advisor callout [offset card] ═══ */}
      <section className="px-6" style={{ paddingTop: '100px' }}>
        <ScrollReveal>
          <div className="max-w-4xl mx-auto" style={{ background: '#FAFAFA', borderRadius: 28, border: '1px solid rgba(0,0,0,0.04)', padding: '32px', marginTop: -40, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E', display: 'block', marginBottom: 16 }}>FOR ADVISORS AND BROKERS</span>
            <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 16 }} className="md:text-[36px]">
              Run your first three client journeys free.
            </h3>
            <div className="space-y-4" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }}>
              <p className="m-0">No subscription. Yulia generates the CIM, runs the valuation, models the tax structure, builds the term sheet. You stay in the relationship.</p>
              <p className="m-0">After three journeys, the wallet works like everyone else&apos;s. No per-seat licensing.</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ Block 8 — What we don't charge for [FullBleed] ═══ */}
      <FullBleedSection className="mt-10">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>WHAT WE DON&apos;T CHARGE FOR</span>
        </ScrollReveal>

        <StaggerContainer className="space-y-4 mt-10">
          {[
            'Close fees \u2014 they create friction at the worst moment',
            'Tokens or API calls \u2014 our prices are based on value, not compute',
            'Subscriptions (at launch) \u2014 earn the right first',
            'More than 10 visible choices \u2014 the rest unlock through Yulia',
            'Tax or legal opinions \u2014 Yulia models the landscape and the math; your CPA and attorney provide the advice',
          ].map(item => (
            <StaggerItem key={item}>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: '20px', color: 'rgba(26,26,24,0.15)', fontWeight: 700 }} className="shrink-0">&#10007;</span>
                <span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)' }}>{item}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </FullBleedSection>

      {/* ═══ Block 9 — CTA with PullQuote ═══ */}
      <section className="px-6" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <PullQuote text="Intelligence you can afford. Results you can defend." />

          <ScrollReveal delay={0.2}>
            <div className="mt-4 text-center">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Start a free analysis &rarr; see the workflow in action</p>
              <MagneticButton
                onClick={() => onChipClick("Start a free analysis")}
                style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Start chatting &rarr;
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
