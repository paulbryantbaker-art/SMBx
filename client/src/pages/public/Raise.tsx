import { useState } from 'react';
import { useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Tag from '../../components/public/Tag';
import PublicChatView from '../../components/public/PublicChatView';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const DELIVERABLES = [
  { name: 'Capital Strategy', price: 'Free', desc: 'Define your raise structure, target amount, and investor profile with Yulia.', free: true },
  { name: 'Pre-Money Valuation', price: 'From $199', desc: 'Defensible valuation methodology tailored to your stage and industry.', free: false },
  { name: 'Pitch Deck', price: 'From $199', desc: 'Investor-ready pitch deck built from your financials and growth story.', free: false },
  { name: 'Investor Targeting', price: 'From $149', desc: 'Profiled and prioritized investors for your specific raise.', free: false },
  { name: 'Term Sheet Analysis', price: 'From $199', desc: 'Side-by-side comparison and negotiation guidance on term sheets.', free: false },
];

const FAQS = [
  {
    q: 'What kind of raises?',
    a: 'Angel, seed, Series A through growth equity. Debt structures too. Yulia adapts to your specific capital needs.',
  },
  {
    q: 'Does Yulia find investors?',
    a: 'She profiles and prioritizes investors for your specific raise. Introductions are yours to make.',
  },
];

/* ─── Page ─── */

export default function Raise() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'raise' });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <div className="flex items-center gap-3 mb-9 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Raise Capital
        </div>
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight max-w-[14ch] mb-11 m-0">
          Raise capital without losing control.
        </h1>
        <p className="text-lg text-[#7A766E] max-w-[540px] leading-relaxed mb-10 m-0">
          Investor-ready materials, valuation guidance, and term sheet analysis &mdash;
          negotiate from strength.
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
            placeholder="Tell Yulia about your raise \u2014 how much, what stage, what for\u2026"
          />
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
          <span className="text-[15px] font-bold text-[#DA7756]">From $749</span>
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
            Raise smart. Start free.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start raising &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
