import { useState } from 'react';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';

/* ─── Data ─── */

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Talk to Yulia \u2014 free',
    desc: 'Tell her about your deal. She\u2019ll classify your business, calculate your SDE or EBITDA, identify add-backs, and give you a preliminary valuation range. No charge, no commitment.',
  },
  {
    num: '02',
    title: 'Choose your deliverables',
    desc: 'When you\u2019re ready for deeper work \u2014 a full valuation report, CIM, pitch deck, DD workflow \u2014 each deliverable has a clear, fixed price. Pay only for what you need.',
  },
  {
    num: '03',
    title: 'Invite your team',
    desc: 'Brokers, attorneys, CPAs, and other service providers join your deal room free. No per-seat fees. No subscriptions. They collaborate in real time, always.',
  },
];

const DELIVERABLES = [
  {
    name: 'Business Valuation',
    price: '$350',
    desc: 'Multi-methodology valuation report: comparable transactions, industry multiples, DCF. Benchmarked against real deals in your industry and geography.',
    includes: ['Comp analysis with sourced transactions', 'Industry multiple benchmarking', 'Discounted cash flow model', 'Sensitivity analysis'],
  },
  {
    name: 'Deal Screening',
    price: '$150',
    desc: 'Target identification and scoring against your acquisition thesis. Each target evaluated on 7 factors including financial fit, strategic alignment, and integration complexity.',
    includes: ['Target identification and filtering', '7-factor scoring model', 'Deep-dive recommendations', 'Market landscape summary'],
  },
  {
    name: 'Full CIM',
    price: '$700',
    desc: 'Confidential Information Memorandum \u2014 institutional quality. Investment thesis, financial analysis, market positioning, growth opportunities, and risk factors.',
    includes: ['Executive summary and investment thesis', 'Financial analysis and projections', 'Market and competitive positioning', 'Qualified buyer list with scoring'],
  },
  {
    name: 'Financial Model',
    price: '$275',
    desc: 'Deal-specific financial model with scenario analysis. SBA bankability, return modeling, working capital analysis, and sensitivity testing.',
    includes: ['Revenue and expense projections', 'Scenario analysis (base, upside, downside)', 'Working capital and cash flow modeling', 'Return analysis for buyers/investors'],
  },
  {
    name: 'LOI Draft',
    price: '$70',
    desc: 'Letter of intent drafted from deal terms. Purchase price, structure, contingencies, timeline, and key provisions \u2014 ready for legal review.',
    includes: ['Deal structure and purchase price', 'Key contingencies and timelines', 'Working capital provisions', 'Ready for attorney review'],
  },
];

const WALLETS = [
  {
    name: 'Try Yulia',
    price: '$350',
    desc: 'One valuation or one deliverable to see the quality firsthand.',
    power: '$350 purchasing power',
    bonus: null,
    popular: false,
  },
  {
    name: 'Run a Deal',
    price: '$999',
    desc: 'Enough for most complete journeys. The most popular choice.',
    power: '$1,099 purchasing power (+10%)',
    bonus: '+10% bonus',
    popular: true,
  },
  {
    name: 'Deal Pro',
    price: '$2,499',
    desc: 'For serial acquirers, active brokers, and multi-deal operators.',
    power: '$2,999 purchasing power (+20%)',
    bonus: '+20% bonus',
    popular: false,
  },
];

const FREE_ITEMS = [
  'Conversation with Yulia \u2014 unlimited',
  'Business classification and industry analysis',
  'SDE/EBITDA calculation with add-back identification',
  'Preliminary valuation range with methodology shown',
  'Deal roadmap and recommended next steps',
  'Service provider access \u2014 attorneys, CPAs, and brokers collaborate free, always',
];

const EXAMPLES = [
  { deal: '$850K landscaping (sell)', yulia: '$525', traditional: 'Most advisors decline' },
  { deal: '$3M HVAC company (sell)', yulia: '$2,400', traditional: '$90K\u2013$180K advisory' },
  { deal: '$6.8M dental group (buy, 2 targets)', yulia: '$3,200', traditional: '$120K+ advisory' },
  { deal: '$25M PE platform (buy, 6 add-ons)', yulia: '$12,000', traditional: '$500K+ retainer' },
];

const FAQS = [
  {
    q: 'Do I need to buy a whole journey?',
    a: 'No. You choose individual deliverables. Start free, and only pay when you\u2019re ready for the next piece of work. Stop anytime.',
  },
  {
    q: 'What if I don\u2019t use all my wallet funds?',
    a: 'They never expire. Use them on any journey, any deliverable, anytime.',
  },
  {
    q: 'Is there a subscription?',
    a: 'No. No monthly fees, no retainers. You pay for deliverables, not access.',
  },
  {
    q: 'How does service provider access work?',
    a: 'When a business owner or buyer invites their attorney, CPA, or broker into a deal, those professionals join free. They see the documents, collaborate in real time, and never pay a cent.',
  },
  {
    q: 'What\u2019s the difference between the free analysis and the paid valuation?',
    a: 'The free analysis gives you SDE/EBITDA, add-backs, and a preliminary range. The paid valuation is a full multi-methodology report with comparable transactions, industry multiples, DCF, and sensitivity analysis \u2014 the kind of report you can take to a buyer, investor, or your CPA.',
  },
];

