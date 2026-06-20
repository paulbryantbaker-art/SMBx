/**
 * Atlas — BUYER FUNNEL card (advisor sell-side cockpit, Phase 1).
 *
 * The acquirer universe an advisor markets a SELL mandate to, with a per-buyer
 * funnel: Identified → Contacted → NDA signed → CIM sent → IOI → LOI (+ Passed).
 * Rendered on the deal Cockpit for sell-side deals. Real data via useDealBuyers.
 *
 * THE LINE: this TRACKS funnel status and lets the advisor DRAFT outreach (routes
 * to Yulia) — it never contacts a buyer. "Do not contact" excludes a buyer and
 * disables the draft action for them.
 *
 * Polish standard: floats on the canvas, T.border + shCard, tone not lines.
 */
import { useMemo, useState } from "react";
import type { User } from "../../../../hooks/useAuth";
import {
  useDealBuyers,
  BUYER_STAGES,
  BUYER_TYPES,
  type DealBuyer,
  type BuyerStage,
  type BuyerType,
} from "../../../../hooks/useDealBuyers";
import { T } from "../atlasTokens";
import { Pill } from "../primitives";
import { PlusIcon, CloseIcon, SendArrowIcon } from "../icons";

const TYPE_TONE: Record<BuyerType, { bg: string; fg: string }> = {
  strategic: { bg: T.blueBg, fg: T.blue },
  financial: { bg: T.violetBg, fg: T.violet },
  individual: { bg: T.track, fg: T.muted2 },
};

const ALL_STAGES: { id: BuyerStage; label: string }[] = [...BUYER_STAGES, { id: "passed", label: "Passed" }];

