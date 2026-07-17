# DEFINITIVE — Founder & Counsel Queue (do not self-resolve)

> Staged by the "Close the Manuscript Critique → Publishable" pass (2026-07-17).
> CC fixed everything mechanically knowable around these items and surfaces the
> substantive calls here. **CC does not decide any item on this page.** The two
> classes below are the only things standing between the current tree (which
> passes `--publish` with all five semantic gates active) and a public push.

---

## (A) Model rescope decisions — FOUNDER CALL

For each model the reference implementation computes something narrower than the
catalog purpose implied. CC has already **rewritten the public pages to describe
the current behavior** (the leaked "Founder decision … pending sign-off" voice
is gone — B10), so the pages are honest as they stand. What remains is the
founder's call on whether to keep that scope or extend the code.

| Model | What it computes today | Option (a) — rescope (CC's recommended default) | Option (b) — extend the code |
|---|---|---|---|
| **M109** Working-capital peg | Trailing-mean peg + observed min/max | Keep as the peg-only model it is; the true-up lives in M210 | Add negotiated target / true-up / collar |
| **M111** Revenue earnout | Probability-weighted EV + PV over supplied scenarios | Rescope to the metric-agnostic EV engine (one binding serves M111+M112) | Add a revenue-threshold payout front-end |
| **M112** EBITDA earnout | Same shared EV/PV engine | Rescope to the EV engine | Add an EBITDA add-back front-end |
| **M146** Cap-table waterfall | Single-round dilution + single-security preference | Rescope + **rename** to "single-round dilution & preference" | Extend to a multi-class exit waterfall |

If the founder chooses (b) for any row, the model page updates when the code
lands. Until then the pages stand as rescoped-to-behavior.

**Also pending the founder rename (M146):** the catalog `name` is still
"Cap-table waterfall," which overstates the single-round model. CC left the name
as-is (renames touch the founder-approved catalog); flip it to "Cap-table
dilution & preference" on sign-off.

---

## (B) `[VERIFY]` list — COUNSEL / FOUNDER CONFIRMATION

CC did **not** alter the substantive legal content of these; each is staged with
the assertion, what confirmation looks like, and the blast radius. Do not print
any of these to the public tree until confirmed.

### BLOCKING-if-adverse (a normative output or a cited third party depends on it)

1. **M155 — cramdown efficient-market circuits `(2d, 5th, 6th, 8th)`.**
   *Assertion:* those four circuits use the efficient-market approach.
   *Problem:* *Texas Grand Prairie* (710 F.3d 324) applied the **Till formula** and declined to mandate a method — the 5th almost certainly does not belong; the 8th and the "Topp" authority (AUTH-0237) are unconfirmed.
   *Confirm:* map each circuit to a holding (2d = *MPM/Momentive*; 6th = *American HomePatient*); drop/footnote 5th & 8th; cite the split.
   *Blast radius:* drives the normative `selected_framework` / `indicated_cramdown_rate` output — a 5th-Circuit user gets an authoritatively wrong framework. **BLOCKING.**

2. **M166 — "Moody's ultimate-recovery regression ≈ 0.90 × trading price + 0.06."**
   *Assertion:* these coefficients are published Moody's Ultimate Recovery Database output.
   *Confirm:* pin-cite the exact Moody's study/table/year, OR relabel as a *DEFINITIVE-authored heuristic informed by* Moody's URD (exactly as M168 does with the LoPucki BRD).
   *Blast radius:* attributes specific coefficients to a named proprietary third party — a zero-hallucination failure if unconfirmed. **BLOCKING if not published Moody's output.**

### Non-blocking-but-required (confirm before the public push)

3. **M191 — WA REET graduated band thresholds.** CC implemented the *structure* (WA is no longer a flat 1.78%; it routes to the specialist, and the aggregation window is corrected to 12 months per RCW 82.45.033). Confirm the current indexed state-band thresholds (1.10/1.28/2.75/3.00% and their breakpoints) before publishing any WA computation.
4. **M167 — Subchapter V debt limit.** Confirm the current figure after the April-2025 §104 triennial inflation adjustment (the model no longer hard-asserts the reverted $3,024,725; verify before print). Also confirm the §1182(1)(A) ≥50%-commercial-origin and affiliate-debt-exclusion elements if added.
5. **M169 / M199 — the 10% FIRPTA residence rate cite.** Re-cite from `§1445(c)(4)` to `§1445(a)` flush sentence (PATH Act 2015 §324). The rate value is correct; the citation is not.
6. **M224 — Delaware recording-act classification.** DE is stated as pure race; §153's "without notice" language makes it genuinely contested. Confirm the operative text of 25 Del. C. §153 and reclassify or add a "disputed" note.
7. **M232 — NY mere-change exemption subsection** (cited NY Tax Law §1405(b)(6)) and the existence/holding of **"Matter of 105-02 Forest Hills (2025)."** Also distinguish the statewide RETT (Tax Law Art. 31) from the NYC RPTT (§11-2101) — the model cites the NYC-only provision for "NY."
8. **M231 — a real, named Texas strict-match ROFR authority** (currently "exact-match rule," no case/reporter).
9. **M203 — Letter Ruling 202308010** (AUTH-0158): confirm it exists and is on point (it entered via empirical extraction, not the overlay; now typed `guidance`).
10. **M214 / M215 — IP chain-of-title / encumbrance authorities.** Confirm *Clorox v. Chemical Bank* (AUTH-0051) is a real, on-point chain-of-title/recording decision; add *In re Cybernetic Services* (9th Cir. 2001) for patent-security perfection.
11. **M206 / M208 / M212 — SRS Acquiom / ABA deal-points medians.** Reconcile escrow (<10% in recent editions), target break-up (~3.0–3.5% vs the stated 2.7%), and antitrust reverse-break (~6% vs 5.0%) figures to the exact edition/table with a page-level pin-cite.

---

## Status of everything else (for context — not for this queue)

All 17 BLOCKING findings from the manuscript critique are closed in code, and the
five Phase-0 semantic gates (authority-type vocabulary, golden-prose-vs-JSON
magnitude, internal-voice, conformance-count integrity, output-computed) are
active in `--publish`, which exits 0. The SHOULD-FIX (§4) and NIT (§5) sweeps are
tracked in `GAP_LEDGER.md`. The only items CC cannot close are the two classes
on this page.
