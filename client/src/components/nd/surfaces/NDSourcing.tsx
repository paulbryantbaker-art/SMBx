/* ============================================================================
   NDSourcing — the off-market deal-sourcing command center, wired to the REAL
   sourcing engine (server/routes/sourcing.ts): buyer theses → 5-stage pipeline →
   ranked, tiered candidate businesses, with live SSE scan progress.

   States, all honest:
   - no theses          → "start a sourcing thesis" (quick-create + Ask Yulia)
   - thesis, no scan     → "Run discovery" (POST pipeline)
   - scanning            → live SSE progress (usePipelineProgress)
   - ready, 0 candidates → honest empty (no Places key / nothing matched)
   - ready, candidates    → ranked tier table (A/B/C/D), route status inline

   Money note: thesis min/max_revenue are DOLLARS; candidate
   estimated_revenue_*_cents are CENTS. Formatted accordingly.
   THE LINE: Yulia discovers & ranks; outreach is never sent from here.
   ============================================================================ */
import { useCallback, useEffect, useMemo, useState } from "react";
import { authHeaders, type User } from "../../../hooks/useAuth";
import { usePipelineProgress } from "../../../hooks/usePipelineProgress";
import { Ic, Avatar, Mono, Btn, StatusPill, Dot, type PillTone } from "../primitives";
import { EmptyChart, LoadingBlock } from "../chrome";

interface Thesis {
  id: number; name: string; industry: string | null; naics_code: string | null; geography: string | null;
  min_revenue: number | null; max_revenue: number | null; status: string;
  match_count?: number; pursuing_count?: number; total_matches?: number; new_matches?: number;
}
interface Portfolio {
  id: number; thesis_id: number; name?: string; pipeline_status: string;
  total_candidates?: number; a_tier_count?: number; b_tier_count?: number; c_tier_count?: number; d_tier_count?: number;
  stage_progress?: { stage?: number; pct?: number; message?: string };
}
interface Candidate {
  id: number; name: string; city?: string | null; state?: string | null; website_url?: string | null;
  estimated_revenue_low_cents?: number | null; estimated_revenue_high_cents?: number | null;
  total_score?: number | null; tier?: string | null; pipeline_status?: string;
  succession_signals?: string[]; owner_dependency_signals?: string[]; recurring_revenue_signals?: string[];
  ai_summary?: string | null;
}

