/**
 * VALUATION BY DEAL TYPE — the comparison strip.
 *
 * Paul, 2026-08-15: *"the one place i am most interested in is the valuation
 * tools for different deal types"*, and separately, on the Trainline reference:
 * *"the train site has really great cues to work from that make setting up and
 * designing the tool/app work well."*
 *
 * This is the cue that carries. Trainline shows six neighbouring days each with
 * a price, so you learn the shape of the option space without running six
 * searches — and where an option is closed it shows the ROW with "Not
 * available" rather than hiding it, so you learn the option exists and why it
 * is shut. Applied here: every valuation method for the chosen deal type, each
 * with its number or the reason there isn't one.
 *
 * ALL THE JUDGEMENT LIVES IN `house/valuation.ts`, and this file must keep it
 * that way. It renders `DEAL_TYPE_SPECS`; it does not decide anything. That is
 * the same contract `house/deck.ts` has with the collateral builders — the app
 * and a Cowork session route identically because there is one table, and a
 * second copy of the routing living in a React component would be the drift
 * this practice has spent a week removing.
 *
 * NO API CALL AND NO MODEL. `house/` is pure by construction, so the whole
 * panel is local arithmetic over data already on the deal row.
 */
import { useMemo } from "react";
import type { CSSProperties } from "react";
import { T } from "../atlasTokens";
import { useDraft } from "../../../../hooks/useDraft";
import {
  DEAL_TYPES, specFor, whyNot, referrals, earningsBase, leagueFor, bandFor,
  type DealType, type Method,
} from "../../../../../../house/valuation";
import { valuation, money, mult } from "../../../../../../house/deal";

/* The eight methods, in the order a practitioner reads them. Fixed rather than
   derived from the spec so the strip does not reorder itself as the deal type
   changes — a column that moves is a column you have to re-find. */
const METHOD_ORDER: Method[] = [
  "ebitda-multiple", "sde-multiple", "sotp", "asset-floor",
  "dcf", "lbo-afford", "synergy-adjusted", "appraisal",
];

const METHOD_LABEL: Record<Method, string> = {
  "ebitda-multiple": "EBITDA multiple",
  "sde-multiple": "SDE multiple",
  "sotp": "Sum of the parts",
  "asset-floor": "Asset floor",
  "dcf": "DCF",
  "lbo-afford": "LBO affordability",
  "synergy-adjusted": "Synergy-adjusted",
  "appraisal": "Appraisal",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  primary: { bg: T.blueBg, fg: T.blue, label: "Lead" },
  secondary: { bg: T.track, fg: T.muted, label: "Cross-check" },
  "n/a": { bg: "transparent", fg: T.muted2, label: "Not available" },
  refer: { bg: T.amberBg, fg: T.amber, label: "Refer" },
};

