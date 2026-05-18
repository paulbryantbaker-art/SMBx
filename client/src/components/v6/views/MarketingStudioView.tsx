import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { DESKTOP_TEXTURES, STUDIO_TEXTURES } from "../../../lib/randomTextures";
import type { OpenTab, StudioFormatId, Tab } from "../types";

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

export function V6MarketingStudioView({ tab, openTab, user, onTalkToYulia }: MarketingStudioProps) {
  const [books, setBooks] = useState<PitchBookRecord[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [brief, setBrief] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<StudioFormatId>("qoe-preview-book");
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

  const activeFormat = FORMATS.find(item => item.id === selectedFormat) ?? FORMATS[0];
  const activeOutput = tab.studioView === "canvas"
    ? FORMATS.find(output => output.id === tab.studioFormat) ?? activeFormat
    : null;

  const refreshBook = (next: PitchBookRecord) => {
    setBooks(prev => [next, ...prev.filter(item => item.id !== next.id)]);
  };

  const createBook = async (format: StudioFormatId, title?: string) => {
    const output = FORMATS.find(item => item.id === format) ?? activeFormat;
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
          brief: brief || output.prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create pitch book");
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
          <div style={S.brandRail}>
            <span style={S.brandDot}>Y</span>
            <span>Pitch Book Studio</span>
          </div>
          <h1 style={S.heroTitle}>Create finance-grade pitch books from the same deal brain.</h1>
          <p style={S.heroCopy}>
            Build IC decks, QoE preview books, buyer books, lender books, and CIM summaries with slide-level sources, model links, and export-ready audit trails.
          </p>
          <div style={S.heroActions}>
            <button className="m-btn filled" style={S.primaryButton} onClick={() => void createBook("qoe-preview-book")}>
              Start QoE Preview
            </button>
            <button className="m-btn tonal" style={S.glassButton} onClick={() => askYulia("Help me choose the right pitch book format and ask for the source files you need first.")}>
              Plan with Yulia
            </button>
          </div>
        </div>
        <div style={S.heroPanel}>
          <div style={S.panelTop}>
            <strong>Studio readiness</strong>
            <span>{loadingBooks ? "syncing" : `${books.length} books`}</span>
          </div>
          {["Sources linked", "Model outputs tracked", "Audit appendix ready"].map((item, index) => (
            <div key={item} style={S.readinessRow}>
              <span style={{ ...S.readinessMeter, width: `${84 - index * 16}%` }} />
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section style={S.commandBand}>
        <div style={S.commandCopy}>
          <h2 style={S.sectionTitle}>Start from a mandate.</h2>
          <p style={S.sectionCopy}>
            Give Yulia the audience and the decision the book needs to support. The Studio keeps the story, sources, assumptions, model outputs, and export trail together.
          </p>
        </div>
        <div style={S.commandBox}>
          <select value={selectedFormat} onChange={(event) => setSelectedFormat(event.target.value as StudioFormatId)} style={S.select}>
            {FORMATS.map(format => <option key={format.id} value={format.id}>{format.title}</option>)}
          </select>
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Example: Build a QoE preview for a buyer deciding whether to spend outside diligence money. Focus on defended EBITDA, add-backs, NWC, and red flags."
            style={S.briefInput}
          />
          <button className="m-btn filled" style={S.commandButton} onClick={() => void createBook(selectedFormat)}>
            Create {activeFormat.title}
          </button>
          {error && <span style={S.errorText}>{error}</span>}
        </div>
      </section>

      <section style={S.formatGrid}>
        {FORMATS.map(format => (
          <button
            key={format.id}
            type="button"
            className="m-state"
            style={{ ...S.formatCard, ...(selectedFormat === format.id ? S.formatCardActive : null) }}
            onClick={() => setSelectedFormat(format.id)}
            onDoubleClick={() => void createBook(format.id)}
          >
            <span style={S.formatMeta}>{format.slideCount}</span>
            <strong style={S.formatTitle}>{format.title}</strong>
            <span style={S.formatAudience}>{format.audience}</span>
            <span style={S.formatDetail}>{format.detail}</span>
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
                <span style={bookWarningCount(book) ? S.warnPill : S.cleanPill}>
                  {bookWarningCount(book) ? `${bookWarningCount(book)} gaps` : "clean"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={S.diffPanel}>
          <h2 style={S.sectionTitle}>Built to compete with finance workbenches.</h2>
          <div style={S.diffGrid}>
            {[
              ["Unified inputs", "Files, model runs, citations, and Yulia's narrative live in one book."],
              ["Slide provenance", "Each slide tracks facts, models, citations, and unchecked claims."],
              ["Export discipline", "PPTX/PDF exports include source and audit appendices."],
              ["Deal-native", "The book opens in the same canvas as Today, Files, and Pipeline."],
            ].map(([title, body]) => (
              <div key={title} style={S.diffItem}>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
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
  const [story, setStory] = useState(localDraft?.story ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bookId = tab.studioBookId ?? null;

  useEffect(() => {
    if (!user || !bookId) {
      setBook(localBook(output.id, tab.title, story));
      return;
    }
    let alive = true;
    setBusy("Loading book");
    fetch(`/api/studio/pitch-books/${bookId}`, { headers: authHeaders() })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load pitch book");
        return data.book as PitchBookRecord;
      })
      .then(next => { if (alive) setBook(next); })
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
          <span style={warningCount ? S.warnPill : S.cleanPill}>{warningCount ? `${warningCount} source gaps` : "source clean"}</span>
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
            <strong style={S.railTitle}>Model outputs</strong>
            {current.modelOutputs.map(item => (
              <div key={String(item.modelId)} style={S.modelRow}>
                <strong>{String(item.modelId)}</strong>
                <span>{String(item.status || "not_run")}</span>
              </div>
            ))}
          </section>
          <section style={S.railSection}>
            <strong style={S.railTitle}>Audit</strong>
            <p style={S.auditCopy}>
              Version {current.version}. Exports write an output hash and include source and audit appendices.
            </p>
            {error && <p style={S.errorText}>{error}</p>}
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
    padding: "28px 0 72px",
    color: "#172033",
  },
  hero: {
    minHeight: 430,
    borderRadius: 28,
    position: "relative",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) 420px",
    gap: 24,
    padding: 28,
    background: "linear-gradient(135deg, rgba(238,245,255,.94), rgba(250,252,255,.84))",
    border: "1px solid rgba(153,176,209,.52)",
    boxShadow: "0 24px 70px rgba(42,65,96,.16), inset 0 1px 0 rgba(255,255,255,.9)",
  },
  heroTexture: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.84), rgba(255,255,255,.18) 56%, rgba(21,36,58,.12)), url('${DESKTOP_TEXTURES.todayHeroSample}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.9,
  },
  heroInner: { position: "relative", zIndex: 1, alignSelf: "end", maxWidth: 820 },
  brandRail: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.68)",
    border: "1px solid rgba(143,166,199,.42)",
    fontWeight: 800,
    color: "#2E5C8A",
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "inline-grid",
    placeItems: "center",
    color: "#fff",
    background: "linear-gradient(135deg, #8A9AE8, #2E5C8A)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)",
  },
  heroTitle: {
    margin: "28px 0 16px",
    maxWidth: 700,
    fontSize: "clamp(42px, 4.8vw, 70px)",
    lineHeight: 0.94,
    letterSpacing: 0,
  },
  heroCopy: {
    maxWidth: 690,
    margin: 0,
    color: "#526176",
    fontSize: 19,
    lineHeight: 1.45,
  },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 },
  primaryButton: { minHeight: 44, background: "#1D5C94", color: "#fff" },
  glassButton: { minHeight: 44, background: "rgba(255,255,255,.72)" },
  heroPanel: {
    position: "relative",
    zIndex: 1,
    alignSelf: "center",
    minHeight: 300,
    borderRadius: 24,
    padding: 22,
    color: "#EAF4FF",
    backgroundImage: `linear-gradient(180deg, rgba(18,35,54,.86), rgba(19,43,66,.74)), url('${STUDIO_TEXTURES.navy}')`,
    backgroundSize: "cover",
    boxShadow: "0 20px 60px rgba(23,42,65,.24), inset 0 1px 0 rgba(255,255,255,.22)",
    border: "1px solid rgba(255,255,255,.22)",
  },
  panelTop: { display: "flex", justifyContent: "space-between", marginBottom: 34, color: "#fff" },
  readinessRow: {
    position: "relative",
    overflow: "hidden",
    minHeight: 72,
    borderRadius: 18,
    padding: "16px 18px",
    marginBottom: 12,
    background: "rgba(255,255,255,.11)",
    border: "1px solid rgba(255,255,255,.18)",
  },
  readinessMeter: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 4,
    background: "linear-gradient(90deg, #8A9AE8, #6FAE95)",
  },
  commandBand: {
    display: "grid",
    gridTemplateColumns: "minmax(0, .82fr) minmax(360px, 1fr)",
    gap: 24,
    marginTop: 28,
    alignItems: "stretch",
  },
  commandCopy: { padding: "22px 6px" },
  sectionTitle: { margin: 0, fontSize: 28, lineHeight: 1.05 },
  sectionCopy: { color: "#60708A", fontSize: 16, lineHeight: 1.5, maxWidth: 620 },
  commandBox: {
    padding: 18,
    borderRadius: 22,
    background: "rgba(255,255,255,.72)",
    border: "1px solid rgba(153,176,209,.45)",
    boxShadow: "0 18px 44px rgba(42,65,96,.12)",
  },
  select: {
    width: "100%",
    height: 44,
    border: "1px solid rgba(126,150,184,.5)",
    borderRadius: 14,
    padding: "0 12px",
    color: "#172033",
    background: "rgba(255,255,255,.86)",
    fontWeight: 800,
  },
  briefInput: {
    width: "100%",
    minHeight: 108,
    marginTop: 12,
    border: "1px solid rgba(126,150,184,.42)",
    borderRadius: 16,
    padding: 14,
    resize: "vertical",
    font: "inherit",
    lineHeight: 1.45,
    color: "#172033",
    background: "rgba(255,255,255,.78)",
    boxSizing: "border-box",
  },
  commandButton: { width: "100%", marginTop: 12, minHeight: 42 },
  errorText: { display: "block", marginTop: 10, color: "#8B3F24", fontWeight: 800 },
  busyText: { color: "#2E5C8A", fontWeight: 800 },
  formatGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(172px, 1fr))",
    gap: 12,
    marginTop: 28,
  },
  formatCard: {
    minHeight: 188,
    textAlign: "left",
    borderRadius: 20,
    padding: 16,
    border: "1px solid rgba(153,176,209,.42)",
    background: "rgba(255,255,255,.68)",
    boxShadow: "0 14px 34px rgba(42,65,96,.08)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  formatCardActive: { borderColor: "rgba(75,113,168,.75)", boxShadow: "0 18px 42px rgba(46,92,138,.18)" },
  formatMeta: { color: "#6B7C95", fontWeight: 800, fontSize: 12 },
  formatTitle: { fontSize: 19, lineHeight: 1.05 },
  formatAudience: { color: "#2E5C8A", fontWeight: 800, fontSize: 12 },
  formatDetail: { color: "#60708A", fontSize: 13, lineHeight: 1.35 },
  lowerGrid: { display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 24, marginTop: 28 },
  bookPanel: {
    borderRadius: 24,
    padding: 20,
    background: "rgba(255,255,255,.72)",
    border: "1px solid rgba(153,176,209,.45)",
  },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  smallPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(138,154,232,.14)",
    color: "#2E5C8A",
    fontWeight: 800,
    fontSize: 12,
  },
  bookStack: { display: "grid", gap: 10, marginTop: 18 },
  bookRow: {
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 12,
    borderRadius: 18,
    background: "rgba(247,250,255,.82)",
    border: "1px solid rgba(153,176,209,.32)",
    textAlign: "left",
  },
  bookIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 900,
    background: "linear-gradient(135deg, #8A9AE8, #2E5C8A)",
  },
  bookBody: { display: "grid", gap: 3, minWidth: 0 },
  cleanPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(111,174,149,.16)",
    color: "#2F735D",
    fontWeight: 900,
    fontSize: 12,
  },
  warnPill: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(201,162,78,.17)",
    color: "#8B6422",
    fontWeight: 900,
    fontSize: 12,
  },
  diffPanel: {
    borderRadius: 24,
    padding: 22,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.84), rgba(238,245,255,.58)), url('${STUDIO_TEXTURES.blue}')`,
    backgroundSize: "cover",
    border: "1px solid rgba(153,176,209,.45)",
  },
  diffGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 },
  diffItem: {
    minHeight: 118,
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,.68)",
    border: "1px solid rgba(153,176,209,.36)",
    display: "grid",
    gap: 8,
    alignContent: "start",
    color: "#60708A",
  },
  canvasPage: {
    width: "calc(100% - clamp(20px, 4vw, 64px))",
    margin: "0 auto",
    padding: "24px 0 72px",
    color: "#172033",
  },
  canvasHeader: {
    width: "min(1760px, 100%)",
    margin: "0 auto 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 20,
  },
  canvasTitle: { margin: "14px 0 6px", fontSize: "clamp(34px, 4vw, 56px)", lineHeight: 0.95 },
  canvasSub: { margin: 0, color: "#60708A", fontSize: 17, maxWidth: 620 },
  canvasActions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" },
  smallButton: { minHeight: 38 },
  workbench: {
    width: "100%",
    maxWidth: 1760,
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
    gap: 14,
    flex: "0 1 340px",
    width: "min(100%, 340px)",
    maxWidth: 340,
    alignSelf: "flex-start",
  },
  railSection: {
    borderRadius: 22,
    padding: 16,
    background: "rgba(255,255,255,.74)",
    border: "1px solid rgba(153,176,209,.42)",
    boxShadow: "0 14px 32px rgba(42,65,96,.08)",
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
  cleanDot: { width: 9, height: 9, marginTop: 5, borderRadius: 99, background: "#6FAE95" },
  warnDot: { width: 9, height: 9, marginTop: 5, borderRadius: 99, background: "#C9A24E" },
  slideStage: {
    minHeight: 720,
    maxWidth: 980,
    minWidth: "min(100%, 600px)",
    flex: "1 1 760px",
    borderRadius: 26,
    padding: 18,
    background: "linear-gradient(180deg, rgba(238,245,255,.88), rgba(255,255,255,.72))",
    border: "1px solid rgba(153,176,209,.48)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.88)",
  },
  deckFrame: { display: "grid", gap: 16 },
  slideCard: {
    minHeight: 360,
    borderRadius: 24,
    padding: 24,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.9), rgba(245,249,255,.72)), url('${STUDIO_TEXTURES.rose}')`,
    backgroundSize: "cover",
    border: "1px solid rgba(153,176,209,.45)",
    boxShadow: "0 18px 44px rgba(42,65,96,.12)",
  },
  slideTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  slideNumber: { fontWeight: 900, color: "#8A9AE8" },
  slideTitle: { margin: "42px 0 14px", fontSize: 36, lineHeight: 0.98, maxWidth: 720 },
  slideBody: { color: "#526176", fontSize: 17, lineHeight: 1.45, maxWidth: 760 },
  bulletGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 24 },
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
};
