/* V6 Mobile — Deliverable comments thread (DT-4).

   A lightweight, async comments thread mounted inside the mobile document
   reader (RealDocumentReader) and the mobile analysis screen. It mirrors the
   Deal Team "Messages" tab look — glass --mb-* surfaces, role-tinted author
   badges, relative times, an @mention autocomplete sourced from the deal
   participants, and @Name highlighting — but talks to the deliverable-comments
   backend instead of deal_messages:

     GET   /api/deliverables/:id/comments
     POST  /api/deliverables/:id/comments   { content, sectionRef?, mentions?: number[] }
     PATCH /api/deliverable-comments/:id/resolve

   Read-level seats can't comment (server returns 403). @mentions notify the
   mentioned teammates; every other deal participant still gets a generic
   "commented" notification — so even without autocomplete the team is notified.

   This is a comments thread on an async deliverable, NOT a chat platform: there
   is no realtime, no typing indicators — comments load on open and after a post,
   with a light poll so a collaborator's note shows up.

   Only mount this when there's a REAL numeric deliverableId. The sample /
   no-deliverable reader path renders nothing. Participant sourcing
   (deliverable → deal_id → participants) is best-effort: if it can't be
   resolved cleanly the thread still works, just without @mention autocomplete.

   Mobile only. No new deps. Existing --mb-* tokens / mb-* classes only. */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Loader2, MessageSquareText, Check } from "lucide-react";
import { authHeaders } from "../../../../hooks/useAuth";

/* ─── Types (mirror the GET /comments row shape) ─────────────────────────── */

interface DeliverableComment {
  id: number;
  content: string;
  section_ref?: string | null;
  resolved?: boolean;
  created_at: string;
  display_name?: string | null;
  email?: string | null;
  participant_role?: string | null;
  /** Local-only flag for the optimistic row we add right after POST. */
  _pending?: boolean;
}

/** A person who can be @mentioned: deal owner or an accepted participant. */
interface MentionCandidate {
  userId: number;
  name: string;
  role: string;
}

interface ParticipantsPayload {
  owner?: { id?: number | null; email?: string | null; display_name?: string | null } | null;
  participants?: Array<{
    user_id?: number | null;
    email?: string | null;
    display_name?: string | null;
    role?: string | null;
    accepted_at?: string | null;
  }> | null;
}

/* ─── Shared helpers (kept local so this file is self-contained) ──────────── */

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  attorney: "Attorney",
  cpa: "CPA",
  broker: "Broker",
  lender: "Lender",
  consultant: "Consultant",
  counterparty: "Counterparty",
  auditor: "Auditor",
};

