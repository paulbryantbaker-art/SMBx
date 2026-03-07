interface HomeBelowProps {
  onChipClick: (text: string) => void;
}

export default function HomeBelow({ onChipClick }: HomeBelowProps) {
  return (
    <>
      {/* ═══ Section 1: THE HOOK (Bizestimate) ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7]" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">FREE BUSINESS VALUATION</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2 md:max-w-[720px] md:mx-auto" style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Know your number. Right now. For free.
            </h2>
          </div>
          <div className="md:max-w-[680px] md:mx-auto space-y-5">
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              Tell Yulia about your business &mdash; industry, location, revenue &mdash; and she&apos;ll give you a valuation range on the spot. No signup. No credit card. No &ldquo;schedule a consultation.&rdquo;
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              Your Bizestimate updates every quarter as market conditions change. Share it with your partner, your CPA, your attorney &mdash; anyone you need in the conversation.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              It&apos;s not a guess. It&apos;s built on live Census data, BLS wage benchmarks, SBA lending patterns, and real transaction multiples for your industry and geography.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#1A1A18] font-bold m-0" style={{ lineHeight: 1.65 }}>
              Most business owners have never seen a real number for what their company is worth. You can have one in 90 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: SOUND FAMILIAR? ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">SOUND FAMILIAR?</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2 md:max-w-[720px] md:mx-auto" style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              You have questions. They shouldn&apos;t take weeks to answer.
            </h2>
          </div>
          <div className="md:max-w-[680px] md:mx-auto space-y-5">
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 italic" style={{ lineHeight: 1.65 }}>
              &ldquo;What is my business actually worth &mdash; and am I leaving money on the table?&rdquo;
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 italic" style={{ lineHeight: 1.65 }}>
              &ldquo;Is this listing worth pursuing &mdash; or will I waste three months finding out it doesn&apos;t work?&rdquo;
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 italic" style={{ lineHeight: 1.65 }}>
              &ldquo;How do I package this deal faster without burning out my entire week?&rdquo;
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0 pt-2" style={{ lineHeight: 1.65 }}>
              Right now, getting real answers to these questions takes weeks of analysis and thousands in professional fees.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#1A1A18] font-bold m-0" style={{ lineHeight: 1.65 }}>
              Yulia answers them in minutes. With real data. Specific to your deal. And the first round of analysis is free &mdash; not a teaser, not a gated preview. Real deliverables you can use.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: WHAT YOU GET BEFORE YOU PAY ANYTHING ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">START FREE</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2 md:max-w-[720px] md:mx-auto" style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Real analysis. Before you pay a thing.
            </h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3 md:max-w-[580px] md:mx-auto" style={{ lineHeight: 1.55 }}>
              Before Yulia ever mentions a price, she&apos;s already delivered the foundational analysis for your deal &mdash; for free.
            </p>
          </div>

          {/* Mobile: stacked list */}
          <div className="md:hidden space-y-0">
            {[
              { title: 'YOUR BIZESTIMATE', body: 'A valuation range for your business \u2014 updated quarterly as market conditions shift. Shareable link you can send to your partner, your CPA, your attorney.' },
              { title: 'VALUE READINESS REPORT (Sellers)', body: 'A 7-factor score that shows exactly where your business stands \u2014 with specific improvement actions and the dollar impact of each one.' },
              { title: 'INVESTMENT THESIS DOCUMENT (Buyers)', body: 'Your acquisition blueprint: criteria, capital stack template, SBA eligibility check, and a landscape overview of your target market.' },
              { title: 'PRELIMINARY SDE/EBITDA (Sellers)', body: 'The add-back math and adjusted earnings calculation \u2014 the foundation everything else is built on.' },
            ].map((c, i) => (
              <div key={c.title} className={`py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <h3 className="text-[14px] font-bold text-[#D4714E] mb-1 m-0">{c.title}</h3>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
          </div>

          {/* Desktop: 2x2 grid */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { title: 'YOUR BIZESTIMATE', body: 'A valuation range for your business \u2014 updated quarterly as market conditions shift. Shareable link you can send to your partner, your CPA, your attorney.' },
              { title: 'VALUE READINESS REPORT (Sellers)', body: 'A 7-factor score that shows exactly where your business stands \u2014 with specific improvement actions and the dollar impact of each one.' },
              { title: 'INVESTMENT THESIS DOCUMENT (Buyers)', body: 'Your acquisition blueprint: criteria, capital stack template, SBA eligibility check, and a landscape overview of your target market.' },
              { title: 'PRELIMINARY SDE/EBITDA (Sellers)', body: 'The add-back math and adjusted earnings calculation \u2014 the foundation everything else is built on.' },
            ].map(c => (
              <div key={c.title} className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6">
                <h3 className="text-[14px] font-bold text-[#D4714E] mb-2 m-0">{c.title}</h3>
                <p className="text-[14px] text-[#6E6A63] m-0" style={{ lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
          </div>

          <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-6 md:text-center m-0" style={{ lineHeight: 1.65 }}>
            By the time you&apos;re ready for premium deliverables, Yulia has already proven herself. The first paid ask isn&apos;t cold &mdash; it&apos;s the obvious next step.
          </p>
        </div>
      </section>

      {/* ═══ Section 4: WHAT YULIA DOES (Brief) ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">YOUR DEAL OS</span>
            <h2 className="text-[26px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>One conversation. Start to finish.</h2>
          </div>
          <div className="md:max-w-[680px] md:mx-auto space-y-5">
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              Tell Yulia what you&apos;re working on. She figures out what you need and starts building it.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              She normalizes your financials. Finds hidden add-backs. Benchmarks your market. Runs a defensible valuation. Models the financing. Maps the competitive landscape. Generates deal-ready documents. And guides you through every step &mdash; including the negotiation tactics that get deals done in the real world.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              <strong className="text-[#1A1A18]">Sellers:</strong> she&apos;s with you from first question through closing. A 6&ndash;24 month journey, managed.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              <strong className="text-[#1A1A18]">Buyers:</strong> she&apos;s with you from thesis through close &mdash; and 180 days beyond with a post-acquisition value creation plan specific to YOUR business.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] m-0" style={{ lineHeight: 1.65 }}>
              <strong className="text-[#1A1A18]">Advisors:</strong> she handles the data assembly and document production in minutes. You handle the relationships and negotiations. White-label everything.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Section 5: CONVERSATION PREVIEW ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-20 md:pb-16 md:px-8">
        <div className="md:max-w-[720px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">SEE IT HAPPEN</span>
            <h2 className="text-[24px] md:text-[36px] font-extrabold mt-2" style={{ letterSpacing: '-0.025em' }}>This took 47 seconds.</h2>
          </div>

          {/* User message */}
          <div className="flex justify-end mb-3.5">
            <div className="bg-[#FFF0EB] border border-[rgba(212,113,78,0.15)] p-3.5 ml-8 md:ml-0 md:max-w-[80%]" style={{ borderRadius: '20px 20px 4px 20px' }}>
              <p className="text-[15px] md:text-[16px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.55 }}>
                I&apos;m thinking about selling my commercial HVAC company. We&apos;re in Dallas-Fort Worth, about $4.2M in revenue and $780K in adjusted EBITDA last year.
              </p>
            </div>
          </div>

          {/* Yulia response */}
          <div className="flex items-start gap-2.5">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1A1A18] text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-1">Y</div>
            <div className="bg-[#F7F7F7] p-3.5 flex-1" style={{ borderRadius: '20px 20px 20px 4px' }}>
              <p className="text-[15px] md:text-[16px] font-medium text-[#1A1A18] m-0 mb-3" style={{ lineHeight: 1.55 }}>
                Commercial HVAC in DFW &mdash; that&apos;s a strong combination right now. Your $780K EBITDA puts you in the institutional range. Let me run the numbers...
              </p>
              {/* Valuation card */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 mt-3.5">
                <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#6E6A63]">Preliminary Enterprise Value</div>
                <div className="text-[32px] md:text-[36px] font-extrabold tracking-[-0.03em] text-[#1A1A18]">$3.7M &ndash; $4.8M</div>
                <div className="text-[12px] font-medium text-[#6E6A63]">EBITDA &times; Industry Multiple (4.8&ndash;6.2&times;) &middot; Census CBP &middot; BLS QCEW</div>
              </div>
              {/* Green insight */}
              <div className="mt-2 p-2.5" style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #22C55E', borderRadius: '0 10px 10px 0' }}>
                <p className="text-[13px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.5 }}>DFW has 847 HVAC businesses per Census data, but only ~12% are commercial-focused. 14 active PE roll-up platforms in Texas. You&apos;re in a seller&apos;s market.</p>
              </div>
              {/* Amber insight */}
              <div className="mt-2 p-2.5" style={{ background: 'rgba(234,179,8,0.06)', borderLeft: '3px solid #EAB308', borderRadius: '0 10px 10px 0' }}>
                <p className="text-[13px] font-medium text-[#1A1A18] m-0" style={{ lineHeight: 1.5 }}>Your 18.6% EBITDA margin is slightly below the 21% sector median. Optimization here could move your enterprise value $200K&ndash;$400K.</p>
              </div>
            </div>
          </div>

          <p className="text-[13px] md:text-[14px] font-semibold text-[#6E6A63] mt-5 md:text-center">
            That&apos;s deal intelligence for a real business, in a real market, with real federal data &mdash; in under a minute.
          </p>
        </div>
      </section>

      {/* ═══ Section 6: WHO THIS IS FOR ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[960px] md:mx-auto">
          <h2 className="text-[26px] md:text-[36px] font-extrabold mb-5 md:mb-8 md:text-center" style={{ letterSpacing: '-0.025em' }}>Whatever side of the deal you&apos;re on.</h2>
          {/* Mobile: divider list */}
          <div className="md:hidden">
            {[
              { label: 'SELLING', body: "Whether you\u2019re planning a full exit, buying out a partner, raising capital, or transitioning to employees \u2014 the journey starts with knowing your number. Yulia walks you through every step from first valuation to closing table.\n\nYour free Bizestimate is ready in 90 seconds.", link: 'Start on the Sell page \u2192' },
              { label: 'BUYING', body: "Found a listing on BizBuySell? Heard about a deal through your network? Have a thesis but no targets? Bring it here. Yulia evaluates every opportunity and gets you to \u201Cpursue\u201D or \u201Cpass\u201D in minutes \u2014 then stays with you through close and 180 days of value creation.", link: 'Start on the Buy page \u2192' },
              { label: 'ADVISING', body: "Your first 3 client journeys are free. Run a full deal through the platform \u2014 valuation, CIM, market intelligence, buyer qualification \u2014 without committing a dollar. See what Yulia does in 30 minutes that used to take you 12 hours.", link: 'See advisor tools \u2192' },
            ].map((a, i) => (
              <div key={a.label} className={`py-4 ${i > 0 ? 'border-t border-[#E5E5E5]' : ''}`}>
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#D4714E] mb-1.5 block">{a.label}</span>
                <p className="text-[14px] text-[#6E6A63] m-0 whitespace-pre-line mb-2" style={{ lineHeight: 1.55 }}>{a.body}</p>
                <span className="text-[13px] font-bold text-[#D4714E]">{a.link}</span>
              </div>
            ))}
          </div>
          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {[
              { label: 'SELLING', body: "Whether you\u2019re planning a full exit, buying out a partner, raising capital, or transitioning to employees \u2014 the journey starts with knowing your number. Yulia walks you through every step from first valuation to closing table.\n\nYour free Bizestimate is ready in 90 seconds.", link: 'Start on the Sell page \u2192' },
              { label: 'BUYING', body: "Found a listing on BizBuySell? Heard about a deal through your network? Have a thesis but no targets? Bring it here. Yulia evaluates every opportunity and gets you to \u201Cpursue\u201D or \u201Cpass\u201D in minutes \u2014 then stays with you through close and 180 days of value creation.", link: 'Start on the Buy page \u2192' },
              { label: 'ADVISING', body: "Your first 3 client journeys are free. Run a full deal through the platform \u2014 valuation, CIM, market intelligence, buyer qualification \u2014 without committing a dollar. See what Yulia does in 30 minutes that used to take you 12 hours.", link: 'See advisor tools \u2192' },
            ].map(a => (
              <div key={a.label} className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6">
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#D4714E] mb-1 block">{a.label}</span>
                <p className="text-[15px] text-[#6E6A63] m-0 mb-3 whitespace-pre-line" style={{ lineHeight: 1.55 }}>{a.body}</p>
                <span className="text-[13px] font-bold text-[#D4714E]">{a.link}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 7: PRICING PREVIEW ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-7 md:pt-16 md:pb-16 md:px-8">
        <div className="md:max-w-[640px] md:mx-auto">
          <div className="mb-5 md:mb-8 md:text-center">
            <h2 className="text-[24px] md:text-[36px] font-extrabold" style={{ letterSpacing: '-0.025em' }}>Free to start. Pay per deliverable when you&apos;re ready.</h2>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3" style={{ lineHeight: 1.55 }}>
              Conversation, classification, preliminary valuation, market overview, and your Bizestimate are always free.
            </p>
            <p className="text-[15px] md:text-[16px] text-[#6E6A63] mt-3" style={{ lineHeight: 1.55 }}>
              When your deal needs premium documents &mdash; full valuations, CIMs, financing models &mdash; you pay from your wallet. No subscriptions. No surprises. Just the right analysis at the right moment in your deal.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Full Valuation', price: '$350' },
              { title: 'Market Intelligence', price: '$200' },
              { title: 'CIM', price: '$700' },
            ].map(item => (
              <div key={item.title} className="flex items-center justify-between bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl px-5 py-3.5">
                <span className="text-[15px] font-bold text-[#1A1A18]">{item.title}</span>
                <span className="text-[18px] font-black text-[#D4714E] shrink-0 ml-4">{item.price}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onChipClick("What can I do for free?")}
            className="text-[14px] font-bold text-[#D4714E] mt-4 bg-transparent border-none cursor-pointer p-0 hover:underline"
            style={{ fontFamily: 'inherit' }}
            type="button"
          >
            See full pricing &rarr;
          </button>
        </div>
      </section>

      {/* ═══ Section 8: CLOSE ═══ */}
      <div className="w-full h-2 bg-[#F7F7F7] mt-8 md:mt-16" />
      <section className="px-6 pt-10 pb-10 md:pt-20 md:pb-20 md:px-8">
        <div className="md:max-w-[600px] md:mx-auto md:text-center">
          <h2 className="text-[28px] md:text-[42px] font-extrabold" style={{ letterSpacing: '-0.03em' }}>Your deal. Your pace.</h2>
          <p className="text-[16px] md:text-[18px] text-[#6E6A63] mt-3">No signup. No credit card. Just start talking.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F7F7F7] py-6 md:py-8 text-center">
        <span className="text-[18px] font-extrabold">smb<span className="text-[#D4714E]">X</span>.ai</span>
        <p className="text-[12px] font-medium text-[#A8A49C] mt-1 m-0">Deal Intelligence Infrastructure</p>
      </footer>
    </>
  );
}
