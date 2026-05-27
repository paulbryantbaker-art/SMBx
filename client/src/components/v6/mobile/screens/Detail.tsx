/* V6 Mobile — Deal detail screen.
   App Store app-detail style: floating glass nav + big icon + stats strip +
   tag chips + What's Yulia saying + A closer look (horizontal artifact rail)
   + Confidence & notes. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { FitGauge } from "../FitGauge";
import { MobileIcon } from "../icons";
import { ChatStarterPill } from "../ChatStarterPill";
import { authHeaders } from "../../../../hooks/useAuth";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { findDeal } from "../../../../lib/sampleDeals";
import type { Verdict } from "../types";

const VERDICT_LABEL: Record<Verdict, string> = {
  pursue: "PURSUE",
  watch:  "WATCH",
  pass:   "PASS",
};

const VERDICT_INK: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue-ink)",
  watch:  "var(--mb-warn-ink)",
  pass:   "var(--mb-danger-ink)",
};

const VERDICT_DOT: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue)",
  watch:  "var(--mb-warn)",
  pass:   "var(--mb-danger)",
};

const VERDICT_BG: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue-soft)",
  watch:  "var(--mb-warn-soft)",
  pass:   "var(--mb-danger-soft)",
};

/* Generic fallback blurbs when the deal doesn't carry its own verdictWhy.
   Phrased decisively (this IS a WATCH / this IS a PURSUE) so users don't
   read it as "kinda both." Per-deal verdictWhy from sampleDeals.ts always
   wins over these. */
const VERDICT_BLURB: Record<Verdict, string> = {
  pursue: "PURSUE — strong fit. Move on the IOI.",
  watch:  "WATCH — not a pursue yet. Specific things have to verify before it moves to PURSUE.",
  pass:   "PASS — math doesn't work. Don't spend cycles here.",
};

interface DetailProps {
  dealId: string;
  dealTitle: string;
  onBack: () => void;
  onChat: () => void;
  /** Send a starter prompt to chat then open the chat sheet. Used by
      the next-actions list and the deal-context input at the bottom. */
  onAskYulia: (prompt: string) => void;
  onRunAnalysis?: (input: {
    dealId: string;
    dealTitle: string;
    analysisType: string;
    menuItemSlug?: string;
    label: string;
    prompt: string;
  }) => void;
}

interface MobileDealBrief {
  verdict?: { label?: string; score?: number; text?: string };
  marketRead?: {
    headline?: string;
    bullets?: string[];
    sourceSignals?: string[];
    researchNeeded?: string[];
  };
  taxLegal?: {
    tax?: string;
    legal?: string;
    signoffFlags?: string[];
  };
  nextMoves?: Array<{ title?: string; why?: string; prompt?: string; actionId?: string }>;
}

interface MobileDealDetail {
  deal?: {
    revenue?: number | null;
    sde?: number | null;
    ebitda?: number | null;
    asking_price?: number | null;
    industry?: string | null;
    location?: string | null;
    journey_type?: string | null;
  };
}

type MobileDealMove = NonNullable<MobileDealBrief["nextMoves"]>[number];

interface MobileDealActionContext {
  dealId: string;
  dealTitle: string;
  onRunAnalysis?: DetailProps["onRunAnalysis"];
  onAskYulia: DetailProps["onAskYulia"];
}

