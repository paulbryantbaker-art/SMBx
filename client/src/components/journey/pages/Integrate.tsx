/**
 * Glass Grok · /integrate (desktop rebuild)
 * ─────────────────────────────────────────────────────────────────────
 * Post-close PMI page. Hero 2-col with Day 0 checklist preview,
 * horizontal Day 0/30/90/180 timeline, 3 zigzag capability heroes,
 * interactive Day 1 checklist generator, dark bottom CTA.
 *
 * Spec: SMBX_SITE_COPY.md (page 5) + desktop spec.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  Card, BottomCta,
  HorizontalTimeline, SectionNav,
  type JourneyTab,
} from '../primitives';
import { useInView } from '../mockups';

interface Props { onSend: (text: string) => void; onStartFree: () => void; onNavigate?: (d: JourneyTab) => void; }

const CHIPS = [
  'Build my Day 1 plan',
  '180-day PMI roadmap',
  'Key employee retention',
  'First 30 days priorities',
] as const;

const SECNAV = [
  { id: 'the-stat',                          label: 'Stat' },
  { id: 'the-180-day-timeline',              label: 'Timeline' },
  { id: 'hero-1-the-pmi-plan',               label: 'PMI plan' },
  { id: 'hero-2-key-employee-retention',     label: 'Retention' },
  { id: 'hero-3-value-creation-tracking',    label: 'Tracking' },
  { id: 'day-1-generator',                   label: 'Day 1' },
];

export default function Integrate({ onSend, onStartFree, onNavigate }: Props) {
  return (
    <Page active="integrate" onNavigate={onNavigate} onStartFree={onStartFree}>
      <SectionNav items={SECNAV} />
      <JourneyHero
        eyebrow="Post-close \u00b7 for the new operator and the PE team tracking the thesis"
        headline="Day 1 after the wire. 180 employees. Do you have a plan?"
        tagline="Yulia builds the 180-day integration plan from your specific deal data \u2014 risks identified, opportunities found, people to protect. Auto-generated before the wire hits. Executed one day at a time. PE teams track thesis vs. actual monthly."
        chatPlaceholder="Tell Yulia about the business you just acquired…"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
        rightPanel={<Day0ChecklistPreview />}
      />

      {/* The stat */}
      <Section variant="tint" label="The stat">
        <H2>75% of acquisitions fail to achieve their stated synergies.</H2>
        <div className="gg-two-col" style={{ marginTop: 48, alignItems: 'start' }}>
          <div>
            <Body>The number comes from Harvard Business Review. Thirty years of research across thousands of deals. The #1 reason, every time: no integration plan.</Body>
            <Body>Not a bad plan. <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>No plan.</strong></Body>
            <Body>The deal team builds the acquisition thesis, runs diligence, negotiates the price, closes the transaction &mdash; and then hands the business to an operator who starts from a blank page on Day 1. Key employees leave. Customers go silent.</Body>
          </div>
          <div>
            <Body>The quick wins identified during DD never get captured. By month six, the synergy assumptions that justified the purchase price look like fantasies.</Body>
            <Body>Every one of those failures was preventable with a plan built from the intelligence the deal team already had.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>Yulia builds that plan. Before the wire hits.</strong></Body>
          </div>
        </div>
      </Section>

      {/* 180-day timeline */}
      <Section label="The 180-day timeline">
        <H2>Every deal gets a plan. Calibrated to your specific acquisition.</H2>
        <p className="gg-body--sub" style={{ marginBottom: 48 }}>From Day 0 before the wire through Day 180 optimization.</p>
        <HorizontalTimeline phases={[
          { idx: 'Day 0', name: 'Before the wire',
            body: 'IT security protocol. Credential rotation. Insurance verification. Legal entity confirmed. First communication scripted.',
            deliverables: 'Day 0 checklist (62 items) · Retention list · Customer outreach priority · Vendor review · Comms templates' },
          { idx: 'Day 30', name: 'Stabilization',
            body: 'Every key employee contacted. Every top customer reached. Vendor contracts reviewed. Operational baseline established.',
            deliverables: 'Stabilization scorecard · Retention status · Customer health · Cash position · First 10 decisions' },
          { idx: 'Day 90', name: 'Assessment',
            body: 'Performance against deal model. Variance analysis. Thesis confirmation. Operational improvements. Team decisions.',
            deliverables: '90-day report · Thesis vs reality · Improvement tracker · Team restructure plan · Priority reset' },
          { idx: 'Day 180', name: 'Optimization',
            body: 'Growth initiatives launched. Add-on targets identified. Platform thesis execution. Full operational control.',
            deliverables: 'Growth plan · Add-on screening · Long-term plan · Board package · Year-end outlook' },
        ]} />
      </Section>

      {/* Hero 1 PMI plan — 45/55 workplan gets width */}
      <Section variant="tint" label="Hero 1 · The PMI plan">
        <div className="gg-two-col gg-two-col--45-55" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">Your integration plan, generated from your deal data.</H2>
            <Body>Most integration plans are generic templates. Acquisition guides from a consulting firm. The &ldquo;first 100 days playbook&rdquo; that assumes every acquisition is the same acquisition.</Body>
            <Body>Your acquisition isn’t every acquisition. You did six months of diligence. You know which customers are at risk, which employees are critical, which processes need to be fixed, which revenue streams depend on the seller.</Body>
            <Body>Yulia uses all of that. The DD findings become the 180-day workplan. The risks become Day 1 priorities. The opportunities become Day 30–90 quick wins. The strategic thesis becomes the Day 90–180 roadmap.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>Every item with an owner, a deadline, and a success metric.</strong></Body>
          </div>
          <div>
            <DDToWorkplanMock />
          </div>
        </div>
      </Section>

      {/* Hero 2 Key employees — 40/60 tiles left, text right reversed */}
      <Section label="Hero 2 · Key employee retention">
        <div className="gg-two-col gg-two-col--40-60 gg-two-col--reverse" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">The four people who can’t leave in the first 90 days.</H2>
            <Body>Every business has them. The operations manager who holds the processes in her head. The salesperson with the top-five customer relationships. The tech lead who wrote half the systems. The finance person who reconciles accounts nobody else understands.</Body>
            <Body>Yulia identified them during diligence. On Day 1, they get a plan.</Body>
            <Body>Individual retention conversations in week one. Compensation review where warranted. Role clarity through the transition. Direct line to the new owner.</Body>
            <Body>Retention rates where this gets done: <strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>95–100%</strong> at Day 90. Where it doesn’t: 40–60%.</Body>
          </div>
          <div>
            <KeyEmployeesMock />
          </div>
        </div>
      </Section>

      {/* Hero 3 Value creation — 55/45 text, KPI chart tight */}
      <Section variant="tint" label="Hero 3 · Value creation tracking">
        <div className="gg-two-col gg-two-col--55-45" style={{ alignItems: 'center' }}>
          <div>
            <H2 variant="block">You paid for a thesis. Is it working?</H2>
            <Body>Every acquisition has a thesis. Operational improvements worth $500K. Customer diversification that reduces risk. Geographic expansion into two adjacent markets. Margin improvement from pricing discipline.</Body>
            <Body>Most operators never systematically track whether the thesis is working.</Body>
            <Body>Yulia tracks it. Every thesis assumption becomes a measurable KPI. Monthly progress vs projection. Variance analysis. Early warning on things drifting. Course correction before it shows up in the P&amp;L six months later.</Body>
            <Body><strong style={{ color: 'var(--gg-text-primary)', fontWeight: 700 }}>Your board package writes itself.</strong> Your LP update reflects reality.</Body>
          </div>
          <div>
            <KPIVarianceMock />
          </div>
        </div>
      </Section>

      {/* Interactive Day 1 checklist */}
      <Section label="Day 1 generator">
        <Day1ChecklistGenerator onSend={onSend} />
      </Section>

      <BottomCta
        heading="You closed the deal. Now the work begins."
        subhead="Tell Yulia about the business you just bought. She builds the plan from there."
        chatPlaceholder="Industry, employee count, what you’re worried about in the first 90 days…"
        onSend={onSend}
      />
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DAY 0 CHECKLIST PREVIEW — hero rightPanel
   ═════════════════════════════════════════════════════════════════════ */

