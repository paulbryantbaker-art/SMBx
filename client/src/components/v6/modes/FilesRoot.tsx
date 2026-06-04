import { useMemo } from "react";
import { V6Icon } from "../icons";
import type { FileListView, FileScope, OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useTodayOperatingBrief, type TodayFileReviewItem } from "../../../hooks/useTodayOperatingBrief";
import { useV6WorkspaceData, type WorkspaceDeal, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { DefinitiveSurfacePanel } from "../shared/DefinitiveSurfacePanel";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";

interface FilesRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

interface Shortcut {
  view: FileListView;
  label: string;
  count: string;
  unit: string;
  audience: string;
  sub: string;
  icon: "library" | "deal" | "doc" | "chart";
  tone: "all" | "deals" | "action" | "room";
  prompt: string;
}

interface FileRow {
  title: string;
  sub: string;
  status: string;
  kind: "doc" | "chart" | "deal";
  tone: "draft" | "review" | "locked" | "done";
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
  definitiveNextSuggestedCalls?: Array<{ toolName: string; label: string; priority: "P0" | "P1" | "P2"; reason: string }>;
  definitiveTakeBackArtifacts?: string[];
  definitiveSourceGaps?: Array<{ category: string; reason: string; suggestedTool?: string }>;
  definitiveDisclosureStatus?: "blocked_by_source_gaps" | "source_gaps_open" | "data_room_index_ready" | "ready_for_user_controlled_disclosure";
  modelRefreshPrompt?: string;
}

interface RoomRow {
  deal: string;
  meta: string;
  stage: string;
  count: string;
  id: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    view: "all",
    label: "All files",
    count: "24",
    unit: "files",
    audience: "Private and shared",
    sub: "Private deal docs, analysis, and data-room items across portfolios.",
    icon: "library",
    tone: "all",
    prompt: "Show all files across every portfolio, deal, stage, and data room.",
  },
  {
    view: "deal-libraries",
    label: "Deal libraries",
    count: "6",
    unit: "deals",
    audience: "Portfolio > deal > stage",
    sub: "Portfolio > deal > stage. Private until you share.",
    icon: "deal",
    tone: "deals",
    prompt: "Open my deal libraries and group them by portfolio, deal, and stage.",
  },
  {
    view: "needs-action",
    label: "Needs action",
    count: "4",
    unit: "asks",
    audience: "Drafts and reviews",
    sub: "Drafts, requests, markups, and submissions waiting on you.",
    icon: "doc",
    tone: "action",
    prompt: "Show files that need action from me.",
  },
  {
    view: "data-rooms",
    label: "Data rooms",
    count: "9",
    unit: "rooms",
    audience: "Shared diligence",
    sub: "Shared diligence rooms with artifacts, drafted docs, and executed docs.",
    icon: "chart",
    tone: "room",
    prompt: "Show active data rooms and separate artifacts, drafts, review items, and executed docs.",
  },
];

const RECENTS: FileRow[] = [
  { title: "IOI draft v3", sub: "Big Fake Deal · Yulia drafting · 2 min ago", status: "Review", kind: "doc", tone: "draft" },
  { title: "Buyer fit memo", sub: "Big Fake Deal · you · 1 hr ago", status: "Open", kind: "doc", tone: "review" },
  { title: "2024 P&L audited", sub: "Pest Control · data room artifact", status: "View", kind: "chart", tone: "locked" },
  { title: "Mutual NDA seller counsel", sub: "Big Fake Deal · in review · 2 markups", status: "In review", kind: "doc", tone: "review" },
];

const ROOMS: RoomRow[] = [
  { deal: "Big Fake Deal", meta: "Buy · East Texas · industrial services", stage: "Data room active", count: "9 items", id: "deal-bigfake" },
  { deal: "Pest Control · FL", meta: "Buy · recurring route density", stage: "Action needed", count: "6 items", id: "deal-pest" },
  { deal: "HVAC platform · CO", meta: "Watchlist · service mix under review", stage: "Attorney review", count: "8 items", id: "deal-hvac" },
];

