import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const TICKER_ITEMS = [
  'Business Owners',
  'First-Time Buyers',
  'Search Funds',
  'Brokers',
  'PE Firms',
  'Family Offices',
  'Solo Founders',
  'Investors',
  'Serial Acquirers',
  'Holding Companies',
];

const PILLARS = [
  {
    title: 'She knows your industry.',
    body: "Yulia has analyzed deal patterns across 80+ verticals \u2014 from dental practices to SaaS companies to manufacturing firms. She knows the typical multiples, the common pitfalls, and what buyers in your space actually care about.",
  },
  {
    title: 'She understands your deal.',
    body: "Every transaction is different. Yulia doesn\u2019t give you generic advice \u2014 she builds a strategy around your specific financials, your timeline, your goals, and your market conditions. Right now.",
  },
  {
    title: 'She guides you through the process.',
    body: "From intake to closing, Yulia produces real deliverables \u2014 financial analysis, valuation reports, offering memorandums, buyer lists, and negotiation frameworks. Not suggestions. Documents.",
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Tell her about your deal.',
    body: "Sign up free and start a conversation. Yulia will ask the right questions to understand your situation \u2014 whether you\u2019re selling, buying, or raising capital.",
  },
  {
    num: '02',
    title: 'She builds your strategy.',
    body: "Based on your financials, industry, and goals, Yulia creates a custom roadmap with real deliverables at each stage. Pay only for what you need, when you need it.",
  },
  {
    num: '03',
    title: 'You close with confidence.',
    body: "From valuation to negotiation to wire transfer, you\u2019re never guessing. You have an expert in your corner who\u2019s thought through every angle.",
  },
];

const WITHOUT = [
  "You undervalue your business by 20\u201340% because you didn\u2019t know the market.",
  'You spend six months talking to the wrong buyers.',
  'The deal falls apart in due diligence because nobody prepared you for what was coming.',
  'You pay a broker 10% of the sale price and still feel like you did most of the work.',
];

const WITH_YULIA = [
  'You know exactly what your business is worth \u2014 and why.',
  'You get matched with qualified, serious buyers.',
  'Every document is ready before anyone asks for it.',
  "You pay a fraction of traditional fees and keep more of what you\u2019ve built.",
];

const JOURNEYS = [
  {
    title: 'Sell your business',
    description: 'Know your number. Find your buyer. Close on your terms.',
    href: '/sell',
  },
  {
    title: 'Buy a business',
    description: 'Define your thesis. Source targets. Model the returns.',
    href: '/buy',
  },
  {
    title: 'Raise capital',
    description: 'Bring on investors. Keep control. Grow on your terms.',
    href: '/raise',
  },
  {
    title: 'Post-acquisition',
    description: 'Your first 100 days, done right. Nothing falls through the cracks.',
    href: '/integrate',
  },
];

const STATS = [
  { value: '80+', label: 'industries analyzed' },
  { value: '24/7', label: 'availability' },
  { value: '90%', label: 'less than traditional advisory fees' },
];