function Day0ChecklistPreview() {
  const items: { text: string; category: string; done: boolean }[] = [
    { text: 'Rotate admin credentials · top 50 systems', category: 'IT / Security', done: true },
    { text: 'Disable shared logins',                          category: 'IT / Security', done: true },
    { text: 'Retention call · Ops Manager',              category: 'People',        done: true },
    { text: 'Retention call · Sales Lead',               category: 'People',        done: false },
    { text: 'Top 10 customer outreach · in writing',     category: 'Customers',     done: false },
    { text: 'Insurance binder confirmed → +30 days',     category: 'Vendors',       done: true },
    { text: '13-week cash forecast',                          category: 'Operations',    done: false },
  ];
  const [ref, inView] = useInView<HTMLDivElement>();
  /* Self-tick: items marked done in the data self-check in sequence after
     the card enters viewport, as if the plan is being executed live.
     `checkedCount` is what we show in the header — animates from 0 up to
     the real "done" count. */
  const doneTargets = items.map(it => it.done);
  const realDone = doneTargets.filter(Boolean).length;
  const [checkedCount, setCheckedCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setCheckedCount(realDone); return; }
    setCheckedCount(0);
    const timers: number[] = [];
    let cursor = 0;
    items.forEach((it, i) => {
      if (!it.done) return;
      cursor += 1;
      const myIdx = cursor;
      timers.push(window.setTimeout(() => setCheckedCount(myIdx), 500 + i * 260));
    });
    return () => { timers.forEach(clearTimeout); };
  }, [inView, realDone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      className="gg-card"
      style={{
        padding: 28,
        boxShadow: '0 30px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>Day 0 checklist</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums' }}>
          {checkedCount} / 62 items
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, i) => {
          /* Map this item to its tick order: cumulative count of `done` items
             up to and including this index. If checkedCount >= that, show ticked. */
          const tickOrder = items.slice(0, i + 1).filter(x => x.done).length;
          const ticked = it.done && checkedCount >= tickOrder;
          return (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: i === items.length - 1 ? 0 : '0.5px solid var(--gg-border)' }}>
              <div style={{
                width: 14, height: 14, marginTop: 2, borderRadius: 3,
                border: '1.5px solid var(--gg-text-primary)',
                background: ticked ? 'var(--gg-text-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 260ms var(--gg-ease-spring)',
              }}>
                {ticked && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: ticked ? 'var(--gg-text-muted)' : 'var(--gg-text-primary)', textDecoration: ticked ? 'line-through' : 'none', fontWeight: 500, transition: 'color 260ms var(--gg-ease-spring)' }}>{it.text}</div>
                <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 9, color: 'var(--gg-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{it.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DD → WORKPLAN viz
   ═════════════════════════════════════════════════════════════════════ */

