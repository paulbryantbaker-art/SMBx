import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/public/PublicChatInput';
import { useChatContext } from '../../contexts/ChatContext';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Define your thesis',
    price: 'Free',
    free: true,
    desc: 'What kind of business? What size? What geography? What returns? Yulia builds your acquisition criteria and search strategy.',
    detail: '\u201CI\u2019m looking for B2B SaaS companies, $1-5M ARR, 70%+ gross margins, in healthcare or fintech.\u201D \u2014 That\u2019s enough to start screening.',
  },
  {
    num: 2,
    title: 'Screen and score targets',
    price: 'Free',
    free: true,
    desc: 'Yulia analyzes market data to identify businesses matching your thesis. Each target scored on financial fit, strategic fit, and acquisition feasibility.',
    detail: '47 targets scored overnight. Top 8 flagged for deep dive. You spend time on winners, not searching.',
  },
  {
    num: 3,
    title: 'Value your targets',
    price: 'From $199',
    free: false,
    desc: "Full valuation on any target \u2014 comps, multiples, DCF. Know what it\u2019s worth before your first conversation with the seller.",
  },
  {
    num: 4,
    title: 'Run diligence',
    price: 'From $299',
    free: false,
    desc: 'Structured DD workflow \u2014 financial, operational, legal, commercial. Risks surfaced early. Documents organized. Nothing falls through.',
    detail: 'Most deals die in diligence because something gets missed. Yulia tracks every item, flags every gap, and keeps every party on schedule.',
  },
  {
    num: 5,
    title: 'Structure and close',
    price: 'From $299',
    free: false,
    desc: 'Offer modeling, scenario analysis, deal terms, LOI drafting, closing coordination. Every decision supported with data.',
  },
];

const DEAL_SIZES = [
  {
    range: 'Under $1M',
    title: 'First-time buyer',
    desc: "Buying your first business is terrifying. Yulia makes it methodical \u2014 from search criteria to LOI to closing checklist.",
    result: '\u201CWent from \u2018I don\u2019t know where to start\u2019 to signed LOI in 6 weeks. Yulia walked me through every step.\u201D',
  },
  {
    range: '$1M \u2013 $10M',
    title: 'Search fund / independent sponsor',
    desc: 'Screen hundreds of targets against your thesis. Move fast on the right ones. Manage multiple LOIs simultaneously.',
    result: '\u201CScored 47 deals overnight against my criteria. In LOI on the best one in 3 weeks.\u201D',
  },
  {
    range: '$10M+',
    title: 'PE / strategic acquirer',
    desc: 'Roll-up modeling, platform builds, portfolio analytics. Your deal team of 3 operates like 12.',
    result: '\u201CSix platform acquisitions closed in 14 months. Yulia handled the analytical heavy lifting on every one.\u201D',
  },
];

const BROKER_BENEFITS = [
  { bold: 'Your broker gets Yulia\u2019s analysis', rest: ' on every target \u2014 instantly' },
  { bold: 'Due diligence checklists', rest: ' generated and tracked automatically' },
  { bold: 'One deal room', rest: ' for buyer, seller, broker, attorney, CPA' },
  { bold: 'Brokers using Yulia close deals faster', rest: ' \u2014 which means you close faster' },
];

const FAQS = [
  {
    q: 'Where do the targets come from?',
    a: 'Yulia analyzes publicly available market data, industry databases, and transaction records. She complements broker deal flow \u2014 she doesn\u2019t compete with it. Many buyers use Yulia to evaluate deals their broker brings them.',
  },
  {
    q: 'Can I use this for multiple acquisitions?',
    a: 'Absolutely. Roll-up operators and search funds use Yulia for serial acquisitions \u2014 screening, valuing, and managing diligence across multiple targets simultaneously.',
  },
  {
    q: 'How is this different from hiring an analyst?',
    a: 'An analyst gives you 40 hours a week. Yulia gives you institutional-quality analysis in minutes, 24/7. Many PE firms use Yulia alongside their deal teams to move faster on competitive deals.',
  },
  {
    q: 'What if I\u2019m buying through a broker?',
    a: 'Perfect. Invite your broker into the deal room. Yulia produces the analytical work product \u2014 valuations, models, DD checklists \u2014 while your broker handles relationships and negotiation.',
  },
];

