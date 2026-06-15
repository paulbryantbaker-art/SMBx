/**
 * CDHistory — Conversation history, ported to the Claude-Design (cool/indigo)
 * language. A list of every non-archived conversation grouped by deal, straight
 * from GET /api/chat/conversations/grouped — the SAME endpoint the chat hook
 * uses, so nothing here is fabricated. Clicking a row resumes that thread in the
 * Yulia panel via onResume (which routes through the same useAuthChat instance
 * that powers the composer — thread, deal context, and gate state all come back
 * with it). Delete is a two-step inline confirm against
 * DELETE /api/chat/conversations/:id.
 *
 * Data wiring is preserved 1:1 from V6HistoryView: same endpoint, same grouping,
 * same resume/delete behavior, same busy-guards (no thread switch / active-row
 * delete mid-stream), same 100-row full-list page. This is a pure reskin onto
 * the `.cd-root` token layer; only `--cd-*` tokens are used.
 *
 * Props match V6HistoryView exactly so it drops in as a 1:1 route swap (Canvas
 * calls it with user / activeConversationId / busy / onResume / onDeleted).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { showToast } from "../../../lib/toast";
import { CDIcon, CDCard, CDPill } from "../kit/cdUi";

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

export function CDHistory({ user, activeConversationId, busy = false, onResume, onDeleted }: HistoryViewProps) {
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

  /* signed-out — honest gate, same copy/action as V6 */
  if (!user) {
    return (
      <div className="cd-root cd-scrollable" style={ROOT}>
        <Header subtitle="Every conversation with Yulia is saved to your account." />
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cd-ink)" }}>Sign in to keep your history</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Every conversation with Yulia is saved to your account — pick any of them back up from here.</div>
          <div style={{ marginTop: 16 }}>
            <PrimaryBtn onClick={() => navigate("/login")}>Sign in</PrimaryBtn>
          </div>
        </CDCard>
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

  const subtitle = groups && groups.length > 0
    ? `${totalConvos} thread${totalConvos === 1 ? "" : "s"} across ${groups.length} ${groups.length === 1 ? "context" : "contexts"} — pick any back up.`
    : "Every conversation with Yulia lands here so you can pick it back up.";

  return (
    <div className="cd-root cd-scrollable" style={ROOT}>
      <Header subtitle={subtitle} />

      {groups === null ? (
        <CDCard><div className="cd-skel" style={{ height: 140 }} /></CDCard>
      ) : loadFailed ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cd-ink)" }}>Couldn't load your history</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>The conversation list didn't come back. Check your connection and try again.</div>
          <div style={{ marginTop: 16 }}>
            <PrimaryBtn onClick={() => { setGroups(null); void load(); }}>Retry</PrimaryBtn>
          </div>
        </CDCard>
      ) : groups.length === 0 ? (
        <CDCard style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cd-ink)" }}>No conversations yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Once you talk to Yulia, every thread lands here so you can pick it back up.</div>
        </CDCard>
      ) : (
        <>
          {/* search */}
          <div style={{ position: "relative", maxWidth: 420 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
              <CDIcon name="search" size={15} color="var(--cd-ink-4)" />
            </span>
            <input
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); setCap(FULL_LIST_PAGE); }}
              placeholder="Search conversations"
              aria-label="Search conversations"
              style={SEARCH}
            />
          </div>

          {visible.length === 0 && (
            <div style={{ fontSize: 13, color: "var(--cd-ink-3)" }}>Nothing matches “{query.trim()}”.</div>
          )}

          {visible.map(group => (
            <section key={group.key} style={{ display: "flex", flexDirection: "column", gap: 11 }} aria-label={group.label}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)" }}>{group.label}</h3>
                <span className="cd-num" style={{ fontSize: 11, fontWeight: 700, color: "var(--cd-ink-3)", background: "var(--cd-surface-3)", borderRadius: 6, padding: "1px 7px" }}>{group.convos.length}</span>
              </div>
              <div style={ROWS}>
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
            <button type="button" style={MORE_BTN} onClick={() => setCap(p => p + FULL_LIST_PAGE)}>
              Show next {Math.min(hiddenCount, FULL_LIST_PAGE)}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ─── editorial header ──────────────────────────────────────────────────── */
function Header({ subtitle }: { subtitle: string }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 38, lineHeight: 1.03, letterSpacing: "-0.02em" }}>Conversations</h1>
      <p style={{ margin: "9px 0 0", color: "var(--cd-ink-2)", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

/* ─── conversation row — the list atom ──────────────────────────────────── */
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
    <div style={{ ...ROW, ...(isActive ? ROW_ACTIVE : undefined) }}>
      <button
        type="button"
        onClick={onResume}
        disabled={resumeBlocked}
        aria-current={isActive ? "true" : undefined}
        style={{ ...ROW_MAIN, cursor: resumeBlocked ? "default" : "pointer", opacity: busy ? 0.55 : 1 }}
        aria-label={`Resume “${title}”`}
        title={busy ? "Yulia is replying — switch threads when she finishes" : undefined}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <span style={ROW_TITLE}>{title}</span>
          {isActive && <CDPill tone="accent">Open in chat</CDPill>}
        </span>
        {convo.summary && <span style={ROW_SUMMARY}>{convo.summary}</span>}
        <span className="cd-num" style={ROW_META}>{meta}</span>
      </button>
      {confirming ? (
        <span
          style={{ display: "inline-flex", gap: 6, flexShrink: 0 }}
          onKeyDown={e => { if (e.key === "Escape") { onKeep(); requestAnimationFrame(() => trashRef.current?.focus()); } }}
        >
          <button type="button" style={CONFIRM_DELETE} onClick={onDelete} autoFocus>Delete</button>
          <button
            type="button"
            style={CONFIRM_KEEP}
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
          style={{ ...TRASH_BTN, opacity: deleteBlocked ? 0.4 : 1, cursor: deleteBlocked ? "default" : "pointer" }}
          aria-label={`Delete “${title}”`}
          title={deleteBlocked ? "Yulia is replying in this thread — delete it when she finishes" : "Delete conversation"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─── button ────────────────────────────────────────────────────────────── */
function PrimaryBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--cd-accent)", color: "white", border: "none", borderRadius: "var(--cd-r-md)", padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", whiteSpace: "nowrap", boxShadow: "var(--cd-shadow-sm)" }}>{children}</button>
  );
}

/* ─── helpers (ported verbatim from V6 so the two surfaces agree) ────────── */
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

/* ─── styles (all --cd-*) ───────────────────────────────────────────────── */
const ROOT: CSSProperties = {
  background: "var(--cd-canvas)", height: "100%", overflow: "auto",
  padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)",
};
const SEARCH: CSSProperties = {
  width: "100%", boxSizing: "border-box",
  height: 38, padding: "0 12px 0 35px",
  borderRadius: "var(--cd-r-md)",
  border: "1px solid var(--cd-line-2)",
  background: "var(--cd-surface)",
  color: "var(--cd-ink)",
  fontSize: 13,
  fontFamily: "var(--cd-sans)",
  /* no outline:none — keyboard users keep the focus ring */
};
const ROWS: CSSProperties = {
  display: "flex", flexDirection: "column",
  borderRadius: "var(--cd-r-lg)",
  border: "1px solid var(--cd-line)",
  background: "var(--cd-surface)",
  boxShadow: "var(--cd-shadow-sm)",
  overflow: "hidden",
};
const ROW: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "0 12px 0 0",
  borderTop: "1px solid var(--cd-line)",
  marginTop: -1,
};
const ROW_ACTIVE: CSSProperties = { background: "var(--cd-accent-soft)" };
/* Explicit button resets (NOT all:unset — that kills the stylesheet's
   :focus-visible ring at inline level and keyboard users lose focus). */
