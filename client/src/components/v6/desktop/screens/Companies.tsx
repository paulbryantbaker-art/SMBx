/**
 * COMPANIES — every firm the practice knows, one directory
 * (CRM_WORKFLOW_SPEC.md, founder-gated nav item, built thin as promised).
 *
 * A DIRECTORY, NOT A PIPELINE. The red-dot next-step law and the aging
 * colours live on the funnels that work these firms (Clients, Targets);
 * here a row is an entry in the register, so no discipline indicators
 * render. The one flag that DOES carry over is "Do not pitch" — a
 * disqualification must be visible everywhere the firm's name appears,
 * because the expensive error is pitching a firm the studio ruled out.
 *
 * READ-ONLY BY LAW. One edit surface per object: an acquirer is worked on
 * Clients, a target on Targets, a service provider is assigned from a deal's
 * Actions & specialists card. The detail panel names the owning surface
 * instead of growing a fourth editor.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import type { AtlasScreenProps } from "../atlasNav";
import {
  CriteriaBar, ChipRow, CompareStrip, ListDetail, GroupHeader, ResultRow,
  RankingNote, InfoBanner, DetailCard, Page, Sheet,
  type Chip, type CompareItem,
} from "../kit";
import { authHeaders } from "../../../../hooks/useAuth";
import {
  STAGE_LABEL, TARGET_STAGE_LABEL, touchLabel,
  type CrmAccount, type CrmStage, type TargetStage,
} from "../../../../lib/crm";

/** ACCOUNT_KINDS (server/routes/crm.ts, migration 115), labelled. */
const KINDS = ["acquirer", "service_provider", "target", "other"] as const;
type Kind = (typeof KINDS)[number];

const KIND_LABEL: Record<Kind, string> = {
  acquirer: "Acquirer",
  service_provider: "Service provider",
  target: "Target",
  other: "Other",
};

/** Which surface OWNS the firm — the line the detail panel states. */
const KIND_OWNER: Record<Kind, string> = {
  acquirer: "Work this firm on the Clients tab — its pursuit, stage and next action live on the Board dossier.",
  service_provider: "Work this firm from a deal — service providers are assigned on the deal's Actions & specialists card, corresponded with, never onboarded.",
  target: "Work this firm on the Targets board — its origination stage, wave and IoI decision live there.",
  other: "No pipeline owns this firm — it is in the book to keep its people reachable. Reclassify it on the Clients board if that changes.",
};

/** The row plus the target-funnel columns the shared type doesn't carry. */
type DirectoryRow = CrmAccount & { target_stage?: string | null };

