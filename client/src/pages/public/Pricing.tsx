import { useState } from 'react';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';

/* ─── Data ─── */

type Journey = 'sell' | 'buy' | 'raise' | 'integrate';

interface Stage {
  name: string;
  desc: string;
  price: string;
  free: boolean;
}

const JOURNEY_PACKAGES: Record<Journey, { stages: Stage[]; total: string; totalLabel: string }> = {
  sell: {
    total: 'From $1,799',
    totalLabel: 'Complete Sell Journey',
    stages: [
      { name: 'S0\u2013S1: Financial Analysis', desc: 'Business classification, SDE/EBITDA, add-backs, preliminary range, deal roadmap', price: 'Free', free: true },
      { name: 'S2: Valuation Report', desc: 'Multi-methodology valuation, comps, industry multiples, DCF', price: '$199', free: false },
      { name: 'S3: CIM + Buyer Matching', desc: 'Confidential Information Memorandum, qualified buyer list, scoring', price: '$299', free: false },
      { name: 'S4: Deal Management', desc: 'LOI comparison, DD management, working capital analysis', price: '$299', free: false },
      { name: 'S5: Closing Support', desc: 'Deal structuring, closing coordination, document management', price: '$299', free: false },
    ],
  },
  buy: {
    total: 'From $1,399',
    totalLabel: 'Complete Buy Journey',
    stages: [
      { name: 'B0\u2013B1: Thesis + Screening', desc: 'Acquisition criteria, target identification, scoring', price: 'Free', free: true },
      { name: 'B2: Target Valuation', desc: 'Full valuation on any target \u2014 comps, multiples, DCF', price: '$199', free: false },
      { name: 'B3: Due Diligence', desc: 'Structured DD workflow, risk identification, document tracking', price: '$299', free: false },
      { name: 'B4: Deal Structuring', desc: 'Offer modeling, scenario analysis, LOI drafting', price: '$299', free: false },
      { name: 'B5: Closing Support', desc: 'Closing coordination, document management', price: '$299', free: false },
    ],
  },
  raise: {
    total: 'From $749',
    totalLabel: 'Complete Raise Journey',
    stages: [
      { name: 'R0\u2013R1: Strategy + Financials', desc: 'Raise strategy, financial package, gap analysis', price: 'Free', free: true },
      { name: 'R2: Valuation + Deck', desc: 'Pre-money valuation, 12-slide institutional pitch deck', price: '$199', free: false },
      { name: 'R3: Investor Targeting', desc: 'Investor profiling, prioritization, outreach strategy', price: '$149', free: false },
      { name: 'R4: Term Negotiation', desc: 'Term sheet analysis, side-by-side comparison', price: '$199', free: false },
    ],
  },
  integrate: {
    total: 'From $899',
    totalLabel: 'Complete Integration Journey',
    stages: [
      { name: 'I0: Day Zero', desc: 'Day Zero checklist, critical access transfer, notifications', price: 'Free', free: true },
      { name: 'I1: Stabilize (Days 1\u201330)', desc: 'Employee comms, customer retention, vendor strategy', price: '$299', free: false },
      { name: 'I2: Assess (Days 31\u201360)', desc: 'SWOT, benchmarking, synergy identification', price: '$299', free: false },
      { name: 'I3: Optimize (Days 61\u2013100)', desc: 'Integration roadmap, KPIs, milestones', price: '$299', free: false },
    ],
  },
};

const TABS: { key: Journey; label: string }[] = [
  { key: 'sell', label: 'Sell' },
  { key: 'buy', label: 'Buy' },
  { key: 'raise', label: 'Raise' },
  { key: 'integrate', label: 'Integrate' },
];

const EXAMPLES = [
  { deal: '$400K landscaping business (sell)', yulia: '~$1,800', traditional: '$20K\u2013$40K broker commission' },
  { deal: '$3M HVAC company (sell)', yulia: '~$4,500', traditional: '$150K\u2013$300K advisory + success fee' },
  { deal: '$25M PE platform (buy, 3 targets)', yulia: '~$12,000', traditional: '$500K+ advisory retainer' },
];

const WALLETS = [
  {
    name: 'Try Yulia',
    price: '$199',
    desc: 'Great for a single valuation or getting started',
    power: '$199 purchasing power',
    bonus: null,
    popular: false,
  },
  {
    name: 'Run a Deal',
    price: '$999',
    desc: 'Enough for most complete journeys',
    power: '$1,099 purchasing power (+10% bonus)',
    bonus: '+10% bonus',
    popular: true,
  },
  {
    name: 'Deal Pro',
    price: '$2,499',
    desc: 'For serial acquirers and active brokers',
    power: '$2,999 purchasing power (+20% bonus)',
    bonus: '+20% bonus',
    popular: false,
  },
];

const FREE_ITEMS = [
  'Conversation with Yulia \u2014 unlimited',
  'Business classification and industry analysis',
  'SDE/EBITDA calculation with add-back identification',
  'Preliminary valuation range',
  'Deal roadmap and next steps',
  'Service provider access (attorneys, CPAs, real estate agents collaborate free \u2014 always)',
];

