import {
  ScrollReveal,
  StatBar,
  AnimatedCounter,
  BeforeAfterSlider,
  MagneticButton,
  ZigZagSection,
  FeatureGrid,
  PullQuote,
  FullBleedSection,
} from './animations';

interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  return (
    <div>
      {/* ═══ Block 1 — The offer [FullBleed tinted] ═══ */}
      <FullBleedSection tinted className="mt-20">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>THE OFFER</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-8">
            Three deals. Completely free. Then decide.
          </h2>
          <div className="max-w-3xl space-y-6" style={{ fontSize: '17px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.65 }}>
            <p className="m-0">We don&apos;t ask you to subscribe to something you haven&apos;t tried. We don&apos;t demo it in a sales call. We don&apos;t send you a deck. We let you use it.</p>
            <p className="m-0">Run three complete client journeys through smbX.ai &mdash; valuations, CIMs, market reports, buyer qualification, the whole thing &mdash; free. White-label everything. Your clients see your deliverables, your brand, your expertise.</p>
            <p className="m-0">After three journeys, it works like everyone else&apos;s wallet: fund as you go, spend per deliverable. No per-seat licensing. No monthly minimum.</p>
            <p className="m-0" style={{ color: '#1A1A18', fontWeight: 600 }}>An advisor who sees Yulia generate a CIM in 30 minutes vs. 3 weeks doesn&apos;t need a sales pitch.</p>
          </div>
        </ScrollReveal>
      </FullBleedSection>

      {/* ═══ Block 2 — What changes [ZigZag] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>WHAT CHANGES</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              <AnimatedCounter value={68} style={{ color: '#D4714E' }} /> hours back. Every month.
            </h2>
          </ScrollReveal>

          <ZigZagSection items={[
            { icon: '\uD83D\uDCE6', title: 'Listing Prep \u2014 30 minutes, not 12 hours', body: 'Financials \u2192 normalized \u2192 add-backs identified \u2192 valuation range \u2192 CIM generated. You review. You refine. You present under your brand. What used to consume a full day happens before your morning coffee gets cold.' },
            { icon: '\uD83D\uDC64', title: 'Buyer Qualification \u2014 seconds, not hours', body: 'SBA eligible? Down payment sufficient? DSCR in range? Know before your first call. Stop wasting time on buyers who can\u2019t close.' },
            { icon: '\uD83D\uDDFA\uFE0F', title: 'Buy Mandate Intelligence', body: 'Client wants to acquire. Yulia maps the market landscape \u2014 competitive density, available targets, PE activity, recent multiples \u2014 and evaluates opportunities against the thesis. Your client gets institutional research. You get a deeper relationship.' },
            { icon: '\uD83D\uDCCA', title: 'White-Label Everything', body: 'Your clients see your deliverables. They don\u2019t know the smbX.ai Engine built the analytical foundation. The intelligence elevates your practice. The credit stays with you.' },
            { icon: '\uD83D\uDCB0', title: 'Deals You\u2019d Otherwise Turn Away', body: '$800K landscaping company. $1.2M cleaning service. The deals that aren\u2019t worth your time at current economics \u2014 profitable now. Because the analytical work that made them unprofitable just got 90% faster.' },
            { icon: '\uD83D\uDCBC', title: 'Tax & Legal Prep \u2014 built in', body: 'Deal structure comparison, entity-type flags, purchase price allocation scenarios, non-compete enforceability by state, regulatory transfer timelines \u2014 included in every engagement. The analysis your clients\u2019 CPAs and attorneys need, generated before the first meeting.' },
          ]} />
        </div>
      </section>

      {/* ═══ Block 3 — The economics [slider + StatBar] ═══ */}
      <FullBleedSection tinted className="mt-20">
        <ScrollReveal>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>THE ECONOMICS</span>
          <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10 md:text-center">
            You know the bottleneck. Here&apos;s what changes.
          </h2>

          <BeforeAfterSlider
            beforeLabel="WITHOUT YULIA"
            afterLabel="WITH YULIA"
            beforeContent={
              <div style={{ background: '#FFFFFF', padding: '32px', minHeight: 220 }}>
                <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(26,26,24,0.5)', lineHeight: 1.5 }}>
                  <div className="flex justify-between"><span>Hours on data/docs</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>~80 hrs/mo</span></div>
                  <div className="flex justify-between"><span>Deals turned away</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>3&ndash;4/mo</span></div>
                  <div className="flex justify-between"><span>Revenue capacity</span><span style={{ color: '#1A1A18', fontWeight: 600 }}>Limited</span></div>
                </div>
              </div>
            }
            afterContent={
              <div style={{ background: '#D4714E', padding: '32px', minHeight: 220 }}>
                <div className="space-y-3" style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  <div className="flex justify-between"><span>Hours on data/docs</span><span style={{ color: '#fff', fontWeight: 600 }}>~12 hrs/mo</span></div>
                  <div className="flex justify-between"><span>Deals turned away</span><span style={{ color: '#fff', fontWeight: 600 }}>0</span></div>
                  <div className="flex justify-between"><span>Revenue capacity</span><span style={{ color: '#fff', fontWeight: 600 }}>Expanded</span></div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 20, paddingTop: 20 }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>= 68 hours back every month</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>= 4&ndash;6 more deals per month</p>
                </div>
              </div>
            }
          />

          <div style={{ marginTop: 24 }}>
            <StatBar stats={[
              { label: 'Hours saved monthly', value: 68 },
              { label: 'Extra deals/month', value: 5 },
              { label: 'Faster analytics', value: 90, suffix: '%' },
            ]} />
          </div>
        </ScrollReveal>
      </FullBleedSection>

      {/* ═══ Block 4 — Partnership tiers [FeatureGrid 3-col] ═══ */}
      <section className="px-6" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4714E' }}>PARTNERSHIP TIERS</span>
            <h2 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.035em', color: '#1A1A18', lineHeight: 1.15, marginTop: 12 }} className="md:text-[48px] mb-10">
              Shape the product. Grow with us.
            </h2>
          </ScrollReveal>

          <FeatureGrid
            columns={3}
            items={[
              { title: 'Verified Advisor', body: 'Directory listing + platform matching. Clients looking for professional guidance get connected to you.' },
              { title: 'Premier Partner', body: 'Volume pricing + priority matching. For practices with steady deal flow that want a deeper integration.' },
              { title: 'Elite Partner', body: 'Custom integrations + product roadmap input. You\u2019re not just using the platform \u2014 you\u2019re shaping what it becomes.' },
            ]}
          />
        </div>
      </section>

      {/* ═══ Block 5 — CTA with PullQuote ═══ */}
      <section className="px-6" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <PullQuote text="Your expertise. Yulia's engine. Their outcome." />

          <ScrollReveal delay={0.2}>
            <div className="mt-4 text-center">
              <p style={{ fontSize: '16px', color: 'rgba(26,26,24,0.5)', marginBottom: 16 }}>Tell Yulia about the deal you&apos;re working on &rarr; 3 free journeys</p>
              <MagneticButton
                onClick={() => onChipClick("I'm an advisor \u2014 tell me about partnerships")}
                style={{ background: '#1A1A18', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '14px 32px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Message Yulia &rarr;
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
