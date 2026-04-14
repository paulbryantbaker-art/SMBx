/**
 * SourcingCommandCenter — desktop wrapper around the existing SourcingPanel
 * that adds operator chrome: a 5-stage pipeline progress strip at top, and
 * a view-switcher to flip between the list (theses + matches) and a
 * Kanban board grouping theses by pipeline status.
 *
 * We deliberately keep the existing SourcingPanel as-is and wrap it, rather
 * than rewriting. Map view is a future sprint — not added here as a phantom
 * tab.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import SourcingPanel from '../chat/SourcingPanel';

interface Thesis {
  id: number;
  name: string;
  industry: string | null;
  geography: string | null;
  min_revenue: number | null;
  max_revenue: number | null;
  status: string;
  match_count: number;
  new_matches: number;
  pursuing_count: number;
  total_matches: number;
  created_at: string;
}

interface Portfolio {
  id: number;
  thesis_id: number;
  name: string;
  pipeline_status: string;
  stage_progress: { stage?: number; pct?: number; message?: string };
  total_candidates: number;
  a_tier_count: number;
  b_tier_count: number;
  c_tier_count: number;
  d_tier_count: number;
}

type View = 'list' | 'board';

/* Stage labels per methodology v17 — 5-stage sourcing pipeline. */
const STAGES: Array<{ key: string; label: string; short: string }> = [
  { key: 'intel',       label: 'Intelligence brief',       short: 'Intel' },
  { key: 'discovery',   label: 'Candidate discovery',      short: 'Discovery' },
  { key: 'enrichment',  label: 'Website enrichment',       short: 'Enrich' },
  { key: 'scoring',     label: 'Scoring & tiering',        short: 'Score' },
  { key: 'outreach',    label: 'Outreach & engagement',    short: 'Outreach' },
];

/* Map pipeline_status values (fuzzy) to stage indexes so we can show progress without strict enum. */
function stageIndex(status: string | null | undefined): number {
  const s = (status || '').toLowerCase();
  if (s.includes('complete') || s.includes('done') || s.includes('outreach')) return 4;
  if (s.includes('scor') || s.includes('tier')) return 3;
  if (s.includes('enrich')) return 2;
  if (s.includes('discover') || s.includes('search')) return 1;
  if (s.includes('brief') || s.includes('intel')) return 0;
  return 0;
}

interface Props {
  dark: boolean;
}

