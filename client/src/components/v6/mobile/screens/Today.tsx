/* V6 Mobile — Today screen.
   Anonymous: WORKING SAMPLE welcome hero + Three ways to explore guide +
              5 sample deals + Brief teaser.
   Authed: hero collapses to a daily-brief teaser; TryThisCard hides; eyebrow
           strips "WORKING SAMPLE" prefix.

   Copy resolution: desktop's longer welcome H1 + tag win where they conflict
   with CD's mobile bundle copy. Sample pipeline matches desktop's Big Fake
   Deal seed data. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { GlassTopBar, LargeTitle } from "../TopBar";
import { GlassSurface } from "../glass";
import { YIcon } from "../YIcon";
import { IndustryIcon } from "../IndustryIcon";
import { VerdictPill } from "../VerdictPill";
import { RANDOM_TEXTURES } from "../../../../lib/randomTextures";
import { authHeaders } from "../../../../hooks/useAuth";
import { MobileIcon } from "../icons";
import { LibraryActivityList, LibraryPreviewCard } from "./LibrarySearch";
import type { Verdict, YIconKind } from "../types";
import type { MobilePipelineRow } from "../../../../hooks/useMobileDeals";
import { useWatchlist } from "../../../../hooks/useWatchlist";
import { copyFor, LOGGED_OUT_HERO_COPY } from "../../../../lib/copy";
import { type Audience } from "../../../../lib/audience";

interface TodayProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onOpenLibrary: (filter?: "all" | "deals" | "actionable" | "docs" | "analysis" | "data-room" | "shared" | "secure") => void;
  onOpenLibraryDetail: (title?: string, meta?: string, kind?: string) => void;
  onChat: () => void;
  onSearch?: () => void;
  onAskYulia: (prompt: string) => void;
  onLearn: (section: "how" | "pricing", anchor?: string) => void;
  /** Opens the Analyses launcher (run valuation/QoE/LBO/etc.). */
  onOpenAnalyses: () => void;
  /** Opens the full "All deals" list (See all from the pipeline preview). */
  onOpenDealsList: () => void;
  onAvatarClick: () => void;
  /** Opens the notifications sheet + unread badge count. Omitted → no bell. */
  onNotif?: () => void;
  notifCount?: number;
  /** Authed user's deals (from useMobileDeals). Null = anon or empty,
      in which case the hardcoded SAMPLE_PIPELINE renders instead. */
  userPipeline: MobilePipelineRow[] | null;
  /** True ONLY when a genuinely signed-in user has zero deals. When set,
      the pipeline section renders an honest empty state instead of
      falling back to SAMPLE_PIPELINE. Anon/dev preview passes false so
      samples keep showing via the userPipeline ?? SAMPLE_PIPELINE path. */
  realEmpty?: boolean;
  /** Current audience (drives copy + tip chips). */
  audience: Audience;
  /** Update audience (used by the inline switcher pill). */
  onAudienceChange: (a: Audience) => void;
  /** Whether to show the audience switcher pill at the top of the
      Explore card. False for authed users (their audience is captured
      server-side, not toggled). */
  showAudienceSwitcher: boolean;
}

interface TodayPipelineRow {
  id: string;
  icon: YIconKind;
  name: string;
  sub: string;
  action: "open" | "get";
  verdict?: Verdict;
  price?: string;
}

interface PortfolioMarketIntelligence {
  eyebrow: string;
  headline: string;
  subhead: string;
  bullets: string[];
  sourceCount: number;
  confidence: string;
}

interface PortfolioBrief {
  marketIntelligence?: PortfolioMarketIntelligence;
}

const SAMPLE_PIPELINE: TodayPipelineRow[] = [
  { id: "deal-bigfake",    icon: "cool",    name: "Big Fake Deal · sample",     sub: "$1.80M SDE · honest capex story",      action: "open", verdict: "pursue" },
  { id: "deal-pest",       icon: "cool",    name: "Pest Control · FL",          sub: "92% on monthly contracts",             action: "open", verdict: "pursue" },
  { id: "deal-electrical", icon: "default", name: "Electrical · TX",            sub: "Margins good · concentration risk",    action: "get",  price: "Watch" },
  { id: "deal-hvac",       icon: "default", name: "HVAC platform · CO",         sub: "Family business · clean financials",   action: "get",  price: "Watch" },
  { id: "deal-dist",       icon: "default", name: "Distribution · OH",          sub: "Asking high · margins thin",           action: "get",  price: "Pass" },
];

