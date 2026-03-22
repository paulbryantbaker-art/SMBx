import { RevealSection, ScrollReveal } from './animations';
import { font, color, radius } from './tokens';

export default function AdvisorsBelow({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <div style={{ fontFamily: font, backgroundColor: color.bg, color: color.text }}>

      {/* ═══ 1. OPENING — "You have twelve active listings" ═══ */}
      <section
        style={{
          paddingTop: 128,
          paddingBottom: 160,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 'clamp(40px, 5.5vw, 64px)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                color: color.text,
                marginBottom: 48,
                fontFamily: font,
              }}
            >
              You have twelve active listings. Something isn&apos;t getting done this week.
            </h2>
          </RevealSection>

          <RevealSection>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <p style={{ fontSize: 20, color: color.textSecondary, lineHeight: 1.75, margin: 0, fontFamily: font }}>
                I don&apos;t need to explain this to you &mdash; you live it.
              </p>
              <p style={{ fontSize: 20, color: color.textSecondary, lineHeight: 1.75, margin: 0, fontFamily: font }}>
                Normalizing financials for a new listing: four to six hours. Building the CIM: twenty to forty hours. Market comps: two to three hours per deal. SBA bankability check: another hour or two. Valuation model: eight to twelve.
              </p>
              <p style={{ fontSize: 20, color: color.text, lineHeight: 1.75, margin: 0, fontFamily: font, fontWeight: 500 }}>
                That&apos;s thirty-five to sixty-three hours per listing. Times twelve. Do the math. Something slides.
              </p>
              <p style={{ fontSize: 20, color: color.textSecondary, lineHeight: 1.75, margin: 0, fontFamily: font }}>
                The CIM that should have been ready Friday isn&apos;t. The buyer who requested financials five days ago is still waiting. The listing that deserves a full competitive process gets a single-bidder sale because there wasn&apos;t bandwidth to build the outreach package.
              </p>
              <p style={{ fontSize: 20, color: color.textSecondary, lineHeight: 1.75, margin: 0, fontFamily: font }}>
                And the deals you turn away. The $500K listing. The $750K deal. The owner who &ldquo;just wants to know what it&apos;s worth&rdquo; and might become a client in two years if somebody helps them today. Those represent real revenue you&apos;re leaving on the table &mdash; not because the deals aren&apos;t viable, but because the economics of manual analytical work don&apos;t support serving them at your standards.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. VALUE PROP — Yulia handles the analytical work ═══ */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 160,
          paddingLeft: 48,
          paddingRight: 48,
          backgroundColor: color.surfaceLow,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                color: color.text,
                marginBottom: 32,
                fontFamily: font,
              }}
            >
              Yulia handles the analytical work. You handle what you&apos;re great at.
            </h2>
          </RevealSection>

          <RevealSection>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p style={{ fontSize: 18, color: color.textSecondary, lineHeight: 1.75, margin: 0, fontFamily: font }}>
                CIMs in twenty minutes, not twenty hours. White-labeled under your brand. Financial normalization with complete add-back schedules from IRS benchmarks. Market intelligence localized to the MSA. SBA bankability at today&apos;s rates. Value analysis reports with visible methodology your client&apos;s attorney will respect.
              </p>
              <p style={{ fontSize: 18, color: color.text, lineHeight: 1.75, margin: 0, fontFamily: font, fontWeight: 500 }}>
                The $500K&ndash;$2M deals that don&apos;t pencil at your billing rate become profitable when the analytical package is generated before lunch.
              </p>
              <p style={{ fontSize: 18, color: color.textSecondary, lineHeight: 1.75, margin: 0, fontFamily: font }}>
                And here&apos;s what nobody expects: the platform gets smarter from your own activity. Your second client&apos;s ValueLens includes industry benchmarks informed by the first client&apos;s data. By your fifth listing, the market intelligence for your region is sharper than anything you could build manually &mdash; because you&apos;ve been contributing to and benefiting from the same intelligence engine.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 3. CAPABILITY CARDS ═══ */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 160,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 16, fontFamily: font }}>
                What Yulia delivers for your practice
              </h2>
              <p style={{ color: color.textMuted, fontSize: 18, margin: 0, fontFamily: font }}>
                The relationships, the negotiations, and the judgment that closes deals &mdash; that&apos;s you. Everything else:
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {([
              { title: 'Automated Recasting', body: 'Convert tax returns and internal financials into clean, normalized SDE reports in minutes, not days. Complete add-back schedules from IRS benchmarks.' },
              { title: 'Instant CIM Generation', body: 'Dynamic Confidential Information Memorandums that update automatically as financials change. White-labeled under your brand.' },
              { title: 'Buyer Qualification', body: 'Automated NDA tracking, SBA bankability checks at today\u2019s rates, and initial financial verification for every inquiry.' },
            ] as const).map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.08}>
                <div
                  style={{
                    padding: 32,
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: radius.md,
                    height: '100%',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, fontFamily: font }}>
                    {card.title}
                  </h4>
                  <p style={{ color: color.textMuted, fontSize: 15, lineHeight: 1.65, margin: 0, fontFamily: font }}>
                    {card.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. PRICING TIERS ═══ */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 160,
          paddingLeft: 48,
          paddingRight: 48,
          backgroundColor: color.surfaceLow,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 16, fontFamily: font }}>
                Your expertise isn&apos;t being replaced. It&apos;s being multiplied.
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
            {/* Advisor Trial */}
            <ScrollReveal delay={0}>
              <div
                style={{
                  backgroundColor: color.white,
                  padding: 40,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: radius.md,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: font }}>Advisor Trial</h3>
                  <p style={{ color: color.textMuted, fontSize: 14, marginTop: 4, fontFamily: font }}>See it work on real deals.</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, fontFamily: font }}>Free</span>
                </div>
                <p style={{ color: color.textMuted, fontSize: 15, lineHeight: 1.65, marginBottom: 32, fontFamily: font, flex: 1 }}>
                  First three client deals, free. Full platform access. CIM generation, financial normalization, market intelligence &mdash; on real client data. White-labeled under your brand. If the quality doesn&apos;t meet your standards, you&apos;ve spent nothing.
                </p>
                <button
                  onClick={() => onChipClick("I'm a broker — start my free Advisor Trial")}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    backgroundColor: color.white,
                    border: `1px solid ${color.text}`,
                    color: color.text,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'all 0.2s',
                    fontFamily: font,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color.dark; e.currentTarget.style.color = color.white; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = color.white; e.currentTarget.style.color = color.text; }}
                >
                  Start Free Trial
                </button>
              </div>
            </ScrollReveal>

            {/* Advisor Pro */}
            <ScrollReveal delay={0.08}>
              <div
                style={{
                  backgroundColor: color.white,
                  padding: 40,
                  border: `2px solid ${color.text}`,
                  borderRadius: radius.md,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  height: '100%',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: color.dark,
                    color: color.white,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '4px 16px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    borderRadius: 9999,
                    fontFamily: font,
                  }}
                >
                  Most Popular
                </div>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: font }}>Advisor Pro</h3>
                  <p style={{ color: color.textMuted, fontSize: 14, marginTop: 4, fontFamily: font }}>For the producing advisor.</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, fontFamily: font }}>$299</span>
                  <span style={{ color: color.textMuted, fontFamily: font }}>/mo</span>
                </div>
                <p style={{ color: color.textMuted, fontSize: 15, lineHeight: 1.65, marginBottom: 32, fontFamily: font, flex: 1 }}>
                  Unlimited client deals. All deliverables. Branded outputs. Client management dashboard. The cost of one analyst hour per month buys unlimited AI-powered analytical capacity.
                </p>
                <button
                  onClick={() => onChipClick("I want to start Advisor Pro at $299/mo")}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    backgroundColor: color.dark,
                    border: 'none',
                    color: color.white,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'opacity 0.2s',
                    fontFamily: font,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  Go Pro
                </button>
              </div>
            </ScrollReveal>

            {/* Advisor Enterprise */}
            <ScrollReveal delay={0.16}>
              <div
                style={{
                  backgroundColor: color.white,
                  padding: 40,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: radius.md,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: font }}>Advisor Enterprise</h3>
                  <p style={{ color: color.textMuted, fontSize: 14, marginTop: 4, fontFamily: font }}>For practices at scale.</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, fontFamily: font }}>$499</span>
                  <span style={{ color: color.textMuted, fontFamily: font }}>/mo</span>
                </div>
                <p style={{ color: color.textMuted, fontSize: 15, lineHeight: 1.65, marginBottom: 32, fontFamily: font, flex: 1 }}>
                  Everything in Pro, plus API access, white-label options, priority support, team seats. For practices building smbX.ai into their workflow.
                </p>
                <button
                  onClick={() => onChipClick("Tell me about Advisor Enterprise options")}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    backgroundColor: color.white,
                    border: `1px solid ${color.text}`,
                    color: color.text,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'all 0.2s',
                    fontFamily: font,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color.dark; e.currentTarget.style.color = color.white; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = color.white; e.currentTarget.style.color = color.text; }}
                >
                  Contact Sales
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. CLOSING CTA ═══ */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 160,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center' }}>
          <RevealSection>
            <h2
              style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: color.text,
                marginBottom: 24,
                fontFamily: font,
              }}
            >
              More clients. Better preparation. Deals you used to turn away.
            </h2>
            <p style={{ fontSize: 20, color: color.textMuted, lineHeight: 1.6, marginBottom: 48, fontFamily: font }}>
              Your name on every deliverable. Your expertise in every conversation. The analytical work that used to take days &mdash; completed in minutes.
            </p>
          </RevealSection>

          <RevealSection>
            <button
              onClick={() => onChipClick("Start with your mandate — tell Yulia about your practice")}
              style={{
                backgroundColor: color.dark,
                color: color.white,
                fontSize: 16,
                fontWeight: 700,
                padding: '18px 48px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: font,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
            >
              Start With Your Mandate
            </button>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
