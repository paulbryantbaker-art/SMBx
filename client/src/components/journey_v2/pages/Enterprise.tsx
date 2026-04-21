/**
 * Enterprise.tsx — rebuilt on handoff v4 `.h-*` vocabulary.
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

export default function Enterprise({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', team: '', goals: '' });

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

  const canSubmit = form.name && form.company && form.email && form.team;

  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="smbx.ai / enterprise"
      canvasTitle="Enterprise"
      canvasBadge="For firms · SSO · SOC 2"
      chat={{
        title: 'Yulia',
        status: 'For teams + firms',
        pswLogo: 'Y',
        pswName: 'Yulia',
        pswMeta: 'ENTERPRISE',
        script: {},
        opening: "Hi — I'm <strong>Yulia</strong>. Tell me about your firm and I'll show you how teams like yours are using smbx at scale — and what it would cost specifically for your team.",
        reply: "Three things: <strong>firm type</strong>, <strong>team size</strong>, <strong>deals per year</strong>. I'll model your specific ROI before anyone books a call.",
        chips: [] as const,
        placeholder: 'Firm type, team size, deals per year…',
        onSend,
        suggested: {
          kicker: 'Next',
          label: 'See the 4 firm shapes',
          onClick: () => document.getElementById('usecases')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
      }}
    >
      <div id="enterprise" className="h-page" data-density="comfortable" data-motion="full" data-hero="shell" ref={rootRef}>

        {/* HERO */}
        <section className="h-today h-anim" id="hero">
          <div className="h-today__inner">
            <div className="h-today__copy">
              <div className="h-today__meta">
                Enterprise
                <span className="h-today__meta-tag">For firms</span>
              </div>
              <h1 className="h-today__h">DealCloud for a team that <em>isn't 30 people.</em></h1>
              <p className="h-today__sub">
                For corp dev at serial acquirers below Fortune 500, multi-family offices direct-investing, and mid-market advisory firms. Shared deal vault. Team workspace. SSO, audit trails, SOC 2 controls. Single-tenant option. <strong>Enterprise infrastructure at 10× below category.</strong> Starts at $2,500/month.
              </p>
              <div className="h-today__cta">
                <button className="h-today__btn" type="button" onClick={() => seedChat('Model Enterprise ROI for my firm.')}>
                  Book a demo
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button className="h-today__btn h-today__btn--ghost" type="button" onClick={() => onNavigate('pricing')}>See pricing</button>
              </div>
            </div>
            <div className="h-today__demo">
              <div className="h-today__demo-k">Yulia · ROI · 20-person LMM PE fund</div>
              <div className="h-today__demo-bubble h-today__demo-bubble--me">How does Enterprise compare to our existing stack?</div>
              <div className="h-today__demo-bubble">
                Your DealCloud + Sourcescrub + Datasite + Rogo + portfolio-monitoring tools stack runs <strong>$309K/yr</strong>. Enterprise consolidates 4 of those 5 into one subscription. Net <strong>$189K saved</strong> + deal capacity +50–100%.
              </div>
              <div className="h-today__demo-out">
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">$189<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>K</span></div>
                  <div className="h-today__demo-out-l">Typical annual savings</div>
                </div>
                <div className="h-today__demo-out-c">
                  <div className="h-today__demo-out-v">+50–100<span style={{ fontSize: '60%', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>%</span></div>
                  <div className="h-today__demo-out-l">Deal capacity, same team</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Four firm shapes</div>
            <h2 className="h-sect-h__t">How firms use smbx. <em>Today.</em></h2>
          </div>
        </div>

        <div className="h-apps" id="usecases">
          {[
            {
              n: '01 · Lower-middle-market PE', title: '3× the screening volume without adding headcount.',
              foot: 'Replaces $40K–$120K/yr in DealCloud + sourcing',
              rows: [
                { l: 'Screening volume',   r: '3×',      tone: 'ok' },
                { l: 'Exit readiness',      r: 'Quarterly', tone: 'ok' },
                { l: 'IC memo drafting',    r: '15 min',  tone: 'ok' },
                { l: 'Portfolio monitoring', r: 'Auto',    tone: 'ok' },
              ],
            },
            {
              n: '02 · Boutique M&A advisory', title: 'Every analyst hour becomes an associate hour.',
              foot: 'Deals under $8M EBITDA become profitable again',
              rows: [
                { l: 'CIM turnaround',      r: '4–6wk → 48h', tone: 'ok' },
                { l: 'Valuation turnaround', r: 'Same-day',    tone: 'ok' },
                { l: 'Deals / broker / yr', r: '2×',            tone: 'ok' },
                { l: 'Floor engagement',    r: '$8M EBITDA',   tone: 'ok' },
              ],
            },
            {
              n: '03 · Corp dev · serial acquirers', title: 'Pipeline, thesis, diligence — centralized.',
              foot: 'Deal cadence without the team cost',
              rows: [
                { l: 'Pipeline source',     r: 'Centralized', tone: 'ok' },
                { l: 'Thesis scoring',      r: 'Auto',        tone: 'ok' },
                { l: 'DD coordination',     r: 'Cross-team',  tone: 'ok' },
                { l: 'PMI plans',           r: 'Auto-gen',    tone: 'ok' },
              ],
            },
            {
              n: '04 · Multi-family office', title: 'Direct-investing infrastructure, without overhead.',
              foot: 'Every deal scored against the family thesis',
              rows: [
                { l: 'Deal screening',      r: 'Thesis-fit',  tone: 'ok' },
                { l: 'Co-invest modeling',  r: 'Per-deal',    tone: 'ok' },
                { l: 'Portfolio variance',  r: 'Alerts',      tone: 'warn' },
                { l: 'Family reporting',    r: 'Monthly',     tone: 'ok' },
              ],
            },
          ].map((u, i) => (
            <a
              key={u.n}
              className={`h-app h-anim${i ? ` h-anim-d${Math.min(i, 3)}` : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); seedChat(`I'm at a ${u.n.replace(/^\d+\s·\s/, '').toLowerCase()} — model my ROI.`); }}
            >
              <div className="h-app__art">
                <div className="h-app__art-k">{u.n}</div>
                <h3 className="h-app__art-h">{u.title}</h3>
                <div className="h-app__preview">
                  <div className="h-app__row h-app__row--head"><span>How they use smbx</span><span>—</span></div>
                  {u.rows.map((r) => (
                    <div key={r.l} className="h-app__row">
                      <span className="h-app__row-l">{r.l}</span>
                      <span className={`h-app__row-r h-app__row-r--${r.tone}`}>{r.r}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-app__foot">
                <div className="h-app__foot-l">
                  <div className="h-app__foot-t">Typical outcome</div>
                  <div className="h-app__foot-s">{u.foot}</div>
                </div>
                <button className="h-app__get" type="button">Model</button>
              </div>
            </a>
          ))}
        </div>

        {/* RAIL — infrastructure */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Enterprise infrastructure</div>
            <h2 className="h-sect-h__t">Everything you need for IT and compliance. <em>Built in.</em></h2>
          </div>
        </div>

        <div className="h-rail" id="infra">
          {[
            { ico: '⎙', t: 'Team workspace + vault', s: 'Shared deal vault · role-based permissions · activity feed.',          meta: 'Team+' },
            { ico: '▦', t: 'White-label outputs',    s: 'CIMs · valuations · data rooms branded to your firm.',                 meta: 'Team+' },
            { ico: '⟟', t: 'SSO',                     s: 'Okta · Azure AD · Google Workspace.',                                   meta: 'Enterprise' },
            { ico: '◨', t: 'Single-tenant deployment', s: 'Isolated infrastructure for regulated entities + family offices.',    meta: 'Enterprise' },
            { ico: '◷', t: 'SOC 2 audit trails',      s: 'Complete activity logging · audit-ready out of the box.',               meta: 'Enterprise' },
            { ico: '⇌', t: 'API access',              s: 'Programmatic access to deals · deliverables · workflows.',              meta: 'Enterprise' },
            { ico: '✎', t: 'Named account manager',   s: 'Direct line · QBR · onboarding support.',                                meta: 'Enterprise' },
            { ico: '◎', t: '99.9% SLA',               s: 'Uptime guarantees with defined response times.',                         meta: 'Enterprise' },
            { ico: '◫', t: 'Compliance review',       s: 'Pre-delivery compliance review on every outbound deliverable.',          meta: 'Regulated' },
          ].map((c) => (
            <div key={c.t} className="h-cap">
              <div className="h-cap__ico">{c.ico}</div>
              <div className="h-cap__t">{c.t}</div>
              <div className="h-cap__s">{c.s}</div>
              <div className="h-cap__meta"><span>{c.meta}</span><span>Included</span></div>
            </div>
          ))}
        </div>

        {/* CLAIM */}
        <section className="h-claim h-anim" id="claim">
          <div className="h-claim__l">
            <div className="h-claim__k">The ROI</div>
            <h2 className="h-claim__h">Consolidate 4–6 tools <em>into one subscription.</em></h2>
            <p className="h-claim__p">
              Enterprise firms typically consolidate DealCloud, Sourcescrub, Datasite, Rogo, and portfolio-monitoring stacks into a single smbx subscription. Annual spend drops from $209K–$505K to $30K–$120K — net savings $89K–$385K/yr, before the revenue-side impact of 50–100% more deal capacity.
            </p>
          </div>
          <div className="h-claim__viz">
            {[
              { l: 'DealCloud + Salesforce',      w: '100%', v: '$30–80K',    tone: 'big' },
              { l: 'Datasite / Firmex',           w: '52%',  v: '$15–40K',    tone: 'big' },
              { l: 'Rogo / Hebbia',               w: '68%',  v: '$24–75K',    tone: 'big' },
              { l: 'smbx.ai · Enterprise',        w: '18%',  v: 'From $30K',  tone: 'small' },
            ].map((r) => (
              <div key={r.l} className="h-claim__row" data-tone={r.tone}>
                <span className="h-claim__row-l">{r.l}</span>
                <span className="h-claim__row-bar"><span className="h-claim__row-fill" style={{ ['--w' as string]: r.w } as React.CSSProperties} /></span>
                <span className="h-claim__row-v">{r.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BOOK A DEMO FORM */}
        <div className="h-sect-h">
          <div className="h-sect-h__l">
            <div className="h-sect-h__k">Book a demo</div>
            <h2 className="h-sect-h__t">Tell us what you're building. <em>30-min real demo.</em></h2>
          </div>
        </div>

        <div className="h-anim" id="demo" style={{
          marginTop: 'var(--h-pad)',
          background: 'var(--v4-card)',
          border: '1px solid var(--v4-card-line)',
          borderRadius: 18,
          padding: 28,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {[
            { k: 'name',    label: 'Name',                 type: 'text',  ph: 'Your name' },
            { k: 'company', label: 'Company',              type: 'text',  ph: 'Firm / fund / advisory' },
            { k: 'email',   label: 'Work email',           type: 'email', ph: 'you@firm.com' },
          ].map((f) => (
            <div key={f.k}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--v4-mute)', marginBottom: 8 }}>{f.label}</div>
              <input
                type={f.type}
                placeholder={f.ph}
                value={form[f.k as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--v4-bg-2)', border: '1px solid var(--v4-card-line)',
                  borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13,
                }}
              />
            </div>
          ))}
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--v4-mute)', marginBottom: 8 }}>Team size</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {['6–15', '16–50', '51–200', '200+'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, team: s })}
                  style={{
                    padding: '10px 8px',
                    background: form.team === s ? 'var(--v4-ink)' : 'var(--v4-bg-2)',
                    color: form.team === s ? 'var(--v4-on-ink)' : 'var(--v4-ink)',
                    border: 'none', borderRadius: 10,
                    fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--v4-mute)', marginBottom: 8 }}>What are you trying to solve?</div>
            <textarea
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              rows={3}
              placeholder="A few sentences on what you're building and what's broken today…"
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--v4-bg-2)', border: '1px solid var(--v4-card-line)',
                borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, resize: 'vertical',
              }}
            />
          </div>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSend(`Book a demo — ${form.name} · ${form.company} · ${form.team} · ${form.goals || '(no goals)'}`)}
            style={{
              gridColumn: '1 / -1', marginTop: 6,
              padding: '12px 18px',
              background: canSubmit ? 'var(--v4-ink)' : 'var(--v4-bg-2)',
              color: canSubmit ? 'var(--v4-on-ink)' : 'var(--v4-mute)',
              border: 'none', borderRadius: 12,
              fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13.5,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >Book a demo →</button>
        </div>

        {/* TRUST */}
        <div className="h-trust" id="trust">
          <div className="h-trust__k">Security posture</div>
          <div className="h-trust__list">
            <span>SOC 2 Type II</span>
            <span>Single-tenant option</span>
            <span>256-bit encryption at rest + in transit</span>
            <span>Customer-managed keys</span>
            <span>US + EU data residency</span>
          </div>
        </div>

        {/* CTA */}
        <section className="h-cta h-anim" id="cta">
          <div className="h-cta__k">Start · Real demo</div>
          <h2 className="h-cta__h">30 minutes. <em>Real product, real deal.</em></h2>
          <p className="h-cta__s">
            Not a sales pitch. Yulia runs a real deal from your pipeline against the Enterprise feature set. We'll tell you if smbx Enterprise fits — and what it would cost specifically for your team.
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
            <span>30-min real demo</span>
            <span>Custom ROI math</span>
            <span>From $2,500 / mo</span>
          </div>
        </section>

      </div>
    </JourneyShell>
  );
}
