import { useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/public/PublicChatInput';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Define your strategy',
    price: 'Free',
    free: true,
    desc: 'How much do you need? What are you willing to give? Who should you approach? Yulia aligns your raise with your goals.',
  },
  {
    num: 2,
    title: 'Build your financial package',
    price: 'Free',
    free: true,
    desc: 'Yulia organizes your numbers into the story investors need to see. Gaps identified. Weaknesses addressed before they\u2019re exposed.',
  },
  {
    num: 3,
    title: 'Valuation and pitch deck',
    price: 'From $199',
    free: false,
    desc: 'Defensible pre-money valuation. 12-slide institutional deck built from YOUR actual data \u2014 not a template with your numbers pasted in.',
  },
  {
    num: 4,
    title: 'Target the right investors',
    price: 'From $149',
    free: false,
    desc: 'Angels, VCs, family offices, strategics \u2014 profiled and prioritized for your specific raise. The right money, not just any money.',
  },
  {
    num: 5,
    title: 'Negotiate terms',
    price: 'From $199',
    free: false,
    desc: 'Term sheet analysis. Side-by-side comparison. What each term means for your control, dilution, and economics. Negotiate informed.',
  },
];

const RAISE_PROMPTS = [
  'I need $2M for expansion',
  'Exploring Series A',
  'Want to bring on a strategic partner',
];

/* ─── Page ─── */

export default function Raise() {
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'raise' });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <div className="flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Raise Capital
        </div>
        <h1 className="font-serif text-[clamp(44px,6vw,76px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[14ch] mb-6 m-0">
          Raise smart. <em className="italic text-[#DA7756]">Keep control.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          The difference between a good raise and a great one is preparation. Yulia builds
          your financial story, your deck, and your investor strategy &mdash; so you negotiate
          from strength.
        </p>
        <Button variant="primary" href="/signup">Start raising &mdash; free &rarr;</Button>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#DA7756] font-semibold mb-4 m-0">
          Your raise journey
        </p>
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From strategy to <em className="italic text-[#DA7756]">term sheet.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Typical raise journey: <strong className="text-[#1A1A18]">From $749</strong>
          </p>
          <Button variant="primary" href="/signup">Start your journey &mdash; free &rarr;</Button>
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          Ready to start?
        </h3>
        <div className="max-w-[640px] mx-auto">
          <PublicChatInput
            onSend={(msg) => { chat.sendMessage(msg); navigate('/'); }}
            placeholder="Tell Yulia about your raise..."
            suggestedPrompts={RAISE_PROMPTS}
          />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Raise from strength. Talk to Yulia &mdash; free.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start raising &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
