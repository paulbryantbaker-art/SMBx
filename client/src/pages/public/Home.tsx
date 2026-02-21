import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';

const SERIF = { fontFamily: 'ui-serif, Georgia, Cambria, serif' } as const;

const PILLARS = [
  {
    title: 'She knows your industry.',
    body: "Not just \u2018business services\u2019 \u2014 your specific vertical. Veterinary clinics trade differently than HVAC companies. SaaS multiples move differently than dental practices. Yulia pulls from 80+ industry verticals with real market data, current multiples, and sector-specific intelligence. When PE firms are consolidating your industry, she knows \u2014 and she adjusts your strategy accordingly.",
  },
  {
    title: 'She understands your deal.',
    body: "Your financials, your add-backs, your growth trajectory, your local market conditions. Yulia doesn\u2019t apply a generic formula. She classifies your deal by size and complexity, selects the right valuation methodology, and builds a defensible thesis specific to your situation. Every number is extracted, verified, and shown with its source. Nothing is invented.",
  },
  {
    title: 'She guides you through the process.',
    body: "This isn\u2019t \u2018here\u2019s a report, good luck.\u2019 Yulia walks you through every stage \u2014 intake, financials, valuation, packaging, matching, closing. She asks the next right question. She flags risks before they become problems. She generates the deliverables you need at each stage: CIMs, buyer lists, financial models, pitch decks, LOIs. The same deliverables a $50K advisor would produce.",
  },
];

const STEPS = [
  {
    title: 'Start a conversation',
    badge: 'FREE',
    body: "Tell Yulia what you\u2019re trying to do. Selling your business? Buying one? Raising capital? She asks the right questions, organizes your information, and maps out your path. No forms. No uploads. Just talk.",
  },
  {
    title: 'Get real deliverables',
    badge: 'FROM $15',
    body: 'When you\u2019re ready, Yulia generates professional deliverables: valuations, CIMs, buyer lists, financial models. Not templates. Not fill-in-the-blanks. Built from your actual data, your industry, your market.',
  },
  {
    title: 'Close your deal',
    badge: null,
    body: 'Yulia stays with you through every stage. Structuring, negotiation, due diligence, closing. Each step unlocks when you\u2019re ready. Pay as you go \u2014 no retainers, no subscriptions, no surprises.',
  },
];