const SAMPLE_MARKET_INTEL: PortfolioMarketIntelligence = {
  eyebrow: "MARKET INTELLIGENCE",
  headline: "Big Fake Deal is being read against industrial services buyers, financing appetite, and diligence gaps.",
  subhead: "Yulia is watching whether recurring revenue and customer concentration still support the pursue call.",
  bullets: [
    "Buyer universe: strategic roll-ups and founder-friendly sponsors fit better than broad auctions.",
    "Structure watch: working-cap target, add-backs, and seller-note language need counsel/CPA review before signature.",
    "Source gap: ask for customer cohort detail before the next buyer touch.",
  ],
  sourceCount: 6,
  confidence: "Sample read",
};

export function TodayScreen({
  isAnon, initials, onOpenDeal, onOpenLibrary, onOpenLibraryDetail, onChat, onSearch, onAskYulia, onLearn: _onLearn, onOpenAnalyses, onOpenDealsList,
  onAvatarClick, onNotif, notifCount, userPipeline, realEmpty,
  audience,
}: TodayProps) {
  // realEmpty = a real signed-in user with zero deals. In that case we do
  // NOT fall back to SAMPLE_PIPELINE — we render an honest empty state so
  // we never show a real user fake deals. Anon/dev preview leaves realEmpty
  // false, so the userPipeline ?? SAMPLE_PIPELINE fallback still shows
  // samples.
  const PIPELINE: TodayPipelineRow[] = userPipeline ?? SAMPLE_PIPELINE;
  const { isWatched, toggle } = useWatchlist();
  const C = copyFor(audience);
  const [brief, setBrief] = useState<PortfolioBrief | null>(null);

  useEffect(() => {
    if (isAnon) {
      setBrief(null);
      return;
    }
    let cancelled = false;
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`brief ${res.status}`)))
      .then((nextBrief: PortfolioBrief) => {
        if (!cancelled) setBrief(nextBrief);
      })
      .catch(() => {
        if (!cancelled) setBrief(null);
      });
    return () => { cancelled = true; };
  }, [isAnon]);

  const marketIntel = brief?.marketIntelligence ?? SAMPLE_MARKET_INTEL;
  const marketPrompt = "Show me the market intelligence behind the deal of the day. Include buyer universe, financing climate, tax/legal structure issues, and source gaps.";

  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 90 }}>
      <GlassTopBar title="Today" initials={initials} onAvatarClick={onAvatarClick} onSearch={onSearch ?? onChat} onNotif={onNotif} notifCount={notifCount} />
      <LargeTitle>Today</LargeTitle>

      {/* Hero — anon = welcome, authed = today's brief teaser. */}
      <div style={{ padding: "4px 16px 0" }}>
        {isAnon ? (
          <WelcomeHero
            onChat={onChat}
            heroTag={C.todayHeroTag}
          />
        ) : (
          <DailyHero onOpenDeal={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")} />
        )}
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        <MarketIntelCard
          intel={marketIntel}
          onAskYulia={onAskYulia}
          fullPrompt={marketPrompt}
        />
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

      {/* Library — quick routes + docs that need attention. Brief moved
          to Pipeline so Today can point straight at the workbench. */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <LibraryPreviewCard onOpenFinder={onOpenLibrary} />
      </div>

      {/* Analyses launcher — the discoverable, top-level way to run a model
          (valuation, QoE, LBO, working capital…). Opens the Analyses hub. */}
      <div style={{ marginTop: 14, padding: "0 16px" }}>
        <button
          type="button"
          onClick={onOpenAnalyses}
          aria-label="Open analyses"
          style={{
            display: "flex", alignItems: "center", gap: 13, width: "100%",
            padding: "15px 16px", background: "#fff", borderRadius: 16,
            border: "0.5px solid var(--mb-line-2)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            cursor: "pointer", textAlign: "left",
          }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--mb-accent-soft)" }}>
            <MobileIcon name="brief" c="var(--mb-accent-ink)" size={18} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: 15.5, color: "var(--mb-ink)", fontFamily: "var(--mb-font-display)" }}>Analyses</span>
            <span style={{ display: "block", fontSize: 12.5, color: "var(--mb-ink-3)", marginTop: 1 }}>Valuation, QoE, LBO, working capital &amp; more</span>
          </span>
          <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "var(--mb-ink-4)" }} aria-hidden="true">
            <MobileIcon name="back" size={12} c="var(--mb-ink-4)" />
          </span>
        </button>
      </div>
      <div style={{ marginTop: 14, padding: "0 16px" }}>
        <LibraryActivityList onOpenDetail={onOpenLibraryDetail} limit={3} />
      </div>

      {/* Pipeline section — content per audience via copy.ts.
          realEmpty (a real signed-in user with zero deals) swaps the
          sample list for an honest empty state; never show a real user
          fake deals. */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <div className="mb-as-card" style={{ padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 4px" }}>
            <div className="mb-section-eyebrow">{C.todayIntelEyebrow}</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <div className="mb-section-title">{C.todayIntelTitle}</div>
              <button type="button" onClick={onOpenDealsList} aria-label="See all deals" style={{ all: "unset", cursor: "pointer", color: "var(--mb-accent-ink)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>See all →</button>
            </div>
            <div style={S.subText}>{C.todayIntelSub}</div>
          </div>
          {realEmpty ? (
            <PipelineEmptyState
              onSource={() => onAskYulia("Help me source and add my first deal")}
              onChat={onChat}
            />
          ) : (
            PIPELINE.map((d, i) => (
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
            ))
          )}
        </div>
      </div>

    </div>
  );
}

function MarketIntelCard({
  intel,
  onAskYulia,
  fullPrompt,
}: {
  intel: PortfolioMarketIntelligence;
  onAskYulia: (prompt: string) => void;
  fullPrompt: string;
}) {
  const bullets = intel.bullets?.length ? intel.bullets.slice(0, 3) : SAMPLE_MARKET_INTEL.bullets;
  return (
    <section
      style={MI.card}
      aria-label="Market intelligence behind today's deal"
    >
      <div style={MI.glow} aria-hidden="true" />
      <h3 style={MI.title}>{intel.headline}</h3>
      <p style={MI.sub}>{intel.subhead}</p>

      <div style={MI.rows}>
        {bullets.map((bullet, index) => (
          <MarketIntelRow
            key={bullet}
            index={index + 1}
            text={bullet}
            onTap={() => onAskYulia(`Unpack this market intelligence signal from today's deal: ${bullet}`)}
          />
        ))}
      </div>

      <TexturedActionCta
        title="Ask Yulia for the read"
        sub="Buyer universe, structure, source gaps"
        actionLabel="Ask"
        icon={<YIcon size={42} kind="pursue" />}
        onTap={() => onAskYulia(fullPrompt)}
      />
    </section>
  );
}

function MarketIntelRow({
  index,
  text,
  onTap,
}: {
  index: number;
  text: string;
  onTap: () => void;
}) {
  const [label, ...rest] = text.split(":");
  const hasLabel = rest.length > 0;
  return (
    <button type="button" className="mb-tap" style={MI.row} onClick={onTap}>
      <span style={MI.rowCount}>{index}</span>
      <span style={MI.rowText}>
        <span style={MI.rowLabel}>{hasLabel ? label : "Signal"}</span>
        <span style={MI.rowSub}>{hasLabel ? rest.join(":").trim() : text}</span>
      </span>
      <MobileIcon name="chevron" c="#fff" size={11} />
    </button>
  );
}

function TexturedActionCta({
  title,
  sub,
  actionLabel,
  icon,
  onTap,
}: {
  title: string;
  sub: string;
  actionLabel: string;
  icon: ReactNode;
  onTap: () => void;
}) {
  return (
    <GlassSurface
      tint="onColor"
      radius={16}
      role="button"
      tabIndex={0}
      className="mb-tap"
      style={CTA.cell}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
    >
      {icon}
      <span style={CTA.copy}>
        <span style={CTA.title}>{title}</span>
        <span style={CTA.sub}>{sub}</span>
      </span>
      <span style={CTA.pill}>{actionLabel}</span>
    </GlassSurface>
  );
}

/* ─── Welcome hero (anon) ────────────────────────────────── */

function WelcomeHero({
  onChat, heroTag,
}: {
  onChat: () => void;
  heroTag: string;
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
      <div style={H.titleBlock}>
        <h2 style={H.h2}>{LOGGED_OUT_HERO_COPY.headline}</h2>
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
          style={H.innerButton}
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
          style={H.innerButton}
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
// pick from the per-pool watercolor set. The logged-out Today card stays
// rose gold by overlay, but the underlying texture still rotates.
const HERO_TEXTURE: Record<HeroKind, string> = {
  pursue:  RANDOM_TEXTURES.pursue,
  watch:   RANDOM_TEXTURES.watch,
  pass:    RANDOM_TEXTURES.pass,
  welcome: RANDOM_TEXTURES.welcome,
};
const HERO_OVERLAY: Record<HeroKind, string> = {
  pursue:  "linear-gradient(165deg, rgba(63,138,106,0.30) 0%, rgba(40,92,70,0.62) 100%)",
  watch:   "linear-gradient(165deg, rgba(202,150,82,0.30) 0%, rgba(128,86,36,0.62) 100%)",
  pass:    "linear-gradient(165deg, rgba(216,139,132,0.30) 0%, rgba(140,68,60,0.62) 100%)",
  welcome:
    "linear-gradient(165deg, rgba(238,204,176,0.08) 0%, rgba(186,116,104,0.14) 52%, rgba(124,68,78,0.28) 100%), " +
    "linear-gradient(28deg, rgba(210,154,92,0.08) 0%, rgba(118,70,96,0.14) 100%)",
};

/* Verdict-tinted ambient shadows so each card "glows" its own color
   on a white page. Without these, the cards sit isolated; with them
   they feel alive and integrated. Layered with a regular dark shadow
   for the lift. */
const HERO_GLOW: Record<HeroKind, string> = {
  pursue:  "0 14px 36px -10px rgba(63,138,106,0.32)",
  watch:   "0 14px 36px -10px rgba(180,130,50,0.30)",
  pass:    "0 14px 36px -10px rgba(180,90,80,0.28)",
  welcome: "0 14px 36px -10px rgba(190,124,82,0.34)",
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
        // Multiply was darkening the watercolor's warm cream tones into a
        // muddy brown. Default normal compositing keeps the texture's true
        // hue and lets the gradient overlay tint without muddying.
        color: "#fff",
        overflow: "hidden",
        boxShadow:
          // Verdict-tinted glow — makes the card feel alive on a
          // white page (its own color radiates outward subtly).
          HERO_GLOW[kind] + "," +
          // Dark base shadow for the actual lift.
          "0 8px 20px -8px rgba(0,0,0,0.30)," +
          // Inner top highlight — sells "lit from above"
          " inset 0 1px 0 rgba(255,255,255,0.24)," +
          // Inner bottom shadow — adds depth at the cell boundary
          " inset 0 -1px 0 rgba(0,0,0,0.20)",
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
      <div style={{ position: "absolute", bottom: -80, left: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.078), transparent 60%)" }}/>
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
      <TexturedActionCta
        title="Chat with Yulia"
        sub="Ask anything else"
        actionLabel="Start"
        icon={<YIcon size={42} kind="pursue" />}
        onTap={onChat}
      />
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
        background: "transparent",
        border: "none",
        borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.14)",
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
      <MobileIcon name="chevron" c="#fff" size={11} />
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
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 22px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        cursor: "pointer",
      }}
    >
      <IndustryIcon name={name} verdict={verdict ?? "watch"} size={40} />
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
          </>
        ) : (
          <MobileIcon name="download" c="var(--mb-accent-ink)" size={26} />
        )}
      </div>
    </div>
  );
}

