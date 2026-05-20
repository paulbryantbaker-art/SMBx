import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { STUDIO_TEXTURES } from "../../../lib/randomTextures";
import type { OpenTab, StudioFormatId, Tab } from "../types";
import { V19UsageMeter } from "../V19UsageMeter";
import {
  studioCompeteButtonItemStyles,
  studioCompeteCardStyles,
  studioFormatCardBackground as formatCardBackground,
  studioGlassBackdrop as glassBackdrop,
  studioHeroWash,
  studioLiquidGlass as liquidGlass,
  studioListCardStyles,
  studioTextureCardStyles,
} from "../styles/studioSurfaces";

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

const SAMPLE_BOOKS: PitchBookRecord[] = [
  localBook("qoe-preview-book", "Big Fake Deal - QoE Preview Book"),
  localBook("buyer-pitch-book", "Pest Control FL - Buyer Pitch Book"),
];

const WORKBENCH_STACK = [
  {
    title: "Unified inputs",
    body: "Files, model runs, citations, and Yulia's narrative live in one book.",
    prompt: "Explain how Pitch Book Studio keeps files, model runs, citations, and Yulia narrative unified in one book.",
  },
  {
    title: "Slide provenance",
    body: "Each slide tracks facts, models, citations, and unchecked claims.",
    prompt: "Explain Studio slide provenance: facts used, model outputs used, citations used, and unchecked claims.",
  },
  {
    title: "Export discipline",
    body: "PPTX/PDF exports include source and audit appendices.",
    prompt: "Explain how Studio export discipline works for PPTX/PDF, source footnotes, and audit appendices.",
  },
  {
    title: "Deal-native",
    body: "The book opens in the same canvas as Today, Files, and Pipeline.",
    prompt: "Explain what deal-native Studio means and how books connect to Today, Files, Pipeline, and chat.",
  },
];

