/**
 * Pricing.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
 * Canonical ladder: Free / Solo $79 / Pro $199 / Team $499 /
 * Enterprise from $2,500.
 */
import { useEffect, useRef, useState } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';

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

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                Pricing
                <span className="h-today__meta-tag">Monthly</span>
              </div>
              <h1 className="h-today__h">One price. Every capability. <em>Every deal size.</em></h1>
              <p className="h-today__sub">
                No feature gates. No success fees. No per-deal charges. Pick the tier that matches your team — every tier does every job. <strong>Tiers scale on seats and deal volume.</strong> Never on what Yulia can do for the deal in front of you.
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
                <strong>Solo at $79/mo.</strong> One seat, one active deal, unlimited deliverables. Step up to Pro ($199) when you\'re juggling multiple deals or want a team seat.
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

        {/* FIVE TIERS */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Five plans · same capabilities</div>
            <h2 className="h-sect-h__t">Pick based on who you are. <em>Not what your deal looks like.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="plans" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            { n: '01 · Free',        price: '$0',              who: 'Trying Yulia out',                                                       seats: '1',    deals: '1',            deliverables: '1 (ever)' },
            { n: '02 · Solo',        price: '$79/mo',          who: 'Solo operators · searchers · principal sellers',                         seats: '1',    deals: '1',            deliverables: 'Unlimited' },
            { n: '03 · Pro ★',      price: '$199/mo',         who: 'Practitioners · IS · search funders · LMM advisors',                      seats: '1',    deals: 'Unlimited',    deliverables: 'Unlimited', winner: true },
            { n: '04 · Team',        price: '$499/mo',         who: 'Boutique firms · small corp dev · multi-FO',                              seats: '5',    deals: 'Unlimited',    deliverables: 'Unlimited' },
            { n: '05 · Enterprise',  price: 'From $2,500/mo',  who: 'Firms · serial acquirers · PE funds · regulated',                         seats: '6+',   deals: 'Unlimited',    deliverables: 'Unlimited' },
          ].map((t, i) => (
            <a
              key={t.n}
              className={`h-app h-anim${i ? ` h-anim-d${Math.min(i, 3)}` : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); pickTier(t.n.split(' · ')[1]); }}
            >
              <div className="h-app__art">
                <div className="h-app__art-k">{t.n}</div>
                <h3 className="h-app__art-h" style={{ fontSize: 'clamp(24px, 3.2vw, 32px)' }}>{t.price}</h3>
                <div className="h-app__preview">
                  <div className="h-app__row h-app__row--head"><span>What's included</span><span>—</span></div>
                  <div className="h-app__row"><span className="h-app__row-l">Seats</span><span className="h-app__row-r h-app__row-r--ok">{t.seats}</span></div>
                  <div className="h-app__row"><span className="h-app__row-l">Active deals</span><span className="h-app__row-r h-app__row-r--ok">{t.deals}</span></div>
                  <div className="h-app__row"><span className="h-app__row-l">Deliverables</span><span className="h-app__row-r h-app__row-r--ok">{t.deliverables}</span></div>
                  <div className="h-app__row"><span className="h-app__row-l">All capabilities</span><span className="h-app__row-r h-app__row-r--ok">Yes</span></div>
                </div>
              </div>
              <div className="h-app__foot">
                <div className="h-app__foot-l">
                  <div className="h-app__foot-t">{t.winner ? 'Most common' : 'Who it fits'}</div>
                  <div className="h-app__foot-s">{t.who}</div>
                </div>
                <button className="h-app__get" type="button">{t.n.includes('Free') ? 'Start' : t.n.includes('Enterprise') ? 'Talk' : 'Pick'}</button>
              </div>
            </a>
          ))}
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
            Unlimited chat with Yulia. One deliverable free, forever. Upgrade when you\'re actually running a deal. Most people overbuy on their first subscription — I'll tell you the smallest plan that covers what you\'re doing.
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
