/**
 * CAMPAIGNS · CONTENT — the post schedule (SMBX_CRM_V2_SPEC.md §5, §6;
 * build order §8 step 6, pulled forward 2026-08-18 on Paul's word: "instead
 * of giving me terminal commands, just read the clone and the files and
 * build the UI to manage the campaign and you have the data").
 *
 * WHAT IT IS. One list, the plan's own weeks, one line per slot: when · what
 * kind · the title · what is READY (copy · PDF · Sunday run · gated) · the
 * state. Open a line and the thing you need is there — the post to paste
 * with ONE Copy button, the deck to download with its pages to review, the
 * plan's law check — and the state presses beside it: retired-check, the
 * post URL, Mark posted. Today's slot opens first.
 *
 * THE BOUNDARY LAW (spec §5): rows are scheduling/tracking state; the
 * canonical copy and the rendered asset live in the studio. What this screen
 * shows of the copy is CARRIED from the plan by `content/studio/
 * campaign-export.mjs` (parsed from CAMPAIGN_<date>.md, never retyped) and
 * imported as content — read-only here, overwritten by the next import.
 * Nothing on this screen edits copy. Where two captions exist for a document
 * (the plan's and the deck's) BOTH are shown with the difference named, and
 * the human picks. Posting stays manual, always: Mark posted records that a
 * human posted; posted_at is stamped server-side; the server refuses the
 * mark while retired-check is unrun or flagged.
 *
 * NOTHING HERE FIRES. No scheduler, no dispatcher, no auto-post — the queue
 * is rows carrying dates. (Migration 122 disarmed the last thing that ran
 * unattended; this surface never re-arms one.)
 *
 * Language: Carta (tokens.ts) — the same grammar as Leads and Today.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { authHeaders } from "../../hooks/useAuth";
import { C, input, btnPrimary, btnGhost, mono, chip } from "./tokens";
import { daysUntil, localIso } from "./Leads";
import { templatesForKind, templateById } from "@shared/templates";
import { copyDraftState, pagesDraftState, pagesEqual, hasLiveDraft } from "@shared/draft";
import { sendReadiness, sendState } from "@shared/studioSend";
import { PillarPick, Readings, Engagers, PillarRollup, type ReadingRow } from "./PostMetrics";
import type { PillarId, PostRow } from "@shared/pillars";

/* ── the rows, as the API returns them ───────────────────────────────── */

export interface QueueRow {
  id: number;
  queue_id: string;
  tier: string | null;          // the campaign's week id — W1…W5
  lead: string | null;          // "Tue Aug 18 · Text · P-1"
  angle: string;
  format: string | null;
  carries: string | null;
  evidence_grade: string | null;
  source_disclosure: string | null;
  may_state_figure: boolean;
  slot: string | null;
  scheduled_for: string | null;
  status: string;               // next · drafted · posted · parked · recurring
  drafted_at: string | null;
  posted_at: string | null;
  post_url: string | null;
  retired_check: string;        // clean · flagged · not_run
  notes: string | null;
  campaign: string | null;      // `2026-08-18` = the file it came from; null = the standing queue
  /* THE PILLAR (migration 142) — which of the five this post argues for. STATE:
     Paul sets it here and an import never writes it. The plan file may declare
     a different one in `format` prose; PillarPick shows both. */
  pillar: string | null;
  origin: string | null;        // 'app' = born here from a library hook or blank (migration 141)
  /* the copy (migration 136) — content, carried from the plan */
  title: string | null;
  /** The MEDIUM. null is a Mandate edition or a blackout — they carry no copy of their own. */
  kind: "text" | "image" | "video" | "document" | null;
  body: string | null;          // paste-ready: the post, or a document slot's caption
  body_alt: string | null;      // the understudy (receipt-gated slots)
  body_deck: string | null;     // the deck's caption, only where it differs from the plan's
  gate: string | null;
  copy_note: string | null;
  law_check: string | null;
  pages: { n: number; label: string | null; text: string; note: string | null }[] | null;
  document: {
    slug: string; spec: string; filed_at: string;
    pdf: string | null; cover: string | null; thumbs: string[];
    pages: number | null; bytes: number | null; deck_caption_matches: boolean;
  } | null;
  /* the plan, where the draft does not exist yet (migration 139) */
  brief: {
    hook: string | null; rehook: string | null; beats: string[];
    source: string | null; extraction: string | null; note: string | null;
  } | null;
  /* THE DRAFT (migration 138) — decisions made here before Cowork renders:
     state, never overwritten by an import. */
  template: string | null;
  copy_edit: string | null;
  copy_base: string | null;
  /* the request (migration 140) — Send to Studio, and what came back.
     Where it landed is `collateral_path`, which the row already carried. */
  sent_at: string | null;
  built_at: string | null;
  collateral_path: string | null;     // the plan text the edit was made against (shared/draft.ts)
  pages_edit: { n: number; label: string | null; text: string; note: string | null }[] | null;
  pages_base: { n: number; label: string | null; text: string; note: string | null }[] | null;
  draft_at: string | null;
}

/** A slot carries a LIVE decision Cowork has not rendered from — shared/draft.ts is the rule. */
export const hasDraft = (r: QueueRow) => hasLiveDraft(r);

/** The month's hooks — a guide, not a calendar. Read-only; never rows. */
export interface Library {
  name: string; title: string; note: string; file: string;
  pillars: { id: string; title: string; sub: string; goal: string;
             hooks: { id: string; style: string; hook: string; direction: string }[] }[];
}

export interface CampaignMeta {
  name: string;
  file: string;
  title: string | null;
  note: string | null;
  rows: number;
  weeks: Record<string, string>;
  first: string | null;
  last: string | null;
  supersedes: string | null;
  withCopy: number;
  documentsReady: number;
  withBrief: number;
}

const STATUS_LABEL: Record<string, string> = {
  next: "Next", drafted: "Drafted", posted: "Posted", parked: "Parked", recurring: "Recurring",
};

/** The standing queue (POST_QUEUE.md rows) has no campaign; this is its view id. */
const STANDING = "standing";
/** The month's hook library, as a PLACE you can go and read — not only a step
 *  inside creating a post. Paul, 2026-08-20: "Where is the campaign guide?"
 *  It shipped buried in the New post dialog, which is backwards for a thing
 *  whose job is to be browsed before you decide anything. */
const GUIDE = "guide";

export const isMandate = (r: Pick<QueueRow, "angle" | "status">) =>
  r.status === "recurring" || /^THE MANDATE/i.test(r.angle);

/**
 * What KIND of slot, in the plan's own word.
 *
 * The MEDIUM earns its own column because it is the production fact: a video
 * day needs a camera booked and a real face on it — the plan's rule is "real
 * camera, not an AI avatar" — and a row that reads "Text" hides that entirely.
 */
export function kindLabel(r: QueueRow): string {
  if (r.queue_id.startsWith("BLACKOUT")) return "Blackout";
  if (isMandate(r)) return "Mandate";
  if (r.kind === "document") return "Document";
  if (r.kind === "video") return "Video";
  if (r.kind === "image") return "Image";
  if (r.kind === "text") return "Text";
  if (/carousel/i.test(`${r.format ?? ""} ${r.angle}`)) return "Document";
  if (/^Video|🎥/.test(r.format ?? "")) return "Video";
  return "Text";
}

/** A slot the human pastes as a post: text, a single image, or a piece to camera. */
const isPost = (r: QueueRow) => r.kind === "text" || r.kind === "image" || r.kind === "video";

/** The first sentence of a gate note, for the readiness tooltip. */
const firstSentence = (t: string) => {
  const one = t.trim().split(/(?<=[.!?])\s/)[0] ?? t;
  return one.length > 110 ? one.slice(0, 107) + "…" : one;
};

