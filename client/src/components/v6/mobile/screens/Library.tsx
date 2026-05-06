/* V6 Mobile — Library screen.
   Three-tier document architecture (per architecture_mobile_tabs_v6_revised.md
   in memory):
     1. Editing      → in-progress drafts (TipTap-edited deliverables)
     2. Data Room    → secured financials and other shareable docs
     3. Security     → locked + signed (terminal lifecycle state)
   Backend lifecycle exists per documentLifecycle.ts (CLAUDE.md). This batch
   ships the screen shell with section dividers and per-tier empty states;
   real-data wiring per tier (TipTap drafts + uploaded data-room docs +
   approved/locked artifacts) lands as separate batches once the endpoints
   are exposed.

   Chat-first: tapping into a tier opens that document in the canvas where
   Yulia can edit / approve / lock it. No buttons for "create" or "lock" —
   those go through Yulia. */

import { type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";

interface LibraryProps {
  isAnon: boolean;
  initials: string;
  onAvatarClick: () => void;
  onSearch: () => void;
  /** Reserved for future: real document data per tier from authed user.
   *  Wiring lands when /api/library/by-tier endpoints exist. */
}

export function LibraryScreen({ initials, onAvatarClick, onSearch }: LibraryProps) {
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Library" initials={initials} onAvatarClick={onAvatarClick} onSearch={onSearch} />
      <LargeTitle>Library</LargeTitle>

      <div style={L.intro}>
        Your documents at every stage — from drafts you're shaping with Yulia, through the secured data room, to signed and locked finals.
      </div>

      <Tier
        eyebrow="EDITING"
        title="In progress"
        description="Drafts you're shaping right now — Yulia keeps the context as you edit."
        emptyText="Yulia hasn't drafted anything yet. Open a deal in chat and ask her to draft an LOI, IOI, memo, or QoE summary."
      />

      <Tier
        eyebrow="DATA ROOM"
        title="Secured"
        description="Financials, contracts, and operating docs you've collected. NDA-gated when shared outside your team."
        emptyText="The data room fills as you upload financials and Yulia organizes them by deal."
        accent="warn"
      />

      <Tier
        eyebrow="SECURITY"
        title="Approved & locked"
        description="Signed letters and executed agreements. Read-only — Yulia preserves the legal lifecycle."
        emptyText="Locked documents land here once an LOI or definitive agreement is countersigned."
        accent="pursue"
      />
    </div>
  );
}

interface TierProps {
  eyebrow: string;
  title: string;
  description: string;
  emptyText: string;
  /** Optional accent color for the section dot — defaults to brand periwinkle. */
  accent?: "pursue" | "warn" | "danger";
}

function Tier({ eyebrow, title, description, emptyText, accent }: TierProps) {
  const dotColor = accent === "pursue" ? "var(--mb-verdict-pursue)"
                 : accent === "warn"   ? "var(--mb-warn)"
                 : accent === "danger" ? "var(--mb-danger)"
                 : "var(--mb-accent)";
  return (
    <section style={L.section}>
      <div style={L.sectionHead}>
        <span aria-hidden="true" style={{ ...L.dot, background: dotColor }} />
        <span className="mb-mono" style={L.eyebrow}>{eyebrow}</span>
      </div>
      <h2 style={L.title}>{title}</h2>
      <p style={L.desc}>{description}</p>
      <div style={L.emptyCard}>
        <span className="mb-mono" style={L.emptyEyebrow}>EMPTY</span>
        <p style={L.emptyBody}>{emptyText}</p>
      </div>
    </section>
  );
}

const L: Record<string, CSSProperties> = {
  intro: {
    padding: "0 22px 18px",
    fontSize: 14, lineHeight: 1.5,
    color: "var(--mb-ink-2)",
    maxWidth: "60ch",
  },
  section: {
    padding: "16px 22px 6px",
  },
  sectionHead: {
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: "50%",
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 10, letterSpacing: "0.16em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  title: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 22, fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--mb-ink)",
    margin: "0 0 4px",
  },
  desc: {
    fontSize: 13, lineHeight: 1.5,
    color: "var(--mb-ink-2)",
    margin: "0 0 12px",
  },
  emptyCard: {
    background: "var(--mb-card)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 14,
    padding: "16px 18px",
  },
  emptyEyebrow: {
    fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
    color: "var(--mb-ink-4)",
  },
  emptyBody: {
    fontSize: 13, lineHeight: 1.5,
    color: "var(--mb-ink-3)",
    margin: "6px 0 0",
  },
};
