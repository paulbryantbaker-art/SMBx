import { useState } from "react";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "./cards";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData } from "../../../hooks/useV6WorkspaceData";
import { useTodayOperatingBrief } from "../../../hooks/useTodayOperatingBrief";
import { OpChip } from "../shared/operatingPrimitives";
import type { ModelPreference } from "../../../lib/modelPreference";
import {
  docSlugForTemplate,
  generateActionDeliverable,
  pickActionDeal,
  primaryDocForJourney,
} from "../../../lib/v6ActionContracts";

interface Template { id: string; name: string; sub: string; tag: string }

// Generic, honest template offerings (not deal data) — the document kinds
// Yulia can draft. Kept as-is; recents and folders below are now REAL.
const TEMPLATES: Template[] = [
  { id: "t-nda",  name: "NDA",             sub: "Mutual · light",         tag: "NDA"  },
  { id: "t-loi",  name: "LOI",             sub: "Letter of intent",       tag: "LOI"  },
  { id: "t-ioi",  name: "IOI",             sub: "Indication of interest", tag: "IOI"  },
  { id: "t-memo", name: "Investment memo", sub: "Internal thesis",        tag: "MEMO" },
  { id: "t-qoe",  name: "QoE Lite",        sub: "Quality of earnings",    tag: "QoE"  },
  { id: "t-apa",  name: "APA",             sub: "Asset purchase",         tag: "APA"  },
];

// Map a deliverable's real status to the V6DocStatus badge kind.
function docStatusKind(status: string): DocStatusKind {
  const s = (status || "").toLowerCase();
  if (/complete|final|signed|executed|lock/.test(s)) return "final";
  if (/sent|delivered|shared/.test(s)) return "sent";
  if (/live|active/.test(s)) return "live";
  if (/saved/.test(s)) return "saved";
  return "draft";
}

