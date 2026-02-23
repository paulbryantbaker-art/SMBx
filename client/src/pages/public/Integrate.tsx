import { useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/public/PublicChatInput';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 0,
    title: 'Secure the business',
    price: 'Free',
    free: true,
    desc: 'Change passwords. Lock accounts. Notify key people. Transfer critical access. Yulia\u2019s Day Zero checklist makes sure nothing slips.',
  },
  {
    num: 1,
    title: 'Days 1\u201330: Stabilize',
    price: 'From $299',
    free: false,
    desc: 'Employee communication. Customer retention. Vendor renegotiation. Quick wins that build momentum and trust with your new team.',
  },
  {
    num: 2,
    title: 'Days 31\u201360: Assess',
    price: 'From $299',
    free: false,
    desc: 'SWOT analysis. Operational benchmarking. Where are the cost savings? Where are the revenue opportunities? What did due diligence miss?',
  },
  {
    num: 3,
    title: 'Days 61\u2013100: Optimize',
    price: 'From $299',
    free: false,
    desc: 'Full integration roadmap with KPIs, milestones, and accountability. The plan that turns your acquisition into a compounding asset.',
  },
];

const INTEGRATE_PROMPTS = [
  'Just bought a plumbing company',
  'Closing on SaaS next month',
];

/* ─── Page ─── */

export default function Integrate() {
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'integrate' });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <div className="flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Post-Acquisition
        </div>
        <h1 className="font-serif text-[clamp(44px,6vw,76px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[14ch] mb-6 m-0">
          You bought it. Now <em className="italic text-[#DA7756]">make it work.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          The first 100 days determine whether your acquisition creates value or destroys it.
          Most buyers wing it. You won&apos;t.
        </p>
        <Button variant="primary" href="/signup">Start planning &mdash; free &rarr;</Button>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#DA7756] font-semibold mb-4 m-0">
          Your integration journey
        </p>
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From Day Zero to <em className="italic text-[#DA7756]">full integration.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Typical integration: <strong className="text-[#1A1A18]">From $899</strong>
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
            placeholder="Tell Yulia what you just acquired..."
            suggestedPrompts={INTEGRATE_PROMPTS}
          />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
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
