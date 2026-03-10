interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — Memo: Any deal, any source [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
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
      </section>

      {/* ═══ Block 2 — Canvas: Five dimensions ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>DEAL EVALUATION &middot; FIVE DIMENSIONS</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-4">
            Five dimensions. One answer.
          </h2>
          <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.65 }}>Yulia gets you to conviction &mdash; fast.</p>

          <div className="space-y-4">
            {[
              { icon: '\uD83D\uDCB0', title: 'Financials', body: 'Seller claims $600K SDE. Census data says that implies 50% margins \u2014 realistic? Yulia checks against federal benchmarks, not guesswork.' },
              { icon: '\uD83C\uDFE6', title: 'Financing', body: '$1.8M asking, 10% down, live SBA rate: monthly P&I is $14,200. DSCR is 1.87 \u2014 above the 1.25 threshold. Bankable.' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'Market', body: '847 competitors in the metro. PE firms rolling up the sector. BLS wages growing 4%. Good market \u2014 or buying at the top?' },
              { icon: '\u26A0\uFE0F', title: 'Risks', body: 'Customer concentration. Owner dependency. Declining revenue. Yulia flags them before the seller\u2019s broker does.' },
              { icon: '\u2705', title: 'Verdict', body: 'Pursue \u2014 with these conditions. Or pass \u2014 for these reasons. A real answer with real reasoning.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#F7F6F4', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>
                  <span style={{ marginRight: 8 }}>{c.icon}</span>{c.title}
                </h3>
                <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 3 — Canvas: Free starting point [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>FREE STARTING POINT</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
            Before you pay anything, you get this.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>{'\uD83D\uDCCB'} Investment Thesis Document</h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>
                Your acquisition blueprint &mdash; criteria, capital stack template, SBA eligibility, market landscape. What search funds build in-house with full-time analysts.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>{'\uD83D\uDCCA'} Capital Stack Template</h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>
                &ldquo;Here&apos;s how a $1.8M acquisition gets funded.&rdquo; SBA loan, equity, seller note, monthly debt service.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#D4714E', marginTop: 24, lineHeight: 1.65 }} className="md:text-center">
            Both free. Both generated from your first conversation.
          </p>
        </div>
      </section>

      {/* ═══ Block 4 — Canvas: Buyer tax benefits ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>TAX STRUCTURE &middot; BUYER PERSPECTIVE</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            The deal structure determines your true cost of ownership.
          </h2>
          <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            Asset sales and stock sales aren&apos;t just different for the seller. The structure directly affects your tax deductions &mdash; and your real return on investment.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <div style={{ background: '#D4714E', borderRadius: 24, padding: '32px', color: '#fff' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 16 }}>ASSET SALE (BUYER-FAVORABLE)</span>
              <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Basis step-up</span><span style={{ color: '#fff', fontWeight: 600 }}>Yes</span></div>
                <div className="flex justify-between"><span>Goodwill amortization</span><span style={{ color: '#fff', fontWeight: 600 }}>~$97K/yr</span></div>
                <div className="flex justify-between"><span>Equipment depreciation</span><span style={{ color: '#fff', fontWeight: 600 }}>Fresh</span></div>
                <div className="flex justify-between"><span>NPV of tax shields</span><span style={{ color: '#fff', fontWeight: 600 }}>~$304,000</span></div>
                <div className="flex justify-between"><span>Inherited liabilities</span><span style={{ color: '#fff', fontWeight: 600 }}>Only agreed</span></div>
              </div>
            </div>

            <div style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.45)', display: 'block', marginBottom: 16 }}>STOCK SALE</span>
              <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Basis step-up</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>No</span></div>
                <div className="flex justify-between"><span>Goodwill amortization</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>None</span></div>
                <div className="flex justify-between"><span>Equipment depreciation</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>Seller&apos;s schedule</span></div>
                <div className="flex justify-between"><span>NPV of tax shields</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~$0</span></div>
                <div className="flex justify-between"><span>Inherited liabilities</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>ALL</span></div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginTop: 24, lineHeight: 1.65 }}>
            On a $2M deal, the asset sale tax shield is worth ~$304K to the buyer in present value. That&apos;s why buyers push for asset sales &mdash; and why sellers resist (they pay more tax). Yulia models both sides so you negotiate from the real numbers.
          </p>
          <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 8, fontStyle: 'italic' }}>
            Your CPA should confirm the deduction schedule for your specific situation.
          </p>
        </div>
      </section>

      {/* ═══ Block 5 — Canvas: Legal due diligence [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>LEGAL DUE DILIGENCE</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            What to verify before you sign.
          </h2>
          <p className="max-w-3xl mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            The APA protects you only if the reps and warranties are right. Yulia builds a due diligence checklist calibrated to the deal&apos;s industry, size, and structure.
          </p>

          <div className="space-y-4">
            {[
              { icon: '\uD83D\uDCC4', title: 'Reps & warranty review', body: 'The seller\u2019s factual statements about the business. Yulia identifies which reps are standard, which are missing, and which need broader language. Key focus: financial accuracy, no undisclosed liabilities, tax compliance, IP ownership, and material contracts.' },
              { icon: '\u26A0\uFE0F', title: 'Red flag scoring', body: 'Every DD finding gets scored: minor (proceed), major (negotiate price adjustment), or deal-breaker (walk away). Yulia calculates the dollar impact of each issue and recommends price adjustments.' },
              { icon: '\uD83C\uDFE2', title: 'Lease and location', body: 'Is the lease assignable? How much term remains? What will the landlord demand? If the business depends on the location, this is a potential deal-killer \u2014 Yulia flags it early.' },
              { icon: '\uD83C\uDFE5', title: 'Licenses and permits', body: 'Healthcare, childcare, construction, food service, pest control \u2014 many require new applications from you. Some take 3\u20136 months. Yulia checks the industry and builds the regulatory transfer timeline.' },
              { icon: '\uD83D\uDC65', title: 'Employee transition', body: 'In an asset sale, employees are terminated by the seller and rehired by you. You choose who to hire. But prior liabilities (WARN Act, benefits, PTO) need to be clearly allocated. In a stock sale, all employees \u2014 and all their baggage \u2014 come with the entity.' },
              { icon: '\uD83D\uDCCB', title: 'Working capital mechanism', body: 'Fixed price? Peg with true-up? Locked box? The working capital adjustment is where deals get renegotiated after the LOI. Yulia calculates the trailing 12-month average, flags seasonal patterns, and models the range of true-up outcomes.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>
                  <span style={{ marginRight: 8 }}>{c.icon}</span>{c.title}
                </h3>
                <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.4)', marginTop: 16, fontStyle: 'italic' }}>
            Your M&amp;A attorney drafts the actual APA. Yulia ensures you know what to expect, what to negotiate, and what to walk away from.
          </p>
        </div>
      </section>

      {/* ═══ Block 6 — Canvas: Buyer journey timeline ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>BUYER JOURNEY &middot; GUIDED PROCESS</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
            From thesis to close &mdash; and 180 days beyond.
          </h2>

          <div className="space-y-10">
            {[
              { phase: 'Phase 1 \u2014 Define Your Thesis', body: 'What industry? Geography? Deal size? Yulia maps the market landscape.' },
              { phase: 'Phase 2 \u2014 Evaluate & Build Conviction', body: 'Financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data.' },
              { phase: 'Phase 3 \u2014 Negotiate & Win', body: 'First offer strategy. Seller financing leverage. Purchase price allocation negotiation. Your walk-away number. Real tactics.' },
              { phase: 'Phase 4 \u2014 Due Diligence & Close', body: 'Organized deal room. DD checklist by industry. Red flag scoring. Price adjustment calculations. Working capital true-up modeling. Everyone in one workspace.' },
              { phase: 'Phase 5 \u2014 Post-Acquisition \u00B7 180 Days', body: 'Day 1\u201330: Stabilize. Retain. Preserve. Day 30\u201390: Optimize. Quick wins. Day 90\u2013180: Grow. Execute the thesis. A customized plan for YOUR business.' },
            ].map((p, i) => (
              <div key={p.phase} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4714E', marginTop: 6 }} />
                  {i < 4 && <div style={{ width: 2, background: 'rgba(212,113,78,0.2)', flex: 1, marginTop: 4 }} />}
                </div>
                <div className="pb-2">
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>{p.phase}</span>
                  <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '10px 0 0', lineHeight: 1.65 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 7 — Canvas: Buyer types ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>BUYER TYPES</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
            First deal or fiftieth. Yulia adapts.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'First-Time SBA Buyer', body: 'No jargon. Your pace. Tax and legal explained in plain English.' },
              { title: 'Search Fund', body: 'Thesis to close. Pipeline velocity. LOI-to-APA coaching.' },
              { title: 'PE Platform', body: 'Screen at deal-team speed. Arbitrage modeling. Covenant analysis.' },
              { title: 'Strategic', body: 'Synergies, structure, max value. Integration planning from Day 1.' },
            ].map(b => (
              <div key={b.title} style={{ background: '#F7F6F4', borderRadius: 20, border: '1px solid rgba(26,26,24,0.05)', padding: '24px 28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{b.title}</h3>
                <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Block 8 — Memo: The payoff ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            You own a business. And you know exactly what to do with it.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Not &ldquo;I hope this works out.&rdquo; Not &ldquo;I think I paid the right price.&rdquo; Not &ldquo;Now what?&rdquo;</p>
            <p className="m-0">You have a plan. Specific to this business, this market, this thesis. Built from months of intelligence that Yulia gathered during the acquisition &mdash; carried forward into ownership.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s the difference between buying a business and building wealth.</p>
          </div>

          {/* Block 9 — Next Step */}
          <div className="mt-10">
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia what you&apos;re looking for &rarr; free acquisition thesis</p>
            <button
              onClick={() => onChipClick("I'm looking to buy a business")}
              style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              type="button"
            >
              Message Yulia &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