function roleLabel(role: string | null | undefined): string {
  if (!role) return "Team";
  return ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

/** Role → one of the three mobile verdict tones, so badges stay on-palette. */
function roleTone(role: string | null | undefined): { bg: string; ink: string; dot: string } {
  switch (role) {
    case "owner":
    case "broker":
      return { bg: "var(--mb-verdict-pursue-soft)", ink: "var(--mb-verdict-pursue-ink)", dot: "var(--mb-verdict-pursue)" };
    case "counterparty":
      return { bg: "var(--mb-danger-soft)", ink: "var(--mb-danger-ink)", dot: "var(--mb-danger)" };
    case "cpa":
    case "lender":
    case "attorney":
    case "auditor":
      return { bg: "var(--mb-warn-soft)", ink: "var(--mb-warn-ink)", dot: "var(--mb-warn)" };
    case "consultant":
    default:
      return { bg: "var(--mb-card-2)", ink: "var(--mb-ink-2)", dot: "var(--mb-ink-4)" };
  }
}

function authorName(c: DeliverableComment): string {
  return c.display_name || c.email?.split("@")[0] || roleLabel(c.participant_role) || "Team";
}

function initialFor(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function RoleBadge({ role }: { role: string | null | undefined }) {
  const tone = roleTone(role);
  return (
    <span style={{ ...C.roleBadge, background: tone.bg, color: tone.ink }}>
      <span aria-hidden="true" style={{ ...C.roleDot, background: tone.dot }} />
      {roleLabel(role)}
    </span>
  );
}

/**
 * Render comment text with @mentions highlighted. Accents any "@Word" run
 * (letters, digits, ., _, -) — the same shape the autocomplete inserts. Purely
 * visual; the server is the source of truth for who was actually notified.
 */
function renderWithMentions(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(^|[\s(])(@[A-Za-z0-9][A-Za-z0-9._-]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    const lead = m[1];
    const handle = m[2];
    const start = m.index + lead.length;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<span key={`mention-${key++}`} style={C.mentionToken}>{handle}</span>);
    last = start + handle.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

/* ─── Data hook ───────────────────────────────────────────────────────────
   Loads + posts + resolves comments for a deliverable, and resolves the deal
   participants (for @mention autocomplete) when a dealId is known. */

export function useDeliverableComments(deliverableId: number | null, dealId?: number | null) {
  const [comments, setComments] = useState<DeliverableComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<MentionCandidate[]>([]);

  const refresh = useCallback(async (withSpinner: boolean) => {
    if (deliverableId == null) return;
    if (withSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/comments`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      setComments(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (e: any) {
      if (withSpinner) setError(e?.message || "Couldn't load comments");
    } finally {
      if (withSpinner) setLoading(false);
    }
  }, [deliverableId]);

  // Initial load + light poll so a teammate's comment shows up (async, not chat).
  useEffect(() => {
    if (deliverableId == null) {
      setComments([]);
      return;
    }
    let cancelled = false;
    const tick = (withSpinner: boolean) => { if (!cancelled) void refresh(withSpinner); };
    tick(true);
    const poll = setInterval(() => tick(false), 15000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [deliverableId, refresh]);

  // Resolve @mention candidates (deal owner + accepted participants).
  // Best-effort: if there's no dealId or the call fails, autocomplete is simply
  // absent and the backend still notifies the team on every comment.
  useEffect(() => {
    if (dealId == null) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}/participants`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = (await res.json()) as ParticipantsPayload;
        if (cancelled) return;
        const out: MentionCandidate[] = [];
        const seen = new Set<number>();
        const push = (uid: number | null | undefined, name: string | null | undefined, email: string | null | undefined, role: string) => {
          if (uid == null || seen.has(uid)) return;
          seen.add(uid);
          out.push({ userId: uid, name: name || email?.split("@")[0] || "Teammate", role });
        };
        if (data.owner) push(data.owner.id, data.owner.display_name, data.owner.email, "owner");
        for (const p of data.participants ?? []) {
          if (p.accepted_at == null) continue; // only people who can actually be notified
          push(p.user_id, p.display_name, p.email, p.role || "consultant");
        }
        setCandidates(out);
      } catch {
        /* autocomplete unavailable — thread still posts + notifies */
      }
    })();
    return () => { cancelled = true; };
  }, [dealId]);

  const addComment = useCallback(async (content: string, mentions: number[]): Promise<boolean> => {
    if (deliverableId == null || !content.trim() || posting) return false;
    setPosting(true);
    setPostError(null);
    try {
      const mentionIds = Array.from(new Set(mentions));
      const res = await fetch(`/api/deliverables/${deliverableId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content: content.trim(), ...(mentionIds.length ? { mentions: mentionIds } : null) }),
      });
      if (!res.ok) {
        setPostError(res.status === 403 ? "Read-only access can't comment. Ask the deal owner for comment access." : "Couldn't post your comment.");
        return false;
      }
      // The POST returns the bare row (no author fields). Append it optimistically
      // as "You", then re-fetch in the background to fill author + role.
      const created = await res.json().catch(() => null);
      if (created && typeof created.id === "number") {
        setComments(prev => [...prev, { ...created, display_name: "You", _pending: true }]);
      }
      void refresh(false);
      return true;
    } catch {
      setPostError("Network error posting your comment.");
      return false;
    } finally {
      setPosting(false);
    }
  }, [deliverableId, posting, refresh]);

  const resolveComment = useCallback(async (commentId: number) => {
    setResolvingId(commentId);
    try {
      const res = await fetch(`/api/deliverable-comments/${commentId}/resolve`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (res.ok) {
        setComments(prev => prev.map(c => (c.id === commentId ? { ...c, resolved: true } : c)));
      } else if (res.status === 403) {
        setPostError("Read-only access can't resolve comments.");
      }
    } catch {
      /* leave the row as-is; a refresh will reconcile */
    } finally {
      setResolvingId(null);
    }
  }, []);

  return {
    comments,
    loading,
    error,
    posting,
    postError,
    resolvingId,
    candidates,
    addComment,
    resolveComment,
  };
}

/* ─── Component ───────────────────────────────────────────────────────────
   Glass card with a header (count), the comment list (author badge, role, time,
   content, resolve toggle), and a compose box with @mention autocomplete. */

export function DeliverableComments({
  deliverableId,
  dealId,
  currentUserEmail,
  /** Start with the thread collapsed to a one-line "Comments" toggle (default false). */
  defaultCollapsed = false,
}: {
  deliverableId: number | null;
  dealId?: number | null;
  currentUserEmail?: string | null;
  defaultCollapsed?: boolean;
}) {
  // Hard gate: never render against a sample / no-deliverable context.
  if (deliverableId == null) return null;
  return (
    <DeliverableCommentsInner
      deliverableId={deliverableId}
      dealId={dealId}
      currentUserEmail={currentUserEmail}
      defaultCollapsed={defaultCollapsed}
    />
  );
}

function DeliverableCommentsInner({
  deliverableId,
  dealId,
  currentUserEmail,
  defaultCollapsed,
}: {
  deliverableId: number;
  dealId?: number | null;
  currentUserEmail?: string | null;
  defaultCollapsed: boolean;
}) {
  const thread = useDeliverableComments(deliverableId, dealId);
  const [open, setOpen] = useState(!defaultCollapsed);

  const [draft, setDraft] = useState("");
  // user-ids the author has @mentioned in the current draft (server re-validates).
  const [mentionIds, setMentionIds] = useState<number[]>([]);
  // open @-autocomplete state: the query after the active "@" and where it began.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // @mention candidates come straight from the hook (deal owner + accepted
  // participants). Mentioning yourself is harmless — the backend drops the
  // self-notify — so we don't need the current user's email to filter here.
  const candidates = thread.candidates;

  const mentionToken = (name: string) => name.replace(/\s+/g, "");

  const mentionMatches = useMemo<MentionCandidate[]>(() => {
    if (mentionQuery == null) return [];
    const q = mentionQuery.toLowerCase();
    return candidates
      .filter(c => q === "" || mentionToken(c.name).toLowerCase().startsWith(q) || c.name.toLowerCase().startsWith(q))
      .slice(0, 5);
  }, [candidates, mentionQuery]);

  const closeMention = () => {
    setMentionQuery(null);
    setMentionStart(-1);
  };

  // Re-derive the active @-query from the caret position after every change.
  const syncMentionState = (value: string, caret: number) => {
    const upToCaret = value.slice(0, caret);
    const at = upToCaret.lastIndexOf("@");
    if (at === -1) { closeMention(); return; }
    const charBefore = at === 0 ? "" : upToCaret[at - 1];
    const atWordBoundary = at === 0 || /\s/.test(charBefore);
    const token = upToCaret.slice(at + 1);
    const tokenHasSpace = /\s/.test(token);
    if (atWordBoundary && !tokenHasSpace) {
      setMentionQuery(token);
      setMentionStart(at);
    } else {
      closeMention();
    }
  };

  const onDraftChange = (value: string, caret: number) => {
    setDraft(value);
    syncMentionState(value, caret);
    // Drop any recorded mention whose "@Name" text no longer appears in the draft.
    setMentionIds(prev => prev.filter(id => {
      const c = candidates.find(x => x.userId === id);
      return c ? value.includes(`@${c.name}`) : false;
    }));
  };

  const selectMention = (c: MentionCandidate | undefined) => {
    if (!c || mentionStart < 0 || !textareaRef.current) return;
    const el = textareaRef.current;
    const caret = el.selectionStart ?? draft.length;
    const before = draft.slice(0, mentionStart);
    const after = draft.slice(caret);
    const insert = `@${c.name} `;
    const next = before + insert + after;
    setDraft(next);
    setMentionIds(prev => (prev.includes(c.userId) ? prev : [...prev, c.userId]));
    closeMention();
    const nextCaret = before.length + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    // Only send mentions whose "@Name" text is actually present in the final draft.
    const activeMentions = mentionIds.filter(id => {
      const c = candidates.find(x => x.userId === id);
      return c ? draft.includes(`@${c.name}`) : false;
    });
    const ok = await thread.addComment(draft, activeMentions);
    if (ok) {
      setDraft("");
      setMentionIds([]);
      closeMention();
      textareaRef.current?.focus();
    }
  };

  const activeCount = thread.comments.filter(c => !c.resolved).length;
  const headerCount = thread.loading && thread.comments.length === 0 ? "…" : String(thread.comments.length);

  return (
    <section style={C.card} aria-label="Comments">
      <button type="button" onClick={() => setOpen(v => !v)} style={C.header} aria-expanded={open}>
        <span style={C.headerIcon} aria-hidden="true">
          <MessageSquareText size={16} strokeWidth={2.2} color="var(--mb-accent-ink)" />
        </span>
        <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <span style={C.headerTitle}>Comments</span>
          <span style={C.headerSub}>
            {activeCount > 0 ? `${activeCount} open · async, the team is notified` : "Async notes — your deal team is notified"}
          </span>
        </span>
        <span className="mb-mono" style={C.headerCount}>{headerCount}</span>
      </button>

      {open && (
        <div style={C.body}>
          {thread.error && <div style={C.errorBanner} role="alert">{thread.error}</div>}

          {thread.loading && thread.comments.length === 0 ? (
            <div style={C.stateRow}>
              <Loader2 size={14} strokeWidth={2.4} color="var(--mb-ink-3)" style={C.spin} />
              <span>Loading comments…</span>
            </div>
          ) : thread.comments.length === 0 ? (
            <div style={C.emptyNote}>
              No comments yet. Leave a note for your deal team — @mention someone to notify them directly.
            </div>
          ) : (
            <div style={C.list}>
              {thread.comments.map((c) => {
                const name = authorName(c);
                const mine = c.display_name === "You"
                  || (!!currentUserEmail && !!c.email && c.email === currentUserEmail);
                return (
                  <div key={c.id} style={{ ...C.commentRow, opacity: c.resolved ? 0.62 : 1 }}>
                    <span style={mine ? C.avatarMine : C.avatar} aria-hidden="true">{initialFor(name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={C.commentMeta}>
                        <strong style={C.commentName}>{mine ? "You" : name}</strong>
                        <RoleBadge role={c.participant_role} />
                        <span style={C.commentTime}>
                          {c._pending ? "Sending…" : timeAgo(c.created_at)}
                        </span>
                      </div>
                      {c.section_ref && <div style={C.sectionRef}>{c.section_ref}</div>}
                      <div style={C.commentText}>{renderWithMentions(c.content)}</div>
                    </div>
                    {c.resolved ? (
                      <span style={C.resolvedTag}><Check size={11} strokeWidth={3} /> Resolved</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void thread.resolveComment(c.id)}
                        disabled={thread.resolvingId === c.id || c._pending}
                        style={{ ...C.resolveBtn, opacity: thread.resolvingId === c.id || c._pending ? 0.5 : 1 }}
                        aria-label="Resolve comment"
                      >
                        {thread.resolvingId === c.id
                          ? <Loader2 size={12} strokeWidth={2.6} color="var(--mb-ink-2)" style={C.spin} />
                          : <Check size={13} strokeWidth={2.6} color="var(--mb-ink-2)" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {thread.postError && <div style={{ ...C.errorBanner, marginTop: 10 }} role="alert">{thread.postError}</div>}

          {/* Compose */}
          <div style={C.composeRow}>
            <div style={C.composeField}>
              {mentionQuery != null && mentionMatches.length > 0 && (
                <div style={C.mentionMenu} role="listbox" aria-label="Mention a teammate">
                  <div className="mb-mono" style={C.mentionMenuHead}>MENTION</div>
                  {mentionMatches.map((c) => (
                    <button
                      key={c.userId}
                      type="button"
                      role="option"
                      aria-selected="false"
                      style={C.mentionItem}
                      // mousedown (not click) so the textarea doesn't blur first.
                      onMouseDown={e => { e.preventDefault(); selectMention(c); }}
                    >
                      <span style={C.mentionAvatar}>{c.name.charAt(0).toUpperCase()}</span>
                      <span style={C.mentionName}>{c.name}</span>
                      <RoleBadge role={c.role} />
                    </button>
                  ))}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={e => onDraftChange(e.target.value, e.target.selectionStart ?? e.target.value.length)}
                onClick={e => syncMentionState((e.target as HTMLTextAreaElement).value, (e.target as HTMLTextAreaElement).selectionStart ?? 0)}
                onKeyDown={e => {
                  const menuOpen = mentionQuery != null && mentionMatches.length > 0;
                  if (menuOpen && (e.key === "Enter" || e.key === "Tab")) {
                    e.preventDefault();
                    selectMention(mentionMatches[0]);
                    return;
                  }
                  if (menuOpen && e.key === "Escape") { e.preventDefault(); closeMention(); return; }
                }}
                placeholder={candidates.length ? "Comment…  (@ to mention)" : "Leave a comment for your team…"}
                rows={1}
                style={C.textarea}
              />
            </div>
            <button
              type="button"
              onClick={() => { void handleSend(); }}
              disabled={!draft.trim() || thread.posting}
              aria-label="Post comment"
              style={{ ...C.sendBtn, opacity: !draft.trim() || thread.posting ? 0.5 : 1 }}
            >
              {thread.posting
                ? <Loader2 size={16} strokeWidth={2.4} color="#fff" style={C.spin} />
                : <span style={{ transform: "rotate(90deg)", display: "grid", placeItems: "center" }}>
                    <ArrowGlyph />
                  </span>}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Tiny send chevron (avoids importing the shared MobileIcon to keep this file
 *  free of extra surface coupling). Mirrors the rotate-90 send arrow elsewhere. */
function ArrowGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Styles — mobile --mb-* tokens (Deal Team Messages twin) ─────────────── */

const C: Record<string, CSSProperties> = {
  spin: { animation: "spin 0.9s linear infinite" },

  card: {
    marginTop: 14,
    borderRadius: 20,
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 8px 28px -18px rgba(25,24,19,0.34), inset 0 0 0 0.5px var(--mb-line-2)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    backdropFilter: "blur(20px) saturate(180%)",
    overflow: "hidden",
  },

  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "14px 16px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  headerIcon: {
    width: 34, height: 34, borderRadius: 11, flexShrink: 0,
    background: "var(--mb-accent-soft)", display: "grid", placeItems: "center",
  },
  headerTitle: {
    display: "block",
    fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 17,
    letterSpacing: "-0.3px", color: "var(--mb-ink)",
  },
  headerSub: { display: "block", fontSize: 12, color: "var(--mb-ink-3)", marginTop: 1, textWrap: "pretty" },
  headerCount: {
    flexShrink: 0, padding: "2px 9px", borderRadius: 999, minWidth: 20, textAlign: "center",
    background: "var(--mb-card-2)", color: "var(--mb-ink-3)", fontSize: 11.5, fontWeight: 700,
  },

  body: { padding: "0 16px 16px" },

  list: { display: "flex", flexDirection: "column", gap: 12, marginTop: 2 },
  commentRow: {
    display: "grid",
    gridTemplateColumns: "30px minmax(0, 1fr) auto",
    alignItems: "flex-start", columnGap: 10,
    padding: "12px 12px", borderRadius: 14,
    background: "var(--mb-card)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), inset 0 0 0 0.5px var(--mb-line-2)",
  },
  avatar: {
    width: 30, height: 30, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--mb-card-2)", color: "var(--mb-ink-2)", fontSize: 12.5, fontWeight: 800,
  },
  avatarMine: {
    width: 30, height: 30, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--mb-ink)", color: "#fff", fontSize: 12.5, fontWeight: 800,
  },
  commentMeta: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  commentName: { fontSize: 13, fontWeight: 700, color: "var(--mb-ink-2)" },
  commentTime: { fontSize: 11, color: "var(--mb-ink-4)" },
  sectionRef: {
    marginTop: 4, display: "inline-block",
    padding: "1px 7px", borderRadius: 6,
    background: "var(--mb-card-2)", color: "var(--mb-ink-3)",
    fontSize: 10.5, fontWeight: 700, fontFamily: "var(--mb-font-mono)",
  },
  commentText: {
    marginTop: 5, fontSize: 14, lineHeight: 1.45, color: "var(--mb-ink)",
    whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
  resolveBtn: {
    flexShrink: 0, width: 30, height: 30, borderRadius: 9, border: "none",
    background: "var(--mb-card-2)", display: "grid", placeItems: "center", cursor: "pointer",
    boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
  },
  resolvedTag: {
    flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 8px", borderRadius: 999,
    background: "var(--mb-verdict-pursue-soft)", color: "var(--mb-verdict-pursue-ink)",
    fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap",
  },

  stateRow: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 2px",
    fontSize: 13, color: "var(--mb-ink-3)",
  },
  emptyNote: {
    padding: "14px 14px", borderRadius: 13, marginTop: 2,
    background: "var(--mb-card-2)", color: "var(--mb-ink-3)",
    fontSize: 13, lineHeight: 1.45, textWrap: "pretty",
  },
  errorBanner: {
    borderRadius: 12, padding: "10px 13px",
    background: "var(--mb-danger-soft)", color: "var(--mb-danger-ink)",
    fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, textWrap: "pretty",
    boxShadow: "inset 0 0 0 0.5px rgba(216,139,132,0.4)",
  },

  composeRow: { display: "flex", alignItems: "flex-end", gap: 8, marginTop: 12 },
  composeField: { flex: 1, minWidth: 0, position: "relative" },
  textarea: {
    width: "100%", boxSizing: "border-box",
    resize: "none", maxHeight: 120, minHeight: 42,
    padding: "11px 14px", borderRadius: 14, border: "none",
    background: "var(--mb-card-2)", color: "var(--mb-ink)", fontSize: 16,
    fontFamily: "var(--mb-font-body)", outline: "none", lineHeight: 1.4,
    boxShadow: "inset 0 0 0 0.5px var(--mb-line-2)",
  },
  sendBtn: {
    flexShrink: 0, width: 42, height: 42, borderRadius: 999, border: "none",
    background: "var(--mb-ink)", color: "#fff",
    display: "grid", placeItems: "center", cursor: "pointer",
  },

  // @-mention autocomplete (anchored above the textarea)
  mentionMenu: {
    position: "absolute", left: 0, right: 0, bottom: "calc(100% + 8px)",
    background: "rgba(255,255,255,0.96)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)", backdropFilter: "blur(20px) saturate(180%)",
    borderRadius: 16, boxShadow: "0 16px 40px -16px rgba(25,24,19,0.4), inset 0 0 0 0.5px var(--mb-line-2)",
    padding: 6, zIndex: 30, display: "flex", flexDirection: "column", gap: 2,
  },
  mentionMenuHead: { fontSize: 9.5, letterSpacing: "0.08em", fontWeight: 700, color: "var(--mb-ink-3)", padding: "4px 8px 2px" },
  mentionItem: {
    border: "none", background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 9, padding: "8px 9px", borderRadius: 11, width: "100%",
  },
  mentionAvatar: {
    width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center",
    background: "var(--mb-card-2)", color: "var(--mb-ink-2)", fontSize: 12, fontWeight: 800,
  },
  mentionName: {
    flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: "var(--mb-ink)", textAlign: "left",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  mentionToken: { color: "var(--mb-accent-ink)", fontWeight: 700 },

  roleBadge: {
    display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
    padding: "3px 8px", borderRadius: 999,
    fontSize: 10, fontWeight: 800, letterSpacing: "0.02em", whiteSpace: "nowrap",
  },
  roleDot: { width: 5, height: 5, borderRadius: "50%", flexShrink: 0 },
};