/* ─── PipelineEmptyState ─────────────────────────────────
   Shown to a genuinely signed-in user with zero deals (realEmpty).
   Honest: no fake rows. Sits inside the same mb-as-card shell the
   pipeline list normally fills, so it inherits the screen's glass card
   styling. Primary action routes to Yulia sourcing; secondary opens
   plain chat. */

function PipelineEmptyState({
  onSource, onChat,
}: {
  onSource: () => void;
  onChat: () => void;
}) {
  return (
    <div style={S.emptyWrap}>
      <div style={S.emptyHeading}>Your pipeline is empty</div>
      <div style={S.emptySub}>
        Add a deal you&rsquo;re evaluating, or let Yulia source targets &mdash;
        your live pipeline shows up here.
      </div>
      <button
        type="button"
        className="mb-tap"
        style={S.emptyCta}
        onClick={onSource}
      >Source your first deal</button>
      <button
        type="button"
        className="mb-tap"
        style={S.emptyChat}
        onClick={onChat}
      >Ask Yulia</button>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  subText: {
    fontSize: 13.5, color: "var(--mb-ink-3)",
    marginTop: 4, lineHeight: 1.45,
    textWrap: "pretty",
  },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    padding: "16px 22px 18px",
  },
  emptyHeading: {
    fontFamily: "var(--mb-font-display)",
    fontSize: 18, fontWeight: 700,
    color: "var(--mb-ink)",
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  },
  emptySub: {
    fontSize: 13.5, color: "var(--mb-ink-3)",
    lineHeight: 1.45, textWrap: "pretty",
    maxWidth: 340,
  },
  emptyCta: {
    marginTop: 4,
    minHeight: 40,
    border: "none",
    borderRadius: 999,
    padding: "9px 20px",
    background: "linear-gradient(180deg, var(--mb-accent), var(--mb-accent-2))",
    color: "var(--mb-accent-ink)",
    fontSize: 14, fontWeight: 750,
    letterSpacing: "-0.1px",
    cursor: "pointer",
    boxShadow: "0 8px 20px -10px rgba(16,224,96,0.55)",
  },
  emptyChat: {
    border: "none",
    background: "transparent",
    padding: "2px 0",
    color: "var(--mb-accent-ink)",
    fontSize: 13.5, fontWeight: 650,
    cursor: "pointer",
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
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.14), transparent 42%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.34)",
    boxShadow:
      "0 10px 26px -18px rgba(0,0,0,0.44), " +
      "inset 0 1px 0 rgba(255,255,255,0.34), " +
      "inset 0 -1px 0 rgba(255,255,255,0.05)",
  },
  innerName: {
    fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px",
  },
  innerSub: {
    fontSize: 12, color: "#fff", marginTop: 1,
  },
  innerButton: {
    flexShrink: 0,
    minHeight: 34,
    minWidth: 62,
    border: "none",
    borderRadius: 999,
    padding: "6px 14px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.078), rgba(255,255,255,0.02))",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "-0.08px",
    cursor: "pointer",
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

const CTA: Record<string, CSSProperties> = {
  cell: {
    margin: "13px 0 0",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background:
      "radial-gradient(circle at 18% 0%, rgba(255,255,255,0.14), transparent 42%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.038), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.34)",
    boxShadow:
      "0 10px 26px -18px rgba(0,0,0,0.44), " +
      "inset 0 1px 0 rgba(255,255,255,0.34), " +
      "inset 0 -1px 0 rgba(255,255,255,0.05)",
    cursor: "pointer",
    color: "#fff",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 750,
    color: "#fff",
    letterSpacing: "-0.22px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  sub: {
    fontSize: 12,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  pill: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    minWidth: 62,
    borderRadius: 999,
    padding: "6px 14px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.078), rgba(255,255,255,0.02))",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "-0.08px",
  },
};

const MI: Record<string, CSSProperties> = {
  card: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 22,
    padding: "20px 16px 16px",
    backgroundImage:
      `linear-gradient(165deg, rgba(24,58,76,0.26) 0%, rgba(42,88,110,0.40) 52%, rgba(16,36,62,0.56) 100%), url('${RANDOM_TEXTURES.market}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    color: "#F8FBFF",
    boxShadow:
      "0 16px 38px -14px rgba(24,72,105,0.48)," +
      "0 8px 22px -12px rgba(0,0,0,0.30)," +
      " inset 0 1px 0 rgba(255,255,255,0.22)",
    overflow: "hidden",
    textAlign: "left",
    position: "relative",
  },
  glow: {
    position: "absolute",
    top: -78,
    right: -44,
    width: 230,
    height: 230,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.24), transparent 64%)",
  },
  topRow: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  eyebrow: {
    color: "#DCEFE9",
    fontWeight: 800,
  },
  title: {
    position: "relative",
    margin: 0,
    fontFamily: "var(--mb-font-display)",
    fontSize: 24,
    lineHeight: 1.08,
    letterSpacing: "-0.65px",
    fontWeight: 800,
    color: "#FFFFFF",
    textWrap: "balance",
  },
  sub: {
    position: "relative",
    margin: "9px 0 0",
    color: "#ECF3FF",
    fontSize: 13.5,
    lineHeight: 1.42,
    textWrap: "pretty",
  },
  rows: {
    position: "relative",
    margin: "16px 0 0",
    borderRadius: 16,
    overflow: "hidden",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.095), transparent 40%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.32)",
    boxShadow:
      "0 12px 28px -20px rgba(0,0,0,0.46), " +
      "inset 0 1px 0 rgba(255,255,255,0.30), " +
      "inset 0 -1px 0 rgba(255,255,255,0.04)",
  },
  row: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    color: "#FFFFFF",
    textAlign: "left",
    cursor: "pointer",
  },
  rowCount: {
    width: 30,
    height: 30,
    borderRadius: 10,
    background: "linear-gradient(180deg, rgba(255,255,255,0.066), rgba(255,255,255,0.018))",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--mb-font-mono)",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    display: "block",
    fontSize: 14.5,
    fontWeight: 750,
    letterSpacing: "-0.2px",
    lineHeight: 1.2,
  },
  rowSub: {
    display: "block",
    fontSize: 12.5,
    color: "#fff",
    marginTop: 2,
    lineHeight: 1.3,
  },
};

/* ─── ExploreCard styles ─────────────────────────────────
   Different texture from WelcomeHero — sunrise stays warm and editorial,
   Explore uses texture-buyers.png with a cooler periwinkle wash that ties
   to the V6 mobile accent (#8A9AE8 per architecture_v6_mobile.md). */
const E: Record<string, CSSProperties> = {
  card: {
    borderRadius: 22,
    /* Overlay reverted 2026-05-05 (eve) — multiply + heavy stops were
       muddying the periwinkle into brown-ish purple. Back to lighter
       stops with normal compositing; the verdict-tinted glow below
       carries the depth without darkening the texture's true color. */
    backgroundImage:
      `linear-gradient(165deg, rgba(95,115,200,0.22) 0%, rgba(50,72,160,0.44) 100%), url('${RANDOM_TEXTURES.explore}')`,
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    color: "#fff",
    overflow: "hidden",
    boxShadow:
      // Periwinkle-tinted ambient glow — the card "radiates" its
      // accent color outward, integrating with the page like the
      // hero cards now do.
      "0 14px 36px -10px rgba(95,115,200,0.32)," +
      "0 8px 20px -8px rgba(0,0,0,0.26)," +
      " inset 0 1px 0 rgba(255,255,255,0.24)," +
      " inset 0 -1px 0 rgba(0,0,0,0.20)",
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
  rows: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.095), transparent 40%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.003))",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    border: "0.5px solid rgba(255,255,255,0.32)",
    boxShadow:
      "0 12px 28px -20px rgba(0,0,0,0.46), " +
      "inset 0 1px 0 rgba(255,255,255,0.30), " +
      "inset 0 -1px 0 rgba(255,255,255,0.04)",
  },
  rowGlyph: {
    width: 34, height: 34, borderRadius: 10,
    background: "linear-gradient(180deg, rgba(255,255,255,0.066), rgba(255,255,255,0.018))",
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
};
