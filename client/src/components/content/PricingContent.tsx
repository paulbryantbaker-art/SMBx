interface Props {
  onSend?: (prompt: string) => void;
}

export default function PricingContent(_props: Props) {
  return (
    <div className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white pb-32 min-h-screen w-full">

      {/* HERO */}
      <section className="px-6 pt-12 md:pt-24 pb-16 max-w-6xl mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FBE3D9]">
          Pay-As-You-Go Pricing
        </div>
        <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8 text-left">
          If you could Google it,<br />
          <span className="text-[#D4714E]">it should be free.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl leading-relaxed mb-12 text-left">
          The conversation with Yulia is always free. Foundational analysis is free because the underlying data is public. You only pay for personalized intelligence and document generation.
        </p>
      </section>

      {/* FREE TIER */}
      <section className="px-6 py-20 bg-white border-y border-[#EAE6DF]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Start here. It&apos;s on us.</h2>
            <p className="text-[#6E6A63] text-lg">No credit card. No signup wall. Just tell Yulia about your deal.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FreeCard title="Unlimited Chat" desc="Ask anything about your deal, market, or the process. Yulia's advisory conversation has no limits." />
            <FreeCard title="Business Classification" desc="Yulia identifies your deal's framework (SDE vs EBITDA) and applicable buyer pool instantly." />
            <FreeCard title="Preliminary Valuation" desc="An initial estimate based on industry multiples, your profile, and current market conditions." />
            <FreeCard title="Market Overview" desc="Industry dynamics, competitive landscape, and regional context for your specific deal." />
            <FreeCard title="Add-back Discovery" desc="Yulia scans your profile for common add-backs that increase your business's actual earnings." />
            <FreeCard title="SBA Pre-qualification" desc="Check if your deal qualifies for SBA financing and understand what that means for the buyer pool." />
          </div>
        </div>
      </section>

      {/* PREMIUM DELIVERABLES */}
      <section className="px-6 py-24 bg-[#F8F6F1]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Go deeper when your deal is ready.</h2>
            <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">Premium deliverables are generated when you need them. No subscriptions. No retainers. Your investment grows with your deal.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Sell Side */}
            <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm">
              <h3 className="text-2xl font-bold mb-6 border-b border-[#EAE6DF] pb-4">Seller Deliverables</h3>
              <div className="space-y-6">
                <PriceItem title="Market Intelligence Report" price="$200" desc="Comprehensive analysis of your industry, competitive landscape, and buyer activity localized to your metro." />
                <PriceItem title="Full Valuation Analysis" price="$350" desc="Multi-methodology valuation (SDE/EBITDA/DCF) built to withstand buyer and lender scrutiny." />
                <PriceItem title="Confidential Info Memo (CIM)" price="$700" desc="A professional 25+ page deal book presenting your business to potential buyers." />
                <PriceItem title="Deal Structuring Intel" price="$250" desc="Offer evaluation, deal structure optimization, and negotiation strategy through close." />
              </div>
            </div>
            {/* Buy Side */}
            <div className="bg-white p-8 rounded-3xl border border-[#EAE6DF] shadow-sm">
              <h3 className="text-2xl font-bold mb-6 border-b border-[#EAE6DF] pb-4">Buyer Deliverables</h3>
              <div className="space-y-6">
                <PriceItem title="Target Financial Analysis" price="$275" desc="Deep financial modeling including DSCR, ROI projections, and SBA financing scenarios." />
                <PriceItem title="Market & Competitive Intel" price="$200" desc="Industry mapping, competitive density, and target identification for your thesis." />
                <PriceItem title="Due Diligence Report" price="$300" desc="Pre-diligence risk assessment and red flag identification before engaging outside counsel." />
                <PriceItem title="Deal Structuring" price="$250" desc="Sources & uses, seller note modeling, earnout scenarios, and final offer construction." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WALLET FAQ */}
      <section className="px-6 py-24 bg-white border-t border-[#EAE6DF]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">How the Wallet works.</h2>
          <p className="text-lg text-[#6E6A63] leading-relaxed mb-12 text-center">
            smbX.ai uses a transparent wallet system. Add funds when you&apos;re ready for a premium deliverable. Yulia tells you exactly what it costs before you commit. No recurring charges, no hidden fees. $1 in your wallet equals $1 of purchasing power.
          </p>
          <div className="bg-[#FDFCFB] p-8 md:p-12 rounded-[40px] border border-[#EAE6DF] shadow-sm">
            <h3 className="font-bold text-2xl mb-8">Frequently Asked Questions</h3>
            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-[#1A1A18] text-lg">Is the free analysis really free?</h4>
                <p className="text-[#6E6A63] mt-2 leading-relaxed">Yes. No credit card required. We built it this way because the underlying data is public. What you pay for is the personalized synthesis and document generation.</p>
              </div>
              <div className="h-px w-full bg-[#EAE6DF]" />
              <div>
                <h4 className="font-bold text-[#1A1A18] text-lg">How is this different from ChatGPT?</h4>
                <p className="text-[#6E6A63] mt-2 leading-relaxed">ChatGPT is a general model. smbX.ai is a purpose-built intelligence engine grounded in sovereign Federal data (Census, BLS, SEC) executing a strict 7-layer M&amp;A methodology.</p>
              </div>
              <div className="h-px w-full bg-[#EAE6DF]" />
              <div>
                <h4 className="font-bold text-[#1A1A18] text-lg">Can I use deliverables with my clients?</h4>
                <p className="text-[#6E6A63] mt-2 leading-relaxed">Yes. All paid deliverables can be white-labeled with your firm&apos;s branding at no extra cost.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Sub-components ── */

function FreeCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 border border-[#EAE6DF] rounded-2xl bg-[#FDFCFB] hover:shadow-sm transition-shadow">
      <div className="font-black text-[#D4714E] text-xl mb-3">✓</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-[#6E6A63] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PriceItem({ title, price, desc }: { title: string; price: string; desc: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start border-b border-[#EAE6DF] pb-6 last:border-0 last:pb-0">
      <div className="flex-1">
        <h4 className="font-bold text-[#1A1A18] text-lg">{title}</h4>
        <p className="text-[#6E6A63] text-sm mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className="font-black text-xl text-[#D4714E] shrink-0">{price}</div>
    </div>
  );
}
