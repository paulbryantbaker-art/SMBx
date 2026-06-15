/**
 * CDStudio — the Pitch Book Studio home, ported into the Claude-Design
 * "cool/indigo" language and wired to LIVE data. Mounts under `.cd-root`.
 *
 * This is the home view only (studioView "home"). It preserves the exact
 * real-data wiring from MarketingStudioView:
 *   - the seven canonical book FORMATS (buyer/seller pitch, IC deck, QoE,
 *     CIM summary, board update, lender book) and their create prompts
 *   - createBook() → POST /api/studio/pitch-books, then opens the canvas tab
 *   - GET /api/studio/pitch-books → the real "Books in Studio" list
 *   - the plan-meter / allowance from GET /api/v19/entitlements (Studio
 *     books + exports, the two counters that gate Studio)
 *   - model-freshness from useTodayOperatingBrief().modelRefreshNeeds
 *
 * Every value is real or honestly "—". The CD mockup (ultra-modern-fintech
 * studio.jsx) supplies the LAYOUT — its window.MA_DATA books are fake and
 * are NOT used. All colors are --cd-* tokens.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useTodayOperatingBrief, type TodayModelRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import { CDIcon, CDCard, CDSectionTitle, CDPill, CDAvatar, cdDealColor, type CDIconName } from "../kit/cdUi";
import type { OpenTab, StudioFormatId, Tab } from "../../v6/types";

/* ─── the seven canonical book formats (preserved verbatim) ─────────── */
interface StudioFormat {
  id: StudioFormatId;
  title: string;
  audience: string;
  detail: string;
  slideCount: string;
  icon: CDIconName;
  prompt: string;
}

const FORMATS: StudioFormat[] = [
  {
    id: "buyer-pitch-book",
    title: "Buyer Pitch Book",
    audience: "Searchers, independent sponsors, corp dev",
    detail: "Target read, market map, valuation frame, risks, and next actions.",
    slideCount: "6 slides",
    icon: "portfolio",
    prompt: "Create a buyer pitch book for this deal. Ground every metric in files, model outputs, or citations.",
  },
  {
    id: "seller-pitch-book",
    title: "Seller Pitch Book",
    audience: "Owners, advisors, buyer outreach",
    detail: "Positioning, business profile, financial story, buyer universe, and process plan.",
    slideCount: "6 slides",
    icon: "doc",
    prompt: "Create a seller pitch book that a buyer or advisor would actually read.",
  },
  {
    id: "ic-deck",
    title: "IC Deck",
    audience: "Investment committee",
    detail: "Decision ask, thesis, returns frame, risks, and approval path.",
    slideCount: "6 slides",
    icon: "grid",
    prompt: "Create an IC deck with a clean decision ask and source-grounded risk frame.",
  },
  {
    id: "qoe-preview-book",
    title: "QoE Preview Book",
    audience: "Buyers deciding whether to spend diligence money",
    detail: "Normalized earnings, add-back defense, NWC, red flags, and diligence asks.",
    slideCount: "6 slides",
    icon: "analysis",
    prompt: "Create a QoE preview book. Separate defended earnings from unverified add-backs.",
  },
  {
    id: "cim-summary-deck",
    title: "CIM Summary Deck",
    audience: "Qualified buyers and internal deal teams",
    detail: "Investment highlights, company profile, market position, and financial summary.",
    slideCount: "6 slides",
    icon: "doc",
    prompt: "Create a CIM summary deck with an audit appendix and concise buyer-facing story.",
  },
  {
    id: "board-update",
    title: "Board Update",
    audience: "Board, partners, LPs",
    detail: "Portfolio read, deals in motion, key changes, decisions needed, and risks.",
    slideCount: "6 slides",
    icon: "today",
    prompt: "Create a board update book for current deal work and open decisions.",
  },
  {
    id: "lender-book",
    title: "Lender Book",
    audience: "SBA and senior lenders",
    detail: "Borrower profile, sources and uses, cash flow support, and credit ask.",
    slideCount: "6 slides",
    icon: "bolt",
    prompt: "Create a lender book with DSCR, sources and uses, and credit support clearly separated.",
  },
];

