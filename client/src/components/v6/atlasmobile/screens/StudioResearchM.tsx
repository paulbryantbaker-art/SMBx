/**
 * Atlas-MOBILE — Studio / Research & campaigns (2026-07-19).
 *
 * The desktop campaign manager is a three-pane Finder; a phone gets the same
 * MACHINERY re-laid as a single column: folder CHIPS (All · campaigns ·
 * Archived · Media · Collateral · Analytics) over a card list, with in-place
 * drill-downs (run · campaign · asset · analytics · new-run form) that mirror
 * the collateral screen's list↔detail pattern — the shell keeps its own
 * header/back, we keep ours inline.
 *
 * Same endpoints as desktop (`/api/research/*`, `/api/studio/assets`): live
 * activity trail (3s poll while running), review & approve with the REAL
 * 1-pager preview, manage verbs, campaign edit, LinkedIn analytics import +
 * Yulia's read. Desktop-only by design: drag & drop, campaign groups, the
 * announcement/post-card composers, plan import, focal points.
 *
 * Mobile niceties: "Share" uses the OS share sheet for post text (paste
 * straight into the LinkedIn app); photo upload accepts the camera roll.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, type User } from "../../../../hooks/useAuth";
import { RT } from "../redesign/rt";
import { BackIcon, PlusIcon } from "../../desktop/icons";
import { MarkdownBody } from "./Studio";

/** SVG spinner (SMIL) — no CSS-keyframe dependency in the mobile bundle. */
function DotSpinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ flex: "none" }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke={RT.line} strokeWidth="3.5" />
      <path d="M12 3 a9 9 0 0 1 9 9" fill="none" stroke={RT.accentStrong} strokeWidth="3.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/* ─── API types (server contract — mirrors desktop StudioResearch) ────── */

interface Catalog {
  types: { key: string; label: string; blurb: string }[];
  depths: { key: string; label: string; blurb: string }[];
  angles?: { key: string; label: string; blurb: string }[];
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
  post_angle?: string | null;
  archived?: boolean;
  status: string;
  report_title: string | null;
  has_feed: boolean;
  review_status?: string;
  error: string | null;
  usage: { searches?: number; costCents?: number } | null;
  created_at: string;
}
interface ScheduleRow {
  id: number;
  name: string;
  research_type: string;
  topic: string;
  depth: string;
  output_format: string;
  post_angle?: string | null;
  cadence: string;
  active: boolean;
  archived?: boolean;
  next_run_at: string | null;
}
interface AssetRow {
  id: number;
  label: string;
  mime: string;
  kind: string;
  schedule_id?: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
  bytes: number;
}
interface AnalyticsRow {
  id: number;
  label: string;
  period_start: string | null;
  period_end: string | null;
  analysis_status: string;
  analysis_error: string | null;
  has_analysis: boolean;
  created_at: string;
}
interface ActivityEntry { t: string; kind: string; text: string }

async function api<J>(path: string, init?: RequestInit): Promise<J> {
  const r = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init?.headers ?? {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as any)?.error || `Request failed (${r.status})`);
  return j as J;
}

async function dlBlob(path: string, filename: string) {
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

const slug = (s: string) => (s || "research").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "research";
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return shortDate(iso);
}
const nfmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));

/** Post format → the research lens that best feeds it (same map as desktop). */
const FORMAT_LENS: Record<string, string> = {
  teardown: "vertical_scan",
  contrarian: "thesis_validation",
  how_buyers_think: "topic_brief",
  practitioner_note: "topic_brief",
  human_thread: "topic_brief",
  hand_raiser: "deal_monitor",
};
const CADENCE_LABELS: Record<string, string> = { weekly: "Weekly (Sun night)", biweekly: "Every two weeks", monthly: "Monthly" };

/* ─── small kit ────────────────────────────────────────────── */

function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span style={{ flex: "none", fontSize: 12.5, fontWeight: 700, borderRadius: RT.rPill, padding: "3px 10px", background: bg, color: fg }}>{text}</span>;
}

function statusPill(r: RunRow) {
  const running = r.status === "queued" || r.status === "running";
  if (running) return <Pill text="Running" bg={RT.accentSoft} fg={RT.accentInk} />;
  if (r.status === "failed") return <Pill text="Failed" bg="#FBE4DE" fg={RT.down} />;
  if (r.review_status === "approved") return <Pill text="Approved" bg={RT.accentSoft} fg={RT.accentInk} />;
  return <Pill text="Draft" bg={RT.line} fg={RT.muted} />;
}

