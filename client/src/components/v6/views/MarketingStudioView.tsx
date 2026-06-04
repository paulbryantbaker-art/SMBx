import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useTodayOperatingBrief, type TodayModelRefreshItem } from "../../../hooks/useTodayOperatingBrief";
import type { OpenTab, StudioFormatId, Tab } from "../types";
import { V19UsageMeter } from "../V19UsageMeter";

interface MarketingStudioProps {
  tab: Tab;
  openTab: OpenTab;
  user: User | null;
  onTalkToYulia?: (prompt: string) => void;
}

interface StudioFormat {
  id: StudioFormatId;
  title: string;
  audience: string;
  detail: string;
  slideCount: string;
  prompt: string;
}

interface StudioSlide {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets: string[];
  speakerNotes?: string;
  provenance: {
    factsUsed: string[];
    modelOutputsUsed: string[];
    citationsUsed: string[];
    uncheckedClaims: string[];
  };
  warningState: "clean" | "needs_sources" | "stale_models";
}

interface StudioSource {
  id?: number;
  sourceType: string;
  sourceId?: string | null;
  label: string;
  citationTag?: string | null;
  sourceUrl?: string | null;
  status: "linked" | "missing" | "stale";
}

interface PitchBookRecord {
  id: number;
  dealId: number | null;
  title: string;
  format: StudioFormatId;
  status: string;
  brief: string | null;
  versionId: number | null;
  version: number;
  outline: string[];
  slides: StudioSlide[];
  assumptions: Array<Record<string, any>>;
  modelOutputs: Array<Record<string, any>>;
  provenance: Record<string, any>;
  audit: Record<string, any>;
  sources: StudioSource[];
  updatedAt: string;
  createdAt: string;
}

interface V19StudioReadiness {
  readyForExternalDelivery: boolean;
  issues: Array<{
    code: string;
    severity: "blocker" | "warning";
    label: string;
    detail: string;
  }>;
}

interface SavedStudioDraft {
  id: string;
  title: string;
  format: StudioFormatId;
  campaign: string;
  updatedAt: string;
  story?: string;
  status?: "draft" | "completed";
  studioBookId?: number | null;
}

const WORKING_DRAFTS_KEY = "__smbxMarketingStudioWorkingDrafts";
const DRAFT_STORAGE_KEY = "smbx_marketing_studio_drafts";

const FORMATS: StudioFormat[] = [
  {
    id: "buyer-pitch-book",
    title: "Buyer Pitch Book",
    audience: "Searchers, independent sponsors, corp dev",
    detail: "Target read, market map, valuation frame, risks, and next actions.",
    slideCount: "6 slides",
    prompt: "Create a buyer pitch book for this deal. Ground every metric in files, model outputs, or citations.",
  },
  {
    id: "seller-pitch-book",
    title: "Seller Pitch Book",
    audience: "Owners, advisors, buyer outreach",
    detail: "Positioning, business profile, financial story, buyer universe, and process plan.",
    slideCount: "6 slides",
    prompt: "Create a seller pitch book that a buyer or advisor would actually read.",
  },
  {
    id: "ic-deck",
    title: "IC Deck",
    audience: "Investment committee",
    detail: "Decision ask, thesis, returns frame, risks, and approval path.",
    slideCount: "6 slides",
    prompt: "Create an IC deck with a clean decision ask and source-grounded risk frame.",
  },
  {
    id: "qoe-preview-book",
    title: "QoE Preview Book",
    audience: "Buyers deciding whether to spend diligence money",
    detail: "Normalized earnings, add-back defense, NWC, red flags, and diligence asks.",
    slideCount: "6 slides",
    prompt: "Create a QoE preview book. Separate defended earnings from unverified add-backs.",
  },
  {
    id: "cim-summary-deck",
    title: "CIM Summary Deck",
    audience: "Qualified buyers and internal deal teams",
    detail: "Investment highlights, company profile, market position, and financial summary.",
    slideCount: "6 slides",
    prompt: "Create a CIM summary deck with an audit appendix and concise buyer-facing story.",
  },
  {
    id: "board-update",
    title: "Board Update",
    audience: "Board, partners, LPs",
    detail: "Portfolio read, deals in motion, key changes, decisions needed, and risks.",
    slideCount: "6 slides",
    prompt: "Create a board update book for current deal work and open decisions.",
  },
  {
    id: "lender-book",
    title: "Lender Book",
    audience: "SBA and senior lenders",
    detail: "Borrower profile, sources and uses, cash flow support, and credit ask.",
    slideCount: "6 slides",
    prompt: "Create a lender book with DSCR, sources and uses, and credit support clearly separated.",
  },
];

