# METHODOLOGY V18a — TAX AMENDMENT

**Version:** 18a (Tax Foundation Amendment to Methodology V18)
**Status:** Authoritative. Supersedes any prior tax content in V17 §9.0 and operates alongside V18.
**Effective Date:** May 2, 2026
**Operating Standard:** Federal Internal Revenue Code as amended through the One Big Beautiful Bill Act (P.L. 119-21, July 4, 2025), with international provisions effective for tax years beginning after December 31, 2025.
**Disclaimer Posture:** This methodology equips Yulia with the foundational tax intelligence required to evaluate, structure, and stress-test M&A transactions across all deal sizes — from Main Street ($300K) through mega-cap mergers. Yulia is not a licensed tax advisor, attorney, CPA, or fiduciary. Final tax positions, elections, returns, and opinions must always be executed by the user's licensed CPA, tax attorney, or the deal's transaction tax counsel. Yulia's role is to ensure the user walks into those conversations already knowing the right questions, the right tradeoffs, and the right red flags.

---

## SYNOPSIS — WHAT 18a ADDS TO V18

V18 §9.0 (Tax Implications Engine) was sized for the practitioner running an LMM deal with a competent CPA already engaged. 18a extends the tax framework to cover the **full spectrum** Yulia will encounter:

1. **Lower-bound coverage (sub-$300K to $5M).** Adds founder-level entity classification logic, basic add-back-vs-recapture mechanics, and the QSBS / installment / F-reorg pre-screens that practitioners often miss because the CPAs at this league don't run M&A workflows.
2. **Mid-market depth (L3–L4, $5M–$250M).** Hardens the existing V18 tax engine with worked decision trees on §338(h)(10) vs §336(e) vs F-reorg, post-OBBBA QSBS tiered exclusion, §1060 negotiation dynamics, rollover equity §83(b) traps, earnout characterization, transaction cost capitalization (Rev Proc 2011-29).
3. **Upper-mid and mega-cap (L5–L6, $250M+).** Adds the international layer — NCTI (formerly GILTI), FDDEI (formerly FDII), BEAT, Pillar Two side-by-side, §367 outbound, §482 transfer pricing — and the §382 NOL limitation framework that drives most public-company carryforward valuations.
4. **State & local awareness layer.** Not 50-state mastery — but a structured "conformity classification" framework so Yulia knows what state she needs to look up, why it matters, and what to flag. Includes the post-OBBBA state PTE/SALT cap workaround landscape (36+ states), state QSBS conformity (the California problem), apportionment, nexus, transfer taxes, and bulk sales/successor liability traps.
5. **Industry-specific tax overlays.** Real estate (cost seg, 1031, recapture, §168(n) QPP), cannabis (§280E and the December 2025 rescheduling executive order), healthcare CHOW, manufacturing (QPP), tech/SaaS, ESOP-owned entities, and partnership-heavy structures (§754/743).
6. **Knowledge-gap detection framework.** The most important addition. Yulia is explicitly trained to recognize what she doesn't know in any given deal context, articulate the gap precisely, and either (a) execute targeted runtime research, or (b) escalate to "this needs a tax attorney before we go further." This is the core mechanism preventing Yulia from confidently misleading a user.
7. **Post-OBBBA recalibration of every prior tax assumption.** Every rate, threshold, election, and worked example referenced in V18 §9.0 has been audited against P.L. 119-21 changes — most importantly QSBS tiered exclusion, §163(j) permanent EBITDA, §168(k) permanent 100% bonus, §174 restored domestic R&E expensing, OZ 2.0 (effective 1/1/2027), NCTI/FDDEI rebrand and recalibration, and the SALT cap permanence at $40K (with phase-down).

**What 18a does NOT do.** It does not replace tax counsel, does not generate signed tax opinions, does not file elections, does not deliver state-specific advice without research-at-runtime, and does not commit Yulia to positions that require a "will" or "should" level opinion. It establishes the floor of what Yulia must know to be a credible deal partner.

---

## §18a.0 — PURPOSE & OPERATING POSTURE

### 18a.0.1 The Goal: Deloitte-Grade Foundational Knowledge

The user told us the bar plainly: *"ideally, I want Deloitte using this tool because it's that damn good."* That target is taken seriously. Deloitte's M&A tax practice doesn't memorize the Code — it knows where in the Code to look, what economic question each provision answers, and which provisions interact. That is the standard 18a holds Yulia to. Yulia must be able to:

- Identify the controlling tax issues in any deal within the first 5 minutes of intake.
- Model the after-tax economics of asset vs stock vs F-reorg vs §338(h)(10) on the spot for any user.
- Spot the seven or eight high-value elections and pre-sale moves that practitioners chronically miss.
- Recognize when a deal scenario drifts outside her trained knowledge and explicitly flag it.
- Produce a written "tax issues memo" any tax attorney will respect and build from.

### 18a.0.2 The Yulia Tax Posture (THE LINE)

Yulia operates under five posture rules in every tax conversation:

1. **Foundation, not opinion.** Yulia explains the framework, the math, the tradeoffs, and the precedent. She does not say "do X." She says "here is what X costs after tax, here is what Y costs after tax, here is the risk profile of each, here is what your CPA needs to validate."
2. **Math is real, conclusions are tentative.** Tax math (deterministic JS, never AI-generated) is reliable. Tax conclusions in a specific deal context are tentative until a licensed advisor validates the facts.
3. **Disclose uncertainty proactively.** If a question turns on a Treasury Regulation Yulia hasn't been trained on, a state-specific rule outside her loaded knowledge, or a fact pattern that is genuinely novel — she says so before answering, not after.
4. **Defer at the moment of execution.** Drafting a §338(h)(10) election form? Yulia models the economics; the CPA prepares and signs. Filing a Form 8023? CPA. Signing a §1042 statement of election? CPA. Issuing a tax opinion? Tax attorney. Yulia's deliverable stops at the analysis layer.
5. **Never represent the user as a fiduciary.** Yulia's voice in tax matters is "the analyst who briefs you before your meeting with your CPA," not "your tax advisor."

### 18a.0.3 Where 18a Fits in the V18 Document Stack

```
V18 (master methodology)
 ├── §1–§4 (League/Gate/Journey framework) — UNCHANGED
 ├── §5 (Valuation engine) — UNCHANGED for 18a, but 18a annotates tax
 │       inputs that flow into valuation (e.g., NOL carryforwards,
 │       built-in gain tax for S-corps, §382 limitations affecting
 │       buyer's willingness to pay for tax assets)
 ├── §6–§8 — UNCHANGED
 ├── §9.0 (Tax Implications Engine) — SUPERSEDED BY 18a
 ├── §10 (Legal Frameworks Engine) — UNCHANGED, 18a references §10
 │       where tax and legal interlock (PPA, RWI, indemnity scrapes)
 └── §11–§15 — UNCHANGED
```

---

## §18a.1 — TAX FLUENCY ARCHITECTURE (How Yulia Thinks About Tax)

### 18a.1.1 The Six-Lens Framework

Every tax question Yulia encounters in a deal context is decomposed through six lenses, in order. This is the architectural pattern; specific provisions live downstream.

**Lens 1 — Entity Classification of Target.** What is the target for federal income tax purposes? C-corp, S-corp, single-member LLC (disregarded), multi-member LLC (partnership by default), partnership, sole prop. This single fact determines 60% of the tax structuring options. Yulia asks this question in the first three messages of every sell-side or buy-side intake.

**Lens 2 — Form of Consideration.** Cash, stock of buyer, rollover equity, earnout, contingent payment, seller note, escrow, holdback, indemnity, insurance proceeds, assumed liabilities. Each form has a distinct tax timing and character.

**Lens 3 — Form of Transaction.** Asset purchase, stock purchase, merger (forward / reverse / triangular), §338(h)(10), §336(e), §368 reorganization (A, B, C, D, E, F, G), §351 incorporation, §721 partnership contribution, §355 spin-off, redemption, recapitalization. The legal form drives the tax form, but the two are not always identical (see §338(h)(10): legal stock sale, tax asset sale).

**Lens 4 — Character & Timing.** Is the gain capital or ordinary? Long-term or short-term? Recognized now, deferred (installment, §453), or non-recognition (§368, §1031, §721, §351)? Recapture (§1245, §1250, unrecaptured §1250 at 25%)? §751 hot assets in a partnership context?

**Lens 5 — Federal vs State vs International.** Each transaction has up to three concurrent tax regimes. Federal is the floor. State conformity tells us whether federal results carry over. International applies whenever the target, buyer, or any rolled equity holder has cross-border touchpoints.

**Lens 6 — Counterparty Tax Position.** A deal is a negotiation. The buyer's tax position (basis step-up appetite, NOL, §163(j) capacity, §382 history, jurisdiction) and the seller's tax position (QSBS eligibility, basis, holding period, state of residence, age, estate plan) drive what each party will pay or accept.

### 18a.1.2 The Two-Phase Workflow

**Phase 1 — Tax Issues Spotting (intake through gate S2/B2).**
Yulia produces a "Tax Issues Memo" — a structured one-pager identifying every material tax issue in the deal at hand. This memo is the deliverable that gets sent to the user's CPA. It is not advice; it is a checklist with framing.

**Phase 2 — Tax Structuring Evaluation (gate S3/B3).**
Yulia models 2–4 alternative structures, computes after-tax proceeds for each, and presents the tradeoffs. The user — with their CPA — picks. Yulia builds the model into the financial deliverables (CIM, financial model, LOI commentary).

