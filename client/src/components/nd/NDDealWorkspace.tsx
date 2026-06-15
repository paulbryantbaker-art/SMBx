/* ============================================================================
   NDDealWorkspace — the functional deal workspace for the nd shell. Opening a
   deal lands here: TopBar identity + a tab bar (Deal brief · Data room · Team ·
   Model), each wired to REAL endpoints. THE LINE + honest-empty preserved.
   AGENT_DESKTOP_CUTOVER_PLAN.md — Phase 2 (the #1 working surface).
   ============================================================================ */
import { useEffect, useMemo, useState } from "react";
import { authHeaders, type User } from "../../hooks/useAuth";
import { useTodayOperatingBrief } from "../../hooks/useTodayOperatingBrief";
import { realBlockers } from "../v6/shared/operatingPrimitives";
import type { ChatBridge } from "../v6/V6App";
import { TopBar, EmptyChart, LoadingBlock, ErrorState } from "./chrome";
import { Ic, Btn, type PillTone } from "./primitives";
import { DealBrief, type KpiItem, type RiskItem } from "./surfaces/DealBrief";
import { CanvasData, type DataFolder } from "./surfaces/DealCanvas";
import { CDDealTeam } from "../cd/pages/CDDealTeam";

type Ws = "brief" | "data" | "team" | "model";
const WS_TABS: { key: Ws; label: string; ic: string }[] = [
  { key: "brief", label: "Deal brief", ic: "doc" },
  { key: "data", label: "Data room", ic: "grid" },
  { key: "team", label: "Team", ic: "comment" },
  { key: "model", label: "Model", ic: "bars" },
];

interface DealRec {
  id: number; business_name: string | null; industry: string | null; location: string | null;
  journey_type: string; current_gate: string; revenue: number | null; sde: number | null;
  ebitda: number | null; asking_price: number | null; league: string | null;
}
interface DealBriefResp {
  verdict?: { label?: string; text?: string };
  marketRead?: { headline?: string; bullets?: string[]; researchNeeded?: string[] };
  taxLegal?: { tax?: string; legal?: string };
}
interface RoomFolder { id: number; name: string; document_count?: number; status?: string }
interface RoomDoc { id: number; folder_id: number | null; status?: string; is_stale?: boolean }