export function V6MarketingStudioView({ tab, openTab, user, onTalkToYulia }: MarketingStudioProps) {
  const [books, setBooks] = useState<PitchBookRecord[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askYulia = (prompt: string) => onTalkToYulia?.(prompt);

  useEffect(() => {
    if (!user) {
      setBooks(SAMPLE_BOOKS);
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
        if (alive) setBooks(Array.isArray(data.books) && data.books.length ? data.books : SAMPLE_BOOKS);
      })
      .catch(() => {
        if (alive) setBooks(SAMPLE_BOOKS);
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
    <main className="m-fade-up" style={S.page}>
      <section style={S.hero}>
        <div style={S.heroTexture} />
        <div style={S.heroInner}>
          <h1 style={S.heroTitle}>Create finance-grade pitch books from the same deal brain.</h1>
          <p style={S.heroCopy}>
            Build IC decks, QoE preview books, buyer books, lender books, and CIM summaries with slide-level sources, model links, and export-ready audit trails.
          </p>
        </div>
      </section>

      <section style={S.quickStartHeader}>
        <div>
          <h2 style={S.sectionTitle}>Start from a format.</h2>
          <p style={S.sectionCopy}>
            Choose the collateral Yulia should build. Use the chat rail for audience, source, and mandate instructions.
          </p>
        </div>
      </section>
      {error && <div style={S.errorNotice}>{error}</div>}
      {user && <V19UsageMeter user={user} compact surface="studio" />}

      <section style={S.formatGrid}>
        {FORMATS.map(format => (
          <button
            key={format.id}
            type="button"
            className="m-state"
            style={{ ...S.formatCard, backgroundImage: formatCardBackground(format.id) }}
            onClick={() => void createBook(format.id)}
          >
            <span style={S.formatMeta}>{format.slideCount}</span>
            <strong style={S.formatTitle}>{format.title}</strong>
            <span style={S.formatAudience}>{format.audience}</span>
            <span style={S.formatDetail}>{format.detail}</span>
            <span style={S.formatAction}>Create</span>
          </button>
        ))}
      </section>

      <section style={S.lowerGrid}>
        <div style={S.bookPanel}>
          <div style={S.panelHeader}>
            <h2 style={S.sectionTitle}>Books in Studio</h2>
            <span style={S.smallPill}>{loadingBooks ? "Loading" : "Current"}</span>
          </div>
          <div style={S.bookStack}>
            {books.map(book => (
              <button key={`${book.id}-${book.version}`} className="m-state" style={S.bookRow} onClick={() => openBook(book)}>
                <span style={S.bookIcon}>{formatInitial(book.format)}</span>
                <span style={S.bookBody}>
                  <strong>{book.title}</strong>
                  <small>{formatLabel(book.format)} / v{book.version} / {book.slides.length} slides</small>
                </span>
                <span style={bookReadinessCount(book) ? S.warnPill : S.cleanPill}>
                  {bookReadinessCount(book) ? `${bookReadinessCount(book)} gaps` : "clean"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={S.diffPanel}>
          <h2 style={S.sectionTitle}>Built to compete with finance workbenches.</h2>
          <div style={S.diffGrid}>
            {WORKBENCH_STACK.map(item => (
              <button key={item.title} type="button" className="m-state" style={S.diffItem} onClick={() => askYulia(item.prompt)}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
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
    <main style={S.canvasPage}>
      <header style={S.canvasHeader}>
        <div>
          <div style={S.brandRail}><span style={S.brandDot}>Y</span><span>Pitch Book Studio</span></div>
          <h1 style={S.canvasTitle}>{current.title}</h1>
          <p style={S.canvasSub}>{output.detail}</p>
        </div>
        <div style={S.canvasActions}>
          <span style={warningCount ? S.warnPill : S.cleanPill}>{warningCount ? `${warningCount} slide gaps` : "slides grounded"}</span>
          <span style={modelHealth.gaps ? S.warnPill : S.cleanPill}>{modelHealth.label}</span>
          <span style={!readiness || readiness.readyForExternalDelivery ? S.cleanPill : S.warnPill}>{readinessLabel}</span>
          <button className="m-btn tonal" style={S.smallButton} onClick={() => void refresh()} disabled={!!busy}>Refresh models</button>
          <button className="m-btn tonal" style={S.smallButton} onClick={() => void exportBook("pdf")} disabled={!!busy}>PDF</button>
          <button className="m-btn filled" style={S.smallButton} onClick={() => void exportBook("pptx")} disabled={!!busy}>PowerPoint</button>
        </div>
      </header>

      <div style={S.workbench}>
        <section style={S.slideStage}>
          <div style={S.deckFrame}>
            {current.slides.map((slide, index) => (
              <article key={slide.id} style={S.slideCard}>
                <div style={S.slideTop}>
                  <span style={S.slideNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span style={slide.warningState === "clean" ? S.cleanPill : S.warnPill}>
                    {slide.warningState === "clean" ? "grounded" : slide.warningState.replace("_", " ")}
                  </span>
                </div>
                <h2 style={S.slideTitle}>{slide.title}</h2>
                <p style={S.slideBody}>{slide.body}</p>
                <div style={S.bulletGrid}>
                  {slide.bullets.map(point => <span key={point}>{point}</span>)}
                </div>
                <div style={S.provenanceStrip}>
                  <span>{slide.provenance.factsUsed.length} facts</span>
                  <span>{slide.provenance.modelOutputsUsed.length} models</span>
                  <span>{slide.provenance.citationsUsed.length} cites</span>
                  <span>{slide.provenance.uncheckedClaims.length} unchecked</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside style={S.toolRail}>
          <section style={S.railSection}>
            <strong style={S.railTitle}>Yulia instruction</strong>
            <textarea
              value={story}
              onChange={(event) => setStory(event.target.value)}
              placeholder="Tell Yulia what to change: audience, tone, missing proof, or the decision the book needs to support."
              style={S.storyInput}
            />
            <button className="m-btn filled" style={S.fullButton} onClick={() => void revise()} disabled={!!busy}>
              {busy === "Revising" ? "Revising..." : "Revise book"}
            </button>
            <button className="m-btn tonal" style={S.fullButton} onClick={() => onAskYulia(`${output.prompt} Review this open Studio book and tell me the three highest-impact improvements before export.`)}>
              Ask Yulia
            </button>
          </section>

          <section style={S.railSection}>
            <strong style={S.railTitle}>Source tray</strong>
            <div style={S.sourceStack}>
              {current.sources.map(source => (
                <div key={`${source.sourceType}-${source.id ?? source.label}`} style={S.sourceCard}>
                  <span style={source.status === "linked" ? S.cleanDot : S.warnDot} />
                  <span style={S.sourceText}>
                    <strong>{source.label}</strong>
                    <small>{source.sourceType}{source.citationTag ? ` / ${source.citationTag}` : ""}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={S.railSection}>
            <strong style={S.railTitle}>Assumptions</strong>
            {current.assumptions.map(item => (
              <div key={String(item.key)} style={S.assumptionRow}>
                <span>{String(item.label || item.key)}</span>
                <strong>{String(item.value ?? "-")}</strong>
              </div>
            ))}
          </section>
          <section style={S.railSection}>
            <strong style={S.railTitle}>Model tray</strong>
            <div style={S.modelStack}>
              {current.modelOutputs.map(item => (
                <div key={String(item.modelId)} style={S.modelCard}>
                  <span style={modelDotStyle(item)} />
                  <span style={S.modelText}>
                    <strong>{formatModelName(String(item.modelId || "MODEL.UNKNOWN.v1"))}</strong>
                    <small>{modelSummary(item)}</small>
                  </span>
                  {item.outputHash && <code style={S.modelHash}>{shortHash(String(item.outputHash))}</code>}
                </div>
              ))}
            </div>
          </section>
          <section style={S.railSection}>
            <strong style={S.railTitle}>Audit</strong>
            <p style={S.auditCopy}>
              Version {current.version}. Exports write an output hash and include source and audit appendices.
            </p>
            {readiness?.issues.length ? (
              <div style={S.readinessList}>
                {readiness.issues.slice(0, 4).map((issue, index) => (
                  <div key={`${issue.code}-${index}`} style={S.readinessItem}>
                    <strong>{issue.label}</strong>
                    <span>{issue.detail}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {error && <p style={S.errorNotice}>{error}</p>}
            {busy && <p style={S.busyText}>{busy}...</p>}
          </section>
        </aside>
      </div>
    </main>
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

const S: Record<string, CSSProperties> = {
  page: {
    width: "min(1440px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "22px 0 72px",
    color: "#172033",
  },
  hero: {
    minHeight: 340,
    borderRadius: 24,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "clamp(24px, 3vw, 40px)",
    backgroundImage: studioHeroWash,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    border: "1px solid rgba(255,255,255,0.46)",
    boxShadow: "0 48px 118px rgba(52, 63, 90, 0.31), 0 20px 46px rgba(26, 34, 51, 0.16), 0 4px 12px rgba(26, 34, 51, 0.08), inset 0 1px 0 rgba(255,255,255,0.28)",
  },
  heroTexture: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "radial-gradient(circle at 12% 6%, rgba(255,255,255,0.18), transparent 34%), linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 56%)",
    opacity: 1,
  },
  heroInner: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: 820,
    padding: 0,
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "inline-grid",
    placeItems: "center",
    color: "#fff",
    background: "linear-gradient(145deg, #B7D8C6 0%, #5EA77F 100%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 8px 18px rgba(26,34,51,0.13)",
  },
  heroTitle: {
    margin: 0,
    maxWidth: 820,
    fontFamily: "'Figtree', var(--font-body)",
    fontWeight: 850,
    fontSize: "clamp(34px, 4vw, 62px)",
    lineHeight: 0.96,
    letterSpacing: "-0.055em",
    color: "#FFFFFF",
    textWrap: "balance",
    textShadow: "0 2px 18px rgba(26,34,51,0.20)",
  },
  heroCopy: {
    maxWidth: 680,
    margin: "18px 0 0",
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 1.55,
    textWrap: "pretty",
  },
  quickStartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 18,
    marginTop: 28,
    padding: "0 6px",
    flexWrap: "wrap",
  },
  sectionTitle: { margin: 0, fontSize: 28, lineHeight: 1.05 },
  sectionCopy: { color: "#60708A", fontSize: 16, lineHeight: 1.5, maxWidth: 620 },
  errorText: { display: "block", marginTop: 10, color: "#8B3F24", fontWeight: 800 },
  errorNotice: {
    margin: "12px 0 0",
    padding: "12px 14px",
    borderRadius: 18,
    color: "#243653",
    fontWeight: 850,
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,.72), transparent 35%), linear-gradient(135deg, rgba(255,255,255,.72), rgba(234,243,251,.62))",
    border: "1px solid rgba(166,190,220,.42)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.76), 0 16px 34px rgba(42,65,96,.10)",
    ...glassBackdrop,
  },
  busyText: { color: "#2E5C8A", fontWeight: 800 },
  formatGrid: studioTextureCardStyles.grid,
  formatCard: studioTextureCardStyles.card,
  formatCardActive: studioTextureCardStyles.active,
  formatMeta: studioTextureCardStyles.meta,
  formatTitle: studioTextureCardStyles.title,
  formatAudience: studioTextureCardStyles.audience,
  formatDetail: studioTextureCardStyles.detail,
  formatAction: studioTextureCardStyles.action,
  lowerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 24, marginTop: 28 },
  bookPanel: studioListCardStyles.panel,
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  smallPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(138,154,232,.14)",
    color: "#2E5C8A",
    fontWeight: 800,
    fontSize: 12,
  },
  bookStack: studioListCardStyles.stack,
  bookRow: studioListCardStyles.row,
  bookIcon: studioListCardStyles.icon,
  bookBody: studioListCardStyles.body,
  cleanPill: studioListCardStyles.cleanPill,
  warnPill: studioListCardStyles.warnPill,
  diffPanel: studioCompeteCardStyles.panel,
  diffGrid: studioCompeteCardStyles.grid,
  diffItem: studioCompeteButtonItemStyles,
  canvasPage: {
    width: "min(1440px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "20px 0 72px",
    color: "#172033",
  },
  canvasHeader: {
    width: "100%",
    margin: "0 auto 18px",
    padding: 20,
    boxSizing: "border-box",
    borderRadius: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 20,
    backgroundImage: `radial-gradient(circle at 12% 0%, rgba(255,255,255,.66), transparent 40%), linear-gradient(135deg, rgba(247,251,255,.84), rgba(224,237,251,.50)), url('${STUDIO_TEXTURES.green}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid rgba(255,255,255,.62)",
    boxShadow: "0 18px 44px rgba(42,65,96,.10), inset 0 1px 0 rgba(255,255,255,.82)",
    ...glassBackdrop,
  },
  canvasTitle: { margin: "14px 0 6px", fontSize: "clamp(34px, 4vw, 54px)", lineHeight: 0.96, letterSpacing: 0 },
  canvasSub: { margin: 0, color: "#4F6077", fontSize: 16, lineHeight: 1.42, maxWidth: 620 },
  canvasActions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" },
  smallButton: { minHeight: 38 },
  workbench: {
    width: "100%",
    maxWidth: 1440,
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(14px, 1.4vw, 22px)",
    justifyContent: "center",
    alignItems: "start",
  },
  leftRail: { display: "grid", gap: 14, flex: "0 1 340px", width: "min(100%, 340px)", maxWidth: 340 },
  rightRail: {
    display: "grid",
    gap: 14,
    flex: "0 1 360px",
    width: "min(100%, 360px)",
    maxWidth: 360,
  },
  toolRail: {
    display: "grid",
    gap: 12,
    flex: "0 1 330px",
    width: "min(100%, 330px)",
    maxWidth: 330,
    alignSelf: "flex-start",
  },
  railSection: {
    borderRadius: 18,
    padding: 16,
    background: liquidGlass,
    border: "1px solid rgba(255,255,255,.55)",
    boxShadow: "0 14px 32px rgba(42,65,96,.09), inset 0 1px 0 rgba(255,255,255,.70)",
    ...glassBackdrop,
  },
  railTitle: { display: "block", marginBottom: 12, fontSize: 16 },
  storyInput: {
    minHeight: 154,
    width: "100%",
    resize: "vertical",
    borderRadius: 16,
    border: "1px solid rgba(126,150,184,.42)",
    padding: 12,
    font: "inherit",
    boxSizing: "border-box",
  },
  fullButton: { width: "100%", marginTop: 10, minHeight: 40 },
  sourceStack: { display: "grid", gap: 9 },
  sourceCard: { display: "grid", gridTemplateColumns: "12px minmax(0, 1fr)", gap: 9, alignItems: "start" },
  sourceText: { display: "grid", gap: 2, minWidth: 0 },
  modelStack: { display: "grid", gap: 10 },
  modelCard: {
    display: "grid",
    gridTemplateColumns: "12px minmax(0, 1fr) auto",
    gap: 10,
    alignItems: "start",
    padding: "10px 0",
    borderBottom: "1px solid rgba(153,176,209,.24)",
  },
  modelText: { display: "grid", gap: 3, minWidth: 0 },
  modelHash: {
    alignSelf: "start",
    padding: "3px 6px",
    borderRadius: 8,
    background: "rgba(138,154,232,.12)",
    color: "#2E5C8A",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 11,
    fontWeight: 800,
  },
  cleanDot: { width: 9, height: 9, marginTop: 5, borderRadius: 99, background: "#6FAE95" },
  warnDot: { width: 9, height: 9, marginTop: 5, borderRadius: 99, background: "#C9A24E" },
  slideStage: {
    minHeight: 720,
    maxWidth: 1000,
    minWidth: "min(100%, 600px)",
    flex: "1 1 760px",
    borderRadius: 24,
    padding: 16,
    backgroundImage: `radial-gradient(circle at 20% 0%, rgba(255,255,255,.62), transparent 38%), linear-gradient(180deg, rgba(225,238,252,.82), rgba(255,255,255,.56)), url('${STUDIO_TEXTURES.blue}')`,
    backgroundSize: "cover",
    border: "1px solid rgba(255,255,255,.58)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.88), 0 20px 46px rgba(42,65,96,.10)",
    ...glassBackdrop,
  },
  deckFrame: { display: "grid", gap: 16 },
  slideCard: {
    minHeight: 382,
    borderRadius: 22,
    padding: 24,
    backgroundImage: `radial-gradient(circle at 8% 0%, rgba(255,255,255,.76), transparent 40%), linear-gradient(135deg, rgba(255,255,255,.82), rgba(245,249,255,.58)), url('${STUDIO_TEXTURES.rose}')`,
    backgroundSize: "cover",
    border: "1px solid rgba(255,255,255,.58)",
    boxShadow: "0 18px 44px rgba(42,65,96,.12), inset 0 1px 0 rgba(255,255,255,.80)",
    ...glassBackdrop,
  },
  slideTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  slideNumber: { fontWeight: 900, color: "#8A9AE8" },
  slideTitle: { margin: "42px 0 14px", fontSize: 34, lineHeight: 0.98, maxWidth: 720, letterSpacing: 0 },
  slideBody: { color: "#526176", fontSize: 17, lineHeight: 1.45, maxWidth: 760 },
  bulletGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10, marginTop: 24 },
  provenanceStrip: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 24,
    color: "#60708A",
    fontSize: 12,
    fontWeight: 800,
  },
  assumptionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    borderBottom: "1px solid rgba(153,176,209,.24)",
    padding: "8px 0",
    color: "#60708A",
  },
  modelRow: {
    display: "grid",
    gap: 3,
    padding: "9px 0",
    borderBottom: "1px solid rgba(153,176,209,.24)",
  },
  auditCopy: { color: "#60708A", lineHeight: 1.45, margin: 0 },
  readinessList: { display: "grid", gap: 8, marginTop: 12 },
  readinessItem: {
    display: "grid",
    gap: 3,
    padding: "9px 0",
    borderTop: "1px solid rgba(153,176,209,.24)",
    color: "#60708A",
    fontSize: 12,
    lineHeight: 1.35,
  },
};
