import { useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/public/PublicChatInput';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Tell Yulia about your deal',
    price: 'Free',
    desc: 'Are you selling, buying, or raising? Yulia asks the right questions, classifies your business, and builds your profile.',
  },
  {
    num: '02',
    title: 'She analyzes everything',
    price: 'Free',
    desc: 'Yulia calculates your SDE or EBITDA, identifies add-backs, pulls industry comps, and gives you a preliminary range.',
  },
  {
    num: '03',
    title: 'Get real deliverables',
    price: 'Pay as you go',
    desc: 'Full valuation report. CIM. Buyer list. Pitch deck. DD checklist. Real documents you can hand to a buyer, investor, or attorney.',
  },
  {
    num: '04',
    title: 'Close with confidence',
    price: 'Stage-by-stage',
    desc: 'Yulia guides you through negotiation, deal structuring, and closing. Every stage, every decision, every document.',
  },
];

const INTELLIGENCE = [
  'HVAC companies in Dallas sell at 4.5\u20136\u00D7 EBITDA to PE consolidators',
  'Your gross margins are 12% below industry median \u2014 here\u2019s how to fix it',
  '3 PE firms actively acquiring veterinary practices in your region',
  'Based on 847 comparable transactions in the last 24 months',
];

const STORIES = [
  {
    deal: '$400K Landscaping',
    name: 'Marco',
    desc: 'First-time seller. Yulia identified $31K in legitimate add-backs Marco didn\u2019t know existed, increasing his valuation by 15%. Financial analysis to closing in under 90 days.',
  },
  {
    deal: '$3M HVAC Company',
    name: 'Danielle',
    desc: 'Experienced operator selling a mature business. Yulia produced an institutional-quality CIM, identified 23 qualified buyers, and helped Danielle close at 5.2\u00D7 EBITDA \u2014 top of range.',
  },
  {
    deal: '$12M Search Fund',
    name: 'Search Fund Team',
    desc: 'Screened 200+ targets in one weekend. Scored and ranked by thesis fit, financial health, and owner readiness. First LOI submitted within 3 weeks.',
  },
  {
    deal: '$40M PE Roll-up',
    name: 'Platform Build',
    desc: '6 acquisitions in 14 months. Yulia managed the pipeline, ran valuations on each target, and coordinated due diligence across all deals simultaneously.',
  },
];

const SUGGESTED_PROMPTS = [
  'I want to sell my business',
  'Looking to buy a company',
  'Need to raise capital',
];

/* ─── Page ─── */

export default function HowItWorks() {
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'how-it-works' });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-12 max-md:px-5 max-md:pt-12 max-md:pb-8">
        <h1 className="font-serif text-[clamp(40px,5.5vw,72px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[14ch] mb-5 m-0">
          Talk to Yulia. She handles the rest.
        </h1>
        <p className="text-[19px] text-[#7A766E] max-w-[540px] leading-[1.6] mb-10 m-0">
          Here&apos;s what happens when you start a deal. Try it now.
        </p>

        {/* Live chat input */}
        <div className="max-w-[640px]">
          <PublicChatInput
            onSend={(msg) => { chat.sendMessage(msg); navigate('/'); }}
            placeholder="Try it \u2014 tell Yulia what you're working on\u2026"
            suggestedPrompts={SUGGESTED_PROMPTS}
          />
        </div>
      </section>

      {/* ═══ THE PROCESS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="space-y-6">
          {PROCESS_STEPS.map(s => (
            <Card key={s.num} hover={false} padding="px-10 py-10 max-md:px-6 max-md:py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <span className="font-serif text-[56px] font-black text-[#E8E4DC] leading-none shrink-0">{s.num}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#1A1A18] m-0">{s.title}</h3>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#DA7756]">{s.price}</span>
                  </div>
                  <p className="text-sm text-[#7A766E] leading-relaxed m-0 max-w-[600px]">{s.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ APPLIED INTELLIGENCE ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(36px,4.5vw,60px)] font-black tracking-[-0.02em] leading-[1.05] mb-10 m-0">
          Not generic advice. <em className="italic text-[#DA7756]">Your</em> deal, <em className="italic text-[#DA7756]">your</em> market.
        </h2>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {INTELLIGENCE.map(item => (
            <Card key={item} hover={false} padding="px-8 py-6">
              <p className="text-[15px] text-[#4A4843] leading-relaxed m-0 italic font-serif">&ldquo;{item}&rdquo;</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ COLLABORATION ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] p-16 max-md:p-7">
          <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] leading-[1.1] mb-6 m-0">
            Everyone on the deal. <em className="italic text-[#DA7756]">One room.</em>
          </h2>
          <p className="text-[17px] text-[#7A766E] leading-relaxed max-w-[700px] m-0">
            Invite your broker, attorney, CPA, and real estate agent into your deal room.
            They collaborate for free. Shared documents, shared timeline, no email scavenger hunts.
          </p>
        </div>
      </section>

      {/* ═══ STORIES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          Built for every deal size.
        </h2>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          {STORIES.map(s => (
            <Card key={s.deal} padding="px-8 py-10">
              <p className="text-[11px] uppercase tracking-wider text-[#DA7756] font-semibold mb-2 m-0">{s.deal}</p>
              <h3 className="text-lg font-bold text-[#1A1A18] mb-3 m-0">{s.name}</h3>
              <p className="text-sm text-[#7A766E] leading-relaxed m-0">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            See it in action. Start free.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Start with Yulia &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
