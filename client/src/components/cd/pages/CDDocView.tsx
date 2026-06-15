/**
 * CDDocView — the document viewer ported into the Claude Design (CD)
 * cool/indigo language. Renders a deliverable's real content as an editable
 * paper sheet with a CD header (title, kind, status) and a right rail of
 * honest actions (ask Yulia / request review / file to data room / share /
 * regenerate), plus live comments and version history.
 *
 * DATA — identical wiring to the V6 predecessor (views/DocView.tsx):
 *   GET   /api/deliverables/:id              → the deliverable row (polled while queued/generating)
 *   GET   /api/deliverables/:id/comments     → live comments (sample fallback only when no id)
 *   GET   /api/deliverables/:id/versions     → version history
 *   PATCH /api/deliverables/:id/content      → save edited markdown
 *   POST  /api/deliverables/:id/regenerate   → re-run via Yulia
 *   executeSurfaceAction(...)                → request_review / file_to_data_room / share_document
 *   DealCommentsThread (real id) wires comments + @mentions itself.
 *
 * Props match V6DocView EXACTLY so it drops into Canvas as a 1:1 route swap:
 *   { id, title, openTab?, modelPreference?, onTalkToYulia? }.
 *
 * The CD mockup (ultra-modern-fintech/files.jsx) informs the chrome only; no
 * demo data is copied. Mounts under `.cd-root` (cdTokens.css). Only --cd-*
 * tokens on the new chrome. The editable sheet stays serif paper so the
 * formatting toolbar's execCommand calls behave the same as in V6.
 *
 * THE LINE: every action routes to chat (onTalkToYulia), opens a tab, or stages
 * a governed surface action that asks the user to confirm — Yulia shows the
 * read and implications, never a transaction recommendation. CDLineNote sits
 * under her live read. HONESTY: content/comments/versions/seal are real or an
 * honest empty state — the fabricated LOI body shows ONLY for a no-id sample.
 */
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import Markdown from "react-markdown";
import { authHeaders } from "../../../hooks/useAuth";
import type { ModelPreference } from "../../../lib/modelPreference";
import { executeSurfaceAction } from "../../../lib/v6ActionContracts";
import type { SurfaceActionId } from "../../../lib/v6SurfaceActions";
import type { OpenTab } from "../../v6/types";
import { DealCommentsThread } from "../../v6/shared/DealCommentsThread";
import { WorkSeal } from "../../v6/shared/WorkSeal";
import { CDIcon, CDPill, CDLineNote, type CDTone, type CDIconName } from "../kit/cdUi";

/* ─── Server response shapes (mirror V6 DocView's real fetches) ─────────── */
interface DeliverableRow {
  id: number;
  deal_id: number;
  type: string;
  status: string;
  content: unknown;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  version_number?: number | null;
  doc_class?: string | null;
  name?: string;
  slug?: string;
  /** `d.*` from /api/deliverables/:id — the same JSONB the data room probes for outputHash */
  generated_from_snapshot?: unknown;
}
interface LiveComment {
  id: number;
  content: string;
  section_ref?: string | null;
  resolved?: boolean;
  created_at: string;
  display_name?: string | null;
  email?: string | null;
  participant_role?: string | null;
}
interface DeliverableVersion {
  id: number;
  version: number;
  change_summary?: string | null;
  created_at: string;
}

/* ─── Sample-only fixtures (shown ONLY when there is no numeric id) ──────── */
interface SampleComment { who: string; txt: string; time: string; resolved?: boolean }
const SAMPLE_COMMENTS: SampleComment[] = [
  { who: "JM", txt: "Earn-out should be tied to gross margin not EBITDA — too easy to game.", time: "1d" },
  { who: "Y", txt: "Working cap target looks light vs trailing 12 ($487k avg). Suggest $460k.", time: "today" },
  { who: "JM", txt: "Agree. Update before sending.", time: "2h" },
];
interface SampleVersion { v: string; date: string; current?: boolean }
const SAMPLE_VERSIONS: SampleVersion[] = [
  { v: "v3", date: "Today, 12 min ago", current: true },
  { v: "v2", date: "Mar 24 · 4:18 PM" },
  { v: "v1", date: "Mar 22 · 10:04 AM" },
];

