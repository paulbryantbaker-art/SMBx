# DEFINITIVE M&A Specification v1.0.0-draft — Manuscript Critique

**Date:** 2026-07-17
**Reviewed artifact:** the compiled public manuscript in `dist/definitive-public/` — 134 model pages, the framing chapters (overview, conventions, professional-boundaries, methodology, data-dictionary, lineage, authorities, conformance), 17 gate pages, the real-property state-law chapter, and the machine + reference packages.
**Method:** seven independent readers each took a slice (framework/gates · tax · restructuring · RE tax-valuation · RE property/contract law · legal-finance-secondaries · IP/authorities/conformance), reading every assigned page and re-deriving worked-example arithmetic. Findings were then **independently re-verified** by the synthesizer against the compiled files — every BLOCKING claim that is checkable from the document (counts, cross-references, prose-vs-JSON, algorithm-vs-output, rounding math) was confirmed true before it was admitted here. Domain-law-correctness claims that require a licensed professional (e.g., a circuit's cramdown rule, a state's current transfer-tax schedule) are flagged `[VERIFY]` and listed in §9.

---

## 1. Executive assessment

**The architecture is publishable-grade. The manuscript is not yet publishable.** Every defect below is fixable without re-architecting anything; none impeach the core design. But the defects are real, several are load-bearing, and a handful strike the exact promises the specification makes about itself.

The single most important conclusion: **`--publish` exiting 0 does not mean the document is ready.** The gate validates *structure* — schemas present, no dangling refs, constants complete, no contradictory authority types, golden-vs-schema agreement. It does not validate *semantics*: whether a worked example's prose matches its JSON, whether an algorithm step actually computes every output it declares, whether a rounding rule reproduces its own examples, whether an authority is typed correctly, whether internal decision-tracking voice leaked into a public page, or whether the conformance suite it advertises actually ships. All seventeen blocking findings live in that unguarded semantic layer, which is why they passed the gate.

The gap is concentrated in three places:

