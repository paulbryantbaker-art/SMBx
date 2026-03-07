interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: BRING YOUR DEAL HERE ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">ANY DEAL. ANY SOURCE.</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-8" style={{ letterSpacing: '-0.04em' }}>
            Found a deal? Bring it. Yulia does the rest.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">Paste a BizBuySell listing. Describe something your broker sent you. Tell Yulia about a business you heard is for sale. She doesn&apos;t care where you found it.</p>
            <p className="m-0 text-[#1A1A18] font-bold">She cares whether it&apos;s worth your time.</p>
            <p className="m-0">Within minutes, Yulia validates the financials against federal benchmarks, models SBA financing at live rates, maps the competitive landscape in that metro, flags the risks &mdash; and gives you a clear answer: pursue or pass.</p>
            <p className="m-0">Every listing site in the world just became your top-of-funnel. smbX.ai is where you analyze them.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: PURSUE OR PASS ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              The most expensive mistake is 3 months on the wrong deal.
            </h2>
            <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mt-4 max-w-3xl md:mx-auto" style={{ lineHeight: 1.65 }}>
              Yulia gets you to a clear answer &mdash; fast:
            </p>
          </div>

          <div className="space-y-10 md:space-y-12">
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">FINANCIALS</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Seller claims $600K SDE. Census data says businesses this size in this industry average $1.2M in receipts. That implies 50% margins &mdash; realistic? Yulia checks.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">FINANCING</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                $1.8M asking, 10% down, live SBA rate: monthly P&amp;I is $14,200. DSCR is 1.87 &mdash; above the 1.25 threshold. Bankable. You know before you spend a dime.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">MARKET</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                847 competitors in the metro. PE firms rolling up the sector. BLS wages growing 4% annually. Good market to buy into &mdash; or buying at the top?
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">RISKS</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Customer concentration. Owner dependency. Key person. Declining revenue. Yulia flags them before the seller&apos;s broker does.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1A1A18] mb-2">VERDICT</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Pursue &mdash; with these conditions. Or pass &mdash; for these reasons. A real answer with real reasoning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: YOUR FREE STARTING POINT ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10" style={{ letterSpacing: '-0.04em' }}>
            Before you pay anything, you get this.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
              <h3 className="text-[18px] font-extrabold mb-3">INVESTMENT THESIS DOCUMENT</h3>
              <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>
                Your acquisition blueprint &mdash; criteria, target profile, capital stack template, SBA eligibility analysis, and a market landscape overview. This is what search funds and PE firms build in-house. You get it from a conversation.
              </p>
            </div>
            <div className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
              <h3 className="text-[18px] font-extrabold mb-3">CAPITAL STACK TEMPLATE</h3>
              <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>
                &ldquo;Here&apos;s how a $1.8M acquisition gets funded.&rdquo; SBA loan, equity contribution, seller note, monthly debt service. The math that tells you whether you can afford this.
              </p>
            </div>
          </div>
          <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] mt-6 md:text-center" style={{ lineHeight: 1.65 }}>
            Both free. Both generated from your first conversation.
          </p>
        </div>
      </section>

      {/* ═══ Section 4: YOUR FULL JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              We don&apos;t stop at close. Neither should your intelligence.
            </h2>
          </div>

          <div className="space-y-10 md:space-y-16">
            {[
              { phase: 'PHASE 1 \u2014 DEFINE YOUR THESIS', body: 'What industry? What geography? What deal size? Yulia helps you build a clear acquisition thesis and maps the market landscape.' },
              { phase: 'PHASE 2 \u2014 EVALUATE & BUILD CONVICTION', body: 'Every target: financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data.' },
              { phase: 'PHASE 3 \u2014 NEGOTIATE & WIN', body: 'First offer strategy. Seller financing leverage. Contingencies that protect you. Your walk-away number. Real tactics from real deal dynamics.' },
              { phase: 'PHASE 4 \u2014 DUE DILIGENCE & CLOSE', body: 'Organized deal room. Attorney, CPA, lender, advisor \u2014 everyone in one workspace. Nothing lost.' },
              { phase: 'PHASE 5 \u2014 POST-ACQUISITION (180 DAYS)', body: 'Day 1\u201330: Stabilize. Retain. Preserve. Day 30\u201390: Optimize. Capture quick wins. Day 90\u2013180: Grow. Execute the thesis. A customized value creation plan for YOUR business, YOUR market, YOUR thesis.' },
            ].map(item => (
              <div key={item.phase}>
                <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">{item.phase}</span>
                <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0 mt-3" style={{ lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: NEGOTIATION ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
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
                <span className="text-[#D4714E] font-bold shrink-0 mt-0.5">&bull;</span>
                <span className="text-[16px] md:text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: EVERY TYPE OF BUYER ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10 md:text-center" style={{ letterSpacing: '-0.04em' }}>
            First deal or fiftieth. Yulia adapts.
          </h2>
          <div className="space-y-0">
            {[
              { label: 'FIRST-TIME SBA BUYER', body: 'No jargon. No assumptions. Your pace.' },
              { label: 'SEARCH FUND', body: 'Thesis to close. Pipeline velocity.' },
              { label: 'PE PLATFORM', body: 'Screen at deal-team speed.' },
              { label: 'STRATEGIC', body: 'Synergies, structure, maximum value.' },
            ].map((b, i) => (
              <div key={b.label} className={`py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#D4714E] mb-1 block">{b.label}</span>
                <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-24 mt-32">
        <span className="text-[18px] font-extrabold">smb<span className="text-[#D4714E]">X</span>.ai</span>
        <p className="text-[12px] font-medium text-[#9CA3AF] mt-1 m-0" style={{ letterSpacing: '0.1em' }}>
          Deal Intelligence Infrastructure
        </p>
      </footer>
    </div>
  );
}
