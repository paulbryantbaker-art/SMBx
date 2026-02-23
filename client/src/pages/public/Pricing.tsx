import { useState } from 'react';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Tag from '../../components/public/Tag';

/* ─── Data ─── */

type Journey = 'sell' | 'buy' | 'raise' | 'integrate';

const JOURNEY_PACKAGES: Record<Journey, { label: string; total: string; stages: { name: string; price: string; free: boolean }[] }> = {
  sell: {
    label: 'Sell-Side Complete',
    total: 'From $1,799',
    stages: [
      { name: 'Intake & Classification', price: 'Free', free: true },
      { name: 'Financial Package', price: 'Free', free: true },
      { name: 'Defensible Valuation', price: 'From $199', free: false },
      { name: 'CIM & Deal Packaging', price: 'From $299', free: false },
      { name: 'Buyer Matching', price: 'From $199', free: false },
      { name: 'Closing Support', price: 'From $299', free: false },
    ],
  },
  buy: {
    label: 'Buy-Side Complete',
    total: 'From $1,399',
    stages: [
      { name: 'Acquisition Thesis', price: 'Free', free: true },
      { name: 'Target Screening', price: 'From $199', free: false },
      { name: 'Target Valuation', price: 'From $199', free: false },
      { name: 'Due Diligence', price: 'From $299', free: false },
      { name: 'Deal Structuring', price: 'From $199', free: false },
      { name: 'Closing Support', price: 'From $299', free: false },
    ],
  },
  raise: {
    label: 'Raise Capital',
    total: 'From $749',
    stages: [
      { name: 'Capital Strategy', price: 'Free', free: true },
      { name: 'Pre-Money Valuation', price: 'From $199', free: false },
      { name: 'Pitch Deck', price: 'From $199', free: false },
      { name: 'Investor Targeting', price: 'From $149', free: false },
      { name: 'Term Sheet Analysis', price: 'From $199', free: false },
    ],
  },
  integrate: {
    label: 'Integration',
    total: 'From $899',
    stages: [
      { name: 'Day 0 Checklist', price: 'Free', free: true },
      { name: '30-Day Stabilization', price: 'From $299', free: false },
      { name: '60-Day Assessment', price: 'From $299', free: false },
      { name: '100-Day Optimization', price: 'From $299', free: false },
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
  { deal: '$400K landscaping business', typical: '~$1,800', traditional: '$40,000 (10% broker)' },
  { deal: '$3M HVAC company', typical: '~$4,500', traditional: '$150,000+ (5% broker + advisor)' },
  { deal: '$25M PE acquisition', typical: '~$12,000', traditional: '$500,000+ (banker + legal + advisor)' },
];

const WALLETS = [
  { name: 'Try Yulia', price: '$199', desc: 'See what the work product looks like.', popular: false },
  { name: 'Run a Deal', price: '$999', desc: 'Most customers start here.', bonus: '+10% bonus', popular: true },
  { name: 'Deal Pro', price: '$2,499', desc: 'Everything you need. One purchase.', bonus: '+20% bonus', popular: false },
];

const FREE_ITEMS = [
  'Business intake and classification',
  'SDE/EBITDA calculation',
  'Add-back identification',
  'Preliminary valuation range',
  'Journey roadmap',
];

const FAQS = [
  { q: 'Why isn\u2019t it a subscription?', a: 'You pay for what you use. No monthly fee collecting dust.' },
  { q: 'Can I start small and add more later?', a: 'Yes. Buy one deliverable or the whole journey. Top up anytime.' },
  { q: 'What if I need a bigger deal analyzed?', a: 'Larger deals use adjusted pricing that reflects complexity. Still a fraction of traditional cost.' },
  { q: 'Is there a refund policy?', a: 'If Yulia\u2019s work product doesn\u2019t meet professional standards, we\u2019ll make it right.' },
];

/* ─── Page ─── */

export default function Pricing() {
  const [tab, setTab] = useState<Journey>('sell');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pkg = JOURNEY_PACKAGES[tab];

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12 text-center">
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight mb-6 m-0">
          Know exactly what you&apos;ll spend before you start.
        </h1>
        <p className="text-lg text-[#7A766E] max-w-[600px] mx-auto leading-relaxed m-0">
          Every journey has a clear price. No retainers. No surprises.
          Your first conversation and financial analysis are always free.
        </p>
      </section>

      {/* ═══ JOURNEY PACKAGES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold border-none cursor-pointer transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-[#DA7756] text-white'
                  : 'bg-white text-[#4A4843] border border-[#E0DCD4] hover:border-[#1A1A18]'
              }`}
              style={tab !== t.key ? { border: '1px solid #E0DCD4' } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Package */}
        <h3 className="font-serif text-2xl font-black mb-6 m-0">{pkg.label}</h3>
        <div className="space-y-0">
          {pkg.stages.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center justify-between py-4 ${
                i < pkg.stages.length - 1 ? 'border-b border-[#E0DCD4]' : ''
              }`}
            >
              <span className="text-[15px] text-[#1A1A18]">{s.name}</span>
              <Tag variant={s.free ? 'free' : 'paid'}>{s.price}</Tag>
            </div>
          ))}
          <div className="flex items-center justify-between pt-6 border-t-2 border-[#1A1A18]">
            <span className="text-[15px] font-bold text-[#1A1A18]">Total</span>
            <span className="text-[15px] font-bold text-[#DA7756]">{pkg.total}</span>
          </div>
        </div>
      </section>

      {/* ═══ EXAMPLES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-10 m-0">
          What does it <em className="italic text-[#DA7756]">actually</em> cost?
        </h2>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {EXAMPLES.map(e => (
            <Card key={e.deal} padding="px-8 py-8">
              <p className="text-sm font-semibold text-[#1A1A18] mb-4 m-0">{e.deal}</p>
              <p className="font-serif text-[32px] font-black text-[#DA7756] leading-none mb-1 m-0">{e.typical}</p>
              <p className="text-[13px] text-[#7A766E] m-0">vs. {e.traditional}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ WALLET OPTIONS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-10 m-0">
          How to pay.
        </h2>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {WALLETS.map(w => (
            <Card key={w.name} padding="px-8 py-10" className={w.popular ? 'ring-2 ring-[#DA7756]' : ''}>
              {w.popular && (
                <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-[#DA7756] mb-3">Most Popular</span>
              )}
              <h3 className="text-lg font-bold text-[#1A1A18] mb-1 m-0">{w.name}</h3>
              <p className="font-serif text-[32px] font-black text-[#1A1A18] leading-none mb-2 m-0">{w.price}</p>
              {w.bonus && <Tag variant="paid">{w.bonus}</Tag>}
              <p className="text-sm text-[#7A766E] mt-3 m-0">{w.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ WHAT'S FREE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] p-16 max-md:p-7">
          <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-8 m-0">
            What&apos;s free.
          </h2>
          <ul className="space-y-3 mb-8 list-none p-0 m-0">
            {FREE_ITEMS.map(item => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-[#4A4843]">
                <span className="text-[#DA7756] mt-0.5">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[15px] text-[#7A766E] italic m-0">
            Your first conversation with Yulia costs nothing.
          </p>
        </div>
      </section>

      {/* ═══ SERVICE PROVIDER ACCESS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-2 gap-16 items-center max-md:grid-cols-1 max-md:gap-8">
          <div>
            <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight leading-[1.1] mb-6 m-0">
              Service providers collaborate <em className="italic text-[#DA7756]">free.</em>
            </h2>
            <p className="text-[17px] text-[#7A766E] leading-relaxed m-0">
              When a client invites you to their deal room, you get full access
              at no cost. Focus on what you do best.
            </p>
          </div>
          <Card hover={false} padding="px-8 py-10">
            <p className="text-sm uppercase tracking-widest text-[#DA7756] font-semibold mb-4 m-0">Free access for</p>
            <ul className="space-y-2 list-none p-0 m-0">
              {['Attorneys', 'CPAs & Accountants', 'Real Estate Agents', 'Financial Advisors'].map(r => (
                <li key={r} className="text-[15px] text-[#1A1A18] font-medium">{r}</li>
              ))}
            </ul>
          </Card>
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
            Start free. Pay when you&apos;re ready.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Get started &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
