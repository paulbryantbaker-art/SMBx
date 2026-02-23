import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Tag from '../../components/public/Tag';

/* ─── Data ─── */

const DELIVERABLES = [
  { name: 'Day 0 Checklist', price: 'Free', desc: 'Immediate priorities, stakeholder communication, and quick wins for day one.', free: true },
  { name: '30-Day Stabilization Plan', price: 'From $299', desc: 'Operational continuity, team retention, customer communication, and systems integration.', free: false },
  { name: '60-Day Assessment', price: 'From $299', desc: 'Performance benchmarking, gap analysis, and initiative prioritization.', free: false },
  { name: '100-Day Optimization Roadmap', price: 'From $299', desc: 'Value creation plan, synergy capture, and long-term integration milestones.', free: false },
];

/* ─── Page ─── */

export default function Integrate() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <div className="flex items-center gap-3 mb-9 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Post-Acquisition
        </div>
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight max-w-[14ch] mb-11 m-0">
          You just acquired a business. Now what?
        </h1>
        <p className="text-lg text-[#7A766E] max-w-[540px] leading-relaxed mb-10 m-0">
          The first 100 days determine value creation or destruction.
          Yulia makes sure it&apos;s the former.
        </p>
        <Button variant="primary" href="/signup">Start your integration &mdash; free &rarr;</Button>
      </section>

      {/* ═══ WHAT YOU GET ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-10 m-0">
          What you get.
        </h2>
        <div className="space-y-0">
          {DELIVERABLES.map((d, i) => (
            <div
              key={d.name}
              className={`flex flex-col md:flex-row md:items-center justify-between py-6 gap-4 ${
                i < DELIVERABLES.length - 1 ? 'border-b border-[#E0DCD4]' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[17px] font-bold text-[#1A1A18] m-0">{d.name}</h3>
                  <Tag variant={d.free ? 'free' : 'paid'}>{d.price}</Tag>
                </div>
                <p className="text-sm text-[#7A766E] leading-relaxed m-0">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-[#1A1A18]">
          <span className="text-[15px] font-bold text-[#1A1A18]">Typical total</span>
          <span className="text-[15px] font-bold text-[#DA7756]">From $899</span>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-snug max-w-[480px] m-0 relative z-10">
            Your first 100 days, done right.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start planning &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
