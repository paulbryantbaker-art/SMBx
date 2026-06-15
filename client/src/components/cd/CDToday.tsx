/**
 * CDToday — the Claude Design "Ultra Modern Fintech" Today page, ported into
 * the real app and wired to LIVE data. Mounts under `.cd-root` (cdTokens.css).
 *
 * This is MIG-4's first visible slice: the editorial header, Yulia's morning
 * briefing, the per-deal INTELLIGENCE READS (the core), and the supporting
 * cast — all on real hooks. The per-deal read is composed client-side here as
 * an interim until the dedicated synthesis endpoint (MIG-3) lands; every value
 * is real or honestly "—" (zero-hallucination).
 *
 * Self-contained on purpose (atoms + charts inline) so it compiles as one unit;
 * the shared kit (MIG-7) factors these out later. CSS vars are the `--cd-*`
 * namespace; never the live `--ink/--surface/--accent`.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { authHeaders, type User } from "../../hooks/useAuth";
import { useV6WorkspaceData, type WorkspaceDeal } from "../../hooks/useV6WorkspaceData";
import { useTodayOperatingBrief, type TodayGateCountdownItem } from "../../hooks/useTodayOperatingBrief";
import { usePortfolioSummary } from "../../hooks/usePortfolioSummary";
import { realBlockers } from "../v6/shared/operatingPrimitives";

/* ─── icons (CD geometric line set) ─────────────────────────── */
const ICONS: Record<string, string> = {
  sparkle: "M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6z",
  check: "M5 12l5 5L20 6",
  chevright: "M9 6l6 6-6 6",
  analysis: "M4 19V5m0 14h16M8 15l3-4 3 2 4-6",
  model: "M4 5h16v14H4zM4 10h16M9 10v9",
  data: "M5 5h14v4H5zM5 11h14v4H5zM5 17h9",
  filter: "M4 5h16l-6 7v6l-4 2v-8z",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
};
function Icon({ name, size = 18, sw = 1.7, color = "currentColor", style }: { name: string; size?: number; sw?: number; color?: string; style?: CSSProperties }) {
  const fill = name === "sparkle" || name === "bolt";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0, ...style }}>
      <path d={ICONS[name]} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={fill ? color : "none"} fillOpacity={fill ? 0.14 : 0} />
    </svg>
  );
}

/* ─── atoms (token-translated to --cd-*) ────────────────────── */
type Tone = "neutral" | "accent" | "pos" | "neg" | "warn";
const PILL: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--cd-surface-3)", fg: "var(--cd-ink-2)" },
  accent: { bg: "var(--cd-accent-soft)", fg: "var(--cd-accent-strong)" },
  pos: { bg: "var(--cd-pos-soft)", fg: "var(--cd-pos)" },
  neg: { bg: "var(--cd-neg-soft)", fg: "var(--cd-neg)" },
  warn: { bg: "var(--cd-warn-soft)", fg: "oklch(0.5 0.13 75)" },
};
function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const c = PILL[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}
function Card({ children, style, pad = true }: { children: ReactNode; style?: CSSProperties; pad?: boolean }) {
  return <div style={{ background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-md)", padding: pad ? "var(--cd-pad)" : 0, ...style }}>{children}</div>;
}
function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{children}</h3>{action}</div>;
}
function LeagueBadge({ league }: { league: number }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", borderRadius: 999, background: "var(--cd-ink)", color: "white", fontFamily: "var(--cd-mono)", fontSize: 10, fontWeight: 600 }}><span style={{ fontWeight: 700 }}>L{league}</span></span>;
}
function DirGlyph({ dir, size = 13 }: { dir: string; size?: number }) {
  const map: Record<string, { g: string; c: string }> = { expanding: { g: "↗", c: "var(--cd-pos)" }, stable: { g: "→", c: "var(--cd-ink-3)" }, contracting: { g: "↘", c: "var(--cd-neg)" } };
  const m = map[dir] || map.stable;
  return <span className="cd-num" style={{ color: m.c, fontSize: size, fontWeight: 700 }}>{m.g}</span>;
}
function HeatBar({ heat }: { heat: number }) {
  return <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(i => {
    const on = i <= heat;
    const col = heat >= 5 ? "var(--cd-pos)" : heat >= 4 ? "var(--cd-warn)" : heat >= 3 ? "var(--cd-accent)" : "var(--cd-ink-4)";
    return <span key={i} style={{ width: 14, height: 5, borderRadius: 2, background: on ? col : "var(--cd-surface-3)" }} />;
  })}</div>;
}
function MethodPill({ label, done }: { label: string; done?: boolean }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 8, fontSize: 11.5, fontWeight: 600, background: done ? "var(--cd-pos-soft)" : "var(--cd-surface-2)", color: done ? "var(--cd-pos)" : "var(--cd-ink-3)", border: done ? "none" : "1px dashed var(--cd-line-2)" }}>
    {done ? <Icon name="check" size={11} color="var(--cd-pos)" sw={2.6} /> : <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid var(--cd-ink-4)" }} />}{label}
  </span>;
}

