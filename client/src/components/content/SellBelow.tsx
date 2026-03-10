interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: YOUR BIZESTIMATE ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            Your number. In 90 seconds. Free.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Tell Yulia your industry, location, and revenue. She&apos;ll give you a valuation range built on live federal data &mdash; Census business counts, BLS wage benchmarks, SBA lending patterns, and real transaction multiples for your sector and geography.</p>
            <p className="m-0">Your Bizestimate updates every quarter. Share the link with your partner, your CPA, your spouse &mdash; anyone who needs to see the number.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>This isn&apos;t a lead magnet. It&apos;s real analysis you can use. And it&apos;s just the beginning.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: YOUR OPTIONS ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
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
              <div key={c.title} style={{ padding: '20px 0', borderTop: i > 0 ? '1px solid rgba(26,26,24,0.06)' : undefined }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A18', margin: '0 0 8px' }}>{c.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
          </div>

          {/* Desktop: card grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-5">
              {[
                { title: 'SELL EVERYTHING', body: 'Full exit. Hand over the keys. Yulia handles valuation, CIM, buyer targeting, deal structure, negotiation, close.' },
                { title: 'BUY OUT A PARTNER', body: 'A number both sides trust. Financing that works. A buyout agreement that protects everyone.' },
                { title: 'RAISE CAPITAL', body: 'Grow without selling. Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor materials.' },
              ].map(c => (
                <div key={c.title} style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 12 }}>{c.title}</h3>
                  <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5 mt-5">
              {[
                { title: 'EMPLOYEE BUYOUT', body: 'ESOP or management buyout \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
                { title: 'PARTIAL SALE', body: 'Sell majority to PE. Bring on a strategic partner. Recapitalize to take chips off the table while keeping upside.' },
              ].map(c => (
                <div key={c.title} style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 12 }}>{c.title}</h3>
                  <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 32, lineHeight: 1.65 }} className="md:text-center">
            Whatever your exit looks like, the process starts the same way: understanding exactly what you have and what it&apos;s worth.
          </p>
        </div>
      </section>

      {/* ═══ Section 3: THE JOURNEY ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px]">
              A premium exit is a process. Yulia manages it.
            </h2>
            <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginTop: 16, lineHeight: 1.65 }} className="max-w-3xl md:mx-auto">
              Every month of preparation can move your sale price 5&ndash;15%. Here&apos;s how the journey works.
            </p>
          </div>

          <div className="space-y-10 md:space-y-14">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 1 &mdash; UNDERSTAND (MONTH 1&ndash;2)</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">See your business through a buyer&apos;s eyes.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '0 0 16px', lineHeight: 1.65 }}>
                See your business through a buyer&apos;s eyes &mdash; before a buyer does. Yulia normalizes your financials, identifies add-backs, runs a preliminary valuation, benchmarks your margins, and flags the risks that would surface in due diligence.
              </p>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A18', margin: 0, lineHeight: 1.65 }}>
                You receive: Bizestimate + Value Readiness Report + Preliminary SDE/EBITDA &mdash; all free.
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 2 &mdash; OPTIMIZE (MONTH 3&ndash;12)</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">Make it worth more before you sell it.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '0 0 16px', lineHeight: 1.65 }}>
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
                    <span style={{ color: '#D4714E', fontWeight: 600 }} className="shrink-0 mt-0.5">&bull;</span>
                    <span style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 3 &mdash; PREPARE (MONTH 6&ndash;18)</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">Package the deal.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>
                CIM. Financial exhibits. Teaser profile. Data room. Buyer targeting. Everything a qualified buyer needs &mdash; generated by Yulia from the intelligence she&apos;s already built.
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 4 &mdash; NEGOTIATE &amp; CLOSE (MONTH 12&ndash;24)</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">Get the deal done.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '0 0 16px', lineHeight: 1.65 }}>
                LOI evaluation. Deal structure modeling. Earnout analysis. Working capital adjustments. Real negotiation tactics &mdash; not theory.
              </p>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>
                Working with a broker? Yulia is their analytical backbone. Don&apos;t have one? She helps you decide if you need one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: THE $400,000 MOST OWNERS MISS ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            The money hiding in your tax returns.
          </h2>

          <div className="max-w-2xl" style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '28px 32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>EXAMPLE: A CLEANING COMPANY</span>
            <div className="mt-4 space-y-1.5" style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>Reported SDE</span><span style={{ color: '#1A1A18', fontWeight: 600 }} className="shrink-0 ml-4">$320,000</span></div>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(26,26,24,0.5)', margin: '16px 0 8px' }}>After Yulia&apos;s analysis:</p>
            <div className="space-y-1.5" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A18', fontVariantNumeric: 'tabular-nums' }}>
              <div className="flex justify-between"><span>+ Personal vehicles</span><span style={{ color: '#D4714E' }} className="shrink-0 ml-4">$48,000</span></div>
              <div className="flex justify-between"><span>+ Family cell phones</span><span style={{ color: '#D4714E' }} className="shrink-0 ml-4">$18,000</span></div>
              <div className="flex justify-between"><span>+ One-time legal fee</span><span style={{ color: '#D4714E' }} className="shrink-0 ml-4">$12,000</span></div>
              <div className="flex justify-between"><span>+ Above-market rent to own LLC</span><span style={{ color: '#D4714E' }} className="shrink-0 ml-4">$31,000</span></div>
              <div className="flex justify-between"><span>+ Personal travel</span><span style={{ color: '#D4714E' }} className="shrink-0 ml-4">$15,000</span></div>
              <div style={{ borderTop: '1px solid rgba(26,26,24,0.06)', marginTop: 12, paddingTop: 12 }} className="flex justify-between font-semibold">
                <span>Adjusted SDE</span><span style={{ color: '#1A1A18' }}>$444,000</span>
              </div>
            </div>
            <div className="mt-4 p-3" style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #22C55E', borderRadius: '0 10px 10px 0' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A18', margin: 0 }}>
                At 3.2&times;: $1.02M &rarr; $1.42M. $400,000 this owner almost left on the table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: NEGOTIATE LIKE A PRO ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-4">
            You do this once. The buyer&apos;s attorney does it fifty times.
          </h2>
          <p style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', marginBottom: 32, lineHeight: 1.65 }}>
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
                <span style={{ color: '#D4714E', fontWeight: 600 }} className="shrink-0 mt-0.5">&bull;</span>
                <span style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }} className="md:text-[17px]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: BROKER PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }} >
          <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 24 }} className="md:text-[36px]">
            Working with a broker? Even better.
          </h3>
          <div className="space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }}>
            <p className="m-0">Bring your smbX.ai analysis to your first meeting. They get: normalized financials, defensible valuation, market intelligence, draft CIM &mdash; before the engagement letter.</p>
            <p className="m-0">Your broker focuses on relationships and negotiations. Yulia handles the data.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
