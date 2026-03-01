import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth, authHeaders } from '../../hooks/useAuth';

interface DayPassInfo {
  dealName: string;
  role: string;
  accessLevel: string;
  activated: boolean;
  expiresAt: string;
  revoked: boolean;
  expired: boolean;
}

export default function DayPassView({ token }: { token: string }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [info, setInfo] = useState<DayPassInfo | null>(null);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetch(`/api/day-pass/${token}/info`)
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(setInfo)
      .catch(e => setError(e.error || 'Day pass not found'));
  }, [token]);

  const handleActivate = async () => {
    if (!user) {
      sessionStorage.setItem('smbx_pending_daypass', token);
      navigate('/login');
      return;
    }
    setActivating(true);
    try {
      const res = await fetch(`/api/deals/day-pass/${token}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to activate day pass');
      }
      navigate('/chat');
    } catch (e: any) {
      setError(e.message);
      setActivating(false);
    }
  };

  const formatCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Invalid Day Pass</h1>
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
        <p className="text-[#7A766E]">Loading day pass...</p>
      </div>
    );
  }

  if (info.revoked) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Day Pass Revoked</h1>
          <p className="text-[#7A766E]">This day pass has been revoked by the deal owner.</p>
        </div>
      </div>
    );
  }

  if (info.expired) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Day Pass Expired</h1>
          <p className="text-[#7A766E]">This 48-hour day pass has expired. Please ask the deal owner for a new one.</p>
        </div>
      </div>
    );
  }

  // Already activated — show countdown and continue button
  if (info.activated) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-xl">&#10003;</span>
          </div>
          <h1 className="text-xl font-semibold text-[#23201A] mb-2">Day Pass Active</h1>
          <p className="text-[#7A766E] mb-1">{info.dealName}</p>
          <p className="text-[#C06B3E] font-medium mb-6">{formatCountdown(info.expiresAt)}</p>
          <button
            onClick={() => navigate('/chat')}
            className="w-full py-3 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors"
          >
            Continue to Deal
          </button>
        </div>
      </div>
    );
  }

  // Not yet activated
  return (
    <div className="flex items-center justify-center min-h-dvh bg-[#FAF9F7]">
      <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#C06B3E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#C06B3E] text-lg">48h</span>
          </div>
          <h1 className="text-xl font-semibold text-[#23201A]">48-Hour Day Pass</h1>
          <p className="text-[#7A766E] text-sm mt-1">Time-limited access to a deal data room</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Deal</span>
            <span className="text-[#23201A] font-medium">{info.dealName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Role</span>
            <span className="text-[#23201A] capitalize">{info.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Access</span>
            <span className="text-[#23201A] capitalize">{info.accessLevel}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#E8E4DC]">
            <span className="text-[#7A766E]">Duration</span>
            <span className="text-[#23201A]">48 hours from activation</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
          Once activated, the 48-hour countdown begins immediately.
        </div>

        {user ? (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full py-3 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors disabled:opacity-50"
          >
            {activating ? 'Activating...' : 'Activate 48-Hour Access'}
          </button>
        ) : (
          <div className="text-center">
            <p className="text-[#7A766E] text-sm mb-4">Log in to activate this day pass</p>
            <button
              onClick={() => {
                sessionStorage.setItem('smbx_pending_daypass', token);
                navigate('/login');
              }}
              className="w-full py-3 bg-[#C06B3E] text-white rounded-lg hover:bg-[#A5582F] transition-colors"
            >
              Log In to Activate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