export default function SourcingCommandCenter({ dark }: Props) {
  const [view, setView] = useState<View>(() => (localStorage.getItem('smbx-sourcing-view') as View) || 'list');
  const [theses, setTheses] = useState<Thesis[] | null>(null);
  const [portfolios, setPortfolios] = useState<Record<number, Portfolio>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('smbx-sourcing-view', view); }, [view]);

  const fetchTheses = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/sourcing/theses', { headers: authHeaders() });
      if (res.ok) {
        const data: Thesis[] = await res.json();
        setTheses(Array.isArray(data) ? data : []);
      } else {
        setError("Couldn't load theses — try again?");
        setTheses([]);
      }
    } catch {
      setError("Couldn't load theses — try again?");
      setTheses([]);
    }
  }, []);

  const fetchPortfolios = useCallback(async (thesisList: Thesis[]) => {
    const results = await Promise.all(thesisList.map(async t => {
      try {
        const r = await fetch(`/api/sourcing/theses/${t.id}/portfolio`, { headers: authHeaders() });
        if (r.ok) return [t.id, await r.json()] as const;
      } catch { /* ignore */ }
      return [t.id, null] as const;
    }));
    const map: Record<number, Portfolio> = {};
    for (const [id, p] of results) if (p) map[id] = p;
    setPortfolios(map);
  }, []);

  useEffect(() => { fetchTheses(); }, [fetchTheses]);
  useEffect(() => {
    if (theses && theses.length > 0) fetchPortfolios(theses);
  }, [theses, fetchPortfolios]);

  /* ───── Aggregate stage distribution for progress header ───── */
  const stageDist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    if (theses) {
      for (const t of theses) {
        const p = portfolios[t.id];
        const idx = p ? stageIndex(p.pipeline_status) : 0;
        counts[idx]++;
      }
    }
    return counts;
  }, [theses, portfolios]);

  const total = stageDist.reduce((a, b) => a + b, 0);

  /* ───── Palette ───── */
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const borderC = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const subtleBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.015)';
  const pink = dark ? '#E8709A' : '#D44A78';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'transparent' }}>
      {/* Header: stage strip + view switcher */}
      <div style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${borderC}`,
        background: subtleBg,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: heading,
            flex: 1,
          }}>
            Sourcing
          </h1>
          <div style={{
            display: 'inline-flex',
            borderRadius: 999,
            padding: 3,
            border: `1px solid ${borderC}`,
            background: dark ? '#1A1C1E' : '#FFFFFF',
          }}>
            <ViewChip icon="list" label="List" active={view === 'list'} onClick={() => setView('list')} dark={dark} />
            <ViewChip icon="view_kanban" label="Board" active={view === 'board'} onClick={() => setView('board')} dark={dark} />
          </div>
        </div>

        {total > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
            {STAGES.map((s, i) => {
              const count = stageDist[i];
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div
                  key={s.key}
                  title={`${s.label}: ${count} ${count === 1 ? 'thesis' : 'theses'}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: count > 0
                      ? (dark ? 'rgba(232,112,154,0.10)' : 'rgba(212,74,120,0.06)')
                      : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.02)'),
                    border: `1px solid ${count > 0 ? (dark ? 'rgba(232,112,154,0.22)' : 'rgba(212,74,120,0.14)') : borderC}`,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: count > 0 ? pink : muted,
                    marginBottom: 4,
                  }}>
                    {s.short}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: heading, fontFamily: "'Sora', system-ui, sans-serif", letterSpacing: '-0.01em' }}>
                    {count}
                  </div>
                  <div style={{
                    height: 3,
                    borderRadius: 2,
                    marginTop: 6,
                    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.06)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: count > 0 ? pink : 'transparent',
                      transition: 'width 220ms ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {error && view === 'board' && (
          <div style={{
            padding: 48,
            textAlign: 'center',
            color: muted,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
          }}>
            {error}{' '}
            <button
              onClick={fetchTheses}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: pink,
                cursor: 'pointer',
                fontWeight: 700,
                padding: 0,
              }}
            >
              retry
            </button>
          </div>
        )}
        {!error && view === 'list' && (
          <SourcingPanel isFullscreen={false} />
        )}
        {!error && view === 'board' && (
          <BoardView
            theses={theses}
            portfolios={portfolios}
            dark={dark}
            heading={heading}
            body={body}
            muted={muted}
            borderC={borderC}
            pink={pink}
            onSwitchToList={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}

/* ───────── SUBCOMPONENTS ───────── */

function ViewChip({
  icon, label, active, onClick, dark,
}: { icon: string; label: string; active: boolean; onClick: () => void; dark: boolean }) {
  const pink = dark ? '#E8709A' : '#D44A78';
  return (
    <button
      onClick={onClick}
      type="button"
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 999,
        border: 'none',
        background: active
          ? (dark ? 'rgba(232,112,154,0.16)' : 'rgba(212,74,120,0.08)')
          : 'transparent',
        color: active ? pink : (dark ? 'rgba(240,240,243,0.78)' : '#3C3D40'),
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12.5,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );
}

function BoardView({
  theses, portfolios, dark, heading, muted, borderC, pink, onSwitchToList,
}: {
  theses: Thesis[] | null;
  portfolios: Record<number, Portfolio>;
  dark: boolean;
  heading: string;
  body: string;
  muted: string;
  borderC: string;
  pink: string;
  onSwitchToList: () => void;
}) {
  if (!theses) {
    return <BoardSkeleton dark={dark} borderC={borderC} />;
  }
  if (theses.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: muted, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13 }}>
        <div style={{
          fontSize: 16, fontWeight: 800, color: heading,
          fontFamily: "'Sora', system-ui, sans-serif", marginBottom: 8, letterSpacing: '-0.01em',
        }}>
          No theses yet
        </div>
        <div style={{ marginBottom: 16, maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.55 }}>
          Ask Yulia to start sourcing a target — e.g. &ldquo;find me HVAC businesses in Texas doing $3&ndash;10M in revenue.&rdquo; She&rsquo;ll create the thesis and walk through the 5-stage pipeline.
        </div>
        <button
          onClick={onSwitchToList}
          type="button"
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: `1px solid ${pink}`,
            background: 'transparent',
            color: pink,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Go to list view to create one
        </button>
      </div>
    );
  }

  // Group theses by stage
  const byStage: Thesis[][] = STAGES.map(() => []);
  for (const t of theses) {
    const p = portfolios[t.id];
    const idx = p ? stageIndex(p.pipeline_status) : 0;
    byStage[idx].push(t);
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))`,
      gap: 12,
      padding: 16,
      minHeight: '100%',
      overflowX: 'auto',
    }}>
      {STAGES.map((stage, i) => (
        <div
          key={stage.key}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 200,
            background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.015)',
            border: `1px solid ${borderC}`,
            borderRadius: 12,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <div style={{
            padding: '10px 12px',
            borderBottom: `1px solid ${borderC}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: "'Sora', system-ui, sans-serif",
          }}>
            <div>
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: muted,
              }}>
                Stage {i + 1}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: heading,
                letterSpacing: '-0.01em',
              }}>
                {stage.label}
              </div>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)',
              color: heading,
            }}>{byStage[i].length}</span>
          </div>
          <div style={{ flex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
            {byStage[i].map(t => (
              <ThesisCard
                key={t.id}
                thesis={t}
                portfolio={portfolios[t.id]}
                dark={dark}
                heading={heading}
                muted={muted}
                borderC={borderC}
                pink={pink}
              />
            ))}
            {byStage[i].length === 0 && (
              <div style={{
                padding: 16,
                textAlign: 'center',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11,
                color: muted,
                lineHeight: 1.5,
              }}>
                {i === 0 ? 'Intel brief starts each thesis' :
                 i === 1 ? 'Candidates land here next' :
                 i === 2 ? 'Enrichment scores websites' :
                 i === 3 ? 'A/B/C/D tiering happens here' :
                 'Outreach pipeline'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ThesisCard({
  thesis, portfolio, dark, heading, muted, borderC, pink,
}: {
  thesis: Thesis;
  portfolio?: Portfolio;
  dark: boolean;
  heading: string;
  muted: string;
  borderC: string;
  pink: string;
}) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 10,
      border: `1px solid ${borderC}`,
      background: dark ? '#1A1C1E' : '#FFFFFF',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: heading,
        letterSpacing: '-0.005em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: 4,
      }}>
        {thesis.name}
      </div>
      <div style={{ fontSize: 11, color: muted, marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {thesis.industry && <span>{thesis.industry}</span>}
        {thesis.industry && thesis.geography && <span>•</span>}
        {thesis.geography && <span>{thesis.geography}</span>}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: 8,
        borderTop: `1px solid ${borderC}`,
        fontSize: 11,
        fontWeight: 700,
      }}>
        {thesis.total_matches > 0 ? (
          <span style={{ color: pink }}>{thesis.total_matches} candidates</span>
        ) : (
          <span style={{ color: muted }}>No candidates yet</span>
        )}
        {thesis.new_matches > 0 && (
          <span style={{
            padding: '1px 6px',
            borderRadius: 999,
            background: dark ? 'rgba(212,74,120,0.18)' : 'rgba(212,74,120,0.10)',
            color: pink,
            fontSize: 10,
          }}>
            +{thesis.new_matches} new
          </span>
        )}
        <span style={{ marginLeft: 'auto', color: muted, fontWeight: 500 }}>
          {portfolio?.stage_progress?.pct ? `${Math.round(portfolio.stage_progress.pct)}%` : thesis.status}
        </span>
      </div>
    </div>
  );
}

function BoardSkeleton({ dark, borderC }: { dark: boolean; borderC: string }) {
  const sk = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,16,18,0.05)';
  const colBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(15,16,18,0.015)';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))`,
      gap: 12,
      padding: 16,
      minHeight: 300,
    }}>
      {STAGES.map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 280,
            background: colBg,
            border: `1px solid ${borderC}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '12px 12px 10px',
            borderBottom: `1px solid ${borderC}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{ width: 60, height: 10, background: sk, borderRadius: 4, animation: 'sourcingSkel 1.4s ease-in-out infinite' }} />
            <div style={{ marginLeft: 'auto', width: 22, height: 14, background: sk, borderRadius: 999, animation: 'sourcingSkel 1.4s ease-in-out infinite' }} />
          </div>
          <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
              <div
                key={j}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${borderC}`,
                  background: dark ? '#1A1C1E' : '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ width: '75%', height: 11, background: sk, borderRadius: 4, animation: 'sourcingSkel 1.4s ease-in-out infinite' }} />
                <div style={{ width: '55%', height: 9, background: sk, borderRadius: 4, animation: 'sourcingSkel 1.4s ease-in-out infinite' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 2, paddingTop: 8, borderTop: `1px solid ${borderC}` }}>
                  <div style={{ width: 50, height: 10, background: sk, borderRadius: 4, animation: 'sourcingSkel 1.4s ease-in-out infinite' }} />
                  <div style={{ marginLeft: 'auto', width: 28, height: 10, background: sk, borderRadius: 4, animation: 'sourcingSkel 1.4s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes sourcingSkel { 0%,100% { opacity: 0.5 } 50% { opacity: 0.9 } }`}</style>
    </div>
  );
}
