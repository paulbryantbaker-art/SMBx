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

const WHAT_IFS = [
  'What if you knew exactly what your business was worth — not a range, not a guess — before you talked to a single buyer?',
  'What if someone had already identified the 50 most likely acquirers in your industry and ranked them by fit?',
  'What if every document — valuation, memorandum, financial analysis — was ready before anyone asked?',
];

const DELIVERABLES = [
  'A clear picture of what your business is actually worth — backed by real market data, not guesswork.',
  'Financial analysis that shows buyers the real story, not the tax story.',
  'An offering memorandum so compelling that buyers compete to talk to you.',
  'A ranked list of the buyers most likely to close — based on acquisition history and strategic fit.',
  'Due diligence preparation that answers every question before it gets asked.',
  'Negotiation strategy built around your specific leverage points and walk-away number.',
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden w-full mt-3 group">
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const yuliaStarted = useRef(false);

  useEffect(() => {
    const el = yuliaRef.current;
    if (!el) return;
    /* trigger typing animation on first appearance */
    const enterObs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setYuliaEntered(true); enterObs.unobserve(el); } },
      { threshold: 0.2 },
    );
    enterObs.observe(el);
    return () => enterObs.disconnect();
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

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = yuliaRef.current;
          if (!el) { ticking = false; return; }
          const rect = el.getBoundingClientRect();
          const navH = 64;
          const startY = window.innerHeight * 0.25;
          const endY = navH;
          if (rect.top >= startY) {
            setScrollProgress(0);
          } else if (rect.top <= endY) {
            setScrollProgress(1);
          } else {
            setScrollProgress(1 - (rect.top - endY) / (startY - endY));
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <PublicLayout>
      {/* ═══════════════════════════════════════
          SECTION 1 · HERO — centered, massive type
          ═══════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center px-6 py-20 md:py-32 bg-[#FAF9F5] min-h-[80vh] md:min-h-screen">
        <div className="text-center flex flex-col items-center max-w-5xl w-full">
          <span className="inline-block bg-[#F0EDE6] text-[#6B6963] text-sm px-4 py-1.5 rounded-full mb-8">
            AI-Powered M&amp;A Advisory
          </span>
          <h1
            className="text-5xl md:text-8xl lg:text-9xl text-[#1A1A18] font-medium leading-tight tracking-tight mb-8"
            style={SERIF}
          >
            Sell or buy<br />
            any business, <span className="text-[#DA7756]">anywhere</span>.
          </h1>
          <p className="text-lg md:text-xl text-[#6B6963] mt-8">Built for everyone.</p>
          <Ticker />
          <p className="text-base md:text-lg text-[#6B6963] mt-6 max-w-md mx-auto">
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

      {/* ═══════════════════════════════════════
          SECTION 2 · WAKE-UP — asymmetric split
          ═══════════════════════════════════════ */}
      <section className="bg-white px-6 py-20 md:py-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* LEFT — the punch */}
            <FadeIn>
              <div>
                <p className="text-sm uppercase tracking-widest text-[#DA7756] mb-4">The reality</p>
                <p className="text-xl md:text-2xl text-[#6B6963]" style={SERIF}>
                  Right now, someone is selling a business just like yours for
                </p>
                <div className="my-2">
                  <CountUp
                    target={30} suffix="%" delay={200}
                    className="block text-6xl md:text-8xl font-bold text-[#DA7756] leading-none"
                    style={SERIF}
                  />
                  <span className="block text-2xl md:text-3xl font-bold text-[#DA7756] mt-1" style={SERIF}>
                    less
                  </span>
                </div>
                <p className="text-xl md:text-2xl text-[#6B6963]" style={SERIF}>
                  than it&apos;s worth.
                </p>
              </div>
            </FadeIn>

            {/* RIGHT — context card */}
            <FadeIn delay={150}>
              <div className="bg-[#FAF9F5] rounded-2xl p-8 md:p-10">
                <div className="space-y-6 text-base md:text-lg text-[#6B6963] leading-relaxed">
                  <p>
                    Last year, over 10,000 small businesses sold below market value. Not because the businesses were bad — because the owners didn&apos;t have the right intelligence at the right time.
                  </p>
                  <p>
                    They priced too low. Found the wrong buyer. Lost leverage in negotiation.
                  </p>
                  <p>
                    This is the <span className="text-[#1A1A18] font-semibold">most important financial decision</span> you will ever make.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* The breather */}
          <div className="py-16 text-center">
            <FadeIn duration={1000}>
              <p
                className="text-3xl md:text-6xl text-[#1A1A18] font-medium italic leading-tight max-w-4xl mx-auto"
                style={SERIF}
              >
                You don&apos;t have to do this alone.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ─── SECTION 3 · THE SHIFT — 3-column card grid ─── */}
        <section className="bg-[#FAF9F5] px-6 py-20 md:py-32">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl leading-tight text-center md:text-left" style={SERIF}>
                <span className="text-[#6B6963]">What if you had an </span>
                <span className="text-[#1A1A18] font-semibold">unfair advantage?</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {WHAT_IFS.map((text, i) => (
                <FadeIn key={i} delay={100 + i * 150}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <span
                      className="block text-[#DA7756] text-6xl opacity-20 leading-none -mb-4 select-none"
                      style={SERIF}
                    >
                      &ldquo;
                    </span>
                    <p className="text-lg md:text-xl text-[#6B6963] leading-relaxed italic" style={SERIF}>
                      {text}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={600}>
              <div className="mt-16 text-center" style={SERIF}>
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

      {/* ═══════════════════════════════════════
          SECTION 4 · MEET YULIA — morphing card
          ═══════════════════════════════════════ */}
      <div className="relative bg-[#FAF9F5]" style={{ minHeight: '80vh' }}>
        <section
          ref={yuliaRef}
          className="sticky flex items-start justify-center px-6 bg-[#FAF9F5] will-change-transform"
          style={{
            top: '64px',
            paddingTop: `${lerp(80, 0, scrollProgress)}px`,
            paddingBottom: `${lerp(80, 0, scrollProgress)}px`,
            zIndex: 30,
          }}
        >
          <div
            className="bg-white w-full text-center transition-shadow duration-150"
            style={{
              maxWidth: `${lerp(768, 1280, scrollProgress)}px`,
              borderRadius: `${lerp(24, 0, scrollProgress)}px`,
              padding: `${lerp(48, 12, scrollProgress)}px ${lerp(64, 24, scrollProgress)}px`,
              boxShadow: scrollProgress < 0.8
                ? '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.07)'
                : '0 1px 3px rgba(0,0,0,0.05)',
              borderBottom: scrollProgress > 0.8 ? '1px solid #E8E5DF' : '1px solid transparent',
            }}
          >
            {/* Mini layout: row with name left, button right */}
            <div style={{
              display: 'flex',
              flexDirection: scrollProgress > 0.7 ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: scrollProgress > 0.7 ? 'space-between' : 'center',
              gap: scrollProgress > 0.7 ? '16px' : '0px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: scrollProgress > 0.7 ? 'row' : 'column',
                alignItems: 'center',
                gap: scrollProgress > 0.7 ? '12px' : '0px',
              }}>
                {/* Eyebrow */}
                <p
                  className="text-sm uppercase tracking-widest text-[#DA7756]"
                  style={{
                    opacity: lerp(1, 0, Math.min(scrollProgress * 2, 1)),
                    maxHeight: scrollProgress > 0.4 ? '0px' : '40px',
                    overflow: 'hidden',
                    marginBottom: scrollProgress > 0.4 ? '0px' : '12px',
                    transition: 'max-height 0.15s',
                  }}
                >
                  Introducing
                </p>

                {/* Name */}
                <h2
                  className="font-medium text-[#1A1A18] leading-none"
                  style={{
                    ...SERIF,
                    fontSize: `${lerp(72, 20, scrollProgress)}px`,
                  }}
                >
                  {yuliaText || 'Yulia'}
                  <span style={{ opacity: showPeriod || scrollProgress > 0 ? 1 : 0 }}>.</span>
                  {showCursor && (
                    <span className="text-[#DA7756] ml-1" style={{ opacity: cursorOn ? 1 : 0 }}>|</span>
                  )}
                </h2>

                {/* Subtitle */}
                <p
                  className="text-[#6B6963]"
                  style={{
                    fontSize: `${lerp(20, 14, scrollProgress)}px`,
                    opacity: scrollProgress > 0.8 ? (scrollProgress > 0.9 ? 1 : 0.5) : (yuliaDone ? 1 : 0),
                    marginTop: scrollProgress > 0.7 ? '0px' : '8px',
                  }}
                >
                  Your AI deal advisor.
                </p>
              </div>

              {/* CTA button - visible in mini mode */}
              <Link
                href="/signup"
                className="bg-[#DA7756] text-white rounded-full font-medium no-underline hover:bg-[#C4684A] transition-colors whitespace-nowrap"
                style={{
                  opacity: lerp(0, 1, Math.max((scrollProgress - 0.5) * 2, 0)),
                  pointerEvents: scrollProgress > 0.6 ? 'auto' as const : 'none' as const,
                  padding: `${lerp(16, 8, scrollProgress)}px ${lerp(40, 16, scrollProgress)}px`,
                  fontSize: `${lerp(18, 14, scrollProgress)}px`,
                  position: scrollProgress > 0.7 ? 'static' as const : 'absolute' as const,
                  ...(scrollProgress <= 0.7 ? { bottom: '-50px', left: '50%', transform: 'translateX(-50%)' } : {}),
                }}
              >
                Meet Yulia &rarr;
              </Link>
            </div>

            {/* Stats - fade out as we scroll */}
            <div
              className="grid grid-cols-3 gap-4 md:gap-8"
              style={{
                opacity: lerp(1, 0, Math.min(scrollProgress * 2.5, 1)),
                maxHeight: scrollProgress > 0.3 ? '0px' : '200px',
                overflow: 'hidden',
                marginTop: scrollProgress > 0.3 ? '0px' : '24px',
                transition: 'max-height 0.15s',
              }}
            >
              <div className="text-center">
                <p className="text-2xl md:text-5xl font-medium text-[#DA7756] m-0" style={SERIF}>
                  <CountUp target={80} suffix="+" active={yuliaDone} />
                </p>
                <p className="text-[10px] md:text-sm text-[#6B6963] mt-1 m-0 uppercase tracking-wider">Industries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-5xl font-medium text-[#DA7756] m-0" style={SERIF}>24/7</p>
                <p className="text-[10px] md:text-sm text-[#6B6963] mt-1 m-0 uppercase tracking-wider">Always On</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-5xl font-medium text-[#DA7756] m-0" style={SERIF}>
                  <CountUp target={90} suffix="%" active={yuliaDone} />
                </p>
                <p className="text-[10px] md:text-sm text-[#6B6963] mt-1 m-0 uppercase tracking-wider">Cost Savings</p>
              </div>
            </div>

            {/* Tagline - fade out */}
            <p
              className="text-lg text-[#6B6963] italic leading-relaxed"
              style={{
                ...SERIF,
                opacity: lerp(yuliaDone ? 1 : 0, 0, Math.min(scrollProgress * 2, 1)),
                maxHeight: scrollProgress > 0.3 ? '0px' : '80px',
                overflow: 'hidden',
                marginTop: scrollProgress > 0.3 ? '0px' : '24px',
                transition: 'max-height 0.15s',
              }}
            >
              Now you&apos;ll never wonder if you left money on the table.
            </p>
          </div>
        </section>
      </div>

      {/* ─── SECTION 5 · DELIVERABLES — 2-col card grid ─── */}
      <section className="bg-white px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-[#6B6963] mb-6 text-center">
                Your deliverables
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="text-3xl md:text-5xl text-center leading-tight" style={SERIF}>
                <span className="text-[#6B6963]">Everything you need.</span>
                <br />
                <span className="text-[#1A1A18] font-semibold">Nothing you don&apos;t.</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
              {DELIVERABLES.map((text, i) => (
                <FadeIn key={i} delay={150 + i * 100}>
                  <div className="bg-[#FAF9F5] rounded-2xl p-6 md:p-8 hover:shadow-md transition-all duration-300 h-full">
                    <span
                      className="block text-[#DA7756] text-4xl font-bold opacity-15 mb-2"
                      style={SERIF}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base md:text-lg text-[#6B6963] leading-relaxed">
                      {text}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 6 · TWO PATHS — contrasting cards ─── */}
        <section className="bg-[#FAF9F5] px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <h2
                className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center mb-14"
                style={SERIF}
              >
                Two ways this goes.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FadeIn delay={100}>
                <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E8E5DF] h-full">
                  <h3 className="text-xl md:text-2xl font-medium text-[#6B6963] mb-8" style={SERIF}>
                    The old way
                  </h3>
                  <div className="space-y-5">
                    {[
                      'You undervalue your business by 20-40%.',
                      'Six months talking to the wrong buyers.',
                      'Deal falls apart in due diligence.',
                      'You pay a broker 10% and still do most of the work.',
                      'Years wondering if you left money on the table.',
                    ].map((line) => (
                      <p key={line} className="text-base md:text-lg text-[#6B6963]">
                        <span className="text-[#DA7756] mr-3">&mdash;</span>{line}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={250}>
                <div className="bg-[#DA7756] rounded-2xl p-8 md:p-12 h-full">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-8" style={SERIF}>
                    With Yulia
                  </h3>
                  <div className="space-y-5">
                    {[
                      'You know exactly what your business is worth.',
                      'Only qualified, serious buyers.',
                      'Every document ready before anyone asks.',
                      'A fraction of traditional advisory fees.',
                      'Close knowing you got the best possible outcome.',
                    ].map((line) => (
                      <p key={line} className="text-base md:text-lg text-white/90">
                        <span className="text-white mr-3">&mdash;</span>{line}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7 · PATHS — 2×2 card grid ─── */}
        <section className="bg-white px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
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
                    className="group block bg-[#FAF9F5] rounded-2xl p-8 md:p-10 no-underline hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3
                      className="text-xl md:text-2xl font-medium text-[#1A1A18]"
                      style={SERIF}
                    >
                      {j.title}
                    </h3>
                    <p className="text-base md:text-lg text-[#6B6963] mt-3">{j.description}</p>
                    <span className="inline-block text-[#DA7756] font-medium mt-5 transition-transform duration-200 group-hover:translate-x-1">
                      Start free &rarr;
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 8 · CTA — terra cotta card ─── */}
        <section className="px-6 py-20 md:py-32 bg-[#FAF9F5]">
          <FadeIn className="max-w-3xl mx-auto">
            <div className="bg-[#DA7756] rounded-3xl shadow-xl p-10 md:p-16 text-center">
              <h2
                className="text-2xl md:text-4xl font-medium text-white leading-tight"
                style={SERIF}
              >
                Your next deal starts with one conversation.
              </h2>
              <p className="text-base md:text-lg text-white/70 mt-6">
                No credit card. No commitment. No minimums.
              </p>
              <p className="text-base md:text-lg text-white/80 mt-2">
                Just an expert who&apos;s ready when you are.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center mt-8 px-10 py-4 bg-white text-[#DA7756] text-lg font-medium rounded-full hover:bg-gray-100 no-underline transition-colors"
              >
                Meet Yulia &rarr;
              </Link>
              <p className="text-sm text-white/50 mt-6">
                Available in 🇺🇸 🇬🇧 🇨🇦 🇦🇺 and 20+ countries
              </p>
            </div>
          </FadeIn>
        </section>
    </PublicLayout>
  );
}
