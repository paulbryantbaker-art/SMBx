/* HistoryView.tsx — real conversation history (replaces the COMING SOON stub).
 *
 * Lists every non-archived conversation grouped by deal, straight from
 * GET /api/chat/conversations/grouped — the same endpoint the chat hook
 * uses, so nothing here is fabricated. Clicking a row resumes that thread
 * in the Yulia panel (onResume routes through the SAME useAuthChat instance
 * that powers the composer — the thread, deal context, and gate state all
 * come back with it). Delete is a two-step inline confirm against
 * DELETE /api/chat/conversations/:id.
 *
 * House list law: this is a FULL view — up to 100 rows per page with a
 * "Show next 100" extender.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { showToast } from "../../../lib/toast";
import { V6EmptyState } from "../shared/EmptyState";

const FULL_LIST_PAGE = 100;

interface HistoryConvo {
  id: number;
  title: string | null;
  summary: string | null;
  message_count: number;
  updated_at: string;
}

interface HistoryGroup {
  key: string;
  label: string;
  convos: HistoryConvo[];
}

interface HistoryViewProps {
  user: User | null;
  activeConversationId?: number | null;
  /** True while Yulia is streaming a reply. Switching threads mid-stream
   *  can't load the new thread (the hook skips fetches during a send) and
   *  the stream's done event would snap the selection back — so resume and
   *  active-row delete are disabled until she finishes. */
  busy?: boolean;
  /** Resume a conversation in the Yulia panel. Absent only when the bridge
   *  can't switch threads (anon / dev-bypass preview) — rows render inert. */
  onResume?: (id: number) => void;
  /** Called after the ACTIVE conversation is deleted so the composer clears
   *  instead of streaming into a thread that no longer exists. */
  onDeleted?: (id: number) => void;
}

