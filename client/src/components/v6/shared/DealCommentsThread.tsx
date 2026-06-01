/**
 * DealCommentsThread — V6 desktop contextual comments thread (DT-4).
 *
 * A re-skin of client/src/components/chat/CommentsPanel.tsx (pre-V6) onto V6
 * tokens + .wk* primitives. Mounted on the desktop DocView and AnalysisView so a
 * deal team can leave async, threaded notes on a specific deliverable.
 *
 * Backend (all behind requireAuth, see server/routes/dataRoom.ts):
 *   GET   /api/deliverables/:deliverableId/comments
 *           → [{ id, content, section_ref, resolved, created_at, display_name, email, participant_role }]
 *   POST  /api/deliverables/:deliverableId/comments  ← { content, sectionRef?, mentions?: number[] }
 *           (read-level access → 403; @mentioned + all participants get notified)
 *   PATCH /api/deliverable-comments/:commentId/resolve   (one-way: marks resolved)
 *
 * @mention autocomplete is sourced from the deliverable's deal team:
 *   GET /api/deliverables/:deliverableId → { deal_id }
 *   GET /api/deals/:dealId/participants  → { owner, participants: [{ user_id, display_name, email, role }] }
 * Typing "@" opens a participant menu; selecting inserts "@Name" and collects the
 * user id into `mentions`. If participants can't be loaded, the thread still works
 * without autocomplete (the backend notifies the whole team on every comment).
 *
 * If `deliverableId` is not a real number, the component renders nothing.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { authHeaders } from "../../../hooks/useAuth";

interface LiveComment {
  id: number;
  content: string;
  section_ref: string | null;
  resolved: boolean;
  created_at: string;
  display_name: string | null;
  email: string | null;
  participant_role: string | null;
}

/** A person who can be @mentioned: deal owner + accepted participants. */
interface MentionTarget {
  userId: number;
  name: string;
  role: string | null;
}

