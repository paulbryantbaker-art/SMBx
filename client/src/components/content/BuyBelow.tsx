interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: BRING YOUR DEAL HERE ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>ANY DEAL. ANY SOURCE.</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            Found a deal? Bring it. Yulia does the rest.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Paste a BizBuySell listing. Describe something your broker sent you. Tell Yulia about a business you heard is for sale. She doesn&apos;t care where you found it.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>She cares whether it&apos;s worth your time.</p>
            <p className="m-0">Within minutes, Yulia validates the financials against federal benchmarks, models SBA financing at live rates, maps the competitive landscape in that metro, flags the risks &mdash; and gives you a clear answer: pursue or pass.</p>
            <p className="m-0">Every listing site in the world just became your top-of-funnel. smbX.ai is where you analyze them.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: PURSUE OR PASS ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
              The most expensive mistake is 3 months on the wrong deal.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 16, lineHeight: 1.65 }} className="max-w-3xl md:mx-auto">
              Yulia gets you to a clear answer &mdash; fast:
            </p>
          </div>

          <div className="space-y-10 md:space-y-12">
            {[
              { label: 'FINANCIALS', body: 'Seller claims $600K SDE. Census data says businesses this size in this industry average $1.2M in receipts. That implies 50% margins \u2014 realistic? Yulia checks.' },
              { label: 'FINANCING', body: '$1.8M asking, 10% down, live SBA rate: monthly P&I is $14,200. DSCR is 1.87 \u2014 above the 1.25 threshold. Bankable. You know before you spend a dime.' },
              { label: 'MARKET', body: '847 competitors in the metro. PE firms rolling up the sector. BLS wages growing 4% annually. Good market to buy into \u2014 or buying at the top?' },
              { label: 'RISKS', body: 'Customer concentration. Owner dependency. Key person. Declining revenue. Yulia flags them before the seller\u2019s broker does.' },
              { label: 'VERDICT', body: 'Pursue \u2014 with these conditions. Or pass \u2014 for these reasons. A real answer with real reasoning.' },
            ].map(item => (
              <div key={item.label}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginBottom: 8 }}>{item.label}</h3>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: YOUR FREE STARTING POINT ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-10">
            Before you pay anything, you get this.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>INVESTMENT THESIS DOCUMENT</h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>
                Your acquisition blueprint &mdash; criteria, target profile, capital stack template, SBA eligibility analysis, and a market landscape overview. This is what search funds and PE firms build in-house. You get it from a conversation.
              </p>
            </div>
            <div style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>CAPITAL STACK TEMPLATE</h3>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>
                &ldquo;Here&apos;s how a $1.8M acquisition gets funded.&rdquo; SBA loan, equity contribution, seller note, monthly debt service. The math that tells you whether you can afford this.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 24, lineHeight: 1.65 }} className="md:text-center">
            Both free. Both generated from your first conversation.
          </p>
        </div>
      </section>

      {/* ═══ Section 4: YOUR FULL JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
              We don&apos;t stop at close. Neither should your intelligence.
            </h2>
          </div>

          <div className="space-y-10 md:space-y-14">
            {[
              { phase: 'PHASE 1 \u2014 DEFINE YOUR THESIS', body: 'What industry? What geography? What deal size? Yulia helps you build a clear acquisition thesis and maps the market landscape.' },
              { phase: 'PHASE 2 \u2014 EVALUATE & BUILD CONVICTION', body: 'Every target: financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data.' },
              { phase: 'PHASE 3 \u2014 NEGOTIATE & WIN', body: 'First offer strategy. Seller financing leverage. Contingencies that protect you. Your walk-away number. Real tactics from real deal dynamics.' },
              { phase: 'PHASE 4 \u2014 DUE DILIGENCE & CLOSE', body: 'Organized deal room. Attorney, CPA, lender, advisor \u2014 everyone in one workspace. Nothing lost.' },
              { phase: 'PHASE 5 \u2014 POST-ACQUISITION (180 DAYS)', body: 'Day 1\u201330: Stabilize. Retain. Preserve. Day 30\u201390: Optimize. Capture quick wins. Day 90\u2013180: Grow. Execute the thesis. A customized value creation plan for YOUR business, YOUR market, YOUR thesis.' },
            ].map(item => (
              <div key={item.phase}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>{item.phase}</span>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '12px 0 0', lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: NEGOTIATION ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            Buy smart. Not just fast.
          </h2>
          <div className="space-y-2 ml-1">
            {[
              'First offer \u2014 set the negotiation in your favor',
              'Seller financing \u2014 reduce cash at close, build seller confidence',
              'Contingencies \u2014 protect yourself without killing the deal',
              'Walk-away number \u2014 know yours, negotiate without emotion',
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5">
                <span style={{ color: '#D4714E', fontWeight: 600 }} className="shrink-0 mt-0.5">&bull;</span>
                <span style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }} className="md:text-[17px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: EVERY TYPE OF BUYER ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-10 md:text-center">
            First deal or fiftieth. Yulia adapts.
          </h2>
          <div className="space-y-0">
            {[
              { label: 'FIRST-TIME SBA BUYER', body: 'No jargon. No assumptions. Your pace.' },
              { label: 'SEARCH FUND', body: 'Thesis to close. Pipeline velocity.' },
              { label: 'PE PLATFORM', body: 'Screen at deal-team speed.' },
              { label: 'STRATEGIC', body: 'Synergies, structure, maximum value.' },
            ].map((b, i) => (
              <div key={b.label} style={{ padding: '16px 0', borderTop: i > 0 ? '1px solid rgba(26,26,24,0.06)' : undefined }}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E', display: 'block', marginBottom: 4 }}>{b.label}</span>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