export default function CompaniesScreen({ user }: AtlasScreenProps) {
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archived, setArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/crm/accounts?kind=all${archived ? "&archived=1" : ""}`, { headers: authHeaders() })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((data: DirectoryRow[]) => {
        if (cancelled) return;
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, archived]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(a => {
      if (kind !== "all" && (a.kind ?? "acquirer") !== kind) return false;
      if (!q) return true;
      return [a.firm, a.hq_city, a.hq_state, a.trades, a.segment, a.notes]
        .some(v => (v ?? "").toLowerCase().includes(q));
    });
  }, [rows, query, kind]);

  /* Counts from the whole fetched set (working set or archive), so a chip's
     number states what is behind it before the search narrows anything. */
  const byKind = useMemo(() => {
    const m = new Map<Kind, number>();
    for (const a of rows) {
      const k = ((a.kind ?? "acquirer") as Kind);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [rows]);

  const chips: Chip[] = [
    { id: "all", label: "All kinds", value: String(rows.length) },
    ...KINDS.map(k => ({
      id: k,
      label: KIND_LABEL[k],
      value: byKind.get(k) ? String(byKind.get(k)) : null,
    })),
    // The archive is a separate fetch, not a hidden filter — the working set
    // never silently includes retired firms.
    { id: "archived", label: archived ? "Showing the archive" : "Archive", kind: "toggle" },
  ];

  const strip: CompareItem[] = [
    { id: "all", label: "All kinds", value: String(rows.length) },
    ...KINDS.map(k => {
      const n = byKind.get(k) ?? 0;
      return {
        id: k,
        label: KIND_LABEL[k],
        // A zero here is a real zero — the register was counted and holds no
        // firm of this kind — so it prints "0", never the unknown dash.
        value: String(n),
      } satisfies CompareItem;
    }),
  ];

  const selected = rows.find(a => a.id === selectedId) ?? null;

  const cells = [
    {
      label: "Looking at",
      value: archived ? "Companies — the archive" : "Companies — every firm in the register",
      grow: 1.2,
    },
    {
      label: "Kind",
      value: kind === "all" ? "Any" : KIND_LABEL[kind],
      grow: 1,
      onClick: () => {
        const order: ("all" | Kind)[] = ["all", ...KINDS];
        const i = order.indexOf(kind);
        setKind(order[(i + 1) % order.length] ?? "all");
      },
    },
    {
      label: "Search",
      grow: 1.4,
      value: (
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Firm, city or trade"
          style={searchInput}
          aria-label="Search companies"
        />
      ),
    },
  ];

  const onChip = (id: string) => {
    if (id === "archived") { setArchived(a => !a); setSelectedId(null); return; }
    setKind(id as "all" | Kind);
  };

  return (
    <Page>
      <CriteriaBar cells={cells} />
      <ChipRow
        chips={chips}
        activeId={kind}
        activeIds={archived ? new Set(["archived"]) : undefined}
        onPick={onChip}
      />
      <CompareStrip items={strip} activeId={kind} onPick={id => setKind(id as "all" | Kind)} />

      <div style={{ marginTop: 16 }}>
        <ListDetail
          detailEmpty={
            <>
              Pick a firm to see its register entry and which surface owns the
              work on it. Nothing is edited here.
            </>
          }
          detail={selected ? <CompanyCard a={selected} /> : null}
          list={
            <div>
              {loading ? (
                <div style={noRows}>Loading the register…</div>
              ) : error ? (
                // A real failure must not read as an empty register.
                <div style={noRows}>
                  Could not load the register — {error}. Reload to try again.
                </div>
              ) : (
                <>
                  <Sheet>
                    {KINDS.filter(k => kind === "all" || kind === k).map(k => {
                      const group = filtered.filter(a => (a.kind ?? "acquirer") === k);
                      if (!group.length) return null;
                      return (
                        <div key={k} style={{ marginBottom: 2 }}>
                          <GroupHeader
                            title={`${KIND_LABEL[k]}s`}
                            columns={["Tier", "Score"]}
                          />
                          {group.map(a => (
                            <ResultRow
                              key={a.id}
                              anchor={a.firm}
                              sub={subLine(a)}
                              identity={a.disqualified ? <span style={blockPill}>Do not pitch</span> : undefined}
                              selected={selectedId === a.id}
                              onClick={() => setSelectedId(a.id)}
                              values={[
                                { text: a.tier ?? null },
                                { text: a.score == null ? null : String(a.score) },
                              ]}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </Sheet>

                  {filtered.length === 0 && (
                    <div style={noRows}>
                      {rows.length === 0
                        ? archived
                          ? "The archive is empty — nothing has been retired."
                          : "The register is empty. Firms arrive via the outreach seed, a CSV import, push-crm from a Cowork session, or by hand on the Clients board."
                        : `Nothing matches. ${rows.length} firm${rows.length === 1 ? "" : "s"} in this view — widen the search or clear a chip.`}
                    </div>
                  )}
                </>
              )}

              <RankingNote
                ordering="Grouped by kind, then in the register's board order — tier first, score descending, unscored last, firms A–Z. Only acquirers are scored; a law firm is in the book to be reachable, not to be ranked."
                caveats={[
                  "This directory is the operational shadow of the studio's registers. Consolidator and do-not-pitch evidence lives in the studio workspace and arrives here on each push — clearing a flag in the app without correcting the register would just be re-flagged.",
                  "No next-step or aging indicators here — those belong to the funnels that work these firms (Clients, Targets), and a directory row owes nobody an action.",
                ]}
              />
            </div>
          }
        />
      </div>
    </Page>
  );
}

/* ── the sub line: kind · place · stage, only what is actually recorded ── */

function subLine(a: DirectoryRow): string {
  const parts: string[] = [KIND_LABEL[(a.kind ?? "acquirer") as Kind]];
  const place = [a.hq_city, a.hq_state].filter(Boolean).join(", ");
  if (place) parts.push(place);
  const k = a.kind ?? "acquirer";
  if (k === "target" && a.target_stage) {
    parts.push(TARGET_STAGE_LABEL[a.target_stage as TargetStage] ?? a.target_stage);
  } else if (k === "acquirer" && a.stage) {
    parts.push(STAGE_LABEL[a.stage as CrmStage] ?? a.stage);
  }
  return parts.join(" · ");
}

/* ── the read-only card ────────────────────────────────────────────────── */

function CompanyCard({ a }: { a: DirectoryRow }) {
  const k = (a.kind ?? "acquirer") as Kind;
  const place = [a.hq_city, a.hq_state].filter(Boolean).join(", ");
  const stage = k === "target"
    ? (a.target_stage ? (TARGET_STAGE_LABEL[a.target_stage as TargetStage] ?? a.target_stage) : null)
    : k === "acquirer"
      ? (a.stage ? (STAGE_LABEL[a.stage as CrmStage] ?? a.stage) : null)
      : null;

  return (
    <div>
      <DetailCard title={a.firm}>
        <Field label="Kind" value={KIND_LABEL[k]} />
        <Field label="Location" value={place || null} />
        <Field label="Website" value={a.website} />
        <Field label="Segment" value={a.segment} />
        <Field label="Trades" value={a.trades} />
        {stage !== null && (
          <Field label={k === "target" ? "Target stage" : "Stage"} value={stage} />
        )}
        <Field label="Tier" value={a.tier} />
        <Field label="Score" value={a.score == null ? null : String(a.score)} />
        <Field
          label="People"
          value={a.contact_count == null ? null : String(a.contact_count)}
        />
        <Field label="Last touch" value={touchLabel(a.last_touch_at)} />
        {a.disqualified && (
          <div style={{ marginTop: 10 }}>
            <InfoBanner tone="caution">
              <b>Do not pitch.</b> {a.disqualified}
            </InfoBanner>
          </div>
        )}
      </DetailCard>

      <div style={{ marginTop: 12 }}>
        <InfoBanner>
          <b>Work this firm on its own surface.</b> {KIND_OWNER[k]}
        </InfoBanner>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div style={fieldRow}>
      <span style={fieldLabel}>{label}</span>
      {value
        ? <span style={{ fontSize: 13, color: T.ink }}>{value}</span>
        : <span style={{ fontSize: 13, color: T.muted2 }}>Not available</span>}
    </div>
  );
}

/* ── styles ────────────────────────────────────────────────────────────── */

const searchInput: CSSProperties = {
  font: "inherit", fontSize: 14, fontWeight: 700, color: T.ink,
  background: "transparent", border: "none", outline: "none",
  padding: 0, width: "100%", minWidth: 0,
};

const fieldRow: CSSProperties = {
  display: "flex", alignItems: "baseline", gap: 10, padding: "6px 0",
  borderBottom: `1px solid ${T.border}`,
};
const fieldLabel: CSSProperties = { fontSize: 12, color: T.muted, width: 84, flex: "none" };

/* Same treatment as ClientsList's blockPill — the flag must look the same
   everywhere the firm's name appears. */
const blockPill: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
  background: T.amberBg, color: T.amber, padding: "2px 6px", whiteSpace: "nowrap",
};

const noRows: CSSProperties = {
  padding: "26px 16px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.white,
  fontSize: 12.5, color: T.muted, lineHeight: 1.6,
};
