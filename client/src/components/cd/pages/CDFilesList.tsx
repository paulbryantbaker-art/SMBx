/**
 * CDFilesList — the "see all files" drill-down for Files, ported to the
 * Claude-Design (cool/indigo) language. This is the CD reskin of
 * v6/modes/FilesRoot.tsx's `V6FilesListView` export, and Canvas swaps it 1:1:
 *
 *   <CDFilesList view={tab.fileListView ?? "all"} openTab onTalkToYulia user />
 *
 * It shows EVERY file (or every deal library / data room / needs-action item)
 * for the chosen `view`, grouped by deal — the full list behind the four Files
 * lanes. Every value is the SAME real data FilesRoot/CDFiles compute (the same
 * useV6WorkspaceData + useTodayOperatingBrief hooks, the same deliverable →
 * FileRow and deal → RoomRow shaping, the same DEFINITIVE disclosure status);
 * only the surface is the cool/indigo CD language. Zero fabrication: when there
 * is no real data we show an honest empty state, never invented rows. The CD
 * mockup (files.jsx) supplies the LIST grammar (kind glyph rows, status tags,
 * a room table, grouped sections) and none of its window.MA_FS demo data.
 *
 * Routing preserves FilesRoot exactly: model-refresh → ask Yulia, DEFINITIVE
 * packet → analysis tab with artifactData, deal → deal tab, analysis →
 * analysis tab, else doc tab. Rooms open the deal tab with the right fileScope.
 *
 * Mounts under `.cd-root` (cdTokens.css); only `--cd-*` tokens.
 */
import { useMemo } from "react";
import {
  CDIcon, CDPill, CDCard, CDLineNote,
  type CDTone,
} from "../kit/cdUi";
import type { User } from "../../../hooks/useAuth";
import {
  useTodayOperatingBrief, type TodayFileReviewItem,
} from "../../../hooks/useTodayOperatingBrief";
import {
  useV6WorkspaceData, type WorkspaceDeal, type WorkspaceDeliverable,
} from "../../../hooks/useV6WorkspaceData";
import { cdDealColor } from "../shell/cdAtoms";
import type { FileListView, FileScope, OpenTab } from "../../v6/types";

/* ─── view-models (same shapes FilesRoot derives) ───────────────────────── */
type FileKind = "doc" | "chart" | "deal";
type FileTone = "draft" | "review" | "locked" | "done";
type DisclosureStatus = TodayFileReviewItem["definitiveDisclosureStatus"];

interface FileRow {
  title: string;
  sub: string;
  status: string;
  kind: FileKind;
  tone: FileTone;
  id?: string;
  dealId?: string;
  dealTitle?: string;
  analysisRunId?: number | null;
  analysisType?: string | null;
  analysisStatus?: string | null;
  definitivePacketRowId?: number;
  definitivePacketId?: string;
  definitivePacketType?: string;
  definitivePacketCid?: string;
  definitiveStateCid?: string;
  definitiveToolName?: string;
  definitiveNextSuggestedCalls?: TodayFileReviewItem["definitiveNextSuggestedCalls"];
  definitiveTakeBackArtifacts?: string[];
  definitiveSourceGaps?: TodayFileReviewItem["definitiveSourceGaps"];
  definitiveDisclosureStatus?: DisclosureStatus;
  modelRefreshPrompt?: string;
}

interface RoomRow {
  deal: string;
  meta: string;
  stage: string;
  count: string;
  items: number;
  id: string;
}

/* tone → CD status pill (mirrors FilesRoot toneToPill) */
const TONE_PILL: Record<FileTone, CDTone> = {
  draft: "warn",
  review: "accent",
  locked: "neutral",
  done: "pos",
};

/* ─── per-view editorial copy (verbatim intent from FilesRoot.activeListCopy) ── */
const VIEW_COPY: Record<FileListView, { title: string; sub: string; prompt: string }> = {
  all: {
    title: "Every file across deal libraries",
    sub: "Private docs, analyses, data-room artifacts, shared docs, and executed records across portfolios.",
    prompt: "Show every file across my portfolio, grouped by portfolio, deal, stage, and data room status.",
  },
  "deal-libraries": {
    title: "Deal libraries",
    sub: "Each deal opens to its private workspace, analysis, drafts, shared docs, and data-room boundary.",
    prompt: "Show my deal libraries and summarize which one needs attention first.",
  },
  "needs-action": {
    title: "Files needing action",
    sub: "Drafts, requests, reviews, failed generations, markups, and submissions waiting on you.",
    prompt: "Show files that need action from me and rank them by urgency.",
  },
  "data-rooms": {
    title: "Active data rooms",
    sub: "Shared diligence drives by deal, separate from private workspaces and analyses.",
    prompt: "Show active data rooms and separate artifacts, drafted docs, review items, and executed docs.",
  },
};

