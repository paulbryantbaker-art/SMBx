/**
 * Glass Grok v2 · Pricing.tsx — canonical ladder.
 *
 * Free / Solo $79 / Pro $199 / Team $499 / Enterprise from $2,500.
 * Copy source: SITE_COPY.md (April 2026). Philosophy: every paid tier
 * includes every capability — tiers scale on seats + deal volume +
 * enterprise infrastructure, never on what Yulia can do for the deal.
 */
import { useState } from 'react';
import {
  DealStep, DealBottom,
  type DealTab,
} from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const CHIPS = [
  'Just trying it out',
  'Solo searcher',
  'Boutique advisory',
  'Mid-market firm',
] as const;

type Tier = {
  name: string;
  price: React.ReactNode;
  who: string;
  cta: string;
  dark?: boolean;
  feature?: boolean;
  seats: string;
  deals: string;
  deliverables: string;
};

const TIERS: readonly Tier[] = [
  { name: 'Free',       price: <>$0</>,                                          who: 'Trying Yulia out',                                            cta: 'Start free →',   seats: '1',    deals: '1',           deliverables: '1 (ever)' },
  { name: 'Solo',       price: <>$79<small>/mo</small></>,                       who: 'Solo operators. Self-funded searchers. Principal sellers.',  cta: 'Start Solo →',   seats: '1',    deals: '1',           deliverables: 'Unlimited' },
  { name: 'Pro',        price: <>$199<small>/mo</small></>,                      who: 'Practitioners — IS, search funders, LMM advisors, solo bankers.', cta: 'Start Pro →',    feature: true, seats: '1',    deals: 'Unlimited',   deliverables: 'Unlimited' },
  { name: 'Team',       price: <>$499<small>/mo</small></>,                      who: 'Boutique firms. Small corp dev. Multi-person family offices.', cta: 'Start Team →',  seats: '5',    deals: 'Unlimited',   deliverables: 'Unlimited' },
  { name: 'Enterprise', price: <>From $2,500<small>/mo</small></>,               who: 'Firms. Serial acquirers. PE funds. Regulated entities.',      cta: 'Talk to sales →', dark: true,   seats: '6+',   deals: 'Unlimited',   deliverables: 'Unlimited' },
];

const CAPABILITIES: readonly { title: string; body: string }[] = [
  { title: 'Add-back & QoE Lite',          body: 'Find value hiding in financials. Pre-LOI earnings quality. 20 minutes, not 6 weeks.' },
  { title: 'SBA SOP 50 10 8 structuring',  body: 'Model capital stacks under current SBA rules. Rebuild what the new regs broke.' },
  { title: 'Deal screening (Rundown)',     body: '90-second scoring on 7 dimensions. Pursue or pass before you spend a dollar.' },
  { title: 'CIM & pitch book drafting',    body: 'Institutional-quality CIMs. 25–40 pages. Strategic narrative, not a template.' },
  { title: 'LOI & term sheet drafting',    body: 'First-draft offer documents from your deal context. Attorney-ready.' },
  { title: 'Investor memos & LP updates',  body: 'IC memos, LP updates, capital partner pitches, board decks. 20 minutes, not 2 days.' },
  { title: 'Due diligence coordination',   body: '147-item DD checklists from the specific deal. Cross-party tracking. Document indexing.' },
];

const ENTERPRISE_ADDS: readonly string[] = [
  'Team workspace + shared deal vault',
  'White-label outputs',
  'SSO (Okta, Google, Azure)',
  'Single-tenant deployment',
  'SOC 2 audit trails',
  'API access',
  'Named account manager',
  'SLA 99.9%',
];

const FAQS: readonly { q: string; a: string }[] = [
  { q: 'What\'s in the Free tier?', a: 'Unlimited chat with Yulia and one deliverable — ever — with email registration. No credit card. If you want a second deliverable, upgrade to Solo ($79/mo) or buy a $99 credit pack. No time limit; the cap is total, not monthly.' },
  { q: 'What counts as a deliverable?', a: 'Any finished document Yulia produces — an add-back analysis, a CIM draft, a screening memo, an LOI, an LP update. One rendered, downloadable, or shareable artifact.' },
  { q: 'Why no success fees or take rates?', a: 'Two reasons. smbX does not hold the licenses required to charge success fees — we sit on the software side of the broker-dealer line under SEC Rule 15(b)(13). And success fees would fundamentally change what smbX is: a tool becomes a broker. Subscription only. Forever.' },
  { q: 'Do you have a special tier for brokers and advisors?', a: 'Advisors and brokers are customers, not competitors. A solo broker uses Solo or Pro. A boutique advisory uses Team. A large firm uses Enterprise. Same product, different configuration. No separate pricing.' },
  { q: 'Can I try Pro or Team for free?', a: 'Yes. Every paid tier has a 14-day full-feature trial. Credit card required to activate. Cancel inside 14 days and you\'re not charged.' },
  { q: 'What happens after I close a deal?', a: 'Your subscription continues at your current tier. You get 180 days of post-close PMI and portfolio ops support included. Many users stay on permanently — Yulia becomes the ongoing chief-of-staff for the business they bought.' },
  { q: 'Why $199 Pro and $499 Team?', a: 'Pro is for one practitioner working alone — an independent sponsor, a solo banker, a searcher. Team is for a 2–5 person firm where Yulia becomes the shared team resource. The difference isn\'t features; it\'s seats, team workspace, and shared deal vault.' },
  { q: 'What if I need 6+ seats?', a: 'That\'s Enterprise. Custom-priced based on seat count, infrastructure needs, and whether you need SSO, single-tenant deployment, SOC 2 audit trails, API access. Starts at $2,500/month.' },
  { q: 'Is there a student discount?', a: 'Yes. Students in M&A or ETA programs at accredited universities can apply for 50% off Pro. Verify via .edu email; manually approved.' },
  { q: 'Can I pause my subscription?', a: 'Yes. Up to 90 days once per year. Preserves your deal history and workspace. After 90 days, auto-resumes or auto-cancels based on your preference.' },
];