/* ─── Editor toolbar (same execCommand actions as V6) ───────────────────── */
const TOOLBAR_BUTTONS = [
  { key: "h", label: "Heading", v: "H2", weight: 600 },
  { key: "b", label: "Bold", v: "B", weight: 700 },
  { key: "i", label: "Italic", v: "I", italic: true },
  { key: "u", label: "Underline", v: "U", underline: true },
  { key: "k", label: "Link", v: "Link" },
  { key: "ul", label: "Bulleted list", v: "≣" },
  { key: "q", label: "Quote", v: "❝" },
] as const;

/* Status → CD pill tone + icon (the deliverable's own lifecycle, real). */
function statusMeta(status?: string | null): { tone: CDTone; label: string; icon: CDIconName } {
  const s = (status || "").toLowerCase();
  if (s === "complete") return { tone: "pos", label: "Complete", icon: "check" };
  if (s === "queued" || s === "generating") return { tone: "accent", label: s === "queued" ? "Queued" : "Generating", icon: "sparkle" };
  if (s === "draft") return { tone: "neutral", label: "Draft", icon: "doc" };
  if (s) return { tone: "neutral", label: titleCase(s), icon: "doc" };
  return { tone: "neutral", label: "Draft", icon: "doc" };
}

/* ════════════════════════════════════════════════════════════════════════
   The page
   ════════════════════════════════════════════════════════════════════════ */
