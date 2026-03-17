import {
  RevealSection,
  ScrollReveal,
} from './animations';

interface SellBelowProps {
  onChipClick: (text: string) => void;
}

/* ─── Inline SVG icons ─── */
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const SyncIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
);
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

/* ─── Six Ways Out data ─── */
const SIX_WAYS = [
  {
    title: 'Full Sale',
    desc: 'Complete ownership transfer to a strategic or financial buyer. Maximum liquidity event.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  },
  {
    title: 'Partner Buyout',
    desc: 'One partner acquires the other\'s share. Clean separation that preserves business continuity.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    title: 'Capital Raise',
    desc: 'Bring in outside investors while retaining operational control. Growth capital without giving up the wheel.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  },
  {
    title: 'ESOP',
    desc: 'Employee Stock Ownership Plan. Significant tax advantages and legacy preservation for your team.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
  },
  {
    title: 'Majority Sale',
    desc: 'Sell controlling interest while retaining a minority stake. Liquidity now with future upside.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  },
  {
    title: 'Partial Sale',
    desc: 'Sell a minority interest to a strategic partner. Access expertise and capital while maintaining control.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  },
];

/* ─── Deal Killers data ─── */
const DEAL_KILLERS = [
  { num: '01', title: 'The Lease', desc: 'A landlord who won\'t transfer or extend the lease kills more deals than valuation disagreements. We audit your lease exposure before you go to market.' },
  { num: '02', title: 'The Licenses', desc: 'Professional licenses, permits, and franchise agreements that can\'t transfer to a new owner. We map every regulatory dependency upfront.' },
  { num: '03', title: 'Reps & Warranties', desc: 'Poorly drafted representations expose sellers to post-close clawbacks. Our AI flags every risk in the purchase agreement before you sign.' },
];

/* ─── Process phases ─── */
const PROCESS_PHASES = [
  { num: 1, title: 'Understand', desc: 'Deep dive into financials, culture, and personal goals to build a defensible valuation.' },
  { num: 2, title: 'Optimize', desc: 'Fix leakage, restate financials, document workflows to make the business buyer-ready.' },
  { num: 3, title: 'Prepare', desc: 'Draft the CIM, set up virtual data room, and prepare for due diligence.' },
  { num: 4, title: 'Close', desc: 'Vet buyers, manage the process, and ensure the final contract protects your legacy.' },
];

/* ─── Deal size levels ─── */
const DEAL_LEVELS = [
  {
    level: 'Level 1',
    title: 'Owner-Operated',
    revenue: '$500K — $2M Revenue',
    features: ['SDE-based valuation', 'Add-back discovery', 'Blind teaser', 'Basic CIM', 'Buyer matching'],
    highlighted: false,
  },
  {
    level: 'Level 2',
    title: 'Established',
    revenue: '$2M — $10M Revenue',
    features: ['EBITDA-based valuation', 'Full add-back audit', 'Premium CIM', 'Buyer outreach campaign', 'Deal structuring', 'Tax impact analysis'],
    highlighted: true,
  },
  {
    level: 'Level 3',
    title: 'Institutional',
    revenue: '$10M+ Revenue',
    features: ['Enterprise valuation', 'Quality of earnings', 'Investment-grade CIM', 'Targeted buyer outreach', 'LBO modeling', 'Full DD coordination'],
    highlighted: false,
  },
];

const HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0I7-RCDoh56Kjxfzk_YPkuD7lLrR0LyDqz6QQdhvogUAL8xsF_mmRt5yI5f4mgvfff5R0QlQaq8XcaH8DGOwwu7THn351jGgqIC8FbdywuKE4gtbGSbSTAcz4gbRS6C9ENk62qeZz7V9s3PuRuyvaKfvX24fhGAol4LDkGWwgj_AtsxFwiVMGlOY2c1DY4cfsdi8DkKMYESudEdQV682ubgsFLRzngoN6PckJHF46XDHeOcbr0VJ6U0zh3vy6f0NANQVyH4uO7RDE';
const YULIA_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4FiuTMYJRaOyNAPtKuoivcm1IvvXEIpJizHDK9q5iv1GNmmV6EI5NFkmGb_MP3RdA72ayrVifJOc40DXBov2fEJb-zwuGP4Ac4Y_mVHWNXmdQ_Vsu33AP4totWAVKgB4hcFmrRVPSm3LbeA7OS4x-1XVRTLKxDLSAO_6fKqzUZA6TzEh6hmhsWgBeeAYzjcNQxLmc3OVOlKt_5x7xJdtfesZ1IgJBMKF-tgbsIMtkiroy-BpmcaGaCXqTMiUbLN28fAyxRYCZGgOM';
const BROKER_IMAGE = YULIA_AVATAR;

/* ─── Shared styles ─── */
const glassCard: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  borderRadius: 16,
};

const sectionPadding = 'py-[180px]';
const maxContainer = 'max-w-6xl mx-auto px-6 md:px-10';

export default function SellBelow({ onChipClick }: SellBelowProps) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══════════════════════════════════════════
          1. HERO — 2-col grid
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <RevealSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 mb-8"
                style={{
                  background: '#0D0D0D',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                Intelligence for Exits
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl"
                style={{
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: '#000',
                  margin: '0 0 24px',
                }}
              >
                75% of owners regret selling
              </h1>
              <p
                className="text-lg md:text-xl"
                style={{
                  color: '#545454',
                  lineHeight: 1.7,
                  margin: '0 0 40px',
                  maxWidth: 480,
                }}
              >
                We combine institutional-grade data with human empathy to ensure you exit on your terms, for your price, with zero regrets.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  type="button"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onChipClick("I want to sell my business. Help me understand what it's worth and how to prepare.")}
                  style={{
                    background: '#0D0D0D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '16px 32px',
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  Start Your Journey
                </button>
                <button
                  type="button"
                  className="cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-all"
                  onClick={() => onChipClick("Show me a live valuation for my business.")}
                  style={{
                    background: 'transparent',
                    color: '#0D0D0D',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: 10,
                    padding: '16px 32px',
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  See Live Valuation
                </button>
              </div>
            </div>

            {/* Right — hero image with floating card */}
            <div className="relative">
              <img
                src={HERO_IMAGE}
                alt="Business exit intelligence"
                className="w-full rounded-2xl object-cover"
                style={{ aspectRatio: '4/5' }}
              />
              {/* Floating card */}
              <div
                className="absolute bottom-6 left-6 md:bottom-8 md:left-8"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 14,
                  padding: '16px 24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#545454', margin: '0 0 4px' }}>
                  Exit Readiness
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#0D0D0D', margin: 0, letterSpacing: '-0.02em' }}>
                  92% <span style={{ fontSize: 14, fontWeight: 600, color: '#22c55e' }}>Optimal</span>
                </p>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════
          2. BIZESTIMATE — centered heading + glass card
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <RevealSection>
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 16px', lineHeight: 1.15 }}
            >
              What your business is actually worth
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              Real-time market data matched against your trailing 12-month performance.
            </p>
          </div>
        </RevealSection>

        <ScrollReveal>
          <div style={{ ...glassCard, padding: '48px' }}>
            {/* Label */}
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ec5b13', margin: '0 0 24px' }}>
              Live Valuation
            </p>

            {/* Business name */}
            <p style={{ fontSize: 15, fontWeight: 600, color: '#545454', margin: '0 0 8px' }}>
              Residential Cleaning Services
            </p>

            {/* Value range */}
            <p
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: '#000',
                margin: '0 0 40px',
                letterSpacing: '-0.03em',
                fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace",
              }}
            >
              $1.2M — $1.5M
            </p>

            {/* Bar chart */}
            <div className="flex items-end gap-3 justify-center" style={{ height: 140, marginBottom: 32 }}>
              {[65, 80, 95, 110, 130, 100, 85].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 80,
                    height: h,
                    borderRadius: '6px 6px 0 0',
                    background: i === 4 ? '#0D0D0D' : 'rgba(0,0,0,0.06)',
                    position: 'relative',
                    flex: 1,
                    maxWidth: 100,
                  }}
                >
                  {i === 4 && (
                    <span style={{
                      position: 'absolute',
                      top: -28,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#0D0D0D',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                    }}>
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Update button */}
            <div className="flex justify-center">
              <button
                type="button"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onChipClick("Update my business valuation with the latest financials.")}
                style={{
                  background: '#0D0D0D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 28px',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                }}
              >
                Update Valuation
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════
          3. ADD-BACKS — 2-col: left text + right table
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <RevealSection>
            <div>
              <h2
                className="text-4xl md:text-5xl"
                style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 20px', lineHeight: 1.15 }}
              >
                The $400,000 hiding in your tax returns
              </h2>
              <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, margin: '0 0 48px' }}>
                Most accountants minimize taxes. We maximize value. Our AI scans every line of your financials to surface legitimate add-backs that increase your valuation.
              </p>

              {/* Feature items */}
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-4">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: '#0D0D0D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', margin: '0 0 6px' }}>Automated Discovery</h3>
                    <p style={{ fontSize: 15, color: '#545454', lineHeight: 1.6, margin: 0 }}>
                      AI scans your P&L, tax returns, and bank statements to find every defensible add-back.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: '#0D0D0D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', margin: '0 0 6px' }}>Multiplied Impact</h3>
                    <p style={{ fontSize: 15, color: '#545454', lineHeight: 1.6, margin: 0 }}>
                      Every add-back dollar gets multiplied by your valuation multiple. $1 in add-backs can mean $4-6 in enterprise value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Right — table */}
          <ScrollReveal>
            <div style={{ ...glassCard, overflow: 'hidden' }}>
              {/* Header */}
              <div className="flex" style={{ padding: '20px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
                <span style={{ flex: 2, fontSize: 13, fontWeight: 600, color: '#545454' }}>Expense Category</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#545454', textAlign: 'right' }}>Valuation Gain</span>
              </div>
              {/* Rows */}
              {[
                { category: "Owner's Health Insurance", gain: '+$90K' },
                { category: 'Personal Vehicle Lease', gain: '+$62K' },
                { category: 'One-time Legal Fees', gain: '+$225K' },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center"
                  style={{ padding: '20px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <span style={{ flex: 2, fontSize: 15, fontWeight: 500, color: '#000' }}>{row.category}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#22c55e', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.gain}</span>
                </div>
              ))}
              {/* Total */}
              <div
                className="flex items-center"
                style={{ padding: '20px 32px', background: '#0D0D0D' }}
              >
                <span style={{ flex: 2, fontSize: 15, fontWeight: 700, color: '#fff' }}>Total Added Value</span>
                <span style={{ flex: 1, fontSize: 20, fontWeight: 800, color: '#fff', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>+$377K</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. ASSET VS STOCK — 2-col cards
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <RevealSection>
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 16px', lineHeight: 1.15 }}
            >
              Deal structure over negotiation
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              The structure of your deal determines more of your after-tax proceeds than the headline price.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Asset Sale */}
          <ScrollReveal>
            <div style={{ ...glassCard, padding: '40px', height: '100%' }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#545454', margin: '0 0 12px' }}>
                Option A
              </p>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: '#000', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
                Asset Sale
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { ok: true, text: 'Buyer selects specific assets' },
                  { ok: true, text: 'Lower risk for buyer' },
                  { ok: true, text: 'Clean separation of liabilities' },
                  { ok: false, text: 'Double taxation risk' },
                  { ok: false, text: 'Contract reassignment required' },
                  { ok: false, text: 'Higher tax burden for seller' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.ok ? <CheckIcon /> : <CloseIcon />}
                    <span style={{ fontSize: 15, color: item.ok ? '#000' : '#545454' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Stock Sale */}
          <ScrollReveal delay={0.08}>
            <div
              style={{
                ...glassCard,
                padding: '40px',
                height: '100%',
                border: '2px solid #000',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#545454', margin: 0 }}>
                  Option B
                </p>
                <span
                  style={{
                    background: '#0D0D0D',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 14px',
                    borderRadius: 999,
                    letterSpacing: '0.02em',
                  }}
                >
                  Seller Preferred
                </span>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: '#000', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
                Stock Sale
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { ok: true, text: 'Capital gains treatment for seller' },
                  { ok: true, text: 'Contracts and licenses transfer' },
                  { ok: true, text: 'Simpler closing process' },
                  { ok: true, text: 'Lower total tax for seller' },
                  { ok: false, text: 'Buyer inherits all liabilities' },
                  { ok: false, text: 'More due diligence required' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.ok ? <CheckIcon /> : <CloseIcon />}
                    <span style={{ fontSize: 15, color: item.ok ? '#000' : '#545454' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. SIX WAYS OUT — 3x2 grid
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <RevealSection>
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 16px', lineHeight: 1.15 }}
            >
              Six ways out — one right path
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              The right exit depends on your legacy goals and liquidity needs.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SIX_WAYS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.06}>
              <div style={{ ...glassCard, padding: '40px', height: '100%' }}>
                <div
                  className="flex items-center justify-center mb-6"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: '#0D0D0D',
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="text-2xl" style={{ fontWeight: 700, color: '#000', margin: '0 0 10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, color: '#545454', lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. CIM — 2-col: left doc preview + right text
          ═══════════════════════════════════════════ */}
      <section
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: '#FAFAFA',
        }}
      >
        <div className={`${sectionPadding} ${maxContainer}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — document preview mockup */}
            <ScrollReveal>
              <div
                style={{
                  ...glassCard,
                  padding: '40px',
                  background: '#fff',
                }}
              >
                {/* Skeleton doc header */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ width: '60%', height: 14, background: 'rgba(0,0,0,0.08)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: '80%', height: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '70%', height: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 4 }} />
                </div>
                {/* Separator */}
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '24px 0' }} />
                {/* Grid placeholders */}
                <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
                  {[1, 2, 3, 4].map(n => (
                    <div
                      key={n}
                      style={{
                        height: 80,
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.04)',
                      }}
                    />
                  ))}
                </div>
                {/* More skeleton lines */}
                <div style={{ width: '90%', height: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ width: '75%', height: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ width: '85%', height: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 4 }} />
              </div>
            </ScrollReveal>

            {/* Right — text */}
            <RevealSection>
              <div>
                <h2
                  className="text-4xl md:text-5xl"
                  style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 20px', lineHeight: 1.15 }}
                >
                  A CIM that never goes stale
                </h2>
                <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, margin: '0 0 40px' }}>
                  Your Confidential Information Memorandum stays current as your financials evolve. No more outdated pitch books.
                </p>

                {/* Features */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div style={{ color: '#545454', marginTop: 2, flexShrink: 0 }}>
                      <SyncIcon />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Real-time sync</h3>
                      <p style={{ fontSize: 14, color: '#545454', lineHeight: 1.6, margin: 0 }}>
                        Valuation updates daily based on public market comps and your latest financials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div style={{ color: '#545454', marginTop: 2, flexShrink: 0 }}>
                      <EyeIcon />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Buyer-side visibility</h3>
                      <p style={{ fontSize: 14, color: '#545454', lineHeight: 1.6, margin: 0 }}>
                        Track which sections buyers spend time on. Know their interests before the meeting.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div style={{ color: '#545454', marginTop: 2, flexShrink: 0 }}>
                      <LockIcon />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000', margin: '0 0 4px' }}>NDA-gated access</h3>
                      <p style={{ fontSize: 14, color: '#545454', lineHeight: 1.6, margin: 0 }}>
                        Buyers must accept your NDA before viewing sensitive financials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. PROCESS TIMELINE — 4-col horizontal
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <RevealSection>
          <div className="text-center mb-20">
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 16px', lineHeight: 1.15 }}
            >
              The intelligence-led process
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              A rigorous, data-driven approach to your life&apos;s work.
            </p>
          </div>
        </RevealSection>

        <ScrollReveal>
          {/* Connecting line — visible on lg+ */}
          <div className="relative">
            <div
              className="hidden lg:block absolute"
              style={{
                top: 28,
                left: '12.5%',
                right: '12.5%',
                height: 2,
                background: 'rgba(0,0,0,0.08)',
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {PROCESS_PHASES.map((phase, i) => (
                <div key={phase.title} className="text-center relative">
                  {/* Numbered circle */}
                  <div
                    className="mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: i === 3 ? '#0D0D0D' : 'rgba(0,0,0,0.05)',
                      color: i === 3 ? '#fff' : '#000',
                      fontSize: 20,
                      fontWeight: 700,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {phase.num}
                  </div>
                  <h3 className="text-2xl" style={{ fontWeight: 700, color: '#000', margin: '0 0 10px' }}>
                    {phase.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#545454', lineHeight: 1.6, margin: 0 }}>
                    {phase.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════
          8. DEAL KILLERS — 3-col with ghost numbers
          ═══════════════════════════════════════════ */}
      <section style={{ borderTop: '2px solid #000' }}>
        <div className={`${sectionPadding} ${maxContainer}`}>
          <RevealSection>
            <div className="mb-16">
              <h2
                className="text-4xl md:text-5xl"
                style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 16px', lineHeight: 1.15 }}
              >
                The three things that kill more deals than price
              </h2>
              <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, maxWidth: 620 }}>
                Price disagreements are solvable. These are not — unless you catch them early.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {DEAL_KILLERS.map((item, i) => (
              <ScrollReveal key={item.num} delay={i * 0.08}>
                <div className="relative" style={{ paddingTop: 40 }}>
                  {/* Ghost number */}
                  <span
                    className="text-5xl"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      fontWeight: 900,
                      color: '#000',
                      opacity: 0.06,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      fontSize: 64,
                    }}
                  >
                    {item.num}
                  </span>
                  <h3 className="text-2xl" style={{ fontWeight: 700, color: '#000', margin: '0 0 12px', position: 'relative' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#545454', lineHeight: 1.65, margin: 0, position: 'relative' }}>
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. BROKER — 2-col card
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <ScrollReveal>
          <div
            style={{
              ...glassCard,
              padding: '64px',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <h2
                  className="text-3xl md:text-4xl"
                  style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 20px', lineHeight: 1.2 }}
                >
                  Working with a broker? Even better.
                </h2>
                <p className="text-lg" style={{ color: '#545454', lineHeight: 1.7, margin: '0 0 32px' }}>
                  We enhance your broker&apos;s work with AI-powered analytics, real-time valuations, and a living CIM. Your broker stays in the loop with full portal access.
                </p>
                <button
                  type="button"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onChipClick("I'm working with a broker and want to see how smbX enhances the sell-side process.")}
                  style={{
                    background: '#0D0D0D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '16px 32px',
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  Broker Portal Access
                </button>
              </div>

              {/* Right — circular image */}
              <div className="flex justify-center">
                <img
                  src={BROKER_IMAGE}
                  alt="Broker collaboration"
                  style={{
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════
          10. DEAL SIZE LEVELS — 3-col pricing cards
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`}>
        <RevealSection>
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: '0 0 16px', lineHeight: 1.15 }}
            >
              Your deal, your depth
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#545454', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              Every business is different. Your advisory experience should be too.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {DEAL_LEVELS.map((level, i) => (
            <ScrollReveal key={level.title} delay={i * 0.08}>
              <div
                style={{
                  ...glassCard,
                  padding: '40px',
                  height: '100%',
                  border: level.highlighted ? '2px solid #000' : '1px solid rgba(0,0,0,0.06)',
                  transform: level.highlighted ? 'scale(1.03)' : 'none',
                  position: 'relative',
                }}
              >
                {level.highlighted && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#0D0D0D',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '6px 18px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Recommended
                  </span>
                )}
                <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#545454', margin: '0 0 8px' }}>
                  {level.level}
                </p>
                <h3 className="text-2xl" style={{ fontWeight: 700, color: '#000', margin: '0 0 8px' }}>
                  {level.title}
                </h3>
                <p style={{ fontSize: 14, color: '#545454', margin: '0 0 28px', fontWeight: 500 }}>
                  {level.revenue}
                </p>
                <div className="flex flex-col gap-3">
                  {level.features.map(feat => (
                    <div key={feat} className="flex items-center gap-3">
                      <CheckIcon />
                      <span style={{ fontSize: 14, color: '#000' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="cursor-pointer hover:opacity-90 transition-opacity w-full mt-8"
                  onClick={() => onChipClick(`I have a ${level.title.toLowerCase()}-level business and want to explore selling.`)}
                  style={{
                    background: level.highlighted ? '#0D0D0D' : 'transparent',
                    color: level.highlighted ? '#fff' : '#0D0D0D',
                    border: level.highlighted ? 'none' : '1px solid rgba(0,0,0,0.2)',
                    borderRadius: 10,
                    padding: '14px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                  }}
                >
                  Get Started
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          11. FINAL CTA — narrative + Yulia chat
          ═══════════════════════════════════════════ */}
      <section className={`${sectionPadding} ${maxContainer}`} style={{ paddingBottom: 120 }}>
        <RevealSection>
          <div className="text-center mb-6">
            <h2
              className="text-6xl md:text-8xl"
              style={{
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#000',
                margin: '0 0 32px',
                lineHeight: 1.05,
              }}
            >
              The wire hits.
            </h2>
          </div>

          <div className="text-center mb-16" style={{ maxWidth: 640, margin: '0 auto 64px' }}>
            <p
              style={{
                fontSize: 20,
                fontStyle: 'italic',
                color: '#545454',
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              You stare at the number on the screen. Seven figures, confirmed. The business you built from nothing — every early morning, every late night, every risk — just converted into a single wire transfer. This is what it feels like when you do it right.
            </p>
          </div>

          {/* Yulia chat card */}
          <ScrollReveal>
            <div
              style={{
                ...glassCard,
                padding: '48px',
                maxWidth: 640,
                margin: '0 auto',
              }}
            >
              {/* Avatar + heading */}
              <div className="flex flex-col items-center text-center mb-8">
                <img
                  src={YULIA_AVATAR}
                  alt="Yulia — AI M&A Advisor"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: 16,
                  }}
                />
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>
                  Tell Yulia about your business
                </h3>
                <p style={{ fontSize: 15, color: '#545454', margin: 0 }}>
                  Your AI-powered M&A advisor is ready to help.
                </p>
              </div>

              {/* Input area */}
              <div
                className="flex items-center gap-3"
                style={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 12,
                  padding: '4px 4px 4px 20px',
                  background: '#fff',
                }}
              >
                <span style={{ flex: 1, fontSize: 15, color: '#999' }}>
                  Describe your business...
                </span>
                <button
                  type="button"
                  className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
                  onClick={() => onChipClick("I want to sell my business. Help me understand what it's worth and how to prepare.")}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#0D0D0D',
                    color: '#fff',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </RevealSection>
      </section>
    </div>
  );
}
