/* V6 Mobile — Deal detail screen.
   App Store app-detail style: floating glass nav + big icon + stats strip +
   tag chips + What's Yulia saying + A closer look (horizontal artifact rail)
   + Confidence & notes. */

import { type CSSProperties, type ReactNode, useState } from "react";
import { FitGauge } from "../FitGauge";
import { MobileIcon } from "../icons";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { findDeal } from "../../../../lib/sampleDeals";
import { getRecommendations } from "../../../../lib/recommendedNext";
import type { Verdict } from "../types";

const VERDICT_LABEL: Record<Verdict, string> = {
  pursue: "PURSUE",
  watch:  "WATCH",
  pass:   "PASS",
};

const VERDICT_INK: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue-ink)",
  watch:  "var(--mb-warn-ink)",
  pass:   "var(--mb-danger-ink)",
};

const VERDICT_DOT: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue)",
  watch:  "var(--mb-warn)",
  pass:   "var(--mb-danger)",
};

const VERDICT_BG: Record<Verdict, string> = {
  pursue: "var(--mb-verdict-pursue-soft)",
  watch:  "var(--mb-warn-soft)",
  pass:   "var(--mb-danger-soft)",
};

/* Generic fallback blurbs when the deal doesn't carry its own verdictWhy.
   Phrased decisively (this IS a WATCH / this IS a PURSUE) so users don't
   read it as "kinda both." Per-deal verdictWhy from sampleDeals.ts always
   wins over these. */
const VERDICT_BLURB: Record<Verdict, string> = {
  pursue: "PURSUE — strong fit. Move on the IOI.",
  watch:  "WATCH — not a pursue yet. Specific things have to verify before it moves to PURSUE.",
  pass:   "PASS — math doesn't work. Don't spend cycles here.",
};

interface DetailProps {
  dealId: string;
  dealTitle: string;
  onBack: () => void;
  onChat: () => void;
  /** Send a starter prompt to chat then open the chat sheet. Used by
      the next-actions list and the deal-context input at the bottom. */
  onAskYulia: (prompt: string) => void;
  /** Real deal record when the dealId resolves to one of the user's deals.
      Drives the gate-aware Recommended Next list (B2.0). Null/undefined
      falls back to the sample-flavored static items below. */
  userDeal?: { business_name?: string | null; journey_type?: string | null; current_gate?: string | null } | null;
}

