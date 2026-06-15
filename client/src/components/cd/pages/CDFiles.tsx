/**
 * CDFiles — the Claude Design "Files" (Documents) page, ported into the real
 * app and wired to LIVE data. Mounts under `.cd-root` (cdTokens.css).
 *
 * Files is the single document home: deliverables + data-room docs, organized
 * by deal, with a "needs review" band and by-kind / recency views. This is the
 * CD reskin of v6/modes/FilesRoot.tsx — every value (lane counts, recents,
 * rooms, the work queue, DEFINITIVE disclosure status) is the SAME real data
 * FilesRoot computes; only the surface is the cool/indigo CD language.
 *
 * Zero fabrication: lane counts derive from real deals/deliverables, recents
 * come straight off the deliverables list, the needs-action band comes from
 * useTodayOperatingBrief's filesNeedingReview (falling back to the real
 * queued/generating/failed/draft deliverables). When there's nothing, we show
 * an honest empty state — never invented rows. The CD mockup (files.jsx) uses
 * window.MA_FS demo data; we copy its LAYOUT (Finder-style source lanes, list
 * rows with kind glyphs, status tags, by-kind/recency views) and NONE of it.
 *
 * Routing preserves FilesRoot exactly: model-refresh → ask Yulia, DEFINITIVE
 * packet → open analysis tab with artifactData, deal → deal tab, analysis →
 * analysis tab, else doc tab. Lanes + rooms open files-list / deal tabs.
 *
 * Props match what Canvas passes to V6FilesRoot so it can swap 1:1:
 *   { user, openTab, onTalkToYulia?, modelPreference? }
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  CDIcon, CDPill, CDCard, CDSectionTitle, CDDivider,
  cdFmtCents, cdDealColor, type CDTone,
} from "../kit/cdUi";
import type { User } from "../../../hooks/useAuth";
import {
  useTodayOperatingBrief, type TodayFileReviewItem,
} from "../../../hooks/useTodayOperatingBrief";
import {
  useV6WorkspaceData, type WorkspaceDeal, type WorkspaceDeliverable,
} from "../../../hooks/useV6WorkspaceData";
import type { FileListView, FileScope, OpenTab } from "../../v6/types";
import type { ModelPreference } from "../../../lib/modelPreference";

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

interface Lane {
  view: FileListView;
  label: string;
  sub: string;
  icon: "data" | "portfolio" | "flag" | "share";
  /** Real derived count. null = no real number, so no count renders. */
  count: number | null;
  prompt: string;
}

/* ─── the four Files lanes (CD-styled tiles, real counts) ───────────────── */
const LANE_DEFS: Omit<Lane, "count">[] = [
  {
    view: "all",
    label: "All files",
    sub: "Private deal docs, analyses, and data-room items across portfolios.",
    icon: "data",
    prompt: "Show all files across every portfolio, deal, stage, and data room.",
  },
  {
    view: "deal-libraries",
    label: "Deal libraries",
    sub: "Portfolio › deal › stage. Private until you share.",
    icon: "portfolio",
    prompt: "Open my deal libraries and group them by portfolio, deal, and stage.",
  },
  {
    view: "needs-action",
    label: "Needs action",
    sub: "Drafts, requests, markups, and submissions waiting on you.",
    icon: "flag",
    prompt: "Show files that need action from me and rank them by urgency.",
  },
  {
    view: "data-rooms",
    label: "Data rooms",
    sub: "Shared diligence rooms with artifacts, drafts, and executed docs.",
    icon: "share",
    prompt: "Show active data rooms and separate artifacts, drafts, review items, and executed docs.",
  },
];

/* lane accent color, keyed by view so each lane reads distinctly */
const LANE_COLOR: Record<FileListView, string> = {
  all: "var(--cd-accent)",
  "deal-libraries": "#2f9e6f",
  "needs-action": "var(--cd-warn)",
  "data-rooms": "#1aa8c4",
};

/* ─── tone → CD status pill (mirrors FilesRoot toneToPill) ──────────────── */
const TONE_PILL: Record<FileTone, { tone: CDTone; label: (s: string) => string }> = {
  draft: { tone: "warn", label: s => s },
  review: { tone: "accent", label: s => s },
  locked: { tone: "neutral", label: s => s },
  done: { tone: "pos", label: s => s },
};

/* recency view-mode toggle (CD's list / by-kind, the Finder view toggle) */
type ListMode = "recency" | "kind";

