/**
 * Buy.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
 * Buyer POV: searcher / LMM PE associate evaluating acquisitions.
 * Running example: Acme, Inc. scored 81/100 via the Rundown.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
import SectionNav, { type Section } from '../shell/SectionNav';

const BUY_SECTIONS: readonly Section[] = [
  { id: 'hero',    label: 'Overview' },
  { id: 'try',     label: 'Try the Rundown' },
  { id: 'phases',  label: 'Four phases' },
  { id: 'caps',    label: 'Capabilities' },
  { id: 'claim',   label: 'Speed advantage' },
  { id: 'trust',   label: 'Trust' },
  { id: 'cta',     label: 'Start' },
];

type BuyerVoice = 'searcher' | 'sponsor';

const BUYER_COPY: Record<BuyerVoice, {
  meta: string;
  h1: string; h1Em: string;
  sub: ReactNode;
  ctaLabel: string;
  ctaSeed: string;
  demoMe: string;
  demoYulia: ReactNode;
}> = {
  searcher: {
    meta: 'Buy-side · Searcher · Acme, Inc.',
    h1: 'Your rollover structure just died.',
    h1Em: 'Yulia rebuilds it.',
    sub: (
      <>
        SBA SOP 50 10 8 killed the capital stack every searcher was trained on. 41% of brokers report deal delays. <strong>Yulia rebuilds the compliant stack in 5 minutes</strong>, scores any deal on 7 dimensions in 90 seconds, and stress-tests the personal guarantee before you sign.
      </>
    ),
    ctaLabel: 'Score a deal',
    ctaSeed: 'Paste a listing URL or describe a deal.',
    demoMe: 'Score this deal — $65M distributor, Phoenix.',
    demoYulia: (
      <>
        <strong>81/100 · Pursue.</strong> Strong financial integrity (9.1), scalability (8.0), revenue quality (8.4). SBA stack rebuilt under SOP 50 10 8 — seller-note subordination clean, PG stress-tested at 1.25× DSCR.
      </>
    ),
  },
  sponsor: {
    meta: 'Buy-side · Independent sponsor · Acme, Inc.',
    h1: "The LP is on the phone Thursday.",
    h1Em: 'The IC memo hits Wednesday.',
    sub: (
      <>
        For <strong>independent sponsors, search funders, and fund-less capital</strong>. Yulia scores any deal on 7 dimensions in 90 seconds, models the debt/equity/rollover/earnout stack, stress-tests the returns, and drafts the IC memo your capital partner actually reads. <strong>You run the deal. Yulia runs the work.</strong>
      </>
    ),
    ctaLabel: 'Run a Rundown',
    ctaSeed: 'Sourced deal — model the capital stack and write the IC memo.',
    demoMe: 'Run the numbers — $11M EBITDA, targeting 3.5× debt, 20% rollover.',
    demoYulia: (
      <>
        <strong>81/100 · Pursue.</strong> Base case 2.8× MOIC / 28% IRR over 5 years. Downside at 4% revenue decline still clears 1.8×. Two yellow flags — concentration (6.0) and owner dependency (5.4). Both solvable in the 100-day plan.
      </>
    ),
  },
};

/* ── Rundown heuristics (demo-only; real product calls backend) ── */
type DimKey = 'financial' | 'margins' | 'revenue' | 'concentration' | 'management' | 'dependency' | 'scalability';
const RD_LABELS: Record<DimKey, string> = {
  financial: 'Financial quality',
  margins: 'Margins',
  revenue: 'Revenue quality',
  concentration: 'Concentration',
  management: 'Management depth',
  dependency: 'Owner dependency',
  scalability: 'Scalability',
};
const RD_KEYS: DimKey[] = ['financial', 'margins', 'revenue', 'concentration', 'management', 'dependency', 'scalability'];

