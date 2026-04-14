/**
 * DealWorkspace — desktop-only, deep-linkable 3-pane workspace for a single deal.
 *
 * Route: /deal/:id
 *
 * Structure: three floating cards on the dot-grid canvas.
 *   Left   — Yulia for this deal (scoped chat preview + "Continue →")
 *   Center — Deal record: header + tabbed body (Overview / Documents / Team)
 *   Right  — Next action + recent artifacts + quick actions
 *
 * Not a replacement for chat — a supervisor surface. Chat still happens in /chat/:convId.
 * From here you can jump into chat, open a document, or check on team activity.
 */

import { useEffect, useMemo, useState } from 'react';
import { authHeaders } from '../../hooks/useAuth';
import { deriveNextAction, deriveUrgency, daysSince, type DealCardData } from '../mobile/DealCard';
import DealMessagesPanel from '../documents/DealMessagesPanel';

/* ───────── Journey palette (matches DealCard) ───────── */
const JOURNEY_COLORS: Record<string, string> = {
  sell: '#D44A78',
  buy: '#3E8E8E',
  raise: '#C99A3E',
  pmi: '#8F4A7A',
};

const JOURNEY_LABEL: Record<string, string> = {
  sell: 'Selling',
  buy: 'Buying',
  raise: 'Raising',
  pmi: 'PMI',
};

const GATE_LABEL: Record<string, string> = {
  S0: 'Intake', S1: 'Financials', S2: 'Valuation', S3: 'Packaging', S4: 'Market Matching', S5: 'Closing',
  B0: 'Thesis', B1: 'Sourcing', B2: 'Valuation', B3: 'Due Diligence', B4: 'Structuring', B5: 'Closing',
  R0: 'Intake', R1: 'Financial Package', R2: 'Investor Materials', R3: 'Outreach', R4: 'Terms', R5: 'Closing',
  PMI0: 'Day 0', PMI1: 'Stabilization', PMI2: 'Assessment', PMI3: 'Optimization',
};

/* ───────── Minimal conversation shape surfaced by authChat ───────── */
interface ConvPreview {
  id: number;
  updated_at?: string;
  title?: string | null;
  last_message_preview?: string | null;
}

export interface DealWorkspaceDeal extends DealCardData {
  conversations?: ConvPreview[];
}

interface Deliverable {
  id: number;
  name: string | null;
  slug: string | null;
  status: string;
  tier?: string | null;
  gate?: string | null;
  journey?: string | null;
  created_at: string;
  completed_at?: string | null;
}

interface Props {
  deal: DealWorkspaceDeal | null;
  dark: boolean;
  currentUserEmail?: string;
  onContinueChat: (conversationId: number) => void;
  onOpenDeliverable: (id: number, label: string) => void;
  onOpenDataRoom: (dealId: number) => void;
  onBack: () => void;
}

type CenterTab = 'overview' | 'documents' | 'team';

/* ───────── CARD CHROME — the floating-card language ───────── */
const cardChrome = (dark: boolean): React.CSSProperties => ({
  background: dark ? '#151617' : '#FFFFFF',
  border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E5E1D9',
  borderRadius: 14,
  boxShadow: dark
    ? '0 1px 2px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.25)'
    : '0 1px 2px rgba(60,55,45,0.06), 0 4px 8px rgba(60,55,45,0.04)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  minWidth: 0,
});

const LS_DW_TAB = 'smbx-deal-workspace-tab';

