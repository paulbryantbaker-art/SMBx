import { useState } from "react";
import { V6Icon } from "../icons";
import { V6DocStatus, type DocStatusKind } from "./cards";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData } from "../../../hooks/useV6WorkspaceData";
import type { ModelPreference } from "../../../lib/modelPreference";
import {
  docSlugForTemplate,
  generateActionDeliverable,
  pickActionDeal,
  primaryDocForJourney,
} from "../../../lib/v6ActionContracts";

interface RecentDoc { id: string; title: string; deal: string; updated: string; status: DocStatusKind }

const RECENTS: RecentDoc[] = [
  { id: "doc-loi-bigfake", title: "Big Fake Deal · LOI v3",   deal: "Big Fake Deal · sample", updated: "3 days ago", status: "draft" },
  { id: "doc-nda-acme",    title: "Acme NDA · executed",      deal: "Acme acquisition",        updated: "Mar 18",     status: "final" },
  { id: "doc-memo-q1",     title: "Q1 thesis memo",           deal: "Strategic",               updated: "Feb 28",     status: "final" },
  { id: "doc-loi-pest",    title: "Pest Control · LOI v1",    deal: "Pest Control · FL",       updated: "Mar 22",     status: "draft" },
  { id: "doc-qoe-bigfake", title: "Big Fake Deal · QoE",      deal: "Big Fake Deal · sample",  updated: "Mar 24",     status: "live"  },
  { id: "doc-ioi-elec",    title: "Electrical · IOI",         deal: "Electrical · TX",         updated: "Mar 20",     status: "sent"  },
];

interface Template { id: string; name: string; sub: string; tag: string }

const TEMPLATES: Template[] = [
  { id: "t-nda",  name: "NDA",             sub: "Mutual · light",         tag: "NDA"  },
  { id: "t-loi",  name: "LOI",             sub: "Letter of intent",       tag: "LOI"  },
  { id: "t-ioi",  name: "IOI",             sub: "Indication of interest", tag: "IOI"  },
  { id: "t-memo", name: "Investment memo", sub: "Internal thesis",        tag: "MEMO" },
  { id: "t-qoe",  name: "QoE Lite",        sub: "Quality of earnings",    tag: "QoE"  },
  { id: "t-apa",  name: "APA",             sub: "Asset purchase",         tag: "APA"  },
];

interface Folder { id: string; name: string; count: number }

const FOLDERS: Folder[] = [
  { id: "f-bigfake", name: "Big Fake Deal · sample",  count: 8  },
  { id: "f-pest",    name: "Pest Control · FL",       count: 4  },
  { id: "f-elec",    name: "Electrical · TX",         count: 5  },
  { id: "f-archive", name: "Closed deals · 2025",     count: 47 },
];

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
  const deal = pickActionDeal(workspace.deals);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

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

  const openFolder = (folder: Folder) => {
    const dealId = sampleFolderDealId(folder.id);
    openTab({
      kind: "deal",
      id: dealId,
      title: folder.name.replace(" · sample", ""),
      fileScope: "all",
    });
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

      <div className="wksec">
        <div className="wksec-title">Start from a template</div>
        <div className="wkgrid g3">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className="wkcard tap"
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

      <div className="wksec">
        <div className="wksec-title">Recently edited</div>
        <p className="pg-sub" style={{ marginTop: 0, marginBottom: 14 }}>Open any to keep working — Yulia stays in context.</p>
        <div className="wkgrid g2">
          {RECENTS.map(d => (
            <div
              key={d.id}
              className="wkcard tap"
              onClick={() => openTab({ kind: "doc", title: d.title, id: d.id })}
              role="button"
              tabIndex={0}
              aria-label={`${d.title}, ${d.status}, ${d.deal}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "doc", title: d.title, id: d.id }); } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <V6Icon name="doc" size={16} />
                <V6DocStatus status={d.status} />
              </div>
              <div className="wkcard-title" style={{ marginTop: 14 }}>{d.title}</div>
              <div className="wkcard-sub" style={{ marginTop: 2 }}>{d.deal}</div>
              {/* Sentence case, plain ink (eyebrow lock — the letterspaced
                  caps date read as a decorative micro label). */}
              <div style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 10 }}>
                {d.updated}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wksec">
        <div className="wksec-title">By deal</div>
        <div className="wkgrid g2">
          {FOLDERS.map(f => (
            <div
              key={f.id}
              className="wkcard tap"
              role="button"
              tabIndex={0}
              aria-label={`${f.name} — ${f.count} files`}
              onClick={() => openFolder(f)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFolder(f); } }}
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
                    {f.name}
                  </div>
                  <div className="wkcard-sub" style={{ marginTop: 2 }}>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{f.count}</span> files
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function sampleFolderDealId(folderId: string) {
  if (folderId.includes("pest")) return "deal-pest";
  if (folderId.includes("elec")) return "deal-electrical";
  if (folderId.includes("archive")) return "deal-dist";
  return "deal-bigfake";
}
