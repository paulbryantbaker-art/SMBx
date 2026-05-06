/**
 * V6 GateStrip — desktop chat-header progress indicator.
 *
 * Six-segment pill row (four for PMI) showing the deal's gate progression.
 * Completed gates get the primary-container fill + checkmark; the current
 * gate gets the primary fill + white label; pending gates stay outlined.
 *
 * UX-03 fix. Without this, gate advancement happened silently in the DB and
 * the user had no visual sense of progress. The strip surfaces the journey's
 * shape on every chat session that has a deal in scope.
 *
 * Chat-first: tapping a completed gate doesn't open buttons everywhere — it
 * dispatches a smbx:canvas_action to open that gate's completion deliverable.
 * Yulia's the conduit; the strip is just a lookup affordance.
 */
import { type CSSProperties } from "react";
import { useDealGates, gatesForJourney, gateStatusForRow } from "../../hooks/useDealGates";

interface GateStripProps {
  dealId: number | null;
}

export function V6GateStrip({ dealId }: GateStripProps) {
  const { data, loading } = useDealGates(dealId);

  if (!dealId) return null;
  if (loading && !data) return <SkeletonStrip />;
  if (!data) return null;

  const journeyGates = gatesForJourney(data.journeyType);
  if (journeyGates.length === 0) return null;

  return (
    <div className="m-fade-up" style={S.row} role="list" aria-label={`${data.journeyType.toUpperCase()} gate progress`}>
      {journeyGates.map((g, i) => {
        const status = gateStatusForRow(g, data.currentGate, data.gates);
        const isLast = i === journeyGates.length - 1;
        return (
          <span key={g} role="listitem" style={S.cell}>
            <Pill gate={g} status={status} />
            {!isLast && <span aria-hidden="true" style={{ ...S.connector, ...(status === "complete" ? S.connectorDone : null) }} />}
          </span>
        );
      })}
    </div>
  );
}

function Pill({ gate, status }: { gate: string; status: "complete" | "current" | "pending" }) {
  const style: CSSProperties = {
    ...S.pill,
    ...(status === "complete" ? S.pillDone : null),
    ...(status === "current"  ? S.pillCurrent : null),
    ...(status === "pending"  ? S.pillPending : null),
  };
  return (
    <span style={style} aria-current={status === "current" ? "step" : undefined} title={`Gate ${gate} · ${status}`}>
      {status === "complete" ? (
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6.2 L5 8.5 L9.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        gate
      )}
    </span>
  );
}

function SkeletonStrip() {
  return (
    <div style={{ ...S.row, opacity: 0.55 }} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map((i, idx, arr) => (
        <span key={i} style={S.cell}>
          <span style={{ ...S.pill, ...S.pillPending, opacity: 0.45 }} />
          {idx !== arr.length - 1 && <span style={S.connector} />}
        </span>
      ))}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  row: {
    display: "flex", alignItems: "center",
    padding: "8px 14px",
    background: "var(--m-surface-1)",
    borderTop: "1px solid var(--m-outline-var)",
    borderBottom: "1px solid var(--m-outline-var)",
    gap: 0,
  },
  cell: {
    display: "flex", alignItems: "center",
    flex: 1, minWidth: 0,
  },
  pill: {
    minWidth: 28, height: 18,
    padding: "0 7px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: 9,
    fontFamily: "var(--font-mono)",
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1), color 200ms ease",
    flexShrink: 0,
  },
  pillDone: {
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
  },
  pillCurrent: {
    background: "var(--m-primary)",
    color: "var(--m-on-primary)",
    boxShadow: "0 0 0 2px var(--m-primary-container)",
  },
  pillPending: {
    background: "transparent",
    color: "var(--m-on-surface-mid)",
    boxShadow: "inset 0 0 0 1px var(--m-outline)",
  },
  connector: {
    flex: 1,
    height: 1.5,
    minWidth: 8,
    margin: "0 4px",
    background: "var(--m-outline-var)",
    transition: "background 200ms ease",
  },
  connectorDone: {
    background: "var(--m-primary-container)",
  },
};