/* ─── real-data record shapes (from the Studio API) ─────────────────── */
interface StudioSlide { id: string; warningState: "clean" | "needs_sources" | "stale_models" }
interface PitchBookRecord {
  id: number;
  dealId: number | null;
  title: string;
  format: StudioFormatId;
  status: string;
  version: number;
  slides: StudioSlide[];
  modelOutputs: Array<Record<string, unknown>>;
  updatedAt: string;
}

/* allowance — the two Studio counters from /api/v19/entitlements */
type Plan = "free" | "solo" | "pro" | "team" | "enterprise";
interface UsageCounter { used: number; limit: number | null }
interface EntitlementsResponse {
  usage: {
    plan: Plan;
    periodEnd: string;
    events: { studio_book: UsageCounter; studio_export: UsageCounter };
  };
}
const PLAN_LABELS: Record<Plan, string> = { free: "Free", solo: "Solo", pro: "Pro", team: "Team", enterprise: "Enterprise" };

/* ─── props (match what Canvas passes the CD pages) ─────────────────── */
interface CDStudioProps {
  user: User | null;
  openTab: (t: Omit<Tab, "id"> & { id?: string }) => void;
  onTalkToYulia?: (p: string) => void;
  modelPreference?: unknown;
}

export function CDStudio({ user, openTab, onTalkToYulia }: CDStudioProps) {
  const ask = (p: string) => onTalkToYulia?.(p);
  const open: OpenTab = (descriptor) => openTab(descriptor);

  /* books in Studio (real) */
  const [books, setBooks] = useState<PitchBookRecord[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* allowance (real) */
  const [ent, setEnt] = useState<EntitlementsResponse | null>(null);

  /* model freshness (real) */
  const operating = useTodayOperatingBrief(user, !!user);
  const modelRefreshNeeds = operating.brief?.modelRefreshNeeds ?? [];

  useEffect(() => {
    if (!user) { setBooks([]); return; }
    let alive = true;
    setLoadingBooks(true);
    fetch("/api/studio/pitch-books", { headers: authHeaders() })
      .then(res => { if (!res.ok) throw new Error("Could not load pitch books"); return res.json(); })
      .then(data => { if (alive) setBooks(Array.isArray(data.books) ? data.books : []); })
      .catch(() => { if (alive) setBooks([]); })
      .finally(() => { if (alive) setLoadingBooks(false); });
    return () => { alive = false; };
  }, [user]);

  useEffect(() => {
    if (!user) { setEnt(null); return; }
    let alive = true;
    fetch("/api/v19/entitlements", { headers: authHeaders() })
      .then(res => { if (!res.ok) throw new Error(); return res.json() as Promise<EntitlementsResponse>; })
      .then(next => { if (alive) setEnt(next); })
      .catch(() => { /* allowance is best-effort — honest empty state below */ });
    return () => { alive = false; };
  }, [user]);

  const refreshBook = (next: PitchBookRecord) => setBooks(prev => [next, ...prev.filter(b => b.id !== next.id)]);

  const createBook = async (format: StudioFormatId, title?: string) => {
    const fmt = FORMATS.find(f => f.id === format) ?? FORMATS[0];
    const fallbackId = `studio-${format}-${Date.now().toString(36)}`;
    const openLocalDraft = () => open({
      id: fallbackId, kind: "marketing-studio", title: title || `Studio - ${fmt.title}`,
      studioView: "canvas", studioFormat: format, studioDraftId: fallbackId,
      studioCampaign: "Local Studio draft", studioDirty: true,
    });

    if (!user) { openLocalDraft(); return; }

    setError(null);
    try {
      const res = await fetch("/api/studio/pitch-books", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ format, title: title || undefined, brief: fmt.prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.tollgate?.message || data.error || "Failed to create pitch book") as Error & { tollgate?: unknown };
        err.tollgate = data.tollgate;
        throw err;
      }
      const book = data.book as PitchBookRecord;
      refreshBook(book);
      open({
        id: `studio-book-${book.id}`, kind: "marketing-studio", title: book.title,
        studioView: "canvas", studioFormat: book.format, studioBookId: book.id,
        studioDraftId: `studio-book-${book.id}`, studioCampaign: "Pitch Book Studio", studioDirty: false,
      });
    } catch (err) {
      const e = err as Error & { tollgate?: unknown };
      setError(e.message || "Failed to create pitch book");
      if (e.tollgate) return; // a paywall/tollgate — stop, surface the message
      openLocalDraft();
    }
  };

  const openBook = (book: PitchBookRecord) => open({
    id: `studio-book-${book.id}`, kind: "marketing-studio", title: book.title,
    studioView: "canvas", studioFormat: book.format, studioBookId: book.id,
    studioDraftId: `studio-book-${book.id}`, studioCampaign: "Pitch Book Studio", studioDirty: false,
  });

  return (
    <div
      className="cd-root cd-scrollable"
      style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}
    >
      {/* editorial header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 36, lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            Pitch Book <span style={{ fontStyle: "italic" }}>Studio</span>
          </h1>
          <p style={{ margin: "10px 0 0", color: "var(--cd-ink-2)", fontSize: 14, lineHeight: 1.5, maxWidth: 680 }}>
            Build IC decks, QoE preview books, buyer and lender books, and CIM summaries — every slide carries its sources, model links, and an export-ready audit trail.
          </p>
        </div>
        <button
          onClick={() => ask("Help me pick the right pitch book format for my current deal.")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", boxShadow: "var(--cd-shadow-sm)", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          <CDIcon name="sparkle" size={15} color="white" />New book
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--cd-neg-soft)", border: "1px solid var(--cd-neg)", color: "var(--cd-neg)", borderRadius: "var(--cd-r-md)", padding: "11px 14px", fontSize: 13 }}>{error}</div>
      )}

      {/* plan-meter / allowance — the two Studio counters */}
      <AllowanceCard ent={ent} user={user} />

      {/* book-format cards */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Start from a format</h2>
        <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>Yulia drafts from your models and data room</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))", gap: "var(--cd-gap)" }}>
        {FORMATS.map(fmt => <FormatCard key={fmt.id} fmt={fmt} onCreate={() => void createBook(fmt.id)} />)}
      </div>

      {/* lower two-col: books in Studio + model freshness */}
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "var(--cd-gap)", marginTop: 8, alignItems: "start" }}>
        <BooksInStudio books={books} loading={loadingBooks} onOpen={openBook} />
        <ModelFreshness items={modelRefreshNeeds} loading={operating.loading} onAsk={ask} />
      </div>
    </div>
  );
}

