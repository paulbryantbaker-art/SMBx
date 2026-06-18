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
import { DownloadIcon, PlusIcon } from "../icons";

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

/** Deliverables edited in the TipTap editor persist their body to
 *  `tiptap_content` (ProseMirror JSON), and `content` can be empty. Flatten the
 *  doc into markdown-ish text so the Stage still renders a real body instead of
 *  wrongly showing "Nothing drafted yet". Headings → `#`, list items → `- `. */
function tiptapToMarkdown(doc: any): string {
  if (!doc || typeof doc !== "object") return "";
  const out: string[] = [];

  const inlineText = (node: any): string => {
    if (node == null) return "";
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.content)) return node.content.map(inlineText).join("");
    return "";
  };

  const walk = (node: any, listPrefix?: string) => {
    if (!node || typeof node !== "object") return;
    switch (node.type) {
      case "heading": {
        const level = Math.min(6, Math.max(1, node.attrs?.level || 2));
        const t = inlineText(node).trim();
        if (t) out.push(`${"#".repeat(level)} ${t}`);
        return;
      }
      case "paragraph": {
        const t = inlineText(node).trim();
        out.push(listPrefix ? `${listPrefix}${t}` : t);
        return;
      }
      case "bulletList":
      case "orderedList": {
        const ordered = node.type === "orderedList";
        (node.content || []).forEach((li: any, idx: number) => {
          const prefix = ordered ? `${idx + 1}. ` : "- ";
          (li?.content || []).forEach((child: any) => walk(child, prefix));
        });
        out.push("");
        return;
      }
      case "horizontalRule":
        out.push("---");
        return;
      default: {
        if (Array.isArray(node.content)) node.content.forEach((c: any) => walk(c));
        else {
          const t = inlineText(node).trim();
          if (t) out.push(t);
        }
      }
    }
  };

  (doc.content || []).forEach((n: any) => walk(n));
  return out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
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
  kind: "h1" | "h2" | "h3" | "ul" | "ol" | "hr" | "p" | "code" | "table";
  text?: string;
  items?: string[];
  rows?: string[][];
  headRow?: boolean;
}

/** A markdown table row: `| a | b |` → ["a","b"]. Returns null if not a row. */
function parseTableCells(line: string): string[] | null {
  const t = line.trim();
  if (!/^\|.*\|?$/.test(t) && !/\|/.test(t)) return null;
  if (!/\|/.test(t)) return null;
  const cells = t.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  return cells;
}

/** A `|---|:--:|` divider row (separator under the header). */
function isTableDivider(line: string): boolean {
  const t = line.trim();
  return /\|/.test(t) && /^[\s|:-]+$/.test(t) && /-/.test(t);
}

