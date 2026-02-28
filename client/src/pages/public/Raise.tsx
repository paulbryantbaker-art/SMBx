import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Define your strategy',
    price: 'Free',
    free: true,
    desc: 'How much do you need? What are you willing to give? Who should you approach? Yulia aligns your raise with your goals and risk tolerance.',
    detail: '\u201CI need $2M to expand into two new markets. Open to giving up 15-20% equity.\u201D \u2014 Yulia starts building your strategy from there.',
  },
  {
    num: 2,
    title: 'Build your financial package',
    price: 'Free',
    free: true,
    desc: 'Yulia organizes your numbers into the story investors need to see. Gaps identified. Weaknesses addressed before they\u2019re exposed in diligence.',
    detail: 'Most founders discover gaps in their financials they didn\u2019t know existed. Yulia finds them before investors do.',
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
    detail: 'Not every investor is right for your deal. Yulia profiles who\u2019s investing at your stage, in your industry, at your size \u2014 so you pitch warm, not cold.',
  },
  {
    num: 5,
    title: 'Negotiate terms',
    price: 'From $199',
    free: false,
    desc: 'Term sheet analysis. Side-by-side comparison. What each term means for your control, dilution, and economics. Negotiate informed.',
  },
];

const DEAL_SIZES = [
  {
    range: '$1.5M \u2013 $5M',
    title: 'Growth capital',
    desc: 'Seed through Series A. Yulia builds your financial story, valuation, deck, and investor targets \u2014 all from one conversation.',
    result: '\u201CDeck built from actual financials. Closed $4.5M Series A in 6 weeks. Investors commented on how tight the materials were.\u201D',
  },
  {
    range: '$5M \u2013 $25M',
    title: 'Growth equity',
    desc: 'You have real traction. Yulia makes your numbers sing \u2014 institutional deck, defensible valuation, and a targeted investor list.',
    result: '\u201CCompared 4 term sheets side-by-side. Saved 8% dilution by understanding the real cost of each structure.\u201D',
  },
  {
    range: '$25M+',
    title: 'Institutional raise',
    desc: 'Growth equity, mezzanine, or structured capital \u2014 Yulia models every scenario so you see what each option costs you.',
    result: '\u201CModeled 6 capital structures across 3 investors. Board saw the real cost of each within hours.\u201D',
  },
];

const BROKER_BENEFITS = [
  { bold: 'Pitch decks in hours', rest: ' \u2014 your advisor reviews and refines instead of building from scratch' },
  { bold: 'Every scenario modeled', rest: ' \u2014 dilution, control, economics across every term sheet' },
  { bold: 'Attorneys and CPAs join free', rest: ' \u2014 everyone sees the same numbers' },
  { bold: 'Your advisor\u2019s network + Yulia\u2019s analysis', rest: ' = raises that close faster at better terms' },
];

const FAQS = [
  {
    q: 'What kind of raises does Yulia support?',
    a: 'Angel, seed, Series A through growth equity, revenue-based financing, and debt structures. Yulia adapts to your stage and your goals.',
  },
  {
    q: 'Does Yulia find investors?',
    a: 'She profiles and prioritizes investors for your specific raise \u2014 who\u2019s investing at your stage, in your industry, at your size. The introductions and relationships are yours.',
  },
  {
    q: 'Can I use my own deck?',
    a: 'Absolutely. Upload it and Yulia will review, strengthen, and fill gaps. Or let her build one from scratch using your actual data.',
  },
  {
    q: 'What if I already have a term sheet?',
    a: 'Even better. Yulia breaks down every clause \u2014 what it means for your control, dilution, and economics. If you have multiple term sheets, she compares them side-by-side.',
  },
];

/* ─── Page ─── */

export default function Raise() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-8 pb-12 max-md:px-5 max-md:pt-4 max-md:pb-8">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          Raise Capital
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(44px,6vw,76px)] font-extrabold leading-[1.05] tracking-tight max-w-[14ch] mb-6 m-0">
          Raise smart. <em className="italic text-[#D4714E]">Keep control.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          The difference between a good raise and a great one is preparation. Yulia builds
          your financial story, your deck, and your investor strategy &mdash; so you negotiate
          from strength.
        </p>
        <div className="animate-fadeInUp stagger-3 flex flex-col md:flex-row gap-3 max-md:w-full">
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start raising &mdash; free &rarr;</Button>
          <Button variant="secondary" href="/how-it-works">See how it works</Button>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          Your capital raise
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From strategy to <em className="italic text-[#D4714E]">term sheet.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Typical raise journey: <strong className="text-[#1A1A18]">From $749</strong> &middot;
            Traditional advisory: <span className="line-through">$25,000&ndash;$100,000</span>
          </p>
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start your raise &mdash; free &rarr;</Button>
        </div>
      </section>

      {/* ═══ BUILT FOR YOUR DEAL ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for <em className="italic text-[#D4714E]">your</em> deal.
        </h2>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {DEAL_SIZES.map(d => (
            <Card key={d.range} padding="px-7 py-9">
              <p className="font-sans text-[28px] font-black text-[#D4714E] mb-3 m-0">{d.range}</p>
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
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl py-12 px-14 grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:py-8 max-md:px-6 max-md:gap-8">
          <div>
            <h3 className="font-sans text-[28px] font-black tracking-[-0.02em] leading-[1.15] mb-4 m-0">
              Working with an <em className="italic text-[#D4714E]">advisor?</em> Even better.
            </h3>
            <p className="text-[15px] text-[#7A766E] leading-[1.6] m-0">
              Investment bankers and capital advisors use Yulia to produce pitch materials faster
              and model more scenarios. Your advisor focuses on relationships &mdash; Yulia handles
              the analytical work product.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {BROKER_BENEFITS.map(b => (
              <div key={b.bold} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center text-xs font-bold shrink-0 mt-px">
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
        <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-extrabold tracking-tight mb-8 m-0 text-center">
          Ready to start your raise?
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/raise" />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Questions founders ask.
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
        <div className="bg-gradient-to-br from-[#D4714E] to-[#BE6342] rounded-4xl px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Raise from strength. Start with a conversation.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#D4714E] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &mdash; free &rarr;
          </button>
        </div>
      </section>

      {/* ═══ NUDGE ═══ */}
      <div className="text-center pb-10 max-md:pb-6">
        <p className="journey-nudge text-[22px] text-[#D4714E] m-0 max-md:text-lg">
          investors fund preparation, not just ideas
        </p>
      </div>
    </PublicLayout>
  );
}
