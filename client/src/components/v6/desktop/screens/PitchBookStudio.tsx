/**
 * Atlas — PITCH-BOOK STUDIO (the provenance-rich deck builder).
 *
 * This is the hero of the Studio screen: it surfaces the previously-headless
 * `/api/studio/*` engine (server/services/pitchBookStudio.ts). A pitch book is a
 * versioned, model-backed deck. The loop:
 *   pick a format (7 real outlines, each bound to V19 models)  →  create  →
 *   "Refresh from models" runs those V19 models and links their outputs +
 *   citations onto each slide  →  readiness gate  →  export with audit packet.
 *
 * Honesty: every slide carries a REAL warning state (clean / needs sources /
 * stale models) from the engine — nothing is fabricated. Readiness gates
 * external delivery. Plan/credit/approval tollgates are shown as an honest
 * upgrade path, never a crash. No demo content.
 *
 * Polish standard (atlas-desktop-polish-standard): content floats on the shell
 * gradient, cards stay T.border + shCard, separation by tone not chrome lines.
 */
import { useEffect, useMemo, useState } from "react";
import type { AtlasScreenProps } from "../atlasNav";
import { useMobileDeals } from "../../../../hooks/useMobileDeals";
import {
  useStudioBooks,
  useStudioFormats,
  useStudioBook,
  exportPitchBook,
  FORMAT_BLURB,
  type PitchBookRecord,
  type PitchBookFormat,
  type StudioFormatInfo,
  type StudioSlide,
  type StudioReadiness,
  type StudioTollgate,
  type SlideWarning,
} from "../../../../hooks/useStudioBooks";
import { T } from "../atlasTokens";
import { Pill, EmptyState, LoadingState, SectionLabel } from "../primitives";
import { PlusIcon, DownloadIcon, CheckIcon, BackIcon } from "../icons";

/* ─── small display helpers ───────────────────────────────── */

