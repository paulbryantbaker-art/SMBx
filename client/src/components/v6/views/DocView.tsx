import { Fragment, useEffect, useState, type CSSProperties } from "react";
import Markdown from "react-markdown";
import { V6DocStatus, type DocStatusKind } from "../modes/cards";
import { authHeaders } from "../../../hooks/useAuth";

interface DeliverableRow {
  id: number;
  type: string;
  status: string;
  content: unknown;
  created_at: string;
  updated_at: string;
  name?: string;
  slug?: string;
}

const TOOLBAR_BUTTONS = [
  { key: "h", label: "Heading", v: "H2 ▾", weight: 500 },
  { key: "b", label: "Bold", v: "B", weight: 700 },
  { key: "i", label: "Italic", v: "I", italic: true },
  { key: "u", label: "Underline", v: "U", underline: true },
  { key: "k", label: "Link", v: "Link" },
  { key: "ul", label: "Bulleted list", v: "≣" },
  { key: "q", label: "Quote", v: "❝" },
] as const;

interface Comment { who: string; color: string; txt: string; time: string }

const COMMENTS: Comment[] = [
  { who: "JM", color: "var(--m-tertiary-container)", txt: "Earn-out should be tied to gross margin not EBITDA — too easy to game.", time: "1d" },
  { who: "Y",  color: "var(--m-primary-container)",  txt: "Working cap target looks light vs trailing 12 ($487k avg). Suggest $460k.", time: "today" },
  { who: "JM", color: "var(--m-tertiary-container)", txt: "Agree. Update before sending.", time: "2h" },
];

interface Version { v: string; date: string; current?: boolean }

const VERSIONS: Version[] = [
  { v: "v3", date: "Today, 12 min ago", current: true },
  { v: "v2", date: "Mar 24 · 4:18 PM" },
  { v: "v1", date: "Mar 22 · 10:04 AM" },
];

