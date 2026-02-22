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

const WHAT_IFS = [
  'What if you knew exactly what your business was worth — not a range, not a guess — before you talked to a single buyer?',
  'What if someone had already identified the 50 most likely acquirers in your industry and ranked them by fit?',
  'What if every document — valuation, memorandum, financial analysis — was ready before anyone asked?',
];

const JOURNEYS = [
  { title: 'Sell your business', description: 'Know your number. Find your buyer. Close on your terms.', href: '/sell' },
  { title: 'Buy a business', description: 'Define your thesis. Source targets. Model the returns.', href: '/buy' },
  { title: 'Raise capital', description: 'Bring on investors. Keep control. Grow on your terms.', href: '/raise' },
  { title: 'Post-acquisition', description: 'Your first 100 days, done right. Nothing falls through the cracks.', href: '/integrate' },
];

/* ─────────────────────────────────────────
   Animation primitives
   ───────────────────────────────────────── */

function useOnScreen(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* Fade up from below */
function FadeIn({ children, className = '', delay = 0, duration = 700 }: {
  children: ReactNode; className?: string; delay?: number; duration?: number;
}) {
  const { ref, visible } = useOnScreen();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
    }}>{children}</div>
  );
}

/* Slide in from left */
function SlideIn({ children, className = '', delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  const { ref, visible } = useOnScreen(0.1);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-20px)',
      transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
    }}>{children}</div>
  );
}

/* Animated counter — self-triggering (IntersectionObserver) or externally controlled */
function CountUp({ target, suffix = '', active, delay = 0, className, style }: {
  target: number; suffix?: string; active?: boolean; delay?: number;
  className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (active !== undefined) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);

  const shouldStart = active !== undefined ? active : inView;

  useEffect(() => {
    if (!shouldStart || started.current) return;
    started.current = true;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const run = (now: number) => {
        const p = Math.min((now - t0) / 1500, 1);
        setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, delay);
    return () => clearTimeout(timer);
  }, [shouldStart, target, delay]);

  return <span ref={ref} className={className} style={style}>{value}{suffix}</span>;
}

/* Horizontal ticker */
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
            {item}<span className="text-[#DA7756] mx-3">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
   ───────────────────────────────────────── */

