/**
 * Glass Grok v2 · Pricing.tsx — explainer page.
 * 4 sections: Which tier → 3-tier card grid → feature matrix → FAQ.
 *
 * Port of new_journey/project/pricing.html. Prices match the Claude
 * Design handoff verbatim (Explore Free / Deal $2,400 / Firm $9,800).
 * Paul's call — he'll reconcile against pricing canon after cutover.
 */
import {
  DealStep, DealBench, DealBottom,
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

const SECTION_NAV = [
  { id: 's1', label: 'Which tier?' },
  { id: 's2', label: 'Plans' },
  { id: 's3', label: 'Compare' },
  { id: 's4', label: 'FAQ' },
] as const;

const CHIPS = [
  'Selling $3M',
  'Searcher, no deal',
  'Family office',
  'Mid-market firm',
] as const;

/* As-designed feature matrix — reconcile against pricing canon post-cutover */
const MATRIX: readonly { feature: string; explore: React.ReactNode; deal: React.ReactNode; firm: React.ReactNode }[] = [
  { feature: 'Valuation + readiness', explore: <span className="pr-check">✓</span>, deal: <span className="pr-check">✓</span>, firm: <span className="pr-check">✓</span> },
  { feature: 'Add-backs (defensible)', explore: 'Top 5',                              deal: 'All',                         firm: 'All' },
  { feature: 'CIM generation',        explore: <span className="pr-x">Template</span>, deal: <span className="pr-check">✓ Custom</span>, firm: <span className="pr-check">✓ White-label</span> },
  { feature: 'Buyer/target universe', explore: <span className="pr-x">Sample</span>,   deal: 'Up to 250',                   firm: 'Unlimited' },
  { feature: 'Diligence pack',        explore: <span className="pr-x">—</span>,        deal: <span className="pr-check">✓</span>,  firm: <span className="pr-check">✓</span> },
  { feature: 'LOI + APA drafting',    explore: <span className="pr-x">—</span>,        deal: <span className="pr-check">✓</span>,  firm: <span className="pr-check">✓</span> },
  { feature: 'Integration plan (180d)', explore: <span className="pr-x">—</span>,      deal: <span className="pr-check">✓</span>,  firm: <span className="pr-check">✓</span> },
  { feature: 'Thesis tracking (post-close)', explore: <span className="pr-x">—</span>, deal: '1 deal',                       firm: 'Up to 6' },
  { feature: 'Team seats',            explore: '1',                                    deal: '3',                            firm: '12' },
  { feature: 'Human banker review',   explore: <span className="pr-x">—</span>,        deal: 'On request',                   firm: 'Priority' },
  { feature: 'Data room + investor portal', explore: <span className="pr-x">—</span>,  deal: <span className="pr-x">—</span>,firm: <span className="pr-check">✓</span> },
  { feature: 'Custom comps library',  explore: <span className="pr-x">—</span>,        deal: <span className="pr-x">—</span>,firm: <span className="pr-check">✓</span> },
];

const FAQS: readonly { q: string; a: string }[] = [
  { q: 'Is there a success fee?', a: 'No. Banks take 3–6% of deal value. We take a monthly subscription. On a $10M deal you keep $300–600K that would otherwise go to the banker.' },
  { q: 'How long until I need to upgrade from Explore?', a: 'Most owners upgrade to Deal the week they decide to actually go to market — typically 4–12 weeks after first chat. Explore is designed to help you decide; Deal is designed to close.' },
  { q: 'Do I still need a lawyer?', a: 'Yes. Yulia drafts. Your counsel red-lines. Deals that skip legal review fall apart in diligence — we design Deal around that workflow, not in place of it.' },
  { q: 'What if the deal doesn’t close?', a: 'You paid subscription for months of work, same as you’d have paid salary to a team. You keep every artifact — CIM, model, buyer list, diligence pack — for the next process. Unlike a banker’s retainer, none of it burns on a re-trade.' },
];

export default function Pricing({ active, onSend, onStartFree, onNavigate, onSignIn }: Props) {
  void SECTION_NAV;
  return (
    <JourneyShell
      active={active}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onStartFree={onStartFree}
      canvasKicker="PRICING"
      canvasTitle="Tell Yulia what you’re doing. She’ll tell you what you need."
      chat={{
        title: 'Yulia',
        status: 'Help me pick',
        script: {},
        opening: 'Hi — I’m <strong>Yulia</strong>. Tell me what you’re doing and I’ll tell you which plan fits. Most people overbuy.',
        reply: 'Tell me: <strong>buying, selling, raising, or integrating</strong>? And roughly what size? I’ll route you — usually to Explore.',
        chips: CHIPS,
        onSend,
      }}
    >
      {/* s1 · which tier */}
      <DealStep
        n={1}
        id="s1"
        idx="Which tier?"
        title="Tell Yulia what you’re doing. She’ll tell you what you need."
        lede={<>Most owners pick the wrong tier. First-timers over-buy on their first deal and under-buy on their second. Tell her the shape of your situation and she’ll point you at the smallest plan that gets you to close — not the biggest one.</>}
      />

      {/* s2 · plans */}
      <DealStep
        n={2}
        id="s2"
        idx="Plans"
        title="Three plans. Everyone upgrades through them in order."
        lede={<>Start free with Yulia answering questions. Move to Deal when you’re actually running a process. Move to Firm when you’re running multiple processes for multiple clients.</>}
      >
        <div className="pr-grid">
          <PlanCard
            tier="Explore"
            price={<>Free</>}
            desc="Forever. No card."
            features={['Conversational valuation range', 'Readiness score', 'Add-back identification (top 5)', 'Structure comparison', 'Sample CIM + LOI templates']}
            cta={{ label: 'Start free →', variant: 'light', onClick: onStartFree }}
          />
          <PlanCard
            feature
            tier="Most common"
            price={<>$2,400<small>/mo</small></>}
            desc="Per active deal. Cancel anytime."
            features={['Everything in Explore', 'Full CIM generation + revisions', 'Buyer/target universe + outreach', '42-workstream diligence pack', 'LOI + APA drafts, red-lined by your counsel', 'Dedicated workspace, versioned', 'Human banker review on request']}
            cta={{ label: 'Start a deal →', variant: 'light', onClick: () => onSend('I want to start a Deal plan.') }}
          />
          <PlanCard
            tier="Firm"
            price={<>$9,800<small>/mo</small></>}
            desc="Up to 6 concurrent deals. Team seats included."
            features={['Everything in Deal', 'Multi-deal pipeline + thesis tracking', 'Team seats (up to 12)', 'White-labeled client workspaces', 'Data room + investor portal', 'Custom comps + private deal library', 'Priority human review']}
            cta={{ label: 'Talk to us →', variant: 'dark', onClick: () => onNavigate('enterprise') }}
          />
        </div>
      </DealStep>

      {/* s3 · compare */}
      <DealStep
        n={3}
        id="s3"
        idx="Compare"
        title="Every feature, every tier."
        lede={<>No asterisks, no "contact us" rows. If a feature’s in a tier, it’s in a tier.</>}
      >
        <DealBench title="Feature comparison" meta="3 TIERS">
          <div style={{ padding: 22 }}>
            <table className="pr-cmp">
              <thead>
                <tr>
                  <th>Feature</th><th>Explore</th><th>Deal</th><th>Firm</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map(r => (
                  <tr key={r.feature}>
                    <td style={{ fontWeight: 600 }}>{r.feature}</td>
                    <td>{r.explore}</td>
                    <td>{r.deal}</td>
                    <td>{r.firm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DealBench>
      </DealStep>

      {/* s4 · FAQ */}
      <DealStep
        n={4}
        id="s4"
        idx="FAQ"
        title="The questions buyers ask before signing up."
      >
        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {FAQS.map(f => (
            <div key={f.q} className="hiw-card" style={{ padding: 22 }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: '#3A3A3E' }}>{f.a}</div>
            </div>
          ))}
        </div>
      </DealStep>

      <DealBottom
        heading="Or just start, free, and upgrade when you’re actually running a deal."
        sub="Tell Yulia one thing about what you’re doing — she’ll route you to the right plan. Usually Explore."
        placeholder="Buying, selling, raising, or still deciding?"
        onSend={onSend}
      />
    </JourneyShell>
  );
}

function PlanCard({ tier, price, desc, features, cta, feature }: {
  tier: string;
  price: React.ReactNode;
  desc: string;
  features: readonly string[];
  cta: { label: string; variant: 'light' | 'dark'; onClick: () => void };
  feature?: boolean;
}) {
  return (
    <div className={`pr-card${feature ? ' pr-card--feature' : ''}`}>
      <div>
        <div className="pr-card__n">{tier}</div>
        <div className="pr-card__p" style={{ marginTop: 8 }}>{price}</div>
        <div className="pr-card__d" style={{ marginTop: 6 }}>{desc}</div>
      </div>
      <ul>
        {features.map(f => <li key={f}>{f}</li>)}
      </ul>
      <button
        type="button"
        className={`pr-cta pr-cta--${cta.variant}`}
        onClick={cta.onClick}
      >
        {cta.label}
      </button>
    </div>
  );
}
