import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Brain,
  BriefcaseBusiness,
  FolderKanban,
  FileCheck2,
  FileImage,
  FilePenLine,
  FilePlus2,
  FileSignature,
  FileSpreadsheet,
  FileText,
  ScrollText,
  UploadCloud,
  Loader2,
  ChevronRight,
  Link2,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  CalendarClock,
  Trash2,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { MobileIcon } from "../icons";
import { ChatStarterPill } from "../ChatStarterPill";
import { YIcon } from "../YIcon";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { authHeaders } from "../../../../hooks/useAuth";
import {
  useMobileDataRoom,
  type MobileDataRoomDocument,
  type MobileDataRoomGroup,
  type MobileDataRoomFolder,
  type MobileUnfiledDeliverable,
} from "../../../../hooks/useMobileDataRoom";
import {
  useMobileShareLinks,
  type MobileShareLink,
} from "../../../../hooks/useMobileShareLinks";

interface SharedChromeProps {
  initials: string;
  onAvatarClick: () => void;
  onOpenSearch: () => void;
  /** Opens the notifications sheet + unread badge count. Omitted → no bell. */
  onNotif?: () => void;
  notifCount?: number;
}

interface LibraryScreenProps extends SharedChromeProps {
  onOpenDetail: OpenDocHandler;
  onOpenFinder: OpenFilesHandler;
  onOpenDealLibrary: OpenDealLibraryHandler;
  realEmpty?: boolean;
}

interface SearchScreenProps extends SharedChromeProps {
  onChat: () => void;
  onAskYulia: (prompt: string) => void;
  onOpenLibrary?: () => void;
  onOpenDetail?: () => void;
}

interface LibraryDetailScreenProps {
  onBack: () => void;
  onOpenDoc: OpenDocHandler;
  onStageChange?: (stage: DealStageScope) => void;
  dealTitle?: string;
  dealMeta?: string;
  portfolioName?: string;
  dealStage?: DealStageScope;
  /** Real numeric deal id. When present the screen loads the REAL data room
   *  (folders + documents) instead of the sample sections. */
  dealRawId?: number | null;
}

interface LibraryFinderScreenProps {
  onBack: () => void;
  onOpenDetail: OpenDocHandler;
  onOpenDealLibrary: OpenDealLibraryHandler;
  initialFilter?: FilesFilter;
  onFilterChange?: (filter: FilesFilter) => void;
}

interface LibraryDocumentScreenProps {
  onBack: () => void;
  onAskYulia: (prompt: string) => void;
  title?: string;
  meta?: string;
  kind?: string;
  /** Real deliverable id. When present the reader loads the REAL deliverable
   *  (title / status / body) instead of the sample text. */
  deliverableId?: number | null;
}

type DocTone = "ai" | "memo" | "draft" | "contract" | "signed" | "pdf" | "excel" | "image";
type PillTone = "draft" | "lock" | "review" | "awaiting" | "signed" | "needed";
type FilesFilter = "all" | "deals" | "actionable" | "docs" | "analysis" | "data-room" | "shared" | "secure";
type DealStageScope = "all" | "data-room";
type OpenDocHandler = (title?: string, meta?: string, kind?: string, deliverableId?: number) => void;
type OpenDealLibraryHandler = (dealTitle?: string, dealMeta?: string, portfolioName?: string, dealStage?: DealStageScope) => void;
type OpenFilesHandler = (filter?: FilesFilter) => void;

interface DocRowData {
  name: string;
  meta: string;
  pill: ReactNode;
  icon: ReactNode;
  docKind?: string;
  stage?: "data-room";
  onClick?: () => void;
  /** Optional control rendered below the row (real data-room status advance).
   *  Sample rows never set this, so their layout is unchanged. */
  statusControl?: ReactNode;
}

const draftRows: DocRowData[] = [
  { name: "IOI · Big Fake Deal", meta: "Yulia · v3 · 2 min ago", pill: "Open", icon: "memo" },
  { name: "QoE summary · Pest Control", meta: "You · 1 hr ago", pill: "Open", icon: "memo" },
  { name: "Buyer outreach memo", meta: "Yulia · drafting...", pill: "Open", icon: "memo" },
];

const dataRoomRows: DocRowData[] = [
  { name: "Big Fake Deal · 2024 P&L", meta: "Target artifact · Excel · 1.2 MB", pill: "View", icon: "sheet" },
  { name: "Big Fake Deal · corporate org chart", meta: "Target artifact · PDF · 4 pages", pill: "View", icon: "pdf" },
  { name: "Pest Control · route photos", meta: "Seller artifact · PNG · 18 images", pill: "View", icon: "image" },
  { name: "Pest Control · customer list", meta: "Target artifact · CSV · 142 rows", pill: "View", icon: "chart" },
  { name: "HVAC platform · IT systems map", meta: "Target artifact · PDF · 12 pages", pill: "View", icon: "pdf" },
];

const signedRows: DocRowData[] = [
  { name: "Big Fake Deal · LOI", meta: "Executed Apr 21 · locked", pill: "Open", icon: "lock" },
  { name: "Pest Control · NDA", meta: "Executed Mar 03 · locked", pill: "Open", icon: "lock" },
];

const libraryActivity: DocRowData[] = [
  { name: "IOI · Big Fake Deal", meta: "Needs review · updated 2 min ago", pill: <StatusPill tone="draft">Draft</StatusPill>, icon: <DocIcon kind="draft" /> },
  { name: "Buyer fit memo", meta: "Action requested · 1 hr ago", pill: <StatusPill tone="review">Review</StatusPill>, icon: <DocIcon kind="memo" /> },
  { name: "2024 P&L · audited", meta: "Private data room · Apr 12", pill: <StatusPill tone="lock">Locked</StatusPill>, icon: <DocIcon kind="excel" /> },
  { name: "Mutual NDA · seller counsel", meta: "In review · 2 markups", pill: <StatusPill tone="review">In review</StatusPill>, icon: <DocIcon kind="contract" /> },
];

const dealLibraries = [
  {
    title: "Big Fake Deal",
    meta: "$5.4M · East Texas · industrial services",
    portfolio: "Buy",
    count: 14,
    updated: "updated 2 min ago",
    fit: "PURSUE · 92 FIT",
  },
  {
    title: "Pest Control · FL",
    meta: "$2.1M · recurring route density",
    portfolio: "Buy",
    count: 8,
    updated: "updated 1 hr ago",
    fit: "PURSUE · 88 FIT",
  },
  {
    title: "HVAC platform · CO",
    meta: "$4.8M · service mix under review",
    portfolio: "Watchlist",
    count: 6,
    updated: "updated Apr 30",
    fit: "WATCH · 71 FIT",
  },
];

const activeDataRooms = [
  {
    title: "Big Fake Deal",
    meta: "Buy portfolio · Data room · 12 items",
    dealTitle: "Big Fake Deal",
    dealMeta: "$5.4M · East Texas · industrial services",
    portfolio: "Buy",
  },
  {
    title: "Pest Control · FL",
    meta: "Buy portfolio · Data room · 12 items",
    dealTitle: "Pest Control · FL",
    dealMeta: "$2.1M · recurring route density",
    portfolio: "Buy",
  },
  {
    title: "HVAC platform · CO",
    meta: "Watchlist portfolio · Data room · 12 items",
    dealTitle: "HVAC platform · CO",
    dealMeta: "$4.8M · service mix under review",
    portfolio: "Watchlist",
  },
];

export function LibraryPreviewCard({
  onOpenFinder,
}: {
  onOpenFinder: OpenFilesHandler;
}) {
  return (
    <div style={S.libraryPortal}>
      <div style={S.portalGlow} />
      <div style={S.portalHeader}>
        <div className="mb-mono" style={S.heroKicker}>FILES</div>
        <h2 style={S.portalTitle}>Files that need your eye.</h2>
        <p style={S.portalCopy}>
          Working docs, analysis, action items, and shared diligence rooms are organized by deal.
        </p>
      </div>
      <div style={S.portalRows}>
        <PortalLink
          label="All files"
          sub="Browse by portfolio, deal, and stage"
          count="24"
          onTap={() => onOpenFinder("all")}
        />
        <PortalLink
          label="Deal libraries"
          sub="Portfolio → deal → stage"
          count="3"
          onTap={() => onOpenFinder("deals")}
        />
        <PortalLink
          label="Needs action"
          sub="Review, signature, or decision"
          count="4"
          onTap={() => onOpenFinder("actionable")}
        />
        <PortalLink
          label="Working docs"
          sub="Drafts, analysis, memos, contracts"
          count="10"
          onTap={() => onOpenFinder("docs")}
          last
        />
      </div>
    </div>
  );
}

export function LibraryActivityList({
  onOpenDetail,
  limit = 4,
}: {
  onOpenDetail: OpenDocHandler;
  limit?: number;
}) {
  const rows = libraryActivity.slice(0, limit).map((row) => withDocClick(row, onOpenDetail));
  return (
    <div className="mb-as-card" style={S.activityCard}>
      <div style={{ padding: "0 22px 6px" }}>
        <div className="mb-section-eyebrow">RECENTS</div>
        <div className="mb-section-title">Recents</div>
        <div style={S.activitySub}>Recently touched docs, plus anything waiting on you.</div>
      </div>
      <div style={S.activityRows}>
        {rows.map((row, index) => (
          <DocRow key={row.name} row={row} last={index === rows.length - 1} showChevron />
        ))}
      </div>
    </div>
  );
}

