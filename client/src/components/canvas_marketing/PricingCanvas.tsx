/* PricingCanvas.tsx — /pricing page, hybrid tier-cards + comparison table.
 *
 * Mounted by AppShell at /pricing.
 *
 * Pattern (lifted from stripe.com/pricing + linear.app/pricing):
 *   1. Hero
 *   2. Tier cards row — 5 tier cards as visual entry, Pro elevated
 *   3. Comparison table — full feature comparison for detail-seekers
 *   4. Trust strip — single editorial line (not a fake-logo grid)
 *   5. Rules section — numbered 2-col editorial grid (not a checklist)
 *   6. FAQ
 *   7. Final CTA
 *   8. Footer (CanvasTabStrip is the chrome at top via AppShell)
 *
 * Research-grounded:
 *   - Comparison table (28% conversion lift over cards-only)
 *   - 4 effective tiers (Free/Starter/Pro/Team) + Enterprise as Contact
 *   - Single primary CTA (Start Free) + secondary (Talk to Sales)
 *   - Value-based tier names (Solo operators / Practitioners / Small firms)
 *   - Trust before price (hero doesn't lead with the number)
 *   - Pro tier elevated — Clay top stripe + continuous tinted column +
 *     Recommended pill floating above + slightly scaled card
 *   - Sticky tier header row on table scroll
 *
 * Typography hierarchy (Anthropic restraint):
 *   - Hero h1: clamp(44, 5.4vw, 72)
 *   - Section h2: clamp(28, 3.0vw, 42)
 *   - Tier card name: 22px display 700
 *   - Tier card price: 48px display 800 tabular
 *   - Group headers (table): 11px mono uppercase 0.18em terra
 *   - Body: 14.5–16.5px Figtree 400
 */

import { useState } from 'react';

interface Props {
  onStartFree: () => void;
  onContactSales?: () => void;
  /** AppShell signature compat. The Edition is always cream regardless. */
  dark: boolean;
}

const SECTION_PAD = "56px";

type TierKey = 'free' | 'starter' | 'pro' | 'team' | 'enterprise';

interface Tier {
  key: TierKey;
  name: string;
  price: string;
  cadence?: string;
  built: string;
  pitch: string;          // 1-line pitch for tier card
  highlights: string[];   // 5-6 bullets in tier card
  ctaLabel: string;
  primary?: boolean;
}

const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    built: 'Anyone',
    pitch: 'Meet Yulia. Run one deal end-to-end with one finished deliverable.',
    highlights: [
      'Unlimited chat with Yulia',
      '1 active deal',
      '1 deliverable, ever',
      'All document generators',
      'All financial analysis',
    ],
    ctaLabel: 'Start free',
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$49',
    cadence: '/ month',
    built: 'Solo operators',
    pitch: 'For one searcher, one broker, one CEPA. Unlimited deliverables.',
    highlights: [
      'Unlimited deliverables',
      '1 active deal',
      'Post-close PMI',
      'All financial + buyer-list',
      'Personal credit card · cancel anytime',
    ],
    ctaLabel: 'Choose Starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$149',
    cadence: '/ month',
    built: 'Practitioners',
    pitch: 'For the advisor, the banker, the sponsor running parallel deals.',
    highlights: [
      'Unlimited active deals',
      'Unlimited deliverables',
      '30-day free trial',
      'Post-close PMI',
      'Priority support',
    ],
    ctaLabel: 'Choose Pro',
    primary: true,
  },
  {
    key: 'team',
    name: 'Team',
    price: '$999',
    cadence: '/ month',
    built: 'Small firms',
    pitch: 'For 2–5 person boutiques sharing a deal vault and templates.',
    highlights: [
      'Up to 5 seats',
      'Shared workspace',
      'Shared deal vault',
      'Shared templates',
      'All Pro features',
    ],
    ctaLabel: 'Choose Team',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Contact',
    cadence: 'sales',
    built: 'Custom',
    pitch: 'For 6+ seat firms with SOC 2, SSO, single-tenant, API access.',
    highlights: [
      'Custom seats',
      'Single-tenant + SOC 2',
      'SSO',
      'Named account manager + SLA',
      'API access',
    ],
    ctaLabel: 'Talk to sales',
  },
];

interface Row {
  label: string;
  /** Per-tier values in TIERS order. Keep aligned. */
  values: (boolean | string)[];
}

interface RowGroup {
  label: string;
  rows: Row[];
}

