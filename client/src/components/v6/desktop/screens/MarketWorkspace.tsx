/**
 * The market workspace — Studio as a line of work, not a filing cabinet.
 *
 * Paul, 2026-07-26, rejecting the Finder outright: "i dont think i like the
 * process at all from how it looks. i need to: 1 - Add all research and
 * artifacts, 2 - synthesize and compile, 3 - create collateral, 4 - do other
 * work — market maps, who's who, thesis building or other corp dev beginning
 * work."
 *
 * Folders ask "where does this go". He is asking "what step am I on". So the
 * screen is the steps, left to right, scoped to ONE market — and step 4 is the
 * reframe that matters: a lane is not a marketing-content pipeline, it is the
 * knowledge base for a market. Collateral is one thing you draw off it; the
 * corp-dev documents are the practice's actual work product.
 *
 * Steps 3 and 4 are the same mechanism — read the master, produce a document —
 * so they render as two groups of one panel rather than two panels.
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

const slugify = (s: string) =>
  (s || "market").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "market";

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export type Lane = {
  id: number; label: string; master_title: string | null; master_version: number;
  synthesized_at: string | null; synthesis_status: string; synthesis_error: string | null;
};
type Source = {
  id: number; label: string; tool: string | null; mime: string;
  incorporated_version: number | null; created_at: string;
};
type Version = { id: number; version: number; title: string | null; created_at: string };
type CorpDoc = { id: number; kind: string; label: string; lane_version: number | null; chars: number; updated_at: string };

const COLLATERAL: { key: "onepager" | "carousel" | "report"; label: string; blurb: string }[] = [
  { key: "onepager", label: "Single-image post", blurb: "One 1080×1350 announcement card" },
  { key: "carousel", label: "Carousel PDF", blurb: "Swipeable pages for LinkedIn" },
  { key: "report", label: "Report PDF", blurb: "The long cited document" },
];

const CORPDEV: { key: "market_map" | "who_who" | "thesis"; label: string; blurb: string }[] = [
  { key: "market_map", label: "Market map", blurb: "Structure, who operates, where the openings are" },
  { key: "who_who", label: "Who's who", blurb: "Acquirers, sponsors, operators — and what each is doing" },
  { key: "thesis", label: "Investment thesis", blurb: "The buy-side case, stated so it can be wrong" },
];

export default function MarketWorkspace({ lanes, onLanesChanged, onOpenBuilder, onOpenArtifact, onReadMaster, onNote }: {
  lanes: Lane[];
  onLanesChanged: () => void;
  onOpenBuilder: (source: { kind: "lane" | "artifact"; id: number }, label: string, output: "onepager" | "carousel" | "report") => void;
  onOpenArtifact: (artifactId: number) => void;
  onReadMaster: (laneId: number, label: string) => void;
  onNote: (kind: "ok" | "err", text: string) => void;
}) {
  const [laneId, setLaneId] = useState<number | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [docs, setDocs] = useState<CorpDoc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const lane = lanes.find((l) => l.id === laneId) ?? null;

  // Settle on a market: the one already chosen, else the most recent.
  useEffect(() => {
    if (laneId != null && lanes.some((l) => l.id === laneId)) return;
    setLaneId(lanes[0]?.id ?? null);
  }, [lanes, laneId]);

  const laneKey = lane ? `${lane.id}:${lane.master_version}:${lane.synthesis_status}` : "";
  const load = useCallback(async (id: number) => {
    try {
      const [d, c] = await Promise.all([
        api<{ sources: Source[]; versions: Version[] }>(`/research/lanes/${id}`),
        api<{ docs: CorpDoc[] }>(`/research/lanes/${id}/corpdev`),
      ]);
      setSources(d.sources ?? []);
      setVersions(d.versions ?? []);
      setDocs(c.docs ?? []);
    } catch {
      setSources([]); setVersions([]); setDocs([]);
    }
  }, []);
  useEffect(() => {
    if (!lane) { setSources([]); setVersions([]); setDocs([]); return; }
    void load(lane.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laneKey]);

  const newMarket = async () => {
    const label = window.prompt("Name the market you're building a knowledge base for:\n(e.g. “Commercial mechanical”, “Elevator & escalator”)")?.trim();
    if (!label) return;
    try {
      const l = await api<{ id: number }>("/research/lanes", { method: "POST", body: JSON.stringify({ label }) });
      setLaneId(l.id);
      onLanesChanged();
    } catch (e: any) {
      onNote("err", e?.message || "Couldn’t create the market.");
    }
  };

  const addFile = async (f: File) => {
    if (!lane) return;
    const fd = new FormData();
    fd.append("file", f);
    fd.append("label", f.name.replace(/\.[a-z0-9]+$/i, ""));
    setBusy("upload");
    try {
      const r = await fetch(`/api/research/lanes/${lane.id}/sources`, { method: "POST", headers: authHeaders(), body: fd });
      if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as any)?.error || `Upload failed (${r.status})`);
      await load(lane.id);
    } catch (e: any) {
      onNote("err", e?.message || "Upload failed.");
    } finally {
      setBusy(null);
    }
  };

  const addPaste = async () => {
    if (!lane) return;
    const text = window.prompt("Paste the research (markdown is fine):");
    if (!text?.trim()) return;
    const label = window.prompt("Name it — what is this read?", "Deep research")?.trim() || "Pasted research";
    const tool = window.prompt("Which tool produced it? (Claude, Gemini, Perplexity…)", "Claude")?.trim() || "";
    setBusy("upload");
    try {
      await api(`/research/lanes/${lane.id}/sources`, { method: "POST", body: JSON.stringify({ text, label, tool }) });
      await load(lane.id);
    } catch (e: any) {
      onNote("err", e?.message || "Couldn’t add it.");
    } finally {
      setBusy(null);
    }
  };

  const removeSource = async (s: Source) => {
    if (!lane || !window.confirm(`Remove “${s.label}” from this market?`)) return;
    try {
      await api(`/research/lanes/${lane.id}/sources/${s.id}`, { method: "DELETE" });
      await load(lane.id);
    } catch (e: any) {
      onNote("err", e?.message || "Couldn’t remove it.");
    }
  };

  /** Long in-process pass — the lane row is the truth, so the parent polls. */
  const synthesize = async (full: boolean) => {
    if (!lane) return;
    onNote("ok", "Synthesizing — reading every source and auditing every figure against them. A few minutes; you can leave this screen.");
    setBusy("synth");
    try {
      await api(`/research/lanes/${lane.id}/synthesize`, { method: "POST", body: JSON.stringify({ full }) });
    } catch {
      /* a dropped response is not a failed run */
    } finally {
      setBusy(null);
      onLanesChanged();
    }
  };

  /** The builder reads the market's master directly — no copy, no filing step,
   *  so it is always the current version. */
  const buildCollateral = (output: "onepager" | "carousel" | "report") => {
    if (!lane) return;
    onOpenBuilder({ kind: "lane", id: lane.id }, lane.master_title || lane.label, output);
  };

  const derive = async (type: string) => {
    if (!lane) return;
    setBusy(`cd:${type}`);
    onNote("ok", "Writing the document from the master and checking every figure against it — a minute or two.");
    try {
      const out = await api<{ artifactId: number; title: string; uncited: string[] }>(
        `/research/lanes/${lane.id}/corpdev`, { method: "POST", body: JSON.stringify({ type }) });
      await load(lane.id);
      onNote(out.uncited.length ? "err" : "ok", out.uncited.length
        ? `“${out.title}” saved, but ${out.uncited.length} figure(s) (${out.uncited.slice(0, 4).join(", ")}) aren't in the master and carry no stated derivation. Read it before it goes out.`
        : `“${out.title}” written — every figure traced to the master.`);
    } catch (e: any) {
      onNote("err", e?.message || "Couldn’t write the document.");
    } finally {
      setBusy(null);
    }
  };

  /* ── no markets yet ── */
  if (lanes.length === 0) {
    return (
      <div style={S.wrap}>
        <div style={S.blank}>
          <div style={S.blankH}>Start with a market.</div>
          <div style={S.blankB}>
            A market holds everything you know about one lane — the research you gathered anywhere, the
            master document the app builds from it, and everything you produce off that master: the
            collateral, and the corp-dev work.
          </div>
          <button type="button" style={S.cta} onClick={newMarket}>Name your first market</button>
        </div>
      </div>
    );
  }

  const pending = sources.filter((s) => s.incorporated_version == null);
  const running = lane?.synthesis_status === "running" || busy === "synth";
  const needsReview = lane?.synthesis_status === "needs_review";
  const hasMaster = (lane?.master_version ?? 0) > 0;

  return (
    <div style={S.wrap}>
      {/* which market */}
      <div style={S.head}>
        <span style={S.headLabel}>Market</span>
        <select value={laneId ?? ""} onChange={(e) => setLaneId(Number(e.target.value))} style={S.picker}>
          {lanes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}{l.master_version > 0 ? ` · master v${l.master_version}` : " · no master yet"}
            </option>
          ))}
        </select>
        <button type="button" style={S.headBtn} onClick={newMarket}>+ New market</button>
      </div>

      <div style={S.steps}>
        {/* ── 1 ── */}
        <section style={S.step}>
          <div style={S.stepHead}><span style={S.stepNo}>1</span> Research</div>
          <div style={S.stepSub}>
            Everything you gathered — Claude, Gemini, anywhere. PDFs or text.
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.md,.markdown,.txt,application/pdf,text/markdown,text/plain"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void addFile(f); e.currentTarget.value = ""; }}
          />
          <div style={S.btnRow}>
            <button type="button" style={S.primary} disabled={busy === "upload"} onClick={() => fileRef.current?.click()}>
              {busy === "upload" ? "Adding…" : "Add research"}
            </button>
            <button type="button" style={S.ghost} disabled={busy === "upload"} onClick={addPaste}>Paste</button>
          </div>
          <div style={S.list}>
            {sources.length === 0 && <div style={S.empty}>Nothing yet. Add the reads you ran elsewhere.</div>}
            {sources.map((s) => (
              <div key={s.id} style={S.item}>
                <span style={{ ...S.dot, background: s.incorporated_version ? "#4FA97E" : "#D9A441" }} />
                <span style={S.itemName} title={s.label}>{s.label}</span>
                <span style={S.itemMeta}>{s.tool || (s.mime === "application/pdf" ? "PDF" : "text")}</span>
                <button type="button" style={S.x} title="Remove" onClick={() => void removeSource(s)}>×</button>
              </div>
            ))}
          </div>
          {sources.length > 0 && (
            <div style={S.foot}>
              {pending.length
                ? `${pending.length} not yet in the master`
                : "All folded into the master"}
            </div>
          )}
        </section>

        {/* ── 2 ── */}
        <section style={S.step}>
          <div style={S.stepHead}><span style={S.stepNo}>2</span> Master document</div>
          <div style={S.stepSub}>
            One document, built from every source, with every figure checked back against them.
          </div>
          <div style={S.btnRow}>
            <button
              type="button"
              style={{ ...S.primary, opacity: running || sources.length === 0 ? 0.5 : 1 }}
              disabled={running || sources.length === 0}
              onClick={() => void synthesize(false)}
            >
              {running ? "Synthesizing…" : hasMaster ? `Fold in ${pending.length || "new"}` : "Synthesize"}
            </button>
            {hasMaster && (
              <button
                type="button"
                style={S.ghost}
                disabled={running}
                onClick={() => { if (window.confirm("Rebuild from EVERY source? The current version stays in the history.")) void synthesize(true); }}
              >
                Rebuild
              </button>
            )}
          </div>

          {running && <div style={S.working}>Reading the sources and auditing the figures…</div>}
          {lane?.synthesis_status === "failed" && lane.synthesis_error && (
            <div style={S.bad}>{lane.synthesis_error}</div>
          )}
          {needsReview && (
            <div style={S.warn}>
              <b>Parked for review.</b> It saved, but still fails the citation audit
              {lane?.synthesis_error ? ` — ${lane.synthesis_error}` : "."} Read it before anything goes to a client.
            </div>
          )}

          {hasMaster ? (
            <>
              <div style={S.masterBox}>
                <div style={S.masterTitle}>{lane?.master_title || lane?.label}</div>
                <div style={S.masterMeta}>
                  v{lane?.master_version} · {versions.length} version{versions.length === 1 ? "" : "s"}
                  {lane?.synthesized_at ? ` · ${shortDate(lane.synthesized_at)}` : ""}
                </div>
              </div>
              <div style={S.btnRow}>
                <button
                  type="button"
                  style={S.ghost}
                  onClick={async () => {
                    if (!lane) return;
                    const v = await api<{ master_md: string }>(`/research/lanes/${lane.id}/versions/${lane.master_version}`);
                    const url = URL.createObjectURL(new Blob([v.master_md ?? ""], { type: "text/markdown" }));
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${slugify(lane.label)}-master-v${lane.master_version}.md`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  Download .md
                </button>
                {/* Read, not edit: the master is machine-built from the sources
                    and audited against them, so a hand edit would quietly break
                    what the audit claims. Tune the DERIVED documents instead —
                    those are yours to rewrite. */}
                <button type="button" style={S.ghost} onClick={() => onReadMaster(lane!.id, lane!.master_title || lane!.label)}>
                  Read master
                </button>
              </div>
            </>
          ) : (
            <div style={S.empty}>
              No master yet. Add your research, then synthesize — that's the document everything else is built from.
            </div>
          )}
        </section>

        {/* ── 3 + 4 ── */}
        <section style={{ ...S.step, flex: 1.25 }}>
          <div style={S.stepHead}><span style={S.stepNo}>3</span> Produce</div>
          <div style={S.stepSub}>
            Everything below reads the master. Nothing invents a number that isn't in it.
          </div>

          {!hasMaster && <div style={S.empty}>Available once the master exists.</div>}

          {hasMaster && (
            <>
              <div style={S.groupLabel}>Corp dev</div>
              {CORPDEV.map((d) => {
                const made = docs.filter((x) => x.kind === d.key);
                const stale = made[0] && made[0].lane_version != null && made[0].lane_version < (lane?.master_version ?? 0);
                return (
                  <div key={d.key} style={S.out}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.outName}>{d.label}</div>
                      <div style={S.outBlurb}>{d.blurb}</div>
                      {made[0] && (
                        <button type="button" style={S.outLink} onClick={() => onOpenArtifact(made[0].id)}>
                          Open “{made[0].label.slice(0, 46)}{made[0].label.length > 46 ? "…" : ""}”
                          {stale ? ` · from v${made[0].lane_version}` : ""}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      style={{ ...S.outBtn, opacity: busy?.startsWith("cd:") ? 0.5 : 1 }}
                      disabled={!!busy}
                      onClick={() => void derive(d.key)}
                    >
                      {busy === `cd:${d.key}` ? "Writing…" : made[0] ? "Rewrite" : "Write"}
                    </button>
                  </div>
                );
              })}

              <div style={{ ...S.groupLabel, marginTop: 16 }}>Collateral</div>
              {COLLATERAL.map((c) => (
                <div key={c.key} style={S.out}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.outName}>{c.label}</div>
                    <div style={S.outBlurb}>{c.blurb}</div>
                  </div>
                  <button
                    type="button"
                    style={{ ...S.outBtn, opacity: busy ? 0.5 : 1 }}
                    disabled={!!busy}
                    onClick={() => void buildCollateral(c.key)}
                  >
                    {busy === `col:${c.key}` ? "Opening…" : "Build"}
                  </button>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto", padding: "0 26px 24px" },

  blank: { maxWidth: 560, margin: "72px auto 0", textAlign: "center" },
  blankH: { fontSize: 26, fontWeight: 800, color: T.ink, letterSpacing: "-0.02em" },
  blankB: { fontSize: 14, color: T.muted, lineHeight: 1.65, marginTop: 10 },
  cta: { marginTop: 20, background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.font },

  head: { display: "flex", alignItems: "center", gap: 10, padding: "4px 0 16px" },
  headLabel: { fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.06em", textTransform: "uppercase" },
  picker: { height: 36, minWidth: 280, borderRadius: 10, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 10px", fontSize: 13.5, fontWeight: 600, color: T.ink, fontFamily: T.font, outline: "none" },
  headBtn: { background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },

  steps: { display: "flex", gap: 16, alignItems: "flex-start" },
  step: { flex: 1, minWidth: 0, background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 },
  stepHead: { display: "flex", alignItems: "center", gap: 9, fontSize: 15, fontWeight: 800, color: T.ink, letterSpacing: "-0.01em" },
  stepNo: { flex: "none", width: 22, height: 22, borderRadius: 11, background: T.blueBg, color: T.blue, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  stepSub: { fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "6px 0 12px" },

  btnRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  primary: { background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font },
  ghost: { background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },

  list: { marginTop: 12, display: "flex", flexDirection: "column", gap: 2 },
  item: { display: "flex", alignItems: "center", gap: 8, padding: "6px 2px" },
  dot: { flex: "none", width: 7, height: 7, borderRadius: 4 },
  itemName: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemMeta: { flex: "none", fontSize: 11, color: T.muted2 },
  x: { flex: "none", border: "none", background: "none", color: T.muted2, cursor: "pointer", fontSize: 15, lineHeight: 1, padding: "0 2px" },
  empty: { fontSize: 12, color: T.muted, lineHeight: 1.55, marginTop: 12 },
  foot: { fontSize: 11.5, color: T.muted2, marginTop: 10 },

  working: { marginTop: 12, fontSize: 12, color: T.blue, fontWeight: 600 },
  bad: { marginTop: 12, fontSize: 12, color: "#B3261E", lineHeight: 1.5, background: "#FBE4DE", borderRadius: 9, padding: "9px 11px" },
  warn: { marginTop: 12, fontSize: 12, color: "#8A6A2B", lineHeight: 1.5, background: "#FFF4E0", borderRadius: 9, padding: "9px 11px" },

  masterBox: { marginTop: 14, marginBottom: 10, padding: "11px 12px", borderRadius: 10, background: T.surface, border: `1px solid ${T.hair}` },
  masterTitle: { fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.35 },
  masterMeta: { fontSize: 11.5, color: T.muted, marginTop: 3 },

  groupLabel: { fontSize: 10.5, fontWeight: 700, color: T.muted2, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 },
  out: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${T.hair}` },
  outName: { fontSize: 13, fontWeight: 700, color: T.ink },
  outBlurb: { fontSize: 11.5, color: T.muted, lineHeight: 1.45, marginTop: 1 },
  outLink: { display: "block", marginTop: 4, background: "none", border: "none", padding: 0, fontSize: 11.5, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font, textAlign: "left" },
  outBtn: { flex: "none", background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "7px 15px", fontSize: 12.5, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },
};