const FAQS = [
  {
    q: 'Do I need to buy a whole journey?',
    a: 'No. You pay stage by stage. Start free, and only pay when you\u2019re ready for the next deliverable. Stop anytime.',
  },
  {
    q: 'What if I don\u2019t use all my wallet funds?',
    a: 'They never expire. Use them on any journey, any stage, anytime.',
  },
  {
    q: 'Is there a subscription?',
    a: 'No. No monthly fees, no retainers. You pay for deliverables, not access.',
  },
  {
    q: 'How does service provider access work?',
    a: 'When a business owner or buyer invites their attorney, CPA, or real estate agent into a deal, those professionals join free. They see the documents, collaborate in real time, and never pay a cent.',
  },
];

/* ─── Page ─── */

export default function Pricing() {
  const [tab, setTab] = useState<Journey>('sell');
  const pkg = JOURNEY_PACKAGES[tab];

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-8 pb-20 max-md:px-5 max-md:pt-4 max-md:pb-12 text-center">
        <h1 className="animate-fadeInUp font-sans text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-tight mb-5 m-0">
          Know what you&apos;ll spend <em className="italic text-[#D4714E]">before you start.</em>
        </h1>
        <p className="animate-fadeInUp stagger-1 text-[19px] text-[#7A766E] max-w-[560px] mx-auto leading-[1.6] m-0">
          Every journey has a clear price. No retainers. No surprises.
          Your first conversation and financial analysis are always free.
        </p>
      </section>

      {/* ═══ JOURNEY PACKAGES ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-[#D4714E] text-white border-transparent'
                  : 'bg-white text-[#4A4843] hover:border-[#1A1A18]'
              }`}
              style={{ border: tab === t.key ? '1px solid transparent' : '1px solid #E0DCD4' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stage table */}
        <div className="max-w-[800px]">
          {pkg.stages.map((s, i) => (
            <div
              key={s.name}
              className={`grid grid-cols-[1fr_auto] gap-8 py-5 items-start ${
                i < pkg.stages.length - 1 ? 'border-b border-[#E0DCD4]' : ''
              }`}
            >
              <div>
                <p className="text-[15px] font-semibold text-[#1A1A18] mb-1 m-0">{s.name}</p>
                <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{s.desc}</p>
              </div>
              <span className={`inline-block text-xs font-bold uppercase tracking-[.08em] px-2.5 py-[3px] rounded-full whitespace-nowrap ${
                s.free
                  ? 'bg-[#E8F5E9] text-[#2E7D32]'
                  : 'bg-[#FFF0EB] text-[#D4714E]'
              }`}>
                {s.price}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto] gap-8 pt-6 border-t-2 border-[#1A1A18]">
            <span className="text-[15px] font-bold text-[#1A1A18]">{pkg.totalLabel}</span>
            <span className="text-[15px] font-bold text-[#D4714E]">{pkg.total}</span>
          </div>
        </div>
      </section>

      {/* ═══ DEAL SIZE EXAMPLES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          What does it <em className="italic text-[#D4714E]">actually</em> cost?
        </h2>
        <div className="max-w-[800px]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-0 items-center">
            {/* Header */}
            <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold pb-4 m-0">Your Deal</p>
            <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold pb-4 m-0 text-right">Yulia</p>
            <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold pb-4 m-0 text-right">Traditional</p>
            {EXAMPLES.map((e, i) => (
              <>
                <p key={`d-${i}`} className={`text-[15px] text-[#1A1A18] py-4 m-0 ${i < EXAMPLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>{e.deal}</p>
                <p key={`y-${i}`} className={`text-[15px] font-bold text-[#D4714E] py-4 m-0 text-right ${i < EXAMPLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>{e.yulia}</p>
                <p key={`t-${i}`} className={`text-[15px] text-[#7A766E] line-through py-4 m-0 text-right ${i < EXAMPLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>{e.traditional}</p>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WALLET SECTION ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-3 m-0">
          Add funds. Use them anywhere.
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-10 m-0">
          $1 = $1. Load your wallet and use it across any journey, any stage. Larger blocks include bonus credits.
        </p>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {WALLETS.map(w => (
            <Card key={w.name} padding="px-8 py-10" className={w.popular ? 'ring-2 ring-[#D4714E]' : ''}>
              {w.popular && (
                <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-[#D4714E] mb-3">Popular</span>
              )}
              <h3 className="text-lg font-bold text-[#1A1A18] mb-1 m-0">{w.name} &mdash; {w.price}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] mt-2 mb-2 m-0">{w.desc}</p>
              <p className="text-sm font-medium text-[#4A4843] m-0">{w.power}</p>
            </Card>
          ))}
        </div>
        <p className="text-[15px] text-[#7A766E] mt-6 m-0">
          Need more? Contact us for custom volumes.
        </p>
      </section>

      {/* ═══ WHAT'S ALWAYS FREE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
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
      <section className="max-w-[800px] mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
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
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#D4714E] to-[#BE6342] rounded-4xl px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
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
