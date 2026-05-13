import { useState, type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import { V6DealCard, type Verdict } from "./cards";
import type { OpenTab } from "../types";
import { DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { DESKTOP_TEXTURES } from "../../../lib/randomTextures";
import type { ModelPreference } from "../../../lib/modelPreference";
import {
  actionDealTitle,
  generateActionDeliverable,
  pickActionDeal,
  primaryAnalysisActionForJourney,
  primaryDocForJourney,
  runActionAnalysis,
} from "../../../lib/v6ActionContracts";

interface PipelineDeal {
  verdict: Verdict;
  id: string;
  name: string;
  sub: string;
  fit: number;
  sde: string;
  multiple: string;
  note: string;
}

const SAMPLE_DEALS: PipelineDeal[] = [
  { verdict: "pursue", id: "deal-bigfake", name: "Big Fake Deal", sub: "$5.4M · East Texas", fit: 92, sde: "$1.80M", multiple: "7.0x", note: "Recurring revenue. Honest add-backs. Working-cap language needs one more pass." },
  { verdict: "pursue", id: "deal-pest", name: "Pest Control · FL", sub: "$2.1M · recurring route density", fit: 88, sde: "$1.40M", multiple: "6.5x", note: "Route density is stronger than first read. Ask for churn by route before moving up." },
  { verdict: "watch", id: "deal-hvac", name: "HVAC platform · CO", sub: "$4.8M · service mix under review", fit: 71, sde: "$0.95M", multiple: "6.8x", note: "Clean financials, but succession risk is still the story." },
  { verdict: "watch", id: "deal-electrical", name: "Electrical Contractor · TX", sub: "$8.7M · Austin", fit: 78, sde: "$2.10M", multiple: "6.0x", note: "Margins are good. Customer concentration keeps it from being a pursue yet." },
  { verdict: "pass", id: "deal-dist", name: "Distribution · OH", sub: "$11.2M · Cleveland", fit: 61, sde: "$1.55M", multiple: "8.5x", note: "Asking is rich, margins are thin, and inventory turns are slowing." },
];

interface PipelineRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  modelPreference?: ModelPreference;
}

export function V6PipelineRoot({ openTab, onTalkToYulia, user, modelPreference }: PipelineRootProps) {
  const home = useHomeDeals(user);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const useSampleData = !home.isAuthed || DEV_AUTH_BYPASS;
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const deals = useSampleData ? SAMPLE_DEALS : realDeals.map(dealToPipelineDeal);

  const pursue = deals.filter(d => d.verdict === "pursue");
  const watch = deals.filter(d => d.verdict === "watch");
  const pass = deals.filter(d => d.verdict === "pass");
  const actionDeal = useSampleData ? null : pickActionDeal(realDeals);

  const runPipelineAction = async (action: "drafts" | "analysis" | "buyers") => {
    setActionError(null);
    setActionNote(null);

    if (action === "buyers") {
      const deal = actionDeal;
      openTab({ id: "search-root", kind: "mode-root", modeId: "search", title: "Search" });
      onTalkToYulia?.(deal
        ? `Find buyers, buyer pools, lenders, and deal professionals for ${actionDealTitle(deal)}. Use the deal context and return ranked next outreach.`
        : "Find buyers, buyer pools, lenders, and deal professionals for the most promising deal in the pipeline.");
      return;
    }

    if (action === "drafts") {
      const deal = actionDeal;
      if (!deal) {
        openTab({ kind: "deal", id: "deal-bigfake", title: "Big Fake Deal", fileScope: "all" });
        onTalkToYulia?.("Open the draft documents that need my review.");
        return;
      }
      const doc = primaryDocForJourney(journeyFromHomeDeal(deal));
      setBusyAction(action);
      try {
        await generateActionDeliverable({
          deal,
          slug: doc.slug,
          label: doc.label,
          openTab,
          modelPreference,
          onNote: setActionNote,
        });
      } catch (e: any) {
        setActionError(e?.message || "Could not open or generate the draft.");
      } finally {
        setBusyAction(null);
      }
      return;
    }

    const deal = actionDeal;
    if (!deal) {
      openTab({ kind: "analysis", title: "New SBA structure analysis", tool: "tool-sba" });
      onTalkToYulia?.("Run the most useful analysis on the active sample deal.");
      return;
    }
    const analysis = primaryAnalysisActionForJourney(journeyFromHomeDeal(deal));
    setBusyAction(action);
    try {
      await runActionAnalysis({
        deal,
        analysisType: analysis.analysisType,
        menuItemSlug: analysis.menuItemSlug,
        label: analysis.label,
        openTab,
        modelPreference,
        requestedFrom: "pipeline_quick_action",
        onNote: setActionNote,
      });
    } catch (e: any) {
      setActionError(e?.message || "Could not run analysis.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="m-fade-up">
      <section style={P.hero}>
        <div style={P.heroCopy}>
          <div className="mono" style={P.eyebrow}>PIPELINE</div>
          <h1 style={P.title}>Every deal, ranked by what deserves attention.</h1>
          <p style={P.sub}>Same hierarchy as mobile: pursue, watch, pass, and the files or analyses behind each deal.</p>
        </div>
        <div style={P.stats}>
          <PipelineStat label="Pursue" value={pursue.length} tone="#92E1BC" />
          <PipelineStat label="Watch" value={watch.length} tone="#F3D38C" />
          <PipelineStat label="Pass" value={pass.length} tone="#F0A49C" />
        </div>
      </section>

      <V6Section
        eyebrow="IN REVIEW"
        title="Live deals"
        sub="Open a deal to review Yulia's read, linked files, and current action."
        action={
          <button className="m-btn tonal" onClick={() => onTalkToYulia?.("Rank my pipeline by what deserves attention today.")} type="button">
            Ask Yulia to rank
          </button>
        }
      >
        <div style={P.dealGrid}>
          {deals.length === 0 && (
            <div style={P.emptyCard}>
              <strong>No deals yet</strong>
              <span>Start with a chat, source file, thesis, target, or buyer pool and Yulia will create the first deal workspace.</span>
              <button className="m-btn tonal" onClick={() => onTalkToYulia?.("Help me create my first deal workspace.")} type="button">
                Start with Yulia
              </button>
            </div>
          )}
          {deals.map(deal => (
            <V6DealCard
              key={deal.id}
              {...deal}
              onClick={() => openTab({ kind: "deal", id: deal.id, title: deal.name })}
            />
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="NEXT MOVES" title="Pipeline actions">
        {(actionError || actionNote) && (
          <div style={actionError ? P.actionError : P.actionNote}>
            {actionError || actionNote}
          </div>
        )}
        <div style={P.actionGrid}>
          {[
            { action: "drafts", title: "Review drafts", sub: "Open docs Yulia is shaping before they go to the data room.", icon: "doc", tone: "gold" },
            { action: "analysis", title: "Run analysis", sub: "Recast, comps, buyer fit, SBA structure, and risk notes.", icon: "chart", tone: "blue" },
            { action: "buyers", title: "Find buyers", sub: "Start a discovery search from a selected deal thesis.", icon: "search", tone: "green" },
          ].map(({ action, title, sub, icon, tone }) => (
            <button
              key={title}
              style={{ ...P.actionCard, ...pipelineActionTone(tone as "gold" | "blue" | "green") }}
              onClick={() => { void runPipelineAction(action as "drafts" | "analysis" | "buyers"); }}
              type="button"
              disabled={busyAction === action}
            >
              <span style={P.actionIcon}><V6Icon name={icon as "doc" | "chart" | "search"} size={16} /></span>
              <span style={P.actionText}>
                <strong>{busyAction === action ? "Working..." : title}</strong>
                <span>{sub}</span>
              </span>
            </button>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

function PipelineStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div style={P.stat}>
      <span className="mono" style={P.statLabel}>{label}</span>
      <strong style={{ ...P.statValue, color: tone }}>{value}</strong>
    </div>
  );
}

function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "--";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

function fitFromEbitda(ebitda: number | null | undefined): number {
  if (!ebitda) return 68;
  const m = ebitda / 100_000_000;
  if (m >= 5) return 92;
  if (m >= 3) return 86;
  if (m >= 2) return 80;
  if (m >= 1) return 74;
  return 68;
}

function verdictFromGate(gate: string): Verdict {
  if (/[345]$/.test(gate)) return "pursue";
  if (/[12]$/.test(gate)) return "watch";
  return "watch";
}

function dealToPipelineDeal(d: HomeDeal): PipelineDeal {
  const sde = fmtCents(d.sde);
  return {
    verdict: verdictFromGate(d.current_gate),
    id: String(d.id),
    name: d.business_name || d.industry || `Deal #${d.id}`,
    sub: `${fmtCents(d.revenue)} · ${d.location || d.industry || "active deal"}`,
    fit: fitFromEbitda(d.ebitda),
    sde,
    multiple: d.financials?.multiple ? `${d.financials.multiple.toFixed(1)}x` : "--",
    note: d.financials?.notes || `${sde} SDE · ${d.current_gate}`,
  };
}

function journeyFromHomeDeal(d: HomeDeal): string {
  if (d.current_gate?.startsWith("S")) return "sell";
  if (d.current_gate?.startsWith("R")) return "raise";
  if (d.current_gate?.startsWith("P")) return "pmi";
  return "buy";
}

const pipelineHeroWash = `linear-gradient(135deg, rgba(16,25,58,0.70) 0%, rgba(65,76,132,0.50) 48%, rgba(19,47,70,0.70) 100%), url('${DESKTOP_TEXTURES.pipelineHero}')`;

function pipelineActionTone(tone: "gold" | "blue" | "green"): CSSProperties {
  const tones: Record<"gold" | "blue" | "green", CSSProperties> = {
    gold: {
      background: "linear-gradient(145deg, rgba(255,252,244,0.98) 0%, rgba(246,221,177,0.92) 100%)",
      color: "#74501B",
      borderColor: "rgba(214,163,92,0.24)",
      boxShadow: "0 24px 58px rgba(156,113,40,0.14), 0 7px 18px rgba(26,34,51,0.08)",
    },
    blue: {
      background: "linear-gradient(145deg, rgba(250,253,255,0.98) 0%, rgba(221,236,248,0.92) 100%)",
      color: "#285B89",
      borderColor: "rgba(106,155,204,0.24)",
      boxShadow: "0 24px 58px rgba(61,105,150,0.14), 0 7px 18px rgba(26,34,51,0.08)",
    },
    green: {
      background: "linear-gradient(145deg, rgba(249,253,251,0.98) 0%, rgba(220,240,231,0.92) 100%)",
      color: "#2F6C55",
      borderColor: "rgba(98,153,135,0.24)",
      boxShadow: "0 24px 58px rgba(63,125,100,0.14), 0 7px 18px rgba(26,34,51,0.08)",
    },
  };
  return tones[tone];
}

const P: Record<string, CSSProperties> = {
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.38fr)",
    alignItems: "stretch",
    gap: 20,
    minHeight: 320,
    marginBottom: 34,
    padding: 30,
    borderRadius: 26,
    backgroundImage: pipelineHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.30)",
    boxShadow: "0 36px 96px rgba(37,46,82,0.28), 0 10px 26px rgba(17,24,39,0.14), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  heroCopy: {
    alignSelf: "end",
    maxWidth: 900,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
  },
  title: {
    margin: "8px 0 0",
    maxWidth: 880,
    fontSize: "clamp(44px, 5vw, 72px)",
    lineHeight: 0.92,
    letterSpacing: "-0.06em",
    textWrap: "balance",
    color: "#FFFFFF",
  },
  sub: {
    margin: "16px 0 0",
    maxWidth: 680,
    fontSize: 16,
    lineHeight: 1.55,
    color: "#FFFFFF",
  },
  stats: {
    display: "grid",
    gap: 12,
    alignContent: "end",
  },
  stat: {
    minHeight: 76,
    padding: 18,
    borderRadius: 20,
    background: "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.24), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))",
    border: "0.5px solid rgba(255,255,255,0.36)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.32), 0 14px 32px rgba(17,24,39,0.18)",
    backdropFilter: "blur(12px) saturate(150%) brightness(1.04)",
    WebkitBackdropFilter: "blur(12px) saturate(150%) brightness(1.04)",
  },
  statLabel: {
    display: "block",
    fontSize: 9,
    letterSpacing: "0.14em",
    color: "#FFFFFF",
    fontWeight: 800,
  },
  statValue: {
    display: "block",
    marginTop: 7,
    fontSize: 34,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    color: "#FFFFFF",
  },
  dealGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
  emptyCard: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    padding: 22,
    borderRadius: 18,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    color: "var(--m-on-surface-mid)",
    boxShadow: "var(--m-elev-1)",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  actionCard: {
    all: "unset",
    display: "flex",
    gap: 12,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(106,155,204,0.20)",
    cursor: "pointer",
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "rgba(255,255,255,0.62)",
    color: "currentColor",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.80), 0 10px 18px rgba(26,34,51,0.06)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  actionText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "currentColor",
    fontSize: 13,
    lineHeight: 1.4,
  },
  actionNote: {
    margin: "0 0 12px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(225, 242, 235, 0.9)",
    color: "#246B50",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
  actionError: {
    margin: "0 0 12px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--m-pass-container)",
    color: "#6F241E",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
};