export function ValuationPanel({
  dealId, sde, ebitda,
}: {
  dealId: number;
  sde: number | null;
  ebitda: number | null;
}) {
  /* The deal type is the practitioner's call and there is no column for it yet,
     so it drafts per deal — the same `useDraft` the rest of this pane uses for
     next-action and owner. A migration can promote it later; the routing is
     what is worth testing first. */
  const [type, setType] = useDraft(`deal:${dealId}:valtype`, "going-concern");
  const dealType = (DEAL_TYPES.includes(type as DealType) ? type : "going-concern") as DealType;

  const spec = specFor(dealType);
  const base = useMemo(() => earningsBase({ sde, ebitda }), [sde, ebitda]);
  const league = useMemo(
    () => (base ? leagueFor(base.cents, base.metric) : null),
    [base],
  );

  /* The headline range, or the reason there is not one. Both come from
     house/valuation — the panel never decides that a number is unavailable. */
  /* The union is annotated rather than inferred. Inferred, TypeScript widens
     both arms to carry an optional copy of the other's key, so `"value" in
     band` stops discriminating and every read below is `possibly undefined` —
     a real error the Vite build never surfaces because it does not typecheck. */
  type Band = { blocked: string } | { value: ReturnType<typeof valuation> };
  const band = useMemo<Band | null>(() => {
    if (!base || !league) return null;
    const gate = bandFor(dealType, base.cents, league.league);
    if (!gate.ok) return { blocked: gate.why };
    return { value: valuation(base.cents, league.league) };
  }, [base, league, dealType]);

  return (
    <div style={{ marginTop: 22 }}>
      <div style={row}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Valuation</div>
        <select
          value={dealType}
          onChange={e => setType(e.target.value)}
          style={select}
          aria-label="Deal type"
        >
          {DEAL_TYPES.map(t => (
            <option key={t} value={t}>{specFor(t).name}</option>
          ))}
        </select>
      </div>

      {/* The tell — one sentence to confirm the type is the right one. Chosen
          over a tooltip because picking the wrong type is the error that
          invalidates everything below it. */}
      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 6 }}>
        {spec.tell}
      </div>

      {/* THE HEADLINE. A range, never a point — the same law the owner
          evaluation runs on. Blocked types show the reason at the same size a
          number would occupy, so the eye lands on it rather than skipping a
          gap. */}
      <div style={headline}>
        {!base && (
          <div style={{ fontSize: 12.5, color: T.muted2 }}>
            No SDE or EBITDA on this deal yet — there is no base to value.
          </div>
        )}
        {base && band && "blocked" in band && (
          <div style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>{band.blocked}</div>
        )}
        {base && band && "value" in band && (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>
              {money(band.value.low)} – {money(band.value.high)}
            </div>
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>
              {league?.league} · {mult(band.value.multipleMin)}–{mult(band.value.multipleMax)}{" "}
              {band.value.metric} · house assumption, not a comp
            </div>
          </>
        )}
      </div>

      {/* THE STRIP. Every method, always — the closed ones carry their reason
          instead of a number. Hiding them would leave the reader wondering
          what was considered. */}
      <div style={{ marginTop: 14 }}>
        {METHOD_ORDER.map(m => {
          const v = spec.methods.find(x => x.method === m);
          if (!v) return null;
          const st = STATUS_STYLE[v.status];
          const closed = v.status === "n/a" || v.status === "refer";
          return (
            <div key={m} style={{ ...methodRow, opacity: closed ? 0.72 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: closed ? 500 : 700, color: T.ink }}>
                  {METHOD_LABEL[m]}
                </div>
                <span style={{ ...tag, background: st.bg, color: st.fg }}>{st.label}</span>
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginTop: 3 }}>
                {whyNot(dealType, m) ?? v.why}
              </div>
            </div>
          );
        })}
      </div>

      {/* WHAT MUST BE ESTABLISHED. These change the answer by more than the
          multiple does, which is why they sit with the numbers and not in a
          checklist somewhere else. */}
      <div style={{ marginTop: 16 }}>
        <div style={sectionLabel}>Establish before quoting</div>
        {spec.mustEstablish.map((s, i) => (
          <div key={i} style={bullet}>
            <span style={{ color: T.blue, flex: "none" }}>·</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* THE LINE. Rendered as a band, in the amber that means caution
          everywhere else in the shell — the one place the app still uses a warm
          colour, and it is doing exactly the job it was kept for. */}
      {spec.line && (
        <div style={lineBand}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: T.amber }}>
            THE LINE
          </div>
          <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.55, marginTop: 4 }}>{spec.line}</div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <div style={sectionLabel}>Coordinate a specialist</div>
        {referrals(dealType).map(r => (
          <div key={r.method} style={bullet}>
            <span style={{ color: T.amber, flex: "none" }}>·</span>
            <span><b style={{ color: T.ink }}>{METHOD_LABEL[r.method]}</b> — {r.why}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── styles ───────────────────────────────────────────────────────────── */

const row: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
};

/* Radius 10 on the control, 0 on everything else — Carta's one exception is
   buttons and inputs, and a select is an input. */
const select: CSSProperties = {
  font: "inherit", fontSize: 12.5, color: T.ink, background: T.white,
  border: `1px solid ${T.inputBd}`, borderRadius: 10, padding: "5px 8px",
};

const headline: CSSProperties = {
  marginTop: 10, padding: "12px 14px",
  background: T.track, border: `1px solid ${T.border}`,
};

const methodRow: CSSProperties = {
  padding: "9px 0", borderTop: `1px solid ${T.border}`,
};

const tag: CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
  padding: "2px 6px", flex: "none",
};

const sectionLabel: CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em",
  textTransform: "uppercase", color: T.muted2, marginBottom: 6,
};

const bullet: CSSProperties = {
  display: "flex", gap: 7, fontSize: 12, color: T.muted,
  lineHeight: 1.55, marginBottom: 5,
};

const lineBand: CSSProperties = {
  marginTop: 16, padding: "11px 13px",
  background: T.amberBg, border: `1px solid ${T.amberAv}`,
};