/* ─── allowance card (plan-meter) ───────────────────────────────────── */
function AllowanceCard({ ent, user }: { ent: EntitlementsResponse | null; user: User | null }) {
  if (!user) {
    return (
      <CDCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Plan meter</div>
          <div style={{ fontSize: 12.5, color: "var(--cd-ink-3)", marginTop: 4 }}>Sign in to track your Studio book and export allowance.</div>
        </div>
        <CDPill tone="neutral">Sign in</CDPill>
      </CDCard>
    );
  }
  if (!ent) {
    return (
      <CDCard style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Plan meter</div>
          <div style={{ fontSize: 12.5, color: "var(--cd-ink-3)", marginTop: 4 }}>Allowance feed unavailable right now.</div>
        </div>
        <CDPill tone="neutral"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cd-ink-4)" }} />No live feed</CDPill>
      </CDCard>
    );
  }
  const u = ent.usage;
  const plan = PLAN_LABELS[u.plan] || u.plan;
  return (
    <CDCard style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--cd-accent-soft)", display: "grid", placeItems: "center" }}><CDIcon name="grid" size={16} color="var(--cd-accent)" /></div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>Plan meter</div>
          <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 3 }}>Resets {formatReset(u.periodEnd)}</div>
        </div>
        <span className="cd-num" style={{ marginLeft: 4, display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 7, background: "var(--cd-ink)", color: "white", fontSize: 11, fontWeight: 700 }}>{plan}</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, minWidth: 260 }}>
        <Meter label="Studio books" counter={u.events.studio_book} />
        <Meter label="Studio exports" counter={u.events.studio_export} />
      </div>
    </CDCard>
  );
}