function scoreDealText(s: string): Record<DimKey, number> {
  const t = s.toLowerCase();
  const has = (n: string[]) => n.some((x) => t.includes(x));
  const out: Record<DimKey, number> = {
    financial: 6.5, margins: 6.5, revenue: 6.5, concentration: 6.5,
    management: 6.5, dependency: 6.5, scalability: 6.5,
  };
  if (has(['clean', 'audited', 'tax return']))                        out.financial += 2;
  if (has(['qb', 'cash-basis', 'messy']))                             out.financial -= 1.5;
  if (has(['ebitda', '20%', '22%', '25%', '18%', '15%']))            out.margins += 1.5;
  if (has(['low-margin', '8%', '10%']))                               out.margins -= 1.5;
  if (has(['recurring', 'msa', 'subscription', 'contract']))          out.revenue += 2;
  if (has(['one-time', 'project-based', 'seasonal']))                 out.revenue -= 1.5;
  if (has(['concentration', '55%', '60%', 'top 3', 'top-3']))         out.concentration -= 2.5;
  if (has(['diversified', '100+ customer', 'long tail']))             out.concentration += 2;
  if (has(['team', 'management', 'coo', 'vp']))                       out.management += 1.5;
  if (has(['solo', 'no team', 'owner-operator']))                     out.management -= 2;
  if (has(['owner handles', 'owner runs', 'owner does']))             out.dependency -= 2;
  if (has(['owner stepped back', 'professional manager']))            out.dependency += 2;
  if (has(['platform', 'scalable', 'expansion', 'roll-up']))          out.scalability += 2;
  if (has(['single market', 'local', 'niche']))                       out.scalability -= 1;
  RD_KEYS.forEach((k) => { out[k] = Math.max(1, Math.min(10, Math.round(out[k] * 10) / 10)); });
  return out;
}

const SAMPLE_DEALS = [
  'HVAC services, $4.2M revenue, 18% EBITDA, 60% recurring contracts, 2nd-gen owner retiring',
  'Specialty distribution, $12M revenue, 22% EBITDA, 3 customers = 55% of revenue',
  'Pest control, Phoenix, $1.2M rev, asking $2.8M, 70% recurring, owner handles top-10 accounts',
];

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

