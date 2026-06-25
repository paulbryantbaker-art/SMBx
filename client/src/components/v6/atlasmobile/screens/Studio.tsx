/**
 * Atlas-MOBILE — STUDIO screen (frame 10).
 *
 * Mirrors the WIRING of desktop `desktop/screens/Studio.tsx`, re-laid for a
 * single-column phone:
 *   - Collateral LIST  = real deliverables from useV6WorkspaceData(user).deliverables
 *                        (label = name, badge = artifact_kind / tier, status pill,
 *                        deal name, created date). Tap → detail.
 *   - Detail           = the selected deliverable's REAL metadata + Document/Slide/PDF
 *                        format toggle + Export (real exportDeliverableFile) + the
 *                        rendered markdown / slide body fetched from GET /api/deliverables/:id.
 *
 * Honesty: every value is a real hook/endpoint field or an honest "—" / empty /
 * loading / error state. No demo literals (Project Atlas, $48M, the prototype
 * "Pitch Deck" list, slide stats) are ported — slide content is derived from the
 * deliverable's OWN generated markdown, never fabricated.
 *
 * Shell contract: returns ONLY body content (no top bar/back, no bottom nav, no
 * FAB — the shell owns those). Horizontal padding 0 18px inside content.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AtlasScreenProps } from "../../desktop/atlasNav";
import { useAtlasNav, useAtlasChat } from "../../desktop/atlasNav";
import {
  useV6WorkspaceData,
  exportDeliverableFile,
  type WorkspaceDeliverable,
} from "../../../../hooks/useV6WorkspaceData";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../../desktop/atlasTokens";
import { RT } from "../redesign/rt";
import {
  Pill,
  Sparkle,
  Segmented,
  EmptyState,
  LoadingState,
} from "../../desktop/primitives";
import {
  BackIcon,
  ChevronRightIcon,
  DownloadIcon,
  PlusIcon,
} from "../../desktop/icons";
import { DetailSection } from "../redesign/kit";

/* ─── badge tone for artifact kind / tier ─────────────────── */

function badgeFor(d: WorkspaceDeliverable): { label: string; bg: string; fg: string } {
  const raw = (d.artifact_kind || d.tier || "").trim();
  if (!raw) return { label: "Doc", bg: RT.line, fg: RT.muted };
  const k = raw.toLowerCase();
  if (/deck|slide|pitch|presentation|pres/.test(k)) {
    return { label: titleCase(raw), bg: RT.line, fg: RT.muted };
  }
  if (/pdf/.test(k)) {
    return { label: titleCase(raw), bg: RT.line, fg: RT.muted };
  }
  return { label: titleCase(raw), bg: RT.line, fg: RT.muted };
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
  if (/complete|ready|done|final/.test(s)) return { bg: RT.accentSoft, fg: RT.accentInk };
  if (/review|progress|pending|generating|running|draft/.test(s)) return { bg: RT.line, fg: RT.muted };
  if (/error|fail/.test(s)) return { bg: RT.line, fg: RT.down };
  return { bg: RT.line, fg: RT.muted };
}

/* ─── single-deliverable content fetch (existing endpoint, no hook) ──
 * GET /api/deliverables/:id returns the full row incl. the `content` JSONB
 * (markdown / sections / string) and the TipTap-editor JSON. Same fetch the
 * desktop Studio uses. */

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

/** TipTap (ProseMirror JSON) → markdown-ish text so a body edited in the editor
 *  still renders instead of falsely showing "Nothing drafted yet". */
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

/* ─── lightweight markdown → React (headings / bold / bullets / rules / tables) ─── */

interface MdBlock {
  kind: "h1" | "h2" | "h3" | "ul" | "ol" | "hr" | "p" | "code" | "table";
  text?: string;
  items?: string[];
  rows?: string[][];
  headRow?: boolean;
}

function parseTableCells(line: string): string[] | null {
  const t = line.trim();
  if (!/\|/.test(t)) return null;
  return t.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function isTableDivider(line: string): boolean {
  const t = line.trim();
  return /\|/.test(t) && /^[\s|:-]+$/.test(t) && /-/.test(t);
}

function splitBlocks(md: string): MdBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let fence: { lines: string[] } | null = null;

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
    const trimmed = rawLine.trim();

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
      fence = { lines: [] };
      continue;
    }

    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }

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

