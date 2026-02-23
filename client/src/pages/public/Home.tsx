import { Link, useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import ConversationPreview from '../../components/public/ConversationPreview';
import PublicChatView from '../../components/public/PublicChatView';
import { useChatContext } from '../../contexts/ChatContext';

/* ─── Data ─── */

const SUGGESTED_PROMPTS = [
  'I want to sell my HVAC business',
  "I'm looking to acquire a SaaS company",
  'Help me value a $3M business',
  'I need to raise $2M',
];

const PERSONAS = [
  {
    emoji: '\u{1F3E2}',
    title: 'Business Owners',
    desc: 'Selling, buying, or raising \u2014 Yulia speaks your language. No jargon, no assumptions. Just clear guidance from first question to closing day.',
    example: '\u201CI had no idea my add-backs were worth $127K. Yulia found every one.\u201D',
  },
  {
    emoji: '\u{1F91D}',
    title: 'Brokers & Advisors',
    desc: 'Produce CIMs in an hour, not three weeks. Screen and score buyer lists instantly. Manage 3\u00D7 the deal flow with the same team.',
    example: '\u201CI closed 4 more deals last quarter using Yulia for work product.\u201D',
  },
  {
    emoji: '\u2696\uFE0F',
    title: 'Attorneys & CPAs',
    desc: "Invited by your client? You\u2019re in \u2014 for free. Review financials, flag risks, collaborate on documents in real time.",
    example: '\u201CFinally, one place to see the whole deal instead of chasing 6 inboxes.\u201D',
  },
  {
    emoji: '\u{1F4CA}',
    title: 'Investors & Search Funds',
    desc: 'Screen hundreds of targets overnight. Model returns before your first call. Manage diligence across a portfolio.',
    example: '\u201CScored 47 acquisition targets against my thesis in one session.\u201D',
  },
];

const JOURNEYS = [
  {
    title: 'Sell',
    hook: 'Know your real number.',
    desc: 'From \u201Cwhat\u2019s my business worth?\u201D to wire transfer \u2014 Yulia handles valuation, CIM, buyer matching, and closing support.',
    link: '/sell',
    cta: 'Start selling \u2192',
  },
  {
    title: 'Buy',
    hook: 'Find the right deal.',
    desc: 'Build your thesis, screen targets, model returns, manage diligence \u2014 whether it\u2019s your first acquisition or your fifteenth.',
    link: '/buy',
    cta: 'Start buying \u2192',
  },
  {
    title: 'Raise Capital',
    hook: 'Raise without losing control.',
    desc: 'Valuation, pitch deck, investor targeting, term sheet analysis. Negotiate from strength, not desperation.',
    link: '/raise',
    cta: 'Start raising \u2192',
  },
  {
    title: 'Integrate',
    hook: 'Your first 100 days.',
    desc: "You just acquired a business. Now what? Day 0 checklist through 100-day optimization. Don\u2019t let value slip away.",
    link: '/integrate',
    cta: 'Start planning \u2192',
  },
];

const TRUST_STATS = [
  { num: '$2.4T', desc: 'Annual SMB\ntransaction volume' },
  { num: '80+', desc: 'Industry verticals\nwith live market data' },
  { num: 'Minutes', desc: 'From conversation\nto deliverable' },
  { num: 'Free', desc: 'For attorneys, CPAs,\nand service providers' },
];

/* ─── Page ─── */

export default function Home() {
  const [, navigate] = useLocation();
  const {
    messages,
    sending,
    streamingText,
    messagesRemaining,
    limitReached,
    error,
    sendMessage,
  } = useChatContext();
  const hasMessages = messages.length > 0 || sending;

  return (
    <PublicLayout>
      {/* ═══ SECTION 1: HERO (Chat-First) ═══ */}
      <section className="max-w-[860px] mx-auto px-10 pt-20 pb-12 text-center max-md:px-5 max-md:pt-12 max-md:pb-8">
        <h1 className="font-serif text-[clamp(40px,5.5vw,72px)] font-black leading-[1.05] tracking-[-0.03em] mb-5 m-0">
          Every deal deserves an <em className="italic text-[#DA7756]">expert.</em>
        </h1>
        <p className="text-[19px] text-[#7A766E] leading-[1.6] max-w-[560px] mx-auto mb-12 m-0">
          Yulia is the AI deal advisor that brokers, owners, and investors
          use to move faster, know more, and close with confidence.
        </p>

        {/* Live chat area */}
        <div className="max-w-[640px] mx-auto">
          <PublicChatView
            messages={messages}
            sending={sending}
            streamingText={streamingText}
            messagesRemaining={messagesRemaining}
            limitReached={limitReached}
            error={error}
            onSend={sendMessage}
            onSignup={() => navigate('/signup')}
            placeholder="Tell Yulia about your deal..."
            suggestedPrompts={SUGGESTED_PROMPTS}
          />
        </div>

        {/* Free note — hide once chat starts */}
        {!hasMessages && (
          <p className="text-[13px] text-[#7A766E] mt-6 m-0">
            Your first financial analysis is <strong className="text-[#4A4843]">always free</strong>.
          </p>
        )}
      </section>

      {/* ═══ SECTION 2: WHO USES THIS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[.2em] text-[#DA7756] font-semibold mb-4 m-0">
            Built for everyone on the deal
          </p>
          <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] m-0">
            One platform. Every seat at the table.
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {PERSONAS.map(p => (
            <Card key={p.title} padding="px-6 py-8">
              <div className="text-[28px] mb-4">{p.emoji}</div>
              <h3 className="text-[17px] font-bold text-[#1A1A18] mb-2 m-0">{p.title}</h3>
              <p className="text-sm text-[#7A766E] leading-[1.55] m-0">{p.desc}</p>
              <div className="mt-4 pt-4 border-t border-[#E0DCD4]">
                <p className="text-[13px] text-[#4A4843] italic leading-[1.5] m-0">{p.example}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 3: CONVERSATION PREVIEW ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-2 gap-[60px] items-end mb-12 max-md:grid-cols-1 max-md:gap-6">
          <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-black tracking-[-0.025em] leading-[1.08] m-0">
            See what happens when you <em className="italic text-[#DA7756]">start talking.</em>
          </h2>
          <p className="text-[17px] text-[#7A766E] leading-[1.65] m-0">
            Yulia doesn&apos;t ask you to fill out forms. She has a conversation &mdash;
            and turns it into institutional-quality work product in minutes.
          </p>
        </div>
        <ConversationPreview />
      </section>

      {/* ═══ SECTION 4: JOURNEYS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-[-0.02em] mb-10 m-0">
          What brings you here?
        </h2>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {JOURNEYS.map(j => (
            <Link key={j.link} href={j.link} className="no-underline">
              <Card padding="px-6 py-8" className="h-full flex flex-col">
                <h3 className="font-serif text-[22px] font-bold text-[#1A1A18] mb-3 m-0">{j.title}</h3>
                <p className="text-[15px] text-[#1A1A18] font-medium leading-[1.5] mb-4 m-0">{j.hook}</p>
                <p className="text-sm text-[#7A766E] leading-[1.55] flex-1 m-0">{j.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-[#DA7756] text-sm font-semibold mt-5 transition-transform duration-200 hover:translate-x-1">
                  {j.cta}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 5: TRUST NUMBERS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 border-t border-[#E0DCD4] max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-4 max-md:grid-cols-2 max-md:gap-6">
          {TRUST_STATS.map((s, i) => (
            <div
              key={s.num}
              className={`px-7 max-md:px-0 ${
                i < 3 ? 'border-r border-[#E0DCD4] max-md:border-r-0' : ''
              } ${i === 0 ? 'pl-0' : ''}`}
            >
              <p className="font-serif text-[42px] font-black leading-none m-0">{s.num}</p>
              <p className="text-[13px] text-[#7A766E] mt-2 m-0 leading-[1.45] whitespace-pre-line">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6: FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <div className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.1),transparent)]" />
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-[1.15] tracking-[-0.02em] max-w-[480px] m-0 relative z-10">
            Your next deal starts with a conversation.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Talk to Yulia &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
