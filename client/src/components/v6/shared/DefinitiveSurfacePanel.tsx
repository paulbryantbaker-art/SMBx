import { type CSSProperties } from "react";
import {
  useDefinitiveSurfaceMechanics,
  type DefinitiveDealRunbooksSurface,
  type DefinitiveSurfaceId,
  type DefinitiveSurfaceMechanics,
} from "../../../hooks/useDefinitiveSurfaceMechanics";
import { V6Icon } from "../icons";

type DefinitiveBucketKey = "executable" | "passThrough" | "professionalHandoff" | "researchOnly";

interface DefinitiveBucketView {
  key: DefinitiveBucketKey;
  icon: "chart" | "library" | "deal" | "doc";
  count: number | string;
  slots: string[];
  emptyLabel: string;
  title: string;
  label: string;
  detail: string;
}

interface DefinitiveSurfacePanelProps {
  surface: DefinitiveSurfaceId;
  onTalkToYulia?: (prompt: string) => void;
  title?: string;
  compact?: boolean;
}

const BUCKET_COPY: Record<DefinitiveBucketKey, { title: string; label: string; detail: string }> = {
  executable: {
    title: "Executable models",
    label: "Run",
    detail: "Deterministic mechanics Yulia can compute against deal inputs.",
  },
  passThrough: {
    title: "Pass-through inputs",
    label: "Inputs",
    detail: "Outside data or software calls needed before the answer is complete.",
  },
  professionalHandoff: {
    title: "Professional handoffs",
    label: "Line",
    detail: "Conclusions reserved for counsel, advisor, specialist, or court.",
  },
  researchOnly: {
    title: "Research-only",
    label: "Caveat",
    detail: "Unstable, jurisdictional, or non-reviewed mechanics Yulia must label.",
  },
};

