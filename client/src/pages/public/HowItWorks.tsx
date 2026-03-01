import PublicLayout from '../../components/public/PublicLayout';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/chat/PublicChatInput';

/* ─── Data ─── */

const SEVEN_LAYERS = [
  {
    num: '01',
    title: 'Industry structure',
    desc: 'Classification across 80+ verticals with sub-sector specificity. Current multiples, market trends, buyer activity, and consolidation patterns for your exact business category.',
  },
  {
    num: '02',
    title: 'Regional economics',
    desc: 'Local market dynamics, cost of living adjustments, state-specific regulations, and regional buyer pools. Because a $3M HVAC company in Dallas is worth something different than one in Portland.',
  },
  {
    num: '03',
    title: 'Financial normalization',
    desc: 'SDE/EBITDA calculation with systematic add-back identification across 47 categories. Most owners discover $30K\u2013$80K in legitimate add-backs they didn\u2019t know existed.',
  },
  {
    num: '04',
    title: 'Buyer landscape',
    desc: 'Who\u2019s buying in your space, at your size, in your geography. Strategic acquirers, PE firms, independent buyers, search funds \u2014 profiled by acquisition history and capacity.',
  },
  {
    num: '05',
    title: 'Deal structure',
    desc: 'Comparable transactions sourced from real deal databases. Purchase price, structure, terms, and multiples \u2014 filtered by industry, geography, and size bracket.',
  },
  {
    num: '06',
    title: 'Risk assessment',
    desc: 'Customer concentration, key-person dependency, regulatory exposure, competitive threats. Every risk quantified and scored before it surfaces in diligence.',
  },
  {
    num: '07',
    title: 'Forward signals',
    desc: 'Interest rate trajectory, SBA lending environment, PE dry powder, regulatory pipeline, demographic shifts. The factors that will affect your deal 6\u201312 months from now.',
  },
];

const DATA_SOURCES = [
  { name: 'U.S. Census Bureau', desc: 'Business demographics, county economics, industry classification' },
  { name: 'Bureau of Labor Statistics', desc: 'Employment data, wage benchmarks, cost-of-living indices' },
  { name: 'Federal Reserve (FRED)', desc: 'Interest rates, lending conditions, economic indicators' },
  { name: 'SEC EDGAR', desc: 'Public company transactions, filing data, institutional activity' },
  { name: 'IRS Statistics of Income', desc: 'Business tax data, industry profitability, revenue distributions' },
];

const LEAGUE_TIERS = [
  { range: 'Under $500K', label: 'L1', metric: 'SDE', desc: 'Coach-level guidance. First-time sellers and lifestyle businesses. Simple metrics, clear language, actionable steps.' },
  { range: '$500K \u2013 $5M', label: 'L2\u2013L3', metric: 'SDE \u2192 EBITDA', desc: 'Analyst-level rigor. Owner-operated businesses with real enterprise value. Add-back sophistication, buyer qualification, market positioning.' },
  { range: '$5M \u2013 $50M', label: 'L4\u2013L5', metric: 'EBITDA', desc: 'Associate-to-partner depth. Institutional buyers, PE roll-ups, search funds. QoE-level analysis, management presentations, board-ready materials.' },
  { range: '$50M+', label: 'L6', metric: 'EBITDA', desc: 'Partner-level strategic advisory. Complex structures, multiple bidders, cross-border considerations. The same rigor Wall Street expects.' },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Tell Yulia about your deal',
    desc: 'You talk. She listens. Describe your business, your goals, your timeline \u2014 in your own words. No forms, no uploads, no 47-field intake questionnaires.',
  },
  {
    num: '02',
    title: 'Yulia classifies and analyzes',
    desc: 'Industry classification across 80+ verticals. Financial modeling with add-back identification. Comparable transactions sourced from real deal data. Market conditions assessed in real time.',
  },
  {
    num: '03',
    title: 'You get a preliminary range \u2014 free',
    desc: 'SDE or EBITDA calculated. Add-backs identified. Preliminary valuation range with the methodology shown. This is where most owners realize they\u2019ve been undervaluing their business.',
  },
  {
    num: '04',
    title: 'Choose your deliverables',
    desc: 'Full valuation report. CIM. Pitch deck. DD checklists. Term sheet analysis. Each deliverable has a fixed price. Pay only for what you need, when you need it.',
  },
  {
    num: '05',
    title: 'Invite your team',
    desc: 'Broker, attorney, CPA, investor \u2014 everyone joins the deal room. Service providers always join free. Everyone sees the same documents, the same numbers, the same timeline.',
  },
  {
    num: '06',
    title: 'Close with confidence',
    desc: 'Every analysis, every document, every decision point \u2014 organized in one place. From first conversation to closing day, nothing falls through the cracks.',
  },
];

