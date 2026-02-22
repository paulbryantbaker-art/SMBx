import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const FEARS = [
  'Am I pricing too low? Too high? How would I even know?',
  'What if I can\'t find a buyer — or worse, I find the wrong one?',
  'I don\'t have an offering memorandum. I\'m not even sure what goes in one.',
  'What happens during due diligence? What are they going to ask?',
  'If I hire a broker, is 10% of my life\'s work really the going rate?',
];

const STAGES = [
  {
    name: 'Intake & Discovery',
    price: 'FREE',
    free: true,
    description: 'Tell Yulia about your business — what you do, how long you\'ve been doing it, why you\'re thinking about selling. She\'ll ask the right questions to understand your situation and goals.',
    deliverables: 'A personalized deal profile, preliminary market positioning, and a clear roadmap of what comes next.',
  },
  {
    name: 'Financial Analysis',
    price: 'FREE',
    free: true,
    description: 'Yulia analyzes your financials and normalizes your books — recasting owner compensation, one-time expenses, and discretionary spending so buyers see the true earning power of your business.',
    deliverables: 'Normalized financial statements, SDE/EBITDA calculations, trend analysis, and a financial summary ready for buyer review.',
  },
  {
    name: 'Valuation',
    price: 'FROM $15',
    free: false,
    description: 'Using real market data, comparable transactions, and industry-specific multiples, Yulia builds a defensible valuation — not a range from a free calculator.',
    deliverables: 'A comprehensive valuation report with methodology, supporting data, market context, and a recommended asking price you can defend.',
  },
  {
    name: 'Deal Packaging',
    price: 'FROM $25',
    free: false,
    description: 'Yulia creates the materials that make buyers take you seriously — a professional offering memorandum, executive summary, and blind teaser that protects your identity while generating interest.',
    deliverables: 'Offering memorandum, executive summary, blind profile/teaser, and a complete information packet ready for qualified buyers.',
  },
  {
    name: 'Market Matching',
    price: 'FROM $35',
    free: false,
    description: 'Yulia identifies and ranks the buyers most likely to acquire your business — based on acquisition history, strategic fit, geographic proximity, and financial capacity.',
    deliverables: 'A ranked buyer list, outreach strategy, buyer qualification criteria, and tools to manage interest and offers.',
  },
  {
    name: 'Closing Support',
    price: 'FROM $50',
    free: false,
    description: 'From LOI review to due diligence preparation to closing checklist — Yulia makes sure nothing falls through the cracks in the final stretch.',
    deliverables: 'Due diligence preparation package, negotiation framework, closing checklist, and transition planning guidance.',
  },
];

/* ── Fade-in on scroll ── */
function FadeIn({ children, className = '', delay = 0, duration = 700 }: {
  children: ReactNode; className?: string; delay?: number; duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
    }}>{children}</div>
  );
}

