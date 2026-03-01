import PublicLayout from '../../components/public/PublicLayout';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const FEATURES = [
  {
    title: 'Multi-Deal Pipeline',
    desc: 'Screen, value, and manage diligence across dozens of targets simultaneously. Every deal scored, every document organized, every deadline tracked.',
    points: [
      'Pipeline-wide target scoring and prioritization',
      'Parallel DD workflows across multiple targets',
      'Portfolio analytics and roll-up modeling',
      'Consistent methodology across every deal',
    ],
  },
  {
    title: 'Team Collaboration',
    desc: 'Every team member gets their own access. Work product stays consistent. Client-facing materials match your standards. One deal room for every party.',
    points: [
      'Role-based access for analysts, partners, and clients',
      'Shared deal rooms with real-time collaboration',
      'Service providers join free \u2014 no per-seat fees',
      'Consistent deliverable quality across the team',
    ],
  },
  {
    title: 'Market Intelligence Engine',
    desc: 'Real-time market data across 80+ verticals. Comparable transactions, industry multiples, buyer activity, and regulatory changes \u2014 updated continuously.',
    points: [
      '80+ industry verticals with current multiples',
      'Comparable transaction database',
      'Regional market dynamics and adjustments',
      'Live lending environment and PE activity data',
    ],
  },
  {
    title: 'Deliverable Engine',
    desc: '91+ document types produced from conversation. Valuations, CIMs, pitch decks, DD checklists, financial models, term sheet analysis \u2014 institutional quality in minutes.',
    points: [
      'Full valuation reports in 5 minutes',
      'CIMs produced in under an hour',
      'Financial models with scenario analysis',
      'Client-ready formatting and branding',
    ],
  },
];

const DEAL_ROOM_FEATURES = [
  { title: '7 participant roles', desc: 'Buyer, seller, broker, attorney, CPA, lender, advisor \u2014 every seat at the table with role-based permissions.' },
  { title: 'Chinese Wall controls', desc: 'Buyers see buyer materials. Sellers see seller materials. Brokers see both. Automatically enforced.' },
  { title: 'Document lifecycle', desc: 'Draft, review, approve, execute. Every document versioned, every change tracked, every signature recorded.' },
  { title: 'Deal velocity dashboard', desc: 'Real-time view of every task, deadline, and deliverable across the deal. Nothing falls through the cracks.' },
];

const USE_CASES = [
  {
    title: 'Brokers & Intermediaries',
    stat: '3\u00D7',
    statDesc: 'more deals managed with the same team',
    desc: 'Produce CIMs in under an hour. Screen and score buyer lists in minutes. Manage 3\u00D7 the deal flow \u2014 from Main Street to mid-market \u2014 without hiring analysts.',
  },
  {
    title: 'PE Firms & Investment Banks',
    stat: '47 min',
    statDesc: 'average CIM production time',
    desc: 'Screen hundreds of targets against your thesis overnight. Full valuations on any target in minutes. Run competitive processes and integration plans at institutional speed.',
  },
  {
    title: 'Attorneys & CPAs',
    stat: 'Free',
    statDesc: 'for service providers, always',
    desc: 'Join any client\u2019s deal room at no cost. Review financials instantly. Flag risks before they become problems. Collaborate on documents with every party in real time.',
  },
];

const ROI_STATS = [
  { num: '3\u00D7', desc: 'more deals managed with the same team' },
  { num: '47 min', desc: 'average time to produce a complete CIM' },
  { num: '$150K+', desc: 'additional annual revenue per broker from increased throughput' },
];

/* ─── Page ─── */

