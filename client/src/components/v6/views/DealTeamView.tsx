/**
 * V6 Deal Team — desktop collaboration surface.
 *
 * Un-orphans the live collaboration backend (participants, invite, role/access
 * controls, and human deal-team chat) into the current V6 shell as a "deal-team"
 * canvas tab. Reimplements the salvaged logic from the retired terra-palette
 * panels (documents/DealMessagesPanel, chat/ParticipantPanel) in V6 tokens.
 *
 * Built on .wk-content primitives (wkcard, wkbtn, statpill, pg-head) so it
 * inherits the desktop slate-blue palette. No terra/cream. No fixed full-viewport
 * backgrounds (Safari toolbar rule).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { V6Icon } from "../icons";
import type { OpenTab } from "../types";
import type { User } from "../../../hooks/useAuth";
import {
  useDealTeam,
  DEAL_TEAM_ROLES,
  DEAL_TEAM_ACCESS_LEVELS,
  type DealTeamAccessLevel,
  type DealTeamMessage,
  type DealTeamParticipant,
} from "../hooks/useDealTeam";

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

/** Map a role onto one of the existing statpill status tones so badges stay on-palette. */
function roleTone(role: string | null | undefined): "good" | "review" | "diligence" | "flag" | "missing" {
  switch (role) {
    case "owner": return "good";
    case "attorney": return "diligence";
    case "cpa": return "review";
    case "broker": return "good";
    case "lender": return "review";
    case "counterparty": return "flag";
    case "auditor": return "diligence";
    case "consultant":
    default: return "missing";
  }
}

const ACCESS_LABELS: Record<DealTeamAccessLevel, string> = {
  full: "Full access",
  comment: "Comment",
  read: "Read-only",
};

function roleLabel(role: string | null | undefined): string {
  if (!role) return "Member";
  return ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

function initialsFor(name: string | null | undefined, email: string): string {
  const base = (name || email || "?").trim();
  return base.charAt(0).toUpperCase() || "?";
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
  return (
    <span className={`statpill ${roleTone(role)}`} style={T.roleBadge}>
      <span className="d" />
      {roleLabel(role)}
    </span>
  );
}

export function V6DealTeamView({
  dealId,
  dealTitle,
  onTalkToYulia,
  user,
}: {
  dealId: string;
  dealTitle: string;
  openTab?: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user?: User | null;
}) {
  const numericId = /^\d+$/.test(dealId) ? parseInt(dealId, 10) : null;
  const team = useDealTeam(numericId, user?.id ?? null);

  if (numericId === null) {
    return (
      <div className="wk-content" style={T.shell}>
        <TeamHeader dealTitle={dealTitle} memberCount={0} isOwner={false} onAskYulia={onTalkToYulia} />
        <div className="wkcard" style={T.emptyCard}>
          <h3 style={T.emptyTitle}>Team collaboration opens once this deal is saved</h3>
          <p style={T.emptyBody}>
            Sample and preview deals don&rsquo;t have a shared team yet. Create or open a real deal to
            invite your attorney, CPA, lender, broker, or counterparty and start a deal-team thread.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wk-content" style={T.shell}>
      <TeamHeader
        dealTitle={dealTitle}
        memberCount={(team.owner ? 1 : 0) + team.participants.length}
        isOwner={team.isOwner}
        onAskYulia={onTalkToYulia}
      />

      {team.teamError && <div className="wkerr" style={{ marginBottom: 18 }}>{team.teamError}</div>}

      <div style={T.grid}>
        <TeamColumn team={team} dealTitle={dealTitle} />
        <ChatColumn team={team} currentUserEmail={user?.email} />
      </div>
    </div>
  );
}

function TeamHeader({
  dealTitle,
  memberCount,
  isOwner,
  onAskYulia,
}: {
  dealTitle: string;
  memberCount: number;
  isOwner: boolean;
  onAskYulia?: (prompt: string) => void;
}) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div className="mono" style={T.eyebrow}>DEAL TEAM</div>
      <div className="pg-head" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={T.h1}>{dealTitle}</h1>
          <div style={T.sub}>
            {memberCount > 0
              ? `${memberCount} ${memberCount === 1 ? "person" : "people"} on this deal · ${isOwner ? "you own it" : "shared with you"}`
              : "Invite your advisors and counterparties to collaborate on this deal."}
          </div>
        </div>
        {onAskYulia && (
          <button
            type="button"
            className="wkbtn"
            onClick={() => onAskYulia(`On ${dealTitle}: who should be on the deal team for where we are, and what should I route to counsel vs. CPA vs. lender? Respect THE LINE — no recommendations on signing, custody, or negotiation.`)}
          >
            Ask Yulia who to add
          </button>
        )}
      </div>
    </section>
  );
}