export default function BuyerFunnel({
  user,
  dealId,
  dealName,
  onAskYulia,
}: {
  user: User | null;
  dealId: number;
  dealName: string;
  onAskYulia: (prompt: string) => void;
}) {
  const { buyers, loading, error, canFetch, addBuyer, updateBuyer, removeBuyer } = useDealBuyers(user, dealId);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<BuyerType>("strategic");

  const counts = useMemo(() => {
    const m = new Map<BuyerStage, number>();
    for (const s of BUYER_STAGES) m.set(s.id, 0);
    let passed = 0;
    for (const b of buyers) {
      if (b.stage === "passed") passed++;
      else m.set(b.stage, (m.get(b.stage) ?? 0) + 1);
    }
    return { m, passed, active: buyers.length - passed };
  }, [buyers]);

  const sorted = useMemo(() => {
    const order = (b: DealBuyer) => (b.stage === "passed" ? 99 : BUYER_STAGES.findIndex((s) => s.id === b.stage));
    return [...buyers].sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
  }, [buyers]);

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    void addBuyer({ name: n, buyer_type: type });
    setName("");
    setType("strategic");
    setAdding(false);
  };

  return (
    <div style={S.card}>
      {/* header + funnel counts */}
      <div style={S.head}>
        <div style={S.title}>Buyers</div>
        <button type="button" style={S.addBtn} onClick={() => setAdding((v) => !v)}>
          <PlusIcon size={14} c={T.blue} /> Add buyer
        </button>
      </div>

      {buyers.length > 0 && (
        <div style={S.funnel}>
          {BUYER_STAGES.map((s) => (
            <div key={s.id} style={S.fStep}>
              <div style={S.fCount}>{counts.m.get(s.id) ?? 0}</div>
              <div style={S.fLabel}>{s.label}</div>
            </div>
          ))}
          {counts.passed > 0 && (
            <div style={{ ...S.fStep, opacity: 0.6 }}>
              <div style={S.fCount}>{counts.passed}</div>
              <div style={S.fLabel}>Passed</div>
            </div>
          )}
        </div>
      )}

      {/* add form */}
      {adding && (
        <div style={S.addRow}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Buyer / acquirer name"
            style={S.input}
          />
          <select value={type} onChange={(e) => setType(e.target.value as BuyerType)} style={S.select}>
            {BUYER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <button type="button" style={S.saveBtn} onClick={submit} disabled={!name.trim()}>Add</button>
        </div>
      )}

      {/* list / states */}
      {!canFetch ? (
        <div style={S.empty}>Sign in to track the buyers you’re marketing this deal to.</div>
      ) : loading ? (
        <div style={S.empty}>Loading buyers…</div>
      ) : error ? (
        <div style={S.empty}>{error}</div>
      ) : buyers.length === 0 ? (
        <div style={S.empty}>
          No buyers yet. Add the acquirers you’re marketing {dealName} to — or{" "}
          <button type="button" style={S.linkBtn} onClick={() => onAskYulia(`Build a buyer list for ${dealName}.`)}>
            ask Yulia to build a buyer list →
          </button>
        </div>
      ) : (
        <div style={S.list}>
          {sorted.map((b) => (
            <BuyerRow
              key={b.id}
              buyer={b}
              dealName={dealName}
              onStage={(stage) => updateBuyer(b.id, { stage })}
              onToggleDnc={() => updateBuyer(b.id, { do_not_contact: !b.do_not_contact })}
              onDraft={() => onAskYulia(`Draft outreach to ${b.name} for ${dealName} — do not send, I’ll review it.`)}
              onRemove={() => removeBuyer(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BuyerRow({
  buyer,
  dealName,
  onStage,
  onToggleDnc,
  onDraft,
  onRemove,
}: {
  buyer: DealBuyer;
  dealName: string;
  onStage: (stage: BuyerStage) => void;
  onToggleDnc: () => void;
  onDraft: () => void;
  onRemove: () => void;
}) {
  void dealName;
  const tone = TYPE_TONE[buyer.buyer_type];
  const dnc = buyer.do_not_contact;
  return (
    <div style={{ ...S.row, opacity: dnc ? 0.55 : 1 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={S.rowTop}>
          <span style={S.name}>{buyer.name}</span>
          <Pill bg={tone.bg} fg={tone.fg}>{cap(buyer.buyer_type)}</Pill>
          {buyer.nda_signed_at && <Pill bg={T.greenBg} fg={T.green}>NDA</Pill>}
          {dnc && <Pill bg={T.track} fg={T.muted2}>Do not contact</Pill>}
        </div>
      </div>
      <select
        value={buyer.stage}
        onChange={(e) => onStage(e.target.value as BuyerStage)}
        style={S.stageSelect}
        aria-label="Stage"
      >
        {ALL_STAGES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <button
        type="button"
        title={dnc ? "Outreach disabled — buyer is on do-not-contact" : "Draft outreach with Yulia (you send)"}
        disabled={dnc}
        style={{ ...S.iconBtn, opacity: dnc ? 0.4 : 1 }}
        onClick={onDraft}
      >
        <SendArrowIcon size={14} c={T.blue} />
      </button>
      <button
        type="button"
        title={dnc ? "Allow contact" : "Mark do not contact"}
        style={S.iconBtn}
        onClick={onToggleDnc}
      >
        <span style={{ fontSize: 13, color: T.muted2 }}>⦸</span>
      </button>
      <button type="button" title="Remove" style={S.iconBtn} onClick={onRemove}>
        <CloseIcon size={13} c={T.muted2} />
      </button>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const S: Record<string, React.CSSProperties> = {
  card: { background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rCardLg, boxShadow: T.shCard, padding: "16px 18px" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 15, fontWeight: 600, color: T.ink },
  addBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: T.blueBg, color: T.blue, border: "none", borderRadius: T.rPill, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: T.font },

  funnel: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  fStep: { flex: "1 1 0", minWidth: 64, background: T.surface, borderRadius: 10, padding: "9px 10px", textAlign: "center" },
  fCount: { fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1 },
  fLabel: { fontSize: 10.5, color: T.muted2, marginTop: 4 },

  addRow: { display: "flex", gap: 8, marginTop: 14 },
  input: { flex: 1, minWidth: 0, height: 36, borderRadius: 9, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 12px", fontSize: 13.5, color: T.ink, fontFamily: T.font },
  select: { height: 36, borderRadius: 9, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 8px", fontSize: 13, color: T.ink, fontFamily: T.font },
  saveBtn: { background: T.blue, color: "#fff", border: "none", borderRadius: 9, padding: "0 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font },

  empty: { fontSize: 13, color: T.muted, lineHeight: 1.5, marginTop: 14 },
  linkBtn: { background: "transparent", border: "none", color: T.blue, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, padding: 0 },

  list: { marginTop: 14, display: "flex", flexDirection: "column", gap: 2 },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "9px 4px", borderTop: `1px solid ${T.rowDiv2}` },
  rowTop: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  name: { fontSize: 13.5, fontWeight: 600, color: T.ink },
  stageSelect: { height: 30, borderRadius: 8, border: `1px solid ${T.inputBd}`, background: T.white, padding: "0 6px", fontSize: 12, color: T.ink, fontFamily: T.font, flex: "none" },
  iconBtn: { width: 28, height: 28, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: 7, cursor: "pointer" },
};
