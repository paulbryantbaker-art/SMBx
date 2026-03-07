interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: YOUR REAL PROBLEM ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE INTELLIGENCE GAP</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-8" style={{ letterSpacing: '-0.04em' }}>
            You don&apos;t need more listings. You need better answers.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">You can find deals to look at. BizBuySell, DealStream, broker websites, your network. Listings aren&apos;t the problem.</p>
            <p className="m-0 text-[#1A1A18] font-bold">The problem is knowing which ones deserve your time.</p>
            <p className="m-0">Is the asking price justified by comparable transactions? Can you actually get SBA financing at that price and terms? What does the competitive landscape look like in that metro? Are the seller&apos;s margins realistic for this industry? What risks would surface in due diligence? And the biggest question: should you pursue this &mdash; or pass?</p>
            <p className="m-0">Experienced acquirers answer these in days with a team of analysts. Everyone else spends months guessing &mdash; or finds out the answers too late, after they&apos;ve invested time, money, and emotional energy into the wrong deal.</p>
            <p className="m-0 text-[#1A1A18] font-bold">Yulia answers all of them in a single conversation.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: SPEED TO CONVICTION ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PURSUE OR PASS</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              The most expensive mistake is 3 months on the wrong deal.
            </h2>
            <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mt-4 max-w-3xl md:mx-auto" style={{ lineHeight: 1.65 }}>
              Yulia gets you to a clear &ldquo;yes, pursue&rdquo; or &ldquo;no, pass&rdquo; faster than any process you&apos;ve used. Here&apos;s what she evaluates:
            </p>
          </div>

          {/* Mobile: stacked list */}
          <div className="md:hidden space-y-0">
            {[
              { icon: '\uD83D\uDCB0', title: 'FINANCIALS', body: 'Are the seller\u2019s numbers real? Yulia validates stated SDE/EBITDA against federal benchmarks for this industry in this geography. If the seller claims $600K SDE but Census data shows average receipts of $1.2M for businesses this size, the margins would need to be 50% \u2014 is that realistic? You\u2019ll know instantly.' },
              { icon: '\uD83C\uDFE6', title: 'FINANCING', body: 'Can this deal be financed? At what terms? Down payment, monthly payment, cash flow after debt service \u2014 all modeled against live SBA rates. Yulia tells you if it\u2019s bankable before you\u2019ve spent a dime.' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'MARKET', body: 'Is this a good market to buy into? Growing or shrinking? Fragmented or consolidated? How many competitors in this metro? What do BLS wage benchmarks say about labor costs? Is PE acquiring here \u2014 potential future exit, or sign you\u2019re buying at the top?' },
              { icon: '\u26A0\uFE0F', title: 'RISKS', body: 'What could kill this deal? Customer concentration above 20%. Owner who IS the business. Key person risk. Regulatory exposure. Declining revenue. Yulia flags them immediately \u2014 before the seller\u2019s broker does.' },
              { icon: '\u2705', title: 'VERDICT', body: 'Based on all of this \u2014 pursue or pass? A clear, data-backed recommendation. Not a hedge. Not a \u201Cit depends.\u201D A real answer with real reasoning you can evaluate.' },
            ].map((c, i) => (
              <div key={c.title} className={`py-5 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[20px]">{c.icon}</span>
                  <h3 className="text-[16px] font-bold text-[#1A1A18] m-0">{c.title}</h3>
                </div>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
          </div>

          {/* Desktop: card grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: '\uD83D\uDCB0', title: 'FINANCIALS', body: 'Are the seller\u2019s numbers real? Yulia validates stated SDE/EBITDA against federal benchmarks for this industry in this geography. If the margins don\u2019t match, you\u2019ll know instantly.' },
                { icon: '\uD83C\uDFE6', title: 'FINANCING', body: 'Can this deal be financed? Down payment, monthly payment, cash flow after debt service \u2014 all modeled against live SBA rates. Know if it\u2019s bankable before you\u2019ve spent a dime.' },
                { icon: '\uD83D\uDDFA\uFE0F', title: 'MARKET', body: 'Growing or shrinking? Fragmented or consolidated? How many competitors? BLS wage benchmarks? PE acquiring here? Full landscape analysis for your specific metro.' },
                { icon: '\u26A0\uFE0F', title: 'RISKS', body: 'Customer concentration. Owner dependency. Key person risk. Regulatory exposure. Declining revenue. Yulia flags deal-killers before the seller\u2019s broker does.' },
              ].map(c => (
                <div key={c.title} className="bg-[#F9FAFB] p-8 md:p-10" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <span className="text-[28px] block mb-3">{c.icon}</span>
                  <h3 className="text-[18px] font-extrabold mb-3">{c.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="bg-[#1A1A18] text-white p-8 md:p-10" style={{ borderRadius: '32px' }}>
                <span className="text-[28px] block mb-3">{'\u2705'}</span>
                <h3 className="text-[18px] font-extrabold mb-3">VERDICT</h3>
                <p className="text-[15px] font-medium text-[#9CA3AF] m-0" style={{ lineHeight: 1.6 }}>Based on all of this &mdash; pursue or pass? A clear, data-backed recommendation. Not a hedge. Not a &ldquo;it depends.&rdquo; A real answer with real reasoning you can evaluate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: YOUR FULL JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">FIRST QUESTION TO VALUE CREATION</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              We don&apos;t stop at close. Neither should you.
            </h2>
          </div>

          <div className="space-y-10 md:space-y-16">
            {[
              { phase: 'PHASE 1', title: 'Define your thesis', body: 'What industry? What geography? What deal size? What financial profile? Yulia helps you build a clear acquisition thesis and maps the market landscape so you evaluate every opportunity with full context.' },
              { phase: 'PHASE 2', title: 'Evaluate & build conviction', body: 'For every target: financial validation, SBA modeling, market analysis, risk assessment. Pursue or pass \u2014 with data, not gut feel. The 40-hour analysis? Done in minutes.' },
              { phase: 'PHASE 3', title: 'Negotiate & win', body: 'Your first offer. Seller financing leverage. Contingencies that protect you. Your walk-away number. Yulia provides real negotiation intelligence \u2014 not theory from a business school textbook. Tactics that work at the table.' },
              { phase: 'PHASE 4', title: 'Due diligence & close', body: 'The deal is under LOI. Bring everyone into the deal room: attorney, CPA, lender, advisor. Organized workspace. Version history. Manage the process without letting it derail the business you\u2019re about to own.' },
              { phase: 'PHASE 5', title: 'Post-acquisition value creation (180 days)', body: 'Day 1\u201330: Stabilize. Retain key employees. Preserve customer relationships. Don\u2019t change anything yet. Day 30\u201390: Optimize. Implement margin improvements identified in due diligence. Capture quick wins. Day 90\u2013180: Grow. Execute the thesis. Expand service lines. Enter new markets. Build the platform. A customized plan based on YOUR business, YOUR market, and YOUR thesis.' },
            ].map(item => (
              <div key={item.phase}>
                <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">{item.phase}</span>
                <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>{item.title}</h3>
                <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 4: NEGOTIATION INTELLIGENCE ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10" style={{ letterSpacing: '-0.04em' }}>
            Buy smart. Not just fast.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'THE FIRST OFFER', body: 'Your opening number sets everything. Yulia analyzes comps, the seller\u2019s likely alternatives, and your position strength to recommend an offer that\u2019s aggressive enough to leave room but serious enough to stay in the process.' },
              { title: 'SELLER FINANCING', body: 'A seller willing to finance part of the deal believes in the future cash flow. Yulia models seller note scenarios and shows you how to reduce cash at close while giving the seller confidence.' },
              { title: 'CONTINGENCIES', body: 'Financing. Due diligence. Key employee retention. Customer concentration thresholds. The contingencies that protect you without killing the deal.' },
              { title: 'YOUR WALK-AWAY NUMBER', body: 'Every deal has a price where it stops making sense. Yulia calculates yours based on financing terms, expected cash flow, and required return. When you know this number, you negotiate without emotion.' },
            ].map(f => (
              <div key={f.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                <h3 className="text-[18px] font-extrabold mb-3">{f.title}</h3>
                <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: EVERY TYPE OF BUYER ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10 md:text-center" style={{ letterSpacing: '-0.04em' }}>
            Whether it&apos;s your first deal or your fiftieth.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'FIRST-TIME SBA BUYER', body: 'Everything is new. Yulia walks you through every concept, every term, every step. From \u201Cwhat is SDE\u201D to \u201Csign here.\u201D No jargon. No assumptions. Your pace.' },
              { label: 'SEARCH FUND', body: 'Thesis to close in months. Screen, evaluate, model, bid, negotiate, close, create value. Pipeline velocity is everything. Yulia keeps it moving.' },
              { label: 'PE PLATFORM / BOLT-ON', body: 'Screen pipeline at deal-team speed. Model add-on economics against platform benchmarks. Focus expensive human hours on targets that clear the bar.' },
              { label: 'STRATEGIC ACQUIRER', body: 'Adjacent market? Competitor? Vertical integration? Yulia maps the opportunity, models the deal, and helps you structure for maximum strategic value.' },
            ].map(b => (
              <div key={b.label} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#D4714E] mb-2 block">{b.label}</span>
                <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{b.body}</p>
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
