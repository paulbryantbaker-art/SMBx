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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [sheet, setSheet] = useState<null | "collateral">(null); // composer sheet

  const refresh = useCallback(async () => {
    try {
      const [r, s, u, a] = await Promise.all([
        api<{ runs: RunRow[] }>("/research/runs"),
        api<{ schedules: ScheduleRow[] }>("/research/schedules"),
        api<{ spentCents: number; capCents: number }>("/research/usage"),
        api<{ assets: AssetRow[] }>("/studio/assets"),
      ]);
      setRuns(r.runs ?? []);
      setSchedules(s.schedules ?? []);
      setUsage(u);
      setAssets(a.assets ?? []);
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
        setNote({ kind: "ok", text: runNow ? "Campaign created — the first run is going now." : "Campaign created." });
        setCampName("");
        setAsCampaign(false);
      } else {
        await api("/research/runs", {
          method: "POST",
          body: JSON.stringify({ researchType: typeKey, topic: topic.trim(), depth, outputFormat: output, postAngle: angle }),
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
        runs={runs}
        schedules={schedules}
        assets={assets}
        typeLabel={typeLabel}
        angleLabel={angleLabel}
        dl={dl}
        reviewId={reviewId}
        createForm={createForm}
        onReview={(id) => setReviewId(reviewId === id ? null : id)}
        onGrab={grab}
        onCopyPost={copyPost}
        onRerunRun={rerunRun}
        onMoveRun={moveRun}
        onArchiveRun={archiveRun}
        onDeleteRun={deleteRun}
        onToggleSchedule={toggleSchedule}
        onDeleteSchedule={deleteSchedule}
        onDeleteAsset={deleteAsset}
        onDownloadAsset={downloadAsset}
        onUploadPhoto={uploadPhoto}
        onNewCard={() => setSheet("collateral")}
      />

      {sheet === "collateral" && (
        <Sheet title="Media & collateral studio" onClose={() => { setSheet(null); void refresh(); }}>
          <StudioAnnouncement />
          <StudioPostCards />
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
  | { kind: "collateral" };

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

function SideRow({ label, count, on, onClick, tint, dim }: {
  label: string; count: number; on: boolean; onClick: () => void; tint: string; dim?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} style={{ ...F.sideRow, ...(on ? F.sideRowOn : null), opacity: dim ? 0.62 : 1 }}>
      <FolderGlyph c={on ? T.blue : tint} />
      <span style={{ ...F.sideLabel, color: on ? T.blue : T.ink }}>{label}</span>
      <span style={F.sideCount}>{count}</span>
    </button>
  );
}

function Library({ loaded, runs, schedules, assets, typeLabel, angleLabel, dl, reviewId, createForm, onReview, onGrab, onCopyPost, onRerunRun, onMoveRun, onArchiveRun, onDeleteRun, onToggleSchedule, onDeleteSchedule, onDeleteAsset, onDownloadAsset, onUploadPhoto, onNewCard }: {
  loaded: boolean;
  runs: RunRow[];
  schedules: ScheduleRow[];
  assets: AssetRow[];
  typeLabel: (k: string) => string;
  angleLabel: (k?: string | null) => string | null;
  dl: string | null;
  reviewId: number | null;
  createForm: React.ReactNode;
  onReview: (id: number) => void;
  onGrab: (r: RunRow, kind: "pdf" | "card" | "md" | "lipdf") => void;
  onCopyPost: (r: RunRow) => void;
  onRerunRun: (r: RunRow) => void;
  onMoveRun: (r: RunRow, scheduleId: number | null) => void;
  onArchiveRun: (r: RunRow, archived: boolean) => void;
  onDeleteRun: (r: RunRow) => void;
  onToggleSchedule: (s: ScheduleRow) => void;
  onDeleteSchedule: (s: ScheduleRow) => void;
  onDeleteAsset: (a: AssetRow) => void;
  onDownloadAsset: (a: AssetRow) => void;
  onUploadPhoto: (f: File) => void;
  onNewCard: () => void;
}) {
  const [sel, setSel] = useState<FolderSel>({ kind: "all" });
  const [selRunId, setSelRunId] = useState<number | null>(null);
  const [selAssetId, setSelAssetId] = useState<number | null>(null);
  // The inspector shows the CREATE form or the selected item.
  const [insp, setInsp] = useState<"create" | "item">("item");
  const [filter, setFilter] = useState("");
  const lastAutoRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  // A freshly started run selects itself so its live trail is on screen
  // immediately — once per run, so a later manual selection sticks.
  useEffect(() => {
    const newest = runs[0];
    if (newest && (newest.status === "queued" || newest.status === "running") && lastAutoRef.current !== newest.id) {
      lastAutoRef.current = newest.id;
      setSel(newest.schedule_id != null ? { kind: "camp", id: newest.schedule_id } : { kind: "all" });
      setSelRunId(newest.id);
      setInsp("item"); // flip the inspector to the live trail
    }
  }, [runs]);

  // Keep the selection inside the visible set (per mode).
  useEffect(() => {
    if (assetMode) {
      if (selAssetId != null && assetItems.some((a) => a.id === selAssetId)) return;
      const next = assetItems[0]?.id ?? null;
      if (next !== selAssetId) setSelAssetId(next);
      return;
    }
    if (selRunId != null && items.some((r) => r.id === selRunId)) return;
    const next = items[0]?.id ?? null;
    if (next !== selRunId) setSelRunId(next);
  }, [assetMode, items, selRunId, assetItems, selAssetId]);

  const selRun = items.find((r) => r.id === selRunId) ?? null;
  const selAsset = assetItems.find((a) => a.id === selAssetId) ?? null;
  const selCamp = sel.kind === "camp" ? schedules.find((s) => s.id === sel.id) ?? null : null;

  return (
    <div style={F.wrap}>
      {/* folders */}
      <div style={F.side}>
        <button type="button" style={{ ...F.newBtn, ...(insp === "create" ? F.newBtnOn : null) }} onClick={() => setInsp("create")}>
          + New research
        </button>
        <div style={F.sideHead}>Library</div>
        <SideRow label="All research" count={activeRuns.length} on={sel.kind === "all"} onClick={() => setSel({ kind: "all" })} tint="#6E9BE0" />
        <SideRow label="One-off runs" count={oneoffs.length} on={sel.kind === "oneoff"} onClick={() => setSel({ kind: "oneoff" })} tint="#A8AEB8" />
        <SideRow label="Archived" count={archivedRuns.length} on={sel.kind === "archived"} onClick={() => setSel({ kind: "archived" })} tint="#C9CDD3" />
        {schedules.length > 0 && <div style={{ ...F.sideHead, marginTop: 14 }}>Campaigns</div>}
        {schedules.map((s) => (
          <SideRow
            key={s.id}
            label={s.name}
            count={(byCamp.get(s.id) ?? []).length}
            on={sel.kind === "camp" && sel.id === s.id}
            onClick={() => setSel({ kind: "camp", id: s.id })}
            tint={s.active ? "#63B98F" : "#A8AEB8"}
            dim={!s.active}
          />
        ))}
        <div style={{ ...F.sideHead, marginTop: 14 }}>Assets</div>
        <SideRow label="Media" count={photos.length} on={sel.kind === "media"} onClick={() => setSel({ kind: "media" })} tint="#D9A441" />
        <SideRow label="Collateral" count={collateral.length} on={sel.kind === "collateral"} onClick={() => setSel({ kind: "collateral" })} tint="#8B7BD8" />
      </div>

      {/* file list */}
      <div style={F.main}>
        {selCamp && (
          <div style={F.campBar}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={F.campName}>{selCamp.name}{selCamp.active ? "" : " · paused"}</div>
              <div style={F.campMeta}>
                {angleLabel(selCamp.post_angle) ? `${angleLabel(selCamp.post_angle)} · ` : ""}{typeLabel(selCamp.research_type)} · {CADENCE_LABELS[selCamp.cadence] ?? selCamp.cadence}
                {selCamp.active && selCamp.next_run_at ? ` · next ${new Date(selCamp.next_run_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : ""}
              </div>
            </div>
            <button type="button" style={R.tinyBtn} onClick={() => onToggleSchedule(selCamp)}>{selCamp.active ? "Pause" : "Resume"}</button>
            <button type="button" style={{ ...R.tinyBtn, color: T.muted }} onClick={() => onDeleteSchedule(selCamp)}>Delete</button>
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
        </div>
        <div style={F.cols}>
          <span style={{ flex: 1 }}>Name</span>
          <span style={{ width: 96, flex: "none" }}>{assetMode ? "Type" : "Format"}</span>
          <span style={{ width: 66, flex: "none" }}>{assetMode ? "Size" : "Status"}</span>
          <span style={{ width: 48, flex: "none", textAlign: "right" }}>Date</span>
        </div>
        <div style={F.rows}>
          {!loaded && <div style={F.emptyList}>Loading…</div>}
          {loaded && assetMode && assetItems.length === 0 && (
            <div style={F.emptyList}>{q ? "Nothing matches the filter." : sel.kind === "media" ? "No photos yet — upload below in Media." : "No collateral yet — every card you render lands here."}</div>
          )}
          {loaded && !assetMode && items.length === 0 && (
            <div style={F.emptyList}>{q ? "Nothing matches the filter." : sel.kind === "archived" ? "Nothing archived." : "No runs in this folder yet."}</div>
          )}
          {assetMode
            ? assetItems.map((a) => {
                const on = a.id === selAssetId;
                return (
                  <button key={a.id} type="button" onClick={() => { setSelAssetId(a.id); setInsp("item"); }} style={{ ...F.row, ...(on ? F.rowOn : null) }}>
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
                  <button key={r.id} type="button" onClick={() => { setSelRunId(r.id); setInsp("item"); }} style={{ ...F.row, ...(on ? F.rowOn : null) }}>
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
        </div>
      </div>

      {/* inspector — the create form or the selected item */}
      <div style={F.prev}>
        {insp === "create" ? (
          <div style={F.createWrap}>{createForm}</div>
        ) : assetMode ? (
          selAsset ? (
            <AssetPreview asset={selAsset} onDownload={() => onDownloadAsset(selAsset)} onDelete={() => onDeleteAsset(selAsset)} />
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
            onArchive={(v) => onArchiveRun(selRun, v)}
            onDelete={() => onDeleteRun(selRun)}
          />
        ) : (
          <div style={F.createWrap}>{createForm}</div>
        )}
      </div>
    </div>
  );
}

function DocRow({ label, onClick, busy, muted }: { label: string; onClick: () => void; busy?: boolean; muted?: boolean }) {
  return (
    <button type="button" style={F.docRow} onClick={onClick} disabled={busy}>
      <DocGlyph c={muted ? T.muted : T.blue} />
      <span style={{ ...F.docLabel, color: muted ? T.muted : T.ink }}>{label}</span>
      <span style={F.docGet}>{busy ? "…" : "Get"}</span>
    </button>
  );
}

function RunPreview({ run, schedules, typeLabel, angleLabel, dl, reviewOpen, onReview, onGrab, onCopyPost, onRerun, onMove, onArchive, onDelete }: {
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
          <DocRow label="Report PDF" busy={dl === `${run.id}:pdf`} onClick={() => onGrab("pdf")} />
          {run.has_feed && <DocRow label="LinkedIn 1-pager (PNG)" busy={dl === `${run.id}:card`} onClick={() => onGrab("card")} />}
          {run.has_feed && <DocRow label="LinkedIn carousel (PDF)" busy={dl === `${run.id}:lipdf`} onClick={() => onGrab("lipdf")} />}
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

/** Asset preview — media photos and rendered collateral share it. */
function AssetPreview({ asset, onDownload, onDelete }: { asset: AssetRow; onDownload: () => void; onDelete: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let url: string | null = null;
    let alive = true;
    setSrc(null);
    fetch(`/api/studio/assets/${asset.id}/raw`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => { if (alive) { url = URL.createObjectURL(b); setSrc(url); } })
      .catch(() => { if (alive) setSrc(null); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [asset.id]);

  return (
    <div style={F.prevInner}>
      <div style={F.prevTitle}>{asset.label}</div>
      <div style={F.prevMeta}>
        {asset.kind === "collateral" ? "Rendered collateral" : "Media photo"} · {(asset.mime.split("/")[1] ?? asset.mime).toUpperCase()}
        {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""} · {fmtBytes(asset.bytes)} · {shortDate(asset.created_at)}
      </div>
      {src
        ? <img src={src} alt={asset.label} style={F.prevImg} />
        : <div style={{ ...F.actEmpty, marginTop: 12 }}>Loading preview…</div>}
      <div style={F.prevLabel}>Manage</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" style={F.smallBtn} onClick={onDownload}>Download</button>
        <button type="button" style={{ ...F.smallBtn, color: T.muted }} onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

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
interface Feed { hooks: string[]; dataPoints: FeedPoint[] }

function ReviewPanel({ run, onStatus, onCopyPost, onGrab }: {
  run: RunRow;
  onStatus: () => void;
  onCopyPost: () => void;
  onGrab: (kind: "pdf" | "card" | "md" | "lipdf") => void;
}) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState<"save" | "approve" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const approved = run.review_status === "approved";

  const loadPreview = useCallback(async () => {
    try {
      const r = await fetch(`/api/research/runs/${run.id}/card.png?t=${Date.now()}`, { headers: authHeaders() });
      if (!r.ok) return;
      const url = URL.createObjectURL(await r.blob());
      setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
    } catch { /* preview is best-effort */ }
  }, [run.id]);

  useEffect(() => {
    api<{ feed: Feed }>(`/research/runs/${run.id}/feed`)
      .then(j => setFeed({
        hooks: Array.isArray(j.feed?.hooks) && j.feed.hooks.length ? j.feed.hooks : [run.report_title || run.topic],
        dataPoints: Array.isArray(j.feed?.dataPoints) ? j.feed.dataPoints : [],
      }))
      .catch(e => setErr(e instanceof Error ? e.message : "Couldn't load the draft"));
    void loadPreview();
    return () => setPreview(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
  }, [run.id, run.report_title, run.topic, loadPreview]);

  const save = async () => {
    if (!feed) return;
    setSaving("save"); setErr(null);
    try {
      await api(`/research/runs/${run.id}/feed`, { method: "PATCH", body: JSON.stringify({ feed }) });
      await loadPreview();
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
          {preview
            ? <img src={preview} alt="1-pager preview" style={RV.previewImg} />
            : <div style={RV.previewEmpty}>Preview…</div>}
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

  side: { width: 188, flex: "none", background: T.surface, borderRight: `1px solid ${T.border}`, padding: "12px 8px", overflowY: "auto" },
  sideHead: { fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6 },
  sideRow: { display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "transparent", border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", fontFamily: T.font },
  sideRowOn: { background: T.blueBg3 },
  sideLabel: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sideCount: { flex: "none", fontSize: 11.5, color: T.muted, fontWeight: 600 },

  main: { flex: 1, minWidth: 260, display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, background: T.white },
  campBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${T.border}`, background: T.surface },
  campName: { fontSize: 13, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  campMeta: { fontSize: 11.5, color: T.muted, marginTop: 1 },
  listHead: { padding: "10px 12px 6px", display: "flex", gap: 8, alignItems: "center" },
  filter: { flex: 1, minWidth: 0, height: 30, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 10px", fontSize: 12.5, color: T.ink, fontFamily: T.font, outline: "none", boxSizing: "border-box" },
  toolBtn: { flex: "none", height: 30, background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0 12px", fontSize: 12, fontWeight: 700, color: T.blue, cursor: "pointer", fontFamily: T.font },
  newBtn: { display: "block", width: "100%", marginBottom: 12, background: T.blue, color: "#fff", border: "none", borderRadius: T.rPill, padding: "9px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font, textAlign: "center" },
  newBtnOn: { boxShadow: `0 0 0 2px ${T.white}, 0 0 0 4px ${T.blue}` },
  createWrap: { padding: "12px 12px 18px" },
  cols: { display: "flex", gap: 6, padding: "4px 16px 6px", fontSize: 11, fontWeight: 700, color: T.muted2, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}` },
  rows: { flex: 1, overflowY: "auto", padding: "4px 6px 8px" },
  row: { display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", background: "transparent", border: "none", borderRadius: 8, padding: "8px 8px", cursor: "pointer", fontFamily: T.font },
  rowOn: { background: T.blueBg3 },
  rowIcon: { width: 16, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  rowName: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowCol: { width: 96, flex: "none", fontSize: 11.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  emptyList: { padding: "18px 12px", fontSize: 12.5, color: T.muted },

  prev: { width: 400, flex: "none", overflowY: "auto", background: T.white },
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
};

const RV: Record<string, React.CSSProperties> = {
  // Stands alone below the library (it used to attach under a run row).
  panel: { border: `1px solid ${T.border}`, borderRadius: 12, background: T.surface, padding: "16px 18px", marginTop: 10 },
  cols: { display: "flex", gap: 22, flexWrap: "wrap" },
  editCol: { flex: 1, minWidth: 300 },
  previewCol: { width: 280, flex: "none" },
  previewImg: { width: "100%", display: "block", borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: T.shCard },
  previewEmpty: { width: "100%", aspectRatio: "1080 / 1350", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, color: T.muted, border: `1px dashed ${T.border}`, borderRadius: 10 },
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