/* ─── charts (SVG, --cd- themed) ────────────────────────────── */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}
function Donut({ data, size = 120, thickness = 16 }: { data: { value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, gap = 0.012;
  let a = -Math.PI / 2;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>{data.map((d, i) => {
    const frac = d.value / total, a0 = a + gap * Math.PI, a1 = a + frac * 2 * Math.PI - gap * Math.PI; a += frac * 2 * Math.PI;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return <path key={i} d={`M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`} fill="none" style={{ stroke: d.color }} strokeWidth={thickness} strokeLinecap="round" />;
  })}</svg>;
}

/* ─── the per-deal intelligence read (the core) ─────────────── */
interface ReadVM {
  deal: WorkspaceDeal;
  color: string;
  league: number;
  journey: string;
  gate: string;
  gateName: string;
  done: string[];
  needed: string[];
  readiness: number | null; // real DEFINITIVE score (or done-ratio when analyses exist); null = no honest signal yet
  market: { heat: number; label: string; dir: string; implication: string; sub: string } | null;
  move: { action: string; why: string } | null;
}
const JOURNEY_TONE: Record<string, Tone> = { BUY: "accent", SELL: "pos", RAISE: "warn", PMI: "neutral" };

function IntelRead({ vm, onAsk, onOpen }: { vm: ReadVM; onAsk: () => void; onOpen: () => void }) {
  const r = vm.readiness;
  const known = r != null;
  // Visual fill: the real score when known, else honest progress through completed gate items (0 when none done).
  const barPct = r != null ? r : (vm.done.length + vm.needed.length > 0 ? Math.round((vm.done.length / (vm.done.length + vm.needed.length)) * 100) : 0);
  const rTone = r == null
    ? (vm.needed.length === 0 ? "var(--cd-pos)" : "var(--cd-warn)")
    : r >= 80 ? "var(--cd-pos)" : r >= 55 ? "var(--cd-accent)" : "var(--cd-warn)";
  return (
    <div style={{ background: "var(--cd-surface)", border: "1px solid var(--cd-line)", borderRadius: "var(--cd-r-lg)", boxShadow: "var(--cd-shadow-md)", overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 22px", borderBottom: "1px solid var(--cd-line)", background: `linear-gradient(100deg, color-mix(in oklch, ${vm.color}, transparent 92%), var(--cd-surface) 60%)` }}>
        <span style={{ width: 10, height: 38, borderRadius: 3, background: vm.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <button onClick={onOpen} style={{ margin: 0, padding: 0, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--cd-sans)", fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--cd-ink)", whiteSpace: "nowrap" }}>{vm.deal.business_name || `Deal #${vm.deal.id}`}</button>
            <LeagueBadge league={vm.league} />
            <Pill tone={JOURNEY_TONE[vm.journey] || "neutral"}>{vm.journey}</Pill>
            <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>·</span>
            <span style={{ fontSize: 12.5, color: "var(--cd-ink-2)", fontWeight: 600 }}>{(vm.deal.industry || "").split(" ")[0] || "—"}</span>
            <span className="cd-num" style={{ fontSize: 11.5, color: "var(--cd-ink-3)", background: "var(--cd-surface-2)", border: "1px solid var(--cd-line)", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>{vm.gate}{vm.gateName ? ` · ${vm.gateName}` : ""}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--cd-ink-3)", marginTop: 4 }}>{[vm.deal.location, vm.deal.asking_price ? `EV ${fmtCents(vm.deal.asking_price)}` : null].filter(Boolean).join(" · ")}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="cd-num" style={{ fontSize: 24, fontWeight: 700, color: rTone, lineHeight: 1 }}>{known ? `${r}%` : vm.needed.length}</div>
          <div className="cd-eyebrow" style={{ fontSize: 9 }}>{known ? "Readiness" : vm.needed.length === 1 ? "Open item" : "Open items"}</div>
        </div>
      </div>
      {/* body — two reads */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ padding: "16px 22px", borderRight: "1px solid var(--cd-line)" }}>
          <div className="cd-eyebrow" style={{ marginBottom: 11 }}>Where you stand</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 11 }}>
            {vm.done.map((m, i) => <MethodPill key={"d" + i} label={m} done />)}
            {vm.needed.map((m, i) => <MethodPill key={"n" + i} label={m} />)}
            {vm.done.length === 0 && vm.needed.length === 0 && <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>Clear to advance</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--cd-surface-3)", overflow: "hidden" }}>
              <div style={{ width: barPct + "%", height: "100%", background: rTone, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--cd-ink-3)" }}>
              {known
                ? <><span className="cd-num" style={{ fontWeight: 700, color: "var(--cd-ink-2)" }}>{vm.needed.length}</span> to gate</>
                : <>→ {vm.gateName || vm.gate}</>}
            </span>
          </div>
        </div>
        <div style={{ padding: "16px 22px" }}>
          <div className="cd-eyebrow" style={{ marginBottom: 11 }}>Market read</div>
          {vm.market ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <HeatBar heat={vm.market.heat} />
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{vm.market.label}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--cd-ink-2)" }}><DirGlyph dir={vm.market.dir} />{vm.market.dir}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--cd-ink-2)" }}>{vm.market.implication}</p>
              {vm.market.sub && <div className="cd-num" style={{ fontSize: 10.5, color: "var(--cd-ink-4)", marginTop: 9 }}>{vm.market.sub}</div>}
            </>
          ) : <p style={{ margin: 0, fontSize: 12.5, color: "var(--cd-ink-3)" }}>Add an industry to compute the market read.</p>}
        </div>
      </div>
      {/* your move */}
      {vm.move && (
        <div style={{ display: "flex", alignItems: "center", gap: 15, padding: "15px 22px", borderTop: "1px solid var(--cd-line)", background: "var(--cd-accent-soft)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--cd-accent)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="bolt" size={16} color="white" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cd-eyebrow" style={{ color: "var(--cd-accent-strong)", marginBottom: 4 }}>Your move</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cd-ink)" }}>{vm.move.action}</div>
            <div style={{ fontSize: 12, color: "var(--cd-ink-2)", marginTop: 3, lineHeight: 1.45 }}>{vm.move.why}</div>
          </div>
          <button onClick={onAsk} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--cd-surface)", color: "var(--cd-ink-2)", border: "1px solid var(--cd-line-2)", borderRadius: "var(--cd-r-md)", padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--cd-sans)", flexShrink: 0 }}><Icon name="sparkle" size={14} color="var(--cd-accent)" />Ask Yulia</button>
        </div>
      )}
    </div>
  );
}