function relTime(iso?: string | null): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const d = Math.floor(ms / 86_400_000);
  if (d < 1) return "today";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function V6DocsRoot({
  openTab,
  onTalkToYulia,
  user,
  modelPreference,
}: {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
  modelPreference?: ModelPreference;
}) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const reviewQueue = operating.brief?.filesNeedingReview ?? [];
  const deal = pickActionDeal(workspace.deals);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

  // REAL recently-edited docs (replaces the old sample array) — the user's
  // own deliverables, newest first.
  const realRecents = [...workspace.deliverables]
    .sort((a, b) => new Date(b.completed_at || b.updated_at || b.created_at).getTime() - new Date(a.completed_at || a.updated_at || a.created_at).getTime())
    .slice(0, 6);
  // REAL by-deal folders (replaces the old sample folders) — active deals
  // with their authentic deliverable + document counts.
  const realFolders = [...workspace.deals]
    .map(d => ({ deal: d, count: (d.deliverable_count ?? 0) + (d.document_count ?? 0) }))
    .sort((a, b) => b.count - a.count || new Date(b.deal.updated_at).getTime() - new Date(a.deal.updated_at).getTime())
    .slice(0, 8);

  const runDocAction = async (template?: Template) => {
    setActionError(null);
    setActionNote(null);
    const target = deal;
    const mapping = template ? docSlugForTemplate(template.id, target?.journey_type) : primaryDocForJourney(target?.journey_type);

    if (!target || !mapping) {
      const title = template ? `New ${template.name}` : "New document";
      openTab({ kind: "doc", title, template: template?.id });
      onTalkToYulia?.(template
        ? `Draft a ${template.name} for the active deal. If this requires legal sign-off, prepare a working draft and clearly mark what needs review.`
        : "Create the right deal document for the active deal and ask me for any missing facts.");
      return;
    }

    setBusyAction(template?.id ?? "new-doc");
    try {
      await generateActionDeliverable({
        deal: target,
        slug: mapping.slug,
        label: mapping.label,
        openTab,
        modelPreference,
        onNote: setActionNote,
      });
      void workspace.refresh();
    } catch (e: any) {
      setActionError(e?.message || "Could not create the document.");
    } finally {
      setBusyAction(null);
    }
  };


  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Documents</div>
          <p className="pg-sub">Drafts, final versions, and signed paper.</p>
        </div>
        <div className="pg-actions">
          <button
            className="wkbtn primary"
            aria-label="New doc"
            type="button"
            onClick={() => { void runDocAction(); }}
            disabled={busyAction === "new-doc"}
          >
            <V6Icon name="plus" size={12} />
            <span style={{ marginLeft: 6 }}>{busyAction === "new-doc" ? "Creating..." : "New doc"}</span>
          </button>
        </div>
      </div>

      {(actionError || actionNote || workspace.error) && (
        <div className={actionError || workspace.error ? "wkerr" : "wknote"}>
          {actionError || workspace.error || actionNote}
        </div>
      )}

      {/* Waiting on you — the review queue from the operating brief, surfaced
          before templates so Documents opens on "what's unfinished." Honest
          absence: the band is omitted entirely when nothing is waiting. */}
      {reviewQueue.length > 0 && (
        <div className="wksec">
          <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 8, borderLeft: "3px solid var(--st-review-fg, #9C7128)" }}>
            <div style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--ink)" }}>
              {reviewQueue.length} file{reviewQueue.length === 1 ? "" : "s"} waiting on you
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {reviewQueue.slice(0, 4).map(f => {
                const ready = f.definitiveDisclosureStatus === "ready_for_user_controlled_disclosure";
                return (
                  <button
                    key={f.id}
                    type="button"
                    className="wk-tap"
                    onClick={() => onTalkToYulia?.(`Walk me through ${f.title}${f.dealTitle ? ` on ${f.dealTitle}` : ""} — what needs my eye?`)}
                    style={{ appearance: "none", border: 0, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", background: "var(--surface-2)", borderRadius: 10 }}
                  >
                    <OpChip label={ready ? "Ready to disclose" : "Review"} tone={ready ? "cactus" : "gold"} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: "0.88rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}{f.dealTitle ? ` · ${f.dealTitle}` : ""}</span>
                      <span style={{ display: "block", fontSize: "0.76rem", color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.reason || f.status}</span>
                    </span>
                    <span style={{ color: "var(--accent-strong)" }} aria-hidden>↗</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="wksec">
        <div className="wksec-title">Start from a template</div>
        <div className="wkgrid g3">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className="wkcard tap wk-ascard"
              onClick={() => { void runDocAction(t); }}
              role="button"
              tabIndex={0}
              aria-label={`Start a new ${t.name} (${t.sub})`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void runDocAction(t); } }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 32, borderRadius: 8, flexShrink: 0,
                  display: "grid", placeItems: "center",
                  background: "var(--surface-2)",
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.06em", color: "var(--ink-2)",
                }}>{t.tag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wkcard-title" style={{ fontSize: "0.95rem" }}>
                    {busyAction === t.id ? "Creating..." : t.name}
                  </div>
                  <div className="wkcard-sub" style={{ fontSize: "0.82rem", marginTop: 2 }}>{t.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently edited — REAL deliverables, newest first. Honest empty
          state when none exist (no sample docs, ever). */}
      <div className="wksec">
        <div className="wksec-title">Recently edited</div>
        <p className="pg-sub" style={{ marginTop: 0, marginBottom: 14 }}>Open any to keep working — Yulia stays in context.</p>
        {realRecents.length === 0 ? (
          <div className="wkcard" style={{ color: "var(--ink-2)", fontSize: "0.88rem" }}>
            No documents yet. Start from a template above and Yulia drafts it against your deal.
          </div>
        ) : (
          <div className="wkgrid g2">
            {realRecents.map(d => {
              const title = d.name || prettySlug(d.slug);
              return (
                <div
                  key={d.id}
                  className="wkcard tap wk-ascard"
                  onClick={() => openTab({ kind: "doc", title, id: String(d.id) })}
                  role="button"
                  tabIndex={0}
                  aria-label={`${title}, ${d.status}, ${d.deal_name || "Deal"}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "doc", title, id: String(d.id) }); } }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <V6Icon name="doc" size={16} />
                    <V6DocStatus status={docStatusKind(d.status)} />
                  </div>
                  <div className="wkcard-title" style={{ marginTop: 14 }}>{title}</div>
                  <div className="wkcard-sub" style={{ marginTop: 2 }}>{d.deal_name || "Workspace"}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 10 }}>
                    {relTime(d.completed_at || d.updated_at || d.created_at)}
                    {d.generation_model ? " · Yulia-drafted" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* By deal — REAL deals with authentic file counts. */}
      {realFolders.length > 0 && (
        <div className="wksec">
          <div className="wksec-title">By deal</div>
          <div className="wkgrid g2">
            {realFolders.map(({ deal: d, count }) => {
              const name = d.business_name || `Deal #${d.id}`;
              return (
                <div
                  key={d.id}
                  className="wkcard tap wk-ascard"
                  role="button"
                  tabIndex={0}
                  aria-label={`${name} — ${count} files`}
                  onClick={() => openTab({ kind: "deal", id: String(d.id), title: name, fileScope: "all" })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "deal", id: String(d.id), title: name, fileScope: "all" }); } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      display: "grid", placeItems: "center",
                      background: "var(--surface-2)", color: "var(--ink-2)",
                    }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2 4.5c0-0.83 0.67-1.5 1.5-1.5h2.5L7 4.5h3.5c0.83 0 1.5 0.67 1.5 1.5v4.5c0 0.83-0.67 1.5-1.5 1.5H3.5C2.67 12 2 11.33 2 10.5V4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="wkcard-title" style={{ fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </div>
                      <div className="wkcard-sub" style={{ marginTop: 2 }}>
                        {d.current_gate} · <span style={{ fontFamily: "var(--font-mono)" }}>{count}</span> file{count === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function prettySlug(slug: string): string {
  return (slug || "Untitled").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
