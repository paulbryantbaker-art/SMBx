import PublicLayout from '../../components/public/PublicLayout';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Tell Yulia about your deal',
    desc: 'You talk. She listens. Describe your business, your goals, your timeline \u2014 in your own words. No forms, no uploads, no 47-field intake questionnaires.',
  },
  {
    num: '02',
    title: 'Yulia classifies and analyzes',
    desc: 'Industry classification across 80+ verticals. Financial modeling with add-back identification. Comparable transactions sourced from real deal data. Market conditions assessed in real time.',
  },
  {
    num: '03',
    title: 'You get a preliminary range \u2014 free',
    desc: 'SDE or EBITDA calculated. Add-backs identified. Preliminary valuation range with the methodology shown. This is where most owners realize they\u2019ve been undervaluing their business.',
  },
  {
    num: '04',
    title: 'Choose your deliverables',
    desc: 'Full valuation report. CIM. Pitch deck. DD checklists. Term sheet analysis. Each deliverable has a fixed price. Pay only for what you need, when you need it.',
  },
  {
    num: '05',
    title: 'Invite your team',
    desc: 'Broker, attorney, CPA, investor \u2014 everyone joins the deal room. Service providers always join free. Everyone sees the same documents, the same numbers, the same timeline.',
  },
  {
    num: '06',
    title: 'Close with confidence',
    desc: 'Every analysis, every document, every decision point \u2014 organized in one place. From first conversation to closing day, nothing falls through the cracks.',
  },
];

const INTELLIGENCE = [
  {
    title: '80+ industry verticals',
    desc: 'Current multiples, market trends, and buyer activity for every major business category \u2014 from HVAC to healthcare, SaaS to restaurants.',
  },
  {
    title: 'Real transaction data',
    desc: 'Comparable sales benchmarked by industry, geography, deal size, and structure. Not estimates \u2014 sourced transactions.',
  },
  {
    title: 'Live market conditions',
    desc: 'Interest rates, SBA lending environment, PE activity, regulatory changes \u2014 factors that affect your deal today, not last quarter.',
  },
  {
    title: 'Regional intelligence',
    desc: 'Local market dynamics, cost of living adjustments, state-specific regulations. Because a $3M HVAC company in Dallas is worth something different than one in Portland.',
  },
];

const METHODOLOGY = [
  { title: 'Industry classification', desc: 'Categorized across 80+ verticals with sub-sector specificity' },
  { title: 'Financial normalization', desc: 'SDE/EBITDA with systematic add-back identification (47 categories)' },
  { title: 'Comparable transactions', desc: 'Sourced from real deal databases, filtered by industry, geography, and size' },
  { title: 'Multiple analysis', desc: 'Industry-specific multiples benchmarked against current market conditions' },
  { title: 'Discounted cash flow', desc: 'Forward-looking valuation with risk-adjusted discount rates' },
  { title: 'Market context', desc: 'Interest rates, buyer activity, regulatory environment, and regional factors' },
  { title: 'Scenario modeling', desc: 'Base, upside, and downside scenarios with sensitivity analysis' },
];

const COLLABORATION = [
  { bold: 'Business owners', rest: ' see their numbers, their documents, their deal progress' },
  { bold: 'Brokers and advisors', rest: ' get instant work product \u2014 CIMs, valuations, buyer lists' },
  { bold: 'Attorneys, CPAs, and service providers', rest: ' join free and collaborate in real time' },
];

const STORIES = [
  {
    deal: '$850K Landscaping \u2014 Portland, OR',
    desc: 'Solo owner, first-time seller. Never heard of SDE. Yulia found $31K in add-backs he didn\u2019t know counted. Full valuation, CIM, and 3 qualified buyers in one session. A deal most advisors wouldn\u2019t touch.',
  },
  {
    deal: '$4.5M Commercial Cleaning \u2014 Atlanta, GA',
    desc: 'Owner-operated, 15 years. Yulia calculated $780K adjusted EBITDA, identified 3 PE firms actively consolidating in the region. Full CIM in under an hour. Closed at 12% above initial offers.',
  },
  {
    deal: '$6.8M Dental Group \u2014 Chicago, IL',
    desc: 'PE add-on. Screened 140+ practices, identified 12 strategic fits. Full valuation and DD workflow on 4 finalists. Two acquisitions closed in the same quarter.',
  },
  {
    deal: '$25M PE Roll-Up \u2014 Healthcare Services',
    desc: 'PE firm building a platform. Yulia handled analytical work product across 6 add-on acquisitions in 14 months. Deal team of 3 operated like 12. Integration plans delivered within 48 hours of each closing.',
  },
];

