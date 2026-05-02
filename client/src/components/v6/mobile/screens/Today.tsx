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
import { MobileIcon } from "../icons";
import type { Verdict, YIconKind } from "../types";

interface TodayProps {
  isAnon: boolean;
  initials: string;
  onOpenDeal: (id: string, title: string) => void;
  onChat: () => void;
  onAvatarClick: () => void;
}

const PIPELINE = [
  { id: "deal-bigfake",    icon: "cool"    as YIconKind, name: "Big Fake Deal · sample",     sub: "$1.80M SDE · honest capex story",      action: "open" as const, verdict: "pursue" as Verdict },
  { id: "deal-pest",       icon: "cool"    as YIconKind, name: "Pest Control · FL",          sub: "92% on monthly contracts",             action: "open" as const, verdict: "pursue" as Verdict },
  { id: "deal-electrical", icon: "default" as YIconKind, name: "Electrical · TX",            sub: "Margins good · concentration risk",    action: "get"  as const, price: "Watch" },
  { id: "deal-hvac",       icon: "default" as YIconKind, name: "HVAC platform · CO",         sub: "Family business · clean financials",   action: "get"  as const, price: "Watch" },
  { id: "deal-dist",       icon: "default" as YIconKind, name: "Distribution · OH",          sub: "Asking high · margins thin",           action: "get"  as const, price: "Pass" },
];

export function TodayScreen({ isAnon, initials, onOpenDeal, onChat, onAvatarClick }: TodayProps) {
  return (
    <div className="mb-fade-up" style={{ minHeight: "100vh", paddingBottom: 140 }}>
      <GlassTopBar title="Today" initials={initials} onAvatarClick={onAvatarClick} />
      <LargeTitle>Today</LargeTitle>

      {/* Hero — anon = welcome, authed = today's brief teaser */}
      <div style={{ padding: "4px 16px 0" }}>
        {isAnon ? (
          <WelcomeHero onChat={onChat} />
        ) : (
          <DailyHero onOpenDeal={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")} />
        )}
      </div>

      {/* Try this guide — anon only */}
      {isAnon && (
        <div style={{ padding: "14px 16px 0" }}>
          <TryThisCard onChat={onChat} onOpenDeal={() => onOpenDeal("deal-bigfake", "Big Fake Deal · sample")} />
        </div>
      )}

      {/* Pipeline section — 5 sample deals */}
      <div style={{ marginTop: 24, padding: "0 16px" }}>
        <div className="mb-as-card" style={{ padding: "20px 0 6px" }}>
          <div style={{ padding: "0 22px 4px" }}>
            <div className="mb-section-eyebrow">{isAnon ? "VIEW SAMPLE · IN PIPELINE" : "PIPELINE · IN REVIEW"}</div>
            <div className="mb-section-title">5 deals Yulia is working</div>
            <div style={S.subText}>Tap any to see what Yulia delivered &mdash; verdict, recast, drafts.</div>
          </div>
          {PIPELINE.map((d, i) => (
            <PipelineRow
              key={d.id}
              icon={d.icon}
              name={d.name}
              sub={d.sub}
              action={d.action}
              price={d.action === "get" ? d.price : undefined}
              verdict={"verdict" in d ? d.verdict : undefined}
              last={i === PIPELINE.length - 1}
              onTap={() => onOpenDeal(d.id, d.name)}
            />
          ))}
        </div>
      </div>

      {/* Brief teaser */}
      <div style={{ padding: "16px 22px 4px" }}>
        <div className="mb-section-eyebrow">{isAnon ? "VIEW SAMPLE · YULIA'S BRIEF" : "YULIA'S BRIEF"}</div>
        <div className="mb-section-title">3 picks worth your 10 minutes</div>
        <div style={S.subText}>
          See how Yulia screens 142 sources down to what matters &mdash; every morning.
        </div>
      </div>
    </div>
  );
}

/* ─── Welcome hero (anon) ────────────────────────────────── */

function WelcomeHero({ onChat }: { onChat: () => void }) {
  return (
    <HeroFrame kind="pursue" onTap={onChat}>
      <HeroVisualPursue />

      <div style={H.eyebrowSlot}>
        <div className="mb-eyebrow">WELCOME TO SMBX · WORKING SAMPLE</div>
      </div>

      <div style={H.titleBlock}>
        <h2 style={H.h2}>Agentic AI specifically built for buying and selling businesses of all shapes and sizes.</h2>
        <p style={H.tag}>Yulia does all of the hard work &mdash; so your deal team can focus on building relationships and making deals better and faster.</p>
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

const HERO_GRADIENTS: Record<Verdict, [string, string]> = {
  pursue: ["#A8D4BD", "#5FA88A"],
  watch:  ["#EBC891", "#C99959"],
  pass:   ["#EBB1AA", "#C6857D"],
};

function HeroFrame({
  kind, onTap, children,
}: { kind: Verdict; onTap?: () => void; children: ReactNode }) {
  const [c1, c2] = HERO_GRADIENTS[kind];
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
        background: `linear-gradient(165deg, ${c1} 0%, ${c2} 100%)`,
        color: "#fff",
        overflow: "hidden",
        boxShadow: "0 12px 28px -10px rgba(0,0,0,0.25)",
        position: "relative",
        cursor: onTap ? "pointer" : "default",
      }}
    >{children}</div>
  );
}

