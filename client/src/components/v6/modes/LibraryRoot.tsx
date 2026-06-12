import { useMemo, useState } from "react";
import { V6Icon } from "../icons";
import type { IconName, OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { VERDICT_MATERIAL } from "../shared/verdictMaterial";

type LibKind = "deal" | "analysis" | "doc";

/* Family tones (consume verdictMaterial, never restate): these are KIND
 * families, not verdicts — info-blue/sage/gold answer "what is this row". */
const KIND_TONE: Record<LibKind, { ink: string; soft: string }> = {
  deal: VERDICT_MATERIAL.baseline.tone,
  analysis: VERDICT_MATERIAL.pursue.tone,
  doc: VERDICT_MATERIAL.watch.tone,
};

interface LibItem {
  kind: LibKind;
  id: string;
  title: string;
  sub: string;
  updated: string;
  ts: number;
  analysisRunId?: number | null;
  analysisType?: string | null;
  analysisStatus?: string | null;
}

const TABS: { id: "all" | LibKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deal", label: "Deals" },
  { id: "analysis", label: "Analyses" },
  { id: "doc", label: "Docs" },
];

export function V6LibraryRoot({
  openTab,
  onTalkToYulia,
  user,
}: {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}) {
  const workspace = useV6WorkspaceData(user);
  const [active, setActive] = useState<"all" | LibKind>("all");

  // Real library = the user's deals + generated deliverables, unioned and
  // sorted by recency. (Was 100% hardcoded "Big Fake Deal · sample" rows.)
  const rows = useMemo<LibItem[]>(() => {
    const dealRows = workspace.deals.map(dealToLib);
    const deliverableRows = workspace.deliverables.map(deliverableToLib);
    return [...dealRows, ...deliverableRows].sort((a, b) => b.ts - a.ts);
  }, [workspace.deals, workspace.deliverables]);

  const counts = useMemo(() => {
    const c: Record<"all" | LibKind, number> = { all: rows.length, deal: 0, analysis: 0, doc: 0 };
    for (const r of rows) c[r.kind] += 1;
    return c;
  }, [rows]);

  const filtered = active === "all" ? rows : rows.filter(r => r.kind === active);

  const open = (it: LibItem) => {
    if (it.kind === "deal") {
      openTab({ kind: "deal", id: it.id, title: it.title });
      return;
    }
    if (it.kind === "analysis") {
      openTab({
        kind: "analysis",
        id: it.analysisRunId ? `analysis-${it.analysisRunId}` : `lib-${it.id}`,
        title: it.title,
        analysisRunId: it.analysisRunId ?? undefined,
        tool: it.analysisType ?? undefined,
        status: it.analysisStatus ?? undefined,
      });
      return;
    }
    openTab({ kind: "doc", id: it.id, title: it.title });
  };

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Library</div>
          <p className="pg-sub">Everything you've touched — deals, analyses, and documents in one place.</p>
        </div>
      </div>

      <div className="segmented" style={{ flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`seg ${active === t.id ? "on" : ""}`}
            role="tab"
            aria-selected={active === t.id}
            type="button"
          >
            {t.label} <span className="n">{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        {workspace.loading ? (
          <YuliaSkeleton rows={4} label="Loading your library…" />
        ) : filtered.length === 0 ? (
          <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
            <div className="wkcard-title">{rows.length === 0 ? "Nothing here yet" : "No items in this view"}</div>
            <div className="wkcard-sub">
              {rows.length === 0
                ? "Deals, analyses, and documents you create will collect here automatically."
                : "Clear the filter to see the rest of your library."}
            </div>
            {rows.length === 0 && (
              <button
                className="wkbtn dark"
                type="button"
                style={{ marginTop: 14 }}
                onClick={() => onTalkToYulia?.("Help me start my first deal so my library has something in it.")}
              >
                Start with Yulia
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="wktable">
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Title</th>
                  <th>Status</th>
                  <th className="r">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(it => (
                  <tr
                    key={`${it.kind}-${it.id}`}
                    onClick={() => open(it)}
                    role="button"
                    aria-label={`${it.title}, ${it.sub}`}
                  >
                    <td>
                      {/* Kind-literate chip (family tones from verdictMaterial):
                          deal=info-blue, analysis=valuation sage, doc=structure
                          gold — color answers "what kind of thing is this row". */}
                      <span style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: KIND_TONE[it.kind].soft,
                        color: KIND_TONE[it.kind].ink,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <V6Icon name={iconForKind(it.kind)} size={14} />
                      </span>
                    </td>
                    <td><div className="nm">{it.title}</div></td>
                    <td><span className="muted">{it.sub}</span></td>
                    <td className="r muted">{fmtRelative(it.updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tabfoot">
              <span>{filtered.length} {filtered.length === 1 ? "item" : "items"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function dealToLib(d: WorkspaceDeal): LibItem {
  const updated = d.updated_at || d.created_at;
  return {
    kind: "deal",
    id: String(d.id),
    title: d.business_name || d.industry || `Deal #${d.id}`,
    sub: d.current_gate ? `${formatJourney(d.journey_type)} · ${d.current_gate}` : formatJourney(d.journey_type),
    updated,
    ts: timeOf(updated),
  };
}

function deliverableToLib(d: WorkspaceDeliverable): LibItem {
  const isAnalysis = !!d.analysis_run_id || /model|valuation|analysis|sba|comp|score|risk|tax|financial/i.test(`${d.slug || ""} ${d.name || ""}`);
  const updated = d.completed_at || d.updated_at || d.created_at;
  return {
    kind: isAnalysis ? "analysis" : "doc",
    id: String(d.id),
    title: d.name || formatSlug(d.slug),
    sub: `${d.deal_name || "Deal"} · ${formatStatus(d.status)}`,
    updated,
    ts: timeOf(updated),
    analysisRunId: d.analysis_run_id ?? null,
    analysisType: d.analysis_type ?? null,
    analysisStatus: d.analysis_status ?? null,
  };
}

function timeOf(iso?: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function fmtRelative(iso?: string | null): string {
  if (!iso) return "—";
  const t = timeOf(iso);
  if (!t) return "—";
  const min = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatSlug(input: string): string {
  return (input || "Untitled").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatStatus(input: string): string {
  return (input || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatJourney(input?: string): string {
  return input ? input.charAt(0).toUpperCase() + input.slice(1) : "Deal";
}

function iconForKind(kind: LibKind): IconName {
  if (kind === "deal") return "deal";
  if (kind === "analysis") return "chart";
  return "doc";
}
