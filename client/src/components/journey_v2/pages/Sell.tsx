/**
 * Sell.tsx — ported from Claude Design handoff v3 (`Sell refined.html`).
 *
 * Structure preserved verbatim per the handoff's §0 contract: same
 * class names (`.sv-*`, `.jc-*`), same DOM shape, same interaction
 * behavior. The stylesheets (handoff_v3/journey-content.css +
 * sell-editorial.css + page-overrides.css) are loaded by JourneyShell.
 *
 * Shell wiring (§4–§6 of handoff README):
 *   - Portfolio switcher → JourneyChat pswName/pswMeta/pswLogo
 *   - Canvas breadcrumb → JourneyShell canvasKicker/canvasTitle/canvasBadge
 *   - Suggested chip     → JourneyChat suggested (click scrolls #s2)
 *   - Composer           → already lives in JourneyChat (has-text toggle)
 *
 * Interactive: the add-back estimator `.jc-est` (§10). First interaction
 * engages the `[data-aff="try"]` card (stops pulse, fades ring).
 */
import { useEffect, useRef, useState } from 'react';
import type { DealTab } from '../deal-room';
import JourneyShell from '../shell/JourneyShell';
/* Sell-page-specific editorial system — .sv-hero, .sv-row, .sv-strip,
   .sv-bignum, .sv-break, .sv-paths, .sv-cta, plus the [data-aff]
   affordance system. Scoped to this page via import. */
import '../handoff_v3/sell-editorial.css';

interface Props {
  active: DealTab;
  onSend: (text: string) => void;
  onStartFree: () => void;
  onNavigate: (d: DealTab) => void;
  onSignIn?: () => void;
}

