/**
 * Atlas — MANDATES BAND (advisor multi-mandate roll-up, Phase 3).
 *
 * A full-width band on Today for an advisor running 2+ sell-side mandates:
 * portfolio totals (active mandates, buyers in play, live offers, expiring soon)
 * + a per-mandate list that deep-links to each deal's Cockpit. Real data via
 * useAdvisorMandates.
 *
 * THE LINE (load-bearing): SHOWS aggregate activity and time-sensitive DATES and
 * STOPS. No synthesized urgency/priority score, no default sort by urgency, no
 * "highest priority / act first / best" badge. The list loads in a NEUTRAL order
 * (most-recently-updated); the user may switch to Name. Time signals are factual
 * countdowns (shared ExpiryPill: <0 "Expired", <=7d amber). Money integer cents;
 * null → "—". Navigation only — the human acts from the Cockpit.
 *
 * Polish standard: KpiCards float as siblings, the list is one Card, separated by
 * tone (padding) not divider lines; plain title, no eyebrow kicker.
 */
import { useMemo, useState } from "react";
import type { MandateRow, MandateTotals, MandateStage } from "../../../../hooks/useAdvisorMandates";
import { BUYER_STAGES } from "../../../../hooks/useDealBuyers";
import { T } from "../atlasTokens";
import { Card, KpiCard, Pill, Segmented, fmtCents, ExpiryPill, daysUntil } from "../primitives";
import { ChevronRightIcon } from "../icons";

const STAGE_LABEL: Record<string, string> = Object.fromEntries(BUYER_STAGES.map((s) => [s.id, s.label]));

const DECISION_LINE = "Atlas shows mandate activity and time-sensitive dates. You decide what to work on.";

type Sort = "recent" | "name";

/** The soonest of an offer-expiry and an exclusivity-window date (earliest by
 *  calendar), or null. A plain date fact — not a priority. */
function soonestExpiry(m: MandateRow): string | null {
  const ds = [m.offers.soonestOfferExpiresAt, m.offers.soonestExclusivityExpiresAt].filter(
    (x): x is string => !!x,
  );
  if (!ds.length) return null;
  return ds.reduce((a, b) => (new Date(a).getTime() <= new Date(b).getTime() ? a : b));
}

export default function MandatesBand({
  mandates,
  totals,
  loading,
  error,
  onOpenDeal,
}: {
  mandates: MandateRow[];
  totals: MandateTotals | null;
  loading: boolean;
  error: string | null;
  onOpenDeal: (dealId: number, name: string) => void;
}) {
  const [sort, setSort] = useState<Sort>("recent");

  const rows = useMemo(() => {
    const copy = [...mandates];
    if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    else copy.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")); // most-recently-updated
    return copy;
  }, [mandates, sort]);

  // "Expiring soon" = an offer or exclusivity window with a date in the next 7
  // days. A transparent date filter, not a judgment — surfaced because it's near.
  const expiringSoon = useMemo(
    () => mandates.filter((m) => { const d = daysUntil(soonestExpiry(m)); return d != null && d >= 0 && d <= 7; }).length,
    [mandates],
  );

  const kpi = (v: number | null | undefined) => (v == null ? "—" : String(v));

  return (
    <div style={S.band}>
      <div style={S.head}>
        <div style={S.title}>Your sell-side mandates</div>
        <Segmented<Sort>
          options={[
            { id: "recent", label: "Recent" },
            { id: "name", label: "Name" },
          ]}
          value={sort}
          onChange={setSort}
        />
      </div>
      <div style={S.decision}>{DECISION_LINE}</div>

      {/* portfolio totals — floating KPI tiles */}
      <div style={S.kpis}>
        <KpiCard label="Active mandates" value={kpi(totals?.activeMandates ?? mandates.length)} />
        <KpiCard label="Buyers in play" value={kpi(totals?.buyersInPlay)} />
        <KpiCard label="Live offers" value={kpi(totals?.liveOffers)} />
        <KpiCard label="Expiring soon" value={kpi(expiringSoon)} delta="next 7 days" />
      </div>

      {/* per-mandate list */}
      {error ? (
        <div style={S.note}>{error}</div>
      ) : loading && mandates.length === 0 ? (
        <div style={S.note}>Loading mandates…</div>
      ) : (
        <Card style={{ marginTop: 12, padding: "4px 16px" }}>
          {rows.map((m, i) => (
            <MandateRowView key={m.dealId} m={m} first={i === 0} onOpen={() => onOpenDeal(m.dealId, m.name)} />
          ))}
        </Card>
      )}
    </div>
  );
}

function MandateRowView({ m, first, onOpen }: { m: MandateRow; first: boolean; onOpen: () => void }) {
  const furthest = m.buyers.furthestStage ? STAGE_LABEL[m.buyers.furthestStage as MandateStage] : null;
  const parts: string[] = [];
  parts.push(`${m.buyers.total} buyer${m.buyers.total === 1 ? "" : "s"}`);
  if (furthest) parts.push(`furthest ${furthest}`);
  parts.push(`${m.offers.live} live offer${m.offers.live === 1 ? "" : "s"}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(); }}
      style={{ ...S.row, borderTop: first ? "none" : `1px solid ${T.rowDiv2}` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.hover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={S.rowTop}>
          <span style={S.name}>{m.name}</span>
          {m.currentGate && <Pill bg={T.blueBg} fg={T.blue}>{m.currentGate}</Pill>}
          <ExpiryPill iso={soonestExpiry(m)} />
        </div>
        <div style={S.rowSub}>{parts.join(" · ")}</div>
      </div>
      {m.offers.highestOfferCents != null && (
        <div style={S.money}>
          <div style={S.moneyVal}>{fmtCents(m.offers.highestOfferCents)}</div>
          <div style={S.moneyLabel}>highest offer</div>
        </div>
      )}
      <ChevronRightIcon size={16} c={T.faint} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  band: { width: "100%" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 15, fontWeight: 600, color: T.ink },
  decision: { fontSize: 12, color: T.muted2, marginTop: 6, lineHeight: 1.45 },

  kpis: { display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" },

  note: { fontSize: 13, color: T.muted, marginTop: 14 },

  row: { display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", cursor: "pointer", borderRadius: 8 },
  rowTop: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  rowSub: { fontSize: 12, color: T.muted2, marginTop: 3 },
  name: { fontSize: 14, fontWeight: 600, color: T.ink },
  money: { textAlign: "right", flex: "none" },
  moneyVal: { fontSize: 13.5, fontWeight: 600, color: T.ink3 },
  moneyLabel: { fontSize: 10.5, color: T.muted2, marginTop: 1 },
};