function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) {
      return (
        <strong key={`${keyPrefix}-${i}`} style={{ fontWeight: 600, color: RT.ink }}>
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
            fontSize: 12,
            background: RT.line,
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
        <div key={key} style={{ fontSize: 19, fontWeight: 600, color: RT.ink, letterSpacing: "-.01em", margin: "18px 0 9px" }}>
          {inline(b.text || "", key)}
        </div>
      );
    case "h2":
      return (
        <div key={key} style={{ fontSize: 15.5, fontWeight: 600, color: RT.ink, margin: "16px 0 7px" }}>
          {inline(b.text || "", key)}
        </div>
      );
    case "h3":
      return (
        <div key={key} style={{ fontSize: 13.5, fontWeight: 600, color: RT.ink2, margin: "13px 0 5px" }}>
          {inline(b.text || "", key)}
        </div>
      );
    case "hr":
      return <div key={key} style={{ height: 1, background: RT.line, margin: "14px 0" }} />;
    case "code":
      return (
        <pre
          key={key}
          style={{
            margin: "9px 0 13px",
            padding: "11px 13px",
            background: RT.line,
            borderRadius: 8,
            overflowX: "auto",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11.5,
            lineHeight: 1.55,
            color: RT.ink2,
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
        <div key={key} style={{ overflowX: "auto", margin: "9px 0 14px" }} className="scr">
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            {head && (
              <thead>
                <tr>
                  {Array.from({ length: cols }).map((_, c) => (
                    <th
                      key={`${key}-h-${c}`}
                      style={{
                        textAlign: "left",
                        padding: "6px 10px",
                        borderBottom: `2px solid ${RT.line}`,
                        color: RT.ink,
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
                        padding: "6px 10px",
                        borderBottom: `1px solid ${RT.line}`,
                        color: RT.ink2,
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
        <ul key={key} style={{ margin: "5px 0 11px", paddingLeft: 20 }}>
          {(b.items || []).map((it, j) => (
            <li key={`${key}-${j}`} style={{ margin: "3px 0" }}>
              {inline(it, `${key}-${j}`)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key} style={{ margin: "5px 0 11px", paddingLeft: 20 }}>
          {(b.items || []).map((it, j) => (
            <li key={`${key}-${j}`} style={{ margin: "3px 0" }}>
              {inline(it, `${key}-${j}`)}
            </li>
          ))}
        </ol>
      );
    default:
      return (
        <p key={key} style={{ margin: "0 0 10px" }}>
          {inline(b.text || "", key)}
        </p>
      );
  }
}

function MarkdownBody({ md }: { md: string }) {
  const blocks = useMemo(() => splitBlocks(md), [md]);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, color: RT.ink2 }}>
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}

/* ─── slides derived from REAL markdown (never fabricated copy) ─── */

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

/** 16:9 slide canvas — full-bleed width on mobile, real slide content only. */
function SlideCanvas({ slide, index }: { slide: Slide; index: number }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        background: RT.card,
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Sparkle size={11} />
        <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".05em", color: RT.muted }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "-.01em",
          color: RT.ink,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {slide.title}
      </div>
      <div style={{ height: 3, width: 48, background: RT.accent, borderRadius: 3, margin: "8px 0 10px" }} />
      <div className="scr" style={{ flex: 1, minHeight: 0, overflow: "auto", fontSize: 11.5, lineHeight: 1.6, color: RT.ink2 }}>
        {slide.blocks.length ? (
          slide.blocks.map((b, i) => renderBlock(b, i))
        ) : (
          <div style={{ fontSize: 11.5, color: RT.faint }}>No content on this slide.</div>
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
        width: 104,
      }}
    >
      <span
        style={{
          display: "block",
          width: 104,
          aspectRatio: "16 / 9",
          borderRadius: 7,
          border: `${active ? 2 : 1}px solid ${active ? RT.accent : RT.line}`,
          background: RT.card,
          padding: "8px 9px",
          boxSizing: "border-box",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 9,
            fontWeight: 600,
            lineHeight: 1.25,
            color: active ? RT.accent : RT.ink2,
          }}
        >
          {slide.title}
        </span>
      </span>
      <span
        style={{
          display: "block",
          marginTop: 5,
          textAlign: "center",
          fontSize: 11,
          fontWeight: active ? 600 : 500,
          color: active ? RT.accent : RT.muted,
        }}
      >
        {index + 1}
      </span>
    </button>
  );
}

/* ─── format → export mapping (real /export/:format route) ─── */

type StudioFormat = "document" | "slides" | "pdf";

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

/* ─── collateral list row ─────────────────────────────────── */

function CollateralRow({
  d,
  onOpen,
}: {
  d: WorkspaceDeliverable;
  onOpen: () => void;
}) {
  const badge = badgeFor(d);
  const st = statusTone(d.status);
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: RT.card,
        borderRadius: 14,
        padding: 16,
        fontFamily: RT.font,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 15.5,
            fontWeight: 700,
            color: RT.ink,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.3,
          }}
        >
          {d.name || "Untitled"}
        </span>
        <span
          style={{
            flex: "none",
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: RT.rPill,
            padding: "3px 10px",
            background: badge.bg,
            color: badge.fg,
          }}
        >
          {badge.label}
        </span>
        <ChevronRightIcon size={18} c={RT.muted} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: RT.rPill,
            padding: "3px 9px",
            background: st.bg,
            color: st.fg,
          }}
        >
          {titleCase(d.status || "—")}
        </span>
        {d.deal_name && (
          <span
            style={{
              fontSize: 14,
              color: RT.muted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 180,
            }}
          >
            {d.deal_name}
          </span>
        )}
        <span style={{ fontSize: 14, color: RT.muted }}>{fmtDate(d.created_at)}</span>
      </div>
    </button>
  );
}

/* ─── screen ──────────────────────────────────────────────── */

export default function StudioMobileScreen({ user }: AtlasScreenProps) {
  const nav = useAtlasNav();
  const chat = useAtlasChat();
  const { deliverables, loading, error, refresh } = useV6WorkspaceData(user);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [format, setFormat] = useState<StudioFormat>("slides");
  const [activeSlide, setActiveSlide] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // If the selected deliverable disappears after a refresh, drop the selection
  // (back to the list) rather than dangling a stale detail.
  useEffect(() => {
    if (selectedId != null && !deliverables.some((d) => d.id === selectedId)) {
      setSelectedId(null);
    }
  }, [deliverables, selectedId]);

  const selected = useMemo(
    () => deliverables.find((d) => d.id === selectedId) ?? null,
    [deliverables, selectedId],
  );

  const { detail, loading: detailLoading, error: detailError } = useDeliverableContent(selectedId);
  const markdown = useMemo(() => {
    const fromContent = extractMarkdown(detail?.content);
    if (fromContent.trim()) return fromContent;
    return tiptapToMarkdown(detail?.tiptap_content);
  }, [detail]);

  const slides = useMemo(
    () => (markdown.trim() ? splitSlides(markdown, selected?.name || "Cover") : []),
    [markdown, selected?.name],
  );
  const safeSlide = slides.length ? Math.min(activeSlide, slides.length - 1) : 0;

  // Reset slide position when the selection changes.
  useEffect(() => {
    setActiveSlide(0);
    setExportError(null);
  }, [selectedId]);

  const askYulia = useCallback(
    (text: string) => {
      if (chat) chat.send(text);
      else nav.go("today");
    },
    [chat, nav],
  );

  const changeFormat = useCallback((f: StudioFormat) => {
    setFormat(f);
    setExportError(null);
  }, []);

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

  /* ── LIST VIEW (no selection) ── */
  if (selected == null) {
    if (loading && deliverables.length === 0) {
      return <LoadingState label="Loading collateral…" />;
    }
    if (error) {
      return (
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
          title="Couldn't load Studio"
          hint={error}
          cta="Try again"
          onCta={() => void refresh()}
        />
      );
    }
    if (deliverables.length === 0) {
      return (
        <EmptyState accent={RT.accent} onAccent={RT.onAccent}
          title="No collateral yet"
          hint="Decks, memos, teasers, and one-pagers you draft with Yulia show up here. Ask Yulia to draft one for a deal to get started."
          cta="Ask Yulia to draft"
          onCta={() => askYulia("Draft a pitch deck for one of my deals.")}
        />
      );
    }

    return (
      <div style={{ padding: "10px 18px 4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <DetailSection
            title="Studio"
            desc="Decks, memos, teasers, and one-pagers you draft with Yulia."
            style={{ margin: "0 0 14px", flex: 1, minWidth: 0 }}
          />
          <button
            type="button"
            onClick={() => askYulia("Draft a new deliverable for one of my deals.")}
            style={{
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "transparent",
              borderRadius: RT.rPill,
              cursor: "pointer",
              fontFamily: RT.font,
              fontSize: 14,
              fontWeight: 700,
              color: RT.accentInk,
              padding: "5px 8px",
              margin: "4px -8px 0 0",
            }}
          >
            <PlusIcon size={17} c={RT.accentInk} /> New
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {deliverables.map((d) => (
            <CollateralRow key={d.id} d={d} onOpen={() => setSelectedId(d.id)} />
          ))}
        </div>
      </div>
    );
  }

  /* ── DETAIL VIEW (selection) ── */
  const stTone = statusTone(selected.status);
  const journeyGate = [selected.journey, selected.gate].filter(Boolean).join(" · ");
  const canExport = !exporting;
  const hasBody = markdown.trim().length > 0 && !detailLoading && !detailError;

  return (
    <div style={{ padding: "10px 18px 4px" }}>
      {/* in-list back row (the shell's header back goes to the previous SCREEN, not list↔detail) */}
      <button
        type="button"
        onClick={() => setSelectedId(null)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: RT.font,
          fontSize: 14,
          fontWeight: 700,
          color: RT.muted,
          padding: "4px 8px",
          margin: "0 -8px 6px",
        }}
      >
        <BackIcon size={17} c={RT.muted} /> Collateral
      </button>

      {/* metadata cover — honest fields only */}
      <div
        style={{
          background: RT.card,
          borderRadius: T.rCardLg,
          padding: 20,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
          <Sparkle size={15} />
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", color: RT.ink }}>
            {titleCase(selected.artifact_kind || selected.tier || "Deliverable")}
          </span>
        </div>
        <div
          style={{
            fontSize: 21,
            fontWeight: 600,
            letterSpacing: "-.01em",
            color: RT.ink,
            marginBottom: 6,
            wordBreak: "break-word",
          }}
        >
          {selected.name || "Untitled"}
        </div>
        {selected.deal_name && (
          <div style={{ fontSize: 14, color: RT.muted, marginBottom: 12 }}>{selected.deal_name}</div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <Pill bg={stTone.bg} fg={stTone.fg}>
            {titleCase(selected.status || "—")}
          </Pill>
          {journeyGate && (
            <Pill bg={RT.line} fg={RT.muted}>
              {journeyGate}
            </Pill>
          )}
          <span style={{ fontSize: 14, color: RT.muted }}>Created {fmtDate(selected.created_at)}</span>
          {selected.completed_at && (
            <span style={{ fontSize: 14, color: RT.muted }}>
              · Completed {fmtDate(selected.completed_at)}
            </span>
          )}
        </div>
      </div>

      {/* format toggle + export */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
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
        <button
          type="button"
          onClick={handleExport}
          disabled={!canExport}
          title={`Export this deliverable as ${EXPORT_FORMAT[format].toUpperCase()}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${RT.line}`,
            background: RT.card,
            borderRadius: RT.rPill,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: RT.font,
            color: canExport ? RT.ink2 : RT.faint,
            cursor: canExport ? "pointer" : "default",
          }}
        >
          <DownloadIcon size={16} c={canExport ? RT.muted : RT.faint} />
          {exporting ? "Exporting…" : EXPORT_LABEL[format]}
        </button>
      </div>

      {exportError && (
        <div
          style={{
            padding: "9px 12px",
            background: RT.line,
            color: RT.down,
            fontSize: 13.5,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          {exportError}
        </div>
      )}

      {/* stage — real content body OR honest "open in chat" note */}
      {detailLoading ? (
        <LoadingState label="Loading content…" />
      ) : detailError ? (
        <EmptyState accent={RT.accent} onAccent={RT.onAccent} title="Couldn't load this deliverable" hint={detailError} />
      ) : !hasBody ? (
        <div
          style={{
            background: RT.card,
            borderRadius: T.rCardLg,
            padding: "26px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: RT.ink, marginBottom: 8 }}>
            Nothing drafted yet
          </div>
          <div style={{ fontSize: 14, color: RT.muted, lineHeight: 1.6, marginBottom: 14 }}>
            This deliverable doesn't have rendered content yet. Ask Yulia to draft it.
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
              borderRadius: RT.rPill,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: RT.font,
              background: RT.accent,
              color: RT.onAccent,
              cursor: "pointer",
            }}
          >
            Ask Yulia to draft
          </button>
        </div>
      ) : format === "slides" ? (
        <div>
          {/* 16:9 slide canvas */}
          <SlideCanvas slide={slides[safeSlide]} index={safeSlide} />
          {/* thumbnail strip — one thumb per real slide (edge-bleed scroll row) */}
          {slides.length > 1 && (
            <div
              className="scr"
              style={{
                display: "flex",
                gap: 9,
                overflowX: "auto",
                margin: "12px -18px 0",
                padding: "0 18px",
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
          )}
        </div>
      ) : (
        <div
          style={{
            background: RT.card,
            borderRadius: T.rCardLg,
            padding: "18px 18px 22px",
          }}
        >
          <MarkdownBody md={markdown} />
        </div>
      )}
    </div>
  );
}