export function CDDocView({
  id,
  title,
  openTab,
  modelPreference,
  onTalkToYulia,
}: {
  id: string;
  title: string;
  openTab?: OpenTab;
  modelPreference?: ModelPreference;
  onTalkToYulia?: (prompt: string) => void;
}) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [doc, setDoc] = useState<DeliverableRow | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [versions, setVersions] = useState<DeliverableVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolbarNote, setToolbarNote] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // ── Load + poll the deliverable (identical to V6) ──────────────────────
  useEffect(() => {
    if (numericId === null) return;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    const load = async (withSpinner: boolean) => {
      if (withSpinner) setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/deliverables/${numericId}`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        if (cancelled) return;
        setDoc(payload);
        void loadDocumentContext(numericId, setComments, setVersions);
        if (!["queued", "generating"].includes(payload?.status) && poll) {
          clearInterval(poll);
          poll = null;
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load deliverable");
      } finally {
        if (!cancelled && withSpinner) setLoading(false);
      }
    };
    void load(true);
    poll = setInterval(() => void load(false), 4000);
    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
  }, [numericId]);

  // ── Derived view state (mirrors V6 derivations) ────────────────────────
  const markdown = extractMarkdown(doc?.content);
  const docType = doc?.type || doc?.slug || "document";
  const docTitle = doc?.name || title.replace(/ · (LOI|Memo|CIM)[\s\w]*$/, "");
  const sm = statusMeta(doc?.status);
  const isComplete = doc?.status === "complete";
  // HONESTY: only a hash the server actually sent gets sealed; usually null
  // (Phase 4 plumbing), so we render a plain completed line, never a fake seal.
  const completedOutputHash = isComplete ? extractOutputHash(doc) : null;
  const showSample = !numericId;
  // Never fabricate an edit timestamp — show one only when the deliverable loaded,
  // or an honest "Sample draft" label for the non-id sample. Was "Saved 12m ago".
  const savedAt = doc ? `Saved ${fmtRelative(doc.updated_at)}` : showSample ? "Sample draft" : null;
  const showFetched = !!markdown;
  const isGenerating = !!numericId && !!doc && ["queued", "generating"].includes(doc.status) && !markdown;
  const sampleComments = SAMPLE_COMMENTS;
  const currentVersion = doc?.version_number || 1;
  const normalizedVersions = showSample
    ? SAMPLE_VERSIONS
    : [
        { v: `v${currentVersion}`, date: doc?.updated_at ? fmtRelative(doc.updated_at) : "current", current: true },
        ...versions
          .filter(v => v.version !== currentVersion)
          .map(v => ({ v: `v${v.version}`, date: fmtRelative(v.created_at), current: false })),
      ];
  const yuliaWatch = buildYuliaWatch({ showSample, isGenerating, markdown, docTitle, docType, status: doc?.status });

  // ── Editor + actions (endpoints/contracts identical to V6) ─────────────
  const applyToolbar = (key: (typeof TOOLBAR_BUTTONS)[number]["key"]) => {
    editorRef.current?.focus();
    setToolbarNote(null);
    if (!editorRef.current) {
      setToolbarNote("Open a draft section before applying formatting.");
      return;
    }
    if (key === "h") document.execCommand("formatBlock", false, "h2");
    if (key === "b") document.execCommand("bold");
    if (key === "i") document.execCommand("italic");
    if (key === "u") document.execCommand("underline");
    if (key === "ul") document.execCommand("insertUnorderedList");
    if (key === "q") document.execCommand("formatBlock", false, "blockquote");
    if (key === "k") {
      const url = window.prompt("Link URL");
      if (url) document.execCommand("createLink", false, url);
    }
    setToolbarNote("Formatting applied to the selected draft text.");
  };

  const saveDraft = async () => {
    if (!editorRef.current) {
      setToolbarNote("Nothing editable is open yet.");
      return;
    }
    if (numericId === null) {
      setToolbarNote("This is a sample draft. Real generated deliverables save back to the workspace.");
      onTalkToYulia?.(`Save this sample draft direction for ${title} and tell me what real deal facts are missing before generation.`);
      return;
    }
    const markdownBody = editorRef.current.innerText.trim();
    if (!markdownBody) {
      setToolbarNote("The draft is empty, so there is nothing to save.");
      return;
    }
    setSaveBusy(true);
    setToolbarNote(null);
    try {
      const res = await fetch(`/api/deliverables/${numericId}/content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ markdown: markdownBody }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      setToolbarNote("Draft saved to the workspace.");
    } catch (e: any) {
      setToolbarNote(e?.message || "Could not save this draft.");
    } finally {
      setSaveBusy(false);
    }
  };

  const runDocumentAction = async (actionId: SurfaceActionId, actionPrompt: string) => {
    if (!numericId || !doc) {
      onTalkToYulia?.(`${actionPrompt} This is a sample or unsaved document, so tell me what real deal context you need before acting.`);
      return;
    }
    setActionBusy(actionId);
    setToolbarNote(null);
    try {
      await executeSurfaceAction({
        actionId,
        deal: { id: doc.deal_id, name: docTitle },
        document: { id: numericId, title: docTitle },
        openTab: openTab ?? (() => undefined),
        title: docTitle,
        modelPreference,
        requestedFrom: "document_view",
        prompt: `${actionPrompt} Deliverable id ${numericId}. Deal id ${doc.deal_id}. Document title: ${docTitle}.`,
        onNote: setToolbarNote,
        onTalkToYulia,
      });
    } catch (e: any) {
      onTalkToYulia?.(`${actionPrompt} I tried from the document viewer but need Yulia to coordinate it: ${e?.message || "document action failed"}`);
      setToolbarNote("Yulia has the document request.");
    } finally {
      setActionBusy(null);
    }
  };

  const regenerateDraft = async () => {
    if (!numericId) {
      onTalkToYulia?.(`Regenerate the sample document direction for ${title} once I provide a real deal.`);
      return;
    }
    setActionBusy("regenerate");
    setToolbarNote(null);
    try {
      const res = await fetch(`/api/deliverables/${numericId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ modelPreference: modelPreference ?? "auto" }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      setToolbarNote("Yulia is regenerating the latest version. This tab will refresh.");
      setDoc(prev => prev ? { ...prev, status: "queued", content: null } : prev);
    } catch (e: any) {
      setToolbarNote(e?.message || "Could not regenerate this deliverable.");
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "26px 30px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      <div style={SH.layout}>
        {/* ── The sheet column: header + toolbar + paper ── */}
        <div style={{ minWidth: 0 }}>
          {/* Header — title, kind, status, save/seal */}
          <div style={SH.headerCard}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 8 }}>
                  <CDPill tone={sm.tone}>
                    <CDIcon name={sm.icon} size={11} color={pillIconColor(sm.tone)} />{sm.label}
                  </CDPill>
                  <span style={SH.kindLabel}>{formatDocTypeLabel(docType)}</span>
                  {doc?.version_number != null && (
                    <span className="cd-num" style={SH.versionChip}>v{doc.version_number}</span>
                  )}
                </div>
                <h1 style={SH.docH1}>{docTitle}</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {/* THE STAMP — keyed by status so the generating→complete poll
                    transition mounts it fresh and the stamp-in plays once. */}
                {isComplete && completedOutputHash && (
                  <WorkSeal
                    key={`seal-${doc!.status}`}
                    modelId={doc!.doc_class || doc!.type}
                    version={doc!.version_number ?? undefined}
                    outputHash={completedOutputHash}
                    timestamp={doc!.completed_at ?? undefined}
                  />
                )}
                {isComplete && !completedOutputHash && (
                  <span key={`completed-${doc!.status}`} className="cd-num" style={SH.metaText}>
                    v{doc!.version_number || 1} · completed{doc!.completed_at ? ` ${fmtRelative(doc!.completed_at)}` : ""}
                  </span>
                )}
                <button type="button" onClick={() => void saveDraft()} disabled={saveBusy} style={SH.saveBtn}>
                  {saveBusy ? "Saving…" : "Save"}
                </button>
                {savedAt && <span className="cd-num" style={SH.metaText}>{savedAt}</span>}
              </div>
            </div>

            {/* Formatting toolbar */}
            <div style={SH.toolbar}>
              {TOOLBAR_BUTTONS.map((b, i) => (
                <Fragment key={b.key}>
                  {(i === 1 || i === 4) && <span style={SH.toolbarDivider} />}
                  <button
                    aria-label={b.label}
                    type="button"
                    onClick={() => applyToolbar(b.key)}
                    style={{
                      ...SH.toolbarBtn,
                      fontWeight: "weight" in b ? b.weight : 500,
                      fontStyle: "italic" in b && b.italic ? "italic" : "normal",
                      textDecoration: "underline" in b && b.underline ? "underline" : "none",
                    }}
                  >{b.v}</button>
                </Fragment>
              ))}
            </div>
            {toolbarNote && <div style={SH.toolbarNote}>{toolbarNote}</div>}
          </div>

          {/* THE SHEET — physical paper resting on canvas. Editable serif body
              so the toolbar's execCommand calls behave as in V6. */}
          <div style={SH.sheet}>
            {loading && (
              <p className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>LOADING DELIVERABLE…</p>
            )}
            {error && (
              <div style={SH.errorBanner}>
                Couldn&rsquo;t load deliverable ({error}). Showing reference layout.
              </div>
            )}

            {showFetched && (
              <div ref={editorRef} contentEditable suppressContentEditableWarning style={SH.docMarkdown}>
                <Markdown>{markdown!}</Markdown>
              </div>
            )}

            {isGenerating && (
              <CDEmpty
                icon="sparkle"
                title="This deliverable is being built."
                body="You can leave this tab open. It will refresh automatically when the draft is ready."
              />
            )}

            {/* A real deliverable id must NEVER show the fabricated sample body —
                not even as a flash while the record loads. Honest state instead. */}
            {!showSample && !showFetched && !loading && !error && !isGenerating && !doc && (
              <CDEmpty
                icon="doc"
                title="This deliverable isn’t available yet."
                body="It may still be preparing. Reopen it from the deal page, or ask Yulia for its status."
              />
            )}

            {showSample && (
              <div ref={editorRef} contentEditable suppressContentEditableWarning style={SH.docMarkdown}>
                <p style={SH.docMeta}>
                  From: Apex SMB Holdings &nbsp;·&nbsp; To: J. Marston, Owner &nbsp;·&nbsp; Re: Acquisition of {docTitle} &nbsp;·&nbsp; Date: March 27, 2026
                </p>
                <p>
                  We are pleased to submit this non-binding letter of intent (&ldquo;<strong>LOI</strong>&rdquo;) to acquire substantially all of the assets and operating business of {docTitle} Co., LLC (the &ldquo;<strong>Company</strong>&rdquo;), subject to the terms summarized below.
                </p>
                <h2>1. Purchase Price &amp; Structure</h2>
                <p>Total enterprise value of <strong>$11.4M</strong> on a debt-free, cash-free basis, comprised of:</p>
                <ul>
                  <li><strong>$8.6M</strong> cash at closing, financed via SBA 7(a) loan and equity contribution</li>
                  <li><strong>$1.8M</strong> seller note, 5-year amortization at 7.5% interest</li>
                  <li><strong>$1.0M</strong> earn-out tied to 2026 EBITDA targets, paid quarterly in 2027</li>
                </ul>
                <h2>2. Diligence &amp; Conditions</h2>
                <p>
                  <span style={SH.highlight}>45-day exclusivity period commencing on signature of this LOI</span>, during which the Buyer will conduct customary due diligence including financial review, legal/contractual review, and customer interviews (with prior approval).
                </p>
                <h2>3. Working Capital</h2>
                <p>
                  The Company shall be delivered with a normalized level of working capital, defined as the trailing 12-month average less ordinary cash distributions to the Seller. A target of <strong>$420,000</strong> in net working capital shall be agreed upon prior to closing.
                </p>
                <h2>4. Transition &amp; Non-Compete</h2>
                <p>
                  The Seller agrees to a 90-day transition period at full salary, with consulting availability for an additional 9 months at a reduced rate. A 4-year non-compete covering the East Texas service region will be executed at closing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right rail: Yulia's read, actions, comments, versions ── */}
        <aside style={SH.rail}>
          {/* Yulia's live read — under THE LINE note */}
          <div style={SH.yuliaCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <span style={SH.yuliaBadge}><CDIcon name="sparkle" size={13} color="white" /></span>
              <span style={SH.yuliaTitle}>{yuliaWatch.title}</span>
            </div>
            <p style={SH.yuliaBody}>{yuliaWatch.body}</p>
            <CDLineNote style={{ marginTop: 9 }} />
          </div>

          {/* Document actions — all route to chat, a tab, or a staged action */}
          <div style={SH.railCard}>
            <div className="cd-eyebrow" style={{ marginBottom: 10 }}>Document actions</div>
            <div style={{ display: "grid", gap: 8 }}>
              <button
                type="button"
                style={SH.actionPrimary}
                onClick={() => onTalkToYulia?.(`Read ${docTitle}${numericId ? ` (deliverable ${numericId})` : ""} and tell me what needs my attention, what is ready, and what should not move without counsel or CPA sign-off.`)}
              >
                <CDIcon name="sparkle" size={14} color="white" />Ask Yulia
              </button>
              <button
                type="button"
                style={SH.actionGhost}
                disabled={actionBusy === "request_review"}
                onClick={() => { void runDocumentAction("request_review", "Stage a review request for this document. Decide the right reviewer role from the document context and ask me to confirm before notifying anyone."); }}
              >
                <CDIcon name="check" size={14} color="var(--cd-ink-3)" />{actionBusy === "request_review" ? "Staging…" : "Request review"}
              </button>
              <button
                type="button"
                style={SH.actionGhost}
                disabled={actionBusy === "file_to_data_room"}
                onClick={() => { void runDocumentAction("file_to_data_room", "Stage filing this deliverable into the correct data-room folder. Confirm the folder, permissions, and whether it is an artifact, drafted legal doc, review item, or executed record before moving it."); }}
              >
                <CDIcon name="docs" size={14} color="var(--cd-ink-3)" />{actionBusy === "file_to_data_room" ? "Staging…" : "File to data room"}
              </button>
              <button
                type="button"
                style={SH.actionGhost}
                disabled={actionBusy === "share_document"}
                onClick={() => { void runDocumentAction("share_document", "Stage sharing this document. Ask me for the recipient, access level, expiry, and whether NDA or passkey protection is required before sending anything."); }}
              >
                <CDIcon name="share" size={14} color="var(--cd-ink-3)" />{actionBusy === "share_document" ? "Staging…" : "Share safely"}
              </button>
              <button
                type="button"
                style={SH.actionGhost}
                disabled={actionBusy === "regenerate"}
                onClick={() => { void regenerateDraft(); }}
              >
                <CDIcon name="bolt" size={14} color="var(--cd-ink-3)" />{actionBusy === "regenerate" ? "Regenerating…" : "Regenerate"}
              </button>
            </div>
          </div>

          {/* Comments — real thread for a live deliverable, sample list otherwise */}
          {numericId !== null ? (
            <DealCommentsThread deliverableId={numericId} />
          ) : (
            <div style={SH.railCard}>
              <div className="cd-eyebrow" style={{ marginBottom: 10 }}>Comments · {sampleComments.length}</div>
              {sampleComments.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 10,
                    marginBottom: i === sampleComments.length - 1 ? 0 : 11,
                    paddingBottom: i === sampleComments.length - 1 ? 0 : 11,
                    borderBottom: i === sampleComments.length - 1 ? "none" : "1px solid var(--cd-line)",
                  }}
                >
                  <div style={SH.commentAvatar}>{c.who}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={SH.commentTxt}>{c.txt}</div>
                    <div className="cd-num" style={SH.commentTime}>{c.resolved ? "Resolved · " : ""}{c.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Version history */}
          <div style={SH.railCard}>
            <div className="cd-eyebrow" style={{ marginBottom: 9 }}>Version history</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {normalizedVersions.map(v => (
                <div
                  key={v.v}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 12,
                    color: v.current ? "var(--cd-ink)" : "var(--cd-ink-2)",
                  }}
                >
                  <span style={{ fontWeight: v.current ? 700 : 500 }}>
                    {v.v}{v.current ? " · current" : ""}
                  </span>
                  <span className="cd-num" style={{ fontSize: 10.5, color: "var(--cd-ink-3)" }}>{v.date}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Honest empty / building state ─────────────────────────────────────── */
function CDEmpty({ icon, title, body }: { icon: CDIconName; title: string; body: string }) {
  return (
    <div style={{ padding: "44px 16px", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--cd-surface-2)", display: "grid", placeItems: "center", marginBottom: 13 }}>
        <CDIcon name={icon} size={22} color="var(--cd-ink-3)" />
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--cd-ink)", fontFamily: "var(--cd-sans)" }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--cd-ink-2)", marginTop: 6, maxWidth: 360, lineHeight: 1.5, fontFamily: "var(--cd-sans)" }}>{body}</div>
    </div>
  );
}

/* ─── Async context load (comments + versions) — identical to V6 ────────── */
async function loadDocumentContext(
  deliverableId: number,
  setComments: (comments: LiveComment[]) => void,
  setVersions: (versions: DeliverableVersion[]) => void,
) {
  const [commentRes, versionRes] = await Promise.allSettled([
    fetch(`/api/deliverables/${deliverableId}/comments`, { headers: authHeaders() }),
    fetch(`/api/deliverables/${deliverableId}/versions`, { headers: authHeaders() }),
  ]);
  if (commentRes.status === "fulfilled" && commentRes.value.ok) {
    const payload = await commentRes.value.json().catch(() => []);
    setComments(Array.isArray(payload) ? payload : []);
  }
  if (versionRes.status === "fulfilled" && versionRes.value.ok) {
    const payload = await versionRes.value.json().catch(() => ({}));
    setVersions(Array.isArray(payload.versions) ? payload.versions : []);
  }
}

/* ─── Yulia's live read text (honest by state) ──────────────────────────── */
function buildYuliaWatch({
  showSample, isGenerating, markdown, docTitle, docType, status,
}: {
  showSample: boolean; isGenerating: boolean; markdown: string | null;
  docTitle: string; docType: string; status?: string | null;
}) {
  if (showSample) {
    return {
      title: "Sample draft read",
      body: "Section 2 has a long exclusivity window. In a real document, Yulia would compare it against deal context, evidence, and reviewer sign-offs.",
    };
  }
  if (isGenerating) {
    return {
      title: "Yulia is generating this",
      body: "The live deliverable is queued. When it finishes, this page becomes the editable work surface and Yulia can review, route, or file it.",
    };
  }
  if (markdown) {
    return {
      title: "Yulia is reading this work product",
      body: `${docTitle} is a ${docType.replace(/[-_]/g, " ")} in ${status || "draft"} state. Ask Yulia for issues, redlines, reviewer routing, data-room placement, or execution blockers.`,
    };
  }
  return {
    title: "Yulia needs the source document",
    body: "The deliverable record is live, but no readable content is loaded yet. Regenerate it or ask Yulia what source data is missing.",
  };
}

/* ─── Content / hash probes (verbatim from V6 — never fabricate) ────────── */
function extractOutputHash(doc: DeliverableRow | null): string | null {
  if (!doc) return null;
  let content: unknown = doc.content;
  if (typeof content === "string") {
    try { content = JSON.parse(content); } catch { content = null; }
  }
  const candidates: unknown[] = [];
  if (content && typeof content === "object") {
    const obj = content as Record<string, any>;
    candidates.push(obj.outputHash, obj.snapshot?.outputHash, obj.artifact?.outputHash);
  }
  const snap = doc.generated_from_snapshot;
  if (snap && typeof snap === "object") {
    candidates.push((snap as Record<string, any>).outputHash);
  }
  const hash = candidates.find(value => typeof value === "string" && value.trim().length > 0);
  return typeof hash === "string" ? hash : null;
}

function extractMarkdown(content: unknown): string | null {
  if (!content) return null;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return extractMarkdown(parsed) || content;
    } catch {
      return content;
    }
  }
  if (typeof content !== "object") return null;
  const obj = content as Record<string, any>;
  if (typeof obj.markdown === "string") return obj.markdown;
  if (typeof obj.content === "string") return obj.content;
  if (typeof obj.text === "string") return obj.text;
  if (Array.isArray(obj.sections)) {
    const parts = obj.sections
      .map((section: any) => {
        if (typeof section === "string") return section;
        if (!section || typeof section !== "object") return "";
        const sectionTitle = section.title || section.heading || section.name;
        const body = section.content || section.body || section.text;
        return [sectionTitle ? `## ${sectionTitle}` : "", typeof body === "string" ? body : ""].filter(Boolean).join("\n\n");
      })
      .filter(Boolean);
    if (parts.length) return parts.join("\n\n");
  }
  return "```json\n" + JSON.stringify(content, null, 2) + "\n```";
}

