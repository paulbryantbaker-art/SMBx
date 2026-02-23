import { useLocation } from 'wouter';
import PublicLayout from '../../components/public/PublicLayout';
import Button from '../../components/public/Button';
import Card from '../../components/public/Card';
import PublicChatInput from '../../components/public/PublicChatInput';
import { useAnonymousChat } from '../../hooks/useAnonymousChat';

/* ─── Data ─── */

const USE_CASES = [
  {
    title: 'Brokers & Intermediaries',
    desc: 'Produce CIMs in an hour. Screen and score buyer lists instantly. Manage 3\u00d7 the deal flow with the same team.',
  },
  {
    title: 'Attorneys & CPAs',
    desc: 'Free access when invited by a client. Review financials, flag risks, collaborate in real time.',
  },
  {
    title: 'PE Firms & Search Funds',
    desc: 'Screen hundreds of targets against your thesis. Model returns before your first call. Manage diligence across portfolio companies.',
  },
];

/* ─── Page ─── */

export default function Enterprise() {
  const [, navigate] = useLocation();
  const chat = useAnonymousChat({ context: 'enterprise' });

  return (
    <PublicLayout>
      {/* ═══ HERO ═══ */}
      <section className="max-w-site mx-auto px-10 pt-20 pb-20 max-md:px-5 max-md:pt-12 max-md:pb-12">
        <div className="flex items-center gap-3 mb-9 text-[13px] uppercase tracking-[.18em] text-[#DA7756] font-semibold">
          <span className="w-9 h-0.5 bg-[#DA7756]" />
          For Deal Professionals
        </div>
        <h1 className="font-serif text-[clamp(52px,7vw,92px)] font-black leading-none tracking-tight max-w-[14ch] mb-11 m-0">
          Your expertise. Yulia&apos;s horsepower.
        </h1>
        <p className="text-lg text-[#7A766E] max-w-[540px] leading-relaxed mb-10 m-0">
          Close more deals. Produce better work product. Spend your time on
          relationships, not spreadsheets.
        </p>
        <div className="flex flex-col md:flex-row gap-3 mb-10 max-md:w-full">
          <Button variant="primary" href="/signup">Get started &rarr;</Button>
          <Button variant="secondary" href="mailto:hello@smbx.ai">Talk to us</Button>
        </div>

        {/* ─── LIVE CHAT INPUT ─── */}
        <div className="max-w-[600px]">
          <PublicChatInput
            onSend={(msg) => { chat.sendMessage(msg); navigate('/'); }}
            placeholder="Tell Yulia about your deal flow or practice\u2026"
          />
        </div>
      </section>

      {/* ═══ THE PROBLEM FOR BROKERS ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="bg-[#F3F0EA] border border-[#E0DCD4] rounded-[20px] p-16 max-md:p-7">
          <p className="text-[17px] text-[#4A4843] leading-relaxed max-w-[700px] m-0">
            You have 15 active listings. Each one needs a valuation, a CIM, buyer outreach,
            and DD management. Your associates are drowning. Yulia is the team member who
            produces institutional-quality work product in minutes and never needs to sleep.
          </p>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {USE_CASES.map(u => (
            <Card key={u.title} padding="px-8 py-10">
              <h3 className="text-lg font-bold text-[#1A1A18] mb-3 m-0">{u.title}</h3>
              <p className="text-sm text-[#7A766E] leading-relaxed m-0">{u.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══ ROI ═══ */}
      <section className="max-w-site mx-auto px-10 py-20 max-md:px-5 max-md:py-12">
        <div className="grid grid-cols-2 gap-16 items-center max-md:grid-cols-1 max-md:gap-8">
          <h2 className="font-serif text-[clamp(32px,3.5vw,48px)] font-black tracking-tight leading-[1.1] m-0">
            The ROI is <em className="italic text-[#DA7756]">immediate.</em>
          </h2>
          <Card hover={false} padding="px-10 py-10">
            <p className="font-serif text-[32px] font-black text-[#DA7756] leading-tight mb-4 m-0">$150K+</p>
            <p className="text-[15px] text-[#7A766E] leading-relaxed m-0">
              A broker producing 2 more CIMs per month at average commission adds $150K+
              in annual revenue. Yulia pays for herself on deal one.
            </p>
          </Card>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-site mx-auto px-10 pb-20 max-md:px-5 max-md:pb-12">
        <div className="bg-gradient-to-br from-[#DA7756] to-[#C4684A] rounded-[20px] px-16 py-20 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden max-md:px-7 max-md:py-12 max-md:text-center">
          <h3 className="font-serif text-[clamp(28px,3vw,40px)] font-black text-white leading-snug max-w-[480px] m-0 relative z-10">
            Your deal expertise. Yulia&apos;s speed. Let&apos;s go.
          </h3>
          <Button variant="ctaBlock" href="/signup" className="relative z-10">
            Get started &rarr;
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
