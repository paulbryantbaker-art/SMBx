interface BuyBelowProps {
  onChipClick: (text: string) => void;
}

export default function BuyBelow({ onChipClick }: BuyBelowProps) {
  void onChipClick;
  return (
    <div>
      {/* ═══ Section 1: THE BUYER'S DILEMMA ═══ */}
      <section className="px-6" style={{ paddingTop: '120px' }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">THE BUYER&apos;S DILEMMA</span>
          <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3 mb-8" style={{ letterSpacing: '-0.04em' }}>
            You found a listing. Now what?
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">The broker says it&apos;s a &ldquo;great opportunity.&rdquo; The seller claims $450K in SDE. The asking price is $1.8M with $200K in seller financing.</p>
            <p className="m-0">But you&apos;re wondering:</p>
          </div>
          <div className="max-w-3xl mt-4 space-y-2">
            {[
              'Is that SDE number real, or is it inflated?',
              'Can I actually get SBA financing at that price?',
              'What does the competitive landscape look like in that metro?',
              'Are there PE firms acquiring in this space?',
              'Is the asking price justified by comparable transactions?',
              'What happens to my cash flow after debt service?',
            ].map(q => (
              <div key={q} className="flex items-start gap-2.5">
                <span className="text-[#D4714E] font-bold shrink-0 mt-0.5">&bull;</span>
                <span className="text-[16px] md:text-[18px] font-medium text-[#1A1A18]" style={{ lineHeight: 1.5 }}>{q}</span>
              </div>
            ))}
          </div>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6 mt-8" style={{ lineHeight: 1.65 }}>
            <p className="m-0">These aren&apos;t esoteric questions. They&apos;re the difference between a life-changing acquisition and a financial disaster. And until now, getting real answers required hiring an advisory team and spending $15K&ndash;$50K before you even know if the deal is viable.</p>
            <p className="m-0 text-[#1A1A18] font-bold">Yulia answers all of them in a single conversation.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: ACQUISITION TOOLKIT ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="md:text-center mb-10 md:mb-16">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#D4714E]">YOUR ACQUISITION TOOLKIT</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold mt-3" style={{ letterSpacing: '-0.04em' }}>
              Everything you need to buy with confidence.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: '\uD83C\uDFE6',
                title: 'Financing Intelligence',
                body: 'Yulia models SBA 7(a) financing against live federal rates \u2014 down payment, monthly payment, DSCR, cash-on-cash returns. She tells you if the deal is bankable BEFORE you spend a dollar on due diligence.',
                quote: '\u201CAt $1.8M with 10% down, your monthly P&I is $14,200. DSCR is 1.87 \u2014 well above the 1.25 threshold. This deal is SBA-eligible.\u201D',
              },
              {
                icon: '\uD83D\uDDFA\uFE0F',
                title: 'Market Intelligence',
                body: 'How many competitors in your target metro? What\u2019s the competitive density? Are PE firms rolling up this sector? Yulia pulls Census, BLS, and transaction data for YOUR specific geography.',
                quote: null,
              },
              {
                icon: '\uD83D\uDD0D',
                title: 'Target Evaluation',
                body: 'Paste a BizBuySell listing. Upload a broker\u2019s teaser. Describe a business you heard about. Yulia evaluates the asking price against comparable transactions and flags red flags.',
                quote: '\u201CThe broker works for the seller. Yulia works for you.\u201D',
              },
              {
                icon: '\uD83C\uDFD7\uFE0F',
                title: 'Deal Structuring',
                body: 'Asset sale or stock sale? All-cash, SBA, or seller note? Earnout terms? Working capital peg? Yulia models multiple structures and shows how each affects your returns and risk.',
                quote: null,
              },
            ].map(f => (
              <div key={f.title} className="bg-[#F9FAFB] p-8 md:p-10" style={{ borderRadius: '32px', border: '1px solid #F3F4F6' }}>
                <span className="text-[28px] block mb-3">{f.icon}</span>
                <h3 className="text-[22px] font-extrabold mb-3">{f.title}</h3>
                <p className="text-[15px] font-medium text-[#6E6A63] m-0" style={{ lineHeight: 1.6 }}>{f.body}</p>
                {f.quote && (
                  <p className="text-[14px] font-semibold text-[#1A1A18] mt-4 m-0 italic" style={{ lineHeight: 1.5 }}>{f.quote}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: NOT A LISTING SITE ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-8" style={{ letterSpacing: '-0.04em' }}>
            We don&apos;t list businesses. We give you intelligence.
          </h2>
          <div className="text-[18px] md:text-[20px] font-medium text-[#6E6A63] max-w-3xl space-y-6" style={{ lineHeight: 1.65 }}>
            <p className="m-0">BizBuySell has 60,000 listings. BizQuest has more. LoopNet, DealStream, the SBA marketplace.</p>
            <p className="m-0 text-[#1A1A18] font-bold">Listings are everywhere. Intelligence is not.</p>
            <p className="m-0">How many operators exist in your target market? Which ones are PE-backed vs. family-owned? Where does fragmentation create roll-up opportunity? What does historical SBA lending volume tell you about deal flow?</p>
            <p className="m-0">The listing is one data point. smbX.ai gives you the other 99 data points that determine whether it&apos;s actually worth pursuing.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: BUYER TYPES ═══ */}
      <section className="px-6" style={{ paddingTop: '160px' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[36px] md:text-[48px] font-extrabold mb-10 md:text-center" style={{ letterSpacing: '-0.04em' }}>
            Whether it&apos;s your first deal or your fiftieth.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'FIRST-TIME SBA BUYER', body: 'Buying a business for the first time is terrifying. Yulia walks you through every step \u2014 from understanding what SDE means to modeling your first SBA loan to evaluating your first LOI. No jargon. No assumptions. Just guidance.' },
              { label: 'SEARCH FUND OPERATOR', body: 'You have a thesis. Yulia helps you execute it. Screen industries by fragmentation. Map competitive density in target geographies. Model deal economics. Build the conviction that gets your investors to fund the close.' },
              { label: 'PE PLATFORM / BOLT-ON', body: 'Your deal team does 40 hours of analysis per target. Yulia does it in minutes. Screen pipeline, model add-on economics, evaluate EBITDA margins against platform benchmarks. Focus your team on targets that actually clear the bar.' },
              { label: 'STRATEGIC ACQUIRER', body: 'Expanding into an adjacent market? Acquiring a competitor? Yulia maps the landscape, evaluates synergies, and models the deal structure \u2014 so you walk into the negotiation with complete intelligence.' },
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