export default function DealWorkspace({
  deal, dark, currentUserEmail,
  onContinueChat, onOpenDeliverable, onOpenDataRoom, onBack,
}: Props) {
  const [centerTab, setCenterTab] = useState<CenterTab>(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(LS_DW_TAB) as CenterTab) : null;
    return saved === 'documents' || saved === 'team' || saved === 'overview' ? saved : 'overview';
  });
  const [deliverables, setDeliverables] = useState<Deliverable[] | null>(null);
  const [deliverablesError, setDeliverablesError] = useState<string | null>(null);
  const [deliverablesRefresh, setDeliverablesRefresh] = useState(0);

  useEffect(() => { localStorage.setItem(LS_DW_TAB, centerTab); }, [centerTab]);

  const primaryConvId = deal?.conversations?.[0]?.id ?? null;
  const dealId = deal?.id ?? null;

  // Fetch deliverables whenever the deal changes
  useEffect(() => {
    if (!dealId) { setDeliverables(null); return; }
    let cancelled = false;
    setDeliverables(null);
    setDeliverablesError(null);
    fetch(`/api/deals/${dealId}/deliverables`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data: any) => {
        if (cancelled) return;
        const list: Deliverable[] = Array.isArray(data) ? data : (data?.deliverables || []);
        setDeliverables(list);
      })
      .catch(err => { if (!cancelled) setDeliverablesError(err.message || 'Couldn\u2019t load artifacts'); });
    return () => { cancelled = true; };
  }, [dealId, deliverablesRefresh]);

  /* ───────── Not found ───────── */
  if (!deal) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ ...cardChrome(dark), padding: 32, maxWidth: 420, textAlign: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, fontSize: 18, color: dark ? '#F0F0F3' : '#1A1C1E', marginBottom: 8 }}>
            Deal not found
          </div>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F', margin: '0 0 16px' }}>
            The deal you linked to isn&rsquo;t in your portfolio, or it may have been archived.
          </p>
          <button
            onClick={onBack}
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              background: dark ? '#E8709A' : '#D44A78',
              color: '#fff',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to deals
          </button>
        </div>
      </div>
    );
  }

  /* ───────── Derivations ───────── */
  const journey = (deal.journey_type || 'sell').toLowerCase();
  const journeyColor = JOURNEY_COLORS[journey] || JOURNEY_COLORS.sell;
  const journeyLabel = JOURNEY_LABEL[journey] || 'Deal';
  const gateLabel = GATE_LABEL[deal.current_gate || ''] || deal.current_gate || 'New';
  const urgency = deriveUrgency(deal);
  const nextAction = deriveNextAction(deal);
  const stale = daysSince(deal.updated_at);
  const business = deal.business_name || 'Untitled deal';

  /* ───────── Colors ───────── */
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const subtleBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(15,16,18,0.02)';

  const urgencyColor = urgency === 'stuck' ? '#D44A4A' : urgency === 'needs-you' ? '#C99A3E' : '#2F7A4E';
  const urgencyLabel = urgency === 'stuck' ? 'Stuck' : urgency === 'needs-you' ? 'Needs you' : 'On track';

  /* ───────── Render ───────── */
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gap: 16,
        padding: 16,
        gridTemplateColumns: 'minmax(320px, 400px) minmax(440px, 1fr) minmax(280px, 360px)',
        gridTemplateRows: '100%',
        minHeight: 0,
        minWidth: 0,
      }}
      className="deal-workspace-grid"
    >
      {/* ══════════════ LEFT PANE — Yulia for this deal ══════════════ */}
      <section style={cardChrome(dark)} aria-label={`Yulia chat for ${business}`}>
        <header style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D44A78 0%, #E8709A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, fontSize: 13,
          }}>Y</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: heading, letterSpacing: '-0.01em' }}>
              Yulia
            </div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: muted }}>
              on {business}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* Working brief — Yulia-voice summary the user can act on */}
          <div style={{
            background: subtleBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}>
            <div style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: muted,
              marginBottom: 6,
            }}>Working brief</div>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: body,
              margin: 0,
            }}>
              {buildWorkingBrief(deal, nextAction)}
            </p>
          </div>

          {/* Recent conversation pointer */}
          {deal.conversations && deal.conversations.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: "'Sora', system-ui, sans-serif",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: muted,
                marginBottom: 8,
              }}>
                {deal.conversations.length > 1 ? `Chapters (${deal.conversations.length})` : 'Latest chapter'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deal.conversations.slice(0, 4).map(c => (
                  <button
                    key={c.id}
                    onClick={() => onContinueChat(c.id)}
                    type="button"
                    className="deal-workspace-conv"
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: dark ? '#1A1C1E' : '#FFFFFF',
                      color: body,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: journeyColor, flexShrink: 0 }}>
                      forum
                    </span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title || `Chapter ${c.id}`}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: muted, flexShrink: 0 }}>
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Continue CTA — always visible at bottom of left card */}
        <div style={{ padding: 12, borderTop: `1px solid ${border}`, background: subtleBg }}>
          <button
            onClick={() => primaryConvId ? onContinueChat(primaryConvId) : null}
            type="button"
            disabled={!primaryConvId}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              background: primaryConvId ? (dark ? '#E8709A' : '#D44A78') : (dark ? 'rgba(255,255,255,0.08)' : '#EEEAE2'),
              color: primaryConvId ? '#FFFFFF' : muted,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              cursor: primaryConvId ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: primaryConvId
                ? '0 4px 14px rgba(212,74,120,0.22)'
                : 'none',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
            {primaryConvId ? 'Continue with Yulia' : 'No conversation yet'}
          </button>
        </div>
      </section>

      {/* ══════════════ CENTER PANE — Deal record ══════════════ */}
      <section style={cardChrome(dark)} aria-label={`${business} deal record`}>
        {/* Hero header with journey color rail */}
        <header style={{ padding: '0 0 16px 0', borderBottom: `1px solid ${border}` }}>
          <div style={{ height: 4, background: journeyColor, width: '100%' }} />
          <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={onBack}
              type="button"
              title="Back to deals"
              aria-label="Back"
              className="deal-workspace-back"
              style={{
                width: 34, height: 34,
                padding: 0,
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: 'transparent',
                color: body,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                margin: 0,
                fontFamily: "'Sora', system-ui, sans-serif",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: heading,
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {business}
              </h1>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Chip label={journeyLabel} color={journeyColor} dark={dark} />
                <Chip label={gateLabel} color={muted} outline dark={dark} />
                <DotChip color={urgencyColor} label={urgencyLabel} dark={dark} />
                {deal.industry && <span style={{ fontSize: 12, color: muted, fontFamily: "'Inter', system-ui, sans-serif" }}>{deal.industry}</span>}
                {deal.league && <span style={{ fontSize: 12, color: muted, fontFamily: "'Inter', system-ui, sans-serif" }}>&bull; {deal.league}</span>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav role="tablist" style={{ marginTop: 14, padding: '0 20px', display: 'flex', gap: 6 }}>
            <TabButton label="Overview" icon="info" active={centerTab === 'overview'} onClick={() => setCenterTab('overview')} color={journeyColor} dark={dark} />
            <TabButton label="Documents" icon="folder_open" active={centerTab === 'documents'} onClick={() => setCenterTab('documents')} color={journeyColor} dark={dark} />
            <TabButton label="Team" icon="groups" active={centerTab === 'team'} onClick={() => setCenterTab('team')} color={journeyColor} dark={dark} />
          </nav>
        </header>

        {/* Tab body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {centerTab === 'overview' && (
            <OverviewTab deal={deal} dark={dark} stale={stale} nextAction={nextAction} />
          )}
          {centerTab === 'documents' && (
            <DocumentsTab
              deliverables={deliverables}
              error={deliverablesError}
              dark={dark}
              onOpen={(d) => onOpenDeliverable(d.id, d.name || `Document #${d.id}`)}
              onOpenDataRoom={() => dealId && onOpenDataRoom(dealId)}
            />
          )}
          {centerTab === 'team' && dealId && (
            <div style={{ height: '100%', padding: 0 }}>
              <DealMessagesPanel dealId={dealId} currentUserEmail={currentUserEmail} />
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ RIGHT PANE — Next actions + artifacts ══════════════ */}
      <section style={cardChrome(dark)} aria-label="Actions and activity">
        <header style={{ padding: '14px 16px', borderBottom: `1px solid ${border}` }}>
          <div style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: muted,
          }}>Next for you</div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Next action — big pink card */}
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: dark ? 'rgba(232,112,154,0.08)' : 'rgba(212,74,120,0.05)',
            border: `1px solid ${dark ? 'rgba(232,112,154,0.22)' : 'rgba(212,74,120,0.18)'}`,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: dark ? '#E8709A' : '#D44A78',
              marginBottom: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dark ? '#E8709A' : '#D44A78' }} />
              Yulia suggests
            </div>
            <p style={{
              margin: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.4,
              color: heading,
            }}>
              {nextAction}
            </p>
            {primaryConvId && (
              <button
                onClick={() => onContinueChat(primaryConvId)}
                type="button"
                style={{
                  marginTop: 12,
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: dark ? '#E8709A' : '#D44A78',
                  color: '#fff',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Take action →
              </button>
            )}
          </div>

          {/* Recent artifacts */}
          <div>
            <div style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: muted,
              marginBottom: 8,
            }}>Recent artifacts</div>
            {!deliverables && !deliverablesError && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      height: 44,
                      borderRadius: 10,
                      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)',
                      border: `1px solid ${border}`,
                      animation: 'dwSkel 1.4s ease-in-out infinite',
                    }}
                  />
                ))}
              </div>
            )}
            {deliverablesError && (
              <div style={{ fontSize: 12, color: muted, fontFamily: "'Inter', system-ui, sans-serif", padding: '8px 0' }}>
                Couldn&rsquo;t load artifacts.{' '}
                <button
                  onClick={() => setDeliverablesRefresh(n => n + 1)}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: journeyColor,
                    cursor: 'pointer',
                    fontWeight: 700,
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            {deliverables && deliverables.length === 0 && (
              <div style={{ fontSize: 12, color: muted, fontFamily: "'Inter', system-ui, sans-serif", padding: '8px 0', lineHeight: 1.5 }}>
                No artifacts yet. Ask Yulia for a ValueLens, CIM, or thesis to generate one.
              </div>
            )}
            {deliverables && deliverables.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deliverables.slice(0, 6).map(d => (
                  <ArtifactRow
                    key={d.id}
                    deliverable={d}
                    dark={dark}
                    onOpen={() => onOpenDeliverable(d.id, d.name || `Document #${d.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <div style={{
              fontFamily: "'Sora', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: muted,
              marginBottom: 8,
            }}>Quick actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <QuickAction icon="lock" label="Open data room" dark={dark} onClick={() => dealId && onOpenDataRoom(dealId)} />
              <QuickAction icon="share" label="Share deal link" dark={dark} onClick={() => {
                const url = window.location.href;
                const nav: any = navigator;
                if (typeof nav.share === 'function') {
                  nav.share({ title: business, url }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                }
              }} />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .deal-workspace-conv:hover { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)'} !important; }
        .deal-workspace-back:hover { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.04)'} !important; }
        @keyframes dwSkel { 0%,100% { opacity: 0.5 } 50% { opacity: 0.9 } }
        @media (max-width: 1180px) {
          .deal-workspace-grid {
            grid-template-columns: minmax(320px, 380px) minmax(440px, 1fr) !important;
          }
          .deal-workspace-grid > section:nth-child(3) { display: none; }
        }
        @media (max-width: 900px) {
          .deal-workspace-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════ SUBCOMPONENTS ═══════════════ */

function Chip({ label, color, outline, dark }: { label: string; color: string; outline?: boolean; dark: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.02em',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: outline ? 'transparent' : (dark ? `${color}24` : `${color}14`),
      color: outline ? color : color,
      border: outline ? `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,16,18,0.08)'}` : 'none',
    }}>
      {label}
    </span>
  );
}

function DotChip({ color, label, dark }: { color: string; label: string; dark: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px 3px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.01em',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,16,18,0.03)',
      color: dark ? '#F0F0F3' : '#1A1C1E',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}

function TabButton({
  label, icon, active, onClick, color, dark,
}: { label: string; icon: string; active: boolean; onClick: () => void; color: string; dark: boolean }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      type="button"
      className="deal-workspace-tab"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px 10px',
        border: 'none',
        background: 'transparent',
        color: active ? (dark ? '#F0F0F3' : '#1A1C1E') : (dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F'),
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        letterSpacing: '-0.005em',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: active ? color : 'currentColor' }}>{icon}</span>
      {label}
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 8, right: 8, bottom: -1, height: 2,
            borderRadius: 2,
            background: color,
          }}
        />
      )}
    </button>
  );
}

