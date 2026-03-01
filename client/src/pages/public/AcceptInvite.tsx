import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth, authHeaders } from '../../hooks/useAuth';

interface InviteInfo {
  dealName: string;
  inviterName: string;
  role: string;
  accessLevel: string;
  expiresAt: string;
  accepted: boolean;
  expired: boolean;
}

export default function AcceptInvite({ token }: { token: string }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations/${token}/info`)
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(setInfo)
      .catch(e => setError(e.error || 'Invitation not found'));
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      sessionStorage.setItem('smbx_pending_invite', token);
      navigate('/login');
      return;
    }
    setAccepting(true);
    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to accept invitation');
      }
      navigate('/chat');
    } catch (e: any) {
      setError(e.message);
      setAccepting(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Invalid Invitation</h1>
          <p className="text-[#7A766E]">{error}</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <p className="text-[#7A766E]">Loading invitation...</p>
      </div>
    );
  }

  if (info.accepted) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Already Accepted</h1>
          <p className="text-[#7A766E]">This invitation has already been accepted.</p>
          <button onClick={() => navigate('/chat')} className="mt-6 px-6 py-2 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (info.expired) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Invitation Expired</h1>
          <p className="text-[#7A766E]">This invitation has expired. Please ask the deal owner to send a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
      <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#C06B3E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#C06B3E] text-xl">+</span>
          </div>
          <h1 className="text-xl font-semibold text-[#23201A]">Deal Invitation</h1>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Deal</span>
            <span className="text-[#23201A] font-medium">{info.dealName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Invited by</span>
            <span className="text-[#23201A]">{info.inviterName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Your role</span>
            <span className="text-[#23201A] capitalize">{info.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Access level</span>
            <span className="text-[#23201A] capitalize">{info.accessLevel}</span>
          </div>
        </div>

        {user ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full py-3 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors disabled:opacity-50"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
        ) : (
          <div className="text-center">
            <p className="text-[#7A766E] text-sm mb-4">Log in to accept this invitation</p>
            <button
              onClick={() => {
                sessionStorage.setItem('smbx_pending_invite', token);
                navigate('/login');
              }}
              className="w-full py-3 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors"
            >
              Log In to Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