const ROW_MAIN: CSSProperties = {
  appearance: "none",
  background: "transparent",
  border: "none",
  margin: 0,
  font: "inherit",
  color: "inherit",
  textAlign: "left",
  flex: 1, minWidth: 0,
  display: "flex", flexDirection: "column", gap: 3,
  padding: "13px 6px 13px 16px",
  boxSizing: "border-box",
  fontFamily: "var(--cd-sans)",
};
const ROW_TITLE: CSSProperties = {
  fontSize: 13.5, fontWeight: 700, color: "var(--cd-ink)", letterSpacing: "-0.01em",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
const ROW_SUMMARY: CSSProperties = {
  fontSize: 12, color: "var(--cd-ink-2)", lineHeight: 1.4,
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
const ROW_META: CSSProperties = { fontSize: 11, color: "var(--cd-ink-4)" };
const TRASH_BTN: CSSProperties = {
  appearance: "none",
  background: "transparent",
  border: "none",
  margin: 0,
  padding: 0,
  width: 30, height: 30, borderRadius: 8,
  display: "grid", placeItems: "center",
  color: "var(--cd-ink-4)",
  cursor: "pointer",
  flexShrink: 0,
};
const CONFIRM_DELETE: CSSProperties = {
  height: 26, padding: "0 11px", borderRadius: 999,
  background: "var(--cd-neg-soft)", color: "var(--cd-neg)",
  border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
  fontFamily: "var(--cd-sans)",
};
const CONFIRM_KEEP: CSSProperties = {
  height: 26, padding: "0 11px", borderRadius: 999,
  background: "var(--cd-surface-2)", color: "var(--cd-ink-2)",
  border: "1px solid var(--cd-line-2)", fontSize: 11, fontWeight: 600, cursor: "pointer",
  fontFamily: "var(--cd-sans)",
};
const MORE_BTN: CSSProperties = {
  alignSelf: "flex-start",
  height: 34, padding: "0 16px", borderRadius: 999,
  background: "var(--cd-surface)", color: "var(--cd-ink-2)",
  border: "1px solid var(--cd-line-2)", fontSize: 12, fontWeight: 600, cursor: "pointer",
  fontFamily: "var(--cd-sans)",
};
