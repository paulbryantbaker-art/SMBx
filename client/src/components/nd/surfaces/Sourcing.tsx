/* ============================================================================
   Sourcing.tsx — the SOURCING ranked-targets surface.
   Faithful port of Test 33 / source/workspaces.jsx (WorkSourcing). A header with
   the mandate chip, a confirm-first Yulia outreach banner, a filter/sort toolbar,
   and the ranked-targets table (mck-tbl + mck-meter fit bar + StatusPill status).

   THE LINE: the "Draft outreach" action never sends — it opens a StagedConfirm
   (from chrome) that the user must confirm. Yulia drafts but never contacts
   counterparties until the user confirms.

   PRESENTATIONAL ONLY — all data arrives via typed props; the integration layer
   wires real data and callbacks later. Honest-empty states are preserved (EBITDA
   "—" renders muted; targets=[] shows nothing extra by design).
   ============================================================================ */
import { useState } from "react";
import { Ic, Avatar, YuliaMark, Mono, Chip, Btn, IconBtn, StatusPill } from "../primitives";
import type { IcName, PillTone } from "../primitives";
import { StagedConfirm } from "../chrome";

/* ---- Prop data shapes (derived from the design's TARGETS array) ---- */
export interface SourcingTarget {
  /** Company name, e.g. "Polar Lane Cold Chain". */
  company: string;
  /** Avatar initials/label, e.g. "PL". */
  avatar?: string;
  /** Avatar tone key (a|b|c|d). */
  tone?: string;
  /** City, region — e.g. "Columbus, OH". */
  location: string;
  /** Revenue, pre-formatted, e.g. "$62M". */
  revenue: string;
  /** EBITDA, pre-formatted, e.g. "$11.4M" — or "—" for honest-empty (renders muted). */
  ebitda: string;
  /** Owner-signal note, e.g. "Founder, 64 · exploring". */
  ownerSignal: string;
  /** Fit score 0–100 (drives the meter width + the numeric label). */
  fit: number;
  /** Status pill label, e.g. "Outreach sent". */
  status: string;
  /** Status pill tone — neutral|ok|warn|risk|yulia. */
  statusTone?: PillTone;
}

/** The confirm-first Yulia outreach banner. Draft opens a StagedConfirm (THE LINE). */
export interface SourcingBanner {
  /** Banner copy (rich text via the integrator if needed). */
  text: string;
  onDismiss?: () => void;
  /** Opens the staged-confirm gate for outreach drafting. */
  onDraft?: () => void;
}

/** A single filter chip in the toolbar. */
export interface SourcingFilter {
  label: string;
  icon?: IcName;
  active?: boolean;
  onClick?: () => void;
}

export interface SourcingProps {
  /** Mandate chip label, e.g. "Cold-chain mandate · Northwind". */
  mandate?: string;
  /** Total ranked target count shown in the toolbar. */
  totalCount?: number;
  banner?: SourcingBanner;
  /** Filter chips (defaults to the cold-chain mandate set from the design). */
  filters?: SourcingFilter[];
  targets?: SourcingTarget[];
  onCriteria?: () => void;
  onSourceMore?: () => void;
  onAddFilter?: () => void;
  onSort?: () => void;
  onOpen?: (target: SourcingTarget) => void;
}

const DEFAULT_FILTERS: SourcingFilter[] = [
  { label: "Cold-chain", icon: "check", active: true },
  { label: "$20–80M rev", active: true },
  { label: "Founder-owned", active: true },
  { label: "EBITDA+", active: true },
];