const ROW_GROUPS: RowGroup[] = [
  {
    label: 'Capacity',
    rows: [
      { label: 'Seats',         values: ['1', '1', '1', 'Up to 5', 'Custom'] },
      { label: 'Active deals',  values: ['1', '1', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'Deliverables',  values: ['1 (ever)', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
    ],
  },
  {
    label: 'Core capabilities',
    rows: [
      { label: 'Document generators',            values: [true, true, true, true, true] },
      { label: 'Financial analysis + QoE Lite',  values: [true, true, true, true, true] },
      { label: 'Buyer-list engine',              values: [true, true, true, true, true] },
      { label: 'SBA + structure modeling',       values: [true, true, true, true, true] },
      { label: 'Deal room + diligence tracking', values: [true, true, true, true, true] },
      { label: 'Market data + comps',            values: [true, true, true, true, true] },
    ],
  },
  {
    label: 'Premium',
    rows: [
      { label: 'Post-close / PMI',              values: [false, true, true, true, true] },
      { label: 'Team workspace + shared vault', values: [false, false, false, true, true] },
      { label: 'SSO + Single-tenant + SOC 2',   values: [false, false, false, false, true] },
      { label: 'Named account manager + SLA',   values: [false, false, false, false, true] },
      { label: 'API access',                    values: [false, false, false, false, true] },
    ],
  },
];

interface RuleEntry {
  number: string;
  title: string;
  body: string;
}

const RULES: RuleEntry[] = [
  {
    number: '01',
    title: 'Every tier delivers every capability.',
    body: 'No hero feature is ever gated. You pay for volume, seats, and infrastructure — never for what Yulia produces.',
  },
  {
    number: '02',
    title: 'No success fees. Ever.',
    body: 'Subscription only. Closed deal or broken — same price, paid the same way. We sit on the software side of SEC Rule 15(b)(13) and we stay there.',
  },
  {
    number: '03',
    title: 'Post-close support included.',
    body: '180 days of PMI in every paid tier. Subscription continues as long as you do. Many users stay on permanently — Yulia is where the next deal starts.',
  },
  {
    number: '04',
    title: '14-day opt-out trials. Cancel anytime.',
    body: '30-day free trial of Pro. No annual lock-in at launch — month-to-month only. Annual discount lands later, once retention data supports it.',
  },
  {
    number: '05',
    title: 'One-time $99 credit pack.',
    body: 'For users who want a second deliverable without committing to Starter. A bridge, not a gate.',
  },
  {
    number: '06',
    title: 'Same product. Different configuration.',
    body: 'A solo broker uses Starter. A 3-person boutique uses Team. A 15-person firm uses Enterprise. The product underneath is identical — only the seats and shared infrastructure change.',
  },
];

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'What does Free include?',
    a: 'Unlimited chat with Yulia plus one deliverable — ever — with email registration. No credit card. The deliverable cap is total, not monthly.',
  },
  {
    q: 'What counts as a "deliverable"?',
    a: 'Any finished document Yulia produces — valuation, CIM draft, screening memo, LOI, LP update, 100-day plan.',
  },
  {
    q: 'Why no success fees?',
    a: 'Two reasons. First, smbX sits on the software side of SEC Rule 15(b)(13) — charging a success fee would move us across that line. Second, success fees change what the product is. Subscription only. Forever.',
  },
  {
    q: 'Why is Pro $149 but Team $999?',
    a: 'Pro is for one person working alone. Team is for a 2–5 person firm where Yulia becomes a shared resource — shared workspace, shared deal vault, shared templates. Same product, more seats, more shared infrastructure.',
  },
  {
    q: 'What if I need six seats or more?',
    a: 'Enterprise. Quoted against your team — seat count, deployment model, compliance needs, SOC 2 / SSO requirements. Talk to sales.',
  },
  {
    q: 'Do you have a separate tier for advisors or brokers?',
    a: 'No. A solo broker uses Starter or Pro. A 3-person boutique uses Team. A 15-person firm uses Enterprise. Same product, different configuration.',
  },
  {
    q: 'What happens after I close a deal?',
    a: 'Your subscription continues at your current tier. 180 days of post-close PMI included. Many users stay on permanently — Yulia is where the next deal starts.',
  },
  {
    q: 'Annual discount?',
    a: 'Not at launch. Introduced later at 16% off once retention data supports it.',
  },
];

export default function PricingCanvas({ onStartFree, onContactSales }: Props) {
  return (
    <div
      className="smbx-edition v23c"
      style={{
        background: "var(--canvas-warm)",
        color: "var(--ink-primary)",
        fontFamily: "var(--font-body)",
        minHeight: "100%",
      }}
    >
      <PageStyles />
      {/* Canvas card — same paper-on-warm pattern as V23C home.
          Gutters on right + bottom expose warm body. Bottom-weighted
          shadow stack creates the Canva-style "paper resting on desk"
          depth. NO overflow:hidden so sticky table headers + floating
          pills (Recommended) work as expected. */}
      <div
        className="canvas-card"
        style={{
          position: "relative",
          background: "var(--canvas-paper)",
          borderRadius: 12,
          margin: "8px 16px 32px 0",
          boxShadow: [
            "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
            "0 1px 0 rgba(26, 24, 20, 0.04)",
            "0 6px 14px rgba(26, 24, 20, 0.05)",
            "0 16px 36px rgba(26, 24, 20, 0.08)",
            "0 36px 60px -16px rgba(26, 24, 20, 0.14)",
            "0 56px 96px -28px rgba(26, 24, 20, 0.10)",
          ].join(", "),
        }}
      >
        <Hero onStartFree={onStartFree} onContactSales={onContactSales} />
        <CompareSection onStartFree={onStartFree} onContactSales={onContactSales} />
        <TrustStrip />
        <RulesSection />
        <FAQSection />
        <FinalCTA onStartFree={onStartFree} onContactSales={onContactSales} />
        <SiteFooter />
      </div>
    </div>
  );
}

/* ─────────────────── Page-scoped styles ─────────────────── */
function PageStyles() {
  return (
    <style>{`
      .v23c .cta-primary {
        transition: background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1),
                    box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-primary:hover { background: var(--terra-hover); box-shadow: 0 14px 30px rgba(212, 113, 78, 0.24); }
      .v23c .cta-primary:active { transform: scale(0.97); }
      .v23c .cta-secondary {
        transition: border-color 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    background 200ms cubic-bezier(0.23, 1, 0.32, 1),
                    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .cta-secondary:hover { border-color: var(--ink-primary); background: var(--canvas-cream); }
      .v23c .cta-secondary:active { transform: scale(0.97); }

      /* ── Tier cards ── */
      .v23c .tier-card {
        transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1),
                    box-shadow 280ms cubic-bezier(0.23, 1, 0.32, 1),
                    border-color 280ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .tier-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 24px 48px rgba(26, 24, 20, 0.10), 0 6px 14px rgba(26, 24, 20, 0.05);
        border-color: rgba(26, 24, 20, 0.16);
      }
      .v23c .tier-card.is-pro:hover {
        box-shadow: 0 28px 56px rgba(212, 113, 78, 0.18), 0 8px 18px rgba(26, 24, 20, 0.06);
      }

      /* ── Comparison table ── */
      .v23c .compare-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;
      }
      .v23c .compare-table th,
      .v23c .compare-table td {
        font-family: var(--font-body);
        font-size: 15.5px;
        line-height: 1.55;
        text-align: center;
        vertical-align: middle;
        padding: 26px 20px;
        background: var(--canvas-paper);
        border: none;
      }
      .v23c .compare-table tbody tr {
        transition: background 200ms cubic-bezier(0.23, 1, 0.32, 1);
      }
      .v23c .compare-table tbody tr.feature-row:hover td {
        background: var(--canvas-cream);
      }
      .v23c .compare-table tbody tr.feature-row:hover td.pro-col {
        background: rgba(212, 113, 78, 0.09);
      }
      .v23c .compare-table .row-label {
        text-align: left;
        font-weight: 500;
        color: var(--ink-primary);
        padding-left: 36px;
        padding-right: 16px;
        font-size: 15.5px;
        letter-spacing: -0.005em;
      }
      .v23c .compare-table .pro-col {
        background: rgba(212, 113, 78, 0.05);
      }
      .v23c .compare-table thead th {
        position: sticky;
        top: 56px;
        z-index: 5;
        /* Top padding generous so the floating "Recommended" pill on
           the Pro column doesn't get clipped by the sticky header. */
        padding: 72px 16px 44px;
        background: var(--canvas-paper);
        border-bottom: 1px solid var(--rule);
      }
      /* Pro col tint — DO NOT override position here. The parent
         thead-th rule sets position: sticky so all 5 tier columns
         stick together when scrolled. Adding position: relative here
         drops Pro out of sticky alignment, making it scroll while the
         others pin, breaking the entire tier header row. Sticky is
         itself a positioning context so the ::before stripe below
         positions correctly without needing relative. */
      .v23c .compare-table thead th.pro-col {
        background: rgba(212, 113, 78, 0.05);
      }
      .v23c .compare-table thead th.pro-col::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 4px;
        background: var(--terra);
        z-index: 1;
      }
      .v23c .compare-table tr.row-divider td {
        padding: 0;
        height: 1px;
        background: var(--rule);
        line-height: 0;
      }
      .v23c .compare-table tr.row-divider td.pro-col {
        background: rgba(212, 113, 78, 0.18);
      }
      .v23c .compare-table tr.group-header td {
        padding: 44px 20px 22px;
        text-align: left;
        background: var(--canvas-cream);
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.20em;
        text-transform: uppercase;
        color: var(--ink-primary);
        font-weight: 700;
      }
      .v23c .compare-table tr.group-header td.pro-col {
        background: rgba(212, 113, 78, 0.08);
      }
      .v23c .compare-table tr.group-header td.first {
        padding-left: 36px;
      }
      .v23c .compare-table tr.group-header td.first::before {
        content: "● ";
        color: var(--terra);
        margin-right: 10px;
      }

      .v23c .faq-item { transition: background 200ms cubic-bezier(0.23, 1, 0.32, 1); }
      .v23c .faq-item:hover { background: var(--canvas-cream); }
      .v23c .faq-trigger { transition: color 200ms cubic-bezier(0.23, 1, 0.32, 1); }

      .v23c .nav-link { transition: color 200ms cubic-bezier(0.23, 1, 0.32, 1); }
      .v23c .nav-link:hover { color: var(--ink-primary); }

      /* index.css ships a global rule that forces every .smbx-edition
         <section> to padding-inline: max(56px, calc(50% - 600px)) with
         !important — designed to cap editorial content at ~1200px on
         wide monitors. The compare section is the page's widest content
         and needs to escape that cap so the table can extend. Higher
         specificity (class.class section#id) + !important wins. */
      .smbx-edition.v23c section#compare {
        padding-inline: 16px !important;
      }
      @media (min-width: 1280px) {
        .smbx-edition.v23c section#compare {
          padding-inline: 32px !important;
        }
      }
      @media (min-width: 1600px) {
        .smbx-edition.v23c section#compare {
          padding-inline: max(56px, calc(50% - 800px)) !important;
        }
      }

      /* ── Responsive ── */
      @media (max-width: 1279px) {
        .v23c .tier-row {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      @media (max-width: 1023px) {
        .v23c .tier-row {
          grid-template-columns: 1fr 1fr !important;
        }
        .v23c .compare-desktop { display: none !important; }
        .v23c .compare-mobile { display: block !important; }
      }
      @media (max-width: 639px) {
        .v23c .tier-row {
          grid-template-columns: 1fr !important;
        }
        .v23c .rules-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );
}

/* ─────────────────── Hero ─────────────────── */
function Hero({
  onStartFree,
  onContactSales,
}: Pick<Props, "onStartFree" | "onContactSales">) {
  return (
    <section style={{ padding: `112px ${SECTION_PAD} 64px` }}>
      <div style={{ textAlign: "center", maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--terra)",
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Pricing
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(44px, 5.4vw, 72px)",
            lineHeight: 1.04,
            letterSpacing: "-0.028em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
          }}
        >
          Priced so you don&apos;t have to think about it
          <span style={{ color: "var(--terra)" }}>.</span>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(17px, 1.4vw, 21px)",
            lineHeight: 1.55,
            color: "var(--ink-secondary)",
            margin: "24px auto 0",
            maxWidth: 740,
            textWrap: "pretty",
          }}
        >
          Built like infrastructure, not a luxury. Every paid tier delivers every
          capability Yulia offers — you pay for volume, seats, and enterprise
          features. Never for Yulia&apos;s work itself. No success fees. Ever.
        </p>
        <div
          style={{
            marginTop: 36,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            className="cta-primary"
            onClick={onStartFree}
            style={primaryCta()}
          >
            Start free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cta-secondary"
            onClick={onContactSales}
            style={secondaryCta()}
          >
            Talk to sales
            <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Tier cards row — visual entry above the comparison table
   ═══════════════════════════════════════════════════════════════════ */

function TierCards({
  onStartFree,
  onContactSales,
}: Pick<Props, "onStartFree" | "onContactSales">) {
  return (
    <section style={{ padding: `48px ${SECTION_PAD} 64px` }}>
      <div
        className="tier-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 18,
          maxWidth: 1280,
          margin: "0 auto",
          alignItems: "stretch",
        }}
      >
        {TIERS.map((t) => (
          <TierCard
            key={t.key}
            tier={t}
            onStartFree={onStartFree}
            onContactSales={onContactSales}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 48,
          textAlign: "center",
        }}
      >
        <a
          href="#compare"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-secondary)",
            textDecoration: "none",
            padding: "12px 22px",
            borderRadius: 999,
            border: "1px solid var(--rule)",
            background: "var(--canvas-paper)",
            transition: "color 200ms cubic-bezier(0.23,1,0.32,1), border-color 200ms cubic-bezier(0.23,1,0.32,1), background 200ms cubic-bezier(0.23,1,0.32,1)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ink-primary)";
            e.currentTarget.style.borderColor = "var(--ink-primary)";
            e.currentTarget.style.background = "var(--canvas-cream)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--ink-secondary)";
            e.currentTarget.style.borderColor = "var(--rule)";
            e.currentTarget.style.background = "var(--canvas-paper)";
          }}
        >
          Compare every feature
          <span style={{ color: "var(--terra)" }}>↓</span>
        </a>
      </div>
    </section>
  );
}

function TierCard({
  tier,
  onStartFree,
  onContactSales,
}: {
  tier: Tier;
  onStartFree: () => void;
  onContactSales?: () => void;
}) {
  const isPro = !!tier.primary;
  const isEnterprise = tier.key === "enterprise";

  return (
    <div
      className={`tier-card ${isPro ? "is-pro" : ""}`}
      style={{
        position: "relative",
        background: isPro ? "rgba(212, 113, 78, 0.04)" : "var(--canvas-paper)",
        border: isPro ? "1px solid rgba(212, 113, 78, 0.32)" : "1px solid var(--rule)",
        borderRadius: 16,
        padding: "36px 24px 28px",
        display: "flex",
        flexDirection: "column",
        boxShadow: isPro
          ? "0 18px 44px rgba(212, 113, 78, 0.12), 0 4px 12px rgba(26, 24, 20, 0.04)"
          : "0 4px 14px rgba(26, 24, 20, 0.04)",
        // overflow:hidden removed so the "Recommended" pill can float
        // above the card edge. The Clay top stripe is rounded to match
        // the card's top corners so it still respects the radius.
      }}
    >
      {/* Pro top stripe — rounded to match card border-radius */}
      {isPro && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "var(--terra)",
            borderRadius: "16px 16px 0 0",
          }}
        />
      )}

      {/* Recommended pill — floats above the tier name */}
      {isPro && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 14px",
            borderRadius: 999,
            background: "var(--terra)",
            color: "var(--canvas-paper)",
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            boxShadow: "0 6px 18px rgba(212, 113, 78, 0.32)",
          }}
        >
          Recommended
        </div>
      )}

      {/* Tier name */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.018em",
          color: "var(--ink-primary)",
          marginBottom: 8,
        }}
      >
        {tier.name}
      </div>

      {/* Audience */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginBottom: 22,
        }}
      >
        For {tier.built}
      </div>

      {/* Price block */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: "-0.034em",
            color: "var(--ink-primary)",
            fontVariantNumeric: "tabular-nums lining-nums",
            lineHeight: 1,
          }}
        >
          {tier.price}
        </span>
        {tier.cadence && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              color: "var(--ink-tertiary)",
            }}
          >
            {tier.cadence}
          </span>
        )}
      </div>

      {/* Pitch */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14.5,
          lineHeight: 1.55,
          color: "var(--ink-secondary)",
          margin: "0 0 24px",
          minHeight: 66,
        }}
      >
        {tier.pitch}
      </p>

      {/* CTA */}
      <button
        type="button"
        className={isPro ? "cta-primary" : "cta-secondary"}
        onClick={isEnterprise ? onContactSales : onStartFree}
        style={{
          all: "unset",
          cursor: "pointer",
          textAlign: "center",
          padding: "12px 18px",
          borderRadius: 999,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 14.5,
          marginBottom: 28,
          ...(isPro
            ? {
                background: "var(--terra)",
                color: "var(--canvas-paper)",
                boxShadow: "0 8px 22px rgba(212, 113, 78, 0.22)",
              }
            : {
                background: "transparent",
                color: "var(--ink-primary)",
                border: "1px solid var(--ink-primary)",
              }),
        }}
      >
        {tier.ctaLabel}
      </button>

      {/* Highlights */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {tier.highlights.map((h) => (
          <li
            key={h}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              lineHeight: 1.45,
              color: "var(--ink-secondary)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              style={{ flexShrink: 0, marginTop: 3, color: isPro ? "var(--terra)" : "var(--ink-primary)" }}
            >
              <path d="M2 7.5l3 3 7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Comparison table — full feature matrix
   ═══════════════════════════════════════════════════════════════════ */

function CompareSection({
  onStartFree,
  onContactSales,
}: Pick<Props, "onStartFree" | "onContactSales">) {
  return (
    <section
      id="compare"
      style={{
        // Compare section runs HORIZONTAL padding 0 — the table is the
        // widest content on the page, and on 1440px displays the chat
        // rail eats 30vw (~432px), so every pixel of canvas-card width
        // matters. The table fills the canvas-card edge-to-edge; the
        // intro heading inside still has its own centered text column.
        padding: "112px 0 96px",
        background: "var(--canvas-cream)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        scrollMarginTop: 80,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 64, padding: "0 24px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 18,
          }}
        >
          Compare every feature
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(28px, 3.0vw, 42px)",
            lineHeight: 1.1,
            letterSpacing: "-0.024em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Same product across every tier. The differences are seats and shared infrastructure.
        </h2>
      </div>

      {/* Inner wrapper fills 100% of section width — no maxWidth cap.
          The chat rail's 30vw reservation already constrains us; we
          take every pixel back. Table sits flush against the cream
          section's top + bottom rules; horizontal edges blend into
          the canvas-card edges. */}
      <div style={{ width: "100%" }}>
        <div
          className="compare-desktop"
          style={{
            // No outer border/radius — the table reads as a typographic
            // surface ON the canvas, not a card-in-a-card. Top + bottom
            // are bracketed by the cream section's hairline rules.
            background: "var(--canvas-paper)",
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <table className="compare-table">
            <colgroup>
              {/* Label col + 5 tier cols. Tier cols share equal width
                  so $0/$49/$149/$999/Contact get identical breathing
                  room — eliminates the perceived overlap from unequal
                  column widths. */}
              <col style={{ width: "18%" }} />
              <col style={{ width: "16.4%" }} />
              <col style={{ width: "16.4%" }} />
              <col style={{ width: "16.4%" }} />
              <col style={{ width: "16.4%" }} />
              <col style={{ width: "16.4%" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ background: "var(--canvas-paper)", textAlign: "left", paddingLeft: 36 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      letterSpacing: "0.20em",
                      textTransform: "uppercase",
                      color: "var(--ink-tertiary)",
                    }}
                  >
                    Compare tiers
                  </span>
                </th>
                {TIERS.map((tier) => (
                  <th key={tier.key} className={tier.primary ? "pro-col" : ""}>
                    <TableTierHeader
                      tier={tier}
                      onStartFree={onStartFree}
                      onContactSales={onContactSales}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROW_GROUPS.map((group, gi) => (
                <>
                  {gi > 0 && (
                    <tr className="row-divider" key={`${group.label}-divider`}>
                      <td />
                      {TIERS.map((tier) => (
                        <td key={tier.key} className={tier.primary ? "pro-col" : ""} />
                      ))}
                    </tr>
                  )}
                  <tr className="group-header" key={`${group.label}-header`}>
                    <td className="first">{group.label}</td>
                    {TIERS.map((tier) => (
                      <td key={tier.key} className={tier.primary ? "pro-col" : ""} />
                    ))}
                  </tr>
                  {group.rows.map((row) => (
                    <tr className="feature-row" key={`${group.label}-${row.label}`}>
                      <td className="row-label">{row.label}</td>
                      {row.values.map((v, i) => {
                        const tier = TIERS[i];
                        return (
                          <td key={tier.key} className={tier.primary ? "pro-col" : ""}>
                            <CellValue value={v} isPro={!!tier.primary} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: per-tier card stack */}
        <div className="compare-mobile" style={{ display: "none", flexDirection: "column", gap: 18 }}>
          {TIERS.map((tier) => (
            <MobileTierBlock
              key={tier.key}
              tier={tier}
              onStartFree={onStartFree}
              onContactSales={onContactSales}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TableTierHeader({
  tier,
  onStartFree,
  onContactSales,
}: {
  tier: Tier;
  onStartFree: () => void;
  onContactSales?: () => void;
}) {
  const isPro = !!tier.primary;
  const isEnterprise = tier.key === "enterprise";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6, position: "relative" }}>
      {isPro && (
        <span
          style={{
            position: "absolute",
            top: -42,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 14px",
            borderRadius: 999,
            background: "var(--terra)",
            color: "var(--canvas-paper)",
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.20em",
            textTransform: "uppercase",
            fontWeight: 700,
            boxShadow: "0 6px 18px rgba(212, 113, 78, 0.32)",
            whiteSpace: "nowrap",
          }}
        >
          Recommended
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "-0.020em",
          color: "var(--ink-primary)",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {tier.name}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginBottom: 22,
          textAlign: "center",
        }}
      >
        For {tier.built}
      </span>
      {/* Price + cadence stacked vertically — horizontal flex caused
          $999 + "/ month" to overflow narrow columns and visually spill
          into adjacent tiers. Vertical stack also reads more cleanly on
          narrow viewports (no awkward wrap). */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 26 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: "-0.036em",
            color: "var(--ink-primary)",
            fontVariantNumeric: "tabular-nums lining-nums",
            lineHeight: 1,
          }}
        >
          {tier.price}
        </span>
        {tier.cadence && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-tertiary)", letterSpacing: "0.01em" }}>
            {tier.cadence}
          </span>
        )}
      </div>
      <button
        type="button"
        className={isPro ? "cta-primary" : "cta-secondary"}
        onClick={isEnterprise ? onContactSales : onStartFree}
        style={{
          all: "unset",
          cursor: "pointer",
          textAlign: "center",
          padding: "13px 18px",
          borderRadius: 999,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 14,
          ...(isPro
            ? {
                background: "var(--terra)",
                color: "var(--canvas-paper)",
                boxShadow: "0 6px 16px rgba(212, 113, 78, 0.20)",
              }
            : {
                background: "transparent",
                color: "var(--ink-primary)",
                border: "1px solid var(--ink-primary)",
              }),
        }}
      >
        {tier.ctaLabel}
      </button>
    </div>
  );
}

function CellValue({ value, isPro }: { value: boolean | string; isPro: boolean }) {
  if (value === true) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-label="included"
        style={{
          color: isPro ? "var(--terra)" : "var(--ink-primary)",
          margin: "0 auto",
          display: "block",
        }}
      >
        <circle
          cx="10"
          cy="10"
          r="9"
          fill={isPro ? "rgba(212, 113, 78, 0.10)" : "rgba(26, 24, 20, 0.04)"}
        />
        <path
          d="M5.5 10.5l3 3 6.5-6.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (value === false) {
    return (
      <span
        aria-label="not included"
        style={{
          color: "var(--ink-quaternary)",
          fontFamily: "var(--font-mono)",
          fontSize: 16,
        }}
      >
        —
      </span>
    );
  }
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        color: "var(--ink-primary)",
      }}
    >
      {value}
    </span>
  );
}

function MobileTierBlock({
  tier,
  onStartFree,
  onContactSales,
}: {
  tier: Tier;
  onStartFree: () => void;
  onContactSales?: () => void;
}) {
  const isPro = !!tier.primary;
  const isEnterprise = tier.key === "enterprise";
  const tierIndex = TIERS.findIndex((t) => t.key === tier.key);
  return (
    <div
      style={{
        background: "var(--canvas-paper)",
        border: isPro ? "1px solid rgba(212, 113, 78, 0.32)" : "1px solid var(--rule)",
        borderRadius: 14,
        padding: "26px 24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: isPro
          ? "0 14px 36px rgba(212, 113, 78, 0.10)"
          : "0 4px 14px rgba(26, 24, 20, 0.04)",
      }}
    >
      {isPro && (
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--terra)" }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--ink-primary)" }}>
          {tier.name}
        </span>
        {isPro && (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--canvas-paper)",
              background: "var(--terra)",
              fontWeight: 700,
            }}
          >
            Recommended
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-tertiary)",
          marginBottom: 14,
        }}
      >
        For {tier.built}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 22 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: "-0.032em",
            color: "var(--ink-primary)",
            fontVariantNumeric: "tabular-nums lining-nums",
            lineHeight: 1,
          }}
        >
          {tier.price}
        </span>
        {tier.cadence && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-tertiary)" }}>
            {tier.cadence}
          </span>
        )}
      </div>
      <button
        type="button"
        className={isPro ? "cta-primary" : "cta-secondary"}
        onClick={isEnterprise ? onContactSales : onStartFree}
        style={{
          all: "unset",
          cursor: "pointer",
          textAlign: "center",
          width: "100%",
          padding: "12px 16px",
          borderRadius: 999,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 24,
          boxSizing: "border-box",
          ...(isPro
            ? {
                background: "var(--terra)",
                color: "var(--canvas-paper)",
                boxShadow: "0 6px 16px rgba(212, 113, 78, 0.20)",
              }
            : {
                background: "transparent",
                color: "var(--ink-primary)",
                border: "1px solid var(--ink-primary)",
              }),
        }}
      >
        {tier.ctaLabel}
      </button>
      {ROW_GROUPS.map((group) => {
        const includedRows = group.rows.filter((r) => r.values[tierIndex] !== false);
        if (includedRows.length === 0) return null;
        return (
          <div key={group.label} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--terra)" }} />
              {group.label}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {includedRows.map((r) => {
                const v = r.values[tierIndex];
                return (
                  <li
                    key={r.label}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontFamily: "var(--font-body)",
                      fontSize: 13.5,
                      lineHeight: 1.45,
                      color: "var(--ink-secondary)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden
                      style={{ flexShrink: 0, marginTop: 3, color: isPro ? "var(--terra)" : "var(--ink-primary)" }}
                    >
                      <path d="M2 7.5l3 3 7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>
                      {typeof v === "string" ? <strong style={{ color: "var(--ink-primary)", fontWeight: 600 }}>{v}</strong> : null}
                      {typeof v === "string" ? " · " : null}
                      {r.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────── Trust strip — single editorial line ─────────────────── */
function TrustStrip() {
  const audiences = [
    "independent searchers",
    "M&A advisors",
    "business brokers",
    "independent sponsors",
    "boutique sector IBs",
    "exit planners",
  ];
  return (
    <section style={{ padding: `64px ${SECTION_PAD}`, background: "var(--canvas-warm)" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--terra)",
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          ● Built for the firms that close
        </div>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontStyle: "italic",
            fontSize: "clamp(20px, 2.2vw, 28px)",
            lineHeight: 1.4,
            color: "var(--ink-primary)",
            margin: 0,
            textWrap: "balance",
          }}
        >
          Designed for{" "}
          {audiences.map((a, i) => (
            <span key={a}>
              <span style={{ color: "var(--ink-primary)", fontStyle: "normal", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                {a}
              </span>
              {i < audiences.length - 2 ? ", " : i === audiences.length - 2 ? ", and " : ""}
            </span>
          ))}
          .
        </p>
        <div
          style={{
            marginTop: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
          }}
        >
          Real coverage badges · land at GA
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Rules — numbered editorial 2-col ─────────────────── */
function RulesSection() {
  return (
    <section
      style={{
        padding: `112px ${SECTION_PAD}`,
        background: "var(--canvas-paper)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 18,
          }}
        >
          The rules
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(28px, 3.0vw, 42px)",
            lineHeight: 1.1,
            letterSpacing: "-0.024em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          What we&apos;ve committed to. In writing.
        </h2>
      </div>
      <div
        className="rules-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "44px 56px",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {RULES.map((r) => (
          <div key={r.number} style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 32,
                letterSpacing: "-0.028em",
                color: "var(--terra)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums lining-nums",
                flexShrink: 0,
                width: 52,
              }}
            >
              {r.number}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 19,
                  letterSpacing: "-0.014em",
                  lineHeight: 1.22,
                  margin: 0,
                  color: "var(--ink-primary)",
                  textWrap: "balance",
                }}
              >
                {r.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--ink-secondary)",
                  margin: "10px 0 0",
                }}
              >
                {r.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────── FAQ ─────────────────── */
function FAQSection() {
  return (
    <section style={{ padding: `128px ${SECTION_PAD} 144px` }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 18,
          }}
        >
          FAQ
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(28px, 3.0vw, 42px)",
            lineHeight: 1.1,
            letterSpacing: "-0.024em",
            margin: 0,
            color: "var(--ink-primary)",
            textWrap: "balance",
          }}
        >
          Questions buyers actually ask.
        </h2>
      </div>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {FAQS.map((faq, i) => (
          <FAQRow key={i} faq={faq} initialOpen={i === 0} />
        ))}
      </div>
    </section>
  );
}

function FAQRow({ faq, initialOpen }: { faq: FAQ; initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div className="faq-item" style={{ borderBottom: "1px solid var(--rule)" }}>
      <button
        type="button"
        className="faq-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          all: "unset",
          width: "100%",
          cursor: "pointer",
          padding: "22px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: "-0.014em",
          color: open ? "var(--ink-primary)" : "var(--ink-secondary)",
        }}
      >
        <span style={{ flex: 1 }}>{faq.q}</span>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 999,
            border: `1px solid ${open ? "var(--terra)" : "var(--rule)"}`,
            color: open ? "var(--terra)" : "var(--ink-tertiary)",
            transition: "border-color 200ms cubic-bezier(0.23, 1, 0.32, 1), color 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 20px 24px",
            fontFamily: "var(--font-body)",
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "var(--ink-secondary)",
            maxWidth: 720,
          }}
        >
          {faq.a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Final CTA ─────────────────── */
function FinalCTA({
  onStartFree,
  onContactSales,
}: Pick<Props, "onStartFree" | "onContactSales">) {
  return (
    <section
      style={{
        padding: `144px ${SECTION_PAD} 160px`,
        background: "var(--canvas-paper)",
        textAlign: "center",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-tertiary)",
            marginBottom: 22,
          }}
        >
          Ready?
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(40px, 4.8vw, 64px)",
            lineHeight: 1.04,
            letterSpacing: "-0.028em",
            margin: 0,
            color: "var(--ink-primary)",
          }}
        >
          See what Yulia produces<span style={{ color: "var(--terra)" }}>.</span>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 1.4vw, 19px)",
            lineHeight: 1.55,
            color: "var(--ink-secondary)",
            margin: "20px auto 32px",
            maxWidth: 580,
            textWrap: "pretty",
          }}
        >
          The first deliverable is free — no card, no sales call. Talk to Yulia,
          paste a teaser, see what she produces.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="cta-primary" onClick={onStartFree} style={primaryCta()}>
            Start free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="cta-secondary" onClick={onContactSales} style={secondaryCta()}>
            Talk to sales <span style={{ color: "var(--terra)" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Footer ─────────────────── */
function SiteFooter() {
  const columns: { heading: string; links: string[] }[] = [
    { heading: "Product",   links: ["Yulia",     "Pricing",  "Changelog", "Status"] },
    { heading: "Resources", links: ["How it works", "Field guide", "API docs", "Help center"] },
    { heading: "Solutions", links: ["For searchers", "For advisors", "For brokers", "For sponsors", "For bankers", "For planners"] },
    { heading: "Company",   links: ["About", "Press", "Careers", "Contact"] },
    { heading: "Terms",     links: ["Privacy", "Terms of service", "Security", "Compliance"] },
  ];
  return (
    <footer style={{ padding: `80px ${SECTION_PAD} 56px`, background: "var(--canvas-warm)", borderTop: "1px solid var(--rule)" }}>
      <div
        className="footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr repeat(5, 1fr)",
          gap: 40,
          marginBottom: 56,
        }}
      >
        <style>{`
          @media (max-width: 1023px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
          @media (max-width: 639px)  { .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
        `}</style>
        <div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.04em",
              color: "var(--ink-primary)",
            }}
          >
            smbx<span style={{ color: "var(--terra)" }}>.</span>ai
          </span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-tertiary)", margin: "12px 0 0", maxWidth: 280 }}>
            The AI deal team for people who do deals — drafts the documents, models the structures, scores the buyers.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
                marginBottom: 14,
              }}
            >
              {col.heading}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13.5,
                      color: "var(--ink-secondary)",
                      textDecoration: "none",
                      transition: "color 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-secondary)"; }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          paddingTop: 28,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
          © 2026 smbx.ai · All rights reserved
        </span>
        <div style={{ display: "flex", gap: 18 }}>
          {["LinkedIn", "X", "YouTube"].map((s) => (
            <a
              key={s}
              href="#"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink-secondary)",
                textDecoration: "none",
                transition: "color 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--terra)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-secondary)"; }}
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── Shared CTA styles ─────────────────── */
function primaryCta(): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 16,
    color: "var(--canvas-paper)",
    background: "var(--terra)",
    padding: "14px 26px",
    borderRadius: 999,
    boxShadow: "0 8px 22px rgba(212, 113, 78, 0.22)",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  };
}

function secondaryCta(): React.CSSProperties {
  return {
    all: "unset",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: 16,
    color: "var(--ink-primary)",
    padding: "13px 22px",
    borderRadius: 999,
    border: "1px solid var(--rule)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
}
