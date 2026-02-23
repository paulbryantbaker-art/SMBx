import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import Timeline from '../../components/public/Timeline';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const TIMELINE_STEPS = [
  {
    num: 1,
    title: 'Tell Yulia about your business',
    price: 'Free',
    free: true,
    desc: 'No forms. Just a conversation. Describe your business \u2014 industry, location, revenue, team, whatever you know. Yulia asks smart follow-ups and builds your deal profile.',
    detail: '\u201CI own an HVAC company in Dallas, 12 employees, $3.2M revenue, been running it for 15 years.\u201D \u2014 That\u2019s all it takes to start.',
  },
  {
    num: 2,
    title: 'See your real numbers',
    price: 'Free',
    free: true,
    desc: 'Yulia calculates your SDE or EBITDA, identifies every legitimate add-back, and gives you a preliminary valuation range \u2014 with the math shown. Not a guess. A number you can take to your CPA.',
    detail: 'Most owners discover add-backs they didn\u2019t know existed. Personal vehicle, one-time expenses, above-market rent to yourself \u2014 Yulia finds them all.',
  },
  {
    num: 3,
    title: 'Get your valuation report',
    price: 'From $199',
    free: false,
    desc: 'Full multi-methodology valuation: comparable transactions, industry multiples, discounted cash flow. Benchmarked against real deals in your industry and region. The kind of report advisory firms charge $10K\u2013$25K to produce.',
  },
  {
    num: 4,
    title: 'Go to market',
    price: 'From $299',
    free: false,
    desc: 'Yulia builds your Confidential Information Memorandum \u2014 the document that makes buyers take your business seriously. Then she identifies and scores qualified buyers for your specific deal.',
    detail: 'Working with a broker? Invite them in. Yulia produces the CIM and buyer research \u2014 your broker focuses on relationships and negotiation. The deal moves faster for everyone.',
  },
  {
    num: 5,
    title: 'Close with confidence',
    price: 'From $299',
    free: false,
    desc: 'LOI comparison, due diligence management, working capital analysis, deal structuring, and closing coordination. Yulia keeps every party organized and every document in one place.',
  },
];

const DEAL_SIZES = [
  {
    range: 'Under $500K',
    title: 'First-time seller',
    desc: "You\u2019ve never done this before. That\u2019s okay \u2014 Yulia walks you through every step in plain language. No jargon, no assumptions.",
    result: '\u201CHe thought he\u2019d be lucky to get $200K. Yulia found $31K in add-backs he didn\u2019t know counted. Asking price: $425K.\u201D',
  },
  {
    range: '$500K \u2013 $10M',
    title: 'Serious operation',
    desc: 'You know your business is valuable. Yulia produces institutional-quality work product \u2014 the same CIMs and valuations that $100K advisory firms deliver.',
    result: '\u201CValued at $2.6M\u2013$3.9M using live comps. Three PE firms actively consolidating in her industry. Full CIM in 47 minutes.\u201D',
  },
  {
    range: '$10M+',
    title: 'Strategic exit',
    desc: 'PE roll-up, strategic sale, or management buyout \u2014 Yulia handles the analytical heavy lifting while your deal team focuses on execution.',
    result: '\u201CTheir team of 3 operated like a team of 12. Six platform acquisitions closed in 14 months.\u201D',
  },
];

const BROKER_BENEFITS = [
  { bold: 'Invite your broker', rest: ' into the deal room \u2014 they see everything, collaborate in real time' },
  { bold: 'CIMs in an hour', rest: ' \u2014 your broker reviews and refines instead of building from scratch' },
  { bold: 'Attorneys and CPAs join free', rest: ' \u2014 no extra seats, no extra cost' },
  { bold: "Your broker\u2019s expertise + Yulia\u2019s speed", rest: ' = deals that close faster at better terms' },
];

const FAQS = [
  {
    q: 'Can I trust an AI valuation?',
    a: 'Yulia uses the same methodologies as human advisors \u2014 comparable transactions, industry multiples, discounted cash flow. Every calculation is shown, every comp is sourced. Many sellers bring Yulia\u2019s report to their CPA for review. The math speaks for itself.',
  },
  {
    q: 'Will buyers take an AI-generated CIM seriously?',
    a: 'The CIM format, depth, and quality match what top advisory firms produce. Buyers care about the information, not who typed it. Many of our CIMs are reviewed and co-branded by the seller\u2019s broker before going to market.',
  },
  {
    q: 'Do I still need a broker?',
    a: "That\u2019s your call. Some sellers use Yulia end-to-end. Others use Yulia for the analytical work and their broker for relationships and negotiation. Many brokers use Yulia themselves \u2014 she produces their work product faster so they can focus on what humans do best: building trust and closing deals.",
  },
  {
    q: 'What if my business is complicated?',
    a: 'Yulia covers 80+ industry verticals with current market data. Whether you\u2019re a single-location restaurant or a multi-state healthcare practice, she adapts \u2014 different metrics, different comps, different buyer profiles. If something is truly unusual, she\u2019ll tell you.',
  },
];

/* ─── Page ─── */

export default function Sell() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <div className="flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          Sell Your Business
        </div>
        <h1 className="font-serif text-[clamp(44px,6vw,76px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[14ch] mb-6 m-0">
          You built it. Now <em className="italic text-[#DA7756]">own the exit.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[600px] leading-[1.65] mb-10 m-0">
          Most owners sell for less than they should &mdash; not because the business isn&apos;t
          worth it, but because they didn&apos;t have the right information at the right time.
          Yulia changes that.
        </p>
        <div className="flex flex-col md:flex-row gap-3 max-md:w-full">
          <Button variant="primary" onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}>Start selling &mdash; free &rarr;</Button>
          <Button variant="secondary" href="/how-it-works">See how it works</Button>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#DA7756] font-semibold mb-4 m-0">
          Your selling journey
        </p>
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          From &ldquo;what&apos;s it worth?&rdquo; to <em className="italic text-[#DA7756]">wire transfer.</em>
        </h2>

        <Timeline steps={TIMELINE_STEPS} />

        <div className="text-center mt-12">
          <p className="text-[15px] text-[#7A766E] mb-5 m-0">
            Typical sell-side journey: <strong className="text-[#1A1A18]">From $1,799</strong> &middot;
            Traditional advisory: <span className="line-through">$50,000&ndash;$200,000</span>
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
              Working with a <em className="italic text-[#DA7756]">broker?</em> Even better.
            </h3>
            <p className="text-[15px] text-[#7A766E] leading-[1.6] m-0">
              Yulia doesn&apos;t replace your broker &mdash; she makes them faster. Many of our
              most active users are brokers and advisors who use Yulia to produce work product,
              screen buyers, and manage more deals simultaneously.
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
          Ready to start?
        </h3>
        <div className="max-w-[640px] mx-auto">
          <PublicChatInput sourcePage="/sell" />
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-[800px] mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-10 m-0 text-center">
          Questions sellers ask.
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
            You built something valuable. Let&apos;s prove it.
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