function fmtDollars(d?: number | null): string {
  if (d == null || !isFinite(d)) return "—";
  if (d >= 1e9) return `$${(d / 1e9).toFixed(1)}B`;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d >= 1e7 ? 0 : 1)}M`;
  if (d >= 1e3) return `$${Math.round(d / 1e3)}K`;
  return `$${Math.round(d)}`;
}
const fmtCents = (c?: number | null) => fmtDollars(c == null ? null : c / 100);
function revBand(t: Thesis): string {
  if (t.min_revenue == null && t.max_revenue == null) return "";
  return `${fmtDollars(t.min_revenue)}–${fmtDollars(t.max_revenue)} rev`;
}
function candRev(c: Candidate): string {
  const lo = c.estimated_revenue_low_cents, hi = c.estimated_revenue_high_cents;
  if (lo == null && hi == null) return "—";
  if (lo != null && hi != null) return `${fmtCents(lo)}–${fmtCents(hi)}`;
  return fmtCents(lo ?? hi);
}
const TIER_TONE: Record<string, PillTone> = { A: "ok", B: "ok", C: "warn", D: "neutral" };
function ownerSignal(c: Candidate): string {
  const s = [...(c.succession_signals || []), ...(c.owner_dependency_signals || [])].filter(Boolean);
  if (s.length) return s[0];
  if ((c.recurring_revenue_signals || []).length) return c.recurring_revenue_signals![0];
  return c.ai_summary ? c.ai_summary.slice(0, 60) : "—";
}

export function NDSourcing({
  user, onAsk, stageDealsCount, onOpenStageDeals,
}: {
  user: User | null;
  onAsk: (prompt: string) => void;
  /** count of deals already in the sourcing stage (the in-pipeline view lives in the lifecycle list) */
  stageDealsCount: number;
  onOpenStageDeals: () => void;
}) {
  const [theses, setTheses] = useState<Thesis[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selId, setSelId] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loadingCands, setLoadingCands] = useState(false);
  const [scanId, setScanId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { progress } = usePipelineProgress(scanId);

  const loadTheses = useCallback(() => {
    if (!user) return;
    fetch("/api/sourcing/theses", { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`theses ${r.status}`)))
      .then((d: Thesis[]) => { setTheses(Array.isArray(d) ? d : []); setError(null); })
      .catch((e: Error) => { setTheses([]); setError(e.message); });
  }, [user]);
  useEffect(() => { loadTheses(); }, [loadTheses]);

  // when a thesis is selected, load its portfolio + candidates
  const loadPortfolio = useCallback((thesisId: number) => {
    setPortfolio(null); setCandidates(null);
    fetch(`/api/sourcing/portfolios?thesisId=${thesisId}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error()))
      .then((list: Portfolio[]) => {
        const p = (list || [])[0] || null; // most recent
        setPortfolio(p);
        if (p && /ready|stale|scoring|enriching/.test(p.pipeline_status)) {
          setLoadingCands(true);
          fetch(`/api/sourcing/portfolios/${p.id}/candidates?limit=100`, { headers: authHeaders() })
            .then(r => r.ok ? r.json() : Promise.reject(new Error()))
            .then((cd: { candidates?: Candidate[] }) => setCandidates(cd.candidates || []))
            .catch(() => setCandidates([]))
            .finally(() => setLoadingCands(false));
        }
      })
      .catch(() => setPortfolio(null));
  }, []);
  useEffect(() => { if (selId != null) loadPortfolio(selId); }, [selId, loadPortfolio]);

  // when a live scan reaches ready, reload the portfolio/candidates
  useEffect(() => {
    if (progress && /ready|failed/.test(progress.pipelineStatus)) {
      setScanId(null);
      if (selId != null) loadPortfolio(selId);
    }
  }, [progress, selId, loadPortfolio]);

  const runDiscovery = (thesisId: number) => {
    fetch(`/api/sourcing/theses/${thesisId}/pipeline`, { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: "{}" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error()))
      .then((d: { portfolioId?: number }) => { if (d.portfolioId) { setScanId(d.portfolioId); loadPortfolio(thesisId); } })
      .catch(() => {});
  };

  const routeCandidate = (c: Candidate, status: string) => {
    setCandidates(prev => (prev || []).map(x => x.id === c.id ? { ...x, pipeline_status: status } : x));
    fetch(`/api/sourcing/candidates/${c.id}`, { method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).catch(() => {});
  };

  const sel = useMemo(() => (theses || []).find(t => t.id === selId) || null, [theses, selId]);

  if (theses === null) return <div className="mck-grow" style={{ padding: 28 }}><LoadingBlock label="Yulia is loading your sourcing theses…" /></div>;

  return (
    <div className="mck-col mck-grow" style={{ minWidth: 0, height: "100%" }}>
      <div className="mck-row" style={{ gap: 12, height: 54, flex: "0 0 54px", padding: "0 26px", borderBottom: "1px solid var(--line)" }}>
        <Ic name="st_source" size={17} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Sourcing</span>
        {theses.length > 0 && <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{theses.length} {theses.length === 1 ? "thesis" : "theses"}</span>}
        <div className="mck-grow" />
        {stageDealsCount > 0 && <Btn variant="ghost" size="sm" icon="st_source" onClick={onOpenStageDeals}>{stageDealsCount} in pipeline</Btn>}
        <Btn variant="ink" size="sm" icon="plus" onClick={() => setCreating(true)}>New thesis</Btn>
      </div>

      {error && <div className="mck-pill mck-pill-risk" style={{ alignSelf: "flex-start", margin: "12px 26px 0" }}>{error}</div>}

      {theses.length === 0 ? (
        <SourcingEmpty onCreate={() => setCreating(true)} onAsk={onAsk} stageDealsCount={stageDealsCount} onOpenStageDeals={onOpenStageDeals} />
      ) : (
        <div className="mck-grow" style={{ display: "flex", minHeight: 0 }}>
          {/* thesis rail */}
          <div className="mck-col" style={{ width: 300, flex: "0 0 300px", borderRight: "1px solid var(--line)", overflow: "auto", padding: "14px 12px", gap: 7 }}>
            {theses.map(t => (
              <button key={t.id} className={"mck-card"} onClick={() => setSelId(t.id)}
                style={{ width: "100%", textAlign: "left", padding: "12px 13px", cursor: "pointer", boxShadow: selId === t.id ? "0 0 0 1.5px var(--accent)" : undefined }}>
                <div className="mck-col" style={{ gap: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{[t.industry, t.geography].filter(Boolean).join(" · ") || "Any industry"}</span>
                  <div className="mck-row" style={{ gap: 7, marginTop: 3 }}>
                    {revBand(t) && <span className="mck-pill mck-pill-neutral" style={{ fontSize: 10 }}>{revBand(t)}</span>}
                    {(t.total_matches ?? t.match_count ?? 0) > 0 && <span className="mck-pill mck-pill-ok" style={{ fontSize: 10 }}>{t.total_matches ?? t.match_count} matches</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* detail */}
          <div className="mck-grow mck-scrollfade" style={{ overflow: "auto", minHeight: 0, padding: "22px 26px" }}>
            {!sel ? (
              <EmptyChart icon="st_source" title="Pick a thesis" sub="Select a sourcing thesis on the left to see its ranked off-market targets." />
            ) : (
              <ThesisDetail
                thesis={sel} portfolio={portfolio} candidates={candidates} loadingCands={loadingCands}
                scanning={scanId != null} progress={scanId != null ? progress : null}
                onRunDiscovery={() => runDiscovery(sel.id)} onRoute={routeCandidate} onAsk={onAsk}
              />
            )}
          </div>
        </div>
      )}

      {creating && <NewThesisModal onClose={() => setCreating(false)} onCreated={(t) => { setCreating(false); loadTheses(); setSelId(t.id); }} onAsk={onAsk} />}
    </div>
  );
}

/* ---- empty state (no theses) ---- */
function SourcingEmpty({ onCreate, onAsk, stageDealsCount, onOpenStageDeals }: { onCreate: () => void; onAsk: (p: string) => void; stageDealsCount: number; onOpenStageDeals: () => void }) {
  return (
    <div className="mck-grow mck-col" style={{ justifyContent: "center", alignItems: "center", padding: 40, gap: 18 }}>
      <div className="mck-empty" style={{ maxWidth: 520 }}>
        <span className="mck-empty-ic"><Ic name="st_source" size={18} /></span>
        <div className="mck-empty-t">Start sourcing off-market targets</div>
        <div className="mck-empty-s">Define what you're hunting — industry, geography, size — and Yulia scans the market, ranks the best founder-owned targets by fit, and builds an intelligence brief. No deals get contacted until you say so.</div>
        <div className="mck-row" style={{ gap: 9, marginTop: 6 }}>
          <Btn variant="ink" size="md" icon="plus" onClick={onCreate}>New thesis</Btn>
          <Btn variant="ghost" size="md" icon="agent" onClick={() => onAsk("Help me build a sourcing thesis — I want to find acquisition targets.")}>Ask Yulia</Btn>
        </div>
      </div>
      {stageDealsCount > 0 && (
        <button className="mck-row" onClick={onOpenStageDeals} style={{ gap: 7, background: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 12.5 }}>
          <Ic name="st_source" size={13} /> You also have <b style={{ color: "var(--ink-2)" }}>{stageDealsCount}</b> deal{stageDealsCount === 1 ? "" : "s"} already in the sourcing stage <Ic name="chevRight" size={13} />
        </button>
      )}
    </div>
  );
}

/* ---- selected-thesis detail (portfolio + candidates) ---- */
function ThesisDetail({
  thesis, portfolio, candidates, loadingCands, scanning, progress, onRunDiscovery, onRoute, onAsk,
}: {
  thesis: Thesis; portfolio: Portfolio | null; candidates: Candidate[] | null; loadingCands: boolean;
  scanning: boolean; progress: ReturnType<typeof usePipelineProgress>["progress"];
  onRunDiscovery: () => void; onRoute: (c: Candidate, status: string) => void; onAsk: (p: string) => void;
}) {
  const hasReadyPortfolio = portfolio && /ready|stale|scoring|enriching/.test(portfolio.pipeline_status);
  const isScanning = scanning || (portfolio && /initializing|brief_generating|expanding|enriching|scoring/.test(portfolio.pipeline_status));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="mck-row" style={{ gap: 12, alignItems: "flex-start" }}>
        <div className="mck-col" style={{ gap: 3, flex: 1 }}>
          <h2 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{thesis.name}</h2>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{[thesis.industry, thesis.geography, revBand(thesis), thesis.naics_code && `NAICS ${thesis.naics_code}`].filter(Boolean).join(" · ") || "Any industry · any geography"}</span>
        </div>
        <Btn variant="ghost" size="sm" icon="agent" onClick={() => onAsk(`Refine my sourcing thesis "${thesis.name}".`)}>Refine</Btn>
      </div>

      {/* portfolio status / discovery trigger */}
      {!portfolio && !isScanning && (
        <div className="mck-card" style={{ padding: 20 }}>
          <div className="mck-row" style={{ gap: 12 }}>
            <span className="mck-col" style={{ gap: 3, flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>No targets discovered yet</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>Run discovery and Yulia builds an intelligence brief, scans the market, and ranks founder-owned targets by fit.</span>
            </span>
            <Btn variant="ink" size="md" icon="spark" onClick={onRunDiscovery}>Run discovery</Btn>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="mck-card" style={{ padding: 20 }}>
          <div className="mck-row" style={{ gap: 10, marginBottom: 12 }}>
            <Dot tone="accent" pulse />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Yulia is scanning the market…</span>
            <span className="mck-grow" />
            {progress && <Mono className="mck-tnum" style={{ fontSize: 12, color: "var(--ink-3)" }}>{progress.totalCandidates} found</Mono>}
          </div>
          <div className="mck-grow" style={{ height: 6, borderRadius: 3, background: "var(--surface-3)", position: "relative" }}>
            <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.max(6, progress?.stageProgress?.pct ?? portfolio?.stage_progress?.pct ?? 8)}%`, borderRadius: 3, background: "var(--accent)", transition: "width .4s" }} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8, display: "block" }}>{progress?.stageProgress?.message || portfolio?.stage_progress?.message || "Generating the intelligence brief…"}</span>
        </div>
      )}

      {/* candidate table */}
      {hasReadyPortfolio && (
        loadingCands ? <LoadingBlock label="Loading ranked targets…" />
          : (candidates && candidates.length > 0) ? (
            <>
              <div className="mck-row" style={{ gap: 9 }}>
                <span className="mck-eyebrow">Ranked targets</span>
                <span className="mck-pill mck-pill-neutral" style={{ height: 18, padding: "0 7px", fontSize: 10 }}>{candidates.length}</span>
                {portfolio && (portfolio.a_tier_count ?? 0) + (portfolio.b_tier_count ?? 0) > 0 && (
                  <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{(portfolio.a_tier_count ?? 0)} A-tier · {(portfolio.b_tier_count ?? 0)} B-tier</span>
                )}
              </div>
              <div className="mck-card" style={{ overflow: "hidden" }}>
                <table className="mck-tbl">
                  <thead><tr>
                    <th style={{ paddingLeft: 16 }}>Company</th><th>Location</th><th>Est. revenue</th><th>Signal</th><th>Fit</th><th>Tier</th><th></th>
                  </tr></thead>
                  <tbody>
                    {candidates.map(c => (
                      <tr key={c.id}>
                        <td style={{ paddingLeft: 16 }}>
                          <div className="mck-row" style={{ gap: 11 }}>
                            <Avatar name={c.name} size={28} />
                            <span className="mck-col" style={{ gap: 1 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                              {c.website_url && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "var(--ink-2)" }}>{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                        <td><Mono className="mck-tnum" style={{ color: candRev(c) === "—" ? "var(--ink-4)" : "var(--ink)" }}>{candRev(c)}</Mono></td>
                        <td style={{ color: "var(--ink-2)", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ownerSignal(c)}</td>
                        <td>
                          <div className="mck-row" style={{ gap: 9 }}>
                            <Mono className="mck-tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{c.total_score != null ? Math.round(c.total_score) : "—"}</Mono>
                            <span className="mck-meter"><span style={{ width: `${Math.max(0, Math.min(100, c.total_score ?? 0))}%` }} /></span>
                          </div>
                        </td>
                        <td>{c.tier ? <StatusPill tone={TIER_TONE[c.tier] || "neutral"} dot={c.tier !== "D"}>{c.tier}</StatusPill> : <span style={{ color: "var(--ink-4)" }}>—</span>}</td>
                        <td style={{ width: 120 }}>
                          {c.pipeline_status === "pursuing"
                            ? <StatusPill tone="yulia" dot>Pursuing</StatusPill>
                            : <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={() => onRoute(c, "pursuing")}>Pursue</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyChart icon="st_source" title="No targets matched yet"
              sub="The scan completed but found no qualifying targets — try widening the thesis (geography or size band), or ask Yulia to adjust the criteria." />
          )
      )}
    </div>
  );
}

/* ---- new-thesis quick create (real POST /api/sourcing/theses) ---- */
function NewThesisModal({ onClose, onCreated, onAsk }: { onClose: () => void; onCreated: (t: Thesis) => void; onAsk: (p: string) => void }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [geography, setGeography] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim() || busy) return;
    setBusy(true); setErr(null);
    const body = {
      name: name.trim(),
      industry: industry.trim() || undefined,
      geography: geography.trim() || undefined,
      minRevenue: minRevenue ? Number(minRevenue) : undefined,
      maxRevenue: maxRevenue ? Number(maxRevenue) : undefined,
    };
    fetch("/api/sourcing/theses", { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`create ${r.status}`)))
      .then((t: Thesis) => onCreated(t))
      .catch((e: Error) => { setErr(e.message); setBusy(false); });
  };

  return (
    <div className="mck-scrim" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
      <div className="mck-card" onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: "92vw", padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
        <div className="mck-row" style={{ gap: 9 }}>
          <Ic name="st_source" size={17} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>New sourcing thesis</span>
          <span className="mck-grow" />
          <button className="mck-iconbtn" onClick={onClose}><Ic name="x" size={15} /></button>
        </div>
        <Field label="Name" value={name} onChange={setName} placeholder="e.g. Midwest HVAC roll-up" autoFocus />
        <Field label="Industry" value={industry} onChange={setIndustry} placeholder="e.g. HVAC services" />
        <Field label="Geography" value={geography} onChange={setGeography} placeholder="e.g. Texas, or Midwest" />
        <div className="mck-row" style={{ gap: 11 }}>
          <Field label="Min revenue ($)" value={minRevenue} onChange={setMinRevenue} placeholder="1000000" numeric />
          <Field label="Max revenue ($)" value={maxRevenue} onChange={setMaxRevenue} placeholder="10000000" numeric />
        </div>
        {err && <span className="mck-pill mck-pill-risk" style={{ alignSelf: "flex-start" }}>{err}</span>}
        <div className="mck-row" style={{ gap: 9, marginTop: 4 }}>
          <Btn variant="ghost" size="sm" icon="agent" onClick={() => { onClose(); onAsk("Help me build a sourcing thesis — I want to find acquisition targets."); }}>Let Yulia build it</Btn>
          <span className="mck-grow" />
          <button className="mck-btn mck-btn-ghost mck-btn-sm" onClick={onClose}>Cancel</button>
          <button className="mck-btn mck-btn-ink mck-btn-sm" onClick={submit} disabled={!name.trim() || busy}><Ic name={busy ? "spark" : "plus"} size={13} />{busy ? "Creating…" : "Create thesis"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, numeric, autoFocus }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean; autoFocus?: boolean }) {
  return (
    <label className="mck-col" style={{ gap: 5, flex: 1 }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{label}</span>
      <input
        value={value} placeholder={placeholder} autoFocus={autoFocus}
        inputMode={numeric ? "numeric" : undefined}
        onChange={e => onChange(numeric ? e.target.value.replace(/[^\d]/g, "") : e.target.value)}
        style={{ height: 36, padding: "0 11px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 13, color: "var(--ink)", outline: "none", width: "100%" }}
      />
    </label>
  );
}
