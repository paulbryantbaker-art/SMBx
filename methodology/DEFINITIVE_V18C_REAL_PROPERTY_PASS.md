# DEFINITIVE V18c — Real Property & Contract Law Pass — IMPLEMENTATION RECORD

**Status: IMPLEMENTED 2026-07-16** (same-day as Paul's research pass below).
This header records how the pass landed in the substrate; the full research
report follows verbatim as the doctrine source of truth.

## Slot mapping — the pass's numbering vs. the shipped catalog

The pass's working numbers **M154–M164 were already occupied** in the shipped
DEFINITIVE v1.1 catalog (restructuring/LME models — M154 is Absolute Priority,
M160 is Exchange Offer, etc.). The eleven V18c models therefore landed at
**M224–M234**, status `v1_2`, all under gate **G30** (plus G19/G2 where noted):

| Pass # | Shipped slot | Runtime model | Line category |
|---|---|---|---|
| M154 Recording-Act & Priority Engine | **M224** | `MODEL.RE.RECORDING_PRIORITY.v1` | deterministic |
| M155 Title-Covenant & Estate/Signatory | **M225** | `MODEL.RE.TITLE_COVENANT_SIGNATORY.v1` | deterministic |
| M156 Marketability Triage | **M226** | `MODEL.RE.MARKETABILITY_TRIAGE.v1` | professional_handoff |
| M157 Risk-of-Loss Allocator | **M227** | `MODEL.RE.RISK_OF_LOSS.v1` | deterministic |
| M158 Survival/Merger Tracker | **M228** | `MODEL.RE.SURVIVAL_MERGER.v1` | deterministic |
| M159 Lease Anti-Assignment / CoC Parser | **M229** | `MODEL.RE.LEASE_COC_ASSIGNMENT.v1` | professional_handoff |
| M160 Due-on-Sale Screener | **M230** | `MODEL.RE.DUE_ON_SALE.v1` | deterministic |
| M161 Option/ROFR/ROFO Trigger Detector | **M231** | `MODEL.RE.PREEMPTIVE_RIGHT_TRIGGER.v1` | professional_handoff |
| M162 CITT & Reassessment Screener | **M232** | `MODEL.RE.CITT_REASSESSMENT_SCREEN.v1` | deterministic |
| M163 Permit/CO & Bulk-Sales Screener | **M233** | `MODEL.RE.PERMIT_CO_BULK_SALES.v1` | deterministic |
| M164 Fixture & § 9-334 Priority | **M234** | `MODEL.RE.FIXTURE_9334.v1` | deterministic |

Ground-lease financeability (pass Key Finding 8) already had a runtime home —
`MODEL.RE.GROUND_LEASE.MECHANICS.v1` (M198, tail-years + mortgagee-recognition
flags) — so M229 carries the anti-assignment/CoC layer and cross-references it.
M232 complements the existing `MODEL.RE.CITT.TRANSFER_TAX.v1` (M191, the
jurisdictional CITT schedule): M232 is the ≥50% screen + Prop 13 § 64 +
step-transaction flag.

## What shipped

- **All eleven models are EXECUTABLE runtime models** (not staged scaffolds):
  each reduces to table lookups + conditional logic once facts are supplied,
  which is exactly the deterministic substrate's shape. The pass's Stage 1/2/3
  ordering was collapsed into one landing.
- **Anchor-state variation as data** (pass Recommendation 5):
  `server/constants/realPropertyLaw.ts` — recording acts (DE/NC/LA race,
  NY/CA race-notice, TX notice with the resolved source-conflict note),
  risk-of-loss regimes (NY Risk Act, UVPRA states, equitable-conversion
  default), deed-covenant sets + TX § 5.023 seisin note, the signatory matrix,
  lease-consent defaults (*Kendall* vs. NY as-written), transfer-tax regimes
  (NY/CA/DE/TX incl. thresholds, aggregation, Forest Hills step-transaction
  note), Garn-St. Germain § 1701j-3(d) protected-transfer kinds, ground-lease
  financeability thresholds, and bulk-sales notification states. New states are
  added as rows. **Unknown states never guess** — the models return a
  table-gap flag + defer_to_counsel.
- **defer_to_counsel as a hard output contract** (pass E.3): the ten-trigger
  catalog (`DEFER_TO_COUNSEL_TRIGGERS`, DTC.RE.01–10) plus the hand-off
  template live in the constants module; every model emits
  `defer_to_counsel` + `counsel_handoff` phrased as issue-spotting. The models
  structurally emit classifications, flags, and citations — never
  enforceability judgments, marketability opinions, or document drafts.
- **Conformance battery** (pass E.4): **183 new cases** across 11 categories
  (recording 25 · covenant/signatory 20 · marketability 15 · risk-of-loss 12 ·
  survival/merger 15 · lease CoC 24 · due-on-sale 12 · preemptive rights 15 ·
  CITT/reassessment 18 · permit/CO/bulk 13 · fixture/§ 9-334 12), with
  routing/defer assertions and needs_inputs cases embedded per category.
  Every expected value was hand-derived from the doctrine (statutes/rules),
  independent of the implementation. Model-runtime cases: 202 → **385**;
  total conformance suite: 472 → **655**, all green. Catalog slots: 123 →
  **134** (`DEFINITIVE.v1.1` version string retained; the additions are staged
  as `v1_2`).

## Deviations from the pass (all conservative)

1. **No new gates.** The pass said "11 new models/gates"; all eleven landed as
   models under the existing G30 (+G19/G2 tags). G30's trigger summary gained
   the property/contract-law line.
2. **Bulk-sales defer fires on asset deals only** (entity deals compute the
   state list but don't route on it); CERCLA defers regardless of form.
3. **CA sole-discretion clauses** output
   `sole_discretion_written_verify_ca_limits` rather than "enforced as
   written" — California's post-*Kendall* treatment of express sole-discretion
   clauses is left to counsel, not asserted.
4. The remaining pass categories that are prompt-layer rather than
   model-layer (statute-of-frauds checklist, PSA condition state machine,
   estoppel/SNDA outbound request drafting, remedy menus) are NOT modeled yet —
   they belong to the Yulia prompt/tooling layer and are flagged as the V18c
   follow-on, mirroring how V18a/V18b landed as `taxEngine.ts`/`legalEngine.ts`
   distillations.

---

*The full research pass follows verbatim (Paul, 2026-07-16).*

# DEFINITIVE V18c — Real Property & Contract Law Correctness and Completeness Pass

## TL;DR
- DEFINITIVE's real-estate layer is doctrinally sound on the six-lens framework and models M139–M153, but it has a **black-letter law gap**: those models are economic/tax/regulatory, with no deterministic home for title-covenant/marketability logic, recording-act priority, risk-of-loss allocation, anti-assignment/change-of-control parsing, survival/merger tracking, option/ROFR trigger detection, due-on-sale screening, or permit/CO transferability. This pass proposes 11 new models/gates (M154–M164), a defer_to_counsel trigger catalog, and a ~230-test conformance battery to close them.
- The governing law is overwhelmingly **state common law** with sharp anchor-state variation: recording acts (DE = pure race; NY [N.Y. Real Prop. Law § 291] and CA [Cal. Civ. Code § 1214] = race-notice; TX [Tex. Prop. Code § 13.001] = notice), risk of loss (NY protects the seller via N.Y. Gen. Oblig. Law § 5-1311; CA and TX [Tex. Prop. Code § 5.007] adopted the UVPRA; the common-law default puts risk on the buyer), transfer tax (NY controlling-interest RPTT/RETT at ≥50%; CA documentary tax + Prop 13 change-in-ownership; DE high rate; TX none — constitutionally prohibited by Tex. Const. art. VIII § 29), and lease consent reasonableness (CA implies reasonableness per *Kendall v. Ernest Pestana*; NY enforces "sole discretion" as written).
- The correct posture ("The Line") is preserved and hardened: Yulia does **issue-spotting and routing**, never legal opinions, enforceability judgments, or transaction-document drafting. The deliverable is a defensible ISSUE-SPOTTING-to-ROUTING matrix in which each doctrine is tagged deterministic / analysis-options-implications / defer_to_counsel, with red-flag thresholds — so nothing a competent M&A real estate lawyer would spot is ever missed, and nothing is ever opined on.

## Key Findings

1. **The current model set is economically complete but legally under-specified.** M139–M153 cover tax, environmental, financing, transfer tax, CFIUS, and ASC 842 — the quantitative lenses. None parses the transaction documents for the property-law and contract-law issues that actually kill or reprice deals. That is the gap this pass closes.

2. **Recording-act type varies among the anchors and changes the priority answer.** Delaware is one of only three pure **race** jurisdictions — Wikipedia's authoritative survey states "Currently, Delaware, North Carolina, and Louisiana are the only jurisdictions where a race statute is in effect," and Cornell LII (Wex) corroborates that race statutes are used by "a small minority of states, including Delaware and North Carolina." In a race state, first-to-record wins even with actual notice of a prior conveyance. New York (§ 291) and California (Civ. Code § 1214) are **race-notice** — the later BFP must take without notice AND record first. Texas (Tex. Prop. Code § 13.001) is a **notice** state — the later BFP who takes "without notice" prevails regardless of recording order. This is deterministic conditional logic once state and recording dates are known.

3. **Deed type determines the seller's title exposure and is a first-class deal term.** General warranty deeds carry all six covenants (seisin, right to convey, against encumbrances — the present covenants; quiet enjoyment, warranty, further assurances — the future covenants). Special/limited warranty deeds warrant only against the grantor's own acts. Bargain-and-sale and quitclaim deeds warrant nothing. Texas even modifies the statutory covenant of seisin (Tex. Prop. Code § 5.023) to a narrower "grantor has not previously conveyed" formulation. After-acquired title / estoppel by deed automatically vests later-acquired title in the grantee of a warranty deed.

4. **Risk of loss between signing and closing is a default rule the contract almost always overrides — but the default varies.** The common-law majority rule (equitable conversion) puts risk on the buyer at signing. New York rejects equitable conversion for risk purposes and codifies seller-risk in N.Y. Gen. Oblig. Law § 5-1311 (the NY Risk Act). California, Hawaii, Michigan, and Nevada adopted the UVPRA. Texas codified the UVPRA at Tex. Prop. Code § 5.007 — risk stays on the vendor until legal title or possession passes. This is analysis-options-implications with a deterministic default lookup.

5. **Merger doctrine silently extinguishes contract promises at closing unless a survival clause is present.** Once the deed is delivered and accepted, contract terms relating to title merge into the deed; only collateral obligations, expressly surviving terms, and fraud claims persist. Survival-clause tracking is therefore a deterministic must-catch: every representation, indemnity, and post-closing covenant the client relies on needs an express survival hook or it vanishes at closing.

6. **Entity-level and change-of-control transfers trigger a cascade of property-linked consequences even with no deed.** A stock/equity deal or merger with no new deed can still trigger (a) real estate transfer tax on a controlling-interest transfer (NY RPTT/RETT at ≥50%; CA documentary transfer tax + Prop 13 change-in-ownership on >50% entity control), (b) due-on-sale/due-on-transfer acceleration under property loans, (c) deemed-assignment and change-of-control defaults under leases, and (d) permit/license/CO transfer requirements. These are the highest-value missed issues in entity deals.

7. **Due-on-sale is a federal overlay (Garn-St. Germain, 12 U.S.C. § 1701j-3) whose consumer exceptions do NOT protect commercial or entity deals.** The statute bars a lender from exercising a due-on-sale option only "With respect to a real property loan secured by a lien on residential real property containing less than five dwelling units, including a lien on the stock allocated to a dwelling unit in a cooperative housing corporation, or on a residential manufactured home" (§ 1701j-3(d)). For commercial mortgages and entity-level transfers, the lender's right to accelerate on transfer is essentially unconstrained by Garn-St. Germain; lender consent becomes a closing-condition critical path.

8. **Ground leases are financeable only if they clear specific lender-protection thresholds.** Institutional leasehold-mortgagee standards require a remaining term (with unilateral extensions) of at least 20–25 years beyond loan maturity, notice-and-cure rights to the mortgagee, a new-lease right on termination, non-merger of fee and leasehold, and a freely assignable/mortgageable tenant interest. A ground lease missing these is a financing deal-killer or a repricing event.

## Details

### A) Real Property Law Doctrine as Applied to Deals

**Estates, concurrent ownership, and who must sign.** Fee simple absolute is the default transferable estate; defeasible fees (fee simple determinable / subject to condition subsequent) carry reverter/re-entry rights that can defeat title on a use change and must be flagged. Life estates and remainders split signing authority. Concurrent ownership drives the signature matrix: **tenancy in common** (each cotenant conveys only its undivided share), **joint tenancy** (survivorship; severance risk), and **tenancy by the entirety** (spousal; in entirety states BOTH spouses must sign to convey or encumber — a classic missed-signatory deal-killer). *Routing:* who-must-sign is deterministic once the vesting deed and marital/entity status are known; enforceability of any signature block is defer_to_counsel.

**Deeds and covenants of title.** (See Key Finding 3.) *Routing:* deed-type identification and covenant-set mapping are deterministic; whether a covenant has been breached is defer_to_counsel.

**Marketable vs. insurable title.** Marketable title is free of defects a reasonably prudent buyer would object to; it is the common-law contract default. Insurable title is a lesser standard — a title insurer agrees to insure over a known defect at standard rates. Critical distinction for the toolset: a contract promising only "insurable" title can force the buyer to accept a defect a title company will insure over but that impairs resale. Defects sort into three buckets: **curable** (pay off and record a satisfaction), **insurable-over** (old unreleased mortgage, minor gap), and **deal-killing** (unmarketable and uninsurable — a break in the chain of title, an un-locatable boundary, an adverse ownership claim). *Routing:* the three-bucket triage is analysis-options-implications; the ultimate marketability judgment and any title opinion are defer_to_counsel (Yulia is not a title agent).

**Recording acts, BFP, chain of title.** (See Key Finding 2.) The bona fide purchaser doctrine protects a purchaser for value without actual, constructive (record), or inquiry notice. Failure to record risks losing priority to a later BFP (in notice/race-notice states) or to anyone who records first (race states). *Routing:* priority ordering given recording dates and state is deterministic; curing a priority defect is defer_to_counsel.

**Easements, covenants, servitudes, common-interest regimes.** Easements appurtenant run with the land; easements in gross are personal. Express, implied (prior use / necessity), and prescriptive easements each have different proof. Real covenants (damages) and equitable servitudes (injunction) plus CC&Rs bind successors and can restrict use or transfer. Condominium/co-op/PUD regimes carry transfer restrictions, rights of first refusal, and board-consent requirements that must be surfaced. *Routing:* existence/identification from title and survey is deterministic-to-analysis; enforceability and scope are defer_to_counsel.

**Encroachments, boundaries, adverse possession, and the survey.** An ALTA/NSPS Land Title Survey reveals encroachments, boundary conflicts, easement locations, access, and setback issues. Adverse possession and boundary-by-acquiescence claims can cloud title. *Routing:* survey-exception triage is analysis-options-implications; quiet-title strategy is defer_to_counsel.

**Fixtures and the real-vs-personal line (UCC Article 9 § 9-334).** Classification changes PPA allocation, transfer tax base, depreciation, and lien priority. § 9-334 sets fixture-financing priority: the general rule (subsection (c)) subordinates a fixture security interest to a conflicting real-property interest; the **purchase-money exception (subsection (d))** gives a PMSI priority over a prior recorded real-property interest if "the security interest is perfected by a fixture filing before the goods become fixtures or within 20 days thereafter" (verbatim, § 9-334(d); Official Comment 7 notes the former 10-day period "has been changed to 20 days"); construction-mortgage priority (subsection (h)) can override. *Routing:* fixture classification and PPA impact are analysis-options-implications; § 9-334 priority given filing dates is deterministic; the ultimate legal characterization is defer_to_counsel.

**Water, mineral, air, and severed estates.** Severed mineral estates (dominant in TX) can burden surface use; water rights (riparian East vs. prior-appropriation West) and air/development rights affect value and use. *Routing:* flag-and-analyze; valuation and title effect are defer_to_counsel.

**Zoning and land use.** Permitted use, legal nonconforming ("grandfathered") use, variances, special/conditional use permits, entitlements, and certificates of occupancy. Key deal mechanics: a **legal nonconforming use generally runs with the land and survives a change of ownership**, but can be lost by abandonment/discontinuance or by expansion; and many municipalities require a **new/updated certificate of occupancy on transfer, change of use, or re-occupancy**, which can trigger re-permitting and code-compliance upgrades. *Routing:* CO-on-transfer and re-permitting triggers are deterministic screens once the jurisdiction is known; zoning-compliance opinions are defer_to_counsel.

**Eminent domain / condemnation.** Pending or threatened takings must be disclosed and priced; a taking during the executory period interacts with the risk-of-loss regime. *Routing:* disclosure/flag is deterministic; valuation is analysis.

**Mechanic's/materialmen's liens.** These can attach and, in many states, relate back to commencement of work, priming later-recorded interests; lien waivers and date-down/gap coverage at closing manage the risk. *Routing:* lien-waiver checklist and gap-coverage requirement are deterministic; lien validity/priority disputes are defer_to_counsel.

**ADA Title III.** Accessibility obligations travel with commercial (public-accommodation) property; the buyer inherits exposure for existing barriers. *Routing:* flag as diligence item and analysis input.

**Property-tax reassessment on transfer (distinct from transfer tax).** California Prop 13 reassesses to current fair market value on a "change in ownership." For entity-held property, a **change in control (>50% of the entity, R&T Code § 64) triggers 100% reassessment**, and cumulative transfers of original co-owner interests exceeding 50% also trigger it — the "entity-transfer reassessment trap." This is economically enormous and independent of documentary transfer tax. *Routing:* reassessment screening is deterministic given ownership-percentage facts; the reassessment amount is analysis; entity-structuring advice is defer_to_counsel.

### B) Contract Law as Applied to Real Estate Deals

**Statute of frauds.** A real estate sale contract must be in writing, signed by the party to be charged, with essential terms (parties, property description, price/consideration). The part-performance exception (some combination of possession, payment, and improvements) can take an oral contract out of the statute in equity. *Routing:* essential-terms checklist is deterministic; enforceability of a defective writing is defer_to_counsel.

**PSA architecture → deterministic condition-tracking.** Conditions precedent/contingencies (financing, title, survey, environmental, entitlement, estoppel), representations and warranties (title, leases, environmental, zoning, litigation, condition), covenants, and closing conditions map cleanly to a deterministic condition-tracking state machine (satisfied / waived / failed / pending, each with a deadline). This is the single most natural fit for DEFINITIVE's deterministic substrate.

**Risk of loss.** (See Key Finding 4.)

**Remedies.** Real estate uniquely qualifies for **specific performance** because land is presumed unique (buyer's remedy; sellers can also seek it but usually take the deposit). **Liquidated damages / earnest-money forfeiture** is enforceable only if it is a reasonable pre-estimate of damages and not a penalty; some states cap or presumptively bless it. California's residential rule is concrete: under Cal. Civ. Code § 1675(c), "If the amount actually paid pursuant to the liquidated damages provision does not exceed 3 percent of the purchase price, the provision is valid... unless the buyer establishes that the amount is unreasonable," and § 1675(a) limits this to residential dwellings of "not more than four residential units" the buyer intends to occupy. Time-is-of-the-essence clauses make the closing date material. *Routing:* remedy menu is analysis-options-implications; enforceability of a specific LD clause is defer_to_counsel.

**Merger doctrine.** (See Key Finding 5.)

**Assignment / anti-assignment.** Assignability of the PSA and consent standards ("reasonable" vs. "sole discretion") govern deal structure and drop-downs. *Routing:* clause identification and consent-path mapping are deterministic-to-analysis; enforceability is defer_to_counsel.

**Closing/escrow mechanics.** Closing conditions, prorations, and the recording sequence (payoff/satisfaction recorded, then deed, then new mortgage) drive priority. *Routing:* sequence and proration math are deterministic.

**Indemnification, holdbacks, R&W insurance.** Escrow holdbacks and R&W insurance backstop the survival of real-property reps; RWI increasingly covers title/lease/environmental reps subject to exclusions. *Routing:* structure options are analysis; policy terms/enforceability are defer_to_counsel.

### C) Lease Contract Law (leasehold, leaseback, OpCo/PropCo)

**Assignment vs. sublease; change-of-control; the deemed-assignment trap.** An assignment transfers the entire leasehold; a sublease creates a new estate under the tenant. The critical M&A trap: absent specific lease language, a **change of control of a corporate/LLC tenant is generally NOT an assignment "by operation of law" and does not breach a basic anti-assignment clause** — New York courts consistently hold this and require the lease to expressly deem a change of control an assignment. Conversely, many modern leases DO expressly define a stock/control transfer as a deemed assignment requiring consent. Consent-standard reasonableness varies by anchor: **California implies a reasonableness standard** even where the lease is silent — *Kendall v. Ernest Pestana, Inc.*, 40 Cal.3d 488 (1985), held "where a commercial lease provides for assignment only with the prior consent of the lessor, such consent may be withheld only where the lessor has a commercially reasonable objection to the assignee or the proposed use"; **New York enforces "sole discretion"/absolute-consent clauses as written** (no implied reasonableness). Recapture rights let the landlord take back the space instead of consenting. *Routing:* clause parsing (does it deem change-of-control an assignment? what is the consent standard?) is deterministic-to-analysis; the ultimate enforceability/reasonableness judgment is defer_to_counsel.

**Estoppel certificates and SNDAs.** An estoppel certificate is a point-in-time tenant/landlord certification of lease status (term, rent, defaults, prepayments) that a buyer/lender relies on and that estops later contrary claims. An **SNDA** has three parts: **Subordination** (lease subordinate to the mortgage), **Non-Disturbance** (lender won't disturb a non-defaulting tenant on foreclosure), and **Attornment** (tenant recognizes the foreclosure purchaser as landlord). *Routing:* Yulia may generate the client's OUTBOUND estoppel/SNDA/consent REQUESTS; drafting the operative instruments and judging their legal effect are defer_to_counsel.

**Ground leases.** (See Key Finding 8.)

**Purchase options, ROFRs/ROFOs.** A sale or change of control can trigger a tenant's or co-owner's purchase option or right of first refusal/offer. Key structuring point: a ROFR usually applies to a **sale of the property**, so a **sale of ownership interests in the property-owner entity may avoid the ROFR** unless the ROFR expressly captures entity transfers — a double-edged sword the toolset must flag both ways. Texas courts interpret ROFR matching strictly (exact-match of third-party terms). *Routing:* trigger detection is deterministic-to-analysis; whether a specific transaction legally triggers the right is defer_to_counsel.

**Due-on-sale / due-on-transfer (Garn-St. Germain interface).** (See Key Finding 7.)

**Holdover, CAM, percentage rent, co-tenancy.** These alter EBITDAR and covenant math (co-tenancy rent reductions if anchor tenants leave; percentage-rent volatility; holdover premiums). *Routing:* the EBITDAR/covenant impact is deterministic-to-analysis feeding the financial models.

### D) Deal-Structure / Transaction-Form Correctness

**Asset vs. stock/equity vs. statutory merger — the property-treatment fork.**
- **Asset deal:** new deed required → transfer tax on the deed, recording, title re-run/new policy, landlord consent to lease assignment, lender consent/payoff, permit/license/CO transfer. Highest friction on the property side.
- **Stock/equity deal:** no deed, but → controlling-interest transfer tax (NY/CA and others), Prop 13 change-in-ownership reassessment (CA), due-on-sale/change-of-control triggers under loans and leases, and permit/license transferability review. The "no deed = no property issues" assumption is the single most dangerous misconception the toolset must guard against.
- **Statutory merger:** property vests by operation of law. Whether this triggers transfer tax / consent / due-on-sale depends on the state's "mere change in identity or form" exemption and its limits. NY exempts a transfer to the extent beneficial ownership is unchanged (NYC RPTT § 11-2106(b)(8); NY RETT § 1405(b)(6)), but the **step-transaction doctrine can collapse a merger + follow-on interest transfer** and defeat the exemption (*Matter of 105-02 Forest Hills*, NYC Tax App. Trib. 2025). The NY "controlling interest" threshold is fixed by statute: NYC Admin. Code § 11-2101 defines it as, "In the case of a corporation, fifty percent or more of the total combined voting power of all classes of stock... and, in the case of a partnership, association, trust or other entity, fifty percent or more of the capital, profits or beneficial interest," with separate transfers by persons acting in concert aggregated over a three-year period (NY Pub. 576). Merger "by operation of law" also does not automatically waive lease anti-assignment or loan due-on-sale clauses drafted to capture it.

**Drop-downs, spins, F-reorgs, pre-closing carve-outs.** Pre-closing real estate carve-outs (dropping property into a new entity, then transferring interests) are common to manage transfer tax and reassessment — but each internal step can itself be a transfer/change-in-ownership event and can trip lease/loan consent. *Routing:* step-by-step trigger mapping is deterministic-to-analysis; the structuring recommendation is defer_to_counsel (and tax counsel).

**Bulk sales and successor liability.** UCC Article 6 bulk-sales law is repealed in most states but survives in modified/tax form in several (CA actively enforced; also NY, NJ, PA, and others with bulk-sales tax-notification regimes). Even where repealed, **successor liability persists** via fraudulent-transfer law, de facto merger / mere-continuation doctrine, and — critically for real-property-linked deals — **CERCLA environmental successor liability** and state tax successor liability. In Pennsylvania, bulk-sales clearance can be triggered even by a real-estate-only transfer. *Routing:* bulk-sales/tax-clearance applicability screen is deterministic given the states involved; successor-liability exposure analysis feeds the models; the legal conclusion is defer_to_counsel.

### E) Robustness / Gap-Detection / Conformance Architecture (the core of this pass)

**E.1 — Issue-spotting-to-routing matrix (representative rows).** Each row: doctrine → catching model/gate → routing tag → red-flag threshold.

| # | Issue | Model/Gate | Routing | Red-flag threshold |
|---|---|---|---|---|
| 1 | Recording-act priority | M154 (new) | Deterministic | Unrecorded prior interest + BFP risk in race/race-notice state |
| 2 | Deed-type / covenant scope | M155 (new) | Deterministic→AOI | Quitclaim or bargain-and-sale where buyer expects warranty |
| 3 | Marketable vs. insurable title triage | M156 | AOI→defer | Any deal-killing (unmarketable+uninsurable) defect |
| 4 | Risk of loss allocation | M157 (new) | AOI (deterministic default) | Contract silent + material casualty/condemnation pending |
| 5 | Survival vs. merger | M158 (new) | Deterministic | Relied-on rep/indemnity lacks express survival clause |
| 6 | Anti-assignment / change-of-control (lease) | M159 (new) | Deterministic→AOI | Lease deems control transfer an assignment; consent required |
| 7 | Due-on-sale / due-on-transfer (loan) | M160 (new) | Deterministic→AOI | Commercial loan + any transfer; entity transfer w/ due-on-transfer |
| 8 | Option / ROFR / ROFO trigger | M161 (new) | Deterministic→AOI | Sale or control change that may trigger a preemptive right |
| 9 | Transfer-tax / controlling-interest | M148 (existing) + M162 | Deterministic | ≥50% entity interest transfer in NY/CA-type regime |
| 10 | Prop 13 / reassessment on transfer | M162 (new) | Deterministic→AOI | >50% CA entity control change or cumulative >50% |
| 11 | Permit / license / CO transferability | M163 (new) | Deterministic | CO-on-transfer jurisdiction; use change; non-transferable permit |
| 12 | Fixture / § 9-334 priority & PPA | M164 (new) | Deterministic→AOI | PMSI fixture filing outside 20-day window; PPA fixture split |
| 13 | Ground-lease financeability | M159/financing | AOI | Remaining term < loan maturity + 20–25 yrs; no mortgagee cure |
| 14 | Bulk sales / successor liability | M163/M162 | Deterministic→AOI | Asset deal in CA/PA-type state; CERCLA-linked property |
| 15 | Concurrent-ownership signatory | M155 | Deterministic | Tenancy-by-entirety/co-tenant missing from signature block |

**E.2 — Legal gaps in M139–M153 and proposed additions.** The existing set has NO deterministic home for property/contract-law doctrine. Proposed new models/gates:
- **M154 Recording-Act & Priority Engine** — state-typed (race/notice/race-notice) priority ordering from recording dates + BFP/notice facts.
- **M155 Title-Covenant & Estate/Signatory Model** — deed-type→covenant map; estate & concurrent-ownership signatory matrix; after-acquired-title flag.
- **M156 Marketability Triage** — curable / insurable-over / deal-killing bucketing of title exceptions.
- **M157 Risk-of-Loss Allocator** — state default (equitable conversion vs. UVPRA/NY Risk Act) + contract-override detection.
- **M158 Survival/Merger Tracker** — flags every relied-on rep/indemnity/covenant lacking an express survival hook.
- **M159 Lease Anti-Assignment / Change-of-Control & Ground-Lease Parser** — deemed-assignment detection, consent-standard classification, recapture/ROFR interplay, ground-lease financeability checklist.
- **M160 Due-on-Sale Screener** — Garn-St. Germain residential-exception filter; commercial/entity due-on-transfer flag; consent critical-path.
- **M161 Option/ROFR/ROFO Trigger Detector** — sale vs. entity-transfer trigger analysis (both directions).
- **M162 Controlling-Interest Transfer-Tax & Reassessment Screener** — ≥50% entity thresholds; Prop 13 change-in-control; step-transaction flag.
- **M163 Permit/CO/License Transferability & Bulk-Sales Screener** — CO-on-transfer jurisdictions; non-transferable permits; bulk-sales/tax-clearance applicability.
- **M164 Fixture Classification & § 9-334 Priority Model** — real-vs-personal line; PPA allocation impact; fixture-filing 20-day priority.

**E.3 — defer_to_counsel trigger catalog (exhaustive moments to stop and route).** Route to real estate / transaction counsel (phrasing the hand-off as issue-spotting, never opinion) at any of:
1. Any request to judge whether title is marketable or whether a defect is fatal.
2. Any request to opine on enforceability of any clause (LD, anti-assignment, consent standard, survival, option/ROFR, due-on-sale).
3. Any drafting of a transaction document (PSA, deed, lease, SNDA, estoppel as an instrument, title instrument, guaranty).
4. Any conclusion about whether a specific transfer legally triggers transfer tax, reassessment, due-on-sale, a preemptive right, or a deemed assignment.
5. Any question about whether a covenant of title has been breached or what remedy lies.
6. Any recommendation on deal structure to achieve a legal/tax result (carve-out, F-reorg, drop-down).
7. Any adverse-possession, boundary, quiet-title, or easement-scope dispute.
8. Any bulk-sales/successor-liability or CERCLA successor determination.
9. Any zoning/entitlement compliance or nonconforming-use continuation opinion.
10. Any interpretation of ambiguous contract language or resolution of a conflict between the contract and the deed.

Hand-off phrasing template: *"This raises a [doctrine] issue that turns on [specific facts/clause]. That's a legal determination for your real estate/transaction counsel. Here are the options and implications for your decision, and here is a drafted information/estoppel/consent request you can send."*

**E.4 — Conformance test battery (categories and approximate counts).**
- Recording-act priority scenarios across DE/NY/CA/TX (race/notice/race-notice permutations): **~24 tests.**
- Deed-type → covenant-scope and signatory-matrix (concurrent-ownership permutations): **~20 tests.**
- Marketability triage (curable / insurable-over / deal-killing): **~15 tests.**
- Risk-of-loss default + override across anchors: **~12 tests.**
- Survival/merger catch (rep/indemnity with and without survival hooks): **~15 tests.**
- Lease anti-assignment / change-of-control / consent-standard (CA vs. NY): **~24 tests.**
- Due-on-sale (residential-exception vs. commercial/entity): **~12 tests.**
- Option/ROFR/ROFO trigger (asset vs. entity transfer): **~15 tests.**
- Controlling-interest transfer tax + Prop 13 reassessment: **~18 tests.**
- Permit/CO transferability + bulk sales: **~12 tests.**
- Fixture / § 9-334 priority + PPA: **~12 tests.**
- defer_to_counsel routing (must-stop moments; assert NO opinion emitted): **~30 tests.**
- Deal-structure fork (asset/stock/merger property-treatment correctness): **~18 tests.**

Total: **~230 conformance tests** across 13 categories, with a hard gate that the routing tests confirm zero legal opinions/enforceability judgments/document drafts are ever emitted.

## Recommendations

1. **Stage 1 (immediate): build M154, M155, M157, M158, M160 first.** These five (recording priority, title-covenant/signatory, risk-of-loss, survival/merger, due-on-sale) are the highest-frequency, most-deterministic, most-dangerous-if-missed issues and the cleanest fits for the deterministic substrate. Benchmark to advance: each passes its conformance sub-battery at 100% and never emits an opinion.
2. **Stage 2: build M159, M161, M162 (the entity-deal cluster).** These close the "no deed = no problem" gap — the deemed-assignment, ROFR-trigger, and controlling-interest-tax/reassessment issues that entity/merger deals hide. Threshold to prioritize: any deal in the pipeline structured as stock/equity/merger with real property in NY, CA, or a controlling-interest-tax state.
3. **Stage 3: build M156, M163, M164.** Marketability triage, permit/CO/bulk-sales, and fixture/§9-334 — important but lower frequency or more analysis-heavy.
4. **Wire every model to the defer_to_counsel catalog (E.3) as a hard gate, not a soft suggestion.** The routing layer must be non-bypassable: if a query matches a must-stop trigger, the system routes and offers options/implications + a drafted information request, and structurally cannot emit an enforceability judgment or a transaction-document draft.
5. **Encode anchor-state variation as data, not logic.** Recording-act type, risk-of-loss default, transfer-tax/reassessment regime, and consent-reasonableness rule should be per-state lookup tables (starting DE/NY/CA/TX) so new states are added as data. This keeps the deterministic engine correct as coverage expands beyond the anchors.
6. **Run the ~230-test conformance battery (E.4) as a release gate for V18c**, with the defer_to_counsel routing tests weighted as blocking. Re-run on every model or state-table change.
7. **Change-of-recommendation thresholds to monitor:** if a title defect is triaged deal-killing (not insurable-over); if a lease deems change-of-control an assignment and consent is discretionary; if a commercial loan has a due-on-transfer clause; if entity control crosses 50% in a reassessment/controlling-interest state; if a ground-lease remaining term is under loan maturity + ~20–25 years; if a relied-on rep lacks a survival clause — each flips the recommendation from "proceed/analyze" to "stop and route to counsel with these options."

## Consolidated Authority Register

| Doctrine / Standard | Citation | Anchor-state variation | Deal relevance |
|---|---|---|---|
| Recording acts | N.Y. Real Prop. Law § 291; Cal. Civ. Code § 1214; Tex. Prop. Code § 13.001 | DE = pure race (with LA, NC); NY & CA = race-notice; TX = notice | Priority among competing interests; BFP protection |
| Deed covenants / seisin | Common law; Tex. Prop. Code § 5.023 | TX narrows statutory seisin covenant | Seller title exposure; general vs. special warranty |
| Risk of loss | Equitable conversion (common law); N.Y. Gen. Oblig. Law § 5-1311; Tex. Prop. Code § 5.007 (UVPRA) | NY = seller-risk (Risk Act); CA/TX = UVPRA; default = buyer-risk | Casualty/condemnation between signing and closing |
| Merger doctrine | Common law | Applied per state; survival clause overrides everywhere | Contract reps/indemnities vanish absent survival clause |
| Fixtures priority | UCC § 9-334(d) (20-day PMSI fixture-filing window) | Uniform (Article 9 enacted in all anchors) | PPA allocation, transfer-tax base, lien priority |
| Due-on-sale | Garn-St. Germain, 12 U.S.C. § 1701j-3(d) | Federal; consumer exceptions only <5 residential units | Loan acceleration on transfer; lender-consent critical path |
| Controlling-interest transfer tax | NYC Admin. Code § 11-2101, § 11-2106(b)(8); NY RETT § 1405(b)(6); NY Pub. 576 | NY & CA tax ≥50% entity transfers; DE high rate; TX none (Tex. Const. art. VIII § 29) | Entity/merger deals incur tax with no deed |
| Prop 13 reassessment | Cal. Rev. & Tax. Code §§ 60–64 | CA-specific; >50% control change = 100% reassessment | Massive property-tax step-up in CA entity deals |
| Lease consent reasonableness | *Kendall v. Ernest Pestana, Inc.*, 40 Cal.3d 488 (1985) | CA implies reasonableness; NY enforces "sole discretion" | Change-of-control consent path in OpCo/PropCo deals |
| Liquidated damages (residential) | Cal. Civ. Code § 1675(a),(c) (3% presumption, ≤4 units) | CA statutory; elsewhere reasonableness/penalty test | Earnest-money forfeiture enforceability |
| Ground-lease financeability | Institutional leasehold-mortgagee standards | Contract-driven; ~20–25 yr remaining-term threshold | Leasehold financing viability |
| Bulk sales / successor liability | UCC Art. 6 (repealed most states); CERCLA; state tax successor statutes | CA/NY/NJ/PA retain tax-notification; PA reaches real estate | Buyer inherits tax/environmental liability in asset deals |

## Caveats

- **Not legal advice; issue-spotting only.** This report and the models it specifies identify issues and route them; they do not render legal opinions, judge enforceability, or draft transaction documents. That posture is the deliverable's core constraint, not a disclaimer.
- **State-law variation beyond the four anchors.** DE/NY/CA/TX are illustrative anchors; the ~46 other states diverge on recording-act type, risk-of-loss, transfer/mortgage-recording tax, lease-consent reasonableness, and bulk sales. The per-state data-table approach is essential; do not generalize anchor rules nationally.
- **A genuine source conflict was resolved.** Secondary sources disagreed on Texas's recording-act type (some lists included it as race-notice). The controlling authority — Tex. Prop. Code § 13.001, which protects a subsequent purchaser "without notice" with no first-to-record requirement — makes Texas a **notice** state; the race-notice characterizations are wrong. The toolset should encode the statutory rule, not the secondary lists.
- **Law changes.** Prop 19 (CA) altered intergenerational reassessment exclusions; NYC's step-transaction application to the mere-change exemption is evolving (2025 Tribunal decision); Garn-St. Germain regulatory guidance and Fannie/Freddie LLC-transfer policies shift. Date-stamp the state tables and re-verify on a fixed cadence.
- **Non-US jurisdictions are research-only** in this pass, as scoped; cross-border real property (foreign situs, FIRPTA on the tax side, non-US recording/registration systems) is flagged for a later amendment.
- **The advisory cap and league-neutrality hold:** the property/contract-law layer is first-class from ~$300K Main Street (where a missing CO-on-transfer or a tenancy-by-entirety signature gap kills a deal) through mega-cap (where controlling-interest transfer tax and step-transaction risk dominate); no league is the default.
