/* V6 Mobile — Search screen (replaces Brief, per architecture_search_tab_spec.md
   in memory).

   Two surfaces in one tab:
   1. Discovery hub (top): 6 starter cards titled "Let's find what you're
      looking for." Tap a card → pre-fills the search input with a starter
      prompt the user can refine. Same pattern as Recommended Next, applied
      to help/lookup instead of deal actions.
   2. Search input (bottom): typing surface. For B1.9 this routes through
      onTalkToYulia (the same chat). The full "separate Yulia side-chat"
      that keeps lookup/team-comms off the deal-execution thread is a
      Phase 4 follow-up — needs server support for context-typed chats.

   Chat-first: there are no other buttons. Yulia is the conduit for finding
   service providers, explaining financing structures, helping with team
   comms — same as for deal execution. The discovery hub is just an
   acceleration layer so the user doesn't have to type the prompt themselves. */

import { useState, type CSSProperties } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { MobileIcon } from "../icons";

interface SearchProps {
  isAnon: boolean;
  initials: string;
  onAvatarClick: () => void;
  /** Hands the user's prompt off to Yulia (currently the main chat;
   *  side-chat separation lands in Phase 4). */
  onAskYulia: (prompt: string) => void;
}

interface DiscoveryCard {
  eyebrow: string;
  label: string;
  prompt: string;
}

const DISCOVERY: DiscoveryCard[] = [
  {
    eyebrow: "OPPORTUNITIES",
    label: "Find business opportunities",
    prompt: "Help me find acquisition targets that match my thesis. Walk me through the sourcing options.",
  },
  {
    eyebrow: "BUYERS",
    label: "Find buyers and buying communities",
    prompt: "Help me build a buyer list for my business. Who would be the right strategic and financial buyers?",
  },
  {
    eyebrow: "PROVIDERS",
    label: "Find service providers",
    prompt: "I need to find a service provider — attorney, broker, real estate, or advisor. Walk me through what to look for.",
  },
  {
    eyebrow: "FINANCING",
    label: "Find financing",
    prompt: "Walk me through my financing options — SBA, conventional, mezzanine, seller note. Match them to my deal.",
  },
  {
    eyebrow: "STRUCTURES",
    label: "Understand deal structures",
    prompt: "Explain the differences between asset sale, stock sale, merger, and rollover structures — and the tax implications.",
  },
  {
    eyebrow: "SPECIALISTS",
    label: "Find deal-team specialists",
    prompt: "I need to find a CPA, quality-of-earnings provider, investment banker, or valuation specialist. Help me know what to look for.",
  },
];

export function SearchScreen({ isAnon, initials, onAvatarClick, onAskYulia }: SearchProps) {
  const [draft, setDraft] = useState("");

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    onAskYulia(t);
    setDraft("");
  };

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 220 }}>
      <GlassTopBar title="Search" initials={initials} onAvatarClick={onAvatarClick} />
      <LargeTitle>Search</LargeTitle>

      <div style={S.intro}>
        Let's find what you're looking for. Tap a starting point or type a question — Yulia handles the rest.
      </div>

      <div style={S.cardsGrid}>
        {DISCOVERY.map(c => (
          <button
            key={c.label}
            type="button"
            className="mb-tap"
            onClick={() => submit(c.prompt)}
            style={S.card}
            aria-label={c.label}
          >
            <span className="mb-mono" style={S.cardEyebrow}>{c.eyebrow}</span>
            <span style={S.cardLabel}>{c.label}</span>
          </button>
        ))}
      </div>

      <div style={S.composerWrap}>
        <div style={S.composerInner}>
          <span aria-hidden="true" style={S.composerIcon}>
            <MobileIcon name="search" c="var(--mb-ink-3)" />
          </span>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(draft); } }}
            placeholder={isAnon ? "Ask Yulia anything…" : "What are you looking for?"}
            style={S.composerInput}
            aria-label="Search query"
          />
          <button
            type="button"
            onClick={() => submit(draft)}
            disabled={!draft.trim()}
            style={{ ...S.composerSubmit, opacity: draft.trim() ? 1 : 0.4 }}
            aria-label="Ask Yulia"
          >
            <MobileIcon name="arrowUp" c="#fff" size={16} />
          </button>
        </div>
        <div style={S.composerHint}>
          Yulia answers in chat. {isAnon ? "Sign in to keep your history." : "Search context stays separate from your deal threads."}
        </div>
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  intro: {
    padding: "0 22px 20px",
    fontSize: 14, lineHeight: 1.5,
    color: "var(--mb-ink-2)",
    maxWidth: "60ch",
  },
  cardsGrid: {
    padding: "0 16px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  card: {
    all: "unset",
    display: "flex", flexDirection: "column", gap: 6,
    padding: "16px 14px",
    background: "var(--mb-accent-soft)",
    color: "var(--mb-accent-ink)",
    borderRadius: 14,
    cursor: "pointer",
    minHeight: 92,
    boxSizing: "border-box",
  },
  cardEyebrow: {
    fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
    opacity: 0.72,
  },
  cardLabel: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 14, fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.25,
  },
  composerWrap: {
    position: "fixed",
    left: 16, right: 16,
    bottom: "calc(110px + env(safe-area-inset-bottom, 0px))",
    zIndex: 30,
  },
  composerInner: {
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--mb-card)",
    border: "1px solid var(--mb-line)",
    borderRadius: 999,
    padding: "8px 8px 8px 14px",
    boxShadow: "0 8px 24px -8px rgba(20,30,55,0.12)",
  },
  composerIcon: {
    display: "grid", placeItems: "center",
    width: 22, height: 22,
    flexShrink: 0,
  },
  composerInput: {
    flex: 1, minWidth: 0,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 15,
    fontFamily: "var(--mb-font-body)",
    color: "var(--mb-ink)",
  },
  composerSubmit: {
    width: 34, height: 34,
    border: "none",
    borderRadius: "50%",
    background: "var(--mb-accent)",
    color: "#fff",
    display: "grid", placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 160ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
  },
  composerHint: {
    fontSize: 11, color: "var(--mb-ink-3)",
    textAlign: "center",
    marginTop: 6,
  },
};
