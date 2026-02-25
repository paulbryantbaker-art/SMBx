import PublicLayout from '../../components/public/PublicLayout';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const USE_CASES = [
  {
    title: 'Brokers & Intermediaries',
    points: [
      'Produce CIMs in an hour, not three weeks',
      'Screen and score buyer lists in minutes',
      'Manage 3\u00D7 the deal flow with the same team',
      'Every deliverable is institutional quality \u2014 your brand, Yulia\u2019s speed',
    ],
    result: 'A broker producing 2 more CIMs per month adds $150K+ in annual revenue.',
  },
  {
    title: 'Attorneys & CPAs',
    points: [
      'Review deal financials instantly',
      'Flag risks and issues before they become problems',
      'Collaborate on documents in real time with every party',
      'Join any client\u2019s deal room free \u2014 no seat fees, no subscriptions',
    ],
    result: 'Our M&A practice handles twice the deal volume with the same team.',
  },
  {
    title: 'PE Firms & Search Funds',
    points: [
      'Screen hundreds of targets against your thesis overnight',
      'Full valuations on any target in minutes',
      'Structured DD workflows across your entire portfolio',
      'Integration plans delivered within 48 hours of closing',
    ],
    result: 'Six platform acquisitions in 14 months. Yulia was on every deal.',
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
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <div className="flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          For Professionals
        </div>
        <h1 className="font-serif text-[clamp(44px,6vw,76px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[14ch] mb-6 m-0">
          Your expertise. Yulia&apos;s <em className="italic text-[#DA7756]">horsepower.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          You have 15 active listings. Each needs a valuation, CIM, buyer outreach, DD management.
          Your associates are drowning. Yulia produces institutional-quality work product in minutes
          &mdash; so your team focuses on what humans do best.
        </p>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] py-12 px-14 max-md:py-8 max-md:px-6">
          <h3 className="font-serif text-[28px] font-black tracking-[-0.02em] leading-[1.15] mb-4 m-0">
            The math doesn&apos;t work.
          </h3>
          <p className="text-[15px] text-[#7A766E] leading-[1.6] max-w-[700px] m-0">
            A typical business broker manages 8&ndash;12 active listings. Each requires 40&ndash;60
            hours of analytical work &mdash; valuations, CIMs, buyer research, DD management.
            That&apos;s 500+ hours of work product per year, per broker. You&apos;re either hiring
            analysts you can&apos;t afford, or your deal quality suffers.
          </p>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {USE_CASES.map(u => (
            <Card key={u.title} padding="px-8 py-10">
              <h3 className="text-lg font-bold text-[#1A1A18] mb-4 m-0">{u.title}</h3>
              <ul className="space-y-2 list-none p-0 m-0 mb-6">
                {u.points.map(p => (
                  <li key={p} className="flex gap-2.5 items-start text-sm text-[#7A766E] leading-[1.55]">
                    <span className="text-[#DA7756] shrink-0 mt-px">&#10003;</span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="py-3 px-4 bg-[#F3F0EA] rounded-[10px]">
                <p className="text-[13px] text-[#4A4843] italic leading-[1.45] m-0">&ldquo;{u.result}&rdquo;</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ ROI ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          Yulia pays for herself on <em className="italic text-[#DA7756]">deal one.</em>
        </h2>
        <div className="grid grid-cols-3 max-md:grid-cols-1 max-md:gap-8">
          {ROI_STATS.map((s, i) => (
            <div
              key={s.num}
              className={`px-7 max-md:px-0 ${
                i < ROI_STATS.length - 1 ? 'border-r border-[#E0DCD4] max-md:border-r-0' : ''
              } ${i === 0 ? 'pl-0' : ''}`}
            >
              <p className="font-serif text-[42px] font-black leading-none m-0">{s.num}</p>
              <p className="text-[15px] text-[#7A766E] mt-2 m-0 leading-[1.5]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS FOR TEAMS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-3 m-0">
          Your team. Yulia&apos;s leverage.
        </h3>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] max-w-[700px] m-0">
          Every team member gets their own access. Work product stays consistent. Client-facing
          materials match your brand. Yulia handles the analytical heavy lifting &mdash; your team
          handles relationships, negotiation, and closing.
        </p>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          See what Yulia can do for your practice.
        </h3>
        <div className="max-w-[640px] mx-auto">
          <PublicChatInput sourcePage="/enterprise" />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Your expertise is the bottleneck. It doesn&apos;t have to be.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#DA7756] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &rarr;
          </button>
        </div>
      </section>

      {/* ═══ NUDGE ═══ */}
      <div className="text-center pb-10 max-md:pb-6">
        <p className="journey-nudge text-[22px] text-[#DA7756] m-0 max-md:text-lg">
          your next deal is waiting
        </p>
      </div>
    </PublicLayout>
  );
}
