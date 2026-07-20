/**
 * Atlas — Studio / Research & campaigns (2026-07-15; format-first 2026-07-18).
 *
 * Paul's internal research agent control panel + LinkedIn campaign manager.
 * The form leads with POST FORMAT — the slots of his weekly posting plan, in
 * his exact vocabulary (Teardown · Contrarian Take · How Buyers Think ·
 * Practitioner Note · Human Thread · Hand-Raiser) — then TOPIC (free text).
 * The RESEARCH LENS (six report skeletons) auto-matches the chosen format
 * via FORMAT_LENS and stays overridable; DEPTH sets the search budget and
 * OUTPUT the artifact set. Any run can become a CAMPAIGN on a cadence
 * (weekly Sunday-night, biweekly, monthly). Runs execute server-side
 * (web-search-armed Claude, fully cited); artifacts download from here.
 *
 * Below the form sits the LIBRARY — a Finder-style browser (2026-07-18):
 * campaigns are folders in the sidebar, runs are documents in a columned
 * list, and the preview pane shows the selected run's artifacts, review
 * state, and its ACTIVITY TRAIL — the Claude-style live feed of what the
 * researcher is searching/reading right now (activity JSONB, 3s poll while
 * running; kept afterward as the run's "what it did" record).
 * Internal-only: practice-mode auth covers the routes.
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders, type User } from "../../../../hooks/useAuth";
import { T } from "../atlasTokens";
import { StudioAnnouncement, StudioPostCards } from "./StudioAnnouncement";

/* ─── API types ────────────────────────────────────────────── */

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
  progress: string | null;
  report_title: string | null;
  has_feed: boolean;
  review_status?: string;
  error: string | null;
  usage: { searches?: number; costCents?: number } | null;
  created_at: string;
  completed_at: string | null;
}
interface AssetRow {
  id: number;
  label: string;
  mime: string;
  kind: string; // 'photo' | 'collateral'
  run_id?: number | null;
  schedule_id?: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
  bytes: number;
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
  folder?: string | null;
  next_run_at: string | null;
}
interface AnalyticsRow {
  id: number;
  label: string;
  source: string;
  period_start: string | null;
  period_end: string | null;
  analysis_status: string; // none | running | complete | failed
  analysis_error: string | null;
  has_analysis: boolean;
  created_at: string;
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

/** Post format → the research lens that best feeds it. Applied when a format
 *  is picked, unless the user has overridden the lens by hand (their choice
 *  then sticks for the session). */
const FORMAT_LENS: Record<string, string> = {
  teardown: "vertical_scan",
  contrarian: "thesis_validation",
  how_buyers_think: "topic_brief",
  practitioner_note: "topic_brief",
  human_thread: "topic_brief",
  hand_raiser: "deal_monitor",
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
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // The knobs. `angle` is the POST FORMAT — the primary picker, named from
  // Paul's weekly posting plan; `typeKey` is the research lens behind it.
  const [angle, setAngle] = useState("auto");
  const [typeKey, setTypeKey] = useState("vertical_scan");
  const typeTouched = useRef(false); // manual lens override wins over FORMAT_LENS
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
  const [reviewId, setReviewId] = useState<number | null>(null); // review sheet
  const [sheet, setSheet] = useState<null | "collateral" | "import">(null); // slide-over sheets

  // Notes surface as a frame-level toast (the create form isn't always on
  // screen); they auto-dismiss.
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 7000);
    return () => clearTimeout(t);
  }, [note]);

  // When a load fails (a deploy restarting the server, a network blip) the
  // manager must SAY so and keep retrying — a silently empty library reads
  // as "nothing is happening" even while a run is executing server-side.
  const [connErr, setConnErr] = useState(false);
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
      setConnErr(true); // banner + fast retry below
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    api<Catalog>("/research/catalog").then(setCatalog).catch(() => {});
    void refresh();
  }, [refresh]);

  // Always-on poll: fast while a run is in flight or the last load failed,
  // slow but alive when idle (so the library can never go permanently stale).
  const inFlight = runs.some((r) => r.status === "queued" || r.status === "running")
    || analytics.some((a) => a.analysis_status === "running");
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    const t = setInterval(() => refreshRef.current(), inFlight || connErr ? 5000 : 30000);
    return () => clearInterval(t);
  }, [inFlight, connErr]);

  const typeLabel = useMemo(() => {
    const m = new Map((catalog?.types ?? []).map((t) => [t.key, t.label]));
    return (key: string) => m.get(key) ?? key;
  }, [catalog]);

  /** Format label for run/campaign rows — null for 'auto' (nothing to show). */
  const angleLabel = useMemo(() => {
    const m = new Map((catalog?.angles ?? []).map((a) => [a.key, a.label]));
    return (key?: string | null) => (key && key !== "auto" ? m.get(key) ?? null : null);
  }, [catalog]);

  const pickFormat = useCallback((key: string) => {
    setAngle(key);
    if (!typeTouched.current && FORMAT_LENS[key]) setTypeKey(FORMAT_LENS[key]);
  }, []);

  const submit = useCallback(async () => {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      if (asCampaign) {
        if (!campName.trim()) throw new Error("Give the campaign a name.");
        await api("/research/schedules", {
          method: "POST",
          body: JSON.stringify({ name: campName.trim(), researchType: typeKey, topic: topic.trim(), depth, outputFormat: output, postAngle: angle, cadence, runNow }),
        });
        // Be unmistakable about whether anything is actually running.
        setNote({
          kind: "ok",
          text: runNow
            ? "Campaign created — the first run is starting now. Its live trail appears in the library."
            : `Campaign created — NOTHING runs right now. The first run fires ${cadence === "monthly" ? "on the 1st, 13:00 UTC" : "Sunday night"}; tick “Run the first one now” to start one immediately.`,
        });
        setCampName("");
        setAsCampaign(false);
      } else {
        await api("/research/runs", {
          method: "POST",
          body: JSON.stringify({ researchType: typeKey, topic: topic.trim(), depth, outputFormat: output, postAngle: angle }),
        });
        setNote({ kind: "ok", text: "Run started — its live trail appears in the inspector in a few seconds." });
      }
      setTopic("");
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t start that." });
    } finally {
      setBusy(false);
    }
  }, [topic, busy, asCampaign, campName, typeKey, depth, output, angle, cadence, runNow, refresh]);

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

  /** Manager verbs — archive/unarchive and move between campaigns. */
  const patchRun = useCallback(async (r: RunRow, body: Record<string, unknown>, okText: string) => {
    try {
      await api(`/research/runs/${r.id}`, { method: "PATCH", body: JSON.stringify(body) });
      setNote({ kind: "ok", text: okText });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Update failed." });
    }
  }, [refresh]);
  const moveRun = useCallback((r: RunRow, scheduleId: number | null) =>
    patchRun(r, { scheduleId }, scheduleId != null ? "Filed under the campaign." : "Moved to one-off runs."), [patchRun]);
  const archiveRun = useCallback((r: RunRow, archived: boolean) =>
    patchRun(r, { archived }, archived ? "Archived — it's in the Archived folder." : "Restored from the archive."), [patchRun]);

  const deleteAsset = useCallback(async (a: AssetRow) => {
    if (!window.confirm(`Delete “${a.label}”? This can't be undone.`)) return;
    try {
      await api(`/studio/assets/${a.id}`, { method: "DELETE" });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Delete failed." });
    }
  }, [refresh]);

  const uploadPhoto = useCallback(async (f: File) => {
    const fd = new FormData();
    fd.append("file", f);
    fd.append("label", f.name.replace(/\.[a-z0-9]+$/i, ""));
    try {
      const r = await fetch("/api/studio/assets", { method: "POST", headers: authHeaders(), body: fd });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as any)?.error || `Upload failed (${r.status})`);
      }
      setNote({ kind: "ok", text: "Photo uploaded — it's in Media." });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Upload failed." });
    }
  }, [refresh]);

  const downloadAsset = useCallback(async (a: AssetRow) => {
    const ext = a.mime === "image/png" ? "png" : a.mime === "image/webp" ? "webp" : "jpg";
    try {
      await download(`/studio/assets/${a.id}/raw`, `${slugify(a.label)}.${ext}`);
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Download failed." });
    }
  }, []);

  /* ── Performance: LinkedIn analytics imports + Yulia's read ── */

  const uploadAnalytics = useCallback(async (f: File) => {
    const fd = new FormData();
    fd.append("workbook", f);
    try {
      const r = await fetch("/api/research/analytics", { method: "POST", headers: authHeaders(), body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((j as any)?.error || `Import failed (${r.status})`);
      setNote({ kind: "ok", text: "Analytics imported — open it and press “Analyze with Yulia”." });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Import failed." });
    }
  }, [refresh]);

  const analyzeAnalytics = useCallback(async (a: AnalyticsRow) => {
    try {
      await api(`/research/analytics/${a.id}/analyze`, { method: "POST" });
      setNote({ kind: "ok", text: "Yulia is reading the week — the analysis lands here in under a minute." });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t start the analysis." });
    }
  }, [refresh]);

  const deleteAnalytics = useCallback(async (a: AnalyticsRow) => {
    if (!window.confirm(`Delete “${a.label}” and its analysis?`)) return;
    try {
      await api(`/research/analytics/${a.id}`, { method: "DELETE" });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Delete failed." });
    }
  }, [refresh]);

  /** Edit/organize a campaign (rename, mandate, format, cadence, archive). */
  const patchSchedule = useCallback(async (s: ScheduleRow, body: Record<string, unknown>, okText: string) => {
    try {
      await api(`/research/schedules/${s.id}`, { method: "PATCH", body: JSON.stringify(body) });
      setNote({ kind: "ok", text: okText });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Update failed." });
    }
  }, [refresh]);

  /** Fire a campaign immediately, outside its cadence ("Run now"). */
  const runCampaignNow = useCallback(async (s: ScheduleRow) => {
    try {
      await api("/research/runs", {
        method: "POST",
        body: JSON.stringify({ researchType: s.research_type, topic: s.topic, depth: s.depth, outputFormat: s.output_format, postAngle: s.post_angle ?? "auto", scheduleId: s.id }),
      });
      setNote({ kind: "ok", text: `“${s.name}” is running now — the live trail is in the inspector.` });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t start the run." });
    }
  }, [refresh]);

  /** Drag-to-file: move a collateral piece under a campaign (or out). */
  const moveAsset = useCallback(async (a: AssetRow, scheduleId: number | null) => {
    try {
      await api(`/studio/assets/${a.id}`, { method: "PATCH", body: JSON.stringify({ scheduleId }) });
      setNote({ kind: "ok", text: scheduleId != null ? "Collateral filed under the campaign." : "Collateral removed from its campaign." });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Move failed." });
    }
  }, [refresh]);

  /** Promote a one-off run into a campaign and file the run under it. */
  const makeCampaignFromRun = useCallback(async (r: RunRow) => {
    const name = window.prompt("Name the campaign:", (r.report_title || r.topic).slice(0, 60));
    if (!name || !name.trim()) return;
    try {
      const j = await api<{ schedule: { id: number } }>("/research/schedules", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), researchType: r.research_type, topic: r.topic, depth: r.depth, outputFormat: r.output_format, postAngle: r.post_angle ?? "auto", cadence: "weekly", runNow: false }),
      });
      await api(`/research/runs/${r.id}`, { method: "PATCH", body: JSON.stringify({ scheduleId: j.schedule.id }) });
      setNote({ kind: "ok", text: `Campaign “${name.trim()}” created — this run is filed under it; next fire Sunday night.` });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t create the campaign." });
    }
  }, [refresh]);

  /** One-click restart of a failed (or any) run — same knobs, new run. */
  const rerunRun = useCallback(async (r: RunRow) => {
    try {
      await api("/research/runs", {
        method: "POST",
        body: JSON.stringify({ researchType: r.research_type, topic: r.topic, depth: r.depth, outputFormat: r.output_format, postAngle: r.post_angle ?? "auto" }),
      });
      setNote({ kind: "ok", text: "Run restarted — watch it work in the library." });
      void refresh();
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Couldn’t restart the run." });
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
      // Exports both download AND file themselves into the Collateral
      // folder, linked to the run's campaign (save=1). The note names the
      // exact file so a click is always traceable to what landed on disk.
      const [url, file] =
        kind === "pdf" ? [`/research/runs/${r.id}/pdf?save=1`, `smbx-research-${base}.pdf`]
        : kind === "card" ? [`/research/runs/${r.id}/card.png?save=1`, `smbx-onepager-${base}.png`]
        : kind === "lipdf" ? [`/research/runs/${r.id}/linkedin.pdf?save=1`, `smbx-linkedin-${base}.pdf`]
        : [`/research/runs/${r.id}/md`, `smbx-research-${base}.md`];
      await download(url, file);
      if (kind !== "md") {
        setNote({ kind: "ok", text: `Exported ${file} — downloaded, and filed in Collateral under its campaign.` });
        void refresh();
      }
    } catch (e: any) {
      setNote({ kind: "err", text: e?.message || "Download failed." });
    } finally {
      setDl(null);
    }
  }, [refresh]);

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
  const reviewRun = runs.find((r) => r.id === reviewId) ?? null;

  // ── the creation form — lives in the manager's inspector pane ──
  const createForm = (
      <div style={R.form}>
        <div>
          <span style={R.knobLabel}>Post format — your slot in the posting week</span>
          <div style={{ ...R.segRow, marginTop: 8, flexWrap: "wrap" }}>
            {(catalog?.angles ?? []).map((a) => (
              <button key={a.key} type="button" title={a.blurb} onClick={() => pickFormat(a.key)} style={{ ...R.seg, ...(angle === a.key ? R.segOn : null) }}>
                {a.label}
              </button>
            ))}
          </div>
          <span style={{ ...R.knobHint, display: "block", marginTop: 6 }}>{(catalog?.angles ?? []).find((a) => a.key === angle)?.blurb ?? ""}</span>
        </div>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="The topic — e.g. “Independent fire & life safety contractors in Texas: who operates, who is acquiring, and whether the lane is worth a buy-side push.”"
          rows={3}
          style={R.topic}
        />

        <div style={{ ...R.knobRow, marginTop: 16 }}>
          <label style={R.knob}>
            <span style={R.knobLabel}>Research lens — follows the format unless you change it</span>
            <select value={typeKey} onChange={(e) => { typeTouched.current = true; setTypeKey(e.target.value); }} style={R.select}>
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
        </div>

        <div style={{ marginTop: 16 }}>
          <span style={R.knobLabel}>Output</span>
          <div style={R.outGrid}>
            {([
              ["post_image", "LinkedIn 1-pager", "One branded 1080×1350 image + post text."],
              ["post_pdf", "LinkedIn carousel", "Pages stitched into a swipeable PDF + post text."],
              ["report", "Report PDF", "Cited letter report for internal use."],
              ["both", "Everything", "The report plus both LinkedIn formats."],
            ] as const).map(([k, label, blurb]) => (
              <button key={k} type="button" onClick={() => setOutput(k)} style={{ ...R.outCard, ...(output === k ? R.outCardOn : null) }}>
                <span style={{ ...R.outCardTitle, color: output === k ? T.blue : T.ink }}>{label}</span>
                <span style={R.outCardBlurb}>{blurb}</span>
              </button>
            ))}
          </div>
        </div>

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

  );

  // ── the canvas app: the manager owns the whole content area ──
  return (
    <div style={A.frame}>
      <Library
        loaded={loaded}
        connErr={connErr}
        runs={runs}
        schedules={schedules}
        assets={assets}
        typeLabel={typeLabel}
        angleLabel={angleLabel}
        dl={dl}
        reviewId={reviewId}
        createForm={createForm}
        angles={catalog?.angles ?? []}
        onReview={(id) => setReviewId(reviewId === id ? null : id)}
        onGrab={grab}
        onCopyPost={copyPost}
        onRerunRun={rerunRun}
        onMoveRun={moveRun}
        onMoveAsset={moveAsset}
        onMakeCampaign={makeCampaignFromRun}
        onArchiveRun={archiveRun}
        onDeleteRun={deleteRun}
        onRunCampaignNow={runCampaignNow}
        onPatchSchedule={patchSchedule}
        onToggleSchedule={toggleSchedule}
        onDeleteSchedule={deleteSchedule}
        onDeleteAsset={deleteAsset}
        onDownloadAsset={downloadAsset}
        onUploadPhoto={uploadPhoto}
        onNewCard={() => setSheet("collateral")}
        onImportPlan={() => setSheet("import")}
        analytics={analytics}
        onUploadAnalytics={uploadAnalytics}
        onAnalyzeAnalytics={analyzeAnalytics}
        onDeleteAnalytics={deleteAnalytics}
      />

      {sheet === "collateral" && (
        <Sheet title="Media & collateral studio" onClose={() => { setSheet(null); void refresh(); }}>
          <StudioAnnouncement />
          <StudioPostCards />
        </Sheet>
      )}
      {note && (
        <div style={{ ...A.toast, color: note.kind === "err" ? "#B3261E" : "#0F4E3C" }}>{note.text}</div>
      )}

      {sheet === "import" && (
        <Sheet title="Import a campaign plan" onClose={() => setSheet(null)}>
          <ImportPlanSheet
            catalog={catalog}
            onDone={(n) => {
              setSheet(null);
              setNote({ kind: "ok", text: `${n} campaign${n === 1 ? "" : "s"} created from the plan — they're in the sidebar. Use Run now on any of them to fire the first run immediately.` });
              void refresh();
            }}
          />
        </Sheet>
      )}
      {reviewRun && (
        <Sheet title="Review & approve" onClose={() => setReviewId(null)}>
          <ReviewPanel
            run={reviewRun}
            onStatus={() => void refresh()}
            onCopyPost={() => copyPost(reviewRun)}
            onGrab={(kind) => grab(reviewRun, kind)}
          />
        </Sheet>
      )}
    </div>
  );
}

