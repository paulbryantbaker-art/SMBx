/* ============================================================================
   StageDeals.tsx — a lifecycle-stage view: the real deals currently sitting in
   one stage of the pipeline (Sourcing / Analysis / Closing / Post-merger).
   Replaces the phase placeholders. Every row opens the unified deal workspace.
   Consequence-ranked (deals that need you first). Honest-empty when none.

   PRESENTATIONAL ONLY — data + callbacks arrive via typed props; NDApp filters
   the real active deals into this shape. Styling: nd.css (.mck-* under .nd-root).
   ============================================================================ */
import { Ic, Avatar, Mono, Btn, StatusPill } from "../primitives";
import type { IcName, PillTone } from "../primitives";
import { EmptyChart } from "../chrome";

export interface StageDealItem {
  id: string;
  name: string;
  /** Avatar initials/label. */
  avatar: string;
  tone?: string;
  /** Secondary line — industry · location. */
  meta: string;
  journey: string;
  /** Current gate / stage label. */
  stage: string;
  /** Enterprise value or asking; "—" honest-empty. */
  ev: string;
  /** e.g. "2 open" or "—". */
  openItems: string;
  status: string;
  statusTone: PillTone;
}

export interface StageDealsProps {
  /** Stage label, e.g. "Sourcing". */
  label: string;
  icon: IcName;
  /** One-line lede; the integrator supplies the real count framing. */
  lede?: string;
  deals: StageDealItem[];
  onOpenDeal: (id: string) => void;
  onAsk: (prompt: string) => void;
}

export function StageDeals({ label, icon, lede, deals, onOpenDeal, onAsk }: StageDealsProps) {
  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <div className="mck-row" style={{ gap: 12, height: 54, flex: "0 0 54px", padding: "0 26px", borderBottom: "1px solid var(--line)" }}>
        <Ic name={icon} size={17} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
        <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{deals.length}</span>
        <div className="mck-grow" />
        <Btn variant="ghost" size="sm" icon="agent" onClick={() => onAsk(`What should I focus on across my ${label.toLowerCase()} deals?`)}>Ask Yulia</Btn>
      </div>

      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "24px 26px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {lede && <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.6 }}>{lede}</p>}

          {deals.length === 0 ? (
            <EmptyChart icon={icon} title={`No deals in ${label.toLowerCase()}`}
              sub={`When a deal reaches the ${label.toLowerCase()} stage it'll appear here. Ask Yulia to advance a deal, or start a new one.`} />
          ) : (
            <div className="mck-card" style={{ overflow: "hidden" }}>
              <table className="mck-tbl">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 16 }}>Deal</th>
                    <th>Journey</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Open items</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d) => (
                    <tr key={d.id} onClick={() => onOpenDeal(d.id)} style={{ cursor: "pointer" }}>
                      <td style={{ paddingLeft: 16 }}>
                        <div className="mck-row" style={{ gap: 11 }}>
                          <Avatar name={d.avatar} tone={d.tone} size={28} />
                          <span className="mck-col" style={{ gap: 1 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{d.name}</span>
                            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{d.meta}</span>
                          </span>
                        </div>
                      </td>
                      <td><Mono style={{ fontSize: 11, color: "var(--ink-2)" }}>{d.journey}</Mono></td>
                      <td><span className="mck-pill mck-pill-neutral">{d.stage}</span></td>
                      <td><Mono className="mck-tnum" style={{ color: d.ev === "—" ? "var(--ink-4)" : "var(--ink)" }}>{d.ev}</Mono></td>
                      <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{d.openItems}</td>
                      <td><StatusPill tone={d.statusTone} dot={d.statusTone !== "neutral"}>{d.status}</StatusPill></td>
                      <td style={{ width: 36 }}><Ic name="chevRight" size={15} style={{ color: "var(--ink-4)" }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