const WARNING_META: Record<SlideWarning, { label: string; bg: string; fg: string }> = {
  clean: { label: "Model-backed", bg: T.greenBg, fg: T.green },
  needs_sources: { label: "Needs sources", bg: T.amberBg, fg: T.amber },
  stale_models: { label: "Stale models", bg: T.terraBg, fg: T.terra },
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ─── root ─────────────────────────────────────────────────── */

export default function PitchBookStudio({ user }: AtlasScreenProps) {
  const { books, loading, error, canFetch, createBook } = useStudioBooks(user);
  const { formats } = useStudioFormats();
  const dealRows = useMobileDeals(user).all;
  const dealName = useMemo(() => {
    const m = new Map<number, string>();
    for (const r of dealRows) m.set(r.rawId, r.name);
    return m;
  }, [dealRows]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  // Auto-select the most recent book; keep selection if it still exists.
  useEffect(() => {
    if (creating) return;
    if (selectedId != null && books.some((b) => b.id === selectedId)) return;
    setSelectedId(books[0]?.id ?? null);
  }, [books, selectedId, creating]);

  const showCreate = creating || (!loading && canFetch && books.length === 0);

  return (
    <div style={S.root}>
      {/* Books rail */}
      <aside style={S.rail}>
        <button type="button" style={S.newBtn} onClick={() => setCreating(true)}>
          <PlusIcon size={15} c={T.blue} /> New pitch book
        </button>
        <div style={S.railList}>
          {loading ? (
            <div style={{ padding: "18px 4px" }}>
              <LoadingState />
            </div>
          ) : books.length === 0 ? (
            <div style={S.railEmpty}>No pitch books yet</div>
          ) : (
            books.map((b) => (
              <BookRow
                key={b.id}
                book={b}
                deal={b.dealId != null ? dealName.get(b.dealId) ?? null : null}
                active={!creating && b.id === selectedId}
                onClick={() => {
                  setCreating(false);
                  setSelectedId(b.id);
                }}
              />
            ))
          )}
        </div>
      </aside>

      {/* Detail */}
      <div style={S.detail}>
        {!canFetch ? (
          <EmptyState
            title="Sign in to build pitch books"
            hint="Pitch books assemble model-backed, source-cited decks from your deals. Sign in to start one."
          />
        ) : error ? (
          <EmptyState title="Couldn’t load pitch books" hint={error} />
        ) : showCreate ? (
          <CreateFlow
            formats={formats}
            deals={dealRows.map((r) => ({ id: r.rawId, name: r.name }))}
            onCancel={books.length > 0 ? () => setCreating(false) : undefined}
            onCreate={async (input) => {
              const out = await createBook(input);
              if (out.ok) {
                setCreating(false);
                setSelectedId(out.book.id);
                return null;
              }
              return out.tollgate ?? { code: "error", message: out.error ?? "Couldn’t create the pitch book." };
            }}
          />
        ) : selectedId != null ? (
          <BookWorkspace
            user={user}
            bookId={selectedId}
            dealName={dealName}
          />
        ) : (
          <EmptyState title="Select a pitch book" hint="Pick one from the left, or start a new one." />
        )}
      </div>
    </div>
  );
}

/* ─── books rail row ───────────────────────────────────────── */

function BookRow({
  book,
  deal,
  active,
  onClick,
}: {
  book: PitchBookRecord;
  deal: string | null;
  active: boolean;
  onClick: () => void;
}) {
  const slideCount = book.slides?.length ?? 0;
  return (
    <button type="button" onClick={onClick} style={{ ...S.bookRow, ...(active ? S.bookRowActive : null) }}>
      <div style={{ ...S.bookTitle, color: active ? T.blue : T.ink }}>{book.title}</div>
      <div style={S.bookSub}>
        {formatLabel(book.format)}
        {deal ? ` · ${deal}` : ""}
        {slideCount ? ` · ${slideCount} slides` : ""}
      </div>
    </button>
  );
}

/* ─── create flow ──────────────────────────────────────────── */

function CreateFlow({
  formats,
  deals,
  onCreate,
  onCancel,
}: {
  formats: StudioFormatInfo[];
  deals: { id: number; name: string }[];
  onCreate: (input: { dealId: number | null; format: PitchBookFormat; title?: string }) => Promise<StudioTollgate | { code: string; message: string } | null>;
  onCancel?: () => void;
}) {
  const [format, setFormat] = useState<PitchBookFormat | null>(null);
  const [dealId, setDealId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState<{ code: string; message: string } | null>(null);

  const chosen = formats.find((f) => f.id === format) ?? null;

  return (
    <div style={S.pane}>
      <div style={S.createHead}>
        <div>
          <div style={S.h1}>Build a pitch book</div>
          <div style={S.sub}>Pick a format and a deal. Each format is backed by real V19 models.</div>
        </div>
        {onCancel && (
          <button type="button" style={S.ghostBtn} onClick={onCancel}>
            <BackIcon size={14} c={T.muted} /> Cancel
          </button>
        )}
      </div>

      <div style={S.formatGrid}>
        {formats.map((f) => {
          const on = f.id === format;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              style={{ ...S.formatCard, ...(on ? S.formatCardOn : null) }}
            >
              <div style={{ ...S.formatName, color: on ? T.blue : T.ink }}>{f.label}</div>
              <div style={S.formatBlurb}>{FORMAT_BLURB[f.id] ?? ""}</div>
              <div style={S.formatMeta}>
                {f.outline.length} sections · {f.models.length} model{f.models.length === 1 ? "" : "s"}
              </div>
            </button>
          );
        })}
      </div>

      {chosen && (
        <div style={S.outlinePreview}>
          <SectionLabel>Outline</SectionLabel>
          <div style={S.outlineRow}>
            {chosen.outline.map((o, i) => (
              <Pill key={o} bg={T.track} fg={T.muted}>
                {i + 1}. {o}
              </Pill>
            ))}
          </div>
        </div>
      )}

      <div style={S.dealPick}>
        <SectionLabel>Deal</SectionLabel>
        {deals.length === 0 ? (
          <div style={S.sub}>No deals yet — a pitch book can still be drafted, but model-backed slides need a deal.</div>
        ) : (
          <select
            value={dealId ?? ""}
            onChange={(e) => setDealId(e.target.value ? Number(e.target.value) : null)}
            style={S.select}
          >
            <option value="">No deal (general)</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {gate && <GateNote gate={gate} />}

      <div style={{ marginTop: 18 }}>
        <button
          type="button"
          disabled={!format || busy}
          style={{ ...S.primaryBtn, opacity: !format || busy ? 0.5 : 1, cursor: !format || busy ? "default" : "pointer" }}
          onClick={async () => {
            if (!format) return;
            setBusy(true);
            setGate(null);
            const g = await onCreate({ dealId, format });
            if (g) setGate(g);
            setBusy(false);
          }}
        >
          {busy ? "Creating…" : "Create pitch book"}
        </button>
      </div>
    </div>
  );
}

/* ─── book workspace ───────────────────────────────────────── */

function BookWorkspace({
  user,
  bookId,
  dealName,
}: {
  user: AtlasScreenProps["user"];
  bookId: number;
  dealName: Map<number, string>;
}) {
  const { book, readiness, loading, error, busy, refreshFromModels } = useStudioBook(user, bookId);
  const [slideIdx, setSlideIdx] = useState(0);
  const [exporting, setExporting] = useState<"pptx" | "pdf" | null>(null);
  const [exportErr, setExportErr] = useState<string | null>(null);
  const [gate, setGate] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => setSlideIdx(0), [bookId]);

  if (loading && !book) return <LoadingState label="Loading pitch book…" />;
  if (error) return <EmptyState title="Couldn’t load this pitch book" hint={error} />;
  if (!book) return <EmptyState title="Pitch book not found" hint="It may have been removed." />;

  const deal = book.dealId != null ? dealName.get(book.dealId) ?? null : null;
  const slides = book.slides ?? [];
  const slide = slides[Math.min(slideIdx, Math.max(0, slides.length - 1))] ?? null;

  const doExport = async (fmt: "pptx" | "pdf") => {
    setExporting(fmt);
    setExportErr(null);
    try {
      const r = await exportPitchBook(book.id, fmt, false);
      const url = URL.createObjectURL(r.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setExportErr(e?.message ?? "Export failed.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={S.pane}>
      {/* header */}
      <div style={S.wsHead}>
        <div style={{ minWidth: 0 }}>
          <div style={S.h1}>{book.title}</div>
          <div style={S.sub}>
            {formatLabel(book.format)}
            {deal ? ` · ${deal}` : ""} · v{book.version} · updated {fmtDate(book.updatedAt)}
          </div>
        </div>
        <div style={S.wsActions}>
          <button
            type="button"
            disabled={busy}
            style={{ ...S.actionBtn, opacity: busy ? 0.6 : 1 }}
            onClick={async () => {
              setGate(null);
              const out = await refreshFromModels();
              if (!out.ok) setGate(out.tollgate ?? { code: "error", message: out.error ?? "Refresh failed." });
            }}
          >
            {busy ? "Running models…" : "Refresh from models"}
          </button>
          <button
            type="button"
            disabled={exporting != null}
            style={S.actionBtn}
            onClick={() => doExport("pptx")}
          >
            <DownloadIcon size={14} c={T.ink} /> {exporting === "pptx" ? "Exporting…" : "PPTX"}
          </button>
          <button
            type="button"
            disabled={exporting != null}
            style={S.actionBtn}
            onClick={() => doExport("pdf")}
          >
            <DownloadIcon size={14} c={T.ink} /> {exporting === "pdf" ? "Exporting…" : "PDF"}
          </button>
        </div>
      </div>

      {gate && <GateNote gate={gate} />}
      {exportErr && <div style={S.errBand}>{exportErr}</div>}

      {/* readiness banner */}
      {readiness && <ReadinessBanner readiness={readiness} />}

      {/* slides */}
      {slides.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState
            title="No slides yet"
            hint="Refresh from models to populate this book with model-backed slides."
          />
        </div>
      ) : (
        <div style={S.wsBody}>
          {/* outline */}
          <div style={S.outlineList}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlideIdx(i)}
                style={{ ...S.outlineItem, ...(i === slideIdx ? S.outlineItemOn : null) }}
              >
                <span style={S.outlineNum}>{i + 1}</span>
                <span style={S.outlineText}>{s.title}</span>
                <WarnDot state={s.warningState} />
              </button>
            ))}
          </div>
          {/* slide + provenance */}
          {slide && <SlideView slide={slide} />}
        </div>
      )}
    </div>
  );
}

/* ─── slide view + provenance ──────────────────────────────── */

function SlideView({ slide }: { slide: StudioSlide }) {
  const w = WARNING_META[slide.warningState];
  const p = slide.provenance;
  return (
    <div style={S.slideWrap}>
      <div style={S.slideCard}>
        <div style={S.slideTopRow}>
          <div style={{ minWidth: 0 }}>
            <div style={S.slideTitle}>{slide.title}</div>
            {slide.subtitle && <div style={S.slideSubtitle}>{slide.subtitle}</div>}
          </div>
          <Pill bg={w.bg} fg={w.fg}>{w.label}</Pill>
        </div>
        {slide.body && <div style={S.slideBody}>{slide.body}</div>}
        {slide.bullets?.length > 0 && (
          <ul style={S.bullets}>
            {slide.bullets.map((b, i) => (
              <li key={i} style={S.bullet}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      {/* provenance */}
      <div style={S.provCard}>
        <SectionLabel>Provenance</SectionLabel>
        <ProvRow label="Model outputs" items={p.modelOutputsUsed} icon="model" />
        <ProvRow label="Citations" items={p.citationsUsed} icon="cite" />
        <ProvRow label="Facts used" items={p.factsUsed} icon="fact" />
        {p.uncheckedClaims.length > 0 && (
          <div style={S.uncheckedBox}>
            <div style={S.uncheckedHead}>Unchecked claims</div>
            {p.uncheckedClaims.map((c, i) => (
              <div key={i} style={S.uncheckedItem}>{c}</div>
            ))}
          </div>
        )}
        {slide.speakerNotes && (
          <div style={{ marginTop: 12 }}>
            <SectionLabel>Speaker notes</SectionLabel>
            <div style={S.notes}>{slide.speakerNotes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProvRow({ label, items, icon }: { label: string; items: string[]; icon: "model" | "cite" | "fact" }) {
  void icon;
  return (
    <div style={S.provRow}>
      <div style={S.provLabel}>{label}</div>
      {items.length === 0 ? (
        <div style={S.provEmpty}>—</div>
      ) : (
        <div style={S.provItems}>
          {items.map((it, i) => (
            <span key={i} style={S.provChip}>{it}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── readiness banner ─────────────────────────────────────── */

function ReadinessBanner({ readiness }: { readiness: StudioReadiness }) {
  const ready = readiness.readyForExternalDelivery;
  const blockers = readiness.issues.filter((i) => i.severity === "blocker");
  const warnings = readiness.issues.filter((i) => i.severity === "warning");
  const tone = ready ? { bg: T.greenBg, fg: T.green } : blockers.length ? { bg: T.terraBg, fg: T.terra } : { bg: T.amberBg, fg: T.amber };
  const top = (blockers[0] ?? warnings[0] ?? readiness.issues[0]) || null;

  return (
    <div style={{ ...S.readyBanner, background: tone.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {ready && <CheckIcon size={15} c={T.green} />}
        <span style={{ ...S.readyTitle, color: tone.fg }}>
          {ready ? "Ready for external delivery" : "Not ready for external delivery"}
        </span>
      </div>
      {!ready && (
        <div style={S.readyMeta}>
          {readiness.modelGaps > 0 && <span>{readiness.modelGaps} model gaps</span>}
          {readiness.sourceGaps > 0 && <span>{readiness.sourceGaps} source gaps</span>}
          {readiness.uncheckedClaims > 0 && <span>{readiness.uncheckedClaims} unchecked claims</span>}
          {top && <span style={{ color: T.ink3 }}>· {top.detail || top.label}</span>}
        </div>
      )}
    </div>
  );
}

/* ─── bits ─────────────────────────────────────────────────── */

function WarnDot({ state }: { state: SlideWarning }) {
  const c = state === "clean" ? T.green : state === "needs_sources" ? T.amber : T.terra;
  return <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: c, flex: "none" }} />;
}

function GateNote({ gate }: { gate: { code: string; title?: string; message: string; requiredPlan?: string | null } }) {
  return (
    <div style={S.gate}>
      <div style={S.gateTitle}>{gate.title || "This needs a plan upgrade"}</div>
      <div style={S.gateMsg}>{gate.message}</div>
    </div>
  );
}

function formatLabel(f: PitchBookFormat): string {
  return f
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace("Qoe", "QoE")
    .replace("Ic ", "IC ")
    .replace("Cim ", "CIM ");
}

/* ─── styles (polish standard: float on canvas, T.border cards, no chrome lines) ─ */

const S: Record<string, React.CSSProperties> = {
  root: { flex: 1, minWidth: 0, minHeight: 0, display: "flex" },
  rail: { width: 226, flex: "none", display: "flex", flexDirection: "column", padding: "14px 12px", minHeight: 0 },
  newBtn: {
    display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center",
    background: T.blueBg, color: T.blue, border: "none", borderRadius: T.rPill,
    padding: "9px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
  },
  railList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", minHeight: 0 },
  railEmpty: { fontSize: 12.5, color: T.muted2, padding: "12px 6px" },
  bookRow: {
    textAlign: "left", border: "none", background: "transparent", borderRadius: 10,
    padding: "9px 10px", cursor: "pointer", fontFamily: T.font, display: "block", width: "100%",
  },
  bookRowActive: { background: T.blueBg3 },
  bookTitle: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  bookSub: { fontSize: 11.5, color: T.muted2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  detail: { flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" },
  pane: { padding: "22px 26px", maxWidth: 1080, width: "100%" },

  h1: { fontSize: 22, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" },
  sub: { fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.5 },

  createHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 },
  ghostBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.border}`,
    borderRadius: T.rPill, padding: "6px 12px", fontSize: 12.5, color: T.muted, cursor: "pointer", fontFamily: T.font, flex: "none",
  },
  formatGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 },
  formatCard: {
    textAlign: "left", background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rCard,
    boxShadow: T.shCard, padding: 14, cursor: "pointer", fontFamily: T.font, transition: "border-color .12s ease",
  },
  formatCardOn: { borderColor: T.blue, boxShadow: "0 0 0 1px " + T.blue },
  formatName: { fontSize: 14.5, fontWeight: 600 },
  formatBlurb: { fontSize: 12.5, color: T.muted, marginTop: 4, lineHeight: 1.45 },
  formatMeta: { fontSize: 11.5, color: T.muted2, marginTop: 10 },

  outlinePreview: { marginTop: 18 },
  outlineRow: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 },
  dealPick: { marginTop: 18 },
  select: {
    marginTop: 8, width: "100%", maxWidth: 360, height: 38, borderRadius: 10, border: `1px solid ${T.inputBd}`,
    background: T.white, padding: "0 12px", fontSize: 13.5, color: T.ink, fontFamily: T.font,
  },
  primaryBtn: {
    background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "10px 20px",
    fontSize: 13.5, fontWeight: 600, fontFamily: T.font,
  },

  wsHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 14 },
  wsActions: { display: "flex", gap: 8, flex: "none", flexWrap: "wrap", justifyContent: "flex-end" },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, background: T.white, border: `1px solid ${T.border}`,
    borderRadius: T.rPill, padding: "7px 13px", fontSize: 12.5, fontWeight: 500, color: T.ink, cursor: "pointer", fontFamily: T.font,
  },

  readyBanner: { borderRadius: 12, padding: "11px 14px", marginBottom: 14 },
  readyTitle: { fontSize: 13, fontWeight: 600 },
  readyMeta: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 5, fontSize: 12, color: T.muted },

  wsBody: { display: "flex", gap: 18, marginTop: 6, alignItems: "flex-start" },
  outlineList: { width: 220, flex: "none", display: "flex", flexDirection: "column", gap: 3 },
  outlineItem: {
    display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", border: "none",
    background: "transparent", borderRadius: 9, padding: "8px 10px", cursor: "pointer", fontFamily: T.font,
  },
  outlineItemOn: { background: T.blueBg3 },
  outlineNum: { fontSize: 11, color: T.muted2, fontVariantNumeric: "tabular-nums", flex: "none", width: 14 },
  outlineText: { fontSize: 13, color: T.ink, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  slideWrap: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 },
  slideCard: { background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rCardLg, boxShadow: T.shCard, padding: "22px 24px" },
  slideTopRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  slideTitle: { fontSize: 19, fontWeight: 600, color: T.ink, letterSpacing: "-.01em" },
  slideSubtitle: { fontSize: 13.5, color: T.muted, marginTop: 3 },
  slideBody: { fontSize: 14, color: T.ink3, lineHeight: 1.6, marginTop: 14, whiteSpace: "pre-wrap" },
  bullets: { margin: "14px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 },
  bullet: { fontSize: 14, color: T.ink3, lineHeight: 1.5 },

  provCard: { background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rCard, boxShadow: T.shCard, padding: "16px 18px" },
  provRow: { display: "flex", gap: 12, marginTop: 10, alignItems: "baseline" },
  provLabel: { fontSize: 12, color: T.muted, width: 110, flex: "none" },
  provItems: { display: "flex", flexWrap: "wrap", gap: 6 },
  provEmpty: { fontSize: 12.5, color: T.faint },
  provChip: { fontSize: 11.5, fontFamily: "ui-monospace, monospace", background: T.track, color: T.ink3, borderRadius: 6, padding: "2px 7px" },
  uncheckedBox: { marginTop: 14, background: T.amberBg, borderRadius: 10, padding: "10px 12px" },
  uncheckedHead: { fontSize: 12, fontWeight: 600, color: T.amber, marginBottom: 5 },
  uncheckedItem: { fontSize: 12.5, color: T.ink3, lineHeight: 1.5 },
  notes: { fontSize: 12.5, color: T.muted, lineHeight: 1.55, marginTop: 6, whiteSpace: "pre-wrap" },

  gate: { background: T.blueBg3, border: `1px solid ${T.approvalBd}`, borderRadius: 12, padding: "12px 14px", marginBottom: 14 },
  gateTitle: { fontSize: 13.5, fontWeight: 600, color: T.blue },
  gateMsg: { fontSize: 12.5, color: T.ink3, marginTop: 4, lineHeight: 1.5 },
  errBand: { background: T.terraBg, color: T.terra, borderRadius: 10, padding: "10px 13px", fontSize: 13, marginBottom: 14 },
};
