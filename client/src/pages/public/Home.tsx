import { Link, useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Tag from '../../components/public/Tag';
import PublicChatView from '../../components/public/PublicChatView';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const HERO_CARDS = [
  { size: '$400K Landscaping', result: 'Found $31K in add-backs', journey: 'Selling' },
  { size: '$3M HVAC', result: 'Valued at $2.6M\u2013$3.9M', journey: 'Selling' },
  { size: '$12M Search Fund', result: '47 targets scored overnight', journey: 'Buying' },
  { size: '$40M PE Roll-up', result: '6 acquisitions in 14 months', journey: 'Platform Build' },
];

const TRUST_STATS = [
  { num: '$2.4T', desc: 'Annual SMB transaction volume' },
  { num: '73%', desc: 'Deal failure rate without guidance' },
  { num: '30%+', desc: 'Value left on the table' },
  { num: '24hr', desc: 'From signup to first valuation' },
];

const PROBLEM_STATS = [
  { num: '10%', label: 'Typical broker commission on your deal' },
  { num: '$25K+', label: 'Average advisory retainer before anything happens' },
  { num: '6\u201312 mo', label: 'Average time to close with a traditional broker' },
  { num: '70%', label: 'Of listed businesses never sell at all' },
];

const OUTCOMES = [
  { number: '3\u20134\u00d7', title: 'EBITDA Multiples Captured', desc: 'AI-optimized positioning ensures you sell at the top of your range, not the bottom.' },
  { number: '23+', title: 'Qualified Buyers, Day One', desc: 'Yulia screens and matches buyers by criteria, capacity, and deal history instantly.' },
  { number: '80%', title: 'Less Time on Admin', desc: 'Automated CIM generation, document organization, and due diligence workflows.' },
  { number: '90%', title: 'Cost Reduction vs. Brokers', desc: 'Pay per stage, not a 10% commission. Transparent, progressive pricing from day one.' },
];

const STEPS = [
  { num: '01', title: 'Start a conversation', desc: 'Tell Yulia about your business or what you\u2019re looking to buy. She\u2019ll ask the right questions and build your profile.', tag: 'free' as const, tagLabel: 'Free to start' },
  { num: '02', title: 'Get real deliverables', desc: 'Valuation report, buyer list, CIM, due diligence checklist \u2014 real documents, not summaries. Pay only for what you need.', tag: 'paid' as const, tagLabel: 'Pay as you go' },
  { num: '03', title: 'Close with confidence', desc: 'Yulia guides you through negotiation, deal structuring, and closing. Every stage, every decision, every document.', tag: 'paid' as const, tagLabel: 'Stage-by-stage' },
];

const JOURNEYS = [
  { title: 'Sell', desc: 'Know your number. Find qualified buyers. Close on your terms.', link: '/sell', cta: 'Start selling \u2192' },
  { title: 'Buy', desc: 'Build your buy box. Find the right deal. Model the returns.', link: '/buy', cta: 'Start buying \u2192' },
  { title: 'Raise Capital', desc: 'Structure your raise. Match with investors. Keep control.', link: '/raise', cta: 'Start raising \u2192' },
  { title: 'Integrate', desc: 'Your first 100 days, done right. Systems, people, culture.', link: '/integrate', cta: 'Start planning \u2192' },
];

/* ─── Page ─── */

export default function Home() {
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'home' });
  const hasMessages = chat.messages.length > 0 || chat.sending;

  return (
    <PublicLayout>
      {/* ═══ SECTION 1: HERO WITH LIVE CHAT ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        {/* Hero tag */}
        <div className="flex items-center gap-3 mb-9 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          M&amp;A Advisory, Reinvented
        </div>

        {/* H1 */}
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight max-w-[11ch] mb-11">
          Sell <em className="italic text-[#DA7756]">smart.</em><br />
          Buy <em className="italic text-[#DA7756]">right.</em>
        </h1>

        {/* Visual strip — 4 mini-cards (fade when chat starts) */}
        <div className={`transition-all duration-500 ${hasMessages ? 'opacity-0 max-h-0 mb-0 overflow-hidden' : 'opacity-100 max-h-[200px] mb-10'}`}>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-none">
            {HERO_CARDS.map(c => (
              <div
                key={c.size}
                className="flex-shrink-0 w-[220px] bg-white border border-[#E0DCD4] rounded-xl px-5 py-4"
              >
                <p className="text-sm font-semibold text-[#1A1A18] m-0">{c.size}</p>
                <p className="text-[13px] text-[#7A766E] mt-1 m-0">{c.result}</p>
                <p className="text-[11px] uppercase tracking-wider text-[#DA7756] font-semibold mt-3 m-0">{c.journey}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── LIVE CHAT AREA ─── */}
        <div className={`transition-all duration-500 ${hasMessages ? 'min-h-[360px]' : ''}`}>
          <PublicChatView
            messages={chat.messages}
            sending={chat.sending}
            streamingText={chat.streamingText}
            messagesRemaining={chat.messagesRemaining}
            limitReached={chat.limitReached}
            error={chat.error}
            onSend={chat.sendMessage}
            onSignup={() => navigate('/signup')}
            placeholder="Tell Yulia about your business or what you're looking to do\u2026"
          />
        </div>

        {/* Bottom bar (hidden once chat starts) */}
        <div className={`transition-all duration-500 ${hasMessages ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[200px]'}`}>
          <div className="border-t-2 border-[#1A1A18] pt-8 flex flex-col md:flex-row justify-between md:items-end gap-7 mt-8">
            <p className="text-lg text-[#7A766E] max-w-[440px] leading-relaxed m-0">
              Yulia is your AI deal advisor. She handles valuation, buyer matching,
              due diligence, and closing &mdash; for a fraction of the traditional cost.
            </p>
            <div className="flex flex-col md:flex-row gap-3 shrink-0 max-md:w-full">
              <Button variant="primary" href="/signup">Start free &rarr;</Button>
              <Button variant="secondary" href="/how-it-works">How it works</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STATS ─── */}
      <div className="max-w-site mx-auto px-10 py-14 border-t border-[#E0DCD4] grid grid-cols-4 max-md:grid-cols-2 max-md:gap-6 max-md:px-5 max-md:py-8">
        {TRUST_STATS.map((s, i) => (
          <div
            key={s.num}
            className={`px-7 max-md:px-0 ${i < 3 ? 'border-r border-[#E0DCD4] max-md:border-r-0' : ''} ${i === 0 ? 'pl-0' : ''}`}
          >
            <p className="font-serif text-[42px] font-black tracking-tight leading-none m-0">{s.num}</p>
            <p className="text-[13px] text-[#7A766E] mt-2 m-0 leading-snug">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* ═══ SECTION 2: THE PROBLEM ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] p-16 grid grid-cols-2 gap-16 items-center max-md:grid-cols-1 max-md:p-7 max-md:gap-8">
          <h2 className="font-serif text-[clamp(32px,3.5vw,44px)] font-black tracking-tight leading-[1.1] m-0">
            Most owners sell for <em className="italic text-[#DA7756]">30% less</em> than their business is worth.
          </h2>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {PROBLEM_STATS.map(s => (
              <div key={s.num} className="bg-white border border-[#E0DCD4] rounded-[14px] p-6">
                <p className="font-serif text-[32px] font-black text-[#DA7756] leading-none mb-1.5 m-0">{s.num}</p>
                <p className="text-[13px] text-[#7A766E] leading-snug m-0">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: OUTCOMES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-2 gap-16 mb-14 items-end max-md:grid-cols-1 max-md:gap-6">
          <h2 className="font-serif text-[clamp(36px,4.5vw,60px)] font-black tracking-tight leading-[1.05] m-0">
            Your AI advisor delivers <em className="italic text-[#DA7756]">results.</em>
          </h2>
          <p className="text-[17px] text-[#7A766E] leading-relaxed m-0">
            Yulia doesn&apos;t give generic advice. She builds deal-specific strategies using real
            market data, comparable transactions, and industry benchmarks &mdash; then guides you
            through every stage.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {OUTCOMES.map(o => (
            <Card key={o.title} padding="px-9 py-11">
              <p className="font-serif text-5xl font-black text-[#DA7756] leading-none mb-3.5 m-0">{o.number}</p>
              <h3 className="text-[17px] font-bold text-[#1A1A18] mb-2 m-0">{o.title}</h3>
              <p className="text-sm text-[#7A766E] leading-relaxed m-0">{o.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 4: HOW IT WORKS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[.2em] text-[#DA7756] font-semibold mb-4 m-0">How It Works</p>
          <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight m-0">
            Three steps to your best deal.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {STEPS.map(s => (
            <Card key={s.num} hover={false} padding="px-8 py-10">
              <p className="font-serif text-[56px] font-black text-[#E8E4DC] leading-none mb-5 m-0">{s.num}</p>
              <h3 className="text-lg font-bold text-[#1A1A18] mb-2.5 m-0">{s.title}</h3>
              <p className="text-sm text-[#7A766E] leading-relaxed m-0">{s.desc}</p>
              <div className="mt-4">
                <Tag variant={s.tag}>{s.tagLabel}</Tag>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 5: JOURNEYS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight mb-10 m-0">
          What brings you here?
        </h2>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {JOURNEYS.map(j => (
            <Link key={j.link} href={j.link} className="no-underline">
              <Card padding="px-7 py-8" className="h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-[rgba(218,119,86,.08)] flex items-center justify-center mb-5">
                  <span className="w-5 h-5 rounded-full bg-[#DA7756] opacity-60" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1A18] mb-2 m-0">{j.title}</h3>
                <p className="text-sm text-[#7A766E] leading-relaxed flex-1 m-0">{j.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-[#DA7756] text-sm font-semibold mt-5 transition-transform duration-200 group-hover:translate-x-1">
                  {j.cta}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6: FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-snug max-w-[480px] m-0 relative z-10">
            Ready to make your next deal your best deal?
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start with Yulia &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