const STORIES = [
  {
    deal: '$850K Landscaping \u2014 Portland, OR',
    desc: 'Solo owner, first-time seller. Never heard of SDE. Yulia found $31K in add-backs he didn\u2019t know counted. Full valuation, CIM, and 3 qualified buyers in one session. A deal most advisors wouldn\u2019t touch.',
  },
  {
    deal: '$4.5M Commercial Cleaning \u2014 Atlanta, GA',
    desc: 'Owner-operated, 15 years. Yulia calculated $780K adjusted EBITDA, identified 3 PE firms actively consolidating in the region. Full CIM in under an hour. Closed at 12% above initial offers.',
  },
  {
    deal: '$6.8M Dental Group \u2014 Chicago, IL',
    desc: 'PE add-on. Screened 140+ practices, identified 12 strategic fits. Full valuation and DD workflow on 4 finalists. Two acquisitions closed in the same quarter.',
  },
  {
    deal: '$25M PE Roll-Up \u2014 Healthcare Services',
    desc: 'PE firm building a platform. Yulia handled analytical work product across 6 add-on acquisitions in 14 months. Deal team of 3 operated like 12. Integration plans delivered within 48 hours of each closing.',
  },
];

/* ─── Page ─── */

export default function HowItWorks() {
  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-14">
        <div className="animate-fadeInUp flex items-center gap-3 mb-8 text-[13px] uppercase tracking-[.18em] text-[#D4714E] font-semibold">
          <span className="w-9 h-0.5 bg-[#D4714E]" />
          The Methodology
        </div>
        <h1 className="animate-fadeInUp stagger-1 font-sans text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-tight max-w-[18ch] mb-10 m-0">
          Seven layers of intelligence. <em className="italic text-[#D4714E]">One conversation.</em>
        </h1>
        <p className="animate-fadeInUp stagger-2 text-[19px] text-[#7A766E] max-w-[600px] leading-[1.6] mb-16 m-0">
          Every analysis Yulia produces follows the same structured methodology &mdash; seven layers
          of intelligence synthesized from authoritative federal data, localized to your market,
          and calibrated to your deal size. Every insight is traceable. Every number is explainable.
        </p>
      </section>

      {/* ═══ SEVEN LAYERS OF INTELLIGENCE ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          Seven Layers of Intelligence&trade;
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-4 m-0">
          The framework behind <em className="italic text-[#D4714E]">every analysis.</em>
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] max-w-[700px] mb-12 m-0">
          This isn&apos;t a chatbot searching the internet. It&apos;s a structured analytical framework
          that covers seven dimensions of intelligence on every deal &mdash; the same dimensions that
          top advisory firms evaluate, delivered in minutes instead of weeks.
        </p>

        <div className="space-y-4">
          {SEVEN_LAYERS.map(layer => (
            <Card key={layer.num} hover={false} padding="px-10 py-8 max-md:px-6 max-md:py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <span className="font-sans text-[48px] font-black text-[#E8E4DC] leading-none shrink-0">{layer.num}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1A1A18] mb-2 m-0">{layer.title}</h3>
                  <p className="text-sm text-[#7A766E] leading-[1.6] m-0 max-w-[600px]">{layer.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ SOVEREIGN DATA SOURCES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <div className="bg-gradient-to-br from-[#FFF8F4] to-[#FFF0EB] rounded-4xl p-12 max-md:p-7" style={{ boxShadow: '0 1px 4px rgba(26,26,24,.05), inset 0 0 0 1px rgba(212,113,78,.06)' }}>
          <p className="text-[11px] uppercase tracking-[.15em] text-[#D4714E] font-semibold mb-3 m-0">Sovereign data sources</p>
          <h3 className="font-sans text-[clamp(24px,2.5vw,32px)] font-black tracking-[-0.02em] mb-3 m-0">
            The same data that powers the Federal Reserve and Wall Street.
          </h3>
          <p className="text-[15px] text-[#4A4843] leading-[1.65] max-w-[700px] mb-8 m-0">
            Every insight Yulia produces is grounded in authoritative U.S. government data sources.
            Bloomberg built a $27B business on this data. SMBX synthesizes it into localized M&amp;A
            intelligence that was previously available only to firms charging $25,000+ per engagement.
          </p>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {DATA_SOURCES.map(src => (
              <div key={src.name} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-white text-[#D4714E] flex items-center justify-center text-xs font-bold shrink-0 mt-px" style={{ border: '1px solid rgba(212,113,78,0.15)' }}>
                  &#10003;
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#1A1A18] mb-0.5 m-0">{src.name}</p>
                  <p className="text-sm text-[#7A766E] leading-[1.5] m-0">{src.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE LEAGUE SYSTEM ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          Adaptive intelligence
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-4 m-0">
          Calibrated to your <em className="italic text-[#D4714E]">deal size.</em>
        </h2>
        <p className="text-[17px] text-[#7A766E] leading-[1.6] max-w-[700px] mb-10 m-0">
          Yulia doesn&apos;t give the same advice to a $400K landscaping company and a $40M manufacturing
          platform. She adapts her vocabulary, methodology, financial metrics, and deliverable depth
          to match your deal&apos;s complexity.
        </p>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {LEAGUE_TIERS.map(tier => (
            <Card key={tier.range} hover={false} padding="px-8 py-7">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block text-[11px] font-bold uppercase tracking-[.08em] px-2.5 py-[3px] rounded-full bg-[#FFF0EB] text-[#D4714E]">
                  {tier.label}
                </span>
                <span className="text-xs text-[#7A766E] font-medium">{tier.metric}</span>
              </div>
              <h4 className="text-[15px] font-bold text-[#1A1A18] mb-1.5 m-0">{tier.range}</h4>
              <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{tier.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS — THE PROCESS ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <p className="text-xs uppercase tracking-[.2em] text-[#D4714E] font-semibold mb-4 m-0">
          The process
        </p>
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-12 m-0">
          One conversation. <em className="italic text-[#D4714E]">Complete intelligence.</em>
        </h2>
        <div className="space-y-6">
          {PROCESS_STEPS.map(s => (
            <Card key={s.num} hover={false} padding="px-10 py-10 max-md:px-6 max-md:py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <span className="font-sans text-[56px] font-black text-[#E8E4DC] leading-none shrink-0">{s.num}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1A1A18] mb-2 m-0">{s.title}</h3>
                  <p className="text-sm text-[#7A766E] leading-[1.6] m-0 max-w-[600px]">{s.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ NOT CHATGPT ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-4xl py-12 px-14 max-md:py-8 max-md:px-6">
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-4 m-0">
            &ldquo;How is this different from ChatGPT?&rdquo;
          </h3>
          <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1 mt-6">
            <div>
              <p className="text-xs uppercase tracking-[.12em] text-[#7A766E] font-semibold mb-3 m-0">ChatGPT / Generic AI</p>
              <ul className="space-y-2 list-none p-0 m-0">
                {[
                  'Searches the internet for general information',
                  'No structured methodology',
                  'No real transaction data',
                  'No localized market intelligence',
                  'Can\u2019t tell you what your business is worth',
                  'Hallucinate numbers with confidence',
                ].map(item => (
                  <li key={item} className="flex gap-2.5 items-start text-sm text-[#7A766E] leading-[1.55]">
                    <span className="text-[#A9A49C] shrink-0 mt-px">&times;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[.12em] text-[#D4714E] font-semibold mb-3 m-0">SMBX.ai / Yulia</p>
              <ul className="space-y-2 list-none p-0 m-0">
                {[
                  'Synthesizes sovereign federal data sources',
                  'Seven Layers of Intelligence\u2122 methodology',
                  'Real comparable transactions, sourced and cited',
                  'Localized to your city, industry, and ZIP code',
                  'Multi-methodology valuation with math shown',
                  'Every insight traceable, every analysis explainable',
                ].map(item => (
                  <li key={item} className="flex gap-2.5 items-start text-sm text-[#4A4843] leading-[1.55]">
                    <span className="text-[#D4714E] shrink-0 mt-px">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DEAL STORIES ═══ */}
      <section className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h2 className="font-sans text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for <em className="italic text-[#D4714E]">every</em> deal size.
        </h2>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {STORIES.map(s => (
            <Card key={s.deal} padding="px-8 py-10">
              <p className="text-[11px] uppercase tracking-[.12em] text-[#D4714E] font-semibold mb-3 m-0">{s.deal}</p>
              <p className="text-sm text-[#7A766E] leading-[1.6] m-0">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ DATA TRUST BAR ═══ */}
      <section className="max-w-site mx-auto px-10 pb-12 max-md:px-5 max-md:pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap py-4 px-6 rounded-full bg-[#F3F0EA] border border-[#E0DCD4]">
          <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#7A766E]">Powered by:</span>
          {['U.S. Census Bureau', 'Bureau of Labor Statistics', 'Federal Reserve (FRED)', 'SEC EDGAR', 'IRS Statistics of Income'].map((src, i) => (
            <span key={src} className="text-xs text-[#4A4843] font-medium">
              {src}{i < 4 && <span className="mx-1 text-[#A9A49C]">&middot;</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ CHAT INPUT ═══ */}
      <section id="chat-input" className="max-w-site mx-auto px-10 py-24 max-md:px-5 max-md:py-12">
        <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em] mb-8 m-0 text-center">
          See the methodology in action.
        </h3>
        <div className="card-outer max-w-[640px] mx-auto p-3">
          <div className="card-inner p-4">
            <PublicChatInput sourcePage="/how-it-works" />
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-24 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#D4714E] to-[#BE6342] rounded-4xl px-16 py-24 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-sans text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Every deal deserves this level of intelligence.
          </h3>
          <button
            onClick={() => document.getElementById('chat-input')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#D4714E] font-semibold text-[15px] px-8 py-4 rounded-full border-none cursor-pointer hover:bg-[#FFF0EB] transition-colors relative z-10 shrink-0"
          >
            Talk to Yulia &rarr;
          </button>
        </div>
      </section>

      {/* ═══ NUDGE ═══ */}
      <div className="text-center pb-10 max-md:pb-6">
        <p className="journey-nudge text-[22px] text-[#D4714E] m-0 max-md:text-lg">
          every deal starts with a conversation
        </p>
      </div>
    </PublicLayout>
  );
}
