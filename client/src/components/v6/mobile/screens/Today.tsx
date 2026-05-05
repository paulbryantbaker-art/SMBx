/* V6 Mobile — Today screen.
   Anonymous: WORKING SAMPLE welcome hero + Three ways to explore guide +
              5 sample deals + Brief teaser.
   Authed: hero collapses to a daily-brief teaser; TryThisCard hides; eyebrow
           strips "WORKING SAMPLE" prefix.

   Copy resolution: desktop's longer welcome H1 + tag win where they conflict
   with CD's mobile bundle copy. Sample pipeline matches desktop's Big Fake
   Deal seed data. */

import { type CSSProperties, type ReactNode } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { GlassSurface } from "../glass";
import { YIcon } from "../YIcon";
import { VerdictPill } from "../VerdictPill";
import { PickRow } from "../PickRow";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { MobileIcon } from "../icons";
import type { Verdict, YIconKind } from "../types";
import type { MobilePipelineRow, MobilePick } from "../../../../hooks/useMobileDeals";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { copyFor } from "../../../../lib/copy";
import { type Audience } from "../../../../lib/audience";
import { AudienceSwitcher } from "../AudienceSwitcher";

interface TodayProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onChat: () => void;
  onAskYulia: (prompt: string) => void;
  onLearn: (section: "how" | "pricing", anchor?: string) => void;
  onAvatarClick: () => void;
  /** Authed user's deals (from useMobileDeals). Null = anon or empty,
      in which case the hardcoded SAMPLE_PIPELINE renders instead. */
  userPipeline: MobilePipelineRow[] | null;
  /** Authed user's top 3 picks (from useMobileDeals). Null = anon or empty
      → SAMPLE_PICKS renders instead. Same shape as Brief screen's picks. */
  userPicks: MobilePick[] | null;
  /** Current audience (drives copy + tip chips). */
  audience: Audience;
  /** Update audience (used by the inline switcher pill). */
  onAudienceChange: (a: Audience) => void;
  /** Whether to show the audience switcher pill at the top of the
      Explore card. False for authed users (their audience is captured
      server-side, not toggled). */
  showAudienceSwitcher: boolean;
}

interface TodayPick {
  rank: number;
  id: string;
  name: string;
  sub: string;
  fit: number;
  kind: Verdict;
}

const SAMPLE_PICKS: TodayPick[] = [
  { rank: 1, id: "deal-bigfake",    name: "Big Fake Deal · sample",       sub: "Recurring rev · honest capex story",         fit: 92, kind: "pursue" },
  { rank: 2, id: "deal-pest",       name: "Pest Control · FL",            sub: "92% on monthly contracts · add-back rich",   fit: 84, kind: "pursue" },
  { rank: 3, id: "deal-electrical", name: "Electrical Contractor · TX",   sub: "Margins good but 60% one customer",          fit: 78, kind: "watch"  },
];

interface TodayPipelineRow {
  id: string;
  icon: YIconKind;
  name: string;
  sub: string;
  action: "open" | "get";
  verdict?: Verdict;
  price?: string;
}

const SAMPLE_PIPELINE: TodayPipelineRow[] = [
  { id: "deal-bigfake",    icon: "cool",    name: "Big Fake Deal · sample",     sub: "$1.80M SDE · honest capex story",      action: "open", verdict: "pursue" },
  { id: "deal-pest",       icon: "cool",    name: "Pest Control · FL",          sub: "92% on monthly contracts",             action: "open", verdict: "pursue" },
  { id: "deal-electrical", icon: "default", name: "Electrical · TX",            sub: "Margins good · concentration risk",    action: "get",  price: "Watch" },
  { id: "deal-hvac",       icon: "default", name: "HVAC platform · CO",         sub: "Family business · clean financials",   action: "get",  price: "Watch" },
  { id: "deal-dist",       icon: "default", name: "Distribution · OH",          sub: "Asking high · margins thin",           action: "get",  price: "Pass" },
];