/* ─── Team column: owner + participants + pending + owner-only invite ─── */

function TeamColumn({ team, dealTitle }: { team: ReturnType<typeof useDealTeam>; dealTitle: string }) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div style={T.col}>
      <div style={T.colHead}>
        <div>
          <div className="mono" style={T.colEyebrow}>PARTICIPANTS</div>
          <h2 style={T.colTitle}>Team</h2>
        </div>
        {team.isOwner && (
          <button
            type="button"
            className={`wkbtn ${showInvite ? "" : "primary"}`}
            onClick={() => setShowInvite(v => !v)}
          >
            {showInvite ? "Close" : "Invite"}
          </button>
        )}
      </div>

      {team.isOwner && showInvite && (
        <InviteForm
          team={team}
          dealTitle={dealTitle}
          onDone={() => setShowInvite(false)}
        />
      )}

      {team.loadingTeam && !team.owner && (
        <div className="mono" style={T.loadingNote}>LOADING TEAM…</div>
      )}

      <div style={T.memberList}>
        {team.owner && (
          <MemberRow
            name={team.owner.display_name}
            email={team.owner.email}
            role="owner"
            accessLevel="full"
            isOwnerRow
          />
        )}

        {team.participants.map(p => (
          <MemberRow
            key={p.id}
            name={p.display_name}
            email={p.email}
            role={p.role}
            accessLevel={p.access_level}
            pending={p.accepted_at == null}
            canManage={team.isOwner}
            busy={team.mutatingParticipantId === p.id}
            onRemove={() => team.removeParticipant(p.id)}
            onChangeRole={(role) => team.changeRole(p.id, role, p.access_level as DealTeamAccessLevel)}
            onChangeAccess={(access) => team.changeRole(p.id, p.role, access)}
          />
        ))}

        {team.owner && team.participants.length === 0 && (
          <div className="wkcard" style={T.emptyMembers}>
            <p style={T.emptyMembersText}>
              No advisors or counterparties yet.{" "}
              {team.isOwner ? "Use Invite to bring in your attorney, CPA, lender, broker, or the other side." : "The owner hasn't added anyone else."}
            </p>
          </div>
        )}
      </div>

      {team.pendingInvitations.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="mono" style={T.colEyebrow}>PENDING INVITATIONS</div>
          <div style={{ ...T.memberList, marginTop: 8 }}>
            {team.pendingInvitations.map(inv => (
              <div key={inv.id} style={{ ...T.memberRow, opacity: 0.72 }}>
                <span style={T.avatarPending}>
                  <V6Icon name="history" size={14} />
                </span>
                <span style={T.memberText}>
                  <strong style={T.memberName}>{inv.email}</strong>
                  <span style={T.memberMeta}>Invited · expires {timeAgo(inv.expires_at)}</span>
                </span>
                <RoleBadge role={inv.role} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InviteForm({
  team,
  dealTitle,
  onDone,
}: {
  team: ReturnType<typeof useDealTeam>;
  dealTitle: string;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("consultant");
  const [accessLevel, setAccessLevel] = useState<DealTeamAccessLevel>("comment");

  const submit = async () => {
    const ok = await team.invite({ email, role, accessLevel });
    if (ok) {
      setEmail("");
      onDone();
    }
  };

  return (
    <div className="wkcard" style={T.inviteCard}>
      <label style={T.fieldLabel} htmlFor="dt-invite-email">Email</label>
      <input
        id="dt-invite-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={`Invite to ${dealTitle}`}
        style={T.input}
        autoComplete="off"
      />

      <div style={T.fieldRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={T.fieldLabel} htmlFor="dt-invite-role">Role</label>
          <select id="dt-invite-role" value={role} onChange={e => setRole(e.target.value)} style={T.select}>
            {DEAL_TEAM_ROLES.map(r => (
              <option key={r} value={r}>{roleLabel(r)}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={T.fieldLabel} htmlFor="dt-invite-access">Access</label>
          <select
            id="dt-invite-access"
            value={accessLevel}
            onChange={e => setAccessLevel(e.target.value as DealTeamAccessLevel)}
            style={T.select}
          >
            {DEAL_TEAM_ACCESS_LEVELS.map(a => (
              <option key={a} value={a}>{ACCESS_LABELS[a]}</option>
            ))}
          </select>
        </div>
      </div>

      {team.inviteError && <div className="wkerr" style={{ marginTop: 10 }}>{team.inviteError}</div>}

      <div style={T.inviteActions}>
        <button
          type="button"
          className="wkbtn primary"
          onClick={() => { void submit(); }}
          disabled={team.inviting || !email.trim()}
        >
          {team.inviting ? "Sending…" : "Send invitation"}
        </button>
        <button type="button" className="wkbtn" onClick={onDone}>Cancel</button>
      </div>
      <p style={T.inviteHint}>
        We email a secure invite link. They get {ACCESS_LABELS[accessLevel].toLowerCase()} as {roleLabel(role).toLowerCase()} once they accept.
      </p>
    </div>
  );
}

function MemberRow({
  name,
  email,
  role,
  accessLevel,
  isOwnerRow = false,
  pending = false,
  canManage = false,
  busy = false,
  onRemove,
  onChangeRole,
  onChangeAccess,
}: {
  name: string | null;
  email: string;
  role: string;
  accessLevel: string;
  isOwnerRow?: boolean;
  pending?: boolean;
  canManage?: boolean;
  busy?: boolean;
  onRemove?: () => void;
  onChangeRole?: (role: string) => void;
  onChangeAccess?: (access: DealTeamAccessLevel) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ ...T.memberRow, opacity: pending ? 0.78 : 1 }}>
      <span style={isOwnerRow ? T.avatarOwner : T.avatar}>{initialsFor(name, email)}</span>
      <span style={T.memberText}>
        <strong style={T.memberName}>{name || email.split("@")[0]}</strong>
        <span style={T.memberMeta}>
          {email}
          {!isOwnerRow && ` · ${ACCESS_LABELS[(accessLevel as DealTeamAccessLevel)] || accessLevel}`}
          {pending && " · invite pending"}
        </span>
      </span>
      <RoleBadge role={role} />
      {canManage && !isOwnerRow && (
        <div style={T.memberActions}>
          <button
            type="button"
            className="wkbtn"
            style={T.iconBtn}
            title="Change role and access"
            aria-label="Change role and access"
            disabled={busy}
            onClick={() => setEditing(v => !v)}
          >
            <V6Icon name="settings" size={14} />
          </button>
          <button
            type="button"
            className="wkbtn"
            style={T.iconBtn}
            title="Remove from deal"
            aria-label="Remove from deal"
            disabled={busy}
            onClick={() => { if (window.confirm(`Remove ${name || email} from this deal?`)) onRemove?.(); }}
          >
            <V6Icon name="close" size={14} />
          </button>
        </div>
      )}

      {editing && canManage && !isOwnerRow && (
        <div style={T.editRow}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={T.fieldLabel}>Role</label>
            <select
              value={role}
              onChange={e => onChangeRole?.(e.target.value)}
              style={T.select}
              disabled={busy}
            >
              {DEAL_TEAM_ROLES.map(r => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={T.fieldLabel}>Access</label>
            <select
              value={accessLevel}
              onChange={e => onChangeAccess?.(e.target.value as DealTeamAccessLevel)}
              style={T.select}
              disabled={busy}
            >
              {DEAL_TEAM_ACCESS_LEVELS.map(a => (
                <option key={a} value={a}>{ACCESS_LABELS[a]}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chat column: threaded deal-team messages + compose ─── */

interface ThreadNode {
  message: DealTeamMessage;
  replies: DealTeamMessage[];
}

function buildThreads(messages: DealTeamMessage[]): ThreadNode[] {
  const byParent = new Map<number, DealTeamMessage[]>();
  const roots: DealTeamMessage[] = [];
  for (const m of messages) {
    if (m.parent_id == null) {
      roots.push(m);
    } else {
      const list = byParent.get(m.parent_id) ?? [];
      list.push(m);
      byParent.set(m.parent_id, list);
    }
  }
  // Orphan replies (parent not in window) surface as roots so nothing is lost.
  for (const [parentId, replies] of byParent.entries()) {
    if (!messages.some(m => m.id === parentId)) roots.push(...replies);
  }
  return roots.map(message => ({
    message,
    replies: (byParent.get(message.id) ?? []).filter(r => messages.some(m => m.id === r.parent_id)),
  }));
}

function ChatColumn({ team, currentUserEmail }: { team: ReturnType<typeof useDealTeam>; currentUserEmail?: string }) {
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<DealTeamMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const threads = useMemo(() => buildThreads(team.messages), [team.messages]);
  const isMe = (email: string) => !!currentUserEmail && email === currentUserEmail;

  // Keep the latest message in view as the poll brings new ones in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [team.messages.length]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    const ok = await team.sendMessage(draft, replyTo?.id ?? null);
    if (ok) {
      setDraft("");
      setReplyTo(null);
      textareaRef.current?.focus();
    }
  };

  return (
    <div style={T.col}>
      <div style={T.colHead}>
        <div>
          <div className="mono" style={T.colEyebrow}>DEAL DISCUSSION</div>
          <h2 style={T.colTitle}>Team chat</h2>
        </div>
        <span className="mono" style={T.msgCount}>{team.messages.length}</span>
      </div>

      <div className="wkcard" style={T.chatCard}>
        <div ref={scrollRef} className="thin-scroll" style={T.chatScroll}>
          {team.loadingMessages && team.messages.length === 0 && (
            <div className="mono" style={T.loadingNote}>LOADING DISCUSSION…</div>
          )}

          {!team.loadingMessages && team.messages.length === 0 && !team.messagesError && (
            <div style={T.chatEmpty}>
              <strong style={T.chatEmptyTitle}>No messages yet</strong>
              <span style={T.chatEmptyBody}>Start the conversation with your deal team. Everyone with comment or full access can reply.</span>
            </div>
          )}

          {threads.map(node => (
            <div key={node.message.id} style={T.threadBlock}>
              <MessageBubble
                message={node.message}
                mine={isMe(node.message.email)}
                canReply={team.canPost}
                onReply={() => setReplyTo(node.message)}
              />
              {node.replies.length > 0 && (
                <div style={T.replyStack}>
                  {node.replies.map(reply => (
                    <MessageBubble
                      key={reply.id}
                      message={reply}
                      mine={isMe(reply.email)}
                      reply
                      canReply={team.canPost}
                      onReply={() => setReplyTo(node.message)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {team.messagesError && <div className="wkerr" style={{ margin: "0 14px 10px" }}>{team.messagesError}</div>}

        <div style={T.composeWrap}>
          {replyTo && (
            <div style={T.replyChip}>
              <span style={T.replyChipText}>
                Replying to {replyTo.display_name || replyTo.email.split("@")[0]}: “{replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? "…" : ""}”
              </span>
              <button type="button" style={T.replyChipClose} onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                <V6Icon name="close" size={12} />
              </button>
            </div>
          )}
          {team.canPost ? (
            <div style={T.composeRow}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); }
                }}
                placeholder={replyTo ? "Write a reply…" : "Message your deal team…"}
                rows={1}
                style={T.textarea}
              />
              <button
                type="button"
                className="wkbtn primary"
                style={T.sendBtn}
                onClick={() => { void handleSend(); }}
                disabled={!draft.trim() || team.sending}
                aria-label="Send message"
              >
                {team.sending ? "…" : <V6Icon name="back" size={16} />}
              </button>
            </div>
          ) : (
            <div className="wknote" style={{ margin: 0 }}>
              Your access level is read-only, so you can follow the discussion but can&rsquo;t post. Ask the deal owner for comment access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  reply = false,
  canReply = false,
  onReply,
}: {
  message: DealTeamMessage;
  mine: boolean;
  reply?: boolean;
  canReply?: boolean;
  onReply?: () => void;
}) {
  return (
    <div style={{ ...T.bubbleWrap, alignItems: mine ? "flex-end" : "flex-start" }}>
      <div style={{ ...T.bubbleMeta, flexDirection: mine ? "row-reverse" : "row" }}>
        <strong style={T.bubbleName}>{mine ? "You" : message.display_name || message.email.split("@")[0]}</strong>
        <RoleBadge role={message.participant_role} />
        <span style={T.bubbleTime}>{timeAgo(message.created_at)}</span>
      </div>
      <div style={{ ...T.bubble, ...(mine ? T.bubbleMine : T.bubbleOther), ...(reply ? T.bubbleReply : null) }}>
        {message.content}
      </div>
      {canReply && !reply && (
        <button type="button" style={{ ...T.replyBtn, alignSelf: mine ? "flex-end" : "flex-start" }} onClick={onReply}>
          Reply
        </button>
      )}
    </div>
  );
}

/* ─── Styles — V6 desktop tokens (.wk-content scope) ─── */

const T: Record<string, CSSProperties> = {
  shell: { width: "min(100%, 1280px)", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" },
  eyebrow: { fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 6 },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
    letterSpacing: "-0.025em", margin: 0, color: "var(--ink)", textWrap: "balance",
  },
  sub: { fontSize: 14, color: "var(--ink-2)", marginTop: 6 },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 0.82fr) minmax(0, 1.18fr)",
    gap: 18,
    alignItems: "start",
  },
  col: { minWidth: 0, display: "flex", flexDirection: "column" },
  colHead: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 12, marginBottom: 12,
  },
  colEyebrow: { fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 800, color: "var(--accent-strong)" },
  colTitle: {
    margin: "4px 0 0", fontFamily: "var(--font-display)", fontWeight: 750,
    fontSize: 22, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1,
  },
  msgCount: { fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontWeight: 700 },
  loadingNote: { fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", padding: "10px 2px" },

  // member list
  memberList: { display: "grid", gap: 6 },
  memberRow: {
    display: "grid",
    gridTemplateColumns: "34px minmax(0, 1fr) auto auto",
    alignItems: "center",
    columnGap: 11,
    rowGap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "var(--surface)",
    border: "1px solid var(--line)",
  },
  avatar: {
    width: 34, height: 34, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--surface-2)", color: "var(--ink-2)",
    fontSize: 13, fontWeight: 800, border: "1px solid var(--line)",
  },
  avatarOwner: {
    width: 34, height: 34, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--accent)", color: "var(--on-accent)",
    fontSize: 13, fontWeight: 800,
  },
  avatarPending: {
    width: 34, height: 34, borderRadius: 999, flexShrink: 0,
    display: "grid", placeItems: "center",
    background: "var(--surface-2)", color: "var(--ink-3)", border: "1px solid var(--line)",
  },
  memberText: { minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  memberName: {
    fontSize: 13.5, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  memberMeta: {
    fontSize: 11.5, color: "var(--ink-3)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  roleBadge: { fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" },
  memberActions: { display: "flex", gap: 6 },
  iconBtn: { padding: "6px 8px", borderRadius: 9 },
  editRow: {
    gridColumn: "1 / -1",
    display: "flex", gap: 10, marginTop: 4,
    paddingTop: 10, borderTop: "1px solid var(--line)",
  },

  emptyMembers: { padding: "16px 18px" },
  emptyMembersText: { margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45 },

  // invite form
  inviteCard: { padding: 16, marginBottom: 12 },
  fieldLabel: {
    display: "block", fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 800,
    color: "var(--ink-3)", marginBottom: 5, textTransform: "uppercase",
  },
  fieldRow: { display: "flex", gap: 10, marginTop: 12 },
  input: {
    width: "100%", boxSizing: "border-box", padding: "9px 12px",
    borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface)",
    color: "var(--ink)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none",
  },
  select: {
    width: "100%", boxSizing: "border-box", padding: "9px 12px",
    borderRadius: 10, border: "1px solid var(--line-2)", background: "var(--surface)",
    color: "var(--ink)", fontSize: 13.5, fontFamily: "var(--font-body)", outline: "none",
    cursor: "pointer",
  },
  inviteActions: { display: "flex", gap: 8, marginTop: 14 },
  inviteHint: { margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 },

  // chat
  chatCard: { padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "min(68vh, 720px)" },
  chatScroll: { flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 },
  chatEmpty: {
    margin: "auto", maxWidth: 320, textAlign: "center",
    display: "flex", flexDirection: "column", gap: 6,
  },
  chatEmptyTitle: { fontSize: 14, color: "var(--ink)", fontWeight: 700 },
  chatEmptyBody: { fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45 },
  threadBlock: { display: "flex", flexDirection: "column", gap: 8 },
  replyStack: {
    display: "flex", flexDirection: "column", gap: 8,
    marginLeft: 22, paddingLeft: 14, borderLeft: "2px solid var(--line)",
  },
  bubbleWrap: { display: "flex", flexDirection: "column", gap: 4, maxWidth: "92%" },
  bubbleMeta: { display: "flex", alignItems: "center", gap: 7 },
  bubbleName: { fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)" },
  bubbleTime: { fontSize: 10.5, color: "var(--ink-3)" },
  bubble: {
    borderRadius: 14, padding: "10px 13px", fontSize: 13.5, lineHeight: 1.5,
    whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
  bubbleMine: { background: "var(--accent)", color: "var(--on-accent)", borderBottomRightRadius: 4 },
  bubbleOther: { background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--line)", borderBottomLeftRadius: 4 },
  bubbleReply: { fontSize: 13 },
  replyBtn: {
    all: "unset", cursor: "pointer", fontSize: 11, fontWeight: 700,
    color: "var(--ink-3)", padding: "2px 4px",
  },

  composeWrap: { borderTop: "1px solid var(--line)", padding: 12, background: "var(--surface)" },
  replyChip: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
    padding: "6px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--line)",
  },
  replyChipText: { flex: 1, minWidth: 0, fontSize: 11.5, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  replyChipClose: { all: "unset", cursor: "pointer", color: "var(--ink-3)", display: "grid", placeItems: "center", padding: 2 },
  composeRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  textarea: {
    flex: 1, resize: "none", maxHeight: 120, minHeight: 40,
    padding: "10px 13px", borderRadius: 12, border: "1px solid var(--line-2)",
    background: "var(--surface-2)", color: "var(--ink)", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none", lineHeight: 1.4,
  },
  sendBtn: { width: 40, height: 40, padding: 0, justifyContent: "center", borderRadius: 999, flexShrink: 0 },

  emptyCard: { padding: "26px 28px", maxWidth: 620 },
  emptyTitle: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 750, fontSize: 20, letterSpacing: "-0.02em", color: "var(--ink)" },
  emptyBody: { margin: "10px 0 0", fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 },
};