export function DetailScreen({ dealId, dealTitle, onBack, onChat, onAskYulia, userDeal }: DetailProps) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(dealId);

  /* Pull the real verdict + fit from the sample deal bank so the page reflects
     this specific deal — not a hardcoded "Pursue / 92" that contradicts what
     Yulia says in chat. Falls back to "watch / 70" for unknown ids so the
     page still renders cleanly. */
  const deal = findDeal(dealId);
  const verdict: Verdict = deal?.verdict ?? "watch";
  const fit = deal?.fit ?? 70;
  const dealSub = deal?.sub ?? "";
  /* Per-deal verdict reasoning beats the generic blurb when present.
     This is what answers the user's "is this a watch or pursue?" question
     by spelling out the specific math + the criteria that would flip it. */
  const verdictBlurb = deal?.verdictWhy ?? VERDICT_BLURB[verdict];

  const onShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: dealTitle, url });
        return;
      } catch { /* user cancelled */ }
    }
    // Desktop / unsupported: copy URL to clipboard.
    try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
  };

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 140, position: "relative", background: "var(--mb-bg)" }}>
      <FloatingNav onBack={onBack} onShare={onShare} />

      {/* Hero block — original side-by-side layout. The verdict pill on
          the left is Yulia's CALL (read-only label). The Watch pill on
          the right is the user's ACTION (toggle). Visually distinct
          treatments + the "Yulia's verdict" caption underneath make the
          intent clear without extra UI clutter. */}
      <div style={D.hero}>
        <FitGauge score={fit} verdict={verdict} size={108} strokeRatio={0.09} />
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <h1 style={D.h1}>{dealTitle}</h1>
          <div style={D.dealMeta}>{dealSub || "Sample deal"}</div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              ...D.verdictBadge,
              background: VERDICT_BG[verdict],
              color: VERDICT_INK[verdict],
            }}>
              <span
                aria-hidden="true"
                style={{ ...D.verdictDot, background: VERDICT_DOT[verdict] }}
              />
              {VERDICT_LABEL[verdict]}
            </span>
            <button
              type="button"
              aria-pressed={watched}
              onClick={() => toggle(dealId, dealTitle)}
              style={{
                ...D.watchBtn,
                background: watched ? "var(--mb-accent-ink)" : "var(--mb-accent-soft)",
                color: watched ? "#fff" : "var(--mb-accent-ink)",
              }}
            >{watched ? "✓ Watching" : "+ Watch"}</button>
          </div>
          <div style={D.verdictCaption}>
            <span style={{ color: "var(--mb-ink-3)" }}>{VERDICT_LABEL[verdict]}</span>
            {" is Yulia's verdict — Watch saves it to your list."}
          </div>
        </div>
      </div>

      {/* Stats strip — FIT SCORE removed since the hero gauge already
          carries it; replaced with EBITDA so the user sees both
          earnings views at once. */}
      <div style={D.statsStrip}>
        <Stat top="$1.80M" label="NORM. SDE" sub={<span style={{ color: "var(--mb-accent)" }}>+$760K</span>} divider />
        <Stat top="$2.10M" label="EBITDA"    sub="adj." divider />
        <Stat top="7.0×"   label="MULTIPLE"  sub="SBA-clear" divider />
        <Stat top="#3"     label="THIS WEEK" sub="of 142" />
      </div>

      {/* Tag chips */}
      <div className="mb-hide-scroll" style={D.tagsRow}>
        {["Industrial", "Services", "Recurring", "SBA-clear", "Sun Belt"].map(t => (
          <div key={t} style={D.tag}>{t}</div>
        ))}
      </div>

      {/* What's Yulia saying */}
      <Section title="What's Yulia saying" chevron>
        <div className="mb-mono" style={D.versionLine}>
          UPDATED 2 MIN AGO &nbsp;&middot;&nbsp; v3
        </div>
        <p style={D.body}>
          Recast is real. $760K of add-backs are clean &mdash; owner comp, family payroll, one-time legal, M&amp;E. The 38% top-5 concentration looks scary on paper but they&rsquo;ve held those accounts 6+ years with zero churn. That&rsquo;s a moat, not a risk. NWC peg is below median; flag for QoE. Drafting the IOI now.
        </p>
      </Section>

      {/* A closer look — horizontal artifact rail */}
      <Section title="A closer look" pad={false}>
        <div className="mb-hide-scroll" style={D.artifactsRow}>
          <ArtifactPreview kind="recast"   title="Recast walk"    big="$1.80M"    sub="P&L normalization · 5 lines" onTap={onChat} />
          <ArtifactPreview kind="baseline" title="Baseline range" big="$7.2–9.4M" sub="4 scenarios · SBA at $7.8M"  onTap={onChat} />
          <ArtifactPreview kind="buyers"   title="Buyer list"     big="69"        sub="47 strategics · 22 sponsors" onTap={onChat} />
          <ArtifactPreview kind="ioi"      title="IOI draft"      big="v2"        sub="Aggressive but earnest"      onTap={onChat} />
        </div>
      </Section>

      {/* Yulia Review — renamed from "Confidence & notes". The stars
          and inline note are now framed as Yulia's live commentary
          on the deal, not a user review. */}
      <Section title="Yulia Review" chevron>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 4 }}>
          <div>
            <div style={D.bigNumber}>4.6</div>
            <div style={D.bigNumberSub}>out of 5</div>
          </div>
          <div style={{ flex: 1 }}>
            <Stars n={4.6} size={14} />
            <div style={{ fontSize: 13, color: "var(--mb-ink-3)", marginTop: 4 }}>Yulia&rsquo;s confidence</div>
            <div style={D.confidenceBody}>
              Verdict held across 3 reviews. Concentration risk and NWC peg are the only two reasons confidence isn&rsquo;t 5/5.
            </div>
          </div>
        </div>

        <div style={D.userNote}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Stars n={5} size={11} />
            <span style={{ fontSize: 12, color: "var(--mb-ink-3)" }}>&middot;&nbsp;Yulia, 2 hr ago</span>
          </div>
          <div style={D.userNoteTitle}>Worth the call. Pre-qualify SBA today.</div>
          <div style={D.userNoteBody}>
            The recast holds. NWC peg is below median — flag for QoE. Concentration looks heavy on paper but those accounts are 6+ years old with zero churn. That&rsquo;s a moat, not a risk.
          </div>
        </div>
      </Section>

      {/* Recommended next actions — 2-4 contextual shortcuts driven by the
          deal's gate + journey when we have a real deal record (B2.0 from
          getRecommendations). Falls back to static SELL-flavored samples
          when no real deal is in scope (anon visitors hitting sample
          deals). Each tap fires onAskYulia(prompt) — Yulia executes. */}
      {userDeal ? (
        <Section title="Recommended next" chevron={false}>
          {getRecommendations({
            business_name: userDeal.business_name ?? dealTitle,
            journey_type: userDeal.journey_type,
            current_gate: userDeal.current_gate,
          }).map((rec, i, arr) => (
            <NextAction
              key={rec.id}
              eyebrow={rec.eyebrow}
              title={rec.title}
              sub={rec.sub ?? ""}
              last={i === arr.length - 1}
              onTap={() => onAskYulia(rec.prompt)}
            />
          ))}
        </Section>
      ) : (
        <Section title="Recommended next" chevron={false}>
          <NextAction
            eyebrow="ANALYSIS"
            title="Run a deeper QoE on the NWC peg"
            sub="2 minutes · Yulia walks the working capital math"
            onTap={() => onAskYulia(`On ${dealTitle}: walk me through a deeper QoE focused on the NWC peg. Numbers + recommendation.`)}
          />
          <NextAction
            eyebrow="DOC"
            title="Draft the IOI"
            sub="Yulia has the v3 ready — review and send"
            onTap={() => onAskYulia(`On ${dealTitle}: draft the IOI for me. League-appropriate template, agreed terms.`)}
          />
          <NextAction
            eyebrow="OUTREACH"
            title="Pull the buyer list"
            sub="69 candidates · 47 strategics, 22 sponsors"
            last
            onTap={() => onAskYulia(`On ${dealTitle}: pull a ranked buyer list. Strategic and sponsor split, fit reasoning.`)}
          />
        </Section>
      )}

      {/* Deal-context chat input — tappable field at the bottom that
          opens chat with the deal already in context. Whatever the
          user types becomes a starter prompt scoped to this deal. */}
      <DealChatInput dealTitle={dealTitle} onAskYulia={onAskYulia} />

      {/* Market intelligence — below the chat pill in its own section.
          Per-deal data lives on SampleDeal.marketIntel; in production
          this will be wired to the marketIntelligence subsystem so each
          deal pulls fresh comps, multiples, buyer activity. Hidden
          gracefully when no data on the deal. */}
      {deal?.marketIntel && (
        <Section title="Market intelligence" chevron>
          <div style={D.marketIntroLine}>
            <span className="mb-mono" style={D.marketIndustry}>
              {deal.marketIntel.industry.toUpperCase()}
              {deal.marketIntel.naics && ` · NAICS ${deal.marketIntel.naics}`}
            </span>
          </div>
          <div style={D.marketGrid}>
            <MarketTile label="AVG MULTIPLE"  value={deal.marketIntel.avgMultiple} />
            <MarketTile label="AVG DEAL SIZE" value={deal.marketIntel.avgDealSize} />
            <MarketTile label="ACTIVE BUYERS" value={deal.marketIntel.activeBuyers} />
            <MarketTile label="MARKET TREND"  value={deal.marketIntel.yoyActivity} />
          </div>
          <p style={D.marketBlurb}>{deal.marketIntel.blurb}</p>
          <button
            type="button"
            className="mb-tap"
            onClick={() => onAskYulia(`On ${dealTitle}: deeper market intelligence — recent comparable transactions, who else is bidding, where multiples are trending. Pull the data.`)}
            style={D.marketAskBtn}
          >
            <span>Ask Yulia for the deeper market read</span>
            <MobileIcon name="chevron" size={11} c="var(--mb-accent-ink)" />
          </button>
        </Section>
      )}
    </div>
  );
}

