/**
 * Atlas — Studio / Research & campaigns (2026-07-15).
 *
 * Paul's internal research agent control panel + LinkedIn campaign manager.
 * He controls the four knobs per run — TOPIC (free text), TYPE (six research
 * types), DEPTH (quick/standard/deep = search budget), OUTPUT (letter PDF
 * report, 1080×1350 LinkedIn card, or both) — and can save any run as a
 * CAMPAIGN on a cadence (weekly Sunday-night, biweekly, monthly). Runs
 * execute server-side (web-search-armed Claude, fully cited); artifacts
 * download from here. Internal-only: practice-mode auth covers the routes.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, type User } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import { CheckIcon } from "../icons";

/* ─── API types ────────────────────────────────────────────── */

interface Catalog {
  types: { key: string; label: string; blurb: string }[];
  depths: { key: string; label: string; blurb: string }[];
  formats: string[];
  cadences: string[];
}
interface RunRow {
  id: number;
  schedule_id: number | null;
  research_type: string;
  topic: string;
  depth: string;
  output_format: string;
  status: string;
  progress: string | null;
  report_title: string | null;
  has_feed: boolean;
  error: string | null;
  usage: { searches?: number; costCents?: number } | null;
  created_at: string;
  completed_at: string | null;
}
interface ScheduleRow {
  id: number;
  name: string;
  research_type: string;
  topic: string;
  depth: string;
  output_format: string;
  cadence: string;
  active: boolean;
  next_run_at: string | null;
}

async function api<J>(path: string, init?: RequestInit): Promise<J> {
  const r = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any)?.error || `Request failed (${r.status})`);
  return j as J;
}

/** Authed blob download — plain <a href> can't carry the JWT header. */
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

function slugify(s: string): string {
  return (s || "research").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "research";
}

const CADENCE_LABELS: Record<string, string> = {
  weekly: "Weekly (Sunday night)",
  biweekly: "Every two weeks",
  monthly: "Monthly",
};

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── root ─────────────────────────────────────────────────── */

