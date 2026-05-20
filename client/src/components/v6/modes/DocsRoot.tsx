import { useState, type CSSProperties } from "react";
import { V6Section } from "../Canvas";
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
  { id: "doc-qoe-bigfake", title: "Big Fake Deal · QoE",      deal: "Big Fake Deal · sample", updated: "Mar 24",     status: "live"  },
  { id: "doc-ioi-elec",    title: "Electrical · IOI",         deal: "Electrical · TX",         updated: "Mar 20",     status: "sent"  },
];

interface Template { id: string; name: string; sub: string; tag: string; tone: TemplateTone }
type TemplateTone = "primary" | "secondary" | "tertiary" | "pursue" | "watch" | "neutral";

const TEMPLATES: Template[] = [
  { id: "t-nda",  name: "NDA",             sub: "Mutual · light",        tag: "NDA",  tone: "neutral"   },
  { id: "t-loi",  name: "LOI",             sub: "Letter of intent",      tag: "LOI",  tone: "primary"   },
  { id: "t-ioi",  name: "IOI",             sub: "Indication of interest",tag: "IOI",  tone: "secondary" },
  { id: "t-memo", name: "Investment memo", sub: "Internal thesis",       tag: "MEMO", tone: "pursue"    },
  { id: "t-qoe",  name: "QoE Lite",        sub: "Quality of earnings",   tag: "QoE",  tone: "watch"     },
  { id: "t-apa",  name: "APA",             sub: "Asset purchase",        tag: "APA",  tone: "tertiary"  },
];

const TONE_BG: Record<TemplateTone, string> = {
  primary:   "var(--m-primary-container)",
  secondary: "var(--m-secondary-container)",
  tertiary:  "var(--m-tertiary-container)",
  pursue:    "var(--m-pursue-container)",
  watch:     "var(--m-watch-container)",
  neutral:   "var(--m-surface-2)",
};
const TONE_FG: Record<TemplateTone, string> = {
  primary:   "var(--m-on-primary-container)",
  secondary: "var(--m-on-secondary-container)",
  tertiary:  "var(--m-on-tertiary-container)",
  pursue:    "var(--m-pursue-on-cont)",
  watch:     "#3F2E00",
  neutral:   "var(--m-on-surface-var)",
};

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
    <div className="m-fade-up m-page-flow" style={D.page}>
      <V6Section
        eyebrow="DOCS"
        title="Documents"
        sub="Drafts, final versions, and signed paper."
        action={
          <button
            className="m-btn filled"
            aria-label="New doc"
            type="button"
            onClick={() => { void runDocAction(); }}
            disabled={busyAction === "new-doc"}
          >
            <V6Icon name="plus" size={12} />
            <span style={{ marginLeft: 6 }}>{busyAction === "new-doc" ? "Creating..." : "New doc"}</span>
          </button>
        }
      >
        {(actionError || actionNote || workspace.error) && (
          <div style={actionError || workspace.error ? D.actionError : D.actionNote}>
            {actionError || workspace.error || actionNote}
          </div>
        )}
      </V6Section>

      <V6Section eyebrow="QUICK" title="Start from a template">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className="m-card filled-tonal m-state tap"
              onClick={() => { void runDocAction(t); }}
              role="button"
              tabIndex={0}
              aria-label={`Start a new ${t.name} (${t.sub})`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void runDocAction(t); } }}
              style={{ padding: "16px 14px", cursor: "pointer", textAlign: "center" }}
            >
              <div style={{
                ...D.templateTag,
                background: TONE_BG[t.tone],
                color: TONE_FG[t.tone],
              }}>{t.tag}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--m-on-surface)", letterSpacing: "-0.01em" }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--m-on-surface-mid)", marginTop: 1 }}>{t.sub}</div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="RECENT" title="Recently edited" sub="Open any to keep working — Yulia stays in context.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {RECENTS.map(d => (
            <div
              key={d.id}
              className="m-card m-state tap"
              onClick={() => openTab({ kind: "doc", title: d.title, id: d.id })}
              role="button"
              tabIndex={0}
              aria-label={`${d.title}, ${d.status}, ${d.deal}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTab({ kind: "doc", title: d.title, id: d.id }); } }}
              style={{ padding: "16px 18px", cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <V6Icon name="doc" size={16} />
                <V6DocStatus status={d.status} />
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
                letterSpacing: "-0.01em", color: "var(--m-on-surface)", marginTop: 14,
              }}>{d.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)", marginTop: 2 }}>{d.deal}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em", marginTop: 10 }}>
                {d.updated.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </V6Section>

      <V6Section eyebrow="FOLDERS" title="By deal">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {FOLDERS.map(f => (
            <div
              key={f.id}
              className="m-card m-state tap"
              role="button"
              tabIndex={0}
              aria-label={`${f.name} — ${f.count} files`}
              onClick={() => openFolder(f)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFolder(f); } }}
              style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={D.folderIcon}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4.5c0-0.83 0.67-1.5 1.5-1.5h2.5L7 4.5h3.5c0.83 0 1.5 0.67 1.5 1.5v4.5c0 0.83-0.67 1.5-1.5 1.5H3.5C2.67 12 2 11.33 2 10.5V4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={D.folderName}>{f.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--m-on-surface-mid)" }}>{f.count} files</div>
              </div>
            </div>
          ))}
        </div>
      </V6Section>
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  page: {
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  templateTag: {
    width: 44, height: 32, borderRadius: 8,
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.06em",
    margin: "0 auto 10px",
  },
  folderIcon: {
    width: 32, height: 32, borderRadius: 9,
    background: "var(--m-tertiary-container)",
    color: "var(--m-on-tertiary-container)",
    display: "grid", placeItems: "center",
    flexShrink: 0,
  },
  folderName: {
    fontSize: 13, fontWeight: 600, color: "var(--m-on-surface)",
    letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  actionNote: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(225, 242, 235, 0.9)",
    color: "#246B50",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
  actionError: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--m-pass-container)",
    color: "#6F241E",
    fontSize: 12.5,
    boxShadow: "var(--m-elev-1)",
  },
};

function sampleFolderDealId(folderId: string) {
  if (folderId.includes("pest")) return "deal-pest";
  if (folderId.includes("elec")) return "deal-electrical";
  if (folderId.includes("archive")) return "deal-dist";
  return "deal-bigfake";
}