/** Right-side slide-over inside the app frame (absolute, never fixed —
 *  the Safari toolbar rule). Hosts the composers and the review panel. */
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={A.sheetWrap}>
      <div style={A.scrim} onClick={onClose} />
      <div style={A.sheet}>
        <div style={A.sheetHead}>
          <div style={A.sheetTitle}>{title}</div>
          <button type="button" style={A.sheetClose} onClick={onClose}>Close</button>
        </div>
        <div style={A.sheetBody}>{children}</div>
      </div>
    </div>
  );
}


/* ─── Library — Finder-style: campaigns are folders, runs are documents ───
   Sidebar (folders) · file list (runs, with columns) · preview pane (the
   selected run's documents, review state, and its live activity trail —
   the Claude-style "what is it doing right now" feed). */

type FolderSel =
  | { kind: "all" }
  | { kind: "oneoff" }
  | { kind: "archived" }
  | { kind: "camp"; id: number }
  | { kind: "media" }
  | { kind: "collateral" }
  | { kind: "perf" };

const ASSET_FOLDER = (s: FolderSel) => s.kind === "media" || s.kind === "collateral";

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtBytes(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

function FolderGlyph({ c }: { c: string }) {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" aria-hidden style={{ flex: "none" }}>
      <path d="M1 2.4C1 1.63 1.63 1 2.4 1h3.3l1.5 1.7h5.4c.77 0 1.4.63 1.4 1.4v6.5c0 .77-.63 1.4-1.4 1.4H2.4A1.4 1.4 0 0 1 1 10.6V2.4Z" fill={c} opacity="0.9" />
    </svg>
  );
}

function DocGlyph({ c }: { c: string }) {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden style={{ flex: "none" }}>
      <path d="M1 2c0-.55.45-1 1-1h5.5L11 4.5V12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2Z" fill="none" stroke={c} strokeWidth="1.3" />
      <path d="M7.5 1v3.5H11" fill="none" stroke={c} strokeWidth="1.3" />
    </svg>
  );
}

const clampW = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

/** Measure the widest label at the sidebar's font so auto-fit is exact. */
function widestLabel(labels: string[], font: string): number {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  let w = 0;
  for (const l of labels) w = Math.max(w, ctx.measureText(l).width);
  return Math.ceil(w);
}

/* ── Drag & drop: rows carry {t, id}; folders accept them. ── */
type DragPayload = { t: "run" | "asset" | "camp"; id: number };

function setDrag(e: React.DragEvent, t: DragPayload["t"], id: number) {
  e.dataTransfer.setData("application/json", JSON.stringify({ t, id }));
  e.dataTransfer.effectAllowed = "move";
}
function readDrag(e: React.DragEvent): DragPayload | null {
  try {
    const j = JSON.parse(e.dataTransfer.getData("application/json"));
    return j && typeof j.id === "number" && typeof j.t === "string" ? j : null;
  } catch {
    return null;
  }
}

/** Finder-style pane divider: drag to resize, double-click to auto-fit. */
function PaneDivider({ onDrag, onAuto }: { onDrag: (dx: number) => void; onAuto?: () => void }) {
  const [hot, setHot] = useState(false);
  return (
    <div
      style={{ ...F.divider, background: hot ? "rgba(11,87,208,0.30)" : "transparent" }}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
      title="Drag to resize · double-click to fit"
      onDoubleClick={onAuto}
      onPointerDown={(e) => {
        e.preventDefault();
        let last = e.clientX;
        const move = (ev: PointerEvent) => { onDrag(ev.clientX - last); last = ev.clientX; };
        const stop = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", stop);
          window.removeEventListener("pointercancel", stop);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
      }}
    />
  );
}

function SideRow({ label, count, on, onClick, tint, dim, indent, dragStart, onDropPayload }: {
  label: string; count: number; on: boolean; onClick: () => void; tint: string; dim?: boolean;
  indent?: boolean;
  /** Makes the folder row itself draggable (campaigns → groups). */
  dragStart?: (e: React.DragEvent) => void;
  /** Makes the folder a drop target for run/asset/campaign payloads. */
  onDropPayload?: (p: DragPayload) => void;
}) {
  const [hot, setHot] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      draggable={!!dragStart}
      onDragStart={dragStart}
      onDragOver={onDropPayload ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setHot(true); } : undefined}
      onDragLeave={onDropPayload ? () => setHot(false) : undefined}
      onDrop={onDropPayload ? (e) => { e.preventDefault(); setHot(false); const p = readDrag(e); if (p) onDropPayload(p); } : undefined}
      style={{ ...F.sideRow, ...(on ? F.sideRowOn : null), ...(hot ? F.sideRowHot : null), opacity: dim ? 0.62 : 1, ...(indent ? { paddingLeft: 20 } : null) }}
    >
      <FolderGlyph c={on ? T.blue : tint} />
      <span style={{ ...F.sideLabel, color: on ? T.blue : T.ink }}>{label}</span>
      <span style={F.sideCount}>{count}</span>
    </button>
  );
}

/** A group header in the campaigns section — a drop target for campaigns. */
function GroupHead({ label, onDropCampaign, action }: { label: string; onDropCampaign: (campId: number) => void; action?: React.ReactNode }) {
  const [hot, setHot] = useState(false);
  return (
    <div
      style={{ ...F.sideHead, marginTop: 14, display: "flex", alignItems: "center", gap: 6, borderRadius: 6, ...(hot ? F.sideRowHot : null) }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setHot(true); }}
      onDragLeave={() => setHot(false)}
      onDrop={(e) => { e.preventDefault(); setHot(false); const p = readDrag(e); if (p && p.t === "camp") onDropCampaign(p.id); }}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {action}
    </div>
  );
}