export function V6HistoryView({ user, activeConversationId, busy = false, onResume, onDeleted }: HistoryViewProps) {
  const [, navigate] = useLocation();
  const [groups, setGroups] = useState<HistoryGroup[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [cap, setCap] = useState(FULL_LIST_PAGE);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const res = await fetch("/api/chat/conversations/grouped", { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const next: HistoryGroup[] = [];
      for (const deal of data.deals ?? []) {
        if (!deal.conversations?.length) continue;
        next.push({
          key: `deal-${deal.id}`,
          label: deal.business_name || deal.industry || "Deal",
          convos: deal.conversations,
        });
      }
      if (data.general?.length) next.push({ key: "general", label: "General", convos: data.general });
      if (data.orphaned?.length) next.push({ key: "orphaned", label: "Archived deals", convos: data.orphaned });
      // Newest activity first across groups (server orders convos within each).
      next.sort((a, b) =>
        new Date(b.convos[0]?.updated_at ?? 0).getTime() - new Date(a.convos[0]?.updated_at ?? 0).getTime());
      setGroups(next);
    } catch {
      setGroups([]);
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const deleteConvo = useCallback(async (id: number) => {
    setConfirmId(null);
    const res = await fetch(`/api/chat/conversations/${id}`, { method: "DELETE", headers: authHeaders() }).catch(() => null);
    if (!res?.ok) {
      showToast("Couldn't delete conversation", { tone: "error" });
      return;
    }
    setGroups(prev => prev
      ? prev.map(g => ({ ...g, convos: g.convos.filter(c => c.id !== id) })).filter(g => g.convos.length > 0)
      : prev);
    if (id === activeConversationId) onDeleted?.(id);
  }, [activeConversationId, onDeleted]);

  const filtered = useMemo(() => {
    if (!groups) return null;
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(g => ({
        ...g,
        convos: g.convos.filter(c =>
          (c.title ?? "").toLowerCase().includes(q)
          || (c.summary ?? "").toLowerCase().includes(q)
          || g.label.toLowerCase().includes(q)),
      }))
      .filter(g => g.convos.length > 0);
  }, [groups, query]);

  if (!user) {
    return (
      <div className="wk-content m-fade-up" style={{ maxWidth: 640 }}>
        <h1 className="pg-title">Conversation history</h1>
        <V6EmptyState
          title="Sign in to keep your history"
          body="Every conversation with Yulia is saved to your account — pick any of them back up from here."
          action={{ label: "Sign in", onClick: () => navigate("/login") }}
        />
      </div>
    );
  }

  const totalConvos = filtered?.reduce((n, g) => n + g.convos.length, 0) ?? 0;

  // Full-list law: render at most `cap` rows across groups, then offer the
  // next page. Groups are walked in order so the cut lands on the oldest.
  let budget = cap;
  const visible: HistoryGroup[] = [];
  for (const g of filtered ?? []) {
    if (budget <= 0) break;
    const take = g.convos.slice(0, budget);
    budget -= take.length;
    visible.push({ ...g, convos: take });
  }
  const hiddenCount = totalConvos - visible.reduce((n, g) => n + g.convos.length, 0);

  return (
    <div className="wk-content m-fade-up" style={{ maxWidth: 640 }}>
      <h1 className="pg-title">Conversation history</h1>

      {groups === null ? (
        <p style={H.quiet}>Loading conversations…</p>
      ) : loadFailed ? (
        <V6EmptyState
          title="Couldn't load your history"
          body="The conversation list didn't come back. Check your connection and try again."
          action={{ label: "Retry", onClick: () => { setGroups(null); void load(); } }}
        />
      ) : groups.length === 0 ? (
        <V6EmptyState
          title="No conversations yet"
          body="Once you talk to Yulia, every thread lands here so you can pick it back up."
        />
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={e => { setQuery(e.target.value); setCap(FULL_LIST_PAGE); }}
            placeholder="Search conversations"
            aria-label="Search conversations"
            style={H.search}
          />

          {visible.length === 0 && (
            <p style={H.quiet}>Nothing matches “{query.trim()}”.</p>
          )}

          {visible.map(group => (
            <section key={group.key} style={H.group} aria-label={group.label}>
              <div style={H.groupLabel}>{group.label}</div>
              <div style={H.rows}>
                {group.convos.map(c => (
                  <ConvoRow
                    key={c.id}
                    convo={c}
                    isActive={c.id === activeConversationId}
                    busy={busy}
                    confirming={confirmId === c.id}
                    onResume={onResume ? () => onResume(c.id) : undefined}
                    onAskDelete={() => setConfirmId(c.id)}
                    onKeep={() => setConfirmId(null)}
                    onDelete={() => void deleteConvo(c.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          {hiddenCount > 0 && (
            <button type="button" className="wkbtn wk-tap" style={H.moreBtn} onClick={() => setCap(p => p + FULL_LIST_PAGE)}>
              Show next {Math.min(hiddenCount, FULL_LIST_PAGE)}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ConvoRow({
  convo, isActive, busy, confirming, onResume, onAskDelete, onKeep, onDelete,
}: {
  convo: HistoryConvo;
  isActive: boolean;
  busy: boolean;
  confirming: boolean;
  onResume?: () => void;
  onAskDelete: () => void;
  onKeep: () => void;
  onDelete: () => void;
}) {
  const trashRef = useRef<HTMLButtonElement | null>(null);
  const title = convo.title?.trim() || "Untitled conversation";
  const meta = [
    timeAgo(convo.updated_at),
    convo.message_count > 0 ? `${convo.message_count} ${convo.message_count === 1 ? "message" : "messages"}` : null,
  ].filter(Boolean).join(" · ");
  // Mid-stream thread switches corrupt the panel (see HistoryViewProps.busy);
  // deleting the ACTIVE thread mid-stream orphans the reply. Other rows stay
  // deletable while she streams.
  const resumeBlocked = !onResume || busy;
  const deleteBlocked = busy && isActive;

  return (
    <div style={{ ...H.row, ...(isActive ? H.rowActive : undefined) }}>
      <button
        type="button"
        onClick={onResume}
        disabled={resumeBlocked}
        style={{ ...H.rowMain, cursor: resumeBlocked ? "default" : "pointer", opacity: busy ? 0.55 : 1 }}
        aria-label={`Resume “${title}”`}
        title={busy ? "Yulia is replying — switch threads when she finishes" : undefined}
      >
        <span style={H.rowTitleLine}>
          <span style={H.rowTitle}>{title}</span>
          {isActive && <span style={H.openTag}>Open in chat</span>}
        </span>
        {convo.summary && <span style={H.rowSummary}>{convo.summary}</span>}
        <span style={H.rowMeta}>{meta}</span>
      </button>
      {confirming ? (
        <span
          style={H.confirmPair}
          onKeyDown={e => { if (e.key === "Escape") { onKeep(); requestAnimationFrame(() => trashRef.current?.focus()); } }}
        >
          <button type="button" className="wkbtn wk-tap" style={H.confirmDelete} onClick={onDelete} autoFocus>Delete</button>
          <button
            type="button"
            className="wkbtn wk-tap"
            style={H.confirmKeep}
            onClick={() => { onKeep(); requestAnimationFrame(() => trashRef.current?.focus()); }}
          >
            Keep
          </button>
        </span>
      ) : (
        <button
          ref={trashRef}
          type="button"
          onClick={onAskDelete}
          disabled={deleteBlocked}
          style={{ ...H.trashBtn, opacity: deleteBlocked ? 0.4 : 1, cursor: deleteBlocked ? "default" : "pointer" }}
          aria-label={`Delete “${title}”`}
          title={deleteBlocked ? "Yulia is replying in this thread — delete it when she finishes" : "Delete conversation"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const H: Record<string, CSSProperties> = {
  quiet: { fontSize: 12.5, color: "var(--ink-3)", margin: "8px 0 0" },
  search: {
    width: "100%", boxSizing: "border-box",
    height: 34, padding: "0 12px",
    margin: "10px 0 4px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--ink)",
    fontSize: 12.5,
    fontFamily: "var(--font-body)",
    /* no outline:none — keyboard users keep the focus ring */
  },
  group: { marginTop: 16 },
  groupLabel: {
    fontSize: 12, fontWeight: 700, color: "var(--ink-2)",
    margin: "0 0 6px",
  },
  rows: {
    display: "flex", flexDirection: "column",
    borderRadius: 12,
    border: "1px solid var(--wk-hairline)",
    background: "var(--surface)",
    boxShadow: "var(--wk-elev-card)",
    overflow: "hidden",
  },
  row: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "0 8px 0 0",
    borderTop: "1px solid var(--line)",
    marginTop: -1,
  },
  rowActive: { background: "var(--surface-2)" },
  /* Explicit button resets (NOT all:unset — that kills the stylesheet's
     :focus-visible ring at inline level and keyboard users lose focus). */
  rowMain: {
    appearance: "none",
    background: "transparent",
    border: "none",
    margin: 0,
    font: "inherit",
    color: "inherit",
    textAlign: "left",
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 2,
    padding: "10px 4px 10px 12px",
    boxSizing: "border-box",
  },
  rowTitleLine: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  rowTitle: {
    fontSize: 12.5, fontWeight: 700, color: "var(--ink)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  openTag: {
    flexShrink: 0,
    padding: "1px 7px", borderRadius: 999,
    background: "var(--accent-soft)", color: "var(--accent-strong)",
    fontSize: 10, fontWeight: 700,
  },
  rowSummary: {
    fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  rowMeta: { fontSize: 10.5, color: "var(--ink-3)" },
  trashBtn: {
    appearance: "none",
    background: "transparent",
    border: "none",
    margin: 0,
    padding: 0,
    width: 28, height: 28, borderRadius: 8,
    display: "grid", placeItems: "center",
    color: "var(--ink-3)",
    cursor: "pointer",
    flexShrink: 0,
  },
  confirmPair: { display: "inline-flex", gap: 4, flexShrink: 0 },
  confirmDelete: {
    height: 24, padding: "0 9px", borderRadius: 999,
    background: "var(--st-risk-bg)", color: "#4A1410",
    border: "none", fontSize: 10.5, fontWeight: 750,
  },
  confirmKeep: {
    height: 24, padding: "0 9px", borderRadius: 999,
    fontSize: 10.5, fontWeight: 700,
  },
  moreBtn: { marginTop: 12, height: 30, padding: "0 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700 },
};
