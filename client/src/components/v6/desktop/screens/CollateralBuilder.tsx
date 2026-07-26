/**
 * The collateral builder — one screen (Paul, 2026-07-25).
 *
 * "Ultimately after a master document is created using the various artifacts,
 * researchers, etc… from the master document I need to be able to select which
 * output type I want, a one pager, a PDF carousel or a full page full depth PDF
 * report. And then once the pages of whatever collateral I want to create are
 * rendered in preview, I need to be able to drag drop whichever images or
 * assets on which pages, all on one screen where it's easy to see and
 * manipulate — and then once I have everything where I want it, then I can
 * output it to final collateral."
 *
 * That is the whole layout: master at the top, output type as a segmented
 * control, the ACTUAL RENDERED PAGES as the board, the Assets repository as a
 * rail you drag from, and one export at the bottom that files the result into
 * Collateral. Nothing here is a new renderer — the pages you see are the pages
 * the PDF prints, because both come from the same composer.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { authHeaders } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";

async function api<J>(path: string, init?: RequestInit): Promise<J> {
  const r = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any)?.error || `Request failed (${r.status})`);
  return j as J;
}

async function download(path: string, filename: string) {
  const r = await fetch(`/api${path}`, { headers: authHeaders() });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error((j as any)?.error || `Download failed (${r.status})`);
  }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const slugify = (s: string) =>
  (s || "collateral").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "collateral";

export type OutputType = "onepager" | "carousel" | "report";

const OUTPUTS: { key: OutputType; label: string; blurb: string }[] = [
  { key: "onepager", label: "Single-image post", blurb: "One 1080×1350 announcement card — the lead number is the graphic." },
  { key: "carousel", label: "Carousel PDF", blurb: "Swipeable square pages — dark cover, light body, dark closer." },
  { key: "report", label: "Full report PDF", blurb: "The long letter-format findings document, every source kept." },
];

interface BoardPage {
  i: number;
  kind: string;
  heading: string;
  artAssetId: number | null;
  droppable: boolean;
  src: string;
}
/** Where a placed image is written on the feed, per output type: a carousel
 *  page keys `pageArt`, a report SECTION keys `reportArt`, the single-image
 *  post has only its one cover slot. */
type Slot = "pageArt" | "reportArt" | "artAssetId";
interface AssetRow {
  id: number; label: string; mime: string; kind: string;
  width: number | null; height: number | null; created_at: string; bytes: number;
}