/* ─── Market-intelligence tile ───────────────────────────── */

function MarketTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={D.marketTile}>
      <div className="mb-mono" style={D.marketTileLabel}>{label}</div>
      <div style={D.marketTileValue}>{value}</div>
    </div>
  );
}

/* ─── Recommended-action row ─────────────────────────────── */

function NextAction({
  eyebrow, title, sub, last, onTap,
}: { eyebrow: string; title: string; sub: string; last?: boolean; onTap: () => void }) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 0",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mb-mono" style={D.nextEyebrow}>{eyebrow}</div>
        <div style={D.nextTitle}>{title}</div>
        <div style={D.nextSub}>{sub}</div>
      </div>
      <MobileIcon name="chevron" size={12} c="var(--mb-ink-3)" />
    </div>
  );
}

/* ─── Deal-context chat input ────────────────────────────── */

function DealChatInput({
  dealTitle, onAskYulia,
}: { dealTitle: string; onAskYulia: (prompt: string) => void }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const t = draft.trim();
    if (!t) {
      // Empty submit — open chat with deal context as a starter.
      onAskYulia(`Tell me more about ${dealTitle}.`);
      return;
    }
    onAskYulia(`About ${dealTitle}: ${t}`);
    setDraft("");
  };
  return (
    <div style={D.chatInputWrap}>
      <div className="mb-mono" style={D.chatInputEyebrow}>
        ASK YULIA · ABOUT THIS DEAL
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        style={D.chatInputForm}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Chat with Yulia about this deal…"
          aria-label={`Chat with Yulia about ${dealTitle}`}
          style={D.chatInputField}
        />
        <button
          type="submit"
          aria-label="Send"
          style={D.chatInputSend}
        >
          <MobileIcon name="arrowUp" size={16} c="#fff" />
        </button>
      </form>
    </div>
  );
}