export function TodayScreen({
  isAnon, initials, onOpenDeal, onChat, onAskYulia, onLearn: _onLearn,
  onAvatarClick, userPipeline, userPicks,
  audience, onAudienceChange, showAudienceSwitcher,
}: TodayProps) {
  const PIPELINE: TodayPipelineRow[] = userPipeline ?? SAMPLE_PIPELINE;
  const PICKS: TodayPick[] = userPicks ?? SAMPLE_PICKS;
  const { isWatched, toggle } = useWatchlist();
  const C = copyFor(audience);
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Today" initials={initials} onAvatarClick={onAvatarClick} onSearch={onChat} />
      <LargeTitle>Today</LargeTitle>

      {/* Hero — anon = welcome, authed = today's brief teaser. The
          audience switcher pill (anon only) lives in the welcome hero's
          eyebrow row so the test-drive control is anchored to the
          biggest, most-visible card on the screen. */}
      <div style={{ padding: "4px 16px 0" }}>
        {isAnon ? (
          <WelcomeHero
            onChat={onChat}
            heroTag={C.todayHeroTag}
            audience={audience}
            onAudienceChange={onAudienceChange}
            showAudienceSwitcher={showAudienceSwitcher}
          />
        ) : (
          <DailyHero onOpenDeal={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")} />
        )}
      </div>

      {/* Explore SMBX — about/learn surface. Persona-aware: 1 fixed
          "try a sample deal" entry + 3 audience-keyed tip chips from
          copy.ts that open chat with a starter prompt. */}
      <div style={{ padding: "14px 16px 0" }}>
        <ExploreCard
          isAnon={isAnon}
          onChat={onChat}
          onAskYulia={onAskYulia}
          onOpenDeal={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")}
          tips={C.todayTips}
        />
      </div>

      {/* Pipeline section — content per audience via copy.ts */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <div className="mb-as-card" style={{ padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 4px" }}>
            <div className="mb-section-eyebrow">{C.todayIntelEyebrow}</div>
            <div className="mb-section-title">{C.todayIntelTitle}</div>
            <div style={S.subText}>{C.todayIntelSub}</div>
          </div>
          {PIPELINE.map((d, i) => (
            <PipelineRow
              key={d.id}
              name={d.name}
              sub={d.sub}
              action={d.action}
              price={d.action === "get" ? d.price : undefined}
              verdict={"verdict" in d ? d.verdict : undefined}
              last={i === PIPELINE.length - 1}
              onTap={() => onOpenDeal(d.id, d.name)}
              watched={isWatched(d.id)}
              onToggleWatch={() => toggle(d.id, d.name)}
            />
          ))}
        </div>
      </div>

      {/* Brief teaser — uses the same mb-as-card + PickRow pattern as the
          Brief screen's main ranked list, so the two surfaces stay locked
          to one design language. Shows the 3 highest-fit picks (from
          useMobileDeals) or SAMPLE_PICKS for anon visitors. */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <div className="mb-as-card" style={{ padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 4px" }}>
            <div className="mb-section-eyebrow">{C.todayBriefEyebrow}</div>
            <div className="mb-section-title">{C.todayBriefTitle}</div>
            <div style={S.subText}>{C.todayBriefSub}</div>
          </div>
          {PICKS.map((p, i) => (
            <PickRow
              key={p.id}
              rank={p.rank}
              name={p.name}
              sub={p.sub}
              fit={p.fit}
              kind={p.kind}
              last={i === PICKS.length - 1}
              onTap={() => onOpenDeal(p.id, p.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Welcome hero (anon) ────────────────────────────────── */

function WelcomeHero({
  onChat, heroTag, audience, onAudienceChange, showAudienceSwitcher,
}: {
  onChat: () => void;
  heroTag: string;
  audience: Audience;
  onAudienceChange: (a: Audience) => void;
  showAudienceSwitcher: boolean;
}) {
  return (
    <HeroFrame kind="welcome" onTap={onChat}>
      <HeroVisualPursue />

      {/* Brand eyebrow on the left. Shortened from "WELCOME TO SMBX ·
          WORKING SAMPLE" to just "WORKING SAMPLE" so it doesn't collide
          with the audience switcher pill on the right. The "Welcome"
          framing is already carried by the headline below. */}
      <div style={H.eyebrowSlot}>
        <div className="mb-eyebrow">WORKING SAMPLE</div>
      </div>
      {/* Audience switcher pill — absolute top-right of the hero, anon
          only. Sits in its own anchor so it doesn't push the eyebrow
          into a multi-line wrap. Opens a portaled bottom sheet (see
          AudienceSwitcher) — the hero's overflow:hidden doesn't clip
          the popup because the portal renders to document.body. */}
      {showAudienceSwitcher && (
        <div style={H.pillSlot} onClick={(e) => e.stopPropagation()}>
          <AudienceSwitcher audience={audience} onChange={onAudienceChange} />
        </div>
      )}

      <div style={H.titleBlock}>
        <h2 style={H.h2}>Agentic AI specifically built for buying and selling businesses of all shapes and sizes.</h2>
        <p style={H.tag}>{heroTag}</p>
      </div>

      <GlassSurface tint="onColor" radius={16} style={H.innerCell}>
        <YIcon size={42} kind="pursue" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={H.innerName}>Try it free &mdash; chat with Yulia</div>
          <div style={H.innerSub}>No signup &middot; explore a real sample deal</div>
        </div>
        <button
          type="button"
          className="mb-get-pill dark"
          style={{ padding: "6px 16px", fontSize: 13 }}
          onClick={(e) => { e.stopPropagation(); onChat(); }}
        >Start</button>
      </GlassSurface>

      <div style={H.metaRow}>
        <span className="mb-mono" style={H.metaText}>FREE &middot; 3 SAMPLE DEALS</span>
      </div>
    </HeroFrame>
  );
}

/* ─── Daily hero (authed) ─────────────────────────────── */

function DailyHero({ onOpenDeal }: { onOpenDeal: () => void }) {
  return (
    <HeroFrame kind="pursue" onTap={onOpenDeal}>
      <HeroVisualPursue />

      <div style={H.eyebrowSlot}>
        <div className="mb-eyebrow">TODAY &middot; YULIA&rsquo;S TOP PICK</div>
      </div>

      <div style={H.titleBlock}>
        <h2 style={H.h2}>Recurring revenue.<br/>Honest capex story.</h2>
        <p style={H.tag}>The strongest source this week. Verdict, recast, and drafts ready when you are.</p>
      </div>

      <GlassSurface tint="onColor" radius={16} style={H.innerCell}>
        <YIcon size={42} kind="pursue" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={H.innerName}>Big Fake Deal &middot; sample</div>
          <div style={H.innerSub}>92 FIT &middot; pursue</div>
        </div>
        <button
          type="button"
          className="mb-get-pill dark"
          style={{ padding: "6px 16px", fontSize: 13 }}
          onClick={(e) => { e.stopPropagation(); onOpenDeal(); }}
        >Open</button>
      </GlassSurface>
    </HeroFrame>
  );
}

/* ─── Hero scaffolding ──────────────────────────────────── */

type HeroKind = Verdict | "welcome";

// Texture path + a verdict-tinted overlay. Overlay is light at top so the
// SVG sparkline + giant SDE number remain visible on the texture, and dimmer
// at the bottom where white text sits in the inner cell.
//
// Sharpening recipe (2026-05-02): the previous overlay sat over the texture
// as plain alpha and washed it out into a flat color field. Three changes
// bring the watercolor variation back without harming text contrast:
//   - drop the overlay alpha by ~8 points (less wash)
//   - blend the gradient into the texture with `multiply` (keeps the
//     texture's lights light + darks dark, just tinted)
//   - add a soft inset top highlight + bottom shadow for tactile depth
// HERO_TEXTURE pulls from RANDOM_TEXTURES so each page-load gets a fresh
// pick from the per-pool watercolor set. welcome stays in the gold pool
// (preserves the warm home identity); watch/pass stay fixed (semantic).
const HERO_TEXTURE: Record<HeroKind, string> = {
  pursue:  RANDOM_TEXTURES.pursue,
  watch:   RANDOM_TEXTURES.watch,
  pass:    RANDOM_TEXTURES.pass,
  welcome: RANDOM_TEXTURES.welcome,
};
const HERO_OVERLAY: Record<HeroKind, string> = {
  pursue:  "linear-gradient(165deg, rgba(48,108,80,0.34) 0%, rgba(18,68,46,0.66) 100%)",
  watch:   "linear-gradient(165deg, rgba(150,108,40,0.34) 0%, rgba(95,65,18,0.66) 100%)",
  pass:    "linear-gradient(165deg, rgba(170,72,60,0.34) 0%, rgba(120,40,32,0.66) 100%)",
  welcome: "linear-gradient(165deg, rgba(140,98,42,0.32) 0%, rgba(85,55,18,0.64) 100%)",
};

function HeroFrame({
  kind, onTap, children,
}: { kind: HeroKind; onTap?: () => void; children: ReactNode }) {
  return (
    <div
      className="mb-tap"
      role={onTap ? "button" : undefined}
      tabIndex={onTap ? 0 : undefined}
      onClick={onTap}
      onKeyDown={(e) => {
        if (onTap && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTap();
        }
      }}
      style={{
        borderRadius: 22,
        backgroundImage: `${HERO_OVERLAY[kind]}, url('${HERO_TEXTURE[kind]}')`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundBlendMode: "multiply, normal",
        color: "#fff",
        overflow: "hidden",
        boxShadow:
          "0 12px 28px -10px rgba(0,0,0,0.28)," +
          // Inner top highlight — sells "lit from above"
          " inset 0 1px 0 rgba(255,255,255,0.22)," +
          // Inner bottom shadow — adds depth at the cell boundary
          " inset 0 -1px 0 rgba(0,0,0,0.18)",
        position: "relative",
        cursor: onTap ? "pointer" : "default",
      }}
    >{children}</div>
  );
}

function HeroVisualPursue() {
  return (
    <div style={{ position: "relative", height: 280, overflow: "hidden" }} aria-hidden="true">
      <div style={{ position: "absolute", top: -60, right: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)" }}/>
      <div style={{ position: "absolute", bottom: -80, left: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 60%)" }}/>
      <div style={{ position: "absolute", bottom: 18, right: 22, textAlign: "right" }}>
        <div className="mb-mono" style={{ fontSize: 11, color: "#fff", letterSpacing: 0.1 }}>SDE</div>
        <div style={{ fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 56, letterSpacing: -2, lineHeight: 1, color: "#fff" }}>$1.80M</div>
        <div className="mb-mono" style={{ fontSize: 11, color: "#fff", marginTop: 2 }}>+$760K NORMALIZED</div>
      </div>
    </div>
  );
}

/* ─── ExploreCard ───────────────────────────────────────────
   About / Learn surface for the mobile Today tab. Mirrors the desktop
   ABOUT SMBX buttons (How it works · Pricing · Compare plans) but as
   one textured card with four routes — including the in-app exploration
   options (sample deal, chat) so a first-time user has a single board
   that says "here are all the ways in." */

function ExploreCard({
  isAnon, onChat, onAskYulia, onOpenDeal, tips,
}: {
  isAnon: boolean;
  onChat: () => void;
  onAskYulia: (prompt: string) => void;
  onOpenDeal: () => void;
  tips: { label: string; prompt: string }[];
}) {
  return (
    <div style={E.card}>
      <div style={E.eyebrowSlot}>
        <div className="mb-eyebrow" style={E.eyebrow}>{isAnon ? "EXPLORE SMBX" : "GET THE MOST FROM YULIA"}</div>
      </div>
      <div style={E.titleBlock}>
        <h3 style={E.h3}>{isAnon ? "Pick a way in." : "Today's quick wins."}</h3>
        <p style={E.tag}>
          {isAnon
            ? "Try a sample deal — or ask Yulia one of the questions below."
            : "Three things Yulia can do for you right now. Tap to start the conversation."}
        </p>
      </div>
      <div style={E.rows}>
        <ExploreRow
          icon="pipeline"
          label="Try a sample deal"
          sub="See verdict, recast, drafts"
          onTap={onOpenDeal}
        />
        {tips.map((t, i) => (
          <ExploreRow
            key={t.label}
            icon="chat"
            label={t.label}
            sub={t.prompt}
            onTap={() => onAskYulia(t.prompt)}
            last={i === tips.length - 1}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onChat}
        style={E.freeFormBtn}
        aria-label="Open chat for any other question"
      >
        Or just chat with Yulia →
      </button>
    </div>
  );
}

function ExploreRow({
  icon, label, sub, onTap, last,
}: {
  icon: "pipeline" | "brief" | "chat";
  label: string;
  sub: string;
  onTap: () => void;
  last?: boolean;
}) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "0.5px solid rgba(255,255,255,0.14)",
        marginBottom: last ? 0 : 8,
        cursor: "pointer",
      }}
    >
      <div style={E.rowGlyph}>
        <MobileIcon name={icon} c="#fff" size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={E.rowLabel}>{label}</div>
        <div style={E.rowSub}>{sub}</div>
      </div>
      <span style={E.rowChevron} aria-hidden="true">↗</span>
    </div>
  );
}

/* ─── PipelineRow ───────────────────────────────────────── */

function PipelineRow({
  name, sub, action, price, verdict, last, onTap, watched, onToggleWatch,
}: {
  name: string; sub: string;
  action: "open" | "get"; price?: string; verdict?: Verdict; last?: boolean;
  onTap: () => void;
  watched: boolean;
  onToggleWatch: () => void;
}) {
  // For "get" rows, the pill behaves like Pipeline's: "Watch" toggles the
  // user's local watchlist, "Pass" is informational (still opens detail
  // so user can read why Yulia passed).
  const isWatchPill = price === "Watch";
  const pillLabel = isWatchPill ? (watched ? "Watching" : "Watch") : price;
  const pillBg = isWatchPill
    ? (watched ? "var(--mb-accent-ink)" : "var(--mb-blue-soft)")
    : "var(--mb-card-2)";
  const pillColor = isWatchPill
    ? (watched ? "#fff" : "var(--mb-blue-ink)")
    : "var(--mb-ink-3)";
  const onPillClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatchPill) onToggleWatch();
    else onTap();
  };
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 22px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        cursor: "pointer",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={S.rowName}>{name}</span>
          {verdict && <VerdictPill kind={verdict} onLight />}
        </div>
        <div style={S.rowSub}>{sub}</div>
      </div>
      <div style={S.rowAction}>
        {action === "get" ? (
          <>
            <button
              type="button"
              aria-pressed={isWatchPill ? watched : undefined}
              style={{
                padding: "5px 18px", fontSize: 14,
                fontWeight: 700, borderRadius: 999, border: "none",
                background: pillBg, color: pillColor,
                cursor: "pointer", minWidth: 78,
                transition: "background-color 200ms ease, color 200ms ease",
              }}
              onClick={onPillClick}
            >{pillLabel}</button>
            <span style={S.rowActionMeta}>Yulia&rsquo;s call</span>
          </>
        ) : (
          <MobileIcon name="download" c="var(--mb-accent-ink)" size={26} />
        )}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  subText: {
    fontSize: 13.5, color: "var(--mb-ink-3)",
    marginTop: 4, lineHeight: 1.45,
    textWrap: "pretty",
  },
  tryNum: {
    width: 32, height: 32, borderRadius: "50%",
    background: "var(--mb-accent-ink)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--mb-font-display)", fontWeight: 700, fontSize: 15,
    flexShrink: 0,
  },
  tryTitle: {
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px",
  },
  trySub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 1,
  },
  rowName: {
    fontSize: 16, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.25px",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowSub: {
    fontSize: 13.5, color: "var(--mb-ink-3)", marginTop: 2,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowAction: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 2, flexShrink: 0,
    paddingRight: 22,
  },
  rowActionMeta: {
    fontSize: 9.5, color: "var(--mb-ink-4)",
  },
};

const H: Record<string, CSSProperties> = {
  eyebrowSlot: { position: "absolute", top: 18, left: 22 },
  /* Audience switcher anchor — top-right of the welcome hero card.
     Independent of the eyebrow's absolute slot on the left so the
     two never push each other into wrapping. zIndex sits above the
     absolutely-positioned hero stats; the popup itself portals to
     body and renders at z-index 100. */
  pillSlot: {
    position: "absolute",
    top: 14, right: 14,
    zIndex: 2,
  },
  titleBlock: { padding: "4px 22px 0" },
  h2: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 26, letterSpacing: "-0.6px",
    lineHeight: 1.1, margin: 0, color: "#fff",
    textWrap: "balance",
  },
  tag: {
    fontSize: 14, color: "#fff",
    margin: "8px 0 0", lineHeight: 1.35,
    textWrap: "pretty",
  },
  innerCell: {
    margin: "16px 14px 14px",
    padding: "10px 12px",
    display: "flex", alignItems: "center", gap: 12,
  },
  innerName: {
    fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px",
  },
  innerSub: {
    fontSize: 12, color: "#fff", marginTop: 1,
  },
  metaRow: {
    padding: "0 22px 18px",
    display: "flex", alignItems: "center", justifyContent: "flex-end",
  },
  metaText: {
    fontSize: 10.5, color: "#fff",
    letterSpacing: "0.1em", fontWeight: 600,
  },
};

/* ─── ExploreCard styles ─────────────────────────────────
   Different texture from WelcomeHero — sunrise stays warm and editorial,
   Explore uses texture-buyers.png with a cooler periwinkle wash that ties
   to the V6 mobile accent (#8A9AE8 per architecture_v6_mobile.md). */
const E: Record<string, CSSProperties> = {
  card: {
    borderRadius: 22,
    backgroundImage:
      `linear-gradient(165deg, rgba(95,115,200,0.38) 0%, rgba(50,72,160,0.70) 100%), url('${RANDOM_TEXTURES.buyers}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundBlendMode: "multiply, normal",
    color: "#fff",
    overflow: "hidden",
    boxShadow:
      "0 12px 28px -10px rgba(0,0,0,0.28)," +
      " inset 0 1px 0 rgba(255,255,255,0.22)," +
      " inset 0 -1px 0 rgba(0,0,0,0.18)",
    padding: "20px 16px 16px",
    position: "relative",
  },
  eyebrowSlot: { padding: "0 6px 4px" },
  eyebrow: {
    color: "#fff",
    fontWeight: 700,
  },
  titleBlock: { padding: "0 6px 14px" },
  h3: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 22, letterSpacing: "-0.5px",
    lineHeight: 1.12, margin: "4px 0 0", color: "#fff",
    textWrap: "balance",
  },
  tag: {
    fontSize: 13.5, color: "#fff",
    margin: "8px 0 0", lineHeight: 1.4,
    textWrap: "pretty",
  },
  rows: { display: "flex", flexDirection: "column" },
  rowGlyph: {
    width: 34, height: 34, borderRadius: 10,
    background: "rgba(255,255,255,0.16)",
    display: "grid", placeItems: "center",
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 14.5, fontWeight: 600, color: "#fff",
    letterSpacing: "-0.2px", lineHeight: 1.2,
  },
  rowSub: {
    fontSize: 12, color: "#fff",
    marginTop: 2, lineHeight: 1.35,
  },
  rowChevron: {
    fontSize: 14, color: "#fff",
    marginLeft: 4, marginRight: 2, flexShrink: 0,
  },
  /* Inline link below the rows: "Or just chat with Yulia →".
     Underplayed compared to the row buttons since the rows are the
     primary call-to-action; this is the safety-net escape hatch. */
  freeFormBtn: {
    display: "block",
    margin: "12px auto 4px",
    padding: "8px 0",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 12.5, fontWeight: 600,
    letterSpacing: "-0.05px",
    cursor: "pointer",
    fontFamily: "var(--mb-font-body)",
    opacity: 0.85,
  },
};
