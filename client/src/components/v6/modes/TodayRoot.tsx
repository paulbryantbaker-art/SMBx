/**
 * Desktop Today — SAME information as mobile Today, in desktop UI.
 * Pulls from the IDENTICAL data hooks mobile uses so the two cannot diverge:
 *   - useMobileDeals (featured hero deal + today pipeline rows)
 *   - copyFor(audience).todayTips (the quick-win chips)
 *   - /api/agency/portfolio-brief (market intelligence)
 *   - useV6WorkspaceData (recent work)
 * Same card set / order as mobile: Daily hero · Market intelligence ·
 * Today's quick wins · Recent work · Analyses · Deals in motion.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { useMobileDeals, type MobilePipelineRow } from "../../../hooks/useMobileDeals";
import { useAudience } from "../../../hooks/useAudience";
import { copyFor } from "../../../lib/copy";
import { useV6WorkspaceData, type WorkspaceDeliverable } from "../../../hooks/useV6WorkspaceData";
import {
  deriveVerdictKind,
  heroBoxShadow,
  preloadTexture,
  HERO_GHOST_PILL_BG,
  HERO_INNER_CELL,
  HERO_RADIUS,
  VERDICT_MATERIAL,
  type VerdictKind,
} from "../shared/verdictMaterial";
import { YuliaSkeleton } from "../shared/YuliaSkeleton";
import { V6Icon } from "../icons";
import { useTodayOperatingBrief, type TodayGateCountdownItem, type TodayOperatingBrief, type TodayTone } from "../../../hooks/useTodayOperatingBrief";
import { NextMoveBar, BlockerChips, ReadinessBadge, OpChip, toneTrio, realBlockers, gateSignalTone } from "../shared/operatingPrimitives";
import type { OpenTab } from "../types";

interface BriefMarketIntel { headline: string; subhead: string; bullets: string[]; sourceCount: number; confidence: string; }
interface PortfolioBrief { marketIntelligence?: BriefMarketIntel }

interface TodayRootProps {
  openTab: OpenTab;
  onTalkToYulia?: (prompt: string) => void;
  user: User | null;
}

export function V6TodayRoot({ openTab, onTalkToYulia, user }: TodayRootProps) {
  const deals = useMobileDeals(user);
  const { audience } = useAudience(user);
  const C = copyFor(audience);
  const workspace = useV6WorkspaceData(user);
  const [brief, setBrief] = useState<PortfolioBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!user) { setBrief(null); setBriefLoading(false); return; }
    let cancelled = false;
    setBriefLoading(true);
    fetch("/api/agency/portfolio-brief", { headers: authHeaders() })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`brief ${res.status}`)))
      .then((next: PortfolioBrief) => { if (!cancelled) setBrief(next); })
      .catch(() => { if (!cancelled) setBrief(null); })
      .finally(() => { if (!cancelled) setBriefLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const ask = (prompt: string) => onTalkToYulia?.(prompt);
  const openDeal = (rawId: number, title: string) => openTab({ kind: "deal", id: String(rawId), title });
  const openAllDeals = () => openTab({ id: "deals-all", kind: "deals-list", title: "All deals", dealsListView: "all" });

  const featured = deals.featured;           // strongest source this week (same as mobile)
  // Watercolor verdict hero (fusion Wave B2). The FIT numeral renders PLAIN
  // on texture — no useDerivedDisplay, no wk-tick: DERIVE's emerald is a
  // light-surface verification signal and never renders on texture.
  // Honesty gate: synthetic (id-hash) fits may order deals but never display.
  const heroKind: VerdictKind = featured ? deriveVerdictKind(featured.verdict) : "baseline";
  const heroMat = VERDICT_MATERIAL[heroKind];
  const [heroTexReady, setHeroTexReady] = useState(false);

  // Decode all four verdict textures up front so a verdict change never
  // paints white-then-pops (judges' criterion: no wrong-color flash on the
  // daily landing page).
  useEffect(() => {
    (Object.keys(VERDICT_MATERIAL) as VerdictKind[]).forEach(kind => preloadTexture(VERDICT_MATERIAL[kind].texture));
  }, []);

  // Mount flat (verdict-tinted solid + overlay), then crossfade the
  // watercolor in once its image has actually decoded.
  useEffect(() => {
    setHeroTexReady(false);
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setHeroTexReady(true); };
    img.src = heroMat.texture;
    if (img.complete) setHeroTexReady(true);
    return () => { cancelled = true; };
  }, [heroMat.texture]);

  const todayRows = deals.today;             // pipeline rows (same as mobile)
  const intel = brief?.marketIntelligence ?? null;
  const recentFiles = workspace.deliverables.slice(0, 4);
  const dealsLoading = deals.isAuthed && deals.loading && !deals.loaded;
  const briefAnalyzing = !!user && briefLoading && !brief;

  // ── Computed operating intelligence (the page's real lead) ──
  const operating = useTodayOperatingBrief(user, !!user);
  const ob = operating.brief;
  const gateItems = (ob?.gateCountdown ?? []).slice(0, 3);
  const blockedDeals = (ob?.gateCountdown ?? []).filter(g => realBlockers(g.blockers).length > 0).length;
  const staleModels = ob?.modelRefreshNeeds.length ?? 0;
  const filesReview = ob?.filesNeedingReview.length ?? 0;
  const readyToDisclose = (ob?.filesNeedingReview ?? []).filter(f => f.definitiveDisclosureStatus === "ready_for_user_controlled_disclosure").length;
  // Top action chips from the real backlog (replaces static "quick wins").
  const actionItems = buildActionItems(ob);

  const nextMoveParts: string[] = [];
  if (blockedDeals) nextMoveParts.push(`${blockedDeals} deal${blockedDeals === 1 ? "" : "s"} with open gate items`);
  if (staleModels) nextMoveParts.push(`${staleModels} model${staleModels === 1 ? "" : "s"} need rerun`);
  if (filesReview) nextMoveParts.push(`${filesReview} file${filesReview === 1 ? "" : "s"} awaiting review`);
  if (readyToDisclose) nextMoveParts.push(`${readyToDisclose} ready to disclose`);
  const nextMoveTone = blockedDeals ? "plum" : staleModels ? "gold" : "cactus";

  return (
    <div className="wk-content m-fade-up m-page-flow" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="pg-head">
        <div>
          <div className="pg-title">Today</div>
          <p className="pg-sub">{C.todayHeroTag}</p>
        </div>
      </div>

      {/* ── NEXT-MOVE BAR — the computed lead: one line of state facts
          distilled from gate countdowns, model staleness, and the review
          queue. Descriptive only (THE LINE); honest "all current" fallback.
          Only renders once the operating brief is in hand for an authed
          user — never a placeholder. */}
      {user && (operating.brief || operating.loading) && (
        operating.loading && !operating.brief ? (
          <div style={{ marginTop: 4 }}><YuliaSkeleton rows={1} label="Yulia is reading today's queue…" /></div>
        ) : (
          <div style={{ marginTop: 4 }}>
            <NextMoveBar
              parts={nextMoveParts}
              tone={nextMoveTone}
              icon={<V6Icon name="chart" size={16} />}
              ctaLabel="Ask Yulia"
              onClick={() => ask(ob?.morningBrief.prompt || "Walk me through what needs my attention across the portfolio today.")}
            />
          </div>
        )
      )}

      {/* ── Daily hero + Market intelligence ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 4 }}>
        {/* Daily hero — the strongest source this week (deals.featured).
            Featured = the watercolor verdict HeroFrame (flagship #1): material
            from shared/verdictMaterial.ts, radius 22, glass inner cell
            carrying the actions. Skeleton + empty states stay plain cards —
            no texture on empties. */}
        {dealsLoading ? (
          <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.2 }}>Strongest source this week</div>
            <YuliaSkeleton rows={2} label="Yulia is reading your deals…" />
          </div>
        ) : featured ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              minHeight: 240,
              padding: "20px 22px",
              boxSizing: "border-box",
              borderRadius: HERO_RADIUS,
              overflow: "hidden",
              color: "#fff",
              backgroundColor: heroFallbackFill(heroKind),
              backgroundImage: heroMat.overlay,
              boxShadow: heroBoxShadow(heroKind),
            }}
          >
            {/* Watercolor layer — overlay re-applied above the texture (165deg,
                ~0.30 top keeps the numeral zone bright, ~0.62 bottom gives the
                glass cell contrast). Crossfades in once the image decodes. */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `${heroMat.overlay}, url('${heroMat.texture}')`,
                backgroundSize: "cover, cover",
                backgroundPosition: "center, center",
                backgroundRepeat: "no-repeat, no-repeat",
                opacity: heroTexReady ? 1 : 0,
                transition: "opacity 320ms ease",
              }}
            />
            {/* Ambient orbs (mobile HeroVisual parity) */}
            <div aria-hidden="true" style={{ position: "absolute", top: -60, right: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%)" }} />
            <div aria-hidden="true" style={{ position: "absolute", bottom: -80, left: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07), transparent 60%)" }} />

            <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>Strongest source this week</div>
              {/* Working Paper inversion: the deal name is the masthead — Fraunces register, white on texture */}
              <div style={{ marginTop: 10, minWidth: 0 }}>
                <div className="wk-masthead" style={{ color: "#fff", fontSize: 34, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featured.name}</div>
                <div style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.82rem", marginTop: 4 }}>{featured.sub}</div>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "10px 2px 12px", minHeight: 26 }}>
                {featured.fitIsReal && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Fit</div>
                    {/* PLAIN render on texture — no DERIVE settle, no tick (judges' law) */}
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 48, letterSpacing: -2, lineHeight: 1, color: "#fff", marginTop: 2 }}>{featured.fit}</div>
                  </div>
                )}
              </div>
              {/* Glass inner cell — the action row floating inside the hero */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 8,
                  borderRadius: HERO_INNER_CELL.radius,
                  background: HERO_INNER_CELL.background,
                  backdropFilter: HERO_INNER_CELL.backdropFilter,
                  WebkitBackdropFilter: HERO_INNER_CELL.backdropFilter,
                  border: HERO_INNER_CELL.border,
                  boxShadow: HERO_INNER_CELL.boxShadow,
                }}
              >
                <button className="wk-tap" type="button" style={HERO_PILL} onClick={() => openDeal(featured.rawId, featured.name)}>Open deal</button>
                <button className="wk-tap" type="button" style={HERO_PILL} onClick={() => ask(`Give me your read on ${featured.name}: verdict, risks, and the next move.`)}>Ask Yulia</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 200 }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.2 }}>Strongest source this week</div>
            <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
              Yulia will surface your strongest source here once you have deals in motion.
            </p>
            <button className="wkbtn primary" type="button" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => ask("Help me start or source my first deal.")}>Start with Yulia</button>
          </div>
        )}

        {/* Market intelligence — blue-soft tonal field (judged tonal pass):
            informational family, not a verdict; chips flip white-on-tonal. */}
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 200, background: VERDICT_MATERIAL.baseline.tone.soft }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Market intelligence</div>
          {briefAnalyzing ? (
            <YuliaSkeleton rows={3} label="Yulia is reading the market…" />
          ) : intel ? (
            <>
              <button
                type="button"
                className="wk-tap"
                style={{ appearance: "none", font: "inherit", color: "inherit", margin: 0, textAlign: "left", display: "block", cursor: "pointer", padding: "12px 14px", background: "#fff", border: "0.5px solid rgba(25,24,19,0.10)", borderRadius: 10, width: "100%", boxSizing: "border-box" }}
                onClick={() => ask("Show me the market intelligence behind today's read — buyer universe, financing climate, tax/legal, and source gaps.")}
              >
                <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.94rem", lineHeight: 1.3, fontWeight: 700 }}>{intel.headline}</strong>
                <span style={{ display: "block", marginTop: 5, color: "var(--ink-2)", fontSize: "0.82rem", lineHeight: 1.42 }}>{intel.subhead}</span>
              </button>
              {intel.bullets.slice(0, 3).map((bullet, i) => (
                <button
                  key={bullet}
                  type="button"
                  className="wk-tap"
                  style={{ appearance: "none", font: "inherit", color: "inherit", margin: 0, textAlign: "left", cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "start", padding: "9px 12px", background: "#fff", border: "0.5px solid rgba(25,24,19,0.10)", borderRadius: 9, width: "100%", boxSizing: "border-box" }}
                  onClick={() => ask(`Unpack this market signal: ${bullet}`)}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--ink-3)" }}>{i + 1}</span>
                  <span style={{ color: "var(--ink-2)", fontSize: "0.83rem", lineHeight: 1.38 }}>{bullet}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                Yulia hasn't built a market read yet. Ask her to analyze buyers, financing climate, and the risks across your portfolio.
              </p>
              <button className="wkbtn" type="button" style={{ marginTop: "auto", alignSelf: "flex-start" }} onClick={() => ask("Build my portfolio market intelligence read: buyer universe, financing climate, tax/legal structure, and source gaps.")}>
                Ask Yulia for the read
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── GATE COUNTDOWN — the top deals by urgency with the real blockers
          standing between them and their next gate. The page's computed
          centerpiece: each card is state facts (gate, blockers, readiness)
          + the next suggested move, never advice. */}
      {gateItems.length > 0 && (
        <div className="wksec">
          <div className="wksec-title" style={{ marginBottom: 12 }}>What's between you and the next gate</div>
          <div className="wkgrid g3" style={{ gap: 12 }}>
            {gateItems.map(item => (
              <GateCountdownCard key={item.dealId} item={item} onOpen={() => openDeal(Number(item.dealId), item.title)} onAsk={() => ask(`${item.title}: what clears the ${item.gateName} gate, and what's the next move?`)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Today's actions (real backlog) + Recent work ── */}
      <div className="wkgrid g2" style={{ gap: 16, marginTop: 16 }}>
        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 4, boxShadow: "var(--wk-elev-card)" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Today's actions</div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "4px 0 10px" }}>
            {actionItems.length > 0 ? "Pulled from your live backlog — Yulia can run each now." : "Everything Yulia computed is current."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actionItems.length > 0 ? actionItems.map((a, i) => (
              <button
                key={i}
                type="button"
                className="wk-tap"
                style={{ appearance: "none", font: "inherit", color: "inherit", margin: 0, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, boxSizing: "border-box" }}
                onClick={() => ask(a.prompt)}
              >
                <span style={{ flexShrink: 0 }}><OpChip label={a.kind} tone={a.tone} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", color: "var(--ink)", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.label}</span>
                  {a.reason && <span style={{ display: "block", color: "var(--ink-3)", fontSize: "0.76rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.reason}</span>}
                </span>
                <span style={{ color: "var(--accent-strong)" }} aria-hidden="true">↗</span>
              </button>
            )) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", color: "var(--ink-2)", fontSize: "0.85rem" }}>
                No models stale, no reviews waiting. Ask Yulia what to source next.
                <button className="wkbtn" type="button" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => ask("What's the highest-leverage thing I could do across my portfolio right now?")}>Ask Yulia</button>
              </div>
            )}
          </div>
        </div>

        <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 4, boxShadow: "var(--wk-elev-card)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1.1 }}>Recent work</div>
            <button type="button" onClick={() => openTab({ kind: "mode-root", modeId: "files", id: "files-root", title: "Files", pinned: true })} style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)" }}>Open Files →</button>
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: "0.84rem", margin: "4px 0 10px" }}>Docs and analyses Yulia produced.</p>
          {workspace.loading ? (
            <YuliaSkeleton rows={3} label="Loading files…" />
          ) : recentFiles.length === 0 ? (
            <div style={{ color: "var(--ink-2)", fontSize: "0.85rem", padding: "8px 0" }}>Generated docs and analyses will collect here.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentFiles.map(f => {
                // Family tonal fill on the icon chip (judged tonal pass):
                // analyses wear the valuation family, docs the info-blue family.
                const tone = isAnalysis(f) ? FAMILY_TONE.valuation : FAMILY_TONE.diligence;
                return (
                <button
                  key={f.id}
                  type="button"
                  className="wk-tap"
                  style={{ appearance: "none", font: "inherit", color: "inherit", margin: 0, border: 0, background: "transparent", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", boxSizing: "border-box", borderBottom: "1px solid var(--line)" }}
                  onClick={() => openFile(f, openTab)}
                >
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
      </div>

      {/* ── Analyses launcher ── */}
      <div className="wksec">
        <button
          type="button"
          className="wk-tap"
          onClick={() => openTab({ kind: "mode-root", modeId: "analysis", id: "analysis-root", title: "Analyses", pinned: true })}
          style={{ appearance: "none", font: "inherit", color: "inherit", margin: 0, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, width: "100%", boxSizing: "border-box", padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "var(--wk-elev-card)" }}
        >
          {/* De-neoned to the valuation family tonal fill — green is rationed to the one CTA */}
          <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: FAMILY_TONE.valuation.soft, color: FAMILY_TONE.valuation.ink }}>
            <V6Icon name="chart" size={18} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: "0.98rem", color: "var(--ink)" }}>Analyses</span>
            <span style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-3)", marginTop: 1 }}>Valuation, QoE, LBO, working capital &amp; more</span>
          </span>
          <span style={{ color: "var(--accent-strong)" }} aria-hidden="true">›</span>
        </button>
      </div>

      {/* ── Deals in motion (deals.today — same 10 rows as mobile) ──
          The HEADER itself is the affordance into the full deals list
          (same destination as the See all link), mirroring mobile's
          tappable SectionHeader-with-chevron. */}
      <div className="wksec">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <button
            type="button"
            onClick={openAllDeals}
            aria-label="See all deals"
            style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "baseline", gap: 7, minWidth: 0 }}
          >
            <span className="wksec-title" style={{ marginBottom: 2 }}>{C.todayIntelTitle}</span>
            <span aria-hidden="true" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>›</span>
          </button>
          <button
            type="button"
            onClick={openAllDeals}
            style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--accent-strong)", whiteSpace: "nowrap" }}
          >
            See all →
          </button>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.88rem", margin: "0 0 14px" }}>{C.todayIntelSub}</p>

        {dealsLoading ? (
          <YuliaSkeleton rows={3} label="Yulia is reading your deals…" />
        ) : todayRows.length === 0 ? (
          <div className="wkcard" style={{ textAlign: "center", color: "var(--ink-2)" }}>
            <div className="wkcard-title">No deals yet</div>
            <div className="wkcard-sub">Start with a deal, thesis, or source file and Yulia will read it here.</div>
            <button className="wkbtn dark" type="button" style={{ marginTop: 14 }} onClick={() => ask("Help me start my first deal.")}>Start with Yulia</button>
          </div>
        ) : (
          <div className="wkcard" style={{ padding: 0, overflow: "hidden" }}>
            {todayRows.map((row, i) => (
              <PipelineRow key={row.id} row={row} last={i === todayRows.length - 1} onOpen={() => openDeal(row.rawId, row.name)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Wave B2 hero + tonal material (consumes shared/verdictMaterial.ts) ── */

/* Ghost glass pill on texture (mobile H.innerButton parity): gradient only,
   no border, no blur. Explicit resets instead of all:unset so the .wk-tap
   class transitions are not overridden by the inline cascade. */
const HERO_PILL: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  minHeight: 34,
  padding: "0 14px",
  borderRadius: 999,
  background: HERO_GHOST_PILL_BG,
  color: "#fff",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
};

/* Family tonal fills (judged tonal pass): icon chips drop uniform surface-2
   for family-colored soft fills. The judged family hexes ARE the
   verdictMaterial tone trios — consume them, never restate:
   valuation→pursue trio, diligence/docs→baseline info-blue trio,
   structure/tax/legal→watch trio. */
const FAMILY_TONE = {
  valuation: VERDICT_MATERIAL.pursue.tone,
  diligence: VERDICT_MATERIAL.baseline.tone,
  structure: VERDICT_MATERIAL.watch.tone,
} as const;

/* The overlay's dark stop as an opaque pre-decode fill — the hero never
   flashes white (or a wrong verdict color) before its texture decodes. */
function heroFallbackFill(kind: VerdictKind): string {
  const stops = VERDICT_MATERIAL[kind].overlay.match(/rgba\([^)]+\)/g);
  const last = stops?.[stops.length - 1];
  return last ? last.replace(/[\d.]+\)$/, "1)") : "#10243E";
}

/* Mobile VerdictPill anatomy on the tonal trio (judged pill aliasing):
   soft bg / ink text from VERDICT_MATERIAL[kind].tone. Judgment pills only —
   status pills elsewhere keep .statpill (--st-*) semantics. */
function TonalVerdictPill({ kind, label, dot = true }: { kind: VerdictKind; label: string; dot?: boolean }) {
  const tone = VERDICT_MATERIAL[kind].tone;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 650, lineHeight: 1, background: tone.soft, color: tone.ink, flexShrink: 0, whiteSpace: "nowrap" }}>
      {dot && <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />}
      {label}
    </span>
  );
}

/* GATE COUNTDOWN CARD — a deal's real position relative to its next gate:
   the gate, the blockers in the way, the DEFINITIVE readiness, the next
   suggested move. Tonal card (not glass — this is a work surface). */
function GateCountdownCard({ item, onOpen, onAsk }: { item: TodayGateCountdownItem; onOpen: () => void; onAsk: () => void }) {
  // Color from REAL state (open items vs clear), never the server's
  // positional round-robin tone — a blocked deal must never read green.
  const open = realBlockers(item.blockers);
  const signal = gateSignalTone(open.length);
  const t = toneTrio(signal);
  return (
    <div className="wkcard" style={{ display: "flex", flexDirection: "column", gap: 10, boxShadow: "var(--wk-elev-card)", borderLeft: `3px solid ${t.mid}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div className="wk-masthead" style={{ fontSize: 18, lineHeight: 1.15, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 2 }}>{item.gateId} · {item.gateName}</div>
        </div>
        <ReadinessBadge state={item.definitive} compact />
      </div>
      {open.length > 0
        ? <BlockerChips blockers={open} tone={signal} />
        : <OpChip label="Ready to advance" tone="cactus" />}
      {item.nextAction && (
        <div style={{ fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.4 }}>
          <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>Next: </span>{item.nextAction}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
        <button className="wkbtn wk-tap" type="button" style={{ flex: 1 }} onClick={onOpen}>Open deal</button>
        <button className="wkbtn wk-tap" type="button" style={{ flex: 1 }} onClick={onAsk}>Ask Yulia</button>
      </div>
    </div>
  );
}

/* Distill the live backlog (stale models + review queue) into ranked,
   runnable action items. Model reruns first (they gate analysis), then the
   review queue. Each carries its real reason — descriptive, never advice. */
interface ActionItem { kind: string; label: string; reason: string; tone: TodayTone; prompt: string }
function buildActionItems(ob: TodayOperatingBrief | null): ActionItem[] {
  if (!ob) return [];
  const out: ActionItem[] = [];
  for (const m of ob.modelRefreshNeeds.slice(0, 3)) {
    out.push({
      kind: "Rerun",
      label: `${m.modelTitle}${m.dealTitle ? ` · ${m.dealTitle}` : ""}`,
      reason: m.reason || m.statusLabel,
      tone: m.status === "needs_rerun" ? "plum" : "gold",
      prompt: m.recomputePrompt || `Rerun ${m.modelTitle}${m.dealTitle ? ` for ${m.dealTitle}` : ""} — the inputs changed.`,
    });
  }
  for (const f of ob.filesNeedingReview.slice(0, 3)) {
    // Tone from real state: disclosure-ready is good (cactus), everything
    // else is attention (gold) — never the server's positional tone.
    const ready = f.definitiveDisclosureStatus === "ready_for_user_controlled_disclosure";
    out.push({
      kind: ready ? "Ready" : "Review",
      label: `${f.title}${f.dealTitle ? ` · ${f.dealTitle}` : ""}`,
      reason: f.reason || f.status,
      tone: ready ? "cactus" : "gold",
      prompt: `Walk me through ${f.title}${f.dealTitle ? ` on ${f.dealTitle}` : ""} — what needs my eye?`,
    });
  }
  return out.slice(0, 5);
}

function PipelineRow({ row, last, onOpen }: { row: MobilePipelineRow; last: boolean; onOpen: () => void }) {
  const verdict = (row as any).verdict as string | undefined;
  return (
    <button
      type="button"
      className="wk-tap"
      style={{ appearance: "none", font: "inherit", color: "inherit", margin: 0, border: 0, background: "transparent", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "14px 18px", borderBottom: last ? "none" : "1px solid var(--line)" }}
      onClick={onOpen}
    >
      <span className="logo">{initials(row.name)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--ink)", fontWeight: 600, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
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

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function prettySlug(slug: string): string {
  return (slug || "Untitled").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function statusLabel(status: string): string {
  return (status || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