/* ─── Floating glass back/share nav ──────────────────────── */

function FloatingNav({ onBack, onShare }: { onBack: () => void; onShare: () => void }) {
  return (
    <>
      <div style={D.navTopGuard} aria-hidden="true" />
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{ ...D.navBtn, top: 18, left: 16 }}
      >
        <MobileIcon name="back" size={14} c="var(--mb-ink-1)" />
      </button>
      <button
        type="button"
        onClick={onShare}
        aria-label="Share"
        style={{ ...D.navBtn, top: 18, right: 16 }}
      >
        <MobileIcon name="share" size={16} c="var(--mb-ink-1)" />
      </button>
    </>
  );
}

/* ─── Stat cell ─────────────────────────────────────────── */

function Stat({ top, label, sub, divider }: { top: string; label: string; sub: ReactNode; divider?: boolean }) {
  return (
    <div style={{
      borderRight: divider ? "0.5px solid var(--mb-line-2)" : "none",
      padding: "0 4px", minWidth: 0,
    }}>
      <div style={D.statLabel}>{label}</div>
      <div style={D.statTop}>{top}</div>
      <div style={D.statSub}>{sub}</div>
    </div>
  );
}

/* ─── Stars (filled / half / empty) ─────────────────────── */

function Stars({ n, size = 12 }: { n: number; size?: number }) {
  const full = Math.floor(n);
  const half = n - full >= 0.3 && n - full <= 0.7;
  return (
    <span style={{ display: "inline-flex", gap: 1.5, color: "var(--mb-ink-1)" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <MobileIcon
          key={i}
          name="star"
          size={size}
          c={i < full ? "var(--mb-ink-1)" : (i === full && half ? "var(--mb-ink-1)" : "var(--mb-ink-5)")}
        />
      ))}
    </span>
  );
}

