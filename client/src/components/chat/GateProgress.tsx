import { useState, useEffect } from 'react';
import { authHeaders } from '../../hooks/useAuth';

interface GateInfo {
  gate: string;
  status: 'locked' | 'active' | 'completed';
  completed_at: string | null;
}

interface GateProgressProps {
  dealId: number | null;
  currentGate?: string;
}

const GATE_LABELS: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Diligence', B4: 'Structure', B5: 'Closing',
  R0: 'Intake', R1: 'Financials', R2: 'Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilize', PMI2: 'Assess', PMI3: 'Optimize',
};

export default function GateProgress({ dealId, currentGate }: GateProgressProps) {
  const [gates, setGates] = useState<GateInfo[]>([]);

  useEffect(() => {
    if (!dealId) return;
    (async () => {
      try {
        const res = await fetch(`/api/chat/deals/${dealId}/gates`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setGates(data.gates || []);
        }
      } catch {
        // ignore
      }
    })();
  }, [dealId, currentGate]);

  if (!dealId || gates.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {gates.map((g, i) => {
        const isCompleted = g.status === 'completed';
        const isActive = g.status === 'active';
        const label = GATE_LABELS[g.gate] || g.gate;

        return (
          <div key={g.gate} className="flex items-center gap-1 shrink-0">
            {i > 0 && (
              <div className={`w-4 h-px ${isCompleted || isActive ? 'bg-[#D4714E]' : 'bg-[#DDD9D1]'}`} />
            )}
            <div className="flex items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isCompleted
                    ? 'bg-[#D4714E] text-white'
                    : isActive
                    ? 'bg-white text-[#D4714E] border-2 border-[#D4714E]'
                    : 'bg-[#F3F0EA] text-[#A9A49C]'
                }`}
                style={isActive ? { animation: 'gatePulse 2s ease-in-out infinite' } : undefined}
              >
                {isCompleted ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${
                isActive ? 'text-[#D4714E]' : isCompleted ? 'text-[#3D3B37]' : 'text-[#A9A49C]'
              }`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