const CREDIBILITY = [
  {
    title: '80+ industry verticals',
    body: 'From accounting firms to veterinary clinics. Each with current market multiples, common add-backs, key performance indicators, and typical deal structures.',
  },
  {
    title: 'Real-time market intelligence',
    body: 'Interest rates, sector consolidation trends, regional pricing data, active buyer pools. The market moves. Your advisor should move with it.',
  },
  {
    title: 'Institutional methodology',
    body: 'The same frameworks used by middle-market investment banks \u2014 SDE, EBITDA, DSCR, DCF \u2014 adapted for every deal size from $300K to $50M+.',
  },
  {
    title: 'Zero hallucinated financials',
    body: 'Every number is extracted from your documents and verified. Calculations are shown, not hidden. Add-backs require your confirmation. Nothing is invented. Ever.',
  },
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

const EYEBROW_PHRASES = ['Selling a business', 'Buying a business', 'Raising capital'];
const AUDIENCE_WORDS = [
  'business owners',
  'first-time buyers',
  'search fund operators',
  'brokers',
  'PE firms',
  'solo founders',
  'family offices',
];

export default function Home() {
  const [eyebrowIndex, setEyebrowIndex] = useState(0);
  const [eyebrowVisible, setEyebrowVisible] = useState(true);
  const [audienceIndex, setAudienceIndex] = useState(0);
  const [audienceVisible, setAudienceVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setEyebrowVisible(false);
      setTimeout(() => {
        setEyebrowIndex(i => (i + 1) % EYEBROW_PHRASES.length);
        setEyebrowVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        setAudienceVisible(false);
        setTimeout(() => {
          setAudienceIndex(i => (i + 1) % AUDIENCE_WORDS.length);
          setAudienceVisible(true);
        }, 300);
      }, 3000);
      return () => clearInterval(interval);
    }, 1500);
    return () => clearTimeout(delay);
  }, []);

  return (
    <PublicLayout>
      {/* HERO — fixed behind content */}
      <section className="fixed inset-0 z-0 flex flex-col items-center justify-center px-6">
        <div className="text-center flex flex-col items-center">
          <span
            className="inline-block bg-[#F0EDE6] text-text-secondary text-sm px-4 py-1.5 rounded-full mb-8 transition-opacity duration-300"
            style={{ opacity: eyebrowVisible ? 1 : 0 }}
          >
            {EYEBROW_PHRASES[eyebrowIndex]}
          </span>
          <h1
            className="text-5xl md:text-8xl text-[#1A1A18] font-medium leading-tight tracking-tight"
            style={SERIF}
          >
            Agentic Deal Advisory.
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mt-6">
            Built for{' '}
            <span
              className="text-terra italic transition-opacity duration-300"
              style={{ ...SERIF, opacity: audienceVisible ? 1 : 0 }}
            >
              {AUDIENCE_WORDS[audienceIndex]}
            </span>
            .
          </p>
          <p className="text-base md:text-lg text-text-secondary mt-3">
            Sell. Buy. Raise capital. From first conversation to closing.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center mt-10 px-10 py-4 bg-terra text-white text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
          >
            Meet Yulia &rarr;
          </Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-text-tertiary text-sm tracking-wide">Scroll</span>
        </div>
      </section>

      {/* Spacer to push content below the fold */}
      <div className="min-h-screen" />

      {/* CONTENT — scrolls over the hero */}
      <div className="relative z-10">
        {/* THE PROBLEM */}
        <section
          className="px-6 py-12 md:py-20 bg-white rounded-t-3xl"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl text-text-primary mb-8 font-medium"
              style={SERIF}
            >
              M&amp;A advice has always been expensive &mdash; or terrible.
            </h2>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
              Hire an advisor and you&apos;re looking at a $50,000 retainer before
              anyone picks up the phone. And if your deal is under $2M? Most firms
              won&apos;t take your call.
            </p>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed m-0">
              Go the DIY route and you get generic calculators that don&apos;t know
              the difference between a veterinary practice and a SaaS company. Plug
              in revenue, get a number. No context. No strategy. No one watching
              your back.
            </p>
          </div>
        </section>

        {/* THE INTELLIGENCE */}
        <section className="px-6 py-20 bg-cream">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-3xl md:text-4xl text-text-primary text-center mb-4 font-medium"
              style={SERIF}
            >
              This is something different.
            </h2>
            <p className="text-lg md:text-xl text-text-secondary text-center leading-relaxed max-w-2xl mx-auto mb-16">
              smbx.ai isn&apos;t a calculator. She isn&apos;t a listing site.
              She&apos;s an advisor that thinks.
            </p>
            <div className="space-y-12">
              {PILLARS.map(p => (
                <div key={p.title}>
                  <h3
                    className="text-xl md:text-2xl text-text-primary mb-3 font-medium"
                    style={SERIF}
                  >
                    {p.title}
                  </h3>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed m-0">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2
              className="text-3xl md:text-4xl text-text-primary text-center mb-2 font-medium"
              style={SERIF}
            >
              How it works
            </h2>
            <p className="text-lg md:text-xl text-text-secondary text-center mb-16">
              A conversation, not a dashboard.
            </p>
            <div className="space-y-12">
              {STEPS.map(step => (
                <div key={step.title}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3
                      className="text-xl md:text-2xl text-text-primary font-medium m-0"
                      style={SERIF}
                    >
                      {step.title}
                    </h3>
                    {step.badge && (
                      <span className="text-sm text-text-secondary bg-[#F0EDE6] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed m-0">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CREDIBILITY */}
        <section className="px-6 py-20 bg-cream">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl md:text-4xl text-text-primary text-center mb-12 font-medium"
              style={SERIF}
            >
              Built on real data. Not guesswork.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {CREDIBILITY.map(item => (
                <div key={item.title}>
                  <h3
                    className="text-xl md:text-2xl text-text-primary mb-2 font-medium"
                    style={SERIF}
                  >
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed m-0">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* JOURNEY CARDS */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl md:text-4xl text-text-primary text-center mb-12 font-medium"
              style={SERIF}
            >
              What brings you here?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {JOURNEYS.map(j => (
                <Link
                  key={j.href}
                  href={j.href}
                  className="bg-white rounded-2xl border border-border p-6 no-underline transition-shadow hover:shadow-md group"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)' }}
                >
                  <h3
                    className="text-xl md:text-2xl text-text-primary mb-2 font-medium group-hover:text-terra transition-colors"
                    style={SERIF}
                  >
                    {j.title}
                  </h3>
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-4">
                    {j.description}
                  </p>
                  <span className="text-base text-terra font-medium">
                    Start free &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 py-20 bg-[#F0EDE6]">
          <div className="max-w-xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl text-text-primary mb-4 font-medium"
              style={SERIF}
            >
              Start free. Pay when you see value.
            </h2>
            <p className="text-lg md:text-xl text-text-secondary mb-10">
              No credit card required. No commitment. Just a conversation.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-3 md:px-10 md:py-4 bg-terra text-white text-base md:text-lg font-medium rounded-full hover:bg-terra-hover no-underline transition-colors"
            >
              Get started free &rarr;
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
