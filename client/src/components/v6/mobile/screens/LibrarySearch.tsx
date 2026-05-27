import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  Brain,
  BriefcaseBusiness,
  FolderKanban,
  FileCheck2,
  FileImage,
  FilePenLine,
  FileSignature,
  FileSpreadsheet,
  FileText,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { MobileIcon } from "../icons";
import { ChatStarterPill } from "../ChatStarterPill";
import { YIcon } from "../YIcon";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";

interface SharedChromeProps {
  initials: string;
  onAvatarClick: () => void;
  onOpenSearch: () => void;
}

interface LibraryScreenProps extends SharedChromeProps {
  onOpenDetail: OpenDocHandler;
  onOpenFinder: OpenFilesHandler;
  onOpenDealLibrary: OpenDealLibraryHandler;
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
}

type DocTone = "ai" | "memo" | "draft" | "contract" | "signed" | "pdf" | "excel" | "image";
type PillTone = "draft" | "lock" | "review" | "awaiting" | "signed" | "needed";
type FilesFilter = "all" | "deals" | "actionable" | "docs" | "analysis" | "data-room" | "shared" | "secure";
type DealStageScope = "all" | "data-room";
type OpenDocHandler = (title?: string, meta?: string, kind?: string) => void;
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
  onOpenDetail,
  onOpenFinder,
  onOpenDealLibrary,
}: LibraryScreenProps) {
  return (
    <div className="mb-fade-up" style={{ ...S.page, ...S.filesPage }}>
      <GlassTopBar
        title="Files"
        initials={initials}
        onAvatarClick={onAvatarClick}
        onSearch={onOpenSearch}
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
            <>
              <button type="button" onClick={onOpenDealLibrary} style={S.boundarySecondaryButton}>
                Deal library
              </button>
              <button type="button" style={S.boundaryPrimaryButton}>
                Share file
              </button>
            </>
          ) : (
            <>
              <button type="button" style={S.boundarySecondaryButton}>
                Share to data room
              </button>
              <button type="button" onClick={onOpenDataRoom} style={S.boundaryPrimaryButton}>
                Open data room
              </button>
            </>
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
}: LibraryDetailScreenProps) {
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

export function LibraryDocumentScreen({
  onBack,
  onAskYulia,
  title = "IOI · v3",
  meta = "Yulia · drafting · 2 min ago",
  kind = "draft",
}: LibraryDocumentScreenProps) {
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
    backdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
    WebkitBackdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
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
    backdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
    WebkitBackdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
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
    backdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
    WebkitBackdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
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
    backdropFilter: "blur(6px) saturate(155%) contrast(1.08)",
    WebkitBackdropFilter: "blur(6px) saturate(155%) contrast(1.08)",
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
    backdropFilter: "blur(10px) saturate(170%) contrast(1.06)",
    WebkitBackdropFilter: "blur(10px) saturate(170%) contrast(1.06)",
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
    backdropFilter: "blur(10px) saturate(170%) contrast(1.06)",
    WebkitBackdropFilter: "blur(10px) saturate(170%) contrast(1.06)",
    border: "none",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
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
    backdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
    WebkitBackdropFilter: "blur(3px) saturate(130%) brightness(1.01)",
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
    gridTemplateColumns: "1fr 1fr",
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
  boundarySecondaryButton: {
    border: "none",
    borderRadius: 999,
    padding: "10px 12px",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
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
    backdropFilter: "blur(10px) saturate(185%) contrast(1.06)",
    WebkitBackdropFilter: "blur(10px) saturate(185%) contrast(1.06)",
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