/* ─── the page ──────────────────────────────────────────────────────────── */
export function CDFilesList({
  view, openTab, onTalkToYulia, user,
}: {
  view: FileListView;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, workspace.canFetch);
  const operatingFiles = useMemo(
    () => operating.brief?.filesNeedingReview ?? [],
    [operating.brief],
  );

  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const copy = VIEW_COPY[view];

  /* every file (the "see all" set) and the needs-action set — same shaping
     FilesRoot uses, so the rows match the rest of the app exactly */
  const allFiles = useMemo(
    () => workspace.deliverables.map(deliverableToFileRow),
    [workspace.deliverables],
  );
  const actions = useMemo(() => {
    if (operatingFiles.length) return operatingFiles.map(operatingFileToFileRow);
    return workspace.deliverables
      .filter(d => ["queued", "generating", "failed", "draft"].includes(d.status))
      .map(deliverableToFileRow);
  }, [operatingFiles, workspace.deliverables]);
  const rooms = useMemo(
    () => workspace.deals.map(dealToRoomRow),
    [workspace.deals],
  );

  /* which surface this view shows */
  const showRooms = view === "deal-libraries" || view === "data-rooms";
  const roomScope: FileScope = view === "data-rooms" ? "data-room" : "all";
  const rows = view === "needs-action" ? actions : allFiles;
  const groups = useMemo(() => groupFileRows(rows), [rows]);

  const listLoading =
    (workspace.canFetch && workspace.loading) ||
    (view === "needs-action" && operating.loading && actions.length === 0);
  const listError = workspace.error || (view === "needs-action" ? operating.error : null);

  /* ─── routing (preserves FilesRoot openDoc / openDeal exactly) ───────── */
  const openDoc = (row: FileRow) => {
    if (row.modelRefreshPrompt) { ask(row.modelRefreshPrompt); return; }
    if (row.definitivePacketRowId) { openDefinitivePacket(row, openTab); return; }
    if (row.kind === "deal" && row.dealId) {
      openTab({ kind: "deal", title: row.dealTitle ?? row.title, id: row.dealId });
      return;
    }
    if (row.kind === "chart" && row.analysisRunId) {
      openTab({
        kind: "analysis",
        title: fileTabTitle(row),
        id: row.analysisRunId ? `analysis-${row.analysisRunId}` : row.id,
        analysisRunId: row.analysisRunId,
        tool: row.analysisType ?? undefined,
        status: row.analysisStatus ?? undefined,
      });
      return;
    }
    openTab({ kind: "doc", title: fileTabTitle(row), id: row.id ?? `file-${slug(row.title)}` });
  };

  const openDeal = (room: RoomRow, fileScope: FileScope = "all") => {
    openTab({ kind: "deal", title: room.deal, id: room.id, fileScope });
  };

  /* count line in the header — descriptive state facts only */
  const tally = showRooms
    ? `${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`
    : `${rows.length} ${rows.length === 1 ? "file" : "files"}`;

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* editorial header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            {copy.title}
          </h1>
          <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14, maxWidth: 720, lineHeight: 1.5 }}>
            {copy.sub}
          </p>
        </div>
        <button
          onClick={() => ask(copy.prompt)}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", flexShrink: 0, boxShadow: "var(--cd-shadow-sm)" }}
        >
          <CDIcon name="sparkle" size={15} color="white" />Ask Yulia
        </button>
      </div>

      {/* count line under the title — real tally, no fabricated trend */}
      {!listLoading && !listError && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: -4, fontSize: 12, color: "var(--cd-ink-3)" }}>
          <CDIcon name={showRooms ? "share" : "doc"} size={13} color="var(--cd-ink-3)" />
          <span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink-2)" }}>{tally}</span>
          {showRooms && <CDPill tone="accent"><CDIcon name="share" size={11} color="var(--cd-accent)" />{view === "data-rooms" ? "Shared diligence" : "Deal libraries"}</CDPill>}
        </div>
      )}

      {/* loading */}
      {listLoading && (
        <CDCard pad={false}><div style={{ padding: 18 }}><div className="cd-skel" style={{ height: 140, borderRadius: 10 }} /></div></CDCard>
      )}

      {/* error */}
      {!listLoading && listError && (
        <CDCard pad={false}>
          <div style={{ margin: 14, padding: "10px 12px", borderRadius: 10, background: "var(--cd-neg-soft)", color: "var(--cd-neg)", fontSize: 12.5 }}>
            Couldn&rsquo;t load workspace files ({listError}).
          </div>
        </CDCard>
      )}

      {/* ── ROOMS surface (deal-libraries / data-rooms) ───────────────── */}
      {!listLoading && !listError && showRooms && (
        rooms.length === 0 ? (
          <CDCard pad={false}>
            <EmptyRow
              title="No deal libraries yet"
              text="When you add a deal, its private library and data-room boundary show up here."
              action="Create with Yulia"
              onClick={() => ask("Help me create my first deal library.")}
            />
          </CDCard>
        ) : (
          <CDCard pad={false}>
            {rooms.map((room, i) => (
              <RoomRowItem
                key={`${room.id}-${room.deal}`}
                room={room}
                shared={view === "data-rooms"}
                last={i === rooms.length - 1}
                onClick={() => openDeal(room, roomScope)}
              />
            ))}
          </CDCard>
        )
      )}

      {/* ── FILES surface (all / needs-action), grouped by deal ───────── */}
      {!listLoading && !listError && !showRooms && (
        groups.length === 0 ? (
          <CDCard pad={false}>
            <EmptyRow
              title={view === "needs-action" ? "Nothing needs action" : "No files yet"}
              text={view === "needs-action"
                ? "Requests, reviews, execution items, and failed generations appear here when they exist."
                : "Generated docs, analyses, uploads, and data-room artifacts appear here once this workspace has data."}
              action="Ask Yulia what's next"
              onClick={() => ask(copy.prompt)}
            />
          </CDCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
            {groups.map(group => (
              <div key={group.deal} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {/* plain provenance line — no mono-caps micro labels */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0 2px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: cdDealColor(group.dealId ?? group.deal), flexShrink: 0, alignSelf: "center" }} />
                  <strong style={{ fontSize: 13, fontWeight: 700, color: "var(--cd-ink)", letterSpacing: "-0.01em" }}>{group.deal}</strong>
                  <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", background: "var(--cd-surface-3)", borderRadius: 6, padding: "1px 7px" }}>
                    {group.rows.length} {group.rows.length === 1 ? "file" : "files"}
                  </span>
                </div>
                <CDCard pad={false}>
                  {group.rows.map((row, i) => (
                    <FileRowItem
                      key={`${row.id ?? row.title}-${i}`}
                      row={row}
                      last={i === group.rows.length - 1}
                      onClick={() => openDoc(row)}
                    />
                  ))}
                </CDCard>
              </div>
            ))}
          </div>
        )
      )}

      {/* THE LINE — disclosure stays under the user's control */}
      {!listLoading && !listError && <CDLineNote style={{ marginTop: 4 }} />}
    </div>
  );
}

