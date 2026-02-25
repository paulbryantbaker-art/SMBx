import PublicLayout from '../../components/public/PublicLayout';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Tell Yulia about your deal',
    desc: 'You talk. She listens. Describe your business, your goals, your timeline \u2014 in your own words. Yulia asks smart follow-ups to fill in the gaps. No jargon required.',
  },
  {
    num: '02',
    title: 'Yulia analyzes everything',
    desc: 'Industry classification, financial modeling, comparable transactions, market conditions, buyer/investor profiles. Yulia pulls from 80+ industry verticals with current market data.',
  },
  {
    num: '03',
    title: 'You get real deliverables',
    desc: 'Not summaries. Not suggestions. Actual work product \u2014 valuation reports, CIMs, pitch decks, DD checklists, term sheet analysis. The same documents advisory firms charge $50K\u2013$200K to produce.',
  },
  {
    num: '04',
    title: 'Your team collaborates',
    desc: 'Invite your broker, attorney, CPA, or investor into the deal room. Everyone sees the same information. Service providers join free. The deal moves forward with everyone aligned.',
  },
];

const INTELLIGENCE = [
  {
    title: '80+ industry verticals',
    desc: 'Current multiples, market trends, buyer activity for every major business category',
  },
  {
    title: 'Real transaction data',
    desc: 'Comparable sales benchmarked by industry, geography, and deal size',
  },
  {
    title: 'Live market conditions',
    desc: 'Interest rates, SBA lending environment, PE activity, regulatory changes',
  },
  {
    title: 'Regional intelligence',
    desc: 'Local market dynamics, cost of living adjustments, state-specific regulations',
  },
];

const COLLABORATION = [
  { bold: 'Business owners', rest: ' see their numbers, their documents, their deal progress' },
  { bold: 'Brokers and advisors', rest: ' get instant work product \u2014 CIMs, valuations, buyer lists' },
  { bold: 'Attorneys, CPAs, and service providers', rest: ' join free and collaborate in real time' },
];

const STORIES = [
  {
    deal: '$400K Landscaping Business',
    desc: 'Solo owner, first-time seller. Never heard of SDE. Yulia found $31K in add-backs he didn\u2019t know counted. Full valuation, CIM, and 3 qualified buyers in one week. Asking price: $425K. Traditional advisory would have cost more than the deal was worth.',
  },
  {
    deal: '$3M HVAC Company',
    desc: 'Owner-operated, Dallas market. Yulia calculated $780K adjusted EBITDA, identified 3 PE firms actively consolidating in the region. Full CIM in 47 minutes. Preliminary range: $3.5M\u2013$4.7M. Broker invited into deal room and co-branded the materials.',
  },
  {
    deal: '$12M Search Fund Acquisition',
    desc: 'Independent sponsor screening B2B services. Yulia scored 47 targets against the thesis overnight. Top 8 flagged for deep dive. Full valuation and DD workflow on 3 finalists. LOI signed in 3 weeks.',
  },
  {
    deal: '$40M PE Roll-Up',
    desc: 'PE firm building a platform in healthcare services. Yulia handled analytical work product across 6 add-on acquisitions in 14 months. Deal team of 3 operated like 12. Integration plans delivered within 48 hours of each closing.',
  },
];

/* ─── Page ─── */

export default function HowItWorks() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <h1 className="font-serif text-[clamp(40px,5.5vw,72px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[16ch] mb-5 m-0">
          Talk to Yulia. She handles <em className="italic text-[#DA7756]">the rest.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[600px] leading-[1.6] m-0">
          No forms. No uploads. No 47-field intake questionnaires. Just tell Yulia about your deal
          and she turns the conversation into institutional-quality work product.
        </p>
      </section>

      {/* ═══ 4-STEP PROCESS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <div className="space-y-6">
          {PROCESS_STEPS.map(s => (
            <Card key={s.num} hover={false} padding="px-10 py-10 max-md:px-6 max-md:py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <span className="font-serif text-[56px] font-black text-[#E8E4DC] leading-none shrink-0">{s.num}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1A1A18] mb-2 m-0">{s.title}</h3>
                  <p className="text-sm text-[#7A766E] leading-[1.6] m-0 max-w-[600px]">{s.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ APPLIED INTELLIGENCE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-3 m-0">
          What Yulia knows.
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-10 m-0">
          Yulia doesn&apos;t guess. She analyzes.
        </p>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {INTELLIGENCE.map(item => (
            <Card key={item.title} hover={false} padding="px-8 py-7">
              <h4 className="text-[15px] font-bold text-[#1A1A18] mb-1.5 m-0">{item.title}</h4>
              <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ COLLABORATION ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] py-12 px-14 max-md:py-8 max-md:px-6">
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-3 m-0">
            Everyone on the deal. One place.
          </h3>
          <p className="text-[17px] text-[#7A766E] leading-[1.6] mb-8 m-0">
            Deals involve more than one person. Yulia keeps everyone aligned.
          </p>
          <div className="flex flex-col gap-4">
            {COLLABORATION.map(c => (
              <div key={c.bold} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#FFF0EB] text-[#DA7756] flex items-center justify-center text-xs font-bold shrink-0 mt-px">
                  &#10003;
                </span>
                <span className="text-[15px] leading-[1.5]">
                  <strong>{c.bold}</strong>{c.rest}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEAL STORIES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for every deal size.
        </h2>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {STORIES.map(s => (
            <Card key={s.deal} padding="px-8 py-10">
              <p className="text-[11px] uppercase tracking-[.12em] text-[#DA7756] font-semibold mb-3 m-0">{s.deal}</p>
              <p className="text-sm text-[#7A766E] leading-[1.6] m-0">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          See for yourself.
        </h3>
        <div className="max-w-[640px] mx-auto">
          <PublicChatInput sourcePage="/how-it-works" />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Every deal deserves an expert. Yours starts now.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#DA7756] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &rarr;
          </button>
        </div>
      </section>

      {/* ═══ NUDGE ═══ */}
      <div className="text-center pb-10 max-md:pb-6">
        <p className="journey-nudge text-[22px] text-[#DA7756] m-0 max-md:text-lg">
          every deal starts with a conversation
        </p>
      </div>
    </PublicLayout>
  );
}