function OverviewTab({
  deal, dark, stale, nextAction,
}: { deal: DealWorkspaceDeal; dark: boolean; stale: number; nextAction: string }) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';

  const facts = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];
    if (deal.journey_type) rows.push({ label: 'Journey', value: deal.journey_type });
    if (deal.current_gate) rows.push({ label: 'Gate', value: deal.current_gate });
    if (deal.industry) rows.push({ label: 'Industry', value: deal.industry });
    if (deal.league) rows.push({ label: 'League', value: deal.league });
    rows.push({ label: 'Status', value: deal.status || 'active' });
    rows.push({ label: 'Last activity', value: stale === 0 ? 'Today' : stale === 1 ? 'Yesterday' : `${stale} days ago` });
    return rows;
  }, [deal, stale]);

  return (
    <div style={{ padding: '18px 20px' }}>
      <section style={{ marginBottom: 22 }}>
        <h2 style={{
          margin: 0,
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: muted,
          marginBottom: 8,
        }}>Where this deal stands</h2>
        <p style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
          color: body,
        }}>
          {nextAction}. {stale >= 7 ? `It\u2019s been ${stale} days since you last moved on this — Yulia\u2019s kept the context warm.` : 'Yulia is tracking everything across sessions.'}
        </p>
      </section>

      <section>
        <h2 style={{
          margin: 0,
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: muted,
          marginBottom: 10,
        }}>Facts on file</h2>
        <div style={{
          border: `1px solid ${border}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {facts.map((f, i) => (
            <div
              key={f.label}
              style={{
                display: 'flex',
                padding: '10px 14px',
                borderBottom: i === facts.length - 1 ? 'none' : `1px solid ${border}`,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
              }}
            >
              <span style={{ width: 120, color: muted, flexShrink: 0 }}>{f.label}</span>
              <span style={{ color: heading, fontWeight: 600 }}>{f.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentsTab({
  deliverables, error, dark, onOpen, onOpenDataRoom,
}: {
  deliverables: Deliverable[] | null;
  error: string | null;
  dark: boolean;
  onOpen: (d: Deliverable) => void;
  onOpenDataRoom: () => void;
}) {
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';
  const body = dark ? 'rgba(240,240,243,0.78)' : '#3C3D40';

  return (
    <div style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{
          margin: 0,
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: muted,
        }}>Deliverables</h2>
        <button
          onClick={onOpenDataRoom}
          type="button"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${border}`,
            background: 'transparent',
            color: body,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
          Open data room
        </button>
      </div>

      {!deliverables && !error && (
        <div style={{ fontSize: 13, color: muted, fontFamily: "'Inter', system-ui, sans-serif" }}>Loading documents…</div>
      )}
      {error && (
        <div style={{ fontSize: 13, color: muted, fontFamily: "'Inter', system-ui, sans-serif" }}>Couldn&rsquo;t load documents.</div>
      )}
      {deliverables && deliverables.length === 0 && (
        <div style={{
          border: `1px dashed ${border}`,
          borderRadius: 12,
          padding: 22,
          textAlign: 'center',
          color: body,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          lineHeight: 1.5,
        }}>
          <div style={{ fontSize: 26, color: muted, marginBottom: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>description</span>
          </div>
          <div style={{ fontWeight: 700, color: heading, marginBottom: 4 }}>No documents yet</div>
          Ask Yulia for a ValueLens, CIM, thesis, or any deliverable — it&rsquo;ll appear here when it&rsquo;s ready.
        </div>
      )}

      {deliverables && deliverables.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {deliverables.map(d => (
            <ArtifactRow key={d.id} deliverable={d} dark={dark} onOpen={() => onOpen(d)} expanded />
          ))}
        </div>
      )}
    </div>
  );
}

function ArtifactRow({
  deliverable, dark, onOpen, expanded = false,
}: { deliverable: Deliverable; dark: boolean; onOpen: () => void; expanded?: boolean }) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const muted = dark ? 'rgba(240,240,243,0.55)' : '#6B6C6F';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';

  const done = deliverable.status === 'complete';
  const running = deliverable.status === 'generating' || deliverable.status === 'queued';
  const failed = deliverable.status === 'failed';

  const statusColor = done ? '#2F7A4E' : running ? '#C99A3E' : failed ? '#D44A4A' : muted;
  const statusLabel = done ? 'Ready' : running ? 'Generating' : failed ? 'Failed' : deliverable.status;
  const name = deliverable.name || deliverable.slug || `Document #${deliverable.id}`;

  return (
    <button
      onClick={onOpen}
      type="button"
      disabled={!done}
      className="deal-workspace-artifact"
      style={{
        textAlign: 'left',
        padding: expanded ? '12px 14px' : '10px 12px',
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: 'transparent',
        color: heading,
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: done ? 'pointer' : 'default',
        opacity: done ? 1 : 0.7,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: expanded ? 20 : 18, color: muted, flexShrink: 0 }}
      >
        {done ? 'description' : running ? 'hourglass_top' : 'error'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: expanded ? 13 : 12.5,
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        {expanded && (
          <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>
            {deliverable.gate && `${deliverable.gate} • `}
            {new Date(deliverable.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: statusColor,
        flexShrink: 0,
      }}>
        {statusLabel}
      </span>
    </button>
  );
}

function QuickAction({
  icon, label, onClick, dark,
}: { icon: string; label: string; onClick: () => void; dark: boolean }) {
  const heading = dark ? '#F0F0F3' : '#1A1C1E';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#E5E1D9';

  return (
    <button
      onClick={onClick}
      type="button"
      className="deal-workspace-qa"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: 'transparent',
        color: heading,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 17, opacity: 0.78 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─── Build working brief from deal state ─── */
function buildWorkingBrief(deal: DealWorkspaceDeal, nextAction: string): string {
  const journey = (deal.journey_type || 'sell').toLowerCase();
  const business = deal.business_name || 'this deal';
  const gate = deal.current_gate || '';
  const industry = deal.industry;

  const journeyClause = {
    sell: `We\u2019re selling ${business}`,
    buy: `We\u2019re evaluating ${business} as an acquisition`,
    raise: `${business} is raising capital`,
    pmi: `${business} just closed — now integrating`,
  }[journey] || `Working on ${business}`;

  const contextClause = industry ? ` in ${industry}` : '';
  const gateClause = gate ? `. Currently at ${gate}.` : '.';

  return `${journeyClause}${contextClause}${gateClause} ${nextAction}.`;
}