export function V6DocView({ id, title }: { id: string; title: string }) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null;
  const [doc, setDoc] = useState<DeliverableRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const markdown = extractMarkdown(doc?.content);
  const docType = doc?.type || doc?.slug || "document";
  const docTitle = doc?.name || title.replace(/ · (LOI|Memo|CIM)[\s\w]*$/, "");
  const eyebrowLabel = doc
    ? `${docType.replace(/[-_]/g, " ").toUpperCase()} · ${doc.status.toUpperCase()}`
    : "LETTER OF INTENT · DRAFT v3";
  const statusKind: DocStatusKind = doc?.status === "complete" ? "live" : doc?.status === "draft" ? "draft" : "saved";
  const savedAt = doc ? `SAVED · ${fmtRelative(doc.updated_at)}` : "SAVED · 12 MIN AGO";
  const showSample = !numericId;
  const showFetched = !!markdown;
  const isGenerating = !!numericId && !!doc && ["queued", "generating"].includes(doc.status) && !markdown;

  return (
    <div className="m-fade-up" style={V.shell}>
      <article style={V.article}>
        {/* Toolbar */}
        <div style={V.toolbar}>
          {TOOLBAR_BUTTONS.map((b, i) => (
            <Fragment key={b.key}>
              {(i === 1 || i === 4) && <div style={V.toolbarDivider} />}
              <button
                className="m-state"
                aria-label={b.label}
                style={{
                  ...V.toolbarBtn,
                  fontWeight: "weight" in b ? b.weight : 500,
                  fontStyle: "italic" in b && b.italic ? "italic" : "normal",
                  textDecoration: "underline" in b && b.underline ? "underline" : "none",
                }}
              >{b.v}</button>
            </Fragment>
          ))}
          <div style={{ flex: 1 }} />
          <span className="mono" style={V.savedAt}>{savedAt}</span>
          <V6DocStatus status={statusKind} />
        </div>

        {/* Body */}
        <div style={{ fontFamily: "Iowan Old Style, Charter, Georgia, serif", color: "var(--m-on-surface)" }}>
          <div className="mono" style={V.docEyebrow}>{eyebrowLabel}</div>
          <h1 style={V.docH1}>{docTitle}</h1>

          {loading && (
            <p className="mono" style={{ fontSize: 11, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em" }}>LOADING DELIVERABLE…</p>
          )}
          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: 8, marginBottom: 16,
              background: "var(--m-pass-container)", color: "#4A1410", fontSize: 12.5,
            }}>
              Couldn&rsquo;t load deliverable ({error}). Showing reference layout.
            </div>
          )}

          {showFetched && (
            <div style={V.docMarkdown}>
              <Markdown>{markdown!}</Markdown>
            </div>
          )}

          {isGenerating && (
            <div style={V.generatingCard}>
              <div className="mono" style={V.generatingEyebrow}>YULIA IS GENERATING</div>
              <h2 style={V.generatingTitle}>This deliverable is being built.</h2>
              <p style={V.generatingBody}>You can leave this tab open. It will refresh automatically when the draft is ready.</p>
            </div>
          )}

          {(showSample || (!showFetched && !loading && !error && numericId && !isGenerating && !doc)) && (
            <>
              <p style={V.docMeta}>
                From: Apex SMB Holdings &nbsp;·&nbsp; To: J. Marston, Owner &nbsp;·&nbsp; Re: Acquisition of {docTitle} &nbsp;·&nbsp; Date: March 27, 2026
              </p>

              <p style={V.docPara}>
                We are pleased to submit this non-binding letter of intent (&ldquo;<strong>LOI</strong>&rdquo;) to acquire substantially all of the assets and operating business of {docTitle} Co., LLC (the &ldquo;<strong>Company</strong>&rdquo;), subject to the terms summarized below.
              </p>

              <h2 style={V.docH2}>1. Purchase Price &amp; Structure</h2>
              <p style={V.docPara}>Total enterprise value of <strong>$11.4M</strong> on a debt-free, cash-free basis, comprised of:</p>
              <ul style={V.docList}>
                <li><strong>$8.6M</strong> cash at closing, financed via SBA 7(a) loan and equity contribution</li>
                <li><strong>$1.8M</strong> seller note, 5-year amortization at 7.5% interest</li>
                <li><strong>$1.0M</strong> earn-out tied to 2026 EBITDA targets, paid quarterly in 2027</li>
              </ul>

              <h2 style={V.docH2}>2. Diligence &amp; Conditions</h2>
              <p style={V.docPara}>
                <span style={V.highlight}>
                  45-day exclusivity period commencing on signature of this LOI
                  <span style={V.highlightDot} aria-label="Yulia comment marker" />
                </span>
                , during which the Buyer will conduct customary due diligence including financial review, legal/contractual review, and customer interviews (with prior approval).
              </p>

              <h2 style={V.docH2}>3. Working Capital</h2>
              <p style={V.docPara}>
                The Company shall be delivered with a normalized level of working capital, defined as the trailing 12-month average less ordinary cash distributions to the Seller. A target of <strong>$420,000</strong> in net working capital shall be agreed upon prior to closing.
              </p>

              <h2 style={V.docH2}>4. Transition &amp; Non-Compete</h2>
              <p style={V.docPara}>
                The Seller agrees to a 90-day transition period at full salary, with consulting availability for an additional 9 months at a reduced rate. A 4-year non-compete covering the East Texas service region will be executed at closing.
              </p>
            </>
          )}
        </div>
      </article>

      {/* Right rail */}
      <aside style={V.rail}>
        <div className="m-card" style={V.yuliaWatching}>
          <div className="mono" style={V.yuliaWatchEyebrow}>YULIA · LIVE</div>
          <div style={V.yuliaWatchTitle}>I&rsquo;m watching this draft</div>
          <div style={V.yuliaWatchBody}>
            Section 2 &mdash; your 45-day exclusivity is on the long side. Comparable LOIs in this sector are 30 days. Want me to flag that?
          </div>
        </div>

        <div className="m-card" style={{ padding: "14px 16px" }}>
          <div className="mono" style={V.commentsEyebrow}>COMMENTS · {COMMENTS.length}</div>
          {COMMENTS.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 10,
                marginBottom: i === COMMENTS.length - 1 ? 0 : 10,
                paddingBottom: i === COMMENTS.length - 1 ? 0 : 10,
                borderBottom: i === COMMENTS.length - 1 ? "none" : "1px solid var(--m-outline-var)",
              }}
            >
              <div style={{ ...V.commentAvatar, background: c.color }}>{c.who}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={V.commentTxt}>{c.txt}</div>
                <div className="mono" style={V.commentTime}>{c.time.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="m-card" style={{ padding: "14px 16px" }}>
          <div className="mono" style={V.versionsEyebrow}>VERSION HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {VERSIONS.map(v => (
              <div
                key={v.v}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontSize: 11.5,
                  color: v.current ? "var(--m-on-surface)" : "var(--m-on-surface-mid)",
                }}
              >
                <span style={{ fontWeight: v.current ? 600 : 400 }}>
                  {v.v} {v.current && "· current"}
                </span>
                <span className="mono" style={{ fontSize: 10 }}>{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
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
        const title = section.title || section.heading || section.name;
        const body = section.content || section.body || section.text;
        return [title ? `## ${title}` : "", typeof body === "string" ? body : ""].filter(Boolean).join("\n\n");
      })
      .filter(Boolean);
    if (parts.length) return parts.join("\n\n");
  }
  return "```json\n" + JSON.stringify(content, null, 2) + "\n```";
}

