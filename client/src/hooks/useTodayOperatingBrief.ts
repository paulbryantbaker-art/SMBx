import { useEffect, useState } from "react";
import { authHeaders, type User } from "./useAuth";

export type TodayTone = "gold" | "cactus" | "oat" | "plum" | "charcoal";

export interface TodayOperatingBrief {
  source: "live";
  generatedAt: string;
  morningBrief: {
    title: string;
    lede: string;
    focusDealId?: string;
    focusDealTitle?: string;
    chips: string[];
    prompt: string;
    freshness: string;
  };
  gateCountdown: TodayGateCountdownItem[];
  dealPulse: TodayDealPulseItem[];
  filesNeedingReview: TodayFileReviewItem[];
  studioRefreshNeeds: TodayStudioRefreshItem[];
  firmMemory: TodayFirmMemorySnapshot;
}

export interface TodayGateCountdownItem {
  dealId: string;
  title: string;
  gateId: string;
  gateName: string;
  blockers: string[];
  requiredModels: string[];
  requiredCitations: string[];
  nextAction: string;
  tone: TodayTone;
  definitive?: TodayDefinitiveDealState;
}

export interface TodayDealPulseItem {
  dealId: string;
  title: string;
  status: string;
  fit: number;
  thesis: string;
  metric: string;
  urgency: string;
  tone: TodayTone;
  nextAction: string;
  definitive?: TodayDefinitiveDealState;
}

export interface TodayDefinitiveDealState {
  stateCid: string;
  readinessLevel: string;
  score: number;
  nextGate: string;
  lifecyclePosition: string;
  missingCount: number;
  blockerCount: number;
  sourceCount: number;
  packetTypes: string[];
  portableArtifacts: string[];
  latestPacketType?: string;
  latestPacketId?: string;
  latestPacketAt?: string;
  nextSuggestedTool?: string;
  nextSuggestedCalls: TodayDefinitiveNextCall[];
  updatedAt: string;
}

export interface TodayDefinitiveNextCall {
  toolName: string;
  label: string;
  priority: "P0" | "P1" | "P2";
  reason: string;
}

export interface TodayFileReviewItem {
  id: string;
  title: string;
  dealId?: string;
  dealTitle?: string;
  reason: string;
  status: string;
  tone: TodayTone;
  updatedAt?: string;
  definitivePacketRowId?: number;
  definitivePacketId?: string;
  definitivePacketType?: string;
  definitivePacketCid?: string;
  definitiveStateCid?: string;
  definitiveToolName?: string;
}

export interface TodayStudioRefreshItem {
  bookId: string;
  title: string;
  format: string;
  reason: string;
  gaps: number;
  action: string;
  tone: TodayTone;
}

export interface TodayFirmMemorySnapshot {
  assumptions: FirmMemoryItem[];
  houseStyle: FirmMemoryItem[];
  providers: FirmMemoryItem[];
  dealPatterns: FirmMemoryItem[];
  workflows: FirmMemoryItem[];
  stats: {
    total: number;
    updatedAt?: string;
  };
}

export interface FirmMemoryItem {
  id: string;
  label: string;
  text: string;
  confidence: number;
  source: string;
}

export function useTodayOperatingBrief(user: User | null, canFetch: boolean) {
  const [brief, setBrief] = useState<TodayOperatingBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !canFetch) {
      setBrief(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/agency/today-operating-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`today ${res.status}`)))
      .then((next: TodayOperatingBrief) => {
        if (!cancelled) setBrief(next);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setBrief(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [canFetch, user?.id]);

  return { brief, loading, error };
}