const DEAL_COLORS = ["#3b6fe0", "#2f9e6f", "#1aa8c4", "#d99a2b", "#b65cc4", "#cf5b3e"];

/* ─── the page ──────────────────────────────────────────────── */
interface MarketHeat { industry: string; score: number; label: string; peActivity: string; multipleDirection: string; signals: string[] }

export function CDToday({ user, onAsk, onOpenDeal }: { user: User | null; onAsk?: (p: string) => void; onOpenDeal?: (id: number, title: string) => void }) {
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const { summary } = usePortfolioSummary(user, !!user);
  const ob = operating.brief;
  const [heat, setHeat] = useState<Record<string, MarketHeat>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/intelligence/portfolio-heat", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error()))
      .then((d: { heat?: MarketHeat[] }) => { if (!cancelled) { const m: Record<string, MarketHeat> = {}; for (const h of d.heat ?? []) m[h.industry.toLowerCase().trim()] = h; setHeat(m); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const active = useMemo(() => workspace.deals.filter(d => (d.status || "").toLowerCase() === "active"), [workspace.deals]);
  const gateById = useMemo(() => {
    const m = new Map<string, TodayGateCountdownItem>();
    for (const g of ob?.gateCountdown ?? []) m.set(g.dealId, g);
    return m;
  }, [ob]);
  // completed analysis labels per deal (the "done" side)
  const doneByDeal = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const d of workspace.deliverables) {
      if (!d.analysis_run_id || (d.status || "").toLowerCase() !== "complete") continue;
      const arr = m.get(d.deal_id) ?? [];
      const label = (d.name || d.slug || "Analysis").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()).slice(0, 22);
      if (!arr.includes(label)) arr.push(label);
      m.set(d.deal_id, arr);
    }
    return m;
  }, [workspace.deliverables]);

  const reads: ReadVM[] = useMemo(() => active.slice(0, 6).map((d, i) => {
    const g = gateById.get(String(d.id));
    const needed = g ? realBlockers(g.blockers) : [];
    const done = (doneByDeal.get(d.id) ?? []).slice(0, 4);
    // Only a real number when DEFINITIVE scored it, or when completed analyses give a true ratio.
    // No completed work + no score → null (we show the open-item count instead of a fake 0%).
    const readiness = typeof g?.definitive?.score === "number"
      ? g.definitive.score
      : (done.length > 0 ? Math.round((done.length / (done.length + needed.length)) * 100) : null);
    const h = heat[(d.industry || "").toLowerCase().trim()];
    const market = h ? {
      heat: h.score, label: h.label, dir: h.multipleDirection,
      implication: h.peActivity || (h.signals && h.signals[0]) || `${h.label} — ${h.multipleDirection} multiples.`,
      sub: (h.signals && h.signals[0] && h.signals[0] !== h.peActivity) ? h.signals[0] : "",
    } : null;
    const move = g?.nextAction ? { action: g.nextAction, why: needed.length ? `Clears ${needed.length} open item${needed.length === 1 ? "" : "s"} at the ${g.gateName || d.current_gate} gate.` : `The next step toward the ${g.gateName || d.current_gate} gate.` } : null;
    return {
      deal: d, color: DEAL_COLORS[i % DEAL_COLORS.length],
      league: parseInt(String(d.league || "").replace(/\D/g, ""), 10) || 1,
      journey: (d.journey_type || "buy").toUpperCase(),
      gate: d.current_gate || "—", gateName: g?.gateName || "",
      done, needed, readiness, market, move,
    };
  }), [active, gateById, doneByDeal, heat]);

  const totalEv = summary?.totalEvCents ?? 0;
  const sectorAlloc = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of active) { const k = (d.industry || "Other").trim(); m.set(k, (m.get(k) || 0) + (d.asking_price || 0)); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value, color: DEAL_COLORS[i % DEAL_COLORS.length] }));
  }, [active]);

  const firstName = (user?.email || "there").split("@")[0].split(/[._]/)[0].replace(/\b\w/, c => c.toUpperCase());
  const loading = workspace.canFetch && workspace.loading && active.length === 0;

  return (
    <div className="cd-root cd-scrollable" style={{ background: "var(--cd-canvas)", height: "100%", overflow: "auto", padding: "30px 34px 60px", display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
      {/* editorial header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--cd-serif)", fontWeight: 600, fontSize: 40, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
          Good morning, <span style={{ fontStyle: "italic" }}>{firstName}</span>.
        </h1>
        <p style={{ margin: "10px 0 0", color: "var(--cd-ink-2)", fontSize: 14.5 }}>
          {summary ? <>{summary.totalActive} active mandate{summary.totalActive === 1 ? "" : "s"} · <span className="cd-num" style={{ fontWeight: 600, color: "var(--cd-ink)" }}>{fmtCents(totalEv)}</span> aggregate enterprise value in play.</> : "Loading your desk…"}
        </p>
      </div>

      {/* Yulia morning briefing */}
      {ob?.morningBrief && (
        <div style={{ background: "linear-gradient(180deg, var(--cd-accent-soft), var(--cd-surface))", border: "1px solid var(--cd-accent-ring)", borderRadius: "var(--cd-r-lg)", padding: "var(--cd-pad)", boxShadow: "var(--cd-shadow-sm)" }}>
          <div style={{ display: "flex", gap: 13 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--cd-accent)", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "var(--cd-shadow-sm)" }}><Icon name="sparkle" size={17} color="white" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Morning briefing</span>
                <Pill tone="accent">Yulia · {ob.morningBrief.freshness}</Pill>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--cd-ink)", maxWidth: 760 }}>{ob.morningBrief.lede || ob.morningBrief.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ THE CORE — per-deal intelligence reads */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>What needs you</h2>
          <Pill tone="accent"><Icon name="sparkle" size={12} color="var(--cd-accent)" />Yulia's read · per mandate</Pill>
        </div>
        <span style={{ fontSize: 12, color: "var(--cd-ink-3)" }}>{active.length} active mandate{active.length === 1 ? "" : "s"}</span>
      </div>
      {loading ? (
        <Card><div className="cd-skel" style={{ height: 120 }} /></Card>
      ) : reads.length === 0 ? (
        <Card style={{ textAlign: "center", color: "var(--cd-ink-2)" }}>No active mandates yet — start one with Yulia.</Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--cd-gap)" }}>
          {reads.map(vm => <IntelRead key={vm.deal.id} vm={vm} onAsk={() => onAsk?.(`Give me your read on ${vm.deal.business_name}: where it stands, the market, and the next move.`)} onOpen={() => onOpenDeal?.(vm.deal.id, vm.deal.business_name || `Deal #${vm.deal.id}`)} />)}
        </div>
      )}

      {/* supporting cast */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <span className="cd-eyebrow">Portfolio at a glance</span>
        <div style={{ flex: 1, height: 1, background: "var(--cd-line)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--cd-gap)" }}>
        <KpiStat label="Active mandates" value={String(summary?.totalActive ?? "—")} />
        <KpiStat label="Aggregate EV" value={fmtCents(totalEv)} />
        <KpiStat label="Open gate items" value={String((ob?.gateCountdown ?? []).reduce((n, g) => n + realBlockers(g.blockers).length, 0))} />
        <KpiStat label="Weighted avg IRR" value="—" sub="no live feed yet" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--cd-gap)" }}>
        <Card>
          <SectionTitle action={<Pill tone="neutral"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cd-ink-4)" }} />No live feed</Pill>}>Pipeline value</SectionTitle>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="cd-num" style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>{fmtCents(totalEv)}</span>
            <span style={{ fontSize: 12.5, color: "var(--cd-ink-3)" }}>aggregate enterprise value</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--cd-ink-4)", marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon name="sparkle" size={12} color="var(--cd-ink-4)" />No live EV time-series feed yet — trailing chart pending the value-series backend.</div>
        </Card>
        <Card>
          <SectionTitle>Sector allocation</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Donut data={sectorAlloc.length ? sectorAlloc : [{ value: 1, color: "var(--cd-surface-3)" }]} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {sectorAlloc.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                  <span className="cd-num" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--cd-ink-2)" }}>{fmtCents(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="cd-eyebrow">{label}</div>
      <div>
        <div className="cd-num" style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--cd-ink-3)", marginTop: 5 }}>{sub}</div>}
      </div>
    </Card>
  );
}

// money: cents → $X.XB / $X.XM / $XK (mirrors the app's fmtCents)
function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "$0";
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}