/* ── Fade-in on scroll ── */
function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Ticker ── */
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden w-full max-w-2xl mx-auto mt-4 group">
      <div
        className="flex whitespace-nowrap group-hover:[animation-play-state:paused]"
        style={{ animation: 'tickerScroll 30s linear infinite' }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-base md:text-lg text-[#6B6963] shrink-0">
            {item}
            <span className="text-[#DA7756] mx-3">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Component ── */
export default function Home() {
  return (
    <PublicLayout>
      {/* ═══ SECTION 1: HERO (fixed) ═══ */}
      <section className="fixed inset-0 z-0 flex flex-col items-center justify-center px-6 bg-[#FAF9F5]">
        <div className="text-center flex flex-col items-center max-w-4xl w-full">
          <span className="inline-block bg-[#F0EDE6] text-[#6B6963] text-sm px-4 py-1.5 rounded-full mb-8">
            AI-Powered M&amp;A Advisory
          </span>
          <h1
            className="text-4xl md:text-7xl text-[#1A1A18] font-medium leading-relaxed md:leading-tight tracking-tight mb-8 md:mb-10"
            style={SERIF}
          >
            Sell or buy any business, anywhere.
          </h1>
          <p className="text-xl md:text-2xl text-[#6B6963] mb-4">
            Built for everyone.
          </p>
          <Ticker />
          <p className="text-base md:text-lg text-[#6B6963] mt-6 max-w-lg mx-auto">
            Harness deep intelligence and automation to close deals faster, easier, and smarter.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center mt-10 px-10 py-4 bg-[#DA7756] text-white text-lg font-medium rounded-full hover:bg-[#C4684A] no-underline transition-colors"
          >
            Meet Yulia &rarr;
          </Link>
          <p className="text-sm text-[#6B6963] opacity-60 mt-8">
            Available in &#127482;&#127480; &#127468;&#127463; &#127464;&#127462; &#127462;&#127482; and 20+ countries
          </p>
        </div>
        <svg
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-5 h-5 text-[#6B6963] opacity-30"
          style={{ animation: 'heroChevron 2s ease-in-out infinite' }}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7l6 6 6-6" />
        </svg>
      </section>

      {/* Spacer */}
      <div className="min-h-screen" />

      {/* ═══ SECTION 2: THE PROBLEM (slides over hero) ═══ */}
      <div className="relative z-10">
        <section
          className="px-6 md:px-8 py-24 md:py-32 bg-white rounded-t-3xl"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-6">
                The problem
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] leading-tight"
                style={SERIF}
              >
                M&amp;A advice has always been expensive. Or terrible. Or both.
              </h2>
            </FadeIn>
            <div className="max-w-2xl mx-auto mt-12 space-y-6">
              <FadeIn delay={200}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  Hire a traditional M&amp;A advisor and you&apos;re looking at $30,000 to
                  $100,000 in fees &mdash; if they&apos;ll even take your call. Most
                  won&apos;t touch a deal under $10 million.
                </p>
              </FadeIn>
              <FadeIn delay={300}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  Try to go it alone and you&apos;re Googling &ldquo;how to value a
                  business&rdquo; at 2am, cobbling together spreadsheets, and hoping you
                  don&apos;t leave money on the table.
                </p>
              </FadeIn>
              <FadeIn delay={400}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  Online tools give you a calculator and a templated report. No context.
                  No strategy. No one in your corner when the deal gets complicated.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: THE INTELLIGENCE (scrolls normally) ═══ */}
        <section className="px-6 md:px-8 py-24 md:py-32 bg-[#FAF9F5]">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-6 text-center">
                The intelligence
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center leading-tight"
                style={SERIF}
              >
                This isn&apos;t a chatbot. This is something different.
              </h2>
            </FadeIn>
            <div className="max-w-2xl mx-auto mt-16 space-y-16">
              {PILLARS.map((p, i) => (
                <FadeIn key={p.title} delay={200 + i * 100}>
                  <h3
                    className="text-2xl md:text-3xl font-medium text-[#1A1A18]"
                    style={SERIF}
                  >
                    {p.title}
                  </h3>
                  <p className="text-lg text-[#6B6963] mt-4 leading-relaxed">
                    {p.body}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══ SECTION 4: MEET YULIA (sticky curtain #2) ═══ */}
      <section className="sticky top-0 z-0 min-h-screen flex items-center justify-center px-6 md:px-8 bg-white">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-6">
            The solution
          </p>
          <h2
            className="text-4xl md:text-7xl font-medium text-[#1A1A18]"
            style={SERIF}
          >
            Meet Yulia.
          </h2>
          <p className="text-xl md:text-2xl text-[#6B6963] max-w-2xl mx-auto mt-6 leading-relaxed">
            Your AI deal advisor. She doesn&apos;t sleep, doesn&apos;t charge by the
            hour, and doesn&apos;t care how big your deal is.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 max-w-4xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p
                  className="text-3xl md:text-4xl font-medium text-[#DA7756] m-0"
                  style={SERIF}
                >
                  {s.value}
                </p>
                <p className="text-base text-[#6B6963] mt-2 m-0">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: HOW IT WORKS (slides over Yulia) ═══ */}
      <div className="relative z-10">
        <section
          className="px-6 md:px-8 py-24 md:py-32 bg-[#FAF9F5] rounded-t-3xl"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
        >
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-6 text-center">
                How it works
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center leading-tight"
                style={SERIF}
              >
                Three conversations. One clear path.
              </h2>
            </FadeIn>
            <div className="max-w-2xl mx-auto mt-16 space-y-20">
              {STEPS.map((step, i) => (
                <FadeIn key={step.num} delay={200 + i * 100}>
                  <div className="relative">
                    <span
                      className="text-6xl md:text-8xl font-light text-[#DA7756] opacity-20 absolute -top-6 -left-2 select-none"
                      style={SERIF}
                    >
                      {step.num}
                    </span>
                    <div className="relative pl-2 pt-8">
                      <h3
                        className="text-2xl font-medium text-[#1A1A18]"
                        style={SERIF}
                      >
                        {step.title}
                      </h3>
                      <p className="text-lg text-[#6B6963] mt-2 leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 6: THE STAKES ═══ */}
        <section className="px-6 md:px-8 py-24 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            <FadeIn>
              <h3
                className="text-2xl font-medium text-[#6B6963]"
                style={SERIF}
              >
                Without guidance:
              </h3>
              <div className="mt-6 space-y-4">
                {WITHOUT.map(line => (
                  <p key={line} className="text-lg text-[#6B6963] leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <h3
                className="text-2xl font-medium text-[#DA7756]"
                style={SERIF}
              >
                With Yulia:
              </h3>
              <div className="mt-6 space-y-4">
                {WITH_YULIA.map(line => (
                  <p key={line} className="text-lg text-[#6B6963] leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══ SECTION 7: JOURNEY CARDS ═══ */}
        <section className="px-6 md:px-8 py-24 md:py-32 bg-[#FAF9F5]">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center"
                style={SERIF}
              >
                What brings you here?
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
              {JOURNEYS.map((j, i) => (
                <FadeIn key={j.href} delay={100 + i * 150}>
                  <Link
                    href={j.href}
                    className="block bg-white rounded-2xl p-8 md:p-10 no-underline transition-shadow hover:shadow-lg"
                  >
                    <h3
                      className="text-xl md:text-2xl font-medium text-[#1A1A18]"
                      style={SERIF}
                    >
                      {j.title}
                    </h3>
                    <p className="text-base md:text-lg text-[#6B6963] mt-3 leading-relaxed">
                      {j.description}
                    </p>
                    <span className="inline-block text-[#DA7756] font-medium mt-4">
                      Start free &rarr;
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 8: FINAL CTA ═══ */}
        <section className="px-6 md:px-8 py-24 md:py-32 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18]"
                style={SERIF}
              >
                Your deal deserves an expert.
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="text-lg md:text-xl text-[#6B6963] mt-6 max-w-xl mx-auto">
                Start free. No credit card. No commitment. Just a conversation
                with the smartest advisor in the room.
              </p>
            </FadeIn>
            <FadeIn delay={200}>
              <Link
                href="/signup"
                className="inline-flex items-center mt-10 px-10 py-4 bg-[#DA7756] text-white text-lg font-medium rounded-full hover:bg-[#C4684A] no-underline transition-colors"
              >
                Meet Yulia &rarr;
              </Link>
            </FadeIn>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