export function DealCommentsThread({ deliverableId }: { deliverableId?: number | null }) {
  const validId = typeof deliverableId === "number" && Number.isFinite(deliverableId) ? deliverableId : null;

  const [comments, setComments] = useState<LiveComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  // @mention state.
  const [mentionTargets, setMentionTargets] = useState<MentionTarget[]>([]);
  const [pendingMentions, setPendingMentions] = useState<MentionTarget[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [menuIndex, setMenuIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ── Load comments ──────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (validId === null) return;
    try {
      const res = await fetch(`/api/deliverables/${validId}/comments`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => []);
      setComments(Array.isArray(data) ? data : []);
      setLoadError(null);
    } catch {
      setLoadError("Couldn't load comments.");
    } finally {
      setLoading(false);
    }
  }, [validId]);

  useEffect(() => {
    if (validId === null) return;
    setLoading(true);
    void fetchComments();
  }, [validId, fetchComments]);

  // ── Load @mention targets (deliverable → deal_id → participants) ──
  useEffect(() => {
    if (validId === null) {
      setMentionTargets([]);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const delRes = await fetch(`/api/deliverables/${validId}`, { headers: authHeaders() });
        if (!delRes.ok) return;
        const deliverable = await delRes.json().catch(() => null);
        const dealId = deliverable?.deal_id;
        if (typeof dealId !== "number") return;
        const partRes = await fetch(`/api/deals/${dealId}/participants`, { headers: authHeaders() });
        if (!partRes.ok) return; // No team access → thread works without autocomplete.
        const team = await partRes.json().catch(() => null);
        if (!alive || !team) return;
        const targets: MentionTarget[] = [];
        const owner = team.owner;
        if (owner && typeof owner.id === "number") {
          targets.push({ userId: owner.id, name: mentionName(owner.display_name, owner.email, "owner"), role: "owner" });
        }
        if (Array.isArray(team.participants)) {
          for (const p of team.participants) {
            if (typeof p?.user_id !== "number") continue;
            targets.push({ userId: p.user_id, name: mentionName(p.display_name, p.email, p.role), role: p.role ?? null });
          }
        }
        // De-dupe by userId (owner could also appear as a participant row).
        const seen = new Set<number>();
        setMentionTargets(targets.filter(t => (seen.has(t.userId) ? false : (seen.add(t.userId), true))));
      } catch {
        /* autocomplete is best-effort; backend still notifies the team */
      }
    })();
    return () => { alive = false; };
  }, [validId]);

  if (validId === null) return null;

  const active = comments.filter(c => !c.resolved);
  const resolved = comments.filter(c => c.resolved);
  const displayed = showResolved ? comments : active;

  // ── @mention menu candidates ───────────────────────────────────
  const menuCandidates = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    const base = mentionTargets.filter(t => !pendingMentions.some(m => m.userId === t.userId));
    if (!q) return base.slice(0, 6);
    return base.filter(t => t.name.toLowerCase().includes(q)).slice(0, 6);
  }, [mentionTargets, pendingMentions, menuQuery]);

  // Detect a trailing "@token" at the caret to drive the menu.
  const refreshMentionMenu = (value: string, caret: number) => {
    if (mentionTargets.length === 0) { setMenuOpen(false); return; }
    const upToCaret = value.slice(0, caret);
    // Trigger token is a single contiguous run after "@" (no spaces), so normal
    // prose typed after an inserted "@First Last" mention doesn't reopen the menu.
    const match = /(?:^|\s)@([\w.\-]{0,40})$/.exec(upToCaret);
    if (match) {
      setMenuQuery(match[1] ?? "");
      setMenuIndex(0);
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    const caret = textareaRef.current?.selectionStart ?? value.length;
    refreshMentionMenu(value, caret);
    // Drop any pending mention whose "@Name" token was edited out of the text.
    setPendingMentions(prev => prev.filter(m => value.includes(`@${m.name}`)));
  };

  const selectMention = (target: MentionTarget) => {
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? draft.length;
    const before = draft.slice(0, caret);
    const after = draft.slice(caret);
    // Replace the trailing "@token" (single run, no spaces) with "@Name ".
    const replaced = before.replace(/(^|\s)@([\w.\-]{0,40})$/, (_m, lead) => `${lead}@${target.name} `);
    const next = replaced + after;
    setDraft(next);
    setPendingMentions(prev => (prev.some(m => m.userId === target.userId) ? prev : [...prev, target]));
    setMenuOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = replaced.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen && menuCandidates.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMenuIndex(i => (i + 1) % menuCandidates.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMenuIndex(i => (i - 1 + menuCandidates.length) % menuCandidates.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); selectMention(menuCandidates[menuIndex]); return; }
      if (e.key === "Escape") { e.preventDefault(); setMenuOpen(false); return; }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  // ── Post ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const content = draft.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setPostError(null);
    // Only send ids whose "@Name" token actually survived in the text.
    const mentions = Array.from(
      new Set(pendingMentions.filter(m => content.includes(`@${m.name}`)).map(m => m.userId)),
    );
    try {
      const res = await fetch(`/api/deliverables/${validId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content, ...(mentions.length ? { mentions } : null) }),
      });
      if (!res.ok) {
        setPostError(res.status === 403
          ? "Your access level is read-only, so you can't comment here."
          : "Couldn't post your comment.");
        return;
      }
      setDraft("");
      setPendingMentions([]);
      setMenuOpen(false);
      await fetchComments();
    } catch {
      setPostError("Network error posting your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (commentId: number) => {
    // Optimistic: the backend resolve is one-way (sets resolved = true).
    setComments(prev => prev.map(c => (c.id === commentId ? { ...c, resolved: true } : c)));
    try {
      const res = await fetch(`/api/deliverable-comments/${commentId}/resolve`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) await fetchComments(); // revert to server truth on failure
    } catch {
      await fetchComments();
    }
  };

  return (
    <section className="wkcard" style={S.card}>
      <div style={S.header}>
        <div className="mono" style={S.eyebrow}>COMMENTS · {active.length}</div>
        {resolved.length > 0 && (
          <button type="button" onClick={() => setShowResolved(v => !v)} style={S.linkBtn}>
            {showResolved ? "Hide resolved" : `Show ${resolved.length} resolved`}
          </button>
        )}
      </div>

      {/* List */}
      <div style={S.list}>
        {loading && <div style={S.muted}>Loading comments…</div>}
        {!loading && loadError && <div style={S.muted}>{loadError}</div>}
        {!loading && !loadError && displayed.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyTitle}>No comments yet</div>
            <div style={S.emptyBody}>Leave a note or question for your deal team. Mention someone with @ to notify them.</div>
          </div>
        )}

        {displayed.map(comment => {
          const name = comment.display_name || comment.email?.split("@")[0] || comment.participant_role || "Team";
          return (
            <div key={comment.id} style={{ ...S.comment, ...(comment.resolved ? S.commentResolved : null) }}>
              <div style={S.avatar}>{initials(name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.commentHead}>
                  <span style={S.author}>{name}</span>
                  {comment.participant_role && <span style={S.roleChip}>{comment.participant_role}</span>}
                  <span className="mono" style={S.time}>{fmtTimeAgo(comment.created_at)}</span>
                </div>
                {comment.section_ref && <div style={S.sectionRef}>Re: {comment.section_ref}</div>}
                <div style={S.body}>{renderWithMentions(comment.content)}</div>
                {comment.resolved ? (
                  <div style={S.resolvedTag}>✓ Resolved</div>
                ) : (
                  <button type="button" onClick={() => void handleResolve(comment.id)} style={S.resolveBtn}>
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div style={S.composer}>
        <div style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Add a comment…  (type @ to mention)"
            rows={2}
            style={S.textarea}
          />
          {menuOpen && menuCandidates.length > 0 && (
            <div style={S.mentionMenu}>
              {menuCandidates.map((t, i) => (
                <button
                  key={t.userId}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); selectMention(t); }}
                  onMouseEnter={() => setMenuIndex(i)}
                  style={{ ...S.mentionItem, ...(i === menuIndex ? S.mentionItemActive : null) }}
                >
                  <span style={S.mentionAvatar}>{initials(t.name)}</span>
                  <span style={S.mentionName}>{t.name}</span>
                  {t.role && <span style={S.mentionRole}>{t.role}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={S.composerFoot}>
          <span className="mono" style={S.hint}>{postError ? "" : "⌘+Enter to send"}</span>
          {postError && <span style={S.errorText}>{postError}</span>}
          <button
            type="button"
            className="wkbtn primary"
            onClick={() => void handleSubmit()}
            disabled={!draft.trim() || submitting}
            style={S.sendBtn}
          >
            {submitting ? "Sending…" : "Comment"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── helpers ──────────────────────────────────────────────────────

function mentionName(displayName: string | null | undefined, email: string | null | undefined, role: string | null | undefined): string {
  return (displayName || email?.split("@")[0] || role || "Team").trim();
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  const out = parts.map(p => p[0]?.toUpperCase()).join("");
  return out || "T";
}

/** Render comment text with @Name runs highlighted in the accent color. */
function renderWithMentions(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Match "@" + a name run (letters, digits, ., -, spaces) up to punctuation/end.
  const re = /@[A-Za-z0-9][A-Za-z0-9.\-]*(?: [A-Za-z0-9.\-]+)*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<span key={`m${key++}`} style={S.mentionRun}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [text];
}

function fmtTimeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "JUST NOW";
    if (mins < 60) return `${mins}M AGO`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}H AGO`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}D AGO`;
    return new Date(iso).toLocaleDateString().toUpperCase();
  } catch {
    return "";
  }
}

const S: Record<string, CSSProperties> = {
  card: { padding: "18px 20px", marginTop: 18, width: "100%", boxSizing: "border-box" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  eyebrow: { fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.14em", fontWeight: 600 },
  linkBtn: {
    border: 0, background: "transparent", color: "var(--accent-strong)",
    fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0,
    fontFamily: "var(--font-body)",
  },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  muted: { fontSize: 12.5, color: "var(--ink-3)", padding: "6px 0" },
  empty: { padding: "14px 0" },
  emptyTitle: { fontSize: 13, fontWeight: 600, color: "var(--ink)" },
  emptyBody: { fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.5 },
  comment: { display: "flex", gap: 10 },
  commentResolved: { opacity: 0.62 },
  avatar: {
    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--accent-soft)", color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 9.5,
    border: "1px solid var(--line)",
  },
  commentHead: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  author: { fontSize: 12.5, fontWeight: 600, color: "var(--ink)" },
  roleChip: {
    fontSize: 8.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
    padding: "1px 6px", borderRadius: 6, background: "var(--surface-2)", color: "var(--ink-2)",
    fontFamily: "var(--font-mono)",
  },
  time: { fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em", marginLeft: "auto" },
  sectionRef: { fontSize: 10.5, fontWeight: 600, color: "var(--accent-strong)", marginTop: 3 },
  body: { fontSize: 12.5, color: "var(--ink)", lineHeight: 1.55, marginTop: 3, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  mentionRun: { color: "var(--accent-strong)", fontWeight: 600 },
  resolveBtn: {
    marginTop: 6, border: 0, background: "transparent", color: "var(--ink-3)",
    fontSize: 10.5, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "var(--font-body)",
  },
  resolvedTag: {
    marginTop: 5, display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 10.5, fontWeight: 600, color: "var(--accent-strong)",
  },
  composer: { marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" },
  textarea: {
    width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 56,
    padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line-2)",
    background: "var(--surface)", color: "var(--ink)", fontSize: 12.5, lineHeight: 1.5,
    fontFamily: "var(--font-body)", outline: "none",
  },
  mentionMenu: {
    position: "absolute", left: 0, bottom: "calc(100% + 4px)", zIndex: 20,
    width: "min(280px, 100%)", background: "var(--surface)", border: "1px solid var(--line-2)",
    borderRadius: 10, boxShadow: "0 18px 40px -22px rgba(25,24,19,.45)",
    padding: 4, display: "flex", flexDirection: "column", gap: 2,
  },
  mentionItem: {
    display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
    padding: "7px 8px", borderRadius: 8, border: 0, background: "transparent",
    cursor: "pointer", fontFamily: "var(--font-body)",
  },
  mentionItemActive: { background: "var(--surface-2)" },
  mentionAvatar: {
    width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center",
    background: "var(--accent-soft)", color: "var(--accent-strong)",
    fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 8.5,
  },
  mentionName: { fontSize: 12.5, fontWeight: 500, color: "var(--ink)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  mentionRole: { fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "var(--font-mono)" },
  composerFoot: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  hint: { fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.06em" },
  errorText: { fontSize: 11, color: "var(--st-risk-fg, #4A1410)", fontWeight: 500 },
  sendBtn: { marginLeft: "auto", height: 30, padding: "0 14px", fontSize: ".82rem" },
};