/* "letter_of_intent" → "Letter of intent", "cim" → "CIM" */
function formatDocTypeLabel(value: string): string {
  const spaced = value.replace(/[-_]/g, " ").trim();
  const acronymed = spaced.replace(/\b(loi|cim|nda|ioi|qoe|apa|spa)\b/gi, m => m.toUpperCase());
  return acronymed.charAt(0).toUpperCase() + acronymed.slice(1);
}
function titleCase(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function pillIconColor(tone: CDTone): string {
  if (tone === "pos") return "var(--cd-pos)";
  if (tone === "accent") return "var(--cd-accent-strong)";
  if (tone === "neg") return "var(--cd-neg)";
  if (tone === "warn") return "oklch(0.5 0.13 75)";
  return "var(--cd-ink-3)";
}
function fmtRelative(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.round(ms / 60_000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.round(hr / 24);
    return `${d}d ago`;
  } catch { return ""; }
}

/* ─── CD styles (only --cd-* tokens) ────────────────────────────────────── */
const SH: Record<string, CSSProperties> = {
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: "var(--cd-gap)",
    alignItems: "start",
    maxWidth: 1180,
    margin: "0 auto",
    width: "100%",
  },
  headerCard: {
    background: "var(--cd-surface)",
    border: "1px solid var(--cd-line)",
    borderRadius: "var(--cd-r-lg)",
    boxShadow: "var(--cd-shadow-md)",
    padding: "18px 20px",
    marginBottom: "var(--cd-gap)",
  },
  kindLabel: { fontSize: 12, fontWeight: 600, color: "var(--cd-ink-2)" },
  versionChip: {
    fontSize: 11, fontWeight: 700, color: "var(--cd-ink-3)",
    background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)",
    borderRadius: 6, padding: "2px 7px",
  },
  docH1: {
    margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 26,
    letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--cd-ink)", textWrap: "balance",
  },
  metaText: {
    fontSize: 10.5, color: "var(--cd-ink-3)", whiteSpace: "nowrap",
  },
  saveBtn: {
    display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px",
    borderRadius: "var(--cd-r-md)", border: "none", background: "var(--cd-accent)",
    color: "white", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--cd-sans)",
    cursor: "pointer", whiteSpace: "nowrap",
  },
  toolbar: {
    display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap",
    marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--cd-line)",
  },
  toolbarDivider: { width: 1, height: 16, background: "var(--cd-line-2)", margin: "0 6px" },
  toolbarBtn: {
    all: "unset", padding: "5px 10px", borderRadius: 7,
    fontSize: 12.5, color: "var(--cd-ink-2)", cursor: "pointer",
    fontFamily: "var(--cd-sans)",
  },
  toolbarNote: {
    marginTop: 12, padding: "9px 12px", borderRadius: "var(--cd-r-md)",
    background: "var(--cd-accent-soft)", color: "var(--cd-accent-strong)",
    fontSize: 12, lineHeight: 1.4, fontFamily: "var(--cd-sans)",
  },
  sheet: {
    background: "var(--cd-surface)",
    borderRadius: 6,
    border: "1px solid var(--cd-line)",
    boxShadow: "var(--cd-shadow-lg)",
    padding: "44px 52px",
    minHeight: 560,
    fontFamily: "var(--cd-serif)",
    color: "var(--cd-ink)",
  },
  errorBanner: {
    padding: "10px 12px", borderRadius: "var(--cd-r-md)", marginBottom: 16,
    background: "var(--cd-neg-soft)", color: "var(--cd-neg)", fontSize: 12.5,
    border: "1px solid var(--cd-neg-soft)", fontFamily: "var(--cd-sans)",
  },
  docMarkdown: {
    fontSize: 16, lineHeight: 1.7,
    fontFamily: "var(--cd-serif)",
    color: "var(--cd-ink)",
    outline: "none",
  },
  docMeta: {
    fontSize: 13.5, color: "var(--cd-ink-2)", marginBottom: 26, fontFamily: "var(--cd-sans)",
  },
  highlight: {
    background: "var(--cd-warn-soft)", padding: "1px 4px", borderRadius: 3,
  },
  rail: {
    position: "sticky", top: 0,
    display: "flex", flexDirection: "column", gap: "var(--cd-gap)",
  },
  yuliaCard: {
    background: "linear-gradient(180deg, var(--cd-accent-soft), var(--cd-surface))",
    border: "1px solid var(--cd-accent-ring)",
    borderRadius: "var(--cd-r-lg)",
    boxShadow: "var(--cd-shadow-sm)",
    padding: "15px 16px",
  },
  yuliaBadge: {
    width: 26, height: 26, borderRadius: 8, background: "var(--cd-accent)",
    display: "grid", placeItems: "center", flexShrink: 0,
  },
  yuliaTitle: { fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)" },
  yuliaBody: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--cd-ink-2)" },
  railCard: {
    background: "var(--cd-surface)",
    border: "1px solid var(--cd-line)",
    borderRadius: "var(--cd-r-lg)",
    boxShadow: "var(--cd-shadow-sm)",
    padding: "15px 16px",
  },
  actionPrimary: {
    all: "unset", boxSizing: "border-box", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 7, width: "100%", padding: "9px",
    borderRadius: "var(--cd-r-md)", background: "var(--cd-accent)", color: "white",
    fontSize: 12.5, fontWeight: 600, fontFamily: "var(--cd-sans)", cursor: "pointer",
  },
  actionGhost: {
    all: "unset", boxSizing: "border-box", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 7, width: "100%", padding: "9px",
    borderRadius: "var(--cd-r-md)", background: "var(--cd-surface)",
    border: "1px solid var(--cd-line-2)", color: "var(--cd-ink-2)",
    fontSize: 12.5, fontWeight: 600, fontFamily: "var(--cd-sans)", cursor: "pointer",
  },
  commentAvatar: {
    width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center",
    flexShrink: 0, fontFamily: "var(--cd-num)", fontWeight: 700, fontSize: 10,
    color: "var(--cd-accent-strong)", background: "var(--cd-accent-soft)",
    border: "1px solid var(--cd-line)",
  },
  commentTxt: { fontSize: 12.5, color: "var(--cd-ink)", lineHeight: 1.5, fontFamily: "var(--cd-sans)" },
  commentTime: { fontSize: 10, color: "var(--cd-ink-3)", marginTop: 3 },
};