export function LibraryScreen({
  initials,
  onAvatarClick,
  onOpenSearch,
  onNotif,
  notifCount,
  onOpenDetail,
  onOpenFinder,
  onOpenDealLibrary,
  realEmpty = false,
}: LibraryScreenProps) {
  if (realEmpty) {
    return (
      <div className="mb-fade-up" style={{ ...S.page, ...S.filesPage }}>
        <GlassTopBar
          title="Files"
          initials={initials}
          onAvatarClick={onAvatarClick}
          onSearch={onOpenSearch}
          onNotif={onNotif}
          notifCount={notifCount}
        />
        <LargeTitle>Files</LargeTitle>

        <div style={S.emptyPad}>
          <div className="mb-as-card" style={S.emptyCard}>
            <div aria-hidden="true" style={S.emptyIcon}>
              <FolderKanban size={30} strokeWidth={2} />
            </div>
            <h2 style={S.emptyTitle}>Nothing filed yet</h2>
            <p style={S.emptyCopy}>
              Your IOIs, memos, analyses, and data rooms show up here as you and Yulia create them.
            </p>
            <button type="button" onClick={onOpenSearch} style={S.emptyCta}>
              Start with Yulia
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-fade-up" style={{ ...S.page, ...S.filesPage }}>
      <GlassTopBar
        title="Files"
        initials={initials}
        onAvatarClick={onAvatarClick}
        onSearch={onOpenSearch}
        onNotif={onNotif}
        notifCount={notifCount}
      />
      <LargeTitle>Files</LargeTitle>

      <div style={S.cardPad}>
        <LibraryPreviewCard onOpenFinder={onOpenFinder} />
      </div>

      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <LibraryActivityList onOpenDetail={onOpenDetail} />
      </div>

      <div style={S.librarySectionPad}>
        <div className="mb-section-eyebrow" style={S.eyebrowInset}>YULIA IS DRAFTING</div>
        <button
          type="button"
          onClick={() => onOpenDetail("IOI draft · v3", "Big Fake Deal · updated 2 min ago", "draft")}
          style={S.goldHero}
        >
          <div style={S.heroGlow} />
          <div style={S.heroBody}>
            <div className="mb-mono" style={S.heroKicker}>IOI · v3 · BIG FAKE DEAL</div>
            <h2 style={S.heroTitle}>Yulia&rsquo;s writing your IOI right now.</h2>
            <p style={S.heroCopy}>
              Recurring rev framing, $7.8M target, 60-day diligence window.
              Review when you&rsquo;re ready.
            </p>
          </div>
          <div style={S.heroAction}>
            <SimpleDocIcon kind="memo" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.heroActionTitle}>IOI draft · v3</div>
              <div style={S.heroActionMeta}>Updated 2 min ago</div>
            </div>
            <span style={S.heroButton}>Review</span>
          </div>
        </button>
      </div>

      <div style={S.finderCtaPad}>
        <div className="mb-as-card" style={S.activeRoomsCard}>
          <button type="button" onClick={() => onOpenFinder("all")} style={S.activeRoomsHeader}>
            <div>
              <div className="mb-section-eyebrow">OPEN FILES</div>
              <div style={S.finderCtaTitle}>Browse all files</div>
              <div style={S.finderCtaSub}>Portfolio → deal → stage across docs, analysis, and data rooms.</div>
            </div>
            <MobileIcon name="chevron" c="var(--mb-accent-ink)" size={13} />
          </button>
          <div className="mb-section-eyebrow" style={S.activeRoomsEyebrow}>CURRENT DATA ROOMS</div>
          <div style={S.activityRows}>
            {activeDataRooms.map((room, index) => (
              <DocRow
                key={room.title}
                row={{
                  name: room.title,
                  meta: room.meta,
                  pill: "Open",
                  icon: <DealLibraryIcon />,
                  onClick: () => onOpenDealLibrary(room.dealTitle, room.dealMeta, room.portfolio, "data-room"),
                }}
                last={index === activeDataRooms.length - 1}
                showChevron
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalLink({
  label,
  sub,
  count,
  onTap,
  last,
}: {
  label: string;
  sub: string;
  count: string;
  onTap: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      style={{
        ...S.portalLink,
        borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.16)",
      }}
    >
      <span style={S.portalCount}>{count}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={S.portalLabel}>{label}</span>
        <span style={S.portalSub}>{sub}</span>
      </span>
      <MobileIcon name="chevron" c="#fff" size={11} />
    </button>
  );
}

function DealBoundaryCard({
  isDataRoom,
  dataRoomCount,
  onOpenDealLibrary,
  onOpenDataRoom,
}: {
  isDataRoom: boolean;
  dataRoomCount: number;
  onOpenDealLibrary: () => void;
  onOpenDataRoom: () => void;
}) {
  return (
    <div style={S.boundaryPad}>
      <div className="mb-as-card" style={isDataRoom ? S.sharedBoundaryCard : S.privateBoundaryCard}>
        <div className="mb-section-eyebrow">{isDataRoom ? "SHARED DRIVE" : "PRIVATE WORKSPACE"}</div>
        <div style={S.boundaryTitle}>{isDataRoom ? "Visible to the deal team" : "Private deal library"}</div>
        <div style={S.boundaryCopy}>
          {isDataRoom
            ? "Approved buyers, sellers, counsel, and advisors can access what is placed here. Your Yulia notes and analysis remain outside unless you share them."
            : "Yulia drafts, analysis, notes, and private uploads live here. Nothing moves into the shared data room until you publish it."}
        </div>
        <div style={S.boundaryGrid}>
          {isDataRoom ? (
            <>
              <BoundaryStat label="Artifacts" value="Any file type" />
              <BoundaryStat label="Legal docs" value="Drafts + executed" />
              <BoundaryStat label="Audit log" value="Every access" />
            </>
          ) : (
            <>
              <BoundaryStat label="Private" value="Only your side" />
              <BoundaryStat label="Data room" value={`${dataRoomCount} shared`} />
              <BoundaryStat label="Share" value="Explicit only" />
            </>
          )}
        </div>
        <div style={S.boundaryActions}>
          {isDataRoom ? (
            <button type="button" onClick={onOpenDealLibrary} style={S.boundaryPrimaryButton}>
              Deal library
            </button>
          ) : (
            <button type="button" onClick={onOpenDataRoom} style={S.boundaryPrimaryButton}>
              Open data room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BoundaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.boundaryStat}>
      <div style={S.boundaryStatLabel}>{label}</div>
      <div style={S.boundaryStatValue}>{value}</div>
    </div>
  );
}

export function SearchScreen({
  initials,
  onAvatarClick,
  onOpenSearch,
  onNotif,
  notifCount,
  onChat,
  onAskYulia,
}: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const categories = [
    {
      eyebrow: "BUYERS",
      title: "Potential buyers",
      sub: "Strategics, sponsors, family offices, buyer pools.",
      tone: "purple",
      prompt: "Find likely buyers and buyer pools for a lower-middle-market services company. Include strategics, private equity, family offices, and search funds. Rank by fit and explain why each belongs.",
    },
    {
      eyebrow: "TARGETS",
      title: "Targets to buy",
      sub: "Build a target list from a thesis.",
      tone: "gold",
      prompt: "Help me define an acquisition thesis, then find target companies that match it. Start with sector, geography, size, recurring revenue, owner profile, and deal-breakers.",
    },
    {
      eyebrow: "PE & CAPITAL",
      title: "PE and capital",
      sub: "Sponsors, independent sponsors, lenders.",
      tone: "blue",
      prompt: "Find private equity firms, independent sponsors, family offices, and lenders relevant to this deal. Separate equity buyers from debt capital and compare them by likely appetite.",
    },
    {
      eyebrow: "PROFESSIONALS",
      title: "Deal professionals",
      sub: "Attorneys, QoE, tax, insurance, brokers.",
      tone: "sage",
      prompt: "Find deal professionals for this transaction: M&A attorneys, QoE providers, tax advisors, insurance brokers, and diligence specialists. Compare experience with lower-middle-market transactions.",
    },
    {
      eyebrow: "REAL ESTATE",
      title: "Real estate & ops",
      sub: "Facilities, leases, agents, zoning help.",
      tone: "slate",
      prompt: "Find real estate and operating specialists for this deal: commercial agents, lease reviewers, environmental diligence, facilities consultants, and zoning or permitting help.",
    },
    {
      eyebrow: "MARKET MAPS",
      title: "Market maps",
      sub: "Competitors, adjacencies, roll-up themes.",
      tone: "plum",
      prompt: "Build a market map for this thesis. Include competitors, adjacencies, roll-up themes, likely acquirers, and signals that a company may be ready to transact.",
    },
  ] as const;

  const recent = [
    {
      q: "Strategic buyers for route-density pest control in Florida",
      meta: "Buyer search · 18 candidates · 2h ago",
      prompt: "Refresh the buyer search for route-density pest control companies in Florida. Rank strategic buyers, PE-backed platforms, and local consolidators.",
    },
    {
      q: "HVAC platform targets with service mix under review",
      meta: "Target thesis · 31 companies · yesterday",
      prompt: "Reopen the HVAC platform target search. Focus on recurring service revenue, owner-operated businesses, and add-on fit.",
    },
    {
      q: "Seller-side M&A attorneys in Texas industrial services",
      meta: "Professional search · 9 firms · Mon",
      prompt: "Find seller-side M&A attorneys for a Texas industrial services transaction. Prioritize lower-middle-market experience and practical closing support.",
    },
    {
      q: "SBA and senior debt lenders for $2M service businesses",
      meta: "Capital search · 12 lenders · last week",
      prompt: "Refresh the lender search for $2M service-business acquisitions. Separate SBA lenders, conventional senior debt, and seller-note-friendly lenders.",
    },
  ];
  const quickStarts = [
    "Find buyers for my company",
    "Build a target list from a thesis",
    "Map PE firms active in this sector",
    "Find deal counsel and diligence help",
  ];
  const submitSearch = (prompt: string) => {
    const clean = prompt.trim();
    if (!clean) return;
    onAskYulia(`Run a market discovery search: ${clean}`);
    setQuery("");
  };

  return (
    <div className="mb-fade-up" style={{ ...S.page, ...S.searchPage }}>
      <GlassTopBar
        title="Search"
        initials={initials}
        onAvatarClick={onAvatarClick}
        onSearch={onOpenSearch}
        onNotif={onNotif}
        notifCount={notifCount}
      />
      <LargeTitle>Search</LargeTitle>

      <div style={S.searchPad}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(query);
          }}
          style={S.marketComposer}
        >
          <MobileIcon name="search" c="var(--mb-ink-3)" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Find buyers, targets, PEs, specialists"
            aria-label="Market discovery search"
            style={S.marketComposerInput}
          />
          <button
            type="submit"
            aria-label="Run discovery search"
            disabled={!query.trim()}
            style={{
              ...S.marketComposerSend,
              opacity: query.trim() ? 1 : 0.42,
            }}
          >
            <MobileIcon name="arrowUp" c="#fff" size={15} />
          </button>
        </form>
      </div>

      <div style={S.cardPad}>
        <div className="mb-section-eyebrow" style={S.eyebrowInset}>DISCOVERY</div>
        <button type="button" onClick={onChat} style={S.searchHero}>
          <div style={S.heroGlow} />
          <div style={S.heroBody}>
            <div className="mb-mono" style={S.heroKicker}>ASK YULIA</div>
            <h2 style={S.heroTitle}>Map the market around the deal.</h2>
            <p style={S.heroCopy}>
              Search buyers, targets, capital, and deal professionals. Yulia turns a rough thesis into a sourced market map.
            </p>
            <span style={S.searchHeroAction}>
              <YIcon size={42} kind="pursue" />
              <span style={S.searchHeroActionCopy}>
                <span style={S.searchHeroActionTitle}>Start discovery</span>
                <span style={S.searchHeroActionMeta}>Buyers, targets, capital, specialists</span>
              </span>
              <span style={S.searchHeroActionPill}>Start</span>
            </span>
          </div>
        </button>
      </div>

      <SectionHeader eyebrow="BROWSE" title="Discovery cards" />
      <div style={S.categoryGrid}>
        {categories.map((cat) => (
          <CategoryCard
            key={cat.eyebrow}
            eyebrow={cat.eyebrow}
            title={cat.title}
            sub={cat.sub}
            tone={cat.tone}
            onClick={() => submitSearch(cat.prompt)}
          />
        ))}
      </div>

      <SectionHeader eyebrow="QUICK START" title="Start from a plain sentence" />
      <div style={S.quickStartPad}>
        {quickStarts.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => submitSearch(item)}
            style={S.quickStartChip}
          >
            {item}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="RECENT" title="Recent discovery searches" />
      <div style={S.cardPad}>
        <div className="mb-as-card" style={S.listCard}>
          {recent.map((item, index) => (
            <button
              type="button"
              key={item.q}
              onClick={() => submitSearch(item.prompt)}
              style={{
                ...S.recentRow,
                borderBottom: index === recent.length - 1 ? "none" : "0.5px solid var(--mb-line-2)",
              }}
            >
              <div style={S.recentIcon}>
                <MobileIcon name="search" c="currentColor" size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.rowTitle}>{item.q}</div>
                <div style={S.rowMeta}>{item.meta}</div>
              </div>
              <MobileIcon name="chevron" c="var(--mb-ink-4)" size={11} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LibraryDetailScreen({
  onBack,
  onOpenDoc,
  onStageChange,
  dealTitle = "Big Fake Deal",
  dealMeta = "$5.4M · East Texas · industrial services",
  portfolioName = "Buy",
  dealStage = "all",
  dealRawId = null,
}: LibraryDetailScreenProps) {
  // REAL data-room read path — only when a real deal id is threaded in.
  // The hook is a no-op (no fetch) when dealRawId is null, so the sample
  // experience below is untouched in the anon / no-deal context.
  const room = useMobileDataRoom(dealRawId);
  if (dealRawId != null) {
    return (
      <RealDealDataRoom
        dealRawId={dealRawId}
        dealTitle={dealTitle}
        dealMeta={dealMeta}
        portfolioName={portfolioName}
        room={room}
        onBack={onBack}
        onOpenDoc={onOpenDoc}
      />
    );
  }

  const deal = dealLibraries.find((item) => item.title === dealTitle) ?? dealLibraries[0];
  const currentTitle = dealTitle || deal.title;
  const currentMeta = dealMeta || deal.meta;
  const itemCount = deal.title === currentTitle ? deal.count : 14;
  const fit = deal.title === currentTitle ? deal.fit : "PURSUE · 92 FIT";
  const isDataRoom = dealStage === "data-room";
  const stageLabel = isDataRoom ? "Data room" : "Deal library";
  const stageSub = isDataRoom
    ? "Shared drive for diligence artifacts and legal documents. Working notes and analyses stay in the deal library."
    : "Private workspace for Yulia drafts, analysis, notes, and deal documents. Share only what belongs in the data room.";
  const dealDataRoomSections = getDealDataRoomSections(currentTitle, portfolioName, onOpenDoc);
  const detailSections = isDataRoom ? dealDataRoomSections : null;
  const dataRoomCount = dealDataRoomSections.reduce((sum, section) => sum + section.rows.length, 0);
  const visibleItemCount = isDataRoom ? dataRoomCount : itemCount;
  const roomCategories = detailSections?.map((section) => ({
    label: section.title,
    count: section.rows.length,
    anchorId: section.anchorId,
  }));
  type DetailFilter = { label: string; count: number; active: boolean; stage?: DealStageScope; anchorId?: string };
  const filters: DetailFilter[] = isDataRoom
    ? [
        { label: "Data room", count: dataRoomCount, active: true },
        { label: "Deal library", count: itemCount, active: false, stage: "all" as DealStageScope },
      ]
    : [
        { label: "Deal library", count: itemCount, active: true, stage: "all" as DealStageScope },
        { label: "Private", count: 9, active: false },
        { label: "Drafts", count: 2, active: false },
        { label: "Analysis", count: 3, active: false },
        { label: "Data room", count: dataRoomCount, active: false, stage: "data-room" as DealStageScope },
      ];

  return (
    <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
      <button type="button" onClick={onBack} aria-label="Back" style={S.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button type="button" aria-label="Share" style={S.floatShare}>
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>

      <div style={S.breadcrumb}>
        <span style={S.breadcrumbLink}>Files</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span style={S.breadcrumbLink}>{portfolioName}</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span style={S.breadcrumbLink}>{currentTitle}</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span>{stageLabel}</span>
      </div>

      <div style={S.detailHero}>
        <h1 style={S.detailTitle}>{currentTitle}</h1>
        <div style={S.detailSub}>{currentMeta}</div>
        <div style={S.detailMeta}>
          <span style={S.fitPill}>
            <span style={S.fitDot} />
            {fit}
          </span>
          <span style={S.detailCount}>{visibleItemCount} items · {deal.updated}</span>
        </div>
      </div>

      <div className="mb-hide-scroll" style={S.filterRow}>
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.label}
            onClick={(() => {
              const stage = filter.stage;
              const anchorId = filter.anchorId;
              if (stage) return () => onStageChange?.(stage);
              if (anchorId) return () => document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
              return undefined;
            })()}
            style={{
              ...S.filterChip,
              background: filter.active ? "var(--mb-ink)" : "#fff",
              color: filter.active ? "#fff" : "var(--mb-ink-1)",
              boxShadow: filter.active ? "none" : "0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--mb-line-2)",
            }}
          >
            {filter.label}
            <span
              className="mb-mono"
              style={{
                ...S.filterCount,
                background: filter.active ? "rgba(255,255,255,0.2)" : "var(--mb-card-2)",
                color: filter.active ? "#fff" : "var(--mb-ink-3)",
              }}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      <div style={S.stageBannerPad}>
        <div className="mb-as-card" style={isDataRoom ? S.stageBannerDataRoom : S.stageBanner}>
          <div className="mb-section-eyebrow">{isDataRoom ? "CURRENT STAGE" : "CURRENT VIEW"}</div>
          <div style={S.stageBannerTitle}>{stageLabel}</div>
          <div style={S.stageBannerSub}>{stageSub}</div>
        </div>
      </div>

      <DealBoundaryCard
        isDataRoom={isDataRoom}
        dataRoomCount={dataRoomCount}
        onOpenDealLibrary={() => onStageChange?.("all")}
        onOpenDataRoom={() => onStageChange?.("data-room")}
      />

      {roomCategories && (
        <div style={S.roomCategoryPad}>
          <div className="mb-section-eyebrow" style={S.roomCategoryEyebrow}>IN THIS ROOM</div>
          <div className="mb-hide-scroll" style={S.roomCategoryRail}>
            {roomCategories.map((category) => (
              <button
                type="button"
                key={category.anchorId}
                onClick={() => document.getElementById(category.anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={S.roomCategoryChip}
              >
                <span style={S.roomCategoryLabel}>{category.label}</span>
                <span className="mb-mono" style={S.roomCategoryCount}>{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={S.detailSearchPad}>
        <div style={S.searchField}>
          <MobileIcon name="search" c="var(--mb-ink-3)" size={16} />
          <span style={S.searchText}>Search {isDataRoom ? `${currentTitle}'s data room` : `${currentTitle}'s deal library`}</span>
          <span className="mb-mono" style={S.keyHint}>K</span>
        </div>
      </div>

      {detailSections ? (
        detailSections.map((section) => (
          <DocSection
            key={section.title}
            anchorId={section.anchorId}
            title={section.title}
            sub={section.sub}
            rows={section.rows}
            cap={4}
          />
        ))
      ) : (
        <>
      <DocSection
        title="What you & Yulia are on right now"
        sub="Private drafts, analysis, and memos. Not shared to the data room."
        onOpenDoc={onOpenDoc}
        rows={[
          { name: "Yulia · Recast walk-through", meta: "Analysis · v3 · 2 min ago", pill: "Open", icon: <DocIcon kind="ai" />, docKind: "ai" },
          { name: "Buyer fit memo", meta: "You · 1 hr ago · 4 pages", pill: "Open", icon: <DocIcon kind="memo" />, docKind: "memo" },
          { name: "Concentration risk note", meta: "Yulia · 18 hr ago · v2", pill: "Open", icon: <DocIcon kind="ai" />, docKind: "ai" },
        ]}
      />
      <DocSection
        title="Not yet sent"
        sub="Private deal documents Yulia is shaping. Publish to the data room only when ready."
        onOpenDoc={onOpenDoc}
        rows={[
          { name: "IOI · v3", meta: "Yulia · drafting · 2 min ago", pill: <StatusPill tone="draft">Draft</StatusPill>, icon: <DocIcon kind="draft" />, docKind: "draft" },
          { name: "LOI · v1", meta: "You · started yesterday", pill: <StatusPill tone="draft">Draft</StatusPill>, icon: <DocIcon kind="draft" />, docKind: "draft" },
        ]}
      />
      <DocSection
        title="Shared data room"
        sub="Drive shared with approved deal-team participants. Artifacts and legal docs live here."
        onOpenDoc={onOpenDoc}
        rows={[
          { name: "2024 P&L · audited", meta: "Excel · 1.2 MB · Apr 12", pill: <StatusPill tone="lock">Locked</StatusPill>, icon: <DocIcon kind="excel" />, docKind: "excel", stage: "data-room" },
          { name: "2022-2024 tax returns", meta: "PDF · 3 files · Apr 12", pill: <StatusPill tone="lock">Locked</StatusPill>, icon: <DocIcon kind="pdf" />, docKind: "pdf", stage: "data-room" },
          { name: "Customer list · top 25", meta: "CSV · 25 rows · Apr 14", pill: <StatusPill tone="lock">Locked</StatusPill>, icon: <DocIcon kind="excel" />, docKind: "excel", stage: "data-room" },
          { name: "Insurance & litigation history", meta: "PDF · 8 pages · Apr 16", pill: <StatusPill tone="lock">Locked</StatusPill>, icon: <DocIcon kind="pdf" />, docKind: "pdf", stage: "data-room" },
        ]}
        cap={4}
      />
      <DocSection
        title="In flight"
        sub="Sent or received. Awaiting review or counter-signature."
        onOpenDoc={onOpenDoc}
        rows={[
          { name: "Mutual NDA · seller counsel", meta: "Sent Apr 04 · 2 markups", pill: <StatusPill tone="review">In review</StatusPill>, icon: <DocIcon kind="contract" />, docKind: "contract", stage: "data-room" },
          { name: "IOI · v2 (sent)", meta: "Sent Apr 22 · awaiting reply", pill: <StatusPill tone="awaiting">Awaiting</StatusPill>, icon: <DocIcon kind="contract" />, docKind: "contract" },
        ]}
      />
      <DocSection
        title="Signed & immutable"
        sub="Read-only. Counter-signed and logged."
        onOpenDoc={onOpenDoc}
        rows={[
          { name: "NDA · countersigned", meta: "Executed Mar 03 · seller + buyer", pill: <StatusPill tone="signed">Executed</StatusPill>, icon: <DocIcon kind="signed" />, docKind: "signed", stage: "data-room" },
        ]}
      />
        </>
      )}
    </div>
  );
}

/* ─── REAL data-room (mobile parity with desktop DealView scope rail) ─────
   Renders the live folders + documents returned by GET /api/deals/:id/data-room.
   Mirrors the desktop dataRoomDocToFileItem status→tone and file_type→icon
   mapping, but with the App Store glass primitives (breadcrumb, float chrome,
   DocSection/DocRow, StatusPill, DocIcon) used by the sample screen above. */
function RealDealDataRoom({
  dealRawId,
  dealTitle,
  dealMeta,
  portfolioName,
  room,
  onBack,
  onOpenDoc,
}: {
  dealRawId: number;
  dealTitle?: string;
  dealMeta?: string;
  portfolioName?: string;
  room: ReturnType<typeof useMobileDataRoom>;
  onBack: () => void;
  onOpenDoc: OpenDocHandler;
}) {
  const currentTitle = room.dealName || dealTitle || "Deal";
  const currentMeta = dealMeta || "";
  const portfolio = portfolioName || "Deal files";
  const docCount = room.documents.length;

  // ── Write state (real path only) ───────────────────────────────────────
  // The folder the next upload / file-to-room action targets. null = root.
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyDocId, setBusyDocId] = useState<number | null>(null);
  const [filingId, setFilingId] = useState<number | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Share-links state (real path only) ─────────────────────────────────
  // Opens the glass Share bottom-sheet from the header Share control.
  const [shareOpen, setShareOpen] = useState(false);
  const share = useMobileShareLinks(dealRawId);
  // The link points at the deal's living CIM. No current endpoint exposes one
  // to the client, so the create flow shows a graceful "generate a CIM first"
  // state until a living CIM id is available (see useMobileShareLinks notes).
  const livingCimId: number | null = null;

  // Keep the upload target valid if folders change underneath us.
  useEffect(() => {
    if (targetFolderId != null && !room.folders.some((f) => f.id === targetFolderId)) {
      setTargetFolderId(null);
    }
  }, [room.folders, targetFolderId]);

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setWriteError(null);
    setUploading(true);
    try {
      await room.uploadFile(file, targetFolderId, undefined);
    } catch (e: any) {
      setWriteError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileDeliverable = async (deliverableId: number) => {
    setWriteError(null);
    setFilingId(deliverableId);
    try {
      await room.fileToRoom(deliverableId, targetFolderId);
    } catch (e: any) {
      setWriteError(e?.message || "Couldn’t file to room");
    } finally {
      setFilingId(null);
    }
  };

  const onAdvanceStatus = async (docId: number, next: string) => {
    setWriteError(null);
    setBusyDocId(docId);
    try {
      await room.setDocStatus(docId, next);
    } catch (e: any) {
      setWriteError(e?.message || "Couldn’t update status");
    } finally {
      setBusyDocId(null);
    }
  };

  const HiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,application/pdf,image/*"
      style={{ display: "none" }}
      onChange={(e) => {
        const file = e.currentTarget.files?.[0] ?? null;
        e.currentTarget.value = ""; // allow re-picking the same file
        void onPickFile(file);
      }}
    />
  );

  const activeLinkCount = share.links.filter((l) => !l.revoked_at).length;

  const Chrome = (
    <>
      {HiddenFileInput}
      <button type="button" onClick={onBack} aria-label="Back" style={S.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload a file to the data room"
        aria-busy={uploading}
        style={{ ...S.floatShare, opacity: uploading ? 0.6 : 1 }}
      >
        {uploading
          ? <Loader2 size={15} strokeWidth={2.4} color="var(--mb-ink-1)" style={S.spin} />
          : <UploadCloud size={16} strokeWidth={2.2} color="var(--mb-ink-1)" />}
      </button>
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        aria-label="Share this data room"
        style={S.floatShareLink}
      >
        <MobileIcon name="share" size={15} c="var(--mb-ink-1)" />
        {activeLinkCount > 0 && (
          <span className="mb-mono" style={S.floatShareBadge}>{activeLinkCount}</span>
        )}
      </button>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        dealTitle={currentTitle}
        share={share}
        livingCimId={livingCimId}
      />

      <div style={S.breadcrumb}>
        <span style={S.breadcrumbLink}>Files</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span style={S.breadcrumbLink}>{portfolio}</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span style={S.breadcrumbLink}>{currentTitle}</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span>Data room</span>
      </div>

      <div style={S.detailHero}>
        <h1 style={S.detailTitle}>{currentTitle}</h1>
        {currentMeta ? <div style={S.detailSub}>{currentMeta}</div> : null}
        <div style={S.detailMeta}>
          <span style={S.detailCount}>
            {room.loading ? "Loading data room…" : `${docCount} ${docCount === 1 ? "file" : "files"} · Live data room`}
          </span>
        </div>
      </div>
    </>
  );

  // Loading
  if (room.loading) {
    return (
      <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
        {Chrome}
        <div style={S.realStatePad}>
          <div className="mb-as-card" style={S.realStateCard}>
            <div className="mb-mono" style={S.realStateKicker}>DATA ROOM</div>
            <div style={S.realStateTitle}>Loading files…</div>
            <div style={S.realStateCopy}>Fetching the live diligence room for this deal.</div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (room.error) {
    return (
      <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
        {Chrome}
        <div style={S.realStatePad}>
          <div className="mb-as-card" style={S.realStateCard}>
            <div className="mb-mono" style={S.realStateKicker}>DATA ROOM</div>
            <div style={S.realStateTitle}>Couldn&rsquo;t load this room</div>
            <div style={S.realStateCopy}>{room.error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Empty (real, but nothing filed yet). Still expose the write affordances so
  // the owner can upload or file an existing deliverable from an empty room.
  if (room.groups.length === 0) {
    return (
      <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
        {Chrome}
        {writeError && (
          <div style={S.realWritePad}>
            <div style={S.writeErrorBanner} role="alert">{writeError}</div>
          </div>
        )}
        <div style={S.realStatePad}>
          <div className="mb-as-card" style={S.realStateCard}>
            <div aria-hidden="true" style={S.realStateIcon}>
              <FolderKanban size={26} strokeWidth={2} />
            </div>
            <div style={S.realStateTitle}>Nothing in this room yet</div>
            <div style={S.realStateCopy}>
              Source artifacts, analyses, and legal documents show up here as they&rsquo;re filed into this deal&rsquo;s data room.
            </div>
          </div>
        </div>
        <RealUploadBar
          folders={room.folders}
          targetFolderId={targetFolderId}
          onTargetChange={setTargetFolderId}
          onUploadClick={() => fileInputRef.current?.click()}
          uploading={uploading}
        />
        <RealUnfiledSection
          deliverables={room.unfiledDeliverables}
          onFile={onFileDeliverable}
          filingId={filingId}
          targetFolderName={room.folders.find((f) => f.id === targetFolderId)?.name ?? null}
        />
      </div>
    );
  }

  // Real folders → documents
  return (
    <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
      {Chrome}

      {writeError && (
        <div style={S.realWritePad}>
          <div style={S.writeErrorBanner} role="alert">{writeError}</div>
        </div>
      )}

      <RealUploadBar
        folders={room.folders}
        targetFolderId={targetFolderId}
        onTargetChange={setTargetFolderId}
        onUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
      />

      <RealUnfiledSection
        deliverables={room.unfiledDeliverables}
        onFile={onFileDeliverable}
        filingId={filingId}
        targetFolderName={room.folders.find((f) => f.id === targetFolderId)?.name ?? null}
      />

      {room.groups.length > 1 && (
        <div style={S.roomCategoryPad}>
          <div className="mb-section-eyebrow" style={S.roomCategoryEyebrow}>IN THIS ROOM</div>
          <div className="mb-hide-scroll" style={S.roomCategoryRail}>
            {room.groups.map((group, index) => (
              <button
                type="button"
                key={group.folder?.id ?? `unfiled-${index}`}
                onClick={() => document.getElementById(realGroupAnchor(group, index))?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={S.roomCategoryChip}
              >
                <span style={S.roomCategoryLabel}>{group.folder?.name ?? "Unfiled"}</span>
                <span className="mb-mono" style={S.roomCategoryCount}>{group.documents.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {room.groups.map((group, index) => (
        <DocSection
          key={group.folder?.id ?? `unfiled-${index}`}
          anchorId={realGroupAnchor(group, index)}
          title={group.folder?.name ?? "Unfiled"}
          sub={realFolderSub(group.folder?.name)}
          rows={group.documents.map((doc) =>
            realDocToRow(doc, dealRawId, onOpenDoc, {
              busy: busyDocId === doc.id,
              onAdvance: (next) => void onAdvanceStatus(doc.id, next),
            }),
          )}
          cap={6}
        />
      ))}
    </div>
  );
}

/* ─── Share sheet ─────────────────────────────────────────────────────────
   Glass bottom-sheet (mirrors the V6Mobile account-sheet scrim + sheet) that
   lists the deal's CIM share links and creates new ones. Each access level
   (blind / teaser / full) hands a buyer a different slice of the living CIM.
   The shareable URL is client-side: `${origin}/shared/:token`. When the deal
   has no living CIM, the create form is replaced by a "generate a CIM first"
   state so nothing renders a form that would 400. */
const SHARE_ACCESS: { value: "blind" | "teaser" | "full"; label: string; hint: string }[] = [
  { value: "blind", label: "Blind", hint: "Anonymous teaser — no identifying detail" },
  { value: "teaser", label: "Teaser", hint: "Headline metrics, business stays masked" },
  { value: "full", label: "Full CIM", hint: "Complete confidential memorandum" },
];

function ShareSheet({
  open,
  onClose,
  dealTitle,
  share,
  livingCimId,
}: {
  open: boolean;
  onClose: () => void;
  dealTitle: string;
  share: ReturnType<typeof useMobileShareLinks>;
  livingCimId: number | null;
}) {
  const [accessLevel, setAccessLevel] = useState<"blind" | "teaser" | "full">("teaser");
  const [requiresNda, setRequiresNda] = useState(true);
  const [maxViews, setMaxViews] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Lock background scroll while the sheet is open (matches LearnSheet).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const activeLinks = share.links.filter((l) => !l.revoked_at);
  const canCreate = livingCimId != null;

  const onCreate = async () => {
    if (!canCreate || creating) return;
    setCreateError(null);
    setCreating(true);
    try {
      const parsedViews = maxViews.trim() ? Math.max(1, Math.floor(Number(maxViews))) : null;
      const parsedDays = expiresInDays.trim() ? Math.max(1, Math.floor(Number(expiresInDays))) : null;
      await share.createLink({
        livingCimId,
        accessLevel,
        requiresNda,
        maxViews: Number.isFinite(parsedViews as number) ? parsedViews : null,
        expiresInDays: Number.isFinite(parsedDays as number) ? parsedDays : null,
      });
      // Reset the optional fields; keep access level + NDA for fast re-create.
      setMaxViews("");
      setExpiresInDays("");
    } catch (e: any) {
      setCreateError(e?.message || "Couldn’t create link");
    } finally {
      setCreating(false);
    }
  };

  const onCopy = (link: MobileShareLink) => {
    const url = `${window.location.origin}/shared/${link.token}`;
    const mark = () => { setCopiedId(link.id); setTimeout(() => setCopiedId((c) => (c === link.id ? null : c)), 1800); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(mark).catch(() => mark());
    } else {
      mark();
    }
  };

  return (
    <>
      <div onClick={onClose} style={SH.scrim} aria-hidden="true" />
      <div style={SH.sheet} role="dialog" aria-label={`Share ${dealTitle}`}>
        <div style={SH.grab} />
        <div style={SH.head}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mb-mono" style={SH.kicker}>SHARE DATA ROOM</div>
            <div style={SH.title}>{dealTitle}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={SH.closeBtn}>
            <X size={18} strokeWidth={2.4} color="var(--mb-ink-2)" />
          </button>
        </div>

        <div style={SH.scroll}>
          {/* Active links */}
          <div className="mb-section-eyebrow" style={SH.sectionEyebrow}>ACTIVE LINKS</div>
          {share.loading && activeLinks.length === 0 ? (
            <div style={SH.stateNote}>
              <Loader2 size={14} strokeWidth={2.4} color="var(--mb-ink-3)" style={S.spin} />
              <span>Loading links…</span>
            </div>
          ) : share.error ? (
            <div style={SH.errorBanner} role="alert">{share.error}</div>
          ) : activeLinks.length === 0 ? (
            <div style={SH.emptyNote}>No active links yet. Create one below to hand a buyer a controlled view.</div>
          ) : (
            <div className="mb-as-card" style={SH.linkList}>
              {activeLinks.map((link, i) => (
                <ShareLinkRow
                  key={link.id}
                  link={link}
                  last={i === activeLinks.length - 1}
                  copied={copiedId === link.id}
                  onCopy={() => onCopy(link)}
                  onRevoke={() => void share.revokeLink(link.id)}
                />
              ))}
            </div>
          )}

          {/* Create */}
          <div className="mb-section-eyebrow" style={{ ...SH.sectionEyebrow, marginTop: 22 }}>CREATE LINK</div>
          {canCreate ? (
            <div className="mb-as-card" style={SH.createCard}>
              <div style={SH.fieldLabel}>Access level</div>
              <div style={SH.accessRow}>
                {SHARE_ACCESS.map((opt) => {
                  const active = accessLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAccessLevel(opt.value)}
                      style={{
                        ...SH.accessChip,
                        background: active ? "var(--mb-ink)" : "#fff",
                        color: active ? "#fff" : "var(--mb-ink-1)",
                        boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--mb-line-2)",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div style={SH.accessHint}>{SHARE_ACCESS.find((o) => o.value === accessLevel)?.hint}</div>

              <button
                type="button"
                onClick={() => setRequiresNda((v) => !v)}
                role="switch"
                aria-checked={requiresNda}
                style={SH.ndaRow}
              >
                <span style={SH.ndaIcon}>
                  <ShieldCheck size={15} strokeWidth={2.2} color={requiresNda ? "var(--mb-accent-ink)" : "var(--mb-ink-4)"} />
                </span>
                <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <span style={SH.ndaTitle}>Require NDA</span>
                  <span style={SH.ndaSub}>Viewer signs before the CIM unlocks</span>
                </span>
                <span style={{ ...SH.toggle, background: requiresNda ? "var(--mb-accent-2)" : "var(--mb-ink-5)" }}>
                  <span style={{ ...SH.toggleDot, transform: requiresNda ? "translateX(16px)" : "translateX(0)" }} />
                </span>
              </button>

              <div style={SH.numberRow}>
                <label style={SH.numberField}>
                  <span style={SH.numberLabel}><Eye size={12} strokeWidth={2.2} color="var(--mb-ink-3)" /> Max views</span>
                  <input
                    className="mb-mono"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="∞"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    style={SH.numberInput}
                  />
                </label>
                <label style={SH.numberField}>
                  <span style={SH.numberLabel}><CalendarClock size={12} strokeWidth={2.2} color="var(--mb-ink-3)" /> Expires (days)</span>
                  <input
                    className="mb-mono"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Never"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    style={SH.numberInput}
                  />
                </label>
              </div>

              {createError && <div style={{ ...SH.errorBanner, marginTop: 12 }} role="alert">{createError}</div>}

              <button
                type="button"
                onClick={() => void onCreate()}
                disabled={creating}
                style={{ ...SH.createButton, opacity: creating ? 0.6 : 1 }}
              >
                {creating
                  ? <Loader2 size={15} strokeWidth={2.4} color="#fff" style={S.spin} />
                  : <Link2 size={15} strokeWidth={2.3} color="#fff" />}
                <span>{creating ? "Creating…" : "Create link"}</span>
              </button>
            </div>
          ) : (
            <div className="mb-as-card" style={SH.noCimCard}>
              <div aria-hidden="true" style={SH.noCimIcon}>
                <Sparkles size={22} strokeWidth={2} color="var(--mb-accent-ink)" />
              </div>
              <div style={SH.noCimTitle}>Generate a CIM first</div>
              <div style={SH.noCimCopy}>
                Share links hand a buyer a view of this deal&rsquo;s living CIM. Ask Yulia to build the confidential memorandum, then come back here to create blind, teaser, or full links.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ShareLinkRow({
  link,
  last,
  copied,
  onCopy,
  onRevoke,
}: {
  link: MobileShareLink;
  last: boolean;
  copied: boolean;
  onCopy: () => void;
  onRevoke: () => void;
}) {
  const status = shareLinkStatus(link);
  const meta = [
    formatRealStatus(link.access_level),
    link.requires_nda ? "NDA" : null,
    `${link.view_count}${link.max_views != null ? `/${link.max_views}` : ""} views`,
    shareExpiryLabel(link.expires_at),
  ].filter(Boolean).join(" · ");
  return (
    <div style={{ ...SH.linkRow, borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)" }}>
      <span style={SH.linkIcon}>
        <Link2 size={15} strokeWidth={2.2} color="var(--mb-accent-ink)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={SH.linkTitle}>
          {formatRealStatus(link.access_level)} link
          <span style={{ ...SH.linkBadge, background: status.bg, color: status.color }}>{status.label}</span>
        </div>
        <div className="mb-mono" style={SH.linkMeta}>{meta}</div>
      </div>
      <div style={SH.linkActions}>
        <button type="button" onClick={onCopy} aria-label="Copy link" style={SH.copyButton}>
          {copied
            ? <Check size={13} strokeWidth={2.6} color="var(--mb-accent-ink)" />
            : <Copy size={13} strokeWidth={2.3} color="var(--mb-accent-ink)" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
        <button type="button" onClick={onRevoke} aria-label="Revoke link" style={SH.revokeButton}>
          <Trash2 size={13} strokeWidth={2.3} color="var(--mb-danger-ink)" />
        </button>
      </div>
    </div>
  );
}

function shareLinkStatus(link: MobileShareLink): { label: string; bg: string; color: string } {
  if (link.revoked_at) return { label: "Revoked", bg: "var(--mb-card-2)", color: "var(--mb-ink-3)" };
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return { label: "Expired", bg: "var(--mb-warn-soft)", color: "var(--mb-warn-ink)" };
  }
  if (link.max_views != null && link.view_count >= link.max_views) {
    return { label: "Maxed", bg: "var(--mb-warn-soft)", color: "var(--mb-warn-ink)" };
  }
  return { label: "Active", bg: "var(--mb-verdict-pursue-soft)", color: "var(--mb-verdict-pursue-ink)" };
}

function shareExpiryLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return "expired";
  const days = Math.ceil(ms / 86400000);
  return days <= 1 ? "expires <1d" : `expires ${days}d`;
}

/* Upload affordance + folder target picker. The picked folder is the
   destination for both the header Upload action and Unfiled "File to room". */
function RealUploadBar({
  folders,
  targetFolderId,
  onTargetChange,
  onUploadClick,
  uploading,
}: {
  folders: MobileDataRoomFolder[];
  targetFolderId: number | null;
  onTargetChange: (id: number | null) => void;
  onUploadClick: () => void;
  uploading: boolean;
}) {
  return (
    <div style={S.realWritePad}>
      <div className="mb-as-card" style={S.uploadCard}>
        <div style={S.uploadCardHead}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mb-section-eyebrow">ADD TO ROOM</div>
            <div style={S.uploadCardTitle}>Upload a file</div>
            <div style={S.uploadCardSub}>PDF, spreadsheet, CSV, or image. Filed into the selected folder.</div>
          </div>
          <button
            type="button"
            onClick={onUploadClick}
            disabled={uploading}
            style={{ ...S.uploadButton, opacity: uploading ? 0.6 : 1 }}
          >
            {uploading
              ? <Loader2 size={15} strokeWidth={2.4} color="#fff" style={S.spin} />
              : <UploadCloud size={15} strokeWidth={2.3} color="#fff" />}
            <span>{uploading ? "Uploading…" : "Upload"}</span>
          </button>
        </div>
        {folders.length > 0 && (
          <div className="mb-hide-scroll" style={S.folderTargetRail}>
            <FolderTargetChip
              label="Root"
              active={targetFolderId == null}
              onClick={() => onTargetChange(null)}
            />
            {folders.map((folder) => (
              <FolderTargetChip
                key={folder.id}
                label={folder.name}
                active={targetFolderId === folder.id}
                onClick={() => onTargetChange(folder.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FolderTargetChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S.folderTargetChip,
        background: active ? "var(--mb-ink)" : "#fff",
        color: active ? "#fff" : "var(--mb-ink-1)",
        boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--mb-line-2)",
      }}
    >
      {label}
    </button>
  );
}

/* Unfiled deliverables (owner-only). Each can be filed into the room. */
function RealUnfiledSection({
  deliverables,
  onFile,
  filingId,
  targetFolderName,
}: {
  deliverables: MobileUnfiledDeliverable[];
  onFile: (deliverableId: number) => void;
  filingId: number | null;
  targetFolderName: string | null;
}) {
  if (!deliverables.length) return null;
  const dest = targetFolderName || "Root";
  return (
    <section style={S.docSection}>
      <div style={S.docHeader}>
        <h2 style={S.docTitle}>Unfiled</h2>
        <div style={S.docSub}>Deliverables you’ve generated that aren’t in the room yet. File into {dest}.</div>
      </div>
      <div style={S.docRows}>
        {deliverables.map((d, index) => {
          const tone = realDeliverableTone(d.slug || "", d.status || "", d.name || "");
          const busy = filingId === d.id;
          const last = index === deliverables.length - 1;
          const meta = [
            d.tier ? formatRealStatus(d.tier) : null,
            d.status ? formatRealStatus(d.status) : null,
            d.created_at ? fmtRelativeShort(d.created_at) : null,
          ].filter(Boolean).join(" · ");
          return (
            <div
              key={d.id}
              style={{ ...S.docRow, cursor: "default", borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)" }}
            >
              <DocIcon kind={tone} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.rowTitle}>{d.name || "Deliverable"}</div>
                <div style={S.rowMeta}>{meta || "Deliverable"}</div>
              </div>
              <span style={S.rowTrailing}>
                <button
                  type="button"
                  onClick={() => onFile(d.id)}
                  disabled={busy}
                  style={{ ...S.fileToRoomButton, opacity: busy ? 0.6 : 1 }}
                >
                  {busy
                    ? <Loader2 size={13} strokeWidth={2.4} color="var(--mb-accent-ink)" style={S.spin} />
                    : <FilePlus2 size={13} strokeWidth={2.3} color="var(--mb-accent-ink)" />}
                  <span>{busy ? "Filing…" : "File to room"}</span>
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function realGroupAnchor(group: MobileDataRoomGroup, index: number): string {
  return `data-room-${group.folder?.id ?? `unfiled-${index}`}`;
}

function realFolderSub(name?: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("financ")) return "Financial statements, recasts, and supporting schedules.";
  if (n.includes("legal") || n.includes("contract")) return "Transaction documents, agreements, and executed records.";
  if (n.includes("analys") || n.includes("model")) return "Analyses, recasts, scorecards, and model artifacts.";
  if (n.includes("commercial") || n.includes("customer")) return "Customer, revenue, and commercial diligence materials.";
  return "Documents filed in this folder of the data room.";
}

/* Forward-only lifecycle the mobile status control offers. This is a strict
   subset of the backend documentLifecycle TRANSITIONS for every doc_class, so
   the next step is always a legal forward move; the server stays the source of
   truth and rejects anything it disallows (surfaced inline). The read endpoint
   doesn't return doc_class, hence the conservative shared chain. */
const REAL_STATUS_FLOW: Record<string, string> = {
  draft: "review",
  review: "approved",
  approved: "locked",
};

const REAL_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  review: "In review",
  approved: "Approved",
  locked: "Locked",
  agreed: "Agreed",
  executed: "Executed",
  archived: "Archived",
};

interface RealStatusAdvance {
  busy: boolean;
  onAdvance: (next: string) => void;
}

/* Maps a real DataRoomDocument to the mobile DocRowData shape, mirroring the
   desktop dataRoomDocToFileItem status→pill and file_type→icon logic. When an
   advance config is supplied and the document has a legal forward transition,
   the row carries an inline status control. */
function realDocToRow(
  doc: MobileDataRoomDocument,
  dealRawId: number,
  onOpenDoc: OpenDocHandler,
  advance?: RealStatusAdvance,
): DocRowData {
  const tone = realDocTone(doc);
  const pill = realDocPill(doc);
  const versionLabel = doc.version ? `v${doc.version}` : null;
  const staleLabel = doc.deliverable_is_stale ? "stale" : null;
  const meta = [
    formatRealFileType(doc.file_type),
    formatRealStatus(doc.status),
    versionLabel,
    staleLabel,
  ].filter(Boolean).join(" · ");
  const isArtifact = !doc.deliverable_id; // backend streams file_url for these
  const canOpenDoc = doc.deliverable_id != null;

  const status = (doc.status || "").toLowerCase();
  const next = REAL_STATUS_FLOW[status];
  const statusControl = advance && next
    ? (
        <StatusAdvanceControl
          currentLabel={REAL_STATUS_LABEL[status] || formatRealStatus(doc.status)}
          nextLabel={REAL_STATUS_LABEL[next] || formatRealStatus(next)}
          busy={advance.busy}
          onAdvance={() => advance.onAdvance(next)}
        />
      )
    : undefined;

  return {
    name: doc.name,
    meta,
    pill,
    icon: <DocIcon kind={tone} />,
    docKind: tone,
    statusControl,
    onClick: canOpenDoc
      ? () => onOpenDoc(doc.name, meta, tone, doc.deliverable_id ?? undefined)
      : isArtifact
        ? () => void downloadDataRoomDocument(doc.id, doc.name)
        : undefined,
  };
}

/* Inline forward-only status control for a real data-room document row. Shows
   the current status and a single button to advance to the next stage. */
function StatusAdvanceControl({
  currentLabel,
  nextLabel,
  busy,
  onAdvance,
}: {
  currentLabel: string;
  nextLabel: string;
  busy: boolean;
  onAdvance: () => void;
}) {
  return (
    <div style={S.statusControlRow}>
      <span className="mb-mono" style={S.statusControlCurrent}>{currentLabel.toUpperCase()}</span>
      <ChevronRight size={12} strokeWidth={2.4} color="var(--mb-ink-4)" />
      <button
        type="button"
        onClick={onAdvance}
        disabled={busy}
        aria-label={`Advance to ${nextLabel}`}
        style={{ ...S.statusAdvanceButton, opacity: busy ? 0.6 : 1 }}
      >
        {busy
          ? <Loader2 size={12} strokeWidth={2.4} color="var(--mb-accent-ink)" style={S.spin} />
          : null}
        <span>{busy ? "Saving…" : `Mark ${nextLabel}`}</span>
      </button>
    </div>
  );
}

function realDocTone(doc: MobileDataRoomDocument): DocTone {
  const ft = (doc.file_type || "").toLowerCase();
  const name = (doc.name || "").toLowerCase();
  const status = (doc.status || "").toLowerCase();
  if (["executed", "locked", "agreed", "signed"].includes(status)) return "signed";
  if (/\.pdf$|^pdf$/.test(ft) || ft.includes("pdf")) return "pdf";
  if (ft.includes("xls") || ft.includes("csv") || ft.includes("sheet") || /p&l|customer list/.test(name)) return "excel";
  if (ft.includes("png") || ft.includes("jpg") || ft.includes("jpeg") || ft.includes("image") || name.includes("photo")) return "image";
  if (/loi|ioi|nda|agreement|disclosure|schedule|term|contract/.test(name)) return "contract";
  if (ft === "deliverable" || /model|valuation|analysis|recast|score|risk|memo|qoe/.test(name)) {
    return /model|valuation|analysis|recast|score|risk|qoe/.test(name) ? "ai" : "memo";
  }
  return "memo";
}

function realDocPill(doc: MobileDataRoomDocument): ReactNode {
  const status = (doc.status || "").toLowerCase();
  if (["executed", "locked", "agreed", "signed"].includes(status)) return <StatusPill tone="signed">Executed</StatusPill>;
  if (["review", "approved", "in_review"].includes(status)) return <StatusPill tone="review">In review</StatusPill>;
  if (status === "draft") return <StatusPill tone="draft">Draft</StatusPill>;
  if (doc.deliverable_is_stale) return <StatusPill tone="needed">Stale</StatusPill>;
  // Artifacts (no deliverable) → download; deliverables → open
  return doc.deliverable_id != null ? "Open" : "Download";
}

function formatRealFileType(input: string): string {
  if (!input) return "File";
  if (input === "deliverable") return "Document";
  if (input.length <= 5) return input.toUpperCase();
  return formatRealStatus(input);
}

function formatRealStatus(input: string): string {
  if (!input) return "";
  return input
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* Download a data-room artifact via the authed endpoint. The backend streams
   the file (or redirects to a presigned S3 URL), so we can't use window.open
   with an auth header — fetch→blob→anchor is the auth-safe path. */
async function downloadDataRoomDocument(docId: number, name: string) {
  try {
    const res = await fetch(`/api/data-room/documents/${docId}/download`, {
      headers: authHeaders(),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "data-room-file";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    /* download unavailable — leave the row as-is */
  }
}

export function LibraryDocumentScreen({
  onBack,
  onAskYulia,
  title = "IOI · v3",
  meta = "Yulia · drafting · 2 min ago",
  kind = "draft",
  deliverableId = null,
}: LibraryDocumentScreenProps) {
  // REAL deliverable reader — only when a real deliverable id is threaded in.
  // Keeps the sample reader below for the anon / no-id context.
  if (deliverableId != null) {
    return (
      <RealDocumentReader
        deliverableId={deliverableId}
        fallbackTitle={title}
        fallbackMeta={meta}
        fallbackKind={kind}
        onBack={onBack}
        onAskYulia={onAskYulia}
      />
    );
  }

  const tone = docToneFromKind(kind);
  const isData = tone === "excel" || tone === "pdf";
  const statusTone: PillTone = tone === "draft" ? "draft" : tone === "signed" ? "signed" : tone === "contract" || tone === "ai" || tone === "memo" ? "review" : "lock";
  const statusLabel =
    tone === "draft" ? "Draft" :
    tone === "signed" ? "Executed" :
    tone === "contract" ? "In review" :
    tone === "ai" ? "Analysis" :
    tone === "memo" ? "Memo" :
    "Locked";
  const readerLabel =
    isData ? "SECURE FILE" :
    tone === "signed" ? "EXECUTED RECORD" :
    tone === "ai" ? "ANALYSIS" :
    tone === "memo" ? "MEMO" :
    "DRAFT REVIEW";
  const readerMetaLabel =
    tone === "signed" ? "Immutable record" :
    isData ? "Data room file" :
    "Reviewable in app";

  return (
    <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
      <button type="button" onClick={onBack} aria-label="Back" style={S.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button type="button" aria-label="Share" style={S.floatShare}>
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>

      <div style={S.breadcrumb}>
        <span style={S.breadcrumbLink}>Files</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span style={S.breadcrumbLink}>Big Fake Deal</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span>Document</span>
      </div>

      <div style={S.docReaderHero}>
        <DocIcon kind={tone} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={S.docReaderTitle}>{title}</h1>
          <div style={S.detailSub}>{meta}</div>
        </div>
      </div>

      <div style={S.docReaderMeta}>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
        <span style={S.detailCount}>{readerMetaLabel}</span>
      </div>

      <section style={S.readerPad}>
        <div style={S.readerSurface}>
          <div style={S.readerToolbar}>
            <span className="mb-mono" style={S.readerKicker}>{readerLabel}</span>
            <span style={S.readerPageCount}>{isData ? "Data room" : tone === "signed" ? "Locked" : "Page 1 of 4"}</span>
          </div>
          <div style={S.readerPage}>
            <div className="mb-mono" style={S.readerDocKicker}>BIG FAKE DEAL</div>
            <h2 style={S.readerDocTitle}>{title}</h2>
            {isData ? (
              <div style={S.dataPreviewGrid}>
                {["Revenue", "Gross margin", "Adj. EBITDA", "Working capital"].map((label, index) => (
                  <div key={label} style={S.dataPreviewCell}>
                    <span style={S.dataPreviewLabel}>{label}</span>
                    <strong>{["$7.8M", "42.1%", "$1.6M", "$410K"][index]}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p style={S.readerParagraph}>
                  {tone === "signed"
                    ? "This executed document is stored as a locked record. The source file, signature metadata, timestamp, and audit trail are preserved."
                    : "Yulia has pulled the latest operating notes, seller counsel markups, and buyer-fit analysis into this working draft."}
                </p>
                <p style={S.readerParagraph}>
                  {tone === "signed"
                    ? "You can share access to this record, but edits should create a new version outside the immutable executed copy."
                    : "Review the economics, diligence window, and open questions before sending. The sections that need attention are already marked."}
                </p>
                <div style={S.readerCallout}>
                  <span className="mb-mono" style={S.readerKicker}>{tone === "signed" ? "AUDIT NOTE" : "YULIA NOTE"}</span>
                  <p>
                    {tone === "signed"
                      ? "Executed copies are read-only. Sharing changes access, not the underlying file."
                      : "Target price and diligence timing are ready. Seller financing language still needs your call."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <div style={S.docChatDock}>
        <ChatStarterPill
          placeholder="Message Yulia"
          ariaLabel={`Message Yulia about ${title}`}
          onSend={(message) => onAskYulia(`About ${title}: ${message}`)}
        />
      </div>
    </div>
  );
}

interface RealDeliverable {
  id: number;
  deal_id?: number;
  type?: string;
  status?: string;
  content?: unknown;
  name?: string;
  slug?: string;
  version_number?: number | null;
  updated_at?: string;
}

/* REAL deliverable reader — mobile parity with desktop DocView.
   Loads GET /api/deliverables/:id (mirrors loadDocumentContext) and renders
   the real title, status, and body (markdown / sections via extractMarkdown).
   Polls while the deliverable is still generating, like DocView does. */
function RealDocumentReader({
  deliverableId,
  fallbackTitle,
  fallbackMeta,
  fallbackKind,
  onBack,
  onAskYulia,
}: {
  deliverableId: number;
  fallbackTitle: string;
  fallbackMeta: string;
  fallbackKind: string;
  onBack: () => void;
  onAskYulia: (prompt: string) => void;
}) {
  const [doc, setDoc] = useState<RealDeliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    const load = async (withSpinner: boolean) => {
      if (withSpinner) setLoading(true);
      try {
        const res = await fetch(`/api/deliverables/${deliverableId}`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as RealDeliverable;
        if (cancelled) return;
        setDoc(payload);
        setError(null);
        if (!["queued", "generating"].includes(payload?.status || "") && poll) {
          clearInterval(poll);
          poll = null;
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load document");
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
  }, [deliverableId]);

  const markdown = extractDeliverableMarkdown(doc?.content);
  const title = doc?.name || fallbackTitle;
  const docType = doc?.type || doc?.slug || "document";
  const status = doc?.status || "";
  const isGenerating = !!doc && ["queued", "generating"].includes(status) && !markdown;
  const tone = realDeliverableTone(docType, status, title);
  const statusTone: PillTone =
    status === "complete" ? "review" :
    status === "draft" ? "draft" :
    ["executed", "locked"].includes(status) ? "signed" :
    isGenerating ? "draft" : "review";
  const statusLabel =
    isGenerating ? "Generating" :
    status ? formatRealStatus(status) :
    "Document";
  const metaLine = doc
    ? [formatRealStatus(docType), doc.version_number ? `v${doc.version_number}` : null, doc.updated_at ? fmtRelativeShort(doc.updated_at) : null]
        .filter(Boolean).join(" · ")
    : fallbackMeta;
  const eyebrow = `${docType.replace(/[-_]/g, " ").toUpperCase()}${status ? ` · ${status.toUpperCase()}` : ""}`;

  return (
    <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
      <button type="button" onClick={onBack} aria-label="Back" style={S.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button type="button" aria-label="Share" style={S.floatShare}>
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>

      <div style={S.breadcrumb}>
        <span style={S.breadcrumbLink}>Files</span>
        <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
        <span>Document</span>
      </div>

      <div style={S.docReaderHero}>
        <DocIcon kind={tone} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={S.docReaderTitle}>{title}</h1>
          <div style={S.detailSub}>{metaLine}</div>
        </div>
      </div>

      <div style={S.docReaderMeta}>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
        <span style={S.detailCount}>{doc ? "Live deliverable" : "Loading…"}</span>
      </div>

      <section style={S.readerPad}>
        <div style={S.readerSurface}>
          <div style={S.readerToolbar}>
            <span className="mb-mono" style={S.readerKicker}>{eyebrow}</span>
            <span style={S.readerPageCount}>{isGenerating ? "Generating" : "Live"}</span>
          </div>
          <div style={S.readerPage}>
            {loading && !doc ? (
              <p style={S.readerParagraph}>Loading document…</p>
            ) : error ? (
              <p style={S.readerParagraph}>{error}</p>
            ) : isGenerating ? (
              <>
                <div className="mb-mono" style={S.readerDocKicker}>YULIA</div>
                <h2 style={S.readerDocTitle}>{title}</h2>
                <p style={S.readerParagraph}>Yulia is still generating this document. It will appear here as soon as it&rsquo;s ready.</p>
              </>
            ) : markdown ? (
              <>
                <h2 style={S.readerDocTitle}>{title}</h2>
                <div style={S.readerMarkdown}>{markdown}</div>
              </>
            ) : (
              <>
                <h2 style={S.readerDocTitle}>{title}</h2>
                <p style={S.readerParagraph}>This document has no readable body yet.</p>
              </>
            )}
          </div>
        </div>
      </section>
      <div style={S.docChatDock}>
        <ChatStarterPill
          placeholder="Message Yulia"
          ariaLabel={`Message Yulia about ${title}`}
          onSend={(message) => onAskYulia(`About ${title}: ${message}`)}
        />
      </div>
    </div>
  );
}

function realDeliverableTone(docType: string, status: string, name: string): DocTone {
  const t = `${docType} ${name}`.toLowerCase();
  if (["executed", "locked"].includes(status)) return "signed";
  if (/loi|ioi|nda|agreement|contract|term/.test(t)) return "contract";
  if (/model|valuation|analysis|recast|score|risk|qoe|sensitivity|lbo|dcf/.test(t)) return "ai";
  if (/cim|memo|brief|summary|letter/.test(t)) return "memo";
  if (status === "draft") return "draft";
  return "memo";
}

/* Mirror of DocView.extractMarkdown — pulls a readable string out of the
   deliverable content (string, {markdown|content|text}, or {sections[]}),
   falling back to a fenced JSON dump so nothing real renders blank. */
function extractDeliverableMarkdown(content: unknown): string | null {
  if (content == null) return null;
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return extractDeliverableMarkdown(JSON.parse(trimmed)) || content;
      } catch {
        return content;
      }
    }
    return content;
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
        const heading = section.title || section.heading || section.name;
        const body = section.content || section.body || section.text;
        return [heading ? `## ${heading}` : "", typeof body === "string" ? body : ""].filter(Boolean).join("\n\n");
      })
      .filter(Boolean);
    if (parts.length) return parts.join("\n\n");
  }
  return "```json\n" + JSON.stringify(content, null, 2) + "\n```";
}

function fmtRelativeShort(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function LibraryFinderScreen({
  onBack,
  onOpenDetail,
  onOpenDealLibrary,
  initialFilter = "all",
  onFilterChange,
}: LibraryFinderScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilesFilter>(initialFilter);
  useEffect(() => setActiveFilter(initialFilter), [initialFilter]);
  const chooseFilter = (filter: FilesFilter) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };
  const filters = [
    { id: "all", label: "All", count: 24 },
    { id: "deals", label: "Portfolios", count: 2 },
    { id: "data-room", label: "Data room", count: 12 },
    { id: "actionable", label: "Actionable", count: 4 },
    { id: "docs", label: "Docs", count: 10 },
    { id: "analysis", label: "Analysis", count: 5 },
    { id: "shared", label: "Shared", count: 2 },
    { id: "secure", label: "Secure", count: 1 },
  ] satisfies { id: FilesFilter; label: string; count: number }[];
  const sections = getFilesSections(onOpenDetail);
  const dataRoomView = activeFilter === "data-room" || activeFilter === "secure";
  const showDealLibraries = activeFilter === "all" || activeFilter === "deals";
  const visibleSections = activeFilter === "all"
    ? sections
    : activeFilter === "deals" || dataRoomView
    ? []
    : sections.filter((section) => section.filters.includes(activeFilter));
  const scopeLabel = dataRoomView ? "Data room files" : activeFilter === "deals" ? "Portfolios" : "All deal files";
  const scopeSub = dataRoomView
    ? "Browse shared diligence rooms by portfolio, deal, category, and status."
    : "Browse deal libraries, documents, analysis, shared files, and secure data rooms.";
  const searchCopy = dataRoomView ? "Search data rooms and files" : "Search across deals and files";

  return (
    <div className="mb-fade-up" style={{ ...S.page, position: "relative" }}>
      <button type="button" onClick={onBack} aria-label="Back" style={S.floatBack}>
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button type="button" aria-label="Search files" style={S.floatShare}>
        <MobileIcon name="search" size={16} c="var(--mb-ink-1)" />
      </button>

      <div style={S.finderIntro}>
        <div style={S.breadcrumbInline}>
          <span style={S.breadcrumbLink}>Files</span>
          <MobileIcon name="chevron" c="var(--mb-ink-4)" size={9} />
          <span>{scopeLabel}</span>
        </div>
        <h1 style={S.detailTitle}>Files</h1>
        <div style={S.detailSub}>{scopeSub}</div>
      </div>

      <div style={S.finderHero}>
        <div style={S.finderHeroGlow} />
        <div className="mb-mono" style={S.heroKicker}>FILES</div>
        <h2 style={S.finderHeroTitle}>Find files across every deal library.</h2>
        <div style={S.finderStatRow}>
          <FinderStat value="3" label="Deals" />
          <FinderStat value="24" label="Files" />
          <FinderStat value="12" label="Data room" />
        </div>
      </div>

      <div className="mb-hide-scroll" style={S.filterRow}>
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.label}
            onClick={() => chooseFilter(filter.id)}
            style={{
              ...S.filterChip,
              background: activeFilter === filter.id ? "var(--mb-ink)" : "#fff",
              color: activeFilter === filter.id ? "#fff" : "var(--mb-ink-1)",
              boxShadow: activeFilter === filter.id ? "none" : "0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 0.5px var(--mb-line-2)",
            }}
          >
            {filter.label}
            <span
              className="mb-mono"
              style={{
                ...S.filterCount,
                background: activeFilter === filter.id ? "rgba(255,255,255,0.2)" : "var(--mb-card-2)",
                color: activeFilter === filter.id ? "#fff" : "var(--mb-ink-3)",
              }}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      <div style={S.detailSearchPad}>
        <div style={S.searchField}>
          <MobileIcon name="search" c="var(--mb-ink-3)" size={16} />
          <span style={S.searchText}>{searchCopy}</span>
          <span className="mb-mono" style={S.keyHint}>K</span>
        </div>
      </div>

      {showDealLibraries && (
        <DealLibrarySection onOpenDealLibrary={onOpenDealLibrary} />
      )}

      {dataRoomView && (
        <>
          <DataRoomDealSection onOpenDealLibrary={onOpenDealLibrary} />
          {getDataRoomStatusSections(onOpenDetail).map((section) => (
            <FinderSection
              key={section.title}
              eyebrow={section.eyebrow}
              title={section.title}
              sub={section.sub}
              rows={section.rows}
            />
          ))}
        </>
      )}

      {visibleSections.map((section) => (
        <FinderSection
          key={section.title}
          eyebrow={section.eyebrow}
          title={section.title}
          sub={section.sub}
          rows={section.rows}
        />
      ))}
    </div>
  );
}

function DealLibrarySection({ onOpenDealLibrary }: { onOpenDealLibrary: OpenDealLibraryHandler }) {
  return (
    <section style={S.finderSection}>
      <div className="mb-as-card" style={S.finderListCard}>
        <div style={S.finderCardHead}>
          <div>
            <div className="mb-section-eyebrow">PORTFOLIO → DEAL</div>
            <div style={S.finderTitleRow}>
              <h2 style={S.docTitle}>Deal libraries</h2>
              <MobileIcon name="chevron" c="var(--mb-ink-4)" size={13} />
            </div>
            <div style={S.docSub}>Open a portfolio deal to browse stages and files.</div>
          </div>
        </div>
        {dealLibraries.map((deal, index) => (
          <DocRow
            key={deal.title}
            row={{
              name: deal.title,
              meta: `${deal.portfolio} portfolio · All stages · ${deal.count} files`,
              pill: "Open",
              icon: <DealLibraryIcon />,
              onClick: () => onOpenDealLibrary(deal.title, deal.meta, deal.portfolio, "all"),
            }}
            last={index === dealLibraries.length - 1}
            showChevron
          />
        ))}
      </div>
    </section>
  );
}

function DataRoomDealSection({ onOpenDealLibrary }: { onOpenDealLibrary: OpenDealLibraryHandler }) {
  return (
    <section style={S.finderSection}>
      <div className="mb-as-card" style={S.finderListCard}>
        <div style={S.finderCardHead}>
          <div>
            <div className="mb-section-eyebrow">PORTFOLIO → DEAL → DATA ROOM</div>
            <div style={S.finderTitleRow}>
              <h2 style={S.docTitle}>Active data rooms</h2>
              <MobileIcon name="chevron" c="var(--mb-ink-4)" size={13} />
            </div>
            <div style={S.docSub}>Open a deal&rsquo;s shared diligence room.</div>
          </div>
        </div>
        {activeDataRooms.map((room, index) => (
          <DocRow
            key={room.title}
            row={{
              name: room.title,
              meta: room.meta,
              pill: "Open",
              icon: <PortfolioIcon />,
              onClick: () => onOpenDealLibrary(room.dealTitle, room.dealMeta, room.portfolio, "data-room"),
            }}
            last={index === activeDataRooms.length - 1}
            showChevron
          />
        ))}
      </div>
    </section>
  );
}

function FinderStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={S.finderStat}>
      <div className="mb-mono" style={S.finderStatValue}>{value}</div>
      <div style={S.finderStatLabel}>{label}</div>
    </div>
  );
}

function getFilesSections(onOpenDetail: OpenDocHandler): Array<{
  eyebrow: string;
  title: string;
  sub: string;
  filters: FilesFilter[];
  rows: DocRowData[];
}> {
  return [
    {
      eyebrow: "ACTIONABLE",
      title: "Needs your eye",
      sub: "Open items waiting on review, signature, or a decision.",
      filters: ["actionable"],
      rows: libraryActivity.map((row) => withDocClick(row, onOpenDetail)),
    },
    {
      eyebrow: "DOCUMENTS",
      title: "Drafts and working files",
      sub: "Letters, memos, and documents Yulia is actively shaping.",
      filters: ["docs"],
      rows: draftRows.map((row) => withDocClick(row, onOpenDetail)),
    },
    {
      eyebrow: "ANALYSIS",
      title: "Analysis",
      sub: "Recasts, fit memos, scorecards, and diligence notes.",
      filters: ["analysis"],
      rows: [
        withDocClick({ name: "Yulia · Recast walk-through", meta: "Analysis · v3 · 2 min ago", pill: "Open", icon: <DocIcon kind="ai" />, docKind: "ai" }, onOpenDetail),
        withDocClick({ name: "Buyer fit memo", meta: "You · 1 hr ago · 4 pages", pill: "Open", icon: <DocIcon kind="memo" />, docKind: "memo" }, onOpenDetail),
        withDocClick({ name: "Concentration risk note", meta: "Yulia · 18 hr ago · v2", pill: "Open", icon: <DocIcon kind="ai" />, docKind: "ai" }, onOpenDetail),
      ],
    },
    {
      eyebrow: "DATA ROOM",
      title: "Data room",
      sub: "Shared drive for diligence artifacts and legal documents, organized by deal.",
      filters: ["data-room", "secure"],
      rows: dataRoomRows.map((row) => withDocClick(row, onOpenDetail)),
    },
    {
      eyebrow: "SHARED & SECURE",
      title: "Shared and locked",
      sub: "Files sent externally, countersigned, or approved as immutable.",
      filters: ["shared", "secure"],
      rows: [
        withDocClick({ name: "Mutual NDA · seller counsel", meta: "Shared Apr 04 · 2 markups", pill: <StatusPill tone="review">Shared</StatusPill>, icon: <DocIcon kind="contract" />, docKind: "contract" }, onOpenDetail),
        withDocClick({ name: "IOI · v2 (sent)", meta: "Sent Apr 22 · awaiting reply", pill: <StatusPill tone="awaiting">Awaiting</StatusPill>, icon: <DocIcon kind="contract" />, docKind: "contract" }, onOpenDetail),
        ...signedRows.map((row) => withDocClick(row, onOpenDetail)),
      ],
    },
  ];
}

function getDataRoomStatusSections(onOpenDetail: OpenDocHandler): Array<{
  eyebrow: string;
  title: string;
  sub: string;
  rows: DocRowData[];
}> {
  return [
    {
      eyebrow: "ARTIFACTS",
      title: "Source artifacts",
      sub: "Company materials shared in the room for diligence review.",
      rows: [
        withDocClick({
          name: "Big Fake Deal · 2024 P&L",
          meta: "Buy portfolio · Big Fake Deal · Financial artifact",
          pill: "View",
          icon: <DocIcon kind="excel" />,
          docKind: "excel",
        }, onOpenDetail),
        withDocClick({
          name: "Pest Control · customer list",
          meta: "Buy portfolio · Pest Control · Commercial artifact",
          pill: "View",
          icon: <DocIcon kind="excel" />,
          docKind: "excel",
        }, onOpenDetail),
      ],
    },
    {
      eyebrow: "ACTION NEEDED",
      title: "Requested artifacts",
      sub: "Artifacts requested by the other side or newly received for review.",
      rows: [
        withDocClick({
          name: "Security findings request",
          meta: "Buy portfolio · Big Fake Deal · Buyer request",
          pill: <StatusPill tone="needed">Action needed</StatusPill>,
          icon: <DocIcon kind="pdf" />,
          docKind: "pdf",
        }, onOpenDetail),
        withDocClick({
          name: "Updated AR aging",
          meta: "Buy portfolio · Pest Control · Received artifact",
          pill: <StatusPill tone="needed">Received</StatusPill>,
          icon: <DocIcon kind="excel" />,
          docKind: "excel",
        }, onOpenDetail),
      ],
    },
    {
      eyebrow: "LEGAL DRAFTS",
      title: "Draft legal docs",
      sub: "Legal documents being drafted or marked up inside the shared room.",
      rows: [
        withDocClick({
          name: "Mutual NDA · seller counsel",
          meta: "Buy portfolio · Big Fake Deal · Legal draft",
          pill: <StatusPill tone="review">In review</StatusPill>,
          icon: <DocIcon kind="contract" />,
          docKind: "contract",
        }, onOpenDetail),
        withDocClick({
          name: "LOI · buyer markup",
          meta: "Buy portfolio · Pest Control · Legal draft",
          pill: <StatusPill tone="review">Markup</StatusPill>,
          icon: <DocIcon kind="contract" />,
          docKind: "contract",
        }, onOpenDetail),
      ],
    },
    {
      eyebrow: "EXECUTED LEGAL",
      title: "Executed legal docs",
      sub: "Locked transaction documents and countersigned files.",
      rows: [
        withDocClick({
          name: "Big Fake Deal · NDA",
          meta: "Buy portfolio · Big Fake Deal · Data room",
          pill: <StatusPill tone="signed">Executed</StatusPill>,
          icon: <DocIcon kind="signed" />,
          docKind: "signed",
        }, onOpenDetail),
        withDocClick({
          name: "Pest Control · NDA",
          meta: "Buy portfolio · Pest Control · Data room",
          pill: <StatusPill tone="signed">Executed</StatusPill>,
          icon: <DocIcon kind="signed" />,
          docKind: "signed",
        }, onOpenDetail),
      ],
    },
  ];
}

function getDealDataRoomSections(
  dealTitle: string,
  portfolioName: string,
  onOpenDetail: OpenDocHandler,
): Array<{
  anchorId: string;
  title: string;
  sub: string;
  rows: DocRowData[];
}> {
  const path = `${portfolioName} portfolio · ${dealTitle} · Data room`;
  return [
    {
      anchorId: "data-room-artifacts",
      title: "Artifacts",
      sub: "Company materials shared in the room for diligence review.",
      rows: [
        withDocClick({
          name: "2024 P&L · audited",
          meta: `${path} · Financial artifact`,
          pill: "View",
          icon: <DocIcon kind="excel" />,
          docKind: "excel",
        }, onOpenDetail),
        withDocClick({
          name: "Corporate org chart",
          meta: `${path} · Corporate artifact`,
          pill: "View",
          icon: <DocIcon kind="pdf" />,
          docKind: "pdf",
        }, onOpenDetail),
        withDocClick({
          name: "Customer list · top 25",
          meta: `${path} · Commercial artifact`,
          pill: "View",
          icon: <DocIcon kind="excel" />,
          docKind: "excel",
        }, onOpenDetail),
        withDocClick({
          name: "Route photos · April",
          meta: `${path} · Image artifact`,
          pill: "View",
          icon: <DocIcon kind="image" />,
          docKind: "image",
        }, onOpenDetail),
        withDocClick({
          name: "IT systems map",
          meta: `${path} · Operations artifact`,
          pill: "View",
          icon: <DocIcon kind="pdf" />,
          docKind: "pdf",
        }, onOpenDetail),
      ],
    },
    {
      anchorId: "data-room-requests",
      title: "Requested artifacts",
      sub: "Artifacts requested by the other side or newly received for review.",
      rows: [
        withDocClick({
          name: "Security findings request",
          meta: `${path} · Buyer request`,
          pill: <StatusPill tone="needed">Action requested</StatusPill>,
          icon: <DocIcon kind="pdf" />,
          docKind: "pdf",
        }, onOpenDetail),
        withDocClick({
          name: "Updated AR aging",
          meta: `${path} · Received artifact`,
          pill: <StatusPill tone="needed">Received</StatusPill>,
          icon: <DocIcon kind="excel" />,
          docKind: "excel",
        }, onOpenDetail),
      ],
    },
    {
      anchorId: "data-room-legal-drafts",
      title: "Draft legal docs",
      sub: "Legal documents being drafted or marked up inside the shared room.",
      rows: [
        withDocClick({
          name: "NDA · seller markup",
          meta: `${path} · Legal draft`,
          pill: <StatusPill tone="review">In review</StatusPill>,
          icon: <DocIcon kind="contract" />,
          docKind: "contract",
        }, onOpenDetail),
        withDocClick({
          name: "Mutual NDA · seller counsel",
          meta: `${path} · Transaction doc`,
          pill: <StatusPill tone="review">Attorney review</StatusPill>,
          icon: <DocIcon kind="contract" />,
          docKind: "contract",
        }, onOpenDetail),
        withDocClick({
          name: "LOI · buyer comments",
          meta: `${path} · Legal draft`,
          pill: <StatusPill tone="review">Markup</StatusPill>,
          icon: <DocIcon kind="contract" />,
          docKind: "contract",
        }, onOpenDetail),
      ],
    },
    {
      anchorId: "data-room-executed-legal",
      title: "Executed legal docs",
      sub: "Locked transaction documents and countersigned files.",
      rows: [
        withDocClick({
          name: "NDA · countersigned",
          meta: `${path} · Transaction doc`,
          pill: <StatusPill tone="signed">Executed</StatusPill>,
          icon: <DocIcon kind="signed" />,
          docKind: "signed",
        }, onOpenDetail),
        withDocClick({
          name: "Exclusivity agreement · executed",
          meta: `${path} · Transaction doc`,
          pill: <StatusPill tone="signed">Executed</StatusPill>,
          icon: <DocIcon kind="signed" />,
          docKind: "signed",
        }, onOpenDetail),
      ],
    },
  ];
}

function withDocClick(row: DocRowData, onOpenDoc: OpenDocHandler): DocRowData {
  return {
    ...row,
    onClick: () => onOpenDoc(row.name, row.meta, docKindForRow(row)),
  };
}

function docKindForRow(row: DocRowData): string {
  if (row.docKind) return row.docKind;
  if (typeof row.icon === "string") return row.icon;
  const text = `${row.name} ${row.meta}`.toLowerCase();
  if (text.includes("png") || text.includes("jpg") || text.includes("photo") || text.includes("image")) return "image";
  if (text.includes("p&l") || text.includes("excel") || text.includes("csv") || text.includes("customer list")) return "excel";
  if (text.includes("pdf") || text.includes("tax") || text.includes("insurance")) return "pdf";
  if (text.includes("nda") || text.includes("loi") || text.includes("counsel") || text.includes("sent")) return "contract";
  if (text.includes("yulia") || text.includes("analysis") || text.includes("risk")) return "ai";
  if (text.includes("draft") || text.includes("ioi")) return "draft";
  return "memo";
}

function docToneFromKind(kind?: string): DocTone {
  const normalized = kind === "sheet" || kind === "chart" ? "excel" : kind === "lock" ? "signed" : kind;
  return normalized === "ai" ||
    normalized === "memo" ||
    normalized === "draft" ||
    normalized === "contract" ||
    normalized === "signed" ||
    normalized === "pdf" ||
    normalized === "excel" ||
    normalized === "image"
    ? normalized
    : "memo";
}

function FinderSection({
  eyebrow,
  title,
  sub,
  rows,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  rows: DocRowData[];
}) {
  return (
    <section style={S.finderSection}>
      <div className="mb-as-card" style={S.finderListCard}>
        <div style={S.finderCardHead}>
          <div>
            <div className="mb-section-eyebrow">{eyebrow}</div>
            <div style={S.finderTitleRow}>
              <h2 style={S.docTitle}>{title}</h2>
              <MobileIcon name="chevron" c="var(--mb-ink-4)" size={13} />
            </div>
            <div style={S.docSub}>{sub}</div>
          </div>
        </div>
        {rows.map((row, index) => (
          <DocRow key={row.name} row={row} last={index === rows.length - 1} showChevron />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={S.sectionHeader}>
      <div className="mb-section-eyebrow">{eyebrow}</div>
      <div className="mb-section-title" style={{ fontSize: 24 }}>{title}</div>
    </div>
  );
}

function DocSection({
  anchorId,
  title,
  sub,
  rows,
  onOpenDoc,
  cap = 4,
}: {
  anchorId?: string;
  title: string;
  sub: string;
  rows: DocRowData[];
  onOpenDoc?: OpenDocHandler;
  cap?: number;
}) {
  const [open, setOpen] = useState(false);
  const visible = open ? rows : rows.slice(0, cap);
  const hasMore = rows.length > cap;

  return (
    <section id={anchorId} style={S.docSection}>
      <div style={S.docHeader}>
        <h2 style={S.docTitle}>{title}</h2>
        <div style={S.docSub}>{sub}</div>
      </div>
      <div style={S.docRows}>
        {visible.map((row, index) => {
          const clickableRow = onOpenDoc && !row.onClick ? withDocClick(row, onOpenDoc) : row;
          return (
            <DocRow
              key={row.name}
              row={clickableRow}
              last={index === visible.length - 1 && (!hasMore || open)}
              showChevron={Boolean(clickableRow.onClick)}
            />
          );
        })}
        {hasMore && (
          <button type="button" onClick={() => setOpen((value) => !value)} style={S.showMore}>
            {open ? "Show less" : `See all ${rows.length}`}
            <MobileIcon name="chevron" c="var(--mb-accent-ink)" size={11} />
          </button>
        )}
      </div>
    </section>
  );
}

function DocRow({ row, last, showChevron = false }: { row: DocRowData; last: boolean; showChevron?: boolean }) {
  const body = (
    <>
      {typeof row.icon === "string" ? <SimpleDocIcon kind={row.icon} /> : row.icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.rowTitle}>{row.name}</div>
        <div style={S.rowMetaLine}>
          {row.stage === "data-room" && <span style={S.stageTag}>Data room</span>}
          <span style={S.rowMeta}>{row.meta}</span>
        </div>
      </div>
      <span style={S.rowTrailing}>
        {typeof row.pill === "string" ? <span style={S.actionPill}>{row.pill}</span> : row.pill}
        {showChevron && <MobileIcon name="chevron" c="var(--mb-ink-4)" size={11} />}
      </span>
    </>
  );

  // A status control turns the row into a stacked container (row + control)
  // so the control gets its own tap target below the clickable row.
  if (row.statusControl) {
    return (
      <div style={{ ...S.docRowStack, borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)" }}>
        {row.onClick ? (
          <button type="button" onClick={row.onClick} style={{ ...S.docRow, padding: "12px 0 0" }}>
            {body}
          </button>
        ) : (
          <div style={{ ...S.docRow, padding: "12px 0 0" }}>{body}</div>
        )}
        {row.statusControl}
      </div>
    );
  }

  if (row.onClick) {
    return (
      <button
        type="button"
        onClick={row.onClick}
        style={{ ...S.docRow, borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)" }}
      >
        {body}
      </button>
    );
  }

  return (
    <div style={{ ...S.docRow, borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)" }}>
      {body}
    </div>
  );
}

function SimpleDocIcon({ kind }: { kind: string }) {
  return <DocIcon kind={docToneFromKind(kind)} />;
}

function DealLibraryIcon() {
  return (
    <div aria-hidden="true" style={{ ...S.docIcon, background: "var(--mb-blue-soft)", color: "var(--mb-blue-ink)" }}>
      <FolderKanban size={21} strokeWidth={2.1} />
    </div>
  );
}

function PortfolioIcon() {
  return (
    <div aria-hidden="true" style={{ ...S.docIcon, background: "var(--mb-blue-soft)", color: "var(--mb-blue-ink)" }}>
      <BriefcaseBusiness size={21} strokeWidth={2.1} />
    </div>
  );
}

function DocIcon({ kind }: { kind: DocTone }) {
  const map: Record<DocTone, { bg: string; color: string; Icon: LucideIcon }> = {
    ai: { bg: "var(--mb-accent-soft)", color: "var(--mb-accent-ink)", Icon: Brain },
    memo: { bg: "var(--mb-card-2)", color: "var(--mb-ink-2)", Icon: FileText },
    draft: { bg: "var(--mb-warn-soft)", color: "var(--mb-warn-ink)", Icon: FilePenLine },
    contract: { bg: "var(--mb-verdict-pursue-soft)", color: "var(--mb-verdict-pursue-ink)", Icon: FileSignature },
    signed: { bg: "var(--mb-ink)", color: "#fff", Icon: FileCheck2 },
    pdf: { bg: "var(--mb-danger-soft)", color: "var(--mb-danger-ink)", Icon: ScrollText },
    excel: { bg: "var(--mb-verdict-pursue-soft)", color: "var(--mb-verdict-pursue-ink)", Icon: FileSpreadsheet },
    image: { bg: "var(--mb-blue-soft)", color: "var(--mb-blue-ink)", Icon: FileImage },
  };
  const item = map[kind];
  const Icon = item.Icon;
  return (
    <div
      aria-hidden="true"
      style={{
        ...S.docIcon,
        background: item.bg,
        color: item.color,
      }}
    >
      <Icon size={21} strokeWidth={2.1} />
    </div>
  );
}

function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const map: Record<PillTone, { bg: string; color: string }> = {
    draft: { bg: "var(--mb-warn-soft)", color: "var(--mb-warn-ink)" },
    lock: { bg: "var(--mb-card-2)", color: "var(--mb-ink-3)" },
    review: { bg: "var(--mb-accent-soft)", color: "var(--mb-accent-ink)" },
    awaiting: { bg: "rgba(216,139,132,0.18)", color: "var(--mb-danger-ink)" },
    signed: { bg: "var(--mb-verdict-pursue-soft)", color: "var(--mb-verdict-pursue-ink)" },
    needed: { bg: "var(--mb-warn-soft)", color: "var(--mb-warn-ink)" },
  };
  return <span style={{ ...S.statusPill, background: map[tone].bg, color: map[tone].color }}>{children}</span>;
}

function CategoryCard({
  eyebrow,
  title,
  sub,
  tone,
  onClick,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  tone: "gold" | "purple" | "sage" | "blue" | "plum" | "slate";
  onClick?: () => void;
}) {
  const toneStyle = categoryTones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S.catCard,
        background: toneStyle.background,
        boxShadow:
          `0 12px 28px -10px ${toneStyle.glow}, ` +
          "0 6px 16px -6px rgba(0,0,0,0.24), " +
          "inset 0 1px 0 rgba(255,255,255,0.22), " +
          "inset 0 -1px 0 rgba(0,0,0,0.18)",
      }}
    >
      <div style={S.catGlow} />
      <span className="mb-mono" style={S.catEyebrow}>{eyebrow}</span>
      <span style={S.catBody}>
        <span style={S.catTitle}>{title}</span>
        {sub && <span style={S.catSub}>{sub}</span>}
      </span>
    </button>
  );
}

const categoryTones = {
  gold: {
    background: `linear-gradient(160deg, rgba(202,150,82,0.30) 0%, rgba(128,86,36,0.62) 100%), url('${RANDOM_TEXTURES.card}')`,
    glow: "rgba(180,128,52,0.32)",
  },
  purple: {
    background: `linear-gradient(160deg, rgba(125,98,170,0.30) 0%, rgba(75,52,128,0.62) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
    glow: "rgba(110,82,158,0.30)",
  },
  sage: {
    background: `linear-gradient(160deg, rgba(63,138,106,0.30) 0%, rgba(40,92,70,0.62) 100%), url('${RANDOM_TEXTURES.cardPursue}')`,
    glow: "rgba(63,138,106,0.30)",
  },
  blue: {
    background: `linear-gradient(160deg, rgba(60,108,168,0.30) 0%, rgba(25,68,118,0.62) 100%), url('${RANDOM_TEXTURES.cardBaseline}')`,
    glow: "rgba(60,108,168,0.30)",
  },
  plum: {
    background: `linear-gradient(160deg, rgba(168,90,124,0.30) 0%, rgba(108,46,76,0.62) 100%), url('${RANDOM_TEXTURES.cardBuyers}')`,
    glow: "rgba(150,78,108,0.28)",
  },
  slate: {
    background: `linear-gradient(160deg, rgba(70,90,110,0.30) 0%, rgba(34,48,68,0.66) 100%), url('${RANDOM_TEXTURES.cardBaseline}')`,
    glow: "rgba(50,72,98,0.30)",
  },
};

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    paddingBottom: 120,
    background: "#fff",
  },
  filesPage: {
    minHeight: "auto",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
    background: "transparent",
  },
  searchPage: {
    minHeight: "auto",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 112px)",
    background: "transparent",
  },
  cardPad: {
    padding: "0 16px",
  },
  emptyPad: {
    padding: "8px 16px 0",
  },
  realStatePad: {
    padding: "10px 16px 0",
  },
  realStateCard: {
    padding: "26px 22px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  realStateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    display: "grid",
    placeItems: "center",
    marginBottom: 14,
  },
  realStateKicker: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "var(--mb-ink-3)",
    marginBottom: 8,
  },
  realStateTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: "-0.4px",
    lineHeight: 1.15,
    color: "var(--mb-ink)",
  },
  realStateCopy: {
    fontSize: 14,
    lineHeight: 1.45,
    color: "var(--mb-ink-3)",
    marginTop: 8,
    textWrap: "pretty",
  },
  emptyCard: {
    padding: "40px 24px 36px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    display: "grid",
    placeItems: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: "-0.6px",
    lineHeight: 1.1,
    color: "var(--mb-ink)",
    margin: 0,
    textWrap: "balance",
  },
  emptyCopy: {
    fontSize: 14.5,
    lineHeight: 1.45,
    color: "var(--mb-ink-3)",
    margin: "10px 0 0",
    maxWidth: 300,
    textWrap: "pretty",
  },
  emptyCta: {
    marginTop: 22,
    border: "none",
    borderRadius: 999,
    padding: "13px 26px",
    background: "linear-gradient(180deg, var(--mb-accent), var(--mb-accent-2))",
    color: "var(--mb-ink)",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "-0.2px",
    cursor: "pointer",
    boxShadow: "0 10px 24px -10px rgba(43,255,119,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
  },
  librarySectionPad: {
    marginTop: 36,
    padding: "0 16px",
  },
  eyebrowInset: {
    padding: "0 6px 6px",
  },
  goldHero: {
    all: "unset",
    boxSizing: "border-box",
    display: "block",
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    color: "#fff",
    cursor: "pointer",
    backgroundImage: `linear-gradient(160deg, rgba(202,150,82,0.30) 0%, rgba(128,86,36,0.62) 100%), url('${RANDOM_TEXTURES.welcome}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow:
      "0 14px 36px -10px rgba(180,128,52,0.32), " +
      "0 8px 20px -8px rgba(0,0,0,0.26), " +
      "inset 0 1px 0 rgba(255,255,255,0.24), " +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
  },
  searchHero: {
    all: "unset",
    boxSizing: "border-box",
    display: "block",
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    color: "#fff",
    cursor: "pointer",
    backgroundImage: `linear-gradient(160deg, rgba(95,115,200,0.30) 0%, rgba(50,72,160,0.62) 100%), url('${RANDOM_TEXTURES.baseline}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow:
      "0 14px 36px -10px rgba(95,115,200,0.32), " +
      "0 8px 20px -8px rgba(0,0,0,0.26), " +
      "inset 0 1px 0 rgba(255,255,255,0.24), " +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
  },
  heroGlow: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.20), transparent 65%)",
  },
  heroBody: {
    position: "relative",
    padding: "18px 22px 14px",
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  heroTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 26,
    letterSpacing: "-0.7px",
    lineHeight: 1.08,
    margin: "10px 0 0",
    textWrap: "balance",
  },
  heroCopy: {
    fontSize: 14,
    margin: "10px 0 0",
    lineHeight: 1.4,
    color: "#fff",
    opacity: 1,
  },
  heroAction: {
    position: "relative",
    margin: "4px 14px 14px",
    padding: "10px 12px",
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.14), transparent 42%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.34)",
    borderRadius: 16,
    boxShadow:
      "0 10px 26px -18px rgba(0,0,0,0.44), " +
      "inset 0 1px 0 rgba(255,255,255,0.34), " +
      "inset 0 -1px 0 rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  heroActionTitle: {
    fontSize: 14.5,
    fontWeight: 600,
    letterSpacing: "-0.2px",
  },
  heroActionMeta: {
    fontSize: 12.5,
    marginTop: 1,
    color: "#fff",
    opacity: 1,
  },
  heroButton: {
    padding: "7px 18px",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 999,
    background: "linear-gradient(180deg, rgba(255,255,255,0.078), rgba(255,255,255,0.02))",
    color: "#fff",
  },
  searchHeroAction: {
    marginTop: 16,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.14), transparent 42%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.34)",
    boxShadow:
      "0 10px 26px -18px rgba(0,0,0,0.44), " +
      "inset 0 1px 0 rgba(255,255,255,0.34), " +
      "inset 0 -1px 0 rgba(255,255,255,0.05)",
  },
  searchHeroActionCopy: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  searchHeroActionTitle: {
    fontSize: 14,
    fontWeight: 750,
    color: "#fff",
    letterSpacing: "-0.22px",
  },
  searchHeroActionMeta: {
    fontSize: 12,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  searchHeroActionPill: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    minWidth: 62,
    borderRadius: 999,
    padding: "6px 14px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.078), rgba(255,255,255,0.02))",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "-0.08px",
  },
  libraryPortal: {
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    color: "#fff",
    backgroundImage:
      `linear-gradient(165deg, rgba(63,138,106,0.34) 0%, rgba(48,74,130,0.68) 100%), url('${RANDOM_TEXTURES.files}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow:
      "0 14px 36px -10px rgba(70,110,150,0.34), " +
      "0 8px 20px -8px rgba(0,0,0,0.26), " +
      "inset 0 1px 0 rgba(255,255,255,0.24), " +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
  },
  portalGlow: {
    position: "absolute",
    top: -70,
    right: -34,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.22), transparent 64%)",
  },
  portalHeader: {
    position: "relative",
    padding: "20px 22px 14px",
  },
  portalTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 26,
    letterSpacing: "-0.7px",
    lineHeight: 1.08,
    margin: "10px 0 0",
    color: "#fff",
    textWrap: "balance",
  },
  portalCopy: {
    fontSize: 14,
    margin: "10px 0 0",
    lineHeight: 1.4,
    color: "#fff",
    opacity: 1,
    textWrap: "pretty",
  },
  portalRows: {
    position: "relative",
    margin: "0 14px 14px",
    borderRadius: 16,
    overflow: "hidden",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.095), transparent 40%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.32)",
    boxShadow:
      "0 12px 28px -20px rgba(0,0,0,0.46), " +
      "inset 0 1px 0 rgba(255,255,255,0.30), " +
      "inset 0 -1px 0 rgba(255,255,255,0.04)",
  },
  portalLink: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    background: "transparent",
    color: "#fff",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
  },
  portalCount: {
    width: 30,
    height: 30,
    borderRadius: 10,
    background: "linear-gradient(180deg, rgba(255,255,255,0.066), rgba(255,255,255,0.018))",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--mb-font-mono)",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  portalLabel: {
    display: "block",
    fontSize: 14.5,
    fontWeight: 700,
    letterSpacing: "-0.2px",
    lineHeight: 1.2,
  },
  portalSub: {
    display: "block",
    fontSize: 12.5,
    color: "#fff",
    marginTop: 2,
    lineHeight: 1.3,
  },
  portalArrow: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    flexShrink: 0,
  },
  activityCard: {
    padding: "20px 0 6px",
    overflow: "hidden",
  },
  activityRows: {
    padding: "0 18px",
  },
  activitySub: {
    fontSize: 13.5,
    color: "var(--mb-ink-3)",
    marginTop: 4,
    lineHeight: 1.4,
    textWrap: "pretty",
  },
  finderCtaPad: {
    marginTop: 30,
    padding: "0 16px",
  },
  activeRoomsCard: {
    padding: "18px 18px 6px",
  },
  activeRoomsHeader: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "0 2px 12px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
  },
  activeRoomsEyebrow: {
    padding: "2px 4px 4px",
  },
  finderCtaTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "-0.5px",
    color: "var(--mb-ink)",
    marginTop: 3,
  },
  finderCtaSub: {
    fontSize: 13.5,
    color: "var(--mb-ink-3)",
    lineHeight: 1.4,
    marginTop: 3,
    textWrap: "pretty",
  },
  docSection: {
    marginTop: 28,
  },
  docHeader: {
    padding: "0 22px 10px",
  },
  docTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: "-0.6px",
    color: "var(--mb-ink)",
    margin: 0,
    textWrap: "balance",
  },
  docSub: {
    fontSize: 14,
    color: "var(--mb-ink-3)",
    marginTop: 2,
    lineHeight: 1.4,
    textWrap: "pretty",
  },
  docRows: {
    padding: "0 22px",
  },
  docRow: {
    width: "100%",
    boxSizing: "border-box",
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 0",
    textAlign: "left",
    cursor: "pointer",
    minWidth: 0,
    overflow: "hidden",
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--mb-ink)",
    letterSpacing: "-0.2px",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowMeta: {
    fontSize: 12.5,
    color: "var(--mb-ink-3)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowMetaLine: {
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  stageTag: {
    flexShrink: 0,
    padding: "1.5px 6px",
    borderRadius: 999,
    background: "var(--mb-blue-soft)",
    color: "var(--mb-blue-ink)",
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  rowTrailing: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    maxWidth: "42%",
    minWidth: 0,
  },
  actionPill: {
    padding: "5px 11px",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    minWidth: 58,
    textAlign: "center",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  showMore: {
    padding: "14px 0 4px",
    background: "transparent",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "var(--mb-accent-ink)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  searchPad: {
    padding: "0 16px 18px",
  },
  marketComposer: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 8px 8px 12px",
    borderRadius: 16,
    background: "var(--mb-card-2)",
    border: "0.5px solid var(--mb-line-2)",
  },
  marketComposerInput: {
    all: "unset",
    flex: 1,
    minWidth: 0,
    fontSize: 15.5,
    lineHeight: 1.25,
    color: "var(--mb-ink)",
  },
  marketComposerSend: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: "none",
    background: "var(--mb-ink)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    cursor: "pointer",
  },
  searchField: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--mb-card-2)",
    border: "none",
    textAlign: "left",
  },
  searchText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: "var(--mb-ink-3)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  keyHint: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--mb-ink-4)",
    padding: "3px 7px",
    border: "0.5px solid var(--mb-line)",
    borderRadius: 5,
  },
  chatPill: {
    marginTop: 16,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    background: "rgba(255,255,255,0.22)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "0.5px solid rgba(255,255,255,0.34)",
    borderRadius: 999,
    fontSize: 13.5,
    fontWeight: 600,
  },
  chatBadge: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    color: "#5C70C6",
    fontSize: 11,
    fontWeight: 800,
  },
  sectionHeader: {
    padding: "24px 22px 10px",
  },
  categoryGrid: {
    padding: "4px 16px 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  catCard: {
    all: "unset",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    borderRadius: 18,
    minHeight: 142,
    padding: "16px 14px 18px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#fff",
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
  },
  catGlow: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.20), transparent 65%)",
  },
  catEyebrow: {
    position: "relative",
    fontSize: 9.5,
    letterSpacing: "0.16em",
    fontWeight: 700,
    opacity: 1,
  },
  catTitle: {
    display: "block",
    position: "relative",
    fontFamily: "var(--mb-font-display)",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.4px",
    lineHeight: 1.15,
    textWrap: "balance",
  },
  catBody: {
    position: "relative",
    display: "block",
  },
  catSub: {
    display: "block",
    marginTop: 6,
    fontSize: 11.5,
    lineHeight: 1.28,
    color: "#fff",
    textWrap: "pretty",
  },
  quickStartPad: {
    padding: "0 16px",
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  quickStartChip: {
    border: "none",
    borderRadius: 999,
    padding: "9px 12px",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  listCard: {
    padding: "4px 0",
  },
  recentRow: {
    width: "100%",
    background: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 18px",
    textAlign: "left",
    cursor: "pointer",
  },
  recentIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  floatBack: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 16px)",
    left: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  floatShare: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 16px)",
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  floatShareLink: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 44px) + 16px)",
    right: 56,
    zIndex: 10,
    minWidth: 32,
    height: 32,
    padding: "0 6px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  floatShareBadge: {
    minWidth: 16,
    height: 16,
    padding: "0 4px",
    borderRadius: 999,
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    fontSize: 10,
    fontWeight: 800,
    lineHeight: "16px",
    textAlign: "center",
  },
  finderIntro: {
    padding: "calc(env(safe-area-inset-top, 44px) + 60px) 22px 18px",
  },
  breadcrumbInline: {
    fontSize: 12.5,
    color: "var(--mb-ink-3)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  finderHero: {
    margin: "0 16px 18px",
    borderRadius: 22,
    position: "relative",
    overflow: "hidden",
    color: "#fff",
    padding: "20px 22px 16px",
    backgroundImage:
      `linear-gradient(165deg, rgba(95,115,200,0.32) 0%, rgba(50,72,160,0.68) 100%), url('${RANDOM_TEXTURES.baseline}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    boxShadow:
      "0 14px 36px -10px rgba(95,115,200,0.30), " +
      "0 8px 20px -8px rgba(0,0,0,0.24), " +
      "inset 0 1px 0 rgba(255,255,255,0.24), " +
      "inset 0 -1px 0 rgba(0,0,0,0.20)",
  },
  finderHeroGlow: {
    position: "absolute",
    top: -70,
    right: -42,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.22), transparent 64%)",
  },
  finderHeroTitle: {
    position: "relative",
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 25,
    letterSpacing: "-0.7px",
    lineHeight: 1.08,
    color: "#fff",
    margin: "10px 0 18px",
    textWrap: "balance",
  },
  finderStatRow: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  finderStat: {
    minWidth: 0,
    borderRadius: 14,
    padding: "10px 8px",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.095), transparent 40%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.003))",
    border: "0.5px solid rgba(255,255,255,0.30)",
    boxShadow:
      "0 10px 24px -20px rgba(0,0,0,0.44), " +
      "inset 0 1px 0 rgba(255,255,255,0.30), " +
      "inset 0 -1px 0 rgba(255,255,255,0.04)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
  },
  finderStatValue: {
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "0.04em",
  },
  finderStatLabel: {
    fontSize: 11.5,
    color: "#fff",
    marginTop: 3,
    lineHeight: 1.2,
  },
  breadcrumb: {
    padding: "calc(env(safe-area-inset-top, 44px) + 60px) 22px 6px",
    fontSize: 12.5,
    color: "var(--mb-ink-3)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    color: "var(--mb-accent-ink)",
    fontWeight: 600,
  },
  detailHero: {
    padding: "4px 22px 18px",
  },
  detailTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 32,
    letterSpacing: "-1px",
    lineHeight: 1.05,
    margin: 0,
    color: "var(--mb-ink)",
  },
  detailSub: {
    fontSize: 14,
    color: "var(--mb-ink-3)",
    marginTop: 4,
  },
  detailMeta: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  fitPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    borderRadius: 999,
    background: "var(--mb-verdict-pursue-soft)",
    color: "var(--mb-verdict-pursue-ink)",
  },
  fitDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--mb-verdict-pursue)",
  },
  detailCount: {
    fontSize: 12,
    color: "var(--mb-ink-3)",
  },
  filterRow: {
    display: "flex",
    gap: 8,
    padding: "0 22px 12px",
    overflowX: "auto",
  },
  filterChip: {
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  filterCount: {
    fontSize: 10.5,
    padding: "1px 6px",
    borderRadius: 999,
  },
  detailSearchPad: {
    padding: "4px 22px",
  },
  stageBannerPad: {
    padding: "0 22px 12px",
  },
  stageBanner: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "var(--mb-card)",
    border: "0.5px solid var(--mb-line-2)",
  },
  stageBannerDataRoom: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(238,241,251,0.92), rgba(234,240,250,0.72))",
    border: "0.5px solid rgba(79,96,189,0.14)",
  },
  stageBannerTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 21,
    fontWeight: 760,
    color: "var(--mb-ink)",
    letterSpacing: "-0.4px",
    marginTop: 2,
  },
  stageBannerSub: {
    fontSize: 13.5,
    lineHeight: 1.35,
    color: "var(--mb-ink-3)",
    marginTop: 3,
    textWrap: "pretty",
  },
  boundaryPad: {
    padding: "0 22px 14px",
  },
  privateBoundaryCard: {
    padding: "16px 16px 14px",
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(247,248,252,0.92))",
    border: "0.5px solid var(--mb-line-2)",
  },
  sharedBoundaryCard: {
    padding: "16px 16px 14px",
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(241,247,244,0.98), rgba(236,243,255,0.88))",
    border: "0.5px solid rgba(64,128,102,0.16)",
  },
  boundaryTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 22,
    lineHeight: 1.08,
    fontWeight: 780,
    letterSpacing: "-0.5px",
    color: "var(--mb-ink)",
    marginTop: 4,
  },
  boundaryCopy: {
    marginTop: 5,
    fontSize: 13.5,
    lineHeight: 1.4,
    color: "var(--mb-ink-3)",
    textWrap: "pretty",
  },
  boundaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    marginTop: 14,
  },
  boundaryStat: {
    minWidth: 0,
    borderRadius: 13,
    padding: "10px 9px",
    background: "rgba(255,255,255,0.62)",
    border: "0.5px solid rgba(120,130,150,0.16)",
  },
  boundaryStatLabel: {
    fontSize: 11,
    fontWeight: 760,
    color: "var(--mb-ink)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  boundaryStatValue: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 1.2,
    color: "var(--mb-ink-3)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  boundaryActions: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    marginTop: 14,
  },
  boundaryPrimaryButton: {
    border: "none",
    borderRadius: 999,
    padding: "10px 12px",
    background: "var(--mb-ink)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 760,
    cursor: "pointer",
  },
  roomCategoryPad: {
    padding: "0 22px 12px",
  },
  roomCategoryEyebrow: {
    padding: "0 2px 7px",
  },
  roomCategoryRail: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 2,
  },
  roomCategoryChip: {
    border: "0.5px solid var(--mb-line-2)",
    borderRadius: 14,
    background: "#fff",
    boxShadow: "0 6px 18px -12px rgba(16,24,40,0.34), inset 0 1px 0 rgba(255,255,255,0.74)",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 12px",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  roomCategoryLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--mb-ink)",
    letterSpacing: "-0.1px",
  },
  roomCategoryCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    padding: "0 6px",
    background: "var(--mb-card-2)",
    color: "var(--mb-ink-3)",
    fontSize: 10.5,
    fontWeight: 700,
  },

  // ── Real data-room write controls ─────────────────────────────────────
  spin: {
    animation: "spin 0.9s linear infinite",
  },
  realWritePad: {
    padding: "12px 16px 0",
  },
  writeErrorBanner: {
    borderRadius: 14,
    padding: "11px 14px",
    background: "var(--mb-danger-soft)",
    color: "var(--mb-danger-ink)",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.4,
    textWrap: "pretty",
    boxShadow: "inset 0 0 0 0.5px rgba(216,139,132,0.4)",
  },
  uploadCard: {
    padding: "16px 16px 14px",
  },
  uploadCardHead: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  uploadCardTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "-0.4px",
    color: "var(--mb-ink)",
    marginTop: 2,
  },
  uploadCardSub: {
    fontSize: 12.5,
    color: "var(--mb-ink-3)",
    marginTop: 3,
    lineHeight: 1.4,
    textWrap: "pretty",
  },
  uploadButton: {
    flexShrink: 0,
    border: "none",
    borderRadius: 999,
    padding: "9px 14px",
    background: "var(--mb-ink)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 760,
    letterSpacing: "-0.1px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    whiteSpace: "nowrap",
  },
  folderTargetRail: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    marginTop: 13,
    paddingBottom: 2,
  },
  folderTargetChip: {
    flexShrink: 0,
    border: "none",
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: "-0.1px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  fileToRoomButton: {
    border: "none",
    borderRadius: 999,
    padding: "7px 12px",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    fontSize: 12,
    fontWeight: 760,
    letterSpacing: "-0.1px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  },
  docRowStack: {
    display: "flex",
    flexDirection: "column",
    paddingBottom: 12,
  },
  statusControlRow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 0 0 50px",
  },
  statusControlCurrent: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "var(--mb-ink-3)",
  },
  statusAdvanceButton: {
    border: "none",
    borderRadius: 999,
    padding: "6px 12px",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    fontSize: 11.5,
    fontWeight: 760,
    letterSpacing: "-0.1px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
  },

  finderSection: {
    marginTop: 30,
    padding: "0 16px",
  },
  finderSectionHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    padding: "0 6px 10px",
  },
  finderListCard: {
    padding: "20px 18px 6px",
  },
  finderCardHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    padding: "0 4px 12px",
  },
  finderTitleRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    marginTop: 2,
  },
  docReaderHero: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "38px 22px 0",
  },
  docReaderTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 31,
    lineHeight: 1.02,
    letterSpacing: "-1px",
    color: "var(--mb-ink)",
    margin: 0,
    textWrap: "balance",
  },
  docReaderMeta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 22px 0",
    flexWrap: "wrap",
  },
  docActionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: "18px 22px 0",
  },
  docPrimaryAction: {
    minHeight: 46,
    borderRadius: 999,
    border: "none",
    background: "var(--mb-ink)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  docSecondaryAction: {
    minHeight: 46,
    borderRadius: 999,
    border: "none",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  readerPad: {
    padding: "22px 16px 0",
  },
  readerSurface: {
    borderRadius: 24,
    background: "linear-gradient(180deg, #F5F6FA 0%, #FFFFFF 36%)",
    border: "0.5px solid var(--mb-line-2)",
    boxShadow: "0 16px 34px -22px rgba(26,34,51,0.30)",
    overflow: "hidden",
  },
  readerToolbar: {
    minHeight: 48,
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "0.5px solid var(--mb-line-2)",
  },
  readerKicker: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "var(--mb-accent-ink)",
  },
  readerPageCount: {
    fontSize: 12.5,
    color: "var(--mb-ink-3)",
  },
  readerPage: {
    margin: "18px",
    padding: "24px 22px",
    minHeight: 360,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 10px 30px -24px rgba(26,34,51,0.36)",
  },
  readerDocKicker: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "var(--mb-ink-3)",
  },
  readerDocTitle: {
    fontFamily: "var(--mb-font-display)",
    fontWeight: 800,
    fontSize: 28,
    lineHeight: 1.05,
    color: "var(--mb-ink)",
    letterSpacing: "-0.9px",
    margin: "12px 0 16px",
    textWrap: "balance",
  },
  readerParagraph: {
    fontSize: 15,
    lineHeight: 1.55,
    color: "var(--mb-ink-2)",
    margin: "0 0 14px",
  },
  readerMarkdown: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "var(--mb-ink-2)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
  },
  readerCallout: {
    marginTop: 22,
    padding: 16,
    borderRadius: 14,
    background: "var(--mb-warn-soft)",
    color: "var(--mb-ink)",
  },
  dataPreviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 22,
  },
  dataPreviewCell: {
    minHeight: 92,
    padding: 14,
    borderRadius: 14,
    background: "var(--mb-card-2)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "var(--mb-ink)",
  },
  dataPreviewLabel: {
    fontSize: 12,
    color: "var(--mb-ink-3)",
  },
  docChatDock: {
    position: "fixed",
    left: 20,
    right: 20,
    bottom: "calc(92px + env(safe-area-inset-bottom, 0px))",
    zIndex: 35,
    pointerEvents: "auto",
  },
  docChatPill: {
    width: "100%",
    minHeight: 54,
    boxSizing: "border-box",
    border: "0.5px solid rgba(255,255,255,0.58)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 16px 34px -18px rgba(26,34,51,0.44), inset 0 1px 0 rgba(255,255,255,0.72)",
    color: "var(--mb-ink)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px 9px 10px",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "left",
    cursor: "pointer",
  },
  docChatAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    display: "grid",
    placeItems: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  statusPill: {
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    minWidth: 58,
    display: "inline-flex",
    justifyContent: "center",
    letterSpacing: "0.02em",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
};

/* Share bottom-sheet styling. Mirrors the V6Mobile account-sheet (scrim +
   glass sheet + grab handle) and reuses the same --mb-* tokens / mono numbers
   as the rest of the data room. */
const SH: Record<string, CSSProperties> = {
  scrim: { position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.28)" },
  sheet: {
    position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999,
    maxHeight: "86vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.85))",
    WebkitBackdropFilter: "blur(30px) saturate(190%)", backdropFilter: "blur(30px) saturate(190%)",
    borderTop: "1px solid rgba(255,255,255,.7)", borderRadius: "22px 22px 0 0",
    boxShadow: "0 -22px 54px -20px rgba(25,24,19,.42)",
    padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)",
  },
  grab: { width: 38, height: 4, borderRadius: 2, background: "var(--mb-ink-5)", margin: "0 auto 10px", flexShrink: 0 },
  head: { display: "flex", alignItems: "flex-start", gap: 10, padding: "2px 6px 12px", flexShrink: 0 },
  kicker: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--mb-ink-3)" },
  title: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.4px",
    color: "var(--mb-ink)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  closeBtn: {
    flexShrink: 0, width: 30, height: 30, borderRadius: "50%", border: "none",
    background: "var(--mb-card-2)", display: "grid", placeItems: "center", cursor: "pointer",
  },
  scroll: { overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 },
  sectionEyebrow: { padding: "0 4px 8px" },
  stateNote: {
    display: "flex", alignItems: "center", gap: 8, padding: "12px 14px",
    fontSize: 13, color: "var(--mb-ink-3)", fontWeight: 600,
  },
  emptyNote: {
    padding: "14px 16px", fontSize: 13.5, lineHeight: 1.45, color: "var(--mb-ink-3)",
    background: "var(--mb-card-2)", borderRadius: 14, textWrap: "pretty",
  },
  errorBanner: {
    borderRadius: 14, padding: "11px 14px", background: "var(--mb-danger-soft)", color: "var(--mb-danger-ink)",
    fontSize: 13, fontWeight: 600, lineHeight: 1.4, textWrap: "pretty",
    boxShadow: "inset 0 0 0 0.5px rgba(216,139,132,0.4)",
  },
  linkList: { padding: "2px 14px" },
  linkRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 0" },
  linkIcon: {
    flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: "var(--mb-accent-soft)",
    display: "grid", placeItems: "center",
  },
  linkTitle: {
    fontSize: 14.5, fontWeight: 700, color: "var(--mb-ink)", letterSpacing: "-0.2px",
    display: "flex", alignItems: "center", gap: 7, minWidth: 0,
  },
  linkBadge: {
    flexShrink: 0, padding: "1.5px 7px", borderRadius: 999, fontSize: 9.5, fontWeight: 800,
    letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1.4,
  },
  linkMeta: {
    fontSize: 11.5, color: "var(--mb-ink-3)", marginTop: 3,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  linkActions: { display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 },
  copyButton: {
    border: "none", borderRadius: 999, padding: "6px 11px", background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)", fontSize: 12, fontWeight: 760, letterSpacing: "-0.1px",
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
  },
  revokeButton: {
    border: "none", borderRadius: 999, width: 30, height: 30, background: "var(--mb-danger-soft)",
    display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
  },
  createCard: { padding: "16px 16px 16px" },
  fieldLabel: {
    fontSize: 12.5, fontWeight: 700, color: "var(--mb-ink-2)", letterSpacing: "-0.1px", marginBottom: 8,
  },
  accessRow: { display: "flex", gap: 8 },
  accessChip: {
    flex: 1, border: "none", borderRadius: 999, padding: "9px 6px", fontSize: 13, fontWeight: 700,
    letterSpacing: "-0.1px", cursor: "pointer", whiteSpace: "nowrap",
  },
  accessHint: { fontSize: 12, color: "var(--mb-ink-3)", marginTop: 8, lineHeight: 1.4, textWrap: "pretty" },
  ndaRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 11, marginTop: 16, padding: "0",
    border: "none", background: "transparent", cursor: "pointer",
  },
  ndaIcon: {
    flexShrink: 0, width: 32, height: 32, borderRadius: 9, background: "var(--mb-card-2)",
    display: "grid", placeItems: "center",
  },
  ndaTitle: { display: "block", fontSize: 14, fontWeight: 700, color: "var(--mb-ink)", letterSpacing: "-0.2px" },
  ndaSub: { display: "block", fontSize: 12, color: "var(--mb-ink-3)", marginTop: 1, lineHeight: 1.3 },
  toggle: {
    flexShrink: 0, width: 38, height: 22, borderRadius: 999, position: "relative",
    transition: "background 0.18s ease",
  },
  toggleDot: {
    position: "absolute", top: 2, left: 2, width: 18, height: 18, borderRadius: "50%",
    background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "transform 0.18s ease",
  },
  numberRow: { display: "flex", gap: 10, marginTop: 16 },
  numberField: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  numberLabel: {
    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700,
    color: "var(--mb-ink-3)", letterSpacing: "-0.05px",
  },
  numberInput: {
    width: "100%", boxSizing: "border-box", border: "none", borderRadius: 11, padding: "10px 12px",
    background: "var(--mb-card-2)", color: "var(--mb-ink)", fontSize: 14, fontWeight: 700,
    outline: "none", boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
  },
  createButton: {
    width: "100%", marginTop: 18, border: "none", borderRadius: 999, padding: "13px 16px",
    background: "var(--mb-ink)", color: "#fff", fontSize: 14.5, fontWeight: 780, letterSpacing: "-0.1px",
    cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  noCimCard: {
    padding: "22px 20px 20px", display: "flex", flexDirection: "column", alignItems: "flex-start",
  },
  noCimIcon: {
    width: 46, height: 46, borderRadius: 14, background: "var(--mb-accent-soft)",
    display: "grid", placeItems: "center", marginBottom: 12,
  },
  noCimTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.4px",
    color: "var(--mb-ink)",
  },
  noCimCopy: { fontSize: 13.5, lineHeight: 1.45, color: "var(--mb-ink-3)", marginTop: 8, textWrap: "pretty" },
};
