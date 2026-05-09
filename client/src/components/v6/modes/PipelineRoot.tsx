import { type CSSProperties } from "react";
import { V6Section } from "../Canvas";
import { V6Icon } from "../icons";
import { V6DealCard, type Verdict } from "./cards";
import type { OpenTab } from "../types";
import { DEV_AUTH_BYPASS, type User } from "../../../hooks/useAuth";
import { useHomeDeals, type HomeDeal } from "../../../hooks/useHomeDeals";
import { DESKTOP_TEXTURES } from "../../../lib/randomTextures";

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
}

export function V6PipelineRoot({ openTab, onTalkToYulia, user }: PipelineRootProps) {
  const home = useHomeDeals(user);
  const useSampleData = !home.isAuthed || DEV_AUTH_BYPASS;
  const realDeals = home.inReview.length > 0 ? home.inReview : home.picks;
  const deals = useSampleData ? SAMPLE_DEALS : realDeals.map(dealToPipelineDeal);

  const pursue = deals.filter(d => d.verdict === "pursue");
  const watch = deals.filter(d => d.verdict === "watch");
  const pass = deals.filter(d => d.verdict === "pass");

  return (
    <div className="m-fade-up">
      <section style={P.hero}>
        <div>
          <div className="mono" style={P.eyebrow}>PIPELINE</div>
          <h1 style={P.title}>Every deal, ranked by what deserves attention.</h1>
          <p style={P.sub}>Same hierarchy as mobile: pursue, watch, pass, and the files or analyses behind each deal.</p>
        </div>
        <div style={P.stats}>
          <PipelineStat label="Pursue" value={pursue.length} tone="#3F8A6A" />
          <PipelineStat label="Watch" value={watch.length} tone="#9C7128" />
          <PipelineStat label="Pass" value={pass.length} tone="#A85248" />
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
        <div style={P.actionGrid}>
          {[
            ["Review drafts", "Open docs Yulia is shaping before they go to the data room.", "doc"],
            ["Run analysis", "Recast, comps, buyer fit, SBA structure, and risk notes.", "chart"],
            ["Find buyers", "Start a discovery search from a selected deal thesis.", "search"],
          ].map(([title, sub, icon]) => (
            <button
              key={title}
              style={P.actionCard}
              onClick={() => onTalkToYulia?.(`${title}: ${sub}`)}
              type="button"
            >
              <span style={P.actionIcon}><V6Icon name={icon as "doc" | "chart" | "search"} size={16} /></span>
              <span style={P.actionText}>
                <strong>{title}</strong>
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

const pipelineHeroWash = `linear-gradient(135deg, rgba(249,252,250,0.90) 0%, rgba(226,243,235,0.76) 52%, rgba(228,239,247,0.66) 100%), url('${DESKTOP_TEXTURES.pipelineHero}')`;
const pipelineCardWash = `linear-gradient(135deg, rgba(255,255,255,0.90), rgba(236,247,241,0.76)), url('${DESKTOP_TEXTURES.pipelineCard}')`;
const pipelineActionWash = `linear-gradient(135deg, rgba(255,255,255,0.92), rgba(239,246,244,0.78)), url('${DESKTOP_TEXTURES.pipelineSecondary}')`;

const P: Record<string, CSSProperties> = {
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "end",
    gap: 24,
    marginBottom: 34,
    padding: 28,
    borderRadius: 24,
    backgroundImage: pipelineHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 700,
    color: "var(--m-on-primary-container)",
  },
  title: {
    margin: "8px 0 0",
    maxWidth: 820,
    fontSize: 48,
    lineHeight: 0.96,
    letterSpacing: "-0.055em",
    textWrap: "balance",
    color: "var(--m-on-surface)",
  },
  sub: {
    margin: "14px 0 0",
    maxWidth: 620,
    fontSize: 15,
    lineHeight: 1.55,
    color: "var(--m-on-surface-var)",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 94px)",
    gap: 10,
  },
  stat: {
    padding: "13px 14px",
    borderRadius: 16,
    backgroundImage: pipelineCardWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
  },
  statLabel: {
    display: "block",
    fontSize: 9,
    letterSpacing: "0.14em",
    color: "var(--m-on-surface-mid)",
    fontWeight: 700,
  },
  statValue: {
    display: "block",
    marginTop: 6,
    fontSize: 28,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
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
    backgroundImage: pipelineActionWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-1)",
    cursor: "pointer",
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  actionText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    color: "var(--m-on-surface-var)",
    fontSize: 13,
    lineHeight: 1.4,
  },
};