export function DefinitiveSurfacePanel({
  surface,
  onTalkToYulia,
  title = "DEFINITIVE route map.",
  compact = false,
}: DefinitiveSurfacePanelProps) {
  const { getSurface, loading, error, dealRunbooksSurface } = useDefinitiveSurfaceMechanics();
  const contract = getSurface(surface);

  if (loading && !contract) {
    return (
      <section style={{ ...D.panel, ...(compact ? D.panelCompact : null) }}>
        <PanelHeader title={title} pill="Reading" />
        <div style={D.loading}>Yulia is reading the route map.</div>
      </section>
    );
  }

  if (error && !contract) {
    const fallbackBuckets = buildFallbackBuckets();
    return (
      <section style={{ ...D.panel, ...(compact ? D.panelCompact : null) }}>
        <PanelHeader title={title} pill="Ask Yulia" />
        <p style={D.purpose}>These buckets open the right Yulia explanation path while the live route map answers.</p>
        <div style={D.grid}>
          {fallbackBuckets.map(bucket => (
            <BucketButton
              key={bucket.key}
              bucket={bucket}
              onClick={() => onTalkToYulia?.(buildFallbackPrompt(surface, bucket.key))}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!contract) return null;

  const buckets = buildBuckets(contract);

  return (
    <section style={{ ...D.panel, ...(compact ? D.panelCompact : null) }}>
      <PanelHeader title={title} pill={`${contract.totalMechanics} mechanics`} />
      <p style={D.purpose}>{contract.purpose}</p>
      <div style={D.grid}>
        {buckets.map(bucket => (
          <BucketButton
            key={bucket.key}
            bucket={bucket}
            onClick={() => onTalkToYulia?.(buildPrompt(contract, bucket.key, bucket.slots))}
          />
        ))}
      </div>
      <DealOsLoop runbooks={dealRunbooksSurface} onTalkToYulia={onTalkToYulia} />
    </section>
  );
}

function BucketButton({ bucket, onClick }: { bucket: DefinitiveBucketView; onClick: () => void }) {
  return (
    <button
      type="button"
      className="m-nudge-soft"
      style={D.item}
      onClick={onClick}
    >
      <span style={D.itemTop}>
        <span style={D.itemIcon}><V6Icon name={bucket.icon} size={15} /></span>
        <span style={{ ...D.itemCount, ...(typeof bucket.count === "string" ? D.itemCountLabel : null) }}>{bucket.count}</span>
      </span>
      <strong style={D.itemTitle}>{bucket.title}</strong>
      <span style={D.itemText}>{bucket.detail}</span>
      <span style={D.slotLine}>{bucket.slots.length ? summarizeSlots(bucket.slots) : bucket.emptyLabel}</span>
    </button>
  );
}

function PanelHeader({ title, pill }: { title: string; pill: string }) {
  return (
    <div style={D.header}>
      <h2 style={D.title}>{title}</h2>
      <span style={D.pill}>{pill}</span>
    </div>
  );
}

function DealOsLoop({
  runbooks,
  onTalkToYulia,
}: {
  runbooks: DefinitiveDealRunbooksSurface | null;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const loop = runbooks?.summary?.loopContract || "ingest_or_resume -> classify -> ask_missing_inputs -> execute_or_route -> package_take_back -> repeat";
  const entries = runbooks?.universalEntryTools?.slice(0, 4) ?? ["ingest_deal_payload", "resume_deal"];
  const artifacts = runbooks?.universalTakeBackArtifacts?.slice(0, 5) ?? ["DealState", "DealPackage", "MCPCallHint[]"];
  const actions = [
    {
      title: "Enter or resume",
      text: "Start from partial facts, a source file, prior packet, or existing DealState.",
      meta: summarizeSlots(entries, 4),
      prompt: "Explain how an external agent should enter or resume a deal in smbX using partial information, DealState, and next_suggested_calls.",
    },
    {
      title: "Work the loop",
      text: "Move through IOI, LOI, diligence, models, negotiation, close, and PMI recursively.",
      meta: loop.replace(/_/g, " "),
      prompt: "Show the DEFINITIVE Deal OS lifecycle and tell me how Yulia should work the next iterative step without rejecting incomplete information.",
    },
    {
      title: "Take back artifacts",
      text: "Return portable state so another agent can continue without losing citations or boundaries.",
      meta: summarizeSlots(artifacts, 5),
      prompt: "List the portable DEFINITIVE artifacts another agent can take back to its system and explain how each preserves the deal trail.",
    },
  ];

  return (
    <div style={D.loop}>
      <div style={D.loopHead}>
        <strong>Agent Deal OS loop</strong>
        <span>{runbooks?.summary?.journeyCount ?? 4} journeys · {runbooks?.summary?.lifecycleStageCount ?? 7} stages</span>
      </div>
      <div style={D.loopGrid}>
        {actions.map(action => (
          <button
            key={action.title}
            type="button"
            className="m-nudge-soft"
            style={D.loopButton}
            onClick={() => onTalkToYulia?.(action.prompt)}
          >
            <strong style={D.loopButtonTitle}>{action.title}</strong>
            <span style={D.loopButtonText}>{action.text}</span>
            <span style={D.loopButtonMeta}>{action.meta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function buildBuckets(contract: DefinitiveSurfaceMechanics): DefinitiveBucketView[] {
  return [
    {
      key: "executable" as const,
      icon: "chart" as const,
      count: contract.readiness.executable,
      slots: contract.needs.executable,
      emptyLabel: "No runnable slots surfaced yet.",
      ...BUCKET_COPY.executable,
    },
    {
      key: "passThrough" as const,
      icon: "library" as const,
      count: contract.needs.passThrough.length,
      slots: contract.needs.passThrough,
      emptyLabel: "No pass-through calls required.",
      ...BUCKET_COPY.passThrough,
    },
    {
      key: "professionalHandoff" as const,
      icon: "deal" as const,
      count: contract.readiness.professionalHandoff,
      slots: contract.needs.professionalHandoff,
      emptyLabel: "No professional handoff flags.",
      ...BUCKET_COPY.professionalHandoff,
    },
    {
      key: "researchOnly" as const,
      icon: "doc" as const,
      count: contract.readiness.researchOnly,
      slots: contract.needs.researchOnly,
      emptyLabel: "No research-only mechanics.",
      ...BUCKET_COPY.researchOnly,
    },
  ];
}

function buildFallbackBuckets(): DefinitiveBucketView[] {
  return [
    { key: "executable", icon: "chart", count: BUCKET_COPY.executable.label, slots: [], emptyLabel: "Ask Yulia what runs here.", ...BUCKET_COPY.executable },
    { key: "passThrough", icon: "library", count: BUCKET_COPY.passThrough.label, slots: [], emptyLabel: "Ask Yulia what inputs are missing.", ...BUCKET_COPY.passThrough },
    { key: "professionalHandoff", icon: "deal", count: BUCKET_COPY.professionalHandoff.label, slots: [], emptyLabel: "Ask Yulia where THE LINE sits.", ...BUCKET_COPY.professionalHandoff },
    { key: "researchOnly", icon: "doc", count: BUCKET_COPY.researchOnly.label, slots: [], emptyLabel: "Ask Yulia what must stay caveated.", ...BUCKET_COPY.researchOnly },
  ];
}

function buildPrompt(contract: DefinitiveSurfaceMechanics, key: DefinitiveBucketKey, slots: string[]) {
  const bucket = BUCKET_COPY[key];
  const slotText = slots.length ? ` Model slots: ${summarizeSlots(slots, 12)}.` : "";
  return `Explain the ${bucket.title.toLowerCase()} on the ${contract.title} surface. ${contract.purpose}${slotText} Keep THE LINE clear: compute what DEFINITIVE owns, name pass-through inputs, and route professional conclusions to the right specialist.`;
}

function buildFallbackPrompt(surface: DefinitiveSurfaceId, key: DefinitiveBucketKey) {
  const bucket = BUCKET_COPY[key];
  return `Explain the ${bucket.title.toLowerCase()} that should appear on the ${surface} surface under DEFINITIVE. Keep THE LINE clear and identify what should compute, what needs pass-through inputs, what needs professional handoff, and what stays research-only.`;
}

function summarizeSlots(slots: string[], limit = 6) {
  const shown = slots.slice(0, limit).join(", ");
  const remainder = slots.length - limit;
  return remainder > 0 ? `${shown} +${remainder}` : shown;
}

const D: Record<string, CSSProperties> = {
  panel: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    padding: "22px 24px",
    minHeight: 0,
  },
  panelCompact: {
    padding: 18,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  title: {
    margin: 0,
    color: "var(--ink)",
    fontWeight: 600,
    fontSize: 20,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  pill: {
    flex: "0 0 auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 11px",
    borderRadius: 999,
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  purpose: {
    margin: "8px 0 0",
    maxWidth: 820,
    color: "var(--ink-2)",
    fontSize: 14,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
    gap: 12,
    marginTop: 16,
  },
  loop: {
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid var(--line)",
  },
  loopHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "var(--ink-3)",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 12,
  },
  loopGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 12,
  },
  loopButton: {
    all: "unset",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minHeight: 104,
    padding: 16,
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    cursor: "pointer",
    transition: "border-color .18s, box-shadow .18s, transform .18s",
  },
  loopButtonTitle: {
    color: "var(--ink)",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.15,
  },
  loopButtonText: {
    color: "var(--ink-2)",
    fontSize: 12.5,
    lineHeight: 1.4,
  },
  loopButtonMeta: {
    marginTop: "auto",
    color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    lineHeight: 1.3,
  },
  item: {
    all: "unset",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 132,
    padding: 16,
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    cursor: "pointer",
    transition: "border-color .18s, box-shadow .18s, transform .18s",
  },
  itemTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
    background: "var(--surface-2)",
    color: "var(--ink-2)",
  },
  itemCount: {
    color: "var(--ink)",
    fontFamily: "var(--font-mono)",
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },
  itemCountLabel: {
    padding: "5px 9px",
    borderRadius: 999,
    color: "var(--accent-strong)",
    background: "var(--accent-soft)",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 500,
    letterSpacing: 0,
  },
  itemTitle: {
    color: "var(--ink)",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.15,
  },
  itemText: {
    color: "var(--ink-2)",
    fontSize: 13,
    lineHeight: 1.4,
  },
  slotLine: {
    marginTop: "auto",
    color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    fontSize: 11.5,
    lineHeight: 1.3,
  },
  loading: {
    marginTop: 16,
    minHeight: 92,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    border: "1px solid var(--line)",
    fontWeight: 500,
  },
};