function Library({ loaded, connErr, runs, schedules, assets, analytics, typeLabel, angleLabel, dl, reviewId, createForm, angles, onReview, onGrab, onCopyPost, onRerunRun, onMoveRun, onMoveAsset, onMakeCampaign, onArchiveRun, onDeleteRun, onRunCampaignNow, onPatchSchedule, onToggleSchedule, onDeleteSchedule, onDeleteAsset, onDownloadAsset, onUploadPhoto, onNewCard, onImportPlan, onUploadAnalytics, onAnalyzeAnalytics, onDeleteAnalytics }: {
  loaded: boolean;
  connErr: boolean;
  runs: RunRow[];
  schedules: ScheduleRow[];
  assets: AssetRow[];
  typeLabel: (k: string) => string;
  angleLabel: (k?: string | null) => string | null;
  dl: string | null;
  reviewId: number | null;
  createForm: React.ReactNode;
  angles: { key: string; label: string; blurb?: string }[];
  onReview: (id: number) => void;
  onGrab: (r: RunRow, kind: "pdf" | "card" | "md" | "lipdf") => void;
  onCopyPost: (r: RunRow) => void;
  onRerunRun: (r: RunRow) => void;
  onMoveRun: (r: RunRow, scheduleId: number | null) => void;
  onMoveAsset: (a: AssetRow, scheduleId: number | null) => void;
  onMakeCampaign: (r: RunRow) => void;
  onArchiveRun: (r: RunRow, archived: boolean) => void;
  onDeleteRun: (r: RunRow) => void;
  onRunCampaignNow: (s: ScheduleRow) => void;
  onPatchSchedule: (s: ScheduleRow, body: Record<string, unknown>, okText: string) => void;
  onToggleSchedule: (s: ScheduleRow) => void;
  onDeleteSchedule: (s: ScheduleRow) => void;
  onDeleteAsset: (a: AssetRow) => void;
  onDownloadAsset: (a: AssetRow) => void;
  onUploadPhoto: (f: File) => void;
  onNewCard: () => void;
  onImportPlan: () => void;
  analytics: AnalyticsRow[];
  onUploadAnalytics: (f: File) => void;
  onAnalyzeAnalytics: (a: AnalyticsRow) => void;
  onDeleteAnalytics: (a: AnalyticsRow) => void;
}) {
  const [sel, setSel] = useState<FolderSel>({ kind: "all" });
  const [selRunId, setSelRunId] = useState<number | null>(null);
  const [selAssetId, setSelAssetId] = useState<number | null>(null);
  const [selPerfId, setSelPerfId] = useState<number | null>(null);
  // The inspector shows the CREATE form, the selected item, or — when a
  // campaign folder is picked — the CAMPAIGN itself (rename, mandate,
  // cadence, archive, delete). That's where campaigns are managed.
  const [insp, setInsp] = useState<"create" | "item" | "camp">("item");
  const [filter, setFilter] = useState("");
  const lastAutoRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const perfFileRef = useRef<HTMLInputElement | null>(null);

  // Resizable panes (drag the dividers; double-click to fit). Widths persist.
  const [sideW, setSideW] = useState<number>(() => {
    const v = Number(localStorage.getItem("smbx_mgr_sidew"));
    return Number.isFinite(v) && v >= 150 ? clampW(v, 150, 380) : 0; // 0 = auto-fit once data arrives
  });
  const [prevW, setPrevW] = useState<number>(() => {
    const v = Number(localStorage.getItem("smbx_mgr_prevw"));
    return Number.isFinite(v) && v >= 280 ? clampW(v, 280, 680) : 400;
  });
  useEffect(() => {
    if (sideW > 0) localStorage.setItem("smbx_mgr_sidew", String(sideW));
  }, [sideW]);
  useEffect(() => { localStorage.setItem("smbx_mgr_prevw", String(prevW)); }, [prevW]);

  /** Fit the sidebar to the longest folder name (glyph + gaps + count + pads ≈ 86px). */
  const autoFitSide = useCallback(() => {
    const labels = ["All research", "One-off runs", "Archived", "Media", "Collateral", "LinkedIn analytics", "+ New research", ...schedules.map((s) => s.name)];
    const w = widestLabel(labels, `600 12.5px ${T.font}`);
    if (w > 0) setSideW(clampW(w + 86, 150, 380));
  }, [schedules]);

  // First load with no saved width: auto-size to the campaign names.
  const autoFitDoneRef = useRef(false);
  useEffect(() => {
    if (sideW > 0 || autoFitDoneRef.current || !loaded) return;
    autoFitDoneRef.current = true;
    autoFitSide();
  }, [sideW, loaded, autoFitSide]);
  const effSideW = sideW > 0 ? sideW : 176;

  // Archived runs leave the working folders; they live in their own folder.
  const activeRuns = useMemo(() => runs.filter((r) => !r.archived), [runs]);
  const archivedRuns = useMemo(() => runs.filter((r) => r.archived), [runs]);
  const oneoffs = useMemo(() => activeRuns.filter((r) => r.schedule_id == null), [activeRuns]);
  const byCamp = useMemo(() => {
    const m = new Map<number, RunRow[]>();
    for (const r of activeRuns) {
      if (r.schedule_id == null) continue;
      const a = m.get(r.schedule_id) ?? [];
      a.push(r);
      m.set(r.schedule_id, a);
    }
    return m;
  }, [activeRuns]);
  const photos = useMemo(() => assets.filter((a) => a.kind !== "collateral"), [assets]);
  const collateral = useMemo(() => assets.filter((a) => a.kind === "collateral"), [assets]);

  const q = filter.trim().toLowerCase();
  const assetMode = ASSET_FOLDER(sel);
  const folderRuns =
    sel.kind === "all" ? activeRuns
    : sel.kind === "oneoff" ? oneoffs
    : sel.kind === "archived" ? archivedRuns
    : sel.kind === "camp" ? (byCamp.get(sel.id) ?? [])
    : [];
  const items = q ? folderRuns.filter((r) => `${r.report_title ?? ""} ${r.topic}`.toLowerCase().includes(q)) : folderRuns;
  const folderAssets = sel.kind === "media" ? photos : sel.kind === "collateral" ? collateral : [];
  const assetItems = q ? folderAssets.filter((a) => a.label.toLowerCase().includes(q)) : folderAssets;
  // A campaign's exported collateral lists inside its folder, after the runs.
  const campAssetsAll = sel.kind === "camp" ? collateral.filter((a) => a.schedule_id === sel.id) : [];
  const campAssets = q ? campAssetsAll.filter((a) => a.label.toLowerCase().includes(q)) : campAssetsAll;
  const assetPool = assetMode ? assetItems : campAssets;
  const perfMode = sel.kind === "perf";
  const perfItems = perfMode ? (q ? analytics.filter((a) => a.label.toLowerCase().includes(q)) : analytics) : [];

  // A freshly started run selects itself so its live trail is on screen
  // immediately — once per run, so a later manual selection sticks.
  useEffect(() => {
    const newest = runs[0];
    if (newest && (newest.status === "queued" || newest.status === "running") && lastAutoRef.current !== newest.id) {
      lastAutoRef.current = newest.id;
      setSel(newest.schedule_id != null ? { kind: "camp", id: newest.schedule_id } : { kind: "all" });
      setSelRunId(newest.id);
      setSelAssetId(null);
      setInsp("item"); // flip the inspector to the live trail
    }
  }, [runs]);

  // Keep the selection inside the visible set (per mode).
  useEffect(() => {
    if (perfMode) {
      if (selPerfId != null && perfItems.some((a) => a.id === selPerfId)) return;
      const next = perfItems[0]?.id ?? null;
      if (next !== selPerfId) setSelPerfId(next);
      return;
    }
    if (assetMode) {
      if (selAssetId != null && assetItems.some((a) => a.id === selAssetId)) return;
      const next = assetItems[0]?.id ?? null;
      if (next !== selAssetId) setSelAssetId(next);
      return;
    }
    // A collateral row selected inside a campaign folder holds the pane.
    if (selAssetId != null && campAssets.some((a) => a.id === selAssetId)) return;
    if (selRunId != null && items.some((r) => r.id === selRunId)) return;
    const next = items[0]?.id ?? null;
    if (next !== selRunId) setSelRunId(next);
  }, [assetMode, perfMode, items, selRunId, assetItems, campAssets, selAssetId, perfItems, selPerfId]);

  const selRun = selRunId != null ? items.find((r) => r.id === selRunId) ?? null : null;
  const selAsset = assetPool.find((a) => a.id === selAssetId) ?? null;
  const selCamp = sel.kind === "camp" ? schedules.find((s) => s.id === sel.id) ?? null : null;
  const selPerf = perfMode ? perfItems.find((a) => a.id === selPerfId) ?? null : null;

  // ── drag & drop routing ──
  const [pendingGroups, setPendingGroups] = useState<string[]>([]);
  const groupNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of schedules) if (!s.archived && s.folder) names.add(s.folder);
    for (const g of pendingGroups) names.add(g);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [schedules, pendingGroups]);

  const dropOnCampaign = (sid: number) => (p: DragPayload) => {
    if (p.t === "run") {
      const r = runs.find((x) => x.id === p.id);
      if (r && r.schedule_id !== sid) onMoveRun(r, sid);
    } else if (p.t === "asset") {
      const a = assets.find((x) => x.id === p.id);
      if (a && a.kind === "collateral" && a.schedule_id !== sid) onMoveAsset(a, sid);
    }
  };
  const dropUnfile = (p: DragPayload) => {
    if (p.t === "run") {
      const r = runs.find((x) => x.id === p.id);
      if (r && r.schedule_id != null) onMoveRun(r, null);
    } else if (p.t === "asset") {
      const a = assets.find((x) => x.id === p.id);
      if (a && a.kind === "collateral" && a.schedule_id != null) onMoveAsset(a, null);
    }
  };
  const dropOnArchived = (p: DragPayload) => {
    if (p.t === "run") {
      const r = runs.find((x) => x.id === p.id);
      if (r && !r.archived) onArchiveRun(r, true);
    }
  };
  const dropCampaignToGroup = (folder: string | null) => (campId: number) => {
    const s = schedules.find((x) => x.id === campId);
    if (s && (s.folder ?? null) !== folder) {
      onPatchSchedule(s, { folder }, folder ? `Moved “${s.name}” into “${folder}”.` : `Moved “${s.name}” out of its group.`);
    }
  };

  return (
    <div style={F.wrap}>
      {/* folders */}
      <div style={{ ...F.side, width: effSideW }}>
        <button type="button" style={{ ...F.newBtn, ...(insp === "create" ? F.newBtnOn : null) }} onClick={() => setInsp("create")}>
          + New research
        </button>
        <button type="button" style={F.importBtn} onClick={onImportPlan}>Import a plan</button>
        <div style={F.sideHead}>Library</div>
        <SideRow label="All research" count={activeRuns.length} on={sel.kind === "all"} onClick={() => setSel({ kind: "all" })} tint="#6E9BE0" />
        <SideRow label="One-off runs" count={oneoffs.length} on={sel.kind === "oneoff"} onClick={() => setSel({ kind: "oneoff" })} tint="#A8AEB8" onDropPayload={dropUnfile} />
        <SideRow label="Archived" count={archivedRuns.length} on={sel.kind === "archived"} onClick={() => setSel({ kind: "archived" })} tint="#C9CDD3" onDropPayload={dropOnArchived} />
        {(schedules.some((s) => !s.archived) || groupNames.length > 0) && (
          <GroupHead
            label="Campaigns"
            onDropCampaign={dropCampaignToGroup(null)}
            action={
              <button
                type="button"
                style={F.groupAdd}
                title="New group — then drag campaigns into it"
                onClick={() => {
                  const name = window.prompt("Name the campaign group:")?.trim();
                  if (name) setPendingGroups((g) => (g.includes(name) ? g : [...g, name]));
                }}
              >
                + Group
              </button>
            }
          />
        )}
        {schedules.filter((s) => !s.archived && !s.folder).map((s) => (
          <SideRow
            key={s.id}
            label={s.name}
            count={(byCamp.get(s.id) ?? []).length}
            on={sel.kind === "camp" && sel.id === s.id}
            onClick={() => { setSel({ kind: "camp", id: s.id }); setInsp("camp"); }}
            tint={s.active ? "#63B98F" : "#A8AEB8"}
            dim={!s.active}
            dragStart={(e) => setDrag(e, "camp", s.id)}
            onDropPayload={dropOnCampaign(s.id)}
          />
        ))}
        {groupNames.map((g) => {
          const members = schedules.filter((s) => !s.archived && s.folder === g);
          return (
            <Fragment key={g}>
              <GroupHead label={g} onDropCampaign={dropCampaignToGroup(g)} />
              {members.length === 0 && <div style={F.groupEmpty}>Drag campaigns here</div>}
              {members.map((s) => (
                <SideRow
                  key={s.id}
                  label={s.name}
                  count={(byCamp.get(s.id) ?? []).length}
                  on={sel.kind === "camp" && sel.id === s.id}
                  onClick={() => { setSel({ kind: "camp", id: s.id }); setInsp("camp"); }}
                  tint={s.active ? "#63B98F" : "#A8AEB8"}
                  dim={!s.active}
                  indent
                  dragStart={(e) => setDrag(e, "camp", s.id)}
                  onDropPayload={dropOnCampaign(s.id)}
                />
              ))}
            </Fragment>
          );
        })}
        {schedules.some((s) => s.archived) && <div style={{ ...F.sideHead, marginTop: 14 }}>Archived campaigns</div>}
        {schedules.filter((s) => s.archived).map((s) => (
          <SideRow
            key={s.id}
            label={s.name}
            count={(byCamp.get(s.id) ?? []).length}
            on={sel.kind === "camp" && sel.id === s.id}
            onClick={() => { setSel({ kind: "camp", id: s.id }); setInsp("camp"); }}
            tint="#C9CDD3"
            dim
          />
        ))}
        <div style={{ ...F.sideHead, marginTop: 14 }}>Assets</div>
        <SideRow label="Media" count={photos.length} on={sel.kind === "media"} onClick={() => setSel({ kind: "media" })} tint="#D9A441" />
        <SideRow label="Collateral" count={collateral.length} on={sel.kind === "collateral"} onClick={() => setSel({ kind: "collateral" })} tint="#8B7BD8" onDropPayload={dropUnfile} />
        <div style={{ ...F.sideHead, marginTop: 14 }}>Performance</div>
        <SideRow label="LinkedIn analytics" count={analytics.length} on={sel.kind === "perf"} onClick={() => setSel({ kind: "perf" })} tint="#4F9ED9" />
      </div>

      <PaneDivider onDrag={(dx) => setSideW((w) => clampW((w > 0 ? w : effSideW) + dx, 150, 380))} onAuto={autoFitSide} />

      {/* file list */}
      <div style={F.main}>
        {connErr && (
          <div style={F.connBar}>Can’t reach the server right now — retrying every few seconds. Runs in flight keep executing server-side.</div>
        )}
        {selCamp && (
          <div style={F.campBar}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={F.campName}>{selCamp.name}{selCamp.active ? "" : " · paused"}</div>
              <div style={F.campMeta}>
                {angleLabel(selCamp.post_angle) ? `${angleLabel(selCamp.post_angle)} · ` : ""}{typeLabel(selCamp.research_type)} · {CADENCE_LABELS[selCamp.cadence] ?? selCamp.cadence}
                {selCamp.active && selCamp.next_run_at ? ` · next ${new Date(selCamp.next_run_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : ""}
              </div>
            </div>
            <button type="button" style={{ ...R.tinyBtn, background: T.blue, color: "#fff", borderColor: T.blue, fontWeight: 700 }} onClick={() => onRunCampaignNow(selCamp)}>Run now</button>
            <button type="button" style={R.tinyBtn} onClick={() => setInsp("camp")}>Manage</button>
          </div>
        )}
        <div style={F.listHead}>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…" style={F.filter} />
          {sel.kind === "media" && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadPhoto(f); e.currentTarget.value = ""; }}
              />
              <button type="button" style={F.toolBtn} onClick={() => fileRef.current?.click()}>Upload photo</button>
              <button type="button" style={{ ...F.toolBtn, color: T.ink3 }} onClick={onNewCard}>Focal points</button>
            </>
          )}
          {sel.kind === "collateral" && (
            <button type="button" style={F.toolBtn} onClick={onNewCard}>New card</button>
          )}
          {perfMode && (
            <>
              <input
                ref={perfFileRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadAnalytics(f); e.currentTarget.value = ""; }}
              />
              <button type="button" style={F.toolBtn} onClick={() => perfFileRef.current?.click()}>Import LinkedIn export</button>
            </>
          )}
        </div>
        <div style={F.cols}>
          <span style={{ flex: 1 }}>Name</span>
          <span style={{ width: 104, flex: "none" }}>{perfMode ? "Period" : assetMode ? "Type" : "Format"}</span>
          <span style={{ width: 66, flex: "none" }}>{assetMode ? "Size" : "Status"}</span>
          <span style={{ width: 48, flex: "none", textAlign: "right" }}>Date</span>
        </div>
        <div style={F.rows}>
          {!loaded && <div style={F.emptyList}>Loading…</div>}
          {loaded && perfMode && perfItems.length === 0 && (
            <div style={F.emptyList}>{q ? "Nothing matches the filter." : "No analytics yet — export the .xlsx from LinkedIn (Analytics → Post impressions → Export) and import it here."}</div>
          )}
          {loaded && !perfMode && assetMode && assetItems.length === 0 && (
            <div style={F.emptyList}>{q ? "Nothing matches the filter." : sel.kind === "media" ? "No photos yet — upload below in Media." : "No collateral yet — every card you render lands here."}</div>
          )}
          {loaded && !assetMode && !perfMode && items.length === 0 && campAssets.length === 0 && (
            <div style={F.emptyList}>{q ? "Nothing matches the filter." : sel.kind === "archived" ? "Nothing archived." : "No runs in this folder yet."}</div>
          )}
          {perfMode
            ? perfItems.map((a) => {
                const on = a.id === selPerfId;
                const running = a.analysis_status === "running";
                const failed = a.analysis_status === "failed";
                return (
                  <button key={`pf-${a.id}`} type="button" onClick={() => { setSelPerfId(a.id); setInsp("item"); }} style={{ ...F.row, ...(on ? F.rowOn : null) }}>
                    <span style={F.rowIcon}>{running ? <Spinner /> : <DocGlyph c={on ? T.blue : "#4F9ED9"} />}</span>
                    <span style={F.rowName}>{a.label}</span>
                    <span style={F.rowCol}>{a.period_start && a.period_end ? `${shortDate(a.period_start)} – ${shortDate(a.period_end)}` : "—"}</span>
                    <span style={{ ...F.rowCol, width: 66 }}>
                      {running ? <span style={{ color: T.blue, fontWeight: 600 }}>Analyzing</span>
                        : failed ? <span style={{ color: "#B3261E", fontWeight: 600 }}>Failed</span>
                        : a.has_analysis ? <span style={{ color: "#0F4E3C", fontWeight: 600 }}>Analyzed</span>
                        : <span style={{ color: T.muted, fontWeight: 600 }}>Imported</span>}
                    </span>
                    <span style={{ ...F.rowCol, width: 48, textAlign: "right" }}>{shortDate(a.created_at)}</span>
                  </button>
                );
              })
            : assetMode
            ? assetItems.map((a) => {
                const on = a.id === selAssetId;
                return (
                  <button key={a.id} type="button" draggable onDragStart={(e) => setDrag(e, "asset", a.id)} onClick={() => { setSelAssetId(a.id); setInsp("item"); }} style={{ ...F.row, ...(on ? F.rowOn : null) }}>
                    <span style={F.rowIcon}><DocGlyph c={on ? T.blue : T.muted} /></span>
                    <span style={F.rowName}>{a.label}</span>
                    <span style={F.rowCol}>{(a.mime.split("/")[1] ?? a.mime).toUpperCase()}{a.width && a.height ? ` · ${a.width}×${a.height}` : ""}</span>
                    <span style={{ ...F.rowCol, width: 66 }}>{fmtBytes(a.bytes)}</span>
                    <span style={{ ...F.rowCol, width: 48, textAlign: "right" }}>{shortDate(a.created_at)}</span>
                  </button>
                );
              })
            : items.map((r) => {
                const on = r.id === selRunId;
                const failed = r.status === "failed";
                const running = r.status === "queued" || r.status === "running";
                return (
                  <button key={r.id} type="button" draggable onDragStart={(e) => setDrag(e, "run", r.id)} onClick={() => { setSelRunId(r.id); setSelAssetId(null); setInsp("item"); }} style={{ ...F.row, ...(on ? F.rowOn : null) }}>
                    <span style={F.rowIcon}>{running ? <Spinner /> : failed ? <span style={{ color: "#B3261E", fontWeight: 700 }}>!</span> : <DocGlyph c={on ? T.blue : T.muted} />}</span>
                    <span style={F.rowName}>{r.report_title || r.topic}</span>
                    <span style={F.rowCol}>{angleLabel(r.post_angle) ?? typeLabel(r.research_type)}</span>
                    <span style={{ ...F.rowCol, width: 66 }}>
                      {running ? <span style={{ color: T.blue, fontWeight: 600 }}>Running</span>
                        : failed ? <span style={{ color: "#B3261E", fontWeight: 600 }}>Failed</span>
                        : r.review_status === "approved" ? <span style={{ color: "#0F4E3C", fontWeight: 600 }}>Approved</span>
                        : <span style={{ color: "#8A6A2B", fontWeight: 600 }}>Draft</span>}
                    </span>
                    <span style={{ ...F.rowCol, width: 48, textAlign: "right" }}>{shortDate(r.created_at)}</span>
                  </button>
                );
              })}
          {/* the campaign's exported collateral, after its runs */}
          {!assetMode && campAssets.map((a) => {
            const on = a.id === selAssetId && selRunId == null;
            return (
              <button key={`ca-${a.id}`} type="button" draggable onDragStart={(e) => setDrag(e, "asset", a.id)} onClick={() => { setSelAssetId(a.id); setSelRunId(null); setInsp("item"); }} style={{ ...F.row, ...(on ? F.rowOn : null) }}>
                <span style={F.rowIcon}><DocGlyph c={on ? T.blue : "#8B7BD8"} /></span>
                <span style={F.rowName}>{a.label}</span>
                <span style={F.rowCol}>{(a.mime.split("/")[1] ?? a.mime).toUpperCase()}</span>
                <span style={{ ...F.rowCol, width: 66 }}>{fmtBytes(a.bytes)}</span>
                <span style={{ ...F.rowCol, width: 48, textAlign: "right" }}>{shortDate(a.created_at)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <PaneDivider onDrag={(dx) => setPrevW((w) => clampW(w - dx, 280, 680))} onAuto={() => setPrevW(400)} />

      {/* inspector — the create form, the campaign, or the selected item */}
      <div style={{ ...F.prev, width: prevW, minWidth: 0 }}>
        {insp === "create" ? (
          <div style={F.createWrap}>{createForm}</div>
        ) : insp === "camp" && selCamp ? (
          <CampaignPreview
            s={selCamp}
            count={(byCamp.get(selCamp.id) ?? []).length}
            angles={angles}
            onSave={(body) => onPatchSchedule(selCamp, body, "Campaign updated.")}
            onRunNow={() => onRunCampaignNow(selCamp)}
            onToggle={() => onToggleSchedule(selCamp)}
            onArchive={(v) => onPatchSchedule(selCamp, { archived: v }, v ? "Campaign archived — it's under Archived campaigns." : "Campaign restored.")}
            onDelete={() => onDeleteSchedule(selCamp)}
          />
        ) : assetMode ? (
          selAsset ? (
            <AssetPreview asset={selAsset} campName={schedules.find((sc) => sc.id === selAsset.schedule_id)?.name ?? null} onDownload={() => onDownloadAsset(selAsset)} onDelete={() => onDeleteAsset(selAsset)} />
          ) : (
            <div style={F.createWrap}>{createForm}</div>
          )
        ) : perfMode ? (
          selPerf ? (
            <PerfPreview item={selPerf} onAnalyze={() => onAnalyzeAnalytics(selPerf)} onDelete={() => onDeleteAnalytics(selPerf)} />
          ) : (
            <div style={F.createWrap}>{createForm}</div>
          )
        ) : selRun ? (
          <RunPreview
            run={selRun}
            schedules={schedules}
            typeLabel={typeLabel}
            angleLabel={angleLabel}
            dl={dl}
            reviewOpen={reviewId === selRun.id}
            onReview={() => onReview(selRun.id)}
            onGrab={(k) => onGrab(selRun, k)}
            onCopyPost={() => onCopyPost(selRun)}
            onRerun={() => onRerunRun(selRun)}
            onMove={(sid) => onMoveRun(selRun, sid)}
            onMakeCampaign={() => onMakeCampaign(selRun)}
            onArchive={(v) => onArchiveRun(selRun, v)}
            onDelete={() => onDeleteRun(selRun)}
          />
        ) : selAsset ? (
          <AssetPreview asset={selAsset} campName={schedules.find((sc) => sc.id === selAsset.schedule_id)?.name ?? null} onDownload={() => onDownloadAsset(selAsset)} onDelete={() => onDeleteAsset(selAsset)} />
        ) : (
          <div style={F.createWrap}>{createForm}</div>
        )}
      </div>
    </div>
  );
}

function DocRow({ label, sub, onClick, busy, muted }: { label: string; sub?: string; onClick: () => void; busy?: boolean; muted?: boolean }) {
  return (
    <button type="button" style={F.docRow} onClick={onClick} disabled={busy}>
      <DocGlyph c={muted ? T.muted : T.blue} />
      <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1, textAlign: "left" as const }}>
        <span style={{ ...F.docLabel, color: muted ? T.muted : T.ink }}>{label}</span>
        {sub && <span style={{ fontSize: 11.5, color: T.muted2, lineHeight: 1.35 }}>{sub}</span>}
      </span>
      <span style={F.docGet}>{busy ? "…" : "Get"}</span>
    </button>
  );
}

function RunPreview({ run, schedules, typeLabel, angleLabel, dl, reviewOpen, onReview, onGrab, onCopyPost, onRerun, onMove, onMakeCampaign, onArchive, onDelete }: {
  run: RunRow;
  schedules: ScheduleRow[];
  typeLabel: (k: string) => string;
  angleLabel: (k?: string | null) => string | null;
  dl: string | null;
  reviewOpen: boolean;
  onReview: () => void;
  onGrab: (kind: "pdf" | "card" | "md" | "lipdf") => void;
  onCopyPost: () => void;
  onRerun: () => void;
  onMove: (scheduleId: number | null) => void;
  onMakeCampaign: () => void;
  onArchive: (archived: boolean) => void;
  onDelete: () => void;
}) {
  const done = run.status === "complete";
  const failed = run.status === "failed";
  const running = !done && !failed;
  const fmt = angleLabel(run.post_angle);
  return (
    <div style={F.prevInner}>
      <div style={F.prevTitle}>{run.report_title || run.topic}</div>
      <div style={F.prevMeta}>
        {fmt ? `${fmt} · ` : ""}{typeLabel(run.research_type)} · {run.depth}
        {run.schedule_id != null ? " · campaign" : ""} · {timeAgo(run.created_at)}
        {done && run.usage?.searches != null ? ` · ${run.usage.searches} searches` : ""}
        {done && run.usage?.costCents != null ? ` · ~$${(run.usage.costCents / 100).toFixed(2)}` : ""}
      </div>
      {done && run.has_feed && (
        <span style={{ ...R.chip, ...(run.review_status === "approved" ? R.chipOk : R.chipDraft), alignSelf: "flex-start", marginTop: 8 }}>
          {run.review_status === "approved" ? "Approved" : "Draft"}
        </span>
      )}
      {failed && run.error && <div style={{ ...R.rowErr, marginTop: 8 }}>{run.error}</div>}

      {done && (
        <>
          <div style={F.prevLabel}>Documents</div>
          <DocRow label="Report PDF" sub="The long findings document — letter pages, downloads as smbx-research-…" busy={dl === `${run.id}:pdf`} onClick={() => onGrab("pdf")} />
          {run.has_feed && <DocRow label="LinkedIn 1-pager (PNG)" sub="One square announcement-style image — smbx-onepager-…" busy={dl === `${run.id}:card`} onClick={() => onGrab("card")} />}
          {run.has_feed && <DocRow label="LinkedIn carousel (PDF)" sub="Swipeable square pages — announcement cover, dark closer — smbx-linkedin-…" busy={dl === `${run.id}:lipdf`} onClick={() => onGrab("lipdf")} />}
          {run.has_feed && <DocRow label="Post text — copy" busy={dl === `${run.id}:post`} onClick={onCopyPost} />}
          <DocRow label="Report markdown" busy={dl === `${run.id}:md`} onClick={() => onGrab("md")} muted />
          {run.has_feed && (
            <button type="button" style={F.reviewBtn} onClick={onReview}>{reviewOpen ? "Close review" : "Review & approve"}</button>
          )}
        </>
      )}

      <div style={F.prevLabel}>{running ? "Working now" : "What it did"}</div>
      <ActivityFeed runId={run.id} running={running} />

      {/* the manager verbs — organize, copy (run again), archive, delete */}
      <div style={F.prevLabel}>Manage</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {!running && <button type="button" style={F.smallBtn} onClick={onRerun}>Run again</button>}
        {!running && run.schedule_id == null && (
          <button type="button" style={F.smallBtn} onClick={onMakeCampaign} title="Turn this run into a recurring campaign — it becomes the campaign's first run">
            Make a campaign
          </button>
        )}
        {!running && (
          <button type="button" style={F.smallBtn} onClick={() => onArchive(!run.archived)}>
            {run.archived ? "Unarchive" : "Archive"}
          </button>
        )}
        {!running && <button type="button" style={{ ...F.smallBtn, color: T.muted }} onClick={onDelete}>Delete</button>}
        {running && <span style={{ fontSize: 12, color: T.muted }}>Available when the run finishes.</span>}
      </div>
      {!running && (
        <select
          value={run.schedule_id ?? ""}
          onChange={(e) => onMove(e.target.value ? Number(e.target.value) : null)}
          style={F.moveSel}
          title="File this run under a campaign"
        >
          <option value="">One-off (no campaign)</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}

/** Campaign inspector — rename, edit the mandate, change format/cadence,
 *  and the manager verbs: Run now · Pause/Resume · Archive · Delete. */
function CampaignPreview({ s, count, angles, onSave, onRunNow, onToggle, onArchive, onDelete }: {
  s: ScheduleRow;
  count: number;
  angles: { key: string; label: string }[];
  onSave: (body: Record<string, unknown>) => void;
  onRunNow: () => void;
  onToggle: () => void;
  onArchive: (v: boolean) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(s.name);
  const [topic, setTopic] = useState(s.topic);
  const [angle, setAngle] = useState(s.post_angle ?? "auto");
  const [cadence, setCadence] = useState(s.cadence);
  useEffect(() => {
    setName(s.name);
    setTopic(s.topic);
    setAngle(s.post_angle ?? "auto");
    setCadence(s.cadence);
  }, [s.id, s.name, s.topic, s.post_angle, s.cadence]);
  const dirty = name !== s.name || topic !== s.topic || angle !== (s.post_angle ?? "auto") || cadence !== s.cadence;

  return (
    <div style={F.prevInner}>
      <div style={F.prevLabel}>Campaign</div>
      <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...IP.name, width: "100%", boxSizing: "border-box" }} />
      <div style={F.prevMeta}>
        {count} run{count === 1 ? "" : "s"} · {s.archived ? "archived" : s.active ? "active" : "paused"}
        {!s.archived && s.active && s.next_run_at ? ` · next ${new Date(s.next_run_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : ""}
      </div>

      <div style={F.prevLabel}>Standing mandate</div>
      <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={5} style={{ ...IP.topic, marginTop: 0 }} />
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <select value={angle} onChange={(e) => setAngle(e.target.value)} style={{ ...IP.sel, flex: 1, minWidth: 0 }} title="Post format">
          {angles.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <select value={cadence} onChange={(e) => setCadence(e.target.value)} style={{ ...IP.sel, flex: 1, minWidth: 0 }} title="Cadence">
          {["weekly", "biweekly", "monthly"].map((c) => <option key={c} value={c}>{CADENCE_LABELS[c] ?? c}</option>)}
        </select>
      </div>
      {dirty && (
        <button type="button" style={{ ...F.reviewBtn, marginTop: 10 }} onClick={() => onSave({ name: name.trim(), topic: topic.trim(), postAngle: angle, cadence })}>
          Save changes
        </button>
      )}

      <div style={F.prevLabel}>Manage</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" style={{ ...F.smallBtn, background: T.blue, color: "#fff", borderColor: T.blue }} onClick={onRunNow}>Run now</button>
        <button type="button" style={F.smallBtn} onClick={onToggle}>{s.active ? "Pause" : "Resume"}</button>
        <button type="button" style={F.smallBtn} onClick={() => onArchive(!s.archived)}>{s.archived ? "Unarchive" : "Archive"}</button>
        <button type="button" style={{ ...F.smallBtn, color: T.muted }} onClick={onDelete}>Delete campaign</button>
      </div>
      <div style={{ marginTop: 10, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>
        Archiving hides it from the working sidebar and stops the cadence; its runs stay in the library. Delete keeps past runs too.
      </div>
    </div>
  );
}

/** Asset preview — media photos and rendered collateral share it. */
function AssetPreview({ asset, campName, onDownload, onDelete }: { asset: AssetRow; campName?: string | null; onDownload: () => void; onDelete: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const isImage = asset.mime.startsWith("image/");
  const isPdf = asset.mime === "application/pdf";
  useEffect(() => {
    if (!isImage && !isPdf) { setSrc(null); return; }
    let url: string | null = null;
    let alive = true;
    setSrc(null);
    fetch(`/api/studio/assets/${asset.id}/raw`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => { if (alive) { url = URL.createObjectURL(b); setSrc(url); } })
      .catch(() => { if (alive) setSrc(null); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [asset.id, isImage, isPdf]);

  return (
    <div style={F.prevInner}>
      <div style={F.prevTitle}>{asset.label}</div>
      <div style={F.prevMeta}>
        {asset.kind === "collateral" ? "Rendered collateral" : "Media photo"} · {(asset.mime.split("/")[1] ?? asset.mime).toUpperCase()}
        {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""} · {fmtBytes(asset.bytes)} · {shortDate(asset.created_at)}
        {campName ? ` · ${campName}` : ""}
      </div>
      {isImage ? (
        src
          ? <img src={src} alt={asset.label} style={F.prevImg} />
          : <div style={{ ...F.actEmpty, marginTop: 12 }}>Loading preview…</div>
      ) : isPdf ? (
        src
          ? (
            <object data={src} type="application/pdf" style={F.prevPdf}>
              <div style={{ ...F.actEmpty, margin: 12 }}>This browser can’t show PDFs inline — use Download.</div>
            </object>
          )
          : <div style={{ ...F.actEmpty, marginTop: 12 }}>Loading preview…</div>
      ) : (
        <div style={{ ...F.actEmpty, marginTop: 12 }}>No inline preview for this file — use Download.</div>
      )}
      <div style={F.prevLabel}>Manage</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" style={F.smallBtn} onClick={onDownload}>Download</button>
        <button type="button" style={{ ...F.smallBtn, color: T.muted }} onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

/* ─── Performance inspector — the import's real numbers + Yulia's read ─── */

interface PerfSummary {
  periodStart?: string | null;
  periodEnd?: string | null;
  impressions?: number | null;
  membersReached?: number | null;
  totalEngagements?: number | null;
  newFollowers?: number | null;
  totalFollowers?: number | null;
  daily?: { date: string; impressions: number; engagements: number }[];
  topByImpressions?: { url: string; publishedAt: string; impressions: number }[];
  topByEngagements?: { url: string; publishedAt: string; engagements: number }[];
  demographics?: { category: string; value: string; percentage: string }[];
}

/** Inline **bold** only — the analysis is house markdown, not arbitrary. */
function mdInline(s: string): React.ReactNode {
  const parts = s.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));
}

/** Tiny renderer for Yulia's analysis markdown (headings, bullets, paras). */
function MdLite({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let key = 0;
  for (const raw of text.split(/\r?\n/)) {
    const t = raw.trim();
    if (!t) continue;
    if (t.startsWith("### ")) out.push(<div key={key++} style={F.mdH3}>{mdInline(t.slice(4))}</div>);
    else if (t.startsWith("## ")) out.push(<div key={key++} style={F.mdH2}>{mdInline(t.slice(3))}</div>);
    else if (t.startsWith("# ")) out.push(<div key={key++} style={F.mdH1}>{mdInline(t.slice(2))}</div>);
    else if (/^[-*] /.test(t)) out.push(<div key={key++} style={F.mdLi}>•&nbsp; {mdInline(t.slice(2))}</div>);
    else out.push(<div key={key++} style={F.mdP}>{mdInline(t)}</div>);
  }
  return <div>{out}</div>;
}

const nfmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));

function PerfPreview({ item, onAnalyze, onDelete }: { item: AnalyticsRow; onAnalyze: () => void; onDelete: () => void }) {
  const [detail, setDetail] = useState<{ summary: PerfSummary | null; analysis: string | null; analysis_status: string; analysis_error: string | null } | null>(null);
  const status = detail?.analysis_status ?? item.analysis_status;
  const running = status === "running" || item.analysis_status === "running";
  useEffect(() => {
    let alive = true;
    const load = () =>
      api<{ item: any }>(`/research/analytics/${item.id}`)
        .then((j) => { if (alive) setDetail(j.item); })
        .catch(() => {});
    void load();
    const t = running ? setInterval(load, 4000) : null;
    return () => { alive = false; if (t) clearInterval(t); };
  }, [item.id, running]);

  const s = detail?.summary ?? null;
  const top = (s?.topByImpressions ?? []).slice(0, 3);
  const dlMd = () => {
    const blob = new Blob([detail?.analysis ?? ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(item.label)}-analysis.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div style={F.prevInner}>
      <div style={F.prevTitle}>{item.label}</div>
      <div style={F.prevMeta}>
        LinkedIn analytics · imported {timeAgo(item.created_at)}
        {item.period_start && item.period_end ? ` · ${shortDate(item.period_start)} – ${shortDate(item.period_end)}` : ""}
      </div>

      <div style={F.prevLabel}>The week, verbatim</div>
      <div style={F.statGrid}>
        <div style={F.statBox}><div style={F.statNum}>{nfmt(s?.impressions)}</div><div style={F.statLbl}>Impressions</div></div>
        <div style={F.statBox}><div style={F.statNum}>{nfmt(s?.membersReached)}</div><div style={F.statLbl}>Members reached</div></div>
        <div style={F.statBox}><div style={F.statNum}>{nfmt(s?.totalEngagements)}</div><div style={F.statLbl}>Engagements</div></div>
        <div style={F.statBox}><div style={F.statNum}>{nfmt(s?.newFollowers)}</div><div style={F.statLbl}>New followers</div></div>
        <div style={F.statBox}><div style={F.statNum}>{nfmt(s?.totalFollowers)}</div><div style={F.statLbl}>Total followers</div></div>
      </div>
      {top.length > 0 && (
        <>
          <div style={F.prevLabel}>Top posts by impressions</div>
          {top.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" style={F.topPost}>
              <DocGlyph c={T.blue} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.publishedAt ? shortDate(p.publishedAt) : "Post"} · {p.url.includes("groupPost") ? "group share" : "post"}
              </span>
              <span style={{ fontWeight: 700, color: T.ink }}>{nfmt(p.impressions)}</span>
            </a>
          ))}
        </>
      )}

      <div style={F.prevLabel}>Yulia’s read</div>
      {running ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: T.ink3 }}>
          <Spinner /> Reading the week — the analysis lands here in under a minute.
        </div>
      ) : status === "failed" ? (
        <>
          <div style={R.rowErr}>{detail?.analysis_error || item.analysis_error || "The analysis failed."}</div>
          <button type="button" style={{ ...F.reviewBtn, marginTop: 8 }} onClick={onAnalyze}>Try again</button>
        </>
      ) : detail?.analysis ? (
        <>
          <div style={F.mdWrap}><MdLite text={detail.analysis} /></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" style={F.smallBtn} onClick={dlMd}>Download (.md)</button>
            <button type="button" style={F.smallBtn} onClick={onAnalyze}>Re-analyze</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.55 }}>
            Yulia reads the real numbers above against what Studio has been producing, then writes the performance read: what worked, what didn’t, who’s watching, and a per-slot plan for next week — content, hooks, and the visual to pair with each post.
          </div>
          <button type="button" style={{ ...F.reviewBtn, marginTop: 10 }} onClick={onAnalyze}>Analyze with Yulia</button>
        </>
      )}

      <div style={F.prevLabel}>Manage</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" style={{ ...F.smallBtn, color: T.muted }} onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

/* ─── Import a campaign plan — PDF/text → proposed campaigns → create ──── */

interface ImportedRow {
  name: string;
  postAngle: string;
  researchType: string;
  topic: string;
  cadence: string;
  depth: string;
  outputFormat: string;
  note?: string;
  on: boolean;
}

function ImportPlanSheet({ catalog, onDone }: { catalog: Catalog | null; onDone: (created: number) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"parse" | "create" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [rows, setRows] = useState<ImportedRow[] | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const angleLabel = (k: string) => catalog?.angles?.find((a) => a.key === k)?.label ?? k;
  const typeLabel = (k: string) => catalog?.types.find((t) => t.key === k)?.label ?? k;

  const parse = async () => {
    setBusy("parse");
    setErr(null);
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (text.trim()) fd.append("text", text.trim());
      const r = await fetch("/api/research/import-plan", { method: "POST", headers: authHeaders(), body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((j as any)?.error || `Import failed (${r.status})`);
      setSummary(j.summary || "");
      setRows((j.campaigns ?? []).map((c: any) => ({ ...c, on: true })));
    } catch (e: any) {
      setErr(e?.message || "Import failed");
    } finally {
      setBusy(null);
    }
  };

  const create = async () => {
    if (!rows) return;
    setBusy("create");
    setErr(null);
    let ok = 0;
    const fails: string[] = [];
    for (const c of rows.filter((r) => r.on)) {
      try {
        await api("/research/schedules", {
          method: "POST",
          body: JSON.stringify({ name: c.name, researchType: c.researchType, topic: c.topic, depth: c.depth, outputFormat: c.outputFormat, postAngle: c.postAngle, cadence: c.cadence, runNow: false }),
        });
        ok++;
      } catch (e: any) {
        fails.push(`${c.name}: ${e?.message || "failed"}`);
      }
    }
    setBusy(null);
    if (fails.length) setErr(`Created ${ok} — the rest failed: ${fails.join(" · ")}`);
    else onDone(ok);
  };

  const upd = (i: number, patch: Partial<ImportedRow>) =>
    setRows((rs) => (rs ? rs.map((r, j) => (j === i ? { ...r, ...patch } : r)) : rs));

  const selCount = rows?.filter((r) => r.on).length ?? 0;

  return (
    <div style={{ marginTop: 22, maxWidth: 860 }}>
      {!rows ? (
        <>
          <div style={IP.lede}>
            Drop in a plan written by Claude (or anyone) — the strategy PDF or the pasted text. It's read as-is
            and turned into ready-to-create campaigns in your posting vocabulary. Nothing is created until you approve the list.
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,text/plain,text/markdown"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button type="button" style={IP.fileBtn} onClick={() => fileRef.current?.click()}>
              {file ? `📄 ${file.name}` : "Attach the plan (PDF)"}
            </button>
            {file && <button type="button" style={IP.clearBtn} onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>×</button>}
            <span style={{ fontSize: 12.5, color: T.muted }}>or paste it:</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the plan text here (optional if you attached the PDF)…"
            rows={7}
            style={IP.paste}
          />
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" style={{ ...IP.primary, opacity: !file && !text.trim() ? 0.5 : 1 }} disabled={(!file && !text.trim()) || busy === "parse"} onClick={parse}>
              {busy === "parse" ? "Reading the plan…" : "Read the plan"}
            </button>
            {busy === "parse" && <Spinner />}
          </div>
        </>
      ) : (
        <>
          <div style={IP.lede}>{summary}</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: T.muted }}>
            Untick anything you don't want. Campaigns are created on their cadence without running immediately — use Run now on any campaign to fire its first run.
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((c, i) => (
              <div key={i} style={{ ...IP.row, opacity: c.on ? 1 : 0.55 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={c.on} onChange={(e) => upd(i, { on: e.target.checked })} style={{ accentColor: T.blue }} />
                  <input value={c.name} onChange={(e) => upd(i, { name: e.target.value })} style={IP.name} />
                  <select value={c.postAngle} onChange={(e) => upd(i, { postAngle: e.target.value })} style={IP.sel} title="Post format">
                    {(catalog?.angles ?? []).map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                  <select value={c.cadence} onChange={(e) => upd(i, { cadence: e.target.value })} style={IP.sel} title="Cadence">
                    {(catalog?.cadences ?? ["weekly", "biweekly", "monthly"]).map((cd) => <option key={cd} value={cd}>{CADENCE_LABELS[cd] ?? cd}</option>)}
                  </select>
                </div>
                <textarea value={c.topic} onChange={(e) => upd(i, { topic: e.target.value })} rows={2} style={IP.topic} />
                <div style={IP.meta}>
                  {typeLabel(c.researchType)} · {c.depth} · {c.outputFormat === "post_image" ? "LinkedIn 1-pager" : c.outputFormat === "post_pdf" ? "LinkedIn carousel" : c.outputFormat === "both" ? "everything" : "report"}
                  {c.note ? ` — ${c.note}` : ""}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" style={{ ...IP.primary, opacity: selCount === 0 || busy === "create" ? 0.5 : 1 }} disabled={selCount === 0 || busy === "create"} onClick={create}>
              {busy === "create" ? "Creating…" : `Create ${selCount} campaign${selCount === 1 ? "" : "s"}`}
            </button>
            <button type="button" style={IP.ghost} onClick={() => { setRows(null); setErr(null); }}>Start over</button>
          </div>
        </>
      )}
      {err && <div style={{ marginTop: 12, fontSize: 12.5, color: "#B3261E", lineHeight: 1.5 }}>{err}</div>}
    </div>
  );
}

const IP: Record<string, React.CSSProperties> = {
  lede: { fontSize: 13.5, color: T.ink3, lineHeight: 1.6, maxWidth: 640 },
  fileBtn: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  clearBtn: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, width: 30, height: 30, fontSize: 15, color: T.muted, cursor: "pointer" },
  paste: { marginTop: 10, width: "100%", resize: "vertical", borderRadius: 10, border: `1px solid ${T.inputBd}`, padding: "10px 12px", fontSize: 13, lineHeight: 1.55, color: T.ink, fontFamily: T.font, background: T.white, boxSizing: "border-box" },
  primary: { background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font },
  ghost: { background: "transparent", border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: T.ink3, cursor: "pointer", fontFamily: T.font },
  row: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", boxShadow: T.shCard },
  name: { flex: 1, minWidth: 160, height: 32, borderRadius: 8, border: `1px solid ${T.inputBd}`, padding: "0 10px", fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: T.font },
  sel: { height: 32, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 6px", fontSize: 12.5, color: T.ink, fontFamily: T.font },
  topic: { marginTop: 8, width: "100%", resize: "vertical", borderRadius: 8, border: `1px solid ${T.inputBd}`, padding: "8px 10px", fontSize: 12.5, lineHeight: 1.5, color: T.ink3, fontFamily: T.font, background: T.white, boxSizing: "border-box" },
  meta: { marginTop: 6, fontSize: 11.5, color: T.muted },
};

/* ─── Activity feed — the Claude-style live trail ───────────────────────── */

interface ActLine { t: string; kind: string; text: string }

function ActivityFeed({ runId, running }: { runId: number; running: boolean }) {
  const [lines, setLines] = useState<ActLine[] | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    setLines(null);
    const load = async () => {
      try {
        const j = await api<{ run: { activity?: ActLine[] } }>(`/research/runs/${runId}`);
        if (alive) setLines(Array.isArray(j.run?.activity) ? j.run.activity : []);
      } catch {
        if (alive) setLines([]);
      }
    };
    void load();
    if (!running) return () => { alive = false; };
    const t = setInterval(load, 3000);
    return () => { alive = false; clearInterval(t); };
  }, [runId, running]);

  // Follow the tail while it works, like a terminal.
  useEffect(() => {
    if (running && boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [lines, running]);

  if (lines === null) return <div style={F.actEmpty}>Loading…</div>;
  if (lines.length === 0 && !running) return <div style={F.actEmpty}>No activity was recorded for this run.</div>;

  return (
    <div ref={boxRef} style={F.act}>
      {lines.map((l, i) => (
        <div key={i} style={F.actLine}>
          <span style={F.actTime}>{new Date(l.t).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}</span>
          <span
            style={{
              ...F.actText,
              ...(l.kind === "phase" ? { fontWeight: 700, color: T.ink } : null),
              ...(l.kind === "done" ? { fontWeight: 700, color: T.green } : null),
              ...(l.kind === "error" ? { fontWeight: 600, color: "#B3261E" } : null),
            }}
          >
            {l.kind === "search" ? <>Searched — {l.text}</> : l.kind === "read" ? <>Read — {l.text}</> : l.text}
          </span>
        </div>
      ))}
      {running && (
        <div style={{ ...F.actLine, alignItems: "center" }}>
          <span style={F.actTime}><Spinner /></span>
          <span style={{ ...F.actText, color: T.muted }}>{lines.length === 0 ? "Starting up…" : "Working…"}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Review panel — draft → edit → approve → export ───────────────────── */

interface FeedPoint { stat: string; source?: string; note?: string; freshness?: string; confidence?: string }
interface Feed { hooks: string[]; dataPoints: FeedPoint[]; artAssetId?: number | null }

function ReviewPanel({ run, onStatus, onCopyPost, onGrab }: {
  run: RunRow;
  onStatus: () => void;
  onCopyPost: () => void;
  onGrab: (kind: "pdf" | "card" | "md" | "lipdf") => void;
}) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pvState, setPvState] = useState<"loading" | "ok" | "err">("loading");
  const [pvErr, setPvErr] = useState<string>("");
  const pvTriedRef = useRef(0);
  const [saving, setSaving] = useState<"save" | "approve" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const approved = run.review_status === "approved";
  // Cover artwork: candidates from the media library (this run's generated
  // art first, then photos), thumbnails blob-fetched with auth.
  const [artCands, setArtCands] = useState<AssetRow[]>([]);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [genBusy, setGenBusy] = useState(false);
  const [coverPv, setCoverPv] = useState<string | null>(null);
  const [coverState, setCoverState] = useState<"loading" | "ok" | "err">("loading");
  // Per-page artwork (Paul: "drag and drop … onto which page i want that
  // image"): final rendered page order from the server; pageArt maps page
  // index → media asset id and saves with the review.
  const [pages, setPages] = useState<{ i: number; kind: string; heading: string; artAssetId: number | null }[]>([]);
  const [pageArt, setPageArt] = useState<Record<string, number>>({});
  const [dragPage, setDragPage] = useState<number | null>(null);

  const loadCover = useCallback(async () => {
    setCoverState("loading");
    try {
      const r = await fetch(`/api/research/runs/${run.id}/cover.png?t=${Date.now()}`, { headers: authHeaders() });
      if (!r.ok) throw new Error(String(r.status));
      const url = URL.createObjectURL(await r.blob());
      setCoverPv(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      setCoverState("ok");
    } catch { setCoverState("err"); }
  }, [run.id]);

  const loadArtCands = useCallback(async () => {
    try {
      const j = await api<{ assets: AssetRow[] }>("/studio/assets");
      const all = (j.assets ?? []).filter(a => a.kind !== "collateral" && a.mime.startsWith("image/"));
      const mine = all.filter(a => (a as any).run_id === run.id && /^Artwork/i.test(a.label));
      const rest = all.filter(a => !mine.some(m => m.id === a.id)).slice(0, 8);
      const cands = [...mine, ...rest];
      setArtCands(cands);
      for (const a of cands.slice(0, 12)) {
        if (thumbs[a.id]) continue;
        fetch(`/api/studio/assets/${a.id}/raw`, { headers: authHeaders() })
          .then(r => (r.ok ? r.blob() : Promise.reject(new Error())))
          .then(b => setThumbs(t => (t[a.id] ? t : { ...t, [a.id]: URL.createObjectURL(b) })))
          .catch(() => {});
      }
    } catch { /* candidates are an enhancement — the pickers can stay empty */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id]);

  const regenerate = async () => {
    setGenBusy(true); setErr(null);
    try {
      const j = await api<{ assetId: number }>(`/research/runs/${run.id}/artwork`, { method: "POST", body: JSON.stringify({}) });
      setFeed(f => (f ? { ...f, artAssetId: j.assetId } : f));
      await loadArtCands();
      await loadCover();
    } catch (e) { setErr(e instanceof Error ? e.message : "Artwork generation failed"); }
    finally { setGenBusy(false); }
  };

  // Paul's Gemini-app workflow: copy the run's story-specific prompt, paste
  // it into Gemini, upload the image to Media, pick it above.
  const [promptCopied, setPromptCopied] = useState(false);
  const copyPrompt = async () => {
    setErr(null);
    try {
      const j = await api<{ prompt: string }>(`/research/runs/${run.id}/artwork-prompt`);
      await navigator.clipboard.writeText(j.prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (e) { setErr(e instanceof Error ? e.message : "Couldn’t copy the prompt"); }
  };

  // The preview IS the review — render it visibly, retry once on a hiccup,
  // and say what went wrong instead of sitting on a blank placeholder.
  const loadPreview = useCallback(async () => {
    setPvState("loading");
    try {
      const r = await fetch(`/api/research/runs/${run.id}/card.png?t=${Date.now()}`, { headers: authHeaders() });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as any)?.error || `Render failed (${r.status})`);
      }
      const url = URL.createObjectURL(await r.blob());
      setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      setPvState("ok");
    } catch (e: any) {
      if (pvTriedRef.current < 1) {
        pvTriedRef.current += 1;
        setTimeout(() => { void loadPreview(); }, 2500); // renderer may be cold-starting
        return;
      }
      setPvErr(e?.message || "Preview failed");
      setPvState("err");
    }
  }, [run.id]);

  useEffect(() => {
    api<{ feed: Feed }>(`/research/runs/${run.id}/feed`)
      .then(j => setFeed({
        hooks: Array.isArray(j.feed?.hooks) && j.feed.hooks.length ? j.feed.hooks : [run.report_title || run.topic],
        dataPoints: Array.isArray(j.feed?.dataPoints) ? j.feed.dataPoints : [],
        artAssetId: (j.feed as any)?.artAssetId,
      }))
      .catch(e => setErr(e instanceof Error ? e.message : "Couldn't load the draft"));
    api<{ pages: { i: number; kind: string; heading: string; artAssetId: number | null }[] }>(`/research/runs/${run.id}/pages`)
      .then(j => {
        setPages(j.pages ?? []);
        const m: Record<string, number> = {};
        for (const pg of j.pages ?? []) if (pg.kind !== "cover" && pg.artAssetId) m[String(pg.i)] = pg.artAssetId;
        setPageArt(m);
      })
      .catch(() => {});
    void loadPreview();
    void loadCover();
    void loadArtCands();
    return () => setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
  }, [run.id, run.report_title, run.topic, loadPreview, loadCover, loadArtCands]);

  const save = async () => {
    if (!feed) return;
    setSaving("save"); setErr(null);
    try {
      await api(`/research/runs/${run.id}/feed`, { method: "PATCH", body: JSON.stringify({ feed: { ...feed, pageArt } }) });
      pvTriedRef.current = 0; // fresh retry budget for the re-render
      await Promise.all([loadPreview(), loadCover()]);
      onStatus();
    } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(null); }
  };

  const setReview = async (status: "approved" | "draft") => {
    setSaving("approve"); setErr(null);
    try {
      await api(`/research/runs/${run.id}/review`, { method: "POST", body: JSON.stringify({ status }) });
      onStatus();
    } catch (e) { setErr(e instanceof Error ? e.message : "Update failed"); }
    finally { setSaving(null); }
  };

  const input = (v: string, on: (x: string) => void, ph = "") => (
    <input value={v} placeholder={ph} onChange={e => on(e.target.value)} style={RV.input} />
  );

  return (
    <div style={RV.panel}>
      <div style={RV.cols}>
        <div style={RV.editCol}>
          <div style={RV.label}>Hook — the card headline</div>
          <textarea
            value={feed?.hooks[0] ?? ""}
            onChange={e => setFeed(f => f ? { ...f, hooks: [e.target.value, ...f.hooks.slice(1)] } : f)}
            rows={2}
            style={RV.textarea}
          />
          <div style={{ ...RV.label, marginTop: 14 }}>Data points — shown on the card and carousel</div>
          {(feed?.dataPoints ?? []).map((pt, i) => (
            <div key={i} style={RV.point}>
              {input(pt.stat, x => setFeed(f => { if (!f) return f; const d = [...f.dataPoints]; d[i] = { ...d[i], stat: x }; return { ...f, dataPoints: d }; }), "The stat")}
              {input(pt.source ?? "", x => setFeed(f => { if (!f) return f; const d = [...f.dataPoints]; d[i] = { ...d[i], source: x }; return { ...f, dataPoints: d }; }), "Source")}
              <button type="button" style={RV.ptDel} onClick={() => setFeed(f => f ? { ...f, dataPoints: f.dataPoints.filter((_, j) => j !== i) } : f)}>×</button>
            </div>
          ))}
          {(feed?.dataPoints.length ?? 0) < 4 && (
            <button type="button" style={RV.addPt} onClick={() => setFeed(f => f ? { ...f, dataPoints: [...f.dataPoints, { stat: "", source: "" }] } : f)}>+ Add data point</button>
          )}
          <div style={{ ...RV.label, marginTop: 16 }}>Cover artwork — the poster image</div>
          <div style={RV.artRow}>
            <button
              type="button"
              title="No artwork — split cover with the sector illustration"
              onClick={() => setFeed(f => (f ? { ...f, artAssetId: null } : f))}
              style={{ ...RV.artThumb, ...(feed?.artAssetId === null ? RV.artThumbOn : null), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, color: T.muted, fontWeight: 700 }}
            >
              None
            </button>
            {artCands.map(a => (
              <button
                key={a.id}
                type="button"
                title={`${a.label} — click for the cover, or drag onto a page below`}
                draggable
                onDragStart={e => { e.dataTransfer.setData("application/json", JSON.stringify({ t: "asset", id: a.id })); e.dataTransfer.effectAllowed = "copy"; }}
                onClick={() => setFeed(f => (f ? { ...f, artAssetId: a.id } : f))}
                style={{ ...RV.artThumb, ...(feed?.artAssetId === a.id ? RV.artThumbOn : null) }}
              >
                {thumbs[a.id] ? <img src={thumbs[a.id]} alt={a.label} style={RV.artThumbImg} /> : <span style={{ fontSize: 9.5, color: T.muted2 }}>…</span>}
              </button>
            ))}
            <button type="button" style={RV.genBtn} disabled={genBusy} onClick={() => void regenerate()}>
              {genBusy ? "Generating…" : artCands.some(a => (a as any).run_id === run.id) ? "Regenerate" : "Generate artwork"}
            </button>
            <button type="button" style={RV.genBtn} onClick={() => void copyPrompt()}>
              {promptCopied ? "Copied ✓" : "Copy Gemini prompt"}
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 4 }}>Copy the prompt into the Gemini app, upload the image to Media, then pick it here and Save. No pick = your photo fills the panel.</div>
          {pages.length > 0 && (
            <>
              <div style={{ ...RV.label, marginTop: 16 }}>Pages — drag an image onto the page it belongs on</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                {pages.map(pg => {
                  const isCover = pg.kind === "cover";
                  const dark = pg.kind === "takeaway";
                  const aid = isCover ? (feed?.artAssetId ?? null) : (pageArt[String(pg.i)] ?? null);
                  const clear = () => {
                    if (isCover) setFeed(f => (f ? { ...f, artAssetId: null } : f));
                    else setPageArt(m => { const n = { ...m }; delete n[String(pg.i)]; return n; });
                  };
                  return (
                    <div
                      key={pg.i}
                      onDragOver={dark ? undefined : e => { e.preventDefault(); setDragPage(pg.i); }}
                      onDragLeave={() => setDragPage(v => (v === pg.i ? null : v))}
                      onDrop={dark ? undefined : e => {
                        e.preventDefault(); setDragPage(null);
                        try {
                          const d = JSON.parse(e.dataTransfer.getData("application/json"));
                          const aid2 = Number(d?.id);
                          if (d?.t === "asset" && Number.isInteger(aid2) && aid2 > 0) {
                            if (isCover) setFeed(f => (f ? { ...f, artAssetId: aid2 } : f));
                            else setPageArt(m => ({ ...m, [String(pg.i)]: aid2 }));
                          }
                        } catch { /* not an asset payload */ }
                      }}
                      style={{ width: 122, border: dragPage === pg.i ? `2px solid ${T.blue}` : `1px solid ${T.border}`, borderRadius: 10, padding: 8, background: dark ? "#0F1A16" : "#fff" }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: dark ? "#D8D5CA" : T.muted, textTransform: "uppercase" }}>{pg.i + 1} · {pg.kind}</div>
                      <div style={{ fontSize: 11, color: dark ? "#F3F1EA" : T.ink, lineHeight: 1.3, margin: "4px 0 6px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{pg.heading}</div>
                      {dark ? (
                        <div style={{ fontSize: 10, color: "#8FD0AE" }}>your photo page</div>
                      ) : aid ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {thumbs[aid]
                            ? <img src={thumbs[aid]} alt="" style={{ width: 30, height: 38, objectFit: "cover", borderRadius: 5 }} />
                            : <span style={{ fontSize: 10, color: T.muted }}>image set</span>}
                          <button type="button" title="Remove the image" onClick={clear} style={{ border: "none", background: "none", color: T.muted, cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: T.muted2 }}>drop image</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 4 }}>Save to apply — page images show in the Carousel PDF.</div>
            </>
          )}
          <div style={RV.btnRow}>
            <button type="button" style={RV.saveBtn} disabled={saving !== null} onClick={save}>{saving === "save" ? "Saving…" : "Save & re-preview"}</button>
            {approved
              ? <button type="button" style={RV.reopenBtn} disabled={saving !== null} onClick={() => setReview("draft")}>Reopen draft</button>
              : <button type="button" style={RV.approveBtn} disabled={saving !== null} onClick={() => setReview("approved")}>{saving === "approve" ? "…" : "Approve"}</button>}
          </div>
          {err && <div style={{ marginTop: 8, fontSize: 12.5, color: "#B3261E" }}>{err}</div>}
          <div style={{ ...RV.label, marginTop: 18 }}>Export</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <button type="button" style={RV.exportBtn} onClick={() => onGrab("card")}>1-pager PNG</button>
            <button type="button" style={RV.exportBtn} onClick={() => onGrab("lipdf")}>Carousel PDF</button>
            <button type="button" style={RV.exportBtn} onClick={onCopyPost}>Copy post text</button>
            <button type="button" style={{ ...RV.exportBtn, color: T.muted }} onClick={() => onGrab("md")}>Markdown</button>
          </div>
        </div>
        <div style={RV.previewCol}>
          <div style={RV.pvTag}>1-pager</div>
          {pvState === "ok" && preview ? (
            <a href={preview} target="_blank" rel="noreferrer" title="Open full size">
              <img src={preview} alt="1-pager preview" style={RV.previewImg} />
            </a>
          ) : pvState === "loading" ? (
            <div style={{ ...RV.previewEmpty, gap: 10 }}>
              <Spinner />
              <span>Rendering the 1-pager — a few seconds…</span>
            </div>
          ) : (
            <div style={{ ...RV.previewEmpty, flexDirection: "column", gap: 10, padding: "0 14px", textAlign: "center" }}>
              <span style={{ color: "#B3261E", fontWeight: 600 }}>{pvErr}</span>
              <button type="button" style={RV.exportBtn} onClick={() => { pvTriedRef.current = 0; void loadPreview(); }}>Try again</button>
            </div>
          )}
          <div style={{ ...RV.pvTag, marginTop: 14 }}>Carousel cover</div>
          {coverState === "ok" && coverPv ? (
            <a href={coverPv} target="_blank" rel="noreferrer" title="Open full size">
              <img src={coverPv} alt="Carousel cover preview" style={RV.previewImg} />
            </a>
          ) : coverState === "loading" ? (
            <div style={{ ...RV.previewEmpty, gap: 10, minHeight: 120 }}>
              <Spinner />
              <span>Rendering the cover…</span>
            </div>
          ) : (
            <div style={{ ...RV.previewEmpty, minHeight: 80 }}>
              <button type="button" style={RV.exportBtn} onClick={() => void loadCover()}>Retry cover preview</button>
            </div>
          )}
        </div>
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

  // The create form lives inside the manager's inspector pane.
  form: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: T.shCard, padding: "16px 16px 18px" },
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
  rowErr: { fontSize: 12, color: "#B3261E", marginTop: 3, lineHeight: 1.4 },
  tinyBtn: { flex: "none", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font },

  empty: { fontSize: 13, color: T.muted, padding: "14px 2px" },

  outGrid: { marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 },
  outCard: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, textAlign: "left", padding: "11px 13px", borderRadius: 12, border: `1px solid ${T.inputBd}`, background: T.white, cursor: "pointer", fontFamily: T.font },
  outCardOn: { borderColor: T.blue, background: T.blueBg3, boxShadow: `0 0 0 1px ${T.blue} inset` },
  outCardTitle: { fontSize: 13.5, fontWeight: 700 },
  outCardBlurb: { fontSize: 12, color: T.muted, lineHeight: 1.45 },

  chip: { flex: "none", fontSize: 11.5, fontWeight: 700, borderRadius: 99, padding: "3px 10px", letterSpacing: "0.02em" },
  chipDraft: { background: "#FBF3E2", color: "#8A6A2B", border: "1px solid #E7D5AC" },
  chipOk: { background: "#E7F0EC", color: "#0F4E3C", border: "1px solid #BFD8CD" },
};

/* Finder library styles — the manager fills the app frame. */
const F: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", alignItems: "stretch", flex: 1, minHeight: 0, background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: T.shCard, overflow: "hidden" },

  side: { width: 176, flex: "none", background: T.surface, borderRight: `1px solid ${T.border}`, padding: "12px 8px", overflowY: "auto" },
  divider: { flex: "none", width: 7, margin: "0 -3px", cursor: "col-resize", zIndex: 5, position: "relative", touchAction: "none" },
  connBar: { flex: "none", padding: "7px 12px", background: "#FDF1E4", borderBottom: "1px solid #EBD7BC", color: "#8A5A1E", fontSize: 12, fontWeight: 600, lineHeight: 1.45 },
  sideHead: { fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6 },
  sideRow: { display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "transparent", border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", fontFamily: T.font },
  sideRowOn: { background: T.blueBg3 },
  sideRowHot: { background: "#E3EEFF", boxShadow: `inset 0 0 0 1.5px ${T.blue}` },
  groupAdd: { marginLeft: "auto", background: "transparent", border: "none", color: T.blue, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.font, padding: "0 2px", letterSpacing: "0.02em", textTransform: "none" as const },
  groupEmpty: { fontSize: 11.5, color: T.muted2, padding: "2px 8px 6px 20px" },
  sideLabel: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sideCount: { flex: "none", fontSize: 11.5, color: T.muted, fontWeight: 600 },

  main: { flex: 1, minWidth: 260, display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, background: T.white },
  campBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${T.border}`, background: T.surface },
  campName: { fontSize: 13, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  campMeta: { fontSize: 11.5, color: T.muted, marginTop: 1 },
  listHead: { padding: "10px 12px 6px", display: "flex", gap: 8, alignItems: "center" },
  filter: { flex: 1, minWidth: 0, height: 30, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 10px", fontSize: 12.5, color: T.ink, fontFamily: T.font, outline: "none", boxSizing: "border-box" },
  toolBtn: { flex: "none", height: 30, background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0 12px", fontSize: 12, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },
  newBtn: { display: "block", width: "100%", marginBottom: 6, background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "9px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textAlign: "center" },
  newBtnOn: { boxShadow: `0 0 0 2px ${T.white}, 0 0 0 4px ${T.blue}` },
  importBtn: { display: "block", width: "100%", marginBottom: 12, background: T.white, color: T.blue, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textAlign: "center" },
  createWrap: { padding: "12px 12px 18px" },
  cols: { display: "flex", gap: 6, padding: "4px 16px 6px", fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}` },
  rows: { flex: 1, overflowY: "auto", padding: "4px 6px 8px" },
  row: { display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", background: "transparent", border: "none", borderRadius: 8, padding: "8px 8px", cursor: "pointer", fontFamily: T.font },
  rowOn: { background: T.blueBg3 },
  rowIcon: { width: 16, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  rowName: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowCol: { width: 104, flex: "none", fontSize: 11.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  emptyList: { padding: "18px 12px", fontSize: 12.5, color: T.muted },

  // Responsive: gives the list room on narrow windows instead of clipping.
  prev: { width: "min(400px, 38%)", minWidth: 300, flex: "none", overflowY: "auto", background: T.white },
  prevInner: { display: "flex", flexDirection: "column", padding: "14px 14px 16px" },
  prevEmpty: { padding: 18, fontSize: 12.5, color: T.muted },
  prevTitle: { fontSize: 13.5, fontWeight: 700, color: T.ink, lineHeight: 1.35 },
  prevMeta: { fontSize: 11.5, color: T.muted, marginTop: 4, lineHeight: 1.5 },
  prevLabel: { fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 16, marginBottom: 6 },
  docRow: { display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: T.white, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 10px", cursor: "pointer", fontFamily: T.font, marginTop: 5 },
  docLabel: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600 },
  docGet: { flex: "none", fontSize: 11.5, fontWeight: 700, color: T.blue },
  reviewBtn: { marginTop: 10, background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font, alignSelf: "flex-start" },

  act: { maxHeight: 240, overflowY: "auto", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 10px" },
  actLine: { display: "flex", gap: 8, padding: "2.5px 0", alignItems: "baseline" },
  actTime: { flex: "none", width: 38, fontSize: 10.5, color: T.muted2, fontVariantNumeric: "tabular-nums" },
  actText: { fontSize: 12, color: T.ink3, lineHeight: 1.45, minWidth: 0, overflowWrap: "anywhere" },
  actEmpty: { fontSize: 12, color: T.muted, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px" },

  smallBtn: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 11px", fontSize: 12, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font },
  moveSel: { marginTop: 8, height: 32, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 8px", fontSize: 12.5, color: T.ink, fontFamily: T.font, maxWidth: "100%" },
  prevImg: { marginTop: 12, width: "100%", display: "block", borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: T.shCard },
  prevPdf: { marginTop: 12, width: "100%", height: 460, display: "block", border: `1px solid ${T.border}`, borderRadius: 10, background: "#fff" },
  // Performance inspector — the import's verbatim stats + Yulia's read.
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: 8 },
  statBox: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px" },
  statNum: { fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" as const },
  statLbl: { fontSize: 11.5, color: T.muted, marginTop: 2 },
  topPost: { display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, fontSize: 12.5, color: T.ink3, textDecoration: "none", marginBottom: 6 },
  mdWrap: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", maxHeight: 520, overflowY: "auto" as const },
  mdH1: { fontSize: 15, fontWeight: 800, color: T.ink, margin: "2px 0 6px" },
  mdH2: { fontSize: 13.5, fontWeight: 800, color: T.ink, margin: "12px 0 4px" },
  mdH3: { fontSize: 12.5, fontWeight: 700, color: T.ink, margin: "10px 0 3px" },
  mdP: { fontSize: 12.5, color: T.ink3, lineHeight: 1.6, margin: "4px 0" },
  mdLi: { fontSize: 12.5, color: T.ink3, lineHeight: 1.55, margin: "2px 0 2px 6px" },
};

/* The canvas-app frame + slide-over sheets (absolute inside the frame —
   never position:fixed, the Safari toolbar rule). */
const A: Record<string, React.CSSProperties> = {
  frame: { flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column", padding: "0 26px 18px" },
  sheetWrap: { position: "absolute", inset: 0, zIndex: 40, display: "flex", justifyContent: "flex-end" },
  scrim: { position: "absolute", inset: 0, background: "rgba(15,20,26,0.32)" },
  sheet: { position: "relative", width: "min(1080px, 94%)", height: "100%", background: T.surface, borderLeft: `1px solid ${T.border}`, borderRadius: "14px 0 0 14px", boxShadow: "0 12px 40px rgba(15,20,26,0.28)", display: "flex", flexDirection: "column", overflow: "hidden" },
  sheetHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 22px", borderBottom: `1px solid ${T.border}`, background: T.white, flex: "none" },
  sheetTitle: { fontSize: 15, fontWeight: 700, color: T.ink },
  sheetClose: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 99, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, color: T.ink3, cursor: "pointer", fontFamily: T.font },
  sheetBody: { flex: 1, minHeight: 0, overflowY: "auto", padding: "2px 26px 34px" },
  // Above the sheets (z 40) so export/save feedback is never hidden.
  toast: { position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 30, zIndex: 60, background: T.white, border: `1px solid ${T.border}`, borderRadius: 99, boxShadow: "0 6px 24px rgba(15,20,26,0.16)", padding: "10px 20px", fontSize: 12.5, fontWeight: 600, maxWidth: "72%", lineHeight: 1.45 },
};

const RV: Record<string, React.CSSProperties> = {
  // Stands alone below the library (it used to attach under a run row).
  panel: { border: `1px solid ${T.border}`, borderRadius: 12, background: T.surface, padding: "16px 18px", marginTop: 10 },
  cols: { display: "flex", gap: 22, flexWrap: "wrap" },
  editCol: { flex: 1, minWidth: 300 },
  previewCol: { width: 280, flex: "none" },
  previewImg: { width: "100%", display: "block", borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: T.shCard },
  previewEmpty: { width: "100%", aspectRatio: "1080 / 1350", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, color: T.muted, border: `1px dashed ${T.border}`, borderRadius: 10 },
  pvTag: { fontSize: 11.5, fontWeight: 700, color: T.muted, marginBottom: 6 },
  artRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 6 },
  artThumb: { width: 56, height: 70, borderRadius: 8, border: `1.5px solid ${T.inputBd}`, background: T.white, padding: 0, overflow: "hidden", cursor: "pointer" },
  artThumbOn: { borderColor: T.blue, boxShadow: `0 0 0 2px ${T.blueBg3}` },
  artThumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  genBtn: { height: 34, borderRadius: 999, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 14px", fontSize: 12.5, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },
  label: { fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.04em" },
  textarea: { marginTop: 6, width: "100%", resize: "vertical", borderRadius: 10, border: `1px solid ${T.inputBd}`, padding: "9px 11px", fontSize: 13.5, lineHeight: 1.5, color: T.ink, fontFamily: T.font, background: T.white, boxSizing: "border-box" },
  input: { flex: 1, minWidth: 0, height: 34, borderRadius: 9, border: `1px solid ${T.inputBd}`, padding: "0 10px", fontSize: 13, color: T.ink, fontFamily: T.font, background: T.white },
  point: { display: "flex", gap: 7, marginTop: 7, alignItems: "center" },
  ptDel: { flex: "none", width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.muted, cursor: "pointer", fontSize: 15, lineHeight: 1 },
  addPt: { marginTop: 8, background: "transparent", border: `1px dashed ${T.border}`, borderRadius: 9, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font },
  btnRow: { marginTop: 14, display: "flex", gap: 9, flexWrap: "wrap" },
  saveBtn: { background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font },
  approveBtn: { background: T.green, color: "#fff", border: "none", borderRadius: T.rPill, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font },
  reopenBtn: { background: "transparent", color: T.ink3, border: `1px solid ${T.border}`, borderRadius: T.rPill, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font },
  exportBtn: { background: T.white, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, color: T.blue, cursor: "pointer", fontFamily: T.font },
};
