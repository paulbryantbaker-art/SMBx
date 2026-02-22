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
  'Investors',
  'Serial Acquirers',
  'Holding Companies',
];

const DELIVERABLES = [
  'Financial analysis and normalization of your books — so buyers see the real story, not the tax story.',
  'A defensible valuation backed by market data, comparable transactions, and industry-specific multiples.',
  'A complete offering memorandum that makes buyers compete to talk to you.',
  'A buyer list ranked by acquisition history, strategic fit, and likelihood to close.',
  'Due diligence preparation that answers every question before it gets asked.',
  'Negotiation frameworks built around your leverage points and walk-away number.',
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
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
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
    <div className="overflow-hidden w-full mt-4 group">
      <div
        className="flex whitespace-nowrap group-hover:[animation-play-state:paused]"
        style={{ animation: 'tickerScroll 30s linear infinite' }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-sm md:text-base text-[#6B6963] shrink-0">
            {item}
            <span className="text-[#DA7756] mx-3">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function Home() {
  return (
    <PublicLayout>
      {/* ═══ SECTION 1: HERO (fixed behind everything) ═══ */}
      <section className="fixed inset-0 z-0 flex flex-col items-center justify-center px-6 bg-[#FAF9F5]">
        <div className="text-center flex flex-col items-center max-w-4xl w-full">
          <span className="inline-block bg-[#F0EDE6] text-[#6B6963] text-sm px-4 py-1.5 rounded-full mb-8">
            AI-Powered M&amp;A Advisory
          </span>
          <h1
            className="text-4xl md:text-7xl text-[#1A1A18] font-medium leading-tight tracking-tight mb-8"
            style={SERIF}
          >
            Sell or buy any business, anywhere.
          </h1>
          <p className="text-lg md:text-xl text-[#6B6963] mb-3">
            Built for everyone.
          </p>
          <Ticker />
          <p className="text-base md:text-lg text-[#6B6963] mt-6 max-w-lg mx-auto">
            Harness deep intelligence and automation to close deals faster, easier, and smarter.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center mt-8 px-10 py-4 bg-[#DA7756] text-white text-lg font-medium rounded-full hover:bg-[#C4684A] no-underline transition-colors"
          >
            Meet Yulia &rarr;
          </Link>
          <p className="text-sm text-[#6B6963] opacity-50 mt-6">
            Available in 🇺🇸 🇬🇧 🇨🇦 🇦🇺 and 20+ countries
          </p>
        </div>
        <svg
          className="absolute bottom-8 left-1/2 w-5 h-5 text-[#6B6963] opacity-25"
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

      {/* Spacer so content starts below the fixed hero */}
      <div className="min-h-screen" />

      {/* ═══ SECTIONS 2–3: slide over the hero ═══ */}
      <div className="relative z-10">

        {/* ═══ SECTION 2: THE WAKE-UP CALL ═══ */}
        <section
          className="px-6 py-24 md:py-36 bg-white rounded-t-3xl"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.06)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#DA7756] mb-8">
                The reality
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] leading-tight"
                style={SERIF}
              >
                Right now, someone is selling a business just like yours — for 30% less than it&apos;s worth.
              </h2>
            </FadeIn>

            {/* Editorial-style left-aligned copy */}
            <div className="max-w-2xl mx-auto mt-12 space-y-8 text-left">
              <FadeIn delay={200}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  Last year, over 10,000 small businesses sold below market value. Not because the businesses were bad — because the owners didn&apos;t have the right intelligence at the right time.
                </p>
              </FadeIn>
              <FadeIn delay={300}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  They priced too low because they used a free calculator. They found the wrong buyer because they didn&apos;t know who was actually acquiring in their space. They lost leverage in negotiation because nobody prepared them for the questions that were coming.
                </p>
              </FadeIn>
              <FadeIn delay={400}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  This is the most important financial decision you will ever make. And right now, most people are making it alone.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={500}>
              <p
                className="text-2xl md:text-3xl text-[#DA7756] font-medium italic mt-12"
                style={SERIF}
              >
                You don&apos;t have to.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ═══ SECTION 3: THE SHIFT ═══ */}
        <section className="px-6 py-24 md:py-36 bg-[#FAF9F5] text-center">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] leading-tight"
                style={SERIF}
              >
                What if you had an unfair advantage?
              </h2>
            </FadeIn>
            <div className="max-w-2xl mx-auto mt-12 space-y-6">
              <FadeIn delay={100}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  What if you knew exactly what your business was worth — not a range, not a guess — before you talked to a single buyer?
                </p>
              </FadeIn>
              <FadeIn delay={200}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  What if someone had already identified the 50 most likely acquirers in your industry and ranked them by fit?
                </p>
              </FadeIn>
              <FadeIn delay={300}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  What if every document you needed — valuation, offering memorandum, financial analysis — was built before anyone asked for it?
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={400}>
              <p
                className="text-xl md:text-2xl text-[#1A1A18] font-medium mt-12"
                style={SERIF}
              >
                This isn&apos;t hypothetical. This exists. Right now.
              </p>
            </FadeIn>
          </div>
        </section>
      </div>

      {/* ═══ SECTION 4: MEET YULIA (sticky dark curtain) ═══ */}
      <section className="sticky top-0 z-20 min-h-screen flex items-center justify-center px-6 bg-[#1A1A18]">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-[#DA7756] mb-6">
            Introducing
          </p>
          <h2
            className="text-6xl md:text-8xl font-medium text-white leading-none"
            style={SERIF}
          >
            Yulia.
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mt-4">
            Your AI deal advisor.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { value: '80+', label: 'Industries Analyzed' },
              { value: '24/7', label: 'Always On' },
              { value: '90%', label: 'Less Than Traditional Fees' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl md:text-5xl font-medium text-[#DA7756] m-0" style={SERIF}>
                  {s.value}
                </p>
                <p className="text-sm md:text-base text-gray-400 mt-2 m-0">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-lg text-gray-400 max-w-lg mx-auto leading-relaxed mt-12">
            She doesn&apos;t guess. She doesn&apos;t hallucinate. She doesn&apos;t charge by the hour. She just works.
          </p>
        </div>
      </section>

      {/* ═══ SECTIONS 5–8: slide over Yulia ═══ */}
      <div className="relative z-30">

        {/* ═══ SECTION 5: WHAT SHE DOES ═══ */}
        <section
          className="px-6 py-24 md:py-36 bg-white rounded-t-3xl"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.1)' }}
        >
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-8 text-center">
                The deliverables
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center leading-tight"
                style={SERIF}
              >
                She doesn&apos;t just advise. She builds.
              </h2>
            </FadeIn>
            <div className="mt-16 space-y-16 md:space-y-20">
              {DELIVERABLES.map((text, i) => (
                <FadeIn key={i} delay={200 + i * 100}>
                  <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                    <span
                      className="text-5xl md:text-7xl font-bold text-[#DA7756] opacity-15 shrink-0 leading-none"
                      style={SERIF}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed mt-2 md:mt-2">
                      {text}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 6: THE CONTRAST ═══ */}
        <section className="px-6 py-24 md:py-36 bg-[#FAF9F5]">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center mb-16"
                style={SERIF}
              >
                Two ways this goes.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <FadeIn delay={100}>
                <div className="bg-white rounded-2xl p-8 md:p-12">
                  <h3 className="text-xl md:text-2xl font-medium text-[#6B6963] mb-8" style={SERIF}>
                    Without Yulia
                  </h3>
                  <div className="space-y-4">
                    <p className="text-base md:text-lg text-[#6B6963]">You undervalue your business by 20-40%.</p>
                    <p className="text-base md:text-lg text-[#6B6963]">You spend six months talking to the wrong buyers.</p>
                    <p className="text-base md:text-lg text-[#6B6963]">Your deal falls apart in due diligence.</p>
                    <p className="text-base md:text-lg text-[#6B6963]">You pay a broker 10% and still do most of the work.</p>
                    <p className="text-base md:text-lg text-[#6B6963]">You wonder for years if you left money on the table.</p>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={250}>
                <div className="bg-[#1A1A18] rounded-2xl p-8 md:p-12">
                  <h3 className="text-xl md:text-2xl font-medium text-[#DA7756] mb-8" style={SERIF}>
                    With Yulia
                  </h3>
                  <div className="space-y-4">
                    <p className="text-base md:text-lg text-gray-300">You know exactly what your business is worth.</p>
                    <p className="text-base md:text-lg text-gray-300">You talk only to qualified, serious buyers.</p>
                    <p className="text-base md:text-lg text-gray-300">Every document is ready before anyone asks.</p>
                    <p className="text-base md:text-lg text-gray-300">You pay a fraction of traditional advisory fees.</p>
                    <p className="text-base md:text-lg text-gray-300">You close knowing you got the best possible outcome.</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 7: THE PATHS ═══ */}
        <section className="px-6 py-24 md:py-36 bg-white">
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
                <FadeIn key={j.href} delay={100 + i * 100}>
                  <Link
                    href={j.href}
                    className="block bg-[#FAF9F5] rounded-2xl p-8 md:p-10 no-underline hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3
                      className="text-xl md:text-2xl font-medium text-[#1A1A18]"
                      style={SERIF}
                    >
                      {j.title}
                    </h3>
                    <p className="text-base md:text-lg text-[#6B6963] mt-3">
                      {j.description}
                    </p>
                    <span className="inline-block text-[#DA7756] font-medium mt-6">
                      Start free &rarr;
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 8: FINAL CTA ═══ */}
        <section className="px-6 py-24 md:py-36 bg-[#1A1A18] text-center">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2
                className="text-3xl md:text-5xl font-medium text-white"
                style={SERIF}
              >
                Your next deal starts with one conversation.
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="text-lg md:text-xl text-gray-400 mt-6 max-w-xl mx-auto">
                No credit card. No commitment. No minimums. Just an expert who&apos;s ready when you are.
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
            <FadeIn delay={300}>
              <p className="text-sm text-gray-500 mt-8">
                Available in 🇺🇸 🇬🇧 🇨🇦 🇦🇺 and 20+ countries
              </p>
            </FadeIn>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