/* ─── Section ──────────────────────────────────────────── */

function Section({ title, chevron, pad = true, children }: {
  title: string; chevron?: boolean; pad?: boolean; children: ReactNode;
}) {
  return (
    <div style={{
      borderTop: "0.5px solid var(--mb-line-2)",
      padding: pad ? "20px 22px 22px" : "20px 0 22px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: pad ? 0 : "0 22px",
        marginBottom: 10,
      }}>
        <h3 style={D.sectionTitle}>
          {title}
          {chevron && <MobileIcon name="chevron" c="var(--mb-ink-3)" size={11} />}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Artifact preview card ─────────────────────────────── */

type ArtifactKind = "recast" | "baseline" | "buyers" | "ioi";

// Each artifact card is a texture + tinted overlay (kept for white text
// legibility), except "ioi" which stays as the formal dark slate card —
// textures would weaken the IOI/LOI doc gravitas.
/* Artifact previews use the lighter overlay recipe — multiply blend was
   muddying the watercolor into brown. Normal compositing + lighter stops
   keeps the verdict colors vivid. */
const ARTIFACT_BG: Record<ArtifactKind, string> = {
  recast:
    `linear-gradient(160deg, rgba(48,108,80,0.44) 0%, rgba(18,68,46,0.74) 100%), url('${RANDOM_TEXTURES.pursue}')`,
  baseline:
    `linear-gradient(160deg, rgba(60,108,168,0.44) 0%, rgba(25,68,118,0.74) 100%), url('${RANDOM_TEXTURES.baseline}')`,
  buyers:
    `linear-gradient(160deg, rgba(95,68,150,0.44) 0%, rgba(60,38,108,0.74) 100%), url('${RANDOM_TEXTURES.buyers}')`,
  ioi:
    "linear-gradient(160deg, #3A4150, #1A2233)",
};

const ARTIFACT_GLOW: Record<ArtifactKind, string> = {
  recast:   "0 12px 30px -10px rgba(48,108,80,0.32)",
  baseline: "0 12px 30px -10px rgba(60,108,168,0.32)",
  buyers:   "0 12px 30px -10px rgba(95,68,150,0.32)",
  ioi:      "0 12px 30px -10px rgba(58,65,80,0.32)",
};

function ArtifactPreview({
  kind, title, big, sub, onTap,
}: { kind: ArtifactKind; title: string; big: string; sub: string; onTap: () => void }) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      style={{
        flexShrink: 0, width: 220,
        borderRadius: 18,
        backgroundImage: ARTIFACT_BG[kind],
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // Multiply removed — was muddying the watercolor texture into
        // brown. Normal compositing keeps colors vivid.
        color: "#fff", overflow: "hidden", position: "relative",
        boxShadow:
          ARTIFACT_GLOW[kind] + "," +
          "0 6px 18px -8px rgba(0,0,0,0.22)," +
          "inset 0 1px 0 rgba(255,255,255,0.22)," +
          "inset 0 -1px 0 rgba(0,0,0,0.18)",
        cursor: "pointer",
      }}
    >
      <div style={{ height: 130, position: "relative" }}>
        <div style={D.artifactGlow} aria-hidden="true" />
        <div className="mb-mono" style={D.artifactCaption}>{title.toUpperCase()}</div>
        <div style={D.artifactBig}>{big}</div>
      </div>
      <div style={D.artifactFooter}>
        <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.3 }}>{sub}</div>
        <button
          type="button"
          className="mb-get-pill dark"
          style={{ padding: "4px 14px", fontSize: 12 }}
          onClick={(e) => { e.stopPropagation(); onTap(); }}
        >Open</button>
      </div>
    </div>
  );
}