const ACTIONS: FileRow[] = [
  { title: "Customer list top 25", sub: "HVAC platform · data room request", status: "Action needed", kind: "chart", tone: "draft" },
  { title: "Security findings recap", sub: "HVAC platform · attorney review", status: "Review", kind: "doc", tone: "review" },
  { title: "NDA countersigned", sub: "Big Fake Deal · executed and immutable", status: "Executed", kind: "doc", tone: "done" },
];

const FILE_CONTROL_STACK = [
  {
    title: "Private library",
    sub: "Internal notes, models, memos, and draft work stay inside the deal until you share them.",
  },
  {
    title: "Data-room boundary",
    sub: "Shared artifacts and transaction documents stay separated from private work product.",
  },
  {
    title: "Source trail",
    sub: "Files should carry source status, citation links, access scope, and audit record when they support a claim.",
  },
  {
    title: "Execution state",
    sub: "Draft, review, signed, locked, and missing-source states should be visible without turning the page into storage.",
  },
];

function useFilesWorkspace(user: User | null) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, workspace.canFetch);
  const useSampleData = !workspace.canFetch;
  const operatingFiles = operating.brief?.filesNeedingReview ?? [];
  const shortcuts = useMemo(
    () => useSampleData ? SHORTCUTS : buildRealShortcuts(workspace.deals, workspace.deliverables, operatingFiles),
    [useSampleData, workspace.deals, workspace.deliverables, operatingFiles],
  );
  const recents = useMemo(
    () => useSampleData ? RECENTS : workspace.deliverables.slice(0, 5).map(deliverableToFileRow),
    [useSampleData, workspace.deliverables],
  );
  const allFiles = useMemo(
    () => useSampleData ? [...RECENTS, ...ACTIONS] : workspace.deliverables.map(deliverableToFileRow),
    [useSampleData, workspace.deliverables],
  );
  const rooms = useMemo(
    () => useSampleData ? ROOMS : workspace.deals.slice(0, 6).map(dealToRoomRow),
    [useSampleData, workspace.deals],
  );
  const actions = useMemo(
    () => {
      if (useSampleData) return ACTIONS;
      if (operatingFiles.length) return operatingFiles.map(operatingFileToFileRow);
      return workspace.deliverables
        .filter(d => ["queued", "generating", "failed", "draft"].includes(d.status))
        .slice(0, 8)
        .map(deliverableToFileRow);
    },
    [operatingFiles, useSampleData, workspace.deliverables],
  );

  return { workspace, operating, shortcuts, recents, allFiles, rooms, actions };
}