export default function Pricing({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="PRICING"
      canvasTitle="One price. Every capability. Every deal size."
      chat={{
        title: 'Yulia',
        status: 'Help me pick',
        script: {},
        opening: 'Hi — I\'m <strong>Yulia</strong>. Tell me what you\'re doing and I\'ll tell you which tier fits. Most people overbuy on their first subscription.',
        reply: 'Tell me two things: <strong>how many seats</strong> and <strong>how many active deals</strong>. I\'ll point you at the smallest plan that covers both.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* s1 · hero / philosophy */}
      <DealStep
        n={1}
        id="s1"
        idx="Pricing"
        title="One price. Every capability. Every deal size."
        lede={<>No feature gates. No success fees. No per-deal charges. Pick the tier that matches your team — every tier does every job. Tiers scale on seats, deal volume, and enterprise infrastructure. Never on what Yulia can do for the deal in front of you.</>}
      />

      {/* s2 · the 5 plans */}
      <DealStep
        n={2}
        id="s2"
        idx="Plans"
        title="Choose based on who you are, not what your deals look like."
        lede={<>Every paid tier has a 14-day opt-out trial. Credit card required to activate. Cancel inside 14 days and you\'re not charged.</>}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginTop: 18,
        }}>
          {TIERS.map((t) => <PlanCard key={t.name} tier={t} onClick={() => {
            if (t.name === 'Free') onStartFree();
            else if (t.name === 'Enterprise') onNavigate('enterprise');
            else onSend(`I want to start the ${t.name} plan.`);
          }} />)}
        </div>
      </DealStep>

      {/* s3 · what's in every tier */}
      <DealStep
        n={3}
        id="s3"
        idx="Included"
        title="What Yulia does for every subscription."
        lede={<>These seven things ship in every paid tier — from Solo at $79 to Enterprise. The tier you pick controls volume and seats, not capability.</>}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginTop: 18,
        }}>
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              style={{
                background: '#fff',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 6,
              }}>{c.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: '#3A3A3E' }}>{c.body}</div>
            </div>
          ))}
          <div style={{
            background: '#0A0A0B',
            color: '#fff',
            borderRadius: 12,
            padding: 20,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 9.5,
              letterSpacing: '0.14em',
              opacity: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>Enterprise adds</div>
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              fontSize: 12.5,
              lineHeight: 1.9,
              opacity: 0.85,
            }}>
              {ENTERPRISE_ADDS.map((f) => <li key={f}>· {f}</li>)}
            </ul>
          </div>
        </div>
      </DealStep>

      {/* s4 · FAQ */}
      <DealStep
        n={4}
        id="s4"
        idx="Questions"
        title="Questions."
      >
        <div style={{ display: 'grid', gap: 8, marginTop: 18 }}>
          {FAQS.map((f, i) => (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: '#fff',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                <div style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 600,
                  fontSize: 13.5,
                }}>{f.q}</div>
                <div style={{
                  fontSize: 18,
                  color: '#9A9A9F',
                  lineHeight: 1,
                  transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}>+</div>
              </div>
              {openFaq === i && (
                <div style={{
                  marginTop: 10,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#3A3A3E',
                }}>{f.a}</div>
              )}
            </button>
          ))}
        </div>
      </DealStep>

      <DealBottom
        heading="Start free. No credit card."
        sub="Unlimited chat. One deliverable free. Upgrade only when you know it's worth it."
        placeholder="Seats, active deals, what you're working on…"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

function PlanCard({ tier, onClick }: { tier: Tier; onClick: () => void }) {
  return (
    <div style={{
      background: tier.dark ? '#0A0A0B' : '#fff',
      color: tier.dark ? '#fff' : 'inherit',
      border: tier.feature
        ? '1.5px solid #0A0A0B'
        : tier.dark ? '0.5px solid #0A0A0B' : '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14,
      padding: '22px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
    }}>
      {tier.feature && (
        <div style={{
          position: 'absolute',
          top: -10,
          left: 16,
          background: '#0A0A0B',
          color: '#fff',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: 4,
        }}>Most common</div>
      )}
      <div>
        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: '-0.01em',
        }}>{tier.name}</div>
        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: '-0.03em',
          marginTop: 6,
        }}>{tier.price}</div>
        <div style={{
          fontSize: 12,
          lineHeight: 1.45,
          opacity: 0.7,
          marginTop: 8,
          minHeight: 40,
        }}>{tier.who}</div>
      </div>
      <div style={{
        borderTop: tier.dark ? '0.5px solid rgba(255,255,255,0.14)' : '0.5px solid rgba(0,0,0,0.08)',
        paddingTop: 12,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        rowGap: 6,
        fontSize: 11.5,
        opacity: 0.8,
      }}>
        <span>Seats</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{tier.seats}</span>
        <span>Active deals</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{tier.deals}</span>
        <span>Deliverables</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{tier.deliverables}</span>
      </div>
      <button
        type="button"
        onClick={onClick}
        style={{
          marginTop: 'auto',
          background: tier.dark ? '#fff' : '#0A0A0B',
          color: tier.dark ? '#0A0A0B' : '#fff',
          border: 'none',
          borderRadius: 999,
          padding: '10px 14px',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          fontSize: 12.5,
          cursor: 'pointer',
        }}
      >
        {tier.cta}
      </button>
    </div>
  );
}