export default function Home() {
  /* ── Yulia typing state ── */
  const yuliaRef = useRef<HTMLElement>(null);
  const [yuliaEntered, setYuliaEntered] = useState(false);
  const [yuliaText, setYuliaText] = useState('');
  const [showPeriod, setShowPeriod] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);
  const [yuliaDone, setYuliaDone] = useState(false);
  const yuliaStarted = useRef(false);

  useEffect(() => {
    const el = yuliaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setYuliaEntered(true); obs.unobserve(el); } },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!yuliaEntered || yuliaStarted.current) return;
    yuliaStarted.current = true;
    setShowCursor(true);
    const name = 'Yulia';
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < name.length; i++) {
      timers.push(setTimeout(() => setYuliaText(name.slice(0, i + 1)), i * 120));
    }
    timers.push(setTimeout(() => setShowPeriod(true), name.length * 120 + 200));
    timers.push(setTimeout(() => setYuliaDone(true), name.length * 120 + 500));
    timers.push(setTimeout(() => setShowCursor(false), name.length * 120 + 800));
    return () => timers.forEach(clearTimeout);
  }, [yuliaEntered]);

  useEffect(() => {
    if (!showCursor) return;
    const id = setInterval(() => setCursorOn(v => !v), 500);
    return () => clearInterval(id);
  }, [showCursor]);

  return (
    <PublicLayout>
      {/* ═══════════════════════════════════════
          SECTION 1 · HERO (fixed, z-0)
          ═══════════════════════════════════════ */}
      <section className="fixed inset-0 z-0 flex flex-col items-center justify-center px-6 bg-[#FAF9F5]">
        <div className="text-center flex flex-col items-center max-w-4xl w-full">
          <span className="inline-block bg-[#F0EDE6] text-[#6B6963] text-sm px-4 py-1.5 rounded-full mb-8">
            AI-Powered M&amp;A Advisory
          </span>
          <h1 className="text-4xl md:text-7xl text-[#1A1A18] font-medium leading-tight tracking-tight mb-8" style={SERIF}>
            Sell or buy<br />
            any business, <span className="text-[#DA7756]">anywhere</span>.
          </h1>
          <p className="text-lg md:text-xl text-[#6B6963] mb-3">Built for everyone.</p>
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
          viewBox="0 0 20 20" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M4 7l6 6 6-6" />
        </svg>
      </section>

      {/* Spacer */}
      <div className="min-h-screen" />

      {/* ═══════════════════════════════════════
          SECTIONS 2–3 · slide over hero
          ═══════════════════════════════════════ */}
      <div className="relative z-10">

        {/* ─── SECTION 2 · THE WAKE-UP CALL ─── */}
        <section
          className="bg-white rounded-t-3xl"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.06)' }}
        >
          {/* Part A — The punch */}
          <div className="px-6 py-24 md:py-36 text-center">
            <div className="max-w-3xl mx-auto">
              <FadeIn>
                <p className="text-sm uppercase tracking-widest text-[#DA7756] mb-8">The reality</p>
              </FadeIn>
              <FadeIn delay={100}>
                <p className="text-2xl md:text-4xl text-[#6B6963]" style={SERIF}>
                  Right now, someone is selling a business just like yours for
                </p>
              </FadeIn>
              <div className="my-4 md:my-6">
                <CountUp
                  target={30} suffix="%" delay={200}
                  className="block text-7xl md:text-[10rem] font-bold text-[#DA7756] leading-none"
                  style={SERIF}
                />
                <span className="block text-3xl md:text-5xl font-bold text-[#DA7756] mt-1" style={SERIF}>
                  less
                </span>
              </div>
              <FadeIn delay={300}>
                <p className="text-2xl md:text-4xl text-[#6B6963]" style={SERIF}>
                  than it&apos;s worth.
                </p>
              </FadeIn>
            </div>

            {/* Part B — The agitation */}
            <div className="max-w-2xl mx-auto mt-16 md:mt-24 space-y-8 text-left">
              <FadeIn delay={400}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  Last year, over 10,000 small businesses sold below market value. Not because the businesses were bad — because the owners didn&apos;t have the right intelligence at the right time.
                </p>
              </FadeIn>
              <FadeIn delay={550}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  They priced too low. Found the wrong buyer. Lost leverage in negotiation. And most of them will never know how much they left on the table.
                </p>
              </FadeIn>
              <FadeIn delay={700}>
                <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                  This is the <span className="text-[#1A1A18] font-semibold">most important financial decision</span> you will ever make.
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Part C — The breather */}
          <div className="px-6 py-16 md:py-24 text-center">
            <FadeIn duration={1000}>
              <p className="text-4xl md:text-7xl text-[#1A1A18] font-medium italic leading-tight max-w-4xl mx-auto" style={SERIF}>
                You don&apos;t have to do this alone.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ─── SECTION 3 · THE SHIFT ─── */}
        <section className="px-6 py-24 md:py-36 bg-[#FAF9F5] text-center">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl leading-tight" style={SERIF}>
                <span className="text-[#6B6963]">What if you had an </span>
                <span className="text-[#1A1A18] font-semibold">unfair advantage?</span>
              </h2>
            </FadeIn>

            <div className="max-w-2xl mx-auto mt-16 space-y-16">
              {WHAT_IFS.map((text, i) => (
                <FadeIn key={i} delay={100 + i * 150}>
                  <div>
                    <span
                      className="block text-[#DA7756] text-8xl md:text-9xl opacity-15 leading-none -mb-8 select-none"
                      style={SERIF}
                    >
                      &ldquo;
                    </span>
                    <p className="text-xl md:text-2xl text-[#6B6963] leading-relaxed italic" style={SERIF}>
                      {text}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={600}>
              <div className="mt-16" style={SERIF}>
                <p className="text-2xl md:text-4xl font-medium text-[#1A1A18]">
                  This isn&apos;t hypothetical.
                </p>
                <p className="text-2xl md:text-4xl font-medium text-[#DA7756] mt-1">
                  This exists. Right now.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════
          SECTION 4 · MEET YULIA (sticky curtain)
          ═══════════════════════════════════════ */}
      <section
        ref={yuliaRef}
        className="sticky top-0 z-20 min-h-screen flex items-center justify-center px-6 bg-[#1A1A18]"
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow */}
          <p
            className="text-sm uppercase tracking-widest text-[#DA7756] mb-8"
            style={{ opacity: yuliaEntered ? 1 : 0, transition: 'opacity 500ms ease-out' }}
          >
            Introducing
          </p>

          {/* Typed name */}
          <h2 className="text-7xl md:text-[12rem] font-medium text-white leading-none" style={SERIF}>
            {yuliaText}
            <span style={{ opacity: showPeriod ? 1 : 0, transition: 'opacity 300ms ease-out' }}>.</span>
            {showCursor && (
              <span
                className="text-[#DA7756] ml-1 md:ml-2 inline-block"
                style={{ opacity: cursorOn ? 1 : 0, transition: 'opacity 100ms' }}
              >
                |
              </span>
            )}
          </h2>

          {/* Subtitle */}
          <p
            className="text-xl md:text-2xl text-gray-400 mt-4"
            style={{
              opacity: yuliaDone ? 1 : 0,
              transform: yuliaDone ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 700ms ease-out, transform 700ms ease-out',
            }}
          >
            Your AI deal advisor.
          </p>

          {/* Stats */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            style={{
              opacity: yuliaDone ? 1 : 0,
              transform: yuliaDone ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 700ms ease-out 300ms, transform 700ms ease-out 300ms',
            }}
          >
            <div className="text-center">
              <p className="text-4xl md:text-6xl font-medium text-[#DA7756] m-0" style={SERIF}>
                <CountUp target={80} suffix="+" active={yuliaDone} />
              </p>
              <p className="text-sm md:text-base text-gray-500 mt-2 m-0 uppercase tracking-wider">Industries Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-6xl font-medium text-[#DA7756] m-0" style={SERIF}>24/7</p>
              <p className="text-sm md:text-base text-gray-500 mt-2 m-0 uppercase tracking-wider">Always On</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-6xl font-medium text-[#DA7756] m-0" style={SERIF}>
                <CountUp target={90} suffix="%" active={yuliaDone} />
              </p>
              <p className="text-sm md:text-base text-gray-500 mt-2 m-0 uppercase tracking-wider">Less Than Traditional Fees</p>
            </div>
          </div>

          {/* Tagline */}
          <p
            className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto leading-relaxed mt-12"
            style={{
              opacity: yuliaDone ? 1 : 0,
              transition: 'opacity 700ms ease-out 600ms',
            }}
          >
            She <span className="text-gray-300">doesn&apos;t</span> guess.
            {' '}She <span className="text-gray-300">doesn&apos;t</span> hallucinate.
            {' '}She <span className="text-gray-300">doesn&apos;t</span> charge by the hour.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTIONS 5–8 · slide over Yulia
          ═══════════════════════════════════════ */}
      <div className="relative z-30">

        {/* ─── SECTION 5 · WHAT SHE BUILDS ─── */}
        <section
          className="px-6 py-24 md:py-36 bg-white rounded-t-3xl"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}
        >
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-8 text-center">
                The deliverables
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="text-3xl md:text-5xl text-center leading-tight" style={SERIF}>
                <span className="text-[#6B6963]">She doesn&apos;t just advise.</span>
                <br />
                <span className="text-[#1A1A18] font-semibold">She builds.</span>
              </h2>
            </FadeIn>
            <div className="mt-16">
              {DELIVERABLES.map((text, i) => (
                <SlideIn key={i} delay={200 + i * 100}>
                  <div className="flex items-start py-6 border-b border-[#F0EDE6]">
                    <span
                      className="text-3xl md:text-5xl font-bold text-[#DA7756] opacity-20 w-16 md:w-24 shrink-0 leading-none"
                      style={SERIF}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed">
                      {text}
                    </p>
                  </div>
                </SlideIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 6 · THE CONTRAST ─── */}
        <section className="px-6 py-24 md:py-36 bg-[#FAF9F5]">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center mb-16" style={SERIF}>
                Two ways this goes.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FadeIn delay={100}>
                <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E5E2DC]">
                  <h3 className="text-xl md:text-2xl font-medium text-[#6B6963] mb-8" style={SERIF}>
                    The old way
                  </h3>
                  <div className="space-y-5">
                    {[
                      'You undervalue your business by 20-40%.',
                      'You spend six months talking to the wrong buyers.',
                      'Your deal falls apart in due diligence.',
                      'You pay a broker 10% and still do most of the work.',
                      'You wonder for years if you left money on the table.',
                    ].map((line) => (
                      <p key={line} className="text-base md:text-lg text-[#6B6963]">
                        <span className="text-[#DA7756] mr-2">&mdash;</span>{line}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={250}>
                <div className="bg-[#1A1A18] rounded-2xl p-8 md:p-12">
                  <h3 className="text-xl md:text-2xl font-medium text-[#DA7756] mb-8" style={SERIF}>
                    With Yulia
                  </h3>
                  <div className="space-y-5">
                    {[
                      'You know exactly what your business is worth.',
                      'You talk only to qualified, serious buyers.',
                      'Every document is ready before anyone asks.',
                      'You pay a fraction of traditional fees.',
                      'You close knowing you got the best possible outcome.',
                    ].map((line) => (
                      <p key={line} className="text-base md:text-lg text-gray-300">
                        <span className="text-white mr-2">&mdash;</span>{line}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7 · THE PATHS ─── */}
        <section className="px-6 py-24 md:py-36 bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center" style={SERIF}>
                What brings you here?
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
              {JOURNEYS.map((j, i) => (
                <FadeIn key={j.href} delay={100 + i * 100}>
                  <Link
                    href={j.href}
                    className="group block bg-[#FAF9F5] rounded-2xl p-8 md:p-10 no-underline hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3 className="text-xl md:text-2xl font-medium text-[#1A1A18]" style={SERIF}>
                      {j.title}
                    </h3>
                    <p className="text-base md:text-lg text-[#6B6963] mt-3">{j.description}</p>
                    <span className="inline-block text-[#DA7756] font-medium mt-6 transition-transform duration-200 group-hover:translate-x-1">
                      Start free &rarr;
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 8 · FINAL CTA ─── */}
        <section className="px-6 py-24 md:py-36 bg-[#1A1A18] text-center">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-6xl font-medium text-white leading-tight" style={SERIF}>
                Your next deal starts with one conversation.
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="text-lg md:text-xl text-gray-500 mt-6">
                <span className="text-gray-300">No</span> credit card.
                {' '}<span className="text-gray-300">No</span> commitment.
                {' '}<span className="text-gray-300">No</span> minimums.
              </p>
            </FadeIn>
            <FadeIn delay={150}>
              <p className="text-lg md:text-xl text-gray-400 mt-2">
                Just an expert who&apos;s ready when you are.
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
              <p className="text-sm text-gray-600 mt-8">
                Available in 🇺🇸 🇬🇧 🇨🇦 🇦🇺 and 20+ countries
              </p>
            </FadeIn>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
