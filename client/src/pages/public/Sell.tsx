import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Tell Yulia about your business',
    price: 'Free',
    free: true,
    desc: 'No forms. Just a conversation. Revenue, team, industry, location \u2014 whatever you know. Yulia asks the follow-ups that matter and builds your deal profile in minutes.',
    detail: '\u201CI own a pest control company in Phoenix, 8 trucks, $1.8M revenue, been running it for 11 years.\u201D \u2014 That\u2019s all it takes to start.',
  },
  {
    num: 2,
    title: 'See your real numbers',
    price: 'Free',
    free: true,
    desc: 'SDE or EBITDA calculated. Every legitimate add-back identified. Preliminary valuation range with the methodology shown. Not a guess \u2014 a number you can take to your CPA.',
    detail: 'Most owners discover $30K\u2013$80K in add-backs they didn\u2019t know existed. Personal vehicle, one-time expenses, above-market rent to yourself \u2014 Yulia surfaces them all.',
  },
  {
    num: 3,
    title: 'Full valuation report',
    price: '$350',
    free: false,
    desc: 'Multi-methodology valuation: comparable transactions, industry multiples, discounted cash flow. Benchmarked against real deals in your industry, geography, and size bracket.',
  },
  {
    num: 4,
    title: 'CIM and buyer matching',
    price: '$175',
    free: false,
    desc: 'Confidential Information Memorandum \u2014 the document that makes buyers take your business seriously. Qualified buyer list scored by strategic fit, financial capacity, and acquisition history.',
    detail: 'Working with a broker? Invite them in. Yulia produces the CIM and buyer research \u2014 your broker focuses on relationships and negotiation.',
  },
  {
    num: 5,
    title: 'Deal management and close',
    price: '$275',
    free: false,
    desc: 'LOI comparison, due diligence management, working capital analysis, deal structuring, and closing coordination. Every party organized, every document in one place.',
  },
];

const DEAL_EXAMPLES = [
  {
    deal: '$1.8M Pest Control \u2014 Phoenix, AZ',
    desc: 'Owner-operated, 8 trucks, 11 years. Yulia identified $47K in add-backs the owner didn\u2019t know counted. Full valuation, CIM, and 4 qualified buyers delivered in one session.',
    cost: '$800',
    outcome: 'Closed at $780K \u2014 26% above initial estimate',
  },
  {
    deal: '$45M Manufacturing Platform \u2014 Southeast',
    desc: '$8.2M adjusted EBITDA. Seven Layers analysis identified regional consolidation trend and two PE firms actively building in the sector. CIM and management presentation produced same-day.',
    cost: '$4,200',
    outcome: 'Closed at 6.1\u00D7 EBITDA \u2014 above market avg.',
  },
  {
    deal: '$210M Healthcare Services \u2014 Multi-State',
    desc: 'PE-backed platform with 14 locations. Full analytical package: valuation, buyer universe, management presentation, and deal book. Due diligence data room organized for 8 bidders in parallel.',
    cost: '$12,000',
    outcome: 'Process ran in 90 days \u2014 4 final bidders',
  },
];

const INSIGHT = {
  title: 'The add-back problem',
  body: 'The average business owner misses $30K\u2013$80K in legitimate add-backs during their first valuation attempt. That\u2019s not a rounding error \u2014 at a 3x multiple, that\u2019s $90K\u2013$240K left on the table. Yulia\u2019s methodology checks against 47 common add-back categories before producing a range.',
};

const BROKER_BENEFITS = [
  { bold: 'Invite your broker', rest: ' into the deal room \u2014 they see everything, collaborate in real time' },
  { bold: 'CIMs in under an hour', rest: ' \u2014 your broker reviews and refines instead of building from scratch' },
  { bold: 'Attorneys and CPAs join free', rest: ' \u2014 no extra seats, no extra cost' },
  { bold: "Your broker\u2019s expertise + Yulia\u2019s intelligence", rest: ' = deals that close faster at better terms' },
];

const FAQS = [
  {
    q: 'Can I trust this valuation?',
    a: 'Yulia uses the same methodologies as human advisors \u2014 comparable transactions, industry multiples, discounted cash flow. Every calculation is shown, every comp is sourced. The methodology is the same. The speed is different.',
  },
  {
    q: 'Will buyers take this CIM seriously?',
    a: 'The format, depth, and quality match what top advisory firms produce. Buyers evaluate the information, not who assembled it. Many CIMs are reviewed and co-branded by the seller\u2019s broker before going to market.',
  },
  {
    q: 'How does Yulia work with my broker?',
    a: 'Seamlessly. Your broker joins the deal room free and gets instant access to valuations, CIMs, and buyer research. Many of our most active users are brokers who use Yulia to produce analytical work product \u2014 so they can focus on relationships, negotiation, and closing.',
  },
  {
    q: 'What if my business is complicated?',
    a: 'Yulia covers 80+ industry verticals with current market data. Whether you\u2019re a single-location business or a multi-state platform with 50 locations, she adapts \u2014 different metrics, different comps, different buyer profiles, different complexity. The methodology scales with the deal.',
  },
];

/* ─── Page ─── */