1. **The conformance / reproducibility spine has two holes** that, together, mean an outside party cannot today do the thing the spec tells them to do — independently implement a model and pass the published suite. (Conformance advertises 655 cases and ships 385; the global rounding rule is not reproducible under the reference stack's own number type.) This is the highest-priority cluster because it undercuts the value proposition, not a detail.
2. **A set of worked-example and register defects** — the most-read surfaces — are wrong in ways a careful reader will catch: a 10× decimal error in prose, an IRR that contradicts its own output, a legally impossible fact pattern, a stale tabled tax rate, and ~90 authority rows mistyped.
3. **Honesty-of-framing slips** — a "30-gate framework" that shows 17, "implementable from this document alone" belied on three pages, and internal "Founder decision … pending sign-off" voice printed inside pages marked Normative. The spec *sells* boundary-honesty as a design value; these erode the thing that most differentiates it.

Rough tally: **~17 BLOCKING, ~40 SHOULD-FIX, ~25 NIT.** BLOCKING here means "a knowledgeable reader would lose trust, or an implementer would be misled, if this shipped as-is" — not "the whole document is unsound."

**Recommended posture:** hold the public push. The blocking list is a focused week of work (it is mostly prose, table, and typing corrections plus one rounding-arithmetic decision), after which this is a genuinely differentiated artifact.

---

## 2. What is genuinely strong (and should not be touched)

These are consistent findings across all seven readers, and I confirmed them on my own read:

- **The two-tier Normative/Catalog labeling is honest and unmissable.** Every page's header states its tier; Catalog pages carry an explicit "NOT implementable from this document alone" banner; the overview keeps the breadth claim (134 mapped) and the rigor claim (85 implementable) separate and says so. A reader cannot mistake a map for a contract.
- **The professional-boundary architecture is real UPL discipline, not a disclaimer.** The three-class model (deterministic computation / schedule-with-a-specialist-boundary / research scaffold), the always-true `*_handoff_required` flags, and the "a system that answers a routed question has *violated* the spec" posture are structurally sound and consistently applied. The real-property `DTC.RE.01–10` boundary catalog is comprehensive and correctly reserves marketability, enforceability, drafting, and trigger-conclusions to counsel.
- **MUST-vs-SHOULD discipline is exactly right.** The only constants labeled `MUST (binding)` are true statutory/regulatory rates (§1446(f) 10%, SBA floors, §280G 3×/§4999 20%, §1374 5yr/21%, HSR thresholds). Every market figure is `SHOULD (cited median)` with a named study, an effective year, and a next-check cadence. No median is dressed as law.
- **Arithmetic is essentially all correct.** Readers re-derived the hard ones to the cent — make-whole PV (M183 ≈ $57.68M), the §1111(b) five-period annuity (M156), both earnout PVs (M111/M112), the SAFE lower-of-cap/discount (M180), §1031 date math (M170 to the day), CAM true-ups, NOI→value bridges. The compute layer is trustworthy.
- **Zero-hallucination discipline holds where it matters most.** Market cap rates, environmental/title/PCA numbers, and appraisal conclusions are pass-through inputs with refusal flags, not invented. Where the register mistypes authorities, the error is **one-directional and systematic** (authority → `practice-or-guidance`), i.e., a mechanical fix, not chaos.
- **Real legal precision in the details:** M232 encodes NY's "50% or more" as `≥` while CA §64's "more than 50%" is `>`; M234 orders the §9-334(h) construction-mortgage override ahead of the 20-day PMSI; M185 measures the §280G excess against one-times-base, not three; M202 caps the §1374 base at min(NUBIG, recognized gain, taxable-income limit). These are the distinctions practitioners miss.

---

## 3. BLOCKING findings

Ordered by blast radius. Each cites the file, the defect, and the fix. Consistent with the governing rule (*the spec is the law of the model; the reference implementation conforms to it; never silently narrow the spec to the code*), fixes say whether to correct the spec, extend the code, or publish a missing artifact.

### Theme A — The conformance / reproducibility spine (fix first)

**B1 · `spec/conformance.md` — the advertised suite does not ship.** Conformance is *defined* as "passes the published suite: **655 cases**," but the shipped `cases/model-runtime.cases.json` contains exactly **385** (verified). The other 270 — including *every* boundary case — are absent, so no external party can run, let alone pass, the suite that defines conformance. Compounding it: `REQ-DTC-RE-01…10` carry no case IDs or counts (unlike `REQ-M###`, which cite "(N case(s))"), so the boundary-refusal requirements are prose-only and untestable as published. **Fix:** either publish all 655 (including the DTC boundary cases), or redefine conformance against the 385 that ship and label the remainder informative-pending; give each `REQ-DTC` a case count and ship its cases. Do not advertise a number you do not ship.

**B2 · `spec/conventions.md` — the global rounding rule is not reproducible under the reference stack.** The chapter's headline guarantee is that half-to-even at 4 decimals "lets an independent implementation reproduce every published value from the rule alone, with no shared rounding code." Its own two examples falsify it under IEEE-754 doubles (the reference stack is JS/Node): `0.00005` stored as a double is `0.00005000000000000000239…` (**above** the tie → rounds to 0.0001, not the stated 0.0000); `0.00015` is `0.0001499999999999999868…` (**below** the tie → rounds to 0.0001, not the stated 0.0002). A naïve reference implementation contradicts the spec's own examples. (The *shipped* golden values are self-consistent because runtime and expected use the same code — the break is specifically the **independent-reproduction** promise at exact-decimal ties.) **Fix:** mandate exact-decimal intermediate arithmetic (decimal128 / big.js / Python `Decimal`) for rate/ratio rounding, and restate "full precision" as "exact decimal"; or soften the guarantee and correct the two examples. This is the keystone finding — the entire conformance premise is bit-reproducibility.

**B3 · `spec/conventions.md` — money produced by division has no rounding rule.** Monetary outputs are called "exact integer cents," but several arise from division and cannot be exact: the working-capital peg (trailing mean "to the nearest cent"), prorations (`closing_true_up_cents`), class allocations. "To the nearest cent" names no tie-break, so two conforming implementations can differ by a cent at a half-cent tie. **Fix:** state the money rounding mode (half-to-even to the cent) for divided/allocated money. *(Same root cause as B2; fix together.)*

**B4 · `spec/conventions.md` / methodology — no solver contract for iterative outputs.** IRR (`estimated_irr`, `estimated_lender_irr`), the cramdown rate (M155), and make-whole PV roots have no closed form, yet no method, tolerance, or seed is specified. Half-to-even at 4 dp cannot make a root reproducible if the solver differs. **Fix:** specify method + convergence tolerance for iterative models, or mark those specific outputs not-conformance-bound.

### Theme B — "Implementable from this document alone" is belied

**B5 · Gate predicates reference 14 fields the data dictionary never defines.** `data-dictionary.md` claims to be the vocabulary "used by model input and output contracts **and by gate predicates**," but of the 16 distinct fields the machine predicates use, only `deal_form` and `purchase_price_cents` are defined (verified: the other 10 I checked return 0 hits; `us_state_jurisdictions`/`transaction_type` are near-misses for existing fields under different names — `states_involved`/`deal_type` — evidence the predicates were authored independently of the dictionary). The routing layer is therefore not machine-evaluable over the published vocabulary. **Fix:** add every predicate field to the dictionary with type + enumeration; reconcile the renamed near-equivalents.

**B6 · `spec/models/M221.md` — the model's core table is unpublished.** §4 step 2 classifies each license "(constants: OSS license classification)," but §5 attests `constants: []` — an in-document contradiction. The real license→class map lives only in the reference regex; the authorities table lists GPL/MIT/Apache/… but not their classification. An implementer cannot classify Apache/BSD/GPL/MPL/EPL/ISC/CC-BY-SA/unknown from the document. **Fix:** publish the license→class table as a constant block with per-license authority; reconcile §4/§5.

**B7 · `spec/models/M202.md` — an output no algorithm step computes.** `state_nonconformity_review_required` appears in the output contract and worked example (`false`), but algorithm steps 1–5 never produce it (nor is `recognition_period_years` explicitly assigned). It is unreproducible from the document, and defaulting the flag to `false` under-warns — many states do not conform to §1374. **Fix:** add an explicit step; default the flag to `true` (or derive it from a supplied state), never silently `false`.

### Theme C — Authority-register integrity

**B8 · `spec/authorities.md` — the `type` field mislabels controlling law.** 87 rows are typed `practice-or-guidance`, a bucket **not in the register's stated vocabulary**, and it swallows a large set of SCOTUS/Delaware decisions that should be `case`: Howey (328 U.S. 293), Till (541 U.S. 465), RadLAX (566 U.S. 639), INDOPCO (503 U.S. 79), 203 N. LaSalle (526 U.S. 434), MFW, Akorn, Klang, AB Stable, Serta Simmons (all verified). It also miscategorizes statutes (WA RCW 82.45, MD Tax-Prop 12-117, CT 12-638, OBBBA §§) and a regulation (EU AI Act 2024/1689) as `practice-or-guidance`, inconsistently with peers typed correctly. A typed register whose type field is wrong fails its index function. **Fix:** eliminate `practice-or-guidance`; retype each row to the stated vocabulary (`case`/`statute`/`regulation`/`guidance`/`practice-norm`/`study-dataset`/`form`). *(Meta: the publish gate catches type contradictions — same authority given two types — but not consistent mislabeling; add an allowed-type-set check.)*

**B9 · `spec/authorities.md` — the "262 distinct authorities" count is inflated.** Kendall v. Ernest Pestana is duplicated (AUTH-0151 "40 Cal.3d 488" and AUTH-0152 "…Inc., 40 Cal.3d 488 (1985)"), both typed `case`. Near-twins In re Topps (AUTH-0097, `case`) vs. Topp (AUTH-0237, `practice-or-guidance`) and TX strict-match (AUTH-0246 `case` vs. AUTH-0247 `statute`) need reconciliation. **Fix:** de-duplicate, correct the count, and resolve the near-twins.

### Theme D — Internal voice leaked into the public manuscript

**B10 · `M109 / M111 / M112 / M146` — "Founder decision … pending sign-off" printed in Normative pages.** All four (verified — four, not three) publish a `> Scope note` blockquote containing internal decision-tracking voice verbatim: "SCOPE (governing rule): … **Founder decision:** (a) rescope … **(recommended)** … or (b) extend the code … **Recorded pending founder sign-off.**" A page marked **Status: Normative (v1.0.0)** whose scope is admittedly "pending sign-off" is self-contradictory for public release. **The scope *disclosure* is excellent and should stay** — it honestly states what the model does and does not do. **Fix:** rewrite each in reader-facing doctrine ("This model computes a probability-weighted expected-value/PV schedule; it does not gate off a metric threshold or apply an add-back"), delete the founder-decision/recommended/pending-sign-off framing, and resolve the underlying rescope before publishing. This is the founder-gated scope decision leaking onto the public surface.

### Theme E — Worked-example defects (the most-read surface)

**B11 · `spec/models/M184.md` §6 — uniform 10× decimal error in prose.** The narrative says "$1.8M / $1.6M / $1.0M / $1.1M / $2.0M / $2.7M," but the JSON it describes is `1,800,000,000` cents = **$18M** and `2,700,000,000` = **$27M** (verified). Every prose dollar is 10× too small in a zero-hallucination document. **Fix:** restate the prose at $18M/$16M/$10M/$11M/$20M/$27M (or rescale the inputs if the smaller magnitudes were intended).

**B12 · `spec/models/M181.md` §6 — prose IRR contradicts the output.** Prose: the lender's IRR "runs about 21%." Output: `estimated_lender_irr: 0.1396` = **14%** (`(1.48)^(1/3)−1`, `term_years: 3`; 21% is the 2-year exponent). **Fix:** correct the prose to ~14%. *(See S-tier note: the metric is a MOIC-CAGR, not a true IRR — relabel.)*

**B13 · `spec/models/M119.md` §4 — the algorithm states a rounding mode the spec forbids.** Steps 2–3 say "rounded **half-up** to 4 decimals" and "**half-up to 2 decimals**," contradicting (a) the global half-even/4-decimal Conventions rule, (b) the page's own precision note, and (c) its own output (`dscr: 1.6667`, 4 decimals). It is the only page with this prose (verified) — flagship SBA example, authored before the convention landed. An implementer coding step 3 verbatim emits `1.67` and fails `CONF.MODEL.LBO.SBA.001/002`. **Fix:** change both to half-to-even/4-decimal; the runtime and golden value are already correct, so this is a prose-only correction. Also delete the dead `CENTS_RULE` constant in `scripts/definitivePublicOverlay.ts:265` (says half-even is "scheduled"; it shipped; never emitted, source hygiene only).

**B14 · `spec/models/M225.md` §6 — a legally impossible flagship example.** The example posits "a **Texas** property held … as **tenants by the entirety**." Texas is a community-property state and does not recognize tenancy by the entirety (verified inputs). The marquee V18c title model presents a vesting form that cannot exist in the stated state, with no guard. **Fix:** recompose in an entireties state (NY) or switch the TX vesting to `community_property`; add a validity guard so `tenancy_by_entirety` + a non-TBE state surfaces a gap rather than a covenant answer.

**B15 · `spec/models/M225.md` §5 — the `deed_type` enum omits two anchor states' dominant instruments.** The enum is general/special/bargain-and-sale/quitclaim, forcing the **California grant deed** (Civ. Code §1113 — two implied covenants) and the **NY bargain-and-sale-with-covenant** (RPL §258 — one covenant) into `special_warranty`, which returns **six** covenants (verified). The layer special-cased Texas §5.023 but not CA/NY — inconsistent anchor-state treatment that emits wrong covenant sets. **Fix:** add `grant_deed` and `bargain_and_sale_with_covenant` enum values with their limited covenant sets.

**B16 · `spec/models/M191.md` §5/§6 — a confidently-wrong, pin-cited tax rate.** Washington REET is tabled as "**1.78% flat**" with authority "WA RCW 82.45"; the flagship example computes $10M × 1.78% = $178,000. WA REET has been **graduated since Jan 1, 2020** (1.10/1.28/2.75/3.00% state bands); the actual state-only tax on $10M is ≈ **$269,000** — understated ~$91k, and RCW 82.45 sets graduated rates, not 1.78%. The controlling-interest aggregation windows also look swapped (table shows "WA 36 months"; WA is 12 months per RCW 82.45.033 — 36 months is New York's). For a pin-cited public spec, a confidently-wrong tabled number is worse than an untabled handoff. **Fix:** replace with the graduated schedule (or mark WA graduated/specialist-only) and rebuild the example; correct the aggregation window. `[VERIFY]` current indexed thresholds.

### Theme F — "Never guess" violated

**B17 · `spec/models/M227.md` — an untabled state gets a guessed rule.** For an untabled jurisdiction the risk-of-loss model applies the equitable-conversion (buyer-at-signing) default with `defer_to_counsel: false` and **no** table-gap flag — unlike its siblings M224/M232, which gap-flag and defer. This silently produces the wrong rule for untabled seller-risk states (IL, OR, WI, Massachusetts-rule), outputting `risk_on: buyer` where the law puts it on the seller, directly violating the spec's own "never guess" rule. **Fix:** give M227 the same untabled-state branch — emit a gap flag + `defer_to_counsel: true`.

*(Two further BLOCKING candidates — M166's Moody's-attributed regression coefficients and M155's 5th-Circuit cramdown framework — are domain-law-correctness issues the readers flagged `[VERIFY]`; they are in §9 because they require a licensed professional to confirm, but if confirmed they are BLOCKING: M155 drives a normative `selected_framework` output that would be authoritatively wrong for a 5th-Circuit user, and M166 attributes specific coefficients to a named proprietary database.)*

---

## 4. SHOULD-FIX findings

Grouped. These mislead or under-serve an implementer but do not by themselves break trust or the suite.

### Undisclosed scope-narrowing / "computes" overstatement
- **Gate boundary notes overstate Catalog models** (G7/G14/G15): they say DEFINITIVE "computes" MAE (M123), RWI (M108), QSBS (M101), reorganization qualification (M140) — all **Catalog** (not yet computable). Scope "computes" to Normative; use "maps/organizes" for Catalog.
- **M180** purpose claims it "computes the price at which a convertible note or SAFE converts," but implements only the legacy **pre-money** SAFE cap; no note-accrual, no post-2018 YC post-money SAFE (which AUTH-0262 now denotes), no multi-instrument interaction. Add a scope note.
- **M172** "75/75/90 triad" omits the **§856(c)(2) 95% gross-income test** — a reader can pass all three tabled tests and still fail REIT qualification. Name the 95% test out of scope.
- **M187** asset-vs-entity comparison is buyer-side only; omits seller-level tax (recapture, C-corp double tax) and §338(h)(10)/§336(e) step-up elections (so "entity deal = carryover basis" is not universal). Most needs the scope note of the three founderReview models.
- **M188** forces the operating-business residual into Class VI/VII, ignoring opco Classes III/IV/V that absorb value ahead of goodwill → overstates goodwill. Scope-note the RE-vs-goodwill simplification.
- **M146** title "Cap-table waterfall" overclaims vs. its binding and its own scope note ("not a full exit-proceeds waterfall"). Rename to single-round dilution + preference.

### Statutory/citation precision (tax & RE tax)
- **M119** measures the 10% equity floor against purchase price; SOP 50 10 8 measures it against **total project cost** → a directional false PASS is possible. Denominate against project cost or rename the input.
- **M139** `unallocated_cents` description is backwards; under the residual method any positive residual must fall to **Class VII goodwill**, never sit "unallocated."
- **M185** worked example shows `cleansing_vote_passed: true` alongside a live $440k excise and $2.2M lost deduction — legally impossible (a valid private-company §280G(b)(5) vote cleanses). The vote is computed as an independent screen with no feedback. Reconcile; add the private-company-only caveat.
- **M200** taxes an S-corp asset sale at 21% (the C-corp rate) and the seller note/earnout immediately at face (no §453). "What the seller nets" over-claims for the arithmetic. Pick a representative pass-through rate; add a scope note.
- **M204** computes imputed interest as a linear `principal × (AFR−stated) × years` proxy, not the §1274 PV/semiannual computation; relabel as an approximate screen (and §483 ≠ §1274/OID).
- **M203** routes all pre-bright-line cost to §195; a strategic acquirer expanding an existing business deducts under §162. Add the branch or scope note.
- **M205** SALT "engine" bakes in apportion-vs-allocate (business/nonbusiness income) — the single most litigated SALT-M&A question — as an assumption; single-state, and omits the occasional/isolated-sale exemption. Note the scope.
- **M169/M199** pin-cite the 10% residence rate to §1445(c)(4); it lives in §1445(a)'s flush sentence (PATH Act 2015 §324). `[VERIFY]` and re-cite.
- **M170** `exchange_deadline` is transfer+180 only; §1031(a)(3)(B) is the earlier of 180 days or the return due date. `recognized_gain_floor` is mislabeled a "floor" — recognized gain is min(realized, boot) and the output can exceed it; debt-relief boot is excluded. Rename/caveat.
- **M171** labels ASC 842's 75%/90% thresholds `MUST (binding)`; ASC 842 removed bright lines (842-10-55-2 offers them as one reasonable approach). Downgrade to SHOULD; update the stale "bargain purchase option" to "reasonably certain to exercise."

### Restructuring (mostly present-value symmetry & scope)
- **M153** compares nominal plan vs. Chapter-7 distributions; §1129(a)(7) requires effective-date **present value** and applies only to **impaired** classes. Specify PV inputs and the impaired-class limitation.
- **M156** discounts the election side but credits the no-election side at par → biases the delta against electing. Discount both sides or flag it.
- **M152** the −10%/−20% sensitivity is only reproducible if the haircut hits the top-line cash-flow with capex/WC held constant; state that.
- **M151** purpose asks "is the bid protection in range?" and the prose asserts "3% is in range," but no range test/constant is computed. Add the range test or delete the claim.
- **M157** claims a §507/§726 ladder but applies a user-supplied `priority_rank` and pays the secured class from the general pool (should be collateral-specific, §725). Soften the claim.
- **M165** labels the Article 9 10-day period (§9-612(b)) `MUST (binding)`; it is a non-consumer **safe harbor**, not an absolute minimum, and ABC vs. Article 9 are conflated. Reframe; add §9-612 to authorities.
- **M167** Subchapter V eligibility omits the §1182(1)(A) ≥50%-commercial-origin test and the affiliate/insider-debt exclusion → over-inclusive; the debt limit likely needs the §104 April-2025 inflation adjustment. Add the elements; `[VERIFY]` the current figure.

### Legal / finance / secondaries
- **M212** go-shop fee semantics are inverted: the field is a "discount" but the algorithm multiplies by it as the *retained* fraction; a 50% example masks it. Rename `go_shop_fee_pct_of_base` or multiply by `(1 − pct)`.
- **M177** withholds 10% × purchase price; §1446(f) withholds 10% of **amount realized** (including the §752 share of liabilities), so leveraged LP transfers under-withhold. Accept an `amount_realized_cents` input.
- **M181** `estimated_lender_irr` is a MOIC-CAGR that ignores coupon timing — not an IRR. Rename or build a real IRR.
- **M179/M182** Strength cell reads `SHOULD (cited median)` but the authorities are market conventions (rules-of-thumb), not dataset medians. Split the taxonomy: "cited median (study)" vs "market convention."
- **M184** `total_capacity = fixed + grower + builder + ratio` stacks additively, but a "greater of $X or Y% of EBITDA" grower is a MAX → overstates capacity. Document the additive assumption.
- **M111/M112** never validate that scenario probabilities sum to 1 → a meaningless expected value with no warning. Enforce Σp = 1 or document the independent-tranche interpretation.
- **M206/M208/M212** pin-cites name the study but not a table/page, and a few figures sit off the commonly-cited median (SRS escrow < 10%; target break-up ~3.0–3.5% vs 2.7%; antitrust reverse ~6% vs 5.0%). `[VERIFY]` against the exact editions.

### IP
- **M222** starts the §1060 residual at Class V and has no inputs for Classes I–IV, so cash/AR/inventory land in Class VII goodwill — a different Class VII than M139 for the same deal. Require a price net of Classes I–IV and say so, or cross-reference M139.
- **M214** the ITU flag has undocumented tri-state semantics (reference impl flags only when `itu_assigned_after_allegation_of_use === false`; absent → no flag), but §4 reads as two-state, so a faithful implementer over-flags every non-ITU mark. Document the tri-state or add an `is_itu_mark` gate. Separately, the single 3-month recording test is a patent/§261 window applied to copyrights, which get §205's 1-month/2-month window. Window by asset type.
- **M220** flags only CA §2870, silently returning `california_2870_carveout_flag: false` for WA/IL/… contributors with equivalent statutes (a false "clean" signal); and requires work-for-hire (a copyright doctrine) for patent inventors (a category error post-*Stanford v. Roche*). Add the parallel-state flag; scope WFH to copyrightable works.
- **M214–M223** the §7 "untabled jurisdictions return a table-gap flag" boilerplate is copied into models with no jurisdiction table (and is affirmatively misleading for state-sensitive M220). Remove where inapplicable or implement the gap return.
- **conformance / IP** the IP models' §8 boundaries (title passage, ITU voidness, copyleft trigger) have no `REQ-DTC-IP-*` cases (only RE has DTC), and they route via `counsel_review_required` while DTC cases assert `defer_to_counsel: true` — an implementer can't tell which boolean is the testable boundary. Add `REQ-DTC-IP-*`; unify the routing boolean; align the boundary-classification tags (M216/M219/M223 are tagged "Deterministic computation" despite §8 counsel boundaries).

### Real-property law
- **M229** outputs a merger as `generally_not_assignment` with `consent_required: false` and no defer when the lease doesn't deem change-of-control an assignment — but anti-assignment clauses routinely reach "by operation of law" independently, risking a false-negative on a core M&A structure. Add an operation-of-law input; default `merger` toward defer.
- **M228** applies merger-by-deed to a financial-statement representation; the doctrine reaches title/conveyance terms, and reps generally survive (and in an entity deal with no deed it doesn't apply). Scope to title-related covenants.
- **M227** "equitable conversion (majority rule)" overstates current law (~20+ UVPRA states + the Massachusetts rule → the states are split); reframe as the common-law baseline. HI/MI/NV risk rows lack pin-cites.
- **M224** states Delaware as settled "pure race"; §153's "without notice" language makes the classification genuinely contested. Add a note or reclassify. `[VERIFY]`
- **M232** cites NYC Admin. Code §11-2101 (NYC-only) for "NY"; statewide RETT (Tax Law Art. 31) governs outside the five boroughs. Distinguish them; specify NYC in the example.

---

## 5. NIT findings (compressed)

- **Frontmatter:** every page carries `version: "1.0.0-draft"` under `Status: Normative (v1.0.0)` — resolve the "-draft" suffix at release. Typo: M180 §6 "an $5.00" → "a".
- **M128** "auto-reportable ceiling" overstates (exemptions survive above the size-of-person drop-out); `enterprise_value_cents` ≠ the HSR size-of-transaction. Soften.
- **M201** titled a §338(h)(10) gross-up but applies the §336(e) QSD test (no corporate-purchaser QSP condition). Distinguish or scope to §336(e).
- **M186** input note "LTTE for the change month" — §382(f) uses the highest adjusted federal long-term rate over the three months ending with the change month; `estimated_years_to_use_nol` ignores the §172 80% cap.
- **M168** "0–100" score is floored at 20 (base 20 + non-negative components); note the effective 20–100 range. "SHOULD (cited median)" mislabels an authored heuristic (also M166). Use "authored heuristic."
- **M160** TIA §316(b) typed `practice-or-guidance` but is a statute (15 U.S.C. §77ppp(b)).
- **M148** balance-sheet prong uses raw assets − liabilities; §101(32)/§548 insolvency excludes fraudulently-transferred and exempt property. One-line note that fair-value inputs use the statutory basis.
- **M156** the class-election vote threshold is set by Bankruptcy Rule 3014 (mirroring §1126(c)), not §1126(c) itself.
- **M164** a `free_fall` case is by definition filed without an RSA — an inapt `toggle_type` for an RSA example.
- **M224** the Louisiana cite (arts. 3338–3340) omits art. 3342, the provision that makes actual knowledge irrelevant (the reason LA is pure-race).
- **M225** TX §5.023 supplies implied covenants from the operative words, it does not "narrow an express seisin covenant." Reword.
- **M233** "UCC Art. 6 (as retained)" is accurate only for CA; NY/NJ/PA are tax successor-liability statutes. Relabel the non-CA rows.
- **M234** implements only §9-334(c)/(d)/(h); the (e)(1)/(e)(2)/(f) axes are out of scope and undisclosed. State the scope.
- **M224/M227/M228/M234** emit outcome conclusions (`bfp_protected`, `risk_on`, `survives_closing`, `priority`) with `defer_to_counsel: false`; add a standing "computed on the stipulated facts; not a title/enforceability opinion" disclaimer.
- **State-law chapter** the ground-lease financeability thresholds are market-underwriting norms sitting inside a document titled "Law Tables" — label them market practice. Confirm DE is in the runtime transfer-tax regime table (a DE doc row exists but M232 constants list only NY/CA/TX).
- **M199 / M169** two overlapping FIRPTA models (M199 ⊃ M169) with no cross-reference — link them or fold M169 in.
- **M198** `total_replacement_reserve_cents` folds the immediate-repair cost into the multi-year replacement reserve; lenders underwrite them separately. Relabel "total PCA reserve."
- **M183** make-whole and stated-call are framed as co-electable on the same date; they usually govern different windows; coupons are annual not semi-annual. One-line note.
- **M206** `materiality_scrape_default`/`sandbagging_default` are asserted market defaults with no authority/strength. Cite or mark un-sourced.
- **conformance** `specVersion` is ambiguous — frontmatter says `1.0.0-draft`, cite-as says `v1.0.0`. Reconcile. Date arithmetic (M219 month-add) needs an end-of-month rule; array outputs need an input-order-preservation requirement.
- **Authorities to confirm exist / are on point (`[VERIFY]`):** Clorox v. Chemical Bank (M214, reads like a security-interest matter), Rhone-Poulenc Agro v. DeKalb placed in an encumbrance model (M215; add In re Cybernetic Services, 9th Cir. 2001), "Matter of 105-02 Forest Hills (2025)" (M232), the TX strict-match ROFR authority (M231, no case/reporter), "Topp" (M155/AUTH-0237). M223 tables no cite for the ICANN 60-day lock; M222 labels all Class VI "§197" (off-the-shelf software is §167(f)).

---

## 6. Cross-cutting themes & recommended fix order

1. **Close the conformance spine (B1–B4).** Decide the number you ship and ship exactly that; adopt exact-decimal rounding (or restate the guarantee); specify money-division and solver contracts. Until this is done, the spec cannot deliver its headline promise. *(~1–2 days.)*
2. **Purge internal voice and count overclaims (B5, B8, B9, B10, and the "30-gate" line).** Retype the authority register in one pass; add the gate-predicate fields to the dictionary; rewrite the four scope notes in doctrine voice; lead with "17-gate framework." These are the honesty-of-framing fixes, and the spec's differentiation rests on them. *(~1–2 days.)*
3. **Fix the worked examples (B11–B16, B7, B6).** Prose/JSON reconciliation, the impossible TX-TBE example, the stale WA rate, the M221 table, the M202 step. These are the reader-facing catches. *(~1 day.)*
4. **Apply the "never guess" branch to M227 (B17)** and sweep the SHOULD-tier scope notes.
5. **Hand the `[VERIFY]` list (§9) to a licensed professional** before any public push; do not print a citation no one has confirmed.

Add two publish-gate checks so these can't recur: (a) an **allowed-authority-type set** check (would have caught B8); (b) a **golden-prose vs. golden-JSON** magnitude check on worked examples (would have caught B11/B12). A **grep-for-internal-voice** gate ("Founder decision", "pending sign-off", "recommended", "-draft") would have caught B10 and the frontmatter nit.

---

## 7. What the publish gate does and does not catch

Useful to state plainly, because the green `--publish` has been read as the bar: the gate is a **structural** validator. It confirms schemas exist, types are declared, cross-references resolve, constants are complete, golden inputs/outputs match their schemas, authority types don't *contradict each other*, and gates are named. It does **not** read prose for truth, compare example narration to example JSON, check that every declared output is computed by an algorithm step, evaluate a rounding rule against its own examples, verify an authority is typed correctly (only that it isn't typed two ways), detect internal voice, or confirm the advertised conformance count ships. Every finding above lives in that semantic gap. The gate is necessary and working; it is not sufficient, and it was never designed to be the editorial bar.

---

## 8. Verification note

I (the synthesizer) re-derived or re-checked, first-hand against the compiled files, every BLOCKING finding that is checkable from the document: the 385-vs-655 case count, the IEEE-754 double representations behind B2, the 0-hit greps behind B5, the empty reserved-gate grep behind the 30-gate claim, the authority mistypes and the Kendall duplicate (B8/B9), the four leaked scope notes (B10), the M184 cents-vs-prose and M181 IRR arithmetic (B11/B12), the M119 rounding prose (B13), the M225 TX/TBE inputs and deed enum (B14/B15), the M191 WA table and example (B16), the M202 missing step (B7), and the M221 §4/§5 contradiction (B6). Those are asserted with confidence.

The **domain-law-correctness** findings (a circuit's cramdown rule, WA's current REET schedule, ASC 842's non-binding status, the §1445 flush-sentence cite, Delaware's race classification, Subchapter V's current debt limit, the §280G cleansing-vote interaction) rest on the readers' subject-matter analysis plus my general knowledge; several are `[VERIFY]`-tagged. They are almost certainly right, but a specification that itself routes such questions to licensed professionals should hold its own citations to that standard — hence §9.

---

## 9. `[VERIFY]`-before-print list (hand to counsel / the founder)

These must be confirmed by a qualified professional before the public push; if confirmed adverse, several are BLOCKING:

1. **M155** — the efficient-market cramdown circuits "(2d, 5th, 6th, 8th)". *Texas Grand Prairie* (710 F.3d 324) applied the Till formula and declined to mandate a method — the 5th almost certainly does not belong. Map each circuit to a holding. **(BLOCKING if confirmed — drives a normative output.)**
2. **M166** — the "Moody's ultimate-recovery regression ≈ 0.90 × trading price + 0.06." Confirm the exact study/table, or relabel as a DEFINITIVE-authored heuristic informed by Moody's URD. **(BLOCKING if the coefficients are not published Moody's output.)**
3. **M191** — WA REET current graduated schedule and indexed band thresholds; the WA/NY controlling-interest aggregation windows.
4. **M167** — the current Subchapter V debt limit after the April-2025 §104 adjustment.
5. **M169/M199** — the §1445(a)-flush-sentence / PATH §324 cite for the 10% residence rate (currently §1445(c)(4)).
6. **M224** — Delaware recording-act classification (pure race vs. race-notice) under the operative text of 25 Del. C. §153.
7. **M232** — the mere-change exemption subsection (cited NY Tax Law §1405(b)(6)); confirm "Matter of 105-02 Forest Hills (2025)" exists and stands for step-transaction collapse.
8. **M231** — a real, named Texas strict-match ROFR authority (currently "exact-match rule," no reporter).
9. **M203** — Letter Ruling 202308010 (AUTH-0158): confirm it exists and is on point (it entered via empirical extraction, not the overlay).
10. **M214/M215** — Clorox v. Chemical Bank on point for chain-of-title; add In re Cybernetic Services (9th Cir. 2001) for patent-security perfection.
11. **M206/M208/M212** — reconcile escrow/break-up/reverse-break medians to the exact SRS Acquiom / ABA edition and table.

---

*Prepared by synthesizing seven independent domain readings and re-verifying every checkable blocking claim against the compiled `dist/definitive-public/` manuscript. Working notes: `scratchpad/critique-my-findings.md`.*
