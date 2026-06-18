/**
 * Atlas — STUDIO screen (isApp, 198px "COLLATERAL" sub-list + detail).
 *
 * COLLATERAL sub-list  = real deliverables from useV6WorkspaceData(user).deliverables
 *                        (label = name, badge = artifact_kind / tier).
 * Detail toolbar        = deliverable name + Document/Slide deck/PDF format toggle
 *                        + Export PDF (exportDeliverableFile(id,'pdf') → download blob)
 *                        + Present (honest no-op).
 * Stage                 = the selected deliverable's REAL fields + its rendered
 *                        markdown content (fetched once from GET /api/deliverables/:id,
 *                        an existing endpoint with no client hook). Nothing renderable
 *                        yet → honest "Open in chat to draft" note. NEVER fabricated
 *                        slide content.
 *
 * Honesty: every value is a real hook/endpoint field or an honest "—" / empty / loading
 * / error state. No demo literals (Project Atlas, $48M, the Pitch Deck list) are ported.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useAtlasNav, useAtlasChat } from "../atlasNav";
import {
  useV6WorkspaceData,
  exportDeliverableFile,
  type WorkspaceDeliverable,
} from "../../../../hooks/useV6WorkspaceData";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import {
  Sparkle,
  Pill,
  EmptyState,
  LoadingState,
  Segmented,
} from "../primitives";
import { DownloadIcon, MonitorIcon, PlusIcon } from "../icons";

/* ─── badge tone for artifact kind / tier ─────────────────── */

function badgeFor(d: WorkspaceDeliverable): { label: string; bg: string; fg: string } {
  const raw = (d.artifact_kind || d.tier || "").trim();
  if (!raw) return { label: "Doc", bg: T.track, fg: T.muted2 };
  const k = raw.toLowerCase();
  // Decks read blue; PDFs violet; everything else neutral.
  if (/deck|slide|pitch|presentation|pres/.test(k)) {
    return { label: titleCase(raw), bg: T.blueBg, fg: T.blue };
  }
  if (/pdf/.test(k)) {
    return { label: titleCase(raw), bg: T.violetBg, fg: T.violet };
  }
  return { label: titleCase(raw), bg: T.track, fg: T.muted2 };
}

function titleCase(s: string): string {
  const t = s.replace(/[_-]+/g, " ").trim();
  if (!t) return s;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusTone(status: string): { bg: string; fg: string } {
  const s = (status || "").toLowerCase();
  if (/complete|ready|done|final/.test(s)) return { bg: T.greenBg, fg: T.green };
  if (/review|progress|pending|generating|running|draft/.test(s)) return { bg: T.amberBg, fg: T.amber };
  if (/error|fail/.test(s)) return { bg: T.terraBg, fg: T.terra };
  return { bg: T.track, fg: T.muted2 };
}

/* ─── single-deliverable content fetch (existing endpoint, no hook) ──
 * GET /api/deliverables/:id returns the full row incl. the `content` JSONB
 * (markdown / sections / string). This is the ONLY sanctioned new fetch:
 * an existing endpoint with no client hook. */

interface DeliverableDetail {
  id: number;
  status?: string;
  content?: any;
  tiptap_content?: any;
  created_at?: string;
  completed_at?: string | null;
}

/** Mirror the server's own extractResultMarkdown precedence so we render the
 *  real generated body and never fabricate slide copy. Returns "" if empty. */
function extractMarkdown(content: any): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  if (typeof content !== "object") return "";
  if (typeof content.markdown === "string") return content.markdown;
  if (typeof content.content === "string") return content.content;
  if (typeof content.text === "string") return content.text;
  if (Array.isArray(content.sections)) {
    const parts = content.sections
      .map((section: any) => {
        if (typeof section === "string") return section;
        if (!section || typeof section !== "object") return "";
        const title = section.title || section.heading || section.name;
        const body = section.content || section.body || section.text;
        return [title ? `## ${title}` : "", typeof body === "string" ? body : ""]
          .filter(Boolean)
          .join("\n\n");
      })
      .filter(Boolean);
    if (parts.length) return parts.join("\n\n");
  }
  return "";
}