/** What is READY for a slot — the answer to "what gets made and ready to post when". */
export function readiness(r: QueueRow): { text: string; ok: boolean; note?: string } {
  if (r.status === "posted") return { text: "posted", ok: true };
  // THE REQUEST OUTRANKS EVERYTHING BELOW IT, the gate included — because the
  // server refuses to send a slot whose copy still carries unfilled brackets,
  // so a slot that IS sent has already passed that check mechanically. "ready
  // to post" is the strongest state on this screen: the artifact exists, in a
  // folder, and the only thing left is to paste it.
  const send = sendState(r);
  if (send === "built") return { text: "ready to post", ok: true, note: r.collateral_path ? `filed at ${r.collateral_path}` : undefined };
  if (send === "sent") return { text: "at the studio", ok: false, note: "sent — waiting on Cowork to build it" };
  if (send === "stale") return { text: "sent · edited", ok: false, note: "you changed the decision after sending — send it again" };
  // THE GATE OUTRANKS THE EDIT: a receipt-gated frame with one bracket filled
  // is still gated, and "edited" would hide that everywhere the label shows.
  // A gate is a reason the slot cannot ship AS PLANNED — a receipt that has not
  // been extracted, or a figure the retired register blocked. It applies to a
  // brief exactly as it does to a body: the block is on the post, not the draft.
  if (isPost(r) && r.gate && (r.body || r.brief)) return { text: "gated", ok: false, note: firstSentence(r.gate) };
  // A LIVE decision Cowork has not rendered from is the next most important state — it outranks "copy · PDF".
  // A FILMED SLOT IS NEVER WAITING ON A RENDER. Nothing renders a piece to
  // camera, so "waiting on a Cowork render" describes something that will never
  // happen and reads as a step still to come.
  if (hasDraft(r)) return { text: "edited", ok: false, note: r.kind === "video" ? "your edit, saved" : "waiting on a Cowork render" };
  if (r.queue_id.startsWith("BLACKOUT")) return { text: "no post", ok: true };
  if (r.kind === "document") {
    const pdf = !!r.document?.pdf;
    if (r.body && pdf) return { text: "copy · PDF", ok: true };
    if (r.body) return { text: "copy", ok: false, note: "no PDF yet" };
    return { text: pdf ? "PDF" : "—", ok: false, note: pdf ? "no copy" : "nothing yet" };
  }
  // text · image · video all ship as a post the human pastes, so readiness is
  // about the COPY. The medium sits in its own column; the app deliberately does
  // not claim to know whether a video is filmed or an image is made — it gates
  // only on what it can actually see, which is why a document gates on a PDF
  // that exists in the build and nothing else pretends to.
  if (isPost(r)) {
    if (r.body) return r.gate ? { text: "gated", ok: false, note: firstSentence(r.gate) } : { text: "copy", ok: true };
    // A BRIEF is not a missing draft — it is the plan, which is what this stage
    // of a campaign legitimately has. Saying "—" would read as a broken import.
    if (r.brief) return { text: "brief", ok: false, note: "the plan; the draft comes from the Sunday run" };
    return { text: "—", ok: false, note: "no copy" };
  }
  if (isMandate(r)) return { text: "Sunday run", ok: false };
  return { text: "—", ok: false };
}

/** "Aug 18 – Sep 16" from two ISO dates. */
export function windowLabel(first: string | null, last: string | null): string {
  const f = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  if (first && last) return `${f(first)} – ${f(last)}`;
  return first ? f(first) : "undated";
}

/** "Tue 8/18" for a slot line. */
function dayLabel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(String(iso).slice(0, 10) + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric", timeZone: "UTC" });
}


/* ── the screen ──────────────────────────────────────────────────────── */

