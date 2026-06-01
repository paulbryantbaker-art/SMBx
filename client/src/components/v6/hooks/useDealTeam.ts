/**
 * useDealTeam — V6 data hook for the Deal Team collaboration surface.
 *
 * Wires the live, mounted collaboration backend (server/routes/collaboration.ts,
 * all behind requireAuth) into the V6 desktop shell:
 *   GET    /api/deals/:dealId/participants   → { owner, participants, pendingInvitations }
 *   POST   /api/deals/:dealId/invite         ← { email, role, accessLevel, folderScope? }
 *   DELETE /api/deals/:dealId/participants/:participantId
 *   PATCH  /api/deals/:dealId/participants/:participantId ← { role?, accessLevel? }
 *   GET    /api/deals/:dealId/messages        → Message[] (threaded via parent_id)
 *   POST   /api/deals/:dealId/messages        ← { content, parentId? }
 *
 * Roles + access levels mirror server/services/dealAccessService.ts.
 * Read-level access cannot post (server returns 403); we surface that as canPost.
 * Messages poll every 10s (realtime is a separate, later task).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authHeaders } from "../../../hooks/useAuth";

/** Mirrors VALID_ROLES in server/services/dealAccessService.ts (owner excluded — owner is implicit). */
export const DEAL_TEAM_ROLES = [
  "attorney",
  "cpa",
  "broker",
  "lender",
  "consultant",
  "counterparty",
  "auditor",
] as const;
export type DealTeamRole = (typeof DEAL_TEAM_ROLES)[number] | "owner";

/** Mirrors VALID_ACCESS_LEVELS in server/services/dealAccessService.ts. */
export const DEAL_TEAM_ACCESS_LEVELS = ["full", "comment", "read"] as const;
export type DealTeamAccessLevel = (typeof DEAL_TEAM_ACCESS_LEVELS)[number];

export interface DealTeamOwner {
  id: number;
  email: string;
  display_name: string | null;
  role: "owner";
}

export interface DealTeamParticipant {
  id: number;
  user_id: number;
  email: string;
  display_name: string | null;
  role: string;
  access_level: string;
  folder_scope: number[] | null;
  accepted_at: string | null;
  created_at: string;
}

export interface DealTeamPendingInvite {
  id: number;
  email: string;
  role: string;
  access_level: string;
  expires_at: string;
  created_at: string;
}

export interface DealTeamMessage {
  id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  email: string;
  display_name: string | null;
  participant_role: string | null;
}

interface InviteInput {
  email: string;
  role: string;
  accessLevel: DealTeamAccessLevel;
  folderScope?: number[] | null;
}

export interface UseDealTeam {
  // team
  owner: DealTeamOwner | null;
  participants: DealTeamParticipant[];
  pendingInvitations: DealTeamPendingInvite[];
  isOwner: boolean;
  loadingTeam: boolean;
  teamError: string | null;
  refreshTeam: () => Promise<void>;
  invite: (input: InviteInput) => Promise<boolean>;
  inviting: boolean;
  inviteError: string | null;
  removeParticipant: (participantId: number) => Promise<void>;
  changeRole: (participantId: number, role: string, accessLevel?: DealTeamAccessLevel) => Promise<void>;
  mutatingParticipantId: number | null;
  // chat
  messages: DealTeamMessage[];
  loadingMessages: boolean;
  messagesError: string | null;
  canPost: boolean;
  sendMessage: (content: string, parentId?: number | null, mentions?: number[]) => Promise<boolean>;
  sending: boolean;
  refreshMessages: () => Promise<void>;
}

/**
 * @param dealId   numeric deal id, or null for a sample/non-persisted deal tab
 * @param userId   the signed-in user's id (used to decide owner-only controls)
 */