export function Sourcing({
  mandate = "Cold-chain mandate · Northwind",
  totalCount = 23,
  banner,
  filters = DEFAULT_FILTERS,
  targets = [],
  onCriteria,
  onSourceMore,
  onAddFilter,
  onSort,
  onOpen,
}: SourcingProps) {
  // idle | open | done — confirm-first outreach gate (THE LINE).
  const [confirm, setConfirm] = useState<"idle" | "open" | "done">("idle");

  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <div className="mck-row" style={{ gap: 13, height: 54, flex: "0 0 54px", padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
        <Ic name="st_source" size={17} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Sourcing</span>
        <Chip icon="chevUpDown">{mandate}</Chip>
        <div className="mck-grow" />
        <Btn variant="ghost" size="sm" icon="sliders" onClick={onCriteria}>Criteria</Btn>
        <Btn variant="ink" size="sm" icon="agent" onClick={onSourceMore}>Source more</Btn>
      </div>

      {/* Yulia banner — confirm-first outreach */}
      {confirm !== "open" ? (
        <div className="mck-row" style={{ gap: 12, padding: "12px 24px", background: "var(--accent-soft)", borderBottom: "1px solid var(--accent-line)" }}>
          <YuliaMark size={24} />
          <span style={{ fontSize: 13, color: "var(--accent-ink)" }}>
            {confirm === "done"
              ? <>Outreach sent to <b>8 targets</b>. I'll surface replies here as they land.</>
              : (banner?.text ?? <>I screened <b>4,210 companies</b> and ranked <b>23 matches</b>. 8 are ready for outreach — want me to draft personalized notes?</>)}
          </span>
          {confirm !== "done" && (
            <div className="mck-row" style={{ gap: 8, marginLeft: "auto" }}>
              <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={banner?.onDismiss}>Dismiss</button>
              <button className="mck-btn mck-btn-ink mck-btn-sm" onClick={() => { banner?.onDraft?.(); setConfirm("open"); }}>Draft outreach to top 8</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
          <StagedConfirm
            title="Send outreach to top 8 targets"
            kv={[
              { k: "Action", v: "Email 8 founder-owned cold-chain targets, personalized" },
              { k: "From", v: "dana@greenhill.com" },
              { k: "Attached", v: "Teaser only — no confidential deal terms" },
            ]}
            note="Outward-facing — Yulia drafts but never contacts counterparties until you confirm."
            confirmLabel="Send 8"
            onConfirm={() => setConfirm("done")}
            onCancel={() => setConfirm("idle")}
          />
        </div>
      )}

      {/* toolbar */}
      <div className="mck-row" style={{ gap: 9, padding: "11px 24px", borderBottom: "1px solid var(--line)" }}>
        <span className="mck-row" style={{ gap: 7, fontSize: 12.5, color: "var(--ink-2)" }}>
          <b style={{ color: "var(--ink)" }}>{totalCount}</b> targets
        </span>
        <span style={{ color: "var(--line)" }}>|</span>
        {filters.map((f) => (
          <Chip key={f.label} icon={f.icon} active={f.active} onClick={f.onClick}>{f.label}</Chip>
        ))}
        <Chip icon="plus" onClick={onAddFilter}>Add filter</Chip>
        <div className="mck-grow" />
        <Chip icon="chevUpDown" onClick={onSort}>Sort · Fit score</Chip>
        <span className="mck-row" style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
          <span className="mck-iconbtn" style={{ borderRadius: 0, background: "var(--surface-2)", color: "var(--ink)" }}><Ic name="list" size={15} /></span>
          <span className="mck-iconbtn" style={{ borderRadius: 0 }}><Ic name="grid" size={15} /></span>
        </span>
      </div>

      {/* table */}
      <div className="mck-grow mck-scrollfade" style={{ overflow: "hidden", padding: "6px 14px" }}>
        <table className="mck-tbl">
          <thead>
            <tr>
              <th style={{ paddingLeft: 14 }}>Company</th>
              <th>Location</th>
              <th>Revenue</th>
              <th>EBITDA</th>
              <th>Owner signal</th>
              <th>Fit</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.company} onClick={onOpen ? () => onOpen(t) : undefined} style={onOpen ? { cursor: "pointer" } : undefined}>
                <td style={{ paddingLeft: 14 }}>
                  <div className="mck-row" style={{ gap: 11 }}>
                    <Avatar name={t.avatar ?? t.company} tone={t.tone} size={28} />
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.company}</span>
                  </div>
                </td>
                <td style={{ color: "var(--ink-2)" }}>{t.location}</td>
                <td><Mono className="mck-tnum">{t.revenue}</Mono></td>
                <td><Mono className="mck-tnum" style={{ color: t.ebitda === "—" ? "var(--ink-4)" : "var(--ink-2)" }}>{t.ebitda}</Mono></td>
                <td style={{ color: "var(--ink-2)", fontSize: 12.5 }}>{t.ownerSignal}</td>
                <td>
                  <div className="mck-row" style={{ gap: 9 }}>
                    <Mono className="mck-tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{t.fit}</Mono>
                    <span className="mck-meter"><span style={{ width: t.fit + "%" }} /></span>
                  </div>
                </td>
                <td><StatusPill tone={t.statusTone ?? "neutral"} dot={(t.statusTone ?? "neutral") !== "neutral"}>{t.status}</StatusPill></td>
                <td style={{ width: 40 }}><IconBtn name="more" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