/** Authed image (JWT header → blob URL); phones can't pass headers in <img>. */
function AuthImg({ path, alt, style, reloadKey }: { path: string; alt: string; style?: React.CSSProperties; reloadKey?: unknown }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true;
    let url: string | null = null;
    setSrc(null); setErr(false);
    fetch(`/api${path}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => { if (alive) { url = URL.createObjectURL(b); setSrc(url); } })
      .catch(() => { if (alive) setErr(true); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [path, reloadKey]);
  if (err) return <div style={{ fontSize: 12.5, color: RT.faint, padding: "10px 0" }}>Preview unavailable — try Download.</div>;
  if (!src) return <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: RT.muted, padding: "10px 0" }}><DotSpinner size={14} /> Rendering…</div>;
  return <img src={src} alt={alt} style={{ width: "100%", display: "block", borderRadius: 12, ...style }} />;
}

/* ─── screen ───────────────────────────────────────────────── */

type MView =
  | { t: "list" }
  | { t: "new" }
  | { t: "run"; id: number }
  | { t: "camp"; id: number }
  | { t: "asset"; id: number }
  | { t: "perf"; id: number };

type Folder = { k: "all" } | { k: "oneoff" } | { k: "archived" } | { k: "camp"; id: number } | { k: "media" } | { k: "collateral" } | { k: "perf" };

export default function StudioResearchM({ user: _user }: { user: User | null }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [usage, setUsage] = useState<{ spentCents: number; capCents: number } | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [connErr, setConnErr] = useState(false);
  const [folder, setFolder] = useState<Folder>({ k: "all" });
  const [view, setView] = useState<MView>({ t: "list" });
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const photoRef = useRef<HTMLInputElement | null>(null);
  const xlsxRef = useRef<HTMLInputElement | null>(null);
  const lastAutoRef = useRef<number | null>(null);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 6000);
    return () => clearTimeout(t);
  }, [note]);

  const refresh = useCallback(async () => {
    try {
      const [r, s, u, a, an] = await Promise.all([
        api<{ runs: RunRow[] }>("/research/runs"),
        api<{ schedules: ScheduleRow[] }>("/research/schedules"),
        api<{ spentCents: number; capCents: number }>("/research/usage"),
        api<{ assets: AssetRow[] }>("/studio/assets"),
        api<{ items: AnalyticsRow[] }>("/research/analytics"),
      ]);
      setRuns(r.runs ?? []);
      setSchedules(s.schedules ?? []);
      setUsage(u);
      setAssets(a.assets ?? []);
      setAnalytics(an.items ?? []);
      setConnErr(false);
    } catch {
      setConnErr(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    api<Catalog>("/research/catalog").then(setCatalog).catch(() => {});
    void refresh();
  }, [refresh]);

  const inFlight = runs.some((r) => r.status === "queued" || r.status === "running")
    || analytics.some((a) => a.analysis_status === "running");
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    const t = setInterval(() => refreshRef.current(), inFlight || connErr ? 5000 : 30000);
    return () => clearInterval(t);
  }, [inFlight, connErr]);

  // A freshly started run pulls its detail open so the live trail is visible.
  useEffect(() => {
    const newest = runs[0];
    if (newest && (newest.status === "queued" || newest.status === "running") && lastAutoRef.current !== newest.id) {
      lastAutoRef.current = newest.id;
      setView({ t: "run", id: newest.id });
    }
  }, [runs]);

  const typeLabel = useMemo(() => {
    const m = new Map((catalog?.types ?? []).map((t) => [t.key, t.label]));
    return (k: string) => m.get(k) ?? k;
  }, [catalog]);
  const angleLabel = useMemo(() => {
    const m = new Map((catalog?.angles ?? []).map((a) => [a.key, a.label]));
    return (k?: string | null) => (k && k !== "auto" ? m.get(k) ?? null : null);
  }, [catalog]);

  /* ── verbs (same endpoints as desktop) ── */

  const patchRun = useCallback(async (id: number, body: Record<string, unknown>, ok: string) => {
    try {
      await api(`/research/runs/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      setNote({ kind: "ok", text: ok });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Update failed." }); }
  }, [refresh]);

  const deleteRun = useCallback(async (id: number) => {
    if (!window.confirm("Delete this run and its report?")) return;
    try { await api(`/research/runs/${id}`, { method: "DELETE" }); setView({ t: "list" }); void refresh(); }
    catch (e: any) { setNote({ kind: "err", text: e?.message || "Delete failed." }); }
  }, [refresh]);

  const rerunRun = useCallback(async (r: RunRow) => {
    try {
      await api("/research/runs", { method: "POST", body: JSON.stringify({ researchType: r.research_type, topic: r.topic, depth: r.depth, outputFormat: r.output_format, postAngle: r.post_angle ?? "auto" }) });
      setNote({ kind: "ok", text: "Run restarted — the live trail opens in a moment." });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Couldn’t restart." }); }
  }, [refresh]);

  const runCampaignNow = useCallback(async (s: ScheduleRow) => {
    try {
      await api("/research/runs", { method: "POST", body: JSON.stringify({ researchType: s.research_type, topic: s.topic, depth: s.depth, outputFormat: s.output_format, postAngle: s.post_angle ?? "auto", scheduleId: s.id }) });
      setNote({ kind: "ok", text: `“${s.name}” is running now.` });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Couldn’t start the run." }); }
  }, [refresh]);

  const patchSchedule = useCallback(async (id: number, body: Record<string, unknown>, ok: string) => {
    try {
      await api(`/research/schedules/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      setNote({ kind: "ok", text: ok });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Update failed." }); }
  }, [refresh]);

  const deleteSchedule = useCallback(async (s: ScheduleRow) => {
    if (!window.confirm(`Delete campaign “${s.name}”? Past runs are kept.`)) return;
    try { await api(`/research/schedules/${s.id}`, { method: "DELETE" }); setView({ t: "list" }); setFolder({ k: "all" }); void refresh(); }
    catch (e: any) { setNote({ kind: "err", text: e?.message || "Delete failed." }); }
  }, [refresh]);

  const uploadPhoto = useCallback(async (f: File) => {
    const fd = new FormData();
    fd.append("file", f);
    fd.append("label", f.name.replace(/\.[a-z0-9]+$/i, ""));
    try {
      const r = await fetch("/api/studio/assets", { method: "POST", headers: authHeaders(), body: fd });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error((j as any)?.error || `Upload failed (${r.status})`); }
      setNote({ kind: "ok", text: "Photo uploaded — it's in Media." });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Upload failed." }); }
  }, [refresh]);

  const deleteAsset = useCallback(async (a: AssetRow) => {
    if (!window.confirm(`Delete “${a.label}”?`)) return;
    try { await api(`/studio/assets/${a.id}`, { method: "DELETE" }); setView({ t: "list" }); void refresh(); }
    catch (e: any) { setNote({ kind: "err", text: e?.message || "Delete failed." }); }
  }, [refresh]);

  const uploadAnalytics = useCallback(async (f: File) => {
    const fd = new FormData();
    fd.append("workbook", f);
    try {
      const r = await fetch("/api/research/analytics", { method: "POST", headers: authHeaders(), body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((j as any)?.error || `Import failed (${r.status})`);
      setNote({ kind: "ok", text: "Analytics imported — open it and tap Analyze." });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Import failed." }); }
  }, [refresh]);

  const analyzeAnalytics = useCallback(async (id: number) => {
    try {
      await api(`/research/analytics/${id}/analyze`, { method: "POST" });
      setNote({ kind: "ok", text: "Yulia is reading the week — under a minute." });
      void refresh();
    } catch (e: any) { setNote({ kind: "err", text: e?.message || "Couldn’t start the analysis." }); }
  }, [refresh]);

  const deleteAnalytics = useCallback(async (a: AnalyticsRow) => {
    if (!window.confirm(`Delete “${a.label}” and its analysis?`)) return;
    try { await api(`/research/analytics/${a.id}`, { method: "DELETE" }); setView({ t: "list" }); void refresh(); }
    catch (e: any) { setNote({ kind: "err", text: e?.message || "Delete failed." }); }
  }, [refresh]);

  /** Post text → OS share sheet when available (paste into LinkedIn), else clipboard. */
  const sharePost = useCallback(async (r: RunRow) => {
    try {
      const resp = await fetch(`/api/research/runs/${r.id}/post.txt`, { headers: authHeaders() });
      if (!resp.ok) throw new Error("Couldn’t fetch the post text");
      const text = await resp.text();
      if (navigator.share) { await navigator.share({ text }); return; }
      await navigator.clipboard.writeText(text);
      setNote({ kind: "ok", text: "Post text copied." });
    } catch (e: any) {
      if (e?.name === "AbortError") return; // user closed the share sheet
      setNote({ kind: "err", text: e?.message || "Share failed." });
    }
  }, []);

  /* ── derived lists ── */

  const activeRuns = useMemo(() => runs.filter((r) => !r.archived), [runs]);
  const archivedRuns = useMemo(() => runs.filter((r) => r.archived), [runs]);
  const oneoffs = useMemo(() => activeRuns.filter((r) => r.schedule_id == null), [activeRuns]);
  const photos = useMemo(() => assets.filter((a) => a.kind !== "collateral"), [assets]);
  const collateral = useMemo(() => assets.filter((a) => a.kind === "collateral"), [assets]);
  const liveCamps = useMemo(() => schedules.filter((s) => !s.archived), [schedules]);

  const folderRuns =
    folder.k === "all" ? activeRuns
    : folder.k === "oneoff" ? oneoffs
    : folder.k === "archived" ? archivedRuns
    : folder.k === "camp" ? activeRuns.filter((r) => r.schedule_id === folder.id)
    : [];
  const folderCamp = folder.k === "camp" ? liveCamps.find((s) => s.id === folder.id) ?? null : null;
  const campCollateral = folder.k === "camp" ? collateral.filter((a) => a.schedule_id === folder.id) : [];

  const chips: { key: string; label: string; f: Folder; on: boolean }[] = [
    { key: "all", label: `All · ${activeRuns.length}`, f: { k: "all" }, on: folder.k === "all" },
    { key: "oneoff", label: `One-offs · ${oneoffs.length}`, f: { k: "oneoff" }, on: folder.k === "oneoff" },
    ...liveCamps.map((s) => ({ key: `c${s.id}`, label: s.name, f: { k: "camp", id: s.id } as Folder, on: folder.k === "camp" && folder.id === s.id })),
    { key: "archived", label: `Archived · ${archivedRuns.length}`, f: { k: "archived" }, on: folder.k === "archived" },
    { key: "media", label: `Media · ${photos.length}`, f: { k: "media" }, on: folder.k === "media" },
    { key: "collateral", label: `Collateral · ${collateral.length}`, f: { k: "collateral" }, on: folder.k === "collateral" },
    { key: "perf", label: `Analytics · ${analytics.length}`, f: { k: "perf" }, on: folder.k === "perf" },
  ];

  /* ── sub-views ── */

  const backRow = (label: string) => (
    <button type="button" onClick={() => setView({ t: "list" })} style={S.back}>
      <BackIcon size={17} c={RT.muted} /> {label}
    </button>
  );

  const noteBanner = note && (
    <div style={{ ...S.note, background: note.kind === "err" ? "#FBE4DE" : RT.accentSoft, color: note.kind === "err" ? RT.down : RT.accentInk }}>
      {note.text}
    </div>
  );

  if (view.t === "new") {
    return (
      <div style={S.wrap}>
        {backRow("Library")}
        {noteBanner}
        <NewRunForm
          catalog={catalog}
          usage={usage}
          onDone={(msg) => { setNote({ kind: "ok", text: msg }); setView({ t: "list" }); void refresh(); }}
          onErr={(msg) => setNote({ kind: "err", text: msg })}
        />
      </div>
    );
  }

  if (view.t === "run") {
    const run = runs.find((r) => r.id === view.id) ?? null;
    return (
      <div style={S.wrap}>
        {backRow("Library")}
        {noteBanner}
        {run ? (
          <RunDetail
            run={run}
            schedules={liveCamps}
            typeLabel={typeLabel}
            angleLabel={angleLabel}
            onShare={() => void sharePost(run)}
            onRerun={() => void rerunRun(run)}
            onArchive={(v) => void patchRun(run.id, { archived: v }, v ? "Archived." : "Restored.")}
            onDelete={() => void deleteRun(run.id)}
            onMove={(sid) => void patchRun(run.id, { scheduleId: sid }, sid != null ? "Filed under the campaign." : "Moved to one-offs.")}
            onApproved={() => void refresh()}
            onNote={(k, t) => setNote({ kind: k, text: t })}
          />
        ) : (
          <div style={S.card}>Run not found — it may have been deleted.</div>
        )}
      </div>
    );
  }

  if (view.t === "camp") {
    const s = schedules.find((x) => x.id === view.id) ?? null;
    return (
      <div style={S.wrap}>
        {backRow("Library")}
        {noteBanner}
        {s ? (
          <CampaignEdit
            s={s}
            angles={catalog?.angles ?? []}
            cadences={catalog?.cadences ?? ["weekly", "biweekly", "monthly"]}
            onSave={(body) => void patchSchedule(s.id, body, "Campaign updated.")}
            onRunNow={() => void runCampaignNow(s)}
            onToggle={() => void patchSchedule(s.id, { active: !s.active }, s.active ? "Campaign paused." : "Campaign resumed.")}
            onArchive={() => void patchSchedule(s.id, { archived: !s.archived }, s.archived ? "Campaign restored." : "Campaign archived.")}
            onDelete={() => void deleteSchedule(s)}
          />
        ) : (
          <div style={S.card}>Campaign not found.</div>
        )}
      </div>
    );
  }

  if (view.t === "asset") {
    const a = assets.find((x) => x.id === view.id) ?? null;
    return (
      <div style={S.wrap}>
        {backRow(folder.k === "media" ? "Media" : "Collateral")}
        {noteBanner}
        {a ? (
          <div style={S.card}>
            <div style={S.cardTitle}>{a.label}</div>
            <div style={S.meta}>
              {a.kind === "collateral" ? "Rendered collateral" : "Media photo"} · {(a.mime.split("/")[1] ?? a.mime).toUpperCase()}
              {a.width && a.height ? ` · ${a.width}×${a.height}` : ""} · {shortDate(a.created_at)}
            </div>
            {a.mime.startsWith("image/") ? (
              <div style={{ marginTop: 12 }}><AuthImg path={`/studio/assets/${a.id}/raw`} alt={a.label} /></div>
            ) : (
              <div style={{ fontSize: 12.5, color: RT.faint, marginTop: 10 }}>PDF — use Download to open it.</div>
            )}
            <div style={S.btnRow}>
              <button type="button" style={S.btn} onClick={() => void dlBlob(`/studio/assets/${a.id}/raw`, `${slug(a.label)}.${a.mime === "application/pdf" ? "pdf" : a.mime === "image/png" ? "png" : "jpg"}`).catch((e) => setNote({ kind: "err", text: e.message }))}>Download</button>
              <button type="button" style={{ ...S.btn, color: RT.muted }} onClick={() => void deleteAsset(a)}>Delete</button>
            </div>
          </div>
        ) : (
          <div style={S.card}>File not found.</div>
        )}
      </div>
    );
  }

  if (view.t === "perf") {
    const a = analytics.find((x) => x.id === view.id) ?? null;
    return (
      <div style={S.wrap}>
        {backRow("Analytics")}
        {noteBanner}
        {a ? (
          <PerfDetail a={a} onAnalyze={() => void analyzeAnalytics(a.id)} onDelete={() => void deleteAnalytics(a)} />
        ) : (
          <div style={S.card}>Import not found.</div>
        )}
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div style={S.wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: RT.muted, lineHeight: 1.5 }}>
            Cited research runs, LinkedIn campaigns, and Yulia’s performance reads.
          </div>
        </div>
        <button type="button" style={S.newBtn} onClick={() => setView({ t: "new" })}>
          <PlusIcon size={16} c={RT.onAccent} /> New
        </button>
      </div>

      {connErr && <div style={S.connBar}>Can’t reach the server — retrying. Runs in flight keep executing.</div>}
      {noteBanner}

      {/* folder chips */}
      <div style={S.chips} className="scr">
        {chips.map((c) => (
          <button key={c.key} type="button" onClick={() => setFolder(c.f)} style={{ ...S.chip, ...(c.on ? S.chipOn : null) }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* campaign header card (Run now / Manage) */}
      {folderCamp && (
        <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: RT.ink }}>{folderCamp.name}{folderCamp.active ? "" : " · paused"}</div>
            <div style={S.meta}>
              {angleLabel(folderCamp.post_angle) ? `${angleLabel(folderCamp.post_angle)} · ` : ""}
              {CADENCE_LABELS[folderCamp.cadence] ?? folderCamp.cadence}
              {folderCamp.active && folderCamp.next_run_at ? ` · next ${shortDate(folderCamp.next_run_at)}` : ""}
            </div>
          </div>
          <button type="button" style={S.btnAccent} onClick={() => void runCampaignNow(folderCamp)}>Run now</button>
          <button type="button" style={S.btn} onClick={() => setView({ t: "camp", id: folderCamp.id })}>Manage</button>
        </div>
      )}

      {/* folder toolbar */}
      {folder.k === "media" && (
        <>
          <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadPhoto(f); e.currentTarget.value = ""; }} />
          <button type="button" style={{ ...S.btn, alignSelf: "flex-start" }} onClick={() => photoRef.current?.click()}>Upload photo</button>
        </>
      )}
      {folder.k === "perf" && (
        <>
          <input ref={xlsxRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAnalytics(f); e.currentTarget.value = ""; }} />
          <button type="button" style={{ ...S.btn, alignSelf: "flex-start" }} onClick={() => xlsxRef.current?.click()}>Import LinkedIn export</button>
        </>
      )}

      {/* rows */}
      {!loaded && <div style={S.card}>Loading…</div>}
      {loaded && folder.k !== "media" && folder.k !== "collateral" && folder.k !== "perf" && folderRuns.length === 0 && campCollateral.length === 0 && (
        <div style={{ ...S.card, color: RT.muted, fontSize: 13.5 }}>
          {folder.k === "archived" ? "Nothing archived." : "No runs here yet — tap New to start one."}
        </div>
      )}

      {folder.k !== "media" && folder.k !== "collateral" && folder.k !== "perf" && folderRuns.map((r) => {
        const running = r.status === "queued" || r.status === "running";
        return (
          <button key={r.id} type="button" style={S.rowCard} onClick={() => setView({ t: "run", id: r.id })}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {running && <DotSpinner size={14} />}
              <span style={S.rowTitle}>{r.report_title || r.topic}</span>
              {statusPill(r)}
            </div>
            <div style={S.meta}>
              {(angleLabel(r.post_angle) ?? typeLabel(r.research_type))} · {timeAgo(r.created_at)}
              {r.schedule_id != null ? ` · ${liveCamps.find((s) => s.id === r.schedule_id)?.name ?? "campaign"}` : ""}
            </div>
          </button>
        );
      })}

      {/* a campaign's exported collateral after its runs */}
      {campCollateral.map((a) => (
        <button key={`ca${a.id}`} type="button" style={S.rowCard} onClick={() => setView({ t: "asset", id: a.id })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={S.rowTitle}>{a.label}</span>
            <Pill text={(a.mime.split("/")[1] ?? "file").toUpperCase()} bg={RT.line} fg={RT.muted} />
          </div>
          <div style={S.meta}>Collateral · {shortDate(a.created_at)}</div>
        </button>
      ))}

      {(folder.k === "media" || folder.k === "collateral") && (
        <>
          {loaded && (folder.k === "media" ? photos : collateral).length === 0 && (
            <div style={{ ...S.card, color: RT.muted, fontSize: 13.5 }}>
              {folder.k === "media" ? "No photos yet — upload one." : "No collateral yet — cards render into here (composers live on desktop)."}
            </div>
          )}
          {(folder.k === "media" ? photos : collateral).map((a) => (
            <button key={a.id} type="button" style={S.rowCard} onClick={() => setView({ t: "asset", id: a.id })}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={S.rowTitle}>{a.label}</span>
                <Pill text={(a.mime.split("/")[1] ?? "file").toUpperCase()} bg={RT.line} fg={RT.muted} />
              </div>
              <div style={S.meta}>{a.width && a.height ? `${a.width}×${a.height} · ` : ""}{shortDate(a.created_at)}</div>
            </button>
          ))}
        </>
      )}

      {folder.k === "perf" && (
        <>
          {loaded && analytics.length === 0 && (
            <div style={{ ...S.card, color: RT.muted, fontSize: 13.5 }}>
              Export the .xlsx from the LinkedIn app or site (Analytics → Post impressions → Export) and import it here.
            </div>
          )}
          {analytics.map((a) => (
            <button key={a.id} type="button" style={S.rowCard} onClick={() => setView({ t: "perf", id: a.id })}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {a.analysis_status === "running" && <DotSpinner size={14} />}
                <span style={S.rowTitle}>{a.label}</span>
                {a.analysis_status === "running" ? <Pill text="Analyzing" bg={RT.accentSoft} fg={RT.accentInk} />
                  : a.analysis_status === "failed" ? <Pill text="Failed" bg="#FBE4DE" fg={RT.down} />
                  : a.has_analysis ? <Pill text="Analyzed" bg={RT.accentSoft} fg={RT.accentInk} />
                  : <Pill text="Imported" bg={RT.line} fg={RT.muted} />}
              </div>
              <div style={S.meta}>
                {a.period_start && a.period_end ? `${shortDate(a.period_start)} – ${shortDate(a.period_end)} · ` : ""}{timeAgo(a.created_at)}
              </div>
            </button>
          ))}
        </>
      )}

      {usage && (
        <div style={{ fontSize: 12, color: RT.faint, padding: "2px 4px" }}>
          Research spend this month: ${(usage.spentCents / 100).toFixed(2)} of ${(usage.capCents / 100).toFixed(0)}.
        </div>
      )}
    </div>
  );
}

/* ─── new-run form (format-first, same vocabulary as desktop) ─────────── */

function NewRunForm({ catalog, usage, onDone, onErr }: {
  catalog: Catalog | null;
  usage: { spentCents: number; capCents: number } | null;
  onDone: (msg: string) => void;
  onErr: (msg: string) => void;
}) {
  const [angle, setAngle] = useState("auto");
  const [typeKey, setTypeKey] = useState("vertical_scan");
  const typeTouched = useRef(false);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("standard");
  const [output, setOutput] = useState("both");
  const [asCampaign, setAsCampaign] = useState(false);
  const [campName, setCampName] = useState("");
  const [cadence, setCadence] = useState("weekly");
  const [runNow, setRunNow] = useState(true);
  const [busy, setBusy] = useState(false);

  const angles = catalog?.angles ?? [];

  const submit = async () => {
    if (!topic.trim() || busy) return;
    setBusy(true);
    try {
      if (asCampaign) {
        if (!campName.trim()) throw new Error("Give the campaign a name.");
        await api("/research/schedules", {
          method: "POST",
          body: JSON.stringify({ name: campName.trim(), researchType: typeKey, topic: topic.trim(), depth, outputFormat: output, postAngle: angle, cadence, runNow }),
        });
        onDone(runNow ? "Campaign created — the first run is starting now." : "Campaign created — nothing runs until its first fire; use Run now on the campaign to start one.");
      } else {
        await api("/research/runs", {
          method: "POST",
          body: JSON.stringify({ researchType: typeKey, topic: topic.trim(), depth, outputFormat: output, postAngle: angle }),
        });
        onDone("Run started — the live trail opens in a moment.");
      }
    } catch (e: any) {
      onErr(e?.message || "Couldn’t start that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>New research</div>

      <div style={S.label}>Post format</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {[{ key: "auto", label: "Auto" }, ...angles].map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => { setAngle(a.key); if (!typeTouched.current && FORMAT_LENS[a.key]) setTypeKey(FORMAT_LENS[a.key]); }}
            style={{ ...S.chip, ...(angle === a.key ? S.chipOn : null) }}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div style={S.label}>Topic — the standing mandate for a campaign</div>
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Commercial fire & life safety contractors — Texas triangle"
        style={S.textarea}
        rows={3}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={S.label}>Research lens</div>
          <select value={typeKey} onChange={(e) => { typeTouched.current = true; setTypeKey(e.target.value); }} style={S.select}>
            {(catalog?.types ?? []).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ width: 120, flex: "none" }}>
          <div style={S.label}>Depth</div>
          <select value={depth} onChange={(e) => setDepth(e.target.value)} style={S.select}>
            {(catalog?.depths ?? []).map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div style={S.label}>Output</div>
      <select value={output} onChange={(e) => setOutput(e.target.value)} style={S.select}>
        {(catalog?.formats ?? ["report", "post_image", "both"]).map((f) => (
          <option key={f} value={f}>{f === "report" ? "Report only" : f === "post_image" ? "LinkedIn collateral only" : "Report + LinkedIn collateral"}</option>
        ))}
      </select>

      <label style={{ display: "flex", alignItems: "center", gap: 9, margin: "14px 0 0", fontSize: 14, color: RT.ink2 }}>
        <input type="checkbox" checked={asCampaign} onChange={(e) => setAsCampaign(e.target.checked)} style={S.check} />
        Make this a recurring campaign
      </label>

      {asCampaign && (
        <>
          <div style={S.label}>Campaign name</div>
          <input value={campName} onChange={(e) => setCampName(e.target.value)} placeholder="e.g. Tuesday Teardown" style={S.input} />
          <div style={S.label}>Cadence</div>
          <select value={cadence} onChange={(e) => setCadence(e.target.value)} style={S.select}>
            {(catalog?.cadences ?? ["weekly", "biweekly", "monthly"]).map((c) => <option key={c} value={c}>{CADENCE_LABELS[c] ?? c}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 9, margin: "12px 0 0", fontSize: 14, color: RT.ink2 }}>
            <input type="checkbox" checked={runNow} onChange={(e) => setRunNow(e.target.checked)} style={S.check} />
            Run the first one now
          </label>
        </>
      )}

      <button type="button" disabled={!topic.trim() || busy} onClick={() => void submit()} style={{ ...S.cta, opacity: !topic.trim() || busy ? 0.5 : 1 }}>
        {busy ? "Starting…" : asCampaign ? "Create campaign" : "Run research"}
      </button>
      {usage && (
        <div style={{ fontSize: 12, color: RT.faint, marginTop: 8 }}>
          ${(usage.spentCents / 100).toFixed(2)} of ${(usage.capCents / 100).toFixed(0)} used this month.
        </div>
      )}
    </div>
  );
}

/* ─── run detail: trail · documents · review · manage ─────────────────── */

function RunDetail({ run, schedules, typeLabel, angleLabel, onShare, onRerun, onArchive, onDelete, onMove, onApproved, onNote }: {
  run: RunRow;
  schedules: ScheduleRow[];
  typeLabel: (k: string) => string;
  angleLabel: (k?: string | null) => string | null;
  onShare: () => void;
  onRerun: () => void;
  onArchive: (v: boolean) => void;
  onDelete: () => void;
  onMove: (sid: number | null) => void;
  onApproved: () => void;
  onNote: (kind: "ok" | "err", text: string) => void;
}) {
  const done = run.status === "complete";
  const failed = run.status === "failed";
  const running = !done && !failed;
  const [dl, setDl] = useState<string | null>(null);

  const grab = async (kind: "pdf" | "card" | "cardDark" | "lipdf" | "md") => {
    setDl(kind);
    const base = slug(run.report_title || run.topic);
    try {
      if (kind === "pdf") await dlBlob(`/research/runs/${run.id}/pdf?save=1`, `${base}.pdf`);
      else if (kind === "card") await dlBlob(`/research/runs/${run.id}/card.png?save=1`, `${base}-1pager.png`);
      else if (kind === "cardDark") await dlBlob(`/research/runs/${run.id}/card.png?save=1&variant=dark`, `${base}-1pager-dark.png`);
      else if (kind === "lipdf") await dlBlob(`/research/runs/${run.id}/linkedin.pdf?save=1`, `${base}-carousel.pdf`);
      else await dlBlob(`/research/runs/${run.id}/report.md`, `${base}.md`);
      if (kind !== "md") onNote("ok", "Downloaded — and filed in Collateral under its campaign.");
    } catch (e: any) {
      onNote("err", e?.message || "Download failed.");
    } finally {
      setDl(null);
    }
  };

  return (
    <>
      <div style={S.card}>
        <div style={S.cardTitle}>{run.report_title || run.topic}</div>
        <div style={S.meta}>
          {angleLabel(run.post_angle) ? `${angleLabel(run.post_angle)} · ` : ""}{typeLabel(run.research_type)} · {run.depth}
          {run.schedule_id != null ? " · campaign" : ""} · {timeAgo(run.created_at)}
          {done && run.usage?.searches != null ? ` · ${run.usage.searches} searches` : ""}
          {done && run.usage?.costCents != null ? ` · ~$${(run.usage.costCents / 100).toFixed(2)}` : ""}
        </div>
        {failed && run.error && <div style={S.errBox}>{run.error}</div>}
      </div>

      <ActivityTrail runId={run.id} running={running} />

      {done && (
        <div style={S.card}>
          <div style={S.cardTitle}>Documents</div>
          <div style={S.btnRow}>
            <button type="button" style={S.btn} onClick={() => void grab("pdf")}>{dl === "pdf" ? "…" : "Report PDF"}</button>
            {run.has_feed && <button type="button" style={S.btn} onClick={() => void grab("card")}>{dl === "card" ? "…" : "1-pager PNG"}</button>}
            {run.has_feed && <button type="button" style={S.btn} onClick={() => void grab("cardDark")}>{dl === "cardDark" ? "…" : "1-pager dark"}</button>}
            {run.has_feed && <button type="button" style={S.btn} onClick={() => void grab("lipdf")}>{dl === "lipdf" ? "…" : "Carousel PDF"}</button>}
            {run.has_feed && <button type="button" style={S.btnAccent} onClick={onShare}>Share post text</button>}
            <button type="button" style={{ ...S.btn, color: RT.muted }} onClick={() => void grab("md")}>{dl === "md" ? "…" : "Markdown"}</button>
          </div>
        </div>
      )}

      {done && run.has_feed && <ReviewCard run={run} onApproved={onApproved} onNote={onNote} />}

      <div style={S.card}>
        <div style={S.cardTitle}>Manage</div>
        {running ? (
          <div style={{ fontSize: 13, color: RT.muted }}>Available when the run finishes.</div>
        ) : (
          <>
            <div style={S.btnRow}>
              <button type="button" style={S.btn} onClick={onRerun}>Run again</button>
              <button type="button" style={S.btn} onClick={() => onArchive(!run.archived)}>{run.archived ? "Unarchive" : "Archive"}</button>
              <button type="button" style={{ ...S.btn, color: RT.muted }} onClick={onDelete}>Delete</button>
            </div>
            <div style={S.label}>Filed under</div>
            <select
              value={run.schedule_id ?? ""}
              onChange={(e) => onMove(e.target.value ? Number(e.target.value) : null)}
              style={S.select}
            >
              <option value="">One-off (no campaign)</option>
              {schedules.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}
      </div>
    </>
  );
}

/** Claude-style live trail — the "what is it doing right now" feed. */
function ActivityTrail({ runId, running }: { runId: number; running: boolean }) {
  const [acts, setActs] = useState<ActivityEntry[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () =>
      api<{ run: { activity?: ActivityEntry[] } }>(`/research/runs/${runId}`)
        .then((j) => { if (alive) setActs(j.run.activity ?? []); })
        .catch(() => {});
    void load();
    const t = running ? setInterval(load, 3000) : null;
    return () => { alive = false; if (t) clearInterval(t); };
  }, [runId, running]);

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>{running ? "Working now" : "What it did"}</div>
      {acts.length === 0 ? (
        <div style={{ fontSize: 13, color: RT.muted }}>{running ? "Starting up…" : "No trail recorded for this run."}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }} className="scr">
          {acts.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.5 }}>
              <span style={{ flex: "none", color: RT.faint, fontVariantNumeric: "tabular-nums" }}>
                {new Date(a.t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
              </span>
              <span style={{ color: a.kind === "error" ? RT.down : a.kind === "phase" || a.kind === "done" ? RT.ink : RT.ink2 }}>
                {a.kind === "search" ? "Searched — " : a.kind === "read" ? "Read — " : ""}{a.text}
              </span>
            </div>
          ))}
          {running && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: RT.muted }}><DotSpinner size={13} /> Working…</div>}
        </div>
      )}
    </div>
  );
}

/** Review & approve: edit the hooks, see the REAL 1-pager, approve. */
function ReviewCard({ run, onApproved, onNote }: { run: RunRow; onApproved: () => void; onNote: (k: "ok" | "err", t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [status, setStatus] = useState(run.review_status ?? "draft");
  const [busy, setBusy] = useState<string | null>(null);
  const [prevKey, setPrevKey] = useState(0);
  const [pvVariant, setPvVariant] = useState<"light" | "dark">("light");
  // Cover artwork pick (2026-07-20, Paul uploads Gemini images to Media and
  // points each run at one): undefined = untouched, null = "no artwork"
  // (the photo panel), number = that Media image.
  const [artId, setArtId] = useState<number | null | undefined>(undefined);
  const [artCands, setArtCands] = useState<{ id: number; label: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    api<{ feed: { hooks?: string[]; dataPoints?: any[]; artAssetId?: number | null } | null; reviewStatus?: string }>(`/research/runs/${run.id}/feed`)
      .then((j) => {
        setHooks((j.feed?.hooks ?? []).slice(0, 3));
        setDataPoints(j.feed?.dataPoints ?? []);
        setArtId(j.feed?.artAssetId === undefined ? undefined : j.feed.artAssetId);
        if (j.reviewStatus) setStatus(j.reviewStatus);
      })
      .catch(() => onNote("err", "Couldn’t load the draft."));
    api<{ assets: { id: number; label: string; kind?: string; mime: string }[] }>(`/studio/assets`)
      .then((j) => setArtCands(j.assets.filter((a) => a.kind !== "collateral" && a.mime.startsWith("image/")).map((a) => ({ id: a.id, label: a.label }))))
      .catch(() => {});
  }, [open, run.id, onNote]);

  const save = async () => {
    setBusy("save");
    try {
      // The server reads {feed: {...}} — the bare body this card used to
      // send was silently rejected ("Keep at least one hook").
      const feed: Record<string, unknown> = { hooks, dataPoints };
      if (artId !== undefined) feed.artAssetId = artId;
      await api(`/research/runs/${run.id}/feed`, { method: "PATCH", body: JSON.stringify({ feed }) });
      setStatus("draft");
      setPrevKey((k) => k + 1); // re-render the preview with the new hook
      onNote("ok", "Saved — the preview re-renders with your edits.");
    } catch (e: any) {
      onNote("err", e?.message || "Save failed.");
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    setBusy("approve");
    try {
      await api(`/research/runs/${run.id}/review`, { method: "POST", body: JSON.stringify({ status: "approved" }) });
      setStatus("approved");
      onNote("ok", "Approved — it's marked ready to post.");
      onApproved();
    } catch (e: any) {
      onNote("err", e?.message || "Approve failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={S.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ ...S.cardTitle, flex: 1, margin: 0 }}>Review & approve</div>
        <Pill text={status === "approved" ? "Approved" : "Draft"} bg={status === "approved" ? RT.accentSoft : RT.line} fg={status === "approved" ? RT.accentInk : RT.muted} />
      </div>
      {!open ? (
        <button type="button" style={{ ...S.cta, marginTop: 12 }} onClick={() => setOpen(true)}>Open the draft</button>
      ) : (
        <>
          <div style={S.label}>Hook — the card headline (first one runs)</div>
          {hooks.map((h, i) => (
            <input key={i} value={h} onChange={(e) => setHooks(hooks.map((x, j) => (j === i ? e.target.value : x)))} style={{ ...S.input, marginBottom: 6 }} />
          ))}
          {hooks.length === 0 && <div style={{ fontSize: 13, color: RT.muted }}>Loading the draft…</div>}
          <div style={S.label}>Cover artwork — tap the image this deck should use</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" as const }}>
            <button type="button" onClick={() => setArtId(null)}
              style={{ flex: "none", width: 64, height: 80, borderRadius: 10, border: artId === null ? `2px solid ${RT.accentInk}` : `1px solid ${RT.line}`, background: RT.page, fontSize: 11, color: RT.muted, fontFamily: "inherit" }}>
              None
            </button>
            {artCands.map((a) => (
              <button key={a.id} type="button" onClick={() => setArtId(a.id)} title={a.label}
                style={{ flex: "none", width: 64, height: 80, borderRadius: 10, overflow: "hidden", padding: 0, border: artId === a.id ? `2px solid ${RT.accentInk}` : `1px solid ${RT.line}`, background: RT.page }}>
                <AuthImg path={`/studio/assets/${a.id}/raw`} alt={a.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: RT.muted, marginTop: 2 }}>None = your photo fills the panel. Save to apply — the preview re-renders.</div>
          <button type="button" style={{ ...S.btn, marginTop: 8 }} disabled={busy != null}
            onClick={() => {
              setBusy("prompt");
              api<{ prompt: string }>(`/research/runs/${run.id}/artwork-prompt`)
                .then(async (j) => {
                  // Clipboard first; the share sheet is the fallback where
                  // iOS denies programmatic clipboard access.
                  try { await navigator.clipboard.writeText(j.prompt); onNote("ok", "Gemini prompt copied — paste it into the Gemini app."); }
                  catch { if (navigator.share) await navigator.share({ text: j.prompt }); else throw new Error("Copy failed"); }
                })
                .catch((e) => onNote("err", e?.message || "Couldn’t get the prompt."))
                .finally(() => setBusy(null));
            }}>
            {busy === "prompt" ? "…" : "Copy Gemini prompt"}
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={S.label}>1-pager preview</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["light", "dark"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setPvVariant(v)}
                  style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 12px", borderRadius: 999,
                    border: `1px solid ${pvVariant === v ? RT.accentInk : RT.line}`,
                    background: pvVariant === v ? RT.accentSoft : "transparent",
                    color: pvVariant === v ? RT.accentInk : RT.muted }}>
                  {v === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>
          <AuthImg path={`/research/runs/${run.id}/card.png?variant=${pvVariant}`} alt="1-pager preview" reloadKey={prevKey} />
          <div style={S.btnRow}>
            <button type="button" style={S.btn} disabled={busy != null} onClick={() => void save()}>{busy === "save" ? "Saving…" : "Save changes"}</button>
            <button type="button" style={S.btnAccent} disabled={busy != null || status === "approved"} onClick={() => void approve()}>
              {busy === "approve" ? "Approving…" : status === "approved" ? "Approved" : "Approve"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── campaign edit ────────────────────────────────────────── */

function CampaignEdit({ s, angles, cadences, onSave, onRunNow, onToggle, onArchive, onDelete }: {
  s: ScheduleRow;
  angles: { key: string; label: string }[];
  cadences: string[];
  onSave: (body: Record<string, unknown>) => void;
  onRunNow: () => void;
  onToggle: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(s.name);
  const [topic, setTopic] = useState(s.topic);
  const [angle, setAngle] = useState(s.post_angle ?? "auto");
  const [cadence, setCadence] = useState(s.cadence);
  const dirty = name !== s.name || topic !== s.topic || angle !== (s.post_angle ?? "auto") || cadence !== s.cadence;

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>Campaign</div>
      <div style={S.label}>Name</div>
      <input value={name} onChange={(e) => setName(e.target.value)} style={S.input} />
      <div style={S.label}>Standing mandate</div>
      <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} style={S.textarea} />
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={S.label}>Post format</div>
          <select value={angle} onChange={(e) => setAngle(e.target.value)} style={S.select}>
            <option value="auto">Auto</option>
            {angles.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={S.label}>Cadence</div>
          <select value={cadence} onChange={(e) => setCadence(e.target.value)} style={S.select}>
            {cadences.map((c) => <option key={c} value={c}>{CADENCE_LABELS[c] ?? c}</option>)}
          </select>
        </div>
      </div>
      {s.active && s.next_run_at && <div style={{ ...S.meta, marginTop: 10 }}>Next fire: {new Date(s.next_run_at).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>}
      <button type="button" style={{ ...S.cta, opacity: dirty ? 1 : 0.5 }} disabled={!dirty} onClick={() => onSave({ name: name.trim(), topic: topic.trim(), postAngle: angle, cadence })}>Save changes</button>
      <div style={{ ...S.btnRow, marginTop: 10 }}>
        <button type="button" style={S.btnAccent} onClick={onRunNow}>Run now</button>
        <button type="button" style={S.btn} onClick={onToggle}>{s.active ? "Pause" : "Resume"}</button>
        <button type="button" style={S.btn} onClick={onArchive}>{s.archived ? "Restore" : "Archive"}</button>
        <button type="button" style={{ ...S.btn, color: RT.muted }} onClick={onDelete}>Delete campaign</button>
      </div>
    </div>
  );
}

/* ─── performance detail ───────────────────────────────────── */

function PerfDetail({ a, onAnalyze, onDelete }: { a: AnalyticsRow; onAnalyze: () => void; onDelete: () => void }) {
  const [detail, setDetail] = useState<{ summary: any; analysis: string | null; analysis_status: string; analysis_error: string | null } | null>(null);
  const status = detail?.analysis_status ?? a.analysis_status;
  const running = status === "running" || a.analysis_status === "running";
  useEffect(() => {
    let alive = true;
    const load = () =>
      api<{ item: any }>(`/research/analytics/${a.id}`)
        .then((j) => { if (alive) setDetail(j.item); })
        .catch(() => {});
    void load();
    const t = running ? setInterval(load, 4000) : null;
    return () => { alive = false; if (t) clearInterval(t); };
  }, [a.id, running]);

  const s = detail?.summary ?? null;
  const stats: [string, number | null | undefined][] = [
    ["Impressions", s?.impressions],
    ["Members reached", s?.membersReached],
    ["Engagements", s?.totalEngagements],
    ["New followers", s?.newFollowers],
    ["Total followers", s?.totalFollowers],
  ];

  return (
    <>
      <div style={S.card}>
        <div style={S.cardTitle}>{a.label}</div>
        <div style={S.meta}>
          Imported {timeAgo(a.created_at)}
          {a.period_start && a.period_end ? ` · ${shortDate(a.period_start)} – ${shortDate(a.period_end)}` : ""}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          {stats.map(([label, v]) => (
            <div key={label} style={{ background: RT.page, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: RT.ink, fontVariantNumeric: "tabular-nums" }}>{nfmt(v)}</div>
              <div style={{ fontSize: 11.5, color: RT.muted, marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>
        {(s?.topByImpressions ?? []).slice(0, 3).map((p: any, i: number) => (
          <a key={i} href={p.url} target="_blank" rel="noreferrer" style={S.topPost}>
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.publishedAt ? shortDate(p.publishedAt) : "Post"} · {p.url.includes("groupPost") ? "group share" : "post"}
            </span>
            <span style={{ fontWeight: 700, color: RT.ink }}>{nfmt(p.impressions)}</span>
          </a>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Yulia’s read</div>
        {running ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: RT.ink2 }}>
            <DotSpinner size={14} /> Reading the week — under a minute.
          </div>
        ) : status === "failed" ? (
          <>
            <div style={S.errBox}>{detail?.analysis_error || a.analysis_error || "The analysis failed."}</div>
            <button type="button" style={{ ...S.cta, marginTop: 10 }} onClick={onAnalyze}>Try again</button>
          </>
        ) : detail?.analysis ? (
          <>
            <MarkdownBody md={detail.analysis} />
            <div style={S.btnRow}>
              <button type="button" style={S.btn} onClick={onAnalyze}>Re-analyze</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: RT.ink2, lineHeight: 1.55 }}>
              Yulia reads the real numbers against what Studio has been producing: what worked, what didn’t, who’s watching, and a per-slot plan for next week.
            </div>
            <button type="button" style={{ ...S.cta, marginTop: 10 }} onClick={onAnalyze}>Analyze with Yulia</button>
          </>
        )}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Manage</div>
        <div style={S.btnRow}>
          <button type="button" style={{ ...S.btn, color: RT.muted }} onClick={onDelete}>Delete import</button>
        </div>
      </div>
    </>
  );
}

/* ─── styles ───────────────────────────────────────────────── */

const S: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", gap: 10, padding: "10px 18px 4px", fontFamily: RT.font },
  back: { display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", fontFamily: RT.font, fontSize: 14, fontWeight: 700, color: RT.muted, padding: "4px 8px", margin: "0 -8px 0", alignSelf: "flex-start" },
  newBtn: { flex: "none", display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: RT.accent, color: RT.onAccent, borderRadius: RT.rPill, padding: "9px 16px", fontFamily: RT.font, fontSize: 14, fontWeight: 800, cursor: "pointer" },
  chips: { display: "flex", gap: 7, overflowX: "auto", padding: "2px 0 4px", WebkitOverflowScrolling: "touch" as any },
  chip: { flex: "none", border: "none", background: RT.card, color: RT.ink2, borderRadius: RT.rPill, padding: "8px 13px", fontFamily: RT.font, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
  chipOn: { background: RT.accentSoft, color: RT.accentInk, fontWeight: 700 },
  card: { background: RT.card, borderRadius: RT.rCard, padding: 16, fontFamily: RT.font },
  rowCard: { display: "block", width: "100%", textAlign: "left" as const, border: "none", background: RT.card, borderRadius: 14, padding: "13px 15px", fontFamily: RT.font, cursor: "pointer" },
  rowTitle: { flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: RT.ink, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" },
  cardTitle: { fontSize: 16, fontWeight: 800, color: RT.ink, letterSpacing: "-0.01em", marginBottom: 4 },
  meta: { fontSize: 12.5, color: RT.muted, lineHeight: 1.5 },
  label: { fontSize: 12, fontWeight: 700, color: RT.muted, margin: "13px 0 5px" },
  input: { width: "100%", boxSizing: "border-box" as const, height: 42, borderRadius: 11, border: "none", background: RT.page, padding: "0 12px", fontSize: 14.5, color: RT.ink, fontFamily: RT.font, outline: "none" },
  textarea: { width: "100%", boxSizing: "border-box" as const, borderRadius: 11, border: "none", background: RT.page, padding: "10px 12px", fontSize: 14.5, color: RT.ink, fontFamily: RT.font, outline: "none", resize: "vertical" as const, lineHeight: 1.5 },
  select: { width: "100%", boxSizing: "border-box" as const, height: 42, borderRadius: 11, border: "none", background: RT.page, padding: "0 10px", fontSize: 14, color: RT.ink, fontFamily: RT.font, outline: "none" },
  check: { width: 18, height: 18, accentColor: RT.accentStrong },
  cta: { width: "100%", marginTop: 14, height: 46, borderRadius: RT.rPill, border: "none", background: RT.accent, color: RT.onAccent, fontSize: 15, fontWeight: 800, fontFamily: RT.font, cursor: "pointer" },
  btnRow: { display: "flex", gap: 7, flexWrap: "wrap" as const, marginTop: 12 },
  btn: { border: "none", background: RT.page, color: RT.ink2, borderRadius: RT.rPill, padding: "9px 14px", fontFamily: RT.font, fontSize: 13.5, fontWeight: 700, cursor: "pointer" },
  btnAccent: { border: "none", background: RT.accentSoft, color: RT.accentInk, borderRadius: RT.rPill, padding: "9px 14px", fontFamily: RT.font, fontSize: 13.5, fontWeight: 800, cursor: "pointer" },
  note: { borderRadius: 12, padding: "10px 13px", fontSize: 13.5, fontWeight: 600, lineHeight: 1.45 },
  connBar: { borderRadius: 12, padding: "9px 13px", fontSize: 12.5, fontWeight: 600, background: "#FFF4E0", color: "#8A6A2B" },
  errBox: { borderRadius: 10, padding: "9px 12px", fontSize: 12.5, background: "#FBE4DE", color: RT.down, marginTop: 8, lineHeight: 1.5 },
  topPost: { display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 11, background: RT.page, fontSize: 13, color: RT.ink2, textDecoration: "none", marginTop: 8 },
};
