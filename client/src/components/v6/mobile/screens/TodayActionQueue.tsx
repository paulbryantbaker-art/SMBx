/* V6 Mobile — Today action queue (B1.10).
 *
 * Replaces the anonymous "Explorer" card slot for authed users with a personal
 * action queue: 3-8 dynamic items derived from the user's actual deals. Each
 * item names a concrete next action and either opens the deal or hands the
 * user off to Yulia for it.
 *
 * Per the user's spec: "10 things you need to look at right now about your
 * deals" — meaningful and dynamic depending on the portfolio. We cap at 8 to
 * stay scannable; anything beyond that becomes noise.
 *
 * Chat-first: items don't have inline buttons for "do the action." They
 * either open the deal (where Yulia is in scope) or pre-fill the chat
 * composer with the action prompt. The user reviews and Yulia executes.
 */

import { type CSSProperties } from "react";
import type { RawDeal } from "../../../../hooks/useMobileDeals";

interface ActionQueueProps {
  raw: RawDeal[];
  onOpenDeal: (id: string, title: string) => void;
  onAskYulia: (prompt: string) => void;
}

interface ActionItem {
  id: string;
  /** Priority bucket — drives ordering. */
  priority: 1 | 2 | 3 | 4;
  /** Short verb-phrase eyebrow ("FINISH SETUP", "ADVANCE", "CLOSE OUT"). */
  eyebrow: string;
  /** Human-readable line. */
  text: string;
  /** What happens on tap. */
  kind: "open" | "ask";
  /** For kind=open: deal id + title. For kind=ask: pre-filled chat prompt. */
  payload: { dealId?: string; dealTitle?: string; prompt?: string };
}

