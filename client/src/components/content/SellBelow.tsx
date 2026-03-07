interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: YOUR BIZESTIMATE ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            Your number. In 90 seconds. Free.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">Tell Yulia your industry, location, and revenue. She&apos;ll give you a valuation range built on live federal data &mdash; Census business counts, BLS wage benchmarks, SBA lending patterns, and real transaction multiples for your sector and geography.</p>
            <p className="m-0">Your Bizestimate updates every quarter. Share the link with your partner, your CPA, your spouse &mdash; anyone who needs to see the number.</p>
            <p className="m-0 text-[#1A1A18] font-bold">This isn&apos;t a lead magnet. It&apos;s real analysis you can use. And it&apos;s just the beginning.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: YOUR OPTIONS ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              &ldquo;Selling&rdquo; doesn&apos;t mean one thing.
            </h2>
          </div>

          {/* Mobile: stacked list */}
          <div className="md:hidden space-y-0">
            {[
              { title: 'SELL EVERYTHING', body: 'Full exit. Hand over the keys. Yulia handles valuation, CIM, buyer targeting, deal structure, negotiation, close.' },
              { title: 'BUY OUT A PARTNER', body: 'A number both sides trust. Financing that works. A buyout agreement that protects everyone.' },
              { title: 'RAISE CAPITAL', body: 'Grow without selling. Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor materials.' },
              { title: 'EMPLOYEE BUYOUT', body: 'ESOP or management buyout \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
              { title: 'PARTIAL SALE', body: 'Sell majority to PE. Bring on a strategic partner. Recapitalize to take chips off the table while keeping upside.' },
            ].map((c, i) => (
              <div key={c.title} className={`py-5 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <h3 className="text-[16px] font-bold text-[#1A1A18] m-0 mb-2">{c.title}</h3>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
          </div>

          {/* Desktop: card grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-6">
              {[
                { title: 'SELL EVERYTHING', body: 'Full exit. Hand over the keys. Yulia handles valuation, CIM, buyer targeting, deal structure, negotiation, close.' },
                { title: 'BUY OUT A PARTNER', body: 'A number both sides trust. Financing that works. A buyout agreement that protects everyone.' },
                { title: 'RAISE CAPITAL', body: 'Grow without selling. Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor materials.' },
              ].map(c => (
                <div key={c.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <h3 className="text-[16px] font-extrabold mb-3">{c.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              {[
                { title: 'EMPLOYEE BUYOUT', body: 'ESOP or management buyout \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
                { title: 'PARTIAL SALE', body: 'Sell majority to PE. Bring on a strategic partner. Recapitalize to take chips off the table while keeping upside.' },
              ].map(c => (
                <div key={c.title} className="bg-[#F9FAFB] p-8" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                  <h3 className="text-[16px] font-extrabold mb-3">{c.title}</h3>
                  <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] mt-8 md:text-center" style={{ lineHeight: 1.65 }}>
            Whatever your exit looks like, the process starts the same way: understanding exactly what you have and what it&apos;s worth.
          </p>
        </div>
      </section>

      {/* ═══ Section 3: THE JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              A premium exit is a process. Yulia manages it.
            </h2>
            <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mt-4 max-w-3xl md:mx-auto" style={{ lineHeight: 1.65 }}>
              Every month of preparation can move your sale price 5&ndash;15%. Here&apos;s how the journey works.
            </p>
          </div>

          <div className="space-y-10 md:space-y-16">
            {/* Phase 1 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 1 &mdash; UNDERSTAND (MONTH 1&ndash;2)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>See your business through a buyer&apos;s eyes.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0 mb-4" style={{ lineHeight: 1.65 }}>
                See your business through a buyer&apos;s eyes &mdash; before a buyer does. Yulia normalizes your financials, identifies add-backs, runs a preliminary valuation, benchmarks your margins, and flags the risks that would surface in due diligence.
              </p>
              <p className="text-[16px] md:text-[18px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.65 }}>
                You receive: Bizestimate + Value Readiness Report + Preliminary SDE/EBITDA &mdash; all free.
              </p>
            </div>

            {/* Phase 2 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 2 &mdash; OPTIMIZE (MONTH 3&ndash;12)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Make it worth more before you sell it.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0 mb-4" style={{ lineHeight: 1.65 }}>
                A $50K improvement in EBITDA at 5&times; adds $250,000 to your sale price. Yulia builds a prioritized plan:
              </p>
              <div className="space-y-2 ml-1">
                {[
                  'Revenue concentration above 20%? Diversify.',
                  'Business can\u2019t run without you? Build management depth.',
                  'Margins below industry median? She shows you where.',
                  'Books are messy? Clean up now, not during due diligence.',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="text-[#D4714E] font-bold shrink-0 mt-0.5">&bull;</span>
                    <span className="text-[15px] md:text-[16px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 3 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 3 &mdash; PREPARE (MONTH 6&ndash;18)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Package the deal.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                CIM. Financial exhibits. Teaser profile. Data room. Buyer targeting. Everything a qualified buyer needs &mdash; generated by Yulia from the intelligence she&apos;s already built.
              </p>
            </div>

            {/* Phase 4 */}
            <div>
              <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">PHASE 4 &mdash; NEGOTIATE &amp; CLOSE (MONTH 12&ndash;24)</span>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mt-2 mb-4" style={{ letterSpacing: '-0.02em' }}>Get the deal done.</h3>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0 mb-4" style={{ lineHeight: 1.65 }}>
                LOI evaluation. Deal structure modeling. Earnout analysis. Working capital adjustments. Real negotiation tactics &mdash; not theory.
              </p>
              <p className="text-[16px] md:text-[18px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
                Working with a broker? Yulia is their analytical backbone. Don&apos;t have one? She helps you decide if you need one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: THE $400,000 MOST OWNERS MISS ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            The money hiding in your tax returns.
          </h2>

          {/* Example callout card */}
          <div className="bg-[#F9FAFB] p-6 md:p-8 max-w-2xl" style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}>
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">EXAMPLE: A CLEANING COMPANY</span>
            <div className="mt-4 space-y-1.5 text-[14px] font-medium text-[#6E6A63]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>Reported SDE</span><span className="text-[#1A1A18] font-bold shrink-0 ml-4">$320,000</span></div>
            </div>
            <p className="text-[13px] font-bold text-[#6E6A63] mt-4 mb-2 m-0">After Yulia&apos;s analysis:</p>
            <div className="space-y-1.5 text-[14px] font-medium text-[#1A1A18]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>+ Personal vehicles</span><span className="text-[#D4714E] shrink-0 ml-4">$48,000</span></div>
              <div className="flex justify-between"><span>+ Family cell phones</span><span className="text-[#D4714E] shrink-0 ml-4">$18,000</span></div>
              <div className="flex justify-between"><span>+ One-time legal fee</span><span className="text-[#D4714E] shrink-0 ml-4">$12,000</span></div>
              <div className="flex justify-between"><span>+ Above-market rent to own LLC</span><span className="text-[#D4714E] shrink-0 ml-4">$31,000</span></div>
              <div className="flex justify-between"><span>+ Personal travel</span><span className="text-[#D4714E] shrink-0 ml-4">$15,000</span></div>
              <div className="border-t border-[#E5E5E5] mt-3 pt-3 flex justify-between font-bold">
                <span>Adjusted SDE</span><span className="text-[#1A1A18]">$444,000</span>
              </div>
            </div>
            <div className="mt-4 p-3" style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #22C55E', borderRadius: '0 10px 10px 0' }}>
              <p className="text-[14px] font-medium text-[#1A1A18] m-0">
                At 3.2&times;: $1.02M &rarr; $1.42M. $400,000 this owner almost left on the table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: NEGOTIATE LIKE A PRO ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-4" style={{ letterSpacing: '-0.04em' }}>
            You do this once. The buyer&apos;s attorney does it fifty times.
          </h2>
          <p className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] mb-8" style={{ lineHeight: 1.65 }}>
            Yulia levels the field:
          </p>
          <div className="space-y-2 ml-1">
            {[
              'Anchoring \u2014 how to frame your price so it sticks',
              'Concessions \u2014 trade what costs you least for what matters most to the buyer',
              'Competitive tension \u2014 create it, even with few buyers',
              'Earnout protection \u2014 flag terms designed to fail',
              'Structure as leverage \u2014 sometimes the structure IS the negotiation',
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5">
                <span className="text-[#D4714E] font-bold shrink-0 mt-0.5">&bull;</span>
                <span className="text-[16px] md:text-[18px] font-medium text-[#6E6A63]" style={{ lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: BROKER PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto bg-[#F9FAFB] p-8 md:p-12" style={{ borderRadius: '48px', border: '1px solid #F3F4F6' }}>
          <h3 className="text-[28px] md:text-[36px] font-extrabold mb-6" style={{ letterSpacing: '-0.03em' }}>
            Working with a broker? Even better.
          </h3>
          <div className="text-[18px] font-medium text-[#6E6A63] space-y-6" style={{ lineHeight: 1.6 }}>
            <p className="m-0">Bring your smbX.ai analysis to your first meeting. They get: normalized financials, defensible valuation, market intelligence, draft CIM &mdash; before the engagement letter.</p>
            <p className="m-0">Your broker focuses on relationships and negotiations. Yulia handles the data.</p>
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