function splitBlocks(md: string): MdBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let fence: { lang: string; lines: string[] } | null = null;

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

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Fenced code block (```lang … ```): the server's fallback wraps non-string
    // generator output as a ```json block — render it verbatim, not as stray text.
    if (fence) {
      if (/^```/.test(trimmed)) {
        blocks.push({ kind: "code", text: fence.lines.join("\n") });
        fence = null;
      } else {
        fence.lines.push(rawLine);
      }
      continue;
    }
    if (/^```/.test(trimmed)) {
      flushPara();
      flushList();
      fence = { lang: trimmed.replace(/^```/, "").trim(), lines: [] };
      continue;
    }

    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }

    // Pipe table: a row immediately followed by a `|---|` divider starts one.
    const cells = parseTableCells(trimmed);
    if (cells && cells.length > 1 && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flushPara();
      flushList();
      const rows: string[][] = [cells];
      i++; // consume the divider
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (!next || !/\|/.test(next)) break;
        const r = parseTableCells(next);
        if (!r) break;
        rows.push(r);
        i++;
      }
      blocks.push({ kind: "table", rows, headRow: true });
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
  if (fence) blocks.push({ kind: "code", text: fence.lines.join("\n") });
  flushPara();
  flushList();
  return blocks;
}

/** Inline: **bold** and `code` → plain spans. Real tables are parsed as table
 *  blocks now, so pipes inside normal text render literally. */
function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
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
    case "code":
      return (
        <pre
          key={key}
          style={{
            margin: "10px 0 14px",
            padding: "12px 14px",
            background: T.track,
            border: `1px solid ${T.hair}`,
            borderRadius: 8,
            overflowX: "auto",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            lineHeight: 1.55,
            color: T.ink3,
            whiteSpace: "pre",
          }}
        >
          {b.text || ""}
        </pre>
      );
    case "table": {
      const rows = b.rows || [];
      if (!rows.length) return null;
      const [head, ...body] = b.headRow ? rows : [null as any, ...rows];
      const cols = Math.max(...rows.map((r) => r.length));
      return (
        <div key={key} style={{ overflowX: "auto", margin: "10px 0 16px" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
            {head && (
              <thead>
                <tr>
                  {Array.from({ length: cols }).map((_, c) => (
                    <th
                      key={`${key}-h-${c}`}
                      style={{
                        textAlign: "left",
                        padding: "7px 11px",
                        borderBottom: `2px solid ${T.border}`,
                        color: T.ink,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {inline(head[c] ?? "", `${key}-h-${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((r, ri) => (
                <tr key={`${key}-r-${ri}`}>
                  {Array.from({ length: cols }).map((_, c) => (
                    <td
                      key={`${key}-r-${ri}-${c}`}
                      style={{
                        padding: "7px 11px",
                        borderBottom: `1px solid ${T.hair}`,
                        color: T.ink3,
                        verticalAlign: "top",
                      }}
                    >
                      {inline(r[c] ?? "", `${key}-r-${ri}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
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

/* ─── slide-canvas rendering (real content, never fabricated copy) ───
 * The design's Stage is a 16:9 slide canvas + a thumbnail strip. We have no
 * slide data, so we derive slides from the REAL generated markdown: each top
 * heading (H1/H2) starts a new slide; the cover slide carries the deliverable's
 * real metadata. No demo slide titles, no $48M stats — every slide title and
 * body is the deliverable's own content. */

interface Slide {
  title: string;
  blocks: MdBlock[];
}

function splitSlides(md: string, coverTitle: string): Slide[] {
  const blocks = splitBlocks(md);
  const slides: Slide[] = [];
  let current: Slide | null = null;

  for (const b of blocks) {
    if (b.kind === "h1" || b.kind === "h2") {
      if (current) slides.push(current);
      current = { title: (b.text || "").trim() || "Untitled", blocks: [] };
    } else {
      if (!current) current = { title: coverTitle, blocks: [] };
      current.blocks.push(b);
    }
  }
  if (current) slides.push(current);
  return slides.length ? slides : [{ title: coverTitle, blocks }];
}

function SlideCanvas({ slide, index }: { slide: Slide; index: number }) {
  return (
    <div
      style={{
        width: 720,
        maxWidth: "100%",
        aspectRatio: "16 / 9",
        background: T.white,
        borderRadius: 8,
        boxShadow: "0 4px 18px rgba(60,64,67,.16)",
        padding: "40px 48px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
        <Sparkle size={13} />
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".05em", color: T.muted2 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-.01em",
          color: T.ink,
          marginBottom: 4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {slide.title}
      </div>
      <div style={{ height: 3, width: 64, background: T.blue, borderRadius: 3, margin: "10px 0 16px" }} />
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", fontSize: 13, lineHeight: 1.7, color: T.ink2 }}>
        {slide.blocks.length ? (
          slide.blocks.map((b, i) => renderBlock(b, i))
        ) : (
          <div style={{ fontSize: 12.5, color: T.faint }}>No content on this slide.</div>
        )}
      </div>
    </div>
  );
}

function SlideThumb({
  slide,
  index,
  active,
  onClick,
}: {
  slide: Slide;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={slide.title}
      style={{
        flex: "none",
        width: 124,
        height: 70,
        borderRadius: 6,
        border: `2px solid ${active ? T.blue : T.border}`,
        background: T.white,
        padding: "9px 11px",
        cursor: "pointer",
        textAlign: "left",
        position: "relative",
        fontFamily: T.font,
        overflow: "hidden",
      }}
    >
      <span style={{ position: "absolute", top: 6, right: 8, fontSize: 9, color: T.faint }}>
        {index + 1}
      </span>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: active ? T.blue : T.ink3,
          lineHeight: 1.25,
          marginBottom: 7,
          marginRight: 12,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {slide.title}
      </div>
      <div style={{ height: 4, width: "70%", background: T.rowDiv, borderRadius: 3, marginBottom: 4 }} />
      <div style={{ height: 4, width: "90%", background: T.hair, borderRadius: 3 }} />
    </button>
  );
}

/* ─── present overlay (distraction-free, real content) ────────
 * Absolute-positioned inside the relative detail pane (NOT a position:fixed
 * full-viewport bg div — Safari toolbar rule). Presents the real slides or
 * document body; Esc / × closes. No fabricated content. */

function PresentOverlay({
  title,
  slides,
  markdown,
  asSlides,
  onClose,
}: {
  title: string;
  slides: Slide[];
  markdown: string;
  asSlides: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (asSlides && (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ")) {
        e.preventDefault();
        setIdx((i) => Math.min(total - 1, i + 1));
      } else if (asSlides && (e.key === "ArrowLeft" || e.key === "ArrowUp")) {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asSlides, total, onClose]);

  const safe = total ? Math.min(idx, total - 1) : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1f2430",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
      }}
    >
      <div
        style={{
          flex: "none",
          height: 46,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 18px",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,.85)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 360,
          }}
          title={title}
        >
          {title}
        </span>
        {asSlides && total > 1 && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>
            {safe + 1} / {total}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onClose}
          title="Exit present (Esc)"
          style={{
            border: "none",
            background: "rgba(255,255,255,.12)",
            color: "#fff",
            borderRadius: T.rPill,
            padding: "5px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: T.font,
            cursor: "pointer",
          }}
        >
          Exit
        </button>
      </div>

      {asSlides && total ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, overflow: "auto" }}>
          <SlideCanvas slide={slides[safe]} index={safe} />
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "32px 24px", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 760,
              maxWidth: "100%",
              background: T.white,
              borderRadius: T.rCardLg,
              boxShadow: "0 4px 18px rgba(0,0,0,.3)",
              padding: "40px 48px",
            }}
          >
            <MarkdownBody md={markdown} />
          </div>
        </div>
      )}
    </div>
  );
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
        borderRadius: T.rPill,
        cursor: disabled ? "default" : "pointer",
        fontFamily: T.font,
        fontSize: 13,
        fontWeight: 500,
        color: disabled ? T.faint : T.muted,
        padding: "5px 8px",
        transition: "background .12s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = T.tabHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

/* ─── format → stage rendering ────────────────────────────── */

type StudioFormat = "document" | "slides" | "pdf";

/** The toolbar segment drives the real export file format. The server's
 *  /deliverables/:id/export/:format route supports pdf | docx | pptx | xlsx;
 *  Document → docx, Slide deck → pptx, PDF → pdf. */
const EXPORT_FORMAT: Record<StudioFormat, "pdf" | "docx" | "pptx"> = {
  document: "docx",
  slides: "pptx",
  pdf: "pdf",
};
const EXPORT_LABEL: Record<StudioFormat, string> = {
  document: "Export DOCX",
  slides: "Export PPTX",
  pdf: "Export PDF",
};

export default function StudioScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { deliverables, loading, error, refresh } = useV6WorkspaceData(user);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Design selects the "Slide deck" segment by default (i=1 highlighted).
  const [format, setFormat] = useState<StudioFormat>("slides");
  const [presenting, setPresenting] = useState(false);
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
  // Prefer the generated `content` body; fall back to TipTap-editor JSON
  // (migration 044) when a deliverable's body lives only in tiptap_content.
  const markdown = useMemo(() => {
    const fromContent = extractMarkdown(detail?.content);
    if (fromContent.trim()) return fromContent;
    return tiptapToMarkdown(detail?.tiptap_content);
  }, [detail]);

  const slides = useMemo(
    () => (markdown.trim() ? splitSlides(markdown, selected?.name || "Cover") : []),
    [markdown, selected?.name],
  );
  const [activeSlide, setActiveSlide] = useState(0);
  // Reset slide position and exit present mode when the selection changes.
  useEffect(() => {
    setActiveSlide(0);
    setPresenting(false);
  }, [selectedId]);
  const safeSlide = slides.length ? Math.min(activeSlide, slides.length - 1) : 0;

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
      const { blob, filename } = await exportDeliverableFile(selectedId, EXPORT_FORMAT[format]);
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
  }, [selectedId, exporting, format]);

  // Format change drives the export label — clear any stale export error and
  // exit present mode (the rendering surface is about to change).
  const changeFormat = useCallback((f: StudioFormat) => {
    setFormat(f);
    setExportError(null);
    setPresenting(false);
  }, []);

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
            borderRadius: T.rPill,
            cursor: "pointer",
            fontFamily: T.font,
            fontSize: 12,
            fontWeight: 600,
            color: T.blue,
            padding: "3px 7px",
            margin: "-3px -7px",
            transition: "background .12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.tabHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
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
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {presenting && markdown.trim() && !detailLoading && !detailError && (
          <PresentOverlay
            title={selected.name || "Untitled"}
            slides={slides}
            markdown={markdown}
            asSlides={format === "slides"}
            onClose={() => setPresenting(false)}
          />
        )}
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
            onChange={changeFormat}
          />

          <div style={{ flex: 1 }} />

          <ToolbarTextButton
            onClick={handleExport}
            disabled={exporting}
            title={`Export this deliverable as ${EXPORT_FORMAT[format].toUpperCase()}`}
          >
            <DownloadIcon size={15} c={exporting ? T.faint : T.muted} />
            {exporting ? "Exporting…" : EXPORT_LABEL[format]}
          </ToolbarTextButton>

          {(() => {
            const canPresent = markdown.trim().length > 0 && !detailLoading && !detailError;
            return (
              <button
                type="button"
                onClick={() => canPresent && setPresenting(true)}
                disabled={!canPresent}
                title={
                  canPresent
                    ? "Present this deliverable full-bleed"
                    : "Nothing drafted yet to present"
                }
                style={{
                  border: "none",
                  borderRadius: T.rPill,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: T.font,
                  background: canPresent ? T.blue : T.track,
                  color: canPresent ? "#fff" : T.faint,
                  cursor: canPresent ? "pointer" : "default",
                  transition: "filter .12s ease",
                }}
                onMouseEnter={(e) => {
                  if (canPresent) e.currentTarget.style.filter = "brightness(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                }}
              >
                Present
              </button>
            );
          })()}
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

        {/* stage — slide canvas (slides mode + content) OR document/PDF body */}
        {format === "slides" && !detailLoading && !detailError && slides.length ? (
          <div style={{ flex: 1, minHeight: 0, background: T.track, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* centered 16:9 slide canvas */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                overflow: "auto",
              }}
            >
              <SlideCanvas slide={slides[safeSlide]} index={safeSlide} />
            </div>
            {/* thumbnail strip — one thumb per real slide */}
            <div
              style={{
                flex: "none",
                height: 104,
                borderTop: `1px solid ${T.border}`,
                background: T.white,
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                overflowX: "auto",
              }}
            >
              {slides.map((s, i) => (
                <SlideThumb
                  key={`thumb-${i}`}
                  slide={s}
                  index={i}
                  active={i === safeSlide}
                  onClick={() => setActiveSlide(i)}
                />
              ))}
            </div>
          </div>
        ) : (
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
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  letterSpacing: "-.01em",
                  color: T.ink,
                  marginBottom: 6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
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
                padding: "30px 36px",
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
                <MarkdownBody md={markdown} />
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
        )}
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