const BUY_PROMPTS = [
  'SaaS companies under $5M',
  'Home services in Texas',
  'Looking for my first acquisition',
];

/* ─── Page ─── */

export default function Buy() {
  const { triggerMorph } = useChatContext();

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <div className="flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Buy a Business
        </div>
        <h1 className="font-serif text-[clamp(44px,6vw,76px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[14ch] mb-6 m-0">
          Find the right deal. <em className="italic text-[#DA7756]">Own it.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          Whether it&apos;s your first acquisition or your fifteenth &mdash; Yulia screens targets,
          models returns, manages diligence, and keeps every party on track.
        </p>
        <div className="flex flex-col md:flex-row gap-3 max-md:w-full">
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start buying &mdash; free &rarr;</Button>
          <Button variant="secondary" href="/how-it-works">See how it works</Button>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#DA7756] font-semibold mb-4 m-0">
          Your buying journey
        </p>
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From thesis to <em className="italic text-[#DA7756]">closing table.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Typical buy-side journey: <strong className="text-[#1A1A18]">From $1,399</strong> &middot;
            Traditional advisory: <span className="line-through">$75,000&ndash;$250,000</span>
          </p>
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start your journey &mdash; free &rarr;</Button>
        </div>
      </section>

      {/* ═══ BUILT FOR YOUR DEAL ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for <em className="italic text-[#DA7756]">your</em> deal.
        </h2>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {DEAL_SIZES.map(d => (
            <Card key={d.range} padding="px-7 py-9">
              <p className="font-serif text-[28px] font-black text-[#DA7756] mb-3 m-0">{d.range}</p>
              <h3 className="text-base font-bold text-[#1A1A18] mb-2 m-0">{d.title}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] mb-3 m-0">{d.desc}</p>
              <div className="py-3 px-4 bg-[#F3F0EA] rounded-[10px]">
                <p className="text-[13px] text-[#4A4843] italic leading-[1.45] m-0">{d.result}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ BROKER CALLOUT ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] py-12 px-14 grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:py-8 max-md:px-6 max-md:gap-8">
          <div>
            <h3 className="font-serif text-[28px] font-black tracking-[-0.02em] leading-[1.15] mb-4 m-0">
              Working with a <em className="italic text-[#DA7756]">broker?</em> Yulia is their secret weapon.
            </h3>
            <p className="text-[15px] text-[#7A766E] leading-[1.6] m-0">
              Brokers bring you deals. Yulia arms them with instant valuations, buyer scoring,
              and DD workflows &mdash; so your broker spends time on the deals that matter, not the spreadsheets.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {BROKER_BENEFITS.map(b => (
              <div key={b.bold} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#FFF0EB] text-[#DA7756] flex items-center justify-center text-xs font-bold shrink-0 mt-px">
                  &#10003;
                </span>
                <span className="text-[15px] leading-[1.5]">
                  <strong>{b.bold}</strong>{b.rest}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          Ready to find your next deal?
        </h3>
        <div className="max-w-[640px] mx-auto">
          <PublicChatInput
            onSend={(msg) => triggerMorph(msg, 'buy')}
            placeholder="Tell Yulia what kind of business you're looking for..."
            suggestedPrompts={BUY_PROMPTS}
          />
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Questions buyers ask.
        </h2>
        <div>
          {FAQS.map((f, i) => (
            <div key={i} className={`py-6 ${i < FAQS.length - 1 ? 'border-b border-[#E0DCD4]' : ''}`}>
              <p className="text-base font-bold text-[#1A1A18] mb-2.5 m-0">{f.q}</p>
              <p className="text-sm text-[#7A766E] leading-[1.65] m-0">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Your next acquisition starts with a conversation.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#DA7756] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &mdash; free &rarr;
          </button>
        </div>
      </section>
    </PublicLayout>
  );
}
