interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div>
      {/* ═══ Section 1: THE OFFER [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-8">
            Three deals. Completely free. Then decide.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">We don&apos;t ask you to subscribe to something you haven&apos;t tried. We don&apos;t demo it in a sales call. We don&apos;t send you a deck. We let you use it.</p>
            <p className="m-0">Run three complete client journeys through smbX.ai &mdash; valuations, CIMs, market reports, buyer qualification, the whole thing &mdash; free. White-label everything. Your clients see your deliverables, your brand, your expertise.</p>
            <p className="m-0">After three journeys, it works like everyone else&apos;s wallet: fund as you go, spend per deliverable. No per-seat licensing. No monthly minimum.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>An advisor who sees Yulia generate a CIM in 30 minutes vs. 3 weeks doesn&apos;t need a sales pitch.</p>
          </div>
        </div>
      </section>

      {/* ═══ Section 2: WHAT CHANGES ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-10">
            68 hours back. Every month.
          </h2>
          <div className="space-y-10">
            {[
              { label: 'LISTING PREP \u2014 30 MINUTES, NOT 12 HOURS', body: 'Financials \u2192 normalized \u2192 add-backs identified \u2192 valuation range \u2192 CIM generated. You review. You refine. You present under your brand. What used to consume a full day happens before your morning coffee gets cold.' },
              { label: 'BUYER QUALIFICATION \u2014 SECONDS, NOT HOURS', body: 'SBA eligible? Down payment sufficient? DSCR in range? Know before your first call. Stop wasting time on buyers who can\u2019t close.' },
              { label: 'BUY MANDATE INTELLIGENCE', body: 'Client wants to acquire. Yulia maps the market landscape \u2014 competitive density, available targets, PE activity, recent multiples \u2014 and evaluates opportunities against the thesis. Your client gets institutional research. You get a deeper relationship.' },
              { label: 'WHITE-LABEL EVERYTHING', body: 'Your clients see your deliverables. They don\u2019t know the smbX.ai Engine built the analytical foundation. The intelligence elevates your practice. The credit stays with you.' },
              { label: 'DEALS YOU\u2019D OTHERWISE TURN AWAY', body: '$800K landscaping company. $1.2M cleaning service. The deals that aren\u2019t worth your time at current economics \u2014 profitable now. Because the analytical work that made them unprofitable just got 90% faster.' },
            ].map(item => (
              <div key={item.label}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', marginBottom: 8 }}>{item.label}</h3>
                <p style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: THE MATH [Tinted] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto" style={{ background: '#F7F6F4', borderRadius: 28, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-10 md:text-center">
            You know the bottleneck. Here&apos;s what changes.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Without */}
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(26,26,24,0.05)', padding: '32px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(26,26,24,0.45)', display: 'block', marginBottom: 16 }}>WITHOUT YULIA</span>
              <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Hours on data/docs</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~80 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>3&ndash;4/mo</span></div>
              </div>
            </div>
            {/* With */}
            <div style={{ background: '#D4714E', borderRadius: 24, padding: '32px', color: '#fff' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 16 }}>WITH YULIA</span>
              <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                <div className="flex justify-between"><span>Hours on data/docs</span><span style={{ color: '#fff', fontWeight: 600 }}>~12 hrs/mo</span></div>
                <div className="flex justify-between"><span>Deals turned away</span><span style={{ color: '#fff', fontWeight: 600 }}>0</span></div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 20, paddingTop: 20 }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>= 68 hours reclaimed every month</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>= 4&ndash;6 more deals per month</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>= Revenue from deals you used to decline</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>= Better work product on every engagement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: PARTNERSHIP ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15 }} className="md:text-[48px] mb-4">
            Shape the product. Grow with us.
          </h2>
          <div className="max-w-3xl space-y-4 mt-10 mb-10">
            {[
              { tier: 'Verified Advisor', desc: 'Directory listing + platform matching. Clients looking for professional guidance get connected to you.' },
              { tier: 'Premier Partner', desc: 'Volume pricing + priority matching. For practices with steady deal flow that want a deeper integration.' },
              { tier: 'Elite Partner', desc: 'Custom integrations + product roadmap input. You\u2019re not just using the platform \u2014 you\u2019re shaping what it becomes.' },
            ].map(t => (
              <div key={t.tier} style={{ background: '#F7F6F4', borderRadius: 16, border: '1px solid rgba(26,26,24,0.05)', padding: '16px 24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A18', margin: '0 0 4px' }}>{t.tier}</h4>
                <p style={{ fontSize: '14px', color: 'rgba(26,26,24,0.5)', margin: 0, lineHeight: 1.55 }}>{t.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onChipClick("I'm an advisor \u2014 tell me about partnerships")}
            style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            type="button"
          >
            Message Yulia &rarr;
          </button>
        </div>
      </section>
    </div>
  );
}