/* ── Page ── */
export default function Sell() {
  return (
    <PublicLayout>
      {/* ═══════════════════════════════════════
          SECTION 1 · HERO — centered, bold
          ═══════════════════════════════════════ */}
      <section className="bg-[#FAF9F5] px-6 py-20 md:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-sm uppercase tracking-widest text-[#DA7756] mb-6">
              Sell your business
            </p>
          </FadeIn>
          <h1 style={SERIF}>
            <FadeIn delay={100}>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-medium leading-tight text-[#1A1A18]">
                Know your number.
              </span>
            </FadeIn>
            <FadeIn delay={250}>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-medium leading-tight text-[#1A1A18]">
                Find your buyer.
              </span>
            </FadeIn>
            <FadeIn delay={400}>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-medium leading-tight text-[#1A1A18]">
                Close on your terms.
              </span>
            </FadeIn>
          </h1>
          <FadeIn delay={550}>
            <p className="text-lg md:text-xl text-[#6B6963] mt-8 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a business owner exploring a sale or a broker managing a client&apos;s exit — Yulia builds the strategy, the documents, and the buyer pipeline.
            </p>
          </FadeIn>
          <FadeIn delay={650}>
            <Link
              href="/signup"
              className="inline-flex items-center mt-10 px-10 py-4 bg-[#DA7756] text-white text-lg font-medium rounded-full hover:bg-[#C4684A] no-underline transition-colors"
            >
              Start your seller journey &rarr;
            </Link>
            <p className="text-sm text-[#6B6963] opacity-60 mt-4">
              Free to start. Pay only when you&apos;re ready to move forward.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 · THE FEAR — asymmetric split
          ═══════════════════════════════════════ */}
      <section className="bg-white px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeIn>
            <div>
              <p className="text-sm uppercase tracking-widest text-[#DA7756] mb-4">
                The truth about selling
              </p>
              <h2 className="text-2xl md:text-4xl font-medium text-[#1A1A18] leading-tight" style={SERIF}>
                Most business owners have never done this before.
              </h2>
              <p className="text-lg md:text-xl text-[#6B6963] mt-6 leading-relaxed">
                And the ones who have will tell you — it was the hardest thing they&apos;ve ever done.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="bg-[#FAF9F5] rounded-2xl p-8 md:p-10">
              <h3 className="text-xl font-medium text-[#1A1A18] mb-6" style={SERIF}>
                What keeps sellers up at night
              </h3>
              <div className="space-y-4">
                {FEARS.map((fear) => (
                  <p key={fear} className="text-base md:text-lg text-[#6B6963] leading-relaxed">
                    {fear}
                  </p>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 · THE ANSWER — centered moment
          ═══════════════════════════════════════ */}
      <section className="bg-[#FAF9F5] px-6 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-medium text-[#1A1A18]" style={SERIF}>
              Yulia was built for exactly this moment.
            </h2>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="text-lg md:text-xl text-[#6B6963] mt-8 max-w-2xl mx-auto leading-relaxed">
              She walks you through every step — from &ldquo;should I sell?&rdquo; to &ldquo;where do I sign?&rdquo; — with the intelligence of a $50,000 advisor and the patience to answer every question you&apos;re afraid to ask.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 · THE JOURNEY — stage cards
          ═══════════════════════════════════════ */}
      <section className="bg-white px-6 py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-medium text-[#1A1A18]" style={SERIF}>
                Your selling journey. Stage by stage.
              </h2>
              <p className="text-lg md:text-xl text-[#6B6963] mt-4 max-w-2xl mx-auto">
                Every stage produces real deliverables. You pay only for the stages you need.
              </p>
            </div>
          </FadeIn>

          <div className="mt-16 space-y-12">
            {STAGES.map((stage, i) => (
              <FadeIn key={stage.name} delay={100 + i * 100}>
                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 md:gap-8 items-start">
                  {/* Big number */}
                  <span
                    className="text-7xl md:text-9xl font-bold text-[#DA7756] opacity-15 leading-none select-none"
                    style={SERIF}
                  >
                    {i + 1}
                  </span>

                  {/* Content card */}
                  <div className="bg-[#FAF9F5] rounded-2xl p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl md:text-2xl font-medium text-[#1A1A18]" style={SERIF}>
                        {stage.name}
                      </h3>
                      <span className={`text-sm font-medium rounded-full px-3 py-1 ${
                        stage.free
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#F0EDE6] text-[#6B6963]'
                      }`}>
                        {stage.price}
                      </span>
                    </div>
                    <p className="text-base md:text-lg text-[#6B6963] mt-4 leading-relaxed">
                      {stage.description}
                    </p>
                    <p className="text-base text-[#6B6963] mt-3">
                      <span className="text-[#1A1A18] font-medium">What you get: </span>
                      {stage.deliverables}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 · BROKER CALLOUT — full-width terra cotta
          ═══════════════════════════════════════ */}
      <section className="bg-[#DA7756] px-6 py-16 md:py-24">
        <FadeIn className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/60 mb-4">
                For brokers &amp; advisors
              </p>
              <h3 className="text-2xl md:text-4xl font-medium text-white leading-tight" style={SERIF}>
                You close deals. Let Yulia do the rest.
              </h3>
              <p className="text-base md:text-lg text-white/80 mt-6 leading-relaxed">
                Prep books, build CIMs, source buyers, manage pipeline — in a fraction of the time. Whether you&apos;re representing a seller or collaborating with other brokers on a deal, Yulia handles the heavy lifting. Your clients. Your commission. Her workflow.
              </p>
            </div>
            <div className="text-center md:text-right">
              <Link
                href="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-[#DA7756] text-lg font-medium rounded-full hover:bg-gray-100 no-underline transition-colors"
              >
                Start free &rarr;
              </Link>
              <p className="text-sm text-white/50 mt-4">
                No commitment. Works alongside your existing process.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 · THE CONTRAST — two cards
          ═══════════════════════════════════════ */}
      <section className="bg-white px-6 py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-medium text-[#1A1A18] text-center mb-14" style={SERIF}>
              Two ways to sell.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <FadeIn delay={100}>
              <div className="bg-[#FAF9F5] rounded-2xl p-8 md:p-12 border border-[#E8E5DF] h-full">
                <h3 className="text-xl md:text-2xl font-medium text-[#6B6963] mb-8" style={SERIF}>
                  Going it alone
                </h3>
                <div className="space-y-5">
                  {[
                    'Google \'what is my business worth\' at 2am.',
                    'Cobble together a CIM from a template you found.',
                    'Post a listing and hope the right buyer finds you.',
                    'Walk into due diligence blind.',
                    'Accept the first offer because you\'re exhausted.',
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
                    'Know your number before the first conversation.',
                    'Present a CIM that makes buyers compete.',
                    'Talk only to qualified, vetted acquirers.',
                    'Walk into due diligence fully prepared.',
                    'Close on your terms, at your price.',
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

      {/* ═══════════════════════════════════════
          SECTION 7 · FINAL CTA — terra cotta card
          ═══════════════════════════════════════ */}
      <section className="bg-[#FAF9F5] px-6 py-20 md:py-32">
        <FadeIn className="max-w-3xl mx-auto">
          <div className="bg-[#DA7756] rounded-3xl shadow-xl p-10 md:p-16 text-center">
            <h2
              className="text-2xl md:text-4xl font-medium text-white leading-tight"
              style={SERIF}
            >
              You built this business. Let&apos;s make sure you get what it&apos;s worth.
            </h2>
            <p className="text-base md:text-lg text-white/70 mt-6">
              Start free. Your first two stages cost nothing.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center mt-8 px-10 py-4 bg-white text-[#DA7756] text-lg font-medium rounded-full hover:bg-gray-100 no-underline transition-colors"
            >
              Start your seller journey &rarr;
            </Link>
          </div>
        </FadeIn>
      </section>
    </PublicLayout>
  );
}