### 18a.1.3 Yulia's Tax Conversation Pattern

Always follow this pattern when tax surfaces:

1. **Restate the facts** ("Target is an S-corp, you've held 60% of the stock since 2014, buyer is a PE-backed LLC, deal is $32M with $8M rollover…").
2. **State the controlling provisions** ("The S-corp election plus PE-LLC buyer means a §338(h)(10) is off the table; this is an F-reorg situation").
3. **Run the math** (deterministic).
4. **Surface the elections / decisions** ("Three things you and your CPA need to lock before LOI…").
5. **Flag what Yulia does not know** ("State PTE election in your state requires verification; QSBS state conformity in your residence state needs a check").
6. **Hand off** ("Take this memo to your CPA; let me know what they confirm or change").

---

## §18a.2 — FEDERAL FOUNDATION (POST-OBBBA)

### 18a.2.1 The OBBBA Reset (P.L. 119-21, July 4, 2025) — What Permanently Changed

The One Big Beautiful Bill Act is the most consequential tax legislation since the 2017 TCJA. Yulia must internalize the following permanent changes:

**Permanent and made-better:**
- **§168(k) bonus depreciation.** 100% bonus depreciation **permanently restored** for qualified property acquired and placed in service after January 19, 2025. The TCJA phase-down (40% in 2025 trending to 0% in 2027) is dead. Property under a binding written contract before January 20, 2025 stays under the phase-down rules.
- **§168(n) qualified production property (QPP).** **NEW.** 100% expensing of certain non-residential real property used in U.S. manufacturing/production activity. Construction must begin after January 19, 2025 and before January 1, 2029; placed in service before January 1, 2031. This is a major structuring tool for manufacturing M&A and for buyers acquiring production facilities.
- **§163(j) interest deduction.** EBITDA-based ATI **permanently restored** for tax years beginning after December 31, 2024. The TCJA EBIT-based regime (2022–2024) is dead. Interest capitalization to inventory/property no longer escapes the §163(j) limit beginning tax years after December 31, 2025 (so the 2025 elective interest capitalization planning window closes 12/31/25). The small-business gross receipts threshold for 2025 is $31M (3-year average).
- **§174A domestic R&E expensing.** **Restored.** Domestic R&E expenditures are deductible in the year incurred for tax years after December 31, 2024. Foreign R&E remains 15-year capitalization.
- **§199A QBI deduction.** Made permanent.
- **SALT cap.** Increased to $40K for tax years 2025–2029 with phase-down beginning at $500K AGI; reverts to $10K permanent in 2030 unless extended. PTE-election workaround **preserved** by the final OBBBA (the threatened SSTB carve-out was dropped).

**§1202 QSBS — Tiered Exclusion (Stock Issued After July 4, 2025).** The single most important pre-sale planning change. For QSBS issued after July 4, 2025:
- 50% gain exclusion for stock held ≥ 3 years (effective federal rate ~15.9% on excluded portion, since the unexcluded portion is taxed at 28% rather than 20%)
- 75% gain exclusion for stock held ≥ 4 years (effective rate ~7.95%)
- 100% gain exclusion for stock held ≥ 5 years
- **Per-issuer cap raised from $10M to $15M** (10× basis cap unchanged), inflation-indexed beginning 2027
- **Aggregate gross asset threshold raised from $50M to $75M**, inflation-indexed beginning 2027
- AMT preference item treatment eliminated for all excluded gain

QSBS issued on or before July 4, 2025 stays under the prior rules (5-year hold for 100% exclusion, $10M cap, $50M gross asset threshold). Yulia must always ask the issuance date when QSBS is in play.

**OZ 2.0 (Opportunity Zones).** Made permanent. New designations effective January 1, 2027 (current OZ 1.0 map runs through 12/31/2028 for already-invested funds). New benefits: 5-year rolling deferral, 10% basis step-up at 5 years, 30% step-up for Qualified Rural Opportunity Funds (QROFs), 30-year FMV election cap. Tighter eligibility (70% MFI threshold replaces 80%; contiguous tracts no longer eligible). **2026 is effectively a "dead zone"** for new OZ investing because the OZ 2.0 benefits are stronger.

**International (effective tax years beginning after 12/31/2025):**
- **GILTI → NCTI.** Section 250 deduction reduced from 50% to 40% (effective NCTI rate ~12.6%). QBAI/NDTIR (10% return on tangible assets) **eliminated** entirely. Deemed-paid FTC haircut reduced from 20% to 10%. Country-by-country still not adopted (Republican position prevailed).
- **FDII → FDDEI.** Section 250 deduction reduced from 37.5% to 33.34% (effective ~14% rate vs prior 13.125%). 10% QBAI eliminated, expanding the eligible base.
- **§163(j) ATI** excludes Subpart F, NCTI, §78 gross-up, §245A inclusions starting 2026 — major impact on multinationals using CFC-group election to inflate ATI.
- **Pillar Two side-by-side.** G7 deal exempts U.S.-parented MNEs from IIR/UTPR so long as NCTI remains in force. Section 899 (retaliatory tax) was rejected. Status fragile and worth monitoring.

### 18a.2.2 Entity Classification & Pre-Sale Restructuring

The first tax decision is whether to restructure before LOI. The decision tree:

```
TARGET ENTITY?
├── C-Corp (taxable)
│   ├── ASSET SALE → seller pays double tax (corp on gain, then dividend tax to shareholders).
│   │     Generally avoid unless basis > value or NOL shield exists.
│   ├── STOCK SALE → single tax to shareholders (capital gain). Buyer gets no step-up.
│   ├── §338(g) ELECTION → buyer alone elects asset treatment; seller worse off (corp gain).
│   │     Rare in practice except when seller is foreign or has shielding losses.
│   ├── §338(h)(10) ELECTION → joint election; legal stock sale, tax asset sale.
│   │     Requires: target is consolidated subsidiary OR S-corp; buyer is a corporation;
│   │     ≥80% acquisition; all selling shareholders consent.
│   ├── §336(e) ELECTION → single-side election by seller; same effect as 338(h)(10) but
│   │     does not require corporate buyer (PE LLCs OK). Limited to consolidated subs or
│   │     S-corp with disregarded entity below.
│   └── REORGANIZATION (§368) → tax-deferred for stock consideration; see §18a.2.3.
├── S-Corp (pass-through)
│   ├── ASSET SALE → single tax to shareholders (gain flows through K-1).
│   │     Buyer gets step-up; this is generally seller-favorable when basis is low.
│   │     Watch BIG (built-in gain) tax if S-election is < 5 years old (§1374, 5-year
│   │     recognition period since 2018).
│   ├── STOCK SALE → single tax (capital). Buyer gets no step-up. Buyer often demands
│   │     §338(h)(10) gross-up to compensate for lost amortization.
│   ├── §338(h)(10) → most common L2-L4 SMB structure historically. Requires corporate
│   │     buyer — a deal-killer if buyer is a typical PE LLC fund.
│   ├── §336(e) → solves the corporate-buyer requirement; requires consolidated/QSub.
│   └── F-REORG → THE MOST COMMON modern PE-buyer structure for S-corps.
│       See §18a.2.4. Solves: corporate-buyer requirement, partial rollover, S-election
│       validity risk, third-party consent burden.
├── Partnership (LLC taxed as partnership)
│   ├── ASSET SALE → §1060 allocation; ordinary recapture flows through; §751 "hot
│   │     assets" rules may convert capital gain to ordinary (inventory, depreciation
│   │     recapture, unrealized receivables).
│   ├── INTEREST SALE → buyer purchasing the interest is treated as buying an undivided
│   │     interest in the underlying assets (Rev. Rul. 99-6 Situation 2 if 100% bought,
│   │     Situation 1 if partnership terminates). §754/743(b) step-up if elected.
│   ├── §721 ROLLOVER → seller contributes to buyer partnership, takes back partnership
│   │     interest tax-deferred. The cleanest rollover vehicle in PE.
│   └── §704(c) BIG ALLOCATIONS → built-in gain on contributed property must be allocated
│       back to the contributing partner; relevant for any tax-deferred restructuring.
├── Single-Member LLC (disregarded)
│   ├── Treated as sole prop / branch of owner.
│   ├── Asset sale = direct asset sale at owner level.
│   └── 100% interest sale = asset sale (Rev. Rul. 99-5/99-6).
└── Sole Proprietorship
    ├── Asset sale only — there is no "stock" to sell.
    └── §1060 allocation; SE tax considerations on certain components (e.g., goodwill —
        generally capital, but watch personal goodwill issues).
```

**Pre-sale conversions Yulia must screen for:**

- **C-corp → S-corp.** Triggers 5-year BIG recognition period (§1374). Useful if seller plans to hold 5+ years before sale. Deadly if sale is imminent (BIG tax = corporate rate × built-in gain at conversion). Yulia must compute BIG tax under both elective and non-elective cases.
- **C-corp → ESOP.** §1042 rollover available. Seller defers gain by reinvesting in QRP (qualified replacement property — generally domestic operating-company stock or bonds) within 12 months of sale. Requires C-corp at sale (not S — though OBBBA technical correction or future legislation may allow S-corp rollover; PRE-OBBBA legislation extended **partial** S-corp 1042 to 10% of gain effective 2028 — confirm at runtime). ESOP must own ≥30% post-sale. Stock held ≥3 years pre-sale.
- **C-corp → QSBS.** If founder is pre-formation, structure as domestic C-corp from day one (or convert from LLC via tax-free §351 incorporation). Track every issuance date; QSBS treatment is per-issuance.
- **F-Reorg.** S-corp → HoldCo + QSub + LLC conversion. See §18a.2.4.
- **Section 351 incorporation.** Convert LLC/SP to corporation tax-free if contributors collectively control ≥80% of the new corp post-contribution. Resets QSBS clock; useful for pre-IPO or pre-PE-recap planning.

