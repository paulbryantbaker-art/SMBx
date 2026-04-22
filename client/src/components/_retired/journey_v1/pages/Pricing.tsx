/**
 * Pricing.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
 * Canonical ladder: Free / Solo $79 / Pro $199 / Team $499 /
 * Enterprise from $2,500.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import SectionNav, { type Section } from '../shell/SectionNav';

const PRICING_SECTIONS: readonly Section[] = [
  { id: 'hero',  label: 'Overview' },
  { id: 'plans', label: 'Compare plans' },
  { id: 'caps',  label: 'Capabilities' },
  { id: 'faq',   label: 'FAQ' },
  { id: 'trust', label: 'Trust' },
  { id: 'cta',   label: 'Start' },
];

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

const FAQS: readonly { q: string; a: string }[] = [
  { q: "What's in the Free tier?",              a: "Unlimited chat with Yulia and one deliverable — ever — with email registration. No credit card. Upgrade to Solo ($79/mo) or buy a $99 credit pack for more." },
  { q: "What counts as a deliverable?",         a: "Any finished artifact Yulia produces — an add-back analysis, a CIM draft, a screening memo, an LOI, an LP update. One rendered, downloadable document." },
  { q: "Why no success fees or take rates?",    a: "Two reasons. smbx does not hold the licenses required to charge success fees (SEC Rule 15(b)(13)). And success fees would change what smbx is — a tool becomes a broker. Subscription only. Forever." },
  { q: "Do brokers and advisors get a tier?",   a: "Advisors and brokers are customers, not competitors. Solo for a single practitioner, Team for a 2–5 person boutique, Enterprise for a firm. Same product, different configuration." },
  { q: "Can I try Pro or Team for free?",       a: "Yes. Every paid tier has a 14-day full-feature trial. Credit card required to activate; cancel inside 14 days and you're not charged." },
  { q: "What happens after I close a deal?",    a: "Your subscription continues at your current tier — you get 180 days of post-close PMI + portfolio ops support. Many users stay on permanently." },
];

export default function Pricing({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('.h-anim');
    if (!targets.length) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const pulseChat = () => {
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    input?.focus();
    document.getElementById('chat')?.animate(
      [{ boxShadow: '0 0 0 0 rgba(10,10,11,0.25)' }, { boxShadow: '0 0 0 14px rgba(10,10,11,0)' }],
      { duration: 720, easing: 'cubic-bezier(0.22,0.8,0.32,1)' },
    );
  };

  const pickTier = (name: string) => {
    if (name === 'Free') { onStartFree(); return; }
    if (name === 'Enterprise') { onNavigate('enterprise'); return; }
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    if (!input) return;
    input.value = `I want to start the ${name} plan.`;
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai / pricing"
      canvasTitle="Pricing"
      canvasBadge="Monthly · cancel anytime"
      chat={{
        title: 'Yulia',
        status: 'Help me pick',
        pswLogo: 'Y',
        pswName: 'Yulia',
        pswMeta: 'PRICING',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. Tell me what you're doing and I'll tell you which tier fits. Most people overbuy on their first subscription.",
        reply: "Two things: <strong>how many seats</strong> and <strong>how many active deals</strong>. I'll point you at the smallest plan that covers both.",
        chips: [] as const,
        placeholder: 'Tell me about your team and deal cadence…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'See the 5 plans',
          onClick: () => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="pricing" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>
        <SectionNav sections={PRICING_SECTIONS} />

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                Pricing
                <span className="h-today__meta-tag">Monthly</span>
              </div>
              <h1 className="h-today__h">Priced against the cost of <em>building it yourself.</em></h1>
              <p className="h-today__sub">
                Not against the cost of not having it. That's how everyone else prices — we don't. <strong>Every tier delivers every hero capability.</strong> You pay for volume, seats, and enterprise infrastructure. Never for the work Yulia does. No success fees, ever.
              </p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={onStartFree}>
                  Start free
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>See the plans</button>
              </div>
            </div>
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · help me pick</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">I'm a solo searcher. Which plan?</div>
              <div className="h-today__demo-bubble">
                <strong>Solo at $79/mo.</strong> One seat, one active deal, unlimited deliverables. Step up to Pro ($199) when you're juggling multiple deals or want a team seat.
              </div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">$79<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>/mo</span></div>
                  <div className="h-today__demo-out-l">Most searchers start here</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">14<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>d</span></div>
                  <div className="h-today__demo-out-l">Full-feature trial</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FIVE TIERS — comparison table (28% better conversion per dossier) */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Five plans · every hero capability in every paid tier</div>
            <h2 className="h-sect-h__t">Pick based on who you are. <em>Not what your deal looks like.</em></h2>
          </div>
        </div>

        <div className="h-anim" id="plans" style={{
          marginTop: 18,
          background: 'var(--h-card, #fff)',
          border: '1px solid var(--h-line, rgba(0,0,0,0.08))',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
        }}>
          <PricingTable onPick={pickTier} />
        </div>

        {/* RAIL — every capability */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Inside every paid tier</div>
            <h2 className="h-sect-h__t">Same Yulia. <em>Every subscription.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="caps">
          {[
            { ico: '$', t: 'Add-back + QoE Lite',    s: 'Pre-LOI earnings quality. 30 minutes, not 6 weeks.',                 meta: 'Every paid tier' },
            { ico: '◨', t: 'SBA SOP 50 10 8',         s: 'Compliant capital-stack structures under current rules.',           meta: 'Every paid tier' },
            { ico: '◎', t: 'The Rundown',             s: '90-second deal scoring on 7 dimensions.',                            meta: 'Every paid tier' },
            { ico: '▤', t: 'CIM drafting',            s: '32-page diligence pack, 3–5 days to first draft.',                   meta: 'Every paid tier' },
            { ico: '⇌', t: 'LOI + APA drafting',      s: 'Attorney-ready first-draft offer documents.',                        meta: 'Every paid tier' },
            { ico: '▦', t: 'Investor memos',          s: 'IC memos, LP updates, capital-partner pitches, board decks.',        meta: 'Every paid tier' },
            { ico: '◫', t: 'DD coordination',         s: '147-item DD checklists generated from the specific deal.',           meta: 'Every paid tier' },
            { ico: '⎙', t: 'Data room',               s: 'Virtual data room with Q&A tracking and audit log.',                 meta: 'Every paid tier' },
            { ico: '⟟', t: '180-day runbook',         s: 'Post-close integration plan from the LOI + QoE.',                    meta: 'Every paid tier' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>Included</span><span>{c.meta}</span></div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Questions</div>
            <h2 className="h-sect-h__t">Quick answers. <em>Full explanations if you want them.</em></h2>
          </div>
        </div>

        <div className="h-anim" id="faq" style={{ display: 'grid', gap: 8, marginTop: 'var(--h-pad)' }}>
          {FAQS.map((f, i) => (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'var(--v4-card)', border: '1px solid var(--v4-card-line)',
                borderRadius: 14, padding: '16px 20px', cursor: 'pointer', font: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14 }}>{f.q}</div>
                <div style={{
                  fontSize: 18, color: 'var(--v4-mute)', lineHeight: 1,
                  transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 150ms',
                }}>+</div>
              </div>
              {openFaq === i && (
                <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--v4-ink-2)' }}>
                  {f.a}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* TRUST */}
        <div className="h-trust" id="trust">
          <div className="h-trust__k">Also</div>
          <div className="h-trust__list">
            <span>14-day trial on every paid tier</span>
            <span>Cancel anytime</span>
            <span>No success fees, ever</span>
            <span>Pause up to 90 days / year</span>
            <span>50% student discount on Pro</span>
          </div>
        </div>

        {/* CTA */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">Start free. <em>Upgrade when you know it's worth it.</em></h2>
          <p className="h-cta__s">
            Unlimited chat with Yulia. One deliverable free, forever. Upgrade when you're actually running a deal. Most people overbuy on their first subscription — I'll tell you the smallest plan that covers what you're doing.
          </p>
          <button className="h-cta__point" type="button" onClick={pulseChat}>
            <span className="h-cta__point-ar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            Start in the chat pane
            <span style={{ opacity: 0.65, fontWeight: 500 }}>Yulia is ready</span>
          </button>
          <div className="h-cta__meta">
            <span>Free · no card</span>
            <span>14-day trial on paid</span>
            <span>Monthly cancellation</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PricingTable — 5-column comparison table.
   Per the pricing dossier, comparison tables convert ~28% better than
   a grid of 5 separate tier cards. One glance answers "what's the
   difference between Solo and Pro." Pro is the anchor (★).
   ═══════════════════════════════════════════════════════════════════ */

type Tier = {
  name: 'Free' | 'Solo' | 'Pro' | 'Team' | 'Enterprise';
  price: string;
  cadence: string;
  who: string;
  badge?: string;
  cta: string;
  featured?: boolean;
};

const TIERS: readonly Tier[] = [
  { name: 'Free',       price: '$0',      cadence: '',         who: 'Curious operators',            cta: 'Start free' },
  { name: 'Solo',       price: '$79',     cadence: '/mo',      who: 'Solo searcher · SBA buyer',    cta: 'Start Solo' },
  { name: 'Pro',        price: '$199',    cadence: '/mo',      who: 'Active searcher · fund-less',  badge: 'Most pick this', cta: 'Start Pro', featured: true },
  { name: 'Team',       price: '$499',    cadence: '/mo',      who: 'Holdco · 2–5 person firm',     cta: 'Start Team' },
  { name: 'Enterprise', price: '$2,500+', cadence: '/mo',      who: 'Family office · fund · firm',  cta: 'Talk to sales' },
];

type Row =
  | { kind: 'group'; label: string }
  | { kind: 'text';  label: string; vals: readonly [string, string, string, string, string] }
  | { kind: 'check'; label: string; vals: readonly [boolean, boolean, boolean, boolean, boolean] };

const ROWS: readonly Row[] = [
  { kind: 'group', label: 'Fit' },
  { kind: 'text',  label: 'Seats',           vals: ['1', '1', '1', '5 included', 'Unlimited'] },
  { kind: 'text',  label: 'Active deals',    vals: ['—', '1', '3', '10', 'Unlimited'] },
  { kind: 'text',  label: 'Deliverables',    vals: ['1 ever', '10 / mo', 'Unlimited', 'Unlimited', 'Unlimited'] },

  { kind: 'group', label: 'Every hero capability' },
  { kind: 'check', label: 'Unlimited chat with Yulia',           vals: [true, true, true, true, true] },
  { kind: 'check', label: 'Add-back + QoE Lite',                 vals: [false, true, true, true, true] },
  { kind: 'check', label: 'The Rundown · 7-dim deal scoring',    vals: [false, true, true, true, true] },
  { kind: 'check', label: 'CIM drafting · 32-page diligence',    vals: [false, true, true, true, true] },
  { kind: 'check', label: 'LOI + APA first drafts',              vals: [false, true, true, true, true] },
  { kind: 'check', label: 'SBA SOP 50 10 8 structures',          vals: [false, true, true, true, true] },
  { kind: 'check', label: 'DD coordination + data room',         vals: [false, true, true, true, true] },
  { kind: 'check', label: 'Investor + IC + LP memos',            vals: [false, true, true, true, true] },
  { kind: 'check', label: '180-day post-close runbook',          vals: [false, true, true, true, true] },

  { kind: 'group', label: 'Team + enterprise' },
  { kind: 'check', label: 'Shared workspace + roles',            vals: [false, false, false, true, true] },
  { kind: 'check', label: 'Dedicated success manager',           vals: [false, false, false, true, true] },
  { kind: 'check', label: 'SSO / SAML · SOC 2 · custom DPA',     vals: [false, false, false, false, true] },
  { kind: 'check', label: 'On-prem LLM · bring-your-own-model',  vals: [false, false, false, false, true] },
  { kind: 'check', label: 'White-label for client deliverables', vals: [false, false, false, false, true] },
];

function PricingTable({ onPick }: { onPick: (name: Tier['name']) => void }) {
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
    <div role="table" aria-label="Pricing comparison" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(200px, 1.2fr) repeat(5, minmax(140px, 1fr))',
      minWidth: 920,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13,
      color: 'var(--h-ink, #0A0A0B)',
    }}>
      {/* Header row — tier columns */}
      <div role="rowgroup" style={{ display: 'contents' }}>
        <div role="columnheader" style={hCellFirst} />
        {TIERS.map((t) => (
          <div key={t.name} role="columnheader" style={{
            ...hCell,
            background: t.featured ? 'linear-gradient(180deg, #FAF6F5 0%, #FFFFFF 100%)' : 'transparent',
            borderBottom: '1px solid var(--h-line, rgba(0,0,0,0.08))',
            position: 'relative',
          }}>
            {t.badge && (
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#C7616F',
              }}>★ {t.badge}</div>
            )}
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 18, marginTop: t.badge ? 22 : 4 }}>{t.name}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 28, marginTop: 6, letterSpacing: '-0.01em' }}>
              {t.price}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--h-mute, #6B6B70)' }}>{t.cadence}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--h-mute, #6B6B70)', marginTop: 6, minHeight: 30, lineHeight: 1.35 }}>{t.who}</div>
            <button
              type="button"
              onClick={() => onPick(t.name)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: t.featured ? '1px solid #0A0A0B' : '1px solid var(--h-line, rgba(0,0,0,0.12))',
                background: t.featured ? '#0A0A0B' : '#FFFFFF',
                color: t.featured ? '#FFFFFF' : '#0A0A0B',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              {t.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Body rows */}
      {ROWS.map((r, idx) => {
        if (r.kind === 'group') {
          return (
            <div key={`g-${idx}`} role="row" style={{ display: 'contents' }}>
              <div role="cell" style={{
                gridColumn: '1 / -1',
                padding: '18px 20px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--h-faint, #9A9A9F)',
                borderTop: '1px solid var(--h-line-2, rgba(0,0,0,0.05))',
                background: '#FAFAFA',
              }}>{r.label}</div>
            </div>
          );
        }
        return (
          <div key={`r-${idx}`} role="row" style={{ display: 'contents' }}>
            <div role="rowheader" style={{ ...bCellFirst, borderTop: '1px solid var(--h-line-2, rgba(0,0,0,0.05))' }}>
              {r.label}
            </div>
            {r.vals.map((v, i) => {
              const tier = TIERS[i];
              const isCheck = r.kind === 'check';
              return (
                <div key={i} role="cell" style={{
                  ...bCell,
                  borderTop: '1px solid var(--h-line-2, rgba(0,0,0,0.05))',
                  background: tier.featured ? 'rgba(199,97,111,0.03)' : 'transparent',
                  color: isCheck
                    ? (v === true ? 'var(--h-ok, #22A755)' : 'var(--h-faint, #C7C7CC)')
                    : 'var(--h-ink-2, #3A3A3E)',
                  fontWeight: isCheck ? 700 : 500,
                  fontSize: isCheck ? 16 : 12.5,
                }}>
                  {isCheck ? (v === true ? '✓' : '–') : v}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
    </div>
  );
}

const hCell: CSSProperties = {
  padding: '16px 16px 18px',
  textAlign: 'center',
  borderLeft: '1px solid var(--h-line-2, rgba(0,0,0,0.05))',
};
const hCellFirst: CSSProperties = {
  padding: '16px 20px 18px',
  borderBottom: '1px solid var(--h-line, rgba(0,0,0,0.08))',
};
const bCell: CSSProperties = {
  padding: '14px 12px',
  textAlign: 'center',
  borderLeft: '1px solid var(--h-line-2, rgba(0,0,0,0.05))',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const bCellFirst: CSSProperties = {
  padding: '14px 20px',
  fontSize: 12.5,
  fontWeight: 500,
  color: 'var(--h-ink-2, #3A3A3E)',
};