function HeroVisualPursue() {
  return (
    <div style={{ position: "relative", height: 280, overflow: "hidden" }} aria-hidden="true">
      <div style={{ position: "absolute", top: -60, right: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.22), transparent 60%)" }}/>
      <div style={{ position: "absolute", bottom: -80, left: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%)" }}/>
      <svg viewBox="0 0 360 280" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="mb-spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <path d="M0 220 L40 210 L80 200 L120 180 L160 168 L200 140 L240 110 L280 90 L320 70 L360 50 L360 280 L0 280 Z" fill="url(#mb-spark-fill)"/>
        <path d="M0 220 L40 210 L80 200 L120 180 L160 168 L200 140 L240 110 L280 90 L320 70 L360 50" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      </svg>
      <div style={{ position: "absolute", bottom: 18, right: 22, textAlign: "right" }}>
        <div className="mb-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 0.1 }}>SDE</div>
        <div style={{ fontFamily: "var(--mb-font-display)", fontWeight: 800, fontSize: 56, letterSpacing: -2, lineHeight: 1, color: "#fff" }}>$1.80M</div>
        <div className="mb-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>+$760K NORMALIZED</div>
      </div>
    </div>
  );
}

/* ─── TryThisCard ───────────────────────────────────────── */

function TryThisCard({ onChat, onOpenDeal }: { onChat: () => void; onOpenDeal: () => void }) {
  return (
    <div className="mb-as-card" style={{ padding: "18px 0 6px", overflow: "hidden" }}>
      <div style={{ padding: "0 22px 12px" }}>
        <div className="mb-section-eyebrow">TRY THIS</div>
        <div className="mb-section-title">Three ways to explore</div>
        <div style={S.subText}>You&rsquo;re inside a working sample of the app. Pick any path &mdash; no signup.</div>
      </div>
      <TryRow n={1} title="Open a sample deal"   sub="See Yulia's verdict, recast P&L, drafts" cta="View" onTap={onOpenDeal} />
      <TryRow n={2} title="Chat with Yulia"      sub={"“What’s worth my time today?” · ask anything"} cta="Chat" onTap={onChat} />
      <TryRow n={3} title="Read the brief"       sub="Today's 3 picks · 10 min read"           cta="Read" onTap={onOpenDeal} last />
    </div>
  );
}

function TryRow({ n, title, sub, cta, onTap, last }: {
  n: number; title: string; sub: string; cta: string; onTap: () => void; last?: boolean;
}) {
  return (
    <div
      className="mb-tap"
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } }}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 22px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        marginLeft: 22, paddingLeft: 0,
        cursor: "pointer",
      }}
    >
      <div style={S.tryNum}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.tryTitle}>{title}</div>
        <div style={S.trySub}>{sub}</div>
      </div>
      <button
        type="button"
        className="mb-get-pill"
        style={{ padding: "5px 16px", fontSize: 13, marginRight: 22, flexShrink: 0 }}
        onClick={(e) => { e.stopPropagation(); onTap(); }}
      >{cta}</button>
    </div>
  );
}

/* ─── PipelineRow ───────────────────────────────────────── */

function PipelineRow({
  icon, name, sub, action, price, verdict, last, onTap,
}: {
  icon: YIconKind; name: string; sub: string;
  action: "open" | "get"; price?: string; verdict?: Verdict; last?: boolean;
  onTap: () => void;
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
        padding: "10px 22px",
        borderBottom: last ? "none" : "0.5px solid var(--mb-line-2)",
        marginLeft: 22, paddingLeft: 0,
        cursor: "pointer",
      }}
    >
      <YIcon size={48} kind={icon} radius={11} />
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
              className="mb-get-pill"
              style={{ padding: "5px 18px", fontSize: 14 }}
              onClick={(e) => { e.stopPropagation(); onTap(); }}
            >{price}</button>
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
    fontSize: 15, fontWeight: 600, color: "var(--mb-ink)",
    letterSpacing: "-0.2px",
  },
  rowSub: {
    fontSize: 13, color: "var(--mb-ink-3)", marginTop: 1,
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
  titleBlock: { padding: "4px 22px 0" },
  h2: {
    fontFamily: "var(--mb-font-display)", fontWeight: 800,
    fontSize: 26, letterSpacing: "-0.6px",
    lineHeight: 1.1, margin: 0, color: "#fff",
    textWrap: "balance",
  },
  tag: {
    fontSize: 14, color: "rgba(255,255,255,0.85)",
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
    fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 1,
  },
  metaRow: {
    padding: "0 22px 18px",
    display: "flex", alignItems: "center", justifyContent: "flex-end",
  },
  metaText: {
    fontSize: 10.5, color: "rgba(255,255,255,0.75)",
    letterSpacing: "0.1em", fontWeight: 600,
  },
};
