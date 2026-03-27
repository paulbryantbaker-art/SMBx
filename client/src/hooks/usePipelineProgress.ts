import { useEffect, useRef, useState, useCallback } from 'react';

export interface PipelineProgress {
  pipelineStatus: string;
  stageProgress: { stage?: number; pct?: number; message?: string };
  totalCandidates: number;
  aTier: number;
  bTier: number;
}

/**
 * SSE hook for real-time pipeline progress updates.
 * Connects to GET /api/sourcing/portfolios/:id/progress
 * Auto-closes when pipeline reaches 'ready' or 'failed'.
 */
export function usePipelineProgress(portfolioId: number | null) {
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!portfolioId) {
      disconnect();
      return;
    }

    const token = localStorage.getItem('smbx_token');
    if (!token) return;

    // Don't reconnect if already connected to same portfolio
    if (esRef.current) disconnect();

    const es = new EventSource(
      `/api/sourcing/portfolios/${portfolioId}/progress?token=${token}`,
    );
    esRef.current = es;

    es.addEventListener('open', () => setConnected(true));

    es.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data) as PipelineProgress;
        setProgress(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('pipeline-complete', (e) => {
      try {
        const data = JSON.parse(e.data) as PipelineProgress;
        setProgress(data);
      } catch { /* ignore */ }
      disconnect();
    });

    es.addEventListener('error', () => {
      disconnect();
    });

    return () => disconnect();
  }, [portfolioId, disconnect]);

  return { progress, connected, disconnect };
}