/* ─── one file row (kind glyph · title/sub · disclosure + status pills) ─── */
function FileRowItem({ row, last, onClick }: { row: FileRow; last: boolean; onClick: () => void }) {
  const glyph = row.kind === "chart" ? "analysis" : row.kind === "deal" ? "portfolio" : "doc";
  const disclosure = row.definitiveDisclosureStatus
    ? { tone: disclosurePillTone(row.definitiveDisclosureStatus), label: disclosureStatusLabel(row.definitiveDisclosureStatus, row.definitiveSourceGaps?.length ?? 0) }
    : null;
  return (
    <button
      onClick={onClick}
      style={{
        appearance: "none", font: "inherit", textAlign: "left", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box",
        padding: "12px 18px", background: "transparent",
        border: "none", borderBottom: last ? "none" : "1px solid var(--cd-line)",
      }}
    >
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", display: "grid", placeItems: "center" }}>
        <CDIcon name={glyph} size={17} color="var(--cd-ink-2)" />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong style={{ color: "var(--cd-ink)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.title}</strong>
        <span style={{ color: "var(--cd-ink-3)", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.sub}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        {disclosure && <CDPill tone={disclosure.tone}>{disclosure.label}</CDPill>}
        <CDPill tone={TONE_PILL[row.tone]}>{row.status}</CDPill>
      </span>
    </button>
  );
}

/* ─── one data-room / library row ───────────────────────────────────────── */
function RoomRowItem({ room, shared, last, onClick }: { room: RoomRow; shared: boolean; last: boolean; onClick: () => void }) {
  const color = cdDealColor(room.id);
  return (
    <button
      onClick={onClick}
      style={{
        appearance: "none", font: "inherit", textAlign: "left", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box",
        padding: "13px 18px", background: "transparent",
        border: "none", borderBottom: last ? "none" : "1px solid var(--cd-line)",
      }}
    >
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: `color-mix(in oklch, ${color}, transparent 86%)`, display: "grid", placeItems: "center" }}>
        <CDIcon name={shared ? "share" : "portfolio"} size={16} color={color} />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong style={{ color: "var(--cd-ink)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.deal}</strong>
        <span style={{ color: "var(--cd-ink-3)", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.meta}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <CDPill tone={roomStagePill(room.stage)}>{room.stage}</CDPill>
          <span className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>{room.count}</span>
        </span>
        <span aria-hidden style={{ flexShrink: 0 }}><CDIcon name="chevright" size={15} color="var(--cd-ink-4)" /></span>
      </span>
    </button>
  );
}

/* ─── honest empty state ────────────────────────────────────────────────── */
function EmptyRow({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 9, padding: "22px 20px 24px" }}>
      <strong style={{ color: "var(--cd-ink)", fontWeight: 700, fontSize: 13.5 }}>{title}</strong>
      <span style={{ color: "var(--cd-ink-2)", fontSize: 12.5, lineHeight: 1.5, maxWidth: 460 }}>{text}</span>
      <button
        onClick={onClick}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 2, background: "var(--cd-surface)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "8px 13px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)" }}
      >
        <CDIcon name="sparkle" size={13} color="var(--cd-accent)" />{action}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Data shaping — ported verbatim from FilesRoot.tsx so the rows are identical
   ════════════════════════════════════════════════════════════════════════ */

function groupFileRows(rows: FileRow[]): Array<{ deal: string; dealId?: string; rows: FileRow[] }> {
  const order: string[] = [];
  const byDeal = new Map<string, { dealId?: string; rows: FileRow[] }>();
  rows.forEach(row => {
    const deal = fileDealName(row);
    if (!byDeal.has(deal)) { byDeal.set(deal, { dealId: row.dealId, rows: [] }); order.push(deal); }
    byDeal.get(deal)!.rows.push(row);
  });
  return order.map(deal => ({ deal, dealId: byDeal.get(deal)!.dealId, rows: byDeal.get(deal)!.rows }));
}

function deliverableToFileRow(d: WorkspaceDeliverable): FileRow {
  const isModel = d.folder_category === "models" || /model/i.test(`${d.slug || ""} ${d.name || ""}`);
  const isAnalysis = isModel || !!d.analysis_run_id || /valuation|analysis|recast|sba|comp|score|risk|tax|financial/i.test(d.slug || d.name);
  return {
    title: d.name || formatSlug(d.slug),
    sub: `${d.deal_name || "Deal"} · ${isModel ? "Models" : formatStatus(d.status)} · ${fmtRelative(d.completed_at || d.created_at)}`,
    status: d.status === "complete" ? "Open" : formatStatus(d.status),
    kind: isAnalysis ? "chart" : "doc",
    tone: d.status === "complete" ? "review" : d.status === "failed" ? "locked" : "draft",
    id: String(d.id),
    dealTitle: d.deal_name ?? undefined,
    analysisRunId: d.analysis_run_id ?? null,
    analysisType: d.analysis_type ?? null,
    analysisStatus: d.analysis_status ?? null,
  };
}

function operatingFileToFileRow(item: TodayFileReviewItem): FileRow {
  const basis = `${item.title} ${item.reason} ${item.status}`;
  const isAnalysis = /model|analysis|financial|p&l|chart|score|valuation|qoe|recast|sba|tax|legal|metric/i.test(basis);
  const isDefinitivePacket = !!item.definitivePacketRowId;
  const isModelRefresh = item.id.startsWith("model-refresh-");
  return {
    title: item.title,
    sub: `${item.dealTitle || "Workspace"} · ${item.reason}`,
    status: formatStatus(item.status),
    kind: isModelRefresh ? "chart" : isDefinitivePacket ? "doc" : isAnalysis ? "chart" : "doc",
    tone: todayFileTone(item),
    id: item.id,
    dealId: item.dealId,
    dealTitle: item.dealTitle,
    modelRefreshPrompt: isModelRefresh
      ? `Explain this model refresh queue item for ${item.dealTitle || "the deal"}: ${item.title}. Show why it is stale, which assumptions changed, and what should be rerun before the file or data-room artifact is relied on.`
      : undefined,
    definitivePacketRowId: item.definitivePacketRowId,
    definitivePacketId: item.definitivePacketId,
    definitivePacketType: item.definitivePacketType,
    definitivePacketCid: item.definitivePacketCid,
    definitiveStateCid: item.definitiveStateCid,
    definitiveToolName: item.definitiveToolName,
    definitiveNextSuggestedCalls: item.definitiveNextSuggestedCalls,
    definitiveTakeBackArtifacts: item.definitiveTakeBackArtifacts,
    definitiveSourceGaps: item.definitiveSourceGaps,
    definitiveDisclosureStatus: item.definitiveDisclosureStatus,
  };
}

function todayFileTone(item: TodayFileReviewItem): FileTone {
  if (/executed|done|complete/i.test(item.status)) return "done";
  if (/locked|immutable/i.test(item.status)) return "locked";
  if (item.tone === "gold" || /refresh|queued|generating|draft/i.test(item.status)) return "draft";
  if (item.tone === "cactus") return "done";
  if (item.tone === "charcoal") return "locked";
  return "review";
}

function dealToRoomRow(deal: WorkspaceDeal): RoomRow {
  const docs = Number(deal.document_count ?? 0);
  const deliverables = Number(deal.deliverable_count ?? 0);
  return {
    deal: deal.business_name || deal.industry || `Deal #${deal.id}`,
    meta: `${formatJourney(deal.journey_type)} · ${deal.location || deal.industry || deal.current_gate}`,
    stage: docs > 0 ? "Data room active" : "Library ready",
    count: `${docs + deliverables} items`,
    items: docs + deliverables,
    id: String(deal.id),
  };
}

/* ─── DEFINITIVE packet → analysis tab (verbatim from FilesRoot) ────────── */
function openDefinitivePacket(row: FileRow, openTab: OpenTab) {
  const title = fileTabTitle(row);
  openTab({
    kind: "analysis",
    id: row.definitivePacketRowId ? `definitive-packet-${row.definitivePacketRowId}` : row.id,
    title,
    tool: "artifact",
    status: row.status,
    markdown: definitivePacketMarkdown(row),
    artifactData: {
      type: "definitive_packet",
      packetRowId: row.definitivePacketRowId,
      packetId: row.definitivePacketId,
      packetType: row.definitivePacketType,
      packetCid: row.definitivePacketCid,
      stateCid: row.definitiveStateCid,
      toolName: row.definitiveToolName,
      nextSuggestedCalls: row.definitiveNextSuggestedCalls ?? [],
      takeBackArtifacts: row.definitiveTakeBackArtifacts ?? [],
      sourceGaps: row.definitiveSourceGaps ?? [],
      disclosureStatus: row.definitiveDisclosureStatus,
      dealId: row.dealId,
      dealTitle: row.dealTitle,
      source: "files",
    },
  });
}

function definitivePacketMarkdown(row: FileRow): string {
  const deal = fileDealName(row);
  const packetType = row.definitivePacketType || row.title;
  const toolName = row.definitiveToolName ? labelFromSlug(row.definitiveToolName) : "DEFINITIVE";
  const packetLabel = row.definitivePacketId || (row.definitivePacketRowId ? `row ${row.definitivePacketRowId}` : "available packet");
  const stateCid = row.definitiveStateCid || "not stamped on this row";
  const packetCid = row.definitivePacketCid || "not stamped on this row";
  const nextCalls = row.definitiveNextSuggestedCalls ?? [];
  const artifacts = row.definitiveTakeBackArtifacts ?? [];
  const sourceGaps = row.definitiveSourceGaps ?? [];
  const disclosureLabel = disclosureStatusLabel(row.definitiveDisclosureStatus, sourceGaps.length);

  return [
    `# ${row.title}`,
    "",
    `This is a DEFINITIVE agent take-back packet for ${deal}. It is not a loose document; it is a handoff object from the deal operating system that lets Yulia or another agent resume the deal with the same state, gate context, and methodology boundary.`,
    "",
    "## Packet identity",
    `- Packet: ${packetLabel}`,
    `- Type: ${packetType}`,
    `- Source tool: ${toolName}`,
    `- DealState CID: ${stateCid}`,
    `- Packet CID: ${packetCid}`,
    ...(disclosureLabel ? [`- Disclosure readiness: ${disclosureLabel}`] : []),
    "",
    "## Source gaps and disclosure boundary",
    ...(sourceGaps.length
      ? sourceGaps.map(gap => `- ${labelFromSlug(gap.category)}: ${gap.reason}${gap.suggestedTool ? ` Next call: ${labelFromSlug(gap.suggestedTool)}.` : ""}`)
      : ["- No source gaps are stamped on this packet."]),
    "- DEFINITIVE composes selective proof only. Nothing is transmitted externally from this packet without a separate user-controlled share/export approval.",
    "",
    "## Next agent calls",
    ...(nextCalls.length
      ? nextCalls.map(call => `- ${call.priority} ${call.label}: ${call.reason}`)
      : ["- Ask Yulia to infer the next gate from the DealState and current file context."]),
    "",
    "## Portable artifacts",
    ...(artifacts.length ? artifacts.map(item => `- ${item}`) : ["- DealState", "- MCPCallHint[]"]),
    "",
    "## What it means",
    "- The packet is the current portable state for this deal step.",
    "- Yulia should use it to decide whether the next move is more information, IOI/LOI work, diligence, modeling, negotiation, data-room work, or a professional handoff.",
    "- The packet can be carried back to another agent system without losing the methodology trail.",
    "",
    "## Ask Yulia next",
    `Explain this ${packetType} for ${deal}. Show what is known, what is missing, which gate it belongs to, what should happen next, and what another agent can take back to its system.`,
  ].join("\n");
}

/* ─── tab-title + name helpers (verbatim from FilesRoot) ────────────────── */
function fileTabTitle(row: FileRow): string {
  const deal = fileDealName(row);
  if (!deal || deal === "Workspace" || row.title.startsWith(`${deal} · `)) return row.title;
  return `${deal} · ${row.title}`;
}

function fileDealName(row: FileRow): string {
  if (row.dealTitle) return row.dealTitle;
  const [deal] = row.sub.split("·");
  return deal.trim() || "Workspace";
}

/* ─── disclosure status → CD pill (mirrors FilesRoot disclosurePillCls) ── */
function disclosurePillTone(status: DisclosureStatus): CDTone {
  if (status === "ready_for_user_controlled_disclosure") return "pos";
  if (status === "blocked_by_source_gaps") return "neg";
  if (status === "source_gaps_open") return "warn";
  return "accent";
}

function disclosureStatusLabel(status: DisclosureStatus, gapCount: number): string {
  if (status === "blocked_by_source_gaps") return `${gapCount || "source"} gap${gapCount === 1 ? "" : "s"} block disclosure`;
  if (status === "source_gaps_open") return `${gapCount || "source"} gap${gapCount === 1 ? "" : "s"} open`;
  if (status === "data_room_index_ready") return "data room index ready";
  if (status === "ready_for_user_controlled_disclosure") return "ready to disclose";
  return "";
}

function roomStagePill(stage: string): CDTone {
  const s = stage.toLowerCase();
  if (s.includes("active") || s.includes("ready")) return "pos";
  if (s.includes("action")) return "warn";
  if (s.includes("attorney") || s.includes("review")) return "accent";
  return "neutral";
}

/* ─── formatting helpers (verbatim from FilesRoot) ──────────────────────── */
function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function labelFromSlug(input: string): string {
  return input.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, l => l.toUpperCase());
}

function formatSlug(input: string): string {
  return input.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatStatus(input: string): string {
  return input.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatJourney(input: string): string {
  return input ? input.charAt(0).toUpperCase() + input.slice(1) : "Deal";
}

function fmtRelative(iso?: string | null): string {
  if (!iso) return "recently";
  try {
    const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.round(hr / 24);
    if (day < 30) return `${day}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "recently";
  }
}
