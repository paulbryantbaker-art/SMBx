interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: YOUR OPTIONS ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">MORE WAYS THAN YOU THINK</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              &ldquo;Selling&rdquo; doesn&apos;t mean one thing.
            </h2>
            <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mt-4 max-w-3xl md:mx-auto" style={{ lineHeight: 1.65 }}>
              The right exit depends on your goals, your timeline, and your life after the deal. Yulia helps you understand every option &mdash; and build the plan for whichever one you choose.
            </p>
          </div>

          {/* Mobile: stacked list */}
          <div className="md:hidden space-y-0">
            {[
              { icon: '\uD83D\uDD11', title: 'SELL EVERYTHING', body: 'Full sale. Hand over the keys. Collect the proceeds. Move on. Yulia handles: valuation, CIM, buyer targeting, deal structure, negotiation strategy, due diligence, close.' },
              { icon: '\uD83E\uDD1D', title: 'BUY OUT A PARTNER', body: 'One of you wants out. You need a number both sides trust, a financing structure that works, and a buyout agreement that protects everyone. Yulia handles: fair market valuation, financing modeling, buyout structuring, transition planning.' },
              { icon: '\uD83D\uDCB0', title: 'RAISE CAPITAL', body: 'You don\u2019t want to sell. You want to grow. Debt, equity, SBA expansion, revenue-based financing \u2014 the right capital depends on how much you need and what you\u2019ll give up. Yulia handles: capitalization analysis, investor materials, SBA modeling, debt capacity analysis.' },
              { icon: '\uD83D\uDC65', title: 'EMPLOYEE BUYOUT', body: 'Your team built this with you. An ESOP or management buyout lets them own it \u2014 with tax advantages a traditional sale doesn\u2019t offer. Yulia handles: ESOP feasibility, valuation, financing structure, regulatory requirements.' },
              { icon: '\uD83D\uDCCA', title: 'PARTIAL SALE', body: 'Sell majority to PE. Bring on a strategic partner. Recapitalize to take chips off the table while keeping upside. Yulia handles: partial interest valuation, minority/majority analysis, earnout modeling, equity rollover structuring.' },
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
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: '\uD83D\uDD11', title: 'SELL EVERYTHING', body: 'Full sale. Hand over the keys. Collect the proceeds. Move on. Yulia handles: valuation, CIM, buyer targeting, deal structure, negotiation strategy, due diligence, close.' },
                { icon: '\uD83E\uDD1D', title: 'BUY OUT A PARTNER', body: 'One of you wants out. You need a number both sides trust, a financing structure that works, and a buyout agreement that protects everyone.' },
                { icon: '\uD83D\uDCB0', title: 'RAISE CAPITAL', body: 'You don\u2019t want to sell. You want to grow. Debt, equity, SBA expansion, revenue-based financing \u2014 the right capital depends on how much you need and what you\u2019ll give up.' },
              ].map(c => (
                <div key={c.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <span className="text-[28px] block mb-3">{c.icon}</span>
                  <h3 className="text-[16px] font-extrabold mb-3">{c.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              {[
                { icon: '\uD83D\uDC65', title: 'EMPLOYEE BUYOUT', body: 'Your team built this with you. An ESOP or management buyout lets them own it \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
                { icon: '\uD83D\uDCCA', title: 'PARTIAL SALE', body: 'Sell majority to PE. Bring on a strategic partner. Recapitalize to take chips off the table while keeping upside.' },
              ].map(c => (
                <div key={c.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <span className="text-[28px] block mb-3">{c.icon}</span>
                  <h3 className="text-[16px] font-extrabold mb-3">{c.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: YOUR JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">6&ndash;24 MONTHS TO A PREMIUM EXIT</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              Every month of preparation can move your price 5&ndash;15%.
            </h2>
            <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mt-4 max-w-3xl md:mx-auto" style={{ lineHeight: 1.65 }}>
              The difference between &ldquo;I sold my business&rdquo; and &ldquo;I got maximum value for my life&apos;s work&rdquo; is preparation. Yulia manages the entire journey.
            </p>
          </div>

          <div className="space-y-10 md:space-y-16">
            {/* Phase 1 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 1 &mdash; UNDERSTAND (MONTH 1&ndash;2)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Where do you actually stand?</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Before you can plan your exit, you need to see your business through a buyer&apos;s eyes. Most owners have never done this. Yulia normalizes your financials, identifies add-backs, runs a preliminary valuation, benchmarks your margins, and flags the risks a buyer&apos;s team would find. The point: find every weakness BEFORE a buyer does &mdash; so you can fix them on your terms, not theirs.
              </p>
            </div>

            {/* Phase 2 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 2 &mdash; OPTIMIZE (MONTH 3&ndash;12)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Make it worth more before you sell it.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0 mb-4" style={{ lineHeight: 1.65 }}>
                A $50K improvement in adjusted EBITDA at 5&times; adds $250,000 to your sale price. Yulia identifies the specific levers:
              </p>
              <div className="space-y-2 ml-1">
                {[
                  'Revenue concentration above 20%? Diversify before listing.',
                  'Business can\u2019t run without you? That\u2019s a risk premium buyers will deduct. Build management depth.',
                  'Margins below industry median? Yulia shows you exactly where you\u2019re overspending.',
                  'Books are messy? Clean documentation speeds up due diligence and prevents deal-killing surprises.',
                  'Project-based revenue? Shifting to recurring revenue can add 1\u20132\u00D7 to your multiple.',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="text-[#D4714E] font-bold shrink-0 mt-0.5">&bull;</span>
                    <span className="text-[15px] md:text-[16px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[16px] md:text-[18px] font-medium text-[#1A1A18] mt-4 m-0" style={{ lineHeight: 1.65 }}>
                Yulia builds a prioritized plan based on what moves YOUR valuation the most, in the time YOU have.
              </p>
            </div>

            {/* Phase 3 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 3 &mdash; PREPARE (MONTH 6&ndash;18)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Package the deal.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                CIM, financial exhibits, teaser profile, data room &mdash; everything a qualified buyer needs to evaluate your business, generated by Yulia from the intelligence she&apos;s already built. Plus: buyer targeting. Who are the right buyers for YOUR specific business? SBA individuals? PE platforms? Strategic acquirers? Yulia maps the universe so you&apos;re not just listed &mdash; you&apos;re positioned.
              </p>
            </div>

            {/* Phase 4 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 4 &mdash; EXECUTE (MONTH 12&ndash;24)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Negotiate and close.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                LOI evaluation: what does each offer actually mean beyond the headline number? Terms, earnouts, non-competes, working capital adjustments &mdash; Yulia models every scenario. Negotiation intelligence: what&apos;s your leverage? What concessions cost you the least? How do you create competitive tension? Due diligence management: hundreds of document requests without letting the process derail your business. Working with a broker? Yulia is their analytical backbone. They focus on relationships and negotiations. She handles the data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: THE ADD-BACK STORY ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            The $400,000 most owners don&apos;t know they have.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6 mb-10" style={{ lineHeight: 1.65 }}>
            <p className="m-0">Tax returns minimize taxes. That&apos;s the point. But every personal expense on your P&amp;L reduces your stated earnings &mdash; and your sale price.</p>
          </div>

          {/* Example callout card */}
          <div className="bg-[#F9FAFB] p-6 md:p-8 max-w-2xl" style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}>
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">EXAMPLE: A CLEANING COMPANY OWNER</span>
            <div className="mt-4 space-y-1.5 text-[14px] font-medium text-[#6E6A63]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>Reported SDE</span><span className="text-[#1A1A18] font-bold shrink-0 ml-4">$320,000</span></div>
            </div>
            <p className="text-[13px] font-bold text-[#6E6A63] mt-4 mb-2 m-0">Yulia found:</p>
            <div className="space-y-1.5 text-[14px] font-medium text-[#1A1A18]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>+ Personal vehicles (2)</span><span className="text-[#D4714E] shrink-0 ml-4">$48,000</span></div>
              <div className="flex justify-between"><span>+ Family cell phones (5 lines)</span><span className="text-[#D4714E] shrink-0 ml-4">$18,000</span></div>
              <div className="flex justify-between"><span>+ One-time legal settlement</span><span className="text-[#D4714E] shrink-0 ml-4">$12,000</span></div>
              <div className="flex justify-between"><span>+ Above-market rent to own LLC</span><span className="text-[#D4714E] shrink-0 ml-4">$31,000</span></div>
              <div className="flex justify-between"><span>+ Personal travel</span><span className="text-[#D4714E] shrink-0 ml-4">$15,000</span></div>
              <div className="border-t border-[#E5E5E5] mt-3 pt-3 flex justify-between font-bold">
                <span>Adjusted SDE</span><span className="text-[#1A1A18]">$444,000</span>
              </div>
            </div>
            <div className="mt-4 p-3" style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #22C55E', borderRadius: '0 10px 10px 0' }}>
              <p className="text-[14px] font-medium text-[#1A1A18] m-0">
                At 3.2&times;: $1.02M &rarr; $1.42M. That&apos;s $400K this owner almost walked away from.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: NEGOTIATION INTELLIGENCE ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-4" style={{ letterSpacing: '-0.04em' }}>
            You&apos;ll negotiate this once. The buyer&apos;s attorney has done it fifty times.
          </h2>
          <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mb-10" style={{ lineHeight: 1.65 }}>
            That asymmetry costs sellers real money. Yulia levels it:
          </p>
          <div className="space-y-8">
            {[
              { title: 'ANCHORING', body: 'How to present your price so it frames the negotiation in your favor. What comps support your number. How to position add-backs as value, not risk.' },
              { title: 'CONCESSION STRATEGY', body: 'Not all concessions cost the same. Yulia identifies what costs you the least but matters most to the buyer. Trade strategically, not emotionally.' },
              { title: 'COMPETITIVE TENSION', body: 'How to create it even with a small buyer pool. Timing, disclosure, scarcity psychology. A buyer who thinks they\u2019re the only offer negotiates very differently.' },
              { title: 'EARNOUT PROTECTION', body: 'Earnouts sound fair until they\u2019re structured so you can\u2019t hit the targets. Yulia models every scenario and flags terms that give the buyer too much control.' },
              { title: 'STRUCTURE AS LEVERAGE', body: 'Higher price with seller note vs. lower price all-cash? Equity rollover for upside? The structure can change your net proceeds by 10\u201330%.' },
            ].map(item => (
              <div key={item.title}>
                <h3 className="text-[16px] font-bold text-[#1A1A18] mb-1">{item.title}</h3>
                <p className="text-[15px] md:text-[16px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 5: BROKER PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-6" style={{ letterSpacing: '-0.03em' }}>
            Working with a broker? Even better.
          </h3>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-6" style={{ lineHeight: 1.6 }}>
            <p className="m-0">Bring your smbX.ai analysis to your first meeting. They get: normalized financials, defensible valuation, market intel, draft CIM, buyer targeting. Before the engagement letter is signed.</p>
            <p className="m-0">Don&apos;t have one yet? Yulia helps you decide if you need one, what type, and what questions to ask. Not every deal needs a broker. The ones that do deserve a great one.</p>
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
