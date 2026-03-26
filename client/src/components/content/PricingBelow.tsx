import { useDarkMode } from '../shared/DarkModeToggle';
import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function PricingBelow() {
  const [dark] = useDarkMode();

  const handleCTA = (plan?: string) => {
    if (plan === 'enterprise') {
      window.location.href = '/chat?message=' + encodeURIComponent("I'm interested in the Enterprise plan for my team.");
    } else {
      window.location.href = '/chat';
    }
  };

  const muted = dark ? 'text-[#dadadc]/70' : 'text-[#5d5e61]';
  const card = dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]';
  const subtleBg = dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]';
  const darkPanel = dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]';

  const tiers = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      desc: 'Full analytical power for exploring and evaluating deals.',
      cta: 'Start with Starter',
      highlight: false,
      features: [
        'Unlimited AI conversation with Yulia',
        'Unlimited ValueLens reports',
        'Unlimited deal scoring',
        'Value Readiness Report',
        'Full SDE/EBITDA analysis with add-backs',
        'Investment Thesis (buyers)',
        'Capital Stack modeling',
        'Document exports',
      ],
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      desc: 'Everything you need to execute a deal from start to close.',
      cta: 'Try Professional free for 30 days',
      highlight: true,
      features: [
        'Everything in Starter, plus:',
        'AI-generated CIM',
        'Deal room access',
        'Buyer/seller matching',
        'Acquisition target sourcing',
        'DD checklists & LOI tools',
        'Living documents (auto-refresh)',
        'Professional services matching',
      ],
    },
    {
      name: 'Enterprise',
      price: '$999',
      period: '/month',
      desc: 'For teams, firms, and portfolios managing multiple deals.',
      cta: 'Talk to Yulia',
      highlight: false,
      enterprise: true,
      features: [
        'Everything in Professional, plus:',
        'Unlimited team members',
        'Branded / white-label outputs',
        'API access',
        'Portfolio dashboard',
        'Background AI agents',
        'Priority support',
        'Custom integrations',
      ],
    },
  ];

  const comparisonCategories = [
    {
      name: 'AI Analysis',
      features: [
        { name: 'Unlimited Yulia conversation', starter: true, pro: true, enterprise: true },
        { name: 'ValueLens (AI valuation)', starter: true, pro: true, enterprise: true },
        { name: 'Deal scoring', starter: true, pro: true, enterprise: true },
        { name: 'Value Readiness Report', starter: true, pro: true, enterprise: true },
        { name: 'Full SDE/EBITDA analysis', starter: true, pro: true, enterprise: true },
        { name: 'Investment Thesis', starter: true, pro: true, enterprise: true },
        { name: 'Capital Stack modeling', starter: true, pro: true, enterprise: true },
      ],
    },
    {
      name: 'Deal Execution',
      features: [
        { name: 'CIM generation', starter: false, pro: true, enterprise: true },
        { name: 'Deal room', starter: false, pro: true, enterprise: true },
        { name: 'DD checklists & LOI tools', starter: false, pro: true, enterprise: true },
        { name: 'Living documents', starter: false, pro: true, enterprise: true },
      ],
    },
    {
      name: 'Matching & Sourcing',
      features: [
        { name: 'Buyer/seller matching', starter: false, pro: true, enterprise: true },
        { name: 'Acquisition target sourcing', starter: false, pro: true, enterprise: true },
        { name: 'Professional services matching', starter: false, pro: true, enterprise: true },
      ],
    },
    {
      name: 'Team & Enterprise',
      features: [
        { name: 'Unlimited team members', starter: false, pro: false, enterprise: true },
        { name: 'White-label outputs', starter: false, pro: false, enterprise: true },
        { name: 'API access', starter: false, pro: false, enterprise: true },
        { name: 'Portfolio dashboard', starter: false, pro: false, enterprise: true },
        { name: 'Priority support', starter: false, pro: false, enterprise: true },
      ],
    },
  ];

  const faqs = [
    { q: 'Is there a free tier?', a: 'Yes. Talk to Yulia about anything — no account needed. Your first AI valuation or deal score is free. After that, Starter is $49/month.' },
    { q: 'Can I try Professional before paying?', a: 'Yes. 30-day free trial, cancel anytime.' },
    { q: 'What happens when my deal closes?', a: "Your subscription keeps working. Post-close integration planning, value creation support — it's all included as long as you're subscribed." },
    { q: "I'm a broker — which plan do I need?", a: 'If you\'re managing client deals solo, Professional. If you have a team, Enterprise gives you unlimited users and white-label outputs.' },
    { q: 'Do you charge success fees or commissions?', a: 'Never. Your subscription covers everything. No hidden fees, no per-deal charges, no success fees.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Monthly billing, cancel anytime. No contracts, no annual commitments.' },
  ];

  const check = <span className="material-symbols-outlined text-[#b0004a] text-lg">check_circle</span>;
  const dash = <span className={`text-lg ${dark ? 'text-zinc-700' : 'text-[#d0d0d2]'}`}>—</span>;

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>

      {/* ═══ 1. HERO ═══ */}
      <section className="mb-24 mt-12 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <ScrollReveal>
          <span className="inline-block px-3 py-1 bg-[#b0004a]/10 text-[#b0004a] text-[10px] font-black uppercase tracking-[0.2em] mb-8 rounded-sm">Pricing</span>
          <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            AI deal intelligence<br />for <span className="text-[#b0004a]">every deal size.</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${muted}`}>
            Start free. Get your first valuation or deal score on us. When you're ready for more, plans start at $49/month.
          </p>
        </ScrollReveal>
      </section>

      {/* ═══ 2. THREE-TIER CARDS ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <StaggerItem key={tier.name}>
              <div className={`p-10 rounded-2xl flex flex-col h-full relative ${
                tier.highlight
                  ? `${dark ? 'bg-[#2f3133]' : 'bg-white'} border-2 border-[#b0004a] shadow-2xl md:scale-105`
                  : tier.enterprise
                    ? `${darkPanel} text-white`
                    : card
              }`}>
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b0004a] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${tier.enterprise ? 'text-white' : ''}`}>{tier.name}</h3>
                <div className={`text-4xl font-headline font-extrabold mb-2 ${tier.enterprise ? 'text-white' : ''}`}>
                  {tier.price}<span className={`text-lg font-medium ${tier.enterprise ? 'text-gray-400' : muted}`}>{tier.period}</span>
                </div>
                <p className={`text-sm mb-8 ${tier.enterprise ? 'text-gray-400' : muted}`}>{tier.desc}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {tier.features.map((feat, i) => (
                    <li key={feat} className={`flex items-start gap-3 text-sm ${i === 0 && feat.includes('Everything') ? `font-medium ${tier.enterprise ? 'text-gray-400' : muted}` : 'font-medium'}`}>
                      {i === 0 && feat.includes('Everything') ? null : (
                        <span className="material-symbols-outlined text-[#b0004a] text-lg shrink-0 mt-0.5">check_circle</span>
                      )}
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCTA(tier.enterprise ? 'enterprise' : undefined)}
                  className={`w-full py-4 rounded-xl font-bold transition-all border-none cursor-pointer ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white hover:opacity-90 shadow-lg'
                      : tier.enterprise
                        ? `${dark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white/10 hover:bg-white/20'} text-white`
                        : `${dark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-[#f3f3f6] hover:bg-[#eeeef0] text-[#1a1c1e]'}`
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══ 3. FREE CALLOUT ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className={`${subtleBg} rounded-3xl p-10 md:p-14 text-center`}>
            <h2 className="font-headline text-3xl font-black tracking-tight mb-4">Not sure yet? Start free.</h2>
            <p className={`text-lg max-w-2xl mx-auto mb-8 ${muted}`}>
              Talk to Yulia for free. Get your first AI valuation or deal score — no account, no credit card. When you're ready for more, Starter is $49/month.
            </p>
            <button
              onClick={() => handleCTA()}
              className="px-10 py-4 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
            >
              Talk to Yulia — it's free
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 4. FEATURE COMPARISON GRID ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-headline text-4xl font-black tracking-tight mb-12 text-center">Compare plans</h2>
        </ScrollReveal>

        {/* Desktop table */}
        <ScrollReveal>
          <div className="hidden md:block">
            <div className={`rounded-2xl overflow-hidden ${card}`}>
              {/* Header */}
              <div className={`grid grid-cols-4 gap-0 ${dark ? 'bg-zinc-800/50' : 'bg-[#f3f3f6]'}`}>
                <div className="p-6"></div>
                <div className="p-6 text-center font-bold">Starter</div>
                <div className="p-6 text-center font-bold text-[#b0004a]">Professional</div>
                <div className="p-6 text-center font-bold">Enterprise</div>
              </div>

              {comparisonCategories.map((cat) => (
                <div key={cat.name}>
                  <div className={`px-6 py-3 font-bold text-xs uppercase tracking-widest ${dark ? 'bg-zinc-800/30 text-[#dadadc]/50' : 'bg-[#f9f9fc] text-[#5d5e61]'}`}>
                    {cat.name}
                  </div>
                  {cat.features.map((feat, i) => (
                    <div key={feat.name} className={`grid grid-cols-4 gap-0 ${i < cat.features.length - 1 ? `${dark ? 'border-b border-zinc-800/50' : 'border-b border-[#f3f3f6]'}` : ''}`}>
                      <div className={`p-4 px-6 text-sm ${muted}`}>{feat.name}</div>
                      <div className="p-4 flex justify-center">{feat.starter ? check : dash}</div>
                      <div className="p-4 flex justify-center">{feat.pro ? check : dash}</div>
                      <div className="p-4 flex justify-center">{feat.enterprise ? check : dash}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: collapsible by category */}
          <div className="md:hidden space-y-4">
            {comparisonCategories.map((cat) => (
              <div key={cat.name} className={`${card} rounded-xl overflow-hidden`}>
                <div className={`px-5 py-3 font-bold text-xs uppercase tracking-widest ${dark ? 'bg-zinc-800/30 text-[#dadadc]/50' : 'bg-[#f9f9fc] text-[#5d5e61]'}`}>
                  {cat.name}
                </div>
                {cat.features.map((feat) => (
                  <div key={feat.name} className={`px-5 py-3 ${dark ? 'border-t border-zinc-800/50' : 'border-t border-[#f3f3f6]'}`}>
                    <p className="text-sm font-medium mb-2">{feat.name}</p>
                    <div className="flex gap-6 text-xs">
                      <span className={feat.starter ? 'text-[#b0004a] font-bold' : muted}>{feat.starter ? 'Starter ✓' : '—'}</span>
                      <span className={feat.pro ? 'text-[#b0004a] font-bold' : muted}>{feat.pro ? 'Pro ✓' : '—'}</span>
                      <span className={feat.enterprise ? 'text-[#b0004a] font-bold' : muted}>{feat.enterprise ? 'Ent ✓' : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ 5. FAQ ═══ */}
      <section className="mb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="font-headline text-4xl font-black tracking-tight mb-12">Questions</h2>
        </ScrollReveal>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {faqs.map((faq) => (
            <StaggerItem key={faq.q}>
              <div>
                <h4 className="font-bold mb-2">{faq.q}</h4>
                <p className={`text-sm leading-relaxed ${muted}`}>{faq.a}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══ 6. CTA ═══ */}
      <section className="mb-12 px-6 md:px-12 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className={`${darkPanel} rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white`}>
            <div>
              <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">
                Free until you<br />see the <span className="text-[#b0004a]">value.</span>
              </h2>
              <p className="text-lg text-[#dadadc]/60 mt-4">Tell Yulia about your deal. Keep everything she finds. Plans start at $49/month when you're ready for more.</p>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-4">
              <button
                onClick={() => handleCTA()}
                className="px-10 py-5 bg-gradient-to-r from-[#b0004a] to-[#d81b60] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer"
              >
                Talk to Yulia
              </button>
              <p className="text-xs text-[#dadadc]/30">No account required · No credit card · Cancel anytime</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