function DDToWorkplanMock() {
  const dd: { finding: string; action: string; day: string }[] = [
    { finding: 'Top-3 customers = 47% revenue',    action: 'Diversification sprint',  day: 'Day 30' },
    { finding: 'Ops manager irreplaceable',        action: 'Retention + SOP transfer', day: 'Day 1' },
    { finding: 'Margin leak in service contracts', action: 'Pricing audit + reset',    day: 'Day 60' },
    { finding: 'Tech stack on 2019 stack',         action: 'Upgrade roadmap',          day: 'Day 90' },
  ];
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>DD → Workplan</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auto-mapped</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dd.map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
            <div style={{ padding: '10px 14px', background: 'var(--gg-bg-subtle)', borderRadius: 10, border: '0.5px solid var(--gg-border)' }}>
              <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 9, color: 'var(--gg-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>DD finding</div>
              <div style={{ fontSize: 12, color: 'var(--gg-text-primary)', lineHeight: 1.4, fontWeight: 500 }}>{d.finding}</div>
            </div>
            <div style={{ color: 'var(--gg-text-muted)', fontSize: 14 }}>&rarr;</div>
            <div style={{ padding: '10px 14px', background: 'var(--gg-accent)', color: '#fff', borderRadius: 10, boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.12)' }}>
              <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{d.day}</div>
              <div style={{ fontSize: 12, lineHeight: 1.4, fontWeight: 600 }}>{d.action}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   KEY EMPLOYEES viz
   ═════════════════════════════════════════════════════════════════════ */

function KeyEmployeesMock() {
  const people: { name: string; role: string; risk: 'ready' | 'progress' | 'flag' }[] = [
    { name: 'Maria L.',  role: 'Ops Manager',  risk: 'ready' },
    { name: 'James R.',  role: 'Sales Lead',   risk: 'ready' },
    { name: 'Priya V.',  role: 'Tech Lead',    risk: 'progress' },
    { name: 'Derek S.',  role: 'Finance',      risk: 'flag' },
  ];
  const riskColor = (r: 'ready' | 'progress' | 'flag') =>
    r === 'ready' ? 'var(--gg-dot-ready)' : r === 'progress' ? 'var(--gg-dot-progress)' : 'var(--gg-dot-flag)';
  const riskLabel = (r: 'ready' | 'progress' | 'flag') =>
    r === 'ready' ? 'Locked' : r === 'progress' ? 'In progress' : 'At risk';
  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>4 people · first 90 days</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Retention</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {people.map(p => (
          <div key={p.name} style={{ padding: 16, background: 'var(--gg-bg-subtle)', borderRadius: 10, border: '0.5px solid var(--gg-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #3A3A3E, #0A0A0B)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 12,
              }}>
                {p.name.split(' ').map(s => s[0]).join('')}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, letterSpacing: '-0.005em' }}>{p.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--gg-text-muted)' }}>{p.role}</div>
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 8px', background: '#fff', border: '0.5px solid var(--gg-border)', borderRadius: 999 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor(p.risk) }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--gg-text-secondary)' }}>{riskLabel(p.risk)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   KPI VARIANCE viz — 6 months projection vs actual
   ═════════════════════════════════════════════════════════════════════ */

function KPIVarianceMock() {
  const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  /* Thesis figures baked into the deal model; actuals update monthly as
     ops close the books. Numbers are indexed (M0 = 100) so the chart
     reads as % progress toward thesis rather than raw $ EBITDA. */
  const projected = [100, 105, 110, 115, 120, 125];
  const actual    = [98, 104, 112, 118, 117, 122];
  const max = Math.max(...projected, ...actual);

  type View = 'both' | 'projected' | 'actual';
  const [view, setView] = useState<View>('both');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const show = (layer: 'projected' | 'actual') => view === 'both' || view === layer;
  const variance = actual.map((a, i) => a - projected[i]);
  const cumVar   = variance[variance.length - 1];

  return (
    <Card padding={28} style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>EBITDA &middot; thesis vs actual</div>
        <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10, color: 'var(--gg-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>6 months</div>
      </div>

      {/* Headline variance + view toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--gg-display)', fontWeight: 800,
            fontSize: 26, letterSpacing: '-0.02em',
            color: cumVar >= 0 ? 'var(--gg-dot-ready)' : 'var(--gg-dot-flag)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {cumVar >= 0 ? '+' : ''}{cumVar}
          </span>
          <span style={{ fontSize: 11, color: 'var(--gg-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--gg-display)', fontWeight: 700 }}>
            pts vs thesis
          </span>
        </div>
        <div style={{ display: 'inline-flex', gap: 2, padding: 2, background: 'var(--gg-bg-subtle)', borderRadius: 999, border: '0.5px solid var(--gg-border)' }}>
          {(['both', 'projected', 'actual'] as View[]).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: '5px 12px',
                border: 0,
                borderRadius: 999,
                background: view === v ? 'var(--gg-bg-card)' : 'transparent',
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                fontFamily: 'var(--gg-display)',
                fontWeight: 700, fontSize: 10,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: view === v ? 'var(--gg-text-primary)' : 'var(--gg-text-muted)',
                cursor: 'pointer',
                transition: 'all var(--gg-t-feedback) var(--gg-ease-snap)',
              }}
              aria-pressed={view === v}
            >
              {v === 'both' ? 'Both' : v === 'projected' ? 'Thesis' : 'Actual'}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart with hover tooltip */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140, marginBottom: 12 }}>
          {months.map((m, i) => {
            const vi = variance[i];
            const hovered = hoverIdx === i;
            return (
              <div
                key={m}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  cursor: 'default',
                  transition: 'opacity var(--gg-t-feedback) var(--gg-ease-snap)',
                  opacity: hoverIdx !== null && !hovered ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%' }}>
                  {show('projected') && (
                    <div style={{
                      width: 10,
                      height: `${(projected[i] / max) * 100}%`,
                      background: 'var(--gg-bg-muted)',
                      border: '0.5px solid var(--gg-border)',
                      borderRadius: 2,
                      transition: 'height 320ms var(--gg-ease-spring)',
                    }} />
                  )}
                  {show('actual') && (
                    <div style={{
                      width: 10,
                      height: `${(actual[i] / max) * 100}%`,
                      background: actual[i] >= projected[i] ? 'var(--gg-dot-ready)' : 'var(--gg-dot-progress)',
                      borderRadius: 2,
                      transition: 'height 320ms var(--gg-ease-spring)',
                    }} />
                  )}
                </div>
                <div style={{
                  fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 10,
                  color: hovered ? 'var(--gg-text-primary)' : 'var(--gg-text-muted)',
                  letterSpacing: '0.04em',
                  transition: 'color var(--gg-t-feedback) var(--gg-ease-snap)',
                }}>{m}</div>
                {hovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: `${((i + 0.5) / months.length) * 100}%`,
                    transform: 'translateX(-50%)',
                    padding: '8px 12px',
                    background: 'var(--gg-accent)',
                    color: '#fff',
                    borderRadius: 10,
                    fontFamily: 'var(--gg-display)',
                    fontSize: 11, lineHeight: 1.35,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55, fontWeight: 700, marginBottom: 3 }}>{m}</div>
                    <div>Thesis {projected[i]} &middot; Actual {actual[i]}</div>
                    <div style={{ color: vi >= 0 ? 'var(--gg-dot-ready)' : 'var(--gg-dot-flag)', marginTop: 2 }}>
                      {vi >= 0 ? '+' : ''}{vi} vs thesis
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--gg-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: show('projected') ? 1 : 0.35 }}>
          <span style={{ width: 10, height: 10, background: 'var(--gg-bg-muted)', border: '0.5px solid var(--gg-border)', borderRadius: 2 }} />
          Thesis
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: show('actual') ? 1 : 0.35 }}>
          <span style={{ width: 10, height: 10, background: 'var(--gg-dot-ready)', borderRadius: 2 }} />
          Actual
        </div>
      </div>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DAY 1 CHECKLIST GENERATOR — interactive
   ═════════════════════════════════════════════════════════════════════ */

const INDUSTRY_OPTS = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail'] as const;
const HEADCOUNT_OPTS = ['<50', '50–200', '200–500', '500+'] as const;
const REVENUE_OPTS = ['<$5M', '$5M–$25M', '$25M–$100M', '$100M+'] as const;
const CUST_REL_OPTS = ['0', '1–5', '5–20', '20+'] as const;

interface ChecklistItem {
  category: 'IT / Security' | 'People' | 'Customers' | 'Vendors' | 'Operations';
  text: string;
  ifHeadcountGte?: number;
  ifCustRelGte?: number;
  ifMigration?: boolean;
}

const BASE_ITEMS: ChecklistItem[] = [
  { category: 'IT / Security', text: 'Rotate admin credentials across top 50 systems' },
  { category: 'IT / Security', text: 'Disable shared logins; audit MFA on privileged accounts' },
  { category: 'IT / Security', text: 'Inventory SaaS subscriptions and ownership contacts' },
  { category: 'IT / Security', text: 'Run a backup drill; confirm restore works' },
  { category: 'IT / Security', text: 'Migrate DNS + email control to new ownership', ifMigration: true },
  { category: 'People',       text: 'Individual retention call with each of the top 4 critical employees' },
  { category: 'People',       text: 'All-hands introduction from new ownership within 48 hours' },
  { category: 'People',       text: 'Confirm payroll runs on the next cycle' },
  { category: 'People',       text: 'Manager 1:1 within first 14 days', ifHeadcountGte: 50 },
  { category: 'People',       text: 'HR audit: PTO, benefits, I-9s, e-Verify', ifHeadcountGte: 50 },
  { category: 'People',       text: 'Union / CBA review (if applicable)', ifHeadcountGte: 200 },
  { category: 'Customers',    text: 'Owner personally calls top 10 customers within first 10 days' },
  { category: 'Customers',    text: 'Review revenue concentration; flag any customer > 15% of revenue' },
  { category: 'Customers',    text: 'Transition plan for seller-held customer relationships', ifCustRelGte: 5 },
  { category: 'Customers',    text: 'Customer-facing continuity messaging — in writing' },
  { category: 'Vendors',      text: 'Notify key vendors of ownership change; confirm assignments' },
  { category: 'Vendors',      text: 'Insurance: confirm policies binder through close + extension' },
  { category: 'Vendors',      text: 'Banking: open operating account; transfer balances; reissue checks' },
  { category: 'Vendors',      text: 'Lender / SBA notification if applicable' },
  { category: 'Operations',   text: '13-week cash forecast through Day 90' },
  { category: 'Operations',   text: 'Confirm working capital peg settlement schedule' },
  { category: 'Operations',   text: 'Review outstanding AR > 60 days; set collection priorities' },
  { category: 'Operations',   text: 'Confirm monthly close process; identify gaps from DD' },
  { category: 'Operations',   text: 'QBR calendar set with management for days 30 / 60 / 90 / 180' },
];

function Day1ChecklistGenerator({ onSend }: { onSend: (text: string) => void }) {
  const [industry, setIndustry] = useState<string>('Services');
  const [headcountIdx, setHeadcountIdx] = useState<number>(1);
  const [revenueIdx, setRevenueIdx] = useState<number>(1);
  const [custRelIdx, setCustRelIdx] = useState<number>(1);
  const [migration, setMigration] = useState<boolean>(true);

  const items = useMemo(() => {
    const headcountThresholds = [49, 200, 499, 1000];
    const custRelThresholds = [0, 1, 5, 20];
    const headcountN = headcountThresholds[headcountIdx];
    const custRelN = custRelThresholds[custRelIdx];

    return BASE_ITEMS.filter(item => {
      if (item.ifHeadcountGte !== undefined && headcountN < item.ifHeadcountGte) return false;
      if (item.ifCustRelGte !== undefined   && custRelN   < item.ifCustRelGte)   return false;
      if (item.ifMigration === true && !migration)                               return false;
      return true;
    });
  }, [headcountIdx, custRelIdx, migration]);

  const grouped = useMemo(() => {
    const g: Record<string, ChecklistItem[]> = {};
    for (const item of items) (g[item.category] ||= []).push(item);
    return g;
  }, [items]);

  const sendToYulia = () => {
    onSend(`Generate my full Day 1 plan. ${industry}, ${HEADCOUNT_OPTS[headcountIdx]} employees, ${REVENUE_OPTS[revenueIdx]} revenue, ${CUST_REL_OPTS[custRelIdx]} customer relationships held by seller${migration ? ', systems migration required' : ''}.`);
  };

  return (
    <>
      <H2>Generate your Day 1 checklist right now.</H2>
      <p className="gg-body--sub" style={{ marginBottom: 40 }}>Five questions. 90 seconds. Customized to your acquisition.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 1200, marginBottom: 32 }}>
        <ChipRow label="Industry" options={INDUSTRY_OPTS as unknown as string[]}
          active={INDUSTRY_OPTS.indexOf(industry as typeof INDUSTRY_OPTS[number])}
          onPick={i => setIndustry(INDUSTRY_OPTS[i])} />
        <ChipRow label="Employee count" options={HEADCOUNT_OPTS as unknown as string[]} active={headcountIdx} onPick={setHeadcountIdx} />
        <ChipRow label="Revenue" options={REVENUE_OPTS as unknown as string[]} active={revenueIdx} onPick={setRevenueIdx} />
        <ChipRow label="Customer relationships held by seller" options={CUST_REL_OPTS as unknown as string[]} active={custRelIdx} onPick={setCustRelIdx} />
        <div>
          <div className="gg-input-label" style={{ marginBottom: 12 }}>Systems migration required?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className={`gg-chip${migration ? ' active' : ''}`} aria-pressed={migration} onClick={() => setMigration(true)}>Yes</button>
            <button type="button" className={`gg-chip${!migration ? ' active' : ''}`} aria-pressed={!migration} onClick={() => setMigration(false)}>No</button>
          </div>
        </div>
      </div>

      <Card padding={32}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div className="gg-label">Your Day 1 checklist</div>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 32, fontVariantNumeric: 'tabular-nums' }}>{items.length} items</div>
        </div>

        {(Object.keys(grouped) as Array<keyof typeof grouped>).map(cat => (
          <div key={cat as string} style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gg-text-muted)', marginBottom: 12 }}>
              {cat}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grouped[cat as string].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
                  <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--gg-accent)' }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="gg-body" style={{ marginTop: 20, fontSize: 13, color: 'var(--gg-text-muted)', marginBottom: 16 }}>
          This is a starting point. Your full PMI plan — 180 days, customized to your specific deal findings — starts with a conversation.
        </p>
        <button type="button" className="gg-btn gg-btn--primary" onClick={sendToYulia}>
          Tell Yulia about your acquisition &rarr;
        </button>
      </Card>
    </>
  );
}

function ChipRow({ label, options, active, onPick }: {
  label: string; options: string[]; active: number; onPick: (i: number) => void;
}) {
  return (
    <div>
      <div className="gg-input-label" style={{ marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            className={`gg-chip${i === active ? ' active' : ''}`}
            aria-pressed={i === active}
            onClick={() => onPick(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
