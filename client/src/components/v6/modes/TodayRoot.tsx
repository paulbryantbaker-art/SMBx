/**
 * Desktop Today — a command-center dashboard.
 *
 * Answers two things in two seconds: "how big is my book?" (the money lead) and
 * "what is the single most consequential thing pulling on me right now?" (the
 * merged, consequence-ranked Command Queue). Urgency outranks the sourcing hero,
 * so the watercolor hero is demoted below the work.
 *
 * Every figure is real and computed — portfolio money (cents), gate countdowns +
 * blockers, market heat (getMarketHeat), model-refresh needs, files-needing-
 * review. Fit / seven_factor_composite is NULL portfolio-wide on seed data, so it
 * is shown as "—" or omitted everywhere, NEVER invented (the hero shows a real
 * money metric, not a multiple-derived "Fit"). Pulls from the IDENTICAL hooks
 * mobile uses so the two surfaces cannot diverge.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useMobileDeals, type MobilePipelineRow, type MobileFeatured } from "../../../hooks/useMobileDeals";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import { usePortfolioSummary } from "../../../hooks/usePortfolioSummary";
import {
  deriveVerdictKind,
  heroBoxShadow,
  preloadTexture,
  journeyTone,
  HERO_GHOST_PILL_BG,
  HERO_INNER_CELL,
  HERO_RADIUS,
  VERDICT_MATERIAL,
  type VerdictKind,
} from "../shared/verdictMaterial";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { V6Icon } from "../icons";
import {
  useTodayOperatingBrief,
  type TodayOperatingBrief,
  type TodayTone,
} from "../../../hooks/useTodayOperatingBrief";
import {
  BlockerChips, OpChip, ReadinessBadge, toneTrio, realBlockers, gateSignalTone, HeatBar, BTN_RESET,
} from "../shared/operatingPrimitives";
import type { OpenTab } from "../types";

interface MarketHeat {
  industry: string;
  score: number;
  label: string;
  peActivity: string;
  multipleDirection: "expanding" | "stable" | "contracting";
  signals: string[];
}

interface TodayRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const deals = useMobileDeals(user);
  const workspace = useV6WorkspaceData(user);
  const operating = useTodayOperatingBrief(user, !!user);
  const { summary } = usePortfolioSummary(user, !!user);
  const ob = operating.brief;

  // Real market heat per portfolio industry (same source/endpoint as Intel).
  const [heat, setHeat] = useState<MarketHeat[]>([]);
  useEffect(() => {
    if (!user) { setHeat([]); return; }
    let cancelled = false;
    fetch("/api/intelligence/portfolio-heat", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`heat ${r.status}`)))
      .then((d: { heat?: MarketHeat[] }) => { if (!cancelled) setHeat(d.heat ?? []); })
      .catch(() => { if (!cancelled) setHeat([]); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (rawId: number, title: string) => openTab({ kind: "deal", id: String(rawId), title });
  const openAllDeals = () => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" });

  const featured = deals.featured;
  const todayRows = deals.today;
  const recentFiles = workspace.deliverables.slice(0, 4);
  const dealsLoading = deals.isAuthed && deals.loading && !deals.loaded;

  // ── The Command Queue: one consequence-ranked backlog (gates → models → files) ──
  const queue = useMemo(() => buildCommandQueue(ob), [ob]);
  const blockedDeals = (ob?.gateCountdown ?? []).filter(g => realBlockers(g.blockers).length > 0).length;
  const staleModels = ob?.modelRefreshNeeds.length ?? 0;
  const filesReview = ob?.filesNeedingReview.length ?? 0;
  const readyToDisclose = (ob?.filesNeedingReview ?? []).filter(f => f.definitiveDisclosureStatus === "ready_for_user_controlled_disclosure").length;
  const ledeParts: string[] = [];
  if (blockedDeals) ledeParts.push(`${blockedDeals} deal${blockedDeals === 1 ? "" : "s"} with open gate items`);
  if (staleModels) ledeParts.push(`${staleModels} model${staleModels === 1 ? "" : "s"} need rerun`);
  if (filesReview) ledeParts.push(`${filesReview} file${filesReview === 1 ? "" : "s"} awaiting review`);
  if (readyToDisclose) ledeParts.push(`${readyToDisclose} ready to disclose`);

  // ── Portfolio shape strip (real counts only — no Fit aggregate; it's null) ──
  const gateReady = (ob?.gateCountdown ?? []).filter(g => realBlockers(g.blockers).length === 0).length;
  const gateBlocked = (ob?.gateCountdown ?? []).length - gateReady;
  const stageBand = (summary?.byGate ?? []).filter(s => s.count > 0).slice(0, 5);

  // ── Hero (demoted) — texture from verdict; preload all four to avoid flash ──
  const heroKind: VerdictKind = featured ? deriveVerdictKind(featured.verdict) : "baseline";
  const heroMat = VERDICT_MATERIAL[heroKind];
  const [heroTexReady, setHeroTexReady] = useState(false);
  useEffect(() => {
    (Object.keys(VERDICT_MATERIAL) as VerdictKind[]).forEach(kind => preloadTexture(VERDICT_MATERIAL[kind].texture));
  }, []);
  useEffect(() => {
    setHeroTexReady(false);
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setHeroTexReady(true); };
    img.src = heroMat.texture;
    if (img.complete) setHeroTexReady(true);
    return () => { cancelled = true; };
  }, [heroMat.texture]);

  const briefReady = !!user && (operating.brief || !operating.loading);
  const hasMoney = !!summary && summary.totalActive > 0;
  const empty = !dealsLoading && deals.isAuthed && deals.loaded && !featured && todayRows.length === 0 && (!summary || summary.totalActive === 0);

  return (
    <div className="wk-content m-fade-up m-page-flow" style={{ maxWidth: 1180, margin: "0 auto" }}>

      {/* ── Section 0 — Command header: the money lead ── */}
      <div className="pg-head" style={{ alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div className="pg-title">Today</div>
          {hasMoney && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              {/* Use totalEvCents ONLY. weightedEvCents collapses to 0.5×total
                  because seven_factor_composite is NULL on seed — surfacing it
                  implies confidence that doesn't exist. This is a sum (asking, or
                  earnings×multiple fallback), never a forecast. */}
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.4rem", letterSpacing: "-0.03em", lineHeight: 1, color: "var(--ink)" }}>
                {fmtCents(summary!.totalEvCents)}
              </span>
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--ink-2)" }}>
                across {summary!.totalActive} active deal{summary!.totalActive === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
        {ob?.morningBrief.freshness && (
          <div style={{ flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--ink-3)", whiteSpace: "nowrap", paddingTop: 6 }}>
            {ob.morningBrief.freshness}
          </div>
        )}
      </div>

      {empty ? (
        <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)", marginTop: 16 }}>
          <div className="wkcard-title">Start your first deal</div>
          <div className="wkcard-sub">Bring a deal, thesis, or source file and Yulia will build your desk — pipeline, models, and market read.</div>
          <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => ask("Help me start my first deal.")}>Start with Yulia</button>
        </div>
      ) : (
        <>
          {/* ── Section 1 — "What needs you": the merged command queue (the lead) ── */}
          <div className="wkcard" style={{ marginTop: 4, boxShadow: "var(--wk-elev-card)" }}>
            <div className="wkcard-title" style={{ fontSize: "1.15rem" }}>What needs you</div>
            {ledeParts.length > 0 && (
              <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "4px 0 12px" }}>{ledeParts.join("  ·  ")}</p>
            )}

            {!briefReady ? (
              <div style={{ marginTop: 8 }}><YuliaSkeleton rows={2} label="Yulia is reading today's queue…" /></div>
            ) : queue.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, padding: "8px 0 2px" }}>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-2)" }}>Portfolio is current — no blockers, stale models, or reviews waiting.</div>
                <button className="wkbtn" type="button" onClick={() => ask(ob?.morningBrief.prompt || "What's the highest-leverage thing I could do across my portfolio right now?")}>Ask Yulia what's next</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {queue.slice(0, 6).map(item => (
                  <CommandRow
                    key={item.key}
                    item={item}
                    onOpen={item.dealId ? () => openDeal(item.dealId!, item.title) : undefined}
                    onAsk={() => ask(item.prompt)}
                  />
                ))}
                {queue.length > 6 && (
                  <button
                    type="button"
                    onClick={() => openTab({ kind: "mode-root", modeId: "pipeline", id: "pipeline-root", title: "Pipeline", pinned: true })}
                    style={{ ...BTN_RESET, cursor: "pointer", alignSelf: "flex-start", marginTop: 2, fontFamily: "var(--font-mono)", fontSize: "0.74rem", fontWeight: 600, color: "var(--accent-strong)" }}
                  >
                    See all {queue.length} in Pipeline ›
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Section 2 — Portfolio shape strip: the glanceable health posture ── */}
          {(ob?.gateCountdown?.length || stageBand.length > 0) ? (
            <div style={{ display: "flex", gap: 1, marginTop: 12, background: "var(--line)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
              <ShapeCell label="Gate-ready" value={`${gateReady}`} valueColor={gateReady > 0 ? VERDICT_MATERIAL.pursue.tone.ink : "var(--ink)"} />
              <ShapeCell label="Blocked" value={`${gateBlocked}`} valueColor={gateBlocked > 0 ? VERDICT_MATERIAL.watch.tone.ink : "var(--ink-3)"} />
              <ShapeCell label="By stage" custom={
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 3 }}>
                  {stageBand.length === 0
                    ? <span style={{ fontSize: "0.82rem", color: "var(--ink-3)" }}>—</span>
                    : stageBand.map(s => {
                        const t = journeyTone(journeyFromGate(s.gate)) ?? VERDICT_MATERIAL.baseline.tone;
                        return (
                          <span key={s.gate} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 7px", borderRadius: 999, background: t.soft, color: t.ink, fontSize: "0.7rem", fontWeight: 700 }}>
                            {s.gate} <span style={{ fontFamily: "var(--font-mono)", opacity: 0.8 }}>×{s.count}</span>
                          </span>
                        );
                      })}
                </div>
              } />
            </div>
          ) : null}

          {/* ── Section 3 + 4 — Strongest source (demoted hero) + Market read ── */}
          <div className="wkgrid g2" style={{ gap: 16, marginTop: 16 }}>
            {dealsLoading ? (
              <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink-2)" }}>Strongest source this week</div>
                <YuliaSkeleton rows={2} label="Yulia is reading your deals…" />
              </div>
            ) : featured ? (
              <HeroFrame featured={featured} heroKind={heroKind} heroMat={heroMat} heroTexReady={heroTexReady}
                onOpen={() => openDeal(featured.rawId, featured.name)}
                onAsk={() => ask(`Give me your read on ${featured.name}: verdict, risks, and the next move.`)} />
            ) : (
              <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink-2)" }}>Strongest source this week</div>
                <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>Yulia will surface your strongest source here once you have deals in motion.</p>
                <button className="wkbtn primary" type="button" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => ask("Help me start or source my first deal.")}>Start with Yulia</button>
              </div>
            )}

            <MarketReadCard heat={heat} onAsk={(industry) => ask(`Show me the market read for ${industry} — buyers, multiples, and the signals behind the heat.`)} />
          </div>

          {/* ── Section 5 — Recent work + Deals in motion (condensed footer) ── */}
          <div className="wkgrid g2" style={{ gap: 16, marginTop: 16 }}>
            <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 4, boxShadow: "var(--wk-elev-card)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>Recent work</div>
                <button type="button" onClick={() => openTab({ kind: "mode-root", modeId: "files", id: "files-root", title: "Files", pinned: true })} style={{ ...BTN_RESET, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--accent-strong)" }}>Open Files →</button>
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "4px 0 10px" }}>Docs and analyses Yulia produced.</p>
              {workspace.loading ? (
                <YuliaSkeleton rows={3} label="Loading files…" />
              ) : recentFiles.length === 0 ? (
                <div style={{ color: "var(--ink-2)", fontSize: "0.85rem", padding: "8px 0" }}>Generated docs and analyses will collect here.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {recentFiles.map(f => {
                    const tone = isAnalysis(f) ? FAMILY_TONE.valuation : FAMILY_TONE.diligence;
                    return (
                      <button key={f.id} type="button" className="wk-tap"
                        style={{ ...BTN_RESET, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", boxSizing: "border-box", borderBottom: "1px solid var(--line)" }}
                        onClick={() => openFile(f, openTab)}>
                        <span style={{ flex: "none", width: 30, height: 30, borderRadius: 8, background: tone.soft, display: "grid", placeItems: "center", color: tone.ink }}>
                          <V6Icon name={isAnalysis(f) ? "chart" : "doc"} size={15} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", color: "var(--ink)", fontSize: "0.88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name || prettySlug(f.slug)}</span>
                          <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.76rem" }}>{f.deal_name || "Deal"} · {statusLabel(f.status)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 4, boxShadow: "var(--wk-elev-card)", padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "16px 18px 6px" }}>
                <button type="button" onClick={openAllDeals} aria-label="See all deals" style={{ ...BTN_RESET, cursor: "pointer", display: "inline-flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>Deals in motion</span>
                  <span aria-hidden style={{ color: "var(--accent-strong)", fontWeight: 600 }}>›</span>
                </button>
                <button type="button" onClick={openAllDeals} style={{ ...BTN_RESET, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--accent-strong)", whiteSpace: "nowrap" }}>See all →</button>
              </div>
              {dealsLoading ? (
                <div style={{ padding: "0 18px 16px" }}><YuliaSkeleton rows={3} label="Yulia is reading your deals…" /></div>
              ) : todayRows.length === 0 ? (
                <div style={{ padding: "0 18px 18px", color: "var(--ink-2)", fontSize: "0.85rem" }}>Start a deal and Yulia will read it here.</div>
              ) : (
                <div>
                  {todayRows.slice(0, 6).map((row, i) => (
                    <PipelineRow key={row.id} row={row} last={i === Math.min(todayRows.length, 6) - 1} onOpen={() => openDeal(row.rawId, row.name)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── The Command Queue model ─────────────────────────────────────────────
 * One consequence-ranked backlog over the three real work sources. Gate
 * blockers first (ranked by open-item count), then stale models, then files to
 * review — distilled to descriptive state facts + the next operational step.
 * THE LINE: never a regulated-decision recommendation. */
interface CommandItem {
  key: string;
  kind: "gate" | "model" | "file";
  title: string;
  subtitle?: string;
  dealId?: number;
  signal: TodayTone;
  chips?: ReactNode;
  badge?: ReactNode;
  reason?: string;
  reasonPrefix?: string;
  actionLabel?: string;
  prompt: string;
  rank: number;
}

function buildCommandQueue(ob: TodayOperatingBrief | null): CommandItem[] {
  if (!ob) return [];
  const out: CommandItem[] = [];

  // 1. Gate blockers — only deals with REAL open items, ranked by count.
  for (const g of ob.gateCountdown) {
    const open = realBlockers(g.blockers);
    if (open.length === 0) continue;
    const signal = gateSignalTone(open.length);
    out.push({
      key: `gate-${g.dealId}-${g.gateId}`,
      kind: "gate",
      title: g.title,
      subtitle: `${g.gateId} · ${g.gateName}`,
      dealId: Number(g.dealId) || undefined,
      signal,
      chips: <BlockerChips blockers={open} tone={signal} />,
      badge: <ReadinessBadge state={g.definitive} compact />,
      reason: g.nextAction,
      reasonPrefix: "Next",
      prompt: `${g.title}: what clears the ${g.gateName} gate, and what's the next move?`,
      rank: 1000 + open.length * 10,
    });
  }
  // 2. Stale models — the why-now is the literal changed inputs.
  for (const m of ob.modelRefreshNeeds) {
    const why = m.changedInputs.length ? `${m.changedInputs.join(", ")} changed` : (m.reason || m.statusLabel);
    out.push({
      key: `model-${m.id}`,
      kind: "model",
      title: m.modelTitle,
      subtitle: m.dealTitle || undefined,
      dealId: Number(m.dealId) || undefined,
      signal: m.status === "needs_rerun" ? "plum" : "gold",
      chips: <OpChip label={m.statusLabel} tone={m.status === "needs_rerun" ? "plum" : "gold"} />,
      reason: why,
      reasonPrefix: "Why",
      actionLabel: "Rerun",
      prompt: m.recomputePrompt || `Rerun ${m.modelTitle}${m.dealTitle ? ` for ${m.dealTitle}` : ""} — the inputs changed.`,
      rank: 500 + m.changedInputs.length,
    });
  }
  // 3. Files to review.
  for (const f of ob.filesNeedingReview) {
    const ready = f.definitiveDisclosureStatus === "ready_for_user_controlled_disclosure";
    const gaps = (f.definitiveSourceGaps?.length ?? 0);
    out.push({
      key: `file-${f.id}`,
      kind: "file",
      title: f.title,
      subtitle: f.dealTitle || undefined,
      dealId: Number(f.dealId) || undefined,
      signal: ready ? "cactus" : "gold",
      chips: ready
        ? <OpChip label="Ready to disclose" tone="cactus" />
        : gaps > 0 ? <OpChip label={`${gaps} source gap${gaps === 1 ? "" : "s"}`} tone="gold" /> : undefined,
      reason: f.reason || f.status,
      reasonPrefix: "Review",
      prompt: `Walk me through ${f.title}${f.dealTitle ? ` on ${f.dealTitle}` : ""} — what needs my eye?`,
      rank: ready ? 100 : 200,
    });
  }
  return out.sort((a, b) => b.rank - a.rank);
}

/** One compact queue row — a single tap-surface: left tonal rail + title + chips
 *  + reason, with the next action hinted on the right. Gate rows open the deal;
 *  model/file rows route to Yulia (rerun / review). Dense enough that 5-6 rows
 *  stay scannable above the fold. */
function CommandRow({ item, onOpen, onAsk }: { item: CommandItem; onOpen?: () => void; onAsk: () => void }) {
  const t = toneTrio(item.signal);
  const primary = item.kind === "gate" && onOpen ? onOpen : onAsk;
  const actionHint = item.kind === "gate" ? "Open deal" : item.actionLabel || "Ask Yulia";
  return (
    <button
      type="button"
      className="wk-tap"
      onClick={primary}
      style={{
        ...BTN_RESET, cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box",
        display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center",
        padding: "12px 14px", borderRadius: 11, background: "var(--surface-2)",
        border: "1px solid var(--line)", borderLeft: `3px solid ${t.mid}`,
      }}
    >
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.94rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
          {item.subtitle && <span style={{ fontSize: "0.76rem", color: "var(--ink-3)" }}>{item.subtitle}</span>}
        </span>
        {item.chips && <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>{item.chips}</span>}
        {item.reason && (
          <span style={{ display: "block", fontSize: "0.8rem", color: "var(--ink-2)", marginTop: 6, lineHeight: 1.4 }}>
            <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>{item.reasonPrefix}: </span>{item.reason}
          </span>
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7, flexShrink: 0 }}>
        {item.badge}
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: t.ink, whiteSpace: "nowrap" }}>{actionHint} ›</span>
      </span>
    </button>
  );
}

/** A compact stat cell for the portfolio-shape strip. */
function ShapeCell({ label, value, valueColor, custom }: { label: string; value?: string; valueColor?: string; custom?: ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: "var(--surface)", padding: "12px 16px" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--ink-3)", textTransform: "none" }}>{label}</div>
      {custom ?? <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: valueColor, marginTop: 2 }}>{value}</div>}
    </div>
  );
}

/** The market read — real per-industry heat with a temperature bar. Heat is a
 *  descriptive market temperature, never a verdict (no green up-arrows). */
function MarketReadCard({ heat, onAsk }: { heat: MarketHeat[]; onAsk: (industry: string) => void }) {
  const ranked = [...heat].filter(h => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 200, background: VERDICT_MATERIAL.baseline.tone.soft }}>
      <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)" }}>Where your sectors are running</div>
      {ranked.length === 0 ? (
        <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>Add a deal industry and Yulia will compute live market heat from PE activity and buyer-thesis demand.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 2 }}>
          {ranked.map(h => (
            <button key={h.industry} type="button" className="wk-tap" onClick={() => onAsk(h.industry)}
              style={{ ...BTN_RESET, textAlign: "left", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--wk-hairline-2)", borderRadius: 9 }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.industry}</span>
                <span style={{ display: "block", fontSize: "0.74rem", color: "var(--ink-3)", marginTop: 1 }}>{h.label} · {h.multipleDirection} multiples</span>
              </span>
              <HeatBar score={h.score} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Hero (Wave B2 watercolor verdict frame) — DEMOTED below the work.
 * Texture from verdict; Fit numeral REPLACED by a real money metric so "Fit"
 * means exactly one thing (seven_factor_composite) across every tab. ── */
function HeroFrame({ featured, heroKind, heroMat, heroTexReady, onOpen, onAsk }: {
  featured: MobileFeatured; heroKind: VerdictKind; heroMat: typeof VERDICT_MATERIAL[VerdictKind]; heroTexReady: boolean; onOpen: () => void; onAsk: () => void;
}) {
  const metric = featured.metricValue || featured.revLabel;
  const metricLabel = featured.metricLabel || (featured.revLabel ? "" : "");
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 240, padding: "20px 22px", boxSizing: "border-box", borderRadius: HERO_RADIUS, overflow: "hidden", color: "#fff", backgroundColor: heroFallbackFill(heroKind), backgroundImage: heroMat.overlay, boxShadow: heroBoxShadow(heroKind) }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: `${heroMat.overlay}, url('${heroMat.texture}')`, backgroundSize: "cover, cover", backgroundPosition: "center, center", backgroundRepeat: "no-repeat, no-repeat", opacity: heroTexReady ? 1 : 0, transition: "opacity 320ms ease" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: -60, right: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%)" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: -80, left: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07), transparent 60%)" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Strongest source this week</div>
        <div style={{ marginTop: 10, minWidth: 0 }}>
          <div className="wk-masthead" style={{ color: "#fff", fontSize: 34, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featured.name}</div>
          <div style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.82rem", marginTop: 4 }}>{featured.sub}</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "10px 2px 12px", minHeight: 26 }}>
          {metric && (
            <div style={{ textAlign: "right" }}>
              {metricLabel && <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{metricLabel}</div>}
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, letterSpacing: -1.5, lineHeight: 1, color: "#fff", marginTop: 2 }}>{metric}</div>
            </div>
          )}
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: HERO_INNER_CELL.radius, background: HERO_INNER_CELL.background, backdropFilter: HERO_INNER_CELL.backdropFilter, WebkitBackdropFilter: HERO_INNER_CELL.backdropFilter, border: HERO_INNER_CELL.border, boxShadow: HERO_INNER_CELL.boxShadow }}>
          <button className="wk-tap" type="button" style={HERO_PILL} onClick={onOpen}>Open deal</button>
          <button className="wk-tap" type="button" style={HERO_PILL} onClick={onAsk}>Ask Yulia</button>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────── */

const HERO_PILL: CSSProperties = {
  appearance: "none", border: 0, margin: 0, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flex: 1, minHeight: 34, padding: "0 14px", borderRadius: 999,
  background: HERO_GHOST_PILL_BG, color: "#fff", fontFamily: "inherit",
  fontSize: 13, fontWeight: 800, letterSpacing: "0.01em", whiteSpace: "nowrap",
};

const FAMILY_TONE = {
  valuation: VERDICT_MATERIAL.pursue.tone,
  diligence: VERDICT_MATERIAL.baseline.tone,
  structure: VERDICT_MATERIAL.watch.tone,
} as const;

function heroFallbackFill(kind: VerdictKind): string {
  const stops = VERDICT_MATERIAL[kind].overlay.match(/rgba\([^)]+\)/g);
  const last = stops?.[stops.length - 1];
  return last ? last.replace(/[\d.]+\)$/, "1)") : "#10243E";
}

/** gateId → journey for the stage chip tone (B=buy, S=sell, R=raise, PMI=pmi). */
function journeyFromGate(gate: string): string {
  const g = (gate || "").toUpperCase();
  if (g.startsWith("PMI")) return "pmi";
  const c = g[0];
  return c === "S" ? "sell" : c === "R" ? "raise" : "buy";
}

function PipelineRow({ row, last, onOpen }: { row: MobilePipelineRow; last: boolean; onOpen: () => void }) {
  const verdict = (row as any).verdict as string | undefined;
  return (
    <button type="button" className="wk-tap"
      style={{ ...BTN_RESET, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "13px 18px", borderBottom: last ? "none" : "1px solid var(--line)" }}
      onClick={onOpen}>
      <span className="logo">{initials(row.name)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--ink)", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
        <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.sub}</span>
      </span>
      {verdict
        ? <TonalVerdictPill kind={deriveVerdictKind(verdict)} label={capitalize(verdict)} />
        : (row as any).price
          ? <TonalVerdictPill kind="baseline" label={(row as any).price} dot={false} />
          : null}
    </button>
  );
}

function TonalVerdictPill({ kind, label, dot = true }: { kind: VerdictKind; label: string; dot?: boolean }) {
  const tone = VERDICT_MATERIAL[kind].tone;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 650, lineHeight: 1, background: tone.soft, color: tone.ink, flexShrink: 0, whiteSpace: "nowrap" }}>
      {dot && <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />}
      {label}
    </span>
  );
}

function openFile(f: WorkspaceDeliverable, openTab: OpenTab) {
  if (f.analysis_run_id) {
    openTab({ kind: "analysis", id: `analysis-${f.analysis_run_id}`, title: f.name || prettySlug(f.slug), analysisRunId: f.analysis_run_id, tool: f.analysis_type ?? undefined, status: f.analysis_status ?? undefined });
    return;
  }
  openTab({ kind: "doc", id: String(f.id), title: f.name || prettySlug(f.slug) });
}

function isAnalysis(f: WorkspaceDeliverable): boolean {
  return !!f.analysis_run_id || /model|valuation|analysis|sba|comp|score|risk|tax|financial|qoe/i.test(`${f.slug || ""} ${f.name || ""}`);
}

function initials(value: string): string {
  return String(value || "").split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase() || "··";
}
function capitalize(s: string): string { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function prettySlug(slug: string): string { return (slug || "Untitled").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function statusLabel(status: string): string { return (status || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

// Money formatter (cents → $X.XB / $X.XM / $XK).
function fmtCents(cents: number | null | undefined): string {
  if (!cents) return "$0";
  const dollars = cents / 100;
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}