/* ─── Page ─── */

export default function HowItWorks() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-14">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          The Process
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-tight max-w-[18ch] mb-10 m-0">
          One conversation. Complete <em className="italic text-[#D4714E]">deal intelligence.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.6] mb-16 m-0">
          No forms. No uploads. No 47-field intake questionnaires. Tell Yulia about your deal
          and she turns the conversation into institutional-quality work product.
        </p>
      </section>

      {/* ═══ 6-STEP PROCESS ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <div className="space-y-6">
          {PROCESS_STEPS.map(s => (
            <Card key={s.num} hover={false} padding="px-10 py-10 max-md:px-6 max-md:py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <span className="font-sans text-[56px] font-black text-[#E8E4DC] leading-none shrink-0">{s.num}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1A1A18] mb-2 m-0">{s.title}</h3>
                  <p className="text-sm text-[#7A766E] leading-[1.6] m-0 max-w-[600px]">{s.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ APPLIED INTELLIGENCE ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-3 m-0">
          What Yulia <em className="italic text-[#D4714E]">knows.</em>
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-10 m-0">
          Intelligence, not guesses. Methodology, not templates.
        </p>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {INTELLIGENCE.map(item => (
            <Card key={item.title} hover={false} padding="px-8 py-7">
              <h4 className="text-[15px] font-bold text-[#1A1A18] mb-1.5 m-0">{item.title}</h4>
              <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ METHODOLOGY ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0EB] rounded-4xl p-12 max-md:p-7" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05), inset 0 0 0 1px rgba(212,113,78,.06)' }}>
          <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">The methodology</p>
          <h3 className="font-sans text-[clamp(24px,2.5vw,32px)] font-black tracking-[-0.02em] mb-8 m-0">
            Seven layers of analysis. Every deal.
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-md:grid-cols-1">
            {METHODOLOGY.map((m, i) => (
              <div key={m.title} className="flex gap-3 items-start">
                <span className="font-sans text-sm font-bold text-[#D4714E] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-[15px] font-semibold text-[#1A1A18] mb-0.5 m-0">{m.title}</p>
                  <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COLLABORATION ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl py-12 px-14 max-md:py-8 max-md:px-6">
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-3 m-0">
            Everyone on the deal. <em className="italic text-[#D4714E]">One place.</em>
          </h3>
          <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-8 m-0">
            Deals involve more than one person. Yulia keeps everyone aligned.
          </p>
          <div className="flex flex-col gap-4">
            {COLLABORATION.map(c => (
              <div key={c.bold} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center text-xs font-bold shrink-0 mt-px">
                  &#10003;
                </span>
                <span className="text-[15px] leading-[1.5]">
                  <strong>{c.bold}</strong>{c.rest}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEAL STORIES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for <em className="italic text-[#D4714E]">every</em> deal size.
        </h2>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {STORIES.map(s => (
            <Card key={s.deal} padding="px-8 py-10">
              <p className="text-[11px] uppercase tracking-[.12em] text-[#D4714E] font-semibold mb-3 m-0">{s.deal}</p>
              <p className="text-sm text-[#7A766E] leading-[1.6] m-0">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          See for yourself.
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/how-it-works" />
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#D4714E] to-[#BE6342] rounded-4xl px-16 py-24 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Every deal deserves this level of intelligence.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#D4714E] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &rarr;
          </button>
        </div>
      </section>

      {/* ═══ NUDGE ═══ */}
      <div className="text-center pb-10 max-md:pb-6">
        <p className="journey-nudge text-[22px] text-[#D4714E] m-0 max-md:text-lg">
          every deal starts with a conversation
        </p>
      </div>
    </PublicLayout>
  );
}