export function V6MarketingStudioView({ tab, openTab, user, onTalkToYulia }: MarketingStudioProps) {
  const [books, setBooks] = useState<PitchBookRecord[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operating = useTodayOperatingBrief(user, !!user);
  const modelRefreshNeeds = operating.brief?.modelRefreshNeeds ?? [];

  const askYulia = (prompt: string) => onTalkToYulia?.(prompt);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      return;
    }
    let alive = true;
    setLoadingBooks(true);
    fetch("/api/studio/pitch-books", { headers: authHeaders() })
      .then(async res => {
        if (!res.ok) throw new Error("Could not load pitch books");
        return res.json();
      })
      .then(data => {
        if (alive) setBooks(Array.isArray(data.books) ? data.books : []);
      })
      .catch(() => {
        if (alive) setBooks([]);
      })
      .finally(() => {
        if (alive) setLoadingBooks(false);
      });
    return () => { alive = false; };
  }, [user]);

  const activeOutput = tab.studioView === "canvas"
    ? FORMATS.find(output => output.id === tab.studioFormat) ?? FORMATS[0]
    : null;

  const refreshBook = (next: PitchBookRecord) => {
    setBooks(prev => [next, ...prev.filter(item => item.id !== next.id)]);
  };

  const createBook = async (format: StudioFormatId, title?: string) => {
    const output = FORMATS.find(item => item.id === format) ?? FORMATS[0];
    const fallbackId = `studio-${format}-${Date.now().toString(36)}`;

    if (!user) {
      openTab({
        id: fallbackId,
        kind: "marketing-studio",
        title: title || `Studio - ${output.title}`,
        studioView: "canvas",
        studioFormat: format,
        studioDraftId: fallbackId,
        studioCampaign: "Local Studio draft",
        studioDirty: true,
      });
      return;
    }

    setError(null);
    try {
      const res = await fetch("/api/studio/pitch-books", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          format,
          title: title || undefined,
          brief: output.prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.tollgate?.message || data.error || "Failed to create pitch book") as Error & { tollgate?: unknown };
        error.tollgate = data.tollgate;
        throw error;
      }
      const book = data.book as PitchBookRecord;
      refreshBook(book);
      openTab({
        id: `studio-book-${book.id}`,
        kind: "marketing-studio",
        title: book.title,
        studioView: "canvas",
        studioFormat: book.format,
        studioBookId: book.id,
        studioDraftId: `studio-book-${book.id}`,
        studioCampaign: "Pitch Book Studio",
        studioDirty: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create pitch book");
      if (err.tollgate) return;
      openTab({
        id: fallbackId,
        kind: "marketing-studio",
        title: title || `Studio - ${output.title}`,
        studioView: "canvas",
        studioFormat: format,
        studioDraftId: fallbackId,
        studioCampaign: "Local Studio draft",
        studioDirty: true,
      });
    }
  };

  const openBook = (book: PitchBookRecord) => {
    openTab({
      id: `studio-book-${book.id}`,
      kind: "marketing-studio",
      title: book.title,
      studioView: "canvas",
      studioFormat: book.format,
      studioBookId: book.id,
      studioDraftId: `studio-book-${book.id}`,
      studioCampaign: "Pitch Book Studio",
      studioDirty: false,
    });
  };

  if (activeOutput) {
    return (
      <StudioCanvas
        output={activeOutput}
        tab={tab}
        user={user}
        onAskYulia={askYulia}
        onBookUpdated={refreshBook}
      />
    );
  }

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="pg-title">Pitch Book Studio</div>
          <p className="pg-sub">
            Build IC decks, QoE preview books, buyer books, lender books, and CIM summaries with slide-level sources, model links, and export-ready audit trails.
          </p>
        </div>
        <div className="pg-actions">
          <button
            className="kebab"
            type="button"
            aria-label="More"
            onClick={() => askYulia("Summarize what Pitch Book Studio can build and how slide-level provenance, model links, and audit trails work.")}
          >
            ⋯
          </button>
          <button
            className="wkbtn primary"
            type="button"
            onClick={() => askYulia("Help me pick the right pitch book format for my current deal.")}
          >
            New book
          </button>
        </div>
      </div>

      {/* Format grid */}
      <div className="wksec">
        <div className="wksec-title">Start from a format</div>
        <p style={S.sectionCopy}>
          Choose the collateral Yulia should build. Use the chat rail for audience, source, and mandate instructions.
        </p>
        {error && <div className="wkerr" style={{ marginTop: 12 }}>{error}</div>}
        {user && <V19UsageMeter user={user} compact surface="studio" />}

        <div className="wkgrid g3" style={{ marginTop: 18 }}>
          {FORMATS.map(format => (
            <button
              key={format.id}
              type="button"
              className="wkcard tap"
              style={S.formatCard}
              onClick={() => void createBook(format.id)}
            >
              <span style={S.formatMeta}>{format.slideCount}</span>
              <strong className="wkcard-title" style={{ display: "block", marginTop: 6 }}>{format.title}</strong>
              <span className="wkcard-sub" style={{ display: "block" }}>{format.audience}</span>
              <span style={S.formatDetail}>{format.detail}</span>
              <span style={S.formatAction}>Create →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lower two-col layout: books list + workbench diff */}
      <div className="wkgrid g2" style={{ marginTop: 28 }}>
        {/* Books in Studio */}
        <div className="wkcard" style={{ padding: 0 }}>
          <div style={S.panelHeader}>
            <span className="wkcard-title">Books in Studio</span>
            <span className="statpill missing">
              <span className="d" />
              {loadingBooks ? "Loading" : `${books.length}`}
            </span>
          </div>
          <div style={S.bookStack}>
            {!loadingBooks && books.length === 0 && (
              <div style={{ padding: 18, color: "var(--ink-2)", fontSize: ".85rem", lineHeight: 1.45 }}>
                <strong style={{ display: "block", color: "var(--ink)", marginBottom: 4 }}>No books yet</strong>
                Pick a format above and Yulia builds the first book here.
              </div>
            )}
            {books.map(book => (
              <button
                key={`${book.id}-${book.version}`}
                type="button"
                style={S.bookRow}
                onClick={() => openBook(book)}
              >
                <span style={S.bookIcon}>{formatInitial(book.format)}</span>
                <span style={S.bookBody}>
                  <strong>{book.title}</strong>
                  <small style={S.bookMeta}>
                    {formatLabel(book.format)} /&nbsp;
                    <span style={{ fontFamily: "var(--font-mono)" }}>v{book.version}</span>
                    &nbsp;/&nbsp;
                    <span style={{ fontFamily: "var(--font-mono)" }}>{book.slides.length}</span> slides
                  </small>
                </span>
                {bookReadinessCount(book) ? (
                  <span className="statpill flag"><span className="d" />{bookReadinessCount(book)} gaps</span>
                ) : (
                  <span className="statpill good"><span className="d" />clean</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Model freshness panel */}
        <StudioModelRefreshPanel
          items={modelRefreshNeeds}
          loading={operating.loading}
          onAskYulia={askYulia}
        />
      </div>
    </div>
  );
}

function StudioModelRefreshPanel({
  items,
  loading,
  onAskYulia,
}: {
  items: TodayModelRefreshItem[];
  loading: boolean;
  onAskYulia: (prompt: string) => void;
}) {
  return (
    <div className="wkcard" style={{ padding: 0 }}>
      <div style={S.panelHeader}>
        <span className="wkcard-title">Model freshness</span>
        <span className="statpill missing">
          <span className="d" />
          {loading ? "Reading" : `${items.length} queued`}
        </span>
      </div>
      <div style={S.bookStack}>
        {items.length === 0 && (
          <button
            type="button"
            style={S.bookRow}
            onClick={() => onAskYulia("Explain how Studio keeps books current against saved model outputs and rerun triggers.")}
          >
            <span style={S.bookIcon}>OK</span>
            <span style={S.bookBody}>
              <strong>Model-linked books are clean</strong>
              <small style={S.bookMeta}>No stale model output is blocking a Studio draft right now.</small>
            </span>
            <span className="statpill good"><span className="d" />clean</span>
          </button>
        )}
        {items.slice(0, 3).map(item => (
          <button
            key={item.id}
            type="button"
            style={S.bookRow}
            onClick={() => onAskYulia(`For Studio, explain the stale model output ${item.modelTitle} on ${item.dealTitle || "this deal"}. Show which book claims or exports could be affected and what should be rerun first.`)}
          >
            <span style={S.bookIcon}>{item.modelTitle.slice(0, 2).toUpperCase()}</span>
            <span style={S.bookBody}>
              <strong>{item.modelTitle}</strong>
              <small style={S.bookMeta}>{item.dealTitle ? `${item.dealTitle} / ` : ""}{item.changedInputs.slice(0, 2).join(", ") || item.rerunTriggers[0] || item.statusLabel}</small>
            </span>
            {item.status === "needs_rerun" ? (
              <span className="statpill flag"><span className="d" />{item.statusLabel}</span>
            ) : (
              <span className="statpill review"><span className="d" />{item.statusLabel}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudioCanvas({
  output,
  tab,
  user,
  onAskYulia,
  onBookUpdated,
}: {
  output: StudioFormat;
  tab: Tab;
  user: User | null;
  onAskYulia: (prompt: string) => void;
  onBookUpdated: (book: PitchBookRecord) => void;
}) {
  const localDraft = useMemo(() => readStudioDraft(tab.studioDraftId ?? tab.id), [tab.id, tab.studioDraftId]);
  const [book, setBook] = useState<PitchBookRecord | null>(null);
  const [readiness, setReadiness] = useState<V19StudioReadiness | null>(null);
  const [story, setStory] = useState(localDraft?.story ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bookId = tab.studioBookId ?? null;

  useEffect(() => {
    if (!user || !bookId) {
      setBook(localBook(output.id, tab.title, story));
      setReadiness(null);
      return;
    }
    let alive = true;
    setBusy("Loading book");
    fetch(`/api/studio/pitch-books/${bookId}`, { headers: authHeaders() })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load pitch book");
        return data as { book: PitchBookRecord; readiness?: V19StudioReadiness };
      })
      .then(next => {
        if (!alive) return;
        setBook(next.book);
        setReadiness(next.readiness ?? null);
      })
      .catch(err => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setBusy(null); });
    return () => { alive = false; };
  }, [bookId, output.id, story, tab.title, user]);

  useEffect(() => {
    writeStudioDraft({
      id: tab.studioDraftId ?? tab.id,
      title: tab.title,
      format: output.id,
      campaign: tab.studioCampaign ?? "Pitch Book Studio",
      updatedAt: new Date().toISOString(),
      story,
      studioBookId: bookId,
    });
  }, [bookId, output.id, story, tab.id, tab.studioCampaign, tab.studioDraftId, tab.title]);

  const current = book ?? localBook(output.id, tab.title, story);
  const warningCount = bookWarningCount(current);
  const modelHealth = modelHealthForBook(current);
  const readinessBlockers = readiness?.issues.filter(issue => issue.severity === "blocker").length ?? 0;
  const readinessLabel = readiness
    ? readiness.readyForExternalDelivery
      ? "export ready"
      : `${readinessBlockers || readiness.issues.length} export ${readinessBlockers === 1 ? "gap" : "gaps"}`
    : "readiness pending";

  const revise = async () => {
    if (!user || !bookId) {
      onAskYulia(`${output.prompt} Use this revision brief: ${story || "Ask me for the missing source-grounded story."}`);
      return;
    }
    setBusy("Revising");
    setError(null);
    try {
      const res = await fetch(`/api/studio/pitch-books/${bookId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ instruction: story || "Improve narrative and flag source gaps." }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revision failed");
      setBook(data.book);
      setReadiness(data.readiness ?? null);
      onBookUpdated(data.book);
    } catch (err: any) {
      setError(err.message || "Revision failed");
    } finally {
      setBusy(null);
    }
  };

  const refresh = async () => {
    if (!user || !bookId) {
      onAskYulia("Refresh this local Studio draft against the V19 model stack once the server book is saved.");
      return;
    }
    setBusy("Refreshing models");
    setError(null);
    try {
      const res = await fetch(`/api/studio/pitch-books/${bookId}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refresh failed");
      setBook(data.book);
      setReadiness(data.readiness ?? null);
      onBookUpdated(data.book);
    } catch (err: any) {
      setError(err.message || "Refresh failed");
    } finally {
      setBusy(null);
    }
  };

  const exportBook = async (format: "pptx" | "pdf") => {
    if (!user || !bookId) {
      onAskYulia(`Prepare this ${output.title} for ${format.toUpperCase()} export once it is saved to Studio.`);
      return;
    }
    setBusy(`Exporting ${format.toUpperCase()}`);
    setError(null);
    try {
      const res = await fetch(`/api/studio/pitch-books/${bookId}/export/${format}`, { headers: authHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${current.title.replace(/[^a-zA-Z0-9_-]+/g, "_")}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="wk-content" style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* Canvas page header */}
      <div className="pg-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="pg-eyebrow">Pitch Book Studio</div>
          <div className="pg-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>{current.title}</div>
          <p className="pg-sub">{output.detail}</p>
        </div>
        <div className="pg-actions">
          {warningCount ? (
            <span className="statpill flag"><span className="d" />{warningCount} slide gaps</span>
          ) : (
            <span className="statpill good"><span className="d" />slides grounded</span>
          )}
          {modelHealth.gaps ? (
            <span className="statpill review"><span className="d" />{modelHealth.label}</span>
          ) : (
            <span className="statpill good"><span className="d" />{modelHealth.label}</span>
          )}
          {!readiness || readiness.readyForExternalDelivery ? (
            <span className="statpill good"><span className="d" />{readinessLabel}</span>
          ) : (
            <span className="statpill flag"><span className="d" />{readinessLabel}</span>
          )}
          <button className="wkbtn" type="button" onClick={() => void refresh()} disabled={!!busy}>Refresh models</button>
          <button className="wkbtn" type="button" onClick={() => void exportBook("pdf")} disabled={!!busy}>PDF</button>
          <button className="wkbtn primary" type="button" onClick={() => void exportBook("pptx")} disabled={!!busy}>PowerPoint</button>
        </div>
      </div>

      {/* Workbench: slides + tool rail */}
      <div style={S.workbench}>
        {/* Slide stage */}
        <section style={S.slideStage}>
          <div style={S.deckFrame}>
            {current.slides.map((slide, index) => (
              <article key={slide.id} className="wkcard">
                <div style={S.slideTop}>
                  <span style={S.slideNumber}>{String(index + 1).padStart(2, "0")}</span>
                  {slide.warningState === "clean" ? (
                    <span className="statpill good"><span className="d" />grounded</span>
                  ) : (
                    <span className="statpill flag"><span className="d" />{slide.warningState.replace("_", " ")}</span>
                  )}
                </div>
                <h2 style={S.slideTitle}>{slide.title}</h2>
                <p style={S.slideBody}>{slide.body}</p>
                <div style={S.bulletGrid}>
                  {slide.bullets.map(point => <span key={point} style={S.bulletItem}>{point}</span>)}
                </div>
                <div style={S.provenanceStrip}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{slide.provenance.factsUsed.length} facts</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{slide.provenance.modelOutputsUsed.length} models</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{slide.provenance.citationsUsed.length} cites</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{slide.provenance.uncheckedClaims.length} unchecked</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Tool rail */}
        <aside style={S.toolRail}>
          <section className="wkcard">
            <strong style={S.railTitle}>Yulia instruction</strong>
            <textarea
              value={story}
              onChange={(event) => setStory(event.target.value)}
              placeholder="Tell Yulia what to change: audience, tone, missing proof, or the decision the book needs to support."
              style={S.storyInput}
            />
            <button className="wkbtn primary" style={S.fullButton} onClick={() => void revise()} disabled={!!busy}>
              {busy === "Revising" ? "Revising..." : "Revise book"}
            </button>
            <button className="wkbtn" style={S.fullButton} onClick={() => onAskYulia(`${output.prompt} Review this open Studio book and tell me the three highest-impact improvements before export.`)}>
              Ask Yulia
            </button>
          </section>

          <section className="wkcard">
            <strong style={S.railTitle}>Source tray</strong>
            <div style={S.sourceStack}>
              {current.sources.map(source => (
                <div key={`${source.sourceType}-${source.id ?? source.label}`} style={S.sourceCard}>
                  <span style={source.status === "linked" ? S.cleanDot : S.warnDot} />
                  <span style={S.sourceText}>
                    <strong style={{ fontSize: 13 }}>{source.label}</strong>
                    <small style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{source.sourceType}{source.citationTag ? ` / ${source.citationTag}` : ""}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="wkcard">
            <strong style={S.railTitle}>Assumptions</strong>
            {current.assumptions.map(item => (
              <div key={String(item.key)} style={S.assumptionRow}>
                <span style={{ color: "var(--ink-2)", fontSize: 13 }}>{String(item.label || item.key)}</span>
                <strong style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{String(item.value ?? "-")}</strong>
              </div>
            ))}
          </section>

          <section className="wkcard">
            <strong style={S.railTitle}>Model tray</strong>
            <div style={S.modelStack}>
              {current.modelOutputs.map(item => (
                <div key={String(item.modelId)} style={S.modelCard}>
                  <span style={modelDotStyle(item)} />
                  <span style={S.modelText}>
                    <strong style={{ fontSize: 13, color: "var(--ink)" }}>{formatModelName(String(item.modelId || "MODEL.UNKNOWN.v1"))}</strong>
                    <small style={{ color: "var(--ink-3)", fontSize: 12 }}>{modelSummary(item)}</small>
                  </span>
                  {item.outputHash && (
                    <code style={S.modelHash}>{shortHash(String(item.outputHash))}</code>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="wkcard">
            <strong style={S.railTitle}>Audit</strong>
            <p style={S.auditCopy}>
              Version <span style={{ fontFamily: "var(--font-mono)" }}>{current.version}</span>. Exports write an output hash and include source and audit appendices.
            </p>
            {readiness?.issues.length ? (
              <div style={S.readinessList}>
                {readiness.issues.slice(0, 4).map((issue, index) => (
                  <div key={`${issue.code}-${index}`} style={S.readinessItem}>
                    <strong style={{ fontSize: 12, color: "var(--ink)" }}>{issue.label}</strong>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{issue.detail}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {error && <div className="wkerr" style={{ marginTop: 10 }}>{error}</div>}
            {busy && <p style={S.busyText}>{busy}...</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function localBook(format: StudioFormatId, title: string, brief = ""): PitchBookRecord {
  const fmt = FORMATS.find(item => item.id === format) ?? FORMATS[0];
  const slides: StudioSlide[] = ["Decision frame", "Source read", "Model view", "Risks", "Open questions", "Next actions"].map((name, index) => ({
    id: `local-${format}-${index}`,
    title: index === 0 ? fmt.title : name,
    body: index === 0 ? (brief || fmt.detail) : "Save this book to Studio to attach deal files, model outputs, and audit metadata.",
    bullets: index === 0
      ? ["Source-grounded story", "Model-linked outputs", "Exportable audit trail"]
      : ["Add source", "Refresh model", "Review with Yulia"],
    speakerNotes: "Local draft. Save to Studio for persistence and export tracking.",
    provenance: {
      factsUsed: [],
      modelOutputsUsed: [],
      citationsUsed: [],
      uncheckedClaims: ["Local draft is not source-grounded."],
    },
    warningState: "needs_sources",
  }));
  return {
    id: Math.abs(hashCode(`${format}-${title}`)),
    dealId: null,
    title,
    format,
    status: "draft",
    brief,
    versionId: null,
    version: 1,
    outline: slides.map(slide => slide.title),
    slides,
    assumptions: [
      { key: "format", label: "Format", value: fmt.title },
      { key: "state", label: "State", value: "Local draft" },
    ],
    modelOutputs: [{ modelId: "MODEL.V19.RUNTIME", status: "not_saved" }],
    provenance: {},
    audit: {},
    sources: [
      { sourceType: "studio_template", label: fmt.title, status: "linked" },
      { sourceType: "deal_files", label: "Deal files not linked", status: "missing" },
    ],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function bookWarningCount(book: PitchBookRecord): number {
  return book.slides.filter(slide => slide.warningState !== "clean").length;
}

function bookReadinessCount(book: PitchBookRecord): number {
  return bookWarningCount(book) + modelHealthForBook(book).gaps;
}

function modelHealthForBook(book: PitchBookRecord): { total: number; complete: number; gaps: number; label: string } {
  const outputs = book.modelOutputs || [];
  const complete = outputs.filter(item => item.status === "complete").length;
  const gaps = outputs.filter(item => item.status !== "complete" || safeModelMissingInputs(item).length > 0).length;
  const label = outputs.length === 0
    ? "no models"
    : gaps
      ? `${gaps} model ${gaps === 1 ? "gap" : "gaps"}`
      : `${complete} models current`;
  return { total: outputs.length, complete, gaps, label };
}

function safeModelMissingInputs(item: Record<string, any>): string[] {
  return Array.isArray(item.missingInputs) ? item.missingInputs.map(value => String(value)).filter(Boolean) : [];
}

function formatModelName(modelId: string): string {
  return modelId
    .replace(/^MODEL\./, "")
    .replace(/\.v\d+$/, "")
    .split(".")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function modelSummary(item: Record<string, any>): string {
  const missing = safeModelMissingInputs(item);
  if (missing.length) return `Needs ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`;
  if (item.status === "complete") return item.version ? `Current ${item.version}` : "Current";
  if (item.status === "not_saved") return "Save the book to run";
  return String(item.status || "Not run").replace(/_/g, " ");
}

function modelDotStyle(item: Record<string, any>): CSSProperties {
  return item.status === "complete" && safeModelMissingInputs(item).length === 0 ? S.cleanDot : S.warnDot;
}

function shortHash(value: string): string {
  return value.slice(0, 7);
}

function formatLabel(value: StudioFormatId): string {
  return FORMATS.find(item => item.id === value)?.title ?? value.replace(/-/g, " ");
}

function formatInitial(value: StudioFormatId): string {
  return formatLabel(value).split(/\s+/).map(part => part[0]).slice(0, 2).join("");
}

function hashCode(value: string): number {
  return value.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function isStudioFormat(value: unknown): value is StudioFormatId {
  return typeof value === "string" && FORMATS.some(format => format.id === value);
}

function readStudioDraft(id: string): SavedStudioDraft | undefined {
  const working = readWorkingStudioDrafts()[id];
  if (working) return working;
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return undefined;
    const draft = parsed.find((item: any) => item?.id === id);
    if (!draft) return undefined;
    return {
      id: typeof draft.id === "string" ? draft.id : id,
      title: typeof draft.title === "string" ? draft.title : "Pitch Book Studio draft",
      format: isStudioFormat(draft.format) ? draft.format : "buyer-pitch-book",
      campaign: typeof draft.campaign === "string" ? draft.campaign : "Pitch Book Studio",
      updatedAt: typeof draft.updatedAt === "string" ? draft.updatedAt : "",
      story: typeof draft.story === "string" ? draft.story : "",
      status: draft.status === "completed" ? "completed" : "draft",
      studioBookId: typeof draft.studioBookId === "number" ? draft.studioBookId : null,
    };
  } catch {
    return undefined;
  }
}

function writeStudioDraft(draft: SavedStudioDraft) {
  try {
    const store = readWorkingStudioDrafts();
    store[draft.id] = draft;
    (window as unknown as Record<string, Record<string, SavedStudioDraft>>)[WORKING_DRAFTS_KEY] = store;
  } catch {
    // Local draft cache is best effort.
  }
}

function readWorkingStudioDrafts(): Record<string, SavedStudioDraft> {
  const win = window as unknown as Record<string, Record<string, SavedStudioDraft> | undefined>;
  const store = win[WORKING_DRAFTS_KEY];
  if (store && typeof store === "object") return store;
  win[WORKING_DRAFTS_KEY] = {};
  return win[WORKING_DRAFTS_KEY] ?? {};
}

// Flat style tokens — all var(--...) from workspace.css, no gradients, no textures, no glass.
const S: Record<string, CSSProperties> = {
  // Format grid card extras (the .wkcard class handles the base box)
  formatCard: {
    all: "unset",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "18px 20px",
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 14,
    cursor: "pointer",
    transition: "border-color .18s, box-shadow .18s, transform .18s",
    textAlign: "left",
    width: "100%",
  },
  formatMeta: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--ink-3)",
    fontWeight: 500,
  },
  formatDetail: {
    color: "var(--ink-2)",
    fontSize: 13,
    lineHeight: 1.45,
    marginTop: 4,
  },
  formatAction: {
    marginTop: "auto",
    paddingTop: 12,
    color: "var(--accent-strong)",
    fontSize: 13,
    fontWeight: 600,
  },
  sectionCopy: {
    color: "var(--ink-2)",
    fontSize: 15,
    lineHeight: 1.5,
    maxWidth: 620,
    margin: "4px 0 0",
  },

  // Books list panel (inside .wkcard with padding:0)
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px 14px",
    borderBottom: "1px solid var(--line)",
  },
  bookStack: {
    display: "flex",
    flexDirection: "column",
  },
  bookRow: {
    all: "unset",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 20px",
    borderBottom: "1px solid var(--line)",
    cursor: "pointer",
    transition: "background .15s",
    width: "100%",
  },
  bookIcon: {
    flex: "none",
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "var(--surface-2)",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--ink-2)",
  },
  bookBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    fontSize: 14,
    color: "var(--ink)",
  },
  bookMeta: {
    fontSize: 12,
    color: "var(--ink-3)",
  },

  // Workbench diff items
  diffItem: {
    all: "unset",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "14px 16px",
    background: "var(--surface-2)",
    border: "1px solid var(--line)",
    borderRadius: 12,
    cursor: "pointer",
    transition: "border-color .18s, background .15s",
    textAlign: "left",
    width: "100%",
  },
  diffItemTitle: {
    color: "var(--ink)",
    fontWeight: 600,
    fontSize: 13,
  },
  diffItemBody: {
    color: "var(--ink-2)",
    fontSize: 12,
    lineHeight: 1.45,
  },

  // Canvas workbench layout
  workbench: {
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(14px, 1.4vw, 22px)",
    alignItems: "start",
  },
  slideStage: {
    minHeight: 480,
    maxWidth: 1000,
    minWidth: "min(100%, 560px)",
    flex: "1 1 680px",
  },
  deckFrame: {
    display: "grid",
    gap: 16,
  },
  slideTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slideNumber: {
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    fontSize: 13,
    color: "var(--accent-strong)",
  },
  slideTitle: {
    margin: "24px 0 12px",
    fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    color: "var(--ink)",
    fontWeight: 600,
  },
  slideBody: {
    color: "var(--ink-2)",
    fontSize: 15,
    lineHeight: 1.5,
    maxWidth: 760,
    margin: 0,
  },
  bulletGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
    gap: 8,
    marginTop: 18,
  },
  bulletItem: {
    padding: "8px 12px",
    background: "var(--surface-2)",
    borderRadius: 8,
    border: "1px solid var(--line)",
    fontSize: 13,
    color: "var(--ink-2)",
  },
  provenanceStrip: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
    color: "var(--ink-3)",
    fontSize: 12,
    fontWeight: 500,
  },

  // Tool rail
  toolRail: {
    display: "grid",
    gap: 12,
    flex: "0 1 310px",
    width: "min(100%, 310px)",
    alignSelf: "flex-start",
  },
  railTitle: {
    display: "block",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--ink)",
  },
  storyInput: {
    minHeight: 140,
    width: "100%",
    resize: "vertical",
    borderRadius: 10,
    border: "1px solid var(--line-2)",
    padding: "10px 12px",
    font: "inherit",
    fontSize: 13,
    boxSizing: "border-box",
    background: "var(--surface)",
    color: "var(--ink)",
    outline: "none",
  },
  fullButton: {
    width: "100%",
    marginTop: 8,
    minHeight: 38,
  },

  // Source tray
  sourceStack: {
    display: "grid",
    gap: 8,
  },
  sourceCard: {
    display: "grid",
    gridTemplateColumns: "10px minmax(0, 1fr)",
    gap: 8,
    alignItems: "start",
  },
  sourceText: {
    display: "grid",
    gap: 2,
    minWidth: 0,
  },

  // Model tray
  modelStack: {
    display: "grid",
    gap: 8,
  },
  modelCard: {
    display: "grid",
    gridTemplateColumns: "10px minmax(0, 1fr) auto",
    gap: 8,
    alignItems: "start",
    padding: "8px 0",
    borderBottom: "1px solid var(--line)",
  },
  modelText: {
    display: "grid",
    gap: 2,
    minWidth: 0,
  },
  modelHash: {
    alignSelf: "start",
    padding: "3px 6px",
    borderRadius: 7,
    background: "var(--accent-soft)",
    color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 600,
  },

  // Status dots
  cleanDot: {
    width: 8,
    height: 8,
    marginTop: 5,
    borderRadius: 99,
    background: "var(--st-good-dot)",
    flexShrink: 0,
  },
  warnDot: {
    width: 8,
    height: 8,
    marginTop: 5,
    borderRadius: 99,
    background: "var(--st-review-dot)",
    flexShrink: 0,
  },

  // Assumption row
  assumptionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    borderBottom: "1px solid var(--line)",
    padding: "7px 0",
  },

  // Audit section
  auditCopy: {
    color: "var(--ink-2)",
    lineHeight: 1.45,
    margin: 0,
    fontSize: 13,
  },
  readinessList: {
    display: "grid",
    gap: 6,
    marginTop: 12,
  },
  readinessItem: {
    display: "grid",
    gap: 2,
    padding: "7px 0",
    borderTop: "1px solid var(--line)",
  },
  busyText: {
    color: "var(--ink-3)",
    fontWeight: 600,
    fontSize: 13,
    margin: "8px 0 0",
  },
};
