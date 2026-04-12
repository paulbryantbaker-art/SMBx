/**
 * NextActionsCards.tsx
 *
 * Renders 2-5 actionable cards on the logged-in chat home.
 * Fetches from /api/user/next-actions and shows what Yulia suggests
 * the user should do next — based on their active deals, pending
 * reviews, and gate progress.
 *
 * Each card has: icon, title, description, CTA button.
 * Tapping the CTA pre-fills the chat input with the right context.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const PINK = '#D44A78';
const PINK_DARK = '#E8709A';

interface NextAction {
  id: string;
  dealId: number | null;
  dealName: string;
  journeyType: string | null;
  currentGate: string | null;
  icon: string;
  title: string;
  description: string;
  cta: string;
  priority: number;
  prefill?: string;
}

interface Props {
  dark: boolean;
  onAction: (prefill: string) => void;
  authHeaders: () => Record<string, string>;
}

export function NextActionsCards({ dark, onAction, authHeaders }: Props) {
  const [actions, setActions] = useState<NextAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch('/api/user/next-actions', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Colors
  const headingC = dark ? '#f9f9fc' : '#0f1012';
  const bodyC    = dark ? 'rgba(218,218,220,0.85)' : '#3c3d40';
  const mutedC   = dark ? 'rgba(218,218,220,0.55)' : '#7c7d80';
  const ruleC    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.08)';
  const cardBg   = dark ? '#1f2123' : '#ffffff';
  const pinkC    = dark ? PINK_DARK : PINK;

  if (loading) {
    return (
      <div className="w-full px-5 space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl p-4 h-20"
            style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)' }}
          />
        ))}
      </div>
    );
  }

  if (actions.length === 0) return null;

  return (
    <div className="w-full px-5 space-y-2">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2 px-1"
        style={{ color: pinkC }}
      >
        What's next
      </p>
      {actions.map((action, i) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
          onClick={() => onAction(action.prefill || action.title)}
          className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-[0.985]"
          style={{
            background: cardBg,
            border: `1px solid ${ruleC}`,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.08)',
              border: `1px solid ${dark ? 'rgba(232,112,154,0.20)' : 'rgba(212,74,120,0.16)'}`,
            }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ color: pinkC }}>
              {action.icon}
            </span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[14px] font-bold leading-tight truncate mb-0.5"
              style={{ color: headingC }}
            >
              {action.title}
            </p>
            <p
              className="text-[12px] leading-snug truncate"
              style={{ color: mutedC }}
            >
              {action.description}
            </p>
          </div>

          {/* CTA arrow */}
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: pinkC,
              color: 'white',
            }}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