function fmtMoney(value?: number | null, label?: string): string | null {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  const abs = Math.abs(amount);
  const pretty = abs >= 1_000_000
    ? `$${(amount / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
    : `$${Math.round(amount / 1_000)}K`;
  return label ? `${pretty} ${label}` : pretty;
}

function mobileActionEyebrow(actionId?: string) {
  if (!actionId) return "YULIA ACTION";
  return actionId
    .replace(/^run_/, "")
    .replace(/^generate_/, "")
    .replace(/_/g, " ")
    .toUpperCase();
}

function mobileAnalysisForAction(actionId?: string) {
  switch (actionId) {
    case "run_market_intelligence":
      return { analysisType: "market_intelligence", menuItemSlug: "universal-market-intelligence", label: "market intelligence read" };
    case "run_tax_legal_structure":
      return { analysisType: "tax_legal_structure", menuItemSlug: "buy-capital-structure", label: "tax and legal implications model" };
    case "run_working_capital_analysis":
      return { analysisType: "working_capital", menuItemSlug: "buy-working-capital-model", label: "working-capital analysis" };
    case "run_recast_analysis":
      return { analysisType: "recast", menuItemSlug: "buy-deal-scorecard", label: "recast analysis" };
    case "run_buyer_fit_analysis":
      return { analysisType: "buyer_fit", menuItemSlug: "buy-deal-scorecard", label: "buyer-fit analysis" };
    case "run_valuation_analysis":
      return { analysisType: "valuation", menuItemSlug: "buy-valuation-model", label: "valuation model" };
    case "run_comps_analysis":
      return { analysisType: "comps", menuItemSlug: "universal-comp-analysis", label: "comps analysis" };
    case "run_capital_structure_model":
      return { analysisType: "capital_structure", menuItemSlug: "buy-capital-structure", label: "capital structure model" };
    case "run_sba_analysis":
      return { analysisType: "sba", menuItemSlug: "universal-sba-analysis", label: "SBA structure analysis" };
    case "run_red_flags_analysis":
      return { analysisType: "red_flags", menuItemSlug: "buy-red-flag-report", label: "red-flag analysis" };
    case "run_qoe_analysis":
      return { analysisType: "qoe", menuItemSlug: "buy-deal-scorecard", label: "QoE analysis" };
    case "run_lbo_analysis":
      return { analysisType: "lbo", menuItemSlug: "buy-valuation-model", label: "LBO model" };
    case "run_dcf_analysis":
      return { analysisType: "dcf", menuItemSlug: "buy-valuation-model", label: "DCF model" };
    case "run_sensitivity_analysis":
      return { analysisType: "sensitivity", menuItemSlug: "buy-valuation-model", label: "sensitivity model" };
    case "run_earnout_analysis":
      return { analysisType: "earnout", menuItemSlug: "buy-earnout-analysis", label: "earnout model" };
    case "run_tax_impact_analysis":
      return { analysisType: "tax_impact", menuItemSlug: "buy-capital-structure", label: "tax impact model" };
    case "run_purchase_price_allocation":
      return { analysisType: "purchase_price_allocation", menuItemSlug: "buy-capital-structure", label: "purchase-price allocation" };
    case "run_cap_table_analysis":
      return { analysisType: "cap_table", menuItemSlug: "raise-cap-table", label: "cap table model" };
    case "run_covenant_analysis":
      return { analysisType: "covenant", menuItemSlug: "buy-capital-structure", label: "covenant model" };
    default:
      return null;
  }
}

function runMobileDealAction(move: MobileDealMove, context: MobileDealActionContext) {
  const prompt = move.prompt || `On ${context.dealTitle}: ${move.title || "run Yulia's next action option"}.`;
  const analysis = mobileAnalysisForAction(move.actionId);

  if (analysis && context.onRunAnalysis) {
    context.onRunAnalysis({
      dealId: context.dealId,
      dealTitle: context.dealTitle,
      analysisType: analysis.analysisType,
      menuItemSlug: analysis.menuItemSlug,
      label: analysis.label,
      prompt,
    });
    return;
  }

  if (move.actionId === "generate_primary_deliverable" || move.actionId === "generate_loi") {
    context.onAskYulia(`${prompt} Use the document-generation tool and open the generated work product in the canvas.`);
    return;
  }

  if (move.actionId === "optimize_scenario") {
    context.onAskYulia(`${prompt} Use optimize_scenario on the active deal model and return the strongest path candidates, negotiation-prep asks, reps and warranties, diligence asks, and sign-off needs.`);
    return;
  }

  context.onAskYulia(prompt);
}

function defaultMobileNextMoves(dealTitle: string, isSampleDeal: boolean): MobileDealMove[] {
  if (!isSampleDeal) {
    return [
      {
        actionId: "run_market_intelligence",
        title: "Generate Yulia's deal read",
        why: "Next moves should come from Yulia's sourced deal brief, not local card copy.",
        prompt: `On ${dealTitle}: generate the sourced deal read, then return next action options with action IDs.`,
      },
      {
        actionId: "run_qoe_analysis",
        title: "Run QoE evidence check",
        why: "Open a canvas that separates supported earnings quality from missing source material.",
        prompt: `On ${dealTitle}: run a QoE evidence check and tell me which source materials are missing.`,
      },
      {
        actionId: "ask_yulia",
        title: "Ask Yulia what is missing",
        why: "Yulia should explain the missing inputs before surfacing a move.",
        prompt: `On ${dealTitle}: what evidence do you need before you can surface the next action options?`,
      },
    ];
  }

  return [
    {
      actionId: "run_qoe_analysis",
      title: "Run a deeper QoE on the NWC peg",
      why: "Separate durable earnings from working-capital pressure before the next buyer touch.",
      prompt: `On ${dealTitle}: open QoE analysis and focus on normalized SDE, customer concentration, and the working-capital peg.`,
    },
    {
      actionId: "run_sensitivity_analysis",
      title: "Model the decision scenarios",
      why: "Use sliders to compare conservative, base, and aggressive structures before drafting terms.",
      prompt: `On ${dealTitle}: open the scenario model with sliders for price, SDE, down payment, rate, and growth.`,
    },
    {
      actionId: "run_buyer_fit_analysis",
      title: "Map the buyer universe",
      why: "Compare strategic roll-ups and founder-friendly sponsors before broad outreach.",
      prompt: `On ${dealTitle}: open buyer-fit analysis and compare the strongest buyer pools for this deal.`,
    },
  ];
}

export function DetailScreen({ dealId, dealTitle, onBack, onChat, onAskYulia, onRunAnalysis }: DetailProps) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(dealId);
  const numericId = /^\d+$/.test(dealId) ? parseInt(dealId, 10) : null;
  const [dealBrief, setDealBrief] = useState<MobileDealBrief | null>(null);
  const [realDetail, setRealDetail] = useState<MobileDealDetail | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (numericId === null) {
      setDealBrief(null);
      setRealDetail(null);
      setBriefLoading(false);
      return;
    }
    let cancelled = false;
    setBriefLoading(true);
    Promise.all([
      fetch(`/api/agency/deals/${numericId}/brief`, { headers: authHeaders() }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`/api/deals/${numericId}`, { headers: authHeaders() }).then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([brief, detail]) => {
        if (cancelled) return;
        setDealBrief(brief as MobileDealBrief | null);
        setRealDetail(detail as MobileDealDetail | null);
      })
      .finally(() => {
        if (!cancelled) setBriefLoading(false);
      });
    return () => { cancelled = true; };
  }, [numericId]);

  /* Pull the real verdict + fit from the sample deal bank so the page reflects
     this specific deal — not a hardcoded "Pursue / 92" that contradicts what
     Yulia says in chat. Falls back to "watch / 70" for unknown ids so the
     page still renders cleanly. */
  const deal = findDeal(dealId);
  const isSampleDeal = Boolean(deal);
  const verdict: Verdict = deal?.verdict ?? "watch";
  const fit = dealBrief?.verdict?.score ?? deal?.fit ?? 70;
  const real = realDetail?.deal;
  const dealSub = real
    ? [
        fmtMoney(real.revenue, "revenue"),
        real.location || null,
        real.industry || null,
      ].filter(Boolean).join(" · ")
    : deal?.sub ?? "";
  /* Per-deal verdict reasoning beats the generic blurb when present.
     This is what answers the user's "is this a watch or pursue?" question
     by spelling out the specific math + the criteria that would flip it. */
  const verdictBlurb = dealBrief?.verdict?.text
    ?? deal?.verdictWhy
    ?? (numericId !== null
      ? "Yulia needs a refreshed deal brief before this page should show deal-specific next moves."
      : VERDICT_BLURB[verdict]);
  const readBullets = dealBrief?.marketRead?.bullets?.filter(Boolean).slice(0, 3) ?? [];
  const sourceGaps = dealBrief?.marketRead?.researchNeeded?.filter(Boolean).slice(0, 3) ?? [];
  const liveNextMoves = dealBrief?.nextMoves?.filter(move => move.title || move.prompt).slice(0, 3) ?? [];
  const hasLiveYuliaRead = Boolean(dealBrief);
  const readSectionTitle = hasLiveYuliaRead
    ? "Yulia's sourced read"
    : isSampleDeal
      ? "Sample Yulia read"
      : "Yulia's read is needed";
  const reviewTitle = hasLiveYuliaRead ? "Yulia review" : isSampleDeal ? "Sample review" : "Generate Yulia's review";
  const recommendationTitle = hasLiveYuliaRead ? "Yulia next moves" : isSampleDeal ? "Sample next moves" : "Ask Yulia for options";

  const onShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: dealTitle, url });
        return;
      } catch { /* user cancelled */ }
    }
    // Desktop / unsupported: copy URL to clipboard.
    try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
  };

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 140, position: "relative", background: "var(--mb-bg)" }}>
      <FloatingNav onBack={onBack} onShare={onShare} />

      {/* Hero block — original side-by-side layout. The verdict pill on
          the left is Yulia's CALL (read-only label). The Watch pill on
          the right is the user's ACTION (toggle). Visually distinct
          treatments + the "Yulia's verdict" caption underneath make the
          intent clear without extra UI clutter. */}
      <div style={D.hero}>
        <FitGauge score={fit} verdict={verdict} size={108} strokeRatio={0.09} />
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <h1 style={D.h1}>{dealTitle}</h1>
          <div style={D.dealMeta}>{dealSub || "Sample deal"}</div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              ...D.verdictBadge,
              background: VERDICT_BG[verdict],
              color: VERDICT_INK[verdict],
            }}>
              <span
                aria-hidden="true"
                style={{ ...D.verdictDot, background: VERDICT_DOT[verdict] }}
              />
              {VERDICT_LABEL[verdict]}
            </span>
            <button
              type="button"
              aria-pressed={watched}
              onClick={() => toggle(dealId, dealTitle)}
              style={{
                ...D.watchBtn,
                background: watched ? "var(--mb-accent-ink)" : "var(--mb-accent-soft)",
                color: watched ? "#fff" : "var(--mb-accent-ink)",
              }}
            >{watched ? "✓ Watching" : "+ Watch"}</button>
          </div>
          <div style={D.verdictCaption}>
            <span style={{ color: "var(--mb-ink-3)" }}>{VERDICT_LABEL[verdict]}</span>
            {" is Yulia's verdict — Watch saves it to your list."}
          </div>
        </div>
      </div>

      {/* Stats strip — FIT SCORE removed since the hero gauge already
          carries it; replaced with EBITDA so the user sees both
          earnings views at once. */}
      <div style={D.statsStrip}>
        <Stat top="$1.80M" label="NORM. SDE" sub={<span style={{ color: "var(--mb-accent)" }}>+$760K</span>} divider />
        <Stat top="$2.10M" label="EBITDA"    sub="adj." divider />
        <Stat top="7.0×"   label="MULTIPLE"  sub="SBA-clear" divider />
        <Stat top="#3"     label="THIS WEEK" sub="of 142" />
      </div>

      {/* Tag chips */}
      <div className="mb-hide-scroll" style={D.tagsRow}>
        {["Industrial", "Services", "Recurring", "SBA-clear", "Sun Belt"].map(t => (
          <div key={t} style={D.tag}>{t}</div>
        ))}
      </div>

      {/* Yulia's read. Live briefs come from the briefing layer; sample
          copy is labeled as sample; real deals without a brief show a
          refresh/request state instead of pretending a card authored it. */}
      <Section title={readSectionTitle} chevron>
        <div className="mb-mono" style={D.versionLine}>
          {hasLiveYuliaRead
            ? "FROM YULIA'S DEAL BRIEF"
            : isSampleDeal
              ? "SAMPLE MODE · DEMO READ"
              : briefLoading
                ? "YULIA IS REFRESHING THIS DEAL"
                : "NO SOURCED DEAL BRIEF YET"}
        </div>
        <p style={D.body}>
          {dealBrief?.marketRead?.headline
            || (isSampleDeal
              ? "Recast is real. Clean add-backs and durable customer tenure support the pursue call, but working-capital and source-material gaps still need review before documents move."
              : "Yulia has not generated a sourced read for this deal yet. Run market intelligence or ask Yulia for the deal read so the page can show live analysis-backed next moves.")}
        </p>
        {(readBullets.length > 0 || sourceGaps.length > 0) && (
          <div style={D.readBulletStack}>
            {[...readBullets, ...sourceGaps].slice(0, 3).map((bullet, index) => (
              <button
                key={`${bullet}-${index}`}
                type="button"
                className="mb-tap"
                style={D.readBullet}
                onClick={() => runMobileDealAction({
                  actionId: "run_market_intelligence",
                  title: "Unpack the market signal",
                  prompt: `On ${dealTitle}: unpack this Yulia deal-read signal in the market intelligence canvas: ${bullet}`,
                }, { dealId, dealTitle, onRunAnalysis, onAskYulia })}
              >
                <span>{bullet}</span>
                <MobileIcon name="chevron" size={11} c="var(--mb-ink-3)" />
              </button>
            ))}
          </div>
        )}
        {!hasLiveYuliaRead && !isSampleDeal && (
          <button
            type="button"
            className="mb-tap"
            onClick={() => runMobileDealAction({
              actionId: "run_market_intelligence",
              title: "Generate Yulia's sourced read",
	              prompt: `On ${dealTitle}: generate the sourced deal read, then return next action options with action IDs.`,
            }, { dealId, dealTitle, onRunAnalysis, onAskYulia })}
            style={D.marketAskBtn}
          >
            <span>{briefLoading ? "Refreshing..." : "Generate the read"}</span>
            <MobileIcon name="chevron" size={11} c="var(--mb-accent-ink)" />
          </button>
        )}
      </Section>

      {/* A closer look — horizontal artifact rail */}
      <Section title="A closer look" pad={false}>
        <div className="mb-hide-scroll" style={D.artifactsRow}>
          <ArtifactPreview kind="recast" title="Recast walk" big={fmtMoney(real?.sde, "SDE") || "$1.80M"} sub="Open the recast canvas" onTap={() => {
            runMobileDealAction({
              actionId: "run_recast_analysis",
              title: "Open recast analysis",
              prompt: `On ${dealTitle}: open the recast analysis canvas with source-backed add-backs and sliders where assumptions apply.`,
            }, { dealId, dealTitle, onRunAnalysis, onAskYulia });
          }} />
          <ArtifactPreview kind="baseline" title="Scenario model" big="Sliders" sub="Structure, price, downside" onTap={() => {
            runMobileDealAction({
              actionId: "run_sensitivity_analysis",
              title: "Open scenario model",
              prompt: `On ${dealTitle}: open the interactive sensitivity/scenario model with sliders and saved cases.`,
            }, { dealId, dealTitle, onRunAnalysis, onAskYulia });
          }} />
          <ArtifactPreview kind="buyers" title="Buyer pool" big={deal?.marketIntel?.activeBuyers?.split("·")[0]?.trim() || "Rank"} sub="Open buyer-fit canvas" onTap={() => {
            runMobileDealAction({
              actionId: "run_buyer_fit_analysis",
              title: "Open buyer fit",
              prompt: `On ${dealTitle}: open buyer-fit analysis with strategic and sponsor split, fit reasoning, and outreach priority.`,
            }, { dealId, dealTitle, onRunAnalysis, onAskYulia });
          }} />
          <ArtifactPreview kind="ioi" title="Primary draft" big="Draft" sub="Ask Yulia to generate" onTap={() => {
            runMobileDealAction({
              actionId: "generate_primary_deliverable",
              title: "Generate primary draft",
              prompt: `On ${dealTitle}: generate the next primary deal document from current deal context, then open it as work product.`,
            }, { dealId, dealTitle, onRunAnalysis, onAskYulia });
          }} />
        </div>
      </Section>

      <Section title={reviewTitle} chevron>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 4 }}>
          <div>
            <div style={D.bigNumber}>{hasLiveYuliaRead ? `${Math.round(fit)}` : isSampleDeal ? "4.6" : "—"}</div>
            <div style={D.bigNumberSub}>{hasLiveYuliaRead ? "fit score" : "out of 5"}</div>
          </div>
          <div style={{ flex: 1 }}>
            <Stars n={hasLiveYuliaRead ? Math.max(1, Math.min(5, fit / 20)) : isSampleDeal ? 4.6 : 0} size={14} />
            <div style={{ fontSize: 13, color: "var(--mb-ink-3)", marginTop: 4 }}>
              {hasLiveYuliaRead ? "Yulia's confidence" : isSampleDeal ? "Sample confidence" : "Awaiting sourced brief"}
            </div>
            <div style={D.confidenceBody}>
              {verdictBlurb}
            </div>
          </div>
        </div>

        <div style={D.userNote}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Stars n={hasLiveYuliaRead ? Math.max(1, Math.min(5, fit / 20)) : isSampleDeal ? 5 : 0} size={11} />
            <span style={{ fontSize: 12, color: "var(--mb-ink-3)" }}>&middot;&nbsp;{hasLiveYuliaRead ? "Yulia's sourced read" : isSampleDeal ? "sample read" : "needs refresh"}</span>
          </div>
          <div style={D.userNoteTitle}>
            {dealBrief?.verdict?.label || (isSampleDeal ? "Worth the call. Pre-qualify structure today." : "Generate the deal read before acting.")}
          </div>
          <div style={D.userNoteBody}>
            {dealBrief?.taxLegal?.legal || dealBrief?.taxLegal?.tax || (isSampleDeal
              ? "The sample recast holds, but structure, working-capital, and counsel/CPA sign-off still decide how the next document moves."
              : "Yulia needs current deal files, market intelligence, and analysis results before this surface should show judgment-bearing commentary.")}
          </div>
        </div>
      </Section>

      <Section title={recommendationTitle} chevron={false}>
        {(liveNextMoves.length > 0 ? liveNextMoves : defaultMobileNextMoves(dealTitle, isSampleDeal)).map((move, index, rows) => (
          <NextAction
            key={`${move.title || move.actionId || "move"}-${index}`}
            eyebrow={mobileActionEyebrow(move.actionId)}
            title={move.title || "Ask Yulia for the next move"}
	            sub={move.why || "Open the right analysis, document, or chat context from Yulia's next move."}
            last={index === rows.length - 1}
            onTap={() => runMobileDealAction(move, { dealId, dealTitle, onRunAnalysis, onAskYulia })}
          />
        ))}
      </Section>

      {/* Deal-context chat input — tappable field at the bottom that
          opens chat with the deal already in context. Whatever the
          user types becomes a starter prompt scoped to this deal. */}
      <DealChatInput dealTitle={dealTitle} onAskYulia={onAskYulia} />

      {/* Market intelligence — below the chat pill in its own section.
          Per-deal data lives on SampleDeal.marketIntel; in production
          this will be wired to the marketIntelligence subsystem so each
          deal pulls fresh comps, multiples, buyer activity. Hidden
          gracefully when no data on the deal. */}
      {deal?.marketIntel && (
        <Section title="Market intelligence" chevron>
          <div style={D.marketIntroLine}>
            <span className="mb-mono" style={D.marketIndustry}>
              {deal.marketIntel.industry.toUpperCase()}
              {deal.marketIntel.naics && ` · NAICS ${deal.marketIntel.naics}`}
            </span>
          </div>
          <div style={D.marketGrid}>
            <MarketTile label="AVG MULTIPLE"  value={deal.marketIntel.avgMultiple} />
            <MarketTile label="AVG DEAL SIZE" value={deal.marketIntel.avgDealSize} />
            <MarketTile label="ACTIVE BUYERS" value={deal.marketIntel.activeBuyers} />
            <MarketTile label="MARKET TREND"  value={deal.marketIntel.yoyActivity} />
          </div>
          <p style={D.marketBlurb}>{deal.marketIntel.blurb}</p>
          <button
            type="button"
            className="mb-tap"
            onClick={() => {
              const prompt = `On ${dealTitle}: deeper market intelligence — recent comparable transactions, who else is bidding, where multiples are trending. Open the market intelligence analysis canvas.`;
              if (onRunAnalysis) {
                onRunAnalysis({ dealId, dealTitle, analysisType: "market_intelligence", menuItemSlug: "universal-market-intelligence", label: "market intelligence read", prompt });
              } else {
                onAskYulia(prompt);
              }
            }}
            style={D.marketAskBtn}
          >
            <span>Ask Yulia for the deeper market read</span>
            <MobileIcon name="chevron" size={11} c="var(--mb-accent-ink)" />
          </button>
        </Section>
      )}
    </div>
  );
}

/* ─── Market-intelligence tile ───────────────────────────── */

function MarketTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={D.marketTile}>
      <div className="mb-mono" style={D.marketTileLabel}>{label}</div>
      <div style={D.marketTileValue}>{value}</div>
    </div>
  );
}

/* ─── Recommended-action row ─────────────────────────────── */

function NextAction({
  eyebrow, title, sub, last, onTap,
}: { eyebrow: string; title: string; sub: string; last?: boolean; onTap: () => void }) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 0",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mb-mono" style={D.nextEyebrow}>{eyebrow}</div>
        <div style={D.nextTitle}>{title}</div>
        <div style={D.nextSub}>{sub}</div>
      </div>
      <MobileIcon name="chevron" size={12} c="var(--mb-ink-3)" />
    </div>
  );
}

/* ─── Deal-context chat input ────────────────────────────── */

function DealChatInput({
  dealTitle, onAskYulia,
}: { dealTitle: string; onAskYulia: (prompt: string) => void }) {
  return (
    <div style={D.chatInputWrap}>
      <div className="mb-mono" style={D.chatInputEyebrow}>
        ASK YULIA · ABOUT THIS DEAL
      </div>
      <ChatStarterPill
        placeholder="Message Yulia"
        ariaLabel={`Message Yulia about ${dealTitle}`}
        onSend={(message) => onAskYulia(`About ${dealTitle}: ${message}`)}
      />
    </div>
  );
}

/* ─── Floating glass back/share nav ──────────────────────── */

function FloatingNav({ onBack, onShare }: { onBack: () => void; onShare: () => void }) {
  return (
    <>
      <div style={D.navTopGuard} aria-hidden="true" />
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{ ...D.navBtn, top: 18, left: 16 }}
      >
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button
        type="button"
        onClick={onShare}
        aria-label="Share"
        style={{ ...D.navBtn, top: 18, right: 16 }}
      >
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>
    </>
  );
}

/* ─── Stat cell ─────────────────────────────────────────── */

function Stat({ top, label, sub, divider }: { top: string; label: string; sub: ReactNode; divider?: boolean }) {
  return (
    <div style={{
      borderRight: divider ? "0.5px solid var(--mb-line-2)" : "none",
      padding: "0 4px", minWidth: 0,
    }}>
      <div style={D.statLabel}>{label}</div>
      <div style={D.statTop}>{top}</div>
      <div style={D.statSub}>{sub}</div>
    </div>
  );
}

/* ─── Stars (filled / half / empty) ─────────────────────── */

function Stars({ n, size = 12 }: { n: number; size?: number }) {
  const full = Math.floor(n);
  const half = n - full >= 0.3 && n - full <= 0.7;
  return (
    <span style={{ display: "inline-flex", gap: 1.5, color: "var(--mb-ink-1)" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <MobileIcon
          key={i}
          name="star"
          size={size}
          c={i < full ? "var(--mb-ink-1)" : (i === full && half ? "var(--mb-ink-1)" : "var(--mb-ink-5)")}
        />
      ))}
    </span>
  );
}

/* ─── Section ──────────────────────────────────────────── */

function Section({ title, chevron, pad = true, children }: {
  title: string; chevron?: boolean; pad?: boolean; children: ReactNode;
}) {
  return (
    <div style={{
      borderTop: "0.5px solid var(--mb-line-2)",
      padding: pad ? "20px 22px 22px" : "20px 0 22px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: pad ? 0 : "0 22px",
        marginBottom: 10,
      }}>
        <h3 style={D.sectionTitle}>
          {title}
          {chevron && <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Artifact preview card ─────────────────────────────── */

type ArtifactKind = "recast" | "baseline" | "buyers" | "ioi";

// Each artifact card is a texture + tinted overlay (kept for white text
// legibility), except "ioi" which stays as the formal dark slate card —
// textures would weaken the IOI/LOI doc gravitas.
/* Artifact previews use the lighter overlay recipe — multiply blend was
   muddying the watercolor into brown. Normal compositing + lighter stops
   keeps the verdict colors vivid. */
const ARTIFACT_BG: Record<ArtifactKind, string> = {
  recast:
    `linear-gradient(160deg, rgba(48,108,80,0.44) 0%, rgba(18,68,46,0.74) 100%), url('${RANDOM_TEXTURES.cardPursue}')`,
  baseline:
    `linear-gradient(160deg, rgba(60,108,168,0.44) 0%, rgba(25,68,118,0.74) 100%), url('${RANDOM_TEXTURES.cardBaseline}')`,
  buyers:
    `linear-gradient(160deg, rgba(95,68,150,0.44) 0%, rgba(60,38,108,0.74) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
  ioi:
    "linear-gradient(160deg, #3A4150, #1A2233)",
};

const ARTIFACT_GLOW: Record<ArtifactKind, string> = {
  recast:   "0 12px 30px -10px rgba(48,108,80,0.32)",
  baseline: "0 12px 30px -10px rgba(60,108,168,0.32)",
  buyers:   "0 12px 30px -10px rgba(95,68,150,0.32)",
  ioi:      "0 12px 30px -10px rgba(58,65,80,0.32)",
};

function ArtifactPreview({
  kind, title, big, sub, onTap,
}: { kind: ArtifactKind; title: string; big: string; sub: string; onTap: () => void }) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      style={{
        flexShrink: 0, width: 220,
        borderRadius: 18,
        backgroundImage: ARTIFACT_BG[kind],
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // Multiply removed — was muddying the watercolor texture into
        // brown. Normal compositing keeps colors vivid.
        color: "#fff", overflow: "hidden", position: "relative",
        boxShadow:
          ARTIFACT_GLOW[kind] + "," +
          "0 6px 18px -8px rgba(0,0,0,0.22)," +
          "inset 0 1px 0 rgba(255,255,255,0.22)," +
          "inset 0 -1px 0 rgba(0,0,0,0.18)",
        cursor: "pointer",
      }}
    >
      <div style={{ height: 130, position: "relative" }}>
        <div style={D.artifactGlow} aria-hidden="true" />
        <div className="mb-mono" style={D.artifactCaption}>{title.toUpperCase()}</div>
        <div style={D.artifactBig}>{big}</div>
      </div>
      <div style={D.artifactFooter}>
        <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.3 }}>{sub}</div>
        <button
          type="button"
          className="mb-get-pill dark"
          style={{ padding: "4px 14px", fontSize: 12 }}
          onClick={(e) => { e.stopPropagation(); onTap(); }}
        >Open</button>
      </div>
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  hero: {
    padding: "60px 22px 18px",
    display: "flex", gap: 14, alignItems: "flex-start",
  },
  h1: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px", lineHeight: 1.1,
    margin: 0, color: "var(--mb-ink)",
    textWrap: "balance",
  },
  dealMeta: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 4,
    lineHeight: 1.35, textWrap: "pretty",
  },

  /* Verdict badge — flat label with dot prefix. NO shadow, NO button
     affordance. The dot + dark colored text on soft tint reads as a
     status tag, not a tappable element. Different shape/treatment from
     the Watch button next to it. */
  verdictBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px",
    fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
    borderRadius: 999,
  },
  verdictDot: {
    width: 7, height: 7, borderRadius: "50%",
    flexShrink: 0,
  },

  /* Watch button — clearly tappable. Solid pill with shadow + iconographic
     prefix so the affordance is unambiguous next to the verdict badge. */
  watchBtn: {
    padding: "6px 16px",
    fontSize: 13, fontWeight: 700, letterSpacing: "-0.1px",
    border: "none", borderRadius: 999, cursor: "pointer",
    transition: "background-color 200ms ease, color 200ms ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    minWidth: 100,
  },

  /* Caption clarifies what each pill means — the verdict is informational,
     Watch is the user's action. */
  verdictCaption: {
    fontSize: 11, color: "var(--mb-ink-4)", marginTop: 6,
    lineHeight: 1.35,
  },
  statsStrip: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    padding: "4px 22px 18px",
    gap: 0,
  },
  statLabel: {
    fontSize: 10, color: "var(--mb-ink-4)",
    letterSpacing: 0.1, fontWeight: 600,
  },
  statTop: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 18, letterSpacing: "-0.4px",
    color: "var(--mb-ink)", marginTop: 2,
  },
  statSub: {
    fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2,
  },
  tagsRow: {
    display: "flex", gap: 8,
    padding: "0 22px 20px",
    overflowX: "auto",
  },
  tag: {
    padding: "7px 14px", borderRadius: 999,
    background: "var(--mb-card-2)",
    fontSize: 13, color: "var(--mb-ink-1)", fontWeight: 500,
    whiteSpace: "nowrap",
  },
  versionLine: {
    fontSize: 12, color: "var(--mb-ink-4)", marginBottom: 6,
  },
  body: {
    fontSize: 15, color: "var(--mb-ink-1)", lineHeight: 1.45,
    margin: 0, letterSpacing: "-0.1px",
    textWrap: "pretty",
  },
  readBulletStack: {
    display: "grid",
    gap: 8,
    marginTop: 14,
  },
  readBullet: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "11px 12px",
    border: "0.5px solid var(--mb-line-2)",
    borderRadius: 13,
    background: "var(--mb-card-2)",
    color: "var(--mb-ink-1)",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.35,
    textAlign: "left",
    cursor: "pointer",
  },
  sectionTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px",
    color: "var(--mb-ink)",
    margin: 0,
    display: "flex", alignItems: "center", gap: 6,
  },
  artifactsRow: {
    display: "flex", gap: 14,
    padding: "4px 22px 4px",
    overflowX: "auto",
  },
  artifactGlow: {
    position: "absolute", top: -30, right: -20,
    width: 140, height: 140, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
  },
  artifactCaption: {
    position: "absolute", bottom: 12, left: 16,
    fontSize: 10, letterSpacing: 0.1,
    color: "#fff",
  },
  artifactBig: {
    position: "absolute", bottom: 24, left: 16,
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 36, letterSpacing: "-1px", lineHeight: 1,
    color: "#fff",
  },
  artifactFooter: {
    padding: "10px 14px 12px",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.14), transparent 40%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.018))",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    borderTop: "0.5px solid rgba(255,255,255,0.32)",
    boxShadow:
      "0 12px 28px -20px rgba(0,0,0,0.46), " +
      "inset 0 1px 0 rgba(255,255,255,0.30), " +
      "inset 0 -1px 0 rgba(255,255,255,0.04)",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
  },
  bigNumber: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 56, letterSpacing: "-2px", lineHeight: 1,
    color: "var(--mb-ink)",
  },
  bigNumberSub: {
    fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2,
  },
  confidenceBody: {
    marginTop: 6, fontSize: 12.5, color: "var(--mb-ink-2)", lineHeight: 1.4,
    textWrap: "pretty",
  },
  userNote: {
    marginTop: 16, padding: 14,
    background: "var(--mb-card-2)", borderRadius: 14,
  },
  userNoteTitle: {
    fontSize: 14, fontWeight: 600, color: "var(--mb-ink)", marginBottom: 4,
  },
  userNoteBody: {
    fontSize: 13, color: "var(--mb-ink-2)", lineHeight: 1.4,
    textWrap: "pretty",
  },
  navTopGuard: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 60, background: "transparent", zIndex: 5,
  },
  navBtn: {
    position: "absolute", zIndex: 10,
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },

  /* Market intelligence section */
  marketIntroLine: {
    marginBottom: 12,
  },
  marketIndustry: {
    fontSize: 10.5, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  marketGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  marketTile: {
    background: "var(--mb-card-2)",
    borderRadius: 12,
    padding: "12px 14px",
    border: "0.5px solid var(--mb-line-2)",
  },
  marketTileLabel: {
    fontSize: 9.5, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-4)",
    marginBottom: 4,
  },
  marketTileValue: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 16, letterSpacing: "-0.3px", lineHeight: 1.2,
    color: "var(--mb-ink)",
  },
  marketBlurb: {
    fontSize: 14, color: "var(--mb-ink-1)", lineHeight: 1.5,
    margin: 0, letterSpacing: "-0.05px",
    textWrap: "pretty",
  },
  marketAskBtn: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    background: "var(--mb-accent-soft)",
    border: "none",
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontSize: 13.5, fontWeight: 600,
    color: "var(--mb-accent-ink)",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* Yulia next-action rows */
  nextEyebrow: {
    fontSize: 10, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-3)", textTransform: "uppercase",
    marginBottom: 2,
  },
  nextTitle: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px", lineHeight: 1.25,
  },
  nextSub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 2,
    lineHeight: 1.35,
  },

  /* Deal-context chat input — the light-grey wrapper holds the eyebrow
     plus an inner pill that matches the ChatSheet composerPill exactly,
     so the user feels they're already inside the chat from the deal
     page. Clicking → opens ChatSheet with this deal pre-loaded. */
  chatInputWrap: {
    margin: "8px 16px 0",
    padding: "16px 14px 16px",
    background: "var(--mb-card-2)",
    borderRadius: 18,
    border: "0.5px solid var(--mb-line-2)",
  },
  chatInputEyebrow: {
    fontSize: 10.5, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-3)", marginBottom: 10, paddingLeft: 4,
  },
  chatInputForm: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 20,
    padding: 6,
    paddingLeft: 14,
    display: "flex", alignItems: "flex-end", gap: 8,
    boxShadow: "0 6px 20px -6px rgba(0,0,0,0.12)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  chatInputField: {
    flex: 1, minWidth: 0,
    border: "none", outline: "none", background: "transparent",
    fontFamily: "var(--mb-font-body)",
    fontSize: 16, lineHeight: 1.4,
    color: "var(--mb-ink)",
    padding: "8px 4px",
  },
  chatInputSend: {
    flexShrink: 0,
    width: 32, height: 32, borderRadius: "50%",
    border: "none",
    background: "var(--mb-action)",
    color: "#fff",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 160ms ease-out, background-color 200ms ease",
  },
};