/* ─── the page ──────────────────────────────────────────────────────────── */
export function CDFiles({
  user, openTab, onTalkToYulia,
}: {
  user: User | null;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  modelPreference?: ModelPreference;
}) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, workspace.canFetch);
  const operatingFiles = useMemo(
    () => operating.brief?.filesNeedingReview ?? [],
    [operating.brief],
  );

  const ask = (prompt: string) => onTalkToYulia?.(prompt);

  /* lanes — real counts (null until we can fetch, so no invented numbers) */
  const lanes: Lane[] = useMemo(() => {
    if (!workspace.canFetch) return LANE_DEFS.map(l => ({ ...l, count: null }));
    const docCount = workspace.deals.reduce((sum, d) => sum + Number(d.document_count ?? 0), 0);
    const actionCount = operatingFiles.length
      || workspace.deliverables.filter(d => ["queued", "generating", "failed", "draft"].includes(d.status)).length;
    const dataRooms = workspace.deals.filter(d => Number(d.document_count ?? 0) > 0).length || workspace.deals.length;
    const counts: Record<FileListView, number> = {
      all: workspace.deliverables.length + docCount,
      "deal-libraries": workspace.deals.length,
      "needs-action": actionCount,
      "data-rooms": dataRooms,
    };
    return LANE_DEFS.map(l => ({ ...l, count: counts[l.view] }));
  }, [workspace.canFetch, workspace.deals, workspace.deliverables, operatingFiles]);

  /* recents — last touched deliverables */
  const recents = useMemo(
    () => workspace.deliverables.slice(0, 8).map(deliverableToFileRow),
    [workspace.deliverables],
  );
  /* rooms — one row per deal (private library + shared data-room boundary) */
  const rooms = useMemo(
    () => workspace.deals.slice(0, 6).map(dealToRoomRow),
    [workspace.deals],
  );
  /* needs-action — operating brief items, falling back to real stuck deliverables */
  const actions = useMemo(() => {
    if (operatingFiles.length) return operatingFiles.map(operatingFileToFileRow);
    return workspace.deliverables
      .filter(d => ["queued", "generating", "failed", "draft"].includes(d.status))
      .slice(0, 8)
      .map(deliverableToFileRow);
  }, [operatingFiles, workspace.deliverables]);

  /* recents by kind (the CD "by-kind" view of the same real rows) */
  const recentsByKind = useMemo(() => {
    const order: { kind: FileKind; label: string }[] = [
      { kind: "chart", label: "Analyses & models" },
      { kind: "doc", label: "Documents" },
      { kind: "deal", label: "Deal records" },
    ];
    return order
      .map(g => ({ ...g, rows: recents.filter(r => r.kind === g.kind) }))
      .filter(g => g.rows.length > 0);
  }, [recents]);

  /* ─── routing (preserves FilesRoot openDoc exactly) ─────────────────── */
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

  const openRoom = (room: RoomRow, fileScope: FileScope = "data-room") => {
    openTab({ kind: "deal", title: room.deal, id: room.id, fileScope });
  };

  const runLane = (lane: Lane) => {
    openTab({ id: `files-${lane.view}`, kind: "files-list", title: lane.label, fileListView: lane.view });
  };

  const [mode, setMode] = useState<ListMode>("recency");

  const filesLoading = workspace.canFetch && workspace.loading;
  const queueLoading = operating.loading && actions.length === 0;
  const totalQueued = actions.length;

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* editorial header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 36, lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            Documents
          </h1>
          <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14, maxWidth: 720, lineHeight: 1.5 }}>
            Every deal has its own private library. The data room is the shared diligence drive inside it — artifacts, drafted docs, review items, and executed records.
          </p>
        </div>
        <button
          onClick={() => ask("Help me upload or create a new file for this workspace.")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", flexShrink: 0, boxShadow: "var(--cd-shadow-sm)" }}
        >
          <CDIcon name="plus" size={15} color="white" />Upload
        </button>
      </div>

      {/* source lanes — the four Files entry points (Finder-style, real counts) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--cd-gap)" }}>
        {lanes.map(lane => <LaneTile key={lane.view} lane={lane} onOpen={() => runLane(lane)} />)}
      </div>

      {/* needs review band — the consequence-ranked queue leads */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 6 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Needs your review</h2>
        {totalQueued > 0 && <CDPill tone="warn">{totalQueued} waiting</CDPill>}
      </div>
      <CDCard pad={false}>
        {queueLoading ? (
          <div style={{ padding: 18 }}><div className="cd-skel" style={{ height: 64, borderRadius: 10 }} /></div>
        ) : operating.error ? (
          <div style={{ margin: 14, padding: "10px 12px", borderRadius: 10, background: "var(--cd-neg-soft)", color: "var(--cd-neg)", fontSize: 12.5 }}>
            Couldn&rsquo;t load the review queue ({operating.error}).
          </div>
        ) : actions.length === 0 ? (
          <EmptyRow
            title="Nothing needs review"
            text="Requests, reviews, execution items, and failed generations land here when they exist."
            action="Ask Yulia what's next"
            onClick={() => ask("What should I work on next in my files?")}
          />
        ) : (
          actions.map((row, i) => (
            <FileRowItem key={`${row.id ?? row.title}-${i}`} row={row} last={i === actions.length - 1} onClick={() => openDoc(row)} />
          ))
        )}
      </CDCard>

      {/* recents + data rooms */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "var(--cd-gap)" }}>
        {/* recents — with the list / by-kind view toggle */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <CDSectionTitle
            action={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ViewToggle mode={mode} onChange={setMode} />
                <button
                  onClick={() => openTab({ id: "files-all", kind: "files-list", title: "All files", fileListView: "all" })}
                  style={ghostBtn}
                >
                  See all
                </button>
              </div>
            }
          >
            Recently touched
          </CDSectionTitle>
          <CDCard pad={false} style={{ flex: 1 }}>
            {filesLoading ? (
              <div style={{ padding: 18 }}><div className="cd-skel" style={{ height: 120, borderRadius: 10 }} /></div>
            ) : workspace.error ? (
              <div style={{ margin: 14, padding: "10px 12px", borderRadius: 10, background: "var(--cd-neg-soft)", color: "var(--cd-neg)", fontSize: 12.5 }}>
                Couldn&rsquo;t load workspace files ({workspace.error}).
              </div>
            ) : recents.length === 0 ? (
              <EmptyRow
                title="No files yet"
                text="Generated docs, analyses, uploads, and data-room artifacts appear here once this workspace has data."
                action="Start with Yulia"
                onClick={() => ask("Help me create or import the first file for this workspace.")}
              />
            ) : mode === "recency" ? (
              recents.map((row, i) => (
                <FileRowItem key={`${row.id ?? row.title}-${i}`} row={row} last={i === recents.length - 1} onClick={() => openDoc(row)} />
              ))
            ) : (
              recentsByKind.map((group, gi) => (
                <div key={group.kind}>
                  <KindHeader label={group.label} count={group.rows.length} icon={group.kind === "chart" ? "analysis" : group.kind === "deal" ? "portfolio" : "doc"} first={gi === 0} />
                  {group.rows.map((row, i) => (
                    <FileRowItem key={`${row.id ?? row.title}-${i}`} row={row} last={gi === recentsByKind.length - 1 && i === group.rows.length - 1} onClick={() => openDoc(row)} />
                  ))}
                </div>
              ))
            )}
          </CDCard>
        </div>

        {/* data rooms — shared diligence drives by deal */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <CDSectionTitle action={<CDPill tone="accent"><CDIcon name="share" size={11} color="var(--cd-accent)" />Shared</CDPill>}>
            Data rooms
          </CDSectionTitle>
          <CDCard pad={false} style={{ flex: 1 }}>
            {filesLoading ? (
              <div style={{ padding: 18 }}><div className="cd-skel" style={{ height: 120, borderRadius: 10 }} /></div>
            ) : rooms.length === 0 ? (
              <EmptyRow
                title="No deal libraries yet"
                text="When you add a deal, its private library and data-room boundary show up here."
                action="Create with Yulia"
                onClick={() => ask("Help me create my first deal library.")}
              />
            ) : (
              rooms.map((room, i) => (
                <RoomRowItem key={`${room.id}-${room.deal}`} room={room} last={i === rooms.length - 1} onClick={() => openRoom(room)} />
              ))
            )}
          </CDCard>
        </div>
      </div>

      {/* footer count line — descriptive state facts only */}
      <CDDivider />
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "var(--cd-ink-3)" }}>
        <span><span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink-2)" }}>{recents.length}</span> recent</span>
        <span style={{ color: "var(--cd-line-2)" }}>·</span>
        <span><span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink-2)" }}>{rooms.length}</span> {rooms.length === 1 ? "room" : "rooms"}</span>
        <span style={{ color: "var(--cd-line-2)" }}>·</span>
        <span><span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink-2)" }}>{totalQueued}</span> in review</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "var(--cd-ink-4)" }}>Yulia shows file state — disclosure stays under your control.</span>
      </div>
    </div>
  );
}