function fmtCents(c?: number | null): string {
  if (c == null || !isFinite(c)) return "—";
  const d = c / 100;
  if (d >= 1e9) return `$${(d / 1e9).toFixed(d >= 1e10 ? 0 : 1)}B`;
  if (d >= 1e6) return `$${(d / 1e6).toFixed(d >= 1e7 ? 0 : 1)}M`;
  if (d >= 1e3) return `$${(d / 1e3).toFixed(0)}K`;
  return `$${Math.round(d)}`;
}
const JOURNEY = (j?: string) => (j || "buy").toUpperCase();
const GATE_TO_STAGE: Record<string, string> = {
  // map gate codes to the buy-lifecycle breadcrumb labels (best-effort)
};
function titleCase(s: string) { return s.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

export function NDDealWorkspace({ dealId, user, chat, onAsk }: { dealId: string; user: User | null; chat: ChatBridge; onAsk: (p: string) => void }) {
  const numId = /^\d+$/.test(dealId) ? parseInt(dealId, 10) : null;
  const [tab, setTab] = useState<Ws>("brief");
  const [deal, setDeal] = useState<DealRec | null>(null);
  const [brief, setBrief] = useState<DealBriefResp | null>(null);
  const [room, setRoom] = useState<{ folders: RoomFolder[]; documents: RoomDoc[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operating = useTodayOperatingBrief(user ?? null, !!user && numId !== null);

  useEffect(() => {
    if (numId === null) { setDeal(null); return; }
    let cancelled = false;
    // clear the prior deal so a switch shows a loading state, never the wrong deal's data
    setLoading(true); setError(null); setDeal(null); setBrief(null); setRoom(null); setTab("brief");
    // The deal record gates the page; brief + data room load independently (never block).
    fetch(`/api/deals/${numId}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`deal ${r.status}`)))
      .then((d: any) => { if (!cancelled) setDeal(d?.deal ?? d); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    fetch(`/api/agency/deals/${numId}/brief`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null).then(b => { if (!cancelled) setBrief(b); }).catch(() => {});
    fetch(`/api/deals/${numId}/data-room`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null).then(rm => { if (!cancelled && rm) setRoom({ folders: rm.folders ?? [], documents: rm.documents ?? [] }); }).catch(() => {});
    return () => { cancelled = true; };
  }, [numId]);

  const dealName = deal?.business_name || `Deal #${dealId}`;
  const gate = useMemo(() => (operating.brief?.gateCountdown ?? []).find(g => g.dealId === String(numId)), [operating.brief, numId]);

  /* ── Deal brief (real or honest "—") ── */
  const kpis: KpiItem[] = [
    { label: "Revenue", value: fmtCents(deal?.revenue), empty: deal?.revenue == null },
    { label: "EBITDA", value: fmtCents(deal?.ebitda), empty: deal?.ebitda == null },
    { label: "Asking", value: fmtCents(deal?.asking_price), empty: deal?.asking_price == null },
    { label: "Implied IRR", value: "—", empty: true },
  ];
  const risks: RiskItem[] = (brief?.marketRead?.researchNeeded ?? []).slice(0, 4).map(r => ({ name: r, evidence: "Surfaced by Yulia's read — open the deal to dig in.", severity: "Medium" }));
  const thesisText = brief?.verdict?.text || brief?.marketRead?.headline || "";

  /* ── Data room (real folders/docs) ── */
  const folders: DataFolder[] = (room?.folders ?? []).map(f => {
    const docs = (room?.documents ?? []).filter(d => d.folder_id === f.id);
    const stale = docs.some(d => d.is_stale);
    return {
      name: f.name,
      count: `${f.document_count ?? docs.length} file${(f.document_count ?? docs.length) === 1 ? "" : "s"}`,
      status: stale ? "Needs refresh" : (f.status ? titleCase(f.status) : "Indexed"),
      tone: (stale ? "warn" : "neutral") as PillTone,
    };
  });

  if (loading && !deal) return <div className="mck-grow" style={{ padding: 28 }}><LoadingBlock label="Yulia is opening the deal…" /></div>;
  if (error && !deal) return <div className="mck-grow mck-row" style={{ justifyContent: "center", padding: 40 }}><ErrorState title="Couldn't open the deal" sub={error} onRetry={() => setDeal(null)} /></div>;

  return (
    <div className="mck-grow mck-col" style={{ minWidth: 0, minHeight: 0 }}>
      <TopBar deal={dealName} target={[deal?.industry, deal?.location].filter(Boolean).join(" · ") || "—"} side={`${JOURNEY(deal?.journey_type).toLowerCase()}-side`} journey={JOURNEY(deal?.journey_type)} stageActive={gate?.gateName || deal?.current_gate || ""} />

      {/* deal-workspace tab bar */}
      <div className="mck-row" style={{ gap: 4, padding: "8px 20px 0", borderBottom: "1px solid var(--line)" }}>
        {WS_TABS.map(t => (
          <button key={t.key} className={"mck-tab" + (tab === t.key ? " is-active" : "")} onClick={() => setTab(t.key)}>
            <Ic name={t.ic} size={14} />{t.label}
          </button>
        ))}
        <span className="mck-grow" />
        <span className="mck-eyebrow" style={{ alignSelf: "center" }}>Maintained by Yulia</span>
      </div>

      <div className="mck-grow" style={{ overflow: "auto", minHeight: 0 }}>
        {tab === "brief" && (
          <DealBrief
            name={dealName} target={deal?.industry || "—"} side={`${JOURNEY(deal?.journey_type).toLowerCase()}-side`}
            journey={JOURNEY(deal?.journey_type)} stageActive={gate?.gateName || deal?.current_gate || ""}
            chromeless
            thesis={thesisText || undefined}
            kpis={kpis}
            risks={risks}
            onOpenModel={() => setTab("model")}
            onAdjustAssumptions={() => onAsk(`Adjust the model assumptions for ${dealName}.`)}
            onRescanDataRoom={() => onAsk(`Re-scan the data room for ${dealName} and flag what's missing.`)}
            onRerunThesis={() => onAsk(`Re-run your investment thesis for ${dealName}.`)}
          />
        )}
        {tab === "data" && (
          <div style={{ padding: "22px 24px" }}>
            {room ? (
              folders.length > 0
                ? <CanvasData folders={folders} reviewBanner={`${room.documents.length} file${room.documents.length === 1 ? "" : "s"} indexed across ${folders.length} folder${folders.length === 1 ? "" : "s"}.`} />
                : <EmptyChart title="No data room yet" sub="Upload documents or ask Yulia to set up the diligence folders for this deal." />
            ) : <LoadingBlock label="Loading the data room…" />}
          </div>
        )}
        {tab === "team" && (
          <CDDealTeam dealId={dealId} dealTitle={dealName} user={user} onTalkToYulia={onAsk} />
        )}
        {tab === "model" && (
          <div style={{ padding: "22px 24px", maxWidth: 880, margin: "0 auto" }}>
            <EmptyChart title="No model built yet" sub="Ask Yulia to build a base-case model — she'll run the analysis and open it here." />
            <div className="mck-row" style={{ justifyContent: "center", marginTop: 14 }}>
              <Btn variant="ink" size="md" icon="agent" onClick={() => onAsk(`Build a base-case model for ${dealName} and walk me through the returns.`)}>Ask Yulia to build the model</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