const D: Record<string, CSSProperties> = {
  hero: {
    padding: "60px 22px 18px",
    display: "flex", gap: 14, alignItems: "flex-start",
  },
  h1: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px", lineHeight: 1.1,
    margin: 0, color: "var(--mb-ink)",
    textWrap: "balance",
  },
  dealMeta: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 4,
    lineHeight: 1.35, textWrap: "pretty",
  },

  /* Verdict badge — flat label with dot prefix. NO shadow, NO button
     affordance. The dot + dark colored text on soft tint reads as a
     status tag, not a tappable element. Different shape/treatment from
     the Watch button next to it. */
  verdictBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px",
    fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
    borderRadius: 999,
  },
  verdictDot: {
    width: 7, height: 7, borderRadius: "50%",
    flexShrink: 0,
  },

  /* Watch button — clearly tappable. Solid pill with shadow + iconographic
     prefix so the affordance is unambiguous next to the verdict badge. */
  watchBtn: {
    padding: "6px 16px",
    fontSize: 13, fontWeight: 700, letterSpacing: "-0.1px",
    border: "none", borderRadius: 999, cursor: "pointer",
    transition: "background-color 200ms ease, color 200ms ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    minWidth: 100,
  },

  /* Caption clarifies what each pill means — the verdict is informational,
     Watch is the user's action. */
  verdictCaption: {
    fontSize: 11, color: "var(--mb-ink-4)", marginTop: 6,
    lineHeight: 1.35,
  },
  statsStrip: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    padding: "4px 22px 18px",
    gap: 0,
  },
  statLabel: {
    fontSize: 10, color: "var(--mb-ink-4)",
    letterSpacing: 0.1, fontWeight: 600,
  },
  statTop: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 18, letterSpacing: "-0.4px",
    color: "var(--mb-ink)", marginTop: 2,
  },
  statSub: {
    fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2,
  },
  tagsRow: {
    display: "flex", gap: 8,
    padding: "0 22px 20px",
    overflowX: "auto",
  },
  tag: {
    padding: "7px 14px", borderRadius: 999,
    background: "var(--mb-card-2)",
    fontSize: 13, color: "var(--mb-ink-1)", fontWeight: 500,
    whiteSpace: "nowrap",
  },
  versionLine: {
    fontSize: 12, color: "var(--mb-ink-4)", marginBottom: 6,
  },
  body: {
    fontSize: 15, color: "var(--mb-ink-1)", lineHeight: 1.45,
    margin: 0, letterSpacing: "-0.1px",
    textWrap: "pretty",
  },
  sectionTitle: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 22, letterSpacing: "-0.5px",
    color: "var(--mb-ink)",
    margin: 0,
    display: "flex", alignItems: "center", gap: 6,
  },
  artifactsRow: {
    display: "flex", gap: 14,
    padding: "4px 22px 4px",
    overflowX: "auto",
  },
  artifactGlow: {
    position: "absolute", top: -30, right: -20,
    width: 140, height: 140, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
  },
  artifactCaption: {
    position: "absolute", bottom: 12, left: 16,
    fontSize: 10, letterSpacing: 0.1,
    color: "#fff",
  },
  artifactBig: {
    position: "absolute", bottom: 24, left: 16,
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 36, letterSpacing: "-1px", lineHeight: 1,
    color: "#fff",
  },
  artifactFooter: {
    padding: "10px 14px 12px",
    background: "rgba(0,0,0,0.18)",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
  },
  bigNumber: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 56, letterSpacing: "-2px", lineHeight: 1,
    color: "var(--mb-ink)",
  },
  bigNumberSub: {
    fontSize: 11, color: "var(--mb-ink-3)", marginTop: 2,
  },
  confidenceBody: {
    marginTop: 6, fontSize: 12.5, color: "var(--mb-ink-2)", lineHeight: 1.4,
    textWrap: "pretty",
  },
  userNote: {
    marginTop: 16, padding: 14,
    background: "var(--mb-card-2)", borderRadius: 14,
  },
  userNoteTitle: {
    fontSize: 14, fontWeight: 600, color: "var(--mb-ink)", marginBottom: 4,
  },
  userNoteBody: {
    fontSize: 13, color: "var(--mb-ink-2)", lineHeight: 1.4,
    textWrap: "pretty",
  },
  navTopGuard: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 60, background: "transparent", zIndex: 5,
  },
  navBtn: {
    position: "absolute", zIndex: 10,
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },

  /* Market intelligence section */
  marketIntroLine: {
    marginBottom: 12,
  },
  marketIndustry: {
    fontSize: 10.5, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-3)",
  },
  marketGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  marketTile: {
    background: "var(--mb-card-2)",
    borderRadius: 12,
    padding: "12px 14px",
    border: "0.5px solid var(--mb-line-2)",
  },
  marketTileLabel: {
    fontSize: 9.5, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-4)",
    marginBottom: 4,
  },
  marketTileValue: {
    fontFamily: "var(--mb-font-display)", fontWeight: 700,
    fontSize: 16, letterSpacing: "-0.3px", lineHeight: 1.2,
    color: "var(--mb-ink)",
  },
  marketBlurb: {
    fontSize: 14, color: "var(--mb-ink-1)", lineHeight: 1.5,
    margin: 0, letterSpacing: "-0.05px",
    textWrap: "pretty",
  },
  marketAskBtn: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    background: "var(--mb-accent-soft)",
    border: "none",
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontSize: 13.5, fontWeight: 600,
    color: "var(--mb-accent-ink)",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* Recommended next-action rows */
  nextEyebrow: {
    fontSize: 10, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-3)", textTransform: "uppercase",
    marginBottom: 2,
  },
  nextTitle: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px", lineHeight: 1.25,
  },
  nextSub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 2,
    lineHeight: 1.35,
  },

  /* Deal-context chat input — the light-grey wrapper holds the eyebrow
     plus an inner pill that matches the ChatSheet composerPill exactly,
     so the user feels they're already inside the chat from the deal
     page. Clicking → opens ChatSheet with this deal pre-loaded. */
  chatInputWrap: {
    margin: "8px 16px 0",
    padding: "16px 14px 16px",
    background: "var(--mb-card-2)",
    borderRadius: 18,
    border: "0.5px solid var(--mb-line-2)",
  },
  chatInputEyebrow: {
    fontSize: 10.5, letterSpacing: "0.08em", fontWeight: 700,
    color: "var(--mb-ink-3)", marginBottom: 10, paddingLeft: 4,
  },
  chatInputForm: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--mb-line-2)",
    borderRadius: 20,
    padding: 6,
    paddingLeft: 14,
    display: "flex", alignItems: "flex-end", gap: 8,
    boxShadow: "0 6px 20px -6px rgba(0,0,0,0.12)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  },
  chatInputField: {
    flex: 1, minWidth: 0,
    border: "none", outline: "none", background: "transparent",
    fontFamily: "var(--mb-font-body)",
    fontSize: 16, lineHeight: 1.4,
    color: "var(--mb-ink)",
    padding: "8px 4px",
  },
  chatInputSend: {
    flexShrink: 0,
    width: 32, height: 32, borderRadius: "50%",
    border: "none",
    background: "var(--mb-action)",
    color: "#fff",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 160ms ease-out, background-color 200ms ease",
  },
};
