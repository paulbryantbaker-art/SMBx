interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: THE BUYER'S PROBLEM [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>ANY DEAL. ANY SOURCE.</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            The most expensive mistake is three months on the wrong deal.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Every day spent evaluating the wrong deal is a day you&apos;re not closing the right one. And in a market where good businesses sell in weeks, speed to conviction is everything.</p>
            <p className="m-0">But right now, there&apos;s no fast way to know if a deal is real. You find a listing. The numbers look interesting. You spend weeks &mdash; emailing the broker, requesting financials, talking to your lender, building a model &mdash; only to discover the SDE is inflated, the DSCR doesn&apos;t work, or the market is saturated.</p>
            <p className="m-0">Bring it to Yulia instead. Paste a BizBuySell listing. Describe something your broker sent you. Tell her about a business you heard is for sale. She doesn&apos;t care where you found it.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>She cares whether it&apos;s worth your time.</p>
            <p className="m-0">Within minutes: financial validation against federal benchmarks, SBA financing modeled at live rates, competitive landscape mapped for that metro, risks flagged &mdash; and a clear answer. Pursue or pass.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Every listing site in the world just became your top-of-funnel. smbX.ai is where you analyze them.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: PURSUE OR PASS ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
              Five dimensions. One answer.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 16, lineHeight: 1.65 }} className="max-w-3xl md:mx-auto">
              Yulia gets you to conviction &mdash; fast.
            </p>
          </div>

          <div className="space-y-10 md:space-y-12">
            {[
              { label: 'FINANCIALS', body: 'Seller claims $600K SDE. Census data says businesses this size in this industry average $1.2M in receipts. That implies 50% margins \u2014 realistic? Yulia checks against federal benchmarks, not guesswork.' },
              { label: 'FINANCING', body: '$1.8M asking, 10% down, live SBA rate: monthly P&I is $14,200. DSCR is 1.87 \u2014 above the 1.25 threshold. Bankable. You know before you spend a dime on attorneys or accountants.' },
              { label: 'MARKET', body: '847 competitors in the metro. PE firms actively rolling up the sector. BLS wages growing 4% annually in this MSA. Good market to buy into \u2014 or are you buying at the top?' },
              { label: 'RISKS', body: 'Customer concentration. Owner dependency. Key person. Declining revenue trend. Yulia flags them before the seller\u2019s broker does \u2014 because she has no incentive to hide them.' },
              { label: 'VERDICT', body: 'Pursue \u2014 with these specific conditions. Or pass \u2014 for these specific reasons. A real answer with real reasoning you can show your partners, your lender, your attorney.' },
            ].map(item => (
              <div key={item.label}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginBottom: 8 }}>{item.label}</h3>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: FREE STARTING POINT [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-10">
            Before you pay anything, you get this.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>INVESTMENT THESIS DOCUMENT</h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>
                Your acquisition blueprint &mdash; criteria, target profile, capital stack template, SBA eligibility analysis, and a market landscape overview. This is what search funds and PE firms build in-house with full-time analysts. You get it from a conversation.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>CAPITAL STACK TEMPLATE</h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>
                &ldquo;Here&apos;s how a $1.8M acquisition gets funded.&rdquo; SBA loan, equity contribution, seller note, monthly debt service. The math that tells you whether you can afford this &mdash; before you fall in love with the business.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A18', marginTop: 24, lineHeight: 1.65 }} className="md:text-center">
            Both free. Both generated from your first conversation.
          </p>
        </div>
      </section>

      {/* ═══ Section 4: THE FULL JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
              From thesis to close &mdash; and 180 days beyond.
            </h2>
          </div>

          <div className="space-y-10 md:space-y-14">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 1 &mdash; DEFINE YOUR THESIS</span>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '12px 0 0', lineHeight: 1.65 }}>What industry? What geography? What deal size? SBA or conventional? Operating or passive? Yulia helps you build a clear acquisition thesis and maps the market landscape so you know what&apos;s out there before you start looking.</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 2 &mdash; EVALUATE &amp; BUILD CONVICTION</span>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '12px 0 0', lineHeight: 1.65 }}>Every target gets the full treatment: financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass &mdash; with data, not gut feeling. When you find the right deal, you&apos;ll know it. And you&apos;ll have the analysis to prove it to your lender.</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 3 &mdash; NEGOTIATE &amp; WIN</span>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '12px 0 0', lineHeight: 1.65 }}>First offer strategy. Seller financing leverage. Contingencies that protect you without killing the deal. Your walk-away number &mdash; calculated, not emotional. Real tactics from real deal dynamics.</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 4 &mdash; DUE DILIGENCE &amp; CLOSE</span>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '12px 0 0', lineHeight: 1.65 }}>Organized deal room. Comprehensive DD checklist scaled to deal complexity. Red flag scoring: minor, major, or deal-breaker. Price adjustment calculations for every issue found. Attorney, CPA, lender, advisor &mdash; everyone in one workspace. Nothing lost in email threads.</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 5 &mdash; POST-ACQUISITION (180 DAYS)</span>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A18', margin: '12px 0 8px', lineHeight: 1.65 }}>The deal doesn&apos;t end at close. It starts.</p>
              <div className="space-y-4" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1A1A18' }}>Day 1&ndash;30: STABILIZE.</span> Don&apos;t change anything. Learn the business from the inside. Retain key employees. Reach out personally to the top 20 customers. Secure every vendor relationship.
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#1A1A18' }}>Day 30&ndash;90: OPTIMIZE.</span> Capture the quick wins identified during due diligence. Fix the operational gaps. Implement financial controls. Start measuring what matters.
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: '#1A1A18' }}>Day 90&ndash;180: GROW.</span> Execute the thesis. The specific growth plan &mdash; built from the intelligence Yulia gathered during your acquisition &mdash; for YOUR business, YOUR market, YOUR goals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: EVERY TYPE OF BUYER ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-10 md:text-center">
            First deal or fiftieth. Yulia adapts.
          </h2>
          <div className="space-y-0">
            {[
              { label: 'FIRST-TIME SBA BUYER', body: 'No jargon. No assumptions. Everything explained. Your pace. The hand-holding you need without the fees you can\u2019t afford yet.' },
              { label: 'SEARCH FUND', body: 'Thesis to close. Pipeline velocity. Every target scored against your mandate. The analytical backbone your investment committee needs.' },
              { label: 'PE PLATFORM', body: 'Screen at deal-team speed. EBITDA normalization, arbitrage modeling, platform synergy analysis. The intelligence layer your associates wish they had.' },
              { label: 'STRATEGIC ACQUIRER', body: 'Synergies, structure, maximum value. Integration planning that starts before the ink is dry.' },
            ].map((b, i) => (
              <div key={b.label} style={{ padding: '16px 0', borderTop: i > 0 ? '1px solid rgba(26,26,24,0.06)' : undefined }}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E', display: 'block', marginBottom: 4 }}>{b.label}</span>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: THE PAYOFF ═══ */}
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
          <div className="mt-10">
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Open the conversation and let Yulia guide the next step.</p>
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
