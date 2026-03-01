import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Day 0: Secure the business',
    price: 'Free',
    free: true,
    desc: 'Change passwords. Lock accounts. Notify key people. Transfer critical access. Yulia\u2019s Day Zero checklist makes sure nothing slips through the cracks.',
    detail: 'You\u2019d be surprised how many acquisitions stumble because someone forgot to change the bank login on day one.',
  },
  {
    num: 2,
    title: 'Days 1\u201330: Stabilize',
    price: '$275',
    free: false,
    desc: 'Employee communication plan. Customer retention strategy. Vendor renegotiation. Quick wins that build momentum and trust with your new team.',
    detail: 'The first 30 days set the tone. Yulia helps you communicate clearly, retain key people, and build credibility before making changes.',
  },
  {
    num: 3,
    title: 'Days 31\u201360: Assess',
    price: '$275',
    free: false,
    desc: 'SWOT analysis. Operational benchmarking against industry standards. Where are the cost savings? Where are the revenue opportunities? What did due diligence miss?',
  },
  {
    num: 4,
    title: 'Days 61\u2013100: Optimize',
    price: '$275',
    free: false,
    desc: 'Full integration roadmap with KPIs, milestones, and accountability. The plan that turns your acquisition from a transaction into a compounding asset.',
  },
];

const DEAL_EXAMPLES = [
  {
    deal: 'First Acquisition \u2014 $1.4M HVAC',
    desc: 'Solo buyer, first deal. Day Zero checklist caught 3 critical items the closing attorney missed. Employee retention plan delivered before day one.',
    cost: '$825',
    outcome: 'Zero key-person departures in 90 days',
  },
  {
    deal: 'PE Roll-Up \u2014 $65M Dental Group',
    desc: 'Platform integration of 4 practices acquired in 8 months. Yulia produced integration playbooks for each tuck-in, mapped operational overlaps, and surfaced synergies across all locations.',
    cost: '$4,400',
    outcome: '$1.2M annual synergies identified',
  },
  {
    deal: 'Strategic Acquisition \u2014 $340M Healthcare Platform',
    desc: 'PE-backed operations, 22 locations. 100-day value creation plan delivered to the board 48 hours after closing. Integration milestones tracked across all locations.',
    cost: '$12,000',
    outcome: 'Board-ready 100-day plan in 48 hours',
  },
];

const INSIGHT = {
  title: 'The 100-day window',
  body: '70\u201380% of acquisition value is either created or destroyed in the first 100 days. Most buyers plan the acquisition meticulously and then wing the integration. The businesses that compound are the ones where the integration plan was ready before the wire hit.',
};

const TEAM_BENEFITS = [
  { bold: 'Day Zero checklist', rest: ' \u2014 nothing critical slips through the cracks' },
  { bold: 'Employee communication templates', rest: ' \u2014 say the right things on day one' },
  { bold: 'Synergy identification', rest: ' \u2014 cost savings and revenue opportunities surfaced in days, not months' },
  { bold: 'Board-ready 100-day plan', rest: ' \u2014 KPIs, milestones, and accountability built in' },
];

const FAQS = [
  {
    q: 'When should I start integration planning?',
    a: 'Before you close. The best acquirers have a Day Zero plan ready before the wire hits. Yulia can start building yours the day you sign the LOI.',
  },
  {
    q: 'What if I already closed?',
    a: 'Start now. Whether you\u2019re on day 1 or day 60, Yulia assesses where you are and builds a plan from there. The sooner you start, the more value you protect.',
  },
  {
    q: 'Do I need a big team for this?',
    a: 'No. Solo operators use Yulia to manage their own integration. Larger teams use her to coordinate across departments. The playbooks and checklists work at any scale.',
  },
  {
    q: 'What industries does this cover?',
    a: 'All of them. Integration principles are universal \u2014 secure, stabilize, assess, optimize. Yulia adapts the specifics to your industry, deal size, and operational complexity.',
  },
];

/* ─── Page ─── */

export default function Integrate() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-14">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          Post-Acquisition
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.05] tracking-tight max-w-[16ch] mb-10 m-0">
          You closed the deal. Now <em className="italic text-[#D4714E]">protect the value.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-16 m-0">
          From your first day as owner to your 100th. Yulia builds your Day Zero checklist,
          employee communication plan, synergy analysis, and full integration roadmap &mdash;
          with every professional you need already connected. One platform. Full lifecycle.
        </p>
        <div className="animate-fadeInUp stagger-3 flex flex-col md:flex-row gap-3 max-md:w-full">
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Plan your first 100 days &rarr;</Button>
          <Button variant="secondary" href="/how-it-works">See how it works</Button>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          Your first 100 days
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From closing day to <em className="italic text-[#D4714E]">compounding asset.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Complete integration journey: <strong className="text-[#1A1A18]">from $825</strong> &middot;
            every deliverable priced individually
          </p>
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start your plan &mdash; free &rarr;</Button>
        </div>
      </section>

      {/* ═══ DEAL EXAMPLES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Real integrations. <em className="italic text-[#D4714E]">Real outcomes.</em>
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

      {/* ═══ TRANSACTION ECOSYSTEM ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">Transaction ecosystem</p>
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-3 m-0">
          One room. Every seat at <em className="italic text-[#D4714E]">the table.</em>
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-8 m-0 max-w-[600px]">
          Every deal becomes a workspace. Invite your broker, attorney, CPA, and lender &mdash;
          each sees exactly what they need. Documents organized, version-controlled, and tracked.
          No more email chains. No more &ldquo;which version is current?&rdquo;
        </p>
        <div className="flex flex-wrap gap-3 mb-8">
          {['Buyer', 'Seller', 'Broker', 'Attorney', 'CPA', 'Lender', 'Advisor'].map(r => (
            <span key={r} className="text-[13px] text-[#7A766E] bg-white border border-[#E0DCD4] rounded-full px-4 py-2">{r}</span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
          {[
            { phase: 'Close', desc: 'Day Zero checklist, access transfers, critical notifications' },
            { phase: 'Stabilize', desc: 'Employee comms, customer retention, vendor renegotiation' },
            { phase: 'Assess', desc: 'SWOT, benchmarking, synergy identification, gap analysis' },
            { phase: 'Optimize', desc: 'Integration roadmap, KPIs, milestones, accountability' },
          ].map(p => (
            <div key={p.phase} className="bg-white border border-[#E0DCD4] rounded-2xl px-5 py-4">
              <p className="font-sans text-sm font-bold text-[#D4714E] mb-1 m-0">{p.phase}</p>
              <p className="text-xs text-[#7A766E] leading-[1.5] m-0">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TEAM CALLOUT ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl py-12 px-14 grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:py-8 max-md:px-6 max-md:gap-8">
          <div>
            <h3 className="font-sans text-[28px] font-black tracking-[-0.02em] leading-[1.15] mb-4 m-0">
              Have a <em className="italic text-[#D4714E]">team?</em> Yulia accelerates them.
            </h3>
            <p className="text-[15px] text-[#7A766E] leading-[1.6] m-0">
              Whether you have a full ops team or you&apos;re doing this solo, Yulia produces the
              playbooks, checklists, and analysis your team needs to execute &mdash; faster and
              with fewer blind spots.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {TEAM_BENEFITS.map(b => (
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
          Ready to plan your first 100 days?
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/integrate" />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Questions new owners ask.
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
            Your first 100 days, done right.
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
          the deal is done &mdash; now the real work begins
        </p>
      </div>
    </PublicLayout>
  );
}
