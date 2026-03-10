interface SellBelowProps {
  onChipClick: (text: string) => void;
}

export default function SellBelow({ onChipClick }: SellBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: THE MOMENT [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto md:p-12" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
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
      </section>

      {/* ═══ Section 2: THE MONEY YOU'RE MISSING ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            The $400,000 most owners leave on the table.
          </h2>
          <div className="max-w-3xl space-y-6 mb-10" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Your tax returns are optimized to minimize what you owe. That&apos;s smart &mdash; until you try to sell. Because the number a buyer pays is based on your earnings AFTER you add back all the personal expenses running through the business.</p>
            <p className="m-0">Most owners miss $80K&ndash;$200K in add-backs. At a 3&times; multiple, that&apos;s $240K&ndash;$600K in enterprise value that vanishes because nobody identified it.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>Yulia scans your financials and flags every one:</p>
          </div>

          <div className="max-w-2xl" style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '28px 32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>EXAMPLE: A RESIDENTIAL CLEANING COMPANY &middot; PHOENIX, AZ</span>
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
                At 3.2&times;: $1.02M &rarr; $1.42M. <strong>$400,000 this owner almost left on the table.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: YOUR OPTIONS ═══ */}
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
              { title: 'BUY OUT A PARTNER', body: 'One of you wants out. You need a number both sides trust, financing that works, and a buyout agreement that protects everyone.' },
              { title: 'RAISE CAPITAL', body: 'Grow without selling. Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor-ready materials.' },
              { title: 'EMPLOYEE BUYOUT (ESOP)', body: 'Transition to employee ownership \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
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
                { title: 'BUY OUT A PARTNER', body: 'One of you wants out. You need a number both sides trust, financing that works, and a buyout agreement that protects everyone.' },
                { title: 'RAISE CAPITAL', body: 'Grow without selling. Debt, equity, SBA expansion \u2014 Yulia models every scenario and prepares investor-ready materials.' },
              ].map(c => (
                <div key={c.title} style={{ background: '#F7F6F4', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 12 }}>{c.title}</h3>
                  <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.6 }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5 mt-5">
              {[
                { title: 'EMPLOYEE BUYOUT (ESOP)', body: 'Transition to employee ownership \u2014 with tax advantages a traditional sale doesn\u2019t offer.' },
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

      {/* ═══ Section 4: THE JOURNEY [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
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
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 1 &mdash; UNDERSTAND (MONTH 1&ndash;2) &middot; FREE</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">See your business through a buyer&apos;s eyes.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '0 0 16px', lineHeight: 1.65 }}>
                See your business through a buyer&apos;s eyes &mdash; before a buyer does. Yulia normalizes your financials, identifies add-backs, runs a preliminary valuation, benchmarks your margins against industry medians, and flags every risk that would surface in due diligence.
              </p>
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A18', margin: '0 0 12px', lineHeight: 1.65 }}>
                You receive: Bizestimate + Value Readiness Report + Preliminary SDE/EBITDA &mdash; all free.
              </p>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>
                The Value Readiness Report alone &mdash; a 7-factor score with specific improvement actions and the dollar impact of each one &mdash; is worth $2&ndash;5K of consulting work.
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
                  'Margins below industry median? She shows you exactly where.',
                  'Books are messy? Clean up now, not during due diligence when it costs you leverage.',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span style={{ color: '#D4714E', fontWeight: 600 }} className="shrink-0 mt-0.5">&bull;</span>
                    <span style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '16px 0 0', lineHeight: 1.65, fontStyle: 'italic' }}>
                Every recommendation is quantified: &ldquo;This improvement is worth approximately $X at your current multiple.&rdquo;
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 3 &mdash; PREPARE (MONTH 6&ndash;18)</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">Package the deal.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '0 0 16px', lineHeight: 1.65 }}>
                CIM. Financial exhibits. Teaser profile. Data room. Buyer targeting. Everything a qualified buyer needs to make a decision &mdash; generated by Yulia from the intelligence she&apos;s already built over months of working with you.
              </p>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>
                Buyer targeting maps the landscape: strategic acquirers, PE platforms active in your sector, SBA-qualified individuals, search funds with matching mandates. Not generic &mdash; localized to your market, industry, and deal.
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PHASE 4 &mdash; NEGOTIATE &amp; CLOSE (MONTH 12&ndash;24)</span>
              <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 16 }} className="md:text-[28px]">Get the deal done.</h3>
              <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: '0 0 16px', lineHeight: 1.65 }}>
                LOI evaluation. Deal structure modeling. Earnout analysis. Working capital adjustments. Competitive process management. And real negotiation tactics:
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
              <p style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A18', margin: '16px 0 0', lineHeight: 1.65 }}>
                The buyer&apos;s attorney does this fifty times a year. You do it once. Yulia levels that field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: BROKER PARTNERSHIP [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 24 }} className="md:text-[36px]">
            Working with a broker? Even better.
          </h3>
          <div className="space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.6 }}>
            <p className="m-0">Bring your smbX.ai analysis to your first meeting. They get: normalized financials, defensible valuation, market intelligence, draft CIM &mdash; before the engagement letter.</p>
            <p className="m-0">Your broker focuses on relationships and negotiations. Yulia handles the data. Together, it&apos;s the best of both worlds &mdash; the human judgment of a seasoned advisor backed by institutional-grade intelligence.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>The professionals you hire will thank you for it.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 6: THE PAYOFF ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            The wire hits your account. And you know.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">Not &ldquo;I hope I got a fair deal.&rdquo; Not &ldquo;I wonder if I left money on the table.&rdquo; Not &ldquo;I wish I&apos;d started this sooner.&rdquo;</p>
            <p className="m-0">You know your number was real. You know your add-backs were captured. You know your CIM was institutional quality. You know the negotiation was prepared, not improvised.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>That&apos;s what Yulia delivers: the confidence that comes from knowing &mdash; at every stage &mdash; that you made the right moves.</p>
          </div>
          <div className="mt-10">
            <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about your business and get a free valuation range in 90 seconds.</p>
            <button
              onClick={() => onChipClick("I want to sell my business")}
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
