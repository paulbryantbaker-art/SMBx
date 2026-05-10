import { useMemo, useRef, useState, type CSSProperties } from "react";
import { V6Icon } from "../icons";
import type { FileScope, OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { DESKTOP_TEXTURES } from "../../../lib/randomTextures";

interface FilesRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

interface Shortcut {
  view: FileListView;
  label: string;
  count: string;
  sub: string;
  icon: "library" | "deal" | "doc" | "chart";
  tone: "all" | "deals" | "action" | "room";
  prompt: string;
}

type FileListView = "all" | "deal-libraries" | "needs-action" | "data-rooms";

interface FileRow {
  title: string;
  sub: string;
  status: string;
  kind: "doc" | "chart" | "deal";
  tone: "draft" | "review" | "locked" | "done";
  id?: string;
  dealId?: string;
  dealTitle?: string;
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
    sub: "Private deal docs, analysis, and data-room items across portfolios.",
    icon: "library",
    tone: "all",
    prompt: "Show all files across every portfolio, deal, stage, and data room.",
  },
  {
    view: "deal-libraries",
    label: "Deal libraries",
    count: "6",
    sub: "Portfolio > deal > stage. Private until you share.",
    icon: "deal",
    tone: "deals",
    prompt: "Open my deal libraries and group them by portfolio, deal, and stage.",
  },
  {
    view: "needs-action",
    label: "Needs action",
    count: "4",
    sub: "Drafts, requests, markups, and submissions waiting on you.",
    icon: "doc",
    tone: "action",
    prompt: "Show files that need action from me.",
  },
  {
    view: "data-rooms",
    label: "Data rooms",
    count: "9",
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

export function V6FilesRoot({ openTab, onTalkToYulia, user }: FilesRootProps) {
  const workspace = useV6WorkspaceData(user);
  const listRef = useRef<HTMLElement | null>(null);
  const [activeList, setActiveList] = useState<FileListView>("all");
  const useSampleData = !workspace.canFetch;
  const shortcuts = useMemo(
    () => useSampleData ? SHORTCUTS : buildRealShortcuts(workspace.deals, workspace.deliverables),
    [useSampleData, workspace.deals, workspace.deliverables],
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
      const queue = workspace.deliverables
        .filter(d => ["queued", "generating", "failed", "draft"].includes(d.status))
        .slice(0, 5)
        .map(deliverableToFileRow);
      return queue;
    },
    [useSampleData, workspace.deliverables],
  );

  const ask = (prompt: string) => {
    onTalkToYulia?.(prompt);
  };

  const openDoc = (row: FileRow) => {
    if (row.kind === "deal" && row.dealId) {
      openTab({ kind: "deal", title: row.dealTitle ?? row.title, id: row.dealId });
      return;
    }
    openTab({ kind: "doc", title: row.title, id: row.id ?? `file-${slug(row.title)}` });
  };

  const openDeal = (room: RoomRow, fileScope: FileScope = "all") => {
    openTab({ kind: "deal", title: room.deal, id: room.id, fileScope });
  };

  const runShortcut = (shortcut: Shortcut) => {
    setActiveList(shortcut.view);
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="m-fade-up" style={F.page}>
      <section style={F.hero}>
        <div style={F.heroCopy}>
          <div className="mono" style={F.eyebrow}>FILES</div>
          <h1 style={F.title}>Private deal libraries, plus shared data rooms.</h1>
          <p style={F.sub}>
            Every deal has its own file library. The data room is the shared diligence drive inside that library, with artifacts, drafted legal docs, review items, and executed docs.
          </p>
        </div>

        <div style={F.boundaryCard}>
          <div style={F.boundaryItem}>
            <div className="mono" style={F.boundaryEyebrow}>BOUNDARY</div>
            <strong style={F.boundaryTitle}>Private by default</strong>
            <span style={F.boundaryText}>Your memos, analyses, drafts, and internal files stay in the deal library until you choose to share.</span>
          </div>
          <div style={F.boundaryItem}>
            <div className="mono" style={F.boundaryEyebrow}>SHARED SPACE</div>
            <strong style={F.boundaryTitle}>Data room</strong>
            <span style={F.boundaryText}>Artifacts and transaction documents visible to approved participants on the deal team.</span>
          </div>
        </div>
      </section>

      <section style={F.section}>
        <SectionHead eyebrow="OPEN FILES" title="Browse by hierarchy" sub="Portfolio > deal > stage for all files. Data rooms add artifact, action, review, and executed status." />
        <div style={F.shortcutGrid}>
          {shortcuts.map(shortcut => {
            const s = shortcutTone(shortcut.tone);
            return (
            <button
              key={shortcut.label}
              type="button"
              style={{
                ...F.shortcutCard,
                ...(activeList === shortcut.view ? F.shortcutCardActive : {}),
                backgroundImage: s.bg,
                borderColor: activeList === shortcut.view ? s.iconColor : s.border,
                boxShadow: activeList === shortcut.view ? `${s.shadow}, 0 0 0 2px ${s.iconBg}` : s.shadow,
              }}
              onClick={() => runShortcut(shortcut)}
            >
              <span style={{ ...F.shortcutIcon, background: s.iconBg, color: s.iconColor }}><V6Icon name={shortcut.icon} size={17} /></span>
              <span style={{ ...F.shortcutCount, background: s.countBg, color: s.countColor }}>{shortcut.count}</span>
              <strong style={F.shortcutTitle}>{shortcut.label}</strong>
              <span style={F.shortcutSub}>{shortcut.sub}</span>
            </button>
            );
          })}
        </div>
      </section>

      <section ref={listRef} style={F.section}>
        <ActiveFilesList
          activeList={activeList}
          allFiles={allFiles}
          rooms={rooms}
          actions={actions}
          loading={workspace.loading}
          error={workspace.error}
          openDoc={openDoc}
          openDeal={openDeal}
          ask={ask}
        />
      </section>

      <section style={F.grid}>
        <div style={F.card}>
          <div style={F.cardHead}>
            <div>
              <div className="mono" style={F.cardEyebrow}>RECENTS</div>
              <h2 style={F.cardTitle}>Recently touched</h2>
              <p style={F.cardSub}>Last files Yulia or you touched, plus anything waiting on you.</p>
            </div>
            <button className="m-btn text" type="button" onClick={() => ask("Show every recent file across my deal libraries.")}>See all</button>
          </div>
          <div style={F.rows}>
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
              <div className="mono" style={F.cardEyebrow}>DATA ROOMS</div>
              <h2 style={F.cardTitle}>Current rooms</h2>
              <p style={F.cardSub}>Shared diligence drives by deal. Open a deal to see what is private versus in the room.</p>
            </div>
          </div>
          <div style={F.rows}>
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
                <span style={F.chevron} aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="files-work-queue" style={F.section}>
        <SectionHead eyebrow="NEEDS ACTION" title="Data-room work queue" sub="Things in the shared room can be submitted, reviewed, executed, or locked. Artifacts remain review-only." />
        <div style={F.actionCard}>
          {!workspace.loading && actions.length === 0 && (
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
      </section>
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
  const showRooms = activeList === "deal-libraries" || activeList === "data-rooms";
  const roomScope: FileScope = activeList === "data-rooms" ? "data-room" : "all";

  return (
    <div style={F.activeListCard}>
      <div style={F.activeListHead}>
        <div>
          <div className="mono" style={F.cardEyebrow}>{copy.eyebrow}</div>
          <h2 style={F.cardTitle}>{copy.title}</h2>
          <p style={F.cardSub}>{copy.sub}</p>
        </div>
        <button className="m-btn tonal" type="button" onClick={() => ask(copy.prompt)}>
          Ask Yulia
        </button>
      </div>

      <div style={F.rows}>
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
            <span style={F.chevron} aria-hidden="true">›</span>
          </button>
        ))}

        {!showRooms && rows.map((row, index) => (
          <FileListRow key={`${activeList}-${row.id ?? row.title}-${index}`} row={row} last={index === rows.length - 1} onClick={() => openDoc(row)} />
        ))}
      </div>
    </div>
  );
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
      <span style={F.chevron} aria-hidden="true">›</span>
    </button>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={F.sectionHead}>
      <div className="mono" style={F.sectionEyebrow}>{eyebrow}</div>
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

function shortcutTone(name: Shortcut["tone"]) {
  const tones: Record<Shortcut["tone"], {
    bg: string;
    border: string;
    shadow: string;
    iconBg: string;
    iconColor: string;
    countBg: string;
    countColor: string;
  }> = {
    all: {
      bg: `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(234,241,250,0.72) 100%), url('${DESKTOP_TEXTURES.filesAll}')`,
      border: "rgba(106, 155, 204, 0.24)",
      shadow: "0 18px 42px rgba(78, 113, 152, 0.14), 0 2px 8px rgba(26,34,51,0.05)",
      iconBg: "rgba(106, 155, 204, 0.15)",
      iconColor: "#3E6F9E",
      countBg: "rgba(106, 155, 204, 0.13)",
      countColor: "#3E6F9E",
    },
    deals: {
      bg: `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(231,244,237,0.72) 100%), url('${DESKTOP_TEXTURES.filesDeals}')`,
      border: "rgba(98, 153, 135, 0.24)",
      shadow: "0 18px 42px rgba(63, 125, 100, 0.13), 0 2px 8px rgba(26,34,51,0.05)",
      iconBg: "rgba(98, 153, 135, 0.16)",
      iconColor: "#3F7D64",
      countBg: "rgba(98, 153, 135, 0.14)",
      countColor: "#3F7D64",
    },
    action: {
      bg: `linear-gradient(145deg, rgba(255,255,255,0.86) 0%, rgba(251,241,218,0.74) 100%), url('${DESKTOP_TEXTURES.filesAction}')`,
      border: "rgba(156, 113, 40, 0.22)",
      shadow: "0 18px 42px rgba(156, 113, 40, 0.12), 0 2px 8px rgba(26,34,51,0.05)",
      iconBg: "rgba(214, 163, 92, 0.18)",
      iconColor: "#9C7128",
      countBg: "rgba(214, 163, 92, 0.16)",
      countColor: "#9C7128",
    },
    room: {
      bg: `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(239,237,248,0.72) 100%), url('${DESKTOP_TEXTURES.filesRoom}')`,
      border: "rgba(130, 125, 189, 0.25)",
      shadow: "0 18px 42px rgba(101, 95, 167, 0.13), 0 2px 8px rgba(26,34,51,0.05)",
      iconBg: "rgba(130, 125, 189, 0.16)",
      iconColor: "#655FA7",
      countBg: "rgba(130, 125, 189, 0.15)",
      countColor: "#655FA7",
    },
  };
  return tones[name];
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildRealShortcuts(deals: WorkspaceDeal[], deliverables: WorkspaceDeliverable[]): Shortcut[] {
  const docCount = deals.reduce((sum, deal) => sum + Number(deal.document_count ?? 0), 0);
  const actionCount = deliverables.filter(d => ["queued", "generating", "failed", "draft"].includes(d.status)).length;
  const dataRooms = deals.filter(deal => Number(deal.document_count ?? 0) > 0).length || deals.length;
  return [
    { ...SHORTCUTS[0], count: String(deliverables.length + docCount) },
    { ...SHORTCUTS[1], count: String(deals.length) },
    { ...SHORTCUTS[2], count: String(actionCount) },
    { ...SHORTCUTS[3], count: String(dataRooms) },
  ];
}

function deliverableToFileRow(d: WorkspaceDeliverable): FileRow {
  const isAnalysis = /model|valuation|analysis|recast|sba|comp|score|risk|tax|financial/i.test(d.slug || d.name);
  return {
    title: d.name || formatSlug(d.slug),
    sub: `${d.deal_name || "Deal"} · ${formatStatus(d.status)} · ${fmtRelative(d.completed_at || d.created_at)}`,
    status: d.status === "complete" ? "Open" : formatStatus(d.status),
    kind: isAnalysis ? "chart" : "doc",
    tone: d.status === "complete" ? "review" : d.status === "failed" ? "locked" : "draft",
    id: String(d.id),
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

const filesHeroWash = `linear-gradient(135deg, rgba(14,27,50,0.54) 0%, rgba(45,86,143,0.36) 52%, rgba(137,184,205,0.20) 100%), url('${DESKTOP_TEXTURES.filesHero}')`;
const filesCardWash = `linear-gradient(135deg, rgba(255,255,255,0.94), rgba(246,249,253,0.82)), url('${DESKTOP_TEXTURES.filesAll}')`;

const F: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.48fr)",
    gap: 20,
    alignItems: "stretch",
    minHeight: 320,
    padding: 30,
    borderRadius: 26,
    backgroundImage: filesHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 28px 70px rgba(23,38,63,0.20), var(--m-elev-2)",
    marginBottom: 34,
  },
  heroCopy: {
    alignSelf: "end",
    maxWidth: 850,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "rgba(255,255,255,0.78)",
  },
  title: {
    margin: "8px 0 0",
    maxWidth: 880,
    fontSize: "clamp(44px, 5vw, 72px)",
    lineHeight: 0.92,
    letterSpacing: "-0.06em",
    textWrap: "balance",
    color: "#FFFDF7",
  },
  sub: {
    margin: "16px 0 0",
    maxWidth: 760,
    fontSize: 16,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.78)",
  },
  boundaryCard: {
    display: "grid",
    gap: 12,
    alignContent: "end",
  },
  boundaryItem: {
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.20)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 12px 28px rgba(23,38,63,0.10)",
  },
  boundaryEyebrow: {
    fontSize: 9,
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.72)",
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
    color: "rgba(255,255,255,0.76)",
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
    margin: "4px 0 0",
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 14,
  },
  shortcutCard: {
    all: "unset",
    minHeight: 178,
    borderRadius: 22,
    padding: 20,
    backgroundImage: filesCardWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
    display: "grid",
    gridTemplateRows: "auto auto 1fr auto",
    gap: 7,
    cursor: "pointer",
    color: "var(--m-on-surface-var)",
  },
  shortcutCardActive: {
    transform: "translateY(-2px)",
  },
  shortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.07)",
  },
  shortcutCount: {
    justifySelf: "end",
    marginTop: -44,
    borderRadius: 999,
    padding: "5px 10px",
    background: "var(--m-surface-2)",
    color: "var(--m-on-surface-var)",
    fontWeight: 850,
  },
  shortcutTitle: {
    alignSelf: "end",
    color: "var(--m-on-surface)",
    fontSize: 20,
    lineHeight: 1,
    letterSpacing: "-0.035em",
  },
  shortcutSub: {
    color: "var(--m-on-surface-var)",
    fontSize: 13,
    lineHeight: 1.42,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(360px, 0.9fr) minmax(480px, 1.1fr)",
    gap: 18,
    alignItems: "start",
    marginBottom: 34,
  },
  card: {
    borderRadius: 26,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
    overflow: "hidden",
  },
  cardHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "24px 24px 10px",
  },
  cardEyebrow: {
    fontSize: 10,
    letterSpacing: "0.16em",
    fontWeight: 800,
    color: "var(--m-on-primary-container)",
  },
  cardTitle: {
    margin: "4px 0 0",
    fontSize: 29,
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
    padding: "0 18px 12px",
  },
  activeListCard: {
    borderRadius: 26,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
    overflow: "hidden",
  },
  activeListHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "24px 24px 10px",
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
    width: "100%",
    minHeight: 74,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "46px minmax(0, 1fr) auto 18px",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    cursor: "pointer",
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.06)",
  },
  fileText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
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
    width: "100%",
    minHeight: 82,
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "46px minmax(0, 1fr) auto 18px",
    alignItems: "center",
    gap: 12,
    padding: "13px 0",
    cursor: "pointer",
  },
  roomIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    background: "var(--m-primary-container)",
    color: "var(--m-on-primary-container)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60), 0 10px 18px rgba(26,34,51,0.06)",
  },
  roomText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
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
  actionCard: {
    borderRadius: 26,
    background: "#FFFFFF",
    border: "1px solid var(--m-outline-var)",
    boxShadow: "var(--m-elev-2)",
    padding: "4px 18px",
  },
};
