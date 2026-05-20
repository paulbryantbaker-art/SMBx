import { useMemo, type CSSProperties } from "react";
import { V6Icon } from "../icons";
import type { FileListView, FileScope, OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useTodayOperatingBrief, type TodayFileReviewItem } from "../../../hooks/useTodayOperatingBrief";
import { useV6WorkspaceData, type WorkspaceDeal, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { DESKTOP_TEXTURES, STUDIO_TEXTURES } from "../../../lib/randomTextures";
import {
  studioCompeteButtonItemStyles,
  studioCompeteCardStyles,
  studioGlassBackdrop,
  studioListCardStyles,
  studioLiquidGlassFilter,
  studioLiquidGlassShadow,
  studioTextureCardBackground,
  studioTextureCardStyles,
} from "../styles/studioSurfaces";

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
    <div className="m-fade-up m-page-flow" style={F.page}>
      <section style={F.hero}>
        <div style={F.heroCopy}>
          <h1 style={F.title}>Private deal libraries, plus shared data rooms.</h1>
          <p style={F.sub}>
            Every deal has its own file library. The data room is the shared diligence drive inside that library, with artifacts, drafted legal docs, review items, and executed docs.
          </p>
        </div>
      </section>

      <section style={F.section}>
        <SectionHead title="Source lanes" sub="Portfolio > deal > stage for all files. Data rooms add artifact, action, review, and executed status." />
        <div className="m-flow-grid" style={F.shortcutGrid}>
          {shortcuts.map(shortcut => {
            return (
            <button
              key={shortcut.label}
              type="button"
              className="m-nudge-soft"
              style={{ ...F.shortcutCard, backgroundImage: studioTextureCardBackground(shortcutTexture(shortcut.tone)) }}
              onClick={() => runShortcut(shortcut)}
            >
              <span style={F.shortcutMeta}>{shortcut.count} {shortcut.unit}</span>
              <strong style={F.shortcutTitle}>{shortcut.label}</strong>
              <span style={F.shortcutAudience}>{shortcut.audience}</span>
              <span style={F.shortcutSub}>{shortcut.sub}</span>
              <span style={F.shortcutAction}>Open</span>
            </button>
            );
          })}
        </div>
      </section>

      <section className="m-flow-grid" style={F.grid}>
        <div style={F.card}>
          <div style={F.cardHead}>
            <div>
              <h2 style={F.cardTitle}>Recently touched</h2>
              <p style={F.cardSub}>Last files Yulia or you touched, plus anything waiting on you.</p>
            </div>
            <button
              style={F.cardAction}
              type="button"
              onClick={() => openTab({ id: "files-all", kind: "files-list", title: "All files", fileListView: "all" })}
            >
              See all
            </button>
          </div>
          <div className="m-flow-grid" style={F.rows}>
            {workspace.loading && <div className="mono" style={F.loading}>LOADING REAL FILES…</div>}
            {workspace.error && <div style={F.inlineError}>Couldn&rsquo;t load workspace files ({workspace.error}).</div>}
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

        <div style={F.card}>
          <div style={F.cardHead}>
            <div>
              <h2 style={F.cardTitle}>Current rooms</h2>
              <p style={F.cardSub}>Shared diligence drives by deal. Open a deal to see what is private versus in the room.</p>
            </div>
          </div>
          <div className="m-flow-grid" style={F.rows}>
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
                style={{ ...F.roomRow, borderBottom: index === rooms.length - 1 ? "none" : "1px solid var(--m-outline-var)" }}
                onClick={() => openDeal(room, "data-room")}
              >
                <span style={F.roomIcon}><V6Icon name="deal" size={18} /></span>
                <span style={F.roomText}>
                  <strong>{room.deal}</strong>
                  <span>{room.meta}</span>
                </span>
                <span style={F.roomMeta}>
                  <strong>{room.stage}</strong>
                  <span>{room.count}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={F.lowerGrid}>
        <div style={F.controlCard}>
          <h2 style={F.controlTitle}>Source control for deal work.</h2>
          <div style={F.controlGrid}>
            {FILE_CONTROL_STACK.map(item => (
              <button
                key={item.title}
                type="button"
                className="m-nudge-soft"
                style={F.controlItem}
                onClick={() => ask(`Explain file source control: ${item.title}. ${item.sub}`)}
              >
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="files-work-queue" style={F.card}>
          <div style={F.cardHead}>
            <div>
              <h2 style={F.cardTitle}>Data-room work queue</h2>
              <p style={F.cardSub}>Requests, reviews, execution items, and failed generations waiting for a decision.</p>
            </div>
          </div>
          <div className="m-flow-grid" style={F.rows}>
            {operating.loading && <div className="mono" style={F.loading}>READING TODAY QUEUE…</div>}
            {operating.error && <div style={F.inlineError}>Couldn&rsquo;t load Today queue ({operating.error}).</div>}
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
      </section>
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
  const s = detailTone(view);
  const listLoading = workspace.loading || (view === "needs-action" && operating.loading);
  const listError = workspace.error || (view === "needs-action" ? operating.error : null);

  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const openDoc = (row: FileRow) => {
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
    <div className="m-fade-up m-page-flow" style={F.detailPage}>
      <section style={{ ...F.detailHero, backgroundImage: s.bg }}>
        <div>
          <h1 style={F.detailTitle}>{copy.title}</h1>
          <p style={F.detailSub}>{copy.sub}</p>
        </div>
        <button className="m-btn tonal" type="button" onClick={() => ask(copy.prompt)}>
          Ask Yulia
        </button>
      </section>

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
    <div style={F.emptyRows}>
      <strong>{title}</strong>
      <span>{text}</span>
      <button className="m-btn tonal" type="button" onClick={onClick}>{action}</button>
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
    <div style={F.activeListCard}>
      <div style={F.activeListHead}>
        <div>
          <h2 style={F.cardTitle}>{copy.title}</h2>
          <p style={F.cardSub}>{copy.sub}</p>
        </div>
        <button className="m-btn tonal" type="button" onClick={() => ask(copy.prompt)}>
          Ask Yulia
        </button>
      </div>

      <div className="m-flow-grid" style={F.rows}>
        {loading && <div className="mono" style={F.loading}>LOADING REAL FILES…</div>}
        {error && <div style={F.inlineError}>Couldn&rsquo;t load workspace files ({error}).</div>}

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

        {showRooms && rooms.map((room, index) => (
          <button
            key={`${activeList}-${room.id}-${room.deal}`}
            type="button"
            style={{ ...F.roomRow, borderBottom: index === rooms.length - 1 ? "none" : "1px solid var(--m-outline-var)" }}
            onClick={() => openDeal(room, roomScope)}
          >
            <span style={F.roomIcon}><V6Icon name={activeList === "data-rooms" ? "library" : "deal"} size={18} /></span>
            <span style={F.roomText}>
              <strong>{room.deal}</strong>
              <span>{room.meta}</span>
            </span>
            <span style={F.roomMeta}>
              <strong>{activeList === "data-rooms" ? room.stage : "Open library"}</strong>
              <span>{room.count}</span>
            </span>
          </button>
        ))}

        {!showRooms && groups.map((group, groupIndex) => (
          <div key={`${activeList}-${group.deal}`} style={F.fileGroup}>
            <div style={F.fileGroupHead}>
              <strong>{group.deal}</strong>
              <span>{group.rows.length} {group.rows.length === 1 ? "file" : "files"}</span>
            </div>
            {group.rows.map((row, index) => (
              <FileListRow
                key={`${activeList}-${group.deal}-${row.id ?? row.title}-${index}`}
                row={row}
                last={index === group.rows.length - 1 && groupIndex === groups.length - 1}
                onClick={() => openDoc(row)}
              />
            ))}
          </div>
        ))}
      </div>
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

function activeListCopy(view: FileListView) {
  const copy: Record<FileListView, { eyebrow: string; title: string; sub: string; prompt: string }> = {
    all: {
      eyebrow: "ALL FILES",
      title: "Every file across deal libraries",
      sub: "Private docs, analyses, data-room artifacts, shared docs, and executed records across portfolios.",
      prompt: "Show every file across my portfolio, grouped by portfolio, deal, stage, and data room status.",
    },
    "deal-libraries": {
      eyebrow: "DEAL LIBRARIES",
      title: "Deal libraries",
      sub: "Each deal opens to its private workspace, analysis, drafts, shared docs, and data-room boundary.",
      prompt: "Show my deal libraries and summarize which one needs attention first.",
    },
    "needs-action": {
      eyebrow: "NEEDS ACTION",
      title: "Files needing action",
      sub: "Drafts, requests, reviews, failed generations, markups, and submissions waiting on you.",
      prompt: "Show files that need action from me and rank them by urgency.",
    },
    "data-rooms": {
      eyebrow: "DATA ROOMS",
      title: "Active data rooms",
      sub: "Shared diligence drives by deal, separate from private workspaces and analyses.",
      prompt: "Show active data rooms and separate artifacts, drafted docs, review items, and executed docs.",
    },
  };
  return copy[view];
}

function FileListRow({ row, last, onClick }: { row: FileRow; last: boolean; onClick: () => void }) {
  const t = tone(row.tone);
  return (
    <button
      type="button"
      style={{ ...F.fileRow, borderBottom: last ? "none" : "1px solid var(--m-outline-var)" }}
      onClick={onClick}
    >
      <span style={{ ...F.fileIcon, background: t.soft, color: t.ink }}>
        <V6Icon name={row.kind === "chart" ? "chart" : row.kind === "deal" ? "deal" : "doc"} size={18} />
      </span>
      <span style={F.fileText}>
        <strong>{row.title}</strong>
        <span>{row.sub}</span>
      </span>
      <span style={{ ...F.filePill, background: t.soft, color: t.ink }}>{row.status}</span>
    </button>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={F.sectionHead}>
      <h2 style={F.sectionTitle}>{title}</h2>
      <p style={F.sectionSub}>{sub}</p>
    </div>
  );
}

function tone(name: FileRow["tone"]) {
  const tones: Record<FileRow["tone"], { ink: string; soft: string }> = {
    draft: { ink: "#9C7128", soft: "#FAF1E1" },
    review: { ink: "#4F60BD", soft: "#EEF1FB" },
    locked: { ink: "#555E6F", soft: "#F0F2F8" },
    done: { ink: "#3F8A6A", soft: "#E3EFEA" },
  };
  return tones[name];
}

function shortcutTexture(name: Shortcut["tone"]) {
  const textures: Record<Shortcut["tone"], string> = {
    all: STUDIO_TEXTURES.navy,
    deals: STUDIO_TEXTURES.green,
    action: STUDIO_TEXTURES.rose,
    room: STUDIO_TEXTURES.blue,
  };
  return textures[name];
}

function detailTone(view: FileListView) {
  const map: Record<FileListView, { bg: string }> = {
    all: {
      bg: `linear-gradient(135deg, rgba(20,39,72,0.72), rgba(71,116,169,0.48) 56%, rgba(187,212,229,0.28)), url('${DESKTOP_TEXTURES.filesAll}')`,
    },
    "deal-libraries": {
      bg: `linear-gradient(135deg, rgba(23,74,58,0.70), rgba(73,137,108,0.48) 58%, rgba(199,224,211,0.30)), url('${DESKTOP_TEXTURES.filesDeals}')`,
    },
    "needs-action": {
      bg: `linear-gradient(135deg, rgba(114,74,18,0.70), rgba(198,145,64,0.48) 58%, rgba(249,226,173,0.30)), url('${DESKTOP_TEXTURES.filesAction}')`,
    },
    "data-rooms": {
      bg: `linear-gradient(135deg, rgba(58,52,123,0.72), rgba(111,103,177,0.50) 56%, rgba(218,214,241,0.30)), url('${DESKTOP_TEXTURES.filesRoom}')`,
    },
  };
  return map[view];
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
  return {
    title: item.title,
    sub: `${item.dealTitle || "Workspace"} · ${item.reason}`,
    status: formatStatus(item.status),
    kind: isAnalysis ? "chart" : "doc",
    tone: todayFileTone(item),
    id: item.id,
    dealId: item.dealId,
    dealTitle: item.dealTitle,
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

const filesHeroWash = `linear-gradient(135deg, rgba(13,36,62,0.68) 0%, rgba(42,96,128,0.48) 52%, rgba(18,74,79,0.62) 100%), url('${DESKTOP_TEXTURES.filesHero}')`;

const F: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  detailPage: {
    minHeight: "100%",
    width: "min(100%, 1440px)",
    maxWidth: 1440,
    margin: "0 auto",
    boxSizing: "border-box",
  },
  detailHero: {
    minHeight: 240,
    borderRadius: 24,
    padding: 30,
    marginBottom: 22,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 44px 110px rgba(23,38,63,0.29), 0 18px 42px rgba(26,34,51,0.15), 0 4px 12px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.22)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
  },
  detailEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
  },
  detailTitle: {
    margin: "8px 0 0",
    maxWidth: 780,
    fontSize: "clamp(42px, 4.2vw, 64px)",
    lineHeight: 0.94,
    letterSpacing: "-0.06em",
    color: "#FFFFFF",
    textWrap: "balance",
  },
  detailSub: {
    margin: "14px 0 0",
    maxWidth: 760,
    fontSize: 15,
    lineHeight: 1.5,
    color: "#FFFFFF",
  },
  hero: {
    display: "flex",
    alignItems: "flex-end",
    minHeight: 350,
    padding: 34,
    borderRadius: 24,
    backgroundImage: filesHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 46px 116px rgba(23,38,63,0.29), 0 20px 46px rgba(26,34,51,0.15), 0 4px 12px rgba(26,34,51,0.08), inset 0 1px 0 rgba(255,255,255,0.22)",
    marginBottom: 30,
    ...studioGlassBackdrop,
  },
  heroCopy: {
    maxWidth: 900,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "#FFFFFF",
  },
  title: {
    margin: 0,
    maxWidth: 880,
    fontSize: "clamp(44px, 5vw, 70px)",
    lineHeight: 0.94,
    letterSpacing: "-0.055em",
    textWrap: "balance",
    color: "#FFFFFF",
  },
  sub: {
    margin: "16px 0 0",
    maxWidth: 760,
    fontSize: 16,
    lineHeight: 1.55,
    color: "#FFFFFF",
  },
  boundaryCard: {
    display: "grid",
    gap: 12,
    alignContent: "end",
  },
  boundaryItem: {
    padding: 18,
    borderRadius: 20,
    background: "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.24), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))",
    border: "0.5px solid rgba(255,255,255,0.34)",
    boxShadow: "0 16px 34px -22px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.34)",
    backdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
    WebkitBackdropFilter: "blur(5px) saturate(155%) contrast(1.08) brightness(1.04)",
  },
  boundaryEyebrow: {
    fontSize: 9,
    letterSpacing: "0.14em",
    color: "#FFFFFF",
    fontWeight: 800,
  },
  boundaryTitle: {
    display: "block",
    marginTop: 7,
    color: "#FFFFFF",
    fontSize: 16,
    letterSpacing: "-0.02em",
  },
  boundaryText: {
    display: "block",
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 1.45,
  },
  section: {
    marginBottom: 34,
  },
  sectionHead: {
    marginBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  sectionSub: {
    margin: "8px 0 0",
    maxWidth: 780,
    fontSize: 14,
    color: "var(--m-on-surface-mid)",
  },
  shortcutGrid: {
    ...studioTextureCardStyles.grid,
  },
  shortcutCard: {
    ...studioTextureCardStyles.card,
    cursor: "pointer",
  },
  shortcutMeta: studioTextureCardStyles.meta,
  shortcutTitle: {
    ...studioTextureCardStyles.title,
  },
  shortcutAudience: {
    ...studioTextureCardStyles.audience,
  },
  shortcutSub: {
    ...studioTextureCardStyles.detail,
  },
  shortcutAction: {
    ...studioTextureCardStyles.action,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 0.9fr) minmax(480px, 1.1fr)",
    gap: 18,
    alignItems: "start",
    marginBottom: 34,
  },
  card: {
    ...studioListCardStyles.panel,
  },
  cardHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: 0,
    marginBottom: 16,
  },
  cardAction: {
    all: "unset",
    borderRadius: 999,
    padding: "8px 12px",
    background: "rgba(34, 47, 68, 0.86)",
    border: "0.5px solid rgba(255,255,255,0.28)",
    color: "#FFFFFF",
    boxShadow: studioLiquidGlassShadow,
    backdropFilter: studioLiquidGlassFilter,
    WebkitBackdropFilter: studioLiquidGlassFilter,
    fontSize: 12.5,
    fontWeight: 850,
    cursor: "pointer",
  },
  cardEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
    color: "var(--m-on-surface)",
  },
  cardSub: {
    margin: "8px 0 0",
    maxWidth: 600,
    fontSize: 13.5,
    lineHeight: 1.45,
    color: "var(--m-on-surface-mid)",
  },
  rows: {
    ...studioListCardStyles.stack,
    marginTop: 0,
    padding: 0,
  },
  activeListCard: {
    ...studioListCardStyles.panel,
  },
  activeListHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: 0,
    marginBottom: 16,
  },
  loading: {
    padding: "6px 0 10px",
    color: "var(--m-on-surface-mid)",
    fontSize: 10,
    letterSpacing: "0.12em",
  },
  inlineError: {
    margin: "4px 0 10px",
    padding: "9px 11px",
    borderRadius: 12,
    background: "var(--m-pass-container)",
    color: "#4A1410",
    fontSize: 12,
  },
  emptyRows: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 9,
    padding: "18px 4px 20px",
    color: "var(--m-on-surface-mid)",
    fontSize: 13,
    lineHeight: 1.45,
  },
  fileRow: {
    all: "unset",
    ...studioListCardStyles.row,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  fileIcon: {
    ...studioListCardStyles.icon,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.06)",
  },
  fileText: {
    ...studioListCardStyles.body,
    fontSize: 12.5,
    color: "var(--m-on-surface-mid)",
  },
  filePill: {
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 850,
    whiteSpace: "nowrap",
    fontSize: 12.5,
  },
  chevron: {
    color: "var(--m-on-surface-mid)",
    fontSize: 28,
    lineHeight: 1,
  },
  roomRow: {
    all: "unset",
    ...studioListCardStyles.row,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  roomIcon: {
    ...studioListCardStyles.icon,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.06)",
  },
  roomText: {
    ...studioListCardStyles.body,
    fontSize: 12.5,
    color: "var(--m-on-surface-mid)",
  },
  roomMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3,
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  fileGroup: {
    paddingTop: 10,
  },
  fileGroupHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0 4px",
    color: "var(--m-on-surface-mid)",
    fontSize: 12,
  },
  actionCard: {
    ...studioListCardStyles.panel,
  },
  lowerGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(min(520px, 100%), 1fr) minmax(min(420px, 100%), 1fr)",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 34,
  },
  controlCard: {
    ...studioCompeteCardStyles.panel,
  },
  controlTitle: {
    margin: 0,
    color: "#1A2233",
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },
  controlGrid: {
    ...studioCompeteCardStyles.grid,
  },
  controlItem: {
    ...studioCompeteButtonItemStyles,
  },
};
