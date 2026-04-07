import {
  ScrollReveal, StaggerContainer, StaggerItem,
  TiltCard, ConversationTyping, MagneticButton,
  GlowingOrb, AnimatedCounter, PulseBadge,
} from './animations';
import { darkClasses } from './darkHelpers';
import { bridgeToYulia, goToChat } from './chatBridge';
import { LandingSBACalc } from './LandingCalculators';
import usePageMeta from '../../hooks/usePageMeta';

export default function BuyBelow({ dark }: { dark: boolean }) {
  const dc = darkClasses(dark);

  usePageMeta({
    title: 'Buy a Business | SBA 7(a) Guide, Deal Scoring & Due Diligence — smbx.ai',
    description: 'Screen acquisitions against real market data. SBA 7(a) eligibility, DSCR analysis, deal scoring, and 180-day integration plan. AI deal intelligence for buyers.',
    canonical: 'https://smbx.ai/buy',
    faqs: [
      { question: 'How do I know if a business is worth buying?', answer: 'Evaluate a business across seven dimensions: financial performance (SDE/EBITDA trends), market position, owner dependency, customer concentration, growth trajectory, deal structure bankability (DSCR), and operational risk. Yulia runs all seven analyses from a single conversation and gives you a pursue-or-pass recommendation backed by data.' },
      { question: 'What is DSCR and why does it matter for SBA loans?', answer: 'DSCR (Debt Service Coverage Ratio) measures whether a business generates enough cash flow to cover loan payments. It\'s calculated as annual earnings divided by annual debt service. SBA 7(a) loans require a minimum DSCR of 1.25x — meaning the business must earn $1.25 for every $1 of debt payment. A DSCR below 1.25x means the deal is not SBA bankable at the proposed terms.' },
      { question: 'What is Entrepreneurship Through Acquisition (ETA)?', answer: 'Entrepreneurship Through Acquisition (ETA) is the strategy of buying an existing profitable business rather than starting one from scratch. It includes search funds (institutional capital backing an individual\'s search), self-funded searches, and acquisition entrepreneurship. ETA has become a mainstream path at top MBA programs and is growing rapidly as an alternative to traditional startups.' },
      { question: 'How much money do I need to buy a business?', answer: 'With SBA 7(a) financing, you can buy a business with as little as 10% down. On a $2M acquisition, that\'s $200K equity. The SBA lends up to $5M with 10-year terms. Acquisition financing structures can also include seller notes (5-15% of price), earnouts, and equity rolls to reduce the upfront cash required.' },
    ],
  });

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO + CONVERSATION DEMO ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-8">
              <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Buy</span>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dc.subtleBg} ${dc.muted}`}>Acquisition Strategy</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.1}>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-8 max-w-4xl">
              You're making offers based on <span className="text-[#D44A78]">incomplete data.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className={`text-xl leading-relaxed max-w-2xl mb-10 ${dc.muted}`}>
              Eighty percent of small businesses sell through whisper networks — not listings. The asking price is a number the seller picked. The DSCR (can the business cover the loan payments?) isn't calculated until you're already emotionally committed. Yulia screens every deal against real market data before you spend a dollar on diligence.
            </p>
          </ScrollReveal>

          {/* Conversation demo — Yulia screening a deal live */}
          <ScrollReveal delay={0.3}>
            <div className={`rounded-3xl p-6 md:p-8 max-w-3xl ${dc.darkPanel}`}>
              <ConversationTyping
                messages={[
                  {
                    type: 'user',
                    content: (
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-white text-[15px] leading-relaxed">
                        I found a listing — HVAC company in Dallas, $1.8M revenue, asking $2M. Is the price fair?
                      </div>
                    ),
                    delay: 600,
                  },
                  {
                    type: 'ai',
                    content: (
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-[#D44A78] flex items-center justify-center text-white text-xs font-bold shrink-0">Y</div>
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none text-white text-[15px] leading-relaxed">
                          HVAC in Dallas-Fort Worth trades at 2.6x–3.4x SDE. At $1.8M revenue with typical 28% SDE margin, that's roughly $504K SDE. The $2M ask implies a 3.97x multiple — <span className="text-[#ffb2bf] font-bold">above the defensible range.</span>
                          <span className="block mt-2 font-semibold">Let me check the DSCR before we go further.</span>
                        </div>
                      </div>
                    ),
                    delay: 1400,
                  },
                  {
                    type: 'ai',
                    content: (
                      <div className="flex gap-3 items-start">
                        <div className="w-8 shrink-0" />
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Ask Multiple</p><p className="text-lg font-black text-[#EA4335]">3.97x</p></div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Fair Range</p><p className="text-lg font-black text-[#34A853]">2.6–3.4x</p></div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/10"><p className="text-[9px] text-[#dadadc]/60 uppercase font-bold mb-1">Verdict</p><p className="text-lg font-black text-[#FBBC04]">NEGOTIATE</p></div>
                        </div>
                      </div>
                    ),
                    delay: 800,
                  },
                ]}
              />
              <p className="text-[#dadadc]/50 text-xs text-center mt-6">60 seconds. No signup. Yulia is already running deal intelligence.</p>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. DEAL ECONOMICS — THE RUNDOWN ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`rounded-3xl overflow-hidden text-white ${dc.darkPanel}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: Financial Breakdown */}
                <div className="lg:col-span-7 p-10 md:p-16">
                  <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">The Rundown — Score Any Deal</span>
                  <h2 className="text-4xl font-headline font-black tracking-tight mb-4">What a $2M HVAC acquisition actually returns.</h2>
                  <p className="text-lg text-[#dadadc]/60 mb-10 max-w-lg">This isn't a template. This is a real deal in Dallas-Fort Worth, screened by Yulia.</p>
                  <div className="mb-6">
                    <p className="text-xs text-[#dadadc]/60 uppercase tracking-widest font-bold">SBA Bankability</p>
                    <p className="font-headline font-bold text-xl mt-1">HVAC · Dallas-Fort Worth</p>
                  </div>
                  <div className="space-y-3 mb-8">
                    {[
                      ['Purchase Price', '$2,016,000'],
                      ['Down Payment (10%)', '$201,600'],
                      ['SBA 7(a) Loan', '$1,814,400'],
                      ['Annual Debt Service', '$248,000'],
                      ['Adjusted SDE', '$480,000'],
                      ['DSCR', '1.94×'],
                    ].map(([label, amount]) => (
                      <div key={label} className="flex justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-[#dadadc]/80">{label}</span>
                        <span className="font-bold text-[#8ff9a8]">{amount}</span>
                      </div>
                    ))}
                  </div>
                  <TiltCard className="inline-block w-full">
                    <div className="bg-[#006630]/20 border border-[#006630]/30 p-5 rounded-xl text-center">
                      <PulseBadge color="#34A853">
                        <span className="material-symbols-outlined text-[#8ff9a8] text-2xl">check_circle</span>
                      </PulseBadge>
                      <p className="text-[#8ff9a8] font-bold mt-1">SBA ELIGIBLE</p>
                      <p className="text-[#dadadc]/60 text-xs mt-1">DSCR clears minimum by 0.69x — strong margin of safety</p>
                    </div>
                  </TiltCard>
                </div>
                {/* Right: Wealth Creation */}
                <div className="lg:col-span-5 bg-[#D44A78] p-10 md:p-16 flex flex-col justify-center">
                  <p className="text-white/80 uppercase tracking-widest text-xs font-bold mb-8">5-Year Wealth Creation</p>
                  <div className="space-y-6">
                    {[
                      { label: 'Year 1 owner compensation', value: 232000 },
                      { label: 'Years 1–5 cumulative cash flow', value: 1160000 },
                      { label: 'Equity value at exit (3.2x)', value: 1850000 },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-white/80 text-xs uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="font-headline font-black text-3xl">
                          <AnimatedCounter value={item.value} prefix="$" suffix="" />
                        </p>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-white/20">
                      <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Total 5-year wealth creation</p>
                      <p className="font-headline font-black text-5xl tracking-tight">
                        $<AnimatedCounter value={3010000} />
                      </p>
                      <p className="text-white/80 text-sm mt-2">14.9x return on $201,600 down payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. SBA CALCULATOR ═══ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <ScrollReveal className="lg:col-span-5">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">SBA 7(a) for Acquisitions</span>
              <h2 className="text-4xl font-headline font-black tracking-tight mb-6">Can you actually afford this deal? Check before you sign.</h2>
              <p className={`leading-relaxed editorial mb-6 ${dc.muted}`}>
                SBA 7(a) lenders won't fund your deal if the business can't cover the loan payments by at least 1.25x. That number is called DSCR — debt service coverage ratio. If it's below 1.25, your deal is dead before it starts. Run it here.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="lg:col-span-7">
              <LandingSBACalc dark={dark} />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ 4. WHO THIS IS FOR ═══ */}
        <section className="mb-24">
          <ScrollReveal>
            <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Who This Is For</span>
            <h2 className="text-4xl font-headline font-black tracking-tight mb-4">What does Yulia do differently for you?</h2>
            <p className={`text-lg max-w-2xl mb-12 ${dc.muted}`}>
              Different buyers need different things. Yulia adapts — different data, different tools, different depth.
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: 'First-Time Buyer',
                icon: 'person',
                desc: "You've never bought a business. Yulia walks you through every step — what SBA lenders actually look for, what 'working capital peg' means, how to read a seller's tax return. No jargon until you ask for it.",
              },
              {
                type: 'Search Fund / ETA',
                icon: 'search',
                desc: "Your LPs expect rigor. Yulia screens 50 targets while you're reading one deal package. Financial models that satisfy your investors. Deal scoring that justifies your thesis.",
              },
              {
                type: 'Experienced Acquirers',
                icon: 'stacks',
                desc: "You know what you're doing. You need speed. Yulia's value is volume — screen, model, and diligence at the velocity your pipeline demands.",
              },
            ].map((card) => (
              <StaggerItem key={card.type}>
                <TiltCard className="h-full">
                  <div className={`p-8 rounded-2xl h-full ${dc.card}`}>
                    <span className="material-symbols-outlined text-[#D44A78] text-3xl mb-4">{card.icon}</span>
                    <h3 className="font-headline font-bold text-xl mb-3">{card.type}</h3>
                    <p className={`text-sm ${dc.muted}`}>{card.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══ 5. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12 relative">
            <GlowingOrb size={300} color="rgba(212,74,120,0.15)" top="-100px" left="-80px" />
            <div className={`rounded-3xl p-12 md:p-16 text-center relative z-10 ${dc.darkPanel} text-white`}>
              <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[0.95] mb-4">
                Paste a listing.<br /><span className="text-[#D44A78]">Know in 60 seconds.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 max-w-xl mx-auto mb-8">
                Tell Yulia about a deal — a listing URL, a broker package, or just a description. Pursue or pass before you spend a dollar.
              </p>
              <div className="flex flex-col items-center gap-4">
                <MagneticButton
                  onClick={goToChat}
                  className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                >
                  Screen a deal
                </MagneticButton>
                <p className="text-xs text-[#dadadc]/70">Free deal screening · No account required · Your data stays yours</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