export default function Enterprise() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-14">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          For Teams
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.05] tracking-tight max-w-[16ch] mb-10 m-0">
          Built to make great advisors <em className="italic text-[#D4714E]">unstoppable.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          Whether you&apos;re managing 15 active listings or running 6 platform builds in parallel &mdash;
          every deal needs valuations, CIMs, buyer outreach, and DD management. Yulia produces
          institutional-quality work product in minutes, so your team focuses on what humans do best:
          relationships, negotiation, and judgment.
        </p>
      </section>

      {/* ═══ ENTERPRISE FEATURES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {FEATURES.map(f => (
            <Card key={f.title} padding="px-8 py-10">
              <h3 className="text-lg font-bold text-[#1A1A18] mb-2 m-0">{f.title}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] mb-5 m-0">{f.desc}</p>
              <ul className="space-y-2 list-none p-0 m-0">
                {f.points.map(p => (
                  <li key={p} className="flex gap-2.5 items-start text-sm text-[#4A4843] leading-[1.55]">
                    <span className="text-[#D4714E] shrink-0 mt-px">&#10003;</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for <em className="italic text-[#D4714E]">deal professionals.</em>
        </h2>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {USE_CASES.map(u => (
            <Card key={u.title} padding="px-8 py-10">
              <p className="font-sans text-[36px] font-black text-[#D4714E] leading-none mb-1 m-0">{u.stat}</p>
              <p className="text-xs text-[#7A766E] mb-5 m-0">{u.statDesc}</p>
              <h3 className="text-base font-bold text-[#1A1A18] mb-2 m-0">{u.title}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{u.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ ROI ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          Yulia pays for herself on <em className="italic text-[#D4714E]">deal one.</em>
        </h2>
        <div className="grid grid-cols-3 max-md:grid-cols-1 max-md:gap-8">
          {ROI_STATS.map((s, i) => (
            <div
              key={s.num}
              className={`px-7 max-md:px-0 ${
                i < ROI_STATS.length - 1 ? 'border-r border-[#E0DCD4] max-md:border-r-0' : ''
              } ${i === 0 ? 'pl-0' : ''}`}
            >
              <p className="font-sans text-[42px] font-black leading-none m-0">{s.num}</p>
              <p className="text-[15px] text-[#7A766E] mt-2 m-0 leading-[1.5]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ YOUR EXPERTISE + YULIA'S INTELLIGENCE ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl py-12 px-14 max-md:py-8 max-md:px-6">
          <h3 className="font-sans text-[28px] font-black tracking-[-0.02em] leading-[1.15] mb-4 m-0">
            Your expertise is irreplaceable. <em className="italic text-[#D4714E]">Now it scales.</em>
          </h3>
          <p className="text-[15px] text-[#7A766E] leading-[1.6] max-w-[700px] mb-6 m-0">
            Every deal professional hits the same wall &mdash; each engagement requires 40&ndash;60
            hours of analytical work product. Valuations, CIMs, buyer research, DD management.
            Whether you&apos;re a broker managing 12 listings or a PE firm running 6 platform builds,
            the analytical workload is the bottleneck.
          </p>
          <p className="text-[15px] text-[#7A766E] leading-[1.6] max-w-[700px] m-0">
            Yulia doesn&apos;t replace your judgment &mdash; she handles the analytical heavy lift so you
            can spend more time where it matters: client relationships, negotiations, and closing.
            Brokers using Yulia report managing 3&times; the deal flow with the same team, adding
            $150K+ in annual revenue from increased throughput alone.
          </p>
        </div>
      </section>

      {/* ═══ DEAL ROOM ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">Deal room</p>
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-3 m-0">
          One room. Every party. <em className="italic text-[#D4714E]">Total control.</em>
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-8 m-0 max-w-[600px]">
          Every deal has multiple parties who need different access to different information.
          The deal room keeps everyone organized, everyone informed, and everyone in their lane.
        </p>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {DEAL_ROOM_FEATURES.map(f => (
            <Card key={f.title} padding="px-8 py-8">
              <h3 className="text-base font-bold text-[#1A1A18] mb-2 m-0">{f.title}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ INTELLIGENCE STACK ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-3 m-0">
          What powers it.
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-8 m-0 max-w-[600px]">
          Same sovereign data sources that power institutional research. Seven layers of intelligence
          calibrated to every deal.
        </p>
        <div className="flex flex-wrap gap-3">
          {['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'IRS Statistics of Income'].map(s => (
            <span key={s} className="text-[13px] text-[#7A766E] bg-white border border-[#E0DCD4] rounded-full px-4 py-2">{s}</span>
          ))}
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          See what Yulia can do for your practice.
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/enterprise" />
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#D4714E] to-[#BE6342] rounded-4xl px-16 py-24 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            More deals. Better work product. Same team.
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
          your next deal is waiting
        </p>
      </div>
    </PublicLayout>
  );
}