function Meter({ label, counter }: { label: string; counter: UsageCounter }) {
  const unlimited = counter.limit === null;
  const pct = unlimited ? 100 : Math.min(100, Math.round((counter.used / Math.max(counter.limit ?? 1, 1)) * 100));
  const tone = unlimited ? "var(--cd-accent)" : pct >= 100 ? "var(--cd-neg)" : pct >= 80 ? "var(--cd-warn)" : "var(--cd-accent)";
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
        <span className="cd-eyebrow">{label}</span>
        <span className="cd-num" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cd-ink)" }}>
          {fmtNum(counter.used)} <span style={{ color: "var(--cd-ink-3)", fontWeight: 600 }}>/ {unlimited ? "custom" : fmtNum(counter.limit ?? 0)}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--cd-surface-3)", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: tone, borderRadius: 3 }} />
      </div>
    </div>
  );
}

/* ─── format card ───────────────────────────────────────────────────── */
function FormatCard({ fmt, onCreate }: { fmt: StudioFormat; onCreate: () => void }) {
  const color = cdDealColor(fmt.id);
  const grad = `linear-gradient(145deg, color-mix(in oklch, ${color}, white 4%), color-mix(in oklch, ${color}, #0b1020 30%))`;
  return (
    <button
      onClick={onCreate}
      style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-sm)", overflow: "hidden", width: "100%", fontFamily: "var(--cd-sans)" }}
    >
      {/* cover — quiet single-panel, oversized watermark initial */}
      <div style={{ position: "relative", height: 118, background: grad, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -4, bottom: -30, fontFamily: "var(--cd-serif)", fontSize: 118, fontWeight: 700, color: "rgba(255,255,255,0.10)", lineHeight: 1 }}>{fmt.title[0]}</div>
        <div style={{ position: "relative", width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center" }}><CDIcon name={fmt.icon} size={16} color="white" /></div>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--cd-serif)", fontSize: 20, lineHeight: 1.08, color: "white", letterSpacing: "-0.01em" }}>{fmt.title}</div>
          <div className="cd-num" style={{ fontSize: 11, color: "rgba(255,255,255,0.74)", marginTop: 6 }}>{fmt.slideCount}</div>
        </div>
      </div>
      {/* body */}
      <div style={{ padding: "13px 16px 15px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ fontSize: 12.5, color: "var(--cd-ink-2)", lineHeight: 1.45 }}>{fmt.detail}</div>
        <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 2 }}>{fmt.audience}</div>
        <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", gap: 5, color: "var(--cd-accent-strong)", fontSize: 12.5, fontWeight: 600 }}>
          <CDIcon name="plus" size={13} color="var(--cd-accent-strong)" />Create
        </div>
      </div>
    </button>
  );
}

/* ─── books in Studio (real list) ──────────────────────────────────── */
function BooksInStudio({ books, loading, onOpen }: { books: PitchBookRecord[]; loading: boolean; onOpen: (b: PitchBookRecord) => void }) {
  return (
    <CDCard pad={false}>
      <PanelHeader title="Books in Studio" right={loading ? <CDPill tone="neutral">Loading</CDPill> : <CDPill tone="neutral">{books.length}</CDPill>} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {!loading && books.length === 0 && (
          <div style={{ padding: "18px 20px", color: "var(--cd-ink-2)", fontSize: 13, lineHeight: 1.5 }}>
            <strong style={{ display: "block", color: "var(--cd-ink)", marginBottom: 4 }}>No books yet</strong>
            Pick a format above and Yulia builds the first book here.
          </div>
        )}
        {loading && books.length === 0 && <div style={{ padding: 20 }}><div className="cd-skel" style={{ height: 46 }} /></div>}
        {books.map(book => {
          const gaps = bookGapCount(book);
          return (
            <button
              key={`${book.id}-${book.version}`}
              onClick={() => onOpen(book)}
              style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderTop: "1px solid var(--cd-line)", width: "100%", fontFamily: "var(--cd-sans)" }}
            >
              <span className="cd-num" style={{ width: 34, height: 34, borderRadius: 9, background: cdDealColor(book.id), color: "white", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{formatInitial(book.format)}</span>
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                <strong style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</strong>
                <small className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)" }}>
                  {formatLabel(book.format)} · v{book.version} · {book.slides.length} slide{book.slides.length === 1 ? "" : "s"}
                </small>
              </span>
              {gaps ? <CDPill tone="warn">{gaps} gap{gaps === 1 ? "" : "s"}</CDPill> : <CDPill tone="pos">clean</CDPill>}
            </button>
          );
        })}
      </div>
    </CDCard>
  );
}

