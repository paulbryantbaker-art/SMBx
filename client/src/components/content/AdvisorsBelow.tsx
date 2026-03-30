import { ScrollReveal, StaggerContainer, StaggerItem } from './animations';

export default function AdvisorsBelow({ dark }: { dark: boolean }) {

  const handleCTA = () => {
    window.location.href = '/chat';
  };

  const card = dark ? 'bg-[#2f3133] border border-zinc-800' : 'bg-white border border-[#eeeef0]';
  const muted = dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]';
  const emphasis = dark ? 'text-[#f9f9fc]' : 'text-[#1a1c1e]';
  const subtleBg = dark ? 'bg-[#2f3133]' : 'bg-[#f3f3f6]';
  const darkPanel = dark ? 'bg-[#0f1012]' : 'bg-[#1a1c1e]';

  const timeRows = [
    { before: '40 hrs', after: '2 hrs', label: 'CIM generation', highlight: true },
    { before: '1 week', after: '5 min', label: 'Valuation analysis', highlight: false },
    { before: '1 month', after: '1 day', label: 'Buyer outreach list', highlight: false },
    { before: '3–5', after: '15–20', label: 'Deals managed simultaneously', highlight: false },
  ];

  const capabilities = [
    { icon: 'description', title: 'Deal-ready documents in minutes', desc: 'CIMs, valuations, blind teasers, deal memos — generated from client financials, adapted to the deal\'s league. The same documents that take your team 40 hours take Yulia 2.' },
    { icon: 'analytics', title: 'Instant financial analysis', desc: 'Add-back identification, SDE/EBITDA normalization, DSCR modeling, SBA qualification — run on every client engagement automatically. Your first meeting starts with real numbers, not estimates.' },
    { icon: 'groups', title: 'Buyer sourcing at scale', desc: 'Yulia researches the buyer landscape for every listing — PE platforms active in the sector, individual operators in the geography, search funds with matching theses. Scored and ranked. Not a database dump.' },
    { icon: 'folder_managed', title: 'Multi-deal pipeline management', desc: 'Every client engagement tracked through the gate system. DD checklists, deadline alerts, party coordination — across 15–20 simultaneous deals instead of 3–5.' },
    { icon: 'gavel', title: 'Negotiation prep for every deal', desc: 'Comparable transaction data, counter-offer frameworks, working capital analysis — the prep work that makes your clients more confident and your deals close faster.' },
    { icon: 'draft', title: 'Communication drafting', desc: 'Every email, every update, every response to buyer questions — Yulia drafts it with the deal context already loaded. You review, edit, send. No more starting from scratch on every communication.' },
  ];

  const perceptionCards = [
    { icon: 'visibility_off', title: 'White-label output', desc: 'Every document Yulia generates can carry your branding, your letterhead, your firm\'s identity. The client sees your work product.' },
    { icon: 'shield', title: 'Client data isolation', desc: 'Each client engagement is siloed. No cross-client data leakage. No training on client data. Full compliance with your fiduciary obligations.' },
    { icon: 'speed', title: 'Speed as differentiator', desc: '"I ran the numbers overnight" becomes literally true. First meetings with real analysis. Listing presentations with actual valuations. Speed wins mandates.' },
    { icon: 'trending_up', title: 'More deals, same quality', desc: 'The bottleneck was always analytical capacity. Remove it, and your deal volume scales with your relationship capacity — which is the part you\'re actually good at.' },
  ];

  const advisorTypes = [
    { icon: 'storefront', title: 'Business brokers', desc: 'CIMs in 2 hours instead of 40. Valuations at your first meeting. Buyer lists scored and ranked for every listing. Your listing presentations go from "I think it\'s worth..." to "here\'s the data."' },
    { icon: 'account_balance', title: 'M&A advisors', desc: 'Institutional-quality deal materials for every engagement. Financial models that survive buyer scrutiny. DD coordination across multiple simultaneous transactions.' },
    { icon: 'calculate', title: 'CPAs & financial advisors', desc: 'When your client asks "what\'s my business worth?" — answer in the same meeting. Add exit planning and transaction support to your practice without hiring an analyst.' },
    { icon: 'gavel', title: 'M&A attorneys', desc: 'Financial context for every deal you\'re advising on. DD checklists that match the transaction\'s complexity. Working capital analysis before the closing table surprises start.' },
    { icon: 'real_estate_agent', title: 'Wealth managers', desc: 'When a client\'s biggest asset is their business — and the liquidity event is the single largest financial decision of their life — you need deal intelligence, not just financial planning.' },
    { icon: 'search', title: 'Search fund advisors', desc: 'Help your searchers find, evaluate, and close faster. Deal scoring in 60 seconds. Thesis refinement from data, not gut. Financial models that satisfy LPs.' },
  ];

  const faqs = [
    { q: 'Will my clients know I\'m using AI?', a: 'Only if you tell them. Every document can carry your branding. The analysis has your methodology. Yulia is the engine behind the scenes — your clients see your work product.' },
    { q: 'Is client data secure?', a: 'Every client engagement is siloed. No cross-client data access. No model training on client data. Encrypted at rest and in transit. Full compliance with your fiduciary obligations.' },
    { q: 'Do I need a separate advisor account?', a: 'No. Same platform, same tiers as everyone else. Solo practitioners typically use Professional ($149/mo). Firms use Enterprise ($999/mo). The difference is scale, not features.' },
    { q: 'Can I try it on a real deal before paying?', a: 'Yes. Professional comes with a 30-day free trial — full access, no restrictions. Run a complete client engagement before you decide.' },
    { q: 'What if I have a team?', a: 'Enterprise ($999/mo) includes unlimited team seats, API access, white-label options, and priority support. Every team member gets full platform access across all client engagements.' },
    { q: 'Does this replace me?', a: 'No. It replaces the spreadsheet work, the document drafting, the data gathering, and the checklist management. It does not replace your client relationships, your deal judgment, your negotiation instinct, or your license. It makes you faster.' },
  ];

  return (
    <div className={dark ? 'bg-transparent text-[#f9f9fc]' : 'bg-transparent text-[#1a1c1e]'}>
      <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">

        {/* ═══ 1. HERO ═══ */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <span className="inline-block px-3 py-1 bg-[#D44A78]/10 text-[#D44A78] text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Advisors</span>
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm ${dark ? 'bg-[#2f3133] text-[#dadadc]/80' : 'bg-[#f3f3f6] text-[#5d5e61]'}`}>Brokers & Professionals</span>
              </div>
            </ScrollReveal>
            <ScrollReveal y={40} delay={0.1}>
              <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter leading-[0.92] mb-8">
                A CIM that takes you 40 hours takes Yulia <span className="text-[#D44A78]">two.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className={`space-y-6 text-xl editorial max-w-xl ${muted}`}>
                <p>You're not here to be replaced. You're here because your time is the bottleneck. Every hour you spend building documents is an hour you're not spending on client relationships, deal sourcing, and the judgment calls that actually require a human.</p>
                <p className={`font-bold border-l-4 border-[#D44A78] pl-6 text-2xl italic ${emphasis}`}>Same platform. Same intelligence. Your superpower is that Yulia does 80% of the analytical work.</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.25} className="lg:col-span-5 mt-4">
            <div className={`${darkPanel} rounded-3xl p-8 text-white`}>
              <p className="text-[10px] text-[#dadadc]/60 uppercase tracking-[0.2em] font-bold mb-6">Your AI back office</p>
              <div className="space-y-5">
                {timeRows.map((row, i) => (
                  <div key={row.label} className="flex items-center gap-4">
                    <div className={`${i === 0 ? 'bg-[#D44A78]/20' : 'bg-white/5'} rounded-xl px-3 py-2 text-center min-w-[80px]`}>
                      <p className="text-[10px] text-[#dadadc]/60">Before</p>
                      <p className="font-bold text-[#dadadc]/90">{row.before}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#D44A78]">arrow_forward</span>
                    <div className={`${i === 0 ? 'bg-[#D44A78]/20' : 'bg-white/5'} rounded-xl px-3 py-2 text-center min-w-[80px]`}>
                      <p className="text-[10px] text-[#dadadc]/60">With Yulia</p>
                      <p className="font-bold text-[#D44A78]">{row.after}</p>
                    </div>
                    <p className="text-sm text-[#dadadc]/90 flex-1">{row.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-[#dadadc]/60 italic">You focus on client relationships and deal judgment — the work that actually requires a human.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ 2. THE SHIFT ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className={`${darkPanel} rounded-3xl p-10 md:p-16 text-white`}>
              <div className="mb-12">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">The Leverage</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-4">3–5 deals managed becomes 15–20 deals managed.</h2>
                <p className="text-lg text-[#dadadc]/70 max-w-2xl">Same quality. Same output. You spend 80% of your time on relationships instead of 80% on analysis. The math changes everything about your practice.</p>
              </div>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capabilities.map((c) => (
                  <StaggerItem key={c.title}>
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-colors h-full">
                      <span className="material-symbols-outlined text-[#D44A78] text-3xl mb-4">{c.icon}</span>
                      <h3 className="font-bold text-lg mb-3">{c.title}</h3>
                      <p className="text-sm text-[#dadadc]/70">{c.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 3. CLIENT PERCEPTION ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Client Perception</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">Your clients don't know Yulia exists. They just think you're fast.</h2>
                <p className={`leading-relaxed editorial mb-6 ${muted}`}>The #1 adoption barrier for any tool in advisory is client perception — "will this make me look replaceable?" With smbX.ai, the answer is no. Your clients see your work product, your analysis, your expertise. Yulia is the engine behind the scenes.</p>
                <p className={`font-bold text-xl border-l-4 border-[#D44A78] pl-6 italic ${emphasis}`}>The CIM has your name on it. The valuation has your methodology. The deal runs on your relationships. Yulia just made it all possible in a fraction of the time.</p>
              </div>
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {perceptionCards.map((p) => (
                    <div key={p.title} className={`${card} rounded-2xl p-6 hover:shadow-lg transition-all`}>
                      <span className="material-symbols-outlined text-[#D44A78] text-xl mb-3">{p.icon}</span>
                      <h4 className="font-bold text-sm mb-2">{p.title}</h4>
                      <p className={`text-xs ${muted}`}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 4. YOUR WORKFLOW ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Your Workflow</span>
              <h2 className="font-headline text-4xl font-black tracking-tight">How your practice changes.</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before */}
              <div className={`${subtleBg} rounded-2xl p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-[#dadadc]/10' : 'bg-[#5d5e61]/10'}`}>
                    <span className={`material-symbols-outlined ${dark ? 'text-[#dadadc]/80' : 'text-[#5d5e61]'}`}>schedule</span>
                  </div>
                  <h3 className="font-bold text-lg">Before Yulia</h3>
                </div>
                <div className={`space-y-4 text-sm ${muted}`}>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">20%</span><p>Client meetings, relationship building, deal sourcing</p></div>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">40%</span><p>Financial analysis, CIM drafting, valuation work</p></div>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">25%</span><p>DD coordination, document management, checklists</p></div>
                  <div className="flex items-start gap-3"><span className="opacity-40 font-bold min-w-[48px]">15%</span><p>Admin, communication drafting, follow-ups</p></div>
                </div>
                <div className={`mt-6 pt-4 border-t ${dark ? 'border-zinc-800' : 'border-[#eeeef0]'}`}>
                  <p className={`text-sm font-bold ${muted}`}>3–5 active deals · 80% on analysis</p>
                </div>
              </div>
              {/* After */}
              <div className={`${dark ? 'bg-[#2f3133]' : 'bg-white'} rounded-2xl border-2 border-[#D44A78] p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#D44A78]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#D44A78]">bolt</span>
                  </div>
                  <h3 className="font-bold text-lg">With Yulia</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">60%</span><p className={`font-medium ${emphasis}`}>Client meetings, relationship building, deal sourcing</p></div>
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">15%</span><p className={muted}>Review Yulia's analysis, apply judgment, refine</p></div>
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">15%</span><p className={muted}>Oversee DD coordination (Yulia tracks the details)</p></div>
                  <div className="flex items-start gap-3"><span className="text-[#D44A78] font-bold min-w-[48px]">10%</span><p className={muted}>Review and send communications Yulia drafted</p></div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D44A78]/20">
                  <p className="text-sm font-bold text-[#D44A78]">15–20 active deals · 80% on relationships</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 5. PRICING ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Pricing</span>
                <h2 className="font-headline text-4xl font-black tracking-tight mb-8">Same platform as your clients. Same tiers. Your advantage is leverage.</h2>
                <p className={`leading-relaxed editorial mb-6 ${muted}`}>No separate "advisor pricing." No upsell gates. You use the same platform your clients use — but you use it across 15–20 engagements simultaneously. That's where the economics change.</p>
                <p className={`font-bold text-xl border-l-4 border-[#D44A78] pl-6 italic ${emphasis}`}>Try Professional free for 30 days. No credit card.</p>
              </div>
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Professional */}
                  <div className={`${dark ? 'bg-[#2f3133]' : 'bg-white'} rounded-2xl border-2 border-[#D44A78] p-6 flex flex-col relative shadow-lg`}>
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D44A78] text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Solo Advisors</span>
                    <h4 className="font-black text-sm mb-2 mt-2">Professional</h4>
                    <p className="text-3xl font-black text-[#D44A78] mb-1">$149<span className={`text-sm font-medium ${muted}`}>/mo</span></p>
                    <p className={`text-[10px] mb-4 ${muted}`}>30-day free trial</p>
                    <div className="space-y-2 flex-1">
                      {['Unlimited client engagements', 'All documents + analysis', 'Full methodology (22 gates)', 'Pipeline management'].map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[#D44A78] text-sm shrink-0 mt-0.5">check_circle</span>
                          <p className={`text-xs ${muted}`}>{f}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleCTA} className="mt-6 w-full py-2.5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-bold text-xs hover:scale-[1.02] transition-all border-none cursor-pointer">Try Free for 30 Days</button>
                  </div>
                  {/* Enterprise */}
                  <div className={`${darkPanel} rounded-2xl p-6 flex flex-col text-white relative`}>
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${darkPanel} border border-white/20 text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>Teams</span>
                    <h4 className="font-black text-sm mb-2 mt-2">Enterprise</h4>
                    <p className="text-3xl font-black mb-1">$999<span className="text-sm font-medium text-[#dadadc]/70">/mo</span></p>
                    <p className="text-[10px] text-[#dadadc]/60 mb-4">Unlimited users</p>
                    <div className="space-y-2 flex-1">
                      {['Everything in Professional', 'Unlimited team seats', 'API access', 'White-label options', 'Priority support'].map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[#D44A78] text-sm shrink-0 mt-0.5">check_circle</span>
                          <p className="text-xs text-[#dadadc]/90">{f}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleCTA} className="mt-6 w-full py-2.5 border border-white/30 rounded-full font-bold text-xs hover:bg-white hover:text-[#1a1c1e] transition-all bg-transparent text-white cursor-pointer">Start Enterprise</button>
                  </div>
                  {/* ROI card */}
                  <div className="bg-[#D44A78] rounded-2xl p-6 flex flex-col text-white">
                    <h4 className="font-black text-sm mb-4">The math</h4>
                    <div className="space-y-4 flex-1">
                      <div><p className="text-xs text-white/80">Average deal commission</p><p className="text-xl font-black">$25K–$75K</p></div>
                      <div><p className="text-xs text-white/80">Deals per year (before)</p><p className="text-xl font-black">4–6</p></div>
                      <div><p className="text-xs text-white/80">Deals per year (with Yulia)</p><p className="text-xl font-black">12–20</p></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-white/80">Revenue impact</p>
                      <p className="text-2xl font-black">2–4x</p>
                      <p className="text-xs text-white/80 mt-1">at $149/mo cost</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 6. WHO THIS IS FOR ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="mb-12">
              <span className="text-[#D44A78] font-bold uppercase tracking-widest text-xs block mb-3">Who Uses This</span>
              <h2 className="font-headline text-4xl font-black tracking-tight">Every type of deal professional.</h2>
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisorTypes.map((a) => (
                <StaggerItem key={a.title}>
                  <div className={`${card} rounded-2xl p-8 hover:shadow-lg transition-all h-full`}>
                    <span className="material-symbols-outlined text-[#D44A78] text-2xl mb-3">{a.icon}</span>
                    <h3 className="font-bold mb-2">{a.title}</h3>
                    <p className={`text-sm ${muted}`}>{a.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </ScrollReveal>

        {/* ═══ 7. FAQ ═══ */}
        <ScrollReveal>
          <section className="mb-24">
            <h2 className="font-headline text-4xl font-black tracking-tight mb-12">Questions from advisors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h4 className="font-bold mb-2">{f.q}</h4>
                  <p className={`text-sm leading-relaxed ${muted}`}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ═══ 8. CTA ═══ */}
        <ScrollReveal>
          <section className="mb-12">
            <div className={`${darkPanel} rounded-3xl p-12 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-white`}>
              <div>
                <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">Try Professional<br/><span className="text-[#D44A78]">free for 30 days.</span></h2>
                <p className="text-lg text-[#dadadc]/70 mt-4">Run a complete client engagement. Generate a CIM. Build a valuation. See how the pipeline changes. No credit card required.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4">
                <button onClick={handleCTA} className="px-10 py-5 bg-gradient-to-r from-[#D44A78] to-[#E8709A] text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl w-full lg:w-auto text-center border-none cursor-pointer">Start Free Trial</button>
                <p className="text-xs text-[#dadadc]/70">30 days · Full access · No credit card</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