export default function StudioResearch({ user }: { user: User | null }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [usage, setUsage] = useState<{ spentCents: number; capCents: number } | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // The four knobs.
  const [typeKey, setTypeKey] = useState("vertical_scan");
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("standard");
  const [output, setOutput] = useState("both");
  // Campaign extras.
  const [asCampaign, setAsCampaign] = useState(false);
  const [campName, setCampName] = useState("");
  const [cadence, setCadence] = useState("weekly");
  const [runNow, setRunNow] = useState(true);

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "err" | "ok"; text: string } | null>(null);
  const [dl, setDl] = useState<string | null>(null); // "runId:kind" while downloading

  const refresh = useCallback(async () => {
    try {
      const [r, s, u] = await Promise.all([
        api<{ runs: RunRow[] }>("/research/runs"),
        api<{ schedules: ScheduleRow[] }>("/research/schedules"),
        api<{ spentCents: number; capCents: number }>("/research/usage"),
      ]);
      setRuns(r.runs ?? []);
      setSchedules(s.schedules ?? []);
      setUsage(u);
    } catch {
      /* transient — next poll retries */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    api<Catalog>("/research/catalog").then(setCatalog).catch(() => {});
    void refresh();
  }, [refresh]);

  // Poll while anything is in flight.
  const inFlight = runs.some((r) => r.status === "queued" || r.status === "running");
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    if (!inFlight) return;
    const t = setInterval(() => refreshRef.current(), 5000);
    return () => clearInterval(t);
  }, [inFlight]);

  const typeLabel = useMemo(() => {
    const m = new Map((catalog?.types ?? []).map((t) => [t.key, t.label]));
    return (key: string) => m.get(key) ?? key;
  }, [catalog]);

  const submit = useCallback(async () => {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      if (asCampaign) {
        if (!campName.trim()) throw new Error("Give the campaign a name.");
        await api("/research/schedules", {
          method: "POST",
          body: JSON.stringify({ name: campName.trim(), researchType: typeKey, topic: topic.trim(), depth, outputFormat: output, cadence, runNow }),
        });
        setNote({ kind: "ok", text: runNow ? "Campaign created — the first run is going now." : "Campaign created." });
        setCampName("");
        setAsCampaign(false);
      } else {
        await api("/research/runs", {
          method: "POST",
          body: JSON.stringify({ researchType: typeKey, topic: topic.trim(), depth, outputFormat: output }),
        });
        setNote({ kind: "ok", text: "Run started — reports land below when done." });
      }
      setTopic("");
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t start that." });
    } finally {
      setBusy(false);
    }
  }, [topic, busy, asCampaign, campName, typeKey, depth, output, cadence, runNow, refresh]);

  const toggleSchedule = useCallback(async (s: ScheduleRow) => {
    try {
      await api(`/research/schedules/${s.id}`, { method: "PATCH", body: JSON.stringify({ active: !s.active }) });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t update the campaign." });
    }
  }, [refresh]);

  const deleteSchedule = useCallback(async (s: ScheduleRow) => {
    if (!window.confirm(`Delete campaign “${s.name}”? Past runs are kept.`)) return;
    try {
      await api(`/research/schedules/${s.id}`, { method: "DELETE" });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t delete the campaign." });
    }
  }, [refresh]);

  const deleteRun = useCallback(async (r: RunRow) => {
    if (!window.confirm("Delete this run and its report?")) return;
    try {
      await api(`/research/runs/${r.id}`, { method: "DELETE" });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t delete the run." });
    }
  }, [refresh]);

  const grab = useCallback(async (r: RunRow, kind: "pdf" | "card" | "md" | "lipdf") => {
    const key = `${r.id}:${kind}`;
    setDl(key);
    setNote(null);
    const base = slugify(r.report_title || r.topic);
    try {
      if (kind === "pdf") await download(`/research/runs/${r.id}/pdf`, `smbx-research-${base}.pdf`);
      else if (kind === "card") await download(`/research/runs/${r.id}/card.png`, `smbx-onepager-${base}.png`);
      else if (kind === "lipdf") await download(`/research/runs/${r.id}/linkedin.pdf`, `smbx-linkedin-${base}.pdf`);
      else await download(`/research/runs/${r.id}/md`, `smbx-research-${base}.md`);
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Download failed." });
    } finally {
      setDl(null);
    }
  }, []);

  /** Fetch the ready-to-paste post text and put it on the clipboard. */
  const copyPost = useCallback(async (r: RunRow) => {
    const key = `${r.id}:post`;
    setDl(key);
    setNote(null);
    try {
      const resp = await fetch(`/api/research/runs/${r.id}/post.txt`, { headers: authHeaders() });
      if (!resp.ok) throw new Error(`Post text failed (${resp.status})`);
      const text = await resp.text();
      await navigator.clipboard.writeText(text);
      setNote({ kind: "ok", text: "Post text copied — paste it straight into LinkedIn." });
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Copy failed." });
    } finally {
      setDl(null);
    }
  }, []);

  if (!user) {
    return <div style={R.signin}>Sign in to run research.</div>;
  }

  const depthDef = catalog?.depths.find((d) => d.key === depth);

  return (
    <div>
      {/* ── the control panel ── */}
      <div style={R.form}>
        <div style={R.knobRow}>
          <label style={R.knob}>
            <span style={R.knobLabel}>Research type</span>
            <select value={typeKey} onChange={(e) => setTypeKey(e.target.value)} style={R.select}>
              {(catalog?.types ?? []).map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            <span style={R.knobHint}>{catalog?.types.find((t) => t.key === typeKey)?.blurb ?? ""}</span>
          </label>
          <div style={R.knob}>
            <span style={R.knobLabel}>Depth</span>
            <div style={R.segRow}>
              {(catalog?.depths ?? []).map((d) => (
                <button key={d.key} type="button" onClick={() => setDepth(d.key)} style={{ ...R.seg, ...(depth === d.key ? R.segOn : null) }}>
                  {d.label}
                </button>
              ))}
            </div>
            <span style={R.knobHint}>{depthDef?.blurb ?? ""}</span>
          </div>
          <div style={R.knob}>
            <span style={R.knobLabel}>Output</span>
            <div style={R.segRow}>
              {([["report", "Report PDF"], ["post_pdf", "LI post — PDF doc"], ["post_image", "LI post — 1-pager"], ["both", "Everything"]] as const).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setOutput(k)} style={{ ...R.seg, ...(output === k ? R.segOn : null) }}>
                  {label}
                </button>
              ))}
            </div>
            <span style={R.knobHint}>{
              output === "post_pdf" ? "Swipeable LinkedIn document post (branded PDF pages) + ready-to-paste post text."
              : output === "post_image" ? "One branded 1080×1350 image + ready-to-paste post text."
              : output === "both" ? "The report plus both LinkedIn post formats."
              : "Cited letter-format report for internal use."
            }</span>
          </div>
        </div>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="The research mandate — e.g. “Independent fire & life safety contractors in Texas: who operates, who is acquiring, and whether the lane is worth a buy-side push.”"
          rows={3}
          style={R.topic}
        />

        <label style={R.campToggle}>
          <input type="checkbox" checked={asCampaign} onChange={(e) => setAsCampaign(e.target.checked)} style={{ accentColor: T.blue }} />
          <span>Make this a campaign — repeat it on a cadence</span>
        </label>

        {asCampaign && (
          <div style={R.campRow}>
            <input
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              placeholder="Campaign name — e.g. “Fire safety weekly”"
              style={R.campName}
            />
            <select value={cadence} onChange={(e) => setCadence(e.target.value)} style={R.select}>
              {(catalog?.cadences ?? ["weekly", "biweekly", "monthly"]).map((c) => (
                <option key={c} value={c}>{CADENCE_LABELS[c] ?? c}</option>
              ))}
            </select>
            <label style={R.runNow}>
              <input type="checkbox" checked={runNow} onChange={(e) => setRunNow(e.target.checked)} style={{ accentColor: T.blue }} />
              <span>Run the first one now</span>
            </label>
          </div>
        )}

        <div style={R.formFoot}>
          <span style={R.budget}>
            {usage ? `This month: $${(usage.spentCents / 100).toFixed(0)} of $${(usage.capCents / 100).toFixed(0)} research budget` : ""}
          </span>
          <button
            type="button"
            disabled={!topic.trim() || busy}
            onClick={submit}
            style={{ ...R.runBtn, opacity: !topic.trim() || busy ? 0.5 : 1 }}
          >
            {busy ? "Starting…" : asCampaign ? "Create campaign" : "Run research"}
          </button>
        </div>
        {note && <div style={{ ...R.note, color: note.kind === "err" ? "#B3261E" : T.green }}>{note.text}</div>}
      </div>

      {/* ── campaigns ── */}
      {schedules.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={R.secLabel}>Campaigns</div>
          <div style={R.list}>
            {schedules.map((s) => (
              <div key={s.id} style={{ ...R.row, opacity: s.active ? 1 : 0.6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={R.rowTitle}>{s.name}</div>
                  <div style={R.rowMeta}>
                    {typeLabel(s.research_type)} · {CADENCE_LABELS[s.cadence] ?? s.cadence}
                    {s.active && s.next_run_at ? ` · next ${new Date(s.next_run_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : s.active ? "" : " · paused"}
                  </div>
                  <div style={R.rowTopic}>{s.topic}</div>
                </div>
                <button type="button" style={R.tinyBtn} onClick={() => toggleSchedule(s)}>{s.active ? "Pause" : "Resume"}</button>
                <button type="button" style={{ ...R.tinyBtn, color: T.muted }} onClick={() => deleteSchedule(s)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── runs ── */}
      <div style={{ marginTop: 26 }}>
        <div style={R.secLabel}>Runs</div>
        {!loaded ? (
          <div style={R.empty}>Loading…</div>
        ) : runs.length === 0 ? (
          <div style={R.empty}>No research yet — set the knobs above and run your first one.</div>
        ) : (
          <div style={R.list}>
            {runs.map((r) => {
              const done = r.status === "complete";
              const failed = r.status === "failed";
              // Everything renders on demand from the stored run, so a completed
              // run with a feed can produce ANY artifact — the chosen format is
              // intent, not a limit.
              const showPdf = done;
              const showLiPdf = done && r.has_feed;
              const showCard = done && r.has_feed;
              const showPost = done && r.has_feed;
              return (
                <div key={r.id} style={R.row}>
                  <span style={R.statusIcon}>
                    {done ? <CheckIcon size={15} c={T.green} /> : failed ? <span style={{ color: "#B3261E", fontWeight: 700 }}>!</span> : <Spinner />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={R.rowTitle}>{r.report_title || r.topic}</div>
                    <div style={R.rowMeta}>
                      {typeLabel(r.research_type)} · {r.depth}
                      {r.schedule_id ? " · campaign" : ""} · {timeAgo(r.created_at)}
                      {done && r.usage?.searches != null ? ` · ${r.usage.searches} searches` : ""}
                      {done && r.usage?.costCents != null ? ` · ~$${(r.usage.costCents / 100).toFixed(2)}` : ""}
                      {!done && !failed && r.progress ? ` · ${r.progress}` : ""}
                    </div>
                    {failed && r.error && <div style={R.rowErr}>{r.error}</div>}
                  </div>
                  {showPdf && <button type="button" style={R.tinyBtn} disabled={dl === `${r.id}:pdf`} onClick={() => grab(r, "pdf")}>{dl === `${r.id}:pdf` ? "…" : "Report PDF"}</button>}
                  {showLiPdf && <button type="button" style={R.tinyBtn} disabled={dl === `${r.id}:lipdf`} onClick={() => grab(r, "lipdf")}>{dl === `${r.id}:lipdf` ? "…" : "LI doc PDF"}</button>}
                  {showCard && <button type="button" style={R.tinyBtn} disabled={dl === `${r.id}:card`} onClick={() => grab(r, "card")}>{dl === `${r.id}:card` ? "…" : "1-pager PNG"}</button>}
                  {showPost && <button type="button" style={R.tinyBtn} disabled={dl === `${r.id}:post`} onClick={() => copyPost(r)}>{dl === `${r.id}:post` ? "…" : "Copy post"}</button>}
                  {done && <button type="button" style={{ ...R.tinyBtn, color: T.muted }} disabled={dl === `${r.id}:md`} onClick={() => grab(r, "md")}>{dl === `${r.id}:md` ? "…" : "MD"}</button>}
                  {(done || failed) && <button type="button" style={{ ...R.tinyBtn, color: T.muted }} onClick={() => deleteRun(r)}>Delete</button>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 13, height: 13, borderRadius: "50%",
        border: `2px solid ${T.progTrack}`, borderTopColor: T.blue,
        display: "inline-block", animation: "atlas-glow 1s linear infinite",
      }}
    />
  );
}

/* ─── styles ───────────────────────────────────────────────── */

const R: Record<string, React.CSSProperties> = {
  signin: { marginTop: 24, fontSize: 13, color: T.muted },

  form: { marginTop: 16, background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: T.shCard, padding: "18px 20px" },
  knobRow: { display: "flex", gap: 22, flexWrap: "wrap" },
  knob: { display: "flex", flexDirection: "column", gap: 6, minWidth: 200, flex: 1 },
  knobLabel: { fontSize: 12, fontWeight: 600, color: T.muted },
  knobHint: { fontSize: 11.5, color: T.muted2, lineHeight: 1.4, minHeight: 16 },
  select: { height: 36, borderRadius: 9, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 8px", fontSize: 13, color: T.ink, fontFamily: T.font, maxWidth: 320 },
  segRow: { display: "flex", gap: 6 },
  seg: { height: 36, padding: "0 13px", borderRadius: 9, border: `1px solid ${T.inputBd}`, background: T.white, fontSize: 12.5, fontWeight: 600, color: T.ink3, cursor: "pointer", fontFamily: T.font },
  segOn: { background: T.blueBg3, borderColor: T.blue, color: T.blue },

  topic: { marginTop: 14, width: "100%", resize: "vertical", borderRadius: 12, border: `1px solid ${T.inputBd}`, padding: "11px 13px", fontSize: 14, lineHeight: 1.55, color: T.ink, fontFamily: T.font, outline: "none", background: T.white, boxSizing: "border-box" },

  campToggle: { marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.ink3, cursor: "pointer", width: "fit-content" },
  campRow: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  campName: { flex: 1, minWidth: 220, height: 36, borderRadius: 9, border: `1px solid ${T.inputBd}`, padding: "0 12px", fontSize: 13.5, color: T.ink, fontFamily: T.font, outline: "none" },
  runNow: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.ink3, cursor: "pointer" },

  formFoot: { marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  budget: { fontSize: 12, color: T.muted },
  runBtn: { background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "10px 22px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: T.font },
  note: { marginTop: 10, fontSize: 12.5, lineHeight: 1.5 },

  secLabel: { fontSize: 13, color: T.muted, marginBottom: 10, fontWeight: 600 },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  row: { display: "flex", alignItems: "center", gap: 11, background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shCard, padding: "12px 14px" },
  statusIcon: { width: 16, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 13.5, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowMeta: { fontSize: 12, color: T.muted, marginTop: 1 },
  rowTopic: { fontSize: 12, color: T.muted2, marginTop: 3, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  rowErr: { fontSize: 12, color: "#B3261E", marginTop: 3, lineHeight: 1.4 },
  tinyBtn: { flex: "none", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font },

  empty: { fontSize: 13, color: T.muted, padding: "14px 2px" },
};
