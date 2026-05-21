import { type CSSProperties } from "react";
import {
  useDefinitiveSurfaceMechanics,
  type DefinitiveSurfaceId,
  type DefinitiveSurfaceMechanics,
} from "../../../hooks/useDefinitiveSurfaceMechanics";
import { V6Icon } from "../icons";
import {
  studioCompeteButtonItemStyles,
  studioCompeteCardStyles,
  studioDarkLiquidGlassPill,
  studioListCardStyles,
} from "../styles/studioSurfaces";

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
  const { getSurface, loading, error } = useDefinitiveSurfaceMechanics();
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
    ...studioCompeteCardStyles.panel,
    minHeight: 0,
  },
  panelCompact: {
    padding: 18,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  title: {
    margin: 0,
    color: "#1A2233",
    fontSize: 28,
    lineHeight: 1.05,
    letterSpacing: "-0.045em",
  },
  pill: {
    ...studioListCardStyles.cleanPill,
    flex: "0 0 auto",
    background: "rgba(138,154,232,.14)",
    color: "#2E5C8A",
  },
  purpose: {
    margin: "8px 0 0",
    maxWidth: 820,
    color: "#60708A",
    fontSize: 14,
    lineHeight: 1.45,
  },
  grid: {
    ...studioCompeteCardStyles.grid,
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    marginTop: 16,
  },
  item: {
    ...studioCompeteButtonItemStyles,
    minHeight: 142,
    alignContent: "stretch",
  },
  itemTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    ...studioDarkLiquidGlassPill,
  },
  itemCount: {
    color: "#1A2233",
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 900,
    fontVariantNumeric: "tabular-nums",
  },
  itemCountLabel: {
    padding: "6px 8px",
    borderRadius: 999,
    color: "#2E5C8A",
    background: "rgba(138,154,232,.14)",
    fontSize: 11,
    lineHeight: 1,
    letterSpacing: 0,
  },
  itemTitle: {
    color: "#5E6E88",
    fontSize: 14,
    lineHeight: 1.12,
  },
  itemText: {
    color: "#60708A",
    fontSize: 13,
    lineHeight: 1.35,
  },
  slotLine: {
    alignSelf: "end",
    color: "#2E5C8A",
    fontSize: 11.5,
    lineHeight: 1.25,
    fontWeight: 850,
  },
  loading: {
    marginTop: 16,
    minHeight: 92,
    display: "grid",
    placeItems: "center",
    borderRadius: 18,
    background: "rgba(255,255,255,.58)",
    color: "#60708A",
    border: "1px solid rgba(153,176,209,.32)",
    fontWeight: 850,
  },
};
