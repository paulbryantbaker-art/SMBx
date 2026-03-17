import { useState } from 'react';
import { RevealSection, ScrollReveal } from './animations';

interface AdvisorsBelowProps {
  onChipClick: (text: string) => void;
}

const font: React.CSSProperties = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

export default function AdvisorsBelow({ onChipClick }: AdvisorsBelowProps) {
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = () => {
    const text = chatInput.trim();
    if (text) {
      onChipClick(text);
      setChatInput('');
    }
  };

  return (
    <div style={{ ...font, backgroundColor: '#FFFFFF', color: '#000000', WebkitFontSmoothing: 'antialiased' }}>

      {/* ═══ 1. HERO SECTION ═══ */}
      <section style={{ paddingTop: 128, paddingBottom: 128, paddingLeft: 32, paddingRight: 32 }}>
        <div style={{ maxWidth: 896 }} className="lg:px-16">
          <RevealSection>
            <h2
              style={{
                ...font,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                marginBottom: 32,
                fontSize: '3rem',
              }}
              className="lg:text-7xl"
            >
              You have twelve active listings. Something isn't getting done this week.
            </h2>
            <p
              style={{
                ...font,
                fontSize: '1.25rem',
                color: '#6B7280',
                maxWidth: 672,
                lineHeight: 1.625,
              }}
            >
              The math of brokerage hasn't changed in 40 years. More listings mean more revenue, but they also mean more manual analytical work. Eventually, you hit the wall.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ═══ 2. NARRATIVE — BANDWIDTH BOTTLENECK ═══ */}
      <section style={{ paddingTop: 96, paddingBottom: 96, paddingLeft: 32, paddingRight: 32, backgroundColor: '#FFFFFF' }}>
        <div className="lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16" style={{ alignItems: 'center' }}>
            <RevealSection>
              <div>
                <h3
                  style={{
                    ...font,
                    fontSize: '1.875rem',
                    fontWeight: 700,
                    marginBottom: 24,
                  }}
                >
                  The bandwidth bottleneck.
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <p
                    style={{
                      ...font,
                      fontSize: '1.125rem',
                      color: '#4B5563',
                      lineHeight: 1.625,
                      margin: 0,
                    }}
                  >
                    Every new listing adds hours of financial recasting, SDE calculations, and market data comparison. This is the work that keeps you away from what you do best: closing deals.
                  </p>
                  <p
                    style={{
                      ...font,
                      fontSize: '1.125rem',
                      color: '#4B5563',
                      lineHeight: 1.625,
                      margin: 0,
                    }}
                  >
                    When an advisor is overextended, the quality of the CIM drops, buyer questions take longer to answer, and the momentum of the deal begins to bleed out.
                  </p>
                </div>
              </div>
            </RevealSection>
            <ScrollReveal delay={0.1}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  backgroundColor: '#F9FAFB',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <img
                  alt="Analytical work visualization"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc1212EHODpYoODid8-hIkL8B--aXdMmwjkLlOc-t5WbQeat0Z86hGRZvRsr508AlEi8x-w2HPJtP3DeUA4EzqEF5AAWtbioXoLgvyQEuhW6XURbbIsNQyZH3LqmnTHzN75L2Ozhr26oYZ_lCaXP-_vR_mPmTBBNtnwQzrqm1YTZe5eAkNxszx26jru3xv9z2RZ1H-kZ6YzeRthEjNVR3iXxi43klN57rFuCWbX2atq70vDK2MdPJjy1HF0fy_Uqs3Xuyf5Flows6m"
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    opacity: 0.9,
                  }}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. VALUE PROP — YULIA ═══ */}
      <section style={{ paddingTop: 128, paddingBottom: 128, paddingLeft: 32, paddingRight: 32, backgroundColor: '#FFFFFF' }}>
        <div className="lg:px-16">
          {/* Header */}
          <RevealSection>
            <div style={{ maxWidth: 768, margin: '0 auto', textAlign: 'center', marginBottom: 80 }}>
              <div
                style={{
                  ...font,
                  display: 'inline-block',
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 6,
                  paddingBottom: 6,
                  marginBottom: 24,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  borderRadius: 9999,
                }}
              >
                The Solution
              </div>
              <h2
                style={{
                  ...font,
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  marginBottom: 32,
                  lineHeight: 1.15,
                }}
                className="lg:text-5xl"
              >
                Yulia handles the analytical work.
              </h2>
              <p
                style={{
                  ...font,
                  fontSize: '1.25rem',
                  color: '#6B7280',
                  margin: 0,
                }}
              >
                From the moment a seller hands over their P&amp;L statements, Yulia takes over the heavy lifting. Automate the recasting, the benchmarking, and the data-room preparation.
              </p>
            </div>
          </RevealSection>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Automated Recasting */}
            <ScrollReveal delay={0}>
              <div
                style={{
                  padding: 32,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    marginBottom: 24,
                  }}
                >
                  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h4
                  style={{
                    ...font,
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    marginBottom: 8,
                  }}
                >
                  Automated Recasting
                </h4>
                <p
                  style={{
                    ...font,
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    lineHeight: 1.625,
                    margin: 0,
                  }}
                >
                  Convert tax returns and internal financials into clean, normalized SDE reports in minutes, not days.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 2: Instant CIM Generation */}
            <ScrollReveal delay={0.08}>
              <div
                style={{
                  padding: 32,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    marginBottom: 24,
                  }}
                >
                  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h4
                  style={{
                    ...font,
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    marginBottom: 8,
                  }}
                >
                  Instant CIM Generation
                </h4>
                <p
                  style={{
                    ...font,
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    lineHeight: 1.625,
                    margin: 0,
                  }}
                >
                  Dynamic Confidential Information Memorandums that update automatically as financials change.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 3: Buyer Qualification */}
            <ScrollReveal delay={0.16}>
              <div
                style={{
                  padding: 32,
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    marginBottom: 24,
                  }}
                >
                  <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h4
                  style={{
                    ...font,
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    marginBottom: 8,
                  }}
                >
                  Buyer Qualification
                </h4>
                <p
                  style={{
                    ...font,
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    lineHeight: 1.625,
                    margin: 0,
                  }}
                >
                  Automated NDA tracking and initial financial verification for every inquiry.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. MEMBERSHIP TIERS ═══ */}
      <section style={{ paddingTop: 128, paddingBottom: 128, paddingLeft: 32, paddingRight: 32, backgroundColor: 'rgba(249,250,251,0.5)' }}>
        <div className="lg:px-16" style={{ maxWidth: 1152, margin: '0 auto' }}>
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2
                style={{
                  ...font,
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Select your scale.
              </h2>
              <p
                style={{
                  ...font,
                  color: '#6B7280',
                  marginTop: 16,
                  margin: '16px 0 0',
                }}
              >
                Membership levels designed for individual producers and large firms.
              </p>
            </div>
          </RevealSection>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tier: Certified */}
            <ScrollReveal delay={0}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 40,
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ ...font, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Certified</h3>
                  <p style={{ ...font, color: '#9CA3AF', fontSize: '0.875rem', marginTop: 4, margin: '4px 0 0' }}>For the independent advisor.</p>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ ...font, fontSize: '2.25rem', fontWeight: 700 }}>$499</span>
                  <span style={{ ...font, color: '#9CA3AF' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  {['Up to 3 Active Listings', 'Automated Recasting', 'Standard Data Rooms'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', gap: 12, ...font }}>
                      <svg style={{ width: 16, height: 16, color: '#000000', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onChipClick("I'm interested in the Certified advisor membership at $499/mo")}
                  style={{
                    ...font,
                    width: '100%',
                    paddingTop: 16,
                    paddingBottom: 16,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #000000',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
                    (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                    (e.currentTarget as HTMLButtonElement).style.color = '#000000';
                  }}
                >
                  Start Certified
                </button>
              </div>
            </ScrollReveal>

            {/* Tier: Premier (Featured) */}
            <ScrollReveal delay={0.08}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 40,
                  border: '3px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  transform: 'scale(1.05)',
                  zIndex: 10,
                  height: '100%',
                }}
              >
                {/* Most Popular badge */}
                <div
                  style={{
                    ...font,
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 4,
                    paddingBottom: 4,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most Popular
                </div>
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ ...font, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Premier</h3>
                  <p style={{ ...font, color: '#9CA3AF', fontSize: '0.875rem', marginTop: 4, margin: '4px 0 0' }}>For growing brokerage teams.</p>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ ...font, fontSize: '2.25rem', fontWeight: 700 }}>$1,299</span>
                  <span style={{ ...font, color: '#9CA3AF' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  {[
                    { text: 'Up to 15 Active Listings', bold: false },
                    { text: 'Priority Yulia Support', bold: true },
                    { text: 'Custom CIM Templates', bold: false },
                    { text: 'Bulk Buyer CRM Sync', bold: false },
                  ].map((item) => (
                    <li key={item.text} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', gap: 12, fontWeight: item.bold ? 700 : 400, ...font }}>
                      <svg style={{ width: 16, height: 16, color: '#000000', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onChipClick("I want to learn more about the Premier advisor membership at $1,299/mo")}
                  style={{
                    ...font,
                    width: '100%',
                    paddingTop: 16,
                    paddingBottom: 16,
                    backgroundColor: '#000000',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >
                  Go Premier
                </button>
              </div>
            </ScrollReveal>

            {/* Tier: Elite */}
            <ScrollReveal delay={0.16}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 40,
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ ...font, fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Elite</h3>
                  <p style={{ ...font, color: '#9CA3AF', fontSize: '0.875rem', marginTop: 4, margin: '4px 0 0' }}>Unrestricted infrastructure.</p>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ ...font, fontSize: '2.25rem', fontWeight: 700 }}>$2,999</span>
                  <span style={{ ...font, color: '#9CA3AF' }}>/mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  {[
                    { text: 'Unlimited Listings', bold: false },
                    { text: 'White-label Platform', bold: false },
                    { text: 'Dedicated Data Architect', bold: true },
                  ].map((item) => (
                    <li key={item.text} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', gap: 12, fontWeight: item.bold ? 700 : 400, ...font }}>
                      <svg style={{ width: 16, height: 16, color: '#000000', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onChipClick("I'm interested in the Elite advisor membership — tell me about enterprise options")}
                  style={{
                    ...font,
                    width: '100%',
                    paddingTop: 16,
                    paddingBottom: 16,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #000000',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
                    (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                    (e.currentTarget as HTMLButtonElement).style.color = '#000000';
                  }}
                >
                  Contact Sales
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 5. FINAL NARRATIVE ═══ */}
      <section style={{ paddingTop: 192, paddingBottom: 192, paddingLeft: 32, paddingRight: 32, backgroundColor: '#FFFFFF' }}>
        <div className="lg:px-16" style={{ maxWidth: 896, margin: '0 auto' }}>
          <div className="flex flex-col lg:flex-row gap-16" style={{ alignItems: 'center' }}>
            <ScrollReveal delay={0} style={{ flex: '0 0 50%' }}>
              <div className="lg:w-full">
                <img
                  alt="Professional Broker"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTCpz7blIl1PXiDVXMUU7UEFbGm4ZTQvJdRyOeD4WKZ7Pyx6-GO5KSBwt3GTsQ0mOiumOp4yEImYBRKQn5LcajmsdIFApAZtl3W__pabl643Hu14jb4XCGKu4dEa15lUSQRrgtSLz00JLzPjvZlX-eu-nyIvtnYr4pOL85f7azSYmecBDXJpm7sQc4Y2OzAuqSy1h7GGJGL7lWCFcwa3jLpmGAj_RIJ2PGHEp9l7ZR1jLrxoh11cbjwcBwoTWdFSsj2H2yqJkyYvPE"
                  style={{
                    borderRadius: 12,
                    border: '1px solid rgba(0,0,0,0.06)',
                    filter: 'grayscale(100%)',
                    transition: 'all 0.7s ease',
                    width: '100%',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(0%)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%)'; }}
                />
              </div>
            </ScrollReveal>
            <RevealSection style={{ flex: '0 0 50%' }}>
              <div>
                <h2
                  style={{
                    ...font,
                    fontSize: '2.25rem',
                    fontWeight: 700,
                    marginBottom: 32,
                    lineHeight: 1.15,
                  }}
                >
                  Your expertise isn't being replaced. It's being multiplied.
                </h2>
                <p
                  style={{
                    ...font,
                    fontSize: '1.125rem',
                    color: '#6B7280',
                    lineHeight: 1.625,
                    marginBottom: 24,
                    margin: '0 0 24px',
                  }}
                >
                  SMBX.ai doesn't talk to the client for you. It doesn't negotiate the LOI. It doesn't manage the emotions of a founder walking away from their life's work.
                </p>
                <p
                  style={{
                    ...font,
                    fontSize: '1.125rem',
                    color: '#6B7280',
                    lineHeight: 1.625,
                    margin: 0,
                  }}
                >
                  We provide the analytical horsepower so you can spend your time where it matters: being the advisor your clients hired you to be.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══ 6. FOOTER CTA ═══ */}
      <footer
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: 96,
          paddingBottom: 48,
          paddingLeft: 32,
          paddingRight: 32,
          marginTop: 'auto',
        }}
      >
        <div className="lg:px-16">
          {/* CTA heading */}
          <RevealSection>
            <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center', marginBottom: 64 }}>
              <h3 style={{ ...font, fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, margin: '0 0 8px' }}>
                Ready to scale your desk?
              </h3>
              <p style={{ ...font, color: '#9CA3AF', margin: 0 }}>
                Ask Yulia how she can recast your current listings today.
              </p>
            </div>
          </RevealSection>

          {/* Chat pill input */}
          <ScrollReveal>
            <div style={{ maxWidth: 672, margin: '0 auto', position: 'relative', marginBottom: 48 }}>
              <div
                style={{
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 9999,
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <input
                  type="text"
                  placeholder="Tell Yulia about your next listing..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleChatSubmit();
                  }}
                  style={{
                    ...font,
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontSize: '0.875rem',
                    backgroundColor: 'transparent',
                    color: '#000000',
                  }}
                />
                <button
                  onClick={() => {
                    if (chatInput.trim()) {
                      handleChatSubmit();
                    } else {
                      onChipClick("I'm a broker — show me how Yulia can help scale my practice");
                    }
                  }}
                  style={{
                    ...font,
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1F2937'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000'; }}
                >
                  Analyze Now
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Footer bottom */}
          <div
            className="flex flex-col md:flex-row"
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 700,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              paddingTop: 32,
              ...font,
            }}
          >
            <p style={{ margin: 0 }}>&copy; 2025 SMBX.ai Technologies Inc.</p>
            <div className="flex" style={{ gap: 32, marginTop: 16 }}>
              <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#000000'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'; }}>Privacy</a>
              <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#000000'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'; }}>Terms</a>
              <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#000000'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'; }}>Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
