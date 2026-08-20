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
  /* the request (migration 140) — Send to Studio, and what came back */
  video_file: string | null;
  sent_at: string | null;
  built_at: string | null;
  built_path: string | null;     // the plan text the edit was made against (shared/draft.ts)
  pages_edit: { n: number; label: string | null; text: string; note: string | null }[] | null;
  pages_base: { n: number; label: string | null; text: string; note: string | null }[] | null;
  draft_at: string | null;
}

/** A slot carries a LIVE decision Cowork has not rendered from — shared/draft.ts is the rule. */
export const hasDraft = (r: QueueRow) => hasLiveDraft(r);

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
  if (send === "built") return { text: "ready to post", ok: true, note: r.built_path ? `filed at ${r.built_path}` : undefined };
  if (send === "sent") return { text: "at the studio", ok: false, note: "sent — waiting on Cowork to build it" };
  if (send === "stale") return { text: "sent · edited", ok: false, note: "you changed the decision after sending — send it again" };
  // THE GATE OUTRANKS THE EDIT: a receipt-gated frame with one bracket filled
  // is still gated, and "edited" would hide that everywhere the label shows.
  // A gate is a reason the slot cannot ship AS PLANNED — a receipt that has not
  // been extracted, or a figure the retired register blocked. It applies to a
  // brief exactly as it does to a body: the block is on the post, not the draft.
  if (isPost(r) && r.gate && (r.body || r.brief)) return { text: "gated", ok: false, note: firstSentence(r.gate) };
  // A LIVE decision Cowork has not rendered from is the next most important state — it outranks "copy · PDF".
  if (hasDraft(r)) return { text: "edited", ok: false, note: "waiting on a Cowork render" };
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
  const [campaigns, setCampaigns] = useState<CampaignMeta[]>([]);
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
        setView(v => v ?? (list[0]?.name ?? STANDING));
      })
      .catch(() => setCampaigns([]));
    return rowsP;
  }, []);
  useEffect(() => { load(); }, [load]);

  const total = rows ?? [];
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

      {/* which calendar — only when there is more than one to choose from */}
      {campaigns.length > 0 && (campaigns.length > 1 || total.some(r => r.campaign == null)) && (
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
      {rows !== null && !error && all.length === 0 && view !== STANDING && (
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
        <p style={{ marginTop: 26, fontSize: 14, color: C.muted }}>Nothing in the standing queue.</p>
      )}

      {all.length > 0 && (
        <>
          {/* today · up next */}
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Focus label={todays ? "Today" : "Today"} row={todays} empty="No slot today." onOpen={id => { setOpenId(id); document.getElementById(`slot-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }} />
            <Focus label="Up next" row={upNext} empty="Nothing further scheduled." onOpen={id => { setOpenId(id); document.getElementById(`slot-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }} />
          </div>

          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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

          <div style={{ marginTop: 10, borderTop: `1px solid ${C.hair}` }}>
            {weeks.map(([w, group]) => (
              <div key={w}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "14px 4px 6px" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {weekLabel[w] ?? (view === STANDING ? "Standing queue" : "Unscheduled")}
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

function SlotLine({ row, open, isToday, onToggle, onPatch, onPatchDraft, onSend, onMarkPosted }: {
  row: QueueRow;
  open: boolean;
  isToday: boolean;
  onToggle: () => void;
  onPatch: (body: Record<string, unknown>) => Promise<string | null>;
  onPatchDraft: (body: Record<string, unknown>) => Promise<string | null>;
  onSend: (undo: boolean) => Promise<string | null>;
  onMarkPosted: (postUrl: string, retiredCheck: string) => Promise<string | null>;
}) {
  const rd = readiness(row);
  const d = daysUntil(row.scheduled_for);
  const missed = row.status !== "posted" && row.status !== "parked" && !row.queue_id.startsWith("BLACKOUT") && d != null && d < 0;
  const [err, setErr] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState(row.post_url ?? "");
  const [check, setCheck] = useState(row.retired_check === "not_run" ? "" : row.retired_check);
  const [notes, setNotes] = useState(row.notes ?? "");
  useEffect(() => {
    setErr(null); setPostUrl(row.post_url ?? "");
    setCheck(row.retired_check === "not_run" ? "" : row.retired_check);
    setNotes(row.notes ?? "");
  }, [row.queue_id, row.post_url, row.retired_check, row.notes]);
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
                <summary style={{ fontSize: 13, fontWeight: 600, cursor: "pointer" }}>The brief this was drafted from</summary>
                <div style={{ marginTop: 8 }}><BriefBlock row={row} bare /></div>
              </details>
            )}
            {(isPost(row) || row.kind === "document") && row.status !== "posted" && <DraftBlock row={row} onPatchDraft={onPatchDraft} onSend={onSend} />}
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

          {/* right: the state */}
          <div style={{ minWidth: 0 }}>
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
                <div style={{ color: C.muted, fontSize: 12.5, marginTop: 4 }}>
                  Performance arrives with the next LinkedIn analytics import — every number in the app is one LinkedIn wrote.
                </div>
              </div>
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
          <span style={{ fontSize: 13, fontWeight: 700 }}>The brief</span>
          <span style={{ fontSize: 12.5, color: C.muted }}>
            the plan for this slot — the post itself is drafted in the studio and lands here by re-import
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
export function DraftBlock({ row, onPatchDraft, onSend }: { row: QueueRow; onPatchDraft: (b: Record<string, unknown>) => Promise<string | null>; onSend: (undo: boolean) => Promise<string | null> }) {
  // The medium → renderer mapping lives in shared/templates.ts, because the
  // SERVER applies the same rule when it validates the save. Keeping a private
  // copy here is what made the picker offer a template the server refused.
  const options = templatesForKind(row.kind);
  const [template, setTemplate] = useState<string>(row.template ?? "");
  const [copy, setCopy] = useState<string>(row.copy_edit ?? row.body ?? "");
  const [video, setVideo] = useState<string>(row.video_file ?? "");
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
  const videoDirty = video.trim() !== (row.video_file ?? "");
  const pagesDirty = !pagesEqual(pages, seedPages);
  const dirty = copyDirty || templateDirty || pagesDirty || videoDirty;

  // Re-seed when the row's draft or its PLAN changes (a save refetches; an
  // import moves the plan; another slot opens). The one time typing is lost
  // is a plan change under an open editor — the safe failure, since the
  // alternative is persisting superseded text as an edit. `saved` is not
  // reset here; the refetch after a save would wipe the confirmation the
  // instant it appeared.
  const planKey = plan + " " + JSON.stringify(planPages.map(p => [p.n, p.label, p.text, p.note]));
  useEffect(() => {
    setTemplate(row.template ?? "");
    setVideo(row.video_file ?? "");
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
    if (videoDirty) body.videoFile = video.trim() || null;
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

  const live = hasDraft(row);
  const superseded = copyState === "superseded" || pagesState === "superseded";
  return (
    <div style={{ marginTop: 14, border: `1px solid ${live ? C.green : C.hair}`, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Before Cowork renders</span>
        {live
          ? <span style={{ ...chip, color: C.green, background: C.greenTint }}>edited · waiting on a render</span>
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
             builder is waiting on a pick. Nothing renders a piece to camera. */
          <p style={{ margin: 0, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            No template — this slot is filmed, not rendered. The copy below is the script.
          </p>
        )}

        {/* THE VIDEO PICK. It sits on every slot, not just the video days: a
            number post can go out as a video if that is the call, and a video
            day cannot go out any other way. It is a FILE NAME rather than a
            picker because the videos are on this Mac and the app is on Railway
            — it cannot see them, so there is no list to offer. pull-queue.mjs
            resolves the name on the Mac and says loudly when it cannot. */}
        <label style={{ display: "grid", gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>
            Video file{videoDirty ? " · unsaved" : ""}
            {row.kind === "video" && !video.trim() && <span style={{ color: C.danger, fontWeight: 400 }}> — a video day needs one</span>}
          </span>
          <input value={video} onChange={e => setVideo(e.target.value)}
                 placeholder="e.g. day-01-diligence-tell.mov — the file name, or a full path"
                 style={{ ...input, maxWidth: 440, fontFamily: C.mono, fontSize: 12.5 }} />
          <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            {video.trim()
              ? <>Cowork places this file in the ready folder instead of rendering. Nothing here checks it exists — the studio resolves it and reports back.</>
              : <>Leave empty unless this slot posts a video. <code style={code}>node scripts/studio/pull-queue.mjs --videos</code> lists what is in the folder.</>}
          </span>
        </label>

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
            Nothing renders from here. Cowork pulls this with <code style={code}>node scripts/studio/pull-queue.mjs</code>, renders from the spec, and the next export carries it.
          </span>
        </div>

        <SendToStudio row={row} unsaved={dirty} onSend={onSend} />
      </div>
    </div>
  );
}

/* ── Send to Studio — the request, and what came back ─────────────────── */

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
function SendToStudio({ row, unsaved, onSend }: {
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

  const asksLabel = verdict.asks === "video" ? "place the video" : verdict.asks === "template" ? "render it" : "file the copy";

  return (
    <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${C.hair}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {state === "built" ? (
          <>
            <span style={{ ...chip, color: C.green, background: C.greenTint }}>built · ready to post</span>
            <span style={{ fontSize: 12.5, color: C.body }}>
              Filed {when(row.built_at)} at <code style={code}>{row.built_path}</code> — open that folder in Finder.
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
              {state === "stale" ? "sent, then edited" : "sent to the studio"}
            </span>
            <span style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>
              {state === "stale"
                ? <>You changed the decision after sending it ({when(row.sent_at)}). Cowork would build the old one — send it again.</>
                : <>Waiting on Cowork ({when(row.sent_at)}). It picks this up with <code style={code}>node scripts/studio/pull-queue.mjs</code> and files it in <code style={code}>studio/ready/</code>.</>}
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
                    title="Withdraw the request. Your template pick, video pick and copy edits all stay exactly as they are.">
              {busy ? "…" : "Withdraw"}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => press(false)} disabled={busy || !verdict.ok || unsaved}
                    style={{ ...btnPrimary, padding: "7px 14px", fontSize: 13, opacity: busy || !verdict.ok || unsaved ? 0.5 : 1 }}
                    title={verdict.ok ? "Records that this slot is ready to build. Nothing is rendered from here — Cowork picks it up on the Mac." : verdict.reason}>
              {busy ? "Sending…" : "Send to Studio"}
            </button>
            <span style={{ fontSize: 12.5, color: verdict.ok && !unsaved ? C.muted : C.body, lineHeight: 1.5, flex: "1 1 260px" }}>
              {unsaved
                ? "Save the decision first — the studio builds what is saved, not what is on screen."
                : verdict.ok
                  ? <>Cowork will {asksLabel} and leave it in <code style={code}>studio/ready/</code> with the caption, ready to post.</>
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