/* ─── Page ─── */

export default function Pricing() {
  const [expandedDeliverable, setExpandedDeliverable] = useState<string | null>(null);

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-24 max-md:px-5 max-md:pt-12 max-md:pb-14 text-center">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold justify-center">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          Transparent Pricing
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-tight mb-10 m-0">
          If you could Google it, <em className="italic text-[#D4714E]">it should be free.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[560px] mx-auto leading-[1.6] mb-16 m-0">
          Your first conversation and financial analysis cost nothing. When you&apos;re ready for
          deeper work, every deliverable has a clear, fixed price. No retainers. No surprises.
        </p>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {HOW_IT_WORKS.map(s => (
            <Card key={s.num} hover={false} padding="px-8 py-10">
              <span className="font-sans text-[48px] font-black text-[#E8E4DC] leading-none">{s.num}</span>
              <h3 className="text-lg font-bold text-[#1A1A18] mt-4 mb-2 m-0">{s.title}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.6] m-0">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ DELIVERABLES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-3 m-0">
          Deliverables. <em className="italic text-[#D4714E]">Clear prices.</em>
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-10 m-0">
          Each piece of work has a fixed price. No hourly rates, no scope creep, no surprises.
        </p>
        <div className="space-y-4">
          {DELIVERABLES.map(d => (
            <Card key={d.name} hover={false} padding="px-8 py-8 max-md:px-5 max-md:py-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedDeliverable(expandedDeliverable === d.name ? null : d.name)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-base font-bold text-[#1A1A18] m-0">{d.name}</h3>
                    <span className="inline-block text-xs font-bold uppercase tracking-[.08em] px-2.5 py-[3px] rounded-full bg-[#FFF0EB] text-[#D4714E]">
                      {d.price}
                    </span>
                  </div>
                  <p className="text-sm text-[#7A766E] leading-[1.55] mt-2 m-0">{d.desc}</p>
                </div>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A766E" strokeWidth="2" strokeLinecap="round"
                  className={`shrink-0 ml-4 transition-transform ${expandedDeliverable === d.name ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              {expandedDeliverable === d.name && (
                <div className="mt-4 pt-4 border-t border-[#E0DCD4]">
                  <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold mb-3 m-0">Includes</p>
                  <ul className="space-y-2 list-none p-0 m-0">
                    {d.includes.map(item => (
                      <li key={item} className="flex gap-2.5 items-start text-sm text-[#4A4843] leading-[1.55]">
                        <span className="text-[#D4714E] shrink-0 mt-px">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ DEAL SIZE EXAMPLES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          What does it <em className="italic text-[#D4714E]">actually</em> cost?
        </h2>
        <div className="max-w-[800px]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-0 items-center">
            <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold pb-4 m-0">Your Deal</p>
            <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold pb-4 m-0 text-right">Yulia</p>
            <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold pb-4 m-0 text-right">Traditional</p>
            {EXAMPLES.map((e, i) => (
              <div key={i} className="contents">
                <p className={`text-[15px] text-[#1A1A18] py-4 m-0 ${i < EXAMPLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>{e.deal}</p>
                <p className={`text-[15px] font-bold text-[#D4714E] py-4 m-0 text-right ${i < EXAMPLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>{e.yulia}</p>
                <p className={`text-[15px] text-[#7A766E] line-through py-4 m-0 text-right ${i < EXAMPLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>{e.traditional}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WALLET SECTION ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-3 m-0">
          Add funds. Use them anywhere.
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-10 m-0">
          $1 = $1. Load your wallet and use it across any journey, any deliverable. Larger amounts include bonus credits.
        </p>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {WALLETS.map(w => (
            <Card key={w.name} padding="px-8 py-10" className={w.popular ? 'ring-2 ring-[#D4714E]' : ''}>
              {w.popular && (
                <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-[#D4714E] mb-3">Most Popular</span>
              )}
              <h3 className="text-lg font-bold text-[#1A1A18] mb-1 m-0">{w.name} &mdash; {w.price}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] mt-2 mb-2 m-0">{w.desc}</p>
              <p className="text-sm font-medium text-[#4A4843] m-0">{w.power}</p>
            </Card>
          ))}
        </div>
        <p className="text-[15px] text-[#7A766E] mt-6 m-0">
          Need custom volumes? <a href="/enterprise" className="text-[#D4714E] hover:underline">Talk to us about team pricing.</a>
        </p>
      </section>

      {/* ═══ WHAT'S ALWAYS FREE ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl p-16 max-md:p-7">
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0">
            What&apos;s always free.
          </h3>
          <ul className="space-y-3 list-none p-0 m-0">
            {FREE_ITEMS.map(item => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-[#4A4843]">
                <span className="w-6 h-6 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center text-xs font-bold shrink-0 mt-px">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Pricing questions.
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
            Start free. Pay only when you&apos;re ready.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Talk to Yulia &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