export default function CollateralBuilder({ artifactId, artifactLabel, initialOutput, onClose, onExported }: {
  artifactId: number;
  artifactLabel: string;
  /** Which output the market workspace asked for; defaults to the carousel. */
  initialOutput?: OutputType;
  onClose: () => void;
  onExported: (msg: string) => void;
}) {
  const [output, setOutput] = useState<OutputType>(initialOutput ?? "carousel");
  const [runId, setRunId] = useState<number | null>(null);
  const [title, setTitle] = useState(artifactLabel);
  const [uncited, setUncited] = useState<string[]>([]);
  const [pages, setPages] = useState<BoardPage[]>([]);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [coverArt, setCoverArt] = useState<number | null | undefined>(undefined);
  const [slot, setSlot] = useState<Slot>("pageArt");
  const [phase, setPhase] = useState<"composing" | "rendering" | "ready" | "error">("composing");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [zoom, setZoom] = useState<BoardPage | null>(null);
  const dirtyRef = useRef(false);

  /* ── the master's photo library, for the rail ── */
  useEffect(() => {
    let alive = true;
    api<{ assets: AssetRow[] }>("/studio/assets")
      .then(j => { if (alive) setAssets((j.assets ?? []).filter(a => a.kind !== "collateral" && a.mime.startsWith("image/"))); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    for (const a of assets) {
      if (thumbs[a.id]) continue;
      fetch(`/api/studio/assets/${a.id}/raw`, { headers: authHeaders() })
        .then(r => (r.ok ? r.blob() : Promise.reject(new Error())))
        .then(b => { if (alive) setThumbs(m => ({ ...m, [a.id]: URL.createObjectURL(b) })); })
        .catch(() => {});
    }
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  /** Render (or re-render) the board for the current composition. */
  const loadBoard = useCallback(async (id: number) => {
    setPhase("rendering");
    try {
      const j = await api<{ kind: string; slot?: Slot; pages: BoardPage[] }>(`/research/runs/${id}/board`);
      setPages(j.pages ?? []);
      setSlot(j.slot ?? "pageArt");
      const m: Record<string, number> = {};
      for (const p of j.pages ?? []) if (p.kind !== "cover" && p.artAssetId) m[String(p.i)] = p.artAssetId;
      setPlaced(m);
      const cover = (j.pages ?? []).find(p => p.kind === "cover");
      setCoverArt(cover?.artAssetId ?? undefined);
      dirtyRef.current = false;
      setPhase("ready");
    } catch (e: any) {
      setErr(e?.message || "Couldn’t render the pages.");
      setPhase("error");
    }
  }, []);

  /** Build the composition for an output type, then show its pages. */
  const compose = useCallback(async (type: OutputType) => {
    setPhase("composing");
    setErr(null);
    setPages([]);
    try {
      const j = await api<{ runId: number; title: string; uncited: string[] }>("/studio/compose", {
        method: "POST",
        body: JSON.stringify({ artifactId, outputType: type }),
      });
      setRunId(j.runId);
      setTitle(j.title);
      setUncited(j.uncited ?? []);
      await loadBoard(j.runId);
    } catch (e: any) {
      setErr(e?.message || "Couldn’t build this output from the master.");
      setPhase("error");
    }
  }, [artifactId, loadBoard]);

  useEffect(() => { void compose(output); }, [output, compose]);

  /* ── placing images ── */

  const place = (page: BoardPage, assetId: number) => {
    if (!page.droppable) return;
    dirtyRef.current = true;
    if (page.kind === "cover") setCoverArt(assetId);
    else setPlaced(m => ({ ...m, [String(page.i)]: assetId }));
  };
  const clear = (page: BoardPage) => {
    dirtyRef.current = true;
    if (page.kind === "cover") setCoverArt(null);
    else setPlaced(m => { const n = { ...m }; delete n[String(page.i)]; return n; });
  };

  /** Write the placements onto the composition and re-render the board. */
  const apply = useCallback(async () => {
    if (!runId) return;
    setBusy("apply");
    try {
      const feed = await api<{ feed: any }>(`/research/runs/${runId}/feed`).then(j => j.feed ?? {}).catch(() => ({}));
      const patch: Record<string, unknown> = { ...feed };
      if (slot !== "artAssetId") patch[slot] = placed;
      if (coverArt !== undefined) patch.artAssetId = coverArt;
      await api(`/research/runs/${runId}/feed`, { method: "PATCH", body: JSON.stringify({ feed: patch }) });
      await loadBoard(runId);
    } catch (e: any) {
      setErr(e?.message || "Couldn’t apply the images.");
    } finally {
      setBusy(null);
    }
  }, [runId, placed, coverArt, slot, loadBoard]);

  /** The finished thing. `?save=1` files it into the Collateral repository. */
  const exportFinal = useCallback(async () => {
    if (!runId) return;
    setBusy("export");
    const base = slugify(title);
    try {
      if (output === "report") await download(`/research/runs/${runId}/pdf?save=1`, `${base}.pdf`);
      else if (output === "onepager") await download(`/research/runs/${runId}/card.png?save=1`, `${base}-1pager.png`);
      else await download(`/research/runs/${runId}/linkedin.pdf?save=1`, `${base}-carousel.pdf`);
      onExported("Exported — and filed in Collateral.");
    } catch (e: any) {
      setErr(e?.message || "Export failed.");
    } finally {
      setBusy(null);
    }
  }, [runId, output, title, onExported]);

  const dirty = dirtyRef.current;

  return (
    <div style={S.wrap}>
      {/* header — the master, the output choice */}
      <div style={S.head}>
        <button type="button" style={S.back} onClick={onClose}>← Studio</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.title}>{title}</div>
          <div style={S.sub}>Built from the master document · {pages.length ? `${pages.length} page${pages.length === 1 ? "" : "s"}` : "composing"}</div>
        </div>
        <div style={S.segs}>
          {OUTPUTS.map(o => (
            <button
              key={o.key}
              type="button"
              title={o.blurb}
              onClick={() => setOutput(o.key)}
              style={{ ...S.seg, ...(output === o.key ? S.segOn : null) }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {uncited.length > 0 && (
        <div style={S.warn}>
          <b>Citation check:</b> {uncited.length} figure{uncited.length === 1 ? "" : "s"} on these pages
          {" "}({uncited.slice(0, 6).join(", ")}) {uncited.length === 1 ? "does" : "do"} not appear in the master document.
          Fix the copy in the master and rebuild, or remove the claim — nothing derived should reach a client without its working stated.
        </div>
      )}
      {err && <div style={S.err}>{err}</div>}

      <div style={S.body}>
        {/* the board — actual rendered pages, and the drop targets */}
        <div style={S.board}>
          {phase === "composing" && <div style={S.state}>Composing the pages from the master…</div>}
          {phase === "rendering" && <div style={S.state}>Rendering the pages…</div>}
          {phase === "ready" && pages.length === 0 && <div style={S.state}>Nothing to show for this output type.</div>}
          <div style={S.grid}>
            {pages.map(pg => {
              const aid = pg.kind === "cover" ? (coverArt ?? null) : (placed[String(pg.i)] ?? null);
              const hot = dragOver === pg.i;
              return (
                <div
                  key={pg.i}
                  style={{ ...S.tile, ...(hot ? S.tileHot : null) }}
                  onDragOver={pg.droppable ? e => { e.preventDefault(); setDragOver(pg.i); } : undefined}
                  onDragLeave={() => setDragOver(v => (v === pg.i ? null : v))}
                  onDrop={pg.droppable ? e => {
                    e.preventDefault();
                    setDragOver(null);
                    try {
                      const d = JSON.parse(e.dataTransfer.getData("application/json"));
                      const id = Number(d?.id);
                      if (d?.t === "asset" && Number.isInteger(id) && id > 0) place(pg, id);
                    } catch { /* not an asset payload */ }
                  } : undefined}
                >
                  <button type="button" style={S.tileShot} onClick={() => setZoom(pg)} title="Click to see it full size">
                    {pg.src
                      ? <img src={pg.src} alt={pg.heading} style={S.tileImg} />
                      : <span style={{ fontSize: 11, color: T.muted }}>no preview</span>}
                  </button>
                  <div style={S.tileFoot}>
                    <span style={S.tileNo}>{pg.i + 1}</span>
                    <span style={S.tileKind} title={pg.heading}>
                      {pg.kind === "section" ? pg.heading.slice(0, 22) : pg.kind}
                    </span>
                    {aid ? (
                      <>
                        {thumbs[aid] && <img src={thumbs[aid]} alt="" style={S.tileChip} />}
                        <button type="button" title="Remove this image" style={S.tileX} onClick={() => clear(pg)}>×</button>
                      </>
                    ) : pg.droppable ? (
                      <span style={S.tileDrop}>drop image</span>
                    ) : (
                      <span style={S.tileLocked}>no image slot</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* the Assets repository — drag from here onto a page */}
        <div style={S.rail}>
          <div style={S.railHead}>Assets</div>
          <div style={S.railNote}>Drag an image onto the page it belongs on.</div>
          <div style={S.railGrid}>
            {assets.length === 0 && <div style={{ fontSize: 12, color: T.muted }}>No images in Assets yet — upload them in Studio.</div>}
            {assets.map(a => (
              <button
                key={a.id}
                type="button"
                draggable
                title={a.label}
                onDragStart={e => {
                  e.dataTransfer.setData("application/json", JSON.stringify({ t: "asset", id: a.id }));
                  e.dataTransfer.effectAllowed = "copy";
                }}
                style={S.railThumb}
              >
                {thumbs[a.id]
                  ? <img src={thumbs[a.id]} alt={a.label} style={S.railImg} />
                  : <span style={{ fontSize: 9.5, color: T.muted2 }}>…</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* one row: apply the layout, then produce the final thing */}
      <div style={S.foot}>
        <button
          type="button"
          style={{ ...S.applyBtn, opacity: !runId || busy !== null || phase !== "ready" ? 0.5 : 1 }}
          disabled={!runId || busy !== null || phase !== "ready"}
          onClick={() => void apply()}
        >
          {busy === "apply" ? "Applying…" : "Apply images & re-render"}
        </button>
        <span style={S.footNote}>
          {/* On a carousel, placing an image changes the deck's design inputs,
              so applying re-runs the page designer — which is why it's a button
              you press once when the layout is right, not a save on every drop.
              A report just re-renders. */}
          {dirty
            ? output === "report"
              ? "Images placed — apply to render them into the sections."
              : "Images placed — apply to redesign the pages around them."
            : output === "report"
              ? "Photos sit under the section header you drop them on."
              : "The pages above are what the export prints."}
        </span>
        <button
          type="button"
          style={{ ...S.exportBtn, opacity: !runId || busy !== null ? 0.5 : 1 }}
          disabled={!runId || busy !== null}
          onClick={() => void exportFinal()}
        >
          {busy === "export" ? "Exporting…" : "Export to Collateral"}
        </button>
      </div>

      {zoom && (
        <div style={S.zoomWrap} onClick={() => setZoom(null)}>
          <img src={zoom.src} alt={zoom.heading} style={S.zoomImg} />
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  // Absolute inside the Studio frame's relative parent — never fixed, per the
  // Safari toolbar-tinting rule.
  wrap: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: T.white, zIndex: 30 },
  head: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${T.border}` },
  back: { flex: "none", background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },
  title: { fontSize: 15, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sub: { fontSize: 11.5, color: T.muted, marginTop: 2 },
  segs: { flex: "none", display: "flex", gap: 4, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: 3 },
  seg: { border: "none", background: "transparent", borderRadius: T.rPill, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, color: T.ink3, cursor: "pointer", fontFamily: T.font, whiteSpace: "nowrap" },
  segOn: { background: T.blue, color: "#fff" },

  warn: { margin: "10px 16px 0", padding: "10px 13px", borderRadius: 10, background: "#FFF4E0", color: "#8A6A2B", fontSize: 12.5, lineHeight: 1.5 },
  err: { margin: "10px 16px 0", padding: "10px 13px", borderRadius: 10, background: "#FBE4DE", color: "#B3261E", fontSize: 12.5, lineHeight: 1.5 },

  body: { flex: 1, minHeight: 0, display: "flex" },
  board: { flex: 1, minWidth: 0, overflowY: "auto", padding: 16 },
  state: { fontSize: 13, color: T.muted, padding: "10px 2px" },
  grid: { display: "flex", flexWrap: "wrap", gap: 14 },
  tile: { width: 208, borderRadius: 12, border: `1px solid ${T.border}`, background: T.white, padding: 7, boxSizing: "border-box" },
  tileHot: { borderColor: T.blue, boxShadow: `0 0 0 2px ${T.blueBg3}` },
  tileShot: { display: "block", width: "100%", aspectRatio: "1080 / 1350", border: "none", padding: 0, borderRadius: 8, overflow: "hidden", background: T.surface, cursor: "zoom-in" },
  tileImg: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
  tileFoot: { display: "flex", alignItems: "center", gap: 6, marginTop: 6, minHeight: 22 },
  tileNo: { flex: "none", fontSize: 11, fontWeight: 800, color: T.ink },
  tileKind: { flex: "none", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.muted2 },
  tileChip: { width: 22, height: 27, objectFit: "cover", borderRadius: 4, marginLeft: "auto" },
  tileX: { flex: "none", border: "none", background: "none", color: T.muted, cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0 },
  tileDrop: { marginLeft: "auto", fontSize: 10.5, color: T.muted2 },
  tileLocked: { marginLeft: "auto", fontSize: 10.5, color: T.muted2, fontStyle: "italic" },

  rail: { width: 236, flex: "none", borderLeft: `1px solid ${T.border}`, background: T.surface, padding: 14, overflowY: "auto" },
  railHead: { fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.05em", textTransform: "uppercase" },
  railNote: { fontSize: 11.5, color: T.muted, marginTop: 4, lineHeight: 1.45 },
  railGrid: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 },
  railThumb: { width: 62, height: 78, borderRadius: 8, border: `1.5px solid ${T.inputBd}`, background: T.white, padding: 0, overflow: "hidden", cursor: "grab" },
  railImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  foot: { display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderTop: `1px solid ${T.border}`, background: T.white },
  applyBtn: { flex: "none", background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },
  footNote: { flex: 1, minWidth: 0, fontSize: 11.5, color: T.muted },
  exportBtn: { flex: "none", background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "10px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: T.font },

  zoomWrap: { position: "absolute", inset: 0, background: "rgba(15,26,22,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, cursor: "zoom-out", zIndex: 40 },
  zoomImg: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10, boxShadow: "0 24px 60px rgba(0,0,0,0.4)" },
};
