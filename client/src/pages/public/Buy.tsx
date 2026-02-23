import { useState } from 'react';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Tag from '../../components/public/Tag';

/* ─── Data ─── */

const DEAL_SIZES = [
  { title: 'First-time buyer', desc: 'Buying your first business? Thesis to close \u2014 Yulia walks you through every step.' },
  { title: 'Search fund / independent sponsor', desc: 'Screen hundreds of targets overnight. Model returns before your first call.' },
  { title: 'PE / strategic', desc: 'Roll-up modeling, platform builds, portfolio analytics at scale.' },
];

const DELIVERABLES = [
  { name: 'Acquisition Thesis', price: 'Free', desc: 'Define your buy box, criteria, and target profile with Yulia.', free: true },
  { name: 'Target Screening & Scoring', price: 'From $199', desc: 'Qualified targets ranked by strategic fit, financials, and acquisition history.', free: false },
  { name: 'Target Valuation', price: 'From $199', desc: 'Multi-methodology valuation for each target on your shortlist.', free: false },
  { name: 'Due Diligence Management', price: 'From $299', desc: 'Comprehensive DD checklist, document tracking, risk flagging.', free: false },
  { name: 'Deal Structuring & Modeling', price: 'From $199', desc: 'Returns modeling, financing structure, earn-out analysis.', free: false },
  { name: 'Closing Support', price: 'From $299', desc: 'LOI review, final DD, deal coordination through wire transfer.', free: false },
];

const FAQS = [
  {
    q: 'Where do the targets come from?',
    a: 'We analyze publicly available data and market intelligence. We don\u2019t compete with brokers \u2014 we complement them.',
  },
  {
    q: 'Can I use this for multiple acquisitions?',
    a: 'Absolutely. Roll-up operators use Yulia for serial acquisitions. Each deal gets its own workspace and analysis.',
  },
];

/* ─── Page ─── */

export default function Buy() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <div className="flex items-center gap-3 mb-9 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Buy a Business
        </div>
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight max-w-[14ch] mb-11 m-0">
          Find the right deal. Model the returns.
        </h1>
        <p className="text-lg text-[#7A766E] max-w-[540px] leading-relaxed mb-10 m-0">
          Build your acquisition thesis. Yulia screens targets, runs valuations, and manages diligence.
        </p>
        <Button variant="primary" href="/signup">Start buying &mdash; free &rarr;</Button>
      </section>

      {/* ═══ BUILT FOR YOUR DEAL SIZE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(36px,4.5vw,60px)] font-black tracking-tight leading-[1.05] mb-10 m-0">
          Built for <em className="italic text-[#DA7756]">your</em> deal size.
        </h2>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {DEAL_SIZES.map(d => (
            <Card key={d.title} padding="px-8 py-10">
              <h3 className="text-lg font-bold text-[#1A1A18] mb-2 m-0">{d.title}</h3>
              <p className="text-sm text-[#7A766E] leading-relaxed m-0">{d.desc}</p>
            </Card>
          ))}
        </div>
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
          <span className="text-[15px] font-bold text-[#DA7756]">From $1,399</span>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-10 m-0">
          Common questions.
        </h2>
        <div className="space-y-0">
          {FAQS.map((f, i) => (
            <div key={i} className="border-b border-[#E0DCD4]">
              <button
                className="w-full flex items-center justify-between py-5 text-left bg-transparent border-none cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-[15px] font-semibold text-[#1A1A18] pr-4">{f.q}</span>
                <span className="text-[#7A766E] text-xl shrink-0">{openFaq === i ? '\u2212' : '+'}</span>
              </button>
              {openFaq === i && (
                <p className="text-sm text-[#7A766E] leading-relaxed pb-5 m-0">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-snug max-w-[480px] m-0 relative z-10">
            Find your next acquisition. Start free.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start buying &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
