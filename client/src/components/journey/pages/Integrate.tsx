/**
 * Glass Grok · /integrate
 * ─────────────────────────────────────────────────────────────────────
 * Post-close integration journey. Hero → 75% fail stat → 180-day
 * timeline → 3 capability heroes → Day 1 checklist generator → CTA.
 *
 * Spec: Glass Grok/SMBX_SITE_COPY.md (page 5)
 */

import { useMemo, useState } from 'react';
import {
  Page, JourneyHero, Section, H2, Body,
  Card, Timeline, BottomCta,
  type JourneyTab,
} from '../primitives';

interface Props { onSend: (text: string) => void; onStartFree: () => void; onNavigate?: (d: JourneyTab) => void; }

const CHIPS = [
  'Build my Day 1 plan',
  '180-day PMI roadmap',
  'Key employee retention',
  'First 30 days priorities',
] as const;

export default function Integrate({ onSend, onStartFree, onNavigate }: Props) {
  return (
    <Page active="integrate" onNavigate={onNavigate} onStartFree={onStartFree}>
      <JourneyHero
        eyebrow="Just acquired"
        headline="Day 1 after the wire. 180 employees. Do you have a plan?"
        tagline="Yulia builds the 180-day integration plan from your specific deal data \u2014 risks identified, opportunities found, people to protect. Auto-generated before the wire hits. Executed one day at a time."
        chatPlaceholder="Tell Yulia about the business you just acquired\u2026"
        chips={CHIPS}
        onSend={onSend}
        onChip={onSend}
      />

      <Section label="The stat">
        <H2>75% of acquisitions fail to achieve their stated synergies.</H2>
        <Body>
          The number comes from Harvard Business Review. Thirty years of research across thousands of deals. The #1 reason, every time: no integration plan.
        </Body>
        <Body>Not a bad plan. <strong style={{ color: 'var(--gg-text-primary)' }}>No plan.</strong></Body>
        <Body>
          The deal team builds the acquisition thesis, runs diligence, negotiates the price, closes the transaction &mdash; and then hands the business to an operator who starts from a blank page on Day 1. Key employees leave. Customers go silent. The quick wins identified during DD never get captured. By month six, the synergy assumptions that justified the purchase price look like fantasies.
        </Body>
        <Body>
          Every one of those failures was preventable with a plan built from the intelligence the deal team already had.
        </Body>
        <Body>Yulia builds that plan. Before the wire hits.</Body>
      </Section>

      {/* ─── 180-day timeline ──────────────────────────────────────── */}
      <Section variant="tint" label="The 180-day timeline">
        <H2>Every deal gets a plan. Calibrated to your specific acquisition.</H2>
        <div style={{ marginBottom: 28 }} />
        <Timeline
          phases={[
            { label: 'Day 0 \u2014 Before the wire',
              body: 'IT security protocol. Credential rotation across the top 50 systems. Insurance verification. Legal entity structure confirmed. First communication scripted for every stakeholder group.',
              deliverables: 'Day 0 checklist (62 items typical) \u00b7 Employee retention list from DD \u00b7 Customer outreach priority ranking \u00b7 Vendor review order \u00b7 Communication templates' },
            { label: 'Day 30 \u2014 Stabilization',
              body: 'Every key employee individually contacted. Every top customer reached. Vendor contracts reviewed. Operational baseline established. Quick wins from DD findings prioritized.',
              deliverables: 'Stabilization scorecard \u00b7 Retention status dashboard \u00b7 Customer health check \u00b7 Cash position \u00b7 First 10 decisions ranked' },
            { label: 'Day 90 \u2014 Assessment',
              body: 'Performance against deal model. Variance analysis on every assumption. Thesis confirmation or adjustment. Operational improvements implemented from DD recommendations. Team structure decisions.',
              deliverables: '90-day report \u00b7 Thesis vs reality analysis \u00b7 Operational improvement tracker \u00b7 Team restructure plan (if needed) \u00b7 Strategic priority reset' },
            { label: 'Day 180 \u2014 Optimization',
              body: 'Growth initiatives launched. Add-on targets identified. Platform thesis execution. Performance trajectory confirmed. Full operational control.',
              deliverables: 'Growth initiative plan \u00b7 Add-on screening \u00b7 Long-term strategic plan \u00b7 Board package \u00b7 Year-end outlook' },
          ]}
        />
      </Section>

      {/* ─── Hero 1: The PMI plan ──────────────────────────────────── */}
      <Section label="Hero 1 \u00b7 The PMI plan">
        <H2>Your integration plan, generated from your deal data.</H2>
        <Body>
          Most integration plans are generic templates. Acquisition guide from a consulting firm. The &ldquo;first 100 days playbook&rdquo; that assumes every acquisition is the same acquisition.
        </Body>
        <Body>
          Your acquisition isn\u2019t every acquisition. You did six months of diligence. You know which customers are at risk, which employees are critical, which processes need to be fixed, which systems are held together with spreadsheets, which revenue streams depend on the seller.
        </Body>
        <Body>
          Yulia uses all of that. The DD findings become the 180-day workplan. The risks identified become the Day 1 priorities. The opportunities found become the Day 30&ndash;90 quick wins. The strategic thesis becomes the Day 90&ndash;180 roadmap.
        </Body>
        <Body>Every item with an owner, a deadline, and a success metric. Generated in 15 minutes. Executed one day at a time.</Body>
      </Section>

      {/* ─── Hero 2: Key employee retention ────────────────────────── */}
      <Section variant="tint" label="Hero 2 \u00b7 Key employee retention">
        <H2>The four people who can\u2019t leave in the first 90 days.</H2>
        <Body>
          Every business has them. The operations manager who holds the processes in her head. The salesperson with the top-five customer relationships. The tech lead who wrote half the systems. The finance person who reconciles accounts nobody else understands.
        </Body>
        <Body>Yulia identified them during diligence. On Day 1, they get a plan.</Body>
        <Body>
          Individual retention conversations in week one. Compensation review where warranted. Role clarity through the transition. Direct line to the new owner. A reason to stay that isn\u2019t just &ldquo;we need you.&rdquo;
        </Body>
        <Body>
          Retention rates on key employees where this gets done: <strong style={{ color: 'var(--gg-text-primary)' }}>95&ndash;100%</strong> at Day 90. Retention rates where it doesn\u2019t: 40&ndash;60%. Losing one of these people in month one can cost you more than the delta in the purchase price.
        </Body>
      </Section>

      {/* ─── Hero 3: Value creation tracking ───────────────────────── */}
      <Section label="Hero 3 \u00b7 Value creation tracking">
        <H2>You paid for a thesis. Is it working?</H2>
        <Body>
          Every acquisition has a thesis. Operational improvements worth $500K. Customer diversification that reduces risk. Geographic expansion into two adjacent markets. Margin improvement from pricing discipline.
        </Body>
        <Body>Most operators never systematically track whether the thesis is working.</Body>
        <Body>
          Yulia tracks it. Every thesis assumption becomes a measurable KPI. Monthly progress vs projection. Variance analysis. Early warning on the things that are drifting. Course correction before it shows up in the P&amp;L six months later.
        </Body>
        <Body>
          Your board package writes itself. Your LP update reflects reality. The operational discipline that creates value at PE-backed companies now runs on your Monday morning.
        </Body>
      </Section>

      {/* ─── Interactive: Day 1 checklist generator ────────────────── */}
      <Section variant="tint" label="Day 1 generator">
        <Day1ChecklistGenerator onSend={onSend} />
      </Section>

      <BottomCta
        heading="You closed the deal. Now the work begins."
        subhead="Tell Yulia about the business you just bought. She builds the plan from there."
        chatPlaceholder="Industry, employee count, what you\u2019re worried about in the first 90 days\u2026"
        onSend={onSend}
      />
    </Page>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   DAY 1 CHECKLIST GENERATOR — interactive
   5 inputs → Day 1 checklist grouped by category.
   ═════════════════════════════════════════════════════════════════════ */

const INDUSTRY_OPTS = ['Services', 'Manufacturing', 'Healthcare', 'Technology', 'Construction', 'Retail'] as const;
const HEADCOUNT_OPTS = ['<50', '50\u2013200', '200\u2013500', '500+'] as const;
const REVENUE_OPTS = ['<$5M', '$5M\u2013$25M', '$25M\u2013$100M', '$100M+'] as const;
const CUST_REL_OPTS = ['0', '1\u20135', '5\u201320', '20+'] as const;

interface ChecklistItem {
  category: 'IT / Security' | 'People' | 'Customers' | 'Vendors' | 'Operations';
  text: string;
  /* gates — hide item unless all conditions are true */
  ifHeadcountGte?: number;
  ifCustRelGte?: number;
  ifMigration?: boolean;
}

const BASE_ITEMS: ChecklistItem[] = [
  /* IT / Security — day 0 is about locking down access */
  { category: 'IT / Security', text: 'Rotate admin credentials across top 50 systems (identity, finance, CRM, email, cloud, VPN)' },
  { category: 'IT / Security', text: 'Disable shared logins; audit MFA coverage on privileged accounts' },
  { category: 'IT / Security', text: 'Inventory SaaS subscriptions and ownership contacts' },
  { category: 'IT / Security', text: 'Run a backup drill on primary data stores; confirm restore works' },
  { category: 'IT / Security', text: 'Migrate DNS + email control to new ownership', ifMigration: true },
  { category: 'IT / Security', text: 'Document systems with no MFA or with shared credentials flagged for remediation' },
  /* People */
  { category: 'People',       text: 'Individual retention call with each of the top 4 critical employees (this week)' },
  { category: 'People',       text: 'All-hands introduction from new ownership within 48 hours' },
  { category: 'People',       text: 'Confirm payroll runs on the next cycle without interruption' },
  { category: 'People',       text: 'Review comp plans for sales and management leadership' },
  { category: 'People',       text: 'Manager-by-manager 1:1 within first 14 days', ifHeadcountGte: 50 },
  { category: 'People',       text: 'HR systems audit: PTO accruals, benefits, I-9s, e-Verify status', ifHeadcountGte: 50 },
  { category: 'People',       text: 'Union / CBA review (if applicable)', ifHeadcountGte: 200 },
  /* Customers */
  { category: 'Customers',    text: 'Owner personally calls top 10 customers within first 10 days' },
  { category: 'Customers',    text: 'Review revenue concentration; flag any customer > 15% of revenue' },
  { category: 'Customers',    text: 'Transition plan for any seller-held customer relationships', ifCustRelGte: 5 },
  { category: 'Customers',    text: 'Customer-facing communication: continuity messaging in writing' },
  /* Vendors */
  { category: 'Vendors',      text: 'Notify key vendors of ownership change; confirm contract assignments' },
  { category: 'Vendors',      text: 'Insurance: confirm all policies binder through close date + extension' },
  { category: 'Vendors',      text: 'Banking: open new operating account; transfer balances; reissue checks' },
  { category: 'Vendors',      text: 'Lender / SBA notification if applicable' },
  /* Operations */
  { category: 'Operations',   text: 'Establish cash position: 13-week cash forecast through Day 90' },
  { category: 'Operations',   text: 'Confirm working capital peg settlement and post-close true-up schedule' },
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
    for (const item of items) {
      (g[item.category] ||= []).push(item);
    }
    return g;
  }, [items]);

  const sendToYulia = () => {
    onSend(`Generate my full Day 1 plan. ${industry}, ${HEADCOUNT_OPTS[headcountIdx]} employees, ${REVENUE_OPTS[revenueIdx]} revenue, ${CUST_REL_OPTS[custRelIdx]} customer relationships held by seller${migration ? ', systems migration required' : ''}.`);
  };

  return (
    <>
      <H2>Generate your Day 1 checklist right now.</H2>
      <Body lead style={{ marginBottom: 28 }}>
        Five questions. 90 seconds. Customized to your acquisition.
      </Body>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720, marginBottom: 32 }}>
        <ChipRow label="Industry" options={INDUSTRY_OPTS as unknown as string[]}
          active={INDUSTRY_OPTS.indexOf(industry as typeof INDUSTRY_OPTS[number])}
          onPick={i => setIndustry(INDUSTRY_OPTS[i])} />
        <ChipRow label="Employee count" options={HEADCOUNT_OPTS as unknown as string[]}
          active={headcountIdx} onPick={setHeadcountIdx} />
        <ChipRow label="Revenue" options={REVENUE_OPTS as unknown as string[]}
          active={revenueIdx} onPick={setRevenueIdx} />
        <ChipRow label="Customer relationships held by seller" options={CUST_REL_OPTS as unknown as string[]}
          active={custRelIdx} onPick={setCustRelIdx} />
        <div>
          <div className="gg-label" style={{ marginBottom: 10 }}>Systems migration required?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className={`gg-chip${migration ? ' active' : ''}`} aria-pressed={migration} onClick={() => setMigration(true)}>Yes</button>
            <button type="button" className={`gg-chip${!migration ? ' active' : ''}`} aria-pressed={!migration} onClick={() => setMigration(false)}>No</button>
          </div>
        </div>
      </div>

      <Card padding={28} style={{ background: 'var(--gg-bg-app)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div className="gg-label">Your Day 1 checklist</div>
          <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 800, fontSize: 28, fontVariantNumeric: 'tabular-nums' }}>{items.length} items</div>
        </div>

        {(Object.keys(grouped) as Array<keyof typeof grouped>).map(cat => (
          <div key={cat as string} style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--gg-display)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gg-text-muted)', marginBottom: 10 }}>
              {cat}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grouped[cat as string].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
                  <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--gg-accent)' }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="gg-body" style={{ marginTop: 20, fontSize: 13, color: 'var(--gg-text-muted)', marginBottom: 16 }}>
          This is a starting point. Your full PMI plan &mdash; 180 days, customized to your specific deal findings &mdash; starts with a conversation.
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
      <div className="gg-label" style={{ marginBottom: 10 }}>{label}</div>
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