function useDeliverableContent(id: number | null) {
  const [detail, setDetail] = useState<DeliverableDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (id == null) {
      setDetail(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setDetail(null);
    fetch(`/api/deliverables/${id}`, { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((row) => {
        if (!cancelled) setDetail(row as DeliverableDetail);
      })
      .catch((e: any) => {
        if (!cancelled) setError(e?.message || "Failed to load deliverable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { detail, loading, error };
}

/* ─── lightweight markdown → React (headings / bold / bullets / rules) ─── */

function MarkdownBody({ md }: { md: string }) {
  const blocks = useMemo(() => splitBlocks(md), [md]);
  return (
    <div
      style={{
        fontSize: 13.5,
        lineHeight: 1.75,
        color: T.ink2,
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}

interface MdBlock {
  kind: "h1" | "h2" | "h3" | "ul" | "ol" | "hr" | "p";
  text?: string;
  items?: string[];
}

function splitBlocks(md: string): MdBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ kind: list.ordered ? "ol" : "ul", items: list.items });
      list = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }
    if (/^#{1,6}\s+/.test(trimmed)) {
      flushPara();
      flushList();
      const hashes = trimmed.match(/^#+/)?.[0].length ?? 1;
      const text = trimmed.replace(/^#+\s+/, "");
      blocks.push({ kind: hashes <= 1 ? "h1" : hashes === 2 ? "h2" : "h3", text });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara();
      flushList();
      blocks.push({ kind: "hr" });
      continue;
    }
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    const olMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ulMatch || olMatch) {
      flushPara();
      const ordered = !!olMatch;
      const item = (ulMatch?.[1] ?? olMatch?.[1] ?? "").replace(/^\[[ xX]\]\s*/, "");
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(item);
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushPara();
  flushList();
  return blocks;
}

/** Inline: **bold**, `code`, and table-pipe cleanup → plain spans. */
function inline(text: string, keyPrefix: string) {
  const cleaned = text.replace(/^\|/, "").replace(/\|$/, "").replace(/\s*\|\s*/g, "  ·  ");
  const parts = cleaned.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) {
      return (
        <strong key={`${keyPrefix}-${i}`} style={{ fontWeight: 600, color: T.ink }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (/^`[^`]+`$/.test(p)) {
      return (
        <code
          key={`${keyPrefix}-${i}`}
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12.5,
            background: T.track,
            borderRadius: 5,
            padding: "1px 5px",
          }}
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{p}</span>;
  });
}

function renderBlock(b: MdBlock, i: number) {
  const key = `blk-${i}`;
  switch (b.kind) {
    case "h1":
      return (
        <div key={key} style={{ fontSize: 22, fontWeight: 600, color: T.ink, letterSpacing: "-.01em", margin: "20px 0 10px" }}>
          {inline(b.text || "", key)}
        </div>
      );
    case "h2":
      return (
        <div key={key} style={{ fontSize: 16.5, fontWeight: 600, color: T.ink, margin: "18px 0 8px" }}>
          {inline(b.text || "", key)}
        </div>
      );
    case "h3":
      return (
        <div key={key} style={{ fontSize: 14, fontWeight: 600, color: T.ink3, margin: "14px 0 6px" }}>
          {inline(b.text || "", key)}
        </div>
      );
    case "hr":
      return <div key={key} style={{ height: 1, background: T.hair, margin: "16px 0" }} />;
    case "ul":
      return (
        <ul key={key} style={{ margin: "6px 0 12px", paddingLeft: 22 }}>
          {(b.items || []).map((it, j) => (
            <li key={`${key}-${j}`} style={{ margin: "3px 0" }}>
              {inline(it, `${key}-${j}`)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key} style={{ margin: "6px 0 12px", paddingLeft: 22 }}>
          {(b.items || []).map((it, j) => (
            <li key={`${key}-${j}`} style={{ margin: "3px 0" }}>
              {inline(it, `${key}-${j}`)}
            </li>
          ))}
        </ol>
      );
    default:
      return (
        <p key={key} style={{ margin: "0 0 11px" }}>
          {inline(b.text || "", key)}
        </p>
      );
  }
}

/* ─── sub-list row ────────────────────────────────────────── */

function CollateralItem({
  d,
  active,
  onClick,
}: {
  d: WorkspaceDeliverable;
  active: boolean;
  onClick: () => void;
}) {
  const badge = badgeFor(d);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        padding: "9px 11px",
        borderRadius: 9,
        fontFamily: T.font,
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        background: active ? T.navActive : "transparent",
        color: active ? T.blue : T.ink3,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = T.tabHover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {d.name || "Untitled"}
      </span>
      <span
        style={{
          flex: "none",
          fontSize: 11,
          fontWeight: 600,
          borderRadius: T.rPill,
          padding: "2px 8px",
          background: active ? T.blueBg : badge.bg,
          color: active ? T.blue : badge.fg,
        }}
      >
        {badge.label}
      </span>
    </button>
  );
}

/* ─── toolbar button ──────────────────────────────────────── */

function ToolbarTextButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        fontFamily: T.font,
        fontSize: 13,
        fontWeight: 500,
        color: disabled ? T.faint : T.muted,
        padding: "5px 4px",
      }}
    >
      {children}
    </button>
  );
}

/* ─── format → stage rendering ────────────────────────────── */

type StudioFormat = "document" | "slides" | "pdf";

export default function StudioScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { deliverables, loading, error, refresh } = useV6WorkspaceData(user);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [format, setFormat] = useState<StudioFormat>("document");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Auto-select the first deliverable once the list loads (or after a refresh
  // changes the set). Keep the current selection if it still exists.
  useEffect(() => {
    if (!deliverables.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev != null && deliverables.some((d) => d.id === prev)) return prev;
      return deliverables[0].id;
    });
  }, [deliverables]);

  const selected = useMemo(
    () => deliverables.find((d) => d.id === selectedId) ?? null,
    [deliverables, selectedId],
  );

  const { detail, loading: detailLoading, error: detailError } = useDeliverableContent(selectedId);
  const markdown = useMemo(() => extractMarkdown(detail?.content), [detail]);

  const askYulia = useCallback(
    (text: string) => {
      if (chat) chat.send(text);
      else nav.go("today");
    },
    [chat, nav],
  );

  const handleExport = useCallback(async () => {
    if (selectedId == null || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const { blob, filename } = await exportDeliverableFile(selectedId, "pdf");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setExportError(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }, [selectedId, exporting]);

  /* ── COLLATERAL sub-list (always rendered) ── */
  const subList = (
    <div
      style={{
        width: 198,
        flex: "none",
        borderRight: `1px solid ${T.hair}`,
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 11px 8px",
        }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 700, color: T.muted2, letterSpacing: ".05em" }}>
          COLLATERAL
        </span>
        <button
          type="button"
          onClick={() => askYulia("Draft a new deliverable for one of my deals.")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontFamily: T.font,
            fontSize: 12,
            fontWeight: 600,
            color: T.blue,
            padding: 0,
          }}
        >
          <PlusIcon size={13} c={T.blue} /> New
        </button>
      </div>

      {loading && deliverables.length === 0 ? (
        <div style={{ padding: "8px 11px", fontSize: 12.5, color: T.faint }}>Loading…</div>
      ) : deliverables.length === 0 ? (
        <div style={{ padding: "8px 11px", fontSize: 12.5, color: T.faint, lineHeight: 1.5 }}>
          No collateral yet.
        </div>
      ) : (
        deliverables.map((d) => (
          <CollateralItem
            key={d.id}
            d={d}
            active={d.id === selectedId}
            onClick={() => {
              setSelectedId(d.id);
              setExportError(null);
            }}
          />
        ))
      )}
    </div>
  );

  /* ── detail (main panel) ── */
  let detailPane: React.ReactNode;

  if (loading && deliverables.length === 0) {
    detailPane = <LoadingState label="Loading collateral…" />;
  } else if (error) {
    detailPane = (
      <EmptyState
        title="Couldn't load Studio"
        hint={error}
        cta="Try again"
        onCta={() => void refresh()}
      />
    );
  } else if (deliverables.length === 0) {
    detailPane = (
      <EmptyState
        title="No collateral yet"
        hint="Decks, memos, teasers, and one-pagers you draft with Yulia show up here. Ask Yulia to draft a deck or memo for a deal to get started."
        cta="Ask Yulia to draft a deck"
        onCta={() => askYulia("Draft a pitch deck for one of my deals.")}
      />
    );
  } else if (!selected) {
    detailPane = <EmptyState title="Select a deliverable" hint="Pick a piece of collateral from the list." />;
  } else {
    const stTone = statusTone(selected.status);
    const journeyGate = [selected.journey, selected.gate].filter(Boolean).join(" · ");

    detailPane = (
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* toolbar */}
        <div
          style={{
            height: 46,
            flex: "none",
            borderBottom: `1px solid ${T.hair}`,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: T.ink,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 320,
            }}
            title={selected.name || undefined}
          >
            {selected.name || "Untitled"}
          </span>

          <Segmented<StudioFormat>
            options={[
              { id: "document", label: "Document" },
              { id: "slides", label: "Slide deck" },
              { id: "pdf", label: "PDF" },
            ]}
            value={format}
            onChange={setFormat}
          />

          <div style={{ flex: 1 }} />

          <ToolbarTextButton
            onClick={handleExport}
            disabled={exporting}
            title="Export this deliverable as a PDF"
          >
            <DownloadIcon size={15} c={exporting ? T.faint : T.muted} />
            {exporting ? "Exporting…" : "Export PDF"}
          </ToolbarTextButton>

          <button
            type="button"
            disabled
            title="Presentation mode isn't available yet"
            style={{
              border: "none",
              borderRadius: T.rPill,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: T.font,
              background: T.track,
              color: T.faint,
              cursor: "default",
            }}
          >
            Present
          </button>
        </div>

        {exportError && (
          <div
            style={{
              flex: "none",
              padding: "8px 18px",
              background: T.terraBg,
              color: T.terra,
              fontSize: 12.5,
              borderBottom: `1px solid ${T.hair}`,
            }}
          >
            {exportError}
          </div>
        )}

        {/* stage */}
        <div style={{ flex: 1, minHeight: 0, background: T.track, overflow: "auto" }}>
          <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 24px 40px" }}>
            {/* the real metadata "cover" — honest fields only */}
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: T.rCardLg,
                boxShadow: T.shCard,
                padding: "22px 28px",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkle size={14} />
                <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", color: T.muted2 }}>
                  {(selected.artifact_kind || selected.tier || "Deliverable").toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.01em", color: T.ink, marginBottom: 6 }}>
                {selected.name || "Untitled"}
              </div>
              {selected.deal_name && (
                <div style={{ fontSize: 14.5, color: T.muted, marginBottom: 14 }}>
                  {selected.deal_name}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <Pill bg={stTone.bg} fg={stTone.fg}>
                  {titleCase(selected.status || "—")}
                </Pill>
                {journeyGate && (
                  <Pill bg={T.track} fg={T.label}>
                    {journeyGate}
                  </Pill>
                )}
                <span style={{ fontSize: 12.5, color: T.muted2 }}>
                  Created {fmtDate(selected.created_at)}
                </span>
                {selected.completed_at && (
                  <span style={{ fontSize: 12.5, color: T.muted2 }}>
                    · Completed {fmtDate(selected.completed_at)}
                  </span>
                )}
              </div>
            </div>

            {/* body — real content or honest "open in chat" note */}
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: T.rCardLg,
                boxShadow: T.shCard,
                padding: format === "slides" ? "28px 32px" : "30px 36px",
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {detailLoading ? (
                <LoadingState label="Loading content…" />
              ) : detailError ? (
                <EmptyState title="Couldn't load this deliverable" hint={detailError} />
              ) : markdown.trim() ? (
                <>
                  {format === "slides" && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: T.muted2,
                        marginBottom: 14,
                        lineHeight: 1.5,
                        maxWidth: 760,
                        marginLeft: "auto",
                        marginRight: "auto",
                        width: "100%",
                      }}
                    >
                      Slide layout is drafted by Yulia. This is the generated source content.
                    </div>
                  )}
                  <MarkdownBody md={markdown} />
                </>
              ) : (
                <div style={{ margin: "auto", textAlign: "center", maxWidth: 380 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
                    Nothing drafted yet
                  </div>
                  <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, marginBottom: 14 }}>
                    This deliverable doesn't have rendered content yet. Open it in chat to draft
                    it with Yulia.
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      askYulia(
                        `Draft the "${selected.name || "deliverable"}" for ${
                          selected.deal_name || "this deal"
                        }.`,
                      )
                    }
                    style={{
                      border: "none",
                      borderRadius: T.rPill,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: T.font,
                      background: T.blue,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Open in chat to draft
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", overflow: "hidden" }}>
      {subList}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {detailPane}
      </div>
    </div>
  );
}