export default function Buy({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [voice, setVoice] = useState<BuyerVoice>('searcher');
  const copy = BUYER_COPY[voice];

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

  const seedChat = (text: string) => {
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    if (!input) return;
    input.value = text;
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai / buy"
      canvasTitle="Buy a business"
      canvasBadge="Demo · Acme, Inc."
      chat={{
        title: 'Yulia',
        status: 'Buy-side · Acme, Inc.',
        pswLogo: 'A',
        pswName: 'Acme, Inc.',
        pswMeta: 'BUY · TARGET · 81/100',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. This walkthrough is a buyer evaluating <strong>Acme, Inc.</strong> — $65M distributor, Phoenix HQ. Scroll to watch me Rundown, restructure under SBA SOP 50 10 8, stress-test, and draft the LOI.",
        reply: "Three inputs: <strong>deal size</strong>, <strong>equity you can contribute</strong>, and a <strong>URL or teaser</strong>. I'll return a scored Rundown + compliant capital stack in 15 minutes.",
        chips: [] as const,
        placeholder: 'Paste a deal URL, teaser, or thesis…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'Run the Rundown',
          onClick: () => document.getElementById('rundown')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="buy" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>
        <SectionNav sections={BUY_SECTIONS} />

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <BuyerVoiceToggle voice={voice} onChange={setVoice} />
              <div className="h-today__meta">
                {copy.meta}
                <span className="h-today__meta-tag">Demo</span>
              </div>
              <h1 className="h-today__h">{copy.h1} <em>{copy.h1Em}</em></h1>
              <p className="h-today__sub">{copy.sub}</p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => seedChat(copy.ctaSeed)}>
                  {copy.ctaLabel}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
              </div>
            </div>
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · Rundown on Acme</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">{copy.demoMe}</div>
              <div className="h-today__demo-bubble">{copy.demoYulia}</div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">81<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>/100</span></div>
                  <div className="h-today__demo-out-l">Rundown score</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">90<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>s</span></div>
                  <div className="h-today__demo-out-l">Time to verdict</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ LIVE RUNDOWN ══ */}
        <RundownCalculator />

        {/* FOUR PHASES */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Four phases · one canvas</div>
            <h2 className="h-sect-h__t">From thesis to wired. <em>In the same conversation.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="phases">
          {/* 01 · The Rundown */}
          <a className="h-app h-anim" id="rundown" href="#" onClick={(e) => { e.preventDefault(); seedChat('Paste a listing URL or describe a deal.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">01 · The Rundown</div>
              <h3 className="h-app__art-h">Seven dimensions. Ninety seconds. Pursue or pass.</h3>
              <div className="h-app__donut">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="9" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#0A0A0B" strokeWidth="9" strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset="50" />
                </svg>
                <div className="h-app__donut-v">81</div>
              </div>
              <div className="h-app__preview" style={{ marginTop: 0 }}>
                <div className="h-app__bars">
                  {[
                    { l: 'Financials',    w: '91%', v: '9.1' },
                    { l: 'Revenue qual.', w: '84%', v: '8.4' },
                    { l: 'Concentration', w: '60%', v: '6.0' },
                    { l: 'Owner dep.',    w: '54%', v: '5.4' },
                  ].map((b) => (
                    <div key={b.l} className="h-app__bar">
                      <span className="h-app__bar-l">{b.l}</span>
                      <span className="h-app__bar-t"><span className="h-app__bar-f" style={{ ['--w' as string]: b.w } as React.CSSProperties} /></span>
                      <span className="h-app__bar-v">{b.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">The Rundown</div>
                <div className="h-app__foot-s">Paste a URL or teaser · 7 dims · 90 seconds to verdict</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 02 · SBA SOP 50 10 8 */}
          <a className="h-app h-anim h-anim-d1" id="sba" href="#" onClick={(e) => { e.preventDefault(); seedChat('Rebuild my SBA capital stack under SOP 50 10 8.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">02 · SBA SOP 50 10 8</div>
              <h3 className="h-app__art-h">Your rollover is dead. Yulia rebuilds the stack.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>Compliant stack · Acme · $86M</span><span>$</span></div>
                <div className="h-app__row"><span className="h-app__row-l">SBA 7(a) · senior</span><span className="h-app__row-r h-app__row-r--ok">$44M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Unitranche</span><span className="h-app__row-r h-app__row-r--ok">$22M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Seller note · full standby</span><span className="h-app__row-r h-app__row-r--ok">$18M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Equity (genuine cash)</span><span className="h-app__row-r h-app__row-r--ok">$14M</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">DSCR base · compliant</span><span className="h-app__row-r h-app__row-r--total">1.9×</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">Capital-stack modeler</div>
                <div className="h-app__foot-s">Rollover equity is dead after June 2025. Seller notes only count on full standby. Yulia models what qualifies.</div>
              </div>
              <button className="h-app__get" type="button">Model</button>
            </div>
          </a>

          {/* 03 · Stress test */}
          <a className="h-app h-anim h-anim-d2" id="stress" href="#" onClick={(e) => { e.preventDefault(); seedChat('Stress-test my DSCR.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">03 · Stress test</div>
              <h3 className="h-app__art-h">Know where the deal breaks before you guarantee it.</h3>
              <div className="h-app__preview" style={{ marginTop: 0 }}>
                <div className="h-app__bars">
                  {[
                    { l: 'Base case',         w: '95%', v: '1.9×' },
                    { l: 'Rev −10%',          w: '72%', v: '1.5×' },
                    { l: 'Hospitality soft',  w: '58%', v: '1.25×' },
                    { l: "Marco's top 2 go",   w: '46%', v: '1.0×' },
                    { l: 'Rev −25%',          w: '34%', v: '0.8×' },
                  ].map((b) => (
                    <div key={b.l} className="h-app__bar">
                      <span className="h-app__bar-l">{b.l}</span>
                      <span className="h-app__bar-t"><span className="h-app__bar-f" style={{ ['--w' as string]: b.w } as React.CSSProperties} /></span>
                      <span className="h-app__bar-v">{b.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">DSCR stress matrix</div>
                <div className="h-app__foot-s">Acme breaks at rev −25% or losing Marco's top 2 — structure around it: retention escrow + standby that extends on breach.</div>
              </div>
              <button className="h-app__get" type="button">Preview</button>
            </div>
          </a>

          {/* 04 · LOI */}
          <a className="h-app h-anim h-anim-d3" id="loi" href="#" onClick={(e) => { e.preventDefault(); seedChat('Draft the LOI on Acme.'); }}>
            <div className="h-app__art">
              <div className="h-app__art-k">04 · LOI</div>
              <h3 className="h-app__art-h">Three structures. One you can actually close.</h3>
              <div className="h-app__preview">
                <div className="h-app__row h-app__row--head"><span>LOI structures · Acme</span><span>$</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Aggressive · 70/25/5</span><span className="h-app__row-r h-app__row-r--warn">$94M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Recommended · 60/20/20</span><span className="h-app__row-r h-app__row-r--total">$86M</span></div>
                <div className="h-app__row"><span className="h-app__row-l">Conservative · earnout</span><span className="h-app__row-r h-app__row-r--ok">$82M</span></div>
                <div className="h-app__row h-app__row--total"><span className="h-app__row-l">Your equity · recommended</span><span className="h-app__row-r h-app__row-r--total">$14M</span></div>
              </div>
            </div>
            <div className="h-app__foot">
              <div className="h-app__foot-l">
                <div className="h-app__foot-t">LOI drafting</div>
                <div className="h-app__foot-s">Recommended: 60% cash + 20% rollover + 20% seller note on full standby. Rollover aligns Ray through year 3.</div>
              </div>
              <button className="h-app__get" type="button">Draft</button>
            </div>
          </a>
        </div>

        {/* RAIL */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Every buy-side capability · one subscription</div>
            <h2 className="h-sect-h__t">What Yulia does for a buyer. <em>All of it.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="caps">
          {[
            { ico: '⌕', t: 'Target radar',         s: 'Thesis-ranked screens against live private-company data.',       meta: 'Live' },
            { ico: '◎', t: 'The Rundown',          s: '90-second scoring on 7 dimensions. Pursue or pass.',              meta: 'Try' },
            { ico: '◨', t: 'Capital-stack modeler', s: 'SBA SOP 50 10 8 compliant structures, auto-generated.',           meta: 'Try' },
            { ico: '◷', t: 'DSCR stress test',     s: '6 scenarios that actually kill deals, one chart.',                 meta: 'Preview' },
            { ico: '▤', t: 'IC memo',              s: '5-page investment memo drafted from the Rundown + model.',         meta: 'Live' },
            { ico: '▦', t: 'QoE Lite',             s: 'Pre-LOI quality-of-earnings analysis in 30 minutes.',              meta: 'Live' },
            { ico: '⇌', t: 'LOI / APA drafting',   s: 'Attorney-ready offer documents from your deal context.',           meta: 'Live' },
            { ico: '◫', t: 'DD checklist',         s: '147 items generated from the specific deal.',                       meta: 'Preview' },
            { ico: '⎙', t: 'Data room',            s: 'Virtual data room with buyer-side Q&A and audit log.',              meta: 'Live' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>Buy-side</span><span>{c.meta}</span></div>
            </div>
          ))}
        </div>

        {/* CLAIM */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The economics</div>
            <h2 className="h-claim__h">$34K per dead deal. <em>Or a flat subscription.</em></h2>
            <p className="h-claim__p">
              The buy-side funnel hasn't changed in two decades. 3,000 opportunities to get to one close. Eighteen months of burn. $34K in busted diligence on deals that should have died before the first call. Yulia kills the 78% that would never close anyway — before you spend a dollar.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: '18mo search-fund burn',         w: '100%', v: '$400–600K', tone: 'big' },
              { l: 'Busted diligence (3 dead DDs)', w: '34%',  v: '$102K',     tone: 'big' },
              { l: 'Legal + broker fees',           w: '22%',  v: '$75K',      tone: 'big' },
              { l: 'smbx.ai · Pro',                 w: '4%',   v: '$199 / mo', tone: 'small' },
            ].map((r) => (
              <div key={r.l} className="h-claim__row" data-tone={r.tone}>
                <span className="h-claim__row-l">{r.l}</span>
                <span className="h-claim__row-bar"><span className="h-claim__row-fill" style={{ ['--w' as string]: r.w } as React.CSSProperties} /></span>
                <span className="h-claim__row-v">{r.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST */}
        <div className="h-trust" id="trust">
          <div className="h-trust__k">Under NDA by default</div>
          <div className="h-trust__list">
            <span>SOC 2 Type II</span>
            <span>Single-tenant inference</span>
            <span>No training on your data</span>
            <span>Seller-masked models</span>
            <span>Row-level audit log</span>
          </div>
        </div>

        {/* CTA */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · No card</div>
          <h2 className="h-cta__h">Paste a deal. <em>Get a Rundown in 90 seconds.</em></h2>
          <p className="h-cta__s">
            URL, teaser, or one-line description. Yulia returns a scored Rundown, a compliant capital stack, and a stress matrix. The first 3 deals you screen on smbx.ai are free. No card.
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
            <span>90-second Rundown</span>
            <span>First 3 free</span>
            <span>No card</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RundownCalculator — live deal scoring. Paste a description or pick
   a sample, watch 7 dimensions animate in sequentially, see the
   PURSUE / DEEPER LOOK / PASS verdict.
   ═══════════════════════════════════════════════════════════════════ */
function RundownCalculator() {
  const [input, setInput] = useState('');
  const [scores, setScores] = useState<Record<DimKey, number> | null>(null);
  const [revealIdx, setRevealIdx] = useState(0);

  useEffect(() => {
    if (!scores) return;
    if (revealIdx >= RD_KEYS.length) return;
    const t = window.setTimeout(() => setRevealIdx((i) => i + 1), 220);
    return () => window.clearTimeout(t);
  }, [scores, revealIdx]);

  const runScore = (text: string) => {
    const s = text.trim();
    if (s.length < 10) return;
    setScores(scoreDealText(s));
    setRevealIdx(0);
  };
  const reset = () => { setInput(''); setScores(null); setRevealIdx(0); };

  const total = scores
    ? Math.round(RD_KEYS.reduce((sum, k) => sum + scores[k], 0) / RD_KEYS.length * 10)
    : 0;
  const verdict = total >= 70
    ? { label: 'PURSUE', color: '#22A755' }
    : total >= 40
      ? { label: 'DEEPER LOOK', color: '#E8A033' }
      : { label: 'PASS', color: '#D44A78' };

  return (
    <div className="h-try h-anim" id="try">
      <div className="h-try__head">
        <span className="h-try__k">Try it live</span>
        <span className="h-try__tag">90 sec · 7 dims</span>
      </div>
      <h3 className="h-try__t">The Rundown. <em>Live deal calculator.</em></h3>
      <p className="h-try__s">Paste a listing URL, drop a teaser, or type a description. Yulia scores 7 dimensions in 90 seconds and tells you pursue, deeper look, or pass.</p>

      <div className="h-try__body">
        {!scores ? (
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="Paste a deal URL, teaser summary, or type a description — industry, revenue, EBITDA, owner dynamics…"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 12,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 13.5,
                lineHeight: 1.5,
                resize: 'vertical',
                background: '#fff',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={input.trim().length < 10}
                onClick={() => runScore(input)}
                style={{
                  background: input.trim().length >= 10 ? '#0A0A0B' : '#D8D8DA',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '10px 18px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: input.trim().length >= 10 ? 'pointer' : 'not-allowed',
                }}
              >Score the deal →</button>
              <span style={{ fontSize: 11.5, color: '#6B6B70' }}>Or try a sample:</span>
              {SAMPLE_DEALS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setInput(d); runScore(d); }}
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 999,
                    padding: '5px 11px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#3A3A3E',
                    cursor: 'pointer',
                  }}
                >Sample {i + 1}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ width: 140, height: 140, position: 'relative' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="9" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={revealIdx >= RD_KEYS.length ? verdict.color : '#0A0A0B'} strokeWidth="9"
                    strokeLinecap="round" strokeDasharray="263.9"
                    strokeDashoffset={263.9 - 263.9 * (revealIdx >= RD_KEYS.length ? total : Math.round((revealIdx / RD_KEYS.length) * total)) / 100}
                    style={{ transition: 'stroke-dashoffset 380ms, stroke 200ms' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Sora, sans-serif', fontWeight: 800,
                  fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {revealIdx >= RD_KEYS.length ? total : Math.round((revealIdx / RD_KEYS.length) * total)}
                </div>
              </div>
              <div style={{
                textAlign: 'center', marginTop: 10,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: revealIdx >= RD_KEYS.length ? verdict.color : '#9A9A9F',
                transition: 'color 200ms',
              }}>
                {revealIdx >= RD_KEYS.length ? verdict.label : 'Scoring…'}
              </div>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {RD_KEYS.map((k, i) => {
                const revealed = i < revealIdx;
                const v = scores[k];
                const pct = (v / 10) * 100;
                const tone = v >= 7.5 ? '#22A755' : v >= 5.5 ? '#E8A033' : '#D44A78';
                return (
                  <div key={k} style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 1fr 40px',
                    gap: 12,
                    alignItems: 'center',
                    fontSize: 12.5,
                    opacity: revealed ? 1 : 0.3,
                    transform: revealed ? 'translateX(0)' : 'translateX(-8px)',
                    transition: 'opacity 260ms, transform 260ms',
                  }}>
                    <div style={{ fontWeight: 600 }}>{RD_LABELS[k]}</div>
                    <div style={{ position: 'relative', height: 14, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: revealed ? `${pct}%` : '0%',
                        background: tone,
                        borderRadius: 3,
                        transition: 'width 380ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }} />
                    </div>
                    <div style={{
                      fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                      textAlign: 'right', color: revealed ? tone : '#9A9A9F',
                    }}>{revealed ? v.toFixed(1) : '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {scores && revealIdx >= RD_KEYS.length && (
          <div style={{
            marginTop: 18, padding: '14px 18px',
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 12,
            fontSize: 12.5, lineHeight: 1.55, color: '#3A3A3E',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
          }}>
            <div>
              <strong style={{ color: '#0A0A0B' }}>Total {total}/100 · {verdict.label}.</strong> This is a preview score. Yulia's full Rundown writes the deal memo, models the SBA-compliant capital stack, and flags every risk specific to this deal.
            </div>
            <button
              type="button" onClick={reset}
              style={{
                background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 999, padding: '7px 14px',
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 12,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >Try another →</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BuyerVoiceToggle — segmented persona switch at the top of the hero.
   Buy serves two distinct audiences with different capital structures:
   searchers (SBA stack) and capital sponsors (debt + equity + rollover).
   ══════════════════════════════════════════════════════════════════════ */
function BuyerVoiceToggle({ voice, onChange }: { voice: BuyerVoice; onChange: (v: BuyerVoice) => void }) {
  const opts: readonly { id: BuyerVoice; label: string }[] = [
    { id: 'searcher', label: 'Searcher · SBA' },
    { id: 'sponsor',  label: 'Capital sponsor · search fund' },
  ];
  return (
    <div
      role="tablist"
      aria-label="Which buyer are you?"
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        marginBottom: 18,
      }}
    >
      {opts.map(({ id, label }) => {
        const active = id === voice;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(id)}
            style={{
              padding: '8px 14px',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? '#0A0A0B' : 'rgba(255,255,255,0.72)',
              border: 'none',
              borderRadius: 9,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