/* ─── lane tile (CD card with accent rail + real count) ─────────────────── */
function LaneTile({ lane, onOpen }: { lane: Lane; onOpen: () => void }) {
  const color = LANE_COLOR[lane.view];
  return (
    <button
      onClick={onOpen}
      style={{
        appearance: "none", textAlign: "left", font: "inherit", cursor: "pointer",
        position: "relative", display: "flex", flexDirection: "column", gap: 8,
        minHeight: 118, padding: "16px 17px", boxSizing: "border-box",
        background: "var(--cd-surface)", border: "1px solid var(--cd-line)",
        borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-md)", overflow: "hidden",
      }}
    >
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: color }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklch, ${color}, transparent 88%)`, display: "grid", placeItems: "center" }}>
          <CDIcon name={lane.icon} size={16} color={color} />
        </span>
        {lane.count != null && (
          <span className="cd-num" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: "var(--cd-ink)", letterSpacing: "-0.02em" }}>
            {lane.count}
          </span>
        )}
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--cd-ink)", letterSpacing: "-0.01em" }}>{lane.label}</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.4, color: "var(--cd-ink-3)", marginTop: 3 }}>{lane.sub}</div>
      </div>
    </button>
  );
}

/* ─── one file row (kind glyph · title/sub · disclosure + status pills) ─── */
function FileRowItem({ row, last, onClick }: { row: FileRow; last: boolean; onClick: () => void }) {
  const pill = TONE_PILL[row.tone];
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
      <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", display: "grid", placeItems: "center", color: "var(--cd-ink-2)" }}>
        <CDIcon name={glyph} size={17} color="var(--cd-ink-2)" />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong style={{ color: "var(--cd-ink)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.title}</strong>
        <span style={{ color: "var(--cd-ink-3)", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.sub}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        {disclosure && <CDPill tone={disclosure.tone}>{disclosure.label}</CDPill>}
        <CDPill tone={pill.tone}>{pill.label(row.status)}</CDPill>
      </span>
    </button>
  );
}

/* ─── one data-room row ─────────────────────────────────────────────────── */
function RoomRowItem({ room, last, onClick }: { room: RoomRow; last: boolean; onClick: () => void }) {
  const color = cdDealColor(room.id);
  const stagePill = roomStagePill(room.stage);
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
        <CDIcon name="share" size={16} color={color} />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong style={{ color: "var(--cd-ink)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.deal}</strong>
        <span style={{ color: "var(--cd-ink-3)", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{room.meta}</span>
      </span>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <CDPill tone={stagePill}>{room.stage}</CDPill>
        <span className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>{room.count}</span>
      </span>
    </button>
  );
}

/* ─── recency / by-kind view toggle (the Finder view switch) ────────────── */
function ViewToggle({ mode, onChange }: { mode: ListMode; onChange: (m: ListMode) => void }) {
  const opts: { v: ListMode; icon: "data" | "grid"; title: string }[] = [
    { v: "recency", icon: "data", title: "By recency" },
    { v: "kind", icon: "grid", title: "By kind" },
  ];
  return (
    <div style={{ display: "flex", gap: 2, background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 8, padding: 2 }}>
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          title={o.title}
          style={{ width: 28, height: 24, borderRadius: 6, border: "none", cursor: "pointer", background: mode === o.v ? "var(--cd-surface)" : "transparent", boxShadow: mode === o.v ? "var(--cd-shadow-sm)" : "none", display: "grid", placeItems: "center" }}
        >
          <CDIcon name={o.icon} size={13} color={mode === o.v ? "var(--cd-accent)" : "var(--cd-ink-3)"} />
        </button>
      ))}
    </div>
  );
}

/* ─── a by-kind group header inside the recents card ────────────────────── */
function KindHeader({ label, count, icon, first }: { label: string; count: number; icon: string; first: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px 8px", borderTop: first ? "none" : "1px solid var(--cd-line)", background: "var(--cd-surface-2)" }}>
      <CDIcon name={icon} size={13} color="var(--cd-ink-3)" />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--cd-ink-2)", letterSpacing: "-0.005em" }}>{label}</span>
      <span className="cd-num" style={{ fontSize: 11, color: "var(--cd-ink-4)" }}>{count}</span>
    </div>
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

const ghostBtn: CSSProperties = {
  background: "var(--cd-surface-2)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line)",
  borderRadius: "var(--cd-r-md)", padding: "6px 11px", fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap",
};

/* ════════════════════════════════════════════════════════════════════════
   Data shaping — ported verbatim from FilesRoot.tsx so the rows are identical
   ════════════════════════════════════════════════════════════════════════ */

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

/* cdFmtCents re-exported for callers that import money formatting from here */
export { cdFmtCents };