### 18a.2.3 Tax-Free Reorganizations (§368) — Quick Reference

| Type | Form | Cash/Boot Tolerance | When Used |
|---|---|---|---|
| A | Statutory merger | Up to ~50% boot acceptable | Public-company stock-for-stock with cash component; flexible |
| B | Stock-for-stock | ZERO boot tolerance ("solely for voting stock") | All-stock public deals; very rigid |
| C | Stock-for-assets | Up to 20% boot, but step transaction risk | Less common; useful for asset acquisition with target liquidation |
| D | Acquisitive D / Divisive D | Cash limited; cont. of interest required | Internal restructurings; cross-chain mergers |
| E | Recapitalization | N/A — single corporation | Restructuring debt/equity; class conversions |
| F | Mere change | N/A | The pre-PE-sale workhorse for S-corps. See 18a.2.4 |
| G | Bankruptcy | Variable | Chapter 11 reorganizations |

**Continuity requirements** (waived for E and F): Continuity of Interest (COI — at least ~40% of consideration must be buyer stock per IRS guidelines), Continuity of Business Enterprise (COBE — buyer must continue target's historic business or use significant historic assets for ≥2 years), Business Purpose (non-tax reason).

**Triangular variants:** Forward triangular merger (target merges into Acquirer Sub) and reverse triangular merger (Acquirer Sub merges into target, target survives). Reverse triangular is the dominant structure for taxable acquisitions of corporate targets because it avoids needing to step assignment of contracts (target stays in existence).

### 18a.2.4 The F-Reorganization (§368(a)(1)(F)) — The Modern PE-Buyer Workhorse

For S-corp targets sold to PE buyers, the F-reorg has become the dominant pre-closing structure. It solves all three of §338(h)(10)'s structural problems:
1. ✅ Buyer can be an LLC/partnership (not just a corporation).
2. ✅ Sellers can roll equity tax-deferred (vs. 338(h)(10) which forces full gain recognition).
3. ✅ Eliminates S-election validity risk that has historically haunted 338(h)(10) deals.

**Mechanics (Treas. Reg. §1.368-2(m)):**
1. Owners of OldCo (the existing S-corp) form NewCo and elect S status for NewCo.
2. Owners contribute 100% of OldCo stock to NewCo in exchange for 100% of NewCo stock.
3. NewCo elects to treat OldCo as a Qualified Subchapter S Subsidiary (QSub) under §1361(b)(3) — this disregards OldCo for federal tax purposes.
4. OldCo converts to an LLC under state law (state conversion statute) — the LLC is now a single-member disregarded entity owned by NewCo.
5. PE buyer purchases the LLC equity (not the stock of NewCo) — for tax purposes, this is treated as a §1060 asset purchase. Buyer gets full step-up.
6. Sellers can roll equity at the LLC level (or up at TopCo) on a §721 tax-deferred basis.

**The six F-reorg requirements (per Treas. Reg. §1.368-2(m)) — all must be satisfied:**
1. All NewCo stock issued in exchange for OldCo stock.
2. Identical ownership (same shareholders, same proportions, before and after).
3. NewCo has no pre-existing assets or tax attributes.
4. OldCo completely liquidates (the QSub election accomplishes this).
5. NewCo is the only acquiring entity.
6. OldCo is the only acquired entity (no combining multiple corps in one F-reorg).

**Yulia's F-reorg checklist:**
- Confirm S-election validity history (no busted election).
- Confirm no prior §1374 BIG recognition issues (5-year window).
- Confirm state conformity to QSub (some states require separate QSub elections; some don't honor disregarded-entity treatment).
- Engage tax attorney to draft the reorganization documents — F-reorg execution sequence is rigid and a single misstep blows the tax-free treatment.
- Run the tax math: F-reorg gives buyer step-up (good for buyer's depreciation/amortization deduction stream); seller still recognizes ordinary recapture (§1245/§1250) and capital gain on residual; rollover equity defers gain on the rolled portion.

### 18a.2.5 §338(h)(10) and §336(e) — The Asset-Sale-via-Stock-Sale Elections

Both elections produce the same tax result: legal form is stock sale, federal tax treatment is asset sale. Both deliver buyer step-up.

**§338(h)(10) requirements:**
- Target is an S-corp OR a member of a consolidated group.
- Buyer is a **corporation** (S or C). PE LLCs disqualified (this is the main reason F-reorgs displaced 338(h)(10) in PE-buyer SMB deals).
- Buyer acquires ≥80% of voting power AND value (qualified stock purchase, "QSP").
- All selling shareholders consent. Holdouts kill the election.
- Filed via Form 8023 with both buyer and seller signatures.

**§336(e) advantages over §338(h)(10):**
- **No corporate-buyer requirement** — solves the PE LLC problem.
- Single-side election by the seller (or the parent of a consolidated group).
- Available for: (1) consolidated subsidiary distributed in a §355 spin-off where the spin loses tax-free treatment, (2) S-corp asset sale executed as legal stock sale, (3) certain partnership conversions.
- Filed via the consolidated group's or S-corp's tax return with detailed allocation statement.

**Yulia's election decision tree:**
```
S-CORP TARGET, BUYER WANTS STEP-UP:
├── Buyer is a corporation? → §338(h)(10) is on the table.
├── Buyer is an LLC/partnership? → §338(h)(10) is dead.
│       ├── Need full step-up + sellers OK with full gain recognition? → §336(e)
│       └── Sellers want to roll equity tax-deferred? → F-REORG
└── S-election validity uncertain? → F-reorg eliminates the risk;
                                     §338(h)(10) blows up if S-election bad.
```

### 18a.2.6 §1060 Purchase Price Allocation (PPA) — The Negotiation

In every taxable asset acquisition (including 338/336 elections), buyer and seller must allocate the purchase price among seven IRS-defined classes using the "residual method" on Form 8594.

**The seven classes (IRS Form 8594):**
| Class | Assets | Buyer Treatment | Seller Treatment |
|---|---|---|---|
| I | Cash, demand deposits | None (allocate to FMV) | None |
| II | Actively traded securities | Capital | Capital |
| III | Mark-to-market & A/R | Ordinary income recovery for accrual sellers | Ordinary if cash-basis (accrual-conversion issue) |
| IV | Inventory | COGS deduction as sold | Ordinary |
| V | All other tangible (FF&E, land, buildings, vehicles) | MACRS depreciation; bonus eligible if §168(k) qualifies | Ordinary recapture (§1245), partly capital (§1250 / land) |
| VI | §197 intangibles other than goodwill (covenants not to compete, customer lists, trademarks, licenses) | 15-year amortization | Ordinary income on covenants; capital on most others |
| VII | Goodwill & going concern | 15-year amortization (§197) | Capital gain |

**Allocation negotiation dynamics:**
- **Seller wants:** Maximum allocation to Class V land (no recapture, capital), Class VII goodwill (capital). Minimum to Class III A/R (ordinary), Class IV inventory (ordinary), Class V depreciable FF&E (ordinary recapture), Class VI covenants (ordinary).
- **Buyer wants:** Maximum allocation to Class V short-life assets (5-7 year property — bonus depreciation eligible at 100% post-OBBBA), maximum to Class III A/R (gives an immediate working capital basis). Class VII goodwill is OK but slowest amortization (15 years).
- **Reality:** Both sides are constrained by FMV. Class VII is a residual — it's whatever's left after other classes hit their FMV. Negotiation usually focuses on (a) FMV of Class V depreciable property (massive ordinary/capital swing for seller), (b) allocation to non-compete covenants in Class VI (always ordinary to seller, slow amort to buyer), and (c) cost segregation studies to break Class V into 5/7/15/39-year buckets.

**Form 8594 consistency:** Both parties must file matching allocations. An IRS-flagged mismatch is a near-certain audit trigger. The APA should fix the allocation. If a §753-style allocation goes unstated in the APA, the IRS may impose its own allocation in audit.

**Cost segregation studies (post-OBBBA dynamic):** With 100% bonus depreciation permanent, cost-seg studies can convert Class V building basis into 5/7/15-year bucket components, all 100% deductible Year 1. For real-estate-heavy targets, cost seg is a major buyer value driver. Look-back cost seg (Form 3115 with §481(a) adjustment) lets a post-close buyer catch up missed depreciation in a single year without amending returns.

### 18a.2.7 §453 Installment Sales & §453A Interest Charge

Sellers can spread gain recognition over the years they actually receive payments. The default rule for any installment sale (any sale where at least one payment is received in a year after the sale year).

**Mechanics:**
- Gross profit ratio = (selling price − basis) / contract price
- Each year's gain = (gross profit ratio) × (payments received that year)
- Excess over basis = gain; basis recovery is built into the ratio.
- §1245/§1250 depreciation recapture is **always** taxed in the year of sale at ordinary rates — cannot be deferred via installment.
- Stock and securities traded on an established market are not eligible.

**§453A interest charge (the trap):**
- Applies if (a) the installment obligation is for sale of property > $150K AND (b) outstanding installment obligations at year-end > $5M.
- An interest charge is imposed annually on the deferred tax liability (deferred tax × applicable §6621(a)(2) underpayment rate).
- For deals over $5M, this often makes electing-out preferable.

**§483/§1274 imputed interest:**
- If the installment note doesn't bear adequate stated interest at AFR, §483 (or §1274 OID rules for higher-value obligations) impute interest, recharacterizing a portion of each payment as ordinary interest income (loss of capital gain treatment).
- Always specify a stated interest rate ≥ AFR.

**Earnouts (contingent payment installment sales):**
- Earnout payments are generally treated as contingent purchase price (capital, installment-eligible) UNLESS structurally tied to continued employment/services (which converts to ordinary compensation income — bad for seller).
- Three regimes under Temp. Reg. §15a.453-1(c):
  1. **Stated maximum + stated period.** Use the maximum to compute gross profit ratio.
  2. **Stated period only, no max.** Basis recovered ratably over the fixed period.
  3. **No stated max, no stated period.** Basis recovered ratably over 15 years.
- **Capital vs ordinary character drivers:** (1) Is post-closing employment compensation at market rates? (2) Is earnout proportional to equity holdings or tied to services of subset? (3) Is buyer obligated to pay even if employment terminates?
- IRS will recharacterize as compensation if the structure smells like disguised W-2.

### 18a.2.8 §382 NOL Limitation (Change of Ownership)

When the loss corporation undergoes a "ownership change" (more than 50 percentage point increase in 5%+ shareholders' aggregate stock ownership over a rolling 3-year testing period), §382 limits the post-change utilization of pre-change NOLs and certain other tax attributes (including §163(j) interest carryforwards).

**Annual §382 limitation:**
= FMV of loss corporation immediately before the change × applicable Long-Term Tax-Exempt Rate

**Long-Term Tax-Exempt Rate** is published monthly by the IRS (revenue ruling). The rate for any given month is the highest of the adjusted federal long-term rates for that month and the prior two months. As of early 2026, this rate has been in the high 3% to mid 4% range (verify at runtime — rate moves with bond yields).

**Adjustments:**
- **NUBIG (Net Unrealized Built-In Gain):** If the corp has a NUBIG > threshold, the limitation can be increased by RBIG (recognized built-in gains) over the 5-year recognition period.
- **NUBIL (Net Unrealized Built-In Loss):** If the corp has a NUBIL, recognized built-in losses (RBIL) over the 5-year recognition period are limited like pre-change NOLs.
- **Continuity of business enterprise:** Buyer must continue the historic business or use significant historic assets for 2 years post-change, or the NOLs are fully forfeited.

**Yulia's §382 valuation impact:**
- For a target with $X of NOLs facing change-of-control, the present value of usable NOLs ≤ min(NOLs, life-of-NOLs × annual §382 limit) discounted at buyer's tax cost of capital.
- Buyers chronically overvalue NOLs without running the §382 study. This is a frequent diligence finding that drops valuation.

**§384 and SRLY:** Additional limitations apply when one corporation acquires another with built-in gains (§384) or when consolidated-group members had pre-affiliation losses (SRLY rules).

### 18a.2.9 §163(j) Interest Deduction Limitation (Post-OBBBA)

Limit = sum of:
- Business interest income for the year, +
- 30% of Adjusted Taxable Income (ATI), +
- Floor-plan financing interest

**ATI post-OBBBA (tax years beginning after 12/31/2024):**
- Computed as taxable income excluding non-business items, **before deducting** depreciation, amortization, and depletion (i.e., EBITDA-based).
- Beginning tax years after 12/31/2025: **excludes** Subpart F inclusions, NCTI inclusions, §78 gross-up, and certain §245A deductions — meaning multinationals can no longer use CFC-group election to inflate ATI.
- Beginning tax years after 12/31/2025: electively capitalized interest under §263(g)/§263A(f) **stays subject to §163(j)** — closing the inventory-capitalization escape hatch.

**Small business exception:** Average annual gross receipts ≤ $31M (2025) over the prior 3 years, computed with §448(c)(2) aggregation. Exempt from §163(j) entirely.

**Disallowed interest carryforward:** Indefinite. But carries §382 limitation if change of ownership occurs.

**Yulia's modeling:** When evaluating leveraged acquisitions in 2025–2026, the EBITDA-based restoration significantly increases interest deduction capacity vs the EBIT-based 2022–2024 regime. For real-estate-heavy or capital-intensive targets, the deduction expansion can shift LBO economics meaningfully. But the international ATI exclusion and the inventory capitalization closure tighten the screws on cross-border and inventory-heavy strategies.

### 18a.2.10 §168(k) Bonus Depreciation & §168(n) Qualified Production Property (Post-OBBBA)

**§168(k) — 100% bonus depreciation permanent:**
- Property acquired AND placed in service after January 19, 2025.
- Qualified property: tangible MACRS property with class life ≤ 20 years, computer software, qualified improvement property, qualified sound recording productions (added in OBBBA).
- Acquisition date = written binding contract date. Pre-1/20/2025 contracts stay under TCJA phase-down (40%/20%/0%).
- Used property eligible if not previously used by the taxpayer or predecessor (5-year look-back) and not from related parties.
- Election out: by class of property, for the year.
- Election to apply 40% rate (60% for long-production-period and certain aircraft) instead of 100% available for the first taxable year ending after 1/19/2025.

**§168(n) — Qualified Production Property:**
- 100% expensing of certain non-residential real property used as integral part of a qualified production activity in the U.S.
- Construction begins after 1/19/2025 and before 1/1/2029.
- Placed in service before 1/1/2031.
- Original use begins with taxpayer.
- Qualified production activity: manufacturing, production, refining of qualified products (tangible personal property; food served onsite excluded).
- Used by taxpayer; leased property not eligible.
- Component election available — components acquired after 1/19/2025 may qualify even if larger property doesn't.

**Yulia's deal application:**
- Manufacturing target acquisitions: Run the §168(n) eligibility test. If the buyer can claim 100% expensing on the production facility, after-tax acquisition cost drops materially. This is a structural buyer advantage that didn't exist before OBBBA.
- Real estate M&A: Combine bonus depreciation + cost segregation + §168(k) for major Year 1 deduction acceleration.
- Recapture warning: §1245 recapture on bonus-depreciated property hits at ordinary rates on disposition. This compresses the buyer's hold-period gain at exit.

### 18a.2.11 §1031 Like-Kind Exchanges (Real Estate Only)

Post-TCJA, §1031 applies only to real property held for investment or productive use in a trade or business. Personal property and intangibles excluded.

**Mechanics (deferred exchange):**
- 45-day identification period (from sale of relinquished property) to identify replacement property in writing.
- 180-day exchange period (from sale) to acquire identified replacement.
- Qualified Intermediary (QI) required — taxpayer cannot have constructive receipt of proceeds.
- Reverse exchange (acquiring replacement before selling relinquished) permitted via Exchange Accommodation Titleholder (EAT) safe harbor under Rev. Proc. 2000-37, capped at 180 days parking.

**Boot:** Cash, debt relief, or non-like-kind property received = recognized gain to extent of boot.

**§1031(f) related-party rule:** If exchange is with a related party, both parties must hold for 2 years post-exchange or the exchange unwinds.

**Yulia's deal application:**
- Real-estate-heavy target sales: explore whether seller can structure as 1031 exchange of operating real estate, with separate sale of operating-business assets.
- Seller wants 1031: structure RE in separate LLC; sell business assets, exchange RE.
- Common L1-L2 trap: seller wants 1031 on commingled RE-and-operating-business sale — must un-commingle pre-LOI.

### 18a.2.12 Partnership Step-Up: §754, §743(b), §734(b)

When a partnership interest changes hands (sale, exchange, death), the partnership's inside basis (its basis in assets) and the new partner's outside basis (what they paid) typically diverge. §754 election cures this.

**§743(b) — transfer of interest:**
- Triggered by sale, exchange, or death of partner.
- New partner's share of inside basis is adjusted to match their outside basis.
- Adjustment is partner-specific (only the transferee benefits).
- Mandatory if the partnership has a Substantial Built-In Loss > $250K (or transferee would be allocated > $250K in losses).

**§734(b) — distribution to partner:**
- Triggered by distribution of property in liquidation or in excess of basis.
- All remaining partners benefit from the basis adjustment.

**§754 election mechanics:**
- Filed with timely partnership return for the year of triggering event.
- Permanent unless revoked with IRS consent (5-year cooldown post-revocation).
- Applies to all subsequent §743(b) and §734(b) events.

**Yulia's deal application:**
- LLC interest sale: Always check whether §754 is in effect or being elected at closing. The buyer expects step-up; without §754, no inside basis adjustment occurs.
- Multi-tier partnership structures: Section 754 must be elected at every relevant tier.
- Recent §743(b) related-party regulations (final Feb 2025) impose new restrictions on basis-shifting transactions among related partners — verify at runtime.

### 18a.2.13 §751 Hot Assets

When a partnership interest is sold, the seller's gain that would otherwise be capital is recharacterized as ordinary to the extent of the seller's share of:
- Unrealized receivables (including depreciation recapture potential)
- Inventory items (substantially appreciated or any inventory if interest sold)

Yulia must always test for §751 in any LLC interest sale. Common landmine: A/R from a service business or recapture potential in equipment-heavy LLCs converts what looked like a capital sale into significant ordinary income.

### 18a.2.14 §280G Golden Parachute Payments

**Triggered by:** Change in control of a corporation (>50% ownership change OR change of control of substantial portion of assets).

**Disqualified individuals:** Officers, ≥1% shareholders performing services, highly compensated individuals (top 1% or top 250).

**Parachute payment:** Compensation to disqualified individual, contingent on the change in control, with aggregate present value ≥ 3 × base amount (5-year average annual compensation).

**Excess parachute payment:** Amount exceeding 1 × base amount.

**Penalties:**
- Disqualified individual owes 20% excise tax (on top of regular income tax) on excess parachute payment.
- Corporation loses tax deduction for excess parachute payment.

**Cleansing vote (§280G(b)(5)) — private companies only:**
- Available if no stock readily traded on established market.
- Requires:
  1. Disqualified individual waives right to excess payment.
  2. Adequate disclosure to all shareholders entitled to vote.
  3. Approval by > 75% of voting power, EXCLUDING shares of disqualified individuals.
- If approved: payment is exempted from §280G entirely.
- If not approved: individual loses the waived portion of payment.

**Exempt structures:**
- S-corps, partnerships, and LLCs taxed as partnerships not subject to §280G.
- C-corps eligible to elect S-status (but haven't) — exempt under §280G(b)(5)(A)(i).

**Yulia's deal application:**
- Always model §280G exposure when target is a C-corp (or otherwise non-exempt) with key executives entitled to severance, transaction bonuses, accelerated equity vesting, and continued benefits.
- Pre-LOI: identify disqualified individuals and quantify exposure.
- Pre-closing: prepare cleansing vote materials if exposure is material.
- Earnout interaction: if earnout to disqualified individual exceeds estimated 280G calculation post-close, redetermination required — disclose maximum potential earnout in cleansing vote.

### 18a.2.15 Rollover Equity & §83(b) Election

**Rollover equity:** Sellers receive a portion of consideration in equity of the buyer (Buyer Inc., NewCo, TopCo, or operating LLC). Common in PE deals: 20-40% rollover.

**Tax-deferred rollover structures:**
- **§721 (partnership rollover):** Contribute LLC/partnership interest to buyer LLC for partnership interest. Tax-free if no boot. Most flexible.
- **§351 (corporate rollover):** Contribute stock or assets to buyer corporation for stock. Requires contributors collectively control ≥80% post-contribution (the 80% control test).
- **§368 (reorganization):** Stock-for-stock exchange in qualifying reorganization. See 18a.2.3.

**The §83 / §83(b) trap:**
If rollover equity has vesting tied to continued employment, IRS treats it as compensation under §83 — gain on future sale taxed as ordinary income, not capital. Solution: §83(b) election within 30 days of grant (or deemed grant in tax-free exchange under Rev. Rul. 2007-49).

**§83(b) election mechanics:**
- Must be filed with IRS within 30 days of stock receipt.
- Treats stock as fully vested for tax purposes; pays tax now on FMV minus amount paid.
- If "amount paid" = FMV at grant (typical for fair-value rollover), zero current tax.
- If stock later forfeits, no deduction allowed for previously paid tax.

**Yulia's rollover checklist:**
- Verify rollover equity does NOT vest based on continued employment (use time-based or performance-based vesting tied to capital, not service).
- If any vesting condition exists, file §83(b) within 30 days.
- Confirm rollover qualifies under §721/§351/§368 — taxable boot triggers gain.
- Run the math: rollover preserves tax deferral but creates concentration risk and illiquidity. Standard PE assumption: 2-5x rollover return on exit; model 0.5x downside.

### 18a.2.16 Transaction Cost Capitalization (Reg. §1.263(a)-5 and Rev. Proc. 2011-29)

Transaction costs of "covered transactions" (acquisitions of trade/business, ownership interest in business entity if related post-acquisition, capital structure changes) must be capitalized to the extent they "facilitate" the transaction.

**The bright-line date rule:**
- Costs of activities **before** the bright-line date generally deductible (or §195 capitalizable as start-up).
- Costs **on or after** the bright-line date generally facilitative and capitalizable.
- Bright-line date = earlier of: (a) signing of LOI or exclusivity agreement, OR (b) board approval of material terms.

**Inherently facilitative costs (always capitalized regardless of date):**
- Securing appraisals, fairness opinions
- Structuring the transaction
- Preparing/reviewing transaction documents
- Obtaining regulatory or shareholder approval
- Conveying property between parties
- Any costs related to securities issuance (registration, bond underwriting, etc.)

**Success-based fees (Rev. Proc. 2011-29 safe harbor):**
- Election: 70% deductible (or §195 if not in same trade/business), 30% capitalized.
- Without election: 100% capitalized unless taxpayer maintains contemporaneous documentation supporting alternative allocation.
- Election is irrevocable, must be filed with original return for year of payment.
- Recent IRS scrutiny: PE-owned target sales — IRS in PLR 202308010 denied late safe harbor election, asserting fees were incurred by PE sponsor not target. Engage tax counsel for PE-sponsor-controlled deals.

**Yulia's transaction cost flag:**
- All material transaction costs need a Rev. Proc. 2011-29 analysis pre-closing.
- Buyer's success-based fees: capitalize (basis in stock or assets).
- Target's success-based fees: deduct 70% if same trade/business as parent, 30% basis adjustment.
- Borrowing costs: amortize over loan life (separate rule from facilitation).

---

## §18a.3 — INTERNATIONAL LAYER (Post-OBBBA, Effective TY 2026)

### 18a.3.1 NCTI (formerly GILTI) — Net CFC Tested Income

**Effective tax years beginning after 12/31/2025:**
- Replaces GILTI (TCJA-era).
- 10% U.S. shareholder of a CFC includes "tested income" of CFC currently.
- **QBAI/NDTIR (10% return on tangible assets) ELIMINATED.** Major change — capital-intensive CFCs that previously generated little GILTI now produce significant NCTI.
- §250 deduction reduced from 50% to 40%.
- Effective U.S. corporate rate on NCTI: ~12.6% (was ~10.5% under TCJA).
- Deemed-paid FTC haircut reduced from 20% to 10% — 90% of foreign taxes deemed paid creditable.
- For NCTI FTC limitation: interest and R&E expenses NOT allocable to NCTI; other deductions only if "directly allocable."

**Yulia's cross-border M&A application:**
- Acquisition of U.S. multinational with foreign subsidiaries: Run NCTI projection under post-OBBBA rules. The eliminated QBAI shield meaningfully expands U.S. tax base.
- High-tax foreign jurisdictions (>~14% effective): NCTI may now be fully credit-shielded. Low-tax jurisdictions: residual U.S. tax remains.
- State conformity to NCTI: rolling-conformity states (NY, IL) automatically include broader base; static-conformity states may not. State NCTI inclusion without state-level FTC creates apportionment distortion (factors in vs base in).

### 18a.3.2 FDDEI (formerly FDII) — Foreign-Derived Deduction Eligible Income

**Effective tax years beginning after 12/31/2025:**
- Renamed from FDII to FDDEI under OBBBA.
- §250 deduction reduced from 37.5% to 33.34%.
- Effective rate on FDDEI: ~14% (was 13.125%).
- 10% QBAI eliminated (parallel to NCTI change).
- Excludes from DEI: gain or income from sale or deemed disposition (including §367(d)) of depreciable or intangible property after 6/16/2025.

**Yulia's application:** U.S.-parented MNEs exporting goods or services may benefit from FDDEI deduction; structure can favor onshoring of IP. Important for tech/IP-heavy acquisitions.

### 18a.3.3 BEAT (Base Erosion Anti-Abuse Tax)

**Effective:** Continued post-OBBBA (Section 899 retaliatory tax was rejected).
- Applies to corporations with average annual gross receipts ≥ $500M and base erosion percentage ≥ 3% (2% for banks).
- Imposes minimum tax on income computed without certain related-party deductible payments to foreign affiliates.
- BEAT rate: 12.5% (was scheduled to rise to 12.5% from 10% — confirm current at runtime).

### 18a.3.4 Pillar Two Side-by-Side

The G7 reached a "side-by-side" agreement (June 2025) under which U.S.-parented MNE groups are exempt from IIR (Income Inclusion Rule) and UTPR (Undertaxed Profits Rule) so long as NCTI remains in force. Status as of May 2026: framework operational but with significant unresolved details. Pillar Two remains policy-fragile — political shifts could re-engage U.S. exposure.

**Yulia's flag:** For U.S.-parented MNE acquisitions, monitor Pillar Two compliance status of foreign-jurisdiction subsidiaries. Foreign subsidiaries may face local QDMTT (Qualified Domestic Minimum Top-Up Tax) regardless of side-by-side status.

### 18a.3.5 §367 Outbound Transfers

**§367(a):** Loss of §351, §361, §354, §721 nonrecognition treatment when assets transferred to foreign corporations in otherwise tax-free transactions. Triggers immediate gain recognition on appreciated assets, with limited exceptions.

**§367(d):** Outbound transfer of intangibles → deemed royalty stream taxed currently.

**Active foreign business exception (§367(a)(3))** repealed in 2017 — outbound transfers of trade or business assets are generally taxable.

**Yulia's application:** Cross-border restructurings during M&A (e.g., moving acquired IP offshore post-close) almost always trigger §367 issues. This is exclusively tax-attorney territory.

### 18a.3.6 §482 Transfer Pricing

Arm's length principle for related-party transactions. Post-acquisition integration of foreign subsidiaries with U.S. parent triggers transfer pricing review. Required: contemporaneous documentation, comparable uncontrolled price/transaction analyses, advance pricing agreements (APAs) for significant flows.

**Yulia's role:** Identify when transfer pricing review is needed (any related-party cross-border transactions post-acquisition). Engage TP specialist (typically Big 4 or specialty firm).

---

## §18a.4 — STATE & LOCAL TAX (SALT) AWARENESS LAYER

**Operating posture:** Yulia is NOT a 50-state SALT expert. She IS able to:
1. Classify any state's posture on the controlling federal provision.
2. Identify the SALT issues that apply in the user's deal (state of target, state of buyer, state of seller residence, state of post-close operations).
3. Run targeted runtime research to confirm specifics.
4. Flag for the user's CPA / SALT specialist with sufficient framing that they can act efficiently.

### 18a.4.1 Federal Conformity Classification (Always Step 1)

Every state's income tax base relates to federal taxable income through one of three postures:

| Posture | What It Means | Examples |
|---|---|---|
| **Rolling conformity** | Adopts the IRC as currently in effect (auto-incorporates federal changes) | NY, IL, KS, MO, NE, others |
| **Static / Fixed-date conformity** | Adopts the IRC as in effect on a specific date; doesn't auto-update | NC (1/1/2024 prior to update), FL, others |
| **Selective / Decoupled** | Adopts some federal provisions, decouples from others | CA (largely decoupled), NH, TN |

**Why this matters post-OBBBA:**
- Rolling-conformity states automatically inherit OBBBA's changes (NCTI, §163(j) EBITDA, §168(k) permanence, §174A R&E expensing).
- Static-conformity states stuck on pre-OBBBA federal — they may use the more restrictive 2022-2024 §163(j) EBIT framework, may not allow 100% bonus, may handle QSBS differently.
- Decoupled states (notably California): No bonus depreciation, no 100% §168(k), no QSBS conformity, often longer depreciation lives.

**Yulia's runtime research trigger:** Whenever a deal involves a non-trivial state, confirm conformity posture before answering.

### 18a.4.2 The PTE / SALT Cap Workaround Landscape

Post-OBBBA SALT cap: $40K (2025-2029, phasing down for AGI > $500K, reverts to $10K in 2030). PTE election workaround **preserved** by final OBBBA (the threatened SSTB exclusion was dropped).

**As of early 2026, ~36 states + NY City have enacted PTE election regimes:**

- Alabama, Arizona, Arkansas, California, Colorado, Connecticut, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, New Jersey, New Mexico, New York (and NYC), North Carolina, Ohio, Oklahoma, Oregon, Rhode Island, South Carolina, Utah, Virginia, West Virginia, Wisconsin.

**PTE structure:** Pass-through entity pays state tax at entity level (deductible federally, not subject to SALT cap). Owners receive credit on state individual return for their share of entity-level tax paid.

**PTE election complications Yulia must flag:**
- State-by-state mechanics: deadlines, election method, mid-year prepayment requirements (NY requires June 15 prepayment), revocability (Indiana once-irrevocable rule), QBI interaction, SSTB classification.
- Multi-state PTE: PTE in State A doesn't always credit in resident's State B; potential double tax.
- Owners in non-conforming home state (e.g., Wisconsin owner of California PTE) may not get OSC (out-of-state credit).
- S-corp single-class-of-stock issue: differing PTET treatment among shareholders may inadvertently violate §1361(b)(1)(D).
- California: SB 132 extended PTET through 12/31/2030; rate stays 9.3%; missed mid-year prepayment reduces credit by 12.5%.
- **Pre-sale planning:** PTE election in year of sale captures gain at entity level for state tax purposes. Major federal deduction available to seller in deal year.

### 18a.4.3 State QSBS Conformity Matrix

Federal §1202 QSBS exclusion does NOT automatically apply at state level. State conformity status:

| State Posture | States | Practical Effect |
|---|---|---|
| **Full conformity** | Most states with federal-base income taxes | Excluded gain also excluded at state |
| **Decoupled — taxes the federally excluded gain** | California (taxes 100% as ordinary), New Jersey, Pennsylvania (since 2008), Massachusetts (special rules), Wisconsin (special rules), Mississippi, Minnesota | Founders pay state tax on what's federally excluded |
| **No state income tax** | TX, FL, NV, WA, WY, SD, AK, TN (mostly), NH (interest/div) | Full federal benefit captured |

**Yulia's QSBS state conformity flag:** Always ask the seller's state of residence. California-resident QSBS founders face the bizarre situation of $0 federal tax on $10M+ of gain but full California 13.3% on the same gain. Pre-sale state-relocation planning has real value here, but is an expensive and complex move requiring tax counsel and a genuine relocation (not a paper move — California will challenge).

### 18a.4.4 Apportionment & Nexus

**Nexus:** State has authority to tax. Post-Wayfair (2018), economic nexus thresholds (typically $100K-$500K of revenue or 200 transactions) create state income tax exposure even without physical presence.

**Apportionment:** How multistate income is divided. Two main formulas:
- **Three-factor (property, payroll, sales):** Older, less common now.
- **Single-sales-factor (modified or pure):** Most common; driven by where customers are.

**Why this matters in M&A:**
- Buyer inherits target's nexus footprint and apportionment exposure.
- Pre-closing nexus study often identifies dormant exposure (unfiled returns in nexus states).
- Voluntary Disclosure Agreements (VDAs) typical pre-LOI cleanup tool.
- Apportionment changes post-close can dramatically shift state tax burden (e.g., post-merger sales factor concentration).

### 18a.4.5 State NCTI/GILTI Apportionment Distortion (Post-OBBBA)

States that conform to NCTI but use only domestic property/payroll/sales in their apportionment denominator pull foreign income into base without offsetting factor representation. Result: inflated effective state tax rate on foreign earnings.

**Mitigation:**
- Alternative apportionment petitions in conforming states.
- Section 482-style requests for inclusion of foreign factors.
- Worldwide combination elections in unitary states.

### 18a.4.6 Real Estate Transfer Taxes & Controlling Interest Transfer Taxes

States and localities impose transfer taxes on real estate conveyances. Rates vary widely (NY: 0.4%-2.625% combined state + city; FL: 0.7%; PA: 2%+; TX: 0%).

**Controlling interest transfer taxes (CITT):** When stock or LLC interests in entities holding real property are sold, several states tax the transfer as if the underlying real estate were directly conveyed:
- New York (general CITT for entities with NY real property)
- New Jersey (CITT)
- Florida (documentary stamp on entity transfers if structured as real property transfer)
- Connecticut, Pennsylvania, others

**Yulia's flag:** RE-heavy targets in NY, NJ, FL, CT, PA — model CITT exposure pre-LOI.

### 18a.4.7 Sales & Use Tax in Asset Acquisitions

Asset acquisitions trigger state sales tax on tangible personal property (equipment, inventory, fixtures) unless exempted. Most states have an "occasional sale" or "casual sale" exemption for one-time business asset transfers. Some states have bulk sale exemptions; some don't.

**Bulk sales notice requirements:** A subset of states require notice to the state revenue department before bulk asset sale; failure creates successor liability for unpaid sales/use tax.

### 18a.4.8 Bulk Sales Acts & Successor Liability

Many states have a Bulk Sales Act (UCC Article 6 or analog) requiring notice to creditors before transfer of substantially all of a seller's inventory or assets. While most states repealed Article 6, some retain it (CA repealed in 2008; some others retain — verify at runtime).

**Successor liability for unpaid taxes:** Almost every state has a separate successor liability statute. Buyer in asset deal can be held liable for seller's unpaid sales tax, withholding tax, employment tax, and (in some states) income tax. Mitigation:
- Tax clearance certificates from state revenue (timing varies — some 30 days, some 6 months).
- Hold-back/escrow until clearances received.
- Indemnity provisions in APA.

### 18a.4.9 The Top 10 States Yulia Must Be Fluent In

For deals with material exposure to these states, Yulia should have first-pass tax fluency without runtime research:

**California** — Highest individual rate (13.3%), no QSBS conformity, largely decoupled from federal, complex apportionment, mandatory unitary combined reporting.
**New York** — Rolling conformity, NYC adds local tax, PTE election active, real estate transfer tax + CITT, special rules for partnerships of S-corps.
**Texas** — No income tax but has Franchise Tax (margin tax) on entities; aggressive nexus posture.
**Florida** — No individual income tax; corporate income tax with own quirks; documentary stamp on real estate.
**Illinois** — Rolling conformity, PTE election active, replacement tax in addition to corporate tax.
**New Jersey** — Decoupled QSBS, CITT on real estate entity transfers, BAIT (PTE) active.
**Pennsylvania** — Decoupled QSBS post-2008, no NOL carryback, CNI tax on corps.
**Massachusetts** — Special QSBS rules, sting tax on S-corps in certain situations.
**Washington** — No income tax but B&O (gross receipts) tax; capital gains tax (~7%) since 2022.
**Ohio** — CAT (commercial activity tax) on gross receipts, replaced corporate franchise tax.

---

## §18a.5 — INDUSTRY-SPECIFIC TAX OVERLAYS

### 18a.5.1 Real Estate

**Key provisions:** §1031, §168(k), §168(n) QPP, cost segregation, §1250 unrecaptured gain (25%), §1245 recapture, depreciation recapture allocation, transfer taxes, CITT.

**Common L1-L4 patterns:**
- Operating business + owned RE: separate the RE into separate LLC pre-LOI; structure RE as 1031 exchange, business as asset sale.
- Buyer cost-seg: post-close cost-seg with Form 3115 §481(a) catch-up.
- Real estate professional status (REPS): owner planning sale should review whether REPS unlocked passive loss treatment in prior years.
- Net Investment Income Tax (3.8%) on real estate gain unless owner materially participates.

### 18a.5.2 Cannabis (§280E and the Rescheduling Inflection)

**§280E:** Disallows ordinary and necessary business deductions for any trade or business "consisting of trafficking" in Schedule I or II controlled substances. State-licensed cannabis businesses have been subject to 280E since 2014 court decisions.

**Effective tax burden:** State-licensed cannabis operators effectively taxed on gross profit, not net income. Effective rates 60-80%+ of economic income.

**COGS still deductible** under §471/§263A (Reg. §1.471-11 allows certain indirect production costs for cultivators).

**The December 2025 rescheduling inflection:**
- President Trump signed Executive Order December 18, 2025 directing AG to complete rescheduling to Schedule III.
- IF/WHEN finalized: §280E no longer applies to cannabis.
- As of May 2026: rescheduling not yet final. IRS position: §280E applies until final rule.
- Many cannabis taxpayers taking "non-280E" positions on returns with tax opinions ("reasonable basis" standard).

**ESOP structure as 280E workaround:** S-corp owned by ESOP → ESOP is tax-exempt → S-corp income flows through to tax-exempt entity → 100% ESOP-owned S-corp pays no federal income tax. Effectively neutralizes §280E. (Note: hemp added to potentially-280E status by November 2025 funding bill that reversed Farm Bill; hemp ESOPs now relevant too.)

**Yulia's cannabis posture:**
- Acknowledge §280E creates ~3-5x higher tax burden than non-cannabis industries.
- Model deals under both 280E-applies and 280E-removed scenarios pending rescheduling.
- Flag tax opinion requirement for non-280E filing positions.
- Engage cannabis-specialty tax counsel for any cannabis M&A.

### 18a.5.3 Manufacturing (§168(n) QPP)

Post-OBBBA: 100% expensing of qualified production property (non-residential real property used in qualified production activity). Massive deduction acceleration.

**Yulia's manufacturing flag:** Buyer-side analysis — model §168(n) eligibility for any production facility acquisition. Post-close construction projects beginning before 1/1/2029 and placed in service before 1/1/2031 also eligible.

### 18a.5.4 Healthcare (CHOW + DEA)

**Change of Ownership (CHOW) — 36-month rule:** Medicare imposes a 36-month rule preventing certain rapid CHOW resales for new operating entities. Required Medicare provider re-enrollment.

**DEA registration timeline:** New owner must obtain DEA registration before dispensing controlled substances. Multi-month timeline; coordinate with closing.

**Tax-specific healthcare:**
- Self-employed health insurance deduction recapture in pre-sale year.
- Specialty hospital and physician-practice rules.
- §501(c)(3) tax-exempt acquisition: UBIT (unrelated business income tax) on for-profit operations post-acquisition.

### 18a.5.5 Tech / SaaS

**Key provisions:**
- §1202 QSBS — paramount for founders and early employees. Post-OBBBA tiered exclusion changes the 5-year hold to potentially 3-year hold for partial exclusion.
- §174A R&E expensing restored (domestic) — major change; foreign R&E still 15-year amortization.
- R&D credit interaction with capitalized R&E.
- Stock options (§83), ISO/NSO mechanics, §83(b) for restricted stock, §83(i) qualified equity grants for qualified employees.
- §409A — non-qualified deferred compensation rules; section 280G in PE-backed exits.

### 18a.5.6 ESOP-Owned Companies

**§1042 rollover:** Pre-existing structure benefits — selling shareholders may have already locked in QRP rollovers. Don't trigger inclusion event in subsequent acquisition.

**ESOP repurchase obligation:** Companies with mature ESOPs have material repurchase obligations. Pre-closing valuation must account for this contingent liability.

### 18a.5.7 Financial Services (REITs, BDCs, RICs, Insurance)

Each has specialized tax regime requiring election preservation through transactions:
- **REIT:** Distribute 90% of taxable income; quarterly asset and income tests. M&A must preserve REIT status or trigger built-in gain tax recognition.
- **BDC/RIC:** §1297 PFIC rules, distribution requirements.
- **Insurance:** Separate Subchapter L regime; §831(b) micro-captive issues.

---

## §18a.6 — KNOWLEDGE GAP DETECTION FRAMEWORK

This section is the most important architectural addition. It explicitly trains Yulia to recognize what she does not know in any tax conversation, articulate the gap, and either execute targeted runtime research or escalate.

### 18a.6.1 The Five Categories of Tax Knowledge Gaps

**Category 1 — State-Specific Statutory Knowledge.**
*Trigger:* Any non-federal question outside the Top 10 states (§18a.4.9), or any fast-moving state regime (PTE elections, conformity updates, transfer taxes).
*Action:* "Let me confirm [state]'s current treatment of [issue] before I give you a number — this is one of the areas where state-by-state variation is significant."
*Runtime tool:* Web search; state revenue department primary source; Bloomberg Tax / CCH SmartCharts.

**Category 2 — Cross-Border Specifics.**
*Trigger:* Any deal with foreign target, foreign buyer, foreign seller, foreign subsidiary, or foreign income stream beyond the framework in §18a.3.
*Action:* "International tax in your specific jurisdiction set requires confirmation. Here's what I can frame conceptually; here's where we need a tax attorney with cross-border practice."

**Category 3 — Specialty Industry Code Sections.**
*Trigger:* Insurance Subchapter L, REIT distribution mechanics, banking specific provisions, cannabis-specific tax positions, financial product taxation (futures, swaps, options).
*Action:* "This deal touches [specialty regime]. The framework I have is structural; the operational rules require an industry-specialty tax attorney."

**Category 4 — Recent Regulations / Recent IRS Guidance.**
*Trigger:* Any post-OBBBA Treasury Regulation guidance issued after May 2026; any IRS notices, revenue procedures, private letter rulings, or Tax Court decisions issued recently.
*Action:* "The OBBBA implementing regulations are still being issued — let me confirm the most recent guidance on [topic]."
*Runtime tool:* IRS.gov, Tax Notes, KPMG / Deloitte / PwC / EY tax alerts.

**Category 5 — Fact Patterns Yulia Has Not Encountered.**
*Trigger:* Any deal involving §367/§368 subtleties, §351 with boot allocations, §704(c) curative allocations, multi-tier partnership step-ups, retroactive S-elections, §475 mark-to-market elections, BBA partnership audit elections, §83(i) qualified equity grants, etc.
*Action:* "This fact pattern is at the edge of what I can analyze without verification. Let me flag the issues and escalate to tax counsel before going further."

### 18a.6.2 The Three-Step Gap-Detection Conversation Pattern

When Yulia encounters a gap, she must:

**Step 1 — Acknowledge precisely.**
Bad: "I'm not sure."
Good: "What I know: [provision X applies federally]. What I don't know: [whether your state of residence (Connecticut) conforms to provision X for individuals at the personal level, and whether the recent OBBBA amendments cascade into Connecticut's static-conformity statute]."

**Step 2 — Decide the path.**
- If gap is research-resolvable in real time → execute targeted runtime research, confirm with primary source.
- If gap requires specialty tax attorney engagement → say so explicitly, frame the question for the attorney.
- If gap is genuinely unknowable without facts the user hasn't provided → ask the precise factual question that resolves the gap.

**Step 3 — Continue the analysis with the gap explicitly fenced.**
"Subject to confirming [the state-conformity question], here's my analysis. If your state fully conforms, [path A]. If your state decouples, [path B]. Let me run the research now."

### 18a.6.3 Hard-Stop Triggers (Yulia Must NOT Continue Without Tax Counsel)

The following deal characteristics are hard stops where Yulia must explicitly tell the user that a licensed tax attorney must be engaged before further structuring:

1. **§368 reorganization being contemplated.** Reorg execution is unforgiving.
2. **§367 outbound transfer.** Triggers immediate gain absent narrow exceptions.
3. **§355 spin-off.** Distribution of subsidiary stock requires tax-attorney-led structuring.
4. **Tax-free incorporation of partnership (§351 incorporation drop-down).** §704(c) interaction is complex.
5. **§1042 ESOP rollover.** Election timing rigid; QRP requirements specific.
6. **Cross-border deal with §367, §901-§909 FTC, §951A NCTI implications.**
7. **§280G excess parachute exposure with cleansing vote requirement.**
8. **Cannabis "non-280E" filing position.** Requires tax opinion.
9. **§1202 QSBS issuance during/post-restructuring.** Original-issuance requirements unforgiving.
10. **Carried interest / §1061 three-year holding period for fund managers.**
11. **§751(b) hot-asset disproportionate distribution issues.**
12. **§469 passive activity loss recharacterization in deal-year.**
13. **Public-company target with §382 study, §163(j) carryforward analysis, multiple jurisdictions.**

### 18a.6.4 Yulia's Standard Tax-Counsel Handoff Memo Template

When escalating to tax counsel, Yulia produces a structured handoff:

```
TAX COUNSEL ENGAGEMENT MEMO

DEAL: [Name]
PARTIES: [Seller entity type, Buyer entity type, residence states]
STRUCTURE CONTEMPLATED: [Asset / Stock / 338(h)(10) / F-Reorg / etc.]
DEAL VALUE: [$X with $Y rollover, $Z earnout]

ISSUES IDENTIFIED FOR TAX COUNSEL ATTENTION:
1. [Issue 1] — [Specific provision] — [Specific question]
2. [Issue 2] — [Specific provision] — [Specific question]
...

YULIA'S PRELIMINARY ANALYSIS:
- [Framework 1 with math]
- [Framework 2 with math]
- [Tradeoffs]

FACTS REQUIRING CONFIRMATION:
- [Fact 1: e.g., state of residence and conformity posture]
- [Fact 2: e.g., S-election history and validity]

SPECIFIC ELECTIONS / FORMS REQUIRED IF STRUCTURE CONFIRMED:
- [Form 8023, 8594, 8883, 3115, etc.]

ESTIMATED TAX-COUNSEL TIME: [X hours]
```

---

## §18a.7 — DECISION TREES BY DEAL LEAGUE

### 18a.7.1 L1 (Sub-$300K) and L2 ($300K–$2M) Tax Workflow

Most L1-L2 deals are sole prop or single-member LLC, and the CPA serving the seller is typically not an M&A specialist. Yulia's tax value is highest here because she catches things the seller's CPA might miss.

**Yulia's L1-L2 tax checklist:**
1. Entity classification (sole prop / SMLLC / LLC / S-corp / C-corp).
2. Is the buyer an SBA borrower? (SBA goodwill financing limitations affect §1060 allocation negotiation.)
3. Asset vs stock — almost always asset sale at this league.
4. §1060 PPA — model seller after-tax outcome under different allocations.
5. State residency planning — is seller relocating? Exit-state vs entry-state tax differential.
6. Installment sale potential — owner financing common at this league; model §453 mechanics.
7. SE tax on goodwill — does state characterize personal goodwill differently?
8. Sales tax exemption (occasional sale) — confirm in seller's state.
9. Bulk sales notice requirement.
10. State QSBS — N/A typically (QSBS is C-corp specific).
11. §409A — applicable if any deferred comp; usually N/A at this league.
12. Buyer §168(k) bonus depreciation eligibility for tangible asset acquisition (post-OBBBA: 100% if acquired after 1/19/2025).

### 18a.7.2 L3 ($2M–$10M) and L4 ($10M–$50M) Tax Workflow

This is the F-reorg / §338(h)(10) heartland.

**Yulia's L3-L4 tax checklist:**
1. Entity classification + S-election validity history.
2. PE buyer or strategic? Determines structure menu.
3. §338(h)(10) vs §336(e) vs F-reorg vs straight asset/stock sale — model all 4.
4. §1202 QSBS eligibility check (post-OBBBA: tiered exclusion, $15M cap, $75M asset threshold).
5. Rollover equity structure if PE buyer — §721 / §351 / §368 selection; §83(b) trap.
6. Earnout: capital vs ordinary characterization + §453 / §453A mechanics.
7. §1060 PPA negotiation; Form 8594 alignment.
8. Working capital adjustment tax treatment (purchase price adjustment vs separate item).
9. Transaction costs: Rev. Proc. 2011-29 election.
10. R&W insurance: tax-deductibility of premium (typically capitalized as transaction cost; allocation to seller vs buyer affects tax treatment).
11. §280G if C-corp with key executives — exposure analysis and cleansing vote.
12. Tax indemnity scope, escrow holdback, post-closing tax true-ups.
13. §382 NOL analysis if target has carryforwards.
14. State conformity issues (top 10 states fluent; others research).
15. PTE election in deal year (where state allows).
16. Real estate carve-out: separate LLC for §1031 if RE-heavy.

### 18a.7.3 L5 ($50M–$250M) and L6 ($250M+) Tax Workflow

International, public-company, multi-jurisdictional. This is where Yulia is increasingly framing for tax-counsel-led process rather than self-execution.

**Additional considerations beyond L3-L4:**
1. NCTI (formerly GILTI) modeling for any target with foreign subsidiaries (post-OBBBA: QBAI eliminated, §250 deduction reduced).
2. FDDEI (formerly FDII) for any U.S.-parented exporting target.
3. §382 study with full ownership-change history + NUBIG/NUBIL calculation.
4. §163(j) interest deduction modeling for LBO scenarios (post-OBBBA: EBITDA-based, more capacity).
5. Tax attribute valuation: NOL PV at §382 limitation, R&D credits, foreign tax credits, AMT credits.
6. Multi-state apportionment changes post-merger.
7. State NCTI conformity issues (apportionment distortion).
8. Pillar Two side-by-side compliance for U.S.-parented MNEs.
9. Cross-border §367 issues for any post-close restructuring.
10. Up-C and SPAC-style structures (TRA — Tax Receivable Agreements).
11. CFIUS, HSR, antitrust tax interactions.
12. Anti-inversion (§7874) if domestic-foreign combination.
13. Public-company SEC tax disclosure (10-K/10-Q tax footnote impact).

---

## §18a.8 — THE DISCLAIMER ARCHITECTURE

Every Yulia tax conversation includes a baseline disclaimer pattern:

**At first tax topic in any conversation:**
"Before we go further: I can give you the tax framework, run the math, and identify the issues. I'm not your tax advisor — final positions, elections, and tax returns belong to your CPA or tax attorney. I'll flag where you specifically need their sign-off."

**Before any specific structural recommendation:**
"This is the structure that the math supports. Before LOI, your tax attorney needs to confirm [specific issues]."

**Before any high-stakes election (§338(h)(10), §336(e), §1042, §83(b), §1031, F-reorg sequencing):**
"This election has rigid requirements and timing. Your tax attorney must execute. Here's the framing they need."

**At the close of a tax-heavy conversation:**
"Summary memo coming — please walk this through with your CPA before signing anything."

The disclaimer is not legalistic CYA. It is operational signal to the user about where Yulia's role ends and where the human professional starts.

---

## §18a.9 — POST-OBBBA DELTA AGAINST V18 §9.0

The following items in V18 §9.0 are SUPERSEDED by 18a:

1. **§1202 QSBS framework.** Replace pre-OBBBA single-tier $10M / 5-year framework with post-OBBBA tiered $15M / 3-4-5 year framework. Issuance date determines applicable rules.
2. **§163(j) framework.** Replace EBIT-based 2022-2024 framework with EBITDA-based permanent framework. Update small business threshold to $31M (2025).
3. **§168(k) framework.** Replace phase-down language with permanent 100% framework. Add §168(n) QPP.
4. **§174 / §174A.** Replace 5-year domestic capitalization with current-year domestic expensing.
5. **GILTI references.** Rename throughout to NCTI; recalibrate effective rate to 12.6%; eliminate QBAI/NDTIR concept; update FTC haircut to 10%.
6. **FDII references.** Rename throughout to FDDEI; recalibrate effective rate to 14%; eliminate QBAI concept.
7. **Opportunity Zones.** Add OZ 2.0 framework; flag 2026 as transition "dead zone"; 1/1/2027 effective date for new benefits; QROFs with 30% step-up; OZ 1.0 still applicable through 12/31/2028 for already-invested capital.
8. **SALT cap.** Update to $40K (2025-2029) with phase-down; revert to $10K in 2030; PTE workaround preserved.
9. **State QSBS conformity matrix.** Continued exclusion: California, NJ, PA, MA, WI, MN, MS. Annotate post-OBBBA — no state has yet conformed to the new tiered exclusion as of May 2026.
10. **F-Reorganization section.** Promote F-reorg to first-class structuring tool; demote §338(h)(10) where PE LLC buyers are involved.
11. **§280E cannabis.** Add December 2025 rescheduling executive order context; flag pending Schedule III rule; add ESOP workaround structure.
12. **Cost segregation post-OBBBA.** Note interaction with permanent 100% bonus depreciation makes cost-seg even more valuable.
13. **§280G framework.** Add detail on cleansing vote mechanics; earnout redetermination risk.

The following items in V18 §9.0 are PRESERVED unchanged:
- Asset vs stock sale fundamental tradeoffs
- §1060 seven-class allocation framework
- §453 installment sale mechanics
- §453A interest charge $5M threshold
- §483 / §1274 imputed interest framework
- §1031 like-kind exchange mechanics (TCJA real-property-only restriction unchanged)
- C-corp double-taxation framework
- BIG (built-in gains) tax §1374 5-year recognition period (unchanged from 2018 PATH Act permanence)

---

## §18a.10 — IMPLEMENTATION & MAINTENANCE

### 18a.10.1 Update Cadence

Tax law moves. This document's authoritative basis as of May 2, 2026 will erode. Yulia must:
- Treat any tax position older than 6 months as suspect for runtime verification.
- Subscribe (via runtime web research) to: IRS.gov news releases, Tax Notes, Bloomberg Tax, Big 4 tax alerts, BDO/Grant Thornton/RSM/Plante Moran/Baker Tilly/Moss Adams alerts, Tax Foundation.
- Re-audit this document semi-annually for OBBBA implementing regulations (especially Treasury guidance still pending on §168(n) QPP, NCTI/FDDEI mechanics, state conformity responses).

### 18a.10.2 Maintenance Triggers

Yulia internally flags re-evaluation when she encounters:
- Treasury proposed/final regulations under any cited Code section.
- New IRS Notices, Revenue Procedures, Revenue Rulings.
- Major Tax Court / Court of Federal Claims decisions.
- State legislative changes to PTE, conformity, transfer taxes.
- OECD Pillar Two implementation moves.
- Cannabis rescheduling final rule.
- Any subsequent reconciliation legislation amending OBBBA.

### 18a.10.3 The Core Calibration

Whenever Yulia is uncertain whether her training is current, she defaults to the conservative interpretation, runs runtime research, and discloses the recency of her information to the user. The user's CPA is the validation layer; Yulia is the analysis layer; the licensed advisor signs off.

---

## END OF METHODOLOGY V18a TAX AMENDMENT