/* Estimator model per handoff §10 */
const EST_COLS = [
  { k: 'rev', label: 'Annual revenue',    opts: ['$1–5M', '$5–10M', '$10–25M', '$25–50M', '$50M+'] },
  { k: 'ind', label: 'Industry',          opts: ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail', 'Other'] },
  { k: 'own', label: 'Owner role',        opts: ['Full-time operator', 'Part-time', 'Team runs it'] },
] as const;

const REV_BRACKETS: Record<string, [number, number]> = {
  '$1–5M':   [0.35, 0.65],
  '$5–10M':  [0.60, 1.20],
  '$10–25M': [1.10, 2.20],
  '$25–50M': [2.00, 3.80],
  '$50M+':   [3.50, 6.50],
};
const IND_BIAS: Record<string, number> = {
  Services: 1.10, Manufacturing: 1.00, Healthcare: 1.15,
  Technology: 0.90, Construction: 1.05, Retail: 0.95, Other: 1.00,
};
const OWN_BIAS: Record<string, number> = {
  'Full-time operator': 1.25, 'Part-time': 1.05, 'Team runs it': 0.85,
};

export default function Sell({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  /* ── Estimator state ── */
  const [rev, setRev] = useState('');
  const [ind, setInd] = useState('');
  const [own, setOwn] = useState('');
  const [engaged, setEngaged] = useState(false);
  const estCard = useRef<HTMLDivElement>(null);

  const setPick = (k: string, o: string) => {
    if (k === 'rev') setRev(o);
    if (k === 'ind') setInd(o);
    if (k === 'own') setOwn(o);
    if (!engaged) setEngaged(true);
  };

  const hasAll = rev && ind && own;
  let estResult: React.ReactNode = (
    <>Pick all three inputs to see the estimate.</>
  );
  if (hasAll) {
    const rf = REV_BRACKETS[rev];
    const ib = IND_BIAS[ind];
    const ob = OWN_BIAS[own];
    const lo = rf[0] * ib * ob;
    const hi = rf[1] * ib * ob;
    estResult = (
      <>
        <div className="jc-est__resk">Estimated hidden EBITDA</div>
        <div className="jc-est__resv">${lo.toFixed(2)}M<small> — </small>${hi.toFixed(2)}M</div>
        <div className="jc-est__ress">At a 5–6× multiple, that's <strong>${(lo * 5.5).toFixed(1)}M – ${(hi * 5.5).toFixed(1)}M</strong> of enterprise value.</div>
        <div className="jc-est__resn">Industry-pattern estimates — the real number is specific to your financials.</div>
      </>
    );
  }

  /* ── Bignum count-up ── */
  const [bnVal, setBnVal] = useState(0);
  const bnRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = bnRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        let n = 0;
        const tick = () => {
          n += 1;
          setBnVal(Math.min(n, 22));
          if (n < 22) requestAnimationFrame(tick);
        };
        tick();
        io.disconnect();
      });
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── Suggested chip → scroll to estimator (§5) ── */
  const scrollToEstimator = () => {
    const el = document.getElementById('s2');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── CTA pointer → focus composer (§9) ── */
  const pointToChat = () => {
    const input = document.getElementById('chatInput') as HTMLInputElement | null;
    if (!input) return;
    input.focus();
    const card = input.closest('.v4-comp__card') as HTMLElement | null;
    if (card) {
      const prev = card.style.boxShadow;
      card.style.transition = 'box-shadow 320ms, border-color 320ms';
      card.style.boxShadow = '0 0 0 4px rgba(10,10,11,0.14), 0 20px 44px -20px rgba(10,10,11,0.28)';
      window.setTimeout(() => { card.style.boxShadow = prev; }, 900);
    }
  };

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai / sell"
      canvasTitle="Sell a business"
      canvasBadge="Demo · Acme, Inc."
      chat={{
        title: 'Yulia',
        status: 'Sell-side · Acme, Inc.',
        pswLogo: 'A',
        pswName: 'Acme, Inc.',
        pswMeta: 'SELL · $65M · DEMO',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. This walkthrough uses <strong>Acme, Inc.</strong>, a $65M distributor in Phoenix, as the running example. Scroll on the right to see the arc — estimator, add-backs, readiness, CIM, process, close.",
        reply: "Three numbers and I'll return a preliminary range in 30 minutes: <strong>industry</strong>, <strong>revenue</strong>, <strong>reported EBITDA</strong>.",
        chips: ['Start here', 'See add-backs', "What's it worth?", 'Am I ready?'] as const,
        placeholder: 'Ask Yulia anything about your business…',
        onSend,
        suggested: { kicker: 'Suggested', label: 'See the add-backs', onClick: scrollToEstimator },
      }}
    >
      <div className="sell-v2" id="sellv2" data-acc="off" data-density="comfortable" data-motion="subtle">

        {/* ══ HERO ══ */}
        <section className="sv-hero sv-hero--full" id="s1">
          <div className="sv-anim in sv-hero__lede">
            <div className="sv-hero__eye">SELL-SIDE · YULIA</div>
            <h1 className="sv-hero__h">Know what you have. <em>Before anyone else does.</em></h1>
            <p className="sv-hero__sub">
              Yulia finds value hiding in your financials, builds the documents that sell your business, and runs the process that gets you to the closing table — narrated here with <strong>Acme, Inc.</strong>, a $65M distributor in Phoenix.
            </p>
            <div className="sv-hero__cta">
              <button className="sv-hero__btn" type="button" onClick={scrollToEstimator}>
                Start the walkthrough
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button className="sv-hero__btn sv-hero__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
            </div>
          </div>

          {/* Stat row */}
          <div className="sv-hero__stats sv-anim sv-anim-d1 in">
            <div className="sv-hero__metac"><div className="sv-hero__metav">$65.0M</div><div className="sv-hero__metal">Revenue</div></div>
            <div className="sv-hero__metac"><div className="sv-hero__metav">$9.2M <span style={{ color: 'var(--v4-faint)', fontWeight: 400 }}>→</span> $11.0M</div><div className="sv-hero__metal">Reported → Normalized EBITDA</div></div>
            <div className="sv-hero__metac"><div className="sv-hero__metav">7.5×</div><div className="sv-hero__metal">Target multiple</div></div>
            <div className="sv-hero__metac"><div className="sv-hero__metav">$82.5M</div><div className="sv-hero__metal">Target enterprise value</div></div>
          </div>

          {/* Horizontal journey strip */}
          <div className="sv-strip sv-anim sv-anim-d2 in" aria-label="Engagement arc">
            <div className="sv-strip__hd">
              <span className="sv-strip__k">ACME / SELL</span>
              <span className="sv-strip__t">The arc of a sell-side engagement · Acme is on step 02</span>
            </div>
            <ol className="sv-strip__track">
              <li className="sv-strip__step" data-state="done"><span className="sv-strip__n">01</span><span className="sv-strip__name">Estimator</span><span className="sv-strip__dur">Day 0</span></li>
              <li className="sv-strip__step" data-state="active"><span className="sv-strip__n">02</span><span className="sv-strip__name">Add-backs</span><span className="sv-strip__dur">Wk 1</span></li>
              <li className="sv-strip__step"><span className="sv-strip__n">03</span><span className="sv-strip__name">Readiness</span><span className="sv-strip__dur">Wk 2</span></li>
              <li className="sv-strip__step"><span className="sv-strip__n">04</span><span className="sv-strip__name">CIM</span><span className="sv-strip__dur">Wk 3–4</span></li>
              <li className="sv-strip__step"><span className="sv-strip__n">05</span><span className="sv-strip__name">Process</span><span className="sv-strip__dur">Wk 5–9</span></li>
              <li className="sv-strip__step"><span className="sv-strip__n">06</span><span className="sv-strip__name">Close</span><span className="sv-strip__dur">Wk 10–14</span></li>
            </ol>
          </div>
        </section>

        {/* ══ ROW 1 · Estimator ══ */}
        <section className="sv-row" id="s2">
          <div className="sv-row__text sv-anim">
            <div className="sv-row__eye"><span className="sv-row__eye__n">01</span>Estimator</div>
            <h2 className="sv-row__h">How much value is <em>hiding in your financials?</em></h2>
            <p className="sv-row__p">Reported EBITDA and real EBITDA are almost never the same number. Your accountant minimizes taxes. A buyer maximizes the price their lender will justify. Three inputs, and Yulia estimates the gap on your business.</p>
            <div className="sv-row__stat">
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">30 min</div><div className="sv-row__stat-l">First estimate</div></div>
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">$0</div><div className="sv-row__stat-l">No card</div></div>
            </div>
          </div>
          <div className="sv-anim sv-anim-d2">
            <div
              ref={estCard}
              className={`jc-est${engaged ? ' is-engaged' : ''}`}
              data-aff="try"
              style={{ boxShadow: '0 12px 28px -12px rgba(10,10,11,0.08)' }}
            >
              <div className="jc-est__head">
                <div className="jc-est__title">Add-back estimator</div>
                <div className="jc-est__sub">↳ Try it · 3 inputs</div>
              </div>
              <div className="jc-est__grid">
                {EST_COLS.map((col) => {
                  const value = col.k === 'rev' ? rev : col.k === 'ind' ? ind : own;
                  return (
                    <div key={col.k} className="jc-est__col">
                      <div>{col.label}</div>
                      <div className="jc-est__options">
                        {col.opts.map((o) => (
                          <button
                            key={o}
                            type="button"
                            className={`jc-est__opt${value === o ? ' active' : ''}`}
                            onClick={() => setPick(col.k, o)}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={`jc-est__result${hasAll ? '' : ' empty'}`}>{estResult}</div>
            </div>
          </div>
        </section>

        {/* ══ ROW 2 · Add-backs ══ */}
        <section className="sv-row sv-row--reverse" id="s3">
          <div className="sv-row__text sv-anim">
            <div className="sv-row__eye"><span className="sv-row__eye__n">02</span>Add-backs · Acme</div>
            <h2 className="sv-row__h">The money hiding in <em>a set of tax returns.</em></h2>
            <p className="sv-row__p">Yulia reads three years of tax returns + detailed P&amp;L in minutes. Six defensible add-backs on Acme — every one IRS-documented. <strong>20% more EBITDA than the CPA reports</strong>. At 7.5× that's $13.5M of enterprise value.</p>
            <div className="sv-row__stat">
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">+$1.80M</div><div className="sv-row__stat-l">Defensible add-backs</div></div>
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">~96%</div><div className="sv-row__stat-l">Big-4 concordance</div></div>
            </div>
          </div>
          <div className="sv-anim sv-anim-d2">
            <div className="jc-card" data-aff="preview">
              <div className="jc-card__head">
                <div className="jc-card__title">Add-back schedule · Acme</div>
                <div className="jc-card__meta jc-card__meta--chip">Example · 6 items · $1.80M</div>
              </div>
              <div className="jc-card__body jc-card__body--flush">
                <div className="jc-table">
                  {[
                    { t: 'Real-estate above-market lease', s: 'Phoenix HQ · family trust · CBRE comps',       amt: '+$420K' },
                    { t: 'Discontinued Nevada branch',      s: 'Closed Q3 2024 · overhead still in run-rate', amt: '+$640K' },
                    { t: 'Legal reserve',                   s: 'One-time litigation · settled 2024',           amt: '+$310K' },
                    { t: 'Family on payroll',               s: 'Two siblings · non-operating roles',           amt: '+$180K' },
                    { t: 'Owner comp above market',         s: '$420K vs. $265K market (BLS)',                 amt: '+$155K' },
                    { t: 'Discretionary travel + events',   s: 'Suites, retreats, club dues',                  amt: '+$95K' },
                  ].map((r) => (
                    <div key={r.t} className="jc-row">
                      <div>
                        <div className="jc-row__t">{r.t}</div>
                        <div className="jc-row__s">{r.s}</div>
                      </div>
                      <div className="jc-row__amt">{r.amt}</div>
                    </div>
                  ))}
                  <div className="jc-row jc-row--total">
                    <div><div className="jc-row__t">Defensible total</div></div>
                    <div className="jc-row__amt">+$1.80M</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ BIG NUMBER ══ */}
        <section className="sv-bignum sv-anim" id="bignum" ref={bnRef}>
          <div>
            <div className="sv-bignum__k">ON IDENTICAL FINANCIALS</div>
            <h3 className="sv-bignum__t">Same diligence pack. Two narratives. <em>A $22M spread.</em></h3>
            <p className="sv-bignum__s">"Distributor for sale" trades at 6×. "Southwest anchor for national consolidation" trades at 8×. On Acme's $11M EBITDA, that's the difference between $66M and $88M. The narrative is the work — Yulia writes it.</p>
          </div>
          <div className="sv-bignum__v">
            <span>${bnVal}</span><small>M</small>
          </div>
        </section>

        {/* ══ ROW 3 · Readiness ══ */}
        <section className="sv-row" id="s4">
          <div className="sv-row__text sv-anim">
            <div className="sv-row__eye"><span className="sv-row__eye__n">03</span>Readiness</div>
            <h2 className="sv-row__h">Your business, scored <em>through a buyer's lens.</em></h2>
            <p className="sv-row__p">Seventeen dimensions — the same checklist a PE associate runs in their first weekend on the file. Acme lands at <strong>74/100</strong>. Strong on financial integrity and revenue quality; two fixable yellows on owner dependency and customer concentration — worth 0.5–0.75× on pack.</p>
            <div className="sv-row__stat">
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">17</div><div className="sv-row__stat-l">Dimensions</div></div>
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">0.5–0.75×</div><div className="sv-row__stat-l">Multiple lift on pack</div></div>
            </div>
          </div>
          <div className="sv-anim sv-anim-d2">
            <div className="jc-card" data-aff="preview">
              <div className="jc-card__head">
                <div className="jc-card__title">Readiness · Acme</div>
                <div className="jc-card__meta jc-card__meta--chip">Example · 17 dims · 7 shown</div>
              </div>
              <div className="jc-card__body jc-card__body--flush">
                <div className="jc-readiness">
                  <div className="jc-donut">
                    <svg viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="#EEEEEB" strokeWidth="14" />
                      <circle cx="100" cy="100" r="90" fill="none" stroke="#0A0A0B" strokeWidth="14" strokeLinecap="round" strokeDasharray="565.5" strokeDashoffset="147" className="sv-donut-stroke" />
                    </svg>
                    <div className="jc-donut__inner">
                      <div className="jc-donut__v">74</div>
                      <div className="jc-donut__max">/ 100</div>
                    </div>
                  </div>
                  <div>
                    {[
                      { dot: 'ok',   l: 'Financial integrity', w: '91%', v: '9.1' },
                      { dot: 'ok',   l: 'Revenue quality',     w: '86%', v: '8.6' },
                      { dot: 'ok',   l: 'Scalability',         w: '80%', v: '8.0' },
                      { dot: 'ok',   l: 'Margins',             w: '79%', v: '7.9' },
                      { dot: 'ok',   l: 'Management depth',    w: '74%', v: '7.4' },
                      { dot: 'warn', l: 'Concentration',       w: '60%', v: '6.0' },
                      { dot: 'warn', l: 'Owner dependency',    w: '54%', v: '5.4' },
                    ].map((d) => (
                      <div key={d.l} className="jc-dim">
                        <span className={`jc-dim__dot jc-dim__dot--${d.dot}`} />
                        <span className="jc-dim__l">{d.l}</span>
                        <div className="jc-dim__bar" style={{ ['--w' as string]: d.w } as React.CSSProperties} />
                        <span className="jc-dim__v">{d.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ BREAKER ══ */}
        <section className="sv-break sv-anim">
          <div className="sv-break__eye">THE PROCESS</div>
          <h2 className="sv-break__t">One buyer gives you a price. <em>Five give you a market.</em></h2>
        </section>

        {/* ══ ROW 4 · CIM ══ */}
        <section className="sv-row sv-row--reverse" id="s5">
          <div className="sv-row__text sv-anim">
            <div className="sv-row__eye"><span className="sv-row__eye__n">04</span>The CIM</div>
            <h2 className="sv-row__h">A 32-page document that <em>moves the multiple.</em></h2>
            <p className="sv-row__p">Your business deserves better than a data dump. Yulia drafts a narrative — operating history, discipline mix, platform thesis — then runs it against comps to defend the number. On Acme: positioned not as "a distributor" but as "the Southwest anchor asset."</p>
            <div className="sv-row__stat">
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">32 pages</div><div className="sv-row__stat-l">Full diligence pack</div></div>
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">3–5 days</div><div className="sv-row__stat-l">First draft to you</div></div>
            </div>
          </div>
          <div className="sv-anim sv-anim-d2">
            <div className="jc-card" data-aff="preview">
              <div className="jc-card__head">
                <div className="jc-card__title">CIM preview · Acme</div>
                <div className="jc-card__meta jc-card__meta--chip">Example · 32pp · confidential</div>
              </div>
              <div className="jc-card__body jc-card__body--flush">
                <div className="jc-cim">
                  <div className="jc-cim__page">
                    <div className="jc-cim__idx">01 · Executive summary</div>
                    <div className="jc-cim__t">A 38-year multi-discipline Southwest platform, positioned as the anchor asset for national consolidation.</div>
                    <div className="jc-cim__lines">
                      <div className="jc-cim__line" style={{ width: '96%' }} />
                      <div className="jc-cim__line" style={{ width: '88%' }} />
                      <div className="jc-cim__line" style={{ width: '72%' }} />
                      <div className="jc-cim__line" style={{ width: '84%' }} />
                    </div>
                    <div className="jc-cim__kpis">
                      <div><div className="jc-cim__kv">$65.0M</div><div className="jc-cim__kl">Revenue</div></div>
                      <div><div className="jc-cim__kv">$11.0M</div><div className="jc-cim__kl">Adj EBITDA</div></div>
                      <div><div className="jc-cim__kv">17.0%</div><div className="jc-cim__kl">Margin</div></div>
                    </div>
                  </div>
                  <div className="jc-cim__page">
                    <div className="jc-cim__idx">04 · Discipline mix</div>
                    <div className="jc-cim__t">Four disciplines anchor the platform. The mix is the moat.</div>
                    <div style={{ marginTop: 6 }}>
                      {[
                        { l: 'Industrial MRO', p: 38 },
                        { l: 'Hospitality',    p: 24 },
                        { l: 'Healthcare',     p: 19 },
                        { l: 'Construction',   p: 19 },
                      ].map((r, i) => (
                        <div key={r.l} className="jc-mix__row" style={{ gridTemplateColumns: '110px 1fr 36px', fontSize: 11, padding: 0, marginTop: i === 0 ? 0 : 6 }}>
                          <div className="jc-mix__l">{r.l}</div>
                          <div className="jc-mix__bar" style={{ height: 5 }}>
                            <div className="jc-mix__fill" style={{ width: `${r.p}%` }} />
                          </div>
                          <div className="jc-mix__p">{r.p}%</div>
                        </div>
                      ))}
                    </div>
                    <div className="jc-cim__kpis" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <div><div className="jc-cim__kv">400+</div><div className="jc-cim__kl">Active accounts</div></div>
                      <div><div className="jc-cim__kv">62%</div><div className="jc-cim__kl">Recurring</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ ROW 5 · IOIs ══ */}
        <section className="sv-row" id="s6">
          <div className="sv-row__text sv-anim">
            <div className="sv-row__eye"><span className="sv-row__eye__n">05</span>Competitive process</div>
            <h2 className="sv-row__h">Four offers. <em>One market.</em></h2>
            <p className="sv-row__p">Teaser goes to 18 buyers — strategic distributors, PE roll-ups, family offices. Four IOIs come back inside 21 days. The winner in a competitive process typically lands <strong>15–30% above</strong> the first offer. On Acme, that's $12–24M.</p>
            <div className="sv-row__stat">
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">18 → 4</div><div className="sv-row__stat-l">Targeted → IOIs</div></div>
              <div className="sv-row__stat-c"><div className="sv-row__stat-v">21 days</div><div className="sv-row__stat-l">To first round</div></div>
            </div>
          </div>
          <div className="sv-anim sv-anim-d2">
            <div className="jc-card" data-aff="preview">
              <div className="jc-card__head">
                <div className="jc-card__title">IOI comparison · round 1</div>
                <div className="jc-card__meta jc-card__meta--chip">Example · 3 of 4 shown</div>
              </div>
              <div className="jc-card__body jc-card__body--flush">
                <div className="jc-ioi">
                  <div className="jc-ioi__card">
                    <div className="jc-ioi__k"><span>Family office</span></div>
                    <div className="jc-ioi__price">$82M</div>
                    <div className="jc-ioi__terms">100% cash · 45-day close · clean diligence</div>
                  </div>
                  <div className="jc-ioi__card jc-ioi__card--winner">
                    <div className="jc-ioi__k"><span>Strategic</span><span className="jc-ioi__tag">LEAD</span></div>
                    <div className="jc-ioi__price">$91M</div>
                    <div className="jc-ioi__terms">80% cash · 20% rollover · 45-day exclusivity</div>
                  </div>
                  <div className="jc-ioi__card">
                    <div className="jc-ioi__k"><span>PE roll-up</span></div>
                    <div className="jc-ioi__price">$86M</div>
                    <div className="jc-ioi__terms">55% cash · $4M earnout · 75-day diligence</div>
                  </div>
                </div>
              </div>
              <div className="jc-card__foot">
                <strong>Yulia's take.</strong> All three within $4M after tax on headline. But the strategic's 20% rollover at their exit multiple models to another <strong>$14–18M</strong> — total haul $107M vs. $82M all-cash today.
              </div>
            </div>
          </div>
        </section>

        {/* ══ EXIT PATHS ══ */}
        <section className="sv-paths" id="s7">
          <div className="sv-paths__head">
            <div className="sv-row__eye"><span className="sv-row__eye__n">06</span>Exit paths</div>
            <h2 className="sv-row__h" style={{ margin: 0 }}>Selling 100% <em>isn't your only option.</em></h2>
          </div>
          <div className="sv-paths__list">
            {[
              { n: '01', t: 'Full sale.',              b: "Maximum immediate liquidity. Clean break. Best when you're ready to exit entirely.", typ: '100% equity' },
              { n: '02', t: 'Majority + rollover.',    b: 'Cash today, equity retained for a second bite when the business exits again in 3–5 years.', typ: '15–30% rolled' },
              { n: '03', t: 'Minority raise.',          b: 'Growth capital without giving up control. Stay in the operator seat.', typ: '$5–25M' },
              { n: '04', t: 'ESOP.',                    b: '§1042 tax deferral. Stay as chairman. Culture preserved. Multi-year transition.', typ: '70–80% FMV' },
              { n: '05', t: 'Dividend recap.',          b: 'Take debt against the business, pay yourself a dividend. Retain 100% equity.', typ: '$10–50M out' },
              { n: '06', t: 'Partial asset sale.',      b: 'Sell a division, license IP, or sell-leaseback real estate. Unlock value without a full exit.', typ: 'Carve-out' },
            ].map((r) => (
              <div key={r.n} className="sv-paths__row sv-anim">
                <div className="sv-paths__n">{r.n}</div>
                <div className="sv-paths__t">{r.t}</div>
                <div className="sv-paths__b">{r.b}</div>
                <div className="sv-paths__typ">{r.typ}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="sv-cta sv-anim" id="close">
          <div className="sv-cta__eye">START · NO CARD</div>
          <h2 className="sv-cta__h">Tell Yulia about <em>your business.</em></h2>
          <p className="sv-cta__s">Three numbers — industry, revenue, reported EBITDA — and she'll return a preliminary value range, an add-back list, and a readiness score inside 30 minutes. The conversation starts in the chat pane on your left.</p>
          <button className="sv-cta__point" type="button" onClick={pointToChat}>
            <span className="sv-cta__point-ar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            <span>Start in the chat pane</span>
            <span style={{ opacity: 0.55, fontWeight: 500 }}>Yulia is ready</span>
          </button>
          <div className="sv-cta__meta">
            <span>30-min first estimate</span>
            <span>No card</span>
            <span>Under NDA</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}