export default function CampaignsScreen({ openQueueId = null }: { openQueueId?: string | null }) {
  const [rows, setRows] = useState<QueueRow[] | null>(null);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignMeta[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [picking, setPicking] = useState(false);
  const [view, setView] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(openQueueId);
  const [onlyOpen, setOnlyOpen] = useState(false);

  const load = useCallback(() => {
    // Returns the rows fetch so a caller that must not resolve before the new
    // rows are on screen (a draft save) can await it.
    const rowsP = fetch("/api/post-queue/", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { setRows(d.rows ?? []); setError(null); })
      .catch(e => setError(e?.message ?? "load failed"));
    fetch("/api/post-queue/campaigns", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : { campaigns: [] }))
      .then(d => {
        const list: CampaignMeta[] = d.campaigns ?? [];
        setCampaigns(list);
        /* THE STANDING QUEUE IS THE DEFAULT VIEW (2026-08-21, Paul: "the live
           plan can go.. i will create every post based on the pillar from
           scratch"). It used to open on the newest calendar, which is right
           while a calendar is the working surface and wrong once posts are
           written one at a time from a pillar. The retired campaigns are still
           in the switcher — nothing is deleted, it just is not what opens. */
        setView(v => v ?? STANDING);
      })
      .catch(() => setCampaigns([]));
    /* What each post did. A failure here empties the rollup and costs nothing
       else — the queue itself never waits on it. */
    fetch("/api/post-queue/metrics", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : { readings: [] }))
      .then(d => setReadings(d.readings ?? []))
      .catch(() => setReadings([]));
    /* The month's hooks. Read-only and never rows — a failure here costs the
       picker its menu and nothing else, so it never blocks the queue loading. */
    fetch("/api/post-queue/library", { headers: authHeaders() })
      .then(r => (r.ok ? r.json() : { libraries: [] }))
      .then(d => setLibraries(d.libraries ?? []))
      .catch(() => setLibraries([]));
    return rowsP;
  }, []);
  useEffect(() => { load(); }, [load]);

  const total = rows ?? [];
  /* The library months that actually carry posts — a library with no posts yet
     gets no chip, because an empty chip is a question rather than a place. */
  const libRows = useMemo(
    () => [...new Set(total.map(r => r.campaign).filter((c): c is string => !!c && c.startsWith("library-")))].sort().reverse(),
    [total],
  );
  const current = campaigns.find(c => c.name === view) ?? null;
  const newest = campaigns[0] ?? null;

  /* One calendar on screen: the chosen campaign's rows (or the standing queue's). */
  const all = useMemo(
    () => total.filter(r => (view === STANDING || view === null ? r.campaign == null : r.campaign === view)),
    [total, view],
  );
  const shown = useMemo(() => onlyOpen ? all.filter(r => r.status !== "posted" && r.status !== "parked") : all, [all, onlyOpen]);

  const weekLabel: Record<string, string> = current?.weeks ?? {};
  const weeks = useMemo(() => {
    const m = new Map<string, QueueRow[]>();
    for (const r of shown) {
      const k = r.tier && weekLabel[r.tier] ? r.tier : "other";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    for (const list of m.values()) {
      list.sort((a, b) => String(a.scheduled_for ?? "9999").localeCompare(String(b.scheduled_for ?? "9999")));
    }
    // the file's week order, then anything unlabelled
    return [...Object.keys(weekLabel).filter(k => m.has(k)), ...(m.has("other") ? ["other"] : [])].map(k => [k, m.get(k)!] as const);
  }, [shown, weekLabel]);

  const tIso = localIso();
  const todays = all.find(r => String(r.scheduled_for ?? "").slice(0, 10) === tIso && r.status !== "posted") ?? null;
  const upNext = all
    .filter(r => r.status !== "posted" && r.status !== "parked" && String(r.scheduled_for ?? "").slice(0, 10) > tIso)
    .sort((a, b) => String(a.scheduled_for).localeCompare(String(b.scheduled_for)))[0] ?? null;
  const posted = all.filter(r => r.status === "posted").length;

  /* Today's slot opens by itself, once, so the press is one click away. */
  useEffect(() => {
    if (openId == null && todays) setOpenId(todays.queue_id);
  }, [todays?.queue_id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Load / re-import the campaign on screen. State-preserving by contract:
     dates only where none, the superseded calendar PARKED (never a posted
     row), the file's bookkeeping applied with the same floor. The banner says
     what moved. */
  const importCampaign = async () => {
    setBusy(true); setBanner(null);
    try {
      const name = current?.name ?? newest?.name ?? null;
      const r = await fetch("/api/post-queue/import-campaign", {
        method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(name ? { campaign: name } : {}),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) { setBanner(`Load failed: ${j?.error ?? r.status}`); return; }
      setBanner([
        `${j.title ?? j.campaign ?? "Campaign"} — ${j.inserted} slots new, ${j.updated} refreshed, ${j.scheduled} dated.`,
        j.parkedSuperseded ? `Parked ${j.parkedSuperseded} slot${j.parkedSuperseded === 1 ? "" : "s"} of the superseded calendar.` : "",
        j.parkedBookkeeping || j.draftedBookkeeping ? `Standing queue: ${j.parkedBookkeeping} parked, ${j.draftedBookkeeping} moved to drafted.` : "",
        j.keptPosted?.length ? `Left alone because already posted: ${j.keptPosted.join(", ")}.` : "",
      ].filter(Boolean).join(" "));
      if (j.campaign) setView(j.campaign);
      load();
    } finally { setBusy(false); }
  };

  const patch = useCallback(async (queueId: string, body: Record<string, unknown>): Promise<string | null> => {
    const r = await fetch(`/api/post-queue/${encodeURIComponent(queueId)}`, {
      method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `Save failed (${r.status})`;
    load();
    return null;
  }, [load]);

  /* The draft goes to its own route: PATCH /:id refuses content by law; the
     draft is the human's decision ABOUT the content. */
  /* SEND TO STUDIO (migration 140). Records the request; renders nothing —
     the app calls no builder. `undo` withdraws it and leaves every decision
     on the row alone. */
  const sendToStudio = useCallback(async (queueId: string, undo: boolean): Promise<string | null> => {
    const r = await fetch(`/api/post-queue/${encodeURIComponent(queueId)}/send`, {
      method: undo ? "DELETE" : "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `${undo ? "Withdraw" : "Send"} failed (${r.status})`;
    await load();
    return null;
  }, [load]);

  /* MAKE A POST — from a hook, or blank. The row is born here rather than in a
     file, which is the whole shape of the library model: a hook is a reference
     Paul draws from, and using one never uses it up. */
  const newPost = useCallback(async (body: Record<string, unknown>): Promise<string | null> => {
    const r = await fetch("/api/post-queue/new", {
      method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `Could not create the post (${r.status})`;
    await load();
    setPicking(false);
    // Open what was just made, on the view it landed on.
    if (j?.queue_id) { setView(j.campaign ?? STANDING); setOpenId(j.queue_id); }
    return null;
  }, [load]);

  const patchDraft = useCallback(async (queueId: string, body: Record<string, unknown>): Promise<string | null> => {
    const r = await fetch(`/api/post-queue/${encodeURIComponent(queueId)}/draft`, {
      method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `Save failed (${r.status})`;
    await load();
    return null;
  }, [load]);

  /* ── what the post did ─────────────────────────────────────────────────
     A reading is recorded against a DAY, so re-recording the same day is a
     correction and a different day is a new point on the curve. Nothing here
     ever sends a zero for a box left blank — the server reads '' as null. */
  const recordReading = useCallback(async (queueId: string, body: Record<string, string>): Promise<string | null> => {
    const r = await fetch(`/api/post-queue/${encodeURIComponent(queueId)}/metrics`, {
      method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `Could not record that (${r.status})`;
    await load();
    return null;
  }, [load]);

  const removeReading = useCallback(async (queueId: string, readOn: string): Promise<string | null> => {
    const r = await fetch(`/api/post-queue/${encodeURIComponent(queueId)}/metrics/${encodeURIComponent(readOn)}`, {
      method: "DELETE", headers: authHeaders(),
    });
    if (!r.ok) return `Could not remove that reading (${r.status})`;
    await load();
    return null;
  }, [load]);

  /* An engager becomes a LEAD, never a touch. This writes a name and a
     follow-up date; it sends nothing to anyone, which is what keeps the
     practice's one-touch-one-press-one-human law intact. */
  const saveLead = useCallback(async (lead: { name: string; org: string; linkedin_url: string; source: string }): Promise<string | null> => {
    const r = await fetch("/api/leads", {
      method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, status: "identified" }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `Could not save the lead (${r.status})`;
    return null;
  }, []);

  const markPosted = useCallback(async (queueId: string, postUrl: string, retiredCheck: string): Promise<string | null> => {
    const r = await fetch(`/api/post-queue/${encodeURIComponent(queueId)}/posted`, {
      method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ postUrl: postUrl || null, retiredCheck: retiredCheck || null }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) return j?.error ?? `Could not mark posted (${r.status})`;
    load();
    return null;
  }, [load]);

  const loadLabel = `Load ${(current ?? newest)?.title ?? (current ?? newest)?.name ?? "campaign"}`;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontFamily: C.display, fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Campaigns
        </h1>
        {current && all.length > 0 && (
          <span style={mono}>
            {windowLabel(current.first, current.last)} · {all.length} slots · {posted} posted
          </span>
        )}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 680 }}>
        The post schedule. Each slot carries the plan's copy ready to paste and, for a
        document, the deck to download — you post on LinkedIn by hand and mark it here.
      </p>

      {/* WHICH VIEW — the dated calendars, then the months of library posts, then
          the standing queue. A library's posts carry `library-<month>` as their
          campaign, so without a chip of their own they would import fine and be
          invisible: `view` could never equal a value nothing offered. */}
      {(campaigns.length > 0 || libRows.length > 0 || libraries.length > 0) &&
       (campaigns.length + libRows.length + (libraries.length ? 1 : 0) > 1 || total.some(r => r.campaign == null)) && (
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {libraries.length > 0 && (
            <button type="button" onClick={() => { setView(GUIDE); setOpenId(null); }}
                    style={{ ...btnGhost, ...(view === GUIDE ? { border: `1px solid ${C.green}`, color: C.green } : null) }}
                    title="The month's hooks — read them any time; start a post from one when you are ready.">
              Guide
              <span style={{ ...mono, marginLeft: 8 }}>
                {libraries[0].pillars.reduce((n, p) => n + p.hooks.length, 0)}
              </span>
            </button>
          )}
          {libRows.map(name => (
            <button key={name} type="button" onClick={() => { setView(name); setOpenId(null); }}
                    style={{ ...btnGhost, ...(view === name ? { border: `1px solid ${C.green}`, color: C.green } : null) }}>
              {libraries.find(l => `library-${l.name}` === name)?.title?.replace(/^.*· /, "") ?? name}
              <span style={{ ...mono, marginLeft: 8 }}>{total.filter(r => r.campaign === name).length}</span>
            </button>
          ))}
          {campaigns.map(c => (
            <button key={c.name} type="button" onClick={() => { setView(c.name); setOpenId(null); }}
                    style={{ ...btnGhost, ...(view === c.name ? { border: `1px solid ${C.green}`, color: C.green } : null) }}>
              {windowLabel(c.first, c.last)}{c.name !== newest?.name ? " · superseded" : ""}
              <span style={{ ...mono, marginLeft: 8 }}>{total.filter(r => r.campaign === c.name).length}</span>
            </button>
          ))}
          {total.some(r => r.campaign == null) && (
            <button type="button" onClick={() => { setView(STANDING); setOpenId(null); }}
                    style={{ ...btnGhost, ...(view === STANDING ? { border: `1px solid ${C.green}`, color: C.green } : null) }}>
              Standing queue <span style={{ ...mono, marginLeft: 8 }}>{total.filter(r => r.campaign == null).length}</span>
            </button>
          )}
        </div>
      )}

      {banner && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.greenTint, fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>
          {banner}
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12, padding: "9px 13px", background: C.dangerTint, fontSize: 13.5, color: C.ink }}>
          The schedule did not load ({error}). Reload the page.
        </div>
      )}

      {/* the first press: nothing loaded for this campaign */}
      {/* THE GUIDE — the month's hooks, readable on their own. Rendered in place
          of the slot list, because it is not a calendar and the week headers,
          Today and Up next would all be answering questions it does not have. */}
      {view === GUIDE && (
        <div style={{ marginTop: 20, maxWidth: 780 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{libraries[0]?.title ?? "The guide"}</span>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => setPicking(true)} style={btnGhost}>Blank post</button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.body, lineHeight: 1.6 }}>
            The month's hooks, from that month's research. A hook is a starting point, not a post —
            press one to start a post from it and write the copy yourself. Picking a hook never uses
            it up, so one can carry three posts or none.
          </p>
          <HookList lib={libraries[0] ?? null} busy={busy}
                    onPick={id => { setBusy(true); newPost({ hookId: id, kind: "text" }).then(e => { setBusy(false); if (e) setBanner(e); }); }} />
        </div>
      )}

      {/* A library view is never empty by construction (its chip only exists
          where posts do), so this card is the CAMPAIGN one and must not claim a
          library needs loading — nor the guide, which is not a campaign at all. */}
      {rows !== null && !error && all.length === 0 && view !== STANDING && view !== GUIDE && !String(view ?? "").startsWith("library-") && (
        <div style={{ marginTop: 26, padding: "18px 20px", background: C.panel, maxWidth: 680 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {current ? "This campaign is not loaded yet" : newest ? "No campaign loaded" : "No campaign file ships with this build"}
          </div>
          {(current ?? newest) && (
            <p style={{ margin: "8px 0 12px", fontSize: 14, color: C.body, lineHeight: 1.6 }}>
              {(current ?? newest)!.title ?? (current ?? newest)!.name} · {(current ?? newest)!.rows} slots ·{" "}
              {windowLabel((current ?? newest)!.first, (current ?? newest)!.last)}
              {(current ?? newest)!.withCopy ? ` · ${(current ?? newest)!.withCopy} with copy` : ""}
              {(current ?? newest)!.withBrief ? ` · ${(current ?? newest)!.withBrief} briefed` : ""}
              {(current ?? newest)!.documentsReady ? ` · ${(current ?? newest)!.documentsReady} PDF${(current ?? newest)!.documentsReady === 1 ? "" : "s"} ready` : ""}
              . Loading it creates the calendar with each slot's copy ready to paste — or, where the
              plan is ahead of the drafts, the brief the post gets written from. Drafting stays in
              Cowork and posting stays a human press on LinkedIn — this screen only ever tracks.
              {(current ?? newest)!.supersedes ? ` It parks the ${(current ?? newest)!.supersedes} calendar's slots (never a posted one) and says so.` : ""}
            </p>
          )}
          {(current ?? newest) && !campaigns.some(c => c.supersedes === (current ?? newest)!.name) ? (
            <button type="button" onClick={importCampaign} disabled={busy} style={btnPrimary}>
              {busy ? "Loading…" : loadLabel}
            </button>
          ) : (current ?? newest) ? (
            <p style={{ margin: 0, fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
              This calendar is superseded by{" "}
              {campaigns.find(c => c.supersedes === (current ?? newest)!.name)?.name} and cannot be
              loaded — its slots stay readable under their own chip once the newer campaign is loaded.
            </p>
          ) : null}
        </div>
      )}
      {rows !== null && !error && all.length === 0 && view === STANDING && (
        <div style={{ marginTop: 26 }}>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: C.muted }}>Nothing here yet.</p>
          <button type="button" onClick={() => setPicking(true)} style={btnPrimary}>New post</button>
        </div>
      )}

      {picking && <HookPicker libraries={libraries} onPick={newPost} onClose={() => setPicking(false)} />}

      {all.length > 0 && (
        <>
          {/* today · up next */}
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Focus label={todays ? "Today" : "Today"} row={todays} empty="No slot today." onOpen={id => { setOpenId(id); document.getElementById(`slot-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }} />
            <Focus label="Up next" row={upNext} empty="Nothing further scheduled." onOpen={id => { setOpenId(id); document.getElementById(`slot-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }} />
          </div>

          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setPicking(true)} style={btnPrimary}
                    title="Start a post from one of the month's hooks, or blank. Nothing is scheduled until you give it a date.">
              New post
            </button>
            <button type="button" onClick={() => setOnlyOpen(v => !v)}
                    style={{ ...btnGhost, ...(onlyOpen ? { border: `1px solid ${C.green}`, color: C.green } : null) }}>
              {onlyOpen ? "Showing open slots" : "Show open slots only"}
            </button>
            <div style={{ flex: 1 }} />
            {/* A SUPERSEDED calendar has no re-import button, because the server
                refuses that import by design: its rows were parked by the newer
                file's press, and re-reading a file whose rows say `next` would
                read as a step FORWARD from `parked` and quietly un-park the
                retired calendar. The chip already says "superseded"; a button
                that can only ever error does not belong beside it. The test is
                the server's own — does any other campaign supersede this one. */}
            {view !== STANDING && current && !campaigns.some(c => c.supersedes === current.name) && (
              <button type="button" onClick={importCampaign} disabled={busy} style={btnGhost}
                      title="Re-import this campaign's content from the file that ships with the app. State-preserving: it can never un-post or re-date anything a human set.">
                {busy ? "Loading…" : `Re-import ${current.name}`}
              </button>
            )}
          </div>

          {/* BY PILLAR — the reason the tagging and the typing exist. Reads `all`
              rather than `shown`, so hiding posted slots cannot silently change
              the mix. Blackouts carry no argument, so they are not "untagged". */}
          <div style={{ marginTop: 18 }}>
            <PillarRollup
              posts={all
                .filter(r => !r.queue_id.startsWith("BLACKOUT"))
                .map(r => ({
                  queueId: r.queue_id,
                  pillar: (r.pillar ?? null) as PillarId | null,
                  status: r.status,
                  campaign: r.campaign,
                } satisfies PostRow))}
              readings={readings}
              campaign={view === STANDING ? null : (view ?? null)}
            />
          </div>

          <div style={{ marginTop: 10, borderTop: `1px solid ${C.hair}` }}>
            {weeks.map(([w, group]) => (
              <div key={w}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "14px 4px 6px" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {weekLabel[w] ?? (view === STANDING ? "Standing queue"
                      : String(view ?? "").startsWith("library-") ? "Posts from this month's hooks"
                      : "Unscheduled")}
                  </span>
                  <span style={mono}>{group.filter(r => r.status === "posted").length}/{group.length} posted</span>
                </div>
                {group.map(r => (
                  <SlotLine
                    key={r.queue_id}
                    row={r}
                    open={openId === r.queue_id}
                    isToday={r.queue_id === todays?.queue_id}
                    onToggle={() => setOpenId(openId === r.queue_id ? null : r.queue_id)}
                    onPatch={b => patch(r.queue_id, b)}
                    onPatchDraft={b => patchDraft(r.queue_id, b)}
                    readings={readings}
                    onRecordReading={b => recordReading(r.queue_id, b)}
                    onRemoveReading={d => removeReading(r.queue_id, d)}
                    onSaveLead={saveLead}
                    onSend={undo => sendToStudio(r.queue_id, undo)}
                    onMarkPosted={(u, c) => markPosted(r.queue_id, u, c)}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ marginTop: 22, fontSize: 12.5, color: C.muted, lineHeight: 1.6, maxWidth: 680 }}>
        Slots group by the plan's own weeks and sort by date. Copy and decks are the plan's,
        carried in by import and read-only here — edit in the studio, re-export, re-import; a
        re-import can never un-post a row. Nothing here fires: Mark posted records that you
        posted, and a slot that may state figures cannot be marked posted until retired-check
        has run clean on its caption — the server refuses, not the button.
      </p>
    </div>
  );
}

/* ── the month's hooks, as a list ────────────────────────────────────── */

/**
 * The pillars and their hooks, rendered once and used twice: as the browsable
 * GUIDE and inside the New post dialog. One rendering, because two would drift
 * and the guide is the thing Paul reads before he decides anything.
 *
 * A hook row is a button, and pressing it starts a post — reading and using are
 * the same surface, which is what "curate the idea" wants. It is never consumed:
 * the hook stays on the list afterwards.
 */
function HookList({ lib, busy, onPick }: {
  lib: Library | null; busy: boolean; onPick: (hookId: string) => void;
}) {
  if (!lib) {
    return (
      <p style={{ marginTop: 16, fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
        No hook library ships with this build. A library is a monthly file
        (<code style={code}>content/studio/library-&lt;month&gt;.json</code>) written from that month's research.
      </p>
    );
  }
  return (
    <>
      {lib.pillars.map(p => (
        <div key={p.id} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {p.title}{p.sub ? <span style={{ color: C.muted, fontWeight: 400 }}> · {p.sub}</span> : null}
          </div>
          {p.goal && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{p.goal}</div>}
          <div style={{ marginTop: 8, borderTop: `1px solid ${C.hair}` }}>
            {p.hooks.map(h => (
              <button key={h.id} type="button" disabled={busy} onClick={() => onPick(h.id)}
                      style={{ display: "block", width: "100%", textAlign: "left", font: "inherit",
                               background: "none", border: "none", borderBottom: `1px solid ${C.hair}`,
                               padding: "10px 4px", cursor: busy ? "default" : "pointer", color: C.ink }}>
                <span style={{ ...mono, color: C.green }}>{h.style}</span>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3 }}>{h.hook}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{h.direction}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ── the hook picker — where an idea becomes a post ──────────────────── */

/**
 * THE MONTH'S HOOKS (2026-08-20, Paul: *"I'm going to go with more of a GUIDE
 * and less of a specific post per day prescription… I will just come up with
 * the copy and paste that into the app and then hit send to Cowork."*).
 *
 * A HOOK IS NOT A POST AND IS NEVER USED UP. It seeds a new row and stays on
 * the menu — one hook may carry three posts across a month or none at all,
 * which is exactly the difference between a guide and a calendar. That is why
 * this is a picker rather than a list of slots to fill: a slot you fill is
 * gone, and a reference is not.
 *
 * The direction line rides in with it as the post's brief, so the reason the
 * hook was written is still on screen when the copy gets written from it.
 *
 * Absolute, never fixed — Safari reads a fixed full-viewport coloured layer for
 * toolbar tinting and it breaks dark-mode switching (CLAUDE.md rule 5).
 */
function HookPicker({ libraries, onPick, onClose }: {
  libraries: Library[];
  onPick: (body: Record<string, unknown>) => Promise<string | null>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [kind, setKind] = useState("text");
  const lib = libraries[0] ?? null;

  const make = async (body: Record<string, unknown>) => {
    setBusy(true); setErr(null);
    const e = await onPick({ ...body, kind });
    setBusy(false);
    if (e) setErr(e);
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(20,22,24,0.34)", zIndex: 40 }}
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
                    width: "min(760px, calc(100% - 32px))", maxHeight: "calc(100vh - 80px)", overflowY: "auto",
                    background: C.bg, border: `1px solid ${C.hair}`, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: C.display, fontSize: 22, fontWeight: 600 }}>New post</h2>
          {lib && <span style={mono}>{lib.title}</span>}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: "5px 11px", fontSize: 12.5 }}>Close</button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.body, lineHeight: 1.6 }}>
          Start from one of the month's hooks or from nothing. A hook is a starting point, not a post —
          picking it never uses it up, and you write the copy yourself. Nothing is scheduled until you give it a date.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Medium</span>
          {(["text", "image", "video", "document"] as const).map(k => (
            <button key={k} type="button" onClick={() => setKind(k)}
                    style={{ ...btnGhost, padding: "4px 11px", fontSize: 12.5, textTransform: "capitalize",
                             ...(kind === k ? { borderColor: C.green, color: C.green } : null) }}>
              {k}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button type="button" disabled={busy} onClick={() => make({})} style={{ ...btnGhost, padding: "5px 12px", fontSize: 12.5 }}>
            {busy ? "…" : "Blank post"}
          </button>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
          {kind === "video"
            ? "A filmed post — nothing for Cowork to build; you post it and mark it here."
            : kind === "text"
              ? "A plain text post — no template needed."
              : `A ${kind} post — you pick the template on the slot, then Send to Cowork.`}
        </p>

        {err && (
          <div style={{ margin: "10px 0", padding: "9px 12px", background: C.dangerTint, fontSize: 13, color: C.ink }}>{err}</div>
        )}

        <HookList lib={lib} busy={busy} onPick={id => make({ hookId: id })} />
      </div>
    </div>
  );
}

/* ── the today / up-next cards ───────────────────────────────────────── */

function Focus({ label, row, empty, onOpen }: { label: string; row: QueueRow | null; empty: string; onOpen: (id: string) => void }) {
  const rd = row ? readiness(row) : null;
  return (
    <div style={{ flex: "1 1 300px", padding: "12px 14px", background: C.panel, minWidth: 0 }}>
      <div style={{ ...mono, marginBottom: 4 }}>{label}{row?.scheduled_for ? ` · ${dayLabel(row.scheduled_for)}` : ""}</div>
      {row ? (
        <button type="button" onClick={() => onOpen(row.queue_id)}
                style={{ font: "inherit", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", color: C.ink, width: "100%" }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>{row.title ?? row.angle}</div>
          <div style={{ fontSize: 13, color: C.body, marginTop: 3 }}>
            {kindLabel(row)} · {STATUS_LABEL[row.status] ?? row.status} · <span style={{ color: rd?.ok ? C.green : C.body, fontWeight: 600 }}>{rd?.text}</span>{rd?.note ? ` (${rd.note})` : ""}
            <span style={{ color: C.green, fontWeight: 600 }}> — open →</span>
          </div>
        </button>
      ) : (
        <div style={{ fontSize: 14, color: C.muted }}>{empty}</div>
      )}
    </div>
  );
}

/* ── one slot line + its expanded record ─────────────────────────────── */

function SlotLine({ row, open, isToday, onToggle, onPatch, onPatchDraft, onSend, onMarkPosted,
                   readings, onRecordReading, onRemoveReading, onSaveLead }: {
  row: QueueRow;
  open: boolean;
  isToday: boolean;
  onToggle: () => void;
  onPatch: (body: Record<string, unknown>) => Promise<string | null>;
  onPatchDraft: (body: Record<string, unknown>) => Promise<string | null>;
  onSend: (undo: boolean) => Promise<string | null>;
  onMarkPosted: (postUrl: string, retiredCheck: string) => Promise<string | null>;
  readings: ReadingRow[];
  onRecordReading: (body: Record<string, string>) => Promise<string | null>;
  onRemoveReading: (readOn: string) => Promise<string | null>;
  onSaveLead: (lead: { name: string; org: string; linkedin_url: string; source: string }) => Promise<string | null>;
}) {
  const rd = readiness(row);
  const d = daysUntil(row.scheduled_for);
  const missed = row.status !== "posted" && row.status !== "parked" && !row.queue_id.startsWith("BLACKOUT") && d != null && d < 0;
  const [err, setErr] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState(row.post_url ?? "");
  const [check, setCheck] = useState(row.retired_check === "not_run" ? "" : row.retired_check);
  const [notes, setNotes] = useState(row.notes ?? "");
  const [draftDirty, setDraftDirty] = useState(false);
  const [when, setWhen] = useState(String(row.scheduled_for ?? "").slice(0, 10));
  useEffect(() => {
    setErr(null); setPostUrl(row.post_url ?? "");
    setCheck(row.retired_check === "not_run" ? "" : row.retired_check);
    setNotes(row.notes ?? "");
    setWhen(String(row.scheduled_for ?? "").slice(0, 10));
  }, [row.queue_id, row.post_url, row.retired_check, row.notes, row.scheduled_for]);
  const act = async (p: Promise<string | null>) => setErr(await p);

  return (
    <div id={`slot-${row.queue_id}`} style={{ borderBottom: `1px solid ${C.hair}`, background: isToday && !open ? C.greenTint : "transparent" }}>
      <div onClick={onToggle}
           style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 4px", cursor: "pointer" }}>
        <span style={{ ...mono, flex: "none", width: 78, color: missed ? C.danger : C.muted, fontWeight: missed || isToday ? 700 : 400 }}>
          {dayLabel(row.scheduled_for)}
        </span>
        <span style={{ ...mono, flex: "none", width: 72 }}>{kindLabel(row)}</span>
        <div style={{ minWidth: 0, flex: "1.6 1 0" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{row.title ?? row.angle}</span>
          {isToday && <span style={{ ...chip, marginLeft: 8 }}>today</span>}
          {missed && <span style={{ ...mono, marginLeft: 8, color: C.danger }}>missed</span>}
        </div>
        <span style={{ ...mono, flex: "none", width: 118, textAlign: "right", color: rd.ok ? C.green : C.muted, fontWeight: rd.ok ? 700 : 400 }}
              title={rd.note ?? undefined}>
          {rd.text}
        </span>
        <span style={{ ...chip, flex: "none", width: 74, textAlign: "center", ...(row.status === "posted" ? null : row.status === "parked" ? { color: C.muted, background: C.panel } : { color: C.body, background: C.panel }) }}>
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      </div>

      {open && (
        <div style={{ padding: "2px 4px 18px", display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)", gap: 22 }}>
          {/* left: the thing to post */}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: C.body, lineHeight: 1.6 }}>
              {row.lead}{row.format ? ` · ${row.format}` : ""}
            </p>
            {(row.body || copyDraftState(row) === "live") ? <PostCopy row={row} /> : row.brief ? <BriefBlock row={row} /> : (
              <div style={{ padding: "12px 14px", background: C.panel, fontSize: 13.5, color: C.body, lineHeight: 1.6 }}>
                {isMandate(row)
                  ? <>This edition's copy is not in the app: the Sunday run builds a Mandate from the deal sweep{row.status === "drafted" ? " (edition 1 was drafted in the Cowork week file)" : ""} and it lands here by re-import once the plan carries it. Paste from the drafted file when you post; mark it here.</>
                  : row.queue_id.startsWith("BLACKOUT")
                    ? <>No post by design — {row.carries ?? "commenting only"}.</>
                    : <>Copy has not been carried into the app for this slot — it lives in the plan's markdown. Re-export the campaign once the section is written.</>}
              </div>
            )}
            {row.body && row.brief && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {row.origin === "app" ? "The hook this started from" : "The brief this was drafted from"}
                </summary>
                <div style={{ marginTop: 8 }}><BriefBlock row={row} bare /></div>
              </details>
            )}
            {(isPost(row) || row.kind === "document") && row.status !== "posted" && <DraftBlock row={row} onPatchDraft={onPatchDraft} onDirty={setDraftDirty} />}
            {row.kind === "document" && <DocumentBlock row={row} />}
            {(row.carries || row.law_check || row.source_disclosure) && (
              <div style={{ marginTop: 14, fontSize: 13, color: C.body, lineHeight: 1.6 }}>
                {row.carries && <p style={{ margin: "0 0 6px" }}><b style={{ color: C.ink }}>Carries: </b>{row.carries}</p>}
                <p style={{ margin: "0 0 6px" }}>
                  {row.may_state_figure
                    ? <>States figures{row.evidence_grade && row.evidence_grade !== "n/a" ? ` · evidence ${row.evidence_grade}` : ""} — the caption goes through retired-check before it ships.</>
                    : <>States NO figures by design — an argument, not a data post.</>}
                </p>
                {row.source_disclosure && <p style={{ margin: "0 0 6px", color: C.muted }}>{row.source_disclosure}</p>}
                {row.law_check && <p style={{ margin: 0 }}><b style={{ color: C.ink }}>Law check (from the plan): </b>{row.law_check}</p>}
              </div>
            )}
          </div>

          {/* right: what to do with it — the hand-off first, because that is
              the press you are here for; the after-you-post record below it. */}
          <div style={{ minWidth: 0 }}>
            {/* WHICH OF THE FIVE THIS ARGUES FOR. Sits above everything else in
                the pane because it is the only field that has to be right for
                the rollup to mean anything, and it is one press. */}
            {!row.queue_id.startsWith("BLACKOUT") && (
              <PillarPick pillar={row.pillar} format={row.format}
                          onSet={p => onPatch({ pillar: p === "" ? "" : p })} />
            )}
            {/* WHEN. Empty is a real answer, not a missing one — a library post is
                a worklist item until Paul decides it has a day, and only then
                does it join Today / Up next and start warning if it slips. The
                empty string CLEARS it server-side; undefined would leave it. */}
            {row.status !== "posted" && (
              <div style={{ marginBottom: 10, padding: "12px 14px", background: C.panel }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>When</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="date" value={when} onChange={e => setWhen(e.target.value)}
                         style={{ ...input, width: 170 }} aria-label="Scheduled date" />
                  <button type="button" style={btnGhost}
                          disabled={when === String(row.scheduled_for ?? "").slice(0, 10)}
                          onClick={() => act(onPatch({ scheduledFor: when || "" }))}>
                    {when || !row.scheduled_for ? "Set" : "Clear"}
                  </button>
                </div>
                <div style={{ ...mono, marginTop: 6, color: C.muted }}>
                  {row.scheduled_for
                    ? `scheduled ${dayLabel(row.scheduled_for)}`
                    : "no date — it sits in the list until you give it one"}
                </div>
              </div>
            )}
            {row.status !== "posted" && <SendToCowork row={row} unsaved={draftDirty} onSend={onSend} />}
            {row.status !== "posted" ? (
              <div style={{ padding: "12px 14px", background: C.panel }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>After you post</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <select value={check} onChange={e => setCheck(e.target.value)} style={input} aria-label="Retired-check result">
                    <option value="">retired-check: not run</option>
                    <option value="clean">retired-check: clean</option>
                    <option value="flagged">retired-check: flagged</option>
                  </select>
                  <input value={postUrl} onChange={e => setPostUrl(e.target.value)}
                         placeholder="LinkedIn post URL" style={input} />
                  <button type="button" style={btnPrimary}
                          title="Records that YOU posted it on LinkedIn — nothing is published from here."
                          onClick={() => act(onMarkPosted(postUrl.trim(), check))}>
                    Mark posted
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {row.status !== "drafted" && row.status !== "recurring" && (
                    <button type="button" style={btnGhost} onClick={() => act(onPatch({ status: "drafted" }))}>Mark drafted</button>
                  )}
                  <button type="button" style={btnGhost}
                          onClick={() => act(onPatch({ status: row.status === "parked" ? "next" : "parked" }))}>
                    {row.status === "parked" ? "Unpark" : "Park"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 14px", background: C.panel, fontSize: 13.5, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700 }}>Posted</div>
                <div style={{ color: C.body }}>
                  {/* Rendered in the reader's own zone: `posted_at` is a UTC
                      timestamp, so slicing the ISO string stamped an 8pm
                      Central post with TOMORROW's date. */}
                  {row.posted_at ? `Marked ${new Date(row.posted_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.` : ""}{" "}
                  {row.post_url && <a href={row.post_url} target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 600 }}>Open the post →</a>}
                </div>
              </div>
            )}

            {/* AFTER IT IS UP: the numbers, then the people. Both only once the
                post exists — there is nothing to read and nobody to save before
                that. The .xlsx importer this pane used to promise was deleted
                in #411, so these are typed in, and the copy no longer claims
                otherwise. */}
            {row.status === "posted" && (
              <>
                <Readings queueId={row.queue_id} readings={readings}
                          onRecord={onRecordReading} onRemove={onRemoveReading} />
                <Engagers queueId={row.queue_id} pillar={row.pillar} onSave={onSaveLead} />
              </>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                        placeholder="Build notes, art picks, what happened…"
                        style={{ ...input, flex: 1, resize: "vertical", lineHeight: 1.5 }} />
              <button type="button" style={btnGhost} disabled={notes === (row.notes ?? "")}
                      onClick={() => act(onPatch({ notes }))}>
                Save
              </button>
            </div>

            {err && (
              <div style={{ marginTop: 10, padding: "9px 13px", background: C.dangerTint, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
                {err}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── the brief — the plan, where the draft does not exist yet ────────── */

/**
 * A slot's BRIEF: hook and rehook verbatim from the plan, the beats the draft
 * gets written from, the source line with its disclosure, and whatever has to
 * happen first.
 *
 * IT IS NEVER OFFERED AS SOMETHING TO PASTE. There is no Copy button here and
 * that is the whole point: the copy box on this screen means "this text goes on
 * LinkedIn", and a brief that borrowed it would eventually be pasted. The gate
 * and the caution are two different things and render as two different things —
 * a gate stops the post, a caution is something to read before drafting it.
 */
export function BriefBlock({ row, bare = false }: { row: QueueRow; bare?: boolean }) {
  const b = row.brief;
  if (!b) return null;
  const beats = Array.isArray(b.beats) ? b.beats : [];
  return (
    <div>
      {!bare && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{row.origin === "app" ? "The hook" : "The brief"}</span>
          <span style={{ fontSize: 12.5, color: C.muted }}>
            {/* An app-born post has no plan behind it and no import coming — Paul
                started it from a hook and writes the copy right here. Saying
                otherwise would send him looking for a draft nobody is writing. */}
            {row.origin === "app"
              ? "what this post starts from — write the copy below"
              : "the plan for this slot — the post itself is drafted in the studio and lands here by re-import"}
          </span>
        </div>
      )}
      {row.gate && <Notice>{row.gate}</Notice>}
      {b.note && <Notice>{b.note}</Notice>}
      <div style={{ background: C.panel, padding: "12px 14px", lineHeight: 1.6 }}>
        {b.hook && <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{b.hook}</p>}
        {b.rehook && <p style={{ margin: "6px 0 0", fontSize: 14.5, color: C.ink }}>{b.rehook}</p>}
        {beats.length > 0 && (
          <ol style={{ margin: "12px 0 0", paddingLeft: 20 }}>
            {beats.map((beat, i) => (
              <li key={i} style={{ fontSize: 13.5, color: C.body, lineHeight: 1.6, marginBottom: 5 }}>{beat}</li>
            ))}
          </ol>
        )}
        {b.extraction && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: C.body, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {b.extraction}
          </p>
        )}
        {b.source && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            <b style={{ color: C.ink }}>Source in-post: </b>{b.source}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── the post copy — one Copy button ─────────────────────────────────── */

/** LinkedIn folds a post behind "…see more" after roughly this many characters on desktop. */
const FOLD_CHARS = 210;
const HASHTAG = /(^|\s)#[A-Za-z]\w*/;

type CopyVariant = { id: string; label: string; text: string; caution?: string };

/**
 * The paste-ready copy. Where a slot carries more than one text (the deck's
 * caption beside the plan's; the understudy beside a receipt-gated frame)
 * they sit under a pick and the reason is stated — the human chooses, the
 * screen never merges or guesses.
 */
export function PostCopy({ row }: { row: QueueRow }) {
  const variants: CopyVariant[] = [];
  // Your edit leads — when it is LIVE (the plan has not moved past it): it is
  // what you will post and what Cowork renders from. It carries the slot's
  // gate as its caution, because filling one bracket does not un-gate a frame.
  if (row.copy_edit && copyDraftState(row) === "live") {
    variants.push({ id: "edit", label: "Your edit", text: row.copy_edit, caution: row.gate ?? undefined });
  }
  if (row.body) {
    variants.push({
      id: "plan",
      label: row.body_deck ? "Plan's caption" : row.gate ? "The frame (gated)" : row.kind === "document" ? "Caption" : "The post",
      text: row.body,
      caution: row.gate ?? undefined,
    });
  }
  if (row.body_deck) variants.push({ id: "deck", label: "Deck's caption", text: row.body_deck });
  if (row.body_alt) variants.push({ id: "alt", label: "The understudy", text: row.body_alt });
  // A gated frame cannot ship; open on the understudy so the default press is the shippable one.
  const first = row.gate && row.body_alt ? "alt" : variants[0]?.id === "edit" ? "edit" : "plan";
  const [pick, setPick] = useState<string>(first);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setPick(first); setCopied(false); }, [row.queue_id, first]);

  const cur = variants.find(v => v.id === pick) ?? variants[0];
  if (!cur) return null;
  const hasBrackets = /\[[A-Z$][^\]]*\]/.test(cur.text);
  const hasHashtags = HASHTAG.test(cur.text);
  const chars = cur.text.length;
  const hook = cur.text.slice(0, FOLD_CHARS);
  const foldsMidWord = chars > FOLD_CHARS && !/\s/.test(cur.text[FOLD_CHARS] ?? " ");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cur.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard refused (older WebKit, insecure context): select the text so ⌘C works.
      const el = document.getElementById(`copy-${row.queue_id}`);
      if (el) { const range = document.createRange(); range.selectNodeContents(el); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{row.kind === "document" ? "The caption" : "The post"}</span>
        {variants.length > 1 && variants.map(v => (
          <button key={v.id} type="button" onClick={() => { setPick(v.id); setCopied(false); }}
                  style={{ ...btnGhost, padding: "4px 10px", fontSize: 12.5, ...(cur.id === v.id ? { border: `1px solid ${C.green}`, color: C.green } : null) }}>
            {v.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button type="button" onClick={copy} style={{ ...btnPrimary, padding: "7px 14px", fontSize: 13 }}
                title="Copies the text below to the clipboard — you paste it into LinkedIn. Nothing is published from here.">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {row.copy_note && (
        <Notice>Two captions exist for this document — {row.copy_note} The plan's is the content of record; the deck's is what the spec renders. Pick before you post.</Notice>
      )}
      {cur.caution && (
        <Notice>{cur.caution}{hasBrackets ? " The brackets below are the unfilled receipts — this text must not be pasted as-is." : ""}</Notice>
      )}
      {hasHashtags && <Notice>This text contains hashtags; the plan's protocol says zero hashtags, zero links in body.</Notice>}
      <div id={`copy-${row.queue_id}`} style={copyBox}>{cur.text}</div>
      <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
        {chars.toLocaleString()} characters · above the fold (≈{FOLD_CHARS}): “{hook.trim()}{chars > FOLD_CHARS ? "…" : ""}”
        {foldsMidWord ? " — the fold lands mid-word; check the hook reads on its own." : ""}
      </p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8, padding: "9px 12px", background: C.dangerTint, fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

/* ── THE DRAFT BLOCK — decide here, render in Cowork ──────────────────── */

/**
 * Paul, 2026-08-19: "i want to be able to choose the template and edit the
 * copy before anything is finally rendered in Cowork." This is where the
 * decision is made. It saves to the row (PATCH /:id/draft) and NOTHING
 * renders from here — Cowork pulls the drafts (scripts/studio/pull-queue.mjs)
 * and renders from the spec on disk, then the plan catches up and the next
 * export carries the edit as the content of record.
 *
 * The editor is pre-filled with the current edit, else the plan's copy, so
 * "edit" means "start from what is there". Save is explicit; the textarea is
 * not live-saved because a half-typed caption is not a decision.
 */
export function DraftBlock({ row, onPatchDraft, onDirty }: { row: QueueRow; onPatchDraft: (b: Record<string, unknown>) => Promise<string | null>; onDirty?: (dirty: boolean) => void }) {
  // The medium → renderer mapping lives in shared/templates.ts, because the
  // SERVER applies the same rule when it validates the save. Keeping a private
  // copy here is what made the picker offer a template the server refused.
  const options = templatesForKind(row.kind);
  const [template, setTemplate] = useState<string>(row.template ?? "");
  const [copy, setCopy] = useState<string>(row.copy_edit ?? row.body ?? "");
  const [pages, setPages] = useState<{ n: number; label: string | null; text: string; note: string | null }[]>(
    (row.pages_edit ?? row.pages ?? []).map(p => ({ ...p })),
  );
  const [openPages, setOpenPages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const copyState = copyDraftState(row);
  const pagesState = pagesDraftState(row);
  const plan = row.body ?? "";
  const planPages = row.pages ?? [];

  // Where the editor STARTS from: a live edit, else the plan. A superseded
  // edit is history — the plan moved past it — so the editor seeds from the
  // plan and the old text is offered below, never silently re-saved.
  const seedCopy = copyState === "live" ? (row.copy_edit ?? "") : plan;
  const seedPages = pagesState === "live" ? (row.pages_edit ?? []) : planPages;

  const copyDirty = copy.trim() !== seedCopy.trim();
  const templateDirty = template !== (row.template ?? "");
  const pagesDirty = !pagesEqual(pages, seedPages);
  const dirty = copyDirty || templateDirty || pagesDirty;

  // Re-seed when the row's draft or its PLAN changes (a save refetches; an
  // import moves the plan; another slot opens). The one time typing is lost
  // is a plan change under an open editor — the safe failure, since the
  // alternative is persisting superseded text as an edit. `saved` is not
  // reset here; the refetch after a save would wipe the confirmation the
  // instant it appeared.
  const planKey = plan + " " + JSON.stringify(planPages.map(p => [p.n, p.label, p.text, p.note]));
  useEffect(() => {
    setTemplate(row.template ?? "");
    setCopy(seedCopy);
    setPages(seedPages.map(p => ({ ...p })));
    setErr(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.queue_id, row.draft_at, planKey]);
  useEffect(() => { setSaved(false); }, [row.queue_id]);

  const chosen = templateById(template);

  const save = async () => {
    setSaving(true); setErr(null); setSaved(false);
    const body: Record<string, unknown> = {};
    if (templateDirty) body.template = template || null;
    // Equal-to-plan (ignoring end whitespace) is no edit → null; the server applies the same rule.
    if (copyDirty) body.copyEdit = copy.trim() && copy.trim() !== plan.trim() ? copy : null;
    if (pagesDirty) body.pagesEdit = pagesEqual(pages, planPages) ? null : pages;
    const e = await onPatchDraft(body);
    setSaving(false);
    if (e) setErr(e); else setSaved(true);
  };
  const revert = async () => {
    setSaving(true); setErr(null);
    const e = await onPatchDraft({ copyEdit: null, pagesEdit: null });
    setSaving(false);
    if (e) setErr(e);
  };

  // The send control lives in the right column, where the eye lands when a slot
  // opens — it needs to know the editor has unsaved changes without being
  // inside it. (Measured before the move: the button sat 770px below the slot
  // row, under the brief and the copy box. Paul: "where is the send to Cowork
  // button and the template picker?")
  useEffect(() => { onDirty?.(dirty); }, [dirty, onDirty]);

  const live = hasDraft(row);
  const superseded = copyState === "superseded" || pagesState === "superseded";
  // Nothing about this panel is true for a filmed slot: there is no render to
  // come, no button to point at, and no wait. Paul, looking at a video day:
  // "I dont see the button??" — the right column said "nothing to build" while
  // this panel told him to press one. Every string here forks on it.
  const noBuild = sendReadiness(row).noBuild === true;
  return (
    <div style={{ marginTop: 14, border: `1px solid ${live ? C.green : C.hair}`, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{noBuild ? "Your copy" : "Before Cowork renders"}</span>
        {live
          ? <span style={{ ...chip, color: C.green, background: C.greenTint }}>{noBuild ? "edited" : "edited · waiting on a render"}</span>
          : copyState === "satisfied" || pagesState === "satisfied"
            ? <span style={{ ...chip, color: C.body, background: C.panel }}>plan matches your edit</span>
            : <span style={{ ...mono, color: C.muted }}>the plan's copy</span>}
        {row.template && chosen && (
          <span style={{ ...chip, color: C.body, background: C.panel }} title={chosen.hint}>
            template · {chosen.label}{chosen.status === "pending" ? " · not built yet" : ""}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {(live || superseded) && (
          <button type="button" onClick={revert} disabled={saving} style={{ ...btnGhost, padding: "4px 10px", fontSize: 12.5 }}
                  title="Clear the copy edits — back to the plan's copy (the template pick stays)">
            Revert to plan
          </button>
        )}
      </div>

      {superseded && (
        <div style={{ marginBottom: 10, padding: "8px 10px", background: C.panel, fontSize: 12.5, color: C.body, lineHeight: 1.55 }}>
          <b style={{ color: C.ink }}>The plan moved on since your edit.</b> The editor below starts from the new plan; your earlier text is kept here for reference — re-save it if you still want it.
          {copyState === "superseded" && row.copy_edit && (
            <details style={{ marginTop: 6 }}>
              <summary style={{ cursor: "pointer" }}>your earlier caption</summary>
              <pre style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", fontFamily: C.sans, fontSize: 12.5 }}>{row.copy_edit}</pre>
            </details>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {options.length > 0 ? (
          <label style={{ display: "grid", gap: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Template</span>
            <select value={template} onChange={e => setTemplate(e.target.value)} style={{ ...input, maxWidth: 440 }}>
              <option value="">— the spec's default —</option>
              {options.map(t => <option key={t.id} value={t.id}>{t.label}{t.status === "pending" ? " (not built yet — pick is recorded)" : ""}</option>)}
            </select>
            {chosen && (
              <span style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>
                {chosen.desc} <span style={mono}>· {chosen.renderer} · {chosen.hint}</span>
              </span>
            )}
          </label>
        ) : (
          /* An empty picker offering only "the spec's default" would imply a
             builder is waiting on a pick. Nothing renders a piece to camera,
             and there is nothing to send: Paul films it and has the file. */
          <p style={{ margin: 0, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            No template — this one is filmed, not rendered, and there is nothing for the studio to build.
            The copy below is the script.
          </p>
        )}

        <label style={{ display: "grid", gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>
            {row.kind === "document" ? "The caption" : "The post"}
            {copyDirty ? " · unsaved" : copyState === "live" ? " · your edit" : ""}
          </span>
          <textarea value={copy} onChange={e => setCopy(e.target.value)} rows={Math.min(16, Math.max(5, copy.split("\n").length + 1))}
                    style={{ ...input, fontFamily: C.sans, fontSize: 14, lineHeight: 1.55, resize: "vertical" }} />
          <span style={{ ...mono, color: C.muted }}>{copy.length} characters{copy.length > 210 ? ` · folds at ≈210` : ""}{row.gate ? " · this slot is receipt-gated: brackets must be filled before it ships" : ""}</span>
        </label>

        {row.kind === "document" && pages.length > 0 && (
          <div>
            <button type="button" onClick={() => setOpenPages(v => !v)}
                    style={{ font: "inherit", fontSize: 12.5, fontWeight: 600, color: C.green, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {openPages ? "▾" : "▸"} Page copy ({pages.length}){pagesDirty ? " · unsaved" : pagesState === "live" ? " · your edit" : ""}
            </button>
            {openPages && (
              <ol style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
                {pages.map((pg, i) => (
                  <li key={pg.n} style={{ fontSize: 13 }}>
                    {pg.label && <div style={{ fontWeight: 600, marginBottom: 3 }}>{pg.label}</div>}
                    <textarea value={pg.text} rows={Math.min(8, Math.max(2, pg.text.split("\n").length + 1))}
                              onChange={e => setPages(prev => prev.map((q, j) => j === i ? { ...q, text: e.target.value } : q))}
                              style={{ ...input, width: "100%", fontFamily: C.sans, fontSize: 13, lineHeight: 1.5, resize: "vertical" }} />
                    {pg.note && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>({pg.note})</div>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={save} disabled={!dirty || saving} style={{ ...btnPrimary, padding: "7px 14px", fontSize: 13, opacity: !dirty || saving ? 0.5 : 1 }}>
            {saving ? "Saving…" : "Save the decision"}
          </button>
          {saved && !dirty && <span style={{ ...mono, color: C.green }}>saved</span>}
          {err && <span style={{ fontSize: 12.5, color: C.danger }}>{err}</span>}
          <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            {noBuild
              ? <>Nothing for Cowork to build — this one is filmed and you have it. Save your edit, post it on LinkedIn, then mark it posted on the right.</>
              : <>Nothing renders from here. Save, then press <b>Send to Cowork</b> on the right — that is what tells Cowork to build it.</>}
          </span>
        </div>

      </div>
    </div>
  );
}

/* ── Send to Cowork — the request, and what came back ─────────────────── */

/**
 * The press that says "I am done deciding; build it".
 *
 * IT DOES NOT BUILD, and the copy on it says so plainly rather than implying
 * a render is happening somewhere. The app is on Railway and the renderer is
 * local Chromium against the workspace on Paul's Mac; what this records is a
 * REQUEST, which `pull-queue.mjs` turns into a folder in Finder holding the
 * caption, the work order, and any video pick. Before it existed the pull
 * script could not tell a caption still being worked on from a finished one.
 *
 * THE SERVER REFUSES, NOT THE BUTTON — `shared/studioSend.ts` is the one rule,
 * so the greyed-out reason here and the 400 from the API are the same sentence
 * and cannot drift apart. The button is disabled with the reason showing; it
 * is never hidden, because a missing button is a question and a disabled one
 * with a sentence beside it is an answer.
 */
function SendToCowork({ row, unsaved, onSend }: {
  row: QueueRow; unsaved: boolean; onSend: (undo: boolean) => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setErr(null); }, [row.queue_id, row.sent_at, row.built_at]);

  const verdict = sendReadiness(row);
  const state = sendState(row);
  const when = (v: string | null) =>
    v ? new Date(v).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

  const press = async (undo: boolean) => {
    setBusy(true); setErr(null);
    const e = await onSend(undo);
    setBusy(false);
    if (e) setErr(e);
  };

  const asksLabel = verdict.asks === "template" ? "build it" : "file the copy";

  // A filmed slot has nothing to send and never will. It gets a sentence, not a
  // disabled button: a greyed-out control reads as something to go and fix.
  if (verdict.noBuild && state === "none") {
    return (
      <div style={{ marginBottom: 10, padding: "12px 14px", background: C.panel, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
        {verdict.reason}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 10, padding: "12px 14px", background: C.panel }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Hand it to Cowork</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {state === "built" ? (
          <>
            <span style={{ ...chip, color: C.green, background: C.greenTint }}>built · ready to post</span>
            <span style={{ fontSize: 12.5, color: C.body }}>
              Filed {when(row.built_at)}{row.collateral_path ? <> at <code style={code}>{row.collateral_path}</code></> : ""}.
            </span>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => press(false)} disabled={busy || !verdict.ok}
                    style={{ ...btnGhost, padding: "6px 12px", fontSize: 12.5 }}
                    title={verdict.ok ? "Ask for it again — the previous build stops being reported as current" : verdict.reason}>
              {busy ? "…" : "Send again"}
            </button>
          </>
        ) : state === "sent" || state === "stale" ? (
          <>
            <span style={{ ...chip, color: state === "stale" ? C.danger : C.body, background: C.panel }}>
              {state === "stale" ? "sent, then edited" : "sent to Cowork"}
            </span>
            <span style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>
              {state === "stale"
                ? <>You changed the decision after sending it ({when(row.sent_at)}). Cowork would build the old one — send it again.</>
                : <>Waiting on Cowork ({when(row.sent_at)}). It picks this up with <code style={code}>node scripts/studio/pull-queue.mjs</code>, builds it and files it where the plan says.</>}
            </span>
            <div style={{ flex: 1 }} />
            {state === "stale" && (
              <button type="button" onClick={() => press(false)} disabled={busy || !verdict.ok}
                      style={{ ...btnPrimary, padding: "6px 12px", fontSize: 12.5 }} title={verdict.reason}>
                {busy ? "…" : "Send again"}
              </button>
            )}
            <button type="button" onClick={() => press(true)} disabled={busy}
                    style={{ ...btnGhost, padding: "6px 12px", fontSize: 12.5 }}
                    title="Withdraw the request. Your template pick and copy edits stay exactly as they are.">
              {busy ? "…" : "Withdraw"}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => press(false)} disabled={busy || !verdict.ok || unsaved}
                    style={{ ...btnPrimary, padding: "7px 14px", fontSize: 13, opacity: busy || !verdict.ok || unsaved ? 0.5 : 1 }}
                    title={verdict.ok ? "Records that this slot is ready to build. Nothing is rendered from here — Cowork picks it up on the Mac." : verdict.reason}>
              {busy ? "Sending…" : "Send to Cowork"}
            </button>
            <span style={{ fontSize: 12.5, color: verdict.ok && !unsaved ? C.muted : C.body, lineHeight: 1.5, flex: "1 1 260px" }}>
              {unsaved
                ? "Save the decision first — Cowork builds what is saved, not what is on screen."
                : verdict.ok
                  ? <>Cowork will {asksLabel} from this copy and the template, and file it where the plan says.</>
                  : verdict.reason}
            </span>
          </>
        )}
      </div>
      {err && <div style={{ marginTop: 8, padding: "8px 11px", background: C.dangerTint, fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{err}</div>}
    </div>
  );
}

/* ── the document — the deck to download, its pages to review ────────── */

const fmtBytes = (n: number | null) => n == null ? "" : n > 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.round(n / 1000)} KB`;

/**
 * A document slot's deck: the shipped PDF to download, its pages as
 * thumbnails so the carousel can be reviewed here, and the plan's page copy
 * for reference. The PDF link exists ONLY when the exporter saw the file in
 * the build — a dead download link is the failure this guards against.
 */
export function DocumentBlock({ row }: { row: QueueRow }) {
  const doc = row.document;
  const [big, setBig] = useState<string | null>(null);
  useEffect(() => setBig(null), [row.queue_id]);
  // Belt to the server's braces: the API normalises these, but a render site
  // that can throw on a shape it did not expect takes the whole screen down —
  // which is what "c.map is not a function" was (2026-08-19).
  const pagesPlanned = Array.isArray(row.pages) ? row.pages : [];
  const thumbs = Array.isArray(doc?.thumbs) ? doc!.thumbs : [];
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>The document</span>
        {doc?.pdf && <span style={mono}>{doc.pages ? `${doc.pages} pages` : ""}{doc.bytes ? ` · ${fmtBytes(doc.bytes)}` : ""}</span>}
        <div style={{ flex: 1 }} />
        {doc?.pdf && (
          <a href={doc.pdf} download style={{ ...btnPrimary, padding: "7px 14px", fontSize: 13, textDecoration: "none", display: "inline-block" }}
             title="Downloads the rendered carousel PDF — you upload it to LinkedIn as a document post.">
            Download PDF
          </a>
        )}
      </div>
      {doc?.pdf ? (
        <>
          {thumbs.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
              {thumbs.map((t, i) => (
                <img key={t} src={t} alt={`Page ${i + 1}`} loading="lazy"
                     onClick={() => setBig(big === t ? null : t)}
                     style={{ width: 96, height: 120, objectFit: "cover", border: `1px solid ${big === t ? C.green : C.hair}`, cursor: "pointer", flex: "none", background: C.bg }} />
              ))}
            </div>
          )}
          {big && <img src={big} alt="Page, enlarged" style={{ display: "block", width: "100%", maxWidth: 540, marginTop: 8, border: `1px solid ${C.hair}` }} />}
          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
            Rendered by build-deck.mts from <code style={code}>{doc.spec}</code>, filed at <code style={code}>{doc.filed_at}</code>
            {doc.deck_caption_matches ? "; its caption matches the plan's." : "; its caption differs from the plan's — see above."}
          </p>
        </>
      ) : (
        <p style={{ margin: 0, padding: "10px 12px", background: C.panel, fontSize: 13.5, color: C.body, lineHeight: 1.6 }}>
          The deck is not in this build yet.
          {doc ? <> Spec: <code style={code}>{doc.spec}</code>; the plan files the render at <code style={code}>{doc.filed_at}</code>. It renders on the Mac (Chromium); the export then ships the PDF with the app.</> : " The plan names no build path for it."}
        </p>
      )}
      {pagesPlanned.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Page copy as planned ({pagesPlanned.length}){row.body_deck ? " — the render may differ; the thumbnails are the truth" : ""}
          </summary>
          <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            {pagesPlanned.map(pg => (
              <li key={pg.n} style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 6 }}>
                {pg.label && <span style={{ fontWeight: 600, color: C.ink }}>{pg.label} — </span>}{pg.text}
                {pg.note && <span style={{ color: C.muted }}> ({pg.note})</span>}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

/* ── shapes ──────────────────────────────────────────────────────────── */

const copyBox: CSSProperties = {
  whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: C.ink,
  background: C.panel, padding: "12px 14px",
  maxHeight: 440, overflowY: "auto", userSelect: "text",
};

const code: CSSProperties = { fontFamily: C.mono, fontSize: 12, color: C.ink };
