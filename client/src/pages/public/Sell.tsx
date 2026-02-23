import { useState } from 'react';
import { useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Tag from '../../components/public/Tag';
import PublicChatView from '../../components/public/PublicChatView';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const DEAL_SIZES = [
  { title: 'Under $500K', desc: 'First-time seller? Yulia walks you through every step in plain language.' },
  { title: '$500K \u2013 $10M', desc: 'Experienced owner selling a real operation? Institutional-quality work product.' },
  { title: '$10M+', desc: 'PE or strategic exit? Full CIM, buyer targeting, deal room management.' },
];

const DELIVERABLES = [
  { name: 'Financial Analysis', price: 'Free', desc: 'SDE/EBITDA calculated. Every legitimate add-back identified.', free: true },
  { name: 'Defensible Valuation', price: 'From $199', desc: 'Multi-methodology using current market data for your industry.', free: false },
  { name: 'Confidential Information Memorandum', price: 'From $299', desc: 'The document that makes buyers take your business seriously.', free: false },
  { name: 'Buyer Identification', price: 'From $199', desc: 'Qualified buyers profiled and prioritized for your deal.', free: false },
  { name: 'Closing Support', price: 'From $299', desc: 'LOI comparison, DD prep, working capital, funds flow \u2014 to the wire.', free: false },
];

const JOURNEY_STEPS = [
  { num: '\u2460', name: 'Intake', price: 'Free' },
  { num: '\u2461', name: 'Financial Package', price: 'Free' },
  { num: '\u2462', name: 'Valuation', price: 'From $199' },
  { num: '\u2463', name: 'CIM & Packaging', price: 'From $299' },
  { num: '\u2464', name: 'Buyer Matching', price: 'From $199' },
  { num: '\u2465', name: 'Closing', price: 'From $299' },
];

const FAQS = [
  {
    q: 'How accurate is an AI valuation?',
    a: 'Multiple methodologies, real comps, shown work. Many users bring it to their CPA for confirmation.',
  },
  {
    q: 'Will buyers take a CIM from an AI seriously?',
    a: 'Same format and depth as a $50K advisory firm produces. Professional, institutional-quality documents.',
  },
  {
    q: 'What if my business is complicated?',
    a: '80+ industry verticals. Yulia adapts to your specific business type, deal structure, and market conditions.',
  },
  {
    q: 'Do I still need a broker?',
    a: 'Many users work with brokers who use Yulia. We complement, not replace. Your broker gets free access to your deal room.',
  },
];

/* ─── Page ─── */

export default function Sell() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'sell' });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <div className="flex items-center gap-3 mb-9 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Sell Your Business
        </div>
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight max-w-[14ch] mb-11 m-0">
          Know what your business is worth.
        </h1>
        <p className="text-lg text-[#7A766E] max-w-[540px] leading-relaxed mb-10 m-0">
          From first financial analysis to wire transfer &mdash; guided every step.
          Your first analysis is free.
        </p>

        {/* ─── LIVE CHAT ─── */}
        <div className="max-w-[600px]">
          <PublicChatView
            messages={chat.messages}
            sending={chat.sending}
            streamingText={chat.streamingText}
            messagesRemaining={chat.messagesRemaining}
            limitReached={chat.limitReached}
            error={chat.error}
            onSend={chat.sendMessage}
            onSignup={() => navigate('/signup')}
            placeholder="Tell Yulia about the business you want to sell\u2026"
          />
        </div>
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
      <section id="deliverables" className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
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
      </section>

      {/* ═══ YOUR JOURNEY ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-10 m-0">
          Your journey.
        </h2>
        <div className="space-y-0">
          {JOURNEY_STEPS.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center justify-between py-4 ${
                i < JOURNEY_STEPS.length - 1 ? 'border-b border-[#E0DCD4]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg text-[#DA7756]">{s.num}</span>
                <span className="text-[15px] font-medium text-[#1A1A18]">{s.name}</span>
              </div>
              <span className="text-sm text-[#7A766E]">{s.price}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-6 border-t-2 border-[#1A1A18]">
            <span className="text-[15px] font-bold text-[#1A1A18]">Typical total</span>
            <span className="text-[15px] font-bold text-[#DA7756]">From $1,799</span>
          </div>
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
            Know your number. Start free.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start selling &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