export function useDealTeam(dealId: number | null, userId?: number | null): UseDealTeam {
  const [owner, setOwner] = useState<DealTeamOwner | null>(null);
  const [participants, setParticipants] = useState<DealTeamParticipant[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<DealTeamPendingInvite[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [mutatingParticipantId, setMutatingParticipantId] = useState<number | null>(null);

  const [messages, setMessages] = useState<DealTeamMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const refreshTeam = useCallback(async () => {
    if (dealId === null) return;
    setLoadingTeam(true);
    setTeamError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/participants`, { headers: authHeaders() });
      if (!res.ok) {
        setTeamError(res.status === 404 ? "You don't have access to this deal team." : `Couldn't load the team (${res.status}).`);
        return;
      }
      const data = await res.json();
      setOwner(data.owner ?? null);
      setParticipants(Array.isArray(data.participants) ? data.participants : []);
      setPendingInvitations(Array.isArray(data.pendingInvitations) ? data.pendingInvitations : []);
    } catch {
      setTeamError("Network error loading the deal team.");
    } finally {
      setLoadingTeam(false);
    }
  }, [dealId]);

  const refreshMessages = useCallback(async () => {
    if (dealId === null) return;
    try {
      const res = await fetch(`/api/deals/${dealId}/messages`, { headers: authHeaders() });
      if (!res.ok) {
        setMessagesError(res.status === 404 ? "You don't have access to this deal discussion." : `Couldn't load messages (${res.status}).`);
        return;
      }
      setMessagesError(null);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessagesError("Network error loading messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, [dealId]);

  // Initial team load.
  useEffect(() => {
    if (dealId === null) {
      setOwner(null);
      setParticipants([]);
      setPendingInvitations([]);
      return;
    }
    void refreshTeam();
  }, [dealId, refreshTeam]);

  // Messages: initial fetch + 10s poll (realtime is a later task).
  useEffect(() => {
    if (dealId === null) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    void refreshMessages();
    pollRef.current = setInterval(() => { void refreshMessages(); }, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [dealId, refreshMessages]);

  const isOwner = useMemo(() => {
    if (owner == null || userId == null) return false;
    return owner.id === userId;
  }, [owner, userId]);

  // Read-only participants can't post; the server enforces this too (403).
  const canPost = useMemo(() => {
    if (dealId === null) return false;
    if (isOwner) return true;
    if (userId == null) return false;
    const me = participants.find(p => p.user_id === userId);
    // If we can't resolve our own participant row but we have access, allow optimistic
    // posting and let the server be the source of truth; only block known read-only seats.
    if (!me) return true;
    return me.access_level !== "read";
  }, [dealId, isOwner, userId, participants]);

  const invite = useCallback(async (input: InviteInput): Promise<boolean> => {
    if (dealId === null || !input.email.trim()) return false;
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          email: input.email.trim(),
          role: input.role,
          accessLevel: input.accessLevel,
          ...(input.folderScope ? { folderScope: input.folderScope } : null),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteError(data?.error || "Couldn't send the invitation.");
        return false;
      }
      await refreshTeam();
      return true;
    } catch {
      setInviteError("Network error sending the invitation.");
      return false;
    } finally {
      setInviting(false);
    }
  }, [dealId, refreshTeam]);

  const removeParticipant = useCallback(async (participantId: number) => {
    if (dealId === null) return;
    setMutatingParticipantId(participantId);
    try {
      const res = await fetch(`/api/deals/${dealId}/participants/${participantId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) await refreshTeam();
    } catch { /* surfaced via refresh failure */ }
    finally { setMutatingParticipantId(null); }
  }, [dealId, refreshTeam]);

  const changeRole = useCallback(async (participantId: number, role: string, accessLevel?: DealTeamAccessLevel) => {
    if (dealId === null) return;
    setMutatingParticipantId(participantId);
    try {
      const res = await fetch(`/api/deals/${dealId}/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...(role ? { role } : null), ...(accessLevel ? { accessLevel } : null) }),
      });
      if (res.ok) await refreshTeam();
    } catch { /* surfaced via refresh failure */ }
    finally { setMutatingParticipantId(null); }
  }, [dealId, refreshTeam]);

  const sendMessage = useCallback(async (content: string, parentId?: number | null, mentions?: number[]): Promise<boolean> => {
    if (dealId === null || !content.trim() || sending) return false;
    setSending(true);
    try {
      // Dedupe mention ids; the server re-validates them against real participants.
      const mentionIds = Array.isArray(mentions) ? Array.from(new Set(mentions)) : [];
      const res = await fetch(`/api/deals/${dealId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          content: content.trim(),
          ...(parentId ? { parentId } : null),
          ...(mentionIds.length ? { mentions: mentionIds } : null),
        }),
      });
      if (!res.ok) {
        setMessagesError(res.status === 403 ? "Your access level is read-only, so you can't post here." : "Couldn't send your message.");
        return false;
      }
      await refreshMessages();
      return true;
    } catch {
      setMessagesError("Network error sending your message.");
      return false;
    } finally {
      setSending(false);
    }
  }, [dealId, sending, refreshMessages]);

  return {
    owner,
    participants,
    pendingInvitations,
    isOwner,
    loadingTeam,
    teamError,
    refreshTeam,
    invite,
    inviting,
    inviteError,
    removeParticipant,
    changeRole,
    mutatingParticipantId,
    messages,
    loadingMessages,
    messagesError,
    canPost,
    sendMessage,
    sending,
    refreshMessages,
  };
}
