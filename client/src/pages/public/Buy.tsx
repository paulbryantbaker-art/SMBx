import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Define your acquisition thesis',
    price: 'Free',
    free: true,
    desc: 'What kind of business? What size? What geography? What returns? Yulia builds your acquisition criteria and search strategy from a single conversation.',
    detail: '\u201CI\u2019m looking for B2B services companies, $5\u201350M revenue, 70%+ gross margins, in the Southeast.\u201D \u2014 That\u2019s enough to start screening.',
  },
  {
    num: 2,
    title: 'Screen and score targets',
    price: '$150',
    free: false,
    desc: 'Every target scored on 7 factors: financial fit, strategic alignment, market position, growth trajectory, operational risk, acquisition feasibility, and integration complexity.',
    detail: '47 targets scored against your criteria. Top 8 flagged for deep dive. You spend time on winners, not searching.',
  },
  {
    num: 3,
    title: 'Value your targets',
    price: '$350',
    free: false,
    desc: 'Full valuation on any target \u2014 comps, multiples, DCF. Know what it\u2019s worth before your first conversation with the seller.',
  },
  {
    num: 4,
    title: 'Run diligence',
    price: '$275',
    free: false,
    desc: 'Structured DD workflow \u2014 financial, operational, legal, commercial. Risks surfaced early. Documents organized. Nothing falls through the cracks.',
    detail: 'Most deals die in diligence because something gets missed. Yulia tracks every item, flags every gap, and keeps every party on schedule.',
  },
  {
    num: 5,
    title: 'Structure and close',
    price: '$275',
    free: false,
    desc: 'Offer modeling, scenario analysis, deal terms, LOI drafting, closing coordination. Every decision supported with data.',
  },
];

const DEAL_EXAMPLES = [
  {
    deal: '$2.1M HVAC Company \u2014 Dallas, TX',
    desc: 'First-time buyer. Yulia scored 23 targets against the thesis, produced full valuations on 3 finalists, and managed the DD workflow through close.',
    cost: '$1,050',
    outcome: 'Thesis to LOI in 3 weeks',
  },
  {
    deal: '$68M Industrial Services \u2014 Midwest',
    desc: 'PE platform build. Yulia screened 340+ targets against a 12-criteria thesis, scored the top 40, and ran parallel valuations on 8 finalists. Two platform acquisitions and three add-ons closed within the year.',
    cost: '$8,400',
    outcome: '5 acquisitions closed in 11 months',
  },
  {
    deal: '$185M SaaS Platform \u2014 National',
    desc: 'Growth equity fund evaluating a competitive process. Yulia produced QoE-level analysis, commercial DD workstream, and integration model within 72 hours of first contact.',
    cost: '$12,000',
    outcome: 'Full DD package in 72 hours',
  },
];

const INSIGHT = {
  title: 'The 7-factor scoring model',
  body: 'Most buyers evaluate targets on financials alone. Yulia\u2019s 7-factor model scores every target on financial fit, strategic alignment, market position, growth trajectory, operational risk, acquisition feasibility, and integration complexity. This surfaces deals that look mediocre on paper but are exceptional in context \u2014 and flags deals that look great but carry hidden risk.',
};

const BROKER_BENEFITS = [
  { bold: 'Your broker gets Yulia\u2019s analysis', rest: ' on every target \u2014 instantly' },
  { bold: 'Due diligence checklists', rest: ' generated and tracked automatically' },
  { bold: 'One deal room', rest: ' for buyer, seller, broker, attorney, CPA' },
  { bold: 'Brokers using Yulia close deals faster', rest: ' \u2014 which means you close faster' },
];

const FAQS = [
  {
    q: 'Where do the targets come from?',
    a: 'Yulia analyzes publicly available market data, industry databases, and transaction records. She complements broker deal flow \u2014 she doesn\u2019t compete with it. Many buyers use Yulia to evaluate deals their broker brings them.',
  },
  {
    q: 'Can I use this for multiple acquisitions?',
    a: 'Absolutely. Roll-up operators and search funds use Yulia for serial acquisitions \u2014 screening, valuing, and managing diligence across multiple targets simultaneously.',
  },
  {
    q: 'How does this fit with my existing deal team?',
    a: 'Yulia produces the analytical work product \u2014 valuations, models, DD checklists \u2014 so your team can focus on relationships, strategy, and judgment. PE firms, brokers, and advisors use Yulia alongside their deal teams to move faster on competitive deals.',
  },
  {
    q: 'What if I\u2019m buying through a broker?',
    a: 'Perfect. Invite your broker into the deal room. Yulia produces the analytical work product \u2014 valuations, models, DD checklists \u2014 while your broker handles relationships and negotiation.',
  },
];

