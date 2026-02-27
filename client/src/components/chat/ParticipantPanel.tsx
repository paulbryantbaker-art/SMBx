import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface Participant {
  id: number;
  user_id: number;
  email: string;
  display_name: string | null;
  role: string;
  access_level: string;
  accepted_at: string;
}

interface PendingInvitation {
  id: number;
  email: string;
  role: string;
  access_level: string;
  expires_at: string;
}

interface ParticipantPanelProps {
  dealId: number | null;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'Owner', color: 'text-[#D4714E] bg-[#FFF8F5]' },
  attorney: { label: 'Attorney', color: 'text-purple-700 bg-purple-50' },
  cpa: { label: 'CPA', color: 'text-blue-700 bg-blue-50' },
  broker: { label: 'Broker', color: 'text-green-700 bg-green-50' },
  lender: { label: 'Lender', color: 'text-yellow-700 bg-yellow-50' },
  consultant: { label: 'Consultant', color: 'text-gray-600 bg-gray-100' },
  counterparty: { label: 'Counterparty', color: 'text-red-600 bg-red-50' },
};

const ROLES = ['attorney', 'cpa', 'broker', 'lender', 'consultant', 'counterparty'];

export default function ParticipantPanel({ dealId }: ParticipantPanelProps) {
  const [owner, setOwner] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('consultant');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/participants`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOwner(data.owner);
        setParticipants(data.participants || []);
        setPendingInvitations(data.pendingInvitations || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [dealId]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  const handleInvite = async () => {
    if (!dealId || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, accessLevel: 'comment' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setInviteError(data.error || 'Failed to send invitation');
        return;
      }
      setInviteEmail('');
      setShowInvite(false);
      await fetchParticipants();
    } catch {
      setInviteError('Network error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (participantId: number) => {
    if (!dealId) return;
    try {
      await fetch(`/api/deals/${dealId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      await fetchParticipants();
    } catch { /* ignore */ }
  };

  if (!dealId) return null;

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A9A49C] m-0">Team</p>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="text-[11px] font-semibold text-[#D4714E] bg-transparent border-0 cursor-pointer hover:underline"
        >
          + Invite
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="px-3 pb-3">
          <div className="p-3 rounded-xl bg-[#FAF8F4] space-y-2">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-white outline-none focus:border-[#D4714E]"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-sm border border-border bg-white outline-none"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]?.label || r}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4714E] text-white border-0 cursor-pointer hover:bg-[#BE6342] disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                onClick={() => { setShowInvite(false); setInviteError(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F3F0EA] text-[#3D3B37] border-0 cursor-pointer hover:bg-[#EBE7DF]"
              >
                Cancel
              </button>
            </div>
            {inviteError && <p className="text-xs text-red-600 m-0">{inviteError}</p>}
          </div>
        </div>
      )}

      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-2 px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-[#D4714E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {(owner.display_name || owner.email)?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#1A1A18] m-0 truncate">{owner.display_name || owner.email}</p>
          </div>
          <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${ROLE_LABELS.owner.color}`}>
            Owner
          </span>
        </div>
      )}

      {/* Participants */}
      {participants.map(p => {
        const roleInfo = ROLE_LABELS[p.role] || ROLE_LABELS.consultant;
        return (
          <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 group">
            <div className="w-6 h-6 rounded-full bg-[#EBE7DF] text-[#6E6A63] flex items-center justify-center text-[10px] font-bold shrink-0">
              {(p.display_name || p.email)?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#1A1A18] m-0 truncate">{p.display_name || p.email}</p>
            </div>
            <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
            <button
              onClick={() => handleRemove(p.id)}
              className="hidden group-hover:flex w-5 h-5 items-center justify-center rounded-full hover:bg-red-50 cursor-pointer border-0 bg-transparent text-red-400 hover:text-red-600 transition-colors shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        );
      })}

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A9A49C] px-3 mt-3 mb-1">Pending</p>
          {pendingInvitations.map(inv => (
            <div key={inv.id} className="flex items-center gap-2 px-3 py-1.5 opacity-60">
              <div className="w-6 h-6 rounded-full bg-[#F3F0EA] text-[#A9A49C] flex items-center justify-center text-[10px] shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#6E6A63] m-0 truncate">{inv.email}</p>
              </div>
              <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${(ROLE_LABELS[inv.role] || ROLE_LABELS.consultant).color}`}>
                {(ROLE_LABELS[inv.role] || ROLE_LABELS.consultant).label}
              </span>
            </div>
          ))}
        </>
      )}

      {loading && participants.length === 0 && !owner && (
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-[#A9A49C] m-0">Loading team...</p>
        </div>
      )}
    </div>
  );
}