export function TodayActionQueue({ raw, onOpenDeal, onAskYulia }: ActionQueueProps) {
  const items = computeActionItems(raw).slice(0, 8);

  // Empty state when authed but no actionable items
  if (items.length === 0) {
    return (
      <div style={Q.empty}>
        <span className="mb-mono" style={Q.emptyEyebrow}>QUIET DAY</span>
        <h3 style={Q.emptyTitle}>Nothing urgent.</h3>
        <p style={Q.emptyBody}>
          Yulia surfaces stalled deals, gates ready to advance, expiring NDAs, and unanswered shares here. Nothing needs you right this minute.
        </p>
      </div>
    );
  }

  return (
    <div style={Q.wrap}>
      <div style={Q.head}>
        <span className="mb-mono" style={Q.headEyebrow}>YOUR FOCUS · {items.length}</span>
        <h2 style={Q.headTitle}>Today's queue</h2>
      </div>

      <div style={Q.list}>
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className="mb-tap"
            onClick={() => {
              if (item.kind === "open" && item.payload.dealId && item.payload.dealTitle) {
                onOpenDeal(item.payload.dealId, item.payload.dealTitle);
              } else if (item.kind === "ask" && item.payload.prompt) {
                onAskYulia(item.payload.prompt);
              }
            }}
            style={Q.row}
            aria-label={item.text}
          >
            <span aria-hidden="true" style={{ ...Q.dot, ...priorityDotStyle(item.priority) }} />
            <span style={Q.rowText}>
              <span className="mb-mono" style={Q.rowEyebrow}>{item.eyebrow}</span>
              <span style={Q.rowLine}>{item.text}</span>
            </span>
            <span aria-hidden="true" style={Q.chevron}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── derivation ───────────────────────────────────────────── */

function computeActionItems(raw: RawDeal[]): ActionItem[] {
  const items: ActionItem[] = [];

  for (const d of raw) {
    if (d.status !== "active") continue;
    const name = d.business_name || `Deal #${d.id}`;
    const dealId = `deal-${d.id}`;
    const gate = d.current_gate ?? "";

    // Priority 1 — closing gates (B5/S5/R5). Highest priority.
    if (/[BSR]5/.test(gate)) {
      items.push({
        id: `${d.id}-close`,
        priority: 1,
        eyebrow: "CLOSE OUT",
        text: `Wrap up ${name} — at ${gate}.`,
        kind: "open",
        payload: { dealId, dealTitle: name },
      });
      continue;
    }

    // Priority 2 — gate-0 setup incomplete (B0/S0/R0/PMI0). User just started
    // and the deal needs basic info before it can move.
    if (/^[BSR]0$|^PMI0$/.test(gate)) {
      const missing = !d.revenue && !d.sde && !d.ebitda;
      items.push({
        id: `${d.id}-setup`,
        priority: 2,
        eyebrow: missing ? "FINISH SETUP" : "CONTINUE",
        text: missing
          ? `${name} needs financials. Tell Yulia what you've got.`
          : `Keep going on ${name} — finalize ${gate} fields.`,
        kind: missing ? "ask" : "open",
        payload: missing
          ? { prompt: `Help me finish setting up ${name}. I want to share the financials and key details.` }
          : { dealId, dealTitle: name },
      });
      continue;
    }

    // Priority 3 — mid-journey deals (B2/B3/S2/S3/R2/R3) that haven't moved
    // recently. 14 days as a rough "stale" threshold.
    const updated = new Date(d.updated_at).getTime();
    const stale = (Date.now() - updated) > 14 * 24 * 60 * 60 * 1000;
    if (/[BSR][234]/.test(gate) && stale) {
      items.push({
        id: `${d.id}-stale`,
        priority: 3,
        eyebrow: "FOLLOW UP",
        text: `${name} hasn't moved in two weeks. Check in with Yulia.`,
        kind: "ask",
        payload: { prompt: `What's the status on ${name}? It's been a while since we worked it.` },
      });
      continue;
    }

    // Priority 4 — mid-journey deals that ARE moving. Keep the user in flow.
    if (/[BSR][1234]/.test(gate)) {
      items.push({
        id: `${d.id}-continue`,
        priority: 4,
        eyebrow: "CONTINUE",
        text: `${name} is at ${gate}. Open to keep working.`,
        kind: "open",
        payload: { dealId, dealTitle: name },
      });
    }
  }

  // Sort by priority, then by name for stable ordering
  items.sort((a, b) => a.priority - b.priority || a.text.localeCompare(b.text));
  return items;
}

function priorityDotStyle(p: 1 | 2 | 3 | 4): CSSProperties {
  switch (p) {
    case 1: return { background: "var(--mb-verdict-pursue)" };  // green — urgent in a good way
    case 2: return { background: "var(--mb-warn)" };            // amber — needs your input
    case 3: return { background: "var(--mb-danger)" };          // soft red — stalled
    case 4: return { background: "var(--mb-accent)" };          // periwinkle — in-flow
  }
}

const Q: Record<string, CSSProperties> = {
  wrap: {
    margin: "8px 16px 0",
    background: "var(--mb-card)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 16,
    overflow: "hidden",
  },
  head: {
    padding: "16px 20px 6px",
  },
  headEyebrow: {
    fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  headTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 20, fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--mb-ink)",
    margin: "4px 0 0",
  },
  list: {
    display: "flex", flexDirection: "column",
  },
  row: {
    all: "unset",
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 20px",
    borderTop: "1px solid var(--mb-line-2)",
    cursor: "pointer",
  },
  dot: {
    width: 8, height: 8, borderRadius: "50%",
    flexShrink: 0,
  },
  rowText: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 2,
  },
  rowEyebrow: {
    fontSize: 9, letterSpacing: "0.16em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  rowLine: {
    fontSize: 14, lineHeight: 1.35,
    color: "var(--mb-ink)",
  },
  chevron: {
    fontSize: 16, color: "var(--mb-ink-4)",
    flexShrink: 0,
  },
  empty: {
    margin: "8px 16px 0",
    background: "var(--mb-card)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 16,
    padding: "20px 22px",
  },
  emptyEyebrow: {
    fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  emptyTitle: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 20, fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--mb-ink)",
    margin: "4px 0 6px",
  },
  emptyBody: {
    fontSize: 13, lineHeight: 1.5,
    color: "var(--mb-ink-2)",
    margin: 0,
  },
};