export function V6FilesRoot({ openTab, onTalkToYulia, user }: FilesRootProps) {
  const { workspace, operating, shortcuts, recents, rooms, actions } = useFilesWorkspace(user);

  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const openDoc = (row: FileRow) => {
    if (row.modelRefreshPrompt) {
      ask(row.modelRefreshPrompt);
      return;
    }
    if (row.definitivePacketRowId) {
      openDefinitivePacket(row, openTab);
      return;
    }
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

  const runShortcut = (shortcut: Shortcut) => {
    openTab({
      id: `files-${shortcut.view}`,
      kind: "files-list",
      title: shortcut.label,
      fileListView: shortcut.view,
    });
  };

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="pg-title">Private deal libraries, plus shared data rooms.</div>
          <p className="pg-sub">
            Every deal has its own file library. The data room is the shared diligence drive inside that library, with artifacts, drafted legal docs, review items, and executed docs.
          </p>
        </div>
        <div className="pg-actions">
          <button className="kebab" type="button" aria-label="More" onClick={() => ask("Summarize my files: counts by status, what needs action today, and the single most important file to review.")}>⋯</button>
          <button className="wkbtn primary" type="button" onClick={() => ask("Help me upload or create a new file for this workspace.")}>Upload</button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mhead">
        <div className="mh">
          <span className="l">All files</span>
          <span className="v">{shortcuts[0]?.count ?? "—"}</span>
          <span className="s">across deals</span>
        </div>
        <div className="mh">
          <span className="l">Deal libraries</span>
          <span className="v">{shortcuts[1]?.count ?? "—"}</span>
          <span className="s">active deals</span>
        </div>
        <div className="mh">
          <span className="l">Needs action</span>
          <span className="v" style={{ color: "var(--accent-strong)" }}>{shortcuts[2]?.count ?? "—"}</span>
          <span className="s">asks waiting</span>
        </div>
        <div className="mh">
          <span className="l">Data rooms</span>
          <span className="v">{shortcuts[3]?.count ?? "—"}</span>
          <span className="s">shared rooms</span>
        </div>
      </div>

      {/* Source lanes — flat shortcut cards */}
      <div className="wksec">
        <div className="wksec-title">Source lanes</div>
        <p style={{ margin: "0 0 14px", color: "var(--ink-2)", fontSize: ".9rem" }}>
          Portfolio › deal › stage for all files. Data rooms add artifact, action, review, and executed status.
        </p>
        <div className="wkgrid g4">
          {shortcuts.map(shortcut => (
            <button
              key={shortcut.label}
              type="button"
              className="wkcard tap"
              onClick={() => runShortcut(shortcut)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "var(--surface-2)",
                  display: "grid", placeItems: "center",
                  color: "var(--accent-strong)",
                }}>
                  <V6Icon name={shortcut.icon} size={16} />
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 500, color: "var(--ink)", lineHeight: 1 }}>
                  {shortcut.count}
                </span>
              </div>
              <div className="wkcard-title">{shortcut.label}</div>
              <div className="wkcard-sub">{shortcut.sub}</div>
              <div style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: ".72rem", color: "var(--ink-3)" }}>
                {shortcut.audience}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DEFINITIVE panel */}
      <div className="wksec">
        <DefinitiveSurfacePanel
          surface="files"
          title="DEFINITIVE read for Files."
          compact
          onTalkToYulia={ask}
        />
      </div>

      {/* Recently touched + Current rooms */}
      <div className="wksec">
        <div className="wkgrid g2">
          {/* Recently touched */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
              <div>
                <div className="wksec-title" style={{ marginBottom: 2 }}>Recently touched</div>
                <p style={{ margin: 0, color: "var(--ink-2)", fontSize: ".84rem" }}>Last files Yulia or you touched, plus anything waiting on you.</p>
              </div>
              <button
                className="wkbtn"
                type="button"
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                onClick={() => openTab({ id: "files-all", kind: "files-list", title: "All files", fileListView: "all" })}
              >
                See all
              </button>
            </div>
            <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
              {workspace.loading && (
                <div style={{ padding: 14 }}><YuliaSkeleton rows={3} label="Loading files…" /></div>
              )}
              {workspace.error && (
                <div style={{ margin: 12, padding: "9px 11px", borderRadius: 10, background: "#FBE7DD", color: "#B0461F", fontSize: 12 }}>
                  Couldn&rsquo;t load workspace files ({workspace.error}).
                </div>
              )}
              {!workspace.loading && recents.length === 0 && (
                <EmptyRows
                  title="No recent files yet"
                  text="Generated docs, analyses, uploads, and data-room artifacts will appear here once this account has workspace data."
                  action="Ask Yulia to start"
                  onClick={() => ask("Help me create or import the first file for this workspace.")}
                />
              )}
              {recents.map((row, index) => (
                <FileListRow key={`${row.id ?? row.title}-${index}`} row={row} last={index === recents.length - 1} onClick={() => openDoc(row)} />
              ))}
            </div>
          </div>

          {/* Current rooms */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <div className="wksec-title" style={{ marginBottom: 2 }}>Current rooms</div>
              <p style={{ margin: 0, color: "var(--ink-2)", fontSize: ".84rem" }}>Shared diligence drives by deal. Open a deal to see what is private versus in the room.</p>
            </div>
            <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
              {!workspace.loading && rooms.length === 0 && (
                <EmptyRows
                  title="No deal libraries yet"
                  text="When you add a deal, its private library and data-room boundary will show up here."
                  action="Create with Yulia"
                  onClick={() => ask("Help me create my first deal library.")}
                />
              )}
              {rooms.map((room, index) => (
                <button
                  key={`${room.id}-${room.deal}`}
                  type="button"
                  style={{
                    all: "unset",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 18px",
                    borderBottom: index === rooms.length - 1 ? "none" : "1px solid var(--line)",
                    cursor: "pointer",
                  }}
                  onClick={() => openDeal(room, "data-room")}
                >
                  <span style={{
                    flex: "none",
                    width: 34, height: 34, borderRadius: 9,
                    background: "var(--surface-2)",
                    display: "grid", placeItems: "center",
                    color: "var(--ink-2)",
                  }}>
                    <V6Icon name="deal" size={18} />
                  </span>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <strong style={{ color: "var(--ink)", fontWeight: 600, fontSize: ".9rem" }}>{room.deal}</strong>
                    <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>{room.meta}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                    <strong style={{ color: "var(--ink)", fontWeight: 500, fontSize: ".84rem" }}>{room.stage}</strong>
                    <span className="muted">{room.count}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Source control + Work queue */}
      <div className="wksec">
        <div className="wkgrid g2">
          {/* Source control */}
          <div className="wkcard">
            <div className="wkcard-title" style={{ fontSize: "1.15rem", marginBottom: 4 }}>Source control for deal work.</div>
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              {FILE_CONTROL_STACK.map(item => (
                <button
                  key={item.title}
                  type="button"
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "13px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--surface-2)",
                    cursor: "pointer",
                    transition: "border-color .15s, background .15s",
                  }}
                  onClick={() => ask(`Explain file source control: ${item.title}. ${item.sub}`)}
                >
                  <strong style={{ color: "var(--ink)", fontWeight: 600, fontSize: ".9rem" }}>{item.title}</strong>
                  <span style={{ color: "var(--ink-2)", fontSize: ".82rem", lineHeight: 1.45 }}>{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Work queue */}
          <div id="files-work-queue">
            <div style={{ marginBottom: 14 }}>
              <div className="wksec-title" style={{ marginBottom: 2 }}>Data-room work queue</div>
              <p style={{ margin: 0, color: "var(--ink-2)", fontSize: ".84rem" }}>Requests, reviews, execution items, and failed generations waiting for a decision.</p>
            </div>
            <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
              {operating.loading && (
                <div style={{ padding: 14 }}><YuliaSkeleton rows={2} label="Yulia is reading the queue…" /></div>
              )}
              {operating.error && (
                <div style={{ margin: 12, padding: "9px 11px", borderRadius: 10, background: "#FBE7DD", color: "#B0461F", fontSize: 12 }}>
                  Couldn&rsquo;t load Today queue ({operating.error}).
                </div>
              )}
              {!workspace.loading && !operating.loading && actions.length === 0 && (
                <EmptyRows
                  title="Nothing needs action"
                  text="Requests, reviews, execution items, and failed generations will appear here when they exist."
                  action="Ask Yulia"
                  onClick={() => ask("What should I work on next in my files?")}
                />
              )}
              {actions.map((row, index) => (
                <FileListRow key={`${row.id ?? row.title}-${index}`} row={row} last={index === actions.length - 1} onClick={() => openDoc(row)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tabfoot">
        <span>{recents.length} recent · {rooms.length} rooms · {actions.length} queued</span>
        <span>Files surface</span>
      </div>
    </div>
  );
}

export function V6FilesListView({
  view,
  openTab,
  onTalkToYulia,
  user,
}: {
  view: FileListView;
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}) {
  const { workspace, operating, allFiles, rooms, actions } = useFilesWorkspace(user);
  const copy = activeListCopy(view);
  const listLoading = workspace.loading || (view === "needs-action" && operating.loading);
  const listError = workspace.error || (view === "needs-action" ? operating.error : null);

  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const openDoc = (row: FileRow) => {
    if (row.modelRefreshPrompt) {
      ask(row.modelRefreshPrompt);
      return;
    }
    if (row.definitivePacketRowId) {
      openDefinitivePacket(row, openTab);
      return;
    }
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

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* Page header — flat, no texture/gradient */}
      <div className="pg-head">
        <div>
          <div className="pg-title">{copy.title}</div>
          <p className="pg-sub">{copy.sub}</p>
        </div>
        <div className="pg-actions">
          <button className="wkbtn primary" type="button" onClick={() => ask(copy.prompt)}>
            Ask Yulia
          </button>
        </div>
      </div>

      <ActiveFilesList
        activeList={view}
        allFiles={allFiles}
        rooms={rooms}
        actions={actions}
        loading={listLoading}
        error={listError}
        openDoc={openDoc}
        openDeal={openDeal}
        ask={ask}
      />
    </div>
  );
}

function EmptyRows({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 9,
      padding: "18px 18px 20px",
      color: "var(--ink-2)",
      fontSize: ".85rem",
      lineHeight: 1.45,
    }}>
      <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{title}</strong>
      <span>{text}</span>
      <button className="wkbtn" type="button" onClick={onClick}>{action}</button>
    </div>
  );
}

function ActiveFilesList({
  activeList,
  allFiles,
  rooms,
  actions,
  loading,
  error,
  openDoc,
  openDeal,
  ask,
}: {
  activeList: FileListView;
  allFiles: FileRow[];
  rooms: RoomRow[];
  actions: FileRow[];
  loading: boolean;
  error: string | null;
  openDoc: (row: FileRow) => void;
  openDeal: (room: RoomRow, scope?: FileScope) => void;
  ask: (prompt: string) => void;
}) {
  const copy = activeListCopy(activeList);
  const rows = activeList === "needs-action" ? actions : allFiles;
  const groups = groupFileRows(rows);
  const showRooms = activeList === "deal-libraries" || activeList === "data-rooms";
  const roomScope: FileScope = activeList === "data-rooms" ? "data-room" : "all";

  return (
    <div className="wksec">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div>
          <div className="wksec-title" style={{ marginBottom: 2 }}>{copy.title}</div>
          <p style={{ margin: 0, color: "var(--ink-2)", fontSize: ".84rem" }}>{copy.sub}</p>
        </div>
        <button className="wkbtn" type="button" onClick={() => ask(copy.prompt)}>
          Ask Yulia
        </button>
      </div>

      {loading && (
        <div className="muted" style={{ padding: "14px 0", letterSpacing: ".08em" }}>LOADING REAL FILES…</div>
      )}
      {error && (
        <div style={{ marginBottom: 12, padding: "9px 11px", borderRadius: 10, background: "#FBE7DD", color: "#B0461F", fontSize: 12 }}>
          Couldn&rsquo;t load workspace files ({error}).
        </div>
      )}

      {!loading && showRooms && rooms.length === 0 && (
        <EmptyRows
          title="No deal libraries yet"
          text="When you add a deal, its private library and data-room boundary will show up here."
          action="Create with Yulia"
          onClick={() => ask("Help me create my first deal library.")}
        />
      )}

      {!loading && !showRooms && rows.length === 0 && (
        <EmptyRows
          title={activeList === "needs-action" ? "Nothing needs action" : "No files yet"}
          text={activeList === "needs-action"
            ? "Requests, reviews, execution items, and failed generations will appear here when they exist."
            : "Generated docs, analyses, uploads, and data-room artifacts will appear here once this account has workspace data."}
          action="Ask Yulia"
          onClick={() => ask(copy.prompt)}
        />
      )}

      {showRooms && rooms.length > 0 && (
        <>
          <table className="wktable">
            <thead><tr>
              <th>Deal</th>
              <th>Details</th>
              <th>Stage</th>
              <th className="r">Items</th>
              <th className="r">Action</th>
            </tr></thead>
            <tbody>
              {rooms.map(room => (
                <tr key={`${activeList}-${room.id}-${room.deal}`} onClick={() => openDeal(room, roomScope)}>
                  <td>
                    <div className="cellname">
                      <span className="logo"><V6Icon name={activeList === "data-rooms" ? "library" : "deal"} size={16} /></span>
                      <div><div className="nm">{room.deal}</div></div>
                    </div>
                  </td>
                  <td><span className="muted">{room.meta}</span></td>
                  <td>
                    <span className={`statpill ${roomStagePill(room.stage)}`}>
                      <span className="d" />{room.stage}
                    </span>
                  </td>
                  <td className="r amt">{room.count}</td>
                  <td className="r">
                    <button
                      type="button"
                      className="reviewbtn"
                      onClick={e => { e.stopPropagation(); openDeal(room, roomScope); }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tabfoot">
            <span>{rooms.length} {rooms.length === 1 ? "room" : "rooms"}</span>
            <span>{activeList === "data-rooms" ? "Shared diligence" : "Deal libraries"}</span>
          </div>
        </>
      )}

      {!showRooms && groups.length > 0 && groups.map((group, groupIndex) => (
        <div key={`${activeList}-${group.deal}`} style={{ marginTop: groupIndex > 0 ? 22 : 0 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "6px 0 10px",
            color: "var(--ink-3)",
            fontSize: ".78rem",
            fontWeight: 600,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            borderBottom: "1px solid var(--line)",
            marginBottom: 0,
          }}>
            <strong style={{ fontWeight: 600, color: "var(--ink-2)" }}>{group.deal}</strong>
            <span style={{ fontFamily: "var(--font-mono)" }}>{group.rows.length} {group.rows.length === 1 ? "file" : "files"}</span>
          </div>
          <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
            {group.rows.map((row, index) => (
              <FileListRow
                key={`${activeList}-${group.deal}-${row.id ?? row.title}-${index}`}
                row={row}
                last={index === group.rows.length - 1}
                onClick={() => openDoc(row)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupFileRows(rows: FileRow[]): Array<{ deal: string; rows: FileRow[] }> {
  const byDeal = new Map<string, FileRow[]>();
  rows.forEach(row => {
    const deal = fileDealName(row);
    byDeal.set(deal, [...(byDeal.get(deal) ?? []), row]);
  });
  return Array.from(byDeal, ([deal, groupedRows]) => ({ deal, rows: groupedRows }));
}

function fileDealName(row: FileRow): string {
  if (row.dealTitle) return row.dealTitle;
  const [deal] = row.sub.split("·");
  return deal.trim() || "Workspace";
}

function fileTabTitle(row: FileRow): string {
  const deal = fileDealName(row);
  if (!deal || deal === "Workspace" || row.title.startsWith(`${deal} · `)) return row.title;
  return `${deal} · ${row.title}`;
}

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
    ...(disclosureLabel
      ? [
          `- Disclosure readiness: ${disclosureLabel}`,
        ]
      : []),
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
    ...(artifacts.length
      ? artifacts.map(item => `- ${item}`)
      : ["- DealState", "- MCPCallHint[]"]),
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

function activeListCopy(view: FileListView) {
  const copy: Record<FileListView, { title: string; sub: string; prompt: string }> = {
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
  return copy[view];
}

function FileListRow({ row, last, onClick }: { row: FileRow; last: boolean; onClick: () => void }) {
  const pill = toneToPill(row.tone);
  return (
    <button
      type="button"
      style={{
        all: "unset",
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 18px",
        borderBottom: last ? "none" : "1px solid var(--line)",
        cursor: "pointer",
        transition: "background .12s",
      }}
      onClick={onClick}
    >
      <span style={{
        flex: "none",
        width: 34, height: 34, borderRadius: 9,
        background: "var(--surface-2)",
        display: "grid", placeItems: "center",
        color: "var(--ink-2)",
      }}>
        <V6Icon name={row.kind === "chart" ? "chart" : row.kind === "deal" ? "deal" : "doc"} size={18} />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong style={{ color: "var(--ink)", fontWeight: 600, fontSize: ".9rem" }}>{row.title}</strong>
        <span style={{ color: "var(--ink-3)", fontSize: ".78rem" }}>{row.sub}</span>
        {row.definitivePacketType && (
          <span style={{
            marginTop: 3,
            width: "fit-content",
            maxWidth: "100%",
            padding: "3px 7px",
            borderRadius: 999,
            background: "var(--accent-soft)",
            color: "var(--accent-strong)",
            fontFamily: "var(--font-mono)",
            fontSize: "10.5px",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {row.definitivePacketType}
            {row.definitiveDisclosureStatus ? ` · ${disclosureStatusLabel(row.definitiveDisclosureStatus, row.definitiveSourceGaps?.length ?? 0)}` : ""}
            {row.definitiveNextSuggestedCalls?.[0] ? ` · next ${row.definitiveNextSuggestedCalls[0].label}` : ""}
          </span>
        )}
      </span>
      <span className={`statpill ${pill.cls}`}>
        <span className="d" />{row.status}
      </span>
    </button>
  );
}

function toneToPill(name: FileRow["tone"]): { cls: string } {
  const map: Record<FileRow["tone"], string> = {
    draft: "review",
    review: "diligence",
    locked: "missing",
    done: "good",
  };
  return { cls: map[name] };
}

function roomStagePill(stage: string): string {
  const s = stage.toLowerCase();
  if (s.includes("active") || s.includes("ready")) return "good";
  if (s.includes("action")) return "review";
  if (s.includes("attorney") || s.includes("review")) return "diligence";
  return "missing";
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function labelFromSlug(input: string): string {
  return input
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function disclosureStatusLabel(status: FileRow["definitiveDisclosureStatus"], gapCount: number): string {
  if (status === "blocked_by_source_gaps") return `${gapCount || "source"} gap${gapCount === 1 ? "" : "s"} block disclosure`;
  if (status === "source_gaps_open") return `${gapCount || "source"} gap${gapCount === 1 ? "" : "s"} open`;
  if (status === "data_room_index_ready") return "data room index ready";
  if (status === "ready_for_user_controlled_disclosure") return "ready for user-controlled disclosure";
  return "";
}

function buildRealShortcuts(deals: WorkspaceDeal[], deliverables: WorkspaceDeliverable[], operatingFiles: TodayFileReviewItem[] = []): Shortcut[] {
  const docCount = deals.reduce((sum, deal) => sum + Number(deal.document_count ?? 0), 0);
  const actionCount = operatingFiles.length || deliverables.filter(d => ["queued", "generating", "failed", "draft"].includes(d.status)).length;
  const dataRooms = deals.filter(deal => Number(deal.document_count ?? 0) > 0).length || deals.length;
  return [
    { ...SHORTCUTS[0], count: String(deliverables.length + docCount) },
    { ...SHORTCUTS[1], count: String(deals.length) },
    { ...SHORTCUTS[2], count: String(actionCount) },
    { ...SHORTCUTS[3], count: String(dataRooms) },
  ];
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

function todayFileTone(item: TodayFileReviewItem): FileRow["tone"] {
  if (/executed|done|complete/i.test(item.status)) return "done";
  if (/locked|immutable/i.test(item.status)) return "locked";
  if (item.tone === "gold" || /refresh|queued|generating|draft/i.test(item.status)) return "draft";
  if (item.tone === "cactus") return "done";
  if (item.tone === "charcoal") return "locked";
  return "review";
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
    analysisRunId: d.analysis_run_id ?? null,
    analysisType: d.analysis_type ?? null,
    analysisStatus: d.analysis_status ?? null,
  };
}

function dealToRoomRow(deal: WorkspaceDeal): RoomRow {
  const docs = Number(deal.document_count ?? 0);
  const deliverables = Number(deal.deliverable_count ?? 0);
  return {
    deal: deal.business_name || deal.industry || `Deal #${deal.id}`,
    meta: `${formatJourney(deal.journey_type)} · ${deal.location || deal.industry || deal.current_gate}`,
    stage: docs > 0 ? "Data room active" : "Library ready",
    count: `${docs + deliverables} items`,
    id: String(deal.id),
  };
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