/* ─── model freshness panel ────────────────────────────────────────── */
function ModelFreshness({ items, loading, onAsk }: { items: TodayModelRefreshItem[]; loading: boolean; onAsk: (p: string) => void }) {
  return (
    <CDCard pad={false}>
      <PanelHeader title="Model freshness" right={loading ? <CDPill tone="neutral">Reading</CDPill> : <CDPill tone="neutral">{items.length} queued</CDPill>} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.length === 0 && (
          <button
            onClick={() => onAsk("Explain how Studio keeps books current against saved model outputs and rerun triggers.")}
            style={rowBtnStyle}
          >
            <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--cd-pos-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><CDIcon name="check" size={16} color="var(--cd-pos)" sw={2.4} /></span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
              <strong style={{ fontSize: 13, fontWeight: 700, color: "var(--cd-ink)" }}>Model-linked books are clean</strong>
              <small style={{ fontSize: 11.5, color: "var(--cd-ink-3)", lineHeight: 1.4 }}>No stale model output is blocking a Studio draft right now.</small>
            </span>
            <CDPill tone="pos">clean</CDPill>
          </button>
        )}
        {items.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => onAsk(`For Studio, explain the stale model output ${item.modelTitle} on ${item.dealTitle || "this deal"}. Show which book claims or exports could be affected and what should be rerun first.`)}
            style={rowBtnStyle}
          >
            <span className="cd-num" style={{ width: 34, height: 34, borderRadius: 9, background: "var(--cd-surface-2)", color: "var(--cd-ink-2)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{item.modelTitle.slice(0, 2).toUpperCase()}</span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
              <strong style={{ fontSize: 13, fontWeight: 700, color: "var(--cd-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.modelTitle}</strong>
              <small style={{ fontSize: 11.5, color: "var(--cd-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.dealTitle ? `${item.dealTitle} · ` : ""}{item.changedInputs.slice(0, 2).join(", ") || item.rerunTriggers[0] || item.statusLabel}
              </small>
            </span>
            <CDPill tone={item.status === "needs_rerun" ? "warn" : "accent"}>{item.statusLabel}</CDPill>
          </button>
        ))}
      </div>
      <div style={{ padding: "11px 20px 14px", borderTop: "1px solid var(--cd-line)", fontSize: 10.5, color: "var(--cd-ink-4)" }}>
        Yulia shows analysis &amp; implications — not transaction advice.
      </div>
    </CDCard>
  );
}

/* ─── small shared bits ────────────────────────────────────────────── */
function PanelHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "15px 20px 13px", borderBottom: "1px solid var(--cd-line)" }}>
      <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)" }}>{title}</span>
      {right}
    </div>
  );
}

const rowBtnStyle: CSSProperties = {
  all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center",
  gap: 12, padding: "13px 20px", borderTop: "1px solid var(--cd-line)", width: "100%", fontFamily: "var(--cd-sans)",
};

function bookGapCount(book: PitchBookRecord): number {
  const slideGaps = book.slides.filter(s => s.warningState !== "clean").length;
  const modelGaps = (book.modelOutputs || []).filter(m => (m as { status?: string }).status !== "complete").length;
  return slideGaps + modelGaps;
}
function formatLabel(value: StudioFormatId): string {
  return FORMATS.find(f => f.id === value)?.title ?? value.replace(/-/g, " ");
}
function formatInitial(value: StudioFormatId): string {
  return formatLabel(value).split(/\s+/).map(p => p[0]).slice(0, 2).join("");
}
function fmtNum(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
function formatReset(value: string): string {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "monthly";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