export default function Sell() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-14">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          Exit Strategy
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.05] tracking-tight max-w-[16ch] mb-10 m-0">
          Know your number <em className="italic text-[#D4714E]">before anyone else does.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-16 m-0">
          Most owners sell for less than they should &mdash; not because the business isn&apos;t
          worth it, but because they didn&apos;t have the right intelligence at the right time.
        </p>
        <div className="animate-fadeInUp stagger-3 flex flex-col md:flex-row gap-3 max-md:w-full">
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Get your number &mdash; free &rarr;</Button>
          <Button variant="secondary" href="/how-it-works">See how it works</Button>
        </div>
      </section>

      {/* ═══ WHY SELLERS LEAVE MONEY ON THE TABLE ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0EB] rounded-4xl p-12 max-md:p-7" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05), inset 0 0 0 1px rgba(212,113,78,.06)' }}>
          <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">The intelligence gap</p>
          <h3 className="font-sans text-[clamp(24px,2.5vw,32px)] font-black tracking-[-0.02em] mb-4 m-0">
            Why sellers leave $100K&ndash;$500K on the table.
          </h3>
          <p className="text-[15px] text-[#4A4843] leading-[1.65] mb-4 m-0">
            Most business owners don&apos;t know their real number. They miss add-backs, underestimate
            market multiples, and don&apos;t know which buyers are actively acquiring in their space.
            Yulia&apos;s first analysis is free because finding hidden value is how we earn your trust.
          </p>
          <p className="text-[15px] text-[#4A4843] leading-[1.65] m-0">
            Every insight is grounded in authoritative federal data &mdash; Census Bureau, BLS, FRED,
            SEC EDGAR &mdash; synthesized with 80+ industry verticals of transaction data and localized
            to your market. Not national averages. Your city. Your industry. Your competitive environment.
          </p>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          Your exit journey
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From &ldquo;what&apos;s it worth?&rdquo; to <em className="italic text-[#D4714E]">wire transfer.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Complete exit journey: <strong className="text-[#1A1A18]">from $800</strong> &middot;
            every deliverable priced individually
          </p>
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start your journey &mdash; free &rarr;</Button>
        </div>
      </section>

      {/* ═══ DEAL EXAMPLES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Real deals. <em className="italic text-[#D4714E]">Real numbers.</em>
        </h2>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {DEAL_EXAMPLES.map(d => (
            <Card key={d.deal} padding="px-7 py-9">
              <p className="text-[11px] uppercase tracking-[.12em] text-[#D4714E] font-semibold mb-3 m-0">{d.deal}</p>
              <p className="text-sm text-[#7A766E] leading-[1.55] mb-4 m-0">{d.desc}</p>
              <div className="flex justify-between items-center pt-3 border-t border-[#E0DCD4]">
                <div>
                  <p className="text-[11px] uppercase tracking-[.1em] text-[#7A766E] mb-0.5 m-0">Deliverables</p>
                  <p className="text-[15px] font-bold text-[#D4714E] m-0">{d.cost}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[.1em] text-[#7A766E] mb-0.5 m-0">Outcome</p>
                  <p className="text-[13px] font-medium text-[#1A1A18] m-0">{d.outcome}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ INSIGHT BOX ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0EB] rounded-4xl p-12 max-md:p-7" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05), inset 0 0 0 1px rgba(212,113,78,.06)' }}>
          <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">Methodology insight</p>
          <h3 className="font-sans text-xl font-bold text-[#1A1A18] mb-3 m-0">{INSIGHT.title}</h3>
          <p className="text-[15px] text-[#4A4843] leading-[1.65] m-0">{INSIGHT.body}</p>
        </div>
      </section>

      {/* ═══ BROKER CALLOUT ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl py-12 px-14 grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:py-8 max-md:px-6 max-md:gap-8">
          <div>
            <h3 className="font-sans text-[28px] font-black tracking-[-0.02em] leading-[1.15] mb-4 m-0">
              Working with a <em className="italic text-[#D4714E]">broker?</em> Even better.
            </h3>
            <p className="text-[15px] text-[#7A766E] leading-[1.6] m-0">
              Yulia doesn&apos;t replace your broker &mdash; she makes them faster. Many of our
              most active users are brokers and advisors who use Yulia to produce work product,
              screen buyers, and manage more deals simultaneously.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {BROKER_BENEFITS.map(b => (
              <div key={b.bold} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center text-xs font-bold shrink-0 mt-px">
                  &#10003;
                </span>
                <span className="text-[15px] leading-[1.5]">
                  <strong>{b.bold}</strong>{b.rest}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-extrabold tracking-tight mb-8 m-0 text-center">
          Ready to know your number?
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/sell" />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Questions sellers ask.
        </h2>
        <div>
          {FAQS.map((f, i) => (
            <div key={i} className={`py-6 ${i < FAQS.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>
              <p className="text-base font-bold text-[#1A1A18] mb-2.5 m-0">{f.q}</p>
              <p className="text-sm text-[#7A766E] leading-[1.65] m-0">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#D4714E] to-[#BE6342] rounded-4xl px-16 py-24 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            You built something valuable. Let&apos;s prove it.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#D4714E] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &mdash; free &rarr;
          </button>
        </div>
      </section>

      {/* ═══ NUDGE ═══ */}
      <div className="text-center pb-10 max-md:pb-6">
        <p className="journey-nudge text-[22px] text-[#D4714E] m-0 max-md:text-lg">
          most owners wish they&apos;d started this conversation sooner
        </p>
      </div>
    </PublicLayout>
  );
}