/* ─── Page ─── */

export default function Buy() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-14">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          Acquisition Intelligence
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.05] tracking-tight max-w-[16ch] mb-10 m-0">
          Source smarter. Screen faster. <em className="italic text-[#D4714E]">Build conviction.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-16 m-0">
          First-time buyer? Yulia coaches you through every step in plain English. PE firm
          running a roll-up? She models IRR waterfalls and identifies bolt-on targets before
          your first call. She screens, scores, values, and manages diligence &mdash; adapting
          to your deal size and experience level.
        </p>
        <div className="animate-fadeInUp stagger-3 flex flex-col md:flex-row gap-3 max-md:w-full">
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start screening &mdash; free &rarr;</Button>
          <Button variant="secondary" href="/how-it-works">See how it works</Button>
        </div>
      </section>

      {/* ═══ COMPETITIVE INTELLIGENCE TEASER ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0EB] rounded-4xl p-12 max-md:p-7" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05), inset 0 0 0 1px rgba(212,113,78,.06)' }}>
          <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">Localized market intelligence</p>
          <h3 className="font-sans text-[clamp(24px,2.5vw,32px)] font-black tracking-[-0.02em] mb-4 m-0">
            Your market. Your industry. Your ZIP code.
          </h3>
          <p className="text-[15px] text-[#4A4843] leading-[1.65] mb-5 m-0">
            For every target, Yulia delivers competitive intelligence most buyers never see &mdash; grounded
            in Census Bureau, BLS, Federal Reserve, SEC EDGAR, and IRS data. Competitive density, PE consolidation
            activity, average multiples by sub-region, SBA bankability scores, and fragmentation analysis. The same
            sources that power Wall Street, localized to the target&apos;s ZIP code.
          </p>
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
            {[
              { label: 'Competitive density', value: '47 operators' },
              { label: 'PE activity', value: '3 active consolidators' },
              { label: 'Avg. multiple (DFW)', value: '4.2\u00D7 SDE' },
              { label: 'SBA bankability', value: '92% qualified' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid rgba(224,220,212,0.5)' }}>
                <p className="text-[11px] uppercase tracking-[.1em] text-[#7A766E] mb-1 m-0">{stat.label}</p>
                <p className="text-lg font-bold text-[#1A1A18] m-0">{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[#A9A49C] mt-4 m-0 italic">
            Example: Industrial services competitive intelligence for Dallas-Fort Worth. Powered by Census Bureau, BLS, and transaction data.
          </p>
        </div>
      </section>

      {/* ═══ SBA BANKABILITY ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0EB] rounded-4xl p-12 max-md:p-7" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05), inset 0 0 0 1px rgba(212,113,78,.06)' }}>
          <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">SBA Bankability Engine</p>
          <h3 className="font-sans text-[clamp(24px,2.5vw,32px)] font-black tracking-[-0.02em] mb-4 m-0">
            Does this deal pencil? Know in 30 seconds.
          </h3>
          <p className="text-[15px] text-[#4A4843] leading-[1.65] mb-4 m-0 max-w-[700px]">
            Sixty-five percent of business acquisitions use SBA financing. Yulia tells you instantly
            whether a deal pencils &mdash; current SOFR-plus rates, June 2025 SOP 50 10 8 rules, DSCR analysis,
            and equity injection requirements &mdash; before you spend three months on diligence for a deal
            that can&apos;t close. Current rates. Current rules. Current reality.
          </p>
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2 mt-6">
            {[
              { label: 'DSCR analysis', value: 'Instant' },
              { label: 'Equity injection', value: '10% minimum' },
              { label: 'Seller note rules', value: 'June 2025' },
              { label: 'Alternative structures', value: 'Auto-modeled' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid rgba(224,220,212,0.5)' }}>
                <p className="text-[11px] uppercase tracking-[.1em] text-[#7A766E] mb-1 m-0">{stat.label}</p>
                <p className="text-base font-bold text-[#1A1A18] m-0">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          Your acquisition journey
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From thesis to <em className="italic text-[#D4714E]">closing table.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Complete buy-side journey: <strong className="text-[#1A1A18]">from $1,050</strong> &middot;
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
              Brokers bring you deals. Yulia arms them with instant valuations, target scoring,
              and DD workflows &mdash; so your broker spends time on the deals that matter, not the spreadsheets.
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
          Ready to find your next deal?
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/buy" />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Questions buyers ask.
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
            Your next acquisition starts with conviction.
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
          the best deals go to prepared buyers
        </p>
      </div>
    </PublicLayout>
  );
}