const V: Record<string, CSSProperties> = {
  shell: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: 32,
    alignItems: "flex-start",
    maxWidth: 1180,
  },
  article: {
    background: "var(--m-surface-on-light)",
    borderRadius: 16,
    boxShadow: "var(--m-elev-1)",
    padding: "56px 64px",
    minHeight: 600,
  },
  toolbar: {
    display: "flex", alignItems: "center", gap: 4, marginBottom: 32,
    paddingBottom: 16, borderBottom: "1px solid var(--m-outline-var)",
    marginLeft: -64, marginRight: -64,
    paddingLeft: 64, paddingRight: 64,
    marginTop: -56, paddingTop: 18,
  },
  toolbarDivider: {
    width: 1, height: 18, background: "var(--m-outline-var)", margin: "0 6px",
  },
  toolbarBtn: {
    all: "unset",
    padding: "5px 10px", borderRadius: 6,
    fontSize: 12, color: "var(--m-on-surface-var)", cursor: "pointer",
  },
  savedAt: {
    fontSize: 10.5, color: "var(--m-on-surface-mid)", letterSpacing: "0.1em",
  },
  docEyebrow: {
    fontSize: 10, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 12,
  },
  docH1: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30,
    letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.15,
    textWrap: "balance",
  },
  docMeta: {
    fontSize: 13.5, color: "var(--m-on-surface-mid)",
    marginBottom: 28, fontFamily: "var(--font-body)",
  },
  docPara: { fontSize: 16, lineHeight: 1.7, marginBottom: 18 },
  docH2: {
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
    letterSpacing: "-0.015em", margin: "32px 0 12px", lineHeight: 1.3,
  },
  docList: { fontSize: 16, lineHeight: 1.75, paddingLeft: 24, margin: "0 0 18px" },
  highlight: {
    background: "rgba(195, 139, 0, 0.16)",
    padding: "1px 4px", borderRadius: 3,
    position: "relative",
  },
  highlightDot: {
    position: "absolute", top: -4, right: -4,
    width: 8, height: 8, borderRadius: 999,
    background: "var(--m-watch)",
    boxShadow: "0 0 0 2px var(--m-surface-on-light)",
  },
  rail: {
    position: "sticky", top: 0,
    display: "flex", flexDirection: "column", gap: 12,
  },
  yuliaWatching: {
    padding: "14px 16px",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    border: "none",
  },
  yuliaWatchEyebrow: {
    fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 600, opacity: 0.7,
  },
  yuliaWatchTitle: {
    fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 4,
  },
  yuliaWatchBody: {
    fontSize: 11.5, marginTop: 4, lineHeight: 1.45, opacity: 0.85,
  },
  commentsEyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 10,
  },
  commentAvatar: {
    width: 22, height: 22, borderRadius: 7,
    display: "grid", placeItems: "center", flexShrink: 0,
    fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 9.5,
    color: "var(--m-on-surface)",
  },
  commentTxt: { fontSize: 12, color: "var(--m-on-surface)", lineHeight: 1.5 },
  commentTime: {
    fontSize: 10, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.06em", marginTop: 3,
  },
  versionsEyebrow: {
    fontSize: 9.5, color: "var(--m-on-surface-mid)",
    letterSpacing: "0.14em", fontWeight: 600, marginBottom: 8,
  },
  docMarkdown: {
    fontSize: 16, lineHeight: 1.7,
    fontFamily: "Iowan Old Style, Charter, Georgia, serif",
  },
  generatingCard: {
    marginTop: 20,
    padding: 22,
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(238,241,251,0.92), rgba(255,255,255,0.94))",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-1)",
    fontFamily: "var(--font-body)",
  },
  generatingEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    color: "var(--m-on-primary-container)",
    fontWeight: 800,
  },
  generatingTitle: {
    margin: "7px 0 0",
    fontFamily: "var(--font-display)",
    fontSize: 24,
    lineHeight: 1,
    color: "var(--m-on-surface)",
  },
  generatingBody: {
    margin: "8px 0 0",
    color: "var(--m-on-surface-mid)",
    fontSize: 13.5,
    lineHeight: 1.5,
  },
};

function fmtRelative(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.round(ms / 60_000);
    if (min < 60) return `${min} MIN AGO`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}H AGO`;
    const d = Math.round(hr / 24);
    return `${d}D AGO`;
  } catch { return ""; }
}
